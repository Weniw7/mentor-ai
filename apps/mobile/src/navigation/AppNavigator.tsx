import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TodayScreen from '../screens/TodayScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../theme/ThemeContext';
import { useProfileStore } from '../store/useProfileStore';

export type RootStackParamList = {
  Today: undefined;
  Chat: undefined;
  Settings: undefined;
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { theme } = useTheme();
  const headerBg = theme.colors.headerBg ?? theme.colors.bg;

  const isHydrating = useProfileStore(s => s.isHydrating);
  const hydrated = useProfileStore(s => s.hydrated);
  const profile = useProfileStore(s => s.profile);
  const hydrateProfile = useProfileStore(s => s.hydrate);

  useEffect(() => {
    hydrateProfile();
  }, [hydrateProfile]);

  if (isHydrating && !hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: headerBg }}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  const initialRoute = profile ? 'Today' : 'Onboarding';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute as keyof RootStackParamList}
      screenOptions={{
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: theme.colors.headerText ?? theme.colors.text,
        headerShadowVisible: false,
        headerRight: () => <ThemeSwitcher />,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Today" component={TodayScreen} options={{ title: 'Brief del día' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
    </Stack.Navigator>
  );
}