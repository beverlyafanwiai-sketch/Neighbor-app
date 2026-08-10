import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileView from '../../components/ProfileView';
import { DISCOVER_USERS, USERS, type User } from '../../data/mock';
import { useFriendsStore } from '../../store/useFriendsStore';
import { useProfileStore } from '../../store/useProfileStore';

const ALL_PEOPLE: User[] = [...USERS, ...DISCOVER_USERS];

export default function Profile() {
  const profile = useProfileStore((s) => s.profile);
  const friendIds = useFriendsStore((s) => s.friendIds);
  const friends = ALL_PEOPLE.filter((u) => friendIds[u.id]);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ProfileView
        user={profile}
        isMe
        friends={friends}
        onEdit={() => router.push('/edit-profile')}
        onFriendPress={(friend) => router.push(`/profile/${friend.id}`)}
        onSettings={() => router.push('/settings')}
      />
    </SafeAreaView>
  );
}
