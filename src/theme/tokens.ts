export type ThemeName = 'minimal' | 'gamer' | 'coach';

export type ColorTokens = {
  background: string;
  surface: string;
  card: string;
  overlay: string;
  textPrimary: string;
  textSecondary: string;
  muted: string;
  border: string;
  primary: string;
  primaryContrastText: string;
  secondary: string;
  secondaryContrastText: string;
  success: string;
  warning: string;
  danger: string;
};

export type SpacingTokens = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
};

export type TypographyTokens = {
  headingFontFamily: string;
  bodyFontFamily: string;
  sizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  weights: {
    regular: string | number;
    medium: string | number;
    semiBold: string | number;
    bold: string | number;
    black: string | number;
  };
};

export type RadiiTokens = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
};

export type ElevationTokens = {
  level0: number;
  level1: number;
  level2: number;
  level3: number;
};

export type Theme = {
  name: ThemeName;
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  radii: RadiiTokens;
  elevation: ElevationTokens;
};

const baseSpacing: SpacingTokens = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
};

const baseTypography: TypographyTokens = {
  headingFontFamily: 'System',
  bodyFontFamily: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 26,
    '3xl': 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    black: '900',
  },
};

const baseRadii: RadiiTokens = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};

const baseElevation: ElevationTokens = {
  level0: 0,
  level1: 2,
  level2: 4,
  level3: 8,
};

const minimalTheme: Theme = {
  name: 'minimal',
  colors: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    card: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.4)',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    muted: '#9CA3AF',
    border: '#E5E7EB',
    primary: '#2D6AE3',
    primaryContrastText: '#FFFFFF',
    secondary: '#6B7280',
    secondaryContrastText: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  spacing: baseSpacing,
  typography: baseTypography,
  radii: baseRadii,
  elevation: baseElevation,
};

const gamerTheme: Theme = {
  name: 'gamer',
  colors: {
    background: '#0B1020',
    surface: '#121735',
    card: '#121735',
    overlay: 'rgba(0,0,0,0.6)',
    textPrimary: '#E5E7EB',
    textSecondary: '#9CA3AF',
    muted: '#6B7280',
    border: '#2B2F41',
    primary: '#7C3AED',
    primaryContrastText: '#FFFFFF',
    secondary: '#22D3EE',
    secondaryContrastText: '#0B1020',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  spacing: baseSpacing,
  typography: {
    ...baseTypography,
    headingFontFamily: 'System',
    bodyFontFamily: 'System',
  },
  radii: baseRadii,
  elevation: baseElevation,
};

const coachTheme: Theme = {
  name: 'coach',
  colors: {
    background: '#FFF9F0',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.35)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    muted: '#94A3B8',
    border: '#FED7AA',
    primary: '#F97316',
    primaryContrastText: '#1F2937',
    secondary: '#10B981',
    secondaryContrastText: '#FFFFFF',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#DC2626',
  },
  spacing: baseSpacing,
  typography: baseTypography,
  radii: baseRadii,
  elevation: baseElevation,
};

export const THEMES: Record<ThemeName, Theme> = {
  minimal: minimalTheme,
  gamer: gamerTheme,
  coach: coachTheme,
};

export const DEFAULT_THEME_NAME: ThemeName = 'minimal';
export const DEFAULT_THEME: Theme = THEMES[DEFAULT_THEME_NAME];