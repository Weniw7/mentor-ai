import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTasksStore, selectTodoTasks } from '../store/useTasksStore';

export default function TodayScreen() {
  const brief = useTasksStore(s => s.brief);
  const todoTasks = useTasksStore(selectTodoTasks);
  const isLoading = useTasksStore(s => s.isLoading);
  const hydrate = useTasksStore(s => s.hydrate);
  const markDone = useTasksStore(s => s.markDone);
  const skip = useTasksStore(s => s.skip);
  const replan = useTasksStore(s => s.replan);
  const motivationalQuote = useTasksStore(s => s.motivationalQuote);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleDone = async (id: string) => {
    setProcessingId(id);
    await markDone(id);
    setTimeout(() => setProcessingId(null), 250);
  };

  const handleSkip = async (id: string) => {
    setProcessingId(id);
    await skip(id);
    setTimeout(() => setProcessingId(null), 250);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await replan();
    await hydrate();
    setRefreshing(false);
  };

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.helperText}>Cargando el brief del día...</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={todoTasks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {motivationalQuote ? <Text style={styles.quote}>{motivationalQuote}</Text> : null}
            <Text style={styles.title}>{brief || 'Brief del día'}</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.helperText}>No hay tareas para hoy.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.duration} min</Text>
            </View>
            <View style={styles.cardActions}>
              <Pressable
                style={[styles.btn, styles.btnDone]}
                onPress={() => handleDone(item.id)}
                disabled={processingId === item.id || isLoading}
              >
                <Text style={[styles.btnText, styles.btnDoneText]}>Done</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnSkip]}
                onPress={() => handleSkip(item.id)}
                disabled={processingId === item.id || isLoading}
              >
                <Text style={[styles.btnText, styles.btnSkipText]}>Skip</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    );
  }, [isLoading, todoTasks, brief, refreshing, processingId, motivationalQuote]);

  return <SafeAreaView style={styles.container}>{content}</SafeAreaView>;
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
  quote: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222',
    fontStyle: 'italic',
    marginBottom: 8,
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