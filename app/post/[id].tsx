import { useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ME, getUser, type CommentItem } from '../../data/mock';
import { getEffectiveLoves, getEffectiveReplies, usePostsStore } from '../../store/usePostsStore';
import { useProfileStore } from '../../store/useProfileStore';

const EMPTY_COMMENTS: CommentItem[] = [];

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = usePostsStore((s) => s.posts.find((p) => p.id === id));
  const liked = usePostsStore((s) => (post ? (s.likedByMe[post.id] ?? false) : false));
  const toggleLike = usePostsStore((s) => s.toggleLike);
  const comments = usePostsStore((s) => (post ? (s.comments[post.id] ?? EMPTY_COMMENTS) : EMPTY_COMMENTS));
  const addComment = usePostsStore((s) => s.addComment);
  const profile = useProfileStore((s) => s.profile);

  const [draft, setDraft] = useState('');

  const resolveUser = (userId: string) => (userId === ME.id ? profile : getUser(userId));
  const author = post ? resolveUser(post.authorId) : undefined;

  if (!post || !author) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="text-charcoal">Post not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-terracotta">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const send = () => {
    if (!draft.trim()) return;
    addComment(post.id, draft.trim());
    setDraft('');
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 border-b border-charcoal/10 bg-cream px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={22} color="#3D3D3D" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Post</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          contentContainerClassName="pb-4"
          ListHeaderComponent={
            <View className="gap-3 border-b border-charcoal/10 bg-cream p-4">
              <Pressable
                onPress={() => router.push(`/profile/${author.id}`)}
                className="flex-row items-center gap-3"
              >
                <Image source={{ uri: author.avatar }} className="h-11 w-11 rounded-full" />
                <View>
                  <Text className="font-semibold text-charcoal">{author.name}</Text>
                  <Text className="text-xs text-charcoal/60">{post.time}</Text>
                </View>
              </Pressable>

              <Text className="text-[15px] leading-5 text-charcoal">{post.body}</Text>

              <View className="flex-row items-center gap-6 border-t border-charcoal/10 pt-3">
                <Pressable
                  onPress={() => toggleLike(post.id)}
                  className="flex-row items-center gap-1.5"
                >
                  <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color="#E0533C" />
                  <Text className={`text-sm ${liked ? 'font-semibold text-terracotta' : 'text-charcoal/70'}`}>
                    {getEffectiveLoves(post, liked)}
                  </Text>
                </Pressable>
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="chatbubble-outline" size={17} color="#81A684" />
                  <Text className="text-sm text-charcoal/70">
                    {getEffectiveReplies(post, comments)}
                  </Text>
                </View>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const commenter = resolveUser(item.authorId);
            if (!commenter) return null;
            return (
              <Pressable
                onPress={() => router.push(`/profile/${commenter.id}`)}
                className="flex-row items-start gap-2.5 px-4 py-3"
              >
                <Image source={{ uri: commenter.avatar }} className="h-9 w-9 rounded-full" />
                <View className="flex-1">
                  <View className="flex-row items-baseline gap-2">
                    <Text className="text-sm font-semibold text-charcoal">{commenter.name}</Text>
                    <Text className="text-[11px] text-charcoal/40">{item.time}</Text>
                  </View>
                  <Text className="mt-0.5 text-sm leading-5 text-charcoal/80">{item.text}</Text>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text className="px-4 py-6 text-center text-sm text-charcoal/50">
              No comments yet. Be the first to reply.
            </Text>
          }
        />

        <View className="flex-row items-center gap-2 border-t border-charcoal/10 bg-cream px-3 py-2.5">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a comment..."
            placeholderTextColor="#3D3D3D80"
            className="flex-1 rounded-full bg-sand px-4 py-2.5 text-charcoal"
            multiline
          />
          <Pressable
            onPress={send}
            className="h-10 w-10 items-center justify-center rounded-full bg-terracotta"
          >
            <Ionicons name="arrow-up" size={20} color="#F5F2E9" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
