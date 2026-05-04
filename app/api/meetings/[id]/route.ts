import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import type { Meeting } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const row = db.prepare(`SELECT * FROM meetings WHERE id = ?`).get(params.id) as Meeting | undefined;
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { name, start_time, end_time, participants, purpose } = body ?? {};
  if (!name || !start_time || !participants || !purpose) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
  }
  const result = db
    .prepare(
      `UPDATE meetings
       SET name=?, start_time=?, end_time=?, participants=?, purpose=?, updated_by=?, updated_at=datetime('now')
       WHERE id = ?`,
    )
    .run(name, start_time, end_time || null, participants, purpose, session.user.email, params.id);
  if (result.changes === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = db.prepare(`DELETE FROM meetings WHERE id = ?`).run(params.id);
  if (result.changes === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
