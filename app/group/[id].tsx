import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getGroup, getUser } from '../../data/mock';

const TONE_STYLE: Record<string, { bg: string; text: string }> = {
  Casual: { bg: 'bg-sage/20', text: 'text-sage' },
  Structured: { bg: 'bg-terracotta/15', text: 'text-terracotta' },
  'Activity-focused': { bg: 'bg-gold/20', text: 'text-gold' },
};

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = getGroup(id);
  const [joined, setJoined] = useState(group?.joined ?? false);

  if (!group) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="text-charcoal">Group not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-terracotta">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const members = group.memberIds.map((id) => getUser(id)).filter(Boolean);
  const toneStyle = TONE_STYLE[group.tone] ?? TONE_STYLE.Casual;

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} color="#3D3D3D" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        <View className="items-center rounded-3xl bg-cream p-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-terracotta">
            <Text className="text-2xl font-bold text-cream">{group.name.charAt(0)}</Text>
          </View>
          <Text className="mt-3 text-xl font-bold text-charcoal">{group.name}</Text>
          <View className="mt-2 flex-row items-center gap-2">
            <Text className="text-xs text-charcoal/60">{group.memberCount} members</Text>
            <View className={`rounded-full px-2.5 py-1 ${toneStyle.bg}`}>
              <Text className={`text-xs font-semibold ${toneStyle.text}`}>{group.tone}</Text>
            </View>
          </View>
          <Text className="mt-4 text-center text-[15px] leading-5 text-charcoal/80">
            {group.description}
          </Text>

          <Pressable
            onPress={() => setJoined((v) => !v)}
            className={`mt-5 rounded-full px-6 py-3 ${joined ? 'bg-sand' : 'bg-charcoal'}`}
          >
            <Text className={`text-sm font-semibold ${joined ? 'text-charcoal' : 'text-cream'}`}>
              {joined ? 'Leave circle' : 'Join group'}
            </Text>
          </Pressable>
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Members
        </Text>
        <View className="gap-3">
          {members.map((m) => (
            <Pressable
              key={m!.id}
              onPress={() => router.push(`/profile/${m!.id}`)}
              className="flex-row items-center gap-3 rounded-2xl bg-cream p-3 active:opacity-70"
            >
              <Image source={{ uri: m!.avatar }} className="h-11 w-11 rounded-full" />
              <View className="flex-1">
                <Text className="font-medium text-charcoal">{m!.name}</Text>
                <Text className="text-xs text-charcoal/50" numberOfLines={1}>
                  {m!.tagline}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
