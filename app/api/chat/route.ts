import { NextResponse } from 'next/server';
import { generateMemoryAnswer } from '@/lib/ai';
import { searchMemoriesDetailed } from '@/lib/repo';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'A non-empty prompt is required.' }, { status: 400 });
    }

    const matches = searchMemoriesDetailed(prompt, 8);
    const memories = matches.map((match) => match.memory);
    const context = matches.length
      ? matches
          .map((match, i) => `[${i + 1}] (${match.memory.type}, ${match.memory.confidenceScore}% confidence, matched: ${match.matchedTerms.join(', ')}) ${match.memory.statement}`)
          .join('\n')
      : 'None found.';

    const reply = await generateMemoryAnswer(
      `Stored memories:\n${context}\n\nQuestion: ${prompt.trim()}`
    );

    const confidenceScore = memories.length
      ? Math.round(memories.reduce((sum, m) => sum + m.confidenceScore, 0) / memories.length)
      : 0;

    return NextResponse.json({
      content: reply,
      relatedMemories: memories,
      citations: memories.flatMap((m) => m.citations),
      confidenceScore,
      isFactBased: memories.length > 0,
      inferenceWarning: memories.length === 0
        ? 'No stored memories matched this question, so the answer is not grounded in your data.'
        : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate memory AI response';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
