import { NextRequest, NextResponse } from 'next/server';
import { deleteMemory, updateMemory } from '@/lib/repo';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const memory = updateMemory(id, body);
    if (!memory) return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    return NextResponse.json({ memory });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid memory payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!deleteMemory(id)) return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
  return NextResponse.json({ deleted: id });
}
