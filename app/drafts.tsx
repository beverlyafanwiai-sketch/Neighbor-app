import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { useEventsStore } from '../store/useEventsStore';
import { usePostsStore } from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';
import { useRecsStore } from '../store/useRecsStore';

const MODES = ['Posts', 'Events', 'Recs'] as const;
type Mode = (typeof MODES)[number];

export default function Drafts() {
  const [mode, setMode] = useState<Mode>('Posts');
  const profile = useProfileStore((s) => s.profile);
  const drafts = usePostsStore((s) => s.drafts);
  const deleteDraft = usePostsStore((s) => s.deleteDraft);
  const eventDrafts = useEventsStore((s) => s.drafts);
  const deleteEventDraft = useEventsStore((s) => s.deleteDraft);
  const recDrafts = useRecsStore((s) => s.drafts);
  const deleteRecDraft = useRecsStore((s) => s.deleteDraft);

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8 pt-2">
        {mode === 'Posts' && drafts.length === 0 && (
          <EmptyState
            icon="document-text-outline"
            iconColorClassName="text-charcoal/50"
            title="No drafts yet"
            subtitle="Unfinished posts you save for later will show up here."
          />
        )}

        {mode === 'Events' && eventDrafts.length === 0 && (
          <EmptyState
            icon="document-text-outline"
            iconColorClassName="text-charcoal/50"
            title="No event drafts yet"
            subtitle="Unfinished events you save for later will show up here."
          />
        )}

        {mode === 'Recs' && recDrafts.length === 0 && (
          <EmptyState
            icon="document-text-outline"
            iconColorClassName="text-charcoal/50"
            title="No rec drafts yet"
            subtitle="Unfinished recs or asks you save for later will show up here."
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

                <View className="mt-4 flex-row items-center justify-end border-t border-charcoal/10 pt-3">
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

                <View className="mt-4 flex-row items-center justify-end border-t border-charcoal/10 pt-3">
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

                <View className="mt-4 flex-row items-center justify-end border-t border-charcoal/10 pt-3">
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
      </ScrollView>
    </SafeAreaView>
  );
}
