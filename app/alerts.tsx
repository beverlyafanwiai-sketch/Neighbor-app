import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import MentionText from '../components/MentionText';
import MentionTextInput from '../components/MentionTextInput';
import PhotoCarousel from '../components/PhotoCarousel';
import PhotoViewer from '../components/PhotoViewer';
import ReactionButton from '../components/ReactionButton';
import ReportPostSheet from '../components/ReportPostSheet';
import ShareSheet from '../components/ShareSheet';
import { ALERT_CATEGORIES, ME, getUser } from '../data/mock';
import { alertCommentKey, useAlertCommentsStore } from '../store/useAlertCommentsStore';
import {
  formatExpiresIn,
  formatPostedAgo,
  getActiveAlerts,
  getEffectiveConfirmCount,
  getEffectiveConfirmedIds,
  useAlertsStore,
} from '../store/useAlertsStore';
import { useMutedAlertCategoriesStore } from '../store/useMutedAlertCategoriesStore';
import { photoCaptionKey, usePhotoCaptionsStore } from '../store/usePhotoCaptionsStore';
import { useProfileStore } from '../store/useProfileStore';

const ALERT_SORTS = ['Expiring soon', 'Newest', 'Most confirmed'] as const;

const EXTEND_OPTIONS: { hours: number; label: string }[] = [
  { hours: 6, label: '+6 hours' },
  { hours: 24, label: '+24 hours' },
  { hours: 72, label: '+3 days' },
];
type AlertSort = (typeof ALERT_SORTS)[number];

const SNOOZE_OPTIONS = [
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '3 hours', ms: 3 * 60 * 60 * 1000 },
  { label: 'Tomorrow', ms: 24 * 60 * 60 * 1000 },
] as const;

