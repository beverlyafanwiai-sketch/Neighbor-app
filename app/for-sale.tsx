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
import {
  getEffectiveInterestCount,
  getEffectiveInterestedIds,
  getOfferFor,
  useSaleStore,
} from '../store/useSaleStore';
import { useProfileStore } from '../store/useProfileStore';
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
  const acceptedOffers = useSaleStore((s) => s.acceptedOffers);
  const acceptOffer = useSaleStore((s) => s.acceptOffer);
  const declinedOffers = useSaleStore((s) => s.declinedOffers);
  const declineOffer = useSaleStore((s) => s.declineOffer);
  const dropPrice = useSaleStore((s) => s.dropPrice);
  const markSold = useSaleStore((s) => s.markSold);
  const relistItem = useSaleStore((s) => s.relistItem);
  const deleteItem = useSaleStore((s) => s.deleteItem);
  const profile = useProfileStore((s) => s.profile);
  const savedIds = useSavedSaleStore((s) => s.savedIds);
  const toggleSave = useSavedSaleStore((s) => s.toggleSave);

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [viewingInterestedId, setViewingInterestedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SaleSort>('Newest');
  const [query, setQuery] = useState('');
  const [viewingPhotos, setViewingPhotos] = useState<{ uris: string[]; index: number } | null>(null);
  const [offeringId, setOfferingId] = useState<string | null>(null);
  const [offerDraft, setOfferDraft] = useState('');
  const [droppingPriceId, setDroppingPriceId] = useState<string | null>(null);
  const [priceDropDraft, setPriceDropDraft] = useState('');

  const q = query.trim().toLowerCase();
  const matchesQuery = (i: (typeof items)[number]) =>
    q.length === 0 || i.title.toLowerCase().includes(q) || i.note.toLowerCase().includes(q);

  const myItems = items.filter((i) => i.ownerId === ME.id && matchesQuery(i));
  const unsortedBoardItems = items.filter((i) => i.ownerId !== ME.id && matchesQuery(i));
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
                          {item.originalPrice && (
                            <View className="rounded-full bg-terracotta/10 px-2 py-0.5">
                              <Text className="text-[10px] font-semibold text-terracotta">
                                Price drop
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
                        onPhotoPress={(i) => setViewingPhotos({ uris: item.imageUris!, index: i })}
                      />
                    )}

                    <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                      <Pressable
                        disabled={isSold || interestCount === 0}
                        onPress={() => setViewingInterestedId(item.id)}
                        className="flex-1"
                      >
                        <Text className={`text-sm ${isSold ? 'text-sage' : 'text-charcoal/50'}`}>
                          {isSold
                            ? acceptedBuyer
                              ? `Sold to ${acceptedBuyer.name} for ${accepted!.price}`
                              : 'Marked as sold'
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
                      ) : (
                        <Pressable
                          onPress={() => markSold(item.id)}
                          className="rounded-full bg-sage/20 px-4 py-1.5"
                        >
                          <Text className="text-xs font-semibold text-sage">Mark as sold</Text>
                        </Pressable>
                      )}
                    </View>

                    {!isSold &&
                      (droppingPriceId === item.id ? (
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
                        <Pressable
                          onPress={() => {
                            setDroppingPriceId(item.id);
                            setPriceDropDraft('');
                          }}
                          className="mt-2"
                        >
                          <Text className="text-xs font-semibold text-terracotta">Drop price</Text>
                        </Pressable>
                      ))}
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
                        <>
                          <Text className="text-xs text-charcoal/40 line-through">
                            {item.originalPrice}
                          </Text>
                          <View className="rounded-full bg-terracotta/10 px-2 py-0.5">
                            <Text className="text-[10px] font-semibold text-terracotta">
                              Price drop
                            </Text>
                          </View>
                        </>
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
                    onPhotoPress={(i) => setViewingPhotos({ uris: item.imageUris!, index: i })}
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
                    <Pressable
                      onPress={() => {
                        setOfferingId(item.id);
                        setOfferDraft(myOffers[item.id] ?? '');
                      }}
                      className="mt-2"
                    >
                      <Text className="text-xs font-semibold text-terracotta">
                        {myOffers[item.id] ? 'Change your offer' : 'Make an offer'}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            );
          })}

          {boardItems.length === 0 && (
            <EmptyState
              icon="pricetags-outline"
              iconColorClassName="text-charcoal/50"
              title={q.length > 0 ? `No results for "${query.trim()}"` : 'Nothing for sale yet'}
              subtitle={
                q.length > 0
                  ? 'Try a different search term.'
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
                  const canRespond =
                    viewingInterestedItem.ownerId === ME.id &&
                    !(sold[viewingInterestedItem.id] ?? false) &&
                    !!offer &&
                    !declined;
                  return (
                    <View
                      key={userId}
                      className="flex-row items-center gap-3 rounded-2xl p-2"
                    >
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
                              acceptOffer(viewingInterestedItem.id, userId);
                              setViewingInterestedId(null);
                            }}
                            className="rounded-full bg-sage/20 px-3 py-1.5"
                          >
                            <Text className="text-xs font-semibold text-sage">Accept</Text>
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
        />
      )}
    </SafeAreaView>
  );
}
