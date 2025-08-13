import React, { ReactNode } from 'react';
import { View, Text, ViewProps, TextProps, Pressable, PressableProps, StyleSheet, ImageBackground } from 'react-native';
import { useTheme } from './ThemeContext';

export function ThemedView(props: ViewProps) {
  const { theme } = useTheme();
  return <View {...props} style={[{ backgroundColor: theme.colors.bg }, props.style]} />;
}

export function ThemedCard(props: ViewProps) {
  const { theme } = useTheme();
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radii.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.md,
        },
        props.style,
      ]}
    />
  );
}

export function ThemedText({ style, ...rest }: TextProps) {
  const { theme } = useTheme();
  return <Text {...rest} style={[{ color: theme.colors.text, fontSize: theme.typography.body }, style]} />;
}

export function ThemedSubText({ style, ...rest }: TextProps) {
  const { theme } = useTheme();
  return <Text {...rest} style={[{ color: theme.colors.subtext, fontSize: theme.typography.body }, style]} />;
}

export function ThemedH1({ style, ...rest }: TextProps) {
  const { theme } = useTheme();
  return <Text {...rest} style={[{ color: theme.colors.text, fontSize: theme.typography.h1, fontWeight: '700' }, style]} />;
}

export function ThemedButton({ style, children, ...rest }: PressableProps & { children?: ReactNode }) {
  const { theme } = useTheme();
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        {
          backgroundColor: theme.colors.accent,
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: theme.radii.button,
          transform: [{ scale: pressed ? theme.effects.pressScale : 1 }],
        },
        style as any,
      ]}
    >
      <ThemedText style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>{children}</ThemedText>
    </Pressable>
  );
}

// Contenedor de pantalla con bg por tema (imagen opcional)
export function ThemedScreen({ children, style }: { children: ReactNode; style?: any }) {
  const { theme } = useTheme();
  if (theme.bgImage) {
    return (
      <ImageBackground source={theme.bgImage} style={[styles.flex, style]} resizeMode="cover">
        {children}
      </ImageBackground>
    );
  }
  return <View style={[styles.flex, { backgroundColor: theme.colors.bg }, style]}>{children}</View>;
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
