import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileView from '../../components/ProfileView';
import { DISCOVER_USERS, ME, USERS, type User } from '../../data/mock';
import { useFriendsStore } from '../../store/useFriendsStore';

const ALL_PEOPLE: User[] = [...USERS, ...DISCOVER_USERS];

export default function Profile() {
  const friendIds = useFriendsStore((s) => s.friendIds);
  const friends = ALL_PEOPLE.filter((u) => friendIds[u.id]);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ProfileView
        user={ME}
        isMe
        friends={friends}
        onFriendPress={(friend) => router.push(`/profile/${friend.id}`)}
      />
    </SafeAreaView>
  );
}
