import { NextRequest, NextResponse } from 'next/server';
import { extractCandidateFacts } from '@/lib/ai';
import {
  createMemory,
  listMemories,
  MEMORY_TYPES,
  type MemoryInput,
  SENSITIVITY_LEVELS,
  SOURCE_TYPES,
} from '@/lib/repo';
import type { ImportanceLevel, Memory, MemoryType, SensitivityLevel, SourceType } from '@/lib/types';

const MAX_FILE_BYTES = 6 * 1024 * 1024;
const CHUNK_CHARS = 9000;
const MAX_CHUNKS = 3;
const TEXT_EXTENSIONS = new Set(['txt', 'md', 'markdown', 'json', 'csv', 'log', 'vtt', 'srt']);

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    // Chat exports and JSON dumps carry control characters that only waste prompt space.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function intIn(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : fallback;
}

/** Turns one untrusted model object into a payload the repository will accept. */
function toDraft(fact: unknown, label: string): MemoryInput | null {
  if (typeof fact !== 'object' || fact === null) return null;
  const record = fact as Record<string, unknown>;

  const statement = typeof record.statement === 'string'
    ? record.statement.replace(/\s+/g, ' ').trim().slice(0, 400)
    : '';
  // Anything shorter than this is a greeting, a name, or the model echoing a fragment.
  if (statement.length < 20) return null;

  const type = MEMORY_TYPES.includes(record.type as MemoryType)
    ? (record.type as MemoryType)
    : 'temporary_context';
  const sensitivityLevel = SENSITIVITY_LEVELS.includes(record.sensitivity as SensitivityLevel)
    ? (record.sensitivity as SensitivityLevel)
    : 'personal';
  const why = typeof record.whySaved === 'string' ? record.whySaved.replace(/\s+/g, ' ').trim().slice(0, 160) : '';
  const tags = Array.isArray(record.tags)
    ? record.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0).slice(0, 6)
    : [];

  return {
    statement,
    type,
    sensitivityLevel,
    importanceScore: intIn(record.importance, 1, 5, 3) as ImportanceLevel,
    // Nobody has approved these yet, so they must not arrive pre-loaded with the model's self-reported certainty.
    confidenceScore: Math.min(70, intIn(record.confidence, 0, 100, 55)),
    whySaved: why ? `Read from "${label}" — ${why}` : `Read from "${label}"`,
    tags: [...new Set(['imported', ...tags.map((tag) => tag.toLowerCase())])],
  };
}

interface Source {
  text: string;
  label: string;
  sourceType: SourceType;
  pages: number | null;
}

function pickType(chosen: FormDataEntryValue | null, fallback: SourceType): SourceType {
  return typeof chosen === 'string' && SOURCE_TYPES.includes(chosen as SourceType)
    ? (chosen as SourceType)
    : fallback;
}

/** Reads pasted text or an uploaded file into one plain-text block. Nothing is written to disk. */
async function readSource(form: FormData): Promise<Source | { error: string; status: number }> {
  const upload = form.get('file');
  const textField = form.get('text');
  const pasted = typeof textField === 'string' ? textField : '';
  const chosen = form.get('sourceType');

  if (!(upload instanceof File) || upload.size === 0) {
    if (!pasted.trim()) return { error: 'Nothing to read. Paste text or choose a file.', status: 400 };
    return {
      text: pasted,
      label: 'Pasted text',
      sourceType: pickType(chosen, 'conversation'),
      pages: null,
    };
  }

  if (upload.size > MAX_FILE_BYTES) {
    return { error: `That file is over ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB.`, status: 413 };
  }

  const bytes = new Uint8Array(await upload.arrayBuffer());
  const name = upload.name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ').trim().slice(0, 120) || 'uploaded file';
  const extension = (name.split('.').pop() ?? '').toLowerCase();
  const isPdf = extension === 'pdf' || String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';

  let text: string;
  let pages: number | null = null;

  if (isPdf) {
    const { extractText } = await import('unpdf');
    const result = await extractText(bytes, { mergePages: true });
    text = result.text;
    pages = result.totalPages;
  } else if (TEXT_EXTENSIONS.has(extension) || extension === '') {
    text = Buffer.from(bytes).toString('utf8');
  } else {
    return {
      error: `Unsupported file type ".${extension || '?'}". Supported: PDF, TXT, MD, JSON, CSV, LOG, VTT, SRT.`,
      status: 415,
    };
  }

  const detected: SourceType = isPdf || extension === 'json' || extension === 'csv' ? 'document' : 'conversation';
  return { text, label: name, sourceType: pickType(chosen, detected), pages };
}

function dedupeKey(statement: string): string {
  return statement.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail('Expected a multipart form submission.', 400);
  }

  const source = await readSource(form);
  if ('error' in source) return fail(source.error, source.status);

  const text = cleanText(source.text);
  if (text.length < 40) {
    return fail(
      source.pages
        ? `No text layer in that ${source.pages}-page PDF. Scanned pages need OCR, which this build does not do.`
        : 'No readable text found in that source.',
      422,
    );
  }

  const chunks: string[] = [];
  for (let offset = 0; offset < text.length && chunks.length < MAX_CHUNKS; offset += CHUNK_CHARS) {
    chunks.push(text.slice(offset, offset + CHUNK_CHARS));
  }

  const seen = new Set(listMemories({ limit: 500 }).map((memory) => dedupeKey(memory.statement)));
  const imported: Memory[] = [];
  let duplicates = 0;
  let rejected = 0;
  let partialError: string | null = null;

  for (const chunk of chunks) {
    let facts: unknown[];
    try {
      facts = await extractCandidateFacts(chunk);
    } catch (error) {
      partialError = error instanceof Error ? error.message : 'Model call failed';
      if (imported.length === 0) return fail(partialError, 502);
      // Keep whatever earlier chunks already produced rather than throwing the import away.
      break;
    }

    for (const fact of facts) {
      const draft = toDraft(fact, source.label);
      if (!draft) {
        rejected += 1;
        continue;
      }
      const key = dedupeKey(draft.statement);
      if (seen.has(key)) {
        duplicates += 1;
        continue;
      }
      seen.add(key);
      imported.push(createMemory({
        ...draft,
        tier: 'inbox',
        sourceType: source.sourceType,
        isVerifiedFact: false,
      }));
    }
  }

  return NextResponse.json(
    {
      imported,
      duplicates,
      rejected,
      partialError,
      source: source.label,
      sourceType: source.sourceType,
      pages: source.pages,
      characters: text.length,
      processed: Math.min(text.length, chunks.length * CHUNK_CHARS),
    },
    { status: imported.length > 0 ? 201 : 200 },
  );
}