import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONVERSATION_SVG } from '../../assets/illustrations/conversation';
import { PARK_FRIENDS_SVG } from '../../assets/illustrations/park-friends';
import EmptyState from '../../components/EmptyState';
import { ME, getUser } from '../../data/mock';
import { useArchivedChatsStore } from '../../store/useArchivedChatsStore';
import { useBlockedStore } from '../../store/useBlockedStore';
import { useConversationsStore } from '../../store/useConversationsStore';
import { useGroupChatStore } from '../../store/useGroupChatStore';
import { useGroupsStore } from '../../store/useGroupsStore';
import { usePinnedChatsStore } from '../../store/usePinnedChatsStore';

const SORTS = ['Recent', 'Unread first', 'A-Z'] as const;
type SortBy = (typeof SORTS)[number];

export default function ChatList() {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('Recent');
  const conversations = useConversationsStore((s) => s.conversations);
  const dmUnread = useConversationsStore((s) => s.unread);
  const dmLastActivity = useConversationsStore((s) => s.lastActivity);
  const dmMarkRead = useConversationsStore((s) => s.markRead);
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const pinnedIds = usePinnedChatsStore((s) => s.pinnedIds);
  const togglePin = usePinnedChatsStore((s) => s.togglePin);
  const archivedIds = useArchivedChatsStore((s) => s.archivedIds);
  const toggleArchive = useArchivedChatsStore((s) => s.toggleArchive);
  const q = query.trim().toLowerCase();
  const allList = Object.values(conversations)
    .filter((c) => !blockedIds[c.userId])
    .sort((a, b) => {
      const pinDiff = Number(pinnedIds[b.id] ?? false) - Number(pinnedIds[a.id] ?? false);
      if (pinDiff !== 0) return pinDiff;
      if (sortBy === 'A-Z') {
        return (getUser(a.userId)?.name ?? '').localeCompare(getUser(b.userId)?.name ?? '');
      }
      if (sortBy === 'Unread first') {
        const unreadDiff =
          Number((dmUnread[b.id] ?? 0) > 0) - Number((dmUnread[a.id] ?? 0) > 0);
        if (unreadDiff !== 0) return unreadDiff;
      }
      return (dmLastActivity[b.id] ?? 0) - (dmLastActivity[a.id] ?? 0);
    });
  const list = allList.filter(
    (c) =>
      !archivedIds[c.id] &&
      (q.length === 0 || (getUser(c.userId)?.name ?? '').toLowerCase().includes(q))
  );

  const groups = useGroupsStore((s) => s.groups);
  const joinedMap = useGroupsStore((s) => s.joined);
  const groupMarkRead = useGroupsStore((s) => s.markRead);
  const groupMessages = useGroupChatStore((s) => s.messages);
  const groupLastActivity = useGroupChatStore((s) => s.lastActivity);
  const allMyGroups = groups
    .filter((g) => joinedMap[g.id])
    .sort((a, b) => {
      const pinDiff = Number(pinnedIds[b.id] ?? false) - Number(pinnedIds[a.id] ?? false);
      if (pinDiff !== 0) return pinDiff;
      if (sortBy === 'A-Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Unread first') {
        const unreadDiff = Number(b.unread > 0) - Number(a.unread > 0);
        if (unreadDiff !== 0) return unreadDiff;
      }
      return (groupLastActivity[b.id] ?? 0) - (groupLastActivity[a.id] ?? 0);
    });
  const myGroups = allMyGroups.filter(
    (g) => !archivedIds[g.id] && (q.length === 0 || g.name.toLowerCase().includes(q))
  );
  const archivedCount =
    allMyGroups.filter((g) => archivedIds[g.id]).length +
    allList.filter((c) => archivedIds[c.id]).length;

  const hasUnread =
    allMyGroups.some((g) => g.unread > 0) || allList.some((c) => (dmUnread[c.id] ?? 0) > 0);

  const markAllRead = () => {
    allMyGroups.forEach((g) => {
      if (g.unread > 0) groupMarkRead(g.id);
    });
    allList.forEach((c) => {
      if ((dmUnread[c.id] ?? 0) > 0) dmMarkRead(c.id);
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-charcoal">Chats</Text>
        <View className="flex-row items-center gap-4">
          {archivedCount > 0 && (
            <Pressable onPress={() => router.push('/archived-chats')}>
              <Text className="text-sm font-medium text-charcoal/50">Archived ({archivedCount})</Text>
            </Pressable>
          )}
          {hasUnread && (
            <Pressable onPress={markAllRead}>
              <Text className="text-sm font-medium text-terracotta">Mark all read</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View className="px-5 pb-3">
        <View className="flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} className="text-charcoal/50" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search chats..."
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} className="text-charcoal/50" />
            </Pressable>
          )}
        </View>
      </View>

      <View className="flex-row items-center gap-2 px-5 pb-3">
        <Ionicons name="swap-vertical-outline" size={14} className="text-charcoal/40" />
        {SORTS.map((s) => (
          <Pressable
            key={s}
            onPress={() => setSortBy(s)}
            className={`rounded-full px-3 py-1.5 ${sortBy === s ? 'bg-sage/20' : 'bg-cream'}`}
          >
            <Text className={`text-xs font-medium ${sortBy === s ? 'text-sage' : 'text-charcoal/60'}`}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        <Text className="mb-3 mt-2 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Group chats
        </Text>
        <View className="gap-3">
          {myGroups.map((g) => {
            const msgs = groupMessages[g.id] ?? [];
            const last = msgs[msgs.length - 1];
            return (
              <Pressable
                key={g.id}
                onPress={() => router.push(`/group-chat/${g.id}`)}
                className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-terracotta">
                  <Text className="text-lg font-bold text-paper">{g.name.charAt(0)}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    {pinnedIds[g.id] && <Ionicons name="pin" size={12} className="text-gold" />}
                    <Text className="font-semibold text-charcoal">{g.name}</Text>
                  </View>
                  <Text className="mt-0.5 text-sm text-charcoal/60" numberOfLines={1}>
                    {last
                      ? `${last.senderId === ME.id ? 'You: ' : `${getUser(last.senderId)?.name.split(' ')[0]}: `}${last.text}`
                      : 'No messages yet'}
                  </Text>
                </View>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    togglePin(g.id);
                  }}
                  className="h-7 w-7 items-center justify-center"
                >
                  <Ionicons
                    name={pinnedIds[g.id] ? 'pin' : 'pin-outline'}
                    size={15}
                    className={pinnedIds[g.id] ? 'text-gold' : 'text-charcoal/30'}
                  />
                </Pressable>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleArchive(g.id);
                  }}
                  className="h-7 w-7 items-center justify-center"
                >
                  <Ionicons name="archive-outline" size={15} className="text-charcoal/30" />
                </Pressable>
                <View className="items-end gap-1.5">
                  {last && <Text className="text-xs text-charcoal/40">{last.time}</Text>}
                  {g.unread > 0 && (
                    <View className="h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5">
                      <Text className="text-[11px] font-bold text-charcoal">{g.unread}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
          {myGroups.length === 0 && q.length > 0 && (
            <EmptyState icon="search-outline" title={`No group chats matching "${query.trim()}"`} />
          )}
          {myGroups.length === 0 && q.length === 0 && (
            <EmptyState
              illustration={PARK_FRIENDS_SVG}
              title="No group chats yet"
              subtitle="Join a circle from the Groups tab to start chatting together."
              ctaLabel="Browse groups"
              onPressCta={() => router.push('/(tabs)/groups')}
            />
          )}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Direct messages
        </Text>
        <View className="gap-3">
          {list.map((c) => {
            const user = getUser(c.userId);
            if (!user) return null;
            const last = c.messages[c.messages.length - 1];
            const unread = dmUnread[c.id] ?? 0;
            return (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/chat/${c.id}`)}
                className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
              >
                <Image source={{ uri: user.avatar }} className="h-12 w-12 rounded-full" />
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    {pinnedIds[c.id] && <Ionicons name="pin" size={12} className="text-gold" />}
                    <Text className="font-semibold text-charcoal">{user.name}</Text>
                  </View>
                  <Text
                    className={`mt-0.5 text-sm ${unread > 0 ? 'font-medium text-charcoal' : 'text-charcoal/60'}`}
                    numberOfLines={1}
                  >
                    {last ? `${last.from === 'me' ? 'You: ' : ''}${last.text}` : 'Say hi 👋'}
                  </Text>
                </View>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    togglePin(c.id);
                  }}
                  className="h-7 w-7 items-center justify-center"
                >
                  <Ionicons
                    name={pinnedIds[c.id] ? 'pin' : 'pin-outline'}
                    size={15}
                    className={pinnedIds[c.id] ? 'text-gold' : 'text-charcoal/30'}
                  />
                </Pressable>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleArchive(c.id);
                  }}
                  className="h-7 w-7 items-center justify-center"
                >
                  <Ionicons name="archive-outline" size={15} className="text-charcoal/30" />
                </Pressable>
                <View className="items-end gap-1.5">
                  {last && <Text className="text-xs text-charcoal/40">{last.time}</Text>}
                  {unread > 0 && (
                    <View className="h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5">
                      <Text className="text-[11px] font-bold text-charcoal">{unread}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
          {list.length === 0 && q.length > 0 && (
            <EmptyState icon="search-outline" title={`No conversations matching "${query.trim()}"`} />
          )}
          {list.length === 0 && q.length === 0 && (
            <EmptyState
              illustration={CONVERSATION_SVG}
              title="No conversations yet"
              subtitle="Message a neighbor from their profile to start one."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
