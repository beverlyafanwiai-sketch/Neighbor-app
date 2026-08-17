import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import PhotoCarousel from '../components/PhotoCarousel';
import PhotoViewer from '../components/PhotoViewer';
import ReportPostSheet from '../components/ReportPostSheet';
import ShareSheet from '../components/ShareSheet';
import { getUser, ME } from '../data/mock';
import { getEffectiveHelperCount, getEffectiveHelperIds, useLendStore } from '../store/useLendStore';
import { itemCommentKey, useItemCommentsStore } from '../store/useItemCommentsStore';
import { photoCaptionKey, usePhotoCaptionsStore } from '../store/usePhotoCaptionsStore';
import { useProfileStore } from '../store/useProfileStore';
import { useSavedLendStore } from '../store/useSavedLendStore';

const LEND_SORTS = ['Newest', 'A-Z', 'Most helpers'] as const;
type LendSort = (typeof LEND_SORTS)[number];

const KIND_FILTERS = ['All', 'Have', 'Want'] as const;
type KindFilter = (typeof KIND_FILTERS)[number];

export default function LendBoard() {
  const items = useLendStore((s) => s.items);
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
  const deleteItemComment = useItemCommentsStore((s) => s.deleteComment);

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [viewingHelpersId, setViewingHelpersId] = useState<string | null>(null);
  const [viewingCommentsId, setViewingCommentsId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [confirmingDeleteCommentId, setConfirmingDeleteCommentId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<LendSort>('Newest');
  const [kindFilter, setKindFilter] = useState<KindFilter>('All');
  const [query, setQuery] = useState('');
  const [viewingPhotos, setViewingPhotos] = useState<{
    uris: string[];
    index: number;
    itemId: string;
    isMine: boolean;
  } | null>(null);
  const [approvingItemId, setApprovingItemId] = useState<string | null>(null);
  const [editingDueDateItemId, setEditingDueDateItemId] = useState<string | null>(null);
  const [requestingBorrowId, setRequestingBorrowId] = useState<string | null>(null);
  const [borrowRequestNote, setBorrowRequestNote] = useState('');
  const [dueDays, setDueDays] = useState(5);

  const matchesKind = (i: (typeof items)[number]) =>
    kindFilter === 'All' || (kindFilter === 'Have' ? i.kind === 'have' : i.kind === 'want');
  const q = query.trim().toLowerCase();
  const matchesQuery = (i: (typeof items)[number]) =>
    q.length === 0 || i.title.toLowerCase().includes(q) || i.note.toLowerCase().includes(q);

  const myItems = items.filter((i) => i.ownerId === ME.id && matchesKind(i) && matchesQuery(i));
  const unsortedBoardItems = items.filter(
    (i) => i.ownerId !== ME.id && matchesKind(i) && matchesQuery(i)
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          Lend a hand, borrow a tool. No need to own everything when your neighbors already do.
        </Text>

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
                                onPress={() => declineRequest(item.id)}
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
                    onPress={() => offerToHelp(item.id)}
                    className={`rounded-full px-4 py-1.5 ${offered ? 'bg-sage/20' : 'bg-ink'}`}
                  >
                    <Text className={`text-xs font-semibold ${offered ? 'text-sage' : 'text-paper'}`}>
                      {offered ? 'You offered ✓' : 'I have one'}
                    </Text>
                  </Pressable>
                </View>
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
                  : kindFilter === 'All'
                    ? 'Nothing on the board yet'
                    : `No ${kindFilter.toLowerCase()} items`
              }
              subtitle={
                q.length > 0
                  ? 'Try a different search term.'
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
                      <Text className="font-medium text-charcoal">{isMe ? 'You' : person.name}</Text>
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

                  return (
                    <View key={c.id} className="flex-row items-start gap-2.5 rounded-2xl bg-sand p-3">
                      <Image source={{ uri: author.avatar }} className="h-8 w-8 rounded-full" />
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5">
                          <Text className="text-sm font-semibold text-charcoal">
                            {isMine ? 'You' : author.name}
                          </Text>
                          <Text className="text-xs text-charcoal/40">{c.time}</Text>
                        </View>
                        <Text className="mt-0.5 text-sm leading-5 text-charcoal">{c.text}</Text>
                      </View>
                      {isMine && (
                        <Pressable
                          onPress={() => setConfirmingDeleteCommentId(c.id)}
                          className="h-7 w-7 items-center justify-center"
                        >
                          <Ionicons name="trash-outline" size={14} className="text-charcoal/40" />
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
            <View className="flex-row items-center gap-2 border-t border-charcoal/10 pt-3">
              <TextInput
                value={commentDraft}
                onChangeText={setCommentDraft}
                placeholder="Add a comment..."
                placeholderTextColor="#3D3D3D80"
                multiline
                className="max-h-24 flex-1 rounded-2xl bg-sand px-3 py-2.5 text-sm text-charcoal"
              />
              <Pressable
                disabled={!commentDraft.trim()}
                onPress={() => {
                  addItemComment(viewingCommentsKey, commentDraft);
                  setCommentDraft('');
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
