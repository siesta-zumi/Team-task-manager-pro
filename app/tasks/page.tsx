'use client';

import React, { useState, useEffect } from 'react';
import { getTasks } from '@/lib/tasks';
import TaskTable from '@/components/TaskTable';
import TaskModal from '@/components/TaskModal';
import { Status, RecurringType, type Task } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // モックデータ定義（PROJECT-PLAN.mdのPhaseに基づく）
  // 実際のプロジェクト進捗をタスクとして管理し、使用感を確認する
  const getMockData = (): Task[] => [
    {
      id: 'phase-1',
      title: 'Phase 1: プロジェクトセットアップ',
      description: 'GitHubリポジトリ作成、Next.js 15プロジェクト初期化、依存関係インストール、初回コミット・プッシュ',
      status: Status.Completed,
      progress: 100,
      start_date: '2026-01-18',
      end_date: '2026-01-18',
      score: 3,
      is_recurring: false,
      recurring_type: null,
      link: 'https://github.com/siesta-zumi/Team-task-manager-pro',
      communication_link: null,
      created_at: '2026-01-18T00:00:00Z',
      updated_at: '2026-01-18T23:59:59Z',
      assignments: []
    },
    {
      id: 'phase-2',
      title: 'Phase 2: ドキュメント作成',
      description: 'README.md、CLAUDE.md、docs/design.md、docs/session-handover.md、ISSUE.md、PROJECT-PLAN.md、DEVELOPMENT-RULES.md、docs/FILE-STRUCTURE-GUIDE.md、docs/NOTIFICATION-GUIDE.md、.env.local.example作成、CLAUDE.md更新',
      status: Status.Completed,
      progress: 100,
      start_date: '2026-01-18',
      end_date: '2026-01-18',
      score: 4,
      is_recurring: false,
      recurring_type: null,
      link: 'PROJECT-PLAN.md',
      communication_link: null,
      created_at: '2026-01-18T00:00:00Z',
      updated_at: '2026-01-18T23:59:59Z',
      assignments: []
    },
    {
      id: 'phase-3',
      title: 'Phase 3: Supabase基盤構築',
      description: 'Supabaseクライアント設定、TypeScript型定義、データベースマイグレーション、CRUD関数の実装（tasks.ts、members.ts、subtasks.ts）',
      status: Status.Completed,
      progress: 100,
      start_date: '2026-01-18',
      end_date: '2026-01-18',
      score: 8,
      is_recurring: false,
      recurring_type: null,
      link: 'lib/supabase.ts',
      communication_link: 'supabase/migrations/',
      created_at: '2026-01-18T00:00:00Z',
      updated_at: '2026-01-18T23:59:59Z',
      assignments: []
    },
    {
      id: 'phase-4',
      title: 'Phase 4: UI実装 - タスク一覧ページ',
      description: 'Step 1完了（ホームページ、タスク一覧ページ、タスクテーブルコンポーネント、統計情報カード）。Step 2-3未着手（フィルター・検索、ソート・ページネーション）。進捗: Step 1/3 = 33%',
      status: Status.InProgress,
      progress: 33, // Step 1/3 = 33%
      start_date: '2026-01-18',
      end_date: '2026-02-01', // 予定終了日
      score: 7,
      is_recurring: false,
      recurring_type: null,
      link: 'app/tasks/page.tsx',
      communication_link: 'components/TaskTable.tsx',
      created_at: '2026-01-18T00:00:00Z',
      updated_at: '2026-01-19T00:00:00Z',
      assignments: []
    },
    {
      id: 'phase-5',
      title: 'Phase 5: タスク詳細モーダル',
      description: 'Step 1-2完了（モーダルUI実装、タスク詳細表示・編集機能）。Step 3-4未着手（チェックリスト機能、担当者アサイン機能）。進捗: Step 2/4 = 50%',
      status: Status.InProgress,
      progress: 50, // Step 2/4 = 50%
      start_date: '2026-01-19',
      end_date: '2026-02-05', // 予定終了日
      score: 8,
      is_recurring: false,
      recurring_type: null,
      link: 'components/TaskModal.tsx',
      communication_link: null,
      created_at: '2026-01-19T00:00:00Z',
      updated_at: '2026-01-19T23:59:59Z',
      assignments: []
    },
    {
      id: 'phase-6',
      title: 'Phase 6: 新規タスク作成',
      description: 'Step 1-2完了（新規作成UI、作成機能実装、バリデーション、トースト通知）。進捗: Step 2/2 = 100%',
      status: Status.Completed,
      progress: 100, // Step 2/2 = 100%
      start_date: '2026-01-19',
      end_date: '2026-01-19',
      score: 5,
      is_recurring: false,
      recurring_type: null,
      link: 'components/TaskModal.tsx',
      communication_link: null,
      created_at: '2026-01-19T00:00:00Z',
      updated_at: '2026-01-19T23:59:59Z',
      assignments: []
    }
  ];

  // タスクデータの取得関数（useEffectとonTaskUpdatedの両方から使用）
  const fetchTasks = async () => {
    try {
      const data = await getTasks();

      // Supabase未接続時はモックデータを使用
      if (data.length === 0) {
        console.info('📝 モックデータを使用します（開発用）');
        setTasks(getMockData());
      } else {
        setTasks(data);
      }
      setError(null); // エラー状態をクリア
    } catch (e) {
      // エラーオブジェクトの詳細を取得
      let errorMessage = '不明なエラー';
      
      if (e instanceof Error) {
        errorMessage = e.message || '不明なエラー';
      } else if (typeof e === 'object' && e !== null) {
        // エラーオブジェクトの詳細を取得
        const errorObj = e as Record<string, unknown>;
        errorMessage = 
          (errorObj.message as string) || 
          (errorObj.code as string) || 
          (errorObj.details as string) ||
          (errorObj.hint as string) ||
          JSON.stringify(e) ||
          '不明なエラー';
      } else {
        errorMessage = String(e);
      }

      // 空オブジェクト `{}` やプレースホルダー値の検出
      const isPlaceholderError = 
        errorMessage === '{}' ||
        errorMessage.includes('placeholder') ||
        errorMessage.includes('fetch failed') || 
        errorMessage.includes('ENOTFOUND') ||
        !errorMessage ||
        errorMessage === '不明なエラー';

      // Supabase未接続時は警告のみ＆モックデータを使用（エラー表示なし）
      if (isPlaceholderError) {
        console.warn('⚠️ Supabase未接続のため、モックデータを使用します', {
          originalError: e,
          errorMessage
        });
        setError(null); // エラー状態をクリア
        setTasks(getMockData());
      } else {
        // Supabase接続エラー以外の場合はエラー表示
        console.error('タスクの取得に失敗:', {
          error: e,
          errorMessage,
          errorType: typeof e,
          isError: e instanceof Error
        });
        setError(errorMessage);
      }
    }
  };

  // タスクデータの取得（初回読み込み時）
  useEffect(() => {
    fetchTasks();
  }, []);

  // タスク更新後のコールバック
  const handleTaskUpdated = () => {
    fetchTasks();
  };

  // タスククリック時のハンドラ
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  // 新規タスク作成ボタンのハンドラ
  const handleNewTask = () => {
    setSelectedTaskId(null); // nullを設定することで新規作成モードになる
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
  };

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
          <button
            onClick={handleNewTask}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
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
        <TaskTable tasks={tasks} onTaskClick={handleTaskClick} />

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
                {tasks.filter((t) => t.status === Status.InProgress).length}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                完了
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {tasks.filter((t) => t.status === Status.Completed).length}
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

      {/* タスク詳細モーダル */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        taskId={selectedTaskId}
        onTaskUpdated={handleTaskUpdated}
        tasks={tasks}
      />
    </div>
  );
}
