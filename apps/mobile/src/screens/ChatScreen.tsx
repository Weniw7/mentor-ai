import React, { useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/tokens';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', role: 'assistant', content: '¡Hola! ¿Listo para tu brief de hoy?' },
  { id: '2', role: 'user', content: 'Sí, muéstrame las tareas.' },
  { id: '3', role: 'assistant', content: 'Tienes 4 tareas: agenda, enfoque, correos y descanso.' },
];

export default function ChatScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={MOCK_MESSAGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
            <Text style={styles.bubbleText}>{item.content}</Text>
          </View>
        )}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={theme.colors.subtext}
            editable={false}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    messagesContainer: {
      padding: theme.spacing.md,
    },
    bubble: {
      maxWidth: '80%',
      paddingHorizontal: theme.spacing.sm + 4,
      paddingVertical: theme.spacing.xs + 4,
      borderRadius: theme.radii.card,
      marginBottom: theme.spacing.sm + 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.card,
    },
    assistantBubble: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.card,
    },
    bubbleText: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    input: {
      flex: 1,
      height: 40,
      paddingHorizontal: theme.spacing.sm,
      color: theme.colors.text,
      fontSize: theme.typography.body,
    },
  });
}