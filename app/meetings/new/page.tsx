import Link from 'next/link';
import { Header } from '@/components/Header';
import { MeetingForm } from '@/components/MeetingForm';

export default function NewMeetingPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← 一覧に戻る
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">新しい会議を追加</h1>
        <MeetingForm />
      </main>
    </>
  );
}
