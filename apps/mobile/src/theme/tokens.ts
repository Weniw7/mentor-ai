export type ThemeName = 'minimal' | 'gamer' | 'coach';

export interface Theme {
  name: ThemeName;
  mode: 'light' | 'dark';
  colors: {
    bg: string;         // color base de fondo
    card: string;       // tarjetas
    text: string;       // texto principal
    subtext: string;    // texto secundario
    accent: string;     // acento/botones
    success: string;
    warning: string;
    border: string;
    headerBg?: string;
    headerText?: string;
  };
  fonts: {
    regular: string | undefined; // puedes mapear a 'System' si no usas custom fonts
    mono?: string | undefined;
  };
  radii: { card: number; button: number };
  spacing: { xs: number; sm: number; md: number; lg: number };
  typography: { h1: number; h2: number; body: number };
  effects: { pressScale: number; doneFadeMs: number };
  bgImage?: any; // require('...') opcional para fondo por tema
}

const sys = undefined; // usa fuente del sistema por ahora

export const THEME_MINIMAL: Theme = {
  name: 'minimal',
  mode: 'light',
  colors: {
    bg: '#F7F8FA',
    card: '#FFFFFF',
    text: '#0E1116',
    subtext: '#586174',
    accent: '#2F7CF7',
    success: '#22C55E',
    warning: '#F59E0B',
    border: '#E5E7EB',
    headerBg: '#FFFFFF',
    headerText: '#0E1116',
  },
  fonts: { regular: sys },
  radii: { card: 16, button: 12 },
  spacing: { xs: 6, sm: 10, md: 16, lg: 24 },
  typography: { h1: 24, h2: 18, body: 15 },
  effects: { pressScale: 0.98, doneFadeMs: 160 },
  // bgImage: require('../../assets/themes/minimal.jpg'),
};

export const THEME_GAMER: Theme = {
  name: 'gamer',
  mode: 'dark',
  colors: {
    bg: '#0B1020',
    card: '#121a33',
    text: '#E6ECFF',
    subtext: '#9AA6FF',
    accent: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    border: '#233059',
    headerBg: '#0F1530',
    headerText: '#E6ECFF',
  },
  fonts: { regular: sys, mono: sys },
  radii: { card: 18, button: 14 },
  spacing: { xs: 6, sm: 10, md: 16, lg: 24 },
  typography: { h1: 24, h2: 18, body: 15 },
  effects: { pressScale: 0.97, doneFadeMs: 140 },
  // bgImage: require('../../assets/themes/gamer.jpg'),
};

export const THEME_COACH: Theme = {
  name: 'coach',
  mode: 'light',
  colors: {
    bg: '#FDFBF7',
    card: '#FFFFFF',
    text: '#1C1C1C',
    subtext: '#5F6368',
    accent: '#2563EB',
    success: '#16A34A',
    warning: '#EA580C',
    border: '#EDE9D5',
    headerBg: '#FFFFFF',
    headerText: '#1C1C1C',
  },
  fonts: { regular: sys },
  radii: { card: 20, button: 14 },
  spacing: { xs: 6, sm: 10, md: 16, lg: 24 },
  typography: { h1: 24, h2: 18, body: 15 },
  effects: { pressScale: 0.98, doneFadeMs: 180 },
  // bgImage: require('../../assets/themes/coach.jpg'),
};

export const THEMES = {
  minimal: THEME_MINIMAL,
  gamer: THEME_GAMER,
  coach: THEME_COACH,
} as const;

export const DEFAULT_THEME = THEME_MINIMAL;
