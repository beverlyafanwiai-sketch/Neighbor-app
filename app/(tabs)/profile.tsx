import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { GROUP_SELFIE_SVG } from '../../assets/illustrations/group-selfie';

const TABS = ['About', 'Prompts', 'Photos', 'Friends'] as const;
type Tab = (typeof TABS)[number];

const prompts = [
  { q: 'How I recharge', a: 'A long walk with no destination and no phone.' },
  {
    q: "A belief I hold that not everyone agrees with",
    a: 'Small dinners beat big parties, every time.',
  },
];

const friends = [
  { name: 'Maya', uri: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Theo', uri: 'https://i.pravatar.cc/150?img=33' },
  { name: 'Priya', uri: 'https://i.pravatar.cc/150?img=48' },
  { name: 'Sam', uri: 'https://i.pravatar.cc/150?img=15' },
];

export default function Profile() {
  const [tab, setTab] = useState<Tab>('About');

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center rounded-b-[36px] bg-terracotta pb-8 pt-10">
          <Image
            source={{ uri: 'https://i.pravatar.cc/300?img=47' }}
            className="h-24 w-24 rounded-full border-4 border-cream"
          />
          <Text className="mt-3 text-2xl font-bold text-cream">Amara Ndlovu</Text>
          <Text className="mt-1 text-sm text-sand">Looking for friendship & activity partners</Text>

          <View className="mt-5 flex-row gap-3">
            <Pressable className="rounded-full bg-gold px-6 py-2.5">
              <Text className="font-semibold text-charcoal">Add friend</Text>
            </Pressable>
            <Pressable className="items-center justify-center rounded-full bg-cream/20 px-4 py-2.5">
              <Ionicons name="chatbubble-outline" size={18} color="#F5F2E9" />
            </Pressable>
          </View>
        </View>

        <View className="flex-row justify-around border-b border-charcoal/10 bg-cream px-2 pt-3">
          {TABS.map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} className="items-center pb-3">
              <Text
                className={`text-[15px] ${
                  tab === t ? 'font-semibold text-terracotta' : 'text-charcoal/60'
                }`}
              >
                {t}
              </Text>
              {tab === t && <View className="mt-1.5 h-0.5 w-6 rounded-full bg-terracotta" />}
            </Pressable>
          ))}
        </View>

        <View className="px-5 py-6">
          {tab === 'About' && (
            <View className="gap-4">
              <View className="rounded-2xl bg-sand p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  Interests
                </Text>
                <Text className="mt-1 text-charcoal">
                  Hiking, pottery, board games, slow mornings, live music
                </Text>
              </View>
              <View className="rounded-2xl bg-sand p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  Values
                </Text>
                <Text className="mt-1 text-charcoal">Honesty, follow-through, showing up</Text>
              </View>
              <View className="rounded-2xl bg-sand p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  Trust
                </Text>
                <Text className="mt-1 text-charcoal">
                  6 mutual friends · 3 shared groups · attended 4 events
                </Text>
              </View>
            </View>
          )}

          {tab === 'Prompts' && (
            <View className="gap-4">
              {prompts.map((p) => (
                <View key={p.q} className="rounded-2xl bg-sand p-4">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    {p.q}
                  </Text>
                  <Text className="mt-1 text-[15px] text-charcoal">{p.a}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === 'Photos' && (
            <View className="flex-row flex-wrap gap-3">
              {[18, 24, 31, 44, 52, 61].map((n) => (
                <Image
                  key={n}
                  source={{ uri: `https://picsum.photos/seed/${n}/200/200` }}
                  className="h-[31%] w-[31%] rounded-xl"
                />
              ))}
            </View>
          )}

          {tab === 'Friends' && (
            <View className="gap-3">
              <View className="mb-1 h-32 items-center justify-center">
                <SvgXml xml={GROUP_SELFIE_SVG} width="100%" height="100%" />
              </View>
              {friends.map((f) => (
                <View key={f.name} className="flex-row items-center gap-3 rounded-2xl bg-sand p-3">
                  <Image source={{ uri: f.uri }} className="h-11 w-11 rounded-full" />
                  <Text className="font-medium text-charcoal">{f.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
