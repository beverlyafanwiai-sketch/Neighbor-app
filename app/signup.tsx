import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { PARK_FRIENDS_SVG } from '../assets/illustrations/park-friends';
import { RESORT_FUN_SVG } from '../assets/illustrations/resort-fun';
import { useAuthStore } from '../store/useAuthStore';
import { useBackgroundStore } from '../store/useBackgroundStore';

export default function Signup() {
  const session = useAuthStore((s) => s.session);
  const signUp = useAuthStore((s) => s.signUp);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const background = useBackgroundStore((s) => s.background);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mismatchError, setMismatchError] = useState(false);

  useEffect(() => {
    if (session) router.replace('/onboarding');
  }, [session]);

  const handleSignup = async () => {
    clearError();
    if (password !== confirmPassword) {
      setMismatchError(true);
      return;
    }
    setMismatchError(false);
    setSubmitting(true);
    const ok = await signUp(email, password);
    setSubmitting(false);
    if (ok) router.replace('/onboarding');
  };

  const isCustom = background.kind === 'custom';
  const preset = background.kind === 'preset' ? background.id : 'neighbor';
  const showFullBleedPhoto = isCustom || preset === 'photo';
  const photoSource =
    background.kind === 'custom' ? { uri: background.uri } : require('../assets/images/resort-friends.jpg');
  const bgColorClass = preset === 'resort' ? 'bg-[#5A9F98]' : 'bg-terracotta';
  const illustration = preset === 'resort' ? RESORT_FUN_SVG : PARK_FRIENDS_SVG;

  return (
    <SafeAreaView className={`flex-1 ${showFullBleedPhoto ? 'bg-ink' : bgColorClass}`}>
      {showFullBleedPhoto && (
        <>
          <Image source={photoSource} resizeMode="cover" className="absolute inset-0 h-full w-full" />
          <View className="absolute inset-0 bg-ink/55" />
        </>
      )}

      <Pressable
        onPress={() => router.back()}
        className="z-10 ml-4 mt-2 h-9 w-9 items-center justify-center rounded-full bg-cream/20"
      >
        <Ionicons name="chevron-back" size={22} className="text-paper" />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {!showFullBleedPhoto && (
          <View className="h-[24%] items-center justify-center px-6">
            <SvgXml xml={illustration} width="100%" height="100%" />
          </View>
        )}

        <View className="flex-1 justify-center px-8">
          <Text className="mb-2 text-center text-3xl font-bold text-paper">
            Create an account
          </Text>
          <Text className="mb-10 text-center text-base text-sand">
            Join a neighborhood that shows up for each other.
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
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor="#8a8a8a"
              secureTextEntry
              className="rounded-2xl bg-cream px-5 py-4 text-base text-charcoal"
            />
          </View>

          {mismatchError && (
            <Text className="mt-3 text-center text-sm text-paper">Passwords don't match.</Text>
          )}
          {error && <Text className="mt-3 text-center text-sm text-paper">{error}</Text>}

          <Pressable
            onPress={handleSignup}
            disabled={submitting}
            className="mt-8 items-center rounded-2xl bg-ink py-4 active:opacity-80 disabled:opacity-60"
          >
            {submitting ? (
              <ActivityIndicator className="text-paper" />
            ) : (
              <Text className="text-base font-semibold text-paper">Create account</Text>
            )}
          </Pressable>

          <Text className="mt-5 text-center text-xs leading-5 text-sand/80">
            By creating an account, you agree to our{' '}
            <Text onPress={() => router.push('/terms')} className="underline text-sand">
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text onPress={() => router.push('/privacy-policy')} className="underline text-sand">
              Privacy Policy
            </Text>
            .
          </Text>

          <Pressable onPress={() => router.back()} className="mt-6 items-center">
            <Text className="text-sm text-sand underline">Already have an account? Log in</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
