import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

interface TaskItem {
  id: string;
  title: string;
  durationMin: number;
}

type ScreenState = 'loading' | 'ready' | 'empty' | 'error';

const MOCK_TASKS: TaskItem[] = [
  { id: '1', title: 'Revisar agenda del día', durationMin: 5 },
  { id: '2', title: 'Plan de enfoque (Deep work)', durationMin: 45 },
  { id: '3', title: 'Chequeo de correos prioritarios', durationMin: 15 },
  { id: '4', title: 'Bloque de movimiento/descanso', durationMin: 10 },
];

export default function TodayScreen() {
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Simular distintos estados. Cambiar el valor para probar.
      const simulate: ScreenState = 'ready'; // 'loading' | 'ready' | 'empty' | 'error'
      if (simulate === 'ready') {
        setTasks(MOCK_TASKS.slice(0, 4));
        setScreenState('ready');
      } else if (simulate === 'empty') {
        setTasks([]);
        setScreenState('empty');
      } else if (simulate === 'error') {
        setScreenState('error');
      } else {
        setScreenState('loading');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const content = useMemo(() => {
    switch (screenState) {
      case 'loading':
        return (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
            <Text style={styles.helperText}>Cargando el brief del día...</Text>
          </View>
        );
      case 'error':
        return (
          <View style={styles.centered}>
            <Text style={styles.errorTitle}>No pudimos cargar tus tareas</Text>
            <Text style={styles.helperText}>Intenta nuevamente más tarde.</Text>
          </View>
        );
      case 'empty':
        return (
          <View style={styles.centered}>
            <Text style={styles.helperText}>No hay tareas para hoy.</Text>
          </View>
        );
      case 'ready':
      default:
        return (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={<Text style={styles.title}>Brief del día</Text>}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.durationMin} min</Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable style={[styles.btn, styles.btnDone]} onPress={() => {}}>
                    <Text style={[styles.btnText, styles.btnDoneText]}>Done</Text>
                  </Pressable>
                  <Pressable style={[styles.btn, styles.btnSkip]} onPress={() => {}}>
                    <Text style={[styles.btnText, styles.btnSkipText]}>Skip</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        );
    }
  }, [screenState, tasks]);

  return (
    <SafeAreaView style={styles.container}>{content}</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  helperText: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#c00',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  btnDone: {
    backgroundColor: '#e6f6ed',
    borderColor: '#2ea043',
  },
  btnDoneText: {
    color: '#2ea043',
  },
  btnSkip: {
    backgroundColor: '#fff5f5',
    borderColor: '#d93025',
    marginLeft: 8,
  },
  btnSkipText: {
    color: '#d93025',
  },
});