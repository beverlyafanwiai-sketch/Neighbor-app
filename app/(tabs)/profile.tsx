import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileView from '../../components/ProfileView';
import { ME, USERS, MY_FRIEND_IDS, type User } from '../../data/mock';

const friends = MY_FRIEND_IDS.map((id) => USERS.find((u) => u.id === id)).filter(
  (u): u is User => !!u
);

export default function Profile() {
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
