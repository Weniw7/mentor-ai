import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Task = {
  id: string;
  title: string;
  duration: number; // minutos
  status: 'todo' | 'done' | 'skipped';
};

// Añadimos tipos para historial diario
type DayKey = string;
type HistoryEntry = { completed: number; skipped: number; totalTimeDone: number };
type HistoryRecord = Record<DayKey, HistoryEntry>;

type LastAction = { type: 'done' | 'skip'; task: Task };

type TasksStore = {
  brief: string;
  motivationalQuote: string;
  tasks: Task[];
  isLoading: boolean;
  lastAction?: LastAction;
  history: HistoryRecord;
  lastDayKey?: string;

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

const QUOTES: string[] = [
  'Hoy es un buen día para empezar.',
  'Pequeños pasos crean grandes cambios.',
  'Tu enfoque es tu superpoder.',
  'Sigue, aunque sea lento, pero sigue.',
  'La disciplina vence a la motivación.',
  'Hecho es mejor que perfecto.',
  'Cada minuto cuenta, haz que valga.',
  'Empieza por lo pequeño, gana impulso.',
  'Tú controlas tu siguiente acción.',
  'Una cosa a la vez, bien hecha.',
  'Con constancia, todo llega.',
  'Respira, prioriza y avanza.',
  'Un poco hoy, mucho mañana.',
  'Tu futuro yo te lo agradecerá.',
  'La claridad llega al actuar.',
];

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayOfYearFromKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const jan1 = new Date(Date.UTC(y, 0, 1));
  return Math.floor((date.getTime() - jan1.getTime()) / 86400000);
}

function pickQuoteForDay(key: string): string {
  const idx = (dayOfYearFromKey(key) + key.split('-').reduce((a, p) => a + Number(p), 0)) % QUOTES.length;
  return QUOTES[idx];
}

function pickRandomQuoteDifferent(previous?: string): string {
  const pool = QUOTES.filter(q => q !== previous);
  return pool[Math.floor(Math.random() * pool.length)] || QUOTES[0];
}

function emptyHistoryEntry(): HistoryEntry {
  return { completed: 0, skipped: 0, totalTimeDone: 0 };
}

function aggregateStatsForTasks(tasks: Task[]): HistoryEntry {
  const acc = emptyHistoryEntry();
  for (const t of tasks) {
    if (t.status === 'done') {
      acc.completed += 1;
      acc.totalTimeDone += t.duration || 0;
    } else if (t.status === 'skipped') {
      acc.skipped += 1;
    }
  }
  return acc;
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  brief: '',
  motivationalQuote: '',
  tasks: [],
  isLoading: false,
  lastAction: undefined,
  history: {},
  lastDayKey: undefined,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const todayKey = getTodayKey();

      if (raw) {
        const data = JSON.parse(raw);
        const tasks: Task[] = Array.isArray(data?.tasks) ? data.tasks : [];
        const brief: string =
          typeof data?.brief === 'string' && data.brief.length > 0
            ? data.brief
            : computeBrief(tasks);
        const storedKey: string | undefined =
          typeof data?.lastDayKey === 'string'
            ? data.lastDayKey
            : typeof data?.dateKey === 'string'
              ? data.dateKey
              : undefined;
        const storedQuote: string | undefined = typeof data?.motivationalQuote === 'string' ? data.motivationalQuote : undefined;
        const motivationalQuote =
          storedKey === todayKey && storedQuote ? storedQuote : pickQuoteForDay(todayKey);
        const history: HistoryRecord = data?.history && typeof data.history === 'object' ? (data.history as HistoryRecord) : {};

        if (storedKey && storedKey !== todayKey) {
          const aggregated = aggregateStatsForTasks(tasks);
          const prevEntry = history[storedKey] ?? emptyHistoryEntry();
          const nextHistory: HistoryRecord = {
            ...history,
            [storedKey]: {
              completed: prevEntry.completed + aggregated.completed,
              skipped: prevEntry.skipped + aggregated.skipped,
              totalTimeDone: prevEntry.totalTimeDone + aggregated.totalTimeDone,
            },
          };

          set({ history: nextHistory, lastDayKey: todayKey, isLoading: false, lastAction: undefined });
          try {
            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ tasks: [], brief: computeBrief([]), motivationalQuote: pickQuoteForDay(todayKey), history: nextHistory, lastDayKey: todayKey })
            );
          } catch {}

          await get().replan();
        } else {
          set({ tasks, brief, motivationalQuote, history, lastDayKey: todayKey, isLoading: false, lastAction: undefined });
          try {
            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: todayKey })
            );
          } catch {}
        }
      } else {
        const motivationalQuote = pickQuoteForDay(todayKey);
        set({ motivationalQuote, history: {}, lastDayKey: todayKey, isLoading: false });
        try {
          const { tasks, brief } = get();
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ tasks, brief, motivationalQuote, history: {}, lastDayKey: todayKey })
          );
        } catch {}
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
      const { tasks, brief, motivationalQuote, history } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: getTodayKey() })
      );
    } catch {}
  },

  markDone: async (id) => {
    const current = get().tasks.find(t => t.id === id);
    if (!current) return;

    const updatedTask: Task = { ...current, status: 'done' };
    const addDuration = current.duration || 0;
    set(state => {
      const todayKey = getTodayKey();
      const prev = state.history[todayKey] ?? emptyHistoryEntry();
      return {
        tasks: state.tasks.map(t => (t.id === id ? updatedTask : t)),
        lastAction: { type: 'done', task: updatedTask },
        history: {
          ...state.history,
          [todayKey]: {
            completed: prev.completed + 1,
            skipped: prev.skipped,
            totalTimeDone: prev.totalTimeDone + addDuration,
          },
        },
      };
    });
    get().recalcBrief();
    try {
      const { tasks, brief, motivationalQuote, history } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: getTodayKey() })
      );
    } catch {}
  },

  skip: async (id) => {
    const current = get().tasks.find(t => t.id === id);
    if (!current) return;

    const updatedTask: Task = { ...current, status: 'skipped' };
    set(state => {
      const todayKey = getTodayKey();
      const prev = state.history[todayKey] ?? emptyHistoryEntry();
      return {
        tasks: state.tasks.map(t => (t.id === id ? updatedTask : t)),
        lastAction: { type: 'skip', task: updatedTask },
        history: {
          ...state.history,
          [todayKey]: {
            completed: prev.completed,
            skipped: prev.skipped + 1,
            totalTimeDone: prev.totalTimeDone,
          },
        },
      };
    });
    get().recalcBrief();
    try {
      const { tasks, brief, motivationalQuote, history } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: getTodayKey() })
      );
    } catch {}
  },

  removeTask: async (id) => {
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== id),
    }));
    get().recalcBrief();
    try {
      const { tasks, brief, motivationalQuote, history } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: getTodayKey() })
      );
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
    const nextQuote = pickRandomQuoteDifferent(get().motivationalQuote);
    set({ tasks: mock, lastAction: undefined, motivationalQuote: nextQuote });
    get().recalcBrief();
    try {
      const { tasks, brief, motivationalQuote, history } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: getTodayKey() })
      );
    } catch {}
  },
}));