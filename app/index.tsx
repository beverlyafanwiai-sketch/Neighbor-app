import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { PARK_FRIENDS_SVG } from '../assets/illustrations/park-friends';

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

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
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              placeholder="Email or phone"
              placeholderTextColor="#8a8a8a"
              autoCapitalize="none"
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

          <Pressable
            onPress={() => router.replace('/(tabs)')}
            className="mt-8 items-center rounded-2xl bg-charcoal py-4 active:opacity-80"
          >
            <Text className="text-base font-semibold text-cream">Log in</Text>
          </Pressable>

          <Pressable className="mt-6 items-center">
            <Text className="text-sm text-sand underline">New here? Create an account</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