export default function NeighborhoodAlerts() {
  const allAlerts = useAlertsStore((s) => s.alerts);
  const deleteAlert = useAlertsStore((s) => s.deleteAlert);
  const pinnedAlertId = useAlertsStore((s) => s.pinnedAlertId);
  const pinAlert = useAlertsStore((s) => s.pinAlert);
  const unpinAlert = useAlertsStore((s) => s.unpinAlert);
  const myConfirmed = useAlertsStore((s) => s.myConfirmed);
  const toggleConfirm = useAlertsStore((s) => s.toggleConfirm);
  const resolveAlert = useAlertsStore((s) => s.resolveAlert);
  const reopenAlert = useAlertsStore((s) => s.reopenAlert);
  const extendAlert = useAlertsStore((s) => s.extendAlert);
  const snoozedUntil = useAlertsStore((s) => s.snoozedUntil);
  const snoozeAlert = useAlertsStore((s) => s.snoozeAlert);
  const unsnoozeAlert = useAlertsStore((s) => s.unsnoozeAlert);
  const comments = useAlertCommentsStore((s) => s.comments);
  const addComment = useAlertCommentsStore((s) => s.addComment);
  const updateComment = useAlertCommentsStore((s) => s.updateComment);
  const deleteComment = useAlertCommentsStore((s) => s.deleteComment);
  const myCommentReactions = useAlertCommentsStore((s) => s.myReactions);
  const tapCommentReaction = useAlertCommentsStore((s) => s.tapReaction);
  const setCommentReaction = useAlertCommentsStore((s) => s.setReaction);
  const profile = useProfileStore((s) => s.profile);
  const [now] = useState(() => Date.now());
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [viewingCommentsId, setViewingCommentsId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [confirmingDeleteCommentId, setConfirmingDeleteCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentDraft, setEditCommentDraft] = useState('');
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [viewingConfirmedId, setViewingConfirmedId] = useState<string | null>(null);
  const [managingCategories, setManagingCategories] = useState(false);
  const [extendingId, setExtendingId] = useState<string | null>(null);
  const [snoozingId, setSnoozingId] = useState<string | null>(null);
  const [showSnoozed, setShowSnoozed] = useState(false);
  const [viewingPhotos, setViewingPhotos] = useState<{
    uris: string[];
    index: number;
    alertId: string;
    isMine: boolean;
  } | null>(null);
  const mutedCategories = useMutedAlertCategoriesStore((s) => s.muted);
  const toggleMutedCategory = useMutedAlertCategoriesStore((s) => s.toggle);
  const photoCaptions = usePhotoCaptionsStore((s) => s.captions);
  const setPhotoCaption = usePhotoCaptionsStore((s) => s.setCaption);
  const [sortBy, setSortBy] = useState<AlertSort>('Expiring soon');

  const allActiveAlerts = getActiveAlerts(allAlerts, now, pinnedAlertId);
  const unmutedActiveAlerts = allActiveAlerts.filter((a) => !mutedCategories[a.category]);
  const mutedCount = allActiveAlerts.length - unmutedActiveAlerts.length;
  const snoozedAlerts = unmutedActiveAlerts.filter((a) => snoozedUntil[a.id]);
  const unsortedActiveAlerts = unmutedActiveAlerts.filter((a) => !snoozedUntil[a.id]);
  const activeAlerts =
    sortBy === 'Expiring soon'
      ? unsortedActiveAlerts
      : (() => {
          const pinned = unsortedActiveAlerts.find((a) => a.id === pinnedAlertId);
          const rest = unsortedActiveAlerts.filter((a) => a.id !== pinnedAlertId);
          const sortedRest = [...rest].sort((a, b) =>
            sortBy === 'Newest'
              ? b.postedAt - a.postedAt
              : getEffectiveConfirmCount(b, myConfirmed[b.id] ?? false) -
                getEffectiveConfirmCount(a, myConfirmed[a.id] ?? false)
          );
          return pinned ? [pinned, ...sortedRest] : sortedRest;
        })();
  const sharingAlert = activeAlerts.find((a) => a.id === sharingId);
  const viewingCommentsAlert = activeAlerts.find((a) => a.id === viewingCommentsId);
  const viewingComments = viewingCommentsAlert ? (comments[viewingCommentsAlert.id] ?? []) : [];
  const viewingConfirmedAlert = activeAlerts.find((a) => a.id === viewingConfirmedId);
  const viewingConfirmedIds = viewingConfirmedAlert
    ? getEffectiveConfirmedIds(viewingConfirmedAlert, myConfirmed[viewingConfirmedAlert.id] ?? false)
    : [];

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Neighborhood Alerts</Text>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setManagingCategories(true)}
            className="h-9 w-9 items-center justify-center rounded-full bg-cream"
          >
            <Ionicons name="options-outline" size={18} className="text-charcoal" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/create-alert')}
            className="h-9 w-9 items-center justify-center rounded-full bg-terracotta"
          >
            <Ionicons name="add" size={20} className="text-paper" />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          Time-sensitive stuff worth knowing — lost pets, road work, safety heads-up. Alerts expire
          on their own.
        </Text>
        {mutedCount > 0 && (
          <Text className="mt-2 text-xs text-charcoal/40">
            {mutedCount} alert{mutedCount === 1 ? '' : 's'} hidden from muted categories
          </Text>
        )}

        {snoozedAlerts.length > 0 && (
          <Pressable
            onPress={() => setShowSnoozed((v) => !v)}
            className="mt-2 flex-row items-center gap-1.5"
          >
            <Ionicons name="time-outline" size={13} className="text-charcoal/40" />
            <Text className="text-xs font-medium text-charcoal/50">
              {snoozedAlerts.length} snoozed · tap to {showSnoozed ? 'hide' : 'view'}
            </Text>
          </Pressable>
        )}

        {showSnoozed && snoozedAlerts.length > 0 && (
          <View className="mt-3 gap-2 rounded-2xl bg-cream/60 p-3">
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
              Snoozed
            </Text>
            {snoozedAlerts.map((a) => (
              <View key={a.id} className="flex-row items-center gap-2">
                <Text className="flex-1 text-xs text-charcoal/60" numberOfLines={1}>
                  {a.text}
                </Text>
                <Pressable onPress={() => unsnoozeAlert(a.id)}>
                  <Text className="text-xs font-semibold text-terracotta">Unsnooze</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {activeAlerts.length > 1 && (
          <View className="mt-4 flex-row items-center gap-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
              Sort
            </Text>
            {ALERT_SORTS.map((s) => (
              <Pressable
                key={s}
                onPress={() => setSortBy(s)}
                className={`rounded-full px-3 py-1 ${sortBy === s ? 'bg-ink' : 'bg-sand'}`}
              >
                <Text
                  className={`text-xs font-medium ${sortBy === s ? 'text-paper' : 'text-charcoal/60'}`}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View className="mt-5 gap-3">
          {activeAlerts.map((alert) => {
            const author = getUser(alert.authorId);
            const meta = ALERT_CATEGORIES.find((c) => c.value === alert.category);
            const isMine = alert.authorId === ME.id;
            const commentCount = (comments[alert.id] ?? []).length;
            const isPinned = alert.id === pinnedAlertId;
            const confirmed = myConfirmed[alert.id] ?? false;
            const confirmCount = getEffectiveConfirmCount(alert, confirmed);
            return (
              <View key={alert.id} className="rounded-2xl bg-cream p-4">
                <View className="flex-row items-start gap-3">
                  <Text style={{ fontSize: 22 }}>{meta?.emoji ?? '📢'}</Text>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                        {meta?.label ?? 'Alert'}
                      </Text>
                      {isPinned && (
                        <View className="flex-row items-center gap-0.5 rounded-full bg-gold/20 px-1.5 py-0.5">
                          <Ionicons name="pin" size={9} className="text-gold" />
                          <Text className="text-[10px] font-semibold text-gold">Pinned</Text>
                        </View>
                      )}
                      {alert.resolved && (
                        <View className="rounded-full bg-sage/20 px-2 py-0.5">
                          <Text className="text-[10px] font-bold text-sage">RESOLVED</Text>
                        </View>
                      )}
                    </View>
                    <MentionText text={alert.text} className="mt-1 text-[15px] leading-5 text-charcoal" />
                    {alert.location && (
                      <View className="mt-1.5 flex-row items-center gap-1">
                        <Ionicons name="location-outline" size={12} className="text-charcoal/40" />
                        <Text className="text-xs text-charcoal/50">{alert.location}</Text>
                      </View>
                    )}
                    <Text className="mt-2 text-xs text-charcoal/50">
                      {author?.name ?? 'A neighbor'} · {formatPostedAgo(alert.postedAt, now)} ·{' '}
                      {formatExpiresIn(alert.expiresAt, now)}
                    </Text>
                  </View>
                  <View className="flex-row gap-1">
                    <Pressable
                      onPress={() => setSnoozingId(snoozingId === alert.id ? null : alert.id)}
                      className="h-8 w-8 items-center justify-center rounded-full"
                    >
                      <Ionicons name="time-outline" size={16} className="text-charcoal/50" />
                    </Pressable>
                    <Pressable
                      onPress={() => setSharingId(alert.id)}
                      className="h-8 w-8 items-center justify-center rounded-full"
                    >
                      <Ionicons name="arrow-redo-outline" size={16} className="text-charcoal/50" />
                    </Pressable>
                    <Pressable
                      onPress={() => router.push(`/create-alert?duplicateId=${alert.id}`)}
                      className="h-8 w-8 items-center justify-center rounded-full"
                    >
                      <Ionicons name="copy-outline" size={16} className="text-charcoal/50" />
                    </Pressable>
                    {!isMine && (
                      <Pressable
                        onPress={() => setReportingId(alert.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="flag-outline" size={15} className="text-charcoal/50" />
                      </Pressable>
                    )}
                  </View>
                  {isMine && (
                    <View className="flex-row gap-1">
                      {!alert.resolved && (
                        <Pressable
                          onPress={() => setExtendingId(extendingId === alert.id ? null : alert.id)}
                          className="h-8 w-8 items-center justify-center rounded-full"
                        >
                          <Ionicons name="hourglass-outline" size={16} className="text-charcoal/50" />
                        </Pressable>
                      )}
                      <Pressable
                        onPress={() =>
                          alert.resolved ? reopenAlert(alert.id) : resolveAlert(alert.id)
                        }
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons
                          name={alert.resolved ? 'checkmark-circle' : 'checkmark-circle-outline'}
                          size={16}
                          className={alert.resolved ? 'text-sage' : 'text-charcoal/50'}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => (isPinned ? unpinAlert() : pinAlert(alert.id))}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons
                          name={isPinned ? 'pin' : 'pin-outline'}
                          size={16}
                          className={isPinned ? 'text-gold' : 'text-charcoal/50'}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => router.push(`/create-alert?editId=${alert.id}`)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="pencil" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => deleteAlert(alert.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                      </Pressable>
                    </View>
                  )}
                </View>
                {alert.imageUris && alert.imageUris.length > 0 && (
                  <PhotoCarousel
                    uris={alert.imageUris}
                    onPhotoPress={(i) =>
                      setViewingPhotos({
                        uris: alert.imageUris!,
                        index: i,
                        alertId: alert.id,
                        isMine,
                      })
                    }
                  />
                )}
                {snoozingId === alert.id && (
                  <View className="mt-3 flex-row items-center gap-2">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                      Snooze
                    </Text>
                    {SNOOZE_OPTIONS.map((opt) => (
                      <Pressable
                        key={opt.label}
                        onPress={() => {
                          snoozeAlert(alert.id, opt.ms);
                          setSnoozingId(null);
                        }}
                        className="rounded-full bg-sand px-3 py-1"
                      >
                        <Text className="text-xs font-medium text-charcoal/70">{opt.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                {extendingId === alert.id && (
                  <View className="mt-3 flex-row items-center gap-2">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                      Extend
                    </Text>
                    {EXTEND_OPTIONS.map((opt) => (
                      <Pressable
                        key={opt.hours}
                        onPress={() => {
                          extendAlert(alert.id, opt.hours);
                          setExtendingId(null);
                        }}
                        className="rounded-full bg-sand px-3 py-1"
                      >
                        <Text className="text-xs font-medium text-charcoal/70">{opt.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <Pressable
                    onPress={() => setViewingCommentsId(alert.id)}
                    className="flex-row items-center gap-1.5"
                  >
                    <Ionicons name="chatbubble-outline" size={14} className="text-charcoal/40" />
                    <Text className="text-xs text-charcoal/50">
                      {commentCount === 0
                        ? 'Comment'
                        : `${commentCount} comment${commentCount === 1 ? '' : 's'}`}
                    </Text>
                  </Pressable>
                  <View className="flex-row items-center gap-2">
                    {confirmCount > 0 && (
                      <Pressable onPress={() => setViewingConfirmedId(alert.id)}>
                        <Text className="text-xs text-charcoal/50">
                          {confirmCount} confirmed
                        </Text>
                      </Pressable>
                    )}
                    <Pressable
                      disabled={alert.resolved}
                      onPress={() => toggleConfirm(alert.id)}
                      className={`rounded-full px-3 py-1.5 ${
                        alert.resolved ? 'bg-sand' : confirmed ? 'bg-sage/20' : 'bg-sand'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          alert.resolved
                            ? 'text-charcoal/40'
                            : confirmed
                              ? 'text-sage'
                              : 'text-charcoal/70'
                        }`}
                      >
                        {alert.resolved
                          ? 'Resolved'
                          : confirmed
                            ? 'Still happening ✓'
                            : 'Still happening?'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}

          {activeAlerts.length === 0 && (
            <EmptyState
              icon="warning-outline"
              iconColorClassName="text-charcoal/50"
              title={mutedCount > 0 ? 'All active alerts are muted' : 'No active alerts'}
              subtitle={
                mutedCount > 0
                  ? 'Unmute a category to see it here, or post one yourself.'
                  : "Post one if there's something time-sensitive your neighbors should know."
              }
            />
          )}
        </View>
      </ScrollView>

      {sharingAlert && (
        <ShareSheet
          title="Share alert"
          link={`https://neighbor.app/alerts/${sharingAlert.id}`}
          previewText={`${ALERT_CATEGORIES.find((c) => c.value === sharingAlert.category)?.label ?? 'Alert'}: ${sharingAlert.text}`}
          onClose={() => setSharingId(null)}
        />
      )}

      {reportingId && (
        <ReportPostSheet
          onClose={() => setReportingId(null)}
          title="Alert options"
          actionLabel="Report this alert"
        />
      )}

      {reportingCommentId && (
        <ReportPostSheet
          onClose={() => setReportingCommentId(null)}
          title="Comment options"
          actionLabel="Report this comment"
        />
      )}

      {viewingPhotos && (
        <PhotoViewer
          uris={viewingPhotos.uris}
          initialIndex={viewingPhotos.index}
          onClose={() => setViewingPhotos(null)}
          captions={viewingPhotos.uris.map(
            (_, i) => photoCaptions[photoCaptionKey(viewingPhotos.alertId, i)] ?? ''
          )}
          editableIndices={viewingPhotos.uris.map(() => viewingPhotos.isMine)}
          onCaptionChange={(i, text) =>
            setPhotoCaption(photoCaptionKey(viewingPhotos.alertId, i), text)
          }
        />
      )}

      {managingCategories && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={() => setManagingCategories(false)} />
          <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">Mute categories</Text>
              <Pressable
                onPress={() => setManagingCategories(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>
            <Text className="text-xs text-charcoal/50">
              Muted categories are hidden from your alerts list.
            </Text>
            <View className="gap-2">
              {ALERT_CATEGORIES.map((c) => {
                const isMuted = mutedCategories[c.value] ?? false;
                return (
                  <Pressable
                    key={c.value}
                    onPress={() => toggleMutedCategory(c.value)}
                    className="flex-row items-center gap-3 rounded-2xl bg-sand p-3.5"
                  >
                    <Text style={{ fontSize: 18 }}>{c.emoji}</Text>
                    <Text className="flex-1 text-sm font-medium text-charcoal">{c.label}</Text>
                    <Ionicons
                      name={isMuted ? 'notifications-off' : 'notifications-outline'}
                      size={16}
                      className={isMuted ? 'text-terracotta' : 'text-charcoal/40'}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {viewingConfirmedAlert && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={() => setViewingConfirmedId(null)} />
          <View className="max-h-[70%] w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">Still happening</Text>
              <Pressable
                onPress={() => setViewingConfirmedId(null)}
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-1">
                {viewingConfirmedIds.map((userId) => {
                  const isMe = userId === ME.id;
                  const person = isMe ? profile : getUser(userId);
                  if (!person) return null;
                  return (
                    <Pressable
                      key={userId}
                      onPress={() => {
                        if (isMe) return;
                        setViewingConfirmedId(null);
                        router.push(`/profile/${userId}`);
                      }}
                      className="flex-row items-center gap-3 rounded-2xl p-2 active:opacity-70"
                    >
                      <Image source={{ uri: person.avatar }} className="h-9 w-9 rounded-full" />
                      <Text className="font-medium text-charcoal">{isMe ? 'You' : person.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {viewingCommentsAlert && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable
            className="absolute inset-0"
            onPress={() => {
              setViewingCommentsId(null);
              setConfirmingDeleteCommentId(null);
              setCommentDraft('');
            }}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="w-full"
          >
            <View className="max-h-[75%] w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-charcoal">Comments</Text>
                <Pressable
                  onPress={() => {
                    setViewingCommentsId(null);
                    setConfirmingDeleteCommentId(null);
                    setCommentDraft('');
                  }}
                  className="h-8 w-8 items-center justify-center rounded-full bg-sand"
                >
                  <Ionicons name="close" size={16} className="text-charcoal" />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-2">
                  {viewingComments.length === 0 && (
                    <Text className="py-2 text-sm text-charcoal/50">
                      No comments yet — share an update or ask a question.
                    </Text>
                  )}
                  {viewingComments.map((c) => {
                    const isMine = c.authorId === ME.id;
                    const author = isMine ? profile : getUser(c.authorId);
                    if (!author) return null;

                    if (confirmingDeleteCommentId === c.id) {
                      return (
                        <View key={c.id} className="gap-2 rounded-2xl bg-terracotta/10 p-3">
                          <Text className="text-sm text-charcoal">Delete this comment?</Text>
                          <View className="flex-row justify-end gap-4">
                            <Pressable onPress={() => setConfirmingDeleteCommentId(null)}>
                              <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                deleteComment(viewingCommentsAlert.id, c.id);
                                setConfirmingDeleteCommentId(null);
                              }}
                            >
                              <Text className="text-sm font-semibold text-terracotta">Delete</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    }

                    if (editingCommentId === c.id) {
                      return (
                        <View key={c.id} className="gap-2 rounded-2xl bg-sand p-3">
                          <MentionTextInput
                            value={editCommentDraft}
                            onChangeText={setEditCommentDraft}
                            autoFocus
                            multiline
                            className="rounded-xl bg-cream px-3 py-2 text-sm text-charcoal"
                          />
                          <View className="flex-row justify-end gap-4">
                            <Pressable onPress={() => setEditingCommentId(null)}>
                              <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                updateComment(viewingCommentsAlert.id, c.id, editCommentDraft);
                                setEditingCommentId(null);
                              }}
                            >
                              <Text className="text-sm font-semibold text-terracotta">Save</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    }

                    return (
                      <View key={c.id} className="flex-row items-start gap-2.5 rounded-2xl bg-sand p-3">
                        <Image source={{ uri: author.avatar }} className="h-8 w-8 rounded-full" />
                        <View className="flex-1">
                          <View className="flex-row items-center gap-1.5">
                            <Text className="text-sm font-semibold text-charcoal">
                              {isMine ? 'You' : author.name}
                            </Text>
                            <Text className="text-xs text-charcoal/40">
                              {c.time}
                              {c.edited && ' · edited'}
                            </Text>
                          </View>
                          <MentionText text={c.text} className="mt-0.5 text-sm leading-5 text-charcoal" />
                          <ReactionButton
                            compact
                            reactions={c.reactions}
                            myReaction={myCommentReactions[alertCommentKey(viewingCommentsAlert.id, c.id)]}
                            onTap={() => tapCommentReaction(viewingCommentsAlert.id, c.id)}
                            onSelect={(type) => setCommentReaction(viewingCommentsAlert.id, c.id, type)}
                          />
                        </View>
                        {isMine && (
                          <>
                            <Pressable
                              onPress={() => {
                                setEditingCommentId(c.id);
                                setEditCommentDraft(c.text);
                              }}
                              className="h-7 w-7 items-center justify-center"
                            >
                              <Ionicons name="pencil" size={13} className="text-charcoal/40" />
                            </Pressable>
                            <Pressable
                              onPress={() => setConfirmingDeleteCommentId(c.id)}
                              className="h-7 w-7 items-center justify-center"
                            >
                              <Ionicons name="trash-outline" size={14} className="text-charcoal/40" />
                            </Pressable>
                          </>
                        )}
                        {!isMine && (
                          <Pressable
                            onPress={() => setReportingCommentId(c.id)}
                            className="h-7 w-7 items-center justify-center"
                          >
                            <Ionicons name="ellipsis-horizontal" size={15} className="text-charcoal/40" />
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
              <View className="flex-row items-center gap-2 border-t border-charcoal/10 pt-3">
                <View className="flex-1">
                  <MentionTextInput
                    value={commentDraft}
                    onChangeText={setCommentDraft}
                    placeholder="Add a comment..."
                    multiline
                    dropdownPosition="above"
                    className="max-h-24 rounded-2xl bg-sand px-3 py-2.5 text-sm text-charcoal"
                  />
                </View>
                <Pressable
                  disabled={!commentDraft.trim()}
                  onPress={() => {
                    addComment(viewingCommentsAlert.id, commentDraft);
                    setCommentDraft('');
                  }}
                  className="h-9 w-9 items-center justify-center rounded-full bg-terracotta"
                  style={{ opacity: commentDraft.trim() ? 1 : 0.4 }}
                >
                  <Ionicons name="arrow-up" size={18} className="text-paper" />
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>
  );
}
