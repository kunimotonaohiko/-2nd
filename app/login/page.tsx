'use client';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const params = useSearchParams();
  const error = params.get('error');
  const errorMessage =
    error === 'AccessDenied'
      ? '@kenkohkai.jp または @kunimoto-hp.com のメールアドレスでログインしてください。'
      : error
        ? 'ログインに失敗しました。もう一度お試しください。'
        : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">会議管理アプリ</h1>
        <p className="text-sm text-gray-600 mb-6">
          @kenkohkai.jp または @kunimoto-hp.com の Google アカウントでログインしてください。
        </p>
        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-4">
            {errorMessage}
          </p>
        )}
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Google でログイン
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
