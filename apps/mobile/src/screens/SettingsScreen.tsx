import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/tokens';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [briefHour, setBriefHour] = useState<string>('08:30');
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Preferencias</Text>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Notificaciones</Text>
          <Text style={styles.helper}>Activar recordatorios para el brief</Text>
        </View>
        <Switch value={notificationsEnabled} onValueChange={() => setNotificationsEnabled((v) => !v)} disabled />
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Hora del brief</Text>
          <Text style={styles.helper}>Selecciona una hora (mock)</Text>
        </View>
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{briefHour}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      padding: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.h1,
      fontWeight: '700',
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
    },
    row: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.card,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    label: {
      fontSize: theme.typography.body,
      fontWeight: '600',
      color: theme.colors.text,
    },
    helper: {
      fontSize: Math.max(12, theme.typography.body - 4),
      color: theme.colors.subtext,
      marginTop: theme.spacing.xs,
    },
    timeBadge: {
      paddingHorizontal: theme.spacing.sm + 4,
      paddingVertical: theme.spacing.xs + 2,
      backgroundColor: theme.colors.bg,
      borderRadius: theme.radii.button,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    timeText: {
      fontWeight: '600',
      color: theme.colors.text,
      fontSize: theme.typography.body,
    },
  });
}