import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Task = {
  id: string;
  title: string;
  duration: number; // minutos
  status: 'todo' | 'done' | 'skipped';
};

type LastAction = { type: 'done' | 'skip'; task: Task };

type TasksStore = {
  brief: string;
  tasks: Task[];
  isLoading: boolean;
  lastAction?: LastAction;

  hydrate: () => Promise<void>;
  addTask: (t: Omit<Task, 'status'>) => Promise<void>;
  markDone: (id: string) => Promise<void>;
  skip: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  replan: () => Promise<void>;
  recalcBrief: () => void;
};

const STORAGE_KEY = 'mentorai:store';

function computeBrief(tasks: Task[]): string {
  const todo = tasks.filter(t => t.status === 'todo');
  const totalMin = todo.reduce((sum, t) => sum + (t.duration || 0), 0);
  return `Tienes ${todo.length} tareas (~${totalMin} min)`;
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  brief: '',
  tasks: [],
  isLoading: false,
  lastAction: undefined,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const tasks: Task[] = Array.isArray(data?.tasks) ? data.tasks : [];
        const brief: string =
          typeof data?.brief === 'string' && data.brief.length > 0
            ? data.brief
            : computeBrief(tasks);
        set({ tasks, brief, isLoading: false, lastAction: undefined });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  recalcBrief: () => {
    set(state => ({ brief: computeBrief(state.tasks) }));
  },

  addTask: async (t) => {
    set(state => ({
      tasks: [...state.tasks, { ...t, status: 'todo' }],
    }));
    get().recalcBrief();
    try {
      const { tasks, brief } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, brief }));
    } catch {}
  },

  markDone: async (id) => {
    const current = get().tasks.find(t => t.id === id);
    if (!current) return;

    const updatedTask: Task = { ...current, status: 'done' };
    set(state => ({
      tasks: state.tasks.map(t => (t.id === id ? updatedTask : t)),
      lastAction: { type: 'done', task: updatedTask },
    }));
    get().recalcBrief();
    try {
      const { tasks, brief } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, brief }));
    } catch {}
  },

  skip: async (id) => {
    const current = get().tasks.find(t => t.id === id);
    if (!current) return;

    const updatedTask: Task = { ...current, status: 'skipped' };
    set(state => ({
      tasks: state.tasks.map(t => (t.id === id ? updatedTask : t)),
      lastAction: { type: 'skip', task: updatedTask },
    }));
    get().recalcBrief();
    try {
      const { tasks, brief } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, brief }));
    } catch {}
  },

  removeTask: async (id) => {
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== id),
    }));
    get().recalcBrief();
    try {
      const { tasks, brief } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, brief }));
    } catch {}
  },

  replan: async () => {
    const now = Date.now();
    const mock: Task[] = [
      { id: `t-${now}-1`, title: 'Revisar agenda del día', duration: 5, status: 'todo' },
      { id: `t-${now}-2`, title: 'Plan de enfoque (Deep work)', duration: 45, status: 'todo' },
      { id: `t-${now}-3`, title: 'Chequeo de correos prioritarios', duration: 15, status: 'todo' },
      { id: `t-${now}-4`, title: 'Bloque de movimiento/descanso', duration: 10, status: 'todo' },
    ];
    set({ tasks: mock, lastAction: undefined });
    get().recalcBrief();
    try {
      const { tasks, brief } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, brief }));
    } catch {}
  },
}));