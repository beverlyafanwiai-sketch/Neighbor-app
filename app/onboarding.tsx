import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileStore } from '../store/useProfileStore';

const AVATAR_OPTIONS = [1, 3, 4, 6, 7, 8, 10, 47].map((n) => `https://i.pravatar.cc/300?img=${n}`);

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function Onboarding() {
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');

  const canContinue = name.trim().length > 0;

  const finish = () => {
    if (!canContinue) return;
    updateProfile({ avatar, name: name.trim(), tagline: tagline.trim() });
    router.replace('/(tabs)');
  };

  const skip = () => router.replace('/(tabs)');

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-6 pb-10 pt-8">
          <Text className="text-center text-3xl font-bold text-charcoal">Welcome to Neighbor</Text>
          <Text className="mt-2 text-center text-base text-charcoal/60">
            Let's set up your profile so neighbors know who they're meeting.
          </Text>

          <View className="mt-8 items-center">
            <Image source={{ uri: avatar }} className="h-24 w-24 rounded-full border-4 border-terracotta" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="mt-4 gap-3 px-1 pb-2"
          >
            {AVATAR_OPTIONS.map((uri) => (
              <Pressable key={uri} onPress={() => setAvatar(uri)}>
                <Image
                  source={{ uri }}
                  className={`h-14 w-14 rounded-full ${
                    avatar === uri ? 'border-2 border-terracotta' : 'opacity-70'
                  }`}
                />
              </Pressable>
            ))}
          </ScrollView>

          <View className="mt-6 gap-4">
            <View>
              <FieldLabel>Name</FieldLabel>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="What should neighbors call you?"
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Tagline</FieldLabel>
              <TextInput
                value={tagline}
                onChangeText={setTagline}
                placeholder="What are you looking for?"
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>
          </View>

          <Pressable
            onPress={finish}
            disabled={!canContinue}
            className={`mt-8 items-center rounded-2xl py-4 ${
              canContinue ? 'bg-terracotta' : 'bg-charcoal/10'
            }`}
          >
            <Text className={`text-base font-semibold ${canContinue ? 'text-cream' : 'text-charcoal/40'}`}>
              Get started
            </Text>
          </Pressable>

          <Pressable onPress={skip} className="mt-4 items-center">
            <Text className="text-sm text-charcoal/50 underline">Skip for now</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
