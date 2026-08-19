import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { ME, getUser } from '../data/mock';
import { formatPostedAgo } from '../store/useAlertsStore';
import { useGroupsStore } from '../store/useGroupsStore';
import { useProfileStore } from '../store/useProfileStore';

export default function GroupAnnouncementHistory() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const group = useGroupsStore((s) => s.groups.find((g) => g.id === groupId));
  const history = useGroupsStore((s) => (groupId ? (s.announcementHistory[groupId] ?? []) : []));
  const currentAnnouncement = useGroupsStore((s) =>
    groupId ? s.announcements[groupId] : undefined
  );
  const profile = useProfileStore((s) => s.profile);
  const now = Date.now();

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
        <Text className="text-base font-bold text-charcoal">
          {group ? `${group.name} · Announcements` : 'Announcements'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        {history.length === 0 ? (
          <EmptyState
            icon="megaphone-outline"
            iconColorClassName="text-charcoal/50"
            title="No announcements yet"
            subtitle="Announcements an admin posts to this circle will show up here."
          />
        ) : (
          <View className="mt-2 gap-3">
            {history.map((a) => {
              const author = a.authorId === ME.id ? profile : getUser(a.authorId);
              const isCurrent = currentAnnouncement?.id === a.id;
              return (
                <View key={a.id} className="rounded-2xl bg-cream p-4">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="megaphone-outline" size={13} className="text-terracotta" />
                    {isCurrent && (
                      <View className="rounded-full bg-terracotta/15 px-2 py-0.5">
                        <Text className="text-[10px] font-bold text-terracotta">CURRENT</Text>
                      </View>
                    )}
                  </View>
                  <Text className="mt-1.5 text-sm leading-5 text-charcoal">{a.text}</Text>
                  <Text className="mt-2 text-xs text-charcoal/40">
                    {author?.name ?? 'A neighbor'} · {formatPostedAgo(a.postedAt, now)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
