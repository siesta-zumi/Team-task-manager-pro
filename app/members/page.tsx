'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getMembers, deleteMember } from '@/lib/members';
import MemberTable from '@/components/MemberTable';
import MemberModal from '@/components/MemberModal';
import { UserPlus, Search, X } from 'lucide-react';
import type { Member } from '@/types';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sort state
  const [sortColumn, setSortColumn] = useState<'name' | 'created_at' | null>('name');
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('ascending');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // モックデータ定義（Supabase未接続時に使用）
  const getMockData = (): Member[] => [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: '田中太郎',
      avatar: null,
      created_at: '2026-01-15T00:00:00Z',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: '佐藤花子',
      avatar: null,
      created_at: '2026-01-16T00:00:00Z',
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: '鈴木一郎',
      avatar: null,
      created_at: '2026-01-17T00:00:00Z',
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: '山田美咲',
      avatar: null,
      created_at: '2026-01-18T00:00:00Z',
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      name: '高橋健太',
      avatar: null,
      created_at: '2026-01-19T00:00:00Z',
    },
  ];

  // メンバーデータの取得関数
  const fetchMembers = async () => {
    try {
      const data = await getMembers();

      // Supabase未接続時はモックデータを使用
      if (data.length === 0) {
        console.info('📝 モックデータを使用します（開発用）');
        setMembers(getMockData());
      } else {
        setMembers(data);
      }
      setError(null);
    } catch (e) {
      let errorMessage = '不明なエラー';

      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'object' && e !== null) {
        const errorObj = e as Record<string, unknown>;
        errorMessage =
          (errorObj.message as string) ||
          (errorObj.code as string) ||
          JSON.stringify(e) ||
          '不明なエラー';
      } else {
        errorMessage = String(e);
      }

      // Supabase未接続の場合はモックデータを使用
      const isConnectionError =
        errorMessage.includes('Supabase未接続') ||
        errorMessage.includes('placeholder') ||
        errorMessage.includes('fetch failed') ||
        errorMessage === '{}' ||
        !errorMessage;

      if (isConnectionError) {
        console.warn('⚠️ Supabaseに接続できません。モックデータを使用します。', errorMessage);
        setMembers(getMockData());
        setError(null);
      } else {
        console.error('Error fetching members:', e);
        setError(errorMessage);
      }
    }
  };

  // 初回データ取得
  useEffect(() => {
    fetchMembers();
  }, []);

  // メンバー削除ハンドラー
  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteMember(memberId);

      // ローカルstateから削除（即座に反映）
      setMembers((prev) => prev.filter((m) => m.id !== memberId));

      // データを再取得
      await fetchMembers();
    } catch (e) {
      let errorMessage = 'メンバーの削除に失敗しました';

      if (e instanceof Error) {
        errorMessage = e.message;
      }

      console.error('Error deleting member:', e);
      alert(errorMessage);

      // エラー時もデータを再取得（状態を同期）
      await fetchMembers();
    }
  };

  // 検索フィルタリング
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const query = searchQuery.toLowerCase();
      return member.name.toLowerCase().includes(query);
    });
  }, [members, searchQuery]);

  // ソート
  const sortedMembers = useMemo(() => {
    if (!sortColumn) return filteredMembers;

    const sorted = [...filteredMembers].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      if (sortColumn === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortColumn === 'created_at') {
        aValue = new Date(a.created_at || '').getTime();
        bValue = new Date(b.created_at || '').getTime();
      }

      if (aValue < bValue) return sortDirection === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'ascending' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredMembers, sortColumn, sortDirection]);

  // ページネーション
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedMembers.slice(startIndex, endIndex);
  }, [sortedMembers, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedMembers.length / pageSize);

  // ソートハンドラー
  const handleSort = (column: 'name' | 'created_at') => {
    if (sortColumn === column) {
      // 同じカラムをクリックした場合は方向を反転
      setSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
    } else {
      // 新しいカラムの場合は昇順でソート
      setSortColumn(column);
      setSortDirection('ascending');
    }
  };

  // メンバークリックハンドラー（編集）
  const handleMemberClick = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsModalOpen(true);
  };

  // 新規メンバー追加ハンドラー
  const handleNewMember = () => {
    setSelectedMemberId(null);
    setIsModalOpen(true);
  };

  // モーダルクローズハンドラー
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMemberId(null);
  };

  // メンバー更新後のハンドラー
  const handleMemberUpdated = () => {
    fetchMembers();
  };

  // 検索クリア
  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  // 検索変更時にページをリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">メンバー管理</h1>
          <p className="mt-2 text-gray-600">チームメンバーの登録・管理</p>
        </div>

        {/* ツールバー */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* 検索フィールド */}
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="名前で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* 新規メンバー追加ボタン */}
            <button
              onClick={handleNewMember}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={20} />
              <span>新規メンバー追加</span>
            </button>
          </div>

          {/* 検索結果件数 */}
          {searchQuery && (
            <div className="mt-3 text-sm text-gray-600">
              {filteredMembers.length}件の結果
            </div>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* メンバーテーブル */}
        <MemberTable
          members={paginatedMembers}
          onMemberClick={handleMemberClick}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onDelete={handleDeleteMember}
        />

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* ページサイズ選択 */}
              <div className="flex items-center space-x-2">
                <label htmlFor="pageSize" className="text-sm text-gray-700">
                  表示件数:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* ページ番号ボタン */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  前へ
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  次へ
                </button>
              </div>

              {/* 総件数表示 */}
              <div className="text-sm text-gray-700">
                {sortedMembers.length}件中 {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, sortedMembers.length)}件を表示
              </div>
            </div>
          </div>
        )}

        {/* 統計情報カード */}
        <div className="mt-6 grid grid-cols-1 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総メンバー数</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{members.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メンバー詳細モーダル */}
      <MemberModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        memberId={selectedMemberId}
        onMemberUpdated={handleMemberUpdated}
        members={members}
      />
    </div>
  );
}
