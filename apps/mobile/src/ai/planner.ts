import type { Task } from '../store/useTasksStore';
import type { UserPrefs } from '../store/useTasksStore';

export type ReplanInput = {
  tasks: Task[];
  userPrefs: UserPrefs;
  timeBudget?: number; // minutos
  focusTag?: string; // optional focus tag to prioritize
};

export type ReplanOutput = {
  order: string[];
  slots?: Record<string, [string, string]>;
};

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function minutesToTimeString(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

type Window = { start: number; end: number };

function getPlanningWindows(prefs: UserPrefs): Window[] {
  const wake = parseTimeToMinutes(prefs.wake || '07:00');
  const sleep = parseTimeToMinutes(prefs.sleep || '23:30');
  const preferred = Array.isArray(prefs.preferredHours) && prefs.preferredHours.length > 0
    ? prefs.preferredHours
    : [{ start: minutesToTimeString(Math.max(wake, 9 * 60)), end: minutesToTimeString(Math.min(sleep, 18 * 60)) }];
  const blocks = Array.isArray(prefs.focusBlocks) && prefs.focusBlocks.length > 0
    ? prefs.focusBlocks
    : preferred;
  return blocks
    .map(b => ({ start: parseTimeToMinutes(b.start), end: parseTimeToMinutes(b.end) }))
    .filter(w => w.end > w.start)
    .sort((a, b) => a.start - b.start);
}

function clampToWindows(nowMin: number, windows: Window[]): number {
  for (const w of windows) {
    if (nowMin <= w.start) return w.start;
    if (nowMin > w.start && nowMin < w.end) return nowMin;
  }
  return windows.length > 0 ? windows[0].start : nowMin;
}

function daysUntil(dateStr?: string): number | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return undefined;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

function compareByHeuristics(a: Task, b: Task, opts: { timeBudget?: number; currentHour: number; heavyStart: number; heavyEnd: number; focusTag?: string }): number {
  const da = daysUntil(a.deadline);
  const db = daysUntil(b.deadline);

  // 1) Deadline asc (más urgente primero)
  const aUrg = da === undefined ? Infinity : da;
  const bUrg = db === undefined ? Infinity : db;
  if (aUrg !== bUrg) return aUrg - bUrg;

  // 2) Priority desc
  if (a.priority !== b.priority) return b.priority - a.priority;

  // 3) Focus tag boost (si coincide, sube)
  if (opts.focusTag) {
    const f = opts.focusTag.toLowerCase();
    const aHas = (a.tags || []).some(t => (t || '').toLowerCase() === f) || (a.title || '').toLowerCase().includes(f);
    const bHas = (b.tags || []).some(t => (t || '').toLowerCase() === f) || (b.title || '').toLowerCase().includes(f);
    if (aHas !== bHas) return aHas ? -1 : 1;
  }

  // 4) Si timeBudget presente, preferir duración corta
  if (opts.timeBudget) {
    if (a.duration !== b.duration) return a.duration - b.duration;
  }

  // 5) Energy matching (pesos suaves)
  const inHeavyWindow = opts.currentHour * 60 >= opts.heavyStart && opts.currentHour * 60 < opts.heavyEnd;
  const aHeavyScore = a.energy === 'high' ? (inHeavyWindow ? -1 : 1) : 0;
  const bHeavyScore = b.energy === 'high' ? (inHeavyWindow ? -1 : 1) : 0;
  if (aHeavyScore !== bHeavyScore) return aHeavyScore - bHeavyScore;

  // Tie-breakers
  if (a.duration !== b.duration) return a.duration - b.duration;
  return a.title.localeCompare(b.title);
}

export function replanHeuristic(input: ReplanInput): ReplanOutput {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentHour = now.getHours();

  // Heavy window: media mañana (10:00-12:00) dentro de preferred/focus si aplica
  const windows = getPlanningWindows(input.userPrefs);
  const defaultHeavyStart = 10 * 60;
  const defaultHeavyEnd = 12 * 60;
  let heavyStart = defaultHeavyStart;
  let heavyEnd = defaultHeavyEnd;
  for (const w of windows) {
    const s = Math.max(w.start, defaultHeavyStart);
    const e = Math.min(w.end, defaultHeavyEnd);
    if (e > s) {
      heavyStart = s;
      heavyEnd = e;
      break;
    }
  }

  const todo = input.tasks.filter(t => t.status === 'todo');
  const sorted = [...todo].sort((a, b) => compareByHeuristics(a, b, { timeBudget: input.timeBudget, currentHour, heavyStart, heavyEnd, focusTag: input.focusTag }));

  // Opcional: asignar slots dentro de ventanas y timeBudget si se provee
  const order = sorted.map(t => t.id);
  const slots: Record<string, [string, string]> = {};

  let budgetRemaining = typeof input.timeBudget === 'number' ? Math.max(0, Math.floor(input.timeBudget)) : undefined;
  let cursor = clampToWindows(Math.max(currentMinutes, parseTimeToMinutes(input.userPrefs.wake)), windows);
  let windowIdx = windows.findIndex(w => cursor >= w.start && cursor < w.end);
  if (windowIdx < 0) windowIdx = 0;

  for (const t of sorted) {
    if (budgetRemaining !== undefined && budgetRemaining <= 0) break;
    let duration = Math.max(1, t.duration || 0);
    if (budgetRemaining !== undefined && duration > budgetRemaining) duration = budgetRemaining;

    while (windowIdx < windows.length) {
      const w = windows[windowIdx];
      if (cursor < w.start) cursor = w.start;
      if (cursor >= w.end) {
        windowIdx += 1;
        continue;
      }
      const available = w.end - cursor;
      if (available <= 0) {
        windowIdx += 1;
        continue;
      }
      const used = Math.min(available, duration);
      const startStr = minutesToTimeString(cursor);
      const endStr = minutesToTimeString(cursor + used);
      slots[t.id] = [startStr, endStr];
      cursor += used;
      if (budgetRemaining !== undefined) budgetRemaining -= used;
      break;
    }
  }

  return { order, slots: Object.keys(slots).length > 0 ? slots : undefined };
}