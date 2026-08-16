import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { getUser, type NotificationItem } from '../data/mock';
import { goToTarget, TYPE_ICON, TYPE_LABEL } from '../lib/notificationTargets';
import { useFriendsStore } from '../store/useFriendsStore';
import { useMutedStore } from '../store/useMutedStore';
import { useNotificationsStore } from '../store/useNotificationsStore';

export default function Notifications() {
  const allNotifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const deleteNotification = useNotificationsStore((s) => s.deleteNotification);
  const mutedIds = useMutedStore((s) => s.mutedIds);
  const unmuted = allNotifications.filter((n) => !n.actorId || !mutedIds[n.actorId]);
  const [typeFilter, setTypeFilter] = useState<NotificationItem['type'] | 'All'>('All');
  const presentTypes = Array.from(new Set(unmuted.map((n) => n.type)));
  const notifications = unmuted.filter((n) => typeFilter === 'All' || n.type === typeFilter);
  const hasUnread = notifications.some((n) => !n.read);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const acceptRequest = useFriendsStore((s) => s.acceptRequest);
  const declineRequest = useFriendsStore((s) => s.declineRequest);

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
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

      {presentTypes.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-5 pb-3"
        >
          <Pressable
            onPress={() => setTypeFilter('All')}
            className={`rounded-full px-3 py-1.5 ${typeFilter === 'All' ? 'bg-ink' : 'bg-cream'}`}
          >
            <Text
              className={`text-xs font-medium ${typeFilter === 'All' ? 'text-paper' : 'text-charcoal/60'}`}
            >
              All
            </Text>
          </Pressable>
          {presentTypes.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTypeFilter(t)}
              className={`rounded-full px-3 py-1.5 ${typeFilter === t ? 'bg-ink' : 'bg-cream'}`}
            >
              <Text
                className={`text-xs font-medium ${typeFilter === t ? 'text-paper' : 'text-charcoal/60'}`}
              >
                {TYPE_LABEL[t]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        <View className="gap-3">
          {notifications.map((n) => {
            const actor = n.actorId ? getUser(n.actorId) : undefined;
            const isPendingRequest =
              n.type === 'friend_request' &&
              n.actorId !== undefined &&
              friendStatuses[n.actorId] === 'pending_in';
            return (
              <View
                key={n.id}
                className={`rounded-2xl p-4 ${n.read ? 'bg-cream' : 'bg-cream border border-terracotta/30'}`}
              >
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={() => {
                      markRead(n.id);
                      goToTarget(n.target);
                    }}
                    className="flex-1 flex-row items-center gap-3 active:opacity-80"
                  >
                    {actor ? (
                      <Image source={{ uri: actor.avatar }} className="h-11 w-11 rounded-full" />
                    ) : (
                      <View className="h-11 w-11 items-center justify-center rounded-full bg-sage/20">
                        <Ionicons name={TYPE_ICON[n.type]} size={18} className="text-sage" />
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
                  <Pressable
                    onPress={() => deleteNotification(n.id)}
                    className="h-7 w-7 items-center justify-center rounded-full"
                  >
                    <Ionicons name="close" size={16} className="text-charcoal/40" />
                  </Pressable>
                </View>

                {isPendingRequest && (
                  <View className="ml-14 mt-3 flex-row gap-2">
                    <Pressable
                      onPress={() => {
                        markRead(n.id);
                        acceptRequest(n.actorId!);
                      }}
                      className="rounded-full bg-terracotta px-4 py-1.5"
                    >
                      <Text className="text-xs font-semibold text-paper">Accept</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        markRead(n.id);
                        declineRequest(n.actorId!);
                      }}
                      className="rounded-full bg-sand px-4 py-1.5"
                    >
                      <Text className="text-xs font-semibold text-charcoal">Decline</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
          {notifications.length === 0 && (
            <EmptyState
              icon="notifications-outline"
              iconColorClassName="text-charcoal/50"
              title={typeFilter === 'All' ? "You're all caught up" : `No ${TYPE_LABEL[typeFilter].toLowerCase()} notifications`}
              subtitle={
                typeFilter === 'All'
                  ? 'New activity from your neighbors will show up here.'
                  : 'Try a different filter, or check back later.'
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
