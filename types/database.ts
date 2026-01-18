export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string;
          avatar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          score: number;
          start_date: string;
          end_date: string;
          is_recurring: boolean;
          recurring_type: string | null;
          link: string | null;
          communication_link: string | null;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: string;
          score?: number;
          start_date: string;
          end_date: string;
          is_recurring?: boolean;
          recurring_type?: string | null;
          link?: string | null;
          communication_link?: string | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          score?: number;
          start_date?: string;
          end_date?: string;
          is_recurring?: boolean;
          recurring_type?: string | null;
          link?: string | null;
          communication_link?: string | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_assignments: {
        Row: {
          task_id: string;
          member_id: string;
          role: string;
          workload_ratio: number;
        };
        Insert: {
          task_id: string;
          member_id: string;
          role?: string;
          workload_ratio?: number;
        };
        Update: {
          task_id?: string;
          member_id?: string;
          role?: string;
          workload_ratio?: number;
        };
      };
      subtasks: {
        Row: {
          id: string;
          task_id: string;
          text: string;
          completed: boolean;
          order_index: number;
        };
        Insert: {
          id?: string;
          task_id: string;
          text: string;
          completed?: boolean;
          order_index?: number;
        };
        Update: {
          id?: string;
          task_id?: string;
          text?: string;
          completed?: boolean;
          order_index?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
