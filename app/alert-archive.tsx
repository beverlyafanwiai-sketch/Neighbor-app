import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import MentionText from '../components/MentionText';
import { ALERT_CATEGORIES, ME, getUser } from '../data/mock';
import { useBlockedStore } from '../store/useBlockedStore';
import { formatPostedAgo, getExpiredAlerts, useAlertsStore } from '../store/useAlertsStore';
import { useProfileStore } from '../store/useProfileStore';

export default function AlertArchive() {
  const alerts = useAlertsStore((s) => s.alerts);
  const profile = useProfileStore((s) => s.profile);
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const now = Date.now();
  const expired = getExpiredAlerts(alerts, now).filter((a) => !blockedIds[a.authorId]);

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
        <Text className="text-base font-bold text-charcoal">Alert Archive</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          Alerts that have expired. They're read-only — repost one if it's still relevant.
        </Text>

        {expired.length === 0 ? (
          <EmptyState
            icon="time-outline"
            iconColorClassName="text-charcoal/50"
            title="Nothing archived yet"
            subtitle="Alerts show up here once they expire."
          />
        ) : (
          <View className="mt-5 gap-3">
            {expired.map((alert) => {
              const meta = ALERT_CATEGORIES.find((c) => c.value === alert.category);
              const author = alert.authorId === ME.id ? profile : getUser(alert.authorId);
              return (
                <View key={alert.id} className="rounded-2xl bg-cream p-4">
                  <View className="flex-row items-start gap-3">
                    <Text style={{ fontSize: 22 }}>{meta?.emoji ?? '📢'}</Text>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                          {meta?.label ?? 'Alert'}
                        </Text>
                        {alert.resolved && (
                          <View className="rounded-full bg-sage/20 px-2 py-0.5">
                            <Text className="text-[10px] font-bold text-sage">RESOLVED</Text>
                          </View>
                        )}
                      </View>
                      <MentionText
                        text={alert.text}
                        className="mt-1 text-[15px] leading-5 text-charcoal/80"
                      />
                      {alert.resolved && alert.resolvedNote && (
                        <Text className="mt-1 text-xs italic text-sage">{alert.resolvedNote}</Text>
                      )}
                      {alert.location && (
                        <View className="mt-1.5 flex-row items-center gap-1">
                          <Ionicons
                            name="location-outline"
                            size={12}
                            className="text-charcoal/40"
                          />
                          <Text className="text-xs text-charcoal/50">{alert.location}</Text>
                        </View>
                      )}
                      <Text className="mt-2 text-xs text-charcoal/40">
                        {author?.name ?? 'A neighbor'} · posted {formatPostedAgo(alert.postedAt, now)}
                        {' · '}
                        expired {formatPostedAgo(alert.expiresAt, now)}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => router.push(`/create-alert?duplicateId=${alert.id}`)}
                    className="mt-3 flex-row items-center justify-center gap-1.5 self-start rounded-full bg-sand px-3.5 py-1.5"
                  >
                    <Ionicons name="refresh-outline" size={13} className="text-charcoal/60" />
                    <Text className="text-xs font-semibold text-charcoal/60">
                      Repost if still relevant
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
