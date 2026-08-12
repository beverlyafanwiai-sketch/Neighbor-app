import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { getUser, ME } from '../data/mock';
import { getEffectiveHelperCount, useLendStore } from '../store/useLendStore';

export default function LendBoard() {
  const items = useLendStore((s) => s.items);
  const status = useLendStore((s) => s.status);
  const borrowerId = useLendStore((s) => s.borrowerId);
  const dueLabel = useLendStore((s) => s.dueLabel);
  const pendingRequesterId = useLendStore((s) => s.pendingRequesterId);
  const myOffers = useLendStore((s) => s.myOffers);
  const requestToBorrow = useLendStore((s) => s.requestToBorrow);
  const cancelRequest = useLendStore((s) => s.cancelRequest);
  const approveRequest = useLendStore((s) => s.approveRequest);
  const declineRequest = useLendStore((s) => s.declineRequest);
  const markReturned = useLendStore((s) => s.markReturned);
  const offerToHelp = useLendStore((s) => s.offerToHelp);
  const deleteItem = useLendStore((s) => s.deleteItem);

  const myItems = items.filter((i) => i.ownerId === ME.id);
  const boardItems = items.filter((i) => i.ownerId !== ME.id);

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          Lend a hand, borrow a tool. No need to own everything when your neighbors already do.
        </Text>

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
                        onPress={() => deleteItem(item.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                      </Pressable>
                    </View>

                    {item.kind === 'have' ? (
                      requester ? (
                        <View className="mt-3 border-t border-charcoal/10 pt-3">
                          <Text className="text-sm text-charcoal">
                            {requester.name} wants to borrow this
                          </Text>
                          <View className="mt-2 flex-row gap-2">
                            <Pressable
                              onPress={() => approveRequest(item.id)}
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
                        </View>
                      ) : itemStatus === 'lent' && borrower ? (
                        <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                          <Text className="flex-1 text-sm text-charcoal">
                            Lent to {borrower.name}
                            {dueLabel[item.id] ? ` · back by ${dueLabel[item.id]}` : ''}
                          </Text>
                          <Pressable
                            onPress={() => markReturned(item.id)}
                            className="rounded-full bg-sage/20 px-4 py-1.5"
                          >
                            <Text className="text-xs font-semibold text-sage">Mark returned</Text>
                          </Pressable>
                        </View>
                      ) : (
                        <Text className="mt-3 border-t border-charcoal/10 pt-3 text-sm text-charcoal/50">
                          Available to lend
                        </Text>
                      )
                    ) : (
                      <Text className="mt-3 border-t border-charcoal/10 pt-3 text-sm text-charcoal/50">
                        {helperCount === 0
                          ? 'No offers yet'
                          : `${helperCount} neighbor${helperCount === 1 ? '' : 's'} offered to help`}
                      </Text>
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
                  </View>
                  <Text className="mt-2 text-sm leading-5 text-charcoal/80">{item.note}</Text>

                  <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                    {itemStatus === 'lent' ? (
                      <>
                        <Text className="flex-1 text-sm text-sage">
                          On loan to you{dueLabel[item.id] ? ` · back by ${dueLabel[item.id]}` : ''}
                        </Text>
                        <Pressable
                          onPress={() => markReturned(item.id)}
                          className="rounded-full bg-sage/20 px-4 py-1.5"
                        >
                          <Text className="text-xs font-semibold text-sage">Mark returned</Text>
                        </Pressable>
                      </>
                    ) : itemStatus === 'requested' ? (
                      <>
                        <Text className="flex-1 text-sm text-gold">Request sent</Text>
                        <Pressable
                          onPress={() => cancelRequest(item.id)}
                          className="rounded-full bg-sand px-4 py-1.5"
                        >
                          <Text className="text-xs font-semibold text-charcoal">Cancel</Text>
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Text className="flex-1 text-sm text-charcoal/50">Available</Text>
                        <Pressable
                          onPress={() => requestToBorrow(item.id)}
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
                </View>
                <Text className="mt-2 text-sm leading-5 text-charcoal/80">{item.note}</Text>

                <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <Text className="flex-1 text-sm text-charcoal/50">
                    {helperCount === 0
                      ? 'No neighbors yet'
                      : `${helperCount} neighbor${helperCount === 1 ? '' : 's'} can help`}
                  </Text>
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
              title="Nothing on the board yet"
              subtitle="Be the first to post something you can lend, or something you need."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
