import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME, THEMES, Theme, ThemeName } from './tokens';

export type ThemeContextValue = {
  themeName: ThemeName;
  theme: Theme;
  setTheme: (name: ThemeName) => void;
};

const THEME_STORAGE_KEY = 'app.theme.name';

const ThemeContext = createContext<ThemeContextValue>({
  themeName: DEFAULT_THEME.name,
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{
  initialThemeName?: ThemeName;
  children: React.ReactNode;
}> = ({ initialThemeName, children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(initialThemeName ?? DEFAULT_THEME.name);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMounted && (stored === 'minimal' || stored === 'gamer' || stored === 'coach')) {
          setThemeName(stored as ThemeName);
        }
      } catch {}
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(THEME_STORAGE_KEY, name).catch(() => {});
  }, []);

  const theme = useMemo(() => THEMES[themeName], [themeName]);
  const value = useMemo<ThemeContextValue>(() => ({ themeName, theme, setTheme }), [themeName, theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  return useContext(ThemeContext);
};

export { ThemeContext };