import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <ThemedStatusBar />
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}

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
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 140;
}
