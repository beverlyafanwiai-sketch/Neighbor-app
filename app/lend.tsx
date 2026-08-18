import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import ForwardSheet, { type ForwardTarget } from '../components/ForwardSheet';
import MentionText from '../components/MentionText';
import MentionTextInput from '../components/MentionTextInput';
import PhotoCarousel from '../components/PhotoCarousel';
import PhotoViewer from '../components/PhotoViewer';
import ReactionButton from '../components/ReactionButton';
import ReportPostSheet from '../components/ReportPostSheet';
import ShareSheet from '../components/ShareSheet';
import { getUser, ME } from '../data/mock';
import { useBlockedStore } from '../store/useBlockedStore';
import { useConversationsStore } from '../store/useConversationsStore';
import { useDismissedListingsStore } from '../store/useDismissedListingsStore';
import { useFriendsStore } from '../store/useFriendsStore';
import { useGroupChatStore } from '../store/useGroupChatStore';
import {
  itemCommentKey,
  itemCommentReactionKey,
  useItemCommentsStore,
} from '../store/useItemCommentsStore';
import {
  getEffectiveLendRatingSummary,
  useLendRatingsStore,
} from '../store/useLendRatingsStore';
import { getEffectiveHelperCount, getEffectiveHelperIds, useLendStore } from '../store/useLendStore';
import { useMutedStore } from '../store/useMutedStore';
import { photoCaptionKey, usePhotoCaptionsStore } from '../store/usePhotoCaptionsStore';
import { useProfileStore } from '../store/useProfileStore';
import { useSavedLendSearchesStore } from '../store/useSavedLendSearchesStore';
import { useSavedLendStore } from '../store/useSavedLendStore';

const LEND_SORTS = ['Newest', 'A-Z', 'Most helpers'] as const;
type LendSort = (typeof LEND_SORTS)[number];

const KIND_FILTERS = ['All', 'Have', 'Want'] as const;
type KindFilter = (typeof KIND_FILTERS)[number];

