'use client';

import React from 'react';
import { User, Pencil, Trash2 } from 'lucide-react';
import type { Member } from '@/types';

interface MemberTableProps {
  members: Member[];
  onMemberClick?: (memberId: string) => void;
  sortColumn?: 'name' | 'created_at' | null;
  sortDirection?: 'ascending' | 'descending';
  onSort?: (column: 'name' | 'created_at') => void;
  onDelete?: (memberId: string) => void;
}

const MemberTable: React.FC<MemberTableProps> = ({
  members,
  onMemberClick,
  sortColumn,
  sortDirection,
  onSort,
  onDelete
}) => {
  // ソートインジケーターを表示するヘルパー関数
  const renderSortIndicator = (column: 'name' | 'created_at') => {
    if (sortColumn !== column) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'ascending' ? '↑' : '↓'}
      </span>
    );
  };

  // 日付フォーマット（YYYY-MM-DD形式）
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 削除ハンドラー（確認ダイアログ付き）
  const handleDelete = (e: React.MouseEvent, memberId: string, memberName: string) => {
    e.stopPropagation(); // 行クリックイベントを防ぐ

    if (window.confirm(`「${memberName}」を削除してもよろしいですか？`)) {
      onDelete?.(memberId);
    }
  };

  // 編集ハンドラー
  const handleEdit = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation(); // 行クリックイベントを防ぐ
    onMemberClick?.(memberId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アバター
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort?.('name')}
              >
                名前{renderSortIndicator('name')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort?.('created_at')}
              >
                登録日{renderSortIndicator('created_at')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  メンバーがいません
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => onMemberClick?.(member.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {member.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={(e) => handleEdit(e, member.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="編集"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, member.id, member.name)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberTable;
