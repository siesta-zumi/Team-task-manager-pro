// ステータスEnum
export enum Status {
  NotStarted = '未着手',
  InProgress = '進行中',
  Completed = '完了',
  Approved = '承認済み',
}

// 繰り返しタイプEnum
export enum RecurringType {
  None = 'なし',
  Monthly = '毎月',
}

// 担当者ロール
export enum AssigneeRole {
  Main = 'main',
  Follower = 'follower',
}

// メンバー
export interface Member {
  id: string;
  name: string;
  avatar: string | null;
  created_at?: string;
}

// サブタスク
export interface Subtask {
  id: string;
  task_id: string;
  text: string;
  completed: boolean;
  order_index: number;
}

// タスク担当者
export interface TaskAssignment {
  task_id: string;
  member_id: string;
  role: AssigneeRole;
  workload_ratio: number;
  member?: Member;
}

// タスク
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  score: number;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurring_type: RecurringType | null;
  link: string | null;
  communication_link: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
  subtasks?: Subtask[];
  assignments?: TaskAssignment[];
}

// タスク作成用の型
export interface TaskCreate {
  title: string;
  description?: string;
  status?: Status;
  score?: number;
  start_date: string;
  end_date: string;
  is_recurring?: boolean;
  recurring_type?: RecurringType;
  link?: string;
  communication_link?: string;
}

// タスク更新用の型
export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: Status;
  score?: number;
  start_date?: string;
  end_date?: string;
  is_recurring?: boolean;
  recurring_type?: RecurringType;
  link?: string;
  communication_link?: string;
  progress?: number;
}

// ビュータイプ
export type View = 'team' | 'my-tasks' | 'dashboard' | 'calendar' | 'kanban';

// ソート設定
export type SortConfig = {
  key: keyof Task;
  direction: 'ascending' | 'descending';
};

// フィルター設定
export interface FilterConfig {
  status: Status | 'all';
  assigneeId: string | 'all';
  searchQuery: string;
}
