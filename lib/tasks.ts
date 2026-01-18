import { supabase } from './supabase';
import { AssigneeRole } from '@/types';
import type { Task, TaskCreate, TaskUpdate, Status, RecurringType } from '@/types';

// プレースホルダー値かどうかをチェック
const isPlaceholderUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || 
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';

// タスク一覧取得（担当者・サブタスク含む）
export async function getTasks(): Promise<Task[]> {
  // プレースホルダー値の場合は即座に空配列を返す（Supabase接続を試みない）
  if (isPlaceholderUrl) {
    console.info('📝 プレースホルダー値検出: モックデータを使用します');
    return [];
  }

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      *,
      subtasks (
        id,
        task_id,
        text,
        completed,
        order_index
      ),
      task_assignments (
        task_id,
        member_id,
        role,
        workload_ratio,
        members (
          id,
          name,
          avatar
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    // エラーオブジェクトの詳細を取得
    const errorMessage = error.message || '';
    const errorCode = error.code || '';
    const errorDetails = error.details || '';
    const errorHint = error.hint || '';
    
    // エラーオブジェクト全体を文字列化（デバッグ用）
    let errorString = '';
    try {
      errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
    } catch {
      errorString = String(error);
    }

    // エラーメッセージを正規化（複数のソースから取得）
    const normalizedError = errorMessage || errorCode || errorDetails || errorHint || errorString;

    // Supabase未接続時は空配列を返す
    if (
      normalizedError.includes('fetch failed') || 
      normalizedError.includes('ENOTFOUND') ||
      normalizedError.includes('placeholder') ||
      normalizedError === '{}' ||
      !normalizedError
    ) {
      console.warn('⚠️ Supabase未接続: モックデータで動作中', {
        message: errorMessage,
        code: errorCode,
        details: errorDetails
      });
      return [];
    }
    
    // その他のエラーは詳細をログに記録してからスロー
    console.error('Error fetching tasks:', {
      message: errorMessage,
      code: errorCode,
      details: errorDetails,
      hint: errorHint,
      fullError: errorString
    });
    throw error;
  }

  return (tasks ?? []).map(transformTask);
}

// 単一タスク取得
export async function getTask(id: string): Promise<Task> {
  // プレースホルダー値の場合はエラーをスロー（モックデータは呼び出し側で処理）
  if (isPlaceholderUrl) {
    console.info('📝 プレースホルダー値検出: getTaskはモックデータを返しません');
    throw new Error('Supabase未接続: モックデータ環境ではタスク詳細を取得できません');
  }

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      subtasks (
        id,
        task_id,
        text,
        completed,
        order_index
      ),
      task_assignments (
        task_id,
        member_id,
        role,
        workload_ratio,
        members (
          id,
          name,
          avatar
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    // エラーオブジェクトの詳細を取得
    const errorMessage = error.message || '';
    const errorCode = error.code || '';
    const errorDetails = error.details || '';
    const errorHint = error.hint || '';
    
    // エラーオブジェクト全体を文字列化（デバッグ用）
    let errorString = '';
    try {
      errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
    } catch {
      errorString = String(error);
    }

    // エラーメッセージを正規化（複数のソースから取得）
    const normalizedError = errorMessage || errorCode || errorDetails || errorHint || errorString;

    // Supabase未接続時は適切なエラーメッセージをスロー
    if (
      normalizedError.includes('fetch failed') || 
      normalizedError.includes('ENOTFOUND') ||
      normalizedError.includes('placeholder') ||
      normalizedError === '{}' ||
      !normalizedError
    ) {
      console.warn('⚠️ Supabase未接続: タスク詳細を取得できません', {
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
        taskId: id
      });
      throw new Error('Supabase未接続: タスク詳細を取得できません');
    }
    
    // その他のエラーは詳細をログに記録してからスロー
    console.error('Error fetching task:', {
      message: errorMessage,
      code: errorCode,
      details: errorDetails,
      hint: errorHint,
      fullError: errorString,
      taskId: id
    });
    throw error;
  }

  return transformTask(data);
}

// タスク作成
export async function createTask(task: TaskCreate): Promise<Task> {
  // プレースホルダー値の場合はエラーをスロー（モックデータは呼び出し側で処理）
  if (isPlaceholderUrl) {
    console.info('📝 プレースホルダー値検出: createTaskはモックデータを返しません');
    throw new Error('Supabase未接続: モックデータ環境ではタスクを作成できません');
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: task.title,
      description: task.description ?? null,
      status: task.status ?? '未着手',
      score: task.score ?? 1,
      start_date: task.start_date,
      end_date: task.end_date,
      is_recurring: task.is_recurring ?? false,
      recurring_type: task.recurring_type ?? null,
      link: task.link ?? null,
      communication_link: task.communication_link ?? null,
    })
    .select(`
      *,
      subtasks (
        id,
        task_id,
        text,
        completed,
        order_index
      ),
      task_assignments (
        task_id,
        member_id,
        role,
        workload_ratio,
        members (
          id,
          name,
          avatar
        )
      )
    `)
    .single();

  if (error) {
    // エラーオブジェクトの詳細を取得
    const errorMessage = error.message || '';
    const errorCode = error.code || '';
    const errorDetails = error.details || '';
    const errorHint = error.hint || '';
    
    // エラーオブジェクト全体を文字列化（デバッグ用）
    let errorString = '';
    try {
      errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
    } catch {
      errorString = String(error);
    }

    // エラーメッセージを正規化（複数のソースから取得）
    const normalizedError = errorMessage || errorCode || errorDetails || errorHint || errorString;

    // Supabase未接続時は適切なエラーメッセージをスロー
    if (
      normalizedError.includes('fetch failed') || 
      normalizedError.includes('ENOTFOUND') ||
      normalizedError.includes('placeholder') ||
      normalizedError === '{}' ||
      !normalizedError
    ) {
      console.warn('⚠️ Supabase未接続: タスクを作成できません', {
        message: errorMessage,
        code: errorCode,
        details: errorDetails
      });
      throw new Error('Supabase未接続: タスクを作成できません');
    }
    
    // その他のエラーは詳細をログに記録してからスロー
    console.error('Error creating task:', {
      message: errorMessage,
      code: errorCode,
      details: errorDetails,
      hint: errorHint,
      fullError: errorString
    });
    throw error;
  }

  return transformTask(data);
}

// タスク更新
export async function updateTask(id: string, updates: TaskUpdate) {
  const updateData: Record<string, unknown> = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.score !== undefined) updateData.score = updates.score;
  if (updates.start_date !== undefined) updateData.start_date = updates.start_date;
  if (updates.end_date !== undefined) updateData.end_date = updates.end_date;
  if (updates.is_recurring !== undefined) updateData.is_recurring = updates.is_recurring;
  if (updates.recurring_type !== undefined) updateData.recurring_type = updates.recurring_type;
  if (updates.link !== undefined) updateData.link = updates.link;
  if (updates.communication_link !== undefined) updateData.communication_link = updates.communication_link;
  if (updates.progress !== undefined) updateData.progress = updates.progress;

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return data;
}

