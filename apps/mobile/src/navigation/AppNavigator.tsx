import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TodayScreen from '../screens/TodayScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../theme/ThemeContext';

export type RootStackParamList = {
  Today: undefined;
  Chat: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { theme } = useTheme();
  const headerBg = theme.colors.headerBg ?? theme.colors.bg;

  return (
    <Stack.Navigator
      initialRouteName="Today"
      screenOptions={{
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: theme.colors.headerText ?? theme.colors.text,
        headerShadowVisible: false,
        headerRight: () => <ThemeSwitcher />,
      }}
    >
      <Stack.Screen name="Today" component={TodayScreen} options={{ title: 'Brief del día' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
    </Stack.Navigator>
  );
}