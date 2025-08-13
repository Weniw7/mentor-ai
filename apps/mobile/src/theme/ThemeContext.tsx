import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME, THEMES, Theme, ThemeName } from './tokens';

type Ctx = {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  available: ThemeName[];
};

const ThemeCtx = createContext<Ctx>({
  theme: DEFAULT_THEME,
  themeName: 'minimal',
  setTheme: () => {},
  available: ['minimal', 'gamer', 'coach'],
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('minimal');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('mentorai:theme');
        if (saved && (saved === 'minimal' || saved === 'gamer' || saved === 'coach')) {
          setThemeName(saved as ThemeName);
        }
      } catch {}
    })();
  }, []);

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    try {
      await AsyncStorage.setItem('mentorai:theme', name);
    } catch {}
  };

  const value: Ctx = {
    theme: THEMES[themeName],
    themeName,
    setTheme,
    available: ['minimal', 'gamer', 'coach'],
  };

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
