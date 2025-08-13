import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERSONA_DEFS } from '../personas/defs';

export type Persona = 'emprendedor' | 'fitness' | 'estudio' | 'dieta';
export type EnergyLevel = 'low' | 'med' | 'high';

export type UserProfile = {
  persona: Persona;
  goal: string;
  wake: string; // HH:MM
  sleep: string; // HH:MM
  preferredHours: { start: string; end: string }[];
  energyByHour: Array<{ hour: number; level: EnergyLevel }>;
};

const PROFILE_KEY = 'mentorai:profile';

function isValidTime(value: any): value is string {
  if (typeof value !== 'string') return false;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isEnergyLevel(x: any): x is EnergyLevel {
  return x === 'low' || x === 'med' || x === 'high';
}

function sanitizeProfile(input: any): UserProfile | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const p = input as Partial<UserProfile> & { persona?: any };
  if (p.persona !== 'emprendedor' && p.persona !== 'fitness' && p.persona !== 'estudio' && p.persona !== 'dieta') return undefined;
  if (!isValidTime(p.wake) || !isValidTime(p.sleep)) return undefined;
  const goal = typeof p.goal === 'string' ? p.goal : '';
  if (!Array.isArray(p.preferredHours)) return undefined;
  const preferredHours = p.preferredHours
    .map(x => (x && typeof x.start === 'string' && typeof x.end === 'string' ? { start: x.start, end: x.end } : null))
    .filter(Boolean) as { start: string; end: string }[];
  if (preferredHours.length === 0) return undefined;
  if (!Array.isArray(p.energyByHour)) return undefined;
  const energyByHour = p.energyByHour
    .map(x => (x && typeof x.hour === 'number' && isEnergyLevel((x as any).level) ? { hour: Math.max(0, Math.min(23, Math.floor(x.hour))), level: (x as any).level as EnergyLevel } : null))
    .filter(Boolean) as Array<{ hour: number; level: EnergyLevel }>;
  if (energyByHour.length < 24) return undefined;
  return { persona: p.persona, goal, wake: p.wake, sleep: p.sleep, preferredHours, energyByHour };
}

type ProfileStore = {
  profile?: UserProfile;
  isHydrating: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  save: (profile: UserProfile) => Promise<void>;
  setPersona: (persona: Persona) => void;
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: undefined,
  isHydrating: false,
  hydrated: false,

  hydrate: async () => {
    if (get().isHydrating || get().hydrated) return;
    set({ isHydrating: true });
    try {
      const raw = await AsyncStorage.getItem(PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const prof = sanitizeProfile(parsed);
        if (prof) {
          set({ profile: prof, isHydrating: false, hydrated: true });
          return;
        }
      }
      set({ profile: undefined, isHydrating: false, hydrated: true });
    } catch {
      set({ isHydrating: false, hydrated: true });
    }
  },

  save: async (profile: UserProfile) => {
    const prof = sanitizeProfile(profile);
    if (!prof) throw new Error('Invalid profile');
    set({ profile: prof });
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(prof));
    } catch {}
  },

  setPersona: (persona: Persona) => {
    const def = PERSONA_DEFS[persona];
    const current = get().profile;
    const next: UserProfile = {
      persona,
      goal: current?.goal ?? def.defaultGoal,
      wake: current?.wake ?? def.defaultWake,
      sleep: current?.sleep ?? def.defaultSleep,
      preferredHours: current?.preferredHours ?? def.defaultPreferredHours,
      energyByHour: current?.energyByHour ?? def.defaultEnergyByHour,
    };
    set({ profile: next });
  },
}));