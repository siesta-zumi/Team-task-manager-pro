import { supabase } from './supabase';
import type { Member } from '@/types';

// メンバー一覧取得
export async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    throw error;
  }

  return (data ?? []) as Member[];
}

// 単一メンバー取得
export async function getMember(id: string): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching member:', error);
    throw error;
  }

  return data as Member;
}

// メンバー作成
export async function createMember(name: string, avatar?: string): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .insert({
      name,
      avatar: avatar ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating member:', error);
    throw error;
  }

  return data as Member;
}

// メンバー更新
export async function updateMember(
  id: string,
  updates: { name?: string; avatar?: string | null }
): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating member:', error);
    throw error;
  }

  return data as Member;
}

// メンバー削除
export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}
