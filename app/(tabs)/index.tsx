import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { COFFEE_FRIENDS_SVG } from '../../assets/illustrations/coffee-friends';
import MentionText from '../../components/MentionText';
import ShareSheet from '../../components/ShareSheet';
import { ME, USERS, type Post } from '../../data/mock';
import { useBlockedStore } from '../../store/useBlockedStore';
import { useNotificationsStore } from '../../store/useNotificationsStore';
import { getEffectiveLoves, getEffectiveReplies, usePostsStore } from '../../store/usePostsStore';
import { useProfileStore } from '../../store/useProfileStore';

function goToProfile(userId: string) {
  if (userId === ME.id) {
    router.push('/(tabs)/profile');
  } else {
    router.push(`/profile/${userId}`);
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return { text: 'Still up?', emoji: '🌙' };
  if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
  if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  if (hour < 21) return { text: 'Good evening', emoji: '🌆' };
  return { text: 'Good evening', emoji: '🌙' };
}

export default function HomeFeed() {
  const profile = useProfileStore((s) => s.profile);
  const stories = [{ ...profile, isYou: true }, ...USERS];
  const [query, setQuery] = useState('');
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length);
  const posts = usePostsStore((s) => s.posts);
  const likedByMe = usePostsStore((s) => s.likedByMe);
  const toggleLike = usePostsStore((s) => s.toggleLike);
  const savedIds = usePostsStore((s) => s.savedIds);
  const toggleSave = usePostsStore((s) => s.toggleSave);
  const comments = usePostsStore((s) => s.comments);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const blockedIds = useBlockedStore((s) => s.blockedIds);

  const greeting = getGreeting();
  const firstName = profile.name.split(' ')[0];

  const postsWithAuthor = posts
    .filter((post) => !blockedIds[post.authorId])
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
      <LinearGradient
        colors={['#E0533C', '#D9A441']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' }}
      >
        <View className="px-5 pb-5 pt-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-2xl font-bold text-cream">
                {greeting.text}, {firstName} {greeting.emoji}
              </Text>
              <Text className="mt-1 text-sm text-sand">Your neighborhood is glad you're here.</Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => router.push('/discover')}
                className="h-10 w-10 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="compass-outline" size={19} color="#F5F2E9" />
              </Pressable>
              <Pressable
                onPress={() => router.push('/notifications')}
                className="h-10 w-10 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="notifications-outline" size={19} color="#F5F2E9" />
                {unreadCount > 0 && (
                  <View className="absolute -right-0.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1">
                    <Text className="text-[10px] font-bold text-charcoal">{unreadCount}</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          <View className="mt-4 flex-row items-center rounded-full bg-cream px-4 py-2.5">
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
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!q && (
          <>
            <Pressable
              onPress={() => router.push('/create-post')}
              className="mx-5 mt-4 flex-row items-center gap-3 rounded-2xl bg-cream p-3.5 active:opacity-80"
            >
              <Image source={{ uri: profile.avatar }} className="h-9 w-9 rounded-full border-2 border-sand" />
              <Text className="flex-1 text-sm text-charcoal/50">
                Share something with your neighbors, big or small...
              </Text>
            </Pressable>

            <View className="mx-5 mt-3 flex-row items-center overflow-hidden rounded-3xl bg-cream">
              <View className="flex-1 py-4 pl-5 pr-2">
                <Text className="text-xs font-semibold uppercase tracking-wide text-sage">
                  A little nudge
                </Text>
                <Text className="mt-1 text-[15px] font-medium leading-5 text-charcoal">
                  Grab coffee with someone in your circle — no big plans needed.
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
          <View className="flex-row items-center justify-between px-5 pt-3">
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              {filteredPosts.length === 0
                ? `No posts matching "${query.trim()}"`
                : `Results for "${query.trim()}"`}
            </Text>
            {filteredPosts.length > 0 && (
              <Pressable onPress={() => router.push(`/search?q=${encodeURIComponent(query.trim())}`)}>
                <Text className="text-xs font-semibold text-terracotta">See full results →</Text>
              </Pressable>
            )}
          </View>
        )}

        <View className="gap-5 px-5 pb-8 pt-3">
          {filteredPosts.map(({ post, author }) => {
            const liked = likedByMe[post.id] ?? false;
            const saved = savedIds[post.id] ?? false;
            const postComments = comments[post.id] ?? [];
            return (
              <View key={post.id} className="rounded-[28px] bg-cream p-5 shadow-sm">
                <Pressable
                  onPress={() => goToProfile(author.id)}
                  className="flex-row items-center gap-3"
                >
                  <Image
                    source={{ uri: author.avatar }}
                    className="h-11 w-11 rounded-full border-2 border-sand"
                  />
                  <View>
                    <Text className="font-semibold text-charcoal">{author.name}</Text>
                    <Text className="text-xs text-charcoal/60">
                      {post.time}
                      {post.edited && ' · edited'}
                    </Text>
                  </View>
                </Pressable>

                <Pressable onPress={() => router.push(`/post/${post.id}`)}>
                  <MentionText text={post.body} className="mt-3 text-[15px] leading-5 text-charcoal" />
                  {post.imageUri && (
                    <Image
                      source={{ uri: post.imageUri }}
                      className="mt-3 w-full rounded-2xl"
                      style={{ aspectRatio: 4 / 3 }}
                    />
                  )}
                </Pressable>

                <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <View className="flex-row items-center gap-6">
                    <Pressable
                      onPress={() => toggleLike(post.id)}
                      className="flex-row items-center gap-1.5"
                    >
                      <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color="#E0533C" />
                      <Text className={`text-sm ${liked ? 'font-semibold text-terracotta' : 'text-charcoal/70'}`}>
                        {getEffectiveLoves(post, liked)}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.push(`/post/${post.id}`)}
                      className="flex-row items-center gap-1.5"
                    >
                      <Ionicons name="chatbubble-outline" size={17} color="#81A684" />
                      <Text className="text-sm text-charcoal/70">
                        {getEffectiveReplies(post, postComments)}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setSharingPost(post)}
                      className="flex-row items-center gap-1.5"
                    >
                      <Ionicons name="arrow-redo-outline" size={18} color="#3D3D3D80" />
                      <Text className="text-sm text-charcoal/70">Share</Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => toggleSave(post.id)}>
                    <Ionicons
                      name={saved ? 'bookmark' : 'bookmark-outline'}
                      size={18}
                      color={saved ? '#D9A441' : '#3D3D3D80'}
                    />
                  </Pressable>
                </View>
              </View>
            );
          })}
          {q.length > 0 && filteredPosts.length === 0 && (
            <Pressable
              onPress={() => router.push(`/search?q=${encodeURIComponent(query.trim())}`)}
              className="flex-row items-center justify-center gap-1.5 rounded-2xl bg-cream p-4"
            >
              <Ionicons name="search-outline" size={16} color="#E0533C" />
              <Text className="text-sm font-medium text-terracotta">
                Search people, groups & events too
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {sharingPost && (
        <ShareSheet
          postId={sharingPost.id}
          postBody={sharingPost.body}
          onClose={() => setSharingPost(null)}
        />
      )}
    </SafeAreaView>
  );
}
