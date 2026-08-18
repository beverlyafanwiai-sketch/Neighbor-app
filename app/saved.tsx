import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import MentionText from '../components/MentionText';
import { DISCOVER_USERS, ME, USERS } from '../data/mock';
import { useBlockedStore } from '../store/useBlockedStore';
import { useFriendsStore } from '../store/useFriendsStore';
import { getEffectiveCheckedInIds, useCheckInStore } from '../store/useCheckInStore';
import { useEventsStore } from '../store/useEventsStore';
import { useMutedStore } from '../store/useMutedStore';
import { getEffectiveHelperCount, useLendStore } from '../store/useLendStore';
import {
  getEffectiveReactions,
  getEffectiveReplies,
  getReactionTotal,
  getTopReactionTypes,
  REACTION_EMOJI,
  usePostsStore,
} from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';
import { getEffectiveAgreeCount, useRecsStore } from '../store/useRecsStore';
import { getEffectiveSpots, useRsvpStore } from '../store/useRsvpStore';
import { getEffectiveInterestCount, useSaleStore } from '../store/useSaleStore';
import { useSavedEventsStore } from '../store/useSavedEventsStore';
import { useSavedLendStore } from '../store/useSavedLendStore';
import { savedNoteKey, useSavedNotesStore } from '../store/useSavedNotesStore';
import { useSavedPinsStore } from '../store/useSavedPinsStore';
import { useSavedRecsStore } from '../store/useSavedRecsStore';
import { useSavedSaleStore } from '../store/useSavedSaleStore';

const ALL_PEOPLE = [...USERS, ...DISCOVER_USERS];
const MODES = ['Posts', 'Events', 'Recs', 'Lend', 'For Sale'] as const;
type Mode = (typeof MODES)[number];

const SAVED_SORTS = ['Newest', 'A-Z'] as const;
const SALE_SAVED_SORTS = ['Newest', 'A-Z', 'Price: low to high', 'Most interest'] as const;
const REC_SAVED_SORTS = ['Newest', 'A-Z', 'Most agreed'] as const;
const LEND_SAVED_SORTS = ['Newest', 'A-Z', 'Most helpers'] as const;
type SavedSort =
  | (typeof SALE_SAVED_SORTS)[number]
  | (typeof REC_SAVED_SORTS)[number]
  | (typeof LEND_SAVED_SORTS)[number];

const REC_KIND_FILTERS = ['All', 'Recs', 'Asks'] as const;
type RecKindFilter = (typeof REC_KIND_FILTERS)[number];

function parsePrice(price: string) {
  const n = parseFloat(price.replace(/[^0-9.]/g, ''));
  return Number.isNaN(n) ? Infinity : n;
}

function withPinnedFirst<T>(
  items: T[],
  keyOf: (item: T) => string,
  pinned: Record<string, boolean>
) {
  const pinnedItems = items.filter((item) => pinned[keyOf(item)]);
  const rest = items.filter((item) => !pinned[keyOf(item)]);
  return [...pinnedItems, ...rest];
}

function sortItems<T>(
  items: T[],
  sortBy: SavedSort,
  titleOf: (item: T) => string,
  priceOf?: (item: T) => string,
  countOf?: (item: T) => number
) {
  if (sortBy === 'A-Z') return [...items].sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
  if (sortBy === 'Price: low to high' && priceOf) {
    return [...items].sort((a, b) => parsePrice(priceOf(a)) - parsePrice(priceOf(b)));
  }
  if (
    (sortBy === 'Most agreed' || sortBy === 'Most helpers' || sortBy === 'Most interest') &&
    countOf
  ) {
    return [...items].sort((a, b) => countOf(b) - countOf(a));
  }
  return items;
}

