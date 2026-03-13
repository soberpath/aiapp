import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppStore } from '../src/store/appStore';

export default function RootLayout() {
  const { loadAll, loadSettings } = useAppStore();

  useEffect(() => {
    // Load local SQLite data on startup
    Promise.all([loadAll(), loadSettings()]).catch(err =>
      console.error('Failed to initialize app data:', err)
    );
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="client/[id]" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
