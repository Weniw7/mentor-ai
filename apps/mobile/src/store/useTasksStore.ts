import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { replanHeuristic } from '../ai/planner';

// ========================
// Tipos
// ========================
export type Task = {
  id: string;
  title: string;
  duration: number; // minutos
  status: 'todo' | 'done' | 'skipped';
  energy: 'low' | 'med' | 'high';
  priority: 1 | 2 | 3 | 4 | 5;
  deadline?: string;
  tags?: string[];
};

type DayKey = string;
type HistoryEntry = { completed: number; skipped: number; totalTimeDone: number };
type HistoryRecord = Record<DayKey, HistoryEntry>;

export type LastAction = { type: 'done' | 'skip'; task: Task };

export type UserPrefs = {
  wake: string;
  sleep: string;
  focusBlocks: { start: string; end: string }[];
  preferredHours: { start: string; end: string }[];
};

const DEFAULT_USER_PREFS: UserPrefs = {
  wake: '07:00',
  sleep: '23:30',
  focusBlocks: [
    { start: '09:00', end: '12:00' },
    { start: '15:00', end: '18:00' },
  ],
  preferredHours: [{ start: '09:00', end: '18:00' }],
};

// ========================
// Utils de tareas y quotes
// ========================
function withTaskDefaults(input: any): Task {
  const energy =
    input?.energy === 'low' || input?.energy === 'med' || input?.energy === 'high'
      ? input.energy
      : 'med';
  const priority = [1, 2, 3, 4, 5].includes(input?.priority)
    ? (input.priority as 1 | 2 | 3 | 4 | 5)
    : 3;
  const tags: string[] | undefined = Array.isArray(input?.tags)
    ? input.tags.filter((t: any) => typeof t === 'string')
    : undefined;
  const title = typeof input?.title === 'string' ? input.title : '';
  const duration = typeof input?.duration === 'number' ? input.duration : 0;
  const id =
    typeof input?.id === 'string'
      ? input.id
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const status: 'todo' | 'done' | 'skipped' =
    input?.status === 'done' || input?.status === 'skipped' ? input.status : 'todo';
  const deadline = typeof input?.deadline === 'string' ? input.deadline : undefined;
  return { id, title, duration, status, energy, priority, deadline, tags };
}

function tasksWithDefaults(tasks: any[]): Task[] {
  return (Array.isArray(tasks) ? tasks : []).map(withTaskDefaults);
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
  const idx =
    (dayOfYearFromKey(key) + key.split('-').reduce((a, p) => a + Number(p), 0)) %
    QUOTES.length;
  return QUOTES[idx];
}

