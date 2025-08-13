import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { useTasksStore, selectTodoTasks } from '../store/useTasksStore';
import { useTheme } from '../theme/ThemeContext';
import { ThemedScreen, ThemedCard, ThemedH1, ThemedText, ThemedSubText } from '../theme/Themed';

export default function TodayScreen() {
  // store
  const brief = useTasksStore((s) => s.brief);
  const todoTasks = useTasksStore(selectTodoTasks);
  const isLoading = useTasksStore((s) => s.isLoading);
  const hydrate = useTasksStore((s) => s.hydrate);
  const markDone = useTasksStore((s) => s.markDone);
  const skip = useTasksStore((s) => s.skip);
  const replan = useTasksStore((s) => s.replan);
  const motivationalQuote = useTasksStore((s) => s.motivationalQuote);
  const history = useTasksStore((s) => s.history);

  // theme
  const { theme } = useTheme();
  const s = useMemo(() => getStyles(theme), [theme]);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayStats = history?.[todayKey] ?? { completed: 0, skipped: 0, totalTimeDone: 0 };

  const handleDone = async (id: string) => {
    setProcessingId(id);
    await markDone(id);
    setTimeout(() => setProcessingId(null), theme.effects.doneFadeMs);
  };

  const handleSkip = async (id: string) => {
    setProcessingId(id);
    await skip(id);
    setTimeout(() => setProcessingId(null), theme.effects.doneFadeMs);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await replan();
    await hydrate();
    setRefreshing(false);
  };

  const header = (
    <View>
      {motivationalQuote ? <ThemedH1 style={s.quote}>{motivationalQuote}</ThemedH1> : null}
      <ThemedH1 style={s.title}>{brief || 'Brief del día'}</ThemedH1>
      <ThemedSubText style={s.todayStats}>
        Hoy: {todayStats.completed} completadas, {todayStats.skipped} skip, {todayStats.totalTimeDone} min ahorrados
      </ThemedSubText>
    </View>
  );

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <ThemedSubText style={s.helperText}>Cargando el brief del día...</ThemedSubText>
        </View>
      );
    }

    return (
      <FlatList
        data={todoTasks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        contentContainerStyle={s.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={s.centered}>
            <ThemedSubText style={s.helperText}>No hay tareas para hoy.</ThemedSubText>
          </View>
        }
        renderItem={({ item }) => (
          <ThemedCard style={s.card}>
            <View style={{ flex: 1 }}>
              <ThemedText style={s.cardTitle}>{item.title}</ThemedText>
              <ThemedSubText style={s.cardSubtitle}>{item.duration} min</ThemedSubText>
            </View>

            <View style={s.cardActions}>
              <Pressable
                style={({ pressed }) => [
                  s.btn,
                  s.btnDone,
                  { transform: [{ scale: pressed ? theme.effects.pressScale : 1 }] },
                ]}
                onPress={() => handleDone(item.id)}
                disabled={processingId === item.id || isLoading}
              >
                <ThemedText style={s.btnDoneText}>Done</ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  s.btn,
                  s.btnSkip,
                  { transform: [{ scale: pressed ? theme.effects.pressScale : 1 }] },
                ]}
                onPress={() => handleSkip(item.id)}
                disabled={processingId === item.id || isLoading}
              >
                <ThemedText style={s.btnSkipText}>Skip</ThemedText>
              </Pressable>
            </View>
          </ThemedCard>
        )}
      />
    );
  }, [isLoading, todoTasks, brief, refreshing, processingId, motivationalQuote, todayStats, s, theme]);

  // ThemedScreen ya pinta el fondo del tema (o imagen si la has puesto en tokens)
  return (
    <ThemedScreen>
      <SafeAreaView style={s.safeArea}>{content}</SafeAreaView>
    </ThemedScreen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: { flex: 1 },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    helperText: {
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    listContainer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    title: {
      marginBottom: theme.spacing.xs,
    },
    quote: {
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: theme.spacing.xs,
    },
    todayStats: {
      marginBottom: theme.spacing.md,
    },
    card: {
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      // la sombra varía menos en RN; mantenemos elevación suave
      shadowColor: '#000',
      shadowOpacity: theme.mode === 'dark' ? 0.25 : 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardTitle: {
      fontWeight: '600',
      marginBottom: 4,
      fontSize: theme.typography.h2,
    },
    cardSubtitle: {
      // ThemedSubText ya gestiona color, aquí solo tamaño si quieres
    },
    cardActions: {
      flexDirection: 'row',
      marginLeft: theme.spacing.sm,
    },
    btn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.radii.button,
      borderWidth: 1,
    },
    btnDone: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(34,197,94,0.15)' : '#e6f6ed',
      borderColor: theme.colors.success,
    },
    btnDoneText: {
      color: theme.colors.success,
      fontWeight: '700',
    },
    btnSkip: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(234,88,12,0.15)' : '#fff5f5',
      borderColor: theme.colors.warning,
      marginLeft: theme.spacing.xs,
    },
    btnSkipText: {
      color: theme.colors.warning,
      fontWeight: '700',
    },
  });
