import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [briefHour, setBriefHour] = useState<string>('08:30');

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  helper: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  timeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  timeText: {
    fontWeight: '600',
    color: '#333',
  },
});