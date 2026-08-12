import '../global.css';
import '../lib/iconTheme';

import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import NotificationToast from '../components/NotificationToast';
import { initAuthListener, useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  const initializing = useAuthStore((s) => s.initializing);

  useEffect(() => {
    initAuthListener();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {initializing && (
        <View className="absolute inset-0 items-center justify-center bg-terracotta">
          <ActivityIndicator className="text-paper" />
        </View>
      )}
      <NotificationToast />
    </SafeAreaProvider>
  );
}
