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
import { getUser, ME } from '../data/mock';
import { photoCaptionKey, usePhotoCaptionsStore } from '../store/usePhotoCaptionsStore';
import { recCommentKey, useRecCommentsStore } from '../store/useRecCommentsStore';
import { useRecNotesStore } from '../store/useRecNotesStore';
import { getEffectiveAgreeCount, getEffectiveAgreedIds, useRecsStore } from '../store/useRecsStore';
import { useSavedRecsStore } from '../store/useSavedRecsStore';
import { useSavedRecSearchesStore } from '../store/useSavedRecSearchesStore';
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
  const resolveEntry = useRecsStore((s) => s.resolveEntry);
  const reopenEntry = useRecsStore((s) => s.reopenEntry);
  const savedIds = useSavedRecsStore((s) => s.savedIds);
  const toggleSave = useSavedRecsStore((s) => s.toggleSave);
  const profile = useProfileStore((s) => s.profile);
  const comments = useRecCommentsStore((s) => s.comments);
  const addComment = useRecCommentsStore((s) => s.addComment);
  const updateComment = useRecCommentsStore((s) => s.updateComment);
  const deleteComment = useRecCommentsStore((s) => s.deleteComment);
  const myCommentReactions = useRecCommentsStore((s) => s.myReactions);
  const tapCommentReaction = useRecCommentsStore((s) => s.tapReaction);
  const setCommentReaction = useRecCommentsStore((s) => s.setReaction);
  const bestAnswerIds = useRecCommentsStore((s) => s.bestAnswerId);
  const markBestAnswer = useRecCommentsStore((s) => s.markBestAnswer);
  const unmarkBestAnswer = useRecCommentsStore((s) => s.unmarkBestAnswer);
  const pinnedCommentIds = useRecCommentsStore((s) => s.pinnedCommentId);
  const togglePinComment = useRecCommentsStore((s) => s.togglePinComment);
  const photoCaptions = usePhotoCaptionsStore((s) => s.captions);
  const setPhotoCaption = usePhotoCaptionsStore((s) => s.setCaption);
  const savedSearches = useSavedRecSearchesStore((s) => s.searches);
  const saveSearch = useSavedRecSearchesStore((s) => s.saveSearch);
  const deleteSearch = useSavedRecSearchesStore((s) => s.deleteSearch);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [kindFilter, setKindFilter] = useState<KindFilter>('All');
  const [sortBy, setSortBy] = useState<RecsSort>('Newest');
  const [query, setQuery] = useState('');
  const [savingSearch, setSavingSearch] = useState(false);
  const [searchNameDraft, setSearchNameDraft] = useState('');
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [viewingAgreedId, setViewingAgreedId] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const entryNotes = useRecNotesStore((s) => s.notes);
  const setEntryNote = useRecNotesStore((s) => s.setNote);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [entryNoteDraft, setEntryNoteDraft] = useState('');
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [viewingCommentsId, setViewingCommentsId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [confirmingDeleteCommentId, setConfirmingDeleteCommentId] = useState<string | null>(null);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentDraft, setEditCommentDraft] = useState('');
  const [viewingPhotos, setViewingPhotos] = useState<{
    uris: string[];
    index: number;
    entryId: string;
    isMine: boolean;
  } | null>(null);

  const sharingEntry = entries.find((e) => e.id === sharingId);
  const viewingAgreedEntry = entries.find((e) => e.id === viewingAgreedId);
  const viewingAgreedIds = viewingAgreedEntry
    ? getEffectiveAgreedIds(viewingAgreedEntry.id, myAgreed[viewingAgreedEntry.id] ?? false)
    : [];
  const viewingCommentsEntry = entries.find((e) => e.id === viewingCommentsId);
  const viewingBestAnswerId = viewingCommentsEntry ? bestAnswerIds[viewingCommentsEntry.id] : undefined;
  const canMarkBestAnswer =
    viewingCommentsEntry?.kind === 'ask' && viewingCommentsEntry.authorId === ME.id;
  const viewingPinnedCommentId = viewingCommentsEntry
    ? pinnedCommentIds[viewingCommentsEntry.id]
    : undefined;
  const canPinComments = viewingCommentsEntry?.authorId === ME.id;
  const viewingComments = viewingCommentsEntry ? (comments[viewingCommentsEntry.id] ?? []) : [];
  const sortedViewingComments = [...viewingComments].sort((a, b) => {
    const aPinned = a.id === viewingPinnedCommentId;
    const bPinned = b.id === viewingPinnedCommentId;
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    const aBest = a.id === viewingBestAnswerId;
    const bBest = b.id === viewingBestAnswerId;
    if (aBest !== bBest) return aBest ? -1 : 1;
    return 0;
  });

  const isSearchModified =
    query.trim().length > 0 || categoryFilter !== 'All' || kindFilter !== 'All' || sortBy !== 'Newest';

  const applySearch = (search: (typeof savedSearches)[number]) => {
    setQuery(search.query);
    setCategoryFilter(search.categoryFilter);
    setKindFilter(search.kindFilter as KindFilter);
    setSortBy(search.sortBy as RecsSort);
  };

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

  const renderEntryNote = (entryId: string) => {
    if (editingNoteId === entryId) {
      return (
        <View className="mt-2">
          <TextInput
            value={entryNoteDraft}
            onChangeText={setEntryNoteDraft}
            placeholder="Only you can see this..."
            placeholderTextColor="#3D3D3D80"
            multiline
            autoFocus
            className="min-h-[52px] rounded-xl bg-sand px-3 py-2 text-xs text-charcoal"
          />
          <View className="mt-2 flex-row justify-end gap-4">
            <Pressable onPress={() => setEditingNoteId(null)}>
              <Text className="text-xs font-medium text-charcoal/50">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setEntryNote(entryId, entryNoteDraft);
                setEditingNoteId(null);
              }}
            >
              <Text className="text-xs font-semibold text-terracotta">Save note</Text>
            </Pressable>
          </View>
        </View>
      );
    }
    const note = entryNotes[entryId];
    return (
      <Pressable
        onPress={() => {
          setEntryNoteDraft(note ?? '');
          setEditingNoteId(entryId);
        }}
        className="mt-2 flex-row items-start gap-1"
      >
        <Ionicons name="lock-closed-outline" size={12} className="mt-0.5 text-charcoal/40" />
        <Text className="flex-1 text-xs italic text-charcoal/50" numberOfLines={2}>
          {note || 'Add a private note'}
        </Text>
      </Pressable>
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
          {isSearchModified && (
            <Pressable
              onPress={() => {
                setSearchNameDraft('');
                setSavingSearch(true);
              }}
              className="h-7 w-7 items-center justify-center"
            >
              <Ionicons name="bookmark-outline" size={17} className="text-charcoal/50" />
            </Pressable>
          )}
        </View>
        {savingSearch && (
          <View className="mt-2 flex-row items-center gap-2 rounded-full bg-cream px-4 py-2">
            <TextInput
              value={searchNameDraft}
              onChangeText={setSearchNameDraft}
              placeholder="Name this search..."
              placeholderTextColor="#3D3D3D80"
              autoFocus
              className="flex-1 text-sm text-charcoal"
            />
            <Pressable onPress={() => setSavingSearch(false)}>
              <Text className="text-xs font-medium text-charcoal/50">Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!searchNameDraft.trim()}
              onPress={() => {
                saveSearch({
                  name: searchNameDraft.trim(),
                  query,
                  categoryFilter,
                  kindFilter,
                  sortBy,
                });
                setSavingSearch(false);
              }}
            >
              <Text
                className={`text-xs font-semibold ${
                  searchNameDraft.trim() ? 'text-terracotta' : 'text-charcoal/30'
                }`}
              >
                Save
              </Text>
            </Pressable>
          </View>
        )}
        {savedSearches.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="mt-2 gap-2"
          >
            {savedSearches.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => applySearch(s)}
                className="flex-row items-center gap-1.5 rounded-full bg-sand px-3 py-1.5"
              >
                <Ionicons name="bookmark" size={11} className="text-terracotta" />
                <Text className="text-xs font-medium text-charcoal">{s.name}</Text>
                <Pressable onPress={() => deleteSearch(s.id)} className="ml-0.5">
                  <Ionicons name="close" size={12} className="text-charcoal/40" />
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        )}
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

                if (deletingEntryId === entry.id) {
                  return (
                    <View key={entry.id} className="gap-2 rounded-2xl bg-terracotta/10 p-4">
                      <Text className="text-sm text-charcoal">
                        Delete this post? This can't be undone.
                      </Text>
                      <View className="flex-row justify-end gap-4">
                        <Pressable onPress={() => setDeletingEntryId(null)}>
                          <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            deleteEntry(entry.id);
                            setDeletingEntryId(null);
                          }}
                        >
                          <Text className="text-sm font-semibold text-terracotta">Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={entry.id} className="rounded-2xl bg-cream p-4">
                    <View className="flex-row items-center gap-3">
                      <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                        <Text style={{ fontSize: 20 }}>{entry.emoji}</Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5">
                          <Text className="font-semibold text-charcoal">
                            {entry.kind === 'rec' ? (entry.name ?? entry.category) : entry.category}
                          </Text>
                          {entry.kind === 'ask' && entry.resolved && (
                            <View className="rounded-full bg-sage/20 px-2 py-0.5">
                              <Text className="text-[10px] font-bold text-sage">RESOLVED</Text>
                            </View>
                          )}
                          {entry.kind === 'ask' && entry.urgent && !entry.resolved && (
                            <View className="rounded-full bg-terracotta/15 px-2 py-0.5">
                              <Text className="text-[10px] font-bold text-terracotta">URGENT</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-charcoal/50">
                          {entry.kind === 'rec' ? `Your ${entry.category} recommendation` : 'You asked the board'}
                        </Text>
                      </View>
                      {entry.kind === 'ask' && (
                        <Pressable
                          onPress={() =>
                            entry.resolved ? reopenEntry(entry.id) : resolveEntry(entry.id)
                          }
                          className="h-8 w-8 items-center justify-center rounded-full"
                        >
                          <Ionicons
                            name={entry.resolved ? 'checkmark-circle' : 'checkmark-circle-outline'}
                            size={18}
                            className={entry.resolved ? 'text-sage' : 'text-charcoal/50'}
                          />
                        </Pressable>
                      )}
                      <Pressable
                        onPress={() => setSharingId(entry.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="arrow-redo-outline" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => setViewingCommentsId(entry.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="chatbubble-outline" size={15} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => router.push(`/create-rec?id=${entry.id}`)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="pencil" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => router.push(`/create-rec?duplicateId=${entry.id}`)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="copy-outline" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => setDeletingEntryId(entry.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                      </Pressable>
                    </View>
                    {entry.imageUris && entry.imageUris.length > 0 && (
                      <PhotoCarousel
                        uris={entry.imageUris}
                        onPhotoPress={(i) =>
                          setViewingPhotos({
                            uris: entry.imageUris!,
                            index: i,
                            entryId: entry.id,
                            isMine: true,
                          })
                        }
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
                    {renderEntryNote(entry.id)}
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
                    <View className="flex-row items-center gap-1.5">
                      <Text className="font-semibold text-charcoal">
                        {isRec ? (entry.name ?? entry.category) : entry.category}
                      </Text>
                      {!isRec && entry.resolved && (
                        <View className="rounded-full bg-sage/20 px-2 py-0.5">
                          <Text className="text-[10px] font-bold text-sage">RESOLVED</Text>
                        </View>
                      )}
                      {!isRec && entry.urgent && !entry.resolved && (
                        <View className="rounded-full bg-terracotta/15 px-2 py-0.5">
                          <Text className="text-[10px] font-bold text-terracotta">URGENT</Text>
                        </View>
                      )}
                    </View>
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
                    onPress={() => setViewingCommentsId(entry.id)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons name="chatbubble-outline" size={17} className="text-charcoal/40" />
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
                  <Pressable
                    onPress={() => setReportingId(entry.id)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons name="flag-outline" size={17} className="text-charcoal/40" />
                  </Pressable>
                </View>
                <Text className="mt-2 text-sm leading-5 text-charcoal/80">{entry.note}</Text>
                {entry.imageUris && entry.imageUris.length > 0 && (
                  <PhotoCarousel
                    uris={entry.imageUris}
                    onPhotoPress={(i) =>
                      setViewingPhotos({
                        uris: entry.imageUris!,
                        index: i,
                        entryId: entry.id,
                        isMine: false,
                      })
                    }
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
                    disabled={!isRec && entry.resolved}
                    className={`rounded-full px-4 py-1.5 ${
                      !isRec && entry.resolved ? 'bg-sand' : agreed ? 'bg-sage/20' : 'bg-ink'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        !isRec && entry.resolved
                          ? 'text-charcoal/40'
                          : agreed
                            ? 'text-sage'
                            : 'text-paper'
                      }`}
                    >
                      {!isRec && entry.resolved
                        ? 'Resolved'
                        : agreed
                          ? isRec
                            ? 'You agree ✓'
                            : 'You offered ✓'
                          : isRec
                            ? "+1, I've used them too"
                            : 'I have one'}
                    </Text>
                  </Pressable>
                </View>
                {renderEntryNote(entry.id)}
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

      {reportingId && (
        <ReportPostSheet
          onClose={() => setReportingId(null)}
          title="Post options"
          actionLabel="Report this post"
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

      {viewingCommentsEntry && (
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
                      No comments yet — ask a question or add a note.
                    </Text>
                  )}
                  {sortedViewingComments.map((c) => {
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
                                deleteComment(viewingCommentsEntry.id, c.id);
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
                                updateComment(viewingCommentsEntry.id, c.id, editCommentDraft);
                                setEditingCommentId(null);
                              }}
                            >
                              <Text className="text-sm font-semibold text-terracotta">Save</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    }

                    const isBest = c.id === viewingBestAnswerId;
                    const isPinned = c.id === viewingPinnedCommentId;
                    return (
                      <View
                        key={c.id}
                        className={`flex-row items-start gap-2.5 rounded-2xl p-3 ${
                          isBest ? 'bg-sage/15' : 'bg-sand'
                        }`}
                      >
                        <Image source={{ uri: author.avatar }} className="h-8 w-8 rounded-full" />
                        <View className="flex-1">
                          {isPinned && (
                            <View className="mb-1 flex-row items-center gap-1 self-start rounded-full bg-gold/20 px-2 py-0.5">
                              <Ionicons name="pin" size={10} className="text-gold" />
                              <Text className="text-[10px] font-semibold uppercase tracking-wide text-gold">
                                Pinned
                              </Text>
                            </View>
                          )}
                          {isBest && (
                            <View className="mb-1 flex-row items-center gap-1 self-start rounded-full bg-sage/25 px-2 py-0.5">
                              <Ionicons name="checkmark-circle" size={11} className="text-sage" />
                              <Text className="text-[10px] font-semibold uppercase tracking-wide text-sage">
                                Best answer
                              </Text>
                            </View>
                          )}
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
                            myReaction={myCommentReactions[recCommentKey(viewingCommentsEntry.id, c.id)]}
                            onTap={() => tapCommentReaction(viewingCommentsEntry.id, c.id)}
                            onSelect={(type) => setCommentReaction(viewingCommentsEntry.id, c.id, type)}
                          />
                        </View>
                        {canPinComments && (
                          <Pressable
                            onPress={() => togglePinComment(viewingCommentsEntry.id, c.id)}
                            className="h-7 w-7 items-center justify-center"
                          >
                            <Ionicons
                              name={isPinned ? 'pin' : 'pin-outline'}
                              size={14}
                              className={isPinned ? 'text-gold' : 'text-charcoal/30'}
                            />
                          </Pressable>
                        )}
                        {canMarkBestAnswer && (
                          <Pressable
                            onPress={() =>
                              isBest
                                ? unmarkBestAnswer(viewingCommentsEntry.id)
                                : markBestAnswer(viewingCommentsEntry.id, c.id)
                            }
                            className="h-7 w-7 items-center justify-center"
                          >
                            <Ionicons
                              name={isBest ? 'checkmark-circle' : 'checkmark-circle-outline'}
                              size={16}
                              className={isBest ? 'text-sage' : 'text-charcoal/30'}
                            />
                          </Pressable>
                        )}
                        {isMine ? (
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
                        ) : (
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
                    addComment(viewingCommentsEntry.id, commentDraft);
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
            (_, i) => photoCaptions[photoCaptionKey(viewingPhotos.entryId, i)] ?? ''
          )}
          editableIndices={viewingPhotos.uris.map(() => viewingPhotos.isMine)}
          onCaptionChange={(i, text) =>
            setPhotoCaption(photoCaptionKey(viewingPhotos.entryId, i), text)
          }
        />
      )}
    </SafeAreaView>
  );
}
