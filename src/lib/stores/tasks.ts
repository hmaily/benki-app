import { create } from 'zustand';
import { seedTasks } from '../seed';
import type { Task } from '../types';

type Loadable<T> = { state: 'idle' | 'loading' | 'ready' | 'error'; data: T; error?: string };

interface TasksState {
  tasks: Loadable<Task[]>;
  load: () => Promise<void>;
  add: (input: Pick<Task, 'title' | 'notes' | 'dueAt' | 'xp'>) => Task;
  remove: (id: string) => void;
  toggleComplete: (id: string) => Task | undefined;
  reschedule: (id: string, dueAt: string) => void;
}

function classify(task: Task): Task {
  if (task.status === 'completed') return task;
  const overdue = new Date(task.dueAt).getTime() < Date.now();
  return { ...task, status: overdue ? 'missed' : 'upcoming' };
}

export const useTasks = create<TasksState>((set, get) => ({
  tasks: { state: 'idle', data: [] },

  load: async () => {
    set({ tasks: { state: 'loading', data: [] } });
    await new Promise((r) => setTimeout(r, 250));
    set({ tasks: { state: 'ready', data: seedTasks.map(classify) } });
  },

  add: ({ title, notes, dueAt, xp }) => {
    const task: Task = {
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      notes,
      dueAt,
      xp,
      status: 'upcoming',
    };
    const cur = get().tasks;
    set({ tasks: { ...cur, state: 'ready', data: [classify(task), ...cur.data] } });
    return task;
  },

  remove: (id) => {
    const cur = get().tasks;
    set({ tasks: { ...cur, data: cur.data.filter((t) => t.id !== id) } });
  },

  toggleComplete: (id) => {
    const cur = get().tasks;
    let updated: Task | undefined;
    const next = cur.data.map((t) => {
      if (t.id !== id) return t;
      const isCompleting = t.status !== 'completed';
      updated = isCompleting
        ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
        : classify({ ...t, status: 'upcoming', completedAt: undefined });
      return updated;
    });
    set({ tasks: { ...cur, data: next } });
    return updated;
  },

  reschedule: (id, dueAt) => {
    const cur = get().tasks;
    set({
      tasks: {
        ...cur,
        data: cur.data.map((t) => (t.id === id ? classify({ ...t, dueAt, status: 'upcoming' }) : t)),
      },
    });
  },
}));
