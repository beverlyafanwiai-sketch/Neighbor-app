import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { COFFEE_FRIENDS_SVG } from '../../assets/illustrations/coffee-friends';
import { ME, USERS } from '../../data/mock';
import { useNotificationsStore } from '../../store/useNotificationsStore';
import { usePostsStore } from '../../store/usePostsStore';
import { useProfileStore } from '../../store/useProfileStore';

function goToProfile(userId: string) {
  if (userId === ME.id) {
    router.push('/(tabs)/profile');
  } else {
    router.push(`/profile/${userId}`);
  }
}

export default function HomeFeed() {
  const profile = useProfileStore((s) => s.profile);
  const stories = [{ ...profile, isYou: true }, ...USERS];
  const [query, setQuery] = useState('');
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length);
  const posts = usePostsStore((s) => s.posts);

  const postsWithAuthor = posts
    .map((post) => ({
      post,
      author: post.authorId === ME.id ? profile : USERS.find((u) => u.id === post.authorId),
    }))
    .filter((p): p is { post: (typeof posts)[number]; author: NonNullable<typeof p.author> } =>
      Boolean(p.author)
    );

  const q = query.trim().toLowerCase();
  const filteredPosts = q
    ? postsWithAuthor.filter(
        ({ post, author }) =>
          author.name.toLowerCase().includes(q) || post.body.toLowerCase().includes(q)
      )
    : postsWithAuthor;

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-5 pb-3 pt-2">
        <View className="flex-1 flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} color="#3D3D3D80" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search posts and people..."
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#3D3D3D80" />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => router.push('/discover')}
          className="h-11 w-11 items-center justify-center rounded-full bg-terracotta"
        >
          <Ionicons name="compass-outline" size={20} color="#F5F2E9" />
        </Pressable>
        <Pressable
          onPress={() => router.push('/notifications')}
          className="h-11 w-11 items-center justify-center rounded-full bg-terracotta"
        >
          <Ionicons name="notifications-outline" size={20} color="#F5F2E9" />
          {unreadCount > 0 && (
            <View className="absolute -right-0.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1">
              <Text className="text-[10px] font-bold text-charcoal">{unreadCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!q && (
          <>
            <Pressable
              onPress={() => router.push('/create-post')}
              className="mx-5 mt-1 flex-row items-center gap-3 rounded-2xl bg-cream p-3 active:opacity-80"
            >
              <Image source={{ uri: profile.avatar }} className="h-9 w-9 rounded-full" />
              <Text className="flex-1 text-sm text-charcoal/50">
                Share something with your neighbors...
              </Text>
            </Pressable>

            <View className="mx-5 mt-3 flex-row items-center overflow-hidden rounded-3xl bg-cream">
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
                <Pressable
                  key={s.id}
                  onPress={() => goToProfile(s.id)}
                  className="items-center gap-1.5"
                >
                  <View
                    className={`h-16 w-16 items-center justify-center rounded-full ${
                      'isYou' in s && s.isYou
                        ? 'border-2 border-dashed border-terracotta'
                        : 'bg-gold p-0.5'
                    }`}
                  >
                    <Image source={{ uri: s.avatar }} className="h-14 w-14 rounded-full" />
                  </View>
                  <Text className="text-xs text-charcoal">
                    {'isYou' in s && s.isYou ? 'You' : s.name.split(' ')[0]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {q.length > 0 && (
          <Text className="px-5 pt-3 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
            {filteredPosts.length === 0
              ? `No posts matching "${query.trim()}"`
              : `Results for "${query.trim()}"`}
          </Text>
        )}

        <View className="gap-4 px-5 pb-8 pt-2">
          {filteredPosts.map(({ post, author }) => {
            return (
              <View key={post.id} className="rounded-3xl bg-cream p-4 shadow-sm">
                <Pressable
                  onPress={() => goToProfile(author.id)}
                  className="flex-row items-center gap-3"
                >
                  <Image source={{ uri: author.avatar }} className="h-11 w-11 rounded-full" />
                  <View>
                    <Text className="font-semibold text-charcoal">{author.name}</Text>
                    <Text className="text-xs text-charcoal/60">{post.time}</Text>
                  </View>
                </Pressable>

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
            );
          })}
          {q.length > 0 && filteredPosts.length === 0 && (
            <Pressable
              onPress={() => router.push('/discover')}
              className="flex-row items-center justify-center gap-1.5 rounded-2xl bg-cream p-4"
            >
              <Ionicons name="compass-outline" size={16} color="#E0533C" />
              <Text className="text-sm font-medium text-terracotta">
                Search people & groups in Discover
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
