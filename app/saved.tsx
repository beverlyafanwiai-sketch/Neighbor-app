import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import MentionText from '../components/MentionText';
import { DISCOVER_USERS, ME, USERS } from '../data/mock';
import { getEffectiveCheckedInIds, useCheckInStore } from '../store/useCheckInStore';
import { useEventsStore } from '../store/useEventsStore';
import {
  getEffectiveReactions,
  getEffectiveReplies,
  getReactionTotal,
  getTopReactionTypes,
  REACTION_EMOJI,
  usePostsStore,
} from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';
import { getEffectiveSpots, useRsvpStore } from '../store/useRsvpStore';
import { useSavedEventsStore } from '../store/useSavedEventsStore';

const ALL_PEOPLE = [...USERS, ...DISCOVER_USERS];
const MODES = ['Posts', 'Events'] as const;
type Mode = (typeof MODES)[number];

export default function Saved() {
  const [mode, setMode] = useState<Mode>('Posts');
  const profile = useProfileStore((s) => s.profile);
  const posts = usePostsStore((s) => s.posts);
  const savedIds = usePostsStore((s) => s.savedIds);
  const myReactions = usePostsStore((s) => s.myReactions);
  const comments = usePostsStore((s) => s.comments);
  const toggleSave = usePostsStore((s) => s.toggleSave);

  const events = useEventsStore((s) => s.events);
  const savedEventIds = useSavedEventsStore((s) => s.savedIds);
  const toggleSaveEvent = useSavedEventsStore((s) => s.toggleSave);
  const goingMap = useRsvpStore((s) => s.going);
  const myCheckIns = useCheckInStore((s) => s.myCheckIns);

  const savedPosts = posts.filter((p) => savedIds[p.id] ?? false);
  const savedEvents = events.filter((e) => savedEventIds[e.id] ?? false);

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Saved</Text>
      </View>

      <View className="flex-row gap-2 px-5 pb-3">
        {MODES.map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            className={`rounded-full px-4 py-2 ${mode === m ? 'bg-ink' : 'bg-cream'}`}
          >
            <Text className={`text-sm font-medium ${mode === m ? 'text-paper' : 'text-charcoal/60'}`}>
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8 pt-2">
        {mode === 'Posts' && savedPosts.length === 0 && (
          <EmptyState
            icon="bookmark-outline"
            iconColorClassName="text-charcoal/50"
            title="Nothing saved yet"
            subtitle="Tap the bookmark on any post to save it for later."
          />
        )}

        {mode === 'Events' && savedEvents.length === 0 && (
          <EmptyState
            icon="bookmark-outline"
            iconColorClassName="text-charcoal/50"
            title="No saved events"
            subtitle="Tap the bookmark on any event to save it for later."
          />
        )}

        {mode === 'Posts' && (
        <View className="gap-4">
          {savedPosts.map((post) => {
            const author = post.authorId === ME.id ? profile : ALL_PEOPLE.find((u) => u.id === post.authorId);
            if (!author) return null;
            const reactionCounts = getEffectiveReactions(post.reactions, myReactions[post.id]);
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
                {post.imageUris && post.imageUris.length > 0 && (
                  <View className="mt-3">
                    <Image
                      source={{ uri: post.imageUris[0] }}
                      className="w-full rounded-2xl"
                      style={{ aspectRatio: 4 / 3 }}
                    />
                    {post.imageUris.length > 1 && (
                      <View className="absolute right-2 top-2 flex-row items-center gap-1 rounded-full bg-ink/60 px-2 py-1">
                        <Ionicons name="images" size={11} className="text-paper" />
                        <Text className="text-[10px] font-semibold text-paper">
                          {post.imageUris.length}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <View className="flex-row items-center gap-6">
                    <View className="flex-row items-center gap-1.5">
                      {topTypes.length > 0 ? (
                        <Text style={{ fontSize: 14 }}>
                          {topTypes.map((t) => REACTION_EMOJI[t]).join('')}
                        </Text>
                      ) : (
                        <Ionicons name="heart-outline" size={18} className="text-terracotta" />
                      )}
                      <Text className="text-sm text-charcoal/70">{getReactionTotal(reactionCounts)}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="chatbubble-outline" size={17} className="text-sage" />
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
                    <Ionicons name="bookmark" size={18} className="text-gold" />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>
        )}

        {mode === 'Events' && (
          <View className="gap-3">
            {savedEvents.map((e) => {
              const going = goingMap[e.id] ?? false;
              const isHost = e.hostId === ME.id;
              const { spotsTaken, spotsTotal } = getEffectiveSpots(e.id, going);
              const checkedInCount = getEffectiveCheckedInIds(e, myCheckIns[e.id] ?? false).length;
              return (
                <Pressable
                  key={e.id}
                  onPress={() => router.push(`/event/${e.id}`)}
                  className="flex-row gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  <View className="h-14 w-14 items-center justify-center rounded-xl bg-terracotta">
                    <Text className="text-xs font-semibold text-paper">{e.month}</Text>
                    <Text className="text-xl font-bold text-paper">{e.day}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="flex-1 font-semibold text-charcoal" numberOfLines={1}>
                        {e.title}
                      </Text>
                      <Pressable
                        onPress={(evt) => {
                          evt.stopPropagation();
                          toggleSaveEvent(e.id);
                        }}
                        className="h-6 w-6 items-center justify-center"
                      >
                        <Ionicons name="bookmark" size={15} className="text-gold" />
                      </Pressable>
                    </View>
                    <Text className="mt-0.5 text-xs text-charcoal/60">
                      {e.time} · {e.location}
                    </Text>
                    <Text className="mt-0.5 text-xs text-sage">
                      {e.status === 'past'
                        ? `${checkedInCount} were there`
                        : `${spotsTaken}/${spotsTotal} spots${going ? ' · Going' : isHost ? ' · Hosting' : ''}`}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
