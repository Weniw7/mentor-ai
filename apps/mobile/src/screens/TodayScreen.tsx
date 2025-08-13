import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTasksStore } from '../store/useTasksStore';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/tokens';

export default function TodayScreen() {
  const brief = useTasksStore(s => s.brief);
  const tasks = useTasksStore(s => s.tasks);
  const isLoading = useTasksStore(s => s.isLoading);
  const hydrate = useTasksStore(s => s.hydrate);
  const markDone = useTasksStore(s => s.markDone);
  const skip = useTasksStore(s => s.skip);
  const replan = useTasksStore(s => s.replan);
  const motivationalQuote = useTasksStore(s => s.motivationalQuote);
  const history = useTasksStore(s => s.history);

  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Animated refs per item for Done effect
  const animRefs = useRef(new Map<string, { opacity: Animated.Value; scale: Animated.Value }>());
  const getAnim = (id: string) => {
    let ref = animRefs.current.get(id);
    if (!ref) {
      ref = { opacity: new Animated.Value(1), scale: new Animated.Value(1) };
      animRefs.current.set(id, ref);
    }
    return ref;
  };

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const todoTasks = useMemo(
    () => tasks.filter(t => t.status === 'todo'),
    [tasks]
  );

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayStats = history?.[todayKey] ?? { completed: 0, skipped: 0, totalTimeDone: 0 };

  const handleDone = async (id: string) => {
    setProcessingId(id);

    const anim = getAnim(id);
    Animated.parallel([
      Animated.timing(anim.opacity, {
        toValue: 0,
        duration: theme.effects.doneFadeMs,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(anim.scale, {
        toValue: theme.effects.pressScale,
        duration: theme.effects.doneFadeMs,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(async () => {
      await markDone(id);
      setProcessingId(null);
    });
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

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
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
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.title}>{brief || 'Brief del día'}</Text>
                  <Pressable
                    style={({ pressed }) => [styles.btn, styles.btnReplan, pressed && { transform: [{ scale: theme.effects.pressScale }] }]}
                    onPress={onRefresh}
                    disabled={refreshing || isLoading}
                  >
                    <Text style={[styles.btnText, styles.btnReplanText]}>{refreshing ? '...' : 'Replan'}</Text>
                  </Pressable>
                </View>
                <Text style={styles.todayStats}>
                  Hoy: {todayStats.completed} completadas, {todayStats.skipped} skip, {todayStats.totalTimeDone} min ahorrados
                </Text>
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
            renderItem={({ item }) => {
              const anim = getAnim(item.id);
              return (
                <Animated.View style={[styles.card, { opacity: anim.opacity, transform: [{ scale: anim.scale }] }] }>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>{item.duration} min</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <Pressable
                      style={({ pressed }) => [styles.btn, styles.btnDone, pressed && { transform: [{ scale: theme.effects.pressScale }] }]}
                      onPress={() => handleDone(item.id)}
                      disabled={processingId === item.id || isLoading}
                    >
                      <Text style={[styles.btnText, styles.btnDoneText]}>Done</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.btn, styles.btnSkip, pressed && { transform: [{ scale: theme.effects.pressScale }] }]}
                      onPress={() => handleSkip(item.id)}
                      disabled={processingId === item.id || isLoading}
                    >
                      <Text style={[styles.btnText, styles.btnSkipText]}>Skip</Text>
                    </Pressable>
                  </View>
                </Animated.View>
              );
            }}
          />
        );
  }, [isLoading, todoTasks, brief, refreshing, processingId, motivationalQuote, todayStats, styles, theme.effects.doneFadeMs, theme.effects.pressScale, theme.colors.accent]);

  return <SafeAreaView style={styles.container}>{content}</SafeAreaView>;
}

function getStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    helperText: {
      marginTop: theme.spacing.xs,
      color: theme.colors.subtext,
      textAlign: 'center',
      fontSize: theme.typography.body,
    },
    listContainer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.h1,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
    },
    quote: {
      fontSize: theme.typography.h2,
      fontWeight: '700',
      textAlign: 'center',
      color: theme.colors.text,
      fontStyle: 'italic',
      marginBottom: theme.spacing.sm,
    },
    todayStats: {
      fontSize: theme.typography.body,
      color: theme.colors.subtext,
      marginBottom: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.card,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.text,
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardTitle: {
      fontSize: theme.typography.body,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    cardSubtitle: {
      fontSize: Math.max(12, theme.typography.body - 2),
      color: theme.colors.subtext,
    },
    cardActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    btn: {
      paddingHorizontal: theme.spacing.sm + 4,
      paddingVertical: theme.spacing.xs + 4,
      borderRadius: theme.radii.button,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnText: {
      fontSize: Math.max(12, theme.typography.body - 2),
      fontWeight: '600',
    },
    btnDone: {
      backgroundColor: hexWithAlpha(theme.colors.success, 0.12),
      borderColor: theme.colors.success,
    },
    btnDoneText: {
      color: theme.colors.success,
    },
    btnSkip: {
      backgroundColor: hexWithAlpha(theme.colors.warning, 0.12),
      borderColor: theme.colors.warning,
      marginLeft: theme.spacing.xs,
    },
    btnSkipText: {
      color: theme.colors.warning,
    },
    btnReplan: {
      backgroundColor: hexWithAlpha(theme.colors.accent, 0.12),
      borderColor: theme.colors.accent,
    },
    btnReplanText: {
      color: theme.colors.accent,
    },
  });
}

function hexWithAlpha(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  const aa = a.toString(16).padStart(2, '0').toUpperCase();
  return `#${c}${aa}`;
}