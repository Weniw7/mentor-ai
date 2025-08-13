export type ThemeName = 'minimal' | 'gamer' | 'coach';

export interface Theme {
  name: ThemeName;
  colors: {
    bg: string;
    card: string;
    text: string;
    subtext: string;
    accent: string;
    success: string;
    warning: string;
    border: string;
    headerBg?: string;
    headerText?: string;
  };
  radii: { card: number; button: number };
  spacing: { xs: number; sm: number; md: number; lg: number };
  typography: { h1: number; h2: number; body: number };
  effects: { pressScale: number; doneFadeMs: number };
}

export const THEME_MINIMAL: Theme = {
  name: 'minimal',
  colors: {
    bg: '#F7F9FC',
    card: '#FFFFFF',
    text: '#0F172A',
    subtext: '#475569',
    accent: '#3B82F6',
    success: '#22C55E',
    warning: '#F59E0B',
    border: '#E2E8F0',
    headerBg: '#FFFFFF',
    headerText: '#0F172A',
  },
  radii: { card: 12, button: 10 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  typography: { h1: 28, h2: 22, body: 16 },
  effects: { pressScale: 0.98, doneFadeMs: 200 },
};

export const THEME_GAMER: Theme = {
  name: 'gamer',
  colors: {
    bg: '#0B0F1A',
    card: '#111827',
    text: '#E5E7EB',
    subtext: '#9CA3AF',
    accent: '#8B5CF6',
    success: '#22C55E',
    warning: '#F59E0B',
    border: '#27272A',
    headerBg: '#0B0F1A',
    headerText: '#E5E7EB',
  },
  radii: { card: 14, button: 12 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  typography: { h1: 30, h2: 24, body: 16 },
  effects: { pressScale: 0.96, doneFadeMs: 180 },
};

export const THEME_COACH: Theme = {
  name: 'coach',
  colors: {
    bg: '#FAFAFA',
    card: '#FFFFFF',
    text: '#111827',
    subtext: '#6B7280',
    accent: '#2563EB',
    success: '#16A34A',
    warning: '#EAB308',
    border: '#E5E7EB',
    headerBg: '#FFFFFF',
    headerText: '#111827',
  },
  radii: { card: 12, button: 10 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  typography: { h1: 28, h2: 22, body: 16 },
  effects: { pressScale: 0.98, doneFadeMs: 220 },
};

export const THEMES: Record<ThemeName, Theme> = {
  minimal: THEME_MINIMAL,
  gamer: THEME_GAMER,
  coach: THEME_COACH,
};

export const DEFAULT_THEME: Theme = THEME_MINIMAL;