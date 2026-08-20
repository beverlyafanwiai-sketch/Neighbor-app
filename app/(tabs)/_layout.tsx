import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

import { useBlockedStore } from '../../store/useBlockedStore';
import { useConversationsStore } from '../../store/useConversationsStore';
import { useGroupsStore } from '../../store/useGroupsStore';
import { useMutedStore } from '../../store/useMutedStore';
import { useNotificationsStore } from '../../store/useNotificationsStore';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const mutedIds = useMutedStore((s) => s.mutedIds);
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const notifUnread = useNotificationsStore(
    (s) =>
      s.notifications.filter(
        (n) =>
          !n.read &&
          !s.snoozedUntil[n.id] &&
          (!n.actorId || (!mutedIds[n.actorId] && !blockedIds[n.actorId]))
      ).length
  );

  const conversations = useConversationsStore((s) => s.conversations);
  const dmUnread = useConversationsStore((s) => s.unread);
  const groups = useGroupsStore((s) => s.groups);
  const joinedMap = useGroupsStore((s) => s.joined);
  const chatUnread =
    Object.values(conversations)
      .filter((c) => !blockedIds[c.userId])
      .reduce((sum, c) => sum + (dmUnread[c.id] ?? 0), 0) +
    groups.filter((g) => joinedMap[g.id]).reduce((sum, g) => sum + g.unread, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E0533C',
        tabBarInactiveTintColor: isDark ? '#EDE7DB80' : '#3D3D3D80',
        tabBarStyle: { backgroundColor: isDark ? '#2A2622' : '#F5F2E9', borderTopWidth: 0 },
        tabBarBadgeStyle: { backgroundColor: '#E0533C' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
          tabBarBadge: notifUnread > 0 ? notifUnread : undefined,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" color={color} size={size} />
          ),
          tabBarBadge: chatUnread > 0 ? chatUnread : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
