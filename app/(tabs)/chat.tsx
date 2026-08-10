import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ME, getUser } from '../../data/mock';
import { useConversationsStore } from '../../store/useConversationsStore';
import { useGroupChatStore } from '../../store/useGroupChatStore';
import { useGroupsStore } from '../../store/useGroupsStore';

export default function ChatList() {
  const conversations = useConversationsStore((s) => s.conversations);
  const list = Object.values(conversations);

  const groups = useGroupsStore((s) => s.groups);
  const joinedMap = useGroupsStore((s) => s.joined);
  const groupMessages = useGroupChatStore((s) => s.messages);
  const myGroups = groups.filter((g) => joinedMap[g.id]);

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-charcoal">Chats</Text>
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
                  <Text className="text-lg font-bold text-cream">{g.name.charAt(0)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-charcoal">{g.name}</Text>
                  <Text className="mt-0.5 text-sm text-charcoal/60" numberOfLines={1}>
                    {last
                      ? `${last.senderId === ME.id ? 'You: ' : `${getUser(last.senderId)?.name.split(' ')[0]}: `}${last.text}`
                      : 'No messages yet'}
                  </Text>
                </View>
                {last && <Text className="text-xs text-charcoal/40">{last.time}</Text>}
              </Pressable>
            );
          })}
          {myGroups.length === 0 && (
            <Text className="text-sm text-charcoal/50">Join a circle to start group chatting.</Text>
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
                {last && <Text className="text-xs text-charcoal/40">{last.time}</Text>}
              </Pressable>
            );
          })}
          {list.length === 0 && (
            <Text className="text-sm text-charcoal/50">No conversations yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
