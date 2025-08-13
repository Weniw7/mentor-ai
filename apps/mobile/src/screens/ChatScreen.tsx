import React from 'react';
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

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
          <TextInput style={styles.input} placeholder="Escribe un mensaje..." editable={false} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  messagesContainer: {
    padding: 16,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  bubbleText: {
    color: '#111',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
  },
});