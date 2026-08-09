import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONVERSATIONS, getUser } from '../../data/mock';

export default function ChatList() {
  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-charcoal">Chats</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        <View className="gap-3">
          {CONVERSATIONS.map((c) => {
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
                    {last.from === 'me' ? 'You: ' : ''}
                    {last.text}
                  </Text>
                </View>
                <Text className="text-xs text-charcoal/40">{last.time}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
