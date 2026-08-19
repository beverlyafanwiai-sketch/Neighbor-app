import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { formatScheduledFor } from '../lib/schedule';
import { usePostsStore } from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';

export default function ScheduledPosts() {
  const profile = useProfileStore((s) => s.profile);
  const scheduledPosts = usePostsStore((s) => s.scheduledPosts);
  const cancelScheduledPost = usePostsStore((s) => s.cancelScheduledPost);

  const sorted = [...scheduledPosts].sort((a, b) => a.scheduledFor - b.scheduledFor);

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
        <Text className="text-base font-bold text-charcoal">Scheduled posts</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8 pt-2">
        {sorted.length === 0 && (
          <EmptyState
            icon="time-outline"
            iconColorClassName="text-charcoal/50"
            title="Nothing scheduled"
            subtitle="Posts you schedule for later will wait here until it's time."
          />
        )}

        <View className="gap-4">
          {sorted.map((scheduled) => (
            <Pressable
              key={scheduled.id}
              onPress={() => router.push(`/create-post?scheduledId=${scheduled.id}`)}
              className="rounded-3xl bg-cream p-4 shadow-sm active:opacity-80"
            >
              <View className="flex-row items-center gap-3">
                <Image source={{ uri: profile.avatar }} className="h-9 w-9 rounded-full" />
                <View className="flex-row items-center gap-1.5 rounded-full bg-terracotta/15 px-2.5 py-1">
                  <Ionicons name="time-outline" size={12} className="text-terracotta" />
                  <Text className="text-xs font-semibold text-terracotta">
                    {formatScheduledFor(new Date(scheduled.scheduledFor))}
                  </Text>
                </View>
              </View>

              <Text className="mt-3 text-[15px] leading-5 text-charcoal" numberOfLines={3}>
                {scheduled.body}
              </Text>

              {scheduled.imageUris && scheduled.imageUris.length > 0 && (
                <View className="mt-3 flex-row gap-2">
                  {scheduled.imageUris.map((uri) => (
                    <Image key={uri} source={{ uri }} className="h-20 w-20 rounded-xl" />
                  ))}
                </View>
              )}

              <View className="mt-4 flex-row items-center justify-end border-t border-charcoal/10 pt-3">
                <Pressable
                  onPress={(evt) => {
                    evt.stopPropagation();
                    cancelScheduledPost(scheduled.id);
                  }}
                  className="flex-row items-center gap-1.5"
                >
                  <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                  <Text className="text-sm font-medium text-terracotta">Cancel</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
