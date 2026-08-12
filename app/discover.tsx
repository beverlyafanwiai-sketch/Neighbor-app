import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { DISCOVER_USERS, type Tone } from '../data/mock';
import { useBlockedStore } from '../store/useBlockedStore';
import { FRIEND_LABEL, useFriendsStore } from '../store/useFriendsStore';
import { memberCountLabel, useGroupsStore } from '../store/useGroupsStore';
import { useProfileStore } from '../store/useProfileStore';

const MODES = ['People', 'Groups'] as const;
type Mode = (typeof MODES)[number];

const TONE_STYLE: Record<Tone, { bg: string; text: string }> = {
  Casual: { bg: 'bg-sage/20', text: 'text-sage' },
  Structured: { bg: 'bg-terracotta/15', text: 'text-terracotta' },
  'Activity-focused': { bg: 'bg-gold/20', text: 'text-gold' },
};

function sharedTags(tags: string[], myTags: string[]) {
  const mine = new Set(myTags);
  return tags.filter((t) => mine.has(t));
}

export default function Discover() {
  const [mode, setMode] = useState<Mode>('People');
  const [query, setQuery] = useState('');
  const allGroups = useGroupsStore((s) => s.groups);
  const joinedMap = useGroupsStore((s) => s.joined);
  const toggleJoin = useGroupsStore((s) => s.toggle);
  const joinByInviteCode = useGroupsStore((s) => s.joinByInviteCode);
  const [redeemingCode, setRedeemingCode] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteError, setInviteError] = useState(false);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const respondFriend = useFriendsStore((s) => s.respond);
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const myTags = useProfileStore((s) => s.profile.tags);

  const discoverGroups = allGroups.filter((g) => !joinedMap[g.id]);
  const discoverableUsers = DISCOVER_USERS.filter((u) => !blockedIds[u.id]);

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return discoverableUsers;
    return discoverableUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.tags.some((t) => t.includes(q))
    );
  }, [query, discoverableUsers]);

  const redeemCode = () => {
    const groupId = joinByInviteCode(inviteCodeInput);
    if (!groupId) {
      setInviteError(true);
      return;
    }
    setRedeemingCode(false);
    setInviteCodeInput('');
    setInviteError(false);
    router.push(`/group/${groupId}`);
  };

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return discoverGroups;
    return discoverGroups.filter(
      (g) => g.name.toLowerCase().includes(q) || g.tag?.toLowerCase().includes(q)
    );
  }, [query, discoverGroups]);

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-xl font-bold text-charcoal">Discover</Text>
      </View>

      <View className="px-5 pb-3">
        <View className="flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} className="text-charcoal/50" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={mode === 'People' ? 'Search by name or interest...' : 'Search groups...'}
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
        </View>
      </View>

      <View className="flex-row gap-2 px-5 pb-3">
        {MODES.map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            className={`rounded-full px-4 py-2 ${mode === m ? 'bg-ink' : 'bg-cream'}`}
          >
            <Text className={`text-sm font-medium ${mode === m ? 'text-paper' : 'text-charcoal/60'}`}>
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        {mode === 'People' && (
          <View className="gap-3">
            {people.map((p) => {
              const shared = sharedTags(p.tags, myTags);
              const status = friendStatuses[p.id] ?? 'none';
              return (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/profile/${p.id}`)}
                  className="rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  <View className="flex-row items-center gap-3">
                    <Image source={{ uri: p.avatar }} className="h-12 w-12 rounded-full" />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="font-semibold text-charcoal">{p.name}</Text>
                        {p.isNew && (
                          <View className="rounded-full bg-gold/20 px-2 py-0.5">
                            <Text className="text-[10px] font-bold text-gold">NEW</Text>
                          </View>
                        )}
                      </View>
                      <Text className="mt-0.5 text-xs text-charcoal/60" numberOfLines={1}>
                        {p.tagline}
                      </Text>
                    </View>
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        respondFriend(p.id);
                      }}
                      className={`rounded-full px-4 py-2 ${status === 'none' ? 'bg-gold' : 'bg-sand'}`}
                    >
                      <Text className="text-xs font-semibold text-charcoal">
                        {FRIEND_LABEL[status]}
                      </Text>
                    </Pressable>
                  </View>

                  {shared.length > 0 && (
                    <View className="mt-3 flex-row flex-wrap items-center gap-1.5 border-t border-charcoal/10 pt-3">
                      <Ionicons name="sparkles-outline" size={13} className="text-sage" />
                      <Text className="text-xs text-sage">
                        Shares {shared.length === 1 ? 'an interest' : `${shared.length} interests`}
                        : {shared.join(', ')}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
            {people.length === 0 && (
              <EmptyState
                icon="search-outline"
                title="No one matches that search yet"
                subtitle="Try a different name or interest."
              />
            )}
          </View>
        )}

        {mode === 'Groups' && (
          <View className="gap-3">
            {redeemingCode ? (
              <View className="gap-2 rounded-2xl bg-cream p-4">
                <Text className="text-sm font-semibold text-charcoal">Enter invite code</Text>
                <TextInput
                  value={inviteCodeInput}
                  onChangeText={(v) => {
                    setInviteCodeInput(v);
                    setInviteError(false);
                  }}
                  placeholder="e.g. HK92QP"
                  placeholderTextColor="#3D3D3D80"
                  autoCapitalize="characters"
                  className="rounded-xl bg-sand px-3 py-2.5 text-base tracking-widest text-charcoal"
                />
                {inviteError && (
                  <Text className="text-xs text-terracotta">
                    That code doesn't match a group — double check and try again.
                  </Text>
                )}
                <View className="flex-row justify-end gap-4 pt-1">
                  <Pressable
                    onPress={() => {
                      setRedeemingCode(false);
                      setInviteCodeInput('');
                      setInviteError(false);
                    }}
                  >
                    <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                  </Pressable>
                  <Pressable onPress={redeemCode}>
                    <Text className="text-sm font-semibold text-terracotta">Join</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setRedeemingCode(true)}
                className="flex-row items-center gap-2 rounded-2xl bg-cream p-4 active:opacity-80"
              >
                <Ionicons name="key-outline" size={18} className="text-charcoal" />
                <Text className="text-sm font-medium text-charcoal">Have an invite code?</Text>
              </Pressable>
            )}
            {groups.map((g) => {
              const toneStyle = TONE_STYLE[g.tone];
              return (
                <Pressable
                  key={g.id}
                  onPress={() => router.push(`/group/${g.id}`)}
                  className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-sage">
                    <Text className="text-lg font-bold text-paper">{g.name.charAt(0)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-charcoal">{g.name}</Text>
                    <View className="mt-1.5 flex-row items-center gap-2">
                      <Text className="text-xs text-charcoal/60">
                        {memberCountLabel(g.id, false)}
                      </Text>
                      <View className={`rounded-full px-2.5 py-1 ${toneStyle.bg}`}>
                        <Text className={`text-xs font-semibold ${toneStyle.text}`}>{g.tone}</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      toggleJoin(g.id);
                    }}
                    className="rounded-full bg-ink px-4 py-2"
                  >
                    <Text className="text-xs font-semibold text-paper">Join</Text>
                  </Pressable>
                </Pressable>
              );
            })}
            {groups.length === 0 && (
              <EmptyState
                icon="search-outline"
                title="No groups match that search yet"
                subtitle="Try a different search term."
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
