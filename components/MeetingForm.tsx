'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SimilarMeeting {
  id: number;
  name: string;
  purpose: string;
  start_time?: string;
  score: number;
}

interface InitialValues {
  id?: number;
  name?: string;
  start_time?: string;
  end_time?: string | null;
  participants?: string;
  purpose?: string;
}

export function MeetingForm({ initial }: { initial?: InitialValues }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [startTime, setStartTime] = useState(initial?.start_time ?? '');
  const [endTime, setEndTime] = useState(initial?.end_time ?? '');
  const [participants, setParticipants] = useState(initial?.participants ?? '');
  const [purpose, setPurpose] = useState(initial?.purpose ?? '');
  const [similar, setSimilar] = useState<SimilarMeeting[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name && !purpose) {
      setSimilar([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const res = await fetch('/api/meetings/similar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, purpose, excludeId: initial?.id }),
        });
        if (res.ok) {
          const data = (await res.json()) as SimilarMeeting[];
          setSimilar(data);
        }
      } catch {
        // ignore
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [name, purpose, initial?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const url = initial?.id ? `/api/meetings/${initial.id}` : '/api/meetings';
    const method = initial?.id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        start_time: startTime,
        end_time: endTime || null,
        participants,
        purpose,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data?.error ?? '保存に失敗しました');
      return;
    }
    router.push('/');
    router.refresh();
  }

  async function handleDelete() {
    if (!initial?.id) return;
    if (!confirm('この会議を削除してもよろしいですか?')) return;
    const res = await fetch(`/api/meetings/${initial.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('削除に失敗しました');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded p-6">
      <div>
        <label className="block text-sm font-medium mb-1">
          会議名 <span className="text-red-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            開始日時 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">終了日時</label>
          <input
            type="datetime-local"
            value={endTime ?? ''}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          参加者 <span className="text-red-500">*</span>
        </label>
        <input
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          required
          placeholder="例: 山田, 佐藤, 鈴木"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          目的 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
          rows={4}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {similar.length > 0 && (
        <div className="border border-amber-300 bg-amber-50 rounded p-4">
          <h3 className="font-medium text-amber-900">
            趣旨が似ている会議が見つかりました。一緒に開催できないか検討してみてください。
          </h3>
          <ul className="mt-2 space-y-2">
            {similar.map((s) => (
              <li key={s.id} className="text-sm">
                <a
                  href={`/meetings/${s.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 hover:underline font-medium"
                >
                  {s.name}
                </a>
                {s.start_time && <span className="text-gray-600 ml-2">({s.start_time})</span>}
                <span className="text-gray-500 ml-2">類似度: {Math.round(s.score * 100)}%</span>
                <p className="text-gray-700 mt-0.5 whitespace-pre-wrap">{s.purpose}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex flex-wrap gap-2 justify-end">
        {initial?.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
          >
            削除
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {submitting ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
}
