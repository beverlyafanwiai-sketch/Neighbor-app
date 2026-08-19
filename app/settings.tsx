import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from 'nativewind';

import { getUser } from '../data/mock';
import { useAuthStore } from '../store/useAuthStore';
import { useBlockedStore } from '../store/useBlockedStore';
import { useDismissedDiscoverStore } from '../store/useDismissedDiscoverStore';
import { useDismissedEventsStore } from '../store/useDismissedEventsStore';
import { useDismissedListingsStore } from '../store/useDismissedListingsStore';
import { useDismissedRecsStore } from '../store/useDismissedRecsStore';
import { useGroupsStore } from '../store/useGroupsStore';
import { useHiddenPostsStore } from '../store/useHiddenPostsStore';
import { formatMutedUntil, useMutedGroupsStore } from '../store/useMutedGroupsStore';
import { useMutedStore } from '../store/useMutedStore';
import { useSettingsStore, type NotificationPrefs } from '../store/useSettingsStore';
import { useThemeStore, type ThemePreference } from '../store/useThemeStore';

function countDismissed(ids: Record<string, boolean>) {
  return Object.values(ids).filter(Boolean).length;
}

const APPEARANCE_OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'Match system', icon: 'phone-portrait-outline' },
];

const QUIET_HOURS_PRESETS = [
  { label: '9 PM – 7 AM', startHour: 21, endHour: 7 },
  { label: '10 PM – 7 AM', startHour: 22, endHour: 7 },
  { label: '11 PM – 8 AM', startHour: 23, endHour: 8 },
] as const;

function formatHour(hour: number) {
  const h = hour % 24;
  const period = h < 12 ? 'AM' : 'PM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour} ${period}`;
}