// タスク削除
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

// 担当者追加
export async function addTaskAssignment(
  taskId: string,
  memberId: string,
  role: AssigneeRole = AssigneeRole.Main
): Promise<void> {
  const workloadRatio = role === AssigneeRole.Main ? 1.0 : 0.3;

  const { error } = await supabase
    .from('task_assignments')
    .insert({
      task_id: taskId,
      member_id: memberId,
      role,
      workload_ratio: workloadRatio,
    });

  if (error) {
    console.error('Error adding assignment:', error);
    throw error;
  }
}

// 担当者削除
export async function removeTaskAssignment(taskId: string, memberId: string): Promise<void> {
  const { error } = await supabase
    .from('task_assignments')
    .delete()
    .eq('task_id', taskId)
    .eq('member_id', memberId);

  if (error) {
    console.error('Error removing assignment:', error);
    throw error;
  }
}

// DBレスポンスをアプリの型に変換
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformTask(data: any): Task {
  const assignments = (data.task_assignments ?? []) as Array<{
    task_id: string;
    member_id: string;
    role: string;
    workload_ratio: number;
    members?: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }>;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status as Status,
    score: data.score,
    start_date: data.start_date,
    end_date: data.end_date,
    is_recurring: data.is_recurring,
    recurring_type: data.recurring_type as RecurringType | null,
    link: data.link,
    communication_link: data.communication_link,
    progress: data.progress,
    created_at: data.created_at,
    updated_at: data.updated_at,
    subtasks: data.subtasks ?? [],
    assignments: assignments.map((a) => ({
      task_id: a.task_id,
      member_id: a.member_id,
      role: a.role as AssigneeRole,
      workload_ratio: a.workload_ratio,
      member: a.members ?? undefined,
    })),
  };
}
