import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileStore } from '../store/useProfileStore';

const AVATAR_OPTIONS = [47, 1, 3, 4, 6, 7, 8, 10].map((n) => `https://i.pravatar.cc/300?img=${n}`);

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function EditProfile() {
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const updatePrompt = useProfileStore((s) => s.updatePrompt);

  const [avatar, setAvatar] = useState(profile.avatar);
  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [interests, setInterests] = useState(profile.interests);
  const [values, setValues] = useState(profile.values);
  const [promptAnswers, setPromptAnswers] = useState(profile.prompts.map((p) => p.a));

  const save = () => {
    updateProfile({ avatar, name: name.trim(), tagline: tagline.trim(), interests: interests.trim(), values: values.trim() });
    promptAnswers.forEach((answer, i) => updatePrompt(i, answer.trim()));
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-sand"
        >
          <Ionicons name="close" size={20} color="#3D3D3D" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Edit profile</Text>
        <Pressable onPress={save} className="rounded-full bg-terracotta px-4 py-2">
          <Text className="text-sm font-semibold text-cream">Save</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          <View className="items-center py-4">
            <Image source={{ uri: avatar }} className="h-24 w-24 rounded-full border-4 border-terracotta" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 pb-2"
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
                className="rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Tagline</FieldLabel>
              <TextInput
                value={tagline}
                onChangeText={setTagline}
                placeholder="What are you looking for?"
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Interests</FieldLabel>
              <TextInput
                value={interests}
                onChangeText={setInterests}
                multiline
                className="min-h-[64px] rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Values</FieldLabel>
              <TextInput
                value={values}
                onChangeText={setValues}
                multiline
                className="min-h-[64px] rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>

            {profile.prompts.map((p, i) => (
              <View key={p.q}>
                <FieldLabel>{p.q}</FieldLabel>
                <TextInput
                  value={promptAnswers[i]}
                  onChangeText={(text) =>
                    setPromptAnswers((prev) => prev.map((a, idx) => (idx === i ? text : a)))
                  }
                  multiline
                  className="min-h-[64px] rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
