import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { ME, getUser } from '../data/mock';
import { useArchivedChatsStore } from '../store/useArchivedChatsStore';
import { useBlockedStore } from '../store/useBlockedStore';
import { useConversationsStore } from '../store/useConversationsStore';
import { useGroupChatStore } from '../store/useGroupChatStore';
import { useGroupsStore } from '../store/useGroupsStore';

export default function ArchivedChats() {
  const archivedIds = useArchivedChatsStore((s) => s.archivedIds);
  const toggleArchive = useArchivedChatsStore((s) => s.toggleArchive);

  const conversations = useConversationsStore((s) => s.conversations);
  const blockedIds = useBlockedStore((s) => s.blockedIds);

  const groups = useGroupsStore((s) => s.groups);
  const joinedMap = useGroupsStore((s) => s.joined);
  const groupMessages = useGroupChatStore((s) => s.messages);

  const archivedGroups = groups.filter((g) => joinedMap[g.id] && archivedIds[g.id]);
  const archivedConversations = Object.values(conversations).filter(
    (c) => archivedIds[c.id] && !blockedIds[c.userId]
  );

  const isEmpty = archivedGroups.length === 0 && archivedConversations.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Archived</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8 pt-2">
        {isEmpty && (
          <EmptyState
            icon="archive-outline"
            iconColorClassName="text-charcoal/50"
            title="Nothing archived"
            subtitle="Tap the archive icon on any chat to tuck it away here."
          />
        )}

        {archivedGroups.length > 0 && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Group chats
            </Text>
            <View className="gap-3">
              {archivedGroups.map((g) => {
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
                      <Text className="font-semibold text-charcoal">{g.name}</Text>
                      <Text className="mt-0.5 text-sm text-charcoal/60" numberOfLines={1}>
                        {last
                          ? `${last.senderId === ME.id ? 'You: ' : `${getUser(last.senderId)?.name.split(' ')[0]}: `}${last.text}`
                          : 'No messages yet'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleArchive(g.id);
                      }}
                      className="rounded-full bg-sand px-3 py-1.5"
                    >
                      <Text className="text-xs font-semibold text-charcoal">Unarchive</Text>
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {archivedConversations.length > 0 && (
          <>
            <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Direct messages
            </Text>
            <View className="gap-3">
              {archivedConversations.map((c) => {
                const user = getUser(c.userId);
                if (!user) return null;
                const last = c.messages[c.messages.length - 1];
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => router.push(`/chat/${c.id}`)}
                    className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                  >
                    <Image source={{ uri: user.avatar }} className="h-12 w-12 rounded-full" />
                    <View className="flex-1">
                      <Text className="font-semibold text-charcoal">{user.name}</Text>
                      <Text className="mt-0.5 text-sm text-charcoal/60" numberOfLines={1}>
                        {last ? `${last.from === 'me' ? 'You: ' : ''}${last.text}` : 'Say hi 👋'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleArchive(c.id);
                      }}
                      className="rounded-full bg-sand px-3 py-1.5"
                    >
                      <Text className="text-xs font-semibold text-charcoal">Unarchive</Text>
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
