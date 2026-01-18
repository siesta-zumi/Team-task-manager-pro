import React from 'react';
import { getTasks } from '@/lib/tasks';
import TaskTable from '@/components/TaskTable';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  let tasks = [];
  let error = null;

  try {
    tasks = await getTasks();
  } catch (e) {
    error = e instanceof Error ? e.message : '不明なエラー';
    // Supabase未接続時は警告のみ
    if (error.includes('fetch failed') || error.includes('ENOTFOUND')) {
      console.warn('⚠️ Supabase未接続のため、タスクデータは表示されません');
    } else {
      console.error('タスクの取得に失敗:', e);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">タスク一覧</h1>
          <p className="mt-2 text-sm text-gray-600">
            チームのタスクを管理します
          </p>
        </div>

        {/* ツールバー */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* フィルター（将来実装） */}
            <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
              <option>すべてのステータス</option>
              <option>未着手</option>
              <option>進行中</option>
              <option>完了</option>
              <option>承認済み</option>
            </select>

            {/* 検索（将来実装） */}
            <input
              type="search"
              placeholder="タスクを検索..."
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm w-64"
            />
          </div>

          {/* 新規作成ボタン */}
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            新規タスク
          </button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  データの取得に失敗しました
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <p className="mt-1 text-xs">
                    Supabaseの設定を確認してください（.env.local）
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* タスクテーブル */}
        <TaskTable tasks={tasks} />

        {/* 統計情報 */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                総タスク数
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {tasks.length}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                進行中
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                {tasks.filter((t) => t.status === '進行中').length}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                完了
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {tasks.filter((t) => t.status === '完了').length}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                平均進捗率
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-purple-600">
                {tasks.length > 0
                  ? Math.round(
                      tasks.reduce((sum, t) => sum + (t.progress || 0), 0) /
                        tasks.length
                    )
                  : 0}
                %
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
