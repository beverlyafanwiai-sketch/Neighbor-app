import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import ReportPostSheet from '../components/ReportPostSheet';
import ShareSheet from '../components/ShareSheet';
import { getUser, ME } from '../data/mock';
import { getEffectiveInterestCount, useSaleStore } from '../store/useSaleStore';

export default function ForSaleBoard() {
  const items = useSaleStore((s) => s.items);
  const sold = useSaleStore((s) => s.sold);
  const myInterest = useSaleStore((s) => s.myInterest);
  const toggleInterest = useSaleStore((s) => s.toggleInterest);
  const markSold = useSaleStore((s) => s.markSold);
  const deleteItem = useSaleStore((s) => s.deleteItem);

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);

  const myItems = items.filter((i) => i.ownerId === ME.id);
  const boardItems = items.filter((i) => i.ownerId !== ME.id);
  const sharingItem = items.find((i) => i.id === sharingId);

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
                        onPress={() => setDeletingItemId(item.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                      </Pressable>
                    </View>

                    <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                      <Text className={`flex-1 text-sm ${isSold ? 'text-sage' : 'text-charcoal/50'}`}>
                        {isSold
                          ? 'Marked as sold'
                          : interestCount === 0
                            ? 'No interest yet'
                            : `${interestCount} neighbor${interestCount === 1 ? '' : 's'} interested`}
                      </Text>
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
                      <Text className="flex-1 text-sm text-charcoal/50">
                        {interestCount === 0
                          ? 'No interest yet'
                          : `${interestCount} neighbor${interestCount === 1 ? '' : 's'} interested`}
                      </Text>
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
    </SafeAreaView>
  );
}
