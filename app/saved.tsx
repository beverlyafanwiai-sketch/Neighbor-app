import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import MentionText from '../components/MentionText';
import { DISCOVER_USERS, ME, USERS } from '../data/mock';
import {
  getEffectiveReactions,
  getEffectiveReplies,
  getReactionTotal,
  getTopReactionTypes,
  REACTION_EMOJI,
  usePostsStore,
} from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';

const ALL_PEOPLE = [...USERS, ...DISCOVER_USERS];

export default function SavedPosts() {
  const profile = useProfileStore((s) => s.profile);
  const posts = usePostsStore((s) => s.posts);
  const savedIds = usePostsStore((s) => s.savedIds);
  const myReactions = usePostsStore((s) => s.myReactions);
  const comments = usePostsStore((s) => s.comments);
  const toggleSave = usePostsStore((s) => s.toggleSave);

  const savedPosts = posts.filter((p) => savedIds[p.id] ?? false);

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} color="#3D3D3D" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Saved posts</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8 pt-2">
        {savedPosts.length === 0 && (
          <EmptyState
            icon="bookmark-outline"
            iconColor="#3D3D3D80"
            title="Nothing saved yet"
            subtitle="Tap the bookmark on any post to save it for later."
          />
        )}

        <View className="gap-4">
          {savedPosts.map((post) => {
            const author = post.authorId === ME.id ? profile : ALL_PEOPLE.find((u) => u.id === post.authorId);
            if (!author) return null;
            const reactionCounts = getEffectiveReactions(post, myReactions[post.id]);
            const topTypes = getTopReactionTypes(reactionCounts, 2);
            const postComments = comments[post.id] ?? [];
            return (
              <Pressable
                key={post.id}
                onPress={() => router.push(`/post/${post.id}`)}
                className="rounded-3xl bg-cream p-4 shadow-sm active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <Image source={{ uri: author.avatar }} className="h-11 w-11 rounded-full" />
                  <View>
                    <Text className="font-semibold text-charcoal">{author.name}</Text>
                    <Text className="text-xs text-charcoal/60">
                      {post.time}
                      {post.edited && ' · edited'}
                    </Text>
                  </View>
                </View>

                <MentionText text={post.body} className="mt-3 text-[15px] leading-5 text-charcoal" />
                {post.imageUri && (
                  <Image
                    source={{ uri: post.imageUri }}
                    className="mt-3 w-full rounded-2xl"
                    style={{ aspectRatio: 4 / 3 }}
                  />
                )}

                <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <View className="flex-row items-center gap-6">
                    <View className="flex-row items-center gap-1.5">
                      {topTypes.length > 0 ? (
                        <Text style={{ fontSize: 14 }}>
                          {topTypes.map((t) => REACTION_EMOJI[t]).join('')}
                        </Text>
                      ) : (
                        <Ionicons name="heart-outline" size={18} color="#E0533C" />
                      )}
                      <Text className="text-sm text-charcoal/70">{getReactionTotal(reactionCounts)}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="chatbubble-outline" size={17} color="#81A684" />
                      <Text className="text-sm text-charcoal/70">
                        {getEffectiveReplies(post, postComments)}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      toggleSave(post.id);
                    }}
                  >
                    <Ionicons name="bookmark" size={18} color="#D9A441" />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
