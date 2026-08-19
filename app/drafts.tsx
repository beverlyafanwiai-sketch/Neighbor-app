import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { ALERT_CATEGORIES } from '../data/mock';
import { useAlertsStore } from '../store/useAlertsStore';
import { useEventsStore } from '../store/useEventsStore';
import { useGroupsStore } from '../store/useGroupsStore';
import { useLendStore } from '../store/useLendStore';
import { usePostsStore } from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';
import { useRecsStore } from '../store/useRecsStore';
import { useSaleStore } from '../store/useSaleStore';

const MODES = ['Posts', 'Events', 'Recs', 'Lend', 'For Sale', 'Alerts', 'Groups'] as const;
type Mode = (typeof MODES)[number];

function formatSavedAgo(updatedAt: number) {
  const diffMins = Math.floor((Date.now() - updatedAt) / (60 * 1000));
  if (diffMins < 1) return 'Saved just now';
  if (diffMins < 60) return `Saved ${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Saved ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Saved ${diffDays}d ago`;
}

export default function Drafts() {
  const [mode, setMode] = useState<Mode>('Posts');
  const [query, setQuery] = useState('');
  const profile = useProfileStore((s) => s.profile);
  const allDrafts = usePostsStore((s) => s.drafts);
  const deleteDraft = usePostsStore((s) => s.deleteDraft);
  const allEventDrafts = useEventsStore((s) => s.drafts);
  const deleteEventDraft = useEventsStore((s) => s.deleteDraft);
  const allRecDrafts = useRecsStore((s) => s.drafts);
  const deleteRecDraft = useRecsStore((s) => s.deleteDraft);
  const allLendDrafts = useLendStore((s) => s.drafts);
  const deleteLendDraft = useLendStore((s) => s.deleteDraft);
  const allSaleDrafts = useSaleStore((s) => s.drafts);
  const deleteSaleDraft = useSaleStore((s) => s.deleteDraft);
  const allAlertDrafts = useAlertsStore((s) => s.drafts);
  const deleteAlertDraft = useAlertsStore((s) => s.deleteDraft);
  const allGroupDrafts = useGroupsStore((s) => s.drafts);
  const deleteGroupDraft = useGroupsStore((s) => s.deleteDraft);

  const q = query.trim().toLowerCase();
  const matches = (...fields: (string | undefined)[]) =>
    q.length === 0 || fields.some((f) => (f ?? '').toLowerCase().includes(q));

  const drafts = allDrafts.filter((d) => matches(d.body));
  const eventDrafts = allEventDrafts.filter((d) => matches(d.title, d.location));
  const recDrafts = allRecDrafts.filter((d) => matches(d.name, d.category, d.note));
  const lendDrafts = allLendDrafts.filter((d) => matches(d.title, d.note));
  const saleDrafts = allSaleDrafts.filter((d) => matches(d.title, d.note));
  const alertDrafts = allAlertDrafts.filter((d) => {
    const meta = ALERT_CATEGORIES.find((c) => c.value === d.category);
    return matches(d.text, meta?.label);
  });
  const groupDrafts = allGroupDrafts.filter((d) => matches(d.name, d.description));

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Drafts</Text>
      </View>

      <View className="flex-row gap-2 px-5 pb-3">
        {MODES.map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            className={`rounded-full px-4 py-2 ${mode === m ? 'bg-ink' : 'bg-cream'}`}
          >
            <Text className={`text-sm font-medium ${mode === m ? 'text-paper' : 'text-charcoal/60'}`}>
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="px-5 pb-3">
        <View className="flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} className="text-charcoal/50" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search drafts..."
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={18} className="text-charcoal/50" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8 pt-2">
        {mode === 'Posts' && drafts.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'document-text-outline'}
            iconColorClassName="text-charcoal/50"
            title={q.length > 0 ? `No drafts matching "${query.trim()}"` : 'No drafts yet'}
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : 'Unfinished posts you save for later will show up here.'
            }
          />
        )}

        {mode === 'Events' && eventDrafts.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'document-text-outline'}
            iconColorClassName="text-charcoal/50"
            title={q.length > 0 ? `No drafts matching "${query.trim()}"` : 'No event drafts yet'}
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : 'Unfinished events you save for later will show up here.'
            }
          />
        )}

        {mode === 'Recs' && recDrafts.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'document-text-outline'}
            iconColorClassName="text-charcoal/50"
            title={q.length > 0 ? `No drafts matching "${query.trim()}"` : 'No rec drafts yet'}
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : 'Unfinished recs or asks you save for later will show up here.'
            }
          />
        )}

        {mode === 'Lend' && lendDrafts.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'document-text-outline'}
            iconColorClassName="text-charcoal/50"
            title={q.length > 0 ? `No drafts matching "${query.trim()}"` : 'No lend drafts yet'}
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : 'Unfinished lend items you save for later will show up here.'
            }
          />
        )}

        {mode === 'For Sale' && saleDrafts.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'document-text-outline'}
            iconColorClassName="text-charcoal/50"
            title={q.length > 0 ? `No drafts matching "${query.trim()}"` : 'No for sale drafts yet'}
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : 'Unfinished listings you save for later will show up here.'
            }
          />
        )}

        {mode === 'Alerts' && alertDrafts.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'document-text-outline'}
            iconColorClassName="text-charcoal/50"
            title={q.length > 0 ? `No drafts matching "${query.trim()}"` : 'No alert drafts yet'}
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : 'Unfinished alerts you save for later will show up here.'
            }
          />
        )}

        {mode === 'Groups' && groupDrafts.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'document-text-outline'}
            iconColorClassName="text-charcoal/50"
            title={q.length > 0 ? `No drafts matching "${query.trim()}"` : 'No group drafts yet'}
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : 'Unfinished circles you save for later will show up here.'
            }
          />
        )}

        {mode === 'Posts' && (
          <View className="gap-4">
            {drafts.map((draft) => (
              <Pressable
                key={draft.id}
                onPress={() => router.push(`/create-post?draftId=${draft.id}`)}
                className="rounded-3xl bg-cream p-4 shadow-sm active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <Image source={{ uri: profile.avatar }} className="h-9 w-9 rounded-full" />
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    Draft
                  </Text>
                </View>

                <Text className="mt-3 text-[15px] leading-5 text-charcoal" numberOfLines={3}>
                  {draft.body.length > 0 ? draft.body : 'Empty draft'}
                </Text>

                {draft.imageUris && draft.imageUris.length > 0 && (
                  <View className="mt-3 flex-row gap-2">
                    {draft.imageUris.map((uri) => (
                      <Image key={uri} source={{ uri }} className="h-20 w-20 rounded-xl" />
                    ))}
                  </View>
                )}

                <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <Text className="text-xs text-charcoal/40">{formatSavedAgo(draft.updatedAt)}</Text>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      deleteDraft(draft.id);
                    }}
                    className="flex-row items-center gap-1.5"
                  >
                    <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                    <Text className="text-sm font-medium text-terracotta">Discard</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {mode === 'Events' && (
          <View className="gap-4">
            {eventDrafts.map((draft) => (
              <Pressable
                key={draft.id}
                onPress={() => router.push(`/create-event?draftId=${draft.id}`)}
                className="rounded-3xl bg-cream p-4 shadow-sm active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="calendar-outline" size={18} className="text-terracotta" />
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    Draft
                  </Text>
                </View>

                <Text className="mt-3 text-[15px] font-semibold text-charcoal">
                  {draft.title.length > 0 ? draft.title : 'Untitled event'}
                </Text>
                {Boolean(draft.day || draft.month || draft.time || draft.location) && (
                  <Text className="mt-1 text-sm text-charcoal/60" numberOfLines={1}>
                    {[draft.month, draft.day].filter(Boolean).join(' ')}
                    {draft.time ? ` · ${draft.time}` : ''}
                    {draft.location ? ` · ${draft.location}` : ''}
                  </Text>
                )}

                <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <Text className="text-xs text-charcoal/40">{formatSavedAgo(draft.updatedAt)}</Text>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      deleteEventDraft(draft.id);
                    }}
                    className="flex-row items-center gap-1.5"
                  >
                    <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                    <Text className="text-sm font-medium text-terracotta">Discard</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {mode === 'Recs' && (
          <View className="gap-4">
            {recDrafts.map((draft) => (
              <Pressable
                key={draft.id}
                onPress={() => router.push(`/create-rec?draftId=${draft.id}`)}
                className="rounded-3xl bg-cream p-4 shadow-sm active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <Text style={{ fontSize: 18 }}>{draft.emoji}</Text>
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    Draft · {draft.kind === 'rec' ? 'Rec' : 'Ask'}
                  </Text>
                </View>

                <Text className="mt-3 text-[15px] font-semibold text-charcoal">
                  {draft.name || draft.category || 'Untitled'}
                </Text>
                {draft.note.length > 0 && (
                  <Text className="mt-1 text-sm text-charcoal/60" numberOfLines={2}>
                    {draft.note}
                  </Text>
                )}

                <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <Text className="text-xs text-charcoal/40">{formatSavedAgo(draft.updatedAt)}</Text>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      deleteRecDraft(draft.id);
                    }}
                    className="flex-row items-center gap-1.5"
                  >
                    <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                    <Text className="text-sm font-medium text-terracotta">Discard</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {mode === 'Lend' && (
          <View className="gap-4">
            {lendDrafts.map((draft) => (
              <Pressable
                key={draft.id}
                onPress={() => router.push(`/create-lend-item?draftId=${draft.id}`)}
                className="rounded-3xl bg-cream p-4 shadow-sm active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <Text style={{ fontSize: 18 }}>{draft.emoji}</Text>
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    Draft · {draft.kind === 'have' ? 'Have' : 'Want'}
                  </Text>
                </View>

                <Text className="mt-3 text-[15px] font-semibold text-charcoal">
                  {draft.title.length > 0 ? draft.title : 'Untitled item'}
                </Text>
                {draft.note.length > 0 && (
                  <Text className="mt-1 text-sm text-charcoal/60" numberOfLines={2}>
                    {draft.note}
                  </Text>
                )}

                <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <Text className="text-xs text-charcoal/40">{formatSavedAgo(draft.updatedAt)}</Text>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      deleteLendDraft(draft.id);
                    }}
                    className="flex-row items-center gap-1.5"
                  >
                    <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                    <Text className="text-sm font-medium text-terracotta">Discard</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {mode === 'For Sale' && (
          <View className="gap-4">
            {saleDrafts.map((draft) => (
              <Pressable
                key={draft.id}
                onPress={() => router.push(`/create-sale-item?draftId=${draft.id}`)}
                className="rounded-3xl bg-cream p-4 shadow-sm active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <Text style={{ fontSize: 18 }}>{draft.emoji}</Text>
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    Draft
                  </Text>
                </View>

                <Text className="mt-3 text-[15px] font-semibold text-charcoal">
                  {draft.title.length > 0 ? draft.title : 'Untitled listing'}
                  {draft.price.length > 0 ? ` · ${draft.price}` : ''}
                </Text>
                {draft.note.length > 0 && (
                  <Text className="mt-1 text-sm text-charcoal/60" numberOfLines={2}>
                    {draft.note}
                  </Text>
                )}

                <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <Text className="text-xs text-charcoal/40">{formatSavedAgo(draft.updatedAt)}</Text>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      deleteSaleDraft(draft.id);
                    }}
                    className="flex-row items-center gap-1.5"
                  >
                    <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                    <Text className="text-sm font-medium text-terracotta">Discard</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {mode === 'Alerts' && (
          <View className="gap-4">
            {alertDrafts.map((draft) => {
              const meta = ALERT_CATEGORIES.find((c) => c.value === draft.category);
              return (
                <Pressable
                  key={draft.id}
                  onPress={() => router.push(`/create-alert?draftId=${draft.id}`)}
                  className="rounded-3xl bg-cream p-4 shadow-sm active:opacity-80"
                >
                  <View className="flex-row items-center gap-3">
                    <Text style={{ fontSize: 18 }}>{meta?.emoji ?? '📢'}</Text>
                    <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                      Draft · {meta?.label ?? 'Alert'}
                    </Text>
                  </View>

                  <Text className="mt-3 text-[15px] leading-5 text-charcoal" numberOfLines={3}>
                    {draft.text.length > 0 ? draft.text : 'Empty draft'}
                  </Text>

                  <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                    <Text className="text-xs text-charcoal/40">{formatSavedAgo(draft.updatedAt)}</Text>
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        deleteAlertDraft(draft.id);
                      }}
                      className="flex-row items-center gap-1.5"
                    >
                      <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                      <Text className="text-sm font-medium text-terracotta">Discard</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {mode === 'Groups' && (
          <View className="gap-4">
            {groupDrafts.map((draft) => (
              <Pressable
                key={draft.id}
                onPress={() => router.push(`/create-group?draftId=${draft.id}`)}
                className="rounded-3xl bg-cream p-4 shadow-sm active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="people-outline" size={18} className="text-terracotta" />
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    Draft
                  </Text>
                </View>

                <Text className="mt-3 text-[15px] font-semibold text-charcoal">
                  {draft.name.length > 0 ? draft.name : 'Untitled circle'}
                </Text>
                {draft.description.length > 0 && (
                  <Text className="mt-1 text-sm text-charcoal/60" numberOfLines={2}>
                    {draft.description}
                  </Text>
                )}

                <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <Text className="text-xs text-charcoal/40">{formatSavedAgo(draft.updatedAt)}</Text>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      deleteGroupDraft(draft.id);
                    }}
                    className="flex-row items-center gap-1.5"
                  >
                    <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                    <Text className="text-sm font-medium text-terracotta">Discard</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
