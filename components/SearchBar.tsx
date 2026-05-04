'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const trimmed = q.trim();
    if (trimmed) params.set('q', trimmed);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="会議名・参加者・目的で検索"
        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
      >
        検索
      </button>
      {q && (
        <button
          type="button"
          onClick={() => {
            setQ('');
            router.push('/');
          }}
          className="text-gray-600 px-3 py-2 hover:bg-gray-100 rounded"
        >
          クリア
        </button>
      )}
    </form>
  );
}
