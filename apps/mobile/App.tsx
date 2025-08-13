import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { StatusBar } from 'expo-status-bar';

function ThemedStatusBar() {
  const { theme } = useTheme();
  const headerBg = theme.colors.headerBg ?? theme.colors.bg;
  const isDark = colorIsDark(headerBg);
  return <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={headerBg} />;
}

function colorIsDark(hex: string): boolean {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const r = parseInt(c.slice(0, 2), 16) || 0;
  const g = parseInt(c.slice(2, 4), 16) || 0;
  const b = parseInt(c.slice(4, 6), 16) || 0;
  // luminancia relativa
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L < 140;
}

function Root() {
  const { theme } = useTheme();
  const navTheme =
    theme.mode === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: theme.colors.bg,
            card: theme.colors.headerBg ?? theme.colors.bg,
            text: theme.colors.text,
            border: theme.colors.border,
            primary: theme.colors.accent,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.colors.bg,
            card: theme.colors.headerBg ?? theme.colors.bg,
            text: theme.colors.text,
            border: theme.colors.border,
            primary: theme.colors.accent,
          },
        };

  return (
    <NavigationContainer theme={navTheme}>
      <ThemedStatusBar />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}
