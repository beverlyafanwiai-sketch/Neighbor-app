import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from 'nativewind';

import ShareSheet from '../components/ShareSheet';
import { getUser } from '../data/mock';
import { exportMyData } from '../lib/exportData';
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
import { useProfileStore } from '../store/useProfileStore';
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

const FEEDBACK_CATEGORIES = [
  { value: 'bug', label: 'Something\'s broken' },
  { value: 'idea', label: 'Feature idea' },
  { value: 'other', label: 'Something else' },
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
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<
    (typeof FEEDBACK_CATEGORIES)[number] | null
  >(null);
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPasswordDraft, setCurrentPasswordDraft] = useState('');
  const [newPasswordDraft, setNewPasswordDraft] = useState('');
  const [confirmPasswordDraft, setConfirmPasswordDraft] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [invitingNeighbors, setInvitingNeighbors] = useState(false);
  const [confirmingDeleteAccount, setConfirmingDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const changePassword = useAuthStore((s) => s.changePassword);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const profile = useProfileStore((s) => s.profile);
  const [exportingData, setExportingData] = useState(false);
  const authError = useAuthStore((s) => s.error);
  const clearAuthError = useAuthStore((s) => s.clearError);
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

  const handleExportData = async () => {
    setExportingData(true);
    await exportMyData(profile);
    setExportingData(false);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    await deleteAccount();
    setDeletingAccount(false);
    router.replace('/');
  };

  const handleChangePassword = async () => {
    if (newPasswordDraft !== confirmPasswordDraft) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
    setSubmittingPassword(true);
    const ok = await changePassword(currentPasswordDraft, newPasswordDraft);
    setSubmittingPassword(false);
    if (ok) setPasswordChanged(true);
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
        <View className="gap-3">
          <View className="flex-row items-center gap-3 rounded-2xl bg-cream p-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-charcoal">Read receipts</Text>
              <Text className="mt-0.5 text-xs text-charcoal/50">
                Let others see when you've read their group messages
              </Text>
            </View>
            <Toggle on={readReceipts} onToggle={toggleReadReceipts} />
          </View>

          <Pressable
            onPress={handleExportData}
            disabled={exportingData}
            className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80 disabled:opacity-60"
          >
            <Ionicons name="download-outline" size={18} className="text-charcoal" />
            <View className="flex-1">
              <Text className="text-sm font-medium text-charcoal">
                {exportingData ? 'Preparing export...' : 'Export my data'}
              </Text>
              <Text className="mt-0.5 text-xs text-charcoal/50">
                Download your profile as a JSON file
              </Text>
            </View>
          </Pressable>
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
          Support
        </Text>
        <View className="gap-3">
          <Pressable
            onPress={() => setInvitingNeighbors(true)}
            className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
          >
            <Ionicons name="person-add-outline" size={18} className="text-charcoal" />
            <Text className="flex-1 text-sm font-medium text-charcoal">Invite neighbors</Text>
            <Ionicons name="chevron-forward" size={16} className="text-charcoal/50" />
          </Pressable>

          <Pressable
            onPress={() => {
              setFeedbackCategory(null);
              setFeedbackDraft('');
              setFeedbackSent(false);
              setSendingFeedback(true);
            }}
            className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
          >
            <Ionicons name="chatbox-ellipses-outline" size={18} className="text-charcoal" />
            <Text className="flex-1 text-sm font-medium text-charcoal">Send feedback</Text>
            <Ionicons name="chevron-forward" size={16} className="text-charcoal/50" />
          </Pressable>
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
            onPress={() => {
              clearAuthError();
              setCurrentPasswordDraft('');
              setNewPasswordDraft('');
              setConfirmPasswordDraft('');
              setPasswordMismatch(false);
              setPasswordChanged(false);
              setChangingPassword(true);
            }}
            className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
          >
            <Ionicons name="key-outline" size={18} className="text-charcoal" />
            <Text className="flex-1 text-sm font-medium text-charcoal">Change password</Text>
            <Ionicons name="chevron-forward" size={16} className="text-charcoal/50" />
          </Pressable>

          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
          >
            <Ionicons name="log-out-outline" size={18} className="text-terracotta" />
            <Text className="flex-1 text-sm font-medium text-terracotta">Sign out</Text>
          </Pressable>

          {confirmingDeleteAccount ? (
            <View className="gap-3 rounded-2xl bg-terracotta/10 p-4">
              <Text className="text-sm text-charcoal">
                Delete your account? This removes your profile and can't be undone.
              </Text>
              <View className="flex-row justify-end gap-4">
                <Pressable onPress={() => setConfirmingDeleteAccount(false)}>
                  <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                </Pressable>
                <Pressable onPress={handleDeleteAccount} disabled={deletingAccount}>
                  <Text className="text-sm font-semibold text-terracotta">
                    {deletingAccount ? 'Deleting...' : 'Delete account'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setConfirmingDeleteAccount(true)}
              className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
            >
              <Ionicons name="trash-outline" size={18} className="text-terracotta" />
              <Text className="flex-1 text-sm font-medium text-terracotta">Delete account</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {sendingFeedback && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={() => setSendingFeedback(false)} />
          <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">Send feedback</Text>
              <Pressable
                onPress={() => setSendingFeedback(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>

            {feedbackSent ? (
              <View className="rounded-2xl bg-sage/15 p-4">
                <Text className="text-sm text-sage">
                  Thanks — we've received your feedback and will take a look.
                </Text>
              </View>
            ) : feedbackCategory ? (
              <View className="gap-3">
                <Pressable
                  onPress={() => setFeedbackCategory(null)}
                  className="flex-row items-center gap-1.5 self-start"
                >
                  <Ionicons name="chevron-back" size={14} className="text-charcoal/50" />
                  <Text className="text-xs font-medium text-charcoal/50">
                    {feedbackCategory.label}
                  </Text>
                </Pressable>
                <TextInput
                  value={feedbackDraft}
                  onChangeText={setFeedbackDraft}
                  placeholder="Tell us more (optional)..."
                  placeholderTextColor="#3D3D3D80"
                  multiline
                  autoFocus
                  className="min-h-[80px] rounded-2xl bg-sand px-4 py-3 text-sm text-charcoal"
                />
                <Pressable
                  onPress={() => setFeedbackSent(true)}
                  className="items-center rounded-2xl bg-terracotta p-3.5"
                >
                  <Text className="text-sm font-semibold text-paper">Submit feedback</Text>
                </Pressable>
              </View>
            ) : (
              <View className="gap-2">
                <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  What's this about?
                </Text>
                {FEEDBACK_CATEGORIES.map((category) => (
                  <Pressable
                    key={category.value}
                    onPress={() => setFeedbackCategory(category)}
                    className="rounded-2xl bg-sand p-4 active:opacity-80"
                  >
                    <Text className="text-sm font-medium text-charcoal">{category.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {changingPassword && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={() => setChangingPassword(false)} />
          <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">Change password</Text>
              <Pressable
                onPress={() => setChangingPassword(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>

            {passwordChanged ? (
              <View className="rounded-2xl bg-sage/15 p-4">
                <Text className="text-sm text-sage">Your password has been updated.</Text>
              </View>
            ) : (
              <View className="gap-3">
                <TextInput
                  value={currentPasswordDraft}
                  onChangeText={setCurrentPasswordDraft}
                  placeholder="Current password"
                  placeholderTextColor="#3D3D3D80"
                  secureTextEntry
                  className="rounded-2xl bg-sand px-4 py-3 text-sm text-charcoal"
                />
                <TextInput
                  value={newPasswordDraft}
                  onChangeText={setNewPasswordDraft}
                  placeholder="New password"
                  placeholderTextColor="#3D3D3D80"
                  secureTextEntry
                  className="rounded-2xl bg-sand px-4 py-3 text-sm text-charcoal"
                />
                <TextInput
                  value={confirmPasswordDraft}
                  onChangeText={setConfirmPasswordDraft}
                  placeholder="Confirm new password"
                  placeholderTextColor="#3D3D3D80"
                  secureTextEntry
                  className="rounded-2xl bg-sand px-4 py-3 text-sm text-charcoal"
                />
                {passwordMismatch && (
                  <Text className="text-xs text-terracotta">Passwords don't match.</Text>
                )}
                {authError && <Text className="text-xs text-terracotta">{authError}</Text>}
                <Pressable
                  onPress={handleChangePassword}
                  disabled={submittingPassword}
                  className="items-center rounded-2xl bg-terracotta p-3.5 disabled:opacity-60"
                >
                  <Text className="text-sm font-semibold text-paper">
                    {submittingPassword ? 'Updating...' : 'Update password'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      )}

      {invitingNeighbors && (
        <ShareSheet
          title="Invite neighbors"
          link="https://neighbor.app/join"
          previewText={`${profile.name} invited you to join Neighbor — a warm way to meet the people on your block.`}
          onClose={() => setInvitingNeighbors(false)}
        />
      )}
    </SafeAreaView>
  );
}
