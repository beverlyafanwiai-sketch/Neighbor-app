import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { PARK_FRIENDS_SVG } from '../assets/illustrations/park-friends';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const session = useAuthStore((s) => s.session);
  const signIn = useAuthStore((s) => s.signIn);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) router.replace('/(tabs)');
  }, [session]);

  const handleLogin = async () => {
    clearError();
    setSubmitting(true);
    const ok = await signIn(email, password);
    setSubmitting(false);
    if (ok) router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-terracotta">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="h-[30%] items-center justify-center px-6 pt-4">
          <SvgXml xml={PARK_FRIENDS_SVG} width="100%" height="100%" />
        </View>

        <View className="flex-1 justify-center px-8">
          <Text className="mb-2 text-center text-5xl font-bold text-cream">neighbor</Text>
          <Text className="mb-10 text-center text-base text-sand">
            Real relationships, not performance.
          </Text>

          <View className="gap-4">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#8a8a8a"
              autoCapitalize="none"
              keyboardType="email-address"
              className="rounded-2xl bg-cream px-5 py-4 text-base text-charcoal"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#8a8a8a"
              secureTextEntry
              className="rounded-2xl bg-cream px-5 py-4 text-base text-charcoal"
            />
          </View>

          {error && <Text className="mt-3 text-center text-sm text-cream">{error}</Text>}

          <Pressable
            onPress={handleLogin}
            disabled={submitting}
            className="mt-8 items-center rounded-2xl bg-charcoal py-4 active:opacity-80 disabled:opacity-60"
          >
            {submitting ? (
              <ActivityIndicator color="#F5F2E9" />
            ) : (
              <Text className="text-base font-semibold text-cream">Log in</Text>
            )}
          </Pressable>

          <Pressable className="mt-6 items-center">
            <Text className="text-sm text-sand underline">New here? Create an account</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
