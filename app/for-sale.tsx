import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
import { useDismissedListingsStore } from '../store/useDismissedListingsStore';
import {
  getEffectiveInterestCount,
  getEffectiveInterestedIds,
  getOfferFor,
  isFreeItem,
  useSaleStore,
} from '../store/useSaleStore';
import {
  itemCommentKey,
  itemCommentReactionKey,
  useItemCommentsStore,
} from '../store/useItemCommentsStore';
import { photoCaptionKey, usePhotoCaptionsStore } from '../store/usePhotoCaptionsStore';
import { useProfileStore } from '../store/useProfileStore';
import {
  getEffectiveSaleRatingSummary,
  useSaleRatingsStore,
} from '../store/useSaleRatingsStore';
import { useSavedSaleStore } from '../store/useSavedSaleStore';

const SALE_SORTS = ['Newest', 'Most interest', 'Price: low to high'] as const;
type SaleSort = (typeof SALE_SORTS)[number];

function parsePrice(price: string) {
  const n = parseFloat(price.replace(/[^0-9.]/g, ''));
  return Number.isNaN(n) ? Infinity : n;
}

export default function ForSaleBoard() {
  const items = useSaleStore((s) => s.items);
  const sold = useSaleStore((s) => s.sold);
  const myInterest = useSaleStore((s) => s.myInterest);
  const toggleInterest = useSaleStore((s) => s.toggleInterest);
  const myOffers = useSaleStore((s) => s.myOffers);
  const makeOffer = useSaleStore((s) => s.makeOffer);
  const withdrawOffer = useSaleStore((s) => s.withdrawOffer);
  const acceptedOffers = useSaleStore((s) => s.acceptedOffers);
  const acceptOffer = useSaleStore((s) => s.acceptOffer);
  const declinedOffers = useSaleStore((s) => s.declinedOffers);
  const declineOffer = useSaleStore((s) => s.declineOffer);
  const counterOffers = useSaleStore((s) => s.counterOffers);
  const counterOffer = useSaleStore((s) => s.counterOffer);
  const dropPrice = useSaleStore((s) => s.dropPrice);
  const markFree = useSaleStore((s) => s.markFree);
  const photoCaptions = usePhotoCaptionsStore((s) => s.captions);
  const setPhotoCaption = usePhotoCaptionsStore((s) => s.setCaption);
  const markSold = useSaleStore((s) => s.markSold);
  const relistItem = useSaleStore((s) => s.relistItem);
  const reservedForId = useSaleStore((s) => s.reservedForId);
  const reserveFor = useSaleStore((s) => s.reserveFor);
  const unreserve = useSaleStore((s) => s.unreserve);
  const deleteItem = useSaleStore((s) => s.deleteItem);
  const profile = useProfileStore((s) => s.profile);
  const savedIds = useSavedSaleStore((s) => s.savedIds);
  const toggleSave = useSavedSaleStore((s) => s.toggleSave);
  const itemComments = useItemCommentsStore((s) => s.comments);
  const addItemComment = useItemCommentsStore((s) => s.addComment);
  const updateItemComment = useItemCommentsStore((s) => s.updateComment);
  const deleteItemComment = useItemCommentsStore((s) => s.deleteComment);
  const myItemCommentReactions = useItemCommentsStore((s) => s.myReactions);
  const tapItemCommentReaction = useItemCommentsStore((s) => s.tapReaction);
  const setItemCommentReaction = useItemCommentsStore((s) => s.setReaction);
  const pinnedCommentIds = useItemCommentsStore((s) => s.pinnedCommentId);
  const togglePinComment = useItemCommentsStore((s) => s.togglePinComment);
  const dismissedSaleIds = useDismissedListingsStore((s) => s.dismissedSaleIds);
  const dismissSaleItem = useDismissedListingsStore((s) => s.dismissSaleItem);
  const mySaleRatings = useSaleRatingsStore((s) => s.myRatings);
  const rateSaleItem = useSaleRatingsStore((s) => s.rateItem);

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [viewingInterestedId, setViewingInterestedId] = useState<string | null>(null);
  const [viewingCommentsId, setViewingCommentsId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [confirmingDeleteCommentId, setConfirmingDeleteCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentDraft, setEditCommentDraft] = useState('');
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SaleSort>('Newest');
  const [query, setQuery] = useState('');
  const [hideSold, setHideSold] = useState(false);
  const [viewingPhotos, setViewingPhotos] = useState<{
    uris: string[];
    index: number;
    itemId: string;
    isMine: boolean;
  } | null>(null);
  const [offeringId, setOfferingId] = useState<string | null>(null);
  const [offerDraft, setOfferDraft] = useState('');
  const [droppingPriceId, setDroppingPriceId] = useState<string | null>(null);
  const [priceDropDraft, setPriceDropDraft] = useState('');
  const [confirmingFreeId, setConfirmingFreeId] = useState<string | null>(null);
  const [counteringUserId, setCounteringUserId] = useState<string | null>(null);
  const [counterDraft, setCounterDraft] = useState('');
  const [ratingItemId, setRatingItemId] = useState<string | null>(null);
  const [ratingDraftStars, setRatingDraftStars] = useState(0);
  const [ratingDraftComment, setRatingDraftComment] = useState('');

  const q = query.trim().toLowerCase();
  const matchesQuery = (i: (typeof items)[number]) =>
    q.length === 0 || i.title.toLowerCase().includes(q) || i.note.toLowerCase().includes(q);

  const myItems = items.filter((i) => i.ownerId === ME.id && matchesQuery(i));
  const unsortedBoardItems = items.filter(
    (i) =>
      i.ownerId !== ME.id &&
      matchesQuery(i) &&
      (!hideSold || !(sold[i.id] ?? false)) &&
      !(dismissedSaleIds[i.id] ?? false)
  );
  const boardItems =
    sortBy === 'Most interest'
      ? [...unsortedBoardItems].sort(
          (a, b) =>
            getEffectiveInterestCount(b.id, myInterest[b.id] ?? false) -
            getEffectiveInterestCount(a.id, myInterest[a.id] ?? false)
        )
      : sortBy === 'Price: low to high'
        ? [...unsortedBoardItems].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
        : unsortedBoardItems;
  const sharingItem = items.find((i) => i.id === sharingId);
  const viewingInterestedItem = items.find((i) => i.id === viewingInterestedId);
  const viewingInterestedIds = viewingInterestedItem
    ? getEffectiveInterestedIds(
        viewingInterestedItem.id,
        viewingInterestedItem.ownerId === ME.id ? false : myInterest[viewingInterestedItem.id] ?? false
      )
    : [];
  const viewingCommentsItem = items.find((i) => i.id === viewingCommentsId);
  const viewingCommentsKey = viewingCommentsItem ? itemCommentKey('sale', viewingCommentsItem.id) : null;
  const viewingComments = viewingCommentsKey ? (itemComments[viewingCommentsKey] ?? []) : [];
  const viewingPinnedCommentId = viewingCommentsKey ? pinnedCommentIds[viewingCommentsKey] : undefined;
  const canPinComments = viewingCommentsItem?.ownerId === ME.id;
  const sortedViewingComments = viewingPinnedCommentId
    ? [...viewingComments].sort((a, b) =>
        a.id === viewingPinnedCommentId ? -1 : b.id === viewingPinnedCommentId ? 1 : 0
      )
    : viewingComments;

  const renderSaleRating = (itemId: string) => {
    if (!(sold[itemId] ?? false)) return null;
    const myRating = mySaleRatings[itemId];
    const summary = getEffectiveSaleRatingSummary(itemId, myRating);

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
                rateSaleItem(itemId, ratingDraftStars, ratingDraftComment.trim());
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
                : 'Rate this sale'}
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
        <Text className="text-base font-bold text-charcoal">For Sale</Text>
        <Pressable
          onPress={() => router.push('/create-sale-item')}
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
            placeholder="Search listings..."
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          Selling something you don't need? Post it here for neighbors to grab.
        </Text>

        <Pressable
          onPress={() => setHideSold((h) => !h)}
          className="mt-3 flex-row items-center gap-2"
        >
          <Ionicons
            name={hideSold ? 'checkbox' : 'square-outline'}
            size={16}
            className={hideSold ? 'text-terracotta' : 'text-charcoal/40'}
          />
          <Text className="text-xs font-medium text-charcoal/60">Hide sold items</Text>
        </Pressable>

        {unsortedBoardItems.length > 1 && (
          <View className="mt-4 flex-row items-center gap-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
              Sort
            </Text>
            {SALE_SORTS.map((s) => (
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
              My listings
            </Text>
            <View className="gap-3">
              {myItems.map((item) => {
                const isSold = sold[item.id] ?? false;
                const interestCount = getEffectiveInterestCount(item.id, false);
                const accepted = acceptedOffers[item.id];
                const acceptedBuyer = accepted ? getUser(accepted.userId) : undefined;
                const reservedFor = !isSold ? reservedForId[item.id] : undefined;
                const reservedBuyer = reservedFor ? getUser(reservedFor) : undefined;

                if (deletingItemId === item.id) {
                  return (
                    <View key={item.id} className="gap-2 rounded-2xl bg-terracotta/10 p-4">
                      <Text className="text-sm text-charcoal">
                        Delete this listing? This can't be undone.
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
                        <View className="flex-row items-center gap-1.5">
                          {item.originalPrice && (
                            <Text className="text-xs text-charcoal/40 line-through">
                              {item.originalPrice}
                            </Text>
                          )}
                          <Text className="text-xs text-charcoal/50">{item.price}</Text>
                          {isFreeItem(item.price) ? (
                            <View className="rounded-full bg-gold/20 px-2 py-0.5">
                              <Text className="text-[10px] font-semibold text-gold">🎁 Free</Text>
                            </View>
                          ) : (
                            item.originalPrice && (
                              <View className="rounded-full bg-terracotta/10 px-2 py-0.5">
                                <Text className="text-[10px] font-semibold text-terracotta">
                                  Price drop
                                </Text>
                              </View>
                            )
                          )}
                          {item.condition && (
                            <Text className="text-xs text-charcoal/40">· {item.condition}</Text>
                          )}
                          {item.priceFlexibility && (
                            <View
                              className={`rounded-full px-2 py-0.5 ${
                                item.priceFlexibility === 'Firm' ? 'bg-charcoal/10' : 'bg-sage/15'
                              }`}
                            >
                              <Text
                                className={`text-[10px] font-semibold ${
                                  item.priceFlexibility === 'Firm' ? 'text-charcoal/60' : 'text-sage'
                                }`}
                              >
                                {item.priceFlexibility}
                              </Text>
                            </View>
                          )}
                        </View>
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
                        onPress={() => router.push(`/create-sale-item?id=${item.id}`)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="pencil" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => router.push(`/create-sale-item?duplicateId=${item.id}`)}
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

                    <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                      <Pressable
                        disabled={isSold || interestCount === 0}
                        onPress={() => setViewingInterestedId(item.id)}
                        className="flex-1"
                      >
                        <Text
                          className={`text-sm ${
                            isSold ? 'text-sage' : reservedBuyer ? 'text-gold' : 'text-charcoal/50'
                          }`}
                        >
                          {isSold
                            ? acceptedBuyer
                              ? `Sold to ${acceptedBuyer.name} for ${accepted!.price}`
                              : 'Marked as sold'
                            : reservedBuyer
                              ? `Reserved for ${reservedBuyer.name}`
                              : interestCount === 0
                                ? 'No interest yet'
                                : `${interestCount} neighbor${interestCount === 1 ? '' : 's'} interested`}
                        </Text>
                      </Pressable>
                      {isSold ? (
                        <Pressable
                          onPress={() => relistItem(item.id)}
                          className="rounded-full bg-sand px-4 py-1.5"
                        >
                          <Text className="text-xs font-semibold text-charcoal">Relist</Text>
                        </Pressable>
                      ) : reservedBuyer ? (
                        <Pressable
                          onPress={() => unreserve(item.id)}
                          className="rounded-full bg-sand px-4 py-1.5"
                        >
                          <Text className="text-xs font-semibold text-charcoal">Unreserve</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => markSold(item.id)}
                          className="rounded-full bg-sage/20 px-4 py-1.5"
                        >
                          <Text className="text-xs font-semibold text-sage">Mark as sold</Text>
                        </Pressable>
                      )}
                    </View>

                    {!isSold && confirmingFreeId === item.id && (
                      <View className="mt-3 gap-2 rounded-xl bg-gold/10 p-3">
                        <Text className="text-sm text-charcoal">
                          Mark this as free to give away? This replaces the price.
                        </Text>
                        <View className="flex-row justify-end gap-4">
                          <Pressable onPress={() => setConfirmingFreeId(null)}>
                            <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              markFree(item.id);
                              setConfirmingFreeId(null);
                            }}
                          >
                            <Text className="text-sm font-semibold text-gold">Mark as free</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}

                    {!isSold && !isFreeItem(item.price) && confirmingFreeId !== item.id && (
                      <>
                        {droppingPriceId === item.id ? (
                          <View className="mt-3 flex-row items-center gap-2 border-t border-charcoal/10 pt-3">
                            <TextInput
                              value={priceDropDraft}
                              onChangeText={setPriceDropDraft}
                              placeholder={`Lower than ${item.price}`}
                              placeholderTextColor="#8A8378"
                              autoFocus
                              className="flex-1 rounded-full bg-sand px-4 py-2 text-sm text-charcoal"
                            />
                            <Pressable
                              onPress={() => {
                                setDroppingPriceId(null);
                                setPriceDropDraft('');
                              }}
                              className="px-2 py-2"
                            >
                              <Text className="text-xs font-semibold text-charcoal/50">Cancel</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                if (!priceDropDraft.trim()) return;
                                dropPrice(item.id, priceDropDraft);
                                setDroppingPriceId(null);
                                setPriceDropDraft('');
                              }}
                              className="rounded-full bg-ink px-4 py-2"
                            >
                              <Text className="text-xs font-semibold text-paper">Save</Text>
                            </Pressable>
                          </View>
                        ) : (
                          <View className="mt-2 flex-row gap-4">
                            <Pressable
                              onPress={() => {
                                setDroppingPriceId(item.id);
                                setPriceDropDraft('');
                              }}
                            >
                              <Text className="text-xs font-semibold text-terracotta">
                                Drop price
                              </Text>
                            </Pressable>
                            <Pressable onPress={() => setConfirmingFreeId(item.id)}>
                              <Text className="text-xs font-semibold text-gold">Mark as free</Text>
                            </Pressable>
                          </View>
                        )}
                      </>
                    )}
                    {renderSaleRating(item.id)}
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
            const isSold = sold[item.id] ?? false;
            const interested = myInterest[item.id] ?? false;
            const interestCount = getEffectiveInterestCount(item.id, interested);

            return (
              <View key={item.id} className="rounded-2xl bg-cream p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-charcoal">{item.title}</Text>
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-xs text-charcoal/50">
                        {owner.name} · {item.price}
                      </Text>
                      {item.originalPrice && (
                        <Text className="text-xs text-charcoal/40 line-through">
                          {item.originalPrice}
                        </Text>
                      )}
                      {isFreeItem(item.price) ? (
                        <View className="rounded-full bg-gold/20 px-2 py-0.5">
                          <Text className="text-[10px] font-semibold text-gold">🎁 Free</Text>
                        </View>
                      ) : (
                        item.originalPrice && (
                          <View className="rounded-full bg-terracotta/10 px-2 py-0.5">
                            <Text className="text-[10px] font-semibold text-terracotta">
                              Price drop
                            </Text>
                          </View>
                        )
                      )}
                      {item.condition && (
                        <Text className="text-xs text-charcoal/40">· {item.condition}</Text>
                      )}
                      {item.priceFlexibility && (
                        <View
                          className={`rounded-full px-2 py-0.5 ${
                            item.priceFlexibility === 'Firm' ? 'bg-charcoal/10' : 'bg-sage/15'
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-semibold ${
                              item.priceFlexibility === 'Firm' ? 'text-charcoal/60' : 'text-sage'
                            }`}
                          >
                            {item.priceFlexibility}
                          </Text>
                        </View>
                      )}
                      {!isSold && reservedForId[item.id] && (
                        <View className="rounded-full bg-gold/20 px-2 py-0.5">
                          <Text className="text-[10px] font-semibold text-gold">Reserved</Text>
                        </View>
                      )}
                    </View>
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
                    onPress={() => dismissSaleItem(item.id)}
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
                  {isSold ? (
                    <Text className="flex-1 text-sm text-charcoal/50">Sold</Text>
                  ) : (
                    <>
                      <Pressable
                        disabled={interestCount === 0}
                        onPress={() => setViewingInterestedId(item.id)}
                        className="flex-1"
                      >
                        <Text className="text-sm text-charcoal/50">
                          {interestCount === 0
                            ? 'No interest yet'
                            : `${interestCount} neighbor${interestCount === 1 ? '' : 's'} interested`}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => toggleInterest(item.id)}
                        className={`rounded-full px-4 py-1.5 ${interested ? 'bg-sage/20' : 'bg-ink'}`}
                      >
                        <Text
                          className={`text-xs font-semibold ${interested ? 'text-sage' : 'text-paper'}`}
                        >
                          {myOffers[item.id]
                            ? `Offered ${myOffers[item.id]}`
                            : interested
                              ? "You're interested ✓"
                              : "I'm interested"}
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>

                {!isSold && offeringId === item.id ? (
                  <View className="mt-3 flex-row items-center gap-2 border-t border-charcoal/10 pt-3">
                    <TextInput
                      value={offerDraft}
                      onChangeText={setOfferDraft}
                      placeholder="e.g. $30"
                      placeholderTextColor="#8A8378"
                      autoFocus
                      className="flex-1 rounded-full bg-sand px-4 py-2 text-sm text-charcoal"
                    />
                    <Pressable
                      onPress={() => {
                        setOfferingId(null);
                        setOfferDraft('');
                      }}
                      className="px-2 py-2"
                    >
                      <Text className="text-xs font-semibold text-charcoal/50">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        if (!offerDraft.trim()) return;
                        makeOffer(item.id, offerDraft);
                        setOfferingId(null);
                        setOfferDraft('');
                      }}
                      className="rounded-full bg-ink px-4 py-2"
                    >
                      <Text className="text-xs font-semibold text-paper">Send</Text>
                    </Pressable>
                  </View>
                ) : (
                  !isSold && (
                    <View className="mt-2 flex-row gap-4">
                      <Pressable
                        onPress={() => {
                          setOfferingId(item.id);
                          setOfferDraft(myOffers[item.id] ?? '');
                        }}
                      >
                        <Text className="text-xs font-semibold text-terracotta">
                          {myOffers[item.id] ? 'Change your offer' : 'Make an offer'}
                        </Text>
                      </Pressable>
                      {myOffers[item.id] && (
                        <Pressable onPress={() => withdrawOffer(item.id)}>
                          <Text className="text-xs font-semibold text-charcoal/50">
                            Withdraw offer
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )
                )}
                {renderSaleRating(item.id)}
              </View>
            );
          })}

          {boardItems.length === 0 && (
            <EmptyState
              icon="pricetags-outline"
              iconColorClassName="text-charcoal/50"
              title={
                q.length > 0
                  ? `No results for "${query.trim()}"`
                  : hideSold
                    ? 'No available listings'
                    : 'Nothing for sale yet'
              }
              subtitle={
                q.length > 0
                  ? 'Try a different search term.'
                  : hideSold
                    ? 'Turn off "Hide sold items" to see everything.'
                    : "Be the first to list something you're ready to part with."
              }
            />
          )}
        </View>
      </ScrollView>

      {sharingItem && (
        <ShareSheet
          title="Share listing"
          link={`https://neighbor.app/for-sale/${sharingItem.id}`}
          previewText={`${sharingItem.title} — ${sharingItem.price} — ${sharingItem.note}`}
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

      {viewingInterestedItem && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={() => setViewingInterestedId(null)} />
          <View className="max-h-[70%] w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">Interested</Text>
              <Pressable
                onPress={() => setViewingInterestedId(null)}
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-1">
                {viewingInterestedIds.map((userId) => {
                  const isMe = userId === ME.id;
                  const person = isMe ? profile : getUser(userId);
                  if (!person) return null;
                  const offer = getOfferFor(viewingInterestedItem.id, userId);
                  const declined = declinedOffers[viewingInterestedItem.id]?.[userId] ?? false;
                  const countered = counterOffers[viewingInterestedItem.id]?.[userId] || undefined;
                  const canRespond =
                    viewingInterestedItem.ownerId === ME.id &&
                    !(sold[viewingInterestedItem.id] ?? false) &&
                    !!offer &&
                    !declined;
                  return (
                    <View
                      key={userId}
                      className="gap-2 rounded-2xl p-2"
                    >
                      <View className="flex-row items-center gap-3">
                        <Pressable
                          onPress={() => {
                            if (isMe) return;
                            setViewingInterestedId(null);
                            router.push(`/profile/${userId}`);
                          }}
                          className="flex-1 flex-row items-center gap-3 active:opacity-70"
                        >
                          <Image source={{ uri: person.avatar }} className="h-9 w-9 rounded-full" />
                          <View className="flex-1">
                            <Text className="font-medium text-charcoal">
                              {isMe ? 'You' : person.name}
                            </Text>
                            {offer && (
                              <Text
                                className={`text-xs font-semibold ${
                                  declined ? 'text-charcoal/40 line-through' : 'text-terracotta'
                                }`}
                              >
                                Offered {offer}
                              </Text>
                            )}
                            {declined && <Text className="text-xs text-charcoal/40">Declined</Text>}
                            {countered && (
                              <Text className="text-xs font-semibold text-gold">
                                You countered: {countered}
                              </Text>
                            )}
                          </View>
                        </Pressable>
                        {canRespond && (
                          <View className="flex-row gap-1.5">
                            <Pressable
                              onPress={() => declineOffer(viewingInterestedItem.id, userId)}
                              className="rounded-full bg-sand px-3 py-1.5"
                            >
                              <Text className="text-xs font-semibold text-charcoal/60">Decline</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                setCounteringUserId(userId);
                                setCounterDraft(countered ?? '');
                              }}
                              className="rounded-full bg-gold/20 px-3 py-1.5"
                            >
                              <Text className="text-xs font-semibold text-gold">Counter</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                acceptOffer(viewingInterestedItem.id, userId);
                                setViewingInterestedId(null);
                              }}
                              className="rounded-full bg-sage/20 px-3 py-1.5"
                            >
                              <Text className="text-xs font-semibold text-sage">Accept</Text>
                            </Pressable>
                          </View>
                        )}
                        {!isMe &&
                          viewingInterestedItem.ownerId === ME.id &&
                          !(sold[viewingInterestedItem.id] ?? false) && (
                            <Pressable
                              onPress={() =>
                                reservedForId[viewingInterestedItem.id] === userId
                                  ? unreserve(viewingInterestedItem.id)
                                  : reserveFor(viewingInterestedItem.id, userId)
                              }
                              className={`rounded-full px-3 py-1.5 ${
                                reservedForId[viewingInterestedItem.id] === userId
                                  ? 'bg-gold/20'
                                  : 'bg-sand'
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold ${
                                  reservedForId[viewingInterestedItem.id] === userId
                                    ? 'text-gold'
                                    : 'text-charcoal/60'
                                }`}
                              >
                                {reservedForId[viewingInterestedItem.id] === userId
                                  ? 'Reserved ✓'
                                  : 'Reserve'}
                              </Text>
                            </Pressable>
                          )}
                      </View>
                      {counteringUserId === userId && (
                        <View className="flex-row items-center gap-2">
                          <TextInput
                            value={counterDraft}
                            onChangeText={setCounterDraft}
                            placeholder="Your counter price..."
                            placeholderTextColor="#8A8378"
                            autoFocus
                            className="flex-1 rounded-full bg-sand px-4 py-2 text-sm text-charcoal"
                          />
                          <Pressable
                            onPress={() => {
                              setCounteringUserId(null);
                              setCounterDraft('');
                            }}
                            className="px-2 py-2"
                          >
                            <Text className="text-xs font-semibold text-charcoal/50">Cancel</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              if (!counterDraft.trim()) return;
                              counterOffer(viewingInterestedItem.id, userId, counterDraft);
                              setCounteringUserId(null);
                              setCounterDraft('');
                            }}
                            className="rounded-full bg-gold px-4 py-2"
                          >
                            <Text className="text-xs font-semibold text-charcoal">Send</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
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
