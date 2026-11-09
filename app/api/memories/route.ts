import { NextRequest, NextResponse } from 'next/server';
import { createMemory, listMemories, MemoryFilters, MEMORY_TIERS, MEMORY_TYPES, SOURCE_TYPES } from '@/lib/repo';
import type { MemoryTier, MemoryType, SourceType } from '@/lib/types';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = sp.get('type') as MemoryType | null;
  const tier = sp.get('tier') as MemoryTier | null;
  const source = sp.get('source') as SourceType | null;
  const limit = sp.get('limit') === null ? undefined : Number(sp.get('limit'));

  const filters: MemoryFilters = {
    q: sp.get('q') ?? undefined,
    type: type && MEMORY_TYPES.includes(type) ? type : undefined,
    tier: tier && MEMORY_TIERS.includes(tier) ? tier : undefined,
    source: source && SOURCE_TYPES.includes(source) ? source : undefined,
    // Number(null) is 0, so an absent limit must be detected before parsing.
    limit: limit !== undefined && Number.isFinite(limit) && limit > 0 ? limit : undefined,
  };

  return NextResponse.json({ memories: listMemories(filters) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const memory = createMemory({
      statement: body.statement,
      type: body.type,
      tier: body.tier,
      importanceScore: body.importanceScore,
      confidenceScore: body.confidenceScore,
      sensitivityLevel: body.sensitivityLevel,
      sourceType: body.sourceType,
      whySaved: body.whySaved,
      isVerifiedFact: body.isVerifiedFact,
      tags: body.tags,
    });
    return NextResponse.json({ memory }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid memory payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