function pickRandomQuoteDifferent(previous?: string): string {
  const pool = QUOTES.filter((q) => q !== previous);
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

function computeBrief(tasks: Task[]): string {
  const todo = tasks.filter((t) => t.status === 'todo');
  const totalMin = todo.reduce((sum, t) => sum + (t.duration || 0), 0);
  return `Tienes ${todo.length} tareas (~${totalMin} min)`;
}

// ========================
// Store
// ========================
export type TasksStore = {
  brief: string;
  motivationalQuote: string;
  tasks: Task[];
  isLoading: boolean;
  lastAction?: LastAction;
  history: HistoryRecord;
  lastDayKey?: string;
  userPrefs: UserPrefs;

  hydrate: () => Promise<void>;
  addTask: (
    t: Omit<Task, 'status' | 'energy' | 'priority'> &
      Partial<Pick<Task, 'energy' | 'priority' | 'deadline' | 'tags'>>
  ) => Promise<void>;
  markDone: (id: string) => Promise<void>;
  skip: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  replan: () => Promise<void>;
  recalcBrief: () => void;
  setMotivationalQuote: (dateKey: string) => Promise<void>;
};

export const selectTodoTasks = (state: TasksStore) =>
  state.tasks.filter((t) => t.status === 'todo');

const STORAGE_KEY = 'mentorai:store';

export const useTasksStore = create<TasksStore>((set, get) => ({
  brief: '',
  motivationalQuote: '',
  tasks: [],
  isLoading: false,
  lastAction: undefined,
  history: {},
  lastDayKey: undefined,
  userPrefs: DEFAULT_USER_PREFS,

  // ========= hydrate =========
  hydrate: async () => {
    set({ isLoading: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const todayKey = getTodayKey();

      if (raw) {
        const data = JSON.parse(raw);
        const tasks: Task[] = tasksWithDefaults(Array.isArray(data?.tasks) ? data.tasks : []);
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

        const storedQuote: string | undefined =
          typeof data?.motivationalQuote === 'string' ? data.motivationalQuote : undefined;

        const motivationalQuote =
          storedKey === todayKey && storedQuote ? storedQuote : pickQuoteForDay(todayKey);

        const history: HistoryRecord =
          data?.history && typeof data.history === 'object'
            ? (data.history as HistoryRecord)
            : {};

        const userPrefs: UserPrefs =
          data?.userPrefs && typeof data.userPrefs === 'object'
            ? { ...DEFAULT_USER_PREFS, ...data.userPrefs }
            : DEFAULT_USER_PREFS;

        if (storedKey && storedKey !== todayKey) {
          // Cierra el día anterior y resetea tareas
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

          set({
            history: nextHistory,
            lastDayKey: todayKey,
            isLoading: false,
            lastAction: undefined,
            userPrefs,
          });

          try {
            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                tasks: [],
                brief: computeBrief([]),
                motivationalQuote: pickQuoteForDay(todayKey),
                history: nextHistory,
                lastDayKey: todayKey,
                userPrefs,
              })
            );
          } catch {}

          await get().replan();
        } else {
          set({
            tasks,
            brief,
            motivationalQuote,
            history,
            lastDayKey: todayKey,
            isLoading: false,
            lastAction: undefined,
            userPrefs,
          });
          try {
            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                tasks,
                brief,
                motivationalQuote,
                history,
                lastDayKey: todayKey,
                userPrefs,
              })
            );
          } catch {}
        }
      } else {
        const motivationalQuote = pickQuoteForDay(todayKey);
        set({
          motivationalQuote,
          history: {},
          lastDayKey: todayKey,
          isLoading: false,
          userPrefs: DEFAULT_USER_PREFS,
        });
        try {
          const { tasks, brief } = get();
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              tasks,
              brief,
              motivationalQuote,
              history: {},
              lastDayKey: todayKey,
              userPrefs: DEFAULT_USER_PREFS,
            })
          );
        } catch {}
      }
    } catch {
      set({ isLoading: false });
    }
  },

  recalcBrief: () => {
    set((state) => ({ brief: computeBrief(state.tasks) }));
  },

  setMotivationalQuote: async (dateKey: string) => {
    const motivationalQuote = pickQuoteForDay(dateKey);
    set({ motivationalQuote, lastDayKey: dateKey });
    try {
      const { tasks, brief, history, userPrefs } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: dateKey, userPrefs })
      );
    } catch {}
  },

  addTask: async (t) => {
    const defaults: Pick<Task, 'energy' | 'priority'> = { energy: 'med', priority: 3 };
    set((state) => ({
      tasks: [...state.tasks, withTaskDefaults({ ...t, status: 'todo', ...defaults })],
    }));
    get().recalcBrief();
    try {
      const { tasks, brief, motivationalQuote, history, userPrefs } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: getTodayKey(), userPrefs })
      );
    } catch {}
  },

  markDone: async (id) => {
    const current = get().tasks.find((t) => t.id === id);
    if (!current) return;

    const updatedTask: Task = { ...current, status: 'done' };
    const addDuration = current.duration || 0;
    set((state) => {
      const todayKey = getTodayKey();
      const prev = state.history[todayKey] ?? emptyHistoryEntry();
      return {
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
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
      const { tasks, brief, motivationalQuote, history, userPrefs } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: getTodayKey(), userPrefs })
      );
    } catch {}
  },

  skip: async (id) => {
    const current = get().tasks.find((t) => t.id === id);
    if (!current) return;

    const updatedTask: Task = { ...current, status: 'skipped' };
    set((state) => {
      const todayKey = getTodayKey();
      const prev = state.history[todayKey] ?? emptyHistoryEntry();
      return {
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
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
      const { tasks, brief, motivationalQuote, history, userPrefs } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: getTodayKey(), userPrefs })
      );
    } catch {}
  },

  removeTask: async (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
    get().recalcBrief();
    try {
      const { tasks, brief, motivationalQuote, history, userPrefs } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: getTodayKey(), userPrefs })
      );
    } catch {}
  },

  // ========= replan (heurístico local con prefs) =========
  replan: async () => {
    const allTasks = tasksWithDefaults(get().tasks);
    const todo = allTasks.filter((t) => t.status === 'todo');
    const others = allTasks.filter((t) => t.status !== 'todo');

    const { userPrefs } = get();
    const plan = replanHeuristic({ tasks: todo, userPrefs });

    const idToTask = new Map(allTasks.map((t) => [t.id, t] as const));
    const plannedTodo = plan.order
      .map((id) => idToTask.get(id))
      .filter((t): t is Task => !!t);
    const newTasks = [...plannedTodo, ...others];

    const nextQuote = pickRandomQuoteDifferent(get().motivationalQuote);
    set({ tasks: newTasks, lastAction: undefined, motivationalQuote: nextQuote });
    get().recalcBrief();
    try {
      const { tasks, brief, motivationalQuote, history, userPrefs } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, brief, motivationalQuote, history, lastDayKey: getTodayKey(), userPrefs })
      );
    } catch {}
  },
}));
