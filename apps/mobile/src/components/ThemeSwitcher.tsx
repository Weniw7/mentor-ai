import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeName } from '../theme/tokens';

const EMOJI_BY_THEME: Record<ThemeName, string> = {
  minimal: '🧊',
  gamer: '🎮',
  coach: '🧠',
};

export default function ThemeSwitcher() {
  const { theme, themeName, setTheme, available } = useTheme();

  const styles = useMemo(() => createStyles(), []);

  const headerTextColor = theme.colors.headerText ?? theme.colors.text;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Cambiar tema"
      onPress={() => {
        const currentIndex = available.indexOf(themeName);
        const nextIndex = (currentIndex + 1) % available.length;
        setTheme(available[nextIndex]);
      }}
      style={[styles.button, { borderColor: theme.colors.border }]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={[styles.emoji, { color: headerTextColor }]}>{EMOJI_BY_THEME[themeName]}</Text>
    </TouchableOpacity>
  );
}

function createStyles() {
  return StyleSheet.create({
    button: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 34,
      minHeight: 34,
    },
    emoji: {
      fontSize: 18,
    },
  });
}