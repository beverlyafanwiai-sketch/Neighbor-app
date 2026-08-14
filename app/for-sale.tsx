import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import ReportPostSheet from '../components/ReportPostSheet';
import ShareSheet from '../components/ShareSheet';
import { getUser, ME } from '../data/mock';
import { getEffectiveInterestCount, getEffectiveInterestedIds, useSaleStore } from '../store/useSaleStore';
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
  const markSold = useSaleStore((s) => s.markSold);
  const deleteItem = useSaleStore((s) => s.deleteItem);
  const profile = useProfileStore((s) => s.profile);
  const savedIds = useSavedSaleStore((s) => s.savedIds);
  const toggleSave = useSavedSaleStore((s) => s.toggleSave);

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [viewingInterestedId, setViewingInterestedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SaleSort>('Newest');

  const myItems = items.filter((i) => i.ownerId === ME.id);
  const unsortedBoardItems = items.filter((i) => i.ownerId !== ME.id);
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
                        <Text className="text-xs text-charcoal/50">{item.price}</Text>
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

                    <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                      <Pressable
                        disabled={isSold || interestCount === 0}
                        onPress={() => setViewingInterestedId(item.id)}
                        className="flex-1"
                      >
                        <Text className={`text-sm ${isSold ? 'text-sage' : 'text-charcoal/50'}`}>
                          {isSold
                            ? 'Marked as sold'
                            : interestCount === 0
                              ? 'No interest yet'
                              : `${interestCount} neighbor${interestCount === 1 ? '' : 's'} interested`}
                        </Text>
                      </Pressable>
                      {!isSold && (
                        <Pressable
                          onPress={() => markSold(item.id)}
                          className="rounded-full bg-sage/20 px-4 py-1.5"
                        >
                          <Text className="text-xs font-semibold text-sage">Mark as sold</Text>
                        </Pressable>
                      )}
                    </View>
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
                    <Text className="text-xs text-charcoal/50">
                      {owner.name} · {item.price}
                    </Text>
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
                          {interested ? "You're interested ✓" : "I'm interested"}
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            );
          })}

          {boardItems.length === 0 && (
            <EmptyState
              icon="pricetags-outline"
              iconColorClassName="text-charcoal/50"
              title="Nothing for sale yet"
              subtitle="Be the first to list something you're ready to part with."
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
                  return (
                    <Pressable
                      key={userId}
                      onPress={() => {
                        if (isMe) return;
                        setViewingInterestedId(null);
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