export default function LendBoard() {
  const items = useLendStore((s) => s.items);
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const mutedIds = useMutedStore((s) => s.mutedIds);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const status = useLendStore((s) => s.status);
  const borrowerId = useLendStore((s) => s.borrowerId);
  const dueLabel = useLendStore((s) => s.dueLabel);
  const pendingRequesterId = useLendStore((s) => s.pendingRequesterId);
  const myOffers = useLendStore((s) => s.myOffers);
  const requestToBorrow = useLendStore((s) => s.requestToBorrow);
  const cancelRequest = useLendStore((s) => s.cancelRequest);
  const requestNotes = useLendStore((s) => s.requestNotes);
  const approveRequest = useLendStore((s) => s.approveRequest);
  const declineRequest = useLendStore((s) => s.declineRequest);
  const markReturned = useLendStore((s) => s.markReturned);
  const updateDueDate = useLendStore((s) => s.updateDueDate);
  const offerToHelp = useLendStore((s) => s.offerToHelp);
  const helpNotes = useLendStore((s) => s.helpNotes);
  const notifyWhenAvailable = useLendStore((s) => s.notifyWhenAvailable);
  const toggleNotifyWhenAvailable = useLendStore((s) => s.toggleNotifyWhenAvailable);
  const deleteItem = useLendStore((s) => s.deleteItem);
  const profile = useProfileStore((s) => s.profile);
  const savedIds = useSavedLendStore((s) => s.savedIds);
  const toggleSave = useSavedLendStore((s) => s.toggleSave);
  const photoCaptions = usePhotoCaptionsStore((s) => s.captions);
  const setPhotoCaption = usePhotoCaptionsStore((s) => s.setCaption);
  const itemComments = useItemCommentsStore((s) => s.comments);
  const addItemComment = useItemCommentsStore((s) => s.addComment);
  const updateItemComment = useItemCommentsStore((s) => s.updateComment);
  const deleteItemComment = useItemCommentsStore((s) => s.deleteComment);
  const myItemCommentReactions = useItemCommentsStore((s) => s.myReactions);
  const tapItemCommentReaction = useItemCommentsStore((s) => s.tapReaction);
  const setItemCommentReaction = useItemCommentsStore((s) => s.setReaction);
  const pinnedCommentIds = useItemCommentsStore((s) => s.pinnedCommentId);
  const togglePinComment = useItemCommentsStore((s) => s.togglePinComment);
  const dismissedLendIds = useDismissedListingsStore((s) => s.dismissedLendIds);
  const dismissLendItem = useDismissedListingsStore((s) => s.dismissLendItem);
  const completedBorrows = useLendStore((s) => s.completedBorrows);
  const myLendRatings = useLendRatingsStore((s) => s.myRatings);
  const rateLendItem = useLendRatingsStore((s) => s.rateItem);

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [viewingHelpersId, setViewingHelpersId] = useState<string | null>(null);
  const [viewingCommentsId, setViewingCommentsId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [confirmingDeleteCommentId, setConfirmingDeleteCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentDraft, setEditCommentDraft] = useState('');
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [forwardingCommentId, setForwardingCommentId] = useState<string | null>(null);
  const [replyingToComment, setReplyingToComment] = useState<{
    id: string;
    senderName: string;
    preview: string;
  } | null>(null);
  const savedSearches = useSavedLendSearchesStore((s) => s.searches);
  const saveSearch = useSavedLendSearchesStore((s) => s.saveSearch);
  const renameSearch = useSavedLendSearchesStore((s) => s.renameSearch);
  const deleteSearch = useSavedLendSearchesStore((s) => s.deleteSearch);
  const [sortBy, setSortBy] = useState<LendSort>('Newest');
  const [kindFilter, setKindFilter] = useState<KindFilter>('All');
  const [query, setQuery] = useState('');
  const [hideUnavailable, setHideUnavailable] = useState(false);
  const [onlyFriends, setOnlyFriends] = useState(false);
  const [savingSearch, setSavingSearch] = useState(false);
  const [renamingSearchId, setRenamingSearchId] = useState<string | null>(null);
  const [searchNameDraft, setSearchNameDraft] = useState('');
  const [viewingPhotos, setViewingPhotos] = useState<{
    uris: string[];
    index: number;
    itemId: string;
    isMine: boolean;
  } | null>(null);
  const [approvingItemId, setApprovingItemId] = useState<string | null>(null);
  const [decliningRequestItemId, setDecliningRequestItemId] = useState<string | null>(null);
  const [offeringHelpItemId, setOfferingHelpItemId] = useState<string | null>(null);
  const [helpNoteDraft, setHelpNoteDraft] = useState('');
  const [declineRequestNoteDraft, setDeclineRequestNoteDraft] = useState('');
  const [editingDueDateItemId, setEditingDueDateItemId] = useState<string | null>(null);
  const [requestingBorrowId, setRequestingBorrowId] = useState<string | null>(null);
  const [borrowRequestNote, setBorrowRequestNote] = useState('');
  const [dueDays, setDueDays] = useState(5);
  const [ratingItemId, setRatingItemId] = useState<string | null>(null);
  const [ratingDraftStars, setRatingDraftStars] = useState(0);
  const [ratingDraftComment, setRatingDraftComment] = useState('');

  const matchesKind = (i: (typeof items)[number]) =>
    kindFilter === 'All' || (kindFilter === 'Have' ? i.kind === 'have' : i.kind === 'want');
  const q = query.trim().toLowerCase();
  const matchesQuery = (i: (typeof items)[number]) =>
    q.length === 0 || i.title.toLowerCase().includes(q) || i.note.toLowerCase().includes(q);

  const isSearchModified =
    query.trim().length > 0 ||
    sortBy !== 'Newest' ||
    kindFilter !== 'All' ||
    hideUnavailable ||
    onlyFriends;

  const applySearch = (search: (typeof savedSearches)[number]) => {
    setQuery(search.query);
    setSortBy(search.sortBy as LendSort);
    setKindFilter(search.kindFilter as KindFilter);
    setHideUnavailable(search.hideUnavailable);
    setOnlyFriends(Boolean(search.onlyFriends));
  };

  const myItems = items.filter((i) => i.ownerId === ME.id && matchesKind(i) && matchesQuery(i));
  const unsortedBoardItems = items.filter(
    (i) =>
      i.ownerId !== ME.id &&
      !blockedIds[i.ownerId] &&
      !mutedIds[i.ownerId] &&
      (!onlyFriends || friendStatuses[i.ownerId] === 'friends') &&
      matchesKind(i) &&
      matchesQuery(i) &&
      (!hideUnavailable || ((status[i.id] ?? 'available') === 'available' && !i.unavailableNote)) &&
      !(dismissedLendIds[i.id] ?? false)
  );
  const boardItems =
    sortBy === 'A-Z'
      ? [...unsortedBoardItems].sort((a, b) => a.title.localeCompare(b.title))
      : sortBy === 'Most helpers'
        ? [...unsortedBoardItems].sort(
            (a, b) =>
              getEffectiveHelperCount(b.id, myOffers[b.id] ?? false) -
              getEffectiveHelperCount(a.id, myOffers[a.id] ?? false)
          )
        : unsortedBoardItems;
  const sharingItem = items.find((i) => i.id === sharingId);
  const viewingHelpersItem = items.find((i) => i.id === viewingHelpersId);
  const viewingHelpersIds = viewingHelpersItem
    ? getEffectiveHelperIds(
        viewingHelpersItem.id,
        viewingHelpersItem.ownerId === ME.id ? false : myOffers[viewingHelpersItem.id] ?? false
      )
    : [];
  const viewingCommentsItem = items.find((i) => i.id === viewingCommentsId);
  const viewingCommentsKey = viewingCommentsItem ? itemCommentKey('lend', viewingCommentsItem.id) : null;
  const viewingComments = viewingCommentsKey ? (itemComments[viewingCommentsKey] ?? []) : [];
  const viewingPinnedCommentId = viewingCommentsKey ? pinnedCommentIds[viewingCommentsKey] : undefined;
  const canPinComments = viewingCommentsItem?.ownerId === ME.id;
  const sortedViewingComments = viewingPinnedCommentId
    ? [...viewingComments].sort((a, b) =>
        a.id === viewingPinnedCommentId ? -1 : b.id === viewingPinnedCommentId ? 1 : 0
      )
    : viewingComments;
  const forwardingComment = viewingComments.find((c) => c.id === forwardingCommentId);

  const forwardComment = (target: ForwardTarget) => {
    if (!forwardingComment) return;
    const author = forwardingComment.authorId === ME.id ? profile : getUser(forwardingComment.authorId);
    const senderName = forwardingComment.authorId === ME.id ? 'You' : (author?.name ?? 'Someone');
    if (target.kind === 'dm') {
      useConversationsStore.getState().sendMessage(target.id, forwardingComment.text, undefined, senderName);
    } else {
      useGroupChatStore.getState().sendMessage(target.id, forwardingComment.text, undefined, senderName);
    }
  };

  const renderLendRating = (itemId: string) => {
    if (!completedBorrows[itemId]) return null;
    const myRating = myLendRatings[itemId];
    const summary = getEffectiveLendRatingSummary(itemId, myRating);

    if (ratingItemId === itemId) {
      return (
        <View className="mt-3 gap-2 border-t border-charcoal/10 pt-3">
          <View className="flex-row gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRatingDraftStars(n)}>
                <Ionicons
                  name={n <= ratingDraftStars ? 'star' : 'star-outline'}
                  size={22}
                  className="text-gold"
                />
              </Pressable>
            ))}
          </View>
          <TextInput
            value={ratingDraftComment}
            onChangeText={setRatingDraftComment}
            placeholder="Add a comment (optional)"
            placeholderTextColor="#3D3D3D80"
            multiline
            className="rounded-xl bg-sand px-3 py-2 text-sm text-charcoal"
          />
          <View className="flex-row justify-end gap-4">
            <Pressable onPress={() => setRatingItemId(null)}>
              <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
            </Pressable>
            <Pressable
              disabled={ratingDraftStars === 0}
              onPress={() => {
                rateLendItem(itemId, ratingDraftStars, ratingDraftComment.trim());
                setRatingItemId(null);
              }}
            >
              <Text
                className={`text-sm font-semibold ${
                  ratingDraftStars === 0 ? 'text-charcoal/30' : 'text-terracotta'
                }`}
              >
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <Pressable
        onPress={() => {
          setRatingItemId(itemId);
          setRatingDraftStars(myRating?.stars ?? 0);
          setRatingDraftComment(myRating?.comment ?? '');
        }}
        className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3"
      >
        <View className="flex-row items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Ionicons
              key={n}
              name={n <= (myRating?.stars ?? Math.round(summary.avg)) ? 'star' : 'star-outline'}
              size={14}
              className="text-gold"
            />
          ))}
          <Text className="text-xs text-charcoal/50">
            {myRating
              ? 'Your rating'
              : summary.count > 0
                ? `${summary.avg.toFixed(1)} (${summary.count})`
                : 'Rate this item'}
          </Text>
        </View>
        <Ionicons name={myRating ? 'pencil' : 'chevron-forward'} size={14} className="text-charcoal/40" />
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
        <Text className="text-base font-bold text-charcoal">Borrow & Lend</Text>
        <Pressable
          onPress={() => router.push('/create-lend-item')}
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
            placeholder="Search items..."
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} className="text-charcoal/50" />
            </Pressable>
          )}
          {isSearchModified && (
            <Pressable
              onPress={() => {
                setSearchNameDraft('');
                setSavingSearch(true);
              }}
              className="ml-2 h-7 w-7 items-center justify-center"
            >
              <Ionicons name="bookmark-outline" size={17} className="text-charcoal/50" />
            </Pressable>
          )}
        </View>
        {(savingSearch || renamingSearchId) && (
          <View className="mt-2 flex-row items-center gap-2 rounded-full bg-cream px-4 py-2">
            <TextInput
              value={searchNameDraft}
              onChangeText={setSearchNameDraft}
              placeholder={renamingSearchId ? 'Rename search...' : 'Name this search...'}
              placeholderTextColor="#3D3D3D80"
              autoFocus
              className="flex-1 text-sm text-charcoal"
            />
            <Pressable
              onPress={() => {
                setSavingSearch(false);
                setRenamingSearchId(null);
              }}
            >
              <Text className="text-xs font-medium text-charcoal/50">Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!searchNameDraft.trim()}
              onPress={() => {
                if (renamingSearchId) {
                  renameSearch(renamingSearchId, searchNameDraft);
                } else {
                  saveSearch({
                    name: searchNameDraft.trim(),
                    query,
                    sortBy,
                    kindFilter,
                    hideUnavailable,
                    onlyFriends,
                  });
                }
                setSavingSearch(false);
                setRenamingSearchId(null);
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
                className="flex-row items-center gap-1.5 rounded-full bg-cream px-3 py-1.5"
              >
                <Ionicons name="bookmark" size={11} className="text-terracotta" />
                <Text className="text-xs font-medium text-charcoal">{s.name}</Text>
                <Pressable
                  onPress={(evt) => {
                    evt.stopPropagation();
                    setSearchNameDraft(s.name);
                    setRenamingSearchId(s.id);
                  }}
                  className="ml-0.5"
                >
                  <Ionicons name="pencil" size={11} className="text-charcoal/40" />
                </Pressable>
                <Pressable
                  onPress={(evt) => {
                    evt.stopPropagation();
                    deleteSearch(s.id);
                  }}
                  className="ml-0.5"
                >
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          Lend a hand, borrow a tool. No need to own everything when your neighbors already do.
        </Text>

        <View className="mt-3 flex-row flex-wrap items-center gap-x-4 gap-y-1.5">
          <Pressable
            onPress={() => setHideUnavailable((h) => !h)}
            className="flex-row items-center gap-2"
          >
            <Ionicons
              name={hideUnavailable ? 'checkbox' : 'square-outline'}
              size={16}
              className={hideUnavailable ? 'text-terracotta' : 'text-charcoal/40'}
            />
            <Text className="text-xs font-medium text-charcoal/60">Hide unavailable items</Text>
          </Pressable>
          <Pressable
            onPress={() => setOnlyFriends((v) => !v)}
            className="flex-row items-center gap-2"
          >
            <Ionicons
              name={onlyFriends ? 'checkbox' : 'square-outline'}
              size={16}
              className={onlyFriends ? 'text-terracotta' : 'text-charcoal/40'}
            />
            <Text className="text-xs font-medium text-charcoal/60">Friends only</Text>
          </Pressable>
        </View>

        {unsortedBoardItems.length > 1 && (
          <View className="mt-4 flex-row items-center gap-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
              Sort
            </Text>
            {LEND_SORTS.map((s) => (
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

        {myItems.length > 0 && (
          <>
            <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              My items
            </Text>
            <View className="gap-3">
              {myItems.map((item) => {
                const itemStatus = status[item.id] ?? 'available';
                const requesterId = pendingRequesterId[item.id];
                const requester = requesterId ? getUser(requesterId) : undefined;
                const borrower = borrowerId[item.id] ? getUser(borrowerId[item.id]) : undefined;
                const helperCount = getEffectiveHelperCount(item.id, false);

                if (deletingItemId === item.id) {
                  return (
                    <View key={item.id} className="gap-2 rounded-2xl bg-terracotta/10 p-4">
                      <Text className="text-sm text-charcoal">
                        Delete this item? This can't be undone.
                      </Text>
                      <View className="flex-row justify-end gap-4">
                        <Pressable onPress={() => setDeletingItemId(null)}>
                          <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            deleteItem(item.id);
                            setDeletingItemId(null);
                          }}
                        >
                          <Text className="text-sm font-semibold text-terracotta">Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={item.id} className="rounded-2xl bg-cream p-4">
                    <View className="flex-row items-center gap-3">
                      <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                        <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-charcoal">{item.title}</Text>
                        <Text className="text-xs text-charcoal/50">
                          {item.kind === 'have' ? 'You have this to lend' : "You're looking to borrow"}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => setSharingId(item.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="arrow-redo-outline" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => setViewingCommentsId(item.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="chatbubble-outline" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => router.push(`/create-lend-item?id=${item.id}`)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="pencil" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => router.push(`/create-lend-item?duplicateId=${item.id}`)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="copy-outline" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => setDeletingItemId(item.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                      </Pressable>
                    </View>
                    {item.imageUris && item.imageUris.length > 0 && (
                      <PhotoCarousel
                        uris={item.imageUris}
                        onPhotoPress={(i) =>
                          setViewingPhotos({
                            uris: item.imageUris!,
                            index: i,
                            itemId: item.id,
                            isMine: true,
                          })
                        }
                      />
                    )}

                    {item.kind === 'have' ? (
                      requester ? (
                        <View className="mt-3 border-t border-charcoal/10 pt-3">
                          <Text className="text-sm text-charcoal">
                            {requester.name} wants to borrow this
                          </Text>
                          {approvingItemId === item.id ? (
                            <View className="mt-2 gap-2">
                              <Text className="text-xs text-charcoal/50">Back by, in days:</Text>
                              <View className="flex-row gap-2">
                                {[3, 5, 7, 14].map((d) => (
                                  <Pressable
                                    key={d}
                                    onPress={() => setDueDays(d)}
                                    className={`rounded-full px-3 py-1.5 ${
                                      dueDays === d ? 'bg-terracotta' : 'bg-sand'
                                    }`}
                                  >
                                    <Text
                                      className={`text-xs font-semibold ${
                                        dueDays === d ? 'text-paper' : 'text-charcoal'
                                      }`}
                                    >
                                      {d}
                                    </Text>
                                  </Pressable>
                                ))}
                              </View>
                              <View className="flex-row gap-2">
                                <Pressable
                                  onPress={() => {
                                    approveRequest(item.id, dueDays);
                                    setApprovingItemId(null);
                                  }}
                                  className="rounded-full bg-terracotta px-4 py-1.5"
                                >
                                  <Text className="text-xs font-semibold text-paper">
                                    Confirm approve
                                  </Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => setApprovingItemId(null)}
                                  className="rounded-full bg-sand px-4 py-1.5"
                                >
                                  <Text className="text-xs font-semibold text-charcoal">Cancel</Text>
                                </Pressable>
                              </View>
                            </View>
                          ) : decliningRequestItemId === item.id ? (
                            <View className="mt-2 gap-2">
                              <TextInput
                                value={declineRequestNoteDraft}
                                onChangeText={setDeclineRequestNoteDraft}
                                placeholder="Optional note, e.g. lending it to a neighbor already"
                                placeholderTextColor="#3D3D3D80"
                                autoFocus
                                className="rounded-xl bg-sand px-3 py-2 text-sm text-charcoal"
                              />
                              <View className="flex-row justify-end gap-4">
                                <Pressable
                                  onPress={() => {
                                    setDecliningRequestItemId(null);
                                    setDeclineRequestNoteDraft('');
                                  }}
                                >
                                  <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => {
                                    declineRequest(item.id, declineRequestNoteDraft);
                                    setDecliningRequestItemId(null);
                                    setDeclineRequestNoteDraft('');
                                  }}
                                >
                                  <Text className="text-sm font-semibold text-terracotta">Decline</Text>
                                </Pressable>
                              </View>
                            </View>
                          ) : (
                            <View className="mt-2 flex-row gap-2">
                              <Pressable
                                onPress={() => {
                                  setApprovingItemId(item.id);
                                  setDueDays(5);
                                }}
                                className="rounded-full bg-terracotta px-4 py-1.5"
                              >
                                <Text className="text-xs font-semibold text-paper">Approve</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setDecliningRequestItemId(item.id);
                                  setDeclineRequestNoteDraft('');
                                }}
                                className="rounded-full bg-sand px-4 py-1.5"
                              >
                                <Text className="text-xs font-semibold text-charcoal">Decline</Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      ) : itemStatus === 'lent' && borrower ? (
                        editingDueDateItemId === item.id ? (
                          <View className="mt-3 gap-2 border-t border-charcoal/10 pt-3">
                            <Text className="text-xs text-charcoal/50">New due date, in days:</Text>
                            <View className="flex-row gap-2">
                              {[3, 5, 7, 14].map((d) => (
                                <Pressable
                                  key={d}
                                  onPress={() => setDueDays(d)}
                                  className={`rounded-full px-3 py-1.5 ${
                                    dueDays === d ? 'bg-terracotta' : 'bg-sand'
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-semibold ${
                                      dueDays === d ? 'text-paper' : 'text-charcoal'
                                    }`}
                                  >
                                    {d}
                                  </Text>
                                </Pressable>
                              ))}
                            </View>
                            <View className="flex-row justify-end gap-4">
                              <Pressable onPress={() => setEditingDueDateItemId(null)}>
                                <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  updateDueDate(item.id, dueDays);
                                  setEditingDueDateItemId(null);
                                }}
                              >
                                <Text className="text-sm font-semibold text-terracotta">Save</Text>
                              </Pressable>
                            </View>
                          </View>
                        ) : (
                          <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                            <Text className="flex-1 text-sm text-charcoal">
                              Lent to {borrower.name}
                              {dueLabel[item.id] ? ` · back by ${dueLabel[item.id]}` : ''}
                            </Text>
                            <Pressable
                              onPress={() => {
                                setEditingDueDateItemId(item.id);
                                setDueDays(5);
                              }}
                              className="h-8 w-8 items-center justify-center rounded-full"
                            >
                              <Ionicons name="pencil" size={14} className="text-charcoal/50" />
                            </Pressable>
                            <Pressable
                              onPress={() => markReturned(item.id)}
                              className="rounded-full bg-sage/20 px-4 py-1.5"
                            >
                              <Text className="text-xs font-semibold text-sage">Mark returned</Text>
                            </Pressable>
                          </View>
                        )
                      ) : (
                        <Text className="mt-3 border-t border-charcoal/10 pt-3 text-sm text-charcoal/50">
                          Available to lend
                        </Text>
                      )
                    ) : (
                      <Pressable
                        disabled={helperCount === 0}
                        onPress={() => setViewingHelpersId(item.id)}
                        className="mt-3 border-t border-charcoal/10 pt-3"
                      >
                        <Text className="text-sm text-charcoal/50">
                          {helperCount === 0
                            ? 'No offers yet'
                            : `${helperCount} neighbor${helperCount === 1 ? '' : 's'} offered to help`}
                        </Text>
                      </Pressable>
                    )}
                    {item.kind === 'have' && renderLendRating(item.id)}
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Neighborhood board
        </Text>

        <View className="gap-3">
          {boardItems.map((item) => {
            const owner = getUser(item.ownerId);
            if (!owner) return null;

            if (item.kind === 'have') {
              const itemStatus = status[item.id] ?? 'available';
              return (
                <View key={item.id} className="rounded-2xl bg-cream p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                      <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-charcoal">{item.title}</Text>
                      <Text className="text-xs text-charcoal/50">{owner.name}</Text>
                    </View>
                    <Pressable
                      onPress={() => setSharingId(item.id)}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons name="arrow-redo-outline" size={18} className="text-charcoal/40" />
                    </Pressable>
                    <Pressable
                      onPress={() => setViewingCommentsId(item.id)}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons name="chatbubble-outline" size={18} className="text-charcoal/40" />
                    </Pressable>
                    <Pressable
                      onPress={() => toggleSave(item.id)}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons
                        name={savedIds[item.id] ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        className={savedIds[item.id] ? 'text-gold' : 'text-charcoal/40'}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => setReportingId(item.id)}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons name="flag-outline" size={17} className="text-charcoal/40" />
                    </Pressable>
                    <Pressable
                      onPress={() => dismissLendItem(item.id)}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons name="close" size={18} className="text-charcoal/40" />
                    </Pressable>
                  </View>
                  <Text className="mt-2 text-sm leading-5 text-charcoal/80">{item.note}</Text>
                  {item.pickupLocation && (
                    <View className="mt-1.5 flex-row items-center gap-1">
                      <Ionicons name="location-outline" size={12} className="text-charcoal/40" />
                      <Text className="text-xs text-charcoal/50">{item.pickupLocation}</Text>
                    </View>
                  )}
                  {item.imageUris && item.imageUris.length > 0 && (
                    <PhotoCarousel
                      uris={item.imageUris}
                      onPhotoPress={(i) =>
                        setViewingPhotos({
                          uris: item.imageUris!,
                          index: i,
                          itemId: item.id,
                          isMine: false,
                        })
                      }
                    />
                  )}

                  <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                    {item.unavailableNote ? (
                      <>
                        <Text className="flex-1 text-sm text-charcoal/50">{item.unavailableNote}</Text>
                        <Pressable
                          onPress={() => toggleNotifyWhenAvailable(item.id)}
                          className={`rounded-full px-4 py-1.5 ${
                            notifyWhenAvailable[item.id] ? 'bg-sage/20' : 'bg-sand'
                          }`}
                        >
                          <Text
                            className={`text-xs font-semibold ${
                              notifyWhenAvailable[item.id] ? 'text-sage' : 'text-charcoal'
                            }`}
                          >
                            {notifyWhenAvailable[item.id] ? "We'll notify you ✓" : 'Notify me'}
                          </Text>
                        </Pressable>
                      </>
                    ) : itemStatus === 'lent' ? (
                      <>
                        <View className="flex-1">
                          <Text className="text-sm text-sage">
                            On loan to you
                            {dueLabel[item.id] ? ` · back by ${dueLabel[item.id]}` : ''}
                          </Text>
                          {requestNotes[item.id] && (
                            <Text className="mt-0.5 text-xs text-charcoal/50">
                              {requestNotes[item.id]}
                            </Text>
                          )}
                        </View>
                        <Pressable
                          onPress={() => markReturned(item.id)}
                          className="rounded-full bg-sage/20 px-4 py-1.5"
                        >
                          <Text className="text-xs font-semibold text-sage">Mark returned</Text>
                        </Pressable>
                      </>
                    ) : itemStatus === 'requested' ? (
                      <>
                        <View className="flex-1">
                          <Text className="text-sm text-gold">Request sent</Text>
                          {requestNotes[item.id] && (
                            <Text className="mt-0.5 text-xs text-charcoal/50">
                              {requestNotes[item.id]}
                            </Text>
                          )}
                        </View>
                        <Pressable
                          onPress={() => cancelRequest(item.id)}
                          className="rounded-full bg-sand px-4 py-1.5"
                        >
                          <Text className="text-xs font-semibold text-charcoal">Cancel</Text>
                        </Pressable>
                      </>
                    ) : requestingBorrowId === item.id ? (
                      <View className="flex-1 gap-2">
                        <TextInput
                          value={borrowRequestNote}
                          onChangeText={setBorrowRequestNote}
                          placeholder="Optional note, e.g. need it back by Friday"
                          placeholderTextColor="#3D3D3D80"
                          className="rounded-xl bg-sand px-3 py-2 text-sm text-charcoal"
                        />
                        <View className="flex-row justify-end gap-4">
                          <Pressable
                            onPress={() => {
                              setRequestingBorrowId(null);
                              setBorrowRequestNote('');
                            }}
                          >
                            <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              requestToBorrow(item.id, borrowRequestNote);
                              setRequestingBorrowId(null);
                              setBorrowRequestNote('');
                            }}
                          >
                            <Text className="text-sm font-semibold text-terracotta">Send</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <>
                        <Text className="flex-1 text-sm text-charcoal/50">Available</Text>
                        <Pressable
                          onPress={() => {
                            setRequestingBorrowId(item.id);
                            setBorrowRequestNote('');
                          }}
                          className="rounded-full bg-ink px-4 py-1.5"
                        >
                          <Text className="text-xs font-semibold text-paper">Request to borrow</Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                  {renderLendRating(item.id)}
                </View>
              );
            }

            const offered = myOffers[item.id] ?? false;
            const helperCount = getEffectiveHelperCount(item.id, offered);
            return (
              <View key={item.id} className="rounded-2xl bg-cream p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-charcoal">{item.title}</Text>
                    <Text className="text-xs text-charcoal/50">{owner.name} is looking</Text>
                  </View>
                  <Pressable
                    onPress={() => setSharingId(item.id)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons name="arrow-redo-outline" size={18} className="text-charcoal/40" />
                  </Pressable>
                  <Pressable
                    onPress={() => setViewingCommentsId(item.id)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons name="chatbubble-outline" size={18} className="text-charcoal/40" />
                  </Pressable>
                  <Pressable
                    onPress={() => toggleSave(item.id)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons
                      name={savedIds[item.id] ? 'bookmark' : 'bookmark-outline'}
                      size={18}
                      className={savedIds[item.id] ? 'text-gold' : 'text-charcoal/40'}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => setReportingId(item.id)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons name="flag-outline" size={17} className="text-charcoal/40" />
                  </Pressable>
                  <Pressable
                    onPress={() => dismissLendItem(item.id)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons name="close" size={18} className="text-charcoal/40" />
                  </Pressable>
                </View>
                <Text className="mt-2 text-sm leading-5 text-charcoal/80">{item.note}</Text>
                {item.imageUris && item.imageUris.length > 0 && (
                  <PhotoCarousel
                    uris={item.imageUris}
                    onPhotoPress={(i) =>
                      setViewingPhotos({
                        uris: item.imageUris!,
                        index: i,
                        itemId: item.id,
                        isMine: false,
                      })
                    }
                  />
                )}

                <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <Pressable
                    disabled={helperCount === 0}
                    onPress={() => setViewingHelpersId(item.id)}
                    className="flex-1"
                  >
                    <Text className="text-sm text-charcoal/50">
                      {helperCount === 0
                        ? 'No neighbors yet'
                        : `${helperCount} neighbor${helperCount === 1 ? '' : 's'} can help`}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      if (offered) {
                        offerToHelp(item.id);
                      } else {
                        setOfferingHelpItemId(item.id);
                        setHelpNoteDraft('');
                      }
                    }}
                    className={`rounded-full px-4 py-1.5 ${offered ? 'bg-sage/20' : 'bg-ink'}`}
                  >
                    <Text className={`text-xs font-semibold ${offered ? 'text-sage' : 'text-paper'}`}>
                      {offered ? 'You offered ✓' : 'I have one'}
                    </Text>
                  </Pressable>
                </View>
                {offeringHelpItemId === item.id && (
                  <View className="mt-2 flex-row items-center gap-2">
                    <TextInput
                      value={helpNoteDraft}
                      onChangeText={setHelpNoteDraft}
                      placeholder="Optional note, e.g. I have a ladder up to 20ft"
                      placeholderTextColor="#3D3D3D80"
                      autoFocus
                      className="flex-1 rounded-full bg-sand px-4 py-2 text-sm text-charcoal"
                    />
                    <Pressable
                      onPress={() => {
                        setOfferingHelpItemId(null);
                        setHelpNoteDraft('');
                      }}
                      className="px-2 py-2"
                    >
                      <Text className="text-xs font-semibold text-charcoal/50">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        offerToHelp(item.id, helpNoteDraft);
                        setOfferingHelpItemId(null);
                        setHelpNoteDraft('');
                      }}
                      className="rounded-full bg-ink px-4 py-2"
                    >
                      <Text className="text-xs font-semibold text-paper">Offer</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}

          {boardItems.length === 0 && (
            <EmptyState
              icon="basket-outline"
              iconColorClassName="text-charcoal/50"
              title={
                q.length > 0
                  ? `No results for "${query.trim()}"`
                  : hideUnavailable
                    ? 'No available items'
                    : kindFilter === 'All'
                      ? 'Nothing on the board yet'
                      : `No ${kindFilter.toLowerCase()} items`
              }
              subtitle={
                q.length > 0
                  ? 'Try a different search term.'
                  : hideUnavailable
                    ? 'Turn off "Hide unavailable items" to see everything.'
                    : kindFilter === 'All'
                      ? 'Be the first to post something you can lend, or something you need.'
                      : 'Try a different filter, or clear it.'
              }
            />
          )}
        </View>
      </ScrollView>

      {sharingItem && (
        <ShareSheet
          title={sharingItem.kind === 'have' ? 'Share item' : 'Share request'}
          link={`https://neighbor.app/lend/${sharingItem.id}`}
          previewText={`${sharingItem.title} — ${sharingItem.note}`}
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

      {reportingCommentId && (
        <ReportPostSheet
          onClose={() => setReportingCommentId(null)}
          title="Comment options"
          actionLabel="Report this comment"
        />
      )}

      {forwardingComment && (
        <ForwardSheet
          preview={forwardingComment.text}
          onForward={forwardComment}
          onClose={() => setForwardingCommentId(null)}
        />
      )}

      {viewingHelpersItem && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={() => setViewingHelpersId(null)} />
          <View className="max-h-[70%] w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">Can help</Text>
              <Pressable
                onPress={() => setViewingHelpersId(null)}
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-1">
                {viewingHelpersIds.map((userId) => {
                  const isMe = userId === ME.id;
                  const person = isMe ? profile : getUser(userId);
                  if (!person) return null;
                  return (
                    <Pressable
                      key={userId}
                      onPress={() => {
                        if (isMe) return;
                        setViewingHelpersId(null);
                        router.push(`/profile/${userId}`);
                      }}
                      className="flex-row items-center gap-3 rounded-2xl p-2 active:opacity-70"
                    >
                      <Image source={{ uri: person.avatar }} className="h-9 w-9 rounded-full" />
                      <View className="flex-1">
                        <Text className="font-medium text-charcoal">{isMe ? 'You' : person.name}</Text>
                        {isMe && helpNotes[viewingHelpersItem.id] && (
                          <Text className="text-xs italic text-charcoal/50">
                            {helpNotes[viewingHelpersItem.id]}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {viewingPhotos && (
        <PhotoViewer
          uris={viewingPhotos.uris}
          initialIndex={viewingPhotos.index}
          onClose={() => setViewingPhotos(null)}
          captions={viewingPhotos.uris.map(
            (_, i) => photoCaptions[photoCaptionKey(viewingPhotos.itemId, i)] ?? ''
          )}
          editableIndices={viewingPhotos.uris.map(() => viewingPhotos.isMine)}
          onCaptionChange={(i, text) =>
            setPhotoCaption(photoCaptionKey(viewingPhotos.itemId, i), text)
          }
        />
      )}

      {viewingCommentsItem && viewingCommentsKey && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable
            className="absolute inset-0"
            onPress={() => {
              setViewingCommentsId(null);
              setConfirmingDeleteCommentId(null);
              setCommentDraft('');
              setReplyingToComment(null);
            }}
          />
          <View className="max-h-[75%] w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">Comments</Text>
              <Pressable
                onPress={() => {
                  setViewingCommentsId(null);
                  setConfirmingDeleteCommentId(null);
                  setCommentDraft('');
                  setReplyingToComment(null);
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
                    No comments yet — ask a question or leave a note.
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
                              deleteItemComment(viewingCommentsKey, c.id);
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
                              updateItemComment(viewingCommentsKey, c.id, editCommentDraft);
                              setEditingCommentId(null);
                            }}
                          >
                            <Text className="text-sm font-semibold text-terracotta">Save</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  }

                  const isPinned = c.id === viewingPinnedCommentId;
                  return (
                    <View key={c.id} className="flex-row items-start gap-2.5 rounded-2xl bg-sand p-3">
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
                        <View className="flex-row items-center gap-1.5">
                          <Text className="text-sm font-semibold text-charcoal">
                            {isMine ? 'You' : author.name}
                          </Text>
                          <Text className="text-xs text-charcoal/40">
                            {c.time}
                            {c.edited && ' · edited'}
                          </Text>
                        </View>
                        {c.replyToId &&
                          (() => {
                            const replied = viewingComments.find((rc) => rc.id === c.replyToId);
                            if (!replied) return null;
                            const repliedAuthor =
                              replied.authorId === ME.id ? profile : getUser(replied.authorId);
                            return (
                              <View className="mb-1 mt-0.5 max-w-[240px] rounded-lg border-l-2 border-charcoal/25 bg-charcoal/5 px-2 py-1.5">
                                <Text className="text-[11px] font-semibold text-charcoal/60">
                                  {replied.authorId === ME.id ? 'You' : (repliedAuthor?.name ?? 'Someone')}
                                </Text>
                                <Text className="text-[11px] text-charcoal/50" numberOfLines={1}>
                                  {replied.text}
                                </Text>
                              </View>
                            );
                          })()}
                        <MentionText text={c.text} className="mt-0.5 text-sm leading-5 text-charcoal" />
                        <ReactionButton
                          compact
                          reactions={c.reactions}
                          myReaction={
                            myItemCommentReactions[itemCommentReactionKey(viewingCommentsKey, c.id)]
                          }
                          onTap={() => tapItemCommentReaction(viewingCommentsKey, c.id)}
                          onSelect={(type) => setItemCommentReaction(viewingCommentsKey, c.id, type)}
                        />
                      </View>
                      <Pressable
                        onPress={() =>
                          setReplyingToComment({
                            id: c.id,
                            senderName: isMine ? 'You' : author.name,
                            preview: c.text,
                          })
                        }
                        className="h-7 w-7 items-center justify-center"
                      >
                        <Ionicons name="arrow-undo-outline" size={14} className="text-charcoal/30" />
                      </Pressable>
                      <Pressable
                        onPress={() => setForwardingCommentId(c.id)}
                        className="h-7 w-7 items-center justify-center"
                      >
                        <Ionicons name="arrow-redo-outline" size={14} className="text-charcoal/30" />
                      </Pressable>
                      {canPinComments && (
                        <Pressable
                          onPress={() => togglePinComment(viewingCommentsKey!, c.id)}
                          className="h-7 w-7 items-center justify-center"
                        >
                          <Ionicons
                            name={isPinned ? 'pin' : 'pin-outline'}
                            size={14}
                            className={isPinned ? 'text-gold' : 'text-charcoal/30'}
                          />
                        </Pressable>
                      )}
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
            {replyingToComment && (
              <View className="flex-row items-center justify-between gap-2 border-t border-charcoal/10 pt-2">
                <View className="flex-1">
                  <Text className="text-xs text-charcoal/50">
                    Replying to{' '}
                    <Text className="font-semibold text-charcoal/70">
                      {replyingToComment.senderName}
                    </Text>
                  </Text>
                  <Text className="text-xs text-charcoal/50" numberOfLines={1}>
                    {replyingToComment.preview}
                  </Text>
                </View>
                <Pressable onPress={() => setReplyingToComment(null)} className="p-1">
                  <Ionicons name="close" size={14} className="text-charcoal/50" />
                </Pressable>
              </View>
            )}
            <View
              className={`flex-row items-center gap-2 pt-3 ${
                replyingToComment ? '' : 'border-t border-charcoal/10'
              }`}
            >
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
                  addItemComment(viewingCommentsKey, commentDraft, replyingToComment?.id);
                  setCommentDraft('');
                  setReplyingToComment(null);
                }}
                className="h-9 w-9 items-center justify-center rounded-full bg-terracotta"
                style={{ opacity: commentDraft.trim() ? 1 : 0.4 }}
              >
                <Ionicons name="arrow-up" size={18} className="text-paper" />
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
