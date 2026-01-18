import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Team Task Manager Pro
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          チームタスク管理アプリケーション
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/tasks"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            タスク一覧へ
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Next.js 15 + React 19 + Supabase
        </p>
      </div>
    </div>
  );
}
