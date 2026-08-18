import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { getUser, type NotificationItem } from '../data/mock';
import { goToTarget, TYPE_ICON, TYPE_LABEL } from '../lib/notificationTargets';
import { useFriendsStore } from '../store/useFriendsStore';
import { useMutedStore } from '../store/useMutedStore';
import { useNotificationsStore } from '../store/useNotificationsStore';

const SNOOZE_OPTIONS = [
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '3 hours', ms: 3 * 60 * 60 * 1000 },
  { label: 'Tomorrow', ms: 24 * 60 * 60 * 1000 },
] as const;

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function groupByDay(items: NotificationItem[]) {
  const now = Date.now();
  const groups: { label: string; items: NotificationItem[] }[] = [];
  for (const item of items) {
    const diffDays = Math.floor((startOfDay(now) - startOfDay(item.createdAt)) / (24 * 60 * 60 * 1000));
    const label = diffDays <= 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : 'Earlier';
    const group = groups.find((g) => g.label === label);
    if (group) group.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

export default function Notifications() {
  const allNotifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const deleteNotification = useNotificationsStore((s) => s.deleteNotification);
  const snoozedUntil = useNotificationsStore((s) => s.snoozedUntil);
  const snoozeNotification = useNotificationsStore((s) => s.snoozeNotification);
  const unsnoozeNotification = useNotificationsStore((s) => s.unsnoozeNotification);
  const pinnedId = useNotificationsStore((s) => s.pinnedId);
  const togglePin = useNotificationsStore((s) => s.togglePin);
  const [snoozingId, setSnoozingId] = useState<string | null>(null);
  const [decliningRequestId, setDecliningRequestId] = useState<string | null>(null);
  const [declineNoteDraft, setDeclineNoteDraft] = useState('');
  const [showSnoozed, setShowSnoozed] = useState(false);
  const mutedIds = useMutedStore((s) => s.mutedIds);
  const unmuted = allNotifications.filter((n) => !n.actorId || !mutedIds[n.actorId]);
  const [typeFilter, setTypeFilter] = useState<NotificationItem['type'] | 'All'>('All');
  const [query, setQuery] = useState('');
  const presentTypes = Array.from(new Set(unmuted.map((n) => n.type)));
  const q = query.trim().toLowerCase();
  const notifications = unmuted.filter((n) => {
    if (typeFilter !== 'All' && n.type !== typeFilter) return false;
    if (q.length === 0) return true;
    const actorName = n.actorId ? (getUser(n.actorId)?.name ?? '') : '';
    return n.text.toLowerCase().includes(q) || actorName.toLowerCase().includes(q);
  });
  const activeNotifications = notifications.filter((n) => !snoozedUntil[n.id]);
  const snoozedNotifications = notifications.filter((n) => snoozedUntil[n.id]);
  const pinnedNotification = activeNotifications.find((n) => n.id === pinnedId);
  const notificationGroups = groupByDay(activeNotifications.filter((n) => n.id !== pinnedId));
  const hasUnread = notifications.some((n) => !n.read);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const acceptRequest = useFriendsStore((s) => s.acceptRequest);
  const declineRequest = useFriendsStore((s) => s.declineRequest);

  const renderNotification = (n: NotificationItem) => {
    const actor = n.actorId ? getUser(n.actorId) : undefined;
    const isPendingRequest =
      n.type === 'friend_request' &&
      n.actorId !== undefined &&
      friendStatuses[n.actorId] === 'pending_in';
    const isPinned = n.id === pinnedId;
    return (
      <View
        key={n.id}
        className={`rounded-2xl p-4 ${n.read ? 'bg-cream' : 'bg-cream border border-terracotta/30'}`}
      >
        <View className="flex-row items-center gap-2">
          {actor ? (
            <Pressable onPress={() => router.push(`/profile/${actor.id}`)}>
              <Image source={{ uri: actor.avatar }} className="h-11 w-11 rounded-full" />
            </Pressable>
          ) : (
            <View className="h-11 w-11 items-center justify-center rounded-full bg-sage/20">
              <Ionicons name={TYPE_ICON[n.type]} size={18} className="text-sage" />
            </View>
          )}
          <Pressable
            onPress={() => {
              markRead(n.id);
              goToTarget(n.target);
            }}
            className="flex-1 flex-row items-center gap-3 active:opacity-80"
          >
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
            onPress={() => togglePin(n.id)}
            className="h-7 w-7 items-center justify-center rounded-full"
          >
            <Ionicons
              name={isPinned ? 'pin' : 'pin-outline'}
              size={16}
              className={isPinned ? 'text-gold' : 'text-charcoal/40'}
            />
          </Pressable>
          <Pressable
            onPress={() => setSnoozingId(snoozingId === n.id ? null : n.id)}
            className="h-7 w-7 items-center justify-center rounded-full"
          >
            <Ionicons name="time-outline" size={16} className="text-charcoal/40" />
          </Pressable>
          <Pressable
            onPress={() => deleteNotification(n.id)}
            className="h-7 w-7 items-center justify-center rounded-full"
          >
            <Ionicons name="close" size={16} className="text-charcoal/40" />
          </Pressable>
        </View>

        {snoozingId === n.id && (
          <View className="ml-14 mt-3 flex-row flex-wrap gap-2">
            {SNOOZE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                onPress={() => {
                  snoozeNotification(n.id, opt.ms);
                  setSnoozingId(null);
                }}
                className="rounded-full bg-sand px-3 py-1.5"
              >
                <Text className="text-xs font-medium text-charcoal/70">{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {isPendingRequest &&
          (decliningRequestId === n.id ? (
            <View className="ml-14 mt-3 gap-2">
              <TextInput
                value={declineNoteDraft}
                onChangeText={setDeclineNoteDraft}
                placeholder="Optional note, e.g. maybe another time"
                placeholderTextColor="#3D3D3D80"
                autoFocus
                className="rounded-xl bg-sand px-3 py-2 text-sm text-charcoal"
              />
              <View className="flex-row justify-end gap-4">
                <Pressable
                  onPress={() => {
                    setDecliningRequestId(null);
                    setDeclineNoteDraft('');
                  }}
                >
                  <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    markRead(n.id);
                    declineRequest(n.actorId!, declineNoteDraft);
                    setDecliningRequestId(null);
                    setDeclineNoteDraft('');
                  }}
                >
                  <Text className="text-sm font-semibold text-terracotta">Decline</Text>
                </Pressable>
              </View>
            </View>
          ) : (
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
                onPress={() => setDecliningRequestId(n.id)}
                className="rounded-full bg-sand px-4 py-1.5"
              >
                <Text className="text-xs font-semibold text-charcoal">Decline</Text>
              </Pressable>
            </View>
          ))}
      </View>
    );
  };

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

      <View className="px-5 pb-3">
        <View className="flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} className="text-charcoal/50" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search notifications..."
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} className="text-charcoal/50" />
            </Pressable>
          )}
        </View>
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

      {snoozedNotifications.length > 0 && (
        <Pressable
          onPress={() => setShowSnoozed((v) => !v)}
          className="mx-5 mb-3 flex-row items-center gap-1.5"
        >
          <Ionicons name="time-outline" size={13} className="text-charcoal/40" />
          <Text className="text-xs font-medium text-charcoal/50">
            {snoozedNotifications.length} snoozed · tap to {showSnoozed ? 'hide' : 'view'}
          </Text>
        </Pressable>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        <View className="gap-5">
          {showSnoozed && snoozedNotifications.length > 0 && (
            <View className="gap-2 rounded-2xl bg-cream/60 p-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                Snoozed
              </Text>
              {snoozedNotifications.map((n) => (
                <View key={n.id} className="flex-row items-center gap-2">
                  <Text className="flex-1 text-xs text-charcoal/60" numberOfLines={1}>
                    {n.text}
                  </Text>
                  <Pressable onPress={() => unsnoozeNotification(n.id)}>
                    <Text className="text-xs font-semibold text-terracotta">Unsnooze</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          {pinnedNotification && (
            <View className="gap-3">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="pin" size={12} className="text-gold" />
                <Text className="text-xs font-semibold uppercase tracking-wide text-gold">
                  Pinned
                </Text>
              </View>
              {renderNotification(pinnedNotification)}
            </View>
          )}
          {notificationGroups.map((group) => (
            <View key={group.label} className="gap-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                {group.label}
              </Text>
              {group.items.map((n) => renderNotification(n))}
            </View>
          ))}
          {activeNotifications.length === 0 && snoozedNotifications.length === 0 && (
            <EmptyState
              icon="notifications-outline"
              iconColorClassName="text-charcoal/50"
              title={
                q.length > 0
                  ? `No results for "${query.trim()}"`
                  : typeFilter === 'All'
                    ? "You're all caught up"
                    : `No ${TYPE_LABEL[typeFilter].toLowerCase()} notifications`
              }
              subtitle={
                q.length > 0
                  ? 'Try a different search term.'
                  : typeFilter === 'All'
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
