import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ME, getUser } from '../../data/mock';
import { memberCountLabel, useGroupsStore } from '../../store/useGroupsStore';
import { useProfileStore } from '../../store/useProfileStore';

const TONE_STYLE: Record<string, { bg: string; text: string }> = {
  Casual: { bg: 'bg-sage/20', text: 'text-sage' },
  Structured: { bg: 'bg-terracotta/15', text: 'text-terracotta' },
  'Activity-focused': { bg: 'bg-gold/20', text: 'text-gold' },
};

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = useGroupsStore((s) => s.groups.find((g) => g.id === id));
  const profile = useProfileStore((s) => s.profile);
  const joined = useGroupsStore((s) => (group ? (s.joined[group.id] ?? false) : false));
  const toggleJoin = useGroupsStore((s) => s.toggle);
  const deleteGroup = useGroupsStore((s) => s.deleteGroup);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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

  const otherMembers = group.memberIds.map((id) => getUser(id)).filter(Boolean);
  const members = joined ? [profile, ...otherMembers] : otherMembers;
  const toneStyle = TONE_STYLE[group.tone] ?? TONE_STYLE.Casual;
  const isCreator = group.createdBy === ME.id;

  const remove = () => {
    deleteGroup(group.id);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} color="#3D3D3D" />
        </Pressable>
        {isCreator && (
          <View className="flex-row items-center gap-1.5">
            <Pressable
              onPress={() => router.push(`/create-group?id=${group.id}`)}
              className="h-9 w-9 items-center justify-center rounded-full bg-cream"
            >
              <Ionicons name="pencil" size={17} color="#3D3D3D" />
            </Pressable>
            <Pressable
              onPress={() => setConfirmingDelete(true)}
              className="h-9 w-9 items-center justify-center rounded-full bg-cream"
            >
              <Ionicons name="trash-outline" size={17} color="#E0533C" />
            </Pressable>
          </View>
        )}
      </View>

      {confirmingDelete && (
        <View className="flex-row items-center gap-3 bg-terracotta/10 px-4 py-3">
          <Text className="flex-1 text-sm text-charcoal">
            Delete this circle? This can't be undone.
          </Text>
          <Pressable onPress={() => setConfirmingDelete(false)} className="rounded-full px-3 py-1.5">
            <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
          </Pressable>
          <Pressable onPress={remove} className="rounded-full bg-terracotta px-3 py-1.5">
            <Text className="text-sm font-semibold text-cream">Delete</Text>
          </Pressable>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        {group.coverImageUri && (
          <Image
            source={{ uri: group.coverImageUri }}
            className="mb-4 w-full rounded-3xl"
            style={{ aspectRatio: 2 }}
          />
        )}
        <View className="items-center rounded-3xl bg-cream p-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-terracotta">
            <Text className="text-2xl font-bold text-cream">{group.name.charAt(0)}</Text>
          </View>
          <Text className="mt-3 text-xl font-bold text-charcoal">{group.name}</Text>
          <View className="mt-2 flex-row items-center gap-2">
            <Text className="text-xs text-charcoal/60">
              {memberCountLabel(group.id, joined)}
            </Text>
            <View className={`rounded-full px-2.5 py-1 ${toneStyle.bg}`}>
              <Text className={`text-xs font-semibold ${toneStyle.text}`}>{group.tone}</Text>
            </View>
          </View>
          <Text className="mt-4 text-center text-[15px] leading-5 text-charcoal/80">
            {group.description}
          </Text>

          <View className="mt-5 flex-row gap-3">
            <Pressable
              onPress={() => toggleJoin(group.id)}
              className={`rounded-full px-6 py-3 ${joined ? 'bg-sand' : 'bg-charcoal'}`}
            >
              <Text className={`text-sm font-semibold ${joined ? 'text-charcoal' : 'text-cream'}`}>
                {joined ? 'Leave circle' : 'Join group'}
              </Text>
            </Pressable>
            {joined && (
              <Pressable
                onPress={() => router.push(`/group-chat/${group.id}`)}
                className="flex-row items-center gap-1.5 rounded-full bg-terracotta px-6 py-3"
              >
                <Ionicons name="chatbubbles-outline" size={16} color="#F5F2E9" />
                <Text className="text-sm font-semibold text-cream">Group chat</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Members
        </Text>
        <View className="gap-3">
          {members.map((m) => {
            const isMe = m!.id === ME.id;
            return (
              <Pressable
                key={m!.id}
                onPress={() => !isMe && router.push(`/profile/${m!.id}`)}
                className="flex-row items-center gap-3 rounded-2xl bg-cream p-3 active:opacity-70"
              >
                <Image source={{ uri: m!.avatar }} className="h-11 w-11 rounded-full" />
                <View className="flex-1">
                  <Text className="font-medium text-charcoal">{isMe ? 'You' : m!.name}</Text>
                  <Text className="text-xs text-charcoal/50" numberOfLines={1}>
                    {m!.tagline}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
