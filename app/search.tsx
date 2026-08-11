import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import MentionText from '../components/MentionText';
import { DISCOVER_USERS, ME, USERS, type Tone } from '../data/mock';
import { useBlockedStore } from '../store/useBlockedStore';
import { useEventsStore } from '../store/useEventsStore';
import { useFriendsStore } from '../store/useFriendsStore';
import { memberCountLabel, useGroupsStore } from '../store/useGroupsStore';
import { getEffectiveLoves, getEffectiveReplies, usePostsStore } from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';

const ALL_PEOPLE = [...USERS, ...DISCOVER_USERS];

const TONE_STYLE: Record<Tone, { bg: string; text: string }> = {
  Casual: { bg: 'bg-sage/20', text: 'text-sage' },
  Structured: { bg: 'bg-terracotta/15', text: 'text-terracotta' },
  'Activity-focused': { bg: 'bg-gold/20', text: 'text-gold' },
};

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function Search() {
  const { q: initialQ } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(initialQ ?? '');

  const profile = useProfileStore((s) => s.profile);
  const posts = usePostsStore((s) => s.posts);
  const likedByMe = usePostsStore((s) => s.likedByMe);
  const comments = usePostsStore((s) => s.comments);

  const friendIds = useFriendsStore((s) => s.friendIds);
  const toggleFriend = useFriendsStore((s) => s.toggle);
  const blockedIds = useBlockedStore((s) => s.blockedIds);

  const groups = useGroupsStore((s) => s.groups);
  const joinedMap = useGroupsStore((s) => s.joined);
  const toggleJoin = useGroupsStore((s) => s.toggle);

  const events = useEventsStore((s) => s.events);

  const q = query.trim().toLowerCase();

  const matchedPosts =
    q.length === 0
      ? []
      : posts.filter((p) => {
          if (blockedIds[p.authorId]) return false;
          const author = p.authorId === ME.id ? profile : ALL_PEOPLE.find((u) => u.id === p.authorId);
          return (
            p.body.toLowerCase().includes(q) || (author?.name.toLowerCase().includes(q) ?? false)
          );
        });

  const matchedPeople =
    q.length === 0
      ? []
      : ALL_PEOPLE.filter(
          (u) =>
            !blockedIds[u.id] &&
            (u.name.toLowerCase().includes(q) || u.tags.some((t) => t.toLowerCase().includes(q)))
        );

  const matchedGroups =
    q.length === 0
      ? []
      : groups.filter(
          (g) => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
        );

  const matchedEvents =
    q.length === 0
      ? []
      : events.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
        );

  const hasAnyResults =
    matchedPosts.length + matchedPeople.length + matchedGroups.length + matchedEvents.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} color="#3D3D3D" />
        </Pressable>
        <View className="flex-1 flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} color="#3D3D3D80" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search posts, people, groups, events..."
            placeholderTextColor="#3D3D3D80"
            autoFocus
            className="ml-2 flex-1 text-charcoal"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#3D3D3D80" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        {q.length === 0 && (
          <View className="mt-16 items-center px-6">
            <Ionicons name="search-outline" size={32} color="#3D3D3D40" />
            <Text className="mt-3 text-center text-sm text-charcoal/50">
              Search across posts, people, groups, and events all at once.
            </Text>
          </View>
        )}

        {q.length > 0 && !hasAnyResults && (
          <Text className="mt-16 text-center text-sm text-charcoal/50">
            No results for "{query.trim()}"
          </Text>
        )}

        {matchedPeople.length > 0 && (
          <>
            <SectionLabel>People</SectionLabel>
            <View className="gap-3">
              {matchedPeople.map((p) => {
                const isFriend = friendIds[p.id] ?? false;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/profile/${p.id}`)}
                    className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                  >
                    <Image source={{ uri: p.avatar }} className="h-11 w-11 rounded-full" />
                    <View className="flex-1">
                      <Text className="font-semibold text-charcoal">{p.name}</Text>
                      <Text className="text-xs text-charcoal/60" numberOfLines={1}>
                        {p.tagline}
                      </Text>
                    </View>
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        toggleFriend(p.id);
                      }}
                      className={`rounded-full px-4 py-2 ${isFriend ? 'bg-sand' : 'bg-gold'}`}
                    >
                      <Text className="text-xs font-semibold text-charcoal">
                        {isFriend ? 'Friends' : 'Add friend'}
                      </Text>
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {matchedGroups.length > 0 && (
          <>
            <SectionLabel>Groups</SectionLabel>
            <View className="gap-3">
              {matchedGroups.map((g) => {
                const joined = joinedMap[g.id] ?? false;
                const toneStyle = TONE_STYLE[g.tone] ?? TONE_STYLE.Casual;
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => router.push(`/group/${g.id}`)}
                    className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-terracotta">
                      <Text className="text-base font-bold text-cream">{g.name.charAt(0)}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-charcoal">{g.name}</Text>
                      <View className="mt-1 flex-row items-center gap-2">
                        <Text className="text-xs text-charcoal/60">
                          {memberCountLabel(g.id, joined)}
                        </Text>
                        <View className={`rounded-full px-2 py-0.5 ${toneStyle.bg}`}>
                          <Text className={`text-[11px] font-semibold ${toneStyle.text}`}>
                            {g.tone}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {joined ? (
                      <Ionicons name="chevron-forward" size={16} color="#3D3D3D80" />
                    ) : (
                      <Pressable
                        onPress={(evt) => {
                          evt.stopPropagation();
                          toggleJoin(g.id);
                        }}
                        className="rounded-full bg-charcoal px-4 py-2"
                      >
                        <Text className="text-xs font-semibold text-cream">Join</Text>
                      </Pressable>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {matchedEvents.length > 0 && (
          <>
            <SectionLabel>Events</SectionLabel>
            <View className="gap-3">
              {matchedEvents.map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => router.push(`/event/${e.id}`)}
                  className="flex-row gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  <View className="h-12 w-12 items-center justify-center rounded-xl bg-terracotta">
                    <Text className="text-[10px] font-semibold text-cream">{e.month}</Text>
                    <Text className="text-lg font-bold text-cream">{e.day}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-charcoal">{e.title}</Text>
                    <Text className="mt-0.5 text-xs text-charcoal/60">
                      {e.time} · {e.location}
                    </Text>
                  </View>
                  {e.status === 'past' && (
                    <Text className="self-center text-xs text-charcoal/40">Past</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </>
        )}

        {matchedPosts.length > 0 && (
          <>
            <SectionLabel>Posts</SectionLabel>
            <View className="gap-3">
              {matchedPosts.map((post) => {
                const author =
                  post.authorId === ME.id ? profile : ALL_PEOPLE.find((u) => u.id === post.authorId);
                if (!author) return null;
                const liked = likedByMe[post.id] ?? false;
                const postComments = comments[post.id] ?? [];
                return (
                  <Pressable
                    key={post.id}
                    onPress={() => router.push(`/post/${post.id}`)}
                    className="rounded-2xl bg-cream p-4 active:opacity-80"
                  >
                    <View className="flex-row items-center gap-2.5">
                      <Image source={{ uri: author.avatar }} className="h-8 w-8 rounded-full" />
                      <Text className="text-sm font-semibold text-charcoal">{author.name}</Text>
                      <Text className="text-xs text-charcoal/40">
                        {post.time}
                        {post.edited && ' · edited'}
                      </Text>
                    </View>
                    <MentionText
                      text={post.body}
                      className="mt-2 text-sm leading-5 text-charcoal/80"
                      numberOfLines={2}
                    />
                    <View className="mt-3 flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={14} color="#E0533C" />
                        <Text className="text-xs text-charcoal/50">
                          {getEffectiveLoves(post, liked)}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="chatbubble-outline" size={13} color="#81A684" />
                        <Text className="text-xs text-charcoal/50">
                          {getEffectiveReplies(post, postComments)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
