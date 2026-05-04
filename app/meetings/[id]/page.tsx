import Link from 'next/link';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import { Header } from '@/components/Header';
import { MeetingForm } from '@/components/MeetingForm';
import type { Meeting } from '@/lib/types';

export const dynamic = 'force-dynamic';

function toLocal(s: string | null): string {
  if (!s) return '';
  // SQLite datetime → datetime-local 形式 (YYYY-MM-DDTHH:mm)
  const normalized = s.includes('T') ? s : s.replace(' ', 'T');
  return normalized.slice(0, 16);
}

export default function EditMeetingPage({ params }: { params: { id: string } }) {
  const meeting = db.prepare(`SELECT * FROM meetings WHERE id = ?`).get(params.id) as
    | Meeting
    | undefined;
  if (!meeting) notFound();

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← 一覧に戻る
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">会議の編集</h1>
        <MeetingForm
          initial={{
            id: meeting.id,
            name: meeting.name,
            start_time: toLocal(meeting.start_time),
            end_time: toLocal(meeting.end_time),
            participants: meeting.participants,
            purpose: meeting.purpose,
          }}
        />
        <div className="mt-4 text-xs text-gray-500 space-y-0.5">
          <div>
            作成: {meeting.created_by ?? '不明'} ({meeting.created_at} UTC)
          </div>
          <div>
            最終更新: {meeting.updated_by ?? '不明'} ({meeting.updated_at} UTC)
          </div>
        </div>
      </main>
    </>
  );
}
