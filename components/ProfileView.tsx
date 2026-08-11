import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';

import { GROUP_SELFIE_SVG } from '../assets/illustrations/group-selfie';
import type { User, VerificationBadge } from '../data/mock';
import { useFriendsStore } from '../store/useFriendsStore';

const TABS = ['About', 'Prompts', 'Photos', 'Friends'] as const;
type Tab = (typeof TABS)[number];

const VERIFICATION_META: Record<
  VerificationBadge,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  id: { label: 'ID Verified', icon: 'card-outline' },
  phone: { label: 'Phone Verified', icon: 'call-outline' },
  social: { label: 'Social Linked', icon: 'link-outline' },
};

const CONVERSATION_STARTER_META: {
  key: keyof User['conversationStarters'];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'askMeAbout', label: 'Ask me about...', icon: 'chatbubbles-outline' },
  { key: 'skillsToShare', label: 'Skills I can share', icon: 'bulb-outline' },
  { key: 'neighborhoodLove', label: 'Things I love about our neighborhood', icon: 'heart-outline' },
];

type Props = {
  user: User;
  isMe: boolean;
  friends: User[];
  onBack?: () => void;
  onMessage?: () => void;
  onFriendPress?: (friend: User) => void;
  onEdit?: () => void;
  onSettings?: () => void;
  onMoreOptions?: () => void;
  onSavedPosts?: () => void;
};

export default function ProfileView({
  user,
  isMe,
  friends,
  onBack,
  onMessage,
  onFriendPress,
  onEdit,
  onSettings,
  onMoreOptions,
  onSavedPosts,
}: Props) {
  const [tab, setTab] = useState<Tab>('About');
  const isFriend = useFriendsStore((s) => s.friendIds[user.id] ?? false);
  const toggleFriend = useFriendsStore((s) => s.toggle);

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-cream">
      <View className="items-center rounded-b-[36px] bg-terracotta pb-8 pt-10">
        {onBack && (
          <Pressable
            onPress={onBack}
            className="absolute left-4 top-10 h-9 w-9 items-center justify-center rounded-full bg-cream/20"
          >
            <Ionicons name="chevron-back" size={22} color="#F5F2E9" />
          </Pressable>
        )}
        {isMe && (onSettings || onSavedPosts) && (
          <View className="absolute right-4 top-10 flex-row items-center gap-1.5">
            {onSavedPosts && (
              <Pressable
                onPress={onSavedPosts}
                className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="bookmark-outline" size={19} color="#F5F2E9" />
              </Pressable>
            )}
            {onSettings && (
              <Pressable
                onPress={onSettings}
                className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="settings-outline" size={20} color="#F5F2E9" />
              </Pressable>
            )}
          </View>
        )}
        {!isMe && onMoreOptions && (
          <Pressable
            onPress={onMoreOptions}
            className="absolute right-4 top-10 h-9 w-9 items-center justify-center rounded-full bg-cream/20"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#F5F2E9" />
          </Pressable>
        )}
        <Image
          source={{ uri: user.avatar }}
          className="h-24 w-24 rounded-full border-4 border-cream"
        />
        <Text className="mt-3 text-2xl font-bold text-cream">{user.name}</Text>
        <Text className="mt-1 text-sm text-sand">{user.tagline}</Text>

        {user.neighborhood.length > 0 && (
          <View className="mt-2 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={13} color="#F4E9CD" />
            <Text className="text-xs text-sand">
              {user.neighborhood}
              {user.yearsInArea ? ` · ${user.yearsInArea}` : ''}
            </Text>
          </View>
        )}

        {user.verifications.length > 0 && (
          <View className="mt-3 flex-row flex-wrap justify-center gap-1.5 px-6">
            {user.verifications.map((v) => (
              <View
                key={v}
                className="flex-row items-center gap-1 rounded-full bg-cream/20 px-2.5 py-1"
              >
                <Ionicons name={VERIFICATION_META[v].icon} size={11} color="#F5F2E9" />
                <Text className="text-[10px] font-semibold text-cream">
                  {VERIFICATION_META[v].label}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="mt-5 flex-row gap-3">
          {isMe ? (
            <Pressable onPress={onEdit} className="rounded-full bg-gold px-6 py-2.5">
              <Text className="font-semibold text-charcoal">Edit profile</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={() => toggleFriend(user.id)}
                className={`flex-row items-center gap-1.5 rounded-full px-6 py-2.5 ${
                  isFriend ? 'bg-cream/20' : 'bg-gold'
                }`}
              >
                {isFriend && <Ionicons name="checkmark" size={16} color="#F5F2E9" />}
                <Text className={`font-semibold ${isFriend ? 'text-cream' : 'text-charcoal'}`}>
                  {isFriend ? 'Friends' : 'Add friend'}
                </Text>
              </Pressable>
              <Pressable
                onPress={onMessage}
                className="items-center justify-center rounded-full bg-cream/20 px-4 py-2.5"
              >
                <Ionicons name="chatbubble-outline" size={18} color="#F5F2E9" />
              </Pressable>
            </>
          )}
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
            {user.bio.length > 0 && (
              <View className="rounded-2xl bg-sand p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  About
                </Text>
                <Text className="mt-1 text-[15px] leading-5 text-charcoal">{user.bio}</Text>
              </View>
            )}
            {(user.neighborhood.length > 0 || user.crossStreets.length > 0) && (
              <View className="rounded-2xl bg-sand p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  Neighborhood
                </Text>
                <Text className="mt-1 text-charcoal">
                  {[user.neighborhood, user.crossStreets, user.yearsInArea]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            )}
            <View className="rounded-2xl bg-sand p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Interests
              </Text>
              <Text className="mt-1 text-charcoal">{user.interests}</Text>
            </View>
            <View className="rounded-2xl bg-sand p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Values
              </Text>
              <Text className="mt-1 text-charcoal">{user.values}</Text>
            </View>
            <View className="rounded-2xl bg-sand p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Trust
              </Text>
              <Text className="mt-1 text-charcoal">{user.trust}</Text>
            </View>
          </View>
        )}

        {tab === 'Prompts' && (
          <View className="gap-4">
            {CONVERSATION_STARTER_META.filter((m) => user.conversationStarters[m.key].length > 0).map(
              (m) => (
                <View key={m.key} className="rounded-2xl bg-terracotta/10 p-4">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name={m.icon} size={13} color="#E0533C" />
                    <Text className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                      {m.label}
                    </Text>
                  </View>
                  <Text className="mt-1.5 text-[15px] text-charcoal">
                    {user.conversationStarters[m.key]}
                  </Text>
                </View>
              )
            )}
            {user.prompts.map((p) => (
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
            {user.photoSeeds.map((n) => (
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
            {isMe && (
              <View className="mb-1 h-32 items-center justify-center">
                <SvgXml xml={GROUP_SELFIE_SVG} width="100%" height="100%" />
              </View>
            )}
            {friends.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => onFriendPress?.(f)}
                className="flex-row items-center gap-3 rounded-2xl bg-sand p-3 active:opacity-70"
              >
                <Image source={{ uri: f.avatar }} className="h-11 w-11 rounded-full" />
                <Text className="font-medium text-charcoal">{f.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
