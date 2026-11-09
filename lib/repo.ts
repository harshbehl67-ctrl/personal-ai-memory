import { randomUUID } from 'node:crypto';
import { getDb } from './db';
import {
  Commitment,
  CommitmentStatus,
  ImportanceLevel,
  Memory,
  MemoryTier,
  MemoryType,
  SensitivityLevel,
  SourceType,
} from './types';

export const MEMORY_TYPES: MemoryType[] = [
  'preference', 'decision', 'commitment', 'person', 'project',
  'meeting_summary', 'research_insight', 'temporary_context',
];
export const MEMORY_TIERS: MemoryTier[] = ['working', 'episodic', 'long_term', 'inbox', 'ignored'];
export const SENSITIVITY_LEVELS: SensitivityLevel[] = ['public', 'personal', 'sensitive', 'confidential'];
export const SOURCE_TYPES: SourceType[] = ['email', 'calendar', 'document', 'conversation', 'browser', 'manual'];
export const COMMITMENT_STATUSES: CommitmentStatus[] = ['pending', 'in_progress', 'completed', 'overdue', 'cancelled'];

export interface MemoryInput {
  statement: string;
  type: MemoryType;
  tier?: MemoryTier;
  importanceScore?: ImportanceLevel;
  confidenceScore?: number;
  sensitivityLevel?: SensitivityLevel;
  sourceType?: SourceType;
  whySaved?: string;
  isVerifiedFact?: boolean;
  tags?: string[];
}

type MemoryRow = {
  id: string;
  statement: string;
  type: string;
  tier: string;
  importance_score: number;
  confidence_score: number;
  sensitivity_level: string;
  source_type: string;
  why_saved: string | null;
  is_verified_fact: number;
  tags: string;
  created_at: string;
  updated_at: string;
};

function toMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    statement: row.statement,
    type: row.type as MemoryType,
    tier: row.tier as MemoryTier,
    importanceScore: row.importance_score as ImportanceLevel,
    confidenceScore: row.confidence_score,
    sensitivityLevel: row.sensitivity_level as SensitivityLevel,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    connectedPeople: [],
    connectedProjects: [],
    citations: [{
      id: `cite-${row.id}`,
      sourceType: row.source_type as SourceType,
      title: row.statement.slice(0, 80),
      date: row.created_at,
      excerpt: row.why_saved ?? undefined,
      sourceId: row.source_type,
    }],
    whySaved: row.why_saved ?? '',
    isVerifiedFact: row.is_verified_fact === 1,
    tags: JSON.parse(row.tags) as string[],
    sourceType: row.source_type as SourceType,
  };
}

const SELECTABLE_TIERS: MemoryTier[] = MEMORY_TIERS.filter((tier) => tier !== 'ignored');

export function createMemory(input: MemoryInput): Memory {
  if (!input.statement?.trim()) throw new Error('statement is required');
  if (!MEMORY_TYPES.includes(input.type)) throw new Error(`invalid type: ${input.type}`);

  const now = new Date().toISOString();
  const row = {
    id: randomUUID(),
    statement: input.statement.trim(),
    type: input.type,
    tier: input.tier && SELECTABLE_TIERS.includes(input.tier) ? input.tier : 'long_term',
    importance_score: clampInt(input.importanceScore ?? 3, 1, 5),
    confidence_score: clampInt(input.confidenceScore ?? 90, 0, 100),
    sensitivity_level: input.sensitivityLevel && SENSITIVITY_LEVELS.includes(input.sensitivityLevel)
      ? input.sensitivityLevel : 'personal',
    source_type: input.sourceType && SOURCE_TYPES.includes(input.sourceType) ? input.sourceType : 'manual',
    why_saved: input.whySaved?.trim() || null,
    is_verified_fact: input.isVerifiedFact === false ? 0 : 1,
    tags: JSON.stringify((input.tags ?? []).map((t) => t.trim()).filter(Boolean)),
    created_at: now,
    updated_at: now,
  };

  getDb().prepare(`
    INSERT INTO memories (id, statement, type, tier, importance_score, confidence_score,
      sensitivity_level, source_type, why_saved, is_verified_fact, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(...Object.values(row));

  return getMemory(row.id)!;
}

export function getMemory(id: string): Memory | undefined {
  const row = getDb().prepare('SELECT * FROM memories WHERE id = ?').get(id) as MemoryRow | undefined;
  return row ? toMemory(row) : undefined;
}

export interface MemoryFilters {
  type?: MemoryType;
  tier?: MemoryTier;
  source?: SourceType;
  q?: string;
  limit?: number;
}

export function listMemories(filters: MemoryFilters = {}): Memory[] {
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (filters.tier) {
    where.push('tier = ?');
    params.push(filters.tier);
  } else {
    where.push("tier != 'ignored'");
  }

  if (filters.type) { where.push('type = ?'); params.push(filters.type); }
  if (filters.source) { where.push('source_type = ?'); params.push(filters.source); }
  if (filters.q) { where.push('statement LIKE ?'); params.push(`%${filters.q}%`); }

  const limit = clampInt(filters.limit ?? 200, 1, 500);
  const rows = getDb().prepare(
    `SELECT * FROM memories WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ?`
  ).all(...params, limit) as MemoryRow[];

  return rows.map(toMemory);
}

export function updateMemory(id: string, patch: Partial<MemoryInput>): Memory | undefined {
  const existing = getMemory(id);
  if (!existing) return undefined;

  const next = {
    statement: patch.statement?.trim() || existing.statement,
    type: patch.type && MEMORY_TYPES.includes(patch.type) ? patch.type : existing.type,
    tier: patch.tier && MEMORY_TIERS.includes(patch.tier) ? patch.tier : existing.tier,
    importance_score: patch.importanceScore ? clampInt(patch.importanceScore, 1, 5) : existing.importanceScore,
    confidence_score: patch.confidenceScore != null ? clampInt(patch.confidenceScore, 0, 100) : existing.confidenceScore,
    sensitivity_level: patch.sensitivityLevel && SENSITIVITY_LEVELS.includes(patch.sensitivityLevel)
      ? patch.sensitivityLevel : existing.sensitivityLevel,
    source_type: patch.sourceType && SOURCE_TYPES.includes(patch.sourceType) ? patch.sourceType : existing.sourceType,
    why_saved: patch.whySaved ?? existing.whySaved ?? null,
    is_verified_fact: patch.isVerifiedFact === undefined ? (existing.isVerifiedFact ? 1 : 0) : (patch.isVerifiedFact ? 1 : 0),
    tags: patch.tags ? JSON.stringify(patch.tags.map((t) => t.trim()).filter(Boolean)) : JSON.stringify(existing.tags),
    updated_at: new Date().toISOString(),
  };

  getDb().prepare(`
    UPDATE memories SET statement = ?, type = ?, tier = ?, importance_score = ?, confidence_score = ?,
      sensitivity_level = ?, source_type = ?, why_saved = ?, is_verified_fact = ?, tags = ?, updated_at = ?
    WHERE id = ?
  `).run(...Object.values(next), id);

  return getMemory(id);
}

export function deleteMemory(id: string): boolean {
  return getDb().prepare('DELETE FROM memories WHERE id = ?').run(id).changes > 0;
}

// Question words carry no signal for matching; counting them would make every row look relevant.
const STOPWORDS = new Set([
  'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am', 'do', 'does', 'did',
  'have', 'has', 'had', 'will', 'would', 'can', 'could', 'should', 'tell', 'remind',
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'from', 'about',
  'my', 'me', 'i', 'we', 'our', 'you', 'your', 'it', 'its', 'this', 'that', 'these', 'those',
  'they', 'them', 'their', 'his', 'her', 'not', 'no', 'so', 'if', 'then', 'than', 'but',
  'because', 'any', 'all', 'some', 'get', 'got', 'again', 'please', 'there', 'here',
]);

export interface ScoredMemory {
  memory: Memory;
  score: number;
  matchedTerms: string[];
}

export function searchMemoriesDetailed(query: string, limit = 8): ScoredMemory[] {
  const tokens = [...new Set(
    query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOPWORDS.has(t))
  )];
  if (tokens.length === 0) return [];

  const candidates = listMemories({ limit: 500 });
  return candidates
    .map((memory) => {
      const haystack = `${memory.statement} ${memory.tags.join(' ')} ${memory.whySaved}`.toLowerCase();
      const matchedTerms = tokens.filter((token) => haystack.includes(token));
      const recencyBoost = Date.now() - new Date(memory.createdAt).getTime() < 7 * 864e5 ? 0.5 : 0;
      return { memory, matchedTerms, score: matchedTerms.length + memory.importanceScore * 0.2 + recencyBoost };
    })
    .filter((result) => result.matchedTerms.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function searchMemories(query: string, limit = 8): Memory[] {
  return searchMemoriesDetailed(query, limit).map((result) => result.memory);
}

export interface Stats {
  total: number;
  addedThisWeek: number;
  pendingInbox: number;
  verifiedShare: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
}

export function getStats(): Stats {
  const db = getDb();
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const count = (sql: string, ...params: string[]) =>
    (db.prepare(sql).get(...params) as { n: number }).n;

  const total = count('SELECT COUNT(*) AS n FROM memories WHERE tier != ?', 'ignored');
  const byTypeRows = db.prepare(
    "SELECT type, COUNT(*) AS n FROM memories WHERE tier != 'ignored' GROUP BY type"
  ).all() as { type: string; n: number }[];
  const bySourceRows = db.prepare(
    "SELECT source_type, COUNT(*) AS n FROM memories WHERE tier != 'ignored' GROUP BY source_type"
  ).all() as { source_type: string; n: number }[];
  const verified = count(
    'SELECT COUNT(*) AS n FROM memories WHERE tier != ? AND is_verified_fact = 1', 'ignored'
  );

  return {
    total,
    addedThisWeek: count('SELECT COUNT(*) AS n FROM memories WHERE tier != ? AND created_at >= ?', 'ignored', weekAgo),
    pendingInbox: count('SELECT COUNT(*) AS n FROM memories WHERE tier = ?', 'inbox'),
    verifiedShare: total === 0 ? 0 : Math.round((verified / total) * 100),
    byType: Object.fromEntries(byTypeRows.map((r) => [r.type, r.n])),
    bySource: Object.fromEntries(bySourceRows.map((r) => [r.source_type, r.n])),
  };
}

type CommitmentRow = {
  id: string; title: string; description: string | null; owner: string;
  due_date: string | null; status: string; related_project: string | null;
  created_at: string; updated_at: string;
};

function toCommitment(row: CommitmentRow): Commitment {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    owner: row.owner,
    dueDate: row.due_date ?? undefined,
    status: row.status as CommitmentStatus,
    relatedProject: row.related_project ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createCommitment(input: {
  title: string; description?: string; owner?: string; dueDate?: string;
  status?: CommitmentStatus; relatedProject?: string;
}): Commitment {
  if (!input.title?.trim()) throw new Error('title is required');
  const now = new Date().toISOString();
  const id = randomUUID();
  getDb().prepare(`
    INSERT INTO commitments (id, title, description, owner, due_date, status, related_project, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.title.trim(),
    input.description?.trim() || null,
    input.owner?.trim() || 'Me',
    input.dueDate || null,
    input.status && COMMITMENT_STATUSES.includes(input.status) ? input.status : 'pending',
    input.relatedProject?.trim() || null,
    now,
    now,
  );
  return getCommitment(id)!;
}

export function getCommitment(id: string): Commitment | undefined {
  const row = getDb().prepare('SELECT * FROM commitments WHERE id = ?').get(id) as CommitmentRow | undefined;
  return row ? toCommitment(row) : undefined;
}

export function listCommitments(): Commitment[] {
  const rows = getDb().prepare(`
    SELECT * FROM commitments
    WHERE status != 'cancelled'
    ORDER BY CASE status WHEN 'completed' THEN 1 ELSE 0 END, due_date IS NULL, due_date
  `).all() as CommitmentRow[];
  return rows.map(toCommitment);
}

export function updateCommitment(id: string, patch: {
  status?: CommitmentStatus; title?: string; dueDate?: string | null;
}): Commitment | undefined {
  const existing = getCommitment(id);
  if (!existing) return undefined;
  getDb().prepare(`
    UPDATE commitments SET title = ?, due_date = ?, status = ?, updated_at = ? WHERE id = ?
  `).run(
    patch.title?.trim() || existing.title,
    patch.dueDate === null ? null : (patch.dueDate ?? existing.dueDate ?? null),
    patch.status && COMMITMENT_STATUSES.includes(patch.status) ? patch.status : existing.status,
    new Date().toISOString(),
    id,
  );
  return getCommitment(id);
}

export function deleteCommitment(id: string): boolean {
  return getDb().prepare('DELETE FROM commitments WHERE id = ?').run(id).changes > 0;
}

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
