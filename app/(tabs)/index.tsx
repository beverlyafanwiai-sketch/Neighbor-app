import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { COFFEE_FRIENDS_SVG } from '../../assets/illustrations/coffee-friends';

const stories = [
  { id: '1', name: 'You', uri: 'https://i.pravatar.cc/150?img=12', isYou: true },
  { id: '2', name: 'Maya', uri: 'https://i.pravatar.cc/150?img=5' },
  { id: '3', name: 'Theo', uri: 'https://i.pravatar.cc/150?img=33' },
  { id: '4', name: 'Priya', uri: 'https://i.pravatar.cc/150?img=48' },
  { id: '5', name: 'Sam', uri: 'https://i.pravatar.cc/150?img=15' },
];

const posts = [
  {
    id: '1',
    name: 'Amara Ndlovu',
    avatar: 'https://i.pravatar.cc/150?img=47',
    time: '2h ago',
    body: 'Porch hangout this Saturday if anyone wants to come sit, talk, and eat too much cornbread. No agenda, just company.',
    loves: 12,
    replies: 4,
  },
  {
    id: '2',
    name: 'Theo Marsh',
    avatar: 'https://i.pravatar.cc/150?img=33',
    time: '5h ago',
    body: "Finally finished the trail loop with the hiking circle. Nothing beats quiet company and switchbacks. Same time next week?",
    loves: 8,
    replies: 2,
  },
];

export default function HomeFeed() {
  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-5 pb-3 pt-2">
        <View className="flex-1 flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} color="#3D3D3D80" />
          <TextInput
            placeholder="Search neighbor..."
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
        </View>
        <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-terracotta">
          <Ionicons name="notifications-outline" size={20} color="#F5F2E9" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mx-5 mt-1 flex-row items-center overflow-hidden rounded-3xl bg-cream">
          <View className="flex-1 py-4 pl-5 pr-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-terracotta">
              This weekend
            </Text>
            <Text className="mt-1 text-[15px] font-medium leading-5 text-charcoal">
              Grab coffee with someone in your circle
            </Text>
          </View>
          <View className="h-24 w-28">
            <SvgXml xml={COFFEE_FRIENDS_SVG} width="100%" height="100%" />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 py-2"
          contentContainerClassName="gap-4"
        >
          {stories.map((s) => (
            <View key={s.id} className="items-center gap-1.5">
              <View
                className={`h-16 w-16 items-center justify-center rounded-full ${
                  s.isYou ? 'border-2 border-dashed border-terracotta' : 'bg-gold p-0.5'
                }`}
              >
                <Image source={{ uri: s.uri }} className="h-14 w-14 rounded-full" />
              </View>
              <Text className="text-xs text-charcoal">{s.name}</Text>
            </View>
          ))}
        </ScrollView>

        <View className="gap-4 px-5 pb-8 pt-2">
          {posts.map((post) => (
            <View key={post.id} className="rounded-3xl bg-cream p-4 shadow-sm">
              <View className="flex-row items-center gap-3">
                <Image source={{ uri: post.avatar }} className="h-11 w-11 rounded-full" />
                <View>
                  <Text className="font-semibold text-charcoal">{post.name}</Text>
                  <Text className="text-xs text-charcoal/60">{post.time}</Text>
                </View>
              </View>

              <Text className="mt-3 text-[15px] leading-5 text-charcoal">{post.body}</Text>

              <View className="mt-4 flex-row items-center gap-6 border-t border-charcoal/10 pt-3">
                <Pressable className="flex-row items-center gap-1.5">
                  <Ionicons name="heart-outline" size={18} color="#E0533C" />
                  <Text className="text-sm text-charcoal/70">{post.loves}</Text>
                </Pressable>
                <Pressable className="flex-row items-center gap-1.5">
                  <Ionicons name="chatbubble-outline" size={17} color="#81A684" />
                  <Text className="text-sm text-charcoal/70">{post.replies}</Text>
                </Pressable>
                <Pressable className="flex-row items-center gap-1.5">
                  <Ionicons name="arrow-redo-outline" size={18} color="#3D3D3D80" />
                  <Text className="text-sm text-charcoal/70">Share</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
