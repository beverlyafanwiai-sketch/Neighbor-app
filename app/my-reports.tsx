import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { useReportsStore } from '../store/useReportsStore';

const CATEGORY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  Post: 'document-text-outline',
  Comment: 'chatbubble-outline',
  Alert: 'warning-outline',
  Listing: 'pricetag-outline',
  Circle: 'people-outline',
  Message: 'mail-outline',
  Profile: 'person-outline',
  Rec: 'star-outline',
  Ask: 'help-circle-outline',
};

function formatReportedAgo(createdAt: number) {
  const diffMs = Date.now() - createdAt;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(createdAt).toLocaleDateString();
}

export default function MyReports() {
  const reports = useReportsStore((s) => s.reports);

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
        <Text className="text-base font-bold text-charcoal">My Reports</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          Things you've reported, most recent first. This is a demo app, so nothing here is
          actually reviewed — it's just a record of what you submitted.
        </Text>

        {reports.length === 0 ? (
          <EmptyState
            icon="flag-outline"
            iconColorClassName="text-charcoal/50"
            title="Nothing reported yet"
            subtitle="Anything you report from a post, comment, alert, listing, circle, message, or profile will show up here."
          />
        ) : (
          <View className="mt-5 gap-3">
            {reports.map((r) => (
              <Pressable
                key={r.id}
                disabled={!r.route}
                onPress={() => r.route && router.push(r.route as never)}
                className={`rounded-2xl bg-cream p-4 ${r.route ? 'active:opacity-80' : ''}`}
              >
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-sand">
                    <Ionicons
                      name={CATEGORY_ICON[r.category] ?? 'flag-outline'}
                      size={15}
                      className="text-terracotta"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-charcoal" numberOfLines={1}>
                      {r.subject}
                    </Text>
                    <Text className="text-xs text-charcoal/50">
                      {r.category} · {formatReportedAgo(r.createdAt)}
                    </Text>
                  </View>
                  {r.route && (
                    <Ionicons name="chevron-forward" size={16} className="text-charcoal/30" />
                  )}
                </View>
                <View className="mt-3 flex-row items-center gap-1.5 border-t border-charcoal/10 pt-3">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                    Reason
                  </Text>
                  <Text className="text-xs text-charcoal/60">{r.reason}</Text>
                </View>
                {r.details && (
                  <Text className="mt-1.5 text-xs italic text-charcoal/50">"{r.details}"</Text>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
