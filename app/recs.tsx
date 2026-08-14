import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import ShareSheet from '../components/ShareSheet';
import { getUser, ME } from '../data/mock';
import { getEffectiveAgreeCount, getEffectiveAgreedIds, useRecsStore } from '../store/useRecsStore';
import { useSavedRecsStore } from '../store/useSavedRecsStore';
import { useProfileStore } from '../store/useProfileStore';

const KIND_FILTERS = ['All', 'Recs', 'Asks'] as const;
type KindFilter = (typeof KIND_FILTERS)[number];

const RECS_SORTS = ['Newest', 'Most agreed'] as const;
type RecsSort = (typeof RECS_SORTS)[number];

export default function RecsBoard() {
  const entries = useRecsStore((s) => s.entries);
  const myAgreed = useRecsStore((s) => s.myAgreed);
  const toggleAgree = useRecsStore((s) => s.toggleAgree);
  const deleteEntry = useRecsStore((s) => s.deleteEntry);
  const savedIds = useSavedRecsStore((s) => s.savedIds);
  const toggleSave = useSavedRecsStore((s) => s.toggleSave);
  const profile = useProfileStore((s) => s.profile);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [kindFilter, setKindFilter] = useState<KindFilter>('All');
  const [sortBy, setSortBy] = useState<RecsSort>('Newest');
  const [query, setQuery] = useState('');
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [viewingAgreedId, setViewingAgreedId] = useState<string | null>(null);

  const sharingEntry = entries.find((e) => e.id === sharingId);
  const viewingAgreedEntry = entries.find((e) => e.id === viewingAgreedId);
  const viewingAgreedIds = viewingAgreedEntry
    ? getEffectiveAgreedIds(viewingAgreedEntry.id, myAgreed[viewingAgreedEntry.id] ?? false)
    : [];

  const categories = ['All', ...Array.from(new Set(entries.map((e) => e.category))).sort()];
  const matchesCategory = (e: (typeof entries)[number]) =>
    categoryFilter === 'All' || e.category === categoryFilter;
  const matchesKind = (e: (typeof entries)[number]) =>
    kindFilter === 'All' || (kindFilter === 'Recs' ? e.kind === 'rec' : e.kind === 'ask');
  const q = query.trim().toLowerCase();
  const matchesQuery = (e: (typeof entries)[number]) =>
    q.length === 0 ||
    e.category.toLowerCase().includes(q) ||
    (e.name ?? '').toLowerCase().includes(q) ||
    e.note.toLowerCase().includes(q);

  const myEntries = entries.filter(
    (e) => e.authorId === ME.id && matchesCategory(e) && matchesKind(e) && matchesQuery(e)
  );
  const filteredBoardEntries = entries.filter(
    (e) => e.authorId !== ME.id && matchesCategory(e) && matchesKind(e) && matchesQuery(e)
  );
  const boardEntries =
    sortBy === 'Most agreed'
      ? [...filteredBoardEntries].sort(
          (a, b) =>
            getEffectiveAgreeCount(b.id, myAgreed[b.id] ?? false) -
            getEffectiveAgreeCount(a.id, myAgreed[a.id] ?? false)
        )
      : filteredBoardEntries;

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Neighborhood Recs</Text>
        <Pressable
          onPress={() => router.push('/create-rec')}
          className="h-9 w-9 items-center justify-center rounded-full bg-terracotta"
        >
          <Ionicons name="add" size={20} className="text-paper" />
        </Pressable>
      </View>

      <View className="px-5 pb-3">
        <View className="flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} className="text-charcoal/50" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search recs..."
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
        </View>
      </View>

      <View className="flex-row gap-2 px-5 pb-3">
        {KIND_FILTERS.map((k) => (
          <Pressable
            key={k}
            onPress={() => setKindFilter(k)}
            className={`rounded-full px-4 py-2 ${kindFilter === k ? 'bg-ink' : 'bg-cream'}`}
          >
            <Text className={`text-sm font-medium ${kindFilter === k ? 'text-paper' : 'text-charcoal/60'}`}>
              {k}
            </Text>
          </Pressable>
        ))}
      </View>

      {categories.length > 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-5 pb-3"
        >
          {categories.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategoryFilter(c)}
              className={`rounded-full px-3.5 py-1.5 ${
                categoryFilter === c ? 'bg-terracotta' : 'bg-cream'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  categoryFilter === c ? 'text-paper' : 'text-charcoal/60'
                }`}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          Who do you trust? Share a recommendation, or ask when you need one.
        </Text>

        {boardEntries.length > 1 && (
          <View className="mt-4 flex-row items-center gap-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
              Sort
            </Text>
            {RECS_SORTS.map((s) => (
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

        {myEntries.length > 0 && (
          <>
            <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              My posts
            </Text>
            <View className="gap-3">
              {myEntries.map((entry) => {
                const count = getEffectiveAgreeCount(entry.id, false);
                return (
                  <View key={entry.id} className="rounded-2xl bg-cream p-4">
                    <View className="flex-row items-center gap-3">
                      <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                        <Text style={{ fontSize: 20 }}>{entry.emoji}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-charcoal">
                          {entry.kind === 'rec' ? (entry.name ?? entry.category) : entry.category}
                        </Text>
                        <Text className="text-xs text-charcoal/50">
                          {entry.kind === 'rec' ? `Your ${entry.category} recommendation` : 'You asked the board'}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => setSharingId(entry.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="arrow-redo-outline" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => router.push(`/create-rec?id=${entry.id}`)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="pencil" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => deleteEntry(entry.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                      </Pressable>
                    </View>
                    {entry.imageUri && (
                      <Image
                        source={{ uri: entry.imageUri }}
                        className="mt-3 w-full rounded-xl"
                        style={{ aspectRatio: 16 / 9 }}
                      />
                    )}
                    <Pressable
                      disabled={count === 0}
                      onPress={() => setViewingAgreedId(entry.id)}
                      className="mt-3 border-t border-charcoal/10 pt-3"
                    >
                      <Text className="text-sm text-charcoal/50">
                        {count === 0
                          ? entry.kind === 'rec'
                            ? 'No one else has agreed yet'
                            : 'No suggestions yet'
                          : entry.kind === 'rec'
                            ? `${count} neighbor${count === 1 ? '' : 's'} agree`
                            : `${count} neighbor${count === 1 ? '' : 's'} have a suggestion`}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          The board
        </Text>

        <View className="gap-3">
          {boardEntries.map((entry) => {
            const author = getUser(entry.authorId);
            if (!author) return null;
            const agreed = myAgreed[entry.id] ?? false;
            const count = getEffectiveAgreeCount(entry.id, agreed);
            const isRec = entry.kind === 'rec';
            const saved = savedIds[entry.id] ?? false;

            return (
              <View key={entry.id} className="rounded-2xl bg-cream p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                    <Text style={{ fontSize: 20 }}>{entry.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-charcoal">
                      {isRec ? (entry.name ?? entry.category) : entry.category}
                    </Text>
                    <Text className="text-xs text-charcoal/50">
                      {isRec ? `Recommended by ${author.name}` : `${author.name} is looking`}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setSharingId(entry.id)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons name="arrow-redo-outline" size={18} className="text-charcoal/40" />
                  </Pressable>
                  <Pressable
                    onPress={() => toggleSave(entry.id)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons
                      name={saved ? 'bookmark' : 'bookmark-outline'}
                      size={18}
                      className={saved ? 'text-gold' : 'text-charcoal/40'}
                    />
                  </Pressable>
                </View>
                <Text className="mt-2 text-sm leading-5 text-charcoal/80">{entry.note}</Text>
                {entry.imageUri && (
                  <Image
                    source={{ uri: entry.imageUri }}
                    className="mt-3 w-full rounded-xl"
                    style={{ aspectRatio: 16 / 9 }}
                  />
                )}

                <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <Pressable
                    disabled={count === 0}
                    onPress={() => setViewingAgreedId(entry.id)}
                    className="flex-1"
                  >
                    <Text className="text-sm text-charcoal/50">
                      {count === 0
                        ? isRec
                          ? 'No agrees yet'
                          : 'No neighbors yet'
                        : isRec
                          ? `+${count} other${count === 1 ? '' : 's'} agree`
                          : `${count} neighbor${count === 1 ? '' : 's'} can help`}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => toggleAgree(entry.id)}
                    className={`rounded-full px-4 py-1.5 ${agreed ? 'bg-sage/20' : 'bg-ink'}`}
                  >
                    <Text className={`text-xs font-semibold ${agreed ? 'text-sage' : 'text-paper'}`}>
                      {agreed
                        ? isRec
                          ? 'You agree ✓'
                          : 'You offered ✓'
                        : isRec
                          ? "+1, I've used them too"
                          : 'I have one'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          {boardEntries.length === 0 && (
            <EmptyState
              icon="star-outline"
              iconColorClassName="text-charcoal/50"
              title={
                q.length > 0
                  ? `No results for "${query.trim()}"`
                  : categoryFilter === 'All' && kindFilter === 'All'
                    ? 'Nothing on the board yet'
                    : `No ${categoryFilter === 'All' ? kindFilter.toLowerCase() : categoryFilter} posts yet`
              }
              subtitle={
                q.length > 0
                  ? 'Try a different search term.'
                  : categoryFilter === 'All' && kindFilter === 'All'
                    ? 'Recommend someone you trust, or ask your neighbors for a suggestion.'
                    : 'Try a different filter, or clear it.'
              }
            />
          )}
        </View>
      </ScrollView>

      {sharingEntry && (
        <ShareSheet
          title={sharingEntry.kind === 'rec' ? 'Share recommendation' : 'Share ask'}
          link={`https://neighbor.app/recs/${sharingEntry.id}`}
          previewText={
            sharingEntry.kind === 'rec'
              ? `${sharingEntry.name ?? sharingEntry.category} — ${sharingEntry.note}`
              : `${sharingEntry.category}: ${sharingEntry.note}`
          }
          onClose={() => setSharingId(null)}
        />
      )}

      {viewingAgreedEntry && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={() => setViewingAgreedId(null)} />
          <View className="max-h-[70%] w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">
                {viewingAgreedEntry.kind === 'rec' ? 'Also recommend this' : 'Can help'}
              </Text>
              <Pressable
                onPress={() => setViewingAgreedId(null)}
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-1">
                {viewingAgreedIds.map((userId) => {
                  const isMe = userId === ME.id;
                  const person = isMe ? profile : getUser(userId);
                  if (!person) return null;
                  return (
                    <Pressable
                      key={userId}
                      onPress={() => {
                        if (isMe) return;
                        setViewingAgreedId(null);
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
    </SafeAreaView>
  );
}
