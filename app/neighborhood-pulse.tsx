import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DISCOVER_USERS, ME, USERS } from '../data/mock';
import { isAvailable, useAvailabilityStore } from '../store/useAvailabilityStore';
import { useAlertsStore, getActiveAlerts } from '../store/useAlertsStore';
import { useEventsStore } from '../store/useEventsStore';
import { useFriendsStore } from '../store/useFriendsStore';
import { useGroupsStore } from '../store/useGroupsStore';
import { useLendStore } from '../store/useLendStore';
import { usePostsStore } from '../store/usePostsStore';
import { useRecsStore } from '../store/useRecsStore';
import { useSaleStore } from '../store/useSaleStore';

const ALL_PEOPLE = [ME, ...USERS, ...DISCOVER_USERS];

function StatCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | string;
  label: string;
}) {
  return (
    <View className="w-[47%] gap-1 rounded-2xl bg-cream p-4">
      <Ionicons name={icon} size={18} className="text-terracotta" />
      <Text className="mt-1 text-2xl font-bold text-charcoal">{value}</Text>
      <Text className="text-xs text-charcoal/50">{label}</Text>
    </View>
  );
}

export default function NeighborhoodPulse() {
  const posts = usePostsStore((s) => s.posts);
  const comments = usePostsStore((s) => s.comments);
  const groups = useGroupsStore((s) => s.groups);
  const joinedGroups = useGroupsStore((s) => s.joined);
  const events = useEventsStore((s) => s.events);
  const alerts = useAlertsStore((s) => s.alerts);
  const recEntries = useRecsStore((s) => s.entries);
  const lendItems = useLendStore((s) => s.items);
  const saleItems = useSaleStore((s) => s.items);
  const soldMap = useSaleStore((s) => s.sold);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const myAvailable = useAvailabilityStore((s) => s.myAvailable);

  const totalComments = Object.values(comments).reduce((sum, c) => sum + c.length, 0);
  const friendCount = Object.values(friendStatuses).filter((s) => s === 'friends').length;
  const availableCount = ALL_PEOPLE.filter((u) => isAvailable(u, myAvailable)).length;
  const joinedCircleCount = groups.filter((g) => joinedGroups[g.id]).length;
  const mostActiveCircle = [...groups].sort((a, b) => b.memberCount - a.memberCount)[0];
  const upcomingEvents = events.filter((e) => e.status === 'upcoming' && !e.cancelled);
  const activeAlerts = getActiveAlerts(alerts, Date.now());
  const availableForSale = saleItems.filter((i) => !(soldMap[i.id] ?? false));
  const recsCount = recEntries.filter((e) => e.kind === 'rec').length;
  const asksCount = recEntries.filter((e) => e.kind === 'ask').length;

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Neighborhood Pulse</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          A snapshot of what's happening around here right now.
        </Text>

        <View className="mt-5 flex-row flex-wrap justify-between gap-3">
          <StatCard icon="people-outline" value={ALL_PEOPLE.length} label="Neighbors" />
          <StatCard icon="heart-outline" value={friendCount} label="Your friends" />
          <StatCard icon="sunny-outline" value={availableCount} label="Available right now" />
          <StatCard icon="document-text-outline" value={posts.length} label="Posts shared" />
          <StatCard icon="chatbubble-outline" value={totalComments} label="Comments" />
          <StatCard icon="warning-outline" value={activeAlerts.length} label="Active alerts" />
          <StatCard icon="people-circle-outline" value={groups.length} label="Circles" />
          <StatCard icon="bookmark-outline" value={joinedCircleCount} label="Circles you're in" />
          <StatCard icon="calendar-outline" value={upcomingEvents.length} label="Upcoming events" />
          <StatCard icon="pricetag-outline" value={availableForSale.length} label="For sale" />
          <StatCard icon="basket-outline" value={lendItems.length} label="Lend & borrow" />
          <StatCard icon="star-outline" value={recsCount} label="Recommendations" />
        </View>

        {asksCount > 0 && (
          <Text className="mt-2 text-xs text-charcoal/40">
            Plus {asksCount} open ask{asksCount === 1 ? '' : 's'} on the Recs board.
          </Text>
        )}

        {mostActiveCircle && (
          <Pressable
            onPress={() => router.push(`/group/${mostActiveCircle.id}`)}
            className="mt-6 flex-row items-center gap-3 rounded-2xl bg-terracotta/10 p-4 active:opacity-80"
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-terracotta">
              <Text className="text-lg font-bold text-paper">
                {mostActiveCircle.name.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                Biggest circle
              </Text>
              <Text className="text-sm font-medium text-charcoal">{mostActiveCircle.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} className="text-terracotta" />
          </Pressable>
        )}

        <Text className="mt-6 text-xs text-charcoal/40">
          These are current totals, not a monthly breakdown — the app doesn't track exact post
          dates.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
