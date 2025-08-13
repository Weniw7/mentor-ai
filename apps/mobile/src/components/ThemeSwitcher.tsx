import React, { useMemo, useState } from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeName } from '../theme/tokens';

const EMOJI_BY_THEME: Record<ThemeName, string> = {
  minimal: '🧊',
  gamer: '🎮',
  coach: '🧠',
};

export default function ThemeSwitcher() {
  const { theme, themeName, setTheme, available } = useTheme();
  const [open, setOpen] = useState(false);

  const styles = useMemo(() => createStyles(), []);

  const headerTextColor = theme.colors.headerText ?? theme.colors.text;

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[styles.button, { borderColor: theme.colors.border } ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.emoji, { color: headerTextColor }]}>{EMOJI_BY_THEME[themeName]}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Centered overlay container */}
        <View style={styles.overlay}>
          {/* Tap outside to close */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />

          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: theme.radii.card,
              padding: theme.spacing.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              width: 260,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.typography.h2,
                marginBottom: theme.spacing.sm,
                fontWeight: '600',
              }}
            >
              Tema
            </Text>

            {available.map((name) => (
              <TouchableOpacity
                key={name}
                onPress={() => {
                  setTheme(name);
                  setOpen(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: theme.spacing.sm,
                }}
              >
                <Text style={{ fontSize: 20, marginRight: theme.spacing.sm }}>{EMOJI_BY_THEME[name]}</Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.typography.body,
                    fontWeight: name === themeName ? '700' : '400',
                  }}
                >
                  {labelForTheme(name)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

function labelForTheme(name: ThemeName): string {
  switch (name) {
    case 'minimal':
      return 'Minimal';
    case 'gamer':
      return 'Gamer';
    case 'coach':
      return 'Coach';
    default:
      return name;
  }
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
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
  });
}