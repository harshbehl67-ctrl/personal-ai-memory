import { NextResponse } from 'next/server';
import { listCommitments, listMemories } from '@/lib/repo';
import { getDb } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    memories: listMemories({ limit: 500 }),
    commitments: listCommitments(),
  });
}

export async function DELETE() {
  const db = getDb();
  db.exec('DELETE FROM memories; DELETE FROM commitments;');
  return NextResponse.json({ cleared: true });
}
