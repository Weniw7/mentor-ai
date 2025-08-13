import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/tokens';
import { PERSONA_DEFS } from '../personas/defs';
import { useProfileStore, type Persona, type UserProfile } from '../store/useProfileStore';
import { useNavigation } from '@react-navigation/native';

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const hydrate = useProfileStore(s => s.hydrate);
  const isHydrating = useProfileStore(s => s.isHydrating);
  const profile = useProfileStore(s => s.profile);
  const setPersona = useProfileStore(s => s.setPersona);
  const save = useProfileStore(s => s.save);

  const [step, setStep] = useState<number>(0);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [wake, setWake] = useState<string>('');
  const [sleep, setSleep] = useState<string>('');
  const [goal, setGoal] = useState<string>('');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrating && profile) {
      navigation.reset({ index: 0, routes: [{ name: 'Today' }] });
    }
  }, [isHydrating, profile, navigation]);

  const onSelectPersona = (p: Persona) => {
    setSelectedPersona(p);
    const def = PERSONA_DEFS[p];
    setWake(def.defaultWake);
    setSleep(def.defaultSleep);
    setGoal(def.defaultGoal);
    setPersona(p);
  };

  const goNext = () => setStep((s) => Math.min(2, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const isValidTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

  const onSave = async () => {
    if (!selectedPersona) return;
    const def = PERSONA_DEFS[selectedPersona];
    const profileToSave: UserProfile = {
      persona: selectedPersona,
      goal: goal.trim() || def.defaultGoal,
      wake: isValidTime(wake) ? wake : def.defaultWake,
      sleep: isValidTime(sleep) ? sleep : def.defaultSleep,
      preferredHours: def.defaultPreferredHours,
      energyByHour: def.defaultEnergyByHour,
    };
    await save(profileToSave);
    navigation.reset({ index: 0, routes: [{ name: 'Today' }] });
  };

  if (isHydrating) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {step === 0 && (
        <View>
          <Text style={styles.title}>¿Quién eres?</Text>
          <Text style={styles.helper}>Elige una persona para adaptar tu flujo</Text>
          <View style={styles.grid}>
            {(['emprendedor','fitness','estudio','dieta'] as Persona[]).map((p) => {
              const def = PERSONA_DEFS[p];
              const isSel = selectedPersona === p;
              return (
                <Pressable key={p} onPress={() => onSelectPersona(p)} style={({ pressed }) => [styles.card, isSel && styles.cardSelected, pressed && { transform: [{ scale: theme.effects.pressScale }] } ]}>
                  <Text style={styles.cardTitle}>{p[0].toUpperCase() + p.slice(1)}</Text>
                  <Text style={styles.cardHelper}>{def.blurb}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.rowEnd}>
            <Pressable disabled={!selectedPersona} onPress={goNext} style={({ pressed }) => [styles.btn, styles.btnPrimary, (!selectedPersona || pressed) && { opacity: 0.8 }]}>
              <Text style={[styles.btnText, styles.btnPrimaryText]}>Siguiente</Text>
            </Pressable>
          </View>
        </View>
      )}

      {step === 1 && (
        <View>
          <Text style={styles.title}>Tus horarios</Text>
          <Text style={styles.helper}>Ajusta hora de despertar y dormir</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Despertar</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor={theme.colors.subtext}
              value={wake}
              onChangeText={setWake}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Dormir</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor={theme.colors.subtext}
              value={sleep}
              onChangeText={setSleep}
            />
          </View>

          <View style={styles.rowBetween}>
            <Pressable onPress={goBack} style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && { opacity: 0.8 }]}>
              <Text style={[styles.btnText, styles.btnSecondaryText]}>Atrás</Text>
            </Pressable>
            <Pressable onPress={goNext} style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && { opacity: 0.8 }]}>
              <Text style={[styles.btnText, styles.btnPrimaryText]}>Siguiente</Text>
            </Pressable>
          </View>
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.title}>Tu objetivo</Text>
          <Text style={styles.helper}>Describe en breve (1 línea)</Text>
          <TextInput
            style={styles.input}
            placeholder="p.ej. 2h foco/diario"
            placeholderTextColor={theme.colors.subtext}
            value={goal}
            onChangeText={setGoal}
          />

          <View style={styles.rowBetween}>
            <Pressable onPress={goBack} style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && { opacity: 0.8 }]}>
              <Text style={[styles.btnText, styles.btnSecondaryText]}>Atrás</Text>
            </Pressable>
            <Pressable onPress={onSave} style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && { opacity: 0.8 }]}>
              <Text style={[styles.btnText, styles.btnPrimaryText]}>Guardar y empezar</Text>
            </Pressable>
          </View>
        </View>
      )}
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
    containerCenter: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: theme.typography.h1,
      fontWeight: '700',
      marginBottom: theme.spacing.sm,
      color: theme.colors.text,
      textAlign: 'center',
    },
    helper: {
      fontSize: Math.max(12, theme.typography.body - 2),
      color: theme.colors.subtext,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    card: {
      width: '48%',
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.card,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    cardSelected: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.bg,
    },
    cardTitle: {
      fontSize: theme.typography.body,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    cardHelper: {
      fontSize: Math.max(12, theme.typography.body - 4),
      color: theme.colors.subtext,
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.md,
    },
    rowEnd: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.spacing.md,
    },
    fieldRow: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.body,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.button,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs + 4,
      color: theme.colors.text,
      fontSize: theme.typography.body,
    },
    btn: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 6,
      borderRadius: theme.radii.button,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 140,
    },
    btnText: {
      fontSize: Math.max(12, theme.typography.body - 2),
      fontWeight: '700',
    },
    btnPrimary: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    btnPrimaryText: {
      color: theme.colors.bg,
    },
    btnSecondary: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    btnSecondaryText: {
      color: theme.colors.text,
    },
  });
}