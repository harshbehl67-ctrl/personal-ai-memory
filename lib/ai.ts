const DEFAULT_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = 'openai/gpt-oss-20b';
const SYSTEM_INSTRUCTION =
  'You are a Personal AI Memory assistant. Answer only from the stored memories provided. ' +
  'Quote the relevant memory in plain prose when you use it — never as JSON, arrays, or numbered brackets. ' +
  'If the stored memories do not answer the question, say so plainly instead of guessing, and name what detail is missing. Be concise.';

type GroqChatResponse = {
  choices?: { message?: { content?: string }; finish_reason?: string }[];
};

async function chatCompletion(
  messages: { role: 'system' | 'user'; content: string }[],
  maxTokens: number
): Promise<{ content: string; truncated: boolean }> {
  const baseUrl = (process.env.GROQ_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  const apiKey = process.env.GROQ_API_KEY || '';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is missing.');
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    throw new Error(`Groq "${model}" failed with HTTP ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as GroqChatResponse;
  const choice = data.choices?.[0];
  const content = choice?.message?.content?.trim();
  if (!content) {
    throw new Error(`Groq "${model}" returned an empty completion.`);
  }
  return { content, truncated: choice?.finish_reason === 'length' };
}

export function aiProviderInfo() {
  return {
    provider: 'Groq',
    model: process.env.GROQ_MODEL || DEFAULT_MODEL,
    baseUrl: (process.env.GROQ_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ''),
    hasApiKey: Boolean(process.env.GROQ_API_KEY),
  };
}

export async function generateMemoryAnswer(prompt: string): Promise<string> {
  const { content } = await chatCompletion(
    [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: prompt },
    ],
    800
  );
  return content;
}

const EXTRACTION_INSTRUCTION =
  'You extract durable memories from text a user pasted or uploaded. Reply with a single JSON object and nothing else ' +
  '- no prose, no code fences. Shape: ' +
  '{"memories":[{"statement":"...","type":"...","importance":3,"confidence":80,"sensitivity":"personal","whySaved":"...","tags":["..."]}]} ' +
  'Rules: only record what the text states outright, never infer beyond it. Write each statement self-contained, replacing ' +
  'pronouns with the name or thing they refer to. Skip greetings, small talk, formatting noise and anything with no lasting ' +
  'value. "type" must be one of: preference, decision, commitment, person, project, meeting_summary, research_insight, ' +
  'temporary_context. "sensitivity" must be one of: public, personal, sensitive, confidential. "importance" is an integer ' +
  '1-5 and "confidence" an integer 0-100. "whySaved" is one short clause saying where in the text this came from. Return at ' +
  'most 12 memories. If nothing is worth keeping, return {"memories":[]}.';

/** Raw Groq output for one block of source text; the caller validates every field. */
export async function extractCandidateFacts(text: string): Promise<unknown[]> {
  const { content, truncated } = await chatCompletion(
    [
      { role: 'system', content: EXTRACTION_INSTRUCTION },
      { role: 'user', content: `TEXT:\n"""\n${text}\n"""` },
    ],
    2400
  );

  // The model occasionally wraps the object in prose or code fences despite the instruction.
  const cleaned = content.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start !== -1 && end > start) {
    const whole = sliceJson(cleaned.slice(start, end + 1));
    if (whole && Array.isArray(whole.memories)) return whole.memories;

    // Reasoning tokens eat into max_tokens, so the array is often cut mid-object.
    // Every complete candidate still inside the output is worth keeping.
    const salvaged = (cleaned.match(/\{[^{}]*\}/g) ?? [])
      .map(sliceJson)
      .filter((item): item is Record<string, unknown> => item !== null);
    if (salvaged.length > 0) return salvaged;
  }

  throw new Error(truncated
    ? 'The model ran out of output space before finishing its answer. Try a shorter source.'
    : 'The model did not return any extractable memories for this block.');
}

function sliceJson(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}
