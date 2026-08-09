import { Pressable, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileView from '../../components/ProfileView';
import { ME, USERS, getUser, getConversationForUser, type User } from '../../data/mock';

export default function OtherProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = getUser(id);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <Text className="text-charcoal">Profile not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-terracotta">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const friends = [ME, ...USERS].filter((u): u is User => u.id !== user.id).slice(0, 4);

  const goToFriend = (friend: User) => {
    if (friend.id === ME.id) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/profile/${friend.id}`);
    }
  };

  const message = () => {
    const conversation = getConversationForUser(user.id);
    if (conversation) {
      router.push(`/chat/${conversation.id}`);
    } else {
      router.push('/(tabs)/chat');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ProfileView
        user={user}
        isMe={false}
        friends={friends}
        onBack={() => router.back()}
        onMessage={message}
        onFriendPress={goToFriend}
      />
    </SafeAreaView>
  );
}
