'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export function Header() {
  const { data: session } = useSession();
  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold">
          会議管理
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {session?.user?.email && (
            <span className="text-gray-600 hidden sm:inline">{session.user.email}</span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-blue-600 hover:underline"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
