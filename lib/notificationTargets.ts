import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ME, type NotificationItem, type NotificationTarget } from '../data/mock';

export const TYPE_ICON: Record<NotificationItem['type'], keyof typeof Ionicons.glyphMap> = {
  friend: 'heart',
  friend_request: 'person-add',
  event: 'calendar',
  group: 'people',
  message: 'chatbubble-ellipses',
  mention: 'at',
  lend: 'basket',
};

export function goToTarget(target?: NotificationTarget) {
  if (!target) return;
  switch (target.kind) {
    case 'profile':
      router.push(target.id === ME.id ? '/(tabs)/profile' : `/profile/${target.id}`);
      return;
    case 'event':
      router.push(`/event/${target.id}`);
      return;
    case 'group':
      router.push(`/group/${target.id}`);
      return;
    case 'chat':
      router.push(`/chat/${target.id}`);
      return;
    case 'group-chat':
      router.push(`/group-chat/${target.id}`);
      return;
    case 'post':
      router.push(`/post/${target.id}`);
      return;
    case 'lend':
      router.push('/lend');
  }
}
