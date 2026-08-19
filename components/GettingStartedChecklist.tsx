import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useGettingStartedStore } from '../store/useGettingStartedStore';

const ITEMS = [
  {
    key: 'postedThisSession' as const,
    icon: 'document-text-outline' as const,
    label: 'Say hello with a post',
    onPress: () => router.push('/create-post'),
  },
  {
    key: 'joinedCircleThisSession' as const,
    icon: 'people-circle-outline' as const,
    label: 'Join a circle',
    onPress: () => router.push('/(tabs)/groups'),
  },
  {
    key: 'rsvpedThisSession' as const,
    icon: 'calendar-outline' as const,
    label: 'RSVP to an event',
    onPress: () => router.push('/(tabs)/events'),
  },
  {
    key: 'savedThisSession' as const,
    icon: 'bookmark-outline' as const,
    label: 'Save a post you like',
    onPress: undefined,
  },
];

export default function GettingStartedChecklist() {
  const state = useGettingStartedStore();

  const completedCount = ITEMS.filter((item) => state[item.key]).length;
  const allDone = completedCount === ITEMS.length;

  if (state.dismissed || allDone) return null;

  return (
    <View className="mx-5 mt-4 gap-3 rounded-2xl bg-cream p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-bold text-charcoal">Getting started</Text>
          <Text className="mt-0.5 text-xs text-charcoal/50">
            {completedCount}/{ITEMS.length} done
          </Text>
        </View>
        <Pressable
          onPress={state.dismiss}
          accessibilityLabel="Dismiss getting started checklist"
          accessibilityRole="button"
          className="h-7 w-7 items-center justify-center"
        >
          <Ionicons name="close" size={16} className="text-charcoal/40" />
        </Pressable>
      </View>

      <View className="gap-2">
        {ITEMS.map((item) => {
          const done = state[item.key];
          const interactive = !done && Boolean(item.onPress);
          return (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              disabled={!interactive}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              className={`flex-row items-center gap-3 rounded-xl p-3 ${done ? 'bg-sage/15' : 'bg-sand'}`}
            >
              <Ionicons
                name={done ? 'checkmark-circle' : item.icon}
                size={18}
                className={done ? 'text-sage' : 'text-charcoal/60'}
              />
              <Text
                className={`flex-1 text-sm font-medium ${done ? 'text-sage line-through' : 'text-charcoal'}`}
              >
                {item.label}
              </Text>
              {interactive && (
                <Ionicons name="chevron-forward" size={14} className="text-charcoal/30" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
