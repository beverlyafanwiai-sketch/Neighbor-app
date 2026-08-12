import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { ALERT_CATEGORIES, ME, getUser } from '../data/mock';
import {
  formatExpiresIn,
  formatPostedAgo,
  getActiveAlerts,
  useAlertsStore,
} from '../store/useAlertsStore';

export default function NeighborhoodAlerts() {
  const allAlerts = useAlertsStore((s) => s.alerts);
  const deleteAlert = useAlertsStore((s) => s.deleteAlert);
  const [now] = useState(() => Date.now());

  const activeAlerts = getActiveAlerts(allAlerts, now);

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Neighborhood Alerts</Text>
        <Pressable
          onPress={() => router.push('/create-alert')}
          className="h-9 w-9 items-center justify-center rounded-full bg-terracotta"
        >
          <Ionicons name="add" size={20} className="text-paper" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          Time-sensitive stuff worth knowing — lost pets, road work, safety heads-up. Alerts expire
          on their own.
        </Text>

        <View className="mt-5 gap-3">
          {activeAlerts.map((alert) => {
            const author = getUser(alert.authorId);
            const meta = ALERT_CATEGORIES.find((c) => c.value === alert.category);
            const isMine = alert.authorId === ME.id;
            return (
              <View key={alert.id} className="rounded-2xl bg-cream p-4">
                <View className="flex-row items-start gap-3">
                  <Text style={{ fontSize: 22 }}>{meta?.emoji ?? '📢'}</Text>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                      {meta?.label ?? 'Alert'}
                    </Text>
                    <Text className="mt-1 text-[15px] leading-5 text-charcoal">{alert.text}</Text>
                    <Text className="mt-2 text-xs text-charcoal/50">
                      {author?.name ?? 'A neighbor'} · {formatPostedAgo(alert.postedAt, now)} ·{' '}
                      {formatExpiresIn(alert.expiresAt, now)}
                    </Text>
                  </View>
                  {isMine && (
                    <Pressable
                      onPress={() => deleteAlert(alert.id)}
                      className="h-8 w-8 items-center justify-center rounded-full"
                    >
                      <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}

          {activeAlerts.length === 0 && (
            <EmptyState
              icon="warning-outline"
              iconColorClassName="text-charcoal/50"
              title="No active alerts"
              subtitle="Post one if there's something time-sensitive your neighbors should know."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