const NOTIFICATION_ROWS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: 'messages', label: 'Messages', description: 'New direct messages and group chat activity' },
  { key: 'eventReminders', label: 'Event reminders', description: 'Upcoming events you’re going to or hosting' },
  { key: 'groupActivity', label: 'Group activity', description: 'New posts and replies in your circles' },
  { key: 'friendRequests', label: 'Friend requests', description: 'When someone adds you as a friend' },
  { key: 'mentions', label: 'Mentions', description: 'When someone @mentions you in a post or comment' },
  { key: 'lendUpdates', label: 'Borrow & lend', description: 'Requests, approvals, and offers on the lending board' },
  { key: 'saleUpdates', label: 'For sale', description: 'Interest and offers on items you’ve listed for sale' },
  { key: 'recsActivity', label: 'Neighborhood recs', description: 'Agreements and suggestions on the recommendations board' },
  { key: 'welcomeNotes', label: 'Welcome notes', description: 'Replies when you leave a note for a new neighbor' },
  { key: 'carpoolUpdates', label: 'Carpool', description: 'Seat requests and offer changes on events you carpool to' },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      className={`h-6 w-11 justify-center rounded-full p-0.5 ${on ? 'bg-terracotta' : 'bg-ink/15'}`}
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
  const quietHours = useSettingsStore((s) => s.quietHours);
  const toggleQuietHours = useSettingsStore((s) => s.toggleQuietHours);
  const setQuietHoursRange = useSettingsStore((s) => s.setQuietHoursRange);
  const readReceipts = useSettingsStore((s) => s.readReceipts);
  const toggleReadReceipts = useSettingsStore((s) => s.toggleReadReceipts);
  const signOut = useAuthStore((s) => s.signOut);
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const toggleBlocked = useBlockedStore((s) => s.toggle);
  const blockedUsers = Object.keys(blockedIds)
    .filter((id) => blockedIds[id])
    .map((id) => getUser(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));
  const mutedIds = useMutedStore((s) => s.mutedIds);
  const toggleMuted = useMutedStore((s) => s.toggle);
  const mutedUsers = Object.keys(mutedIds)
    .filter((id) => mutedIds[id])
    .map((id) => getUser(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));
  const groups = useGroupsStore((s) => s.groups);
  const mutedUntil = useMutedGroupsStore((s) => s.mutedUntil);
  const toggleMutedGroup = useMutedGroupsStore((s) => s.toggle);
  const mutedGroups = groups.filter((g) => (mutedUntil[g.id] ?? 0) > Date.now());
  const dismissedSaleIds = useDismissedListingsStore((s) => s.dismissedSaleIds);
  const dismissedLendIds = useDismissedListingsStore((s) => s.dismissedLendIds);
  const resetSaleDismissed = useDismissedListingsStore((s) => s.resetSale);
  const resetLendDismissed = useDismissedListingsStore((s) => s.resetLend);
  const dismissedRecIds = useDismissedRecsStore((s) => s.dismissedIds);
  const resetRecsDismissed = useDismissedRecsStore((s) => s.reset);
  const dismissedEventIds = useDismissedEventsStore((s) => s.dismissedIds);
  const resetEventsDismissed = useDismissedEventsStore((s) => s.reset);
  const dismissedPeopleIds = useDismissedDiscoverStore((s) => s.dismissedIds);
  const dismissedDiscoverGroupIds = useDismissedDiscoverStore((s) => s.dismissedGroupIds);
  const resetPeopleDismissed = useDismissedDiscoverStore((s) => s.resetPeople);
  const resetDiscoverGroupsDismissed = useDismissedDiscoverStore((s) => s.resetGroups);
  const hiddenPostIds = useHiddenPostsStore((s) => s.hiddenIds);
  const resetHiddenPosts = useHiddenPostsStore((s) => s.reset);
  const dismissedRows = [
    { label: 'Hidden posts', count: countDismissed(hiddenPostIds), onReset: resetHiddenPosts },
    { label: 'For Sale', count: countDismissed(dismissedSaleIds), onReset: resetSaleDismissed },
    { label: 'Lend', count: countDismissed(dismissedLendIds), onReset: resetLendDismissed },
    { label: 'Recs', count: countDismissed(dismissedRecIds), onReset: resetRecsDismissed },
    { label: 'Events', count: countDismissed(dismissedEventIds), onReset: resetEventsDismissed },
    { label: 'Discover · People', count: countDismissed(dismissedPeopleIds), onReset: resetPeopleDismissed },
    {
      label: 'Discover · Groups',
      count: countDismissed(dismissedDiscoverGroupIds),
      onReset: resetDiscoverGroupsDismissed,
    },
  ];
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);
  const { setColorScheme } = useColorScheme();

  const chooseAppearance = (value: ThemePreference) => {
    setThemePreference(value);
    setColorScheme(value);
  };

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
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Appearance
        </Text>
        <View className="gap-2">
          {APPEARANCE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => chooseAppearance(opt.value)}
              className={`flex-row items-center gap-3 rounded-2xl p-4 ${
                themePreference === opt.value ? 'bg-terracotta' : 'bg-cream'
              }`}
            >
              <Ionicons
                name={opt.icon}
                size={18}
                className={themePreference === opt.value ? 'text-paper' : 'text-charcoal'}
              />
              <Text
                className={`flex-1 text-sm font-medium ${
                  themePreference === opt.value ? 'text-paper' : 'text-charcoal'
                }`}
              >
                {opt.label}
              </Text>
              {themePreference === opt.value && (
                <Ionicons name="checkmark-circle" size={18} className="text-paper" />
              )}
            </Pressable>
          ))}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
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
          Quiet hours
        </Text>
        <View className="gap-2">
          <View className="flex-row items-center gap-3 rounded-2xl bg-cream p-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-charcoal">Quiet hours</Text>
              <Text className="mt-0.5 text-xs text-charcoal/50">
                {quietHours.enabled
                  ? `Notification pop-ups stay quiet from ${formatHour(quietHours.startHour)} to ${formatHour(quietHours.endHour)}`
                  : 'Silence notification pop-ups during set hours'}
              </Text>
            </View>
            <Toggle on={quietHours.enabled} onToggle={toggleQuietHours} />
          </View>
          {quietHours.enabled && (
            <View className="flex-row flex-wrap gap-2 px-1">
              {QUIET_HOURS_PRESETS.map((p) => {
                const active =
                  quietHours.startHour === p.startHour && quietHours.endHour === p.endHour;
                return (
                  <Pressable
                    key={p.label}
                    onPress={() => setQuietHoursRange(p.startHour, p.endHour)}
                    className={`rounded-full px-3 py-1.5 ${active ? 'bg-ink' : 'bg-cream'}`}
                  >
                    <Text
                      className={`text-xs font-medium ${active ? 'text-paper' : 'text-charcoal/60'}`}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Privacy
        </Text>
        <View className="flex-row items-center gap-3 rounded-2xl bg-cream p-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-charcoal">Read receipts</Text>
            <Text className="mt-0.5 text-xs text-charcoal/50">
              Let others see when you've read their group messages
            </Text>
          </View>
          <Toggle on={readReceipts} onToggle={toggleReadReceipts} />
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Muted accounts
        </Text>
        <View className="gap-3">
          {mutedUsers.length === 0 ? (
            <Text className="text-sm text-charcoal/50">You haven't muted anyone.</Text>
          ) : (
            mutedUsers.map((u) => (
              <View key={u.id} className="flex-row items-center gap-3 rounded-2xl bg-cream p-4">
                <Image source={{ uri: u.avatar }} className="h-9 w-9 rounded-full" />
                <Text className="flex-1 text-sm font-medium text-charcoal">{u.name}</Text>
                <Pressable
                  onPress={() => toggleMuted(u.id)}
                  className="rounded-full bg-sand px-4 py-2"
                >
                  <Text className="text-xs font-semibold text-charcoal">Unmute</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Muted groups
        </Text>
        <View className="gap-3">
          {mutedGroups.length === 0 ? (
            <Text className="text-sm text-charcoal/50">You haven't muted any groups.</Text>
          ) : (
            mutedGroups.map((g) => (
              <View key={g.id} className="flex-row items-center gap-3 rounded-2xl bg-cream p-4">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-terracotta">
                  <Text className="text-xs font-bold text-paper">{g.name.charAt(0)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-charcoal">{g.name}</Text>
                  <Text className="text-xs text-charcoal/50">{formatMutedUntil(mutedUntil[g.id])}</Text>
                </View>
                <Pressable
                  onPress={() => toggleMutedGroup(g.id)}
                  className="rounded-full bg-sand px-4 py-2"
                >
                  <Text className="text-xs font-semibold text-charcoal">Unmute</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Blocked accounts
        </Text>
        <View className="gap-3">
          {blockedUsers.length === 0 ? (
            <Text className="text-sm text-charcoal/50">You haven't blocked anyone.</Text>
          ) : (
            blockedUsers.map((u) => (
              <View
                key={u.id}
                className="flex-row items-center gap-3 rounded-2xl bg-cream p-4"
              >
                <Image source={{ uri: u.avatar }} className="h-9 w-9 rounded-full" />
                <Text className="flex-1 text-sm font-medium text-charcoal">{u.name}</Text>
                <Pressable
                  onPress={() => toggleBlocked(u.id)}
                  className="rounded-full bg-sand px-4 py-2"
                >
                  <Text className="text-xs font-semibold text-charcoal">Unblock</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Dismissed items
        </Text>
        <View className="gap-3">
          {dismissedRows.every((r) => r.count === 0) ? (
            <Text className="text-sm text-charcoal/50">You haven't dismissed anything.</Text>
          ) : (
            dismissedRows
              .filter((r) => r.count > 0)
              .map((r) => (
                <View
                  key={r.label}
                  className="flex-row items-center gap-3 rounded-2xl bg-cream p-4"
                >
                  <Text className="flex-1 text-sm font-medium text-charcoal">
                    {r.label} · {r.count} dismissed
                  </Text>
                  <Pressable onPress={r.onReset} className="rounded-full bg-sand px-4 py-2">
                    <Text className="text-xs font-semibold text-charcoal">Reset</Text>
                  </Pressable>
                </View>
              ))
          )}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Account
        </Text>
        <View className="gap-3">
          <Pressable
            onPress={() => router.push('/edit-profile')}
            className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
          >
            <Ionicons name="person-outline" size={18} className="text-charcoal" />
            <Text className="flex-1 text-sm font-medium text-charcoal">Edit profile</Text>
            <Ionicons name="chevron-forward" size={16} className="text-charcoal/50" />
          </Pressable>

          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
          >
            <Ionicons name="log-out-outline" size={18} className="text-terracotta" />
            <Text className="flex-1 text-sm font-medium text-terracotta">Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
