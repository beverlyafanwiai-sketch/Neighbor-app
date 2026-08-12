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

import { ALERT_CATEGORIES, type AlertCategoryValue } from '../data/mock';
import { useAlertsStore } from '../store/useAlertsStore';

const DURATION_OPTIONS: { hours: number; label: string }[] = [
  { hours: 6, label: '6 hours' },
  { hours: 24, label: '24 hours' },
  { hours: 72, label: '3 days' },
];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function CreateAlert() {
  const postAlert = useAlertsStore((s) => s.postAlert);

  const [category, setCategory] = useState<AlertCategoryValue>('lost-pet');
  const [text, setText] = useState('');
  const [durationHours, setDurationHours] = useState(24);

  const canPost = text.trim().length > 0;

  const save = () => {
    if (!canPost) return;
    postAlert({ category, text: text.trim(), durationHours });
    router.replace('/alerts');
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="close" size={20} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Post an alert</Text>
        <Pressable
          onPress={save}
          disabled={!canPost}
          className={`rounded-full px-4 py-2 ${canPost ? 'bg-terracotta' : 'bg-ink/10'}`}
        >
          <Text className={`text-sm font-semibold ${canPost ? 'text-paper' : 'text-charcoal/40'}`}>
            Post
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          <Text className="mt-2 text-sm text-charcoal/60">
            For time-sensitive stuff — this'll disappear on its own once it expires.
          </Text>

          <View className="mt-5 gap-4">
            <View>
              <FieldLabel>Category</FieldLabel>
              <View className="flex-row flex-wrap gap-2">
                {ALERT_CATEGORIES.map((c) => (
                  <Pressable
                    key={c.value}
                    onPress={() => setCategory(c.value)}
                    className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5 ${
                      category === c.value ? 'bg-terracotta' : 'bg-cream'
                    }`}
                  >
                    <Text style={{ fontSize: 14 }}>{c.emoji}</Text>
                    <Text
                      className={`text-xs font-medium ${
                        category === c.value ? 'text-paper' : 'text-charcoal/60'
                      }`}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <FieldLabel>What's going on?</FieldLabel>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Lost dog near 5th & Elm, water main work on Birch St..."
                placeholderTextColor="#3D3D3D80"
                multiline
                autoFocus
                className="min-h-[90px] rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Expires in</FieldLabel>
              <View className="flex-row gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.hours}
                    onPress={() => setDurationHours(opt.hours)}
                    className={`rounded-full px-3.5 py-1.5 ${
                      durationHours === opt.hours ? 'bg-terracotta' : 'bg-cream'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        durationHours === opt.hours ? 'text-paper' : 'text-charcoal/60'
                      }`}
                    >
                      {opt.label}
                    </Text>
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
