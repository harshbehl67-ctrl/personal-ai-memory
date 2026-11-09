import { NextRequest, NextResponse } from 'next/server';
import { deleteCommitment, updateCommitment } from '@/lib/repo';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const commitment = updateCommitment(id, body);
    if (!commitment) return NextResponse.json({ error: 'Commitment not found' }, { status: 404 });
    return NextResponse.json({ commitment });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid commitment payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!deleteCommitment(id)) return NextResponse.json({ error: 'Commitment not found' }, { status: 404 });
  return NextResponse.json({ deleted: id });
}
