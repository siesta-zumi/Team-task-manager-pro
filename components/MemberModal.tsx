'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getMember, createMember, updateMember } from '@/lib/members';
import { User, X } from 'lucide-react';
import type { Member } from '@/types';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string | null; // null=新規作成
  onMemberUpdated?: () => void;
  members?: Member[]; // モックデータフォールバック
}

const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  memberId,
  onMemberUpdated,
  members
}) => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // フォーム状態
  const [formData, setFormData] = useState<{
    name: string;
    avatar: string | null;
  }>({
    name: '',
    avatar: null,
  });

  // メンバーデータの取得または新規作成モードの初期化
  useEffect(() => {
    if (isOpen) {
      setError(null);

      if (memberId) {
        // 既存メンバーの編集モード
        setLoading(true);

        const fetchMember = async () => {
          try {
            const memberData = await getMember(memberId);
            setMember(memberData);

            // フォームに初期値を設定
            setFormData({
              name: memberData.name,
              avatar: memberData.avatar || null,
            });
          } catch (e) {
            let errorMessage = 'メンバーの取得に失敗しました';

            if (e instanceof Error) {
              errorMessage = e.message || 'メンバーの取得に失敗しました';
            } else if (typeof e === 'object' && e !== null) {
              const errorObj = e as Record<string, unknown>;
              errorMessage =
                (errorObj.message as string) ||
                (errorObj.code as string) ||
                JSON.stringify(e) ||
                'メンバーの取得に失敗しました';
            } else {
              errorMessage = String(e);
            }

            // モックデータ環境の場合
            const isPlaceholderError =
              errorMessage.includes('Supabase未接続') ||
              errorMessage.includes('placeholder') ||
              errorMessage.includes('fetch failed') ||
              errorMessage === '{}' ||
              !errorMessage;

            if (isPlaceholderError && members && memberId) {
              const foundMember = members.find((m) => m.id === memberId);
              if (foundMember) {
                console.info('📝 モックデータ環境: メンバー一覧からメンバーを取得しました');
                setMember(foundMember);
                setFormData({
                  name: foundMember.name,
                  avatar: foundMember.avatar || null,
                });
                setError(null);
                return;
              }
            }

            console.error('Error fetching member:', {
              error: e,
              errorMessage,
              memberId,
              hasMembers: !!members
            });
            setError(errorMessage);
          } finally {
            setLoading(false);
          }
        };

        fetchMember();
      } else {
        // 新規作成モード：初期値を設定
        setMember(null);
        setLoading(false);

        setFormData({
          name: '',
          avatar: null,
        });
      }
    }
  }, [isOpen, memberId, members]);

  // モーダルが開いた時に名前フィールドにフォーカス
  useEffect(() => {
    if (isOpen && !loading) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, loading]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // トースト自動非表示
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // バリデーション
  const validate = (): boolean => {
    if (!formData.name.trim()) {
      setError('名前は必須です');
      return false;
    }

    if (formData.name.length > 50) {
      setError('名前は50文字以内で入力してください');
      return false;
    }

    return true;
  };

  // 保存処理
  const handleSave = async () => {
    setError(null);

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      if (memberId) {
        // 更新
        await updateMember(memberId, {
          name: formData.name.trim(),
          avatar: formData.avatar?.trim() || null,
        });

        setToast({ message: 'メンバーを更新しました', type: 'success' });
      } else {
        // 新規作成
        await createMember(
          formData.name.trim(),
          formData.avatar?.trim() || undefined
        );

        setToast({ message: 'メンバーを作成しました', type: 'success' });
      }

      // 親コンポーネントに通知
      onMemberUpdated?.();

      // モーダルを閉じる（少し遅延させてトーストを見せる）
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (e) {
      let errorMessage = '保存に失敗しました';

      if (e instanceof Error) {
        errorMessage = e.message;
      }

      console.error('Error saving member:', e);
      setError(errorMessage);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* モーダル本体 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* ヘッダー */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-semibold text-gray-900">
              {memberId ? 'メンバー編集' : '新規メンバー追加'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={saving}
            >
              <X size={24} />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">読み込み中...</div>
              </div>
            ) : error && !formData.name ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            ) : (
              <div className="space-y-6">
                {/* エラー表示 */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                )}

                {/* アバタープレビュー */}
                <div className="flex items-center justify-center">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="アバタープレビュー"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                      onError={(e) => {
                        // 画像読み込み失敗時にデフォルトアイコンに切り替え
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center border-4 border-gray-200">
                      <User size={48} />
                    </div>
                  )}
                </div>

                {/* 名前（必須） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="山田太郎"
                    maxLength={50}
                    disabled={saving}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.name.length}/50文字
                  </p>
                </div>

                {/* アバターURL（任意） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    アバターURL（任意）
                  </label>
                  <input
                    type="text"
                    value={formData.avatar || ''}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/avatar.jpg"
                    disabled={saving}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    画像URLを入力するとアバターとして表示されます
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving || loading || (!!error && !formData.name)}
            >
              {saving ? '保存中...' : memberId ? '更新' : '作成'}
            </button>
          </div>
        </div>
      </div>

      {/* トースト通知 */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[60]">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberModal;
