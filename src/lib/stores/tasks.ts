import { create } from 'zustand';

import { toTask } from '../mappers';
import { supabase } from '../supabase';
import type { Task } from '../types';
import { errorMessage } from '../utils/errors';
import { currentUserId } from './auth';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface NewTaskInput {
  title: string;
  notes?: string;
  dueAt: string;
  xp: number;
}

interface TasksState {
  items: Task[];
  status: Status;
  error: string | null;
  load: () => Promise<void>;
  add: (input: NewTaskInput) => Promise<void>;
  update: (id: string, input: NewTaskInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** Toggle completion; returns the updated task (status tells caller if XP changed). */
  toggleComplete: (id: string) => Promise<Task | null>;
  reschedule: (id: string, dueAt: string) => Promise<void>;
  reset: () => void;
}

function sortByDue(a: Task, b: Task): number {
  return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
}

export const useTasks = create<TasksState>((set, get) => ({
  items: [],
  status: 'idle',
  error: null,

  load: async () => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_at', { ascending: true });
      if (error) throw error;
      set({ items: data.map(toTask), status: 'ready' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },

  add: async ({ title, notes, dueAt, xp }) => {
    const userId = currentUserId();
    if (!userId) throw new Error('Not signed in');

    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: userId, title, notes: notes ?? null, due_at: dueAt, xp })
      .select()
      .single();
    if (error) throw error;

    set({ items: [...get().items, toTask(data)].sort(sortByDue) });
  },

  update: async (id, { title, notes, dueAt, xp }) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ title, notes: notes ?? null, due_at: dueAt, xp })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    const updated = toTask(data);
    set({ items: get().items.map((t) => (t.id === id ? updated : t)).sort(sortByDue) });
  },

  remove: async (id) => {
    const prev = get().items;
    set({ items: prev.filter((t) => t.id !== id) }); // optimistic
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      set({ items: prev }); // rollback
      throw error;
    }
  },

  toggleComplete: async (id) => {
    const task = get().items.find((t) => t.id === id);
    if (!task) return null;

    const completedAt = task.status === 'completed' ? null : new Date().toISOString();
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed_at: completedAt })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    const updated = toTask(data);
    set({ items: get().items.map((t) => (t.id === id ? updated : t)) });
    return updated;
  },

  reschedule: async (id, dueAt) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ due_at: dueAt })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    const updated = toTask(data);
    set({ items: get().items.map((t) => (t.id === id ? updated : t)).sort(sortByDue) });
  },

  reset: () => set({ items: [], status: 'idle', error: null }),
}));
