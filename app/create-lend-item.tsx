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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { LendItemKind } from '../data/mock';
import { useLendStore } from '../store/useLendStore';

const KINDS: { value: LendItemKind; label: string; description: string }[] = [
  { value: 'have', label: 'I have this to lend', description: 'Neighbors can request to borrow it' },
  { value: 'want', label: "I'm looking to borrow", description: 'Neighbors can offer to help' },
];

const EMOJI_PRESETS = ['🪜', '🔧', '🪑', '🧰', '🚲', '🍳', '💦', '🏕️', '📦', '🎉'];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function CreateLendItem() {
  const createItem = useLendStore((s) => s.createItem);

  const [kind, setKind] = useState<LendItemKind>('have');
  const [emoji, setEmoji] = useState('📦');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const canSave = title.trim() && note.trim();

  const save = () => {
    if (!canSave) return;
    createItem({ kind, emoji, title: title.trim(), note: note.trim() });
    router.replace('/lend');
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
        <Text className="text-base font-bold text-charcoal">Post an item</Text>
        <Pressable
          onPress={save}
          disabled={!canSave}
          className={`rounded-full px-4 py-2 ${canSave ? 'bg-terracotta' : 'bg-charcoal/10'}`}
        >
          <Text className={`text-sm font-semibold ${canSave ? 'text-cream' : 'text-charcoal/40'}`}>
            Post
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          <View className="mt-2 gap-2">
            {KINDS.map((k) => (
              <Pressable
                key={k.value}
                onPress={() => setKind(k.value)}
                className={`flex-row items-center justify-between rounded-2xl px-4 py-3 ${
                  kind === k.value ? 'bg-terracotta' : 'bg-cream'
                }`}
              >
                <View>
                  <Text
                    className={`text-sm font-semibold ${
                      kind === k.value ? 'text-cream' : 'text-charcoal'
                    }`}
                  >
                    {k.label}
                  </Text>
                  <Text
                    className={`mt-0.5 text-xs ${
                      kind === k.value ? 'text-cream/80' : 'text-charcoal/50'
                    }`}
                  >
                    {k.description}
                  </Text>
                </View>
                {kind === k.value && <Ionicons name="checkmark-circle" size={20} color="#F5F2E9" />}
              </Pressable>
            ))}
          </View>

          <View className="mt-5 gap-4">
            <View>
              <FieldLabel>Icon</FieldLabel>
              <View className="flex-row items-center gap-3">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-cream">
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                  <View className="flex-row gap-2">
                    {EMOJI_PRESETS.map((e) => (
                      <Pressable
                        key={e}
                        onPress={() => setEmoji(e)}
                        className={`h-11 w-11 items-center justify-center rounded-xl ${
                          emoji === e ? 'bg-terracotta/20' : 'bg-cream'
                        }`}
                      >
                        <Text style={{ fontSize: 20 }}>{e}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View>
              <FieldLabel>What is it?</FieldLabel>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ladder, stand mixer, folding tables..."
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>{kind === 'have' ? 'Details for borrowers' : 'Why you need it'}</FieldLabel>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={
                  kind === 'have'
                    ? "Condition, how long it's available, pickup details..."
                    : 'What for, how long, anything helpful to know...'
                }
                placeholderTextColor="#3D3D3D80"
                multiline
                className="min-h-[80px] rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
