import Link from 'next/link';
import db from '@/lib/db';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import type { Meeting } from '@/lib/types';

export const dynamic = 'force-dynamic';

function formatDateTime(s: string | null): string {
  if (!s) return '';
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T'));
  if (isNaN(d.getTime())) return s;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
}

export default function Home({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  let meetings: Meeting[];
  if (q) {
    const like = `%${q}%`;
    meetings = db
      .prepare(
        `SELECT * FROM meetings
         WHERE name LIKE ? OR participants LIKE ? OR purpose LIKE ?
         ORDER BY start_time DESC`,
      )
      .all(like, like, like) as Meeting[];
  } else {
    meetings = db.prepare(`SELECT * FROM meetings ORDER BY start_time DESC`).all() as Meeting[];
  }

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">会議一覧</h1>
          <Link
            href="/meetings/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + 会議を追加
          </Link>
        </div>

        <SearchBar defaultValue={q} />

        {meetings.length === 0 ? (
          <p className="text-gray-500 mt-8 text-center">
            {q ? '該当する会議はありません。' : 'まだ会議が登録されていません。「+ 会議を追加」から登録してください。'}
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {meetings.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/meetings/${m.id}`}
                  className="block bg-white border rounded px-4 py-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-medium text-lg">{m.name}</h2>
                    <time className="text-sm text-gray-600 whitespace-nowrap">
                      {formatDateTime(m.start_time)}
                    </time>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap line-clamp-2">{m.purpose}</p>
                  <p className="text-xs text-gray-500 mt-1">参加者: {m.participants}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
