import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME, THEMES, Theme, ThemeName } from './tokens';

type ThemeContextValue = {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  available: ThemeName[];
};

const THEME_STORAGE_KEY = 'mentorai:theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME.name);

  const available = useMemo(() => Object.keys(THEMES) as ThemeName[], []);
  const theme = useMemo(() => THEMES[themeName], [themeName]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && (stored === 'minimal' || stored === 'gamer' || stored === 'coach')) {
          setThemeName(stored as ThemeName);
        }
      } catch {
        // ignore read errors
      }
    })();
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(THEME_STORAGE_KEY, name).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, themeName, setTheme, available }),
    [theme, themeName, setTheme, available]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}