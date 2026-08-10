import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Tone } from '../data/mock';
import { useGroupsStore } from '../store/useGroupsStore';

const TONES: { value: Tone; description: string }[] = [
  { value: 'Casual', description: 'Easy-going, drop in whenever' },
  { value: 'Structured', description: 'Regular schedule, clear expectations' },
  { value: 'Activity-focused', description: 'Built around doing one thing together' },
];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function CreateGroup() {
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const existing = useGroupsStore((s) => (editId ? s.groups.find((g) => g.id === editId) : undefined));
  const isEditing = Boolean(existing);
  const createGroup = useGroupsStore((s) => s.createGroup);
  const updateGroup = useGroupsStore((s) => s.updateGroup);

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [tone, setTone] = useState<Tone>(existing?.tone ?? 'Casual');

  const canSave = name.trim() && description.trim();

  const save = () => {
    if (!canSave) return;
    if (existing) {
      updateGroup(existing.id, { name: name.trim(), description: description.trim(), tone });
      router.replace(`/group/${existing.id}`);
      return;
    }
    const id = createGroup({ name: name.trim(), description: description.trim(), tone });
    router.replace(`/group/${id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="close" size={20} color="#3D3D3D" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">
          {isEditing ? 'Edit circle' : 'Start a circle'}
        </Text>
        <Pressable
          onPress={save}
          disabled={!canSave}
          className={`rounded-full px-4 py-2 ${canSave ? 'bg-terracotta' : 'bg-charcoal/10'}`}
        >
          <Text className={`text-sm font-semibold ${canSave ? 'text-cream' : 'text-charcoal/40'}`}>
            {isEditing ? 'Save' : 'Create'}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          <Text className="mt-2 text-sm text-charcoal/60">
            A small circle for people who share something specific — a hobby, a street, a stage of
            life. You'll be the first member.
          </Text>

          <View className="mt-5 gap-4">
            <View>
              <FieldLabel>Name</FieldLabel>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Weekend Hikers, Book & Bourbon..."
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Description</FieldLabel>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What brings this circle together?"
                placeholderTextColor="#3D3D3D80"
                multiline
                className="min-h-[80px] rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Tone</FieldLabel>
              <View className="gap-2">
                {TONES.map((t) => (
                  <Pressable
                    key={t.value}
                    onPress={() => setTone(t.value)}
                    className={`flex-row items-center justify-between rounded-2xl px-4 py-3 ${
                      tone === t.value ? 'bg-terracotta' : 'bg-cream'
                    }`}
                  >
                    <View>
                      <Text
                        className={`text-sm font-semibold ${
                          tone === t.value ? 'text-cream' : 'text-charcoal'
                        }`}
                      >
                        {t.value}
                      </Text>
                      <Text
                        className={`mt-0.5 text-xs ${
                          tone === t.value ? 'text-cream/80' : 'text-charcoal/50'
                        }`}
                      >
                        {t.description}
                      </Text>
                    </View>
                    {tone === t.value && <Ionicons name="checkmark-circle" size={20} color="#F5F2E9" />}
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
