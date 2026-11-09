import { NextResponse } from 'next/server';
import { getStats } from '@/lib/repo';
import { dbPath } from '@/lib/db';
import { aiProviderInfo } from '@/lib/ai';

export async function GET() {
  return NextResponse.json({ stats: getStats(), databasePath: dbPath, ai: aiProviderInfo() });
}
