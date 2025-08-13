import React, { useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/tokens';
import { parseIntent } from '../ai/intent';
import { useTasksStore } from '../store/useTasksStore';

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

  const replan = useTasksStore(s => s.replan);
  const setMuteFor = useTasksStore(s => s.setMuteFor);

  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState<string>('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const appendMessage = (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const idBase = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    appendMessage({ id: `${idBase}-u`, role: 'user', content: text });
    setInput('');

    const intent = parseIntent(text);
    const applied: string[] = [];

    if (typeof intent.timeBudget === 'number' && intent.timeBudget > 0) {
      applied.push(`replan ${intent.timeBudget} min`);
      try {
        await replan({ timeBudget: intent.timeBudget, focusTag: intent.focusTag });
      } catch {}
    }
    if (typeof intent.muteMins === 'number' && intent.muteMins > 0) {
      applied.push(`silencio ${intent.muteMins} min`);
      try {
        await setMuteFor(intent.muteMins);
      } catch {}
    }
    if (intent.focusTag && !applied.some(p => p.includes('replan'))) {
      applied.push(`foco ${intent.focusTag}`);
      // Nota: El foco se pasará a replan si también hay timeBudget; aquí solo lo comunicamos
    }

    const reply = applied.length > 0
      ? `Hecho: ${applied.join(', ')}.`
      : 'Entendido.';
    appendMessage({ id: `${idBase}-a`, role: 'assistant', content: reply });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        data={messages}
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
            editable
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>Enviar</Text>
          </Pressable>
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
      height: theme.spacing.lg + theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      color: theme.colors.text,
      fontSize: theme.typography.body,
    },
    sendBtn: {
      marginLeft: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: theme.spacing.xs + 2,
      borderRadius: theme.radii.button,
      backgroundColor: theme.colors.accent,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sendBtnText: {
      color: theme.colors.bg,
      fontWeight: '700',
      fontSize: theme.typography.body,
    },
  });
}