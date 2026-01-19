'use client';

import React, { useEffect, useState } from 'react';
import { getTask, updateTask, createTask } from '@/lib/tasks';
import { getSubtasks, createSubtask, updateSubtask, deleteSubtask, recalculateTaskProgress } from '@/lib/subtasks';
import type { Task, TaskUpdate, TaskCreate, Subtask } from '@/types';
import { Status, RecurringType } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  onTaskUpdated?: () => void;
  tasks?: Task[]; // モックデータ環境用：タスク一覧を渡すことで、エラー時にタスク一覧から該当タスクを見つけられる
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskId, onTaskUpdated, tasks }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // チェックリスト（サブタスク）の状態
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [subtaskLoading, setSubtaskLoading] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState<TaskUpdate>({
    title: '',
    description: '',
    status: Status.NotStarted,
    score: 1,
    start_date: '',
    end_date: '',
    is_recurring: false,
    recurring_type: RecurringType.None,
    link: '',
    communication_link: '',
  });

  // タスクデータの取得または新規作成モードの初期化
  useEffect(() => {
    if (isOpen) {
      setError(null);
      
      if (taskId) {
        // 既存タスクの編集モード
        setLoading(true);
        
        const fetchTask = async () => {
          try {
            const taskData = await getTask(taskId);
            setTask(taskData);
            
            // フォームに初期値を設定
            setFormData({
              title: taskData.title,
              description: taskData.description || '',
              status: taskData.status,
              score: taskData.score,
              start_date: taskData.start_date,
              end_date: taskData.end_date,
              is_recurring: taskData.is_recurring,
              recurring_type: taskData.recurring_type || RecurringType.None,
              link: taskData.link || '',
              communication_link: taskData.communication_link || '',
            });
          } catch (e) {
            // エラーオブジェクトの詳細を取得
            let errorMessage = 'タスクの取得に失敗しました';
            
            if (e instanceof Error) {
              errorMessage = e.message || 'タスクの取得に失敗しました';
            } else if (typeof e === 'object' && e !== null) {
              const errorObj = e as Record<string, unknown>;
              errorMessage = 
                (errorObj.message as string) || 
                (errorObj.code as string) || 
                JSON.stringify(e) ||
                'タスクの取得に失敗しました';
            } else {
              errorMessage = String(e);
            }

            // モックデータ環境の場合、タスク一覧から該当タスクを見つける
            const isPlaceholderError = 
              errorMessage.includes('Supabase未接続') ||
              errorMessage.includes('placeholder') ||
              errorMessage.includes('fetch failed') ||
              errorMessage === '{}' ||
              !errorMessage;

            if (isPlaceholderError && tasks && taskId) {
              // タスク一覧から該当するタスクを見つける
              const foundTask = tasks.find((t) => t.id === taskId);
              if (foundTask) {
                console.info('📝 モックデータ環境: タスク一覧からタスクを取得しました');
                setTask(foundTask);
                setFormData({
                  title: foundTask.title,
                  description: foundTask.description || '',
                  status: foundTask.status,
                  score: foundTask.score,
                  start_date: foundTask.start_date,
                  end_date: foundTask.end_date,
                  is_recurring: foundTask.is_recurring,
                  recurring_type: foundTask.recurring_type || RecurringType.None,
                  link: foundTask.link || '',
                  communication_link: foundTask.communication_link || '',
                });
                // モックデータ環境では、タスクに含まれるsubtasksを使用
                setSubtasks(foundTask.subtasks || []);
                setError(null);
                return;
              }
            }

            console.error('Error fetching task:', {
              error: e,
              errorMessage,
              taskId,
              hasTasks: !!tasks
            });
            setError(errorMessage);
          } finally {
            setLoading(false);
          }
        };

        fetchTask();
      } else {
        // 新規作成モード：初期値を設定
        setTask(null);
        setLoading(false);
        setSubtasks([]);
        
        const today = new Date();
        const oneWeekLater = new Date();
        oneWeekLater.setDate(today.getDate() + 7);
        
        setFormData({
          title: '',
          description: '',
          status: Status.NotStarted,
          score: 1,
          start_date: today.toISOString().split('T')[0],
          end_date: oneWeekLater.toISOString().split('T')[0],
          is_recurring: false,
          recurring_type: RecurringType.None,
          link: '',
          communication_link: '',
        });
      }
    }
  }, [isOpen, taskId, tasks]);

  // サブタスクの取得（既存タスクの場合）
  useEffect(() => {
    if (isOpen && taskId && task) {
      const fetchSubtasks = async () => {
        // タスクに既にsubtasksが含まれている場合はそれを使用
        if (task.subtasks && task.subtasks.length > 0) {
          setSubtasks(task.subtasks);
          return;
        }

        // モックデータ環境の場合はスキップ
        const isPlaceholderUrl = 
          process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || 
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';
        
        if (isPlaceholderUrl) {
          setSubtasks([]);
          return;
        }

        try {
          const subtasksData = await getSubtasks(taskId);
          setSubtasks(subtasksData);
        } catch (e) {
          console.error('Error fetching subtasks:', e);
          // エラー時は空配列を設定（既存のsubtasksがあればそれを使用）
          setSubtasks(task.subtasks || []);
        }
      };

      fetchSubtasks();
    } else if (!taskId) {
      // 新規作成モードでは空配列
      setSubtasks([]);
    }
  }, [isOpen, taskId, task]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // フォーム入力のハンドラ
  const handleChange = (field: keyof TaskUpdate, value: string | number | boolean | Status | RecurringType) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 日付フォーマット（YYYY-MM-DDに変換）
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // 保存処理（新規作成・更新の両方に対応）
  const handleSave = async () => {
    // バリデーション
    if (!formData.title || !formData.title.trim()) {
      setToast({ message: 'タスク名は必須です', type: 'error' });
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setToast({ message: '開始日と終了日は必須です', type: 'error' });
      return;
    }

    if (formData.start_date > formData.end_date) {
      setToast({ message: '終了日は開始日以降である必要があります', type: 'error' });
      return;
    }

    if (formData.score !== undefined && (formData.score < 1 || formData.score > 10)) {
      setToast({ message: '負荷スコアは1-10の範囲で入力してください', type: 'error' });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (taskId) {
        // 既存タスクの更新
        const updates: TaskUpdate = {
          title: formData.title.trim(),
          description: formData.description || null,
          status: formData.status,
          score: formData.score,
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_recurring: formData.is_recurring,
          recurring_type: formData.is_recurring ? formData.recurring_type : RecurringType.None,
          link: formData.link || null,
          communication_link: formData.communication_link || null,
        };

        await updateTask(taskId, updates);
        setToast({ message: 'タスクを更新しました', type: 'success' });
      } else {
        // 新規タスクの作成
        const newTask: TaskCreate = {
          title: formData.title.trim(),
          description: formData.description || undefined,
          status: formData.status,
          score: formData.score,
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_recurring: formData.is_recurring,
          recurring_type: formData.is_recurring ? formData.recurring_type : RecurringType.None,
          link: formData.link || undefined,
          communication_link: formData.communication_link || undefined,
        };

        await createTask(newTask);
        setToast({ message: 'タスクを作成しました', type: 'success' });
      }
      
      // 親コンポーネントに更新を通知
      if (onTaskUpdated) {
        onTaskUpdated();
      }

      // 少し待ってからモーダルを閉じる
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : (taskId ? 'タスクの更新に失敗しました' : 'タスクの作成に失敗しました');
      console.error(taskId ? 'Error updating task:' : 'Error creating task:', e);
      setError(errorMessage);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // トースト通知の自動非表示
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // サブタスクの追加
  const handleAddSubtask = async () => {
    if (!newSubtaskText.trim() || !taskId) return;

    setSubtaskLoading(true);
    try {
      const isPlaceholderUrl = 
        process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || 
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';

      if (isPlaceholderUrl) {
        // モックデータ環境：ローカルstateに追加
        const newSubtask: Subtask = {
          id: `mock-${Date.now()}`,
          task_id: taskId,
          text: newSubtaskText.trim(),
          completed: false,
          order_index: subtasks.length,
        };
        setSubtasks([...subtasks, newSubtask]);
        setNewSubtaskText('');
        setToast({ message: 'サブタスクを追加しました（モックデータ）', type: 'success' });
        return;
      }

      const newSubtask = await createSubtask(taskId, newSubtaskText.trim(), subtasks.length);
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskText('');
      setToast({ message: 'サブタスクを追加しました', type: 'success' });
      
      // 進捗率を再計算
      if (taskId) {
        await recalculateTaskProgress(taskId);
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      }
    } catch (e) {
      console.error('Error adding subtask:', e);
      setToast({ message: 'サブタスクの追加に失敗しました', type: 'error' });
    } finally {
      setSubtaskLoading(false);
    }
  };

  // サブタスクの削除
  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!taskId) return;

    setSubtaskLoading(true);
    try {
      const isPlaceholderUrl = 
        process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || 
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';

      if (isPlaceholderUrl) {
        // モックデータ環境：ローカルstateから削除
        setSubtasks(subtasks.filter((s) => s.id !== subtaskId));
        setToast({ message: 'サブタスクを削除しました（モックデータ）', type: 'success' });
        return;
      }

      await deleteSubtask(subtaskId);
      setSubtasks(subtasks.filter((s) => s.id !== subtaskId));
      setToast({ message: 'サブタスクを削除しました', type: 'success' });
      
      // 進捗率を再計算
      if (taskId) {
        await recalculateTaskProgress(taskId);
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      }
    } catch (e) {
      console.error('Error deleting subtask:', e);
      setToast({ message: 'サブタスクの削除に失敗しました', type: 'error' });
    } finally {
      setSubtaskLoading(false);
    }
  };

  // サブタスクのチェック状態をトグル
  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    if (!taskId) return;

    setSubtaskLoading(true);
    try {
      const isPlaceholderUrl = 
        process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || 
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';

      if (isPlaceholderUrl) {
        // モックデータ環境：ローカルstateを更新
        setSubtasks(subtasks.map((s) => 
          s.id === subtaskId ? { ...s, completed: !completed } : s
        ));
        setToast({ message: 'チェック状態を更新しました（モックデータ）', type: 'success' });
        return;
      }

      await updateSubtask(subtaskId, { completed: !completed });
      setSubtasks(subtasks.map((s) => 
        s.id === subtaskId ? { ...s, completed: !completed } : s
      ));
      setToast({ message: 'チェック状態を更新しました', type: 'success' });
      
      // 進捗率を再計算
      if (taskId) {
        await recalculateTaskProgress(taskId);
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      }
    } catch (e) {
      console.error('Error toggling subtask:', e);
      setToast({ message: 'チェック状態の更新に失敗しました', type: 'error' });
    } finally {
      setSubtaskLoading(false);
    }
  };

  // 進捗率の計算（ローカル）
  const calculateProgress = () => {
    if (subtasks.length === 0) return 0;
    const completedCount = subtasks.filter((s) => s.completed).length;
    return Math.round((completedCount / subtasks.length) * 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* オーバーレイ背景 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* モーダルウィンドウ */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {taskId ? 'タスク詳細' : '新規タスク'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* コンテンツ */}
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">読み込み中...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* タスク名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タスク名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="タスク名を入力"
                  />
                </div>

                {/* 説明 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="タスクの説明を入力"
                  />
                </div>

                {/* マニュアルリンク・フォルダリンク（2カラム） */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      マニュアルリンク
                    </label>
                    <input
                      type="text"
                      value={formData.link || ''}
                      onChange={(e) => handleChange('link', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/docs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      フォルダリンク
                    </label>
                    <input
                      type="text"
                      value={formData.communication_link || ''}
                      onChange={(e) => handleChange('communication_link', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="C:\folder\path または https://drive.google.com/..."
                    />
                  </div>
                </div>

                {/* ステータス・日付・スコア・繰り返し設定（2カラムグリッド） */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ステータス
                    </label>
                    <select
                      value={formData.status || Status.NotStarted}
                      onChange={(e) => handleChange('status', e.target.value as Status)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={Status.NotStarted}>未着手</option>
                      <option value={Status.InProgress}>進行中</option>
                      <option value={Status.Completed}>完了</option>
                      <option value={Status.Approved}>承認済み</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      負荷スコア（1-10）
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.score || 1}
                      onChange={(e) => handleChange('score', parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始日
                    </label>
                    <input
                      type="date"
                      value={formData.start_date ? formatDateForInput(formData.start_date) : ''}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終了日
                    </label>
                    <input
                      type="date"
                      value={formData.end_date ? formatDateForInput(formData.end_date) : ''}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    繰り返し設定
                  </label>
                  <select
                    value={formData.recurring_type || RecurringType.None}
                    onChange={(e) => {
                      const value = e.target.value as RecurringType;
                      handleChange('recurring_type', value);
                      handleChange('is_recurring', value !== RecurringType.None);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={RecurringType.None}>なし</option>
                    <option value={RecurringType.Monthly}>毎月</option>
                  </select>
                </div>

                {/* チェックリスト（サブタスク） */}
                {taskId && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        チェックリスト
                      </label>
                      <span className="text-xs text-gray-500">
                        進捗: {calculateProgress()}% ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
                      </span>
                    </div>
                    <div className="border border-gray-300 rounded-md p-3 space-y-2 max-h-64 overflow-y-auto">
                      {subtasks.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          チェックリストがありません
                        </p>
                      ) : (
                        subtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() => handleToggleSubtask(subtask.id, subtask.completed)}
                              disabled={subtaskLoading}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span
                              className={`flex-1 text-sm ${
                                subtask.completed
                                  ? 'line-through text-gray-500'
                                  : 'text-gray-900'
                              }`}
                            >
                              {subtask.text}
                            </span>
                            <button
                              onClick={() => handleDeleteSubtask(subtask.id)}
                              disabled={subtaskLoading}
                              className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                              title="削除"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={newSubtaskText}
                        onChange={(e) => setNewSubtaskText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !subtaskLoading) {
                            handleAddSubtask();
                          }
                        }}
                        placeholder="新しいチェック項目を入力"
                        disabled={subtaskLoading}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      />
                      <button
                        onClick={handleAddSubtask}
                        disabled={subtaskLoading || !newSubtaskText.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {subtaskLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          '追加'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div></div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {taskId ? '保存中...' : '作成中...'}
                  </span>
                ) : (
                  taskId ? '保存' : '作成'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* トースト通知 */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg transform transition-all ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskModal;
