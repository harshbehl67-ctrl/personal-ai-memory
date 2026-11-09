import { NextRequest, NextResponse } from 'next/server';
import { createCommitment, listCommitments } from '@/lib/repo';

export async function GET() {
  return NextResponse.json({ commitments: listCommitments() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const commitment = createCommitment({
      title: body.title,
      description: body.description,
      owner: body.owner,
      dueDate: body.dueDate,
      status: body.status,
      relatedProject: body.relatedProject,
    });
    return NextResponse.json({ commitment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid commitment payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
