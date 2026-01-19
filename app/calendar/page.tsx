'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTasks } from '@/lib/tasks';
import { getMembers } from '@/lib/members';
import type { Task, Member } from '@/types';
import { Status, MemberRole, AssigneeRole } from '@/types';

type ViewMode = 'day' | 'week' | 'month';

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ビューモード（日/週/月）
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  
  // 現在表示している日付（基準日）
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // モックデータ定義（開発用）
  const getMockMembers = (): Member[] => [
    {
      id: 'mock-member-1',
      name: '山田太郎',
      avatar: null,
      role: MemberRole.Admin,
      created_at: '2026-01-15T00:00:00Z',
    },
    {
      id: 'mock-member-2',
      name: '佐藤花子',
      avatar: null,
      role: MemberRole.Member,
      created_at: '2026-01-16T00:00:00Z',
    },
    {
      id: 'mock-member-3',
      name: '鈴木一郎',
      avatar: null,
      role: MemberRole.Member,
      created_at: '2026-01-17T00:00:00Z',
    },
  ];

  const getMockTasks = (): Task[] => [
    {
      id: 'mock-task-1',
      title: 'サンプルタスク1',
      description: 'これはサンプルタスクです',
      status: Status.InProgress,
      progress: 50,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      score: 5,
      is_recurring: false,
      recurring_type: null,
      link: null,
      communication_link: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assignments: [
        {
          task_id: 'mock-task-1',
          member_id: 'mock-member-1',
          role: AssigneeRole.Main,
          workload_ratio: 1.0,
        },
      ],
    },
    {
      id: 'mock-task-2',
      title: 'サンプルタスク2',
      description: 'これは別のサンプルタスクです',
      status: Status.NotStarted,
      progress: 0,
      start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      score: 3,
      is_recurring: false,
      recurring_type: null,
      link: null,
      communication_link: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assignments: [
        {
          task_id: 'mock-task-2',
          member_id: 'mock-member-2',
          role: AssigneeRole.Main,
          workload_ratio: 1.0,
        },
      ],
    },
  ];

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // タスクとメンバーを並列取得
        const [tasksData, membersData] = await Promise.all([
          getTasks(),
          getMembers(),
        ]);

        setTasks(tasksData);
        setMembers(membersData);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'データの取得に失敗しました';
        console.error('Error fetching data:', e);
        
        // モックデータ環境の場合、モックデータを使用
        const isPlaceholderError = 
          errorMessage.includes('Supabase未接続') ||
          errorMessage.includes('placeholder') ||
          errorMessage.includes('fetch failed') ||
          errorMessage === '{}' ||
          !errorMessage;

        if (isPlaceholderError) {
          console.info('📝 モックデータ環境: モックデータを使用します');
          setTasks(getMockTasks());
          setMembers(getMockMembers());
          setError(null);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 表示する日付範囲の計算
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (viewMode) {
      case 'day':
        // 日次: 当日のみ
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end, dates: [new Date(start)] };
      
      case 'week':
        // 週次: 月曜日から日曜日まで
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // 月曜日に調整
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        
        const weekDates: Date[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          weekDates.push(date);
        }
        return { start, end, dates: weekDates };
      
      case 'month':
        // 月次: 月の1日から最終日まで
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        
        end.setMonth(start.getMonth() + 1, 0); // 翌月の0日 = 今月の最終日
        end.setHours(23, 59, 59, 999);
        
        const monthDates: Date[] = [];
        const current = new Date(start);
        while (current <= end) {
          monthDates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        return { start, end, dates: monthDates };
      
      default:
        return { start, end, dates: [start] };
    }
  }, [currentDate, viewMode]);

  // メンバーごとのタスクをグループ化
  const tasksByMember = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    // まず全メンバーを初期化
    members.forEach(member => {
      grouped[member.id] = [];
    });
    
    // タスクを担当者ごとに分類
    tasks.forEach(task => {
      if (task.assignments && task.assignments.length > 0) {
        task.assignments.forEach(assignment => {
          if (assignment.member_id && grouped[assignment.member_id]) {
            grouped[assignment.member_id].push(task);
          }
        });
      }
    });
    
    return grouped;
  }, [tasks, members]);

  // 日付フォーマット（YYYY-MM-DD）
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // 日付が範囲内かチェック
  const isDateInRange = (taskStart: string, taskEnd: string, rangeStart: Date, rangeEnd: Date): boolean => {
    const start = new Date(taskStart);
    const end = new Date(taskEnd);
    
    // タスクの開始日が範囲内、またはタスクの終了日が範囲内、またはタスクが範囲を包含
    return (
      (start >= rangeStart && start <= rangeEnd) ||
      (end >= rangeStart && end <= rangeEnd) ||
      (start <= rangeStart && end >= rangeEnd)
    );
  };

  // タスクの表示位置と幅を計算（日次ビュー用）
  const calculateTaskPosition = (task: Task, date: Date): { left: number; width: number } | null => {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    const viewDate = new Date(date);
    viewDate.setHours(0, 0, 0, 0);
    
    // タスクがこの日に含まれるかチェック
    if (taskStart > viewDate || taskEnd < viewDate) {
      return null;
    }
    
    // 日次ビューでは1日分の幅
    return { left: 0, width: 100 };
  };

  // 進捗率に基づく色を取得
  const getProgressColor = (progress: number): string => {
    if (progress === 0) return 'bg-gray-300'; // 未着手
    if (progress < 50) return 'bg-yellow-400'; // 進行中（低）
    if (progress < 100) return 'bg-blue-400'; // 進行中（高）
    return 'bg-green-400'; // 完了
  };

  // 今日の日付かチェック
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 日付移動
  const moveDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  // 今日に戻る
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 戻るボタン */}
        <div className="mb-4 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            ホームへ戻る
          </Link>
          <Link
            href="/tasks"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900 transition-colors"
          >
            タスク一覧へ
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">タスクカレンダー</h1>
          <p className="text-gray-600">
            タスクの期間をガントチャート形式で確認できます。今日の日付は赤い線で示されています。
          </p>
        </div>

        {/* ビュー切り替えと日付ナビゲーション */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
          {/* ビューモード切り替え */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              日
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              週
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              月
            </button>
          </div>

          {/* 日付ナビゲーション */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => moveDate('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center min-w-[200px]">
              <div className="text-lg font-semibold text-gray-900">
                {viewMode === 'day' && currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                {viewMode === 'week' && `${dateRange.start.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} - ${dateRange.end.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}`}
                {viewMode === 'month' && currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
              </div>
            </div>
            
            <button
              onClick={() => moveDate('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              今日
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* カレンダーグリッド */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <div className="min-w-full">
            {/* ヘッダー行（日付） */}
            <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="w-48 border-r border-gray-200 p-3 font-medium text-gray-700 bg-gray-50">
                メンバー名
              </div>
              <div className="flex-1 flex">
                {dateRange.dates.map((date, index) => (
                  <div
                    key={index}
                    className={`flex-1 min-w-[120px] p-3 text-center border-r border-gray-200 relative ${
                      isToday(date) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}
                    </div>
                    {/* 今日の日付を示す赤い線 */}
                    {isToday(date) && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* メンバー行 */}
            {members.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                メンバーが登録されていません
              </div>
            ) : (
              members.map((member) => {
                const memberTasks = tasksByMember[member.id] || [];
                const visibleTasks = memberTasks.filter(task =>
                  isDateInRange(task.start_date, task.end_date, dateRange.start, dateRange.end)
                );

                return (
                  <div key={member.id} className="flex border-b border-gray-200 hover:bg-gray-50">
                    {/* メンバー名列 */}
                    <div className="w-48 border-r border-gray-200 p-3 bg-gray-50">
                      <div className="font-medium text-gray-900">{member.name}</div>
                    </div>

                    {/* 日付列（タスク表示エリア） */}
                    <div className="flex-1 flex relative" style={{ minHeight: '60px' }}>
                      {/* 日次ビュー: 各日にタスクを表示 */}
                      {viewMode === 'day' && dateRange.dates.map((date, dateIndex) => {
                        const dayTasks = visibleTasks.filter(task => {
                          const taskStart = new Date(task.start_date);
                          const taskEnd = new Date(task.end_date);
                          const viewDate = new Date(date);
                          viewDate.setHours(0, 0, 0, 0);
                          return taskStart <= viewDate && taskEnd >= viewDate;
                        });

                        return (
                          <div
                            key={dateIndex}
                            className={`flex-1 min-w-[120px] p-1 border-r border-gray-200 relative ${
                              isToday(date) ? 'bg-blue-50' : ''
                            }`}
                          >
                            {dayTasks.map((task) => (
                              <div
                                key={task.id}
                                className={`mb-1 p-2 rounded text-xs ${getProgressColor(task.progress)} text-white cursor-pointer hover:opacity-80 transition-opacity`}
                                title={`${task.title} (進捗: ${task.progress}%)`}
                              >
                                <div className="font-medium truncate">{task.title}</div>
                                <div className="text-xs opacity-90 mt-1">{task.progress}%</div>
                              </div>
                            ))}
                          </div>
                        );
                      })}

                      {/* 週次・月次ビュー: タスクを横断的に表示 */}
                      {(viewMode === 'week' || viewMode === 'month') && (
                        <div className="absolute inset-0 flex">
                          {dateRange.dates.map((date, dateIndex) => (
                            <div
                              key={dateIndex}
                              className={`flex-1 min-w-[120px] border-r border-gray-200 relative ${
                                isToday(date) ? 'bg-blue-50' : ''
                              }`}
                            />
                          ))}
                          
                          {/* タスクバー（横断表示） */}
                          {visibleTasks.map((task) => {
                            const taskStart = new Date(task.start_date);
                            const taskEnd = new Date(task.end_date);
                            
                            // タスクが表示範囲内にあるかチェック
                            if (taskEnd < dateRange.start || taskStart > dateRange.end) {
                              return null;
                            }
                            
                            // タスクの開始位置と終了位置を計算
                            const actualStart = taskStart > dateRange.start ? taskStart : dateRange.start;
                            const actualEnd = taskEnd < dateRange.end ? taskEnd : dateRange.end;
                            
                            // 開始位置と終了位置のインデックスを計算
                            const startIndex = dateRange.dates.findIndex(date => {
                              const dateStr = formatDate(date);
                              return dateStr >= formatDate(actualStart);
                            });
                            const endIndex = dateRange.dates.findIndex(date => {
                              const dateStr = formatDate(date);
                              return dateStr >= formatDate(actualEnd);
                            });
                            
                            if (startIndex === -1 || endIndex === -1) {
                              return null;
                            }
                            
                            // 左位置と幅を計算（%）
                            const totalDays = dateRange.dates.length;
                            const leftPercent = (startIndex / totalDays) * 100;
                            const widthPercent = ((endIndex - startIndex + 1) / totalDays) * 100;
                            
                            return (
                              <div
                                key={task.id}
                                className={`absolute ${getProgressColor(task.progress)} cursor-pointer hover:opacity-80 transition-opacity rounded`}
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                  height: '24px',
                                  top: '4px',
                                  marginLeft: '2px',
                                  marginRight: '2px',
                                }}
                                title={`${task.title} (進捗: ${task.progress}%)`}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
