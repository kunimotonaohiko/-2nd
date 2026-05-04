import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { findSimilar, type SimilarCandidate } from '@/lib/similarity';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { name, purpose, excludeId } = await req.json();
  if (!name && !purpose) return NextResponse.json([]);

  let rows = db
    .prepare(`SELECT id, name, purpose, start_time FROM meetings`)
    .all() as SimilarCandidate[];
  if (excludeId !== undefined && excludeId !== null) {
    const exId = Number(excludeId);
    rows = rows.filter((r) => r.id !== exId);
  }
  const similar = findSimilar({ name: name ?? '', purpose: purpose ?? '' }, rows);
  return NextResponse.json(similar);
}
