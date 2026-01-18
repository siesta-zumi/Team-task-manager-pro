import { supabase } from './supabase';
import type { Subtask } from '@/types';

// サブタスク一覧取得（タスクID指定）
export async function getSubtasks(taskId: string): Promise<Subtask[]> {
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching subtasks:', error);
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
  const { data: subtasks, error } = await supabase
    .from('subtasks')
    .select('completed')
    .eq('task_id', taskId);

  if (error) {
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
