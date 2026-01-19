'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getTasks } from '@/lib/tasks';
import TaskTable from '@/components/TaskTable';
import TaskModal from '@/components/TaskModal';
import { Status, RecurringType, type Task } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Filter and search state
  const [selectedStatus, setSelectedStatus] = useState<Status | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort state
  const [sortColumn, setSortColumn] = useState<'title' | 'status' | 'end_date' | 'progress' | null>(null);
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('ascending');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  // フィルター・検索処理（useMemoでメモ化）
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // ステータスフィルター
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;

      // 検索クエリフィルター（タスク名・説明文の部分一致）
      const matchesSearch =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [tasks, selectedStatus, searchQuery]);

  // ソート処理（useMemoでメモ化）
  const sortedTasks = useMemo(() => {
    if (!sortColumn) return filteredTasks;

    const sorted = [...filteredTasks].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortColumn) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'end_date':
          aValue = a.end_date;
          bValue = b.end_date;
          break;
        case 'progress':
          aValue = a.progress || 0;
          bValue = b.progress || 0;
          break;
      }

      if (aValue < bValue) return sortDirection === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'ascending' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredTasks, sortColumn, sortDirection]);

  // ページネーション処理（useMemoでメモ化）
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedTasks.slice(startIndex, endIndex);
  }, [sortedTasks, currentPage, pageSize]);

  // 総ページ数の計算
  const totalPages = Math.ceil(sortedTasks.length / pageSize);

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

  // フィルタークリア
  const handleClearFilters = () => {
    setSelectedStatus('all');
    setSearchQuery('');
  };

  // 検索入力ハンドラ（debounceなしで即座に反映）
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // ステータスフィルター変更ハンドラ
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStatus(value === 'all' ? 'all' : value as Status);
    setCurrentPage(1); // フィルター変更時は1ページ目に戻る
  };

  // ソートハンドラ
  const handleSort = (column: 'title' | 'status' | 'end_date' | 'progress') => {
    if (sortColumn === column) {
      // 同じカラムをクリックした場合は方向を切り替え
      setSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
    } else {
      // 異なるカラムをクリックした場合は昇順で開始
      setSortColumn(column);
      setSortDirection('ascending');
    }
  };

  // ページサイズ変更ハンドラ
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // ページサイズ変更時は1ページ目に戻る
  };

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 戻るボタン */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            ホームへ戻る
          </Link>
        </div>

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
            {/* ステータスフィルター */}
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">すべてのステータス</option>
              <option value={Status.NotStarted}>未着手</option>
              <option value={Status.InProgress}>進行中</option>
              <option value={Status.Completed}>完了</option>
              <option value={Status.Approved}>承認済み</option>
            </select>

            {/* タスク検索 */}
            <input
              type="search"
              placeholder="タスクを検索..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm w-64"
            />

            {/* フィルタークリアボタン */}
            {(selectedStatus !== 'all' || searchQuery !== '') && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                フィルタークリア
              </button>
            )}
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

        {/* 検索結果件数 */}
        {(selectedStatus !== 'all' || searchQuery !== '') && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredTasks.length}件のタスクが見つかりました（全{tasks.length}件中）
          </div>
        )}

        {/* タスクテーブル */}
        <TaskTable
          tasks={paginatedTasks}
          onTaskClick={handleTaskClick}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        {/* ページネーション */}
        {sortedTasks.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-4 py-3 border border-gray-200 rounded-lg">
            {/* ページサイズ選択 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">表示件数:</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value={10}>10件</option>
                <option value={25}>25件</option>
                <option value={50}>50件</option>
                <option value={100}>100件</option>
              </select>
              <span className="text-sm text-gray-600">
                {sortedTasks.length}件中 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedTasks.length)}件を表示
              </span>
            </div>

            {/* ページ番号ボタン */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* 前へボタン */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  前へ
                </button>

                {/* ページ番号 */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // 最初の3ページ、現在のページ周辺、最後の3ページを表示
                  if (
                    page <= 3 ||
                    page >= totalPages - 2 ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === 4 && currentPage > 5) {
                    return <span key={page} className="px-2 text-gray-500">...</span>;
                  } else if (page === totalPages - 3 && currentPage < totalPages - 4) {
                    return <span key={page} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}

                {/* 次へボタン */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  次へ
                </button>
              </div>
            )}
          </div>
        )}

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
