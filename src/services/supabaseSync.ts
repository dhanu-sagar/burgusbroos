import { supabase, isSupabaseConfigured } from './supabase';
import { Task, DailyRecord, SprintSession, Project, Habit, UserSettings } from '../types';

/**
 * Service to sync Burgusbroos local data with Supabase backend
 */
export const SupabaseSyncService = {
  // Check auth user
  async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Fetch all tasks for user
  async fetchTasks(): Promise<Task[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) {
      console.warn('Supabase fetchTasks error:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      bucket: row.bucket,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date || undefined,
      projectId: row.project_id || undefined,
      notes: row.notes || undefined,
      estimatedMinutes: row.estimated_minutes || undefined,
      order: row.order || 0,
      createdAt: row.created_at,
      completedAt: row.completed_at || undefined,
    }));
  },

  // Upsert a task
  async upsertTask(task: Task, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('tasks').upsert({
      id: task.id,
      user_id: userId,
      name: task.name,
      bucket: task.bucket,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate || null,
      project_id: task.projectId || null,
      notes: task.notes || null,
      estimated_minutes: task.estimatedMinutes || null,
      order: task.order ?? 0,
      completed_at: task.completedAt || null,
    });
    return !error;
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    return !error;
  },

  // Fetch daily records
  async fetchDailyRecords(): Promise<Record<string, DailyRecord> | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('daily_records').select('*');
    if (error) return null;

    const recordMap: Record<string, DailyRecord> = {};
    (data || []).forEach((row: any) => {
      recordMap[row.date] = {
        id: row.id,
        date: row.date,
        brainDump: row.brain_dump || '',
        dailyHighlight: {
          text: row.daily_highlight_text || '',
          done: row.daily_highlight_done || false,
          completedAt: row.daily_highlight_completed_at || undefined,
        },
        microCommitment: {
          text: row.micro_commitment_text || '',
          done: row.micro_commitment_done || false,
          habitId: row.micro_commitment_habit_id || undefined,
          completedAt: row.micro_commitment_completed_at || undefined,
        },
        updatedAt: row.updated_at,
      };
    });
    return recordMap;
  },

  // Upsert daily record
  async upsertDailyRecord(record: DailyRecord, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('daily_records').upsert({
      user_id: userId,
      date: record.date,
      brain_dump: record.brainDump,
      daily_highlight_text: record.dailyHighlight.text,
      daily_highlight_done: record.dailyHighlight.done,
      daily_highlight_completed_at: record.dailyHighlight.completedAt || null,
      micro_commitment_text: record.microCommitment.text,
      micro_commitment_done: record.microCommitment.done,
      micro_commitment_habit_id: record.microCommitment.habitId || null,
      micro_commitment_completed_at: record.microCommitment.completedAt || null,
    }, { onConflict: 'user_id,date' });
    return !error;
  },

  // Save sprint session
  async saveSprintSession(sprint: SprintSession, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('sprint_sessions').insert({
      id: sprint.id,
      user_id: userId,
      task_id: sprint.taskId || null,
      task_name: sprint.taskName || null,
      bucket: sprint.bucket || null,
      project_id: sprint.projectId || null,
      start_time: sprint.startTime,
      end_time: sprint.endTime,
      planned_duration_sec: sprint.plannedDurationSec,
      actual_duration_sec: sprint.actualDurationSec,
      focus_quality: sprint.focusQuality || null,
      ended_early: sprint.endedEarly,
      notes: sprint.notes || null,
      creative_takeaway: sprint.creativeTakeaway || null,
      creative_log: sprint.creativeLog || [],
    });
    return !error;
  },

  // Projects & habits fetch & upsert
  async fetchProjects(): Promise<Project[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) return null;
    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      targetDate: p.target_date,
      createdAt: p.created_at,
    }));
  },

  async fetchHabits(): Promise<Habit[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('habits').select('*').order('created_at', { ascending: true });
    if (error) return null;
    return (data || []).map((h: any) => ({
      id: h.id,
      name: h.name,
      currentStreak: h.current_streak,
      bestStreak: h.best_streak,
      lastCompletedDate: h.last_completed_date,
      createdAt: h.created_at,
    }));
  }
};
