import { supabase } from './supabase';
import type { Subtask } from '@/types';

// プレースホルダー値かどうかをチェック
const isPlaceholderUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || 
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';

// サブタスク一覧取得（タスクID指定）
export async function getSubtasks(taskId: string): Promise<Subtask[]> {
  // プレースホルダー値の場合は即座に空配列を返す（Supabase接続を試みない）
  if (isPlaceholderUrl) {
    console.info('📝 プレースホルダー値検出: getSubtasksはモックデータを返しません');
    return [];
  }

  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .order('order_index', { ascending: true });

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
      console.warn('⚠️ Supabase未接続: getSubtasksはモックデータを返しません', {
        message: errorMessage,
        code: errorCode,
        details: errorDetails
      });
      return [];
    }
    
    // その他のエラーは詳細をログに記録してからスロー
    console.error('Error fetching subtasks:', {
      error,
      message: errorMessage,
      code: errorCode,
      details: errorDetails,
      hint: errorHint,
      errorString
    });
    throw error;
  }

  return (data ?? []) as Subtask[];
}

// サブタスク作成
export async function createSubtask(
  taskId: string,
  text: string,
  orderIndex?: number
): Promise<Subtask> {
  if (isPlaceholderUrl) {
    console.info('📝 プレースホルダー値検出: createSubtaskはモックデータを返しません');
    throw new Error('Supabase未接続: モックデータ環境ではサブタスクを作成できません');
  }

  const { data, error } = await supabase
    .from('subtasks')
    .insert({
      task_id: taskId,
      text,
      completed: false,
      order_index: orderIndex ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating subtask:', error);
    throw error;
  }

  return data as Subtask;
}

// サブタスク更新（完了状態切り替え含む）
export async function updateSubtask(
  id: string,
  updates: { text?: string; completed?: boolean; order_index?: number }
): Promise<Subtask> {
  if (isPlaceholderUrl) {
    console.info('📝 プレースホルダー値検出: updateSubtaskはモックデータを返しません');
    throw new Error('Supabase未接続: モックデータ環境ではサブタスクを更新できません');
  }

  const { data, error } = await supabase
    .from('subtasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating subtask:', error);
    throw error;
  }

  return data as Subtask;
}

// サブタスク完了状態トグル
export async function toggleSubtaskComplete(id: string, completed: boolean): Promise<Subtask> {
  return updateSubtask(id, { completed });
}

// サブタスク削除
export async function deleteSubtask(id: string): Promise<void> {
  if (isPlaceholderUrl) {
    console.info('📝 プレースホルダー値検出: deleteSubtaskはモックデータを返しません');
    throw new Error('Supabase未接続: モックデータ環境ではサブタスクを削除できません');
  }

  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subtask:', error);
    throw error;
  }
}

// タスクの進捗率を再計算
export async function recalculateTaskProgress(taskId: string): Promise<number> {
  if (isPlaceholderUrl) {
    console.info('📝 プレースホルダー値検出: recalculateTaskProgressはモックデータを返しません');
    return 0;
  }

  const { data: subtasks, error } = await supabase
    .from('subtasks')
    .select('completed')
    .eq('task_id', taskId);

  if (error) {
    // エラーオブジェクトの詳細を取得
    const errorMessage = error.message || '';
    const errorCode = error.code || '';
    const normalizedError = errorMessage || errorCode || JSON.stringify(error);

    // Supabase未接続時は0を返す
    if (
      normalizedError.includes('fetch failed') || 
      normalizedError.includes('ENOTFOUND') ||
      normalizedError.includes('placeholder') ||
      normalizedError === '{}' ||
      !normalizedError
    ) {
      console.warn('⚠️ Supabase未接続: recalculateTaskProgressは0を返します');
      return 0;
    }

    console.error('Error fetching subtasks for progress:', error);
    throw error;
  }

  if (!subtasks || subtasks.length === 0) {
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedCount = subtasks.filter((s: any) => s.completed).length;
  const progress = Math.round((completedCount / subtasks.length) * 100);

  // タスクの進捗率を更新
  const { error: updateError } = await supabase
    .from('tasks')
    .update({ progress })
    .eq('id', taskId);

  if (updateError) {
    console.error('Error updating task progress:', updateError);
    throw updateError;
  }

  return progress;
}
