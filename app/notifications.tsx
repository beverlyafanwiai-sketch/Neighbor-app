import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getUser } from '../data/mock';
import { goToTarget, TYPE_ICON } from '../lib/notificationTargets';
import { useNotificationsStore } from '../store/useNotificationsStore';

export default function Notifications() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} color="#3D3D3D" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Notifications</Text>
        {hasUnread ? (
          <Pressable onPress={markAllRead}>
            <Text className="text-sm font-medium text-terracotta">Mark all read</Text>
          </Pressable>
        ) : (
          <View className="w-9" />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        <View className="gap-3">
          {notifications.map((n) => {
            const actor = n.actorId ? getUser(n.actorId) : undefined;
            return (
              <Pressable
                key={n.id}
                onPress={() => {
                  markRead(n.id);
                  goToTarget(n.target);
                }}
                className={`flex-row items-center gap-3 rounded-2xl p-4 active:opacity-80 ${
                  n.read ? 'bg-cream' : 'bg-cream border border-terracotta/30'
                }`}
              >
                {actor ? (
                  <Image source={{ uri: actor.avatar }} className="h-11 w-11 rounded-full" />
                ) : (
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-sage/20">
                    <Ionicons name={TYPE_ICON[n.type]} size={18} color="#81A684" />
                  </View>
                )}
                <View className="flex-1">
                  <Text
                    className={`text-[15px] ${n.read ? 'text-charcoal/80' : 'font-semibold text-charcoal'}`}
                  >
                    {n.text}
                  </Text>
                  <Text className="mt-0.5 text-xs text-charcoal/50">{n.time}</Text>
                </View>
                {!n.read && <View className="h-2.5 w-2.5 rounded-full bg-terracotta" />}
              </Pressable>
            );
          })}
          {notifications.length === 0 && (
            <Text className="mt-8 text-center text-sm text-charcoal/50">
              Nothing here yet.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
