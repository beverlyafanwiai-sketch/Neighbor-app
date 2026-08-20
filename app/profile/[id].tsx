import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileView from '../../components/ProfileView';
import { ME, getUser, type User } from '../../data/mock';
import { useBlockedStore } from '../../store/useBlockedStore';
import { useConversationsStore } from '../../store/useConversationsStore';
import { useMutedStore } from '../../store/useMutedStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useReportsStore } from '../../store/useReportsStore';

export default function OtherProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = getUser(id);
  const profile = useProfileStore((s) => s.profile);
  const getOrCreateConversation = useConversationsStore((s) => s.getOrCreate);
  const isBlocked = useBlockedStore((s) => (user ? (s.blockedIds[user.id] ?? false) : false));
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const toggleBlocked = useBlockedStore((s) => s.toggle);
  const isMuted = useMutedStore((s) => (user ? (s.mutedIds[user.id] ?? false) : false));
  const toggleMuted = useMutedStore((s) => s.toggle);

  const [showActions, setShowActions] = useState(false);
  const [confirmingBlock, setConfirmingBlock] = useState(false);
  const [reported, setReported] = useState(false);
  const addReport = useReportsStore((s) => s.addReport);

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

  const friends = (user.friendIds ?? [])
    .filter((friendId) => !blockedIds[friendId])
    .map((friendId) => (friendId === ME.id ? profile : getUser(friendId)))
    .filter((u): u is User => Boolean(u));

  const goToFriend = (friend: User) => {
    if (friend.id === ME.id) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/profile/${friend.id}`);
    }
  };

  const message = () => {
    const conversationId = getOrCreateConversation(user.id);
    router.push(`/chat/${conversationId}`);
  };

  const closeActions = () => {
    setShowActions(false);
    setConfirmingBlock(false);
    setReported(false);
  };

  const confirmBlock = () => {
    toggleBlocked(user.id);
    closeActions();
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
        onMoreOptions={() => setShowActions(true)}
        onPhotoPress={(postId) => router.push(`/post/${postId}`)}
        onGroupPress={(groupId) => router.push(`/group/${groupId}`)}
        onEventPress={(eventId) => router.push(`/event/${eventId}`)}
      />

      {showActions && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={closeActions} />
          <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">{user.name}</Text>
              <Pressable
                onPress={closeActions}
                accessibilityLabel="Close"
                accessibilityRole="button"
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>

            <Pressable
              onPress={() => toggleMuted(user.id)}
              className="flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
            >
              <Ionicons
                name={isMuted ? 'volume-high-outline' : 'volume-mute-outline'}
                size={20}
                className="text-charcoal"
              />
              <View className="flex-1">
                <Text className="text-sm font-medium text-charcoal">
                  {isMuted ? `Unmute ${user.name}` : `Mute ${user.name}`}
                </Text>
                {!isMuted && (
                  <Text className="mt-0.5 text-xs text-charcoal/50">
                    Quietly hide their posts — they won't be notified
                  </Text>
                )}
              </View>
            </Pressable>

            {confirmingBlock ? (
              <View className="gap-3 rounded-2xl bg-terracotta/10 p-4">
                <Text className="text-sm text-charcoal">
                  Block {user.name}? You won't see their posts or messages, and they won't be able
                  to reach you.
                </Text>
                <View className="flex-row justify-end gap-4">
                  <Pressable onPress={() => setConfirmingBlock(false)}>
                    <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                  </Pressable>
                  <Pressable onPress={confirmBlock}>
                    <Text className="text-sm font-semibold text-terracotta">Block</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => (isBlocked ? confirmBlock() : setConfirmingBlock(true))}
                className="flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
              >
                <Ionicons
                  name={isBlocked ? 'checkmark-circle-outline' : 'ban-outline'}
                  size={20}
                  className="text-terracotta"
                />
                <Text className="text-sm font-medium text-terracotta">
                  {isBlocked ? `Unblock ${user.name}` : `Block ${user.name}`}
                </Text>
              </Pressable>
            )}

            {reported ? (
              <View className="rounded-2xl bg-sage/15 p-4">
                <Text className="text-sm text-sage">
                  Thanks — we've received your report and will take a look.
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  addReport({
                    category: 'Profile',
                    subject: `Profile: ${user.name}`,
                    reason: 'Reported from profile',
                    route: `/profile/${user.id}`,
                  });
                  setReported(true);
                }}
                className="flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
              >
                <Ionicons name="flag-outline" size={20} className="text-charcoal" />
                <Text className="text-sm font-medium text-charcoal">Report {user.name}</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
