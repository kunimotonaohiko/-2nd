import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import type { Meeting } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  let rows: Meeting[];
  if (q) {
    const like = `%${q}%`;
    rows = db
      .prepare(
        `SELECT * FROM meetings
         WHERE name LIKE ? OR participants LIKE ? OR purpose LIKE ?
         ORDER BY start_time DESC`,
      )
      .all(like, like, like) as Meeting[];
  } else {
    rows = db.prepare(`SELECT * FROM meetings ORDER BY start_time DESC`).all() as Meeting[];
  }
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
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
      `INSERT INTO meetings (name, start_time, end_time, participants, purpose, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      name,
      start_time,
      end_time || null,
      participants,
      purpose,
      session.user.email,
      session.user.email,
    );
  return NextResponse.json({ id: result.lastInsertRowid });
}
