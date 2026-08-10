import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore, type NotificationPrefs } from '../store/useSettingsStore';

const NOTIFICATION_ROWS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: 'messages', label: 'Messages', description: 'New direct messages and group chat activity' },
  { key: 'eventReminders', label: 'Event reminders', description: 'Upcoming events you’re going to or hosting' },
  { key: 'groupActivity', label: 'Group activity', description: 'New posts and replies in your circles' },
  { key: 'friendRequests', label: 'Friend requests', description: 'When someone adds you as a friend' },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      className={`h-6 w-11 justify-center rounded-full p-0.5 ${on ? 'bg-terracotta' : 'bg-charcoal/15'}`}
    >
      <View
        className="h-5 w-5 rounded-full bg-cream"
        style={{ marginLeft: on ? 20 : 0 }}
      />
    </Pressable>
  );
}

export default function Settings() {
  const prefs = useSettingsStore((s) => s.notificationPrefs);
  const togglePref = useSettingsStore((s) => s.toggleNotificationPref);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} color="#3D3D3D" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Notifications
        </Text>
        <View className="gap-px overflow-hidden rounded-2xl bg-cream">
          {NOTIFICATION_ROWS.map((row) => (
            <View key={row.key} className="flex-row items-center gap-3 p-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-charcoal">{row.label}</Text>
                <Text className="mt-0.5 text-xs text-charcoal/50">{row.description}</Text>
              </View>
              <Toggle on={prefs[row.key]} onToggle={() => togglePref(row.key)} />
            </View>
          ))}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Account
        </Text>
        <View className="gap-3">
          <Pressable
            onPress={() => router.push('/edit-profile')}
            className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
          >
            <Ionicons name="person-outline" size={18} color="#3D3D3D" />
            <Text className="flex-1 text-sm font-medium text-charcoal">Edit profile</Text>
            <Ionicons name="chevron-forward" size={16} color="#3D3D3D80" />
          </Pressable>

          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
          >
            <Ionicons name="log-out-outline" size={18} color="#E0533C" />
            <Text className="flex-1 text-sm font-medium text-terracotta">Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
