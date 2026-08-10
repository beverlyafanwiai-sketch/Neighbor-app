import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getUser } from '../../data/mock';
import { memberCountLabel, useGroupsStore } from '../../store/useGroupsStore';
import { useProfileStore } from '../../store/useProfileStore';

const TONE_STYLE: Record<string, { bg: string; text: string }> = {
  Casual: { bg: 'bg-sage/20', text: 'text-sage' },
  Structured: { bg: 'bg-terracotta/15', text: 'text-terracotta' },
  'Activity-focused': { bg: 'bg-gold/20', text: 'text-gold' },
};

function ToneTag({ tone }: { tone: string }) {
  const style = TONE_STYLE[tone] ?? TONE_STYLE.Casual;
  return (
    <View className={`rounded-full px-2.5 py-1 ${style.bg}`}>
      <Text className={`text-xs font-semibold ${style.text}`}>{tone}</Text>
    </View>
  );
}

export default function Groups() {
  const profile = useProfileStore((s) => s.profile);
  const groups = useGroupsStore((s) => s.groups);
  const joinedMap = useGroupsStore((s) => s.joined);
  const toggleJoin = useGroupsStore((s) => s.toggle);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const matches = (g: (typeof groups)[number]) =>
    q.length === 0 ||
    g.name.toLowerCase().includes(q) ||
    g.description.toLowerCase().includes(q);

  const circles = groups.filter((g) => joinedMap[g.id] && matches(g));
  const discover = groups.filter((g) => !joinedMap[g.id] && matches(g));

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-charcoal">Groups</Text>
        <Pressable
          onPress={() => router.push('/create-group')}
          className="h-10 w-10 items-center justify-center rounded-full bg-terracotta"
        >
          <Ionicons name="add" size={22} color="#F5F2E9" />
        </Pressable>
      </View>

      <View className="px-5 pb-3">
        <View className="flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} color="#3D3D3D80" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search groups..."
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#3D3D3D80" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        <Text className="mb-3 mt-2 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Your circles
        </Text>
        <View className="gap-3">
          {circles.map((c) => {
            const otherAvatars = c.memberIds.map((id) => getUser(id)).filter(Boolean);
            const avatars = [profile, ...otherAvatars];
            return (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/group/${c.id}`)}
                className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-terracotta">
                  <Text className="text-lg font-bold text-cream">{c.name.charAt(0)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-charcoal">{c.name}</Text>
                  <View className="mt-1.5 flex-row items-center gap-2">
                    <Text className="text-xs text-charcoal/60">
                      {memberCountLabel(c.id, true)}
                    </Text>
                    <ToneTag tone={c.tone} />
                  </View>
                </View>
                <View className="items-end gap-1.5">
                  <View className="flex-row">
                    {avatars.map((a, i) => (
                      <Image
                        key={a!.id}
                        source={{ uri: a!.avatar }}
                        className="h-6 w-6 rounded-full border-2 border-cream"
                        style={{ marginLeft: i === 0 ? 0 : -8 }}
                      />
                    ))}
                  </View>
                  {c.unread > 0 && (
                    <View className="h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5">
                      <Text className="text-[11px] font-bold text-charcoal">{c.unread}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
          {circles.length === 0 && (
            <Text className="text-sm text-charcoal/50">
              {q.length > 0
                ? `No circles matching "${query.trim()}"`
                : "You haven't joined any circles yet — take a look at Discover below."}
            </Text>
          )}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Discover
        </Text>
        <View className="gap-3">
          {discover.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => router.push(`/group/${g.id}`)}
              className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-sage">
                <Text className="text-lg font-bold text-cream">{g.name.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-charcoal">{g.name}</Text>
                <View className="mt-1.5 flex-row items-center gap-2">
                  <Text className="text-xs text-charcoal/60">
                    {memberCountLabel(g.id, false)}
                  </Text>
                  <ToneTag tone={g.tone} />
                </View>
              </View>
              <Pressable
                onPress={(evt) => {
                  evt.stopPropagation();
                  toggleJoin(g.id);
                }}
                className="rounded-full bg-charcoal px-4 py-2"
              >
                <Text className="text-xs font-semibold text-cream">Join</Text>
              </Pressable>
            </Pressable>
          ))}
          {discover.length === 0 && (
            <Text className="text-sm text-charcoal/50">
              {q.length > 0
                ? `No groups matching "${query.trim()}"`
                : "You've joined every group in your area — nice work."}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