export default function Saved() {
  const [mode, setMode] = useState<Mode>('Posts');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SavedSort>('Newest');
  const [recKindFilter, setRecKindFilter] = useState<RecKindFilter>('All');
  const [recCategoryFilter, setRecCategoryFilter] = useState('All');
  const [hideSold, setHideSold] = useState(false);
  const [hideUnavailable, setHideUnavailable] = useState(false);
  const [hidePast, setHidePast] = useState(false);
  const [eventCategoryFilter, setEventCategoryFilter] = useState('All');
  const [hideResolved, setHideResolved] = useState(false);
  const [onlyFriends, setOnlyFriends] = useState(false);
  const [editingNoteKey, setEditingNoteKey] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const savedNotes = useSavedNotesStore((s) => s.notes);
  const setSavedNote = useSavedNotesStore((s) => s.setNote);
  const pinned = useSavedPinsStore((s) => s.pinned);
  const togglePin = useSavedPinsStore((s) => s.togglePin);
  const profile = useProfileStore((s) => s.profile);
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const mutedIds = useMutedStore((s) => s.mutedIds);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const posts = usePostsStore((s) => s.posts);
  const savedIds = usePostsStore((s) => s.savedIds);
  const myReactions = usePostsStore((s) => s.myReactions);
  const comments = usePostsStore((s) => s.comments);
  const toggleSave = usePostsStore((s) => s.toggleSave);

  const events = useEventsStore((s) => s.events);
  const savedEventIds = useSavedEventsStore((s) => s.savedIds);
  const toggleSaveEvent = useSavedEventsStore((s) => s.toggleSave);
  const goingMap = useRsvpStore((s) => s.going);
  const myCheckIns = useCheckInStore((s) => s.myCheckIns);

  const recEntries = useRecsStore((s) => s.entries);
  const myAgreed = useRecsStore((s) => s.myAgreed);
  const savedRecIds = useSavedRecsStore((s) => s.savedIds);
  const toggleSaveRec = useSavedRecsStore((s) => s.toggleSave);

  const lendItems = useLendStore((s) => s.items);
  const lendStatus = useLendStore((s) => s.status);
  const myOffers = useLendStore((s) => s.myOffers);
  const savedLendIds = useSavedLendStore((s) => s.savedIds);
  const toggleSaveLend = useSavedLendStore((s) => s.toggleSave);

  const saleItems = useSaleStore((s) => s.items);
  const sold = useSaleStore((s) => s.sold);
  const myInterest = useSaleStore((s) => s.myInterest);
  const savedSaleIds = useSavedSaleStore((s) => s.savedIds);
  const toggleSaveSale = useSavedSaleStore((s) => s.toggleSave);

  const q = query.trim().toLowerCase();
  const matches = (...fields: (string | undefined)[]) =>
    q.length === 0 || fields.some((f) => (f ?? '').toLowerCase().includes(q));
  const matchesFriends = (authorId?: string) =>
    !onlyFriends || !authorId || authorId === ME.id || friendStatuses[authorId] === 'friends';

  const savedPosts = withPinnedFirst(
    posts.filter(
      (p) =>
        (savedIds[p.id] ?? false) &&
        !blockedIds[p.authorId] &&
        !mutedIds[p.authorId] &&
        matchesFriends(p.authorId) &&
        matches(p.body)
    ),
    (p) => savedNoteKey('post', p.id),
    pinned
  );
  const savedEventEntries = events.filter(
    (e) =>
      (savedEventIds[e.id] ?? false) &&
      (!e.hostId || (!blockedIds[e.hostId] && !mutedIds[e.hostId])) &&
      matchesFriends(e.hostId)
  );
  const eventCategories = [
    'All',
    ...Array.from(new Set(savedEventEntries.map((e) => e.category))).sort(),
  ];
  const savedEvents = withPinnedFirst(
    sortItems(
      savedEventEntries.filter(
        (e) =>
          matches(e.title, e.location) &&
          (!hidePast || e.status !== 'past') &&
          (eventCategoryFilter === 'All' || e.category === eventCategoryFilter)
      ),
      sortBy,
      (e) => e.title
    ),
    (e) => savedNoteKey('event', e.id),
    pinned
  );
  const savedRecEntries = recEntries.filter(
    (e) =>
      (savedRecIds[e.id] ?? false) &&
      !blockedIds[e.authorId] &&
      !mutedIds[e.authorId] &&
      matchesFriends(e.authorId)
  );
  const recCategories = [
    'All',
    ...Array.from(new Set(savedRecEntries.map((e) => e.category))).sort(),
  ];
  const savedRecs = withPinnedFirst(
    sortItems(
      savedRecEntries.filter(
        (e) =>
          matches(e.name, e.category, e.note) &&
          (recKindFilter === 'All' || (recKindFilter === 'Recs' ? e.kind === 'rec' : e.kind === 'ask')) &&
          (!hideResolved || !(e.kind === 'ask' && e.resolved)) &&
          (recCategoryFilter === 'All' || e.category === recCategoryFilter)
      ),
      sortBy,
      (e) => e.name ?? e.category,
      undefined,
      (e) => getEffectiveAgreeCount(e.id, myAgreed[e.id] ?? false)
    ),
    (e) => savedNoteKey('rec', e.id),
    pinned
  );
  const savedLendItems = withPinnedFirst(
    sortItems(
      lendItems.filter(
        (i) =>
          (savedLendIds[i.id] ?? false) &&
          !blockedIds[i.ownerId] &&
          !mutedIds[i.ownerId] &&
          matchesFriends(i.ownerId) &&
          matches(i.title, i.note) &&
          (!hideUnavailable || ((lendStatus[i.id] ?? 'available') === 'available' && !i.unavailableNote))
      ),
      sortBy,
      (i) => i.title,
      undefined,
      (i) => getEffectiveHelperCount(i.id, myOffers[i.id] ?? false)
    ),
    (i) => savedNoteKey('lend', i.id),
    pinned
  );
  const savedSaleItems = withPinnedFirst(
    sortItems(
      saleItems.filter(
        (i) =>
          (savedSaleIds[i.id] ?? false) &&
          !blockedIds[i.ownerId] &&
          !mutedIds[i.ownerId] &&
          matchesFriends(i.ownerId) &&
          matches(i.title, i.note) &&
          (!hideSold || !(sold[i.id] ?? false))
      ),
      sortBy,
      (i) => i.title,
      (i) => i.price,
      (i) => getEffectiveInterestCount(i.id, myInterest[i.id] ?? false)
    ),
    (i) => savedNoteKey('sale', i.id),
    pinned
  );

  const renderNoteRow = (key: string, borderTop: boolean) => {
    if (editingNoteKey === key) {
      return (
        <View className={`mt-2 ${borderTop ? 'border-t border-charcoal/10 pt-3' : ''}`}>
          <TextInput
            value={noteDraft}
            onChangeText={setNoteDraft}
            placeholder="Add a personal note..."
            placeholderTextColor="#3D3D3D80"
            multiline
            autoFocus
            className="min-h-[52px] rounded-xl bg-sand px-3 py-2 text-xs text-charcoal"
          />
          <View className="mt-2 flex-row justify-end gap-4">
            <Pressable
              onPress={(evt) => {
                evt.stopPropagation();
                setEditingNoteKey(null);
              }}
            >
              <Text className="text-xs font-medium text-charcoal/50">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={(evt) => {
                evt.stopPropagation();
                setSavedNote(key, noteDraft);
                setEditingNoteKey(null);
              }}
            >
              <Text className="text-xs font-semibold text-terracotta">Save note</Text>
            </Pressable>
          </View>
        </View>
      );
    }
    const note = savedNotes[key];
    return (
      <Pressable
        onPress={(evt) => {
          evt.stopPropagation();
          setNoteDraft(note ?? '');
          setEditingNoteKey(key);
        }}
        className={`mt-2 flex-row items-start gap-1 ${borderTop ? 'border-t border-charcoal/10 pt-2' : ''}`}
      >
        <Ionicons
          name={note ? 'create-outline' : 'add-circle-outline'}
          size={13}
          className="mt-0.5 text-charcoal/40"
        />
        <Text className="flex-1 text-xs italic text-charcoal/50" numberOfLines={2}>
          {note || 'Add a personal note'}
        </Text>
      </Pressable>
    );
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
        <Text className="text-base font-bold text-charcoal">Saved</Text>
      </View>

      <View className="flex-row gap-2 px-5 pb-3">
        {MODES.map((m) => (
          <Pressable
            key={m}
            onPress={() => {
              setMode(m);
              if (
                m !== 'For Sale' &&
                (sortBy === 'Price: low to high' || sortBy === 'Most interest')
              )
                setSortBy('Newest');
              if (m !== 'Recs' && sortBy === 'Most agreed') setSortBy('Newest');
              if (m !== 'Lend' && sortBy === 'Most helpers') setSortBy('Newest');
            }}
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
            placeholder="Search saved..."
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} className="text-charcoal/50" />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => setOnlyFriends((v) => !v)}
          className="mt-2 flex-row items-center gap-2"
        >
          <Ionicons
            name={onlyFriends ? 'checkbox' : 'square-outline'}
            size={16}
            className={onlyFriends ? 'text-terracotta' : 'text-charcoal/40'}
          />
          <Text className="text-xs font-medium text-charcoal/60">Friends only</Text>
        </Pressable>
      </View>

      {mode === 'Recs' && (
        <View className="flex-row items-center gap-2 px-5 pb-3">
          <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
            Kind
          </Text>
          {REC_KIND_FILTERS.map((k) => (
            <Pressable
              key={k}
              onPress={() => setRecKindFilter(k)}
              className={`rounded-full px-3 py-1 ${recKindFilter === k ? 'bg-ink' : 'bg-cream'}`}
            >
              <Text
                className={`text-xs font-medium ${recKindFilter === k ? 'text-paper' : 'text-charcoal/60'}`}
              >
                {k}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {mode === 'Recs' && recCategories.length > 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="items-center gap-2 px-5 pb-3"
        >
          <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
            Category
          </Text>
          {recCategories.map((c) => (
            <Pressable
              key={c}
              onPress={() => setRecCategoryFilter(c)}
              className={`rounded-full px-3 py-1 ${recCategoryFilter === c ? 'bg-ink' : 'bg-cream'}`}
            >
              <Text
                className={`text-xs font-medium ${recCategoryFilter === c ? 'text-paper' : 'text-charcoal/60'}`}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {mode === 'Recs' && recKindFilter !== 'Recs' && (
        <Pressable
          onPress={() => setHideResolved((h) => !h)}
          className="flex-row items-center gap-2 px-5 pb-3"
        >
          <Ionicons
            name={hideResolved ? 'checkbox' : 'square-outline'}
            size={16}
            className={hideResolved ? 'text-terracotta' : 'text-charcoal/40'}
          />
          <Text className="text-xs font-medium text-charcoal/60">Hide resolved asks</Text>
        </Pressable>
      )}

      {mode === 'For Sale' && (
        <Pressable
          onPress={() => setHideSold((h) => !h)}
          className="flex-row items-center gap-2 px-5 pb-3"
        >
          <Ionicons
            name={hideSold ? 'checkbox' : 'square-outline'}
            size={16}
            className={hideSold ? 'text-terracotta' : 'text-charcoal/40'}
          />
          <Text className="text-xs font-medium text-charcoal/60">Hide sold items</Text>
        </Pressable>
      )}

      {mode === 'Lend' && (
        <Pressable
          onPress={() => setHideUnavailable((h) => !h)}
          className="flex-row items-center gap-2 px-5 pb-3"
        >
          <Ionicons
            name={hideUnavailable ? 'checkbox' : 'square-outline'}
            size={16}
            className={hideUnavailable ? 'text-terracotta' : 'text-charcoal/40'}
          />
          <Text className="text-xs font-medium text-charcoal/60">Hide unavailable items</Text>
        </Pressable>
      )}

      {mode === 'Events' && eventCategories.length > 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="items-center gap-2 px-5 pb-3"
        >
          <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
            Category
          </Text>
          {eventCategories.map((c) => (
            <Pressable
              key={c}
              onPress={() => setEventCategoryFilter(c)}
              className={`rounded-full px-3 py-1 ${eventCategoryFilter === c ? 'bg-ink' : 'bg-cream'}`}
            >
              <Text
                className={`text-xs font-medium ${eventCategoryFilter === c ? 'text-paper' : 'text-charcoal/60'}`}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {mode === 'Events' && (
        <Pressable
          onPress={() => setHidePast((h) => !h)}
          className="flex-row items-center gap-2 px-5 pb-3"
        >
          <Ionicons
            name={hidePast ? 'checkbox' : 'square-outline'}
            size={16}
            className={hidePast ? 'text-terracotta' : 'text-charcoal/40'}
          />
          <Text className="text-xs font-medium text-charcoal/60">Hide past events</Text>
        </Pressable>
      )}

      {mode !== 'Posts' &&
        (mode === 'Events'
          ? savedEvents.length
          : mode === 'Recs'
            ? savedRecs.length
            : mode === 'Lend'
              ? savedLendItems.length
              : savedSaleItems.length) > 1 && (
          <View className="flex-row items-center gap-2 px-5 pb-3">
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
              Sort
            </Text>
            {(mode === 'For Sale'
              ? SALE_SAVED_SORTS
              : mode === 'Recs'
                ? REC_SAVED_SORTS
                : mode === 'Lend'
                  ? LEND_SAVED_SORTS
                  : SAVED_SORTS
            ).map((s) => (
              <Pressable
                key={s}
                onPress={() => setSortBy(s)}
                className={`rounded-full px-3 py-1 ${sortBy === s ? 'bg-ink' : 'bg-cream'}`}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8 pt-2">
        {mode === 'Posts' && savedPosts.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'bookmark-outline'}
            iconColorClassName="text-charcoal/50"
            title={q.length > 0 ? `No results for "${query.trim()}"` : 'Nothing saved yet'}
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : 'Tap the bookmark on any post to save it for later.'
            }
          />
        )}

        {mode === 'Events' && savedEvents.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'bookmark-outline'}
            iconColorClassName="text-charcoal/50"
            title={
              q.length > 0
                ? `No results for "${query.trim()}"`
                : eventCategoryFilter !== 'All'
                  ? `No saved ${eventCategoryFilter} events`
                  : hidePast
                    ? 'No upcoming saved events'
                    : 'No saved events'
            }
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : hidePast
                  ? 'Turn off "Hide past events" to see everything you saved.'
                  : 'Tap the bookmark on any event to save it for later.'
            }
          />
        )}

        {mode === 'Recs' && savedRecs.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'bookmark-outline'}
            iconColorClassName="text-charcoal/50"
            title={
              q.length > 0
                ? `No results for "${query.trim()}"`
                : recCategoryFilter !== 'All'
                  ? `No saved ${recCategoryFilter} items`
                  : recKindFilter === 'All'
                    ? 'No saved recs'
                    : `No saved ${recKindFilter.toLowerCase()}`
            }
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : hideResolved
                  ? 'Turn off "Hide resolved asks" to see everything you saved.'
                  : 'Tap the bookmark on any board entry to save it for later.'
            }
          />
        )}

        {mode === 'Lend' && savedLendItems.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'bookmark-outline'}
            iconColorClassName="text-charcoal/50"
            title={
              q.length > 0
                ? `No results for "${query.trim()}"`
                : hideUnavailable
                  ? 'No available saved items'
                  : 'No saved items'
            }
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : hideUnavailable
                  ? 'Turn off "Hide unavailable items" to see everything you saved.'
                  : 'Tap the bookmark on any Borrow & Lend listing to save it for later.'
            }
          />
        )}

        {mode === 'For Sale' && savedSaleItems.length === 0 && (
          <EmptyState
            icon={q.length > 0 ? 'search-outline' : 'bookmark-outline'}
            iconColorClassName="text-charcoal/50"
            title={
              q.length > 0
                ? `No results for "${query.trim()}"`
                : hideSold
                  ? 'No available saved listings'
                  : 'No saved listings'
            }
            subtitle={
              q.length > 0
                ? 'Try a different search term.'
                : hideSold
                  ? 'Turn off "Hide sold items" to see everything you saved.'
                  : 'Tap the bookmark on any For Sale listing to save it for later.'
            }
          />
        )}

        {mode === 'Posts' && (
        <View className="gap-4">
          {savedPosts.map((post) => {
            const author = post.authorId === ME.id ? profile : ALL_PEOPLE.find((u) => u.id === post.authorId);
            if (!author) return null;
            const reactionCounts = getEffectiveReactions(post.reactions, myReactions[post.id]);
            const topTypes = getTopReactionTypes(reactionCounts, 2);
            const postComments = comments[post.id] ?? [];
            return (
              <Pressable
                key={post.id}
                onPress={() => router.push(`/post/${post.id}`)}
                className="rounded-3xl bg-cream p-4 shadow-sm active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <Image source={{ uri: author.avatar }} className="h-11 w-11 rounded-full" />
                  <View>
                    <Text className="font-semibold text-charcoal">{author.name}</Text>
                    <Text className="text-xs text-charcoal/60">
                      {post.time}
                      {post.edited && ' · edited'}
                    </Text>
                  </View>
                </View>

                <MentionText text={post.body} className="mt-3 text-[15px] leading-5 text-charcoal" />
                {post.imageUris && post.imageUris.length > 0 && (
                  <View className="mt-3">
                    <Image
                      source={{ uri: post.imageUris[0] }}
                      className="w-full rounded-2xl"
                      style={{ aspectRatio: 4 / 3 }}
                    />
                    {post.imageUris.length > 1 && (
                      <View className="absolute right-2 top-2 flex-row items-center gap-1 rounded-full bg-ink/60 px-2 py-1">
                        <Ionicons name="images" size={11} className="text-paper" />
                        <Text className="text-[10px] font-semibold text-paper">
                          {post.imageUris.length}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <View className="flex-row items-center gap-6">
                    <View className="flex-row items-center gap-1.5">
                      {topTypes.length > 0 ? (
                        <Text style={{ fontSize: 14 }}>
                          {topTypes.map((t) => REACTION_EMOJI[t]).join('')}
                        </Text>
                      ) : (
                        <Ionicons name="heart-outline" size={18} className="text-terracotta" />
                      )}
                      <Text className="text-sm text-charcoal/70">{getReactionTotal(reactionCounts)}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="chatbubble-outline" size={17} className="text-sage" />
                      <Text className="text-sm text-charcoal/70">
                        {getEffectiveReplies(post, postComments)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        togglePin(savedNoteKey('post', post.id));
                      }}
                    >
                      <Ionicons
                        name={pinned[savedNoteKey('post', post.id)] ? 'pin' : 'pin-outline'}
                        size={17}
                        className={pinned[savedNoteKey('post', post.id)] ? 'text-terracotta' : 'text-charcoal/40'}
                      />
                    </Pressable>
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        toggleSave(post.id);
                      }}
                    >
                      <Ionicons name="bookmark" size={18} className="text-gold" />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
        )}

        {mode === 'Events' && (
          <View className="gap-3">
            {savedEvents.map((e) => {
              const going = goingMap[e.id] ?? false;
              const isHost = e.hostId === ME.id;
              const { spotsTaken, spotsTotal } = getEffectiveSpots(e.id, going);
              const checkedInCount = getEffectiveCheckedInIds(e, myCheckIns[e.id] ?? false).length;
              return (
                <Pressable
                  key={e.id}
                  onPress={() => router.push(`/event/${e.id}`)}
                  className="flex-row gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  <View className="h-14 w-14 items-center justify-center rounded-xl bg-terracotta">
                    <Text className="text-xs font-semibold text-paper">{e.month}</Text>
                    <Text className="text-xl font-bold text-paper">{e.day}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="flex-1 font-semibold text-charcoal" numberOfLines={1}>
                        {e.title}
                      </Text>
                      <Pressable
                        onPress={(evt) => {
                          evt.stopPropagation();
                          togglePin(savedNoteKey('event', e.id));
                        }}
                        className="h-6 w-6 items-center justify-center"
                      >
                        <Ionicons
                          name={pinned[savedNoteKey('event', e.id)] ? 'pin' : 'pin-outline'}
                          size={14}
                          className={pinned[savedNoteKey('event', e.id)] ? 'text-terracotta' : 'text-charcoal/40'}
                        />
                      </Pressable>
                      <Pressable
                        onPress={(evt) => {
                          evt.stopPropagation();
                          toggleSaveEvent(e.id);
                        }}
                        className="h-6 w-6 items-center justify-center"
                      >
                        <Ionicons name="bookmark" size={15} className="text-gold" />
                      </Pressable>
                    </View>
                    <Text className="mt-0.5 text-xs text-charcoal/60">
                      {e.time} · {e.location}
                    </Text>
                    <Text className="mt-0.5 text-xs text-sage">
                      {e.status === 'past'
                        ? `${checkedInCount} were there`
                        : `${spotsTaken}/${spotsTotal} spots${going ? ' · Going' : isHost ? ' · Hosting' : ''}`}
                    </Text>
                    {renderNoteRow(savedNoteKey('event', e.id), false)}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {mode === 'Recs' && (
          <View className="gap-3">
            {savedRecs.map((entry) => {
              const author = entry.authorId === ME.id ? profile : ALL_PEOPLE.find((u) => u.id === entry.authorId);
              if (!author) return null;
              const agreed = myAgreed[entry.id] ?? false;
              const count = getEffectiveAgreeCount(entry.id, agreed);
              const isRec = entry.kind === 'rec';
              return (
                <Pressable
                  key={entry.id}
                  onPress={() => router.push('/recs')}
                  className="rounded-2xl bg-cream p-4 active:opacity-80"
                >
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
                      onPress={(evt) => {
                        evt.stopPropagation();
                        togglePin(savedNoteKey('rec', entry.id));
                      }}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons
                        name={pinned[savedNoteKey('rec', entry.id)] ? 'pin' : 'pin-outline'}
                        size={17}
                        className={pinned[savedNoteKey('rec', entry.id)] ? 'text-terracotta' : 'text-charcoal/40'}
                      />
                    </Pressable>
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        toggleSaveRec(entry.id);
                      }}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons name="bookmark" size={18} className="text-gold" />
                    </Pressable>
                  </View>
                  <Text className="mt-2 text-sm leading-5 text-charcoal/80">{entry.note}</Text>
                  <Text className="mt-3 border-t border-charcoal/10 pt-3 text-xs text-charcoal/50">
                    {count === 0
                      ? isRec
                        ? 'No agrees yet'
                        : 'No neighbors yet'
                      : isRec
                        ? `+${count} other${count === 1 ? '' : 's'} agree`
                        : `${count} neighbor${count === 1 ? '' : 's'} can help`}
                  </Text>
                  {renderNoteRow(savedNoteKey('rec', entry.id), false)}
                </Pressable>
              );
            })}
          </View>
        )}

        {mode === 'Lend' && (
          <View className="gap-3">
            {savedLendItems.map((item) => {
              const owner = item.ownerId === ME.id ? profile : ALL_PEOPLE.find((u) => u.id === item.ownerId);
              if (!owner) return null;
              const offered = myOffers[item.id] ?? false;
              const helperCount = getEffectiveHelperCount(item.id, offered);
              const itemStatus = lendStatus[item.id] ?? 'available';
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push('/lend')}
                  className="rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                      <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-charcoal">{item.title}</Text>
                      <Text className="text-xs text-charcoal/50">
                        {item.kind === 'have' ? owner.name : `${owner.name} is looking`}
                      </Text>
                    </View>
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        togglePin(savedNoteKey('lend', item.id));
                      }}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons
                        name={pinned[savedNoteKey('lend', item.id)] ? 'pin' : 'pin-outline'}
                        size={17}
                        className={pinned[savedNoteKey('lend', item.id)] ? 'text-terracotta' : 'text-charcoal/40'}
                      />
                    </Pressable>
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        toggleSaveLend(item.id);
                      }}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons name="bookmark" size={18} className="text-gold" />
                    </Pressable>
                  </View>
                  <Text className="mt-2 text-sm leading-5 text-charcoal/80">{item.note}</Text>
                  <Text className="mt-3 border-t border-charcoal/10 pt-3 text-xs text-charcoal/50">
                    {item.kind === 'have'
                      ? itemStatus === 'lent' || item.unavailableNote
                        ? 'Already lent'
                        : itemStatus === 'requested'
                          ? 'Request sent'
                          : 'Available to lend'
                      : helperCount === 0
                        ? 'No neighbors yet'
                        : `${helperCount} neighbor${helperCount === 1 ? '' : 's'} can help`}
                  </Text>
                  {renderNoteRow(savedNoteKey('lend', item.id), false)}
                </Pressable>
              );
            })}
          </View>
        )}

        {mode === 'For Sale' && (
          <View className="gap-3">
            {savedSaleItems.map((item) => {
              const owner = item.ownerId === ME.id ? profile : ALL_PEOPLE.find((u) => u.id === item.ownerId);
              if (!owner) return null;
              const isSold = sold[item.id] ?? false;
              const interested = myInterest[item.id] ?? false;
              const interestCount = getEffectiveInterestCount(item.id, interested);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push('/for-sale')}
                  className="rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                      <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-charcoal">{item.title}</Text>
                      <Text className="text-xs text-charcoal/50">
                        {owner.name} · {item.price}
                        {item.condition ? ` · ${item.condition}` : ''}
                      </Text>
                    </View>
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        togglePin(savedNoteKey('sale', item.id));
                      }}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons
                        name={pinned[savedNoteKey('sale', item.id)] ? 'pin' : 'pin-outline'}
                        size={17}
                        className={pinned[savedNoteKey('sale', item.id)] ? 'text-terracotta' : 'text-charcoal/40'}
                      />
                    </Pressable>
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        toggleSaveSale(item.id);
                      }}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons name="bookmark" size={18} className="text-gold" />
                    </Pressable>
                  </View>
                  <Text className="mt-2 text-sm leading-5 text-charcoal/80">{item.note}</Text>
                  <Text className="mt-3 border-t border-charcoal/10 pt-3 text-xs text-charcoal/50">
                    {isSold
                      ? 'Sold'
                      : interestCount === 0
                        ? 'No interest yet'
                        : `${interestCount} neighbor${interestCount === 1 ? '' : 's'} interested`}
                  </Text>
                  {renderNoteRow(savedNoteKey('sale', item.id), false)}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
