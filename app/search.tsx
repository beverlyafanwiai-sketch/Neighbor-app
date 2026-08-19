import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import MentionText from '../components/MentionText';
import { DISCOVER_USERS, ME, USERS, getUser, type Tone } from '../data/mock';
import { useBlockedStore } from '../store/useBlockedStore';
import { useConversationsStore } from '../store/useConversationsStore';
import { useEventsStore } from '../store/useEventsStore';
import { FRIEND_LABEL, useFriendsStore } from '../store/useFriendsStore';
import { useGroupChatStore } from '../store/useGroupChatStore';
import { memberCountLabel, useGroupsStore } from '../store/useGroupsStore';
import { useLendStore } from '../store/useLendStore';
import {
  getEffectiveReactions,
  getEffectiveReplies,
  getReactionTotal,
  getTopReactionTypes,
  REACTION_EMOJI,
  usePostsStore,
} from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';
import { useRecentSearchesStore } from '../store/useRecentSearchesStore';
import { useRecsStore } from '../store/useRecsStore';
import { useSaleStore } from '../store/useSaleStore';

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
  const recentSearches = useRecentSearchesStore((s) => s.queries);
  const addRecentSearch = useRecentSearchesStore((s) => s.addSearch);
  const removeRecentSearch = useRecentSearchesStore((s) => s.removeSearch);
  const clearRecentSearches = useRecentSearchesStore((s) => s.clear);

  const profile = useProfileStore((s) => s.profile);
  const posts = usePostsStore((s) => s.posts);
  const myReactions = usePostsStore((s) => s.myReactions);
  const comments = usePostsStore((s) => s.comments);

  const friendStatuses = useFriendsStore((s) => s.statuses);
  const respondFriend = useFriendsStore((s) => s.respond);
  const blockedIds = useBlockedStore((s) => s.blockedIds);

  const groups = useGroupsStore((s) => s.groups);
  const joinedMap = useGroupsStore((s) => s.joined);
  const toggleJoin = useGroupsStore((s) => s.toggle);

  const events = useEventsStore((s) => s.events);

  const conversations = useConversationsStore((s) => s.conversations);
  const groupMessages = useGroupChatStore((s) => s.messages);

  const recEntries = useRecsStore((s) => s.entries);
  const lendItems = useLendStore((s) => s.items);
  const saleItems = useSaleStore((s) => s.items);
  const soldMap = useSaleStore((s) => s.sold);

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
          (g) =>
            (g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)) &&
            (g.privacy !== 'private' || (joinedMap[g.id] ?? false))
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

  type MessageMatch = {
    key: string;
    kind: 'dm' | 'group';
    threadId: string;
    threadName: string;
    threadAvatar?: string;
    senderName: string;
    text: string;
    time: string;
  };

  const matchedDmMessages: MessageMatch[] =
    q.length === 0
      ? []
      : Object.values(conversations).flatMap((c) => {
          if (blockedIds[c.userId]) return [];
          const other = getUser(c.userId);
          if (!other) return [];
          return c.messages
            .filter((m) => !m.deleted && m.text.toLowerCase().includes(q))
            .map((m) => ({
              key: `dm-${c.id}-${m.id}`,
              kind: 'dm' as const,
              threadId: c.id,
              threadName: other.name,
              threadAvatar: other.avatar,
              senderName: m.from === 'me' ? 'You' : other.name,
              text: m.text,
              time: m.time,
            }));
        });

  const matchedGroupMessages: MessageMatch[] =
    q.length === 0
      ? []
      : groups
          .filter((g) => joinedMap[g.id])
          .flatMap((g) =>
            (groupMessages[g.id] ?? [])
              .filter((m) => !m.deleted && m.text.toLowerCase().includes(q))
              .map((m) => ({
                key: `group-${g.id}-${m.id}`,
                kind: 'group' as const,
                threadId: g.id,
                threadName: g.name,
                senderName: m.senderId === ME.id ? 'You' : (getUser(m.senderId)?.name ?? 'Someone'),
                text: m.text,
                time: m.time,
              }))
          );

  const matchedMessages = [...matchedDmMessages, ...matchedGroupMessages];

  const matchedRecs =
    q.length === 0
      ? []
      : recEntries.filter(
          (e) =>
            e.category.toLowerCase().includes(q) ||
            (e.name ?? '').toLowerCase().includes(q) ||
            e.note.toLowerCase().includes(q)
        );

  const matchedLendItems =
    q.length === 0
      ? []
      : lendItems.filter(
          (i) => i.title.toLowerCase().includes(q) || i.note.toLowerCase().includes(q)
        );

  const matchedSaleItems =
    q.length === 0
      ? []
      : saleItems.filter(
          (i) => i.title.toLowerCase().includes(q) || i.note.toLowerCase().includes(q)
        );

  const hasAnyResults =
    matchedPosts.length +
      matchedPeople.length +
      matchedGroups.length +
      matchedEvents.length +
      matchedMessages.length +
      matchedRecs.length +
      matchedLendItems.length +
      matchedSaleItems.length >
    0;

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
        <View className="flex-1 flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} className="text-charcoal/50" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => addRecentSearch(query)}
            onBlur={() => addRecentSearch(query)}
            placeholder="Search posts, people, groups, events, messages..."
            placeholderTextColor="#3D3D3D80"
            returnKeyType="search"
            autoFocus
            className="ml-2 flex-1 text-charcoal"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={18} className="text-charcoal/50" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        {q.length === 0 && recentSearches.length > 0 && (
          <View className="mt-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Recent searches
              </Text>
              <Pressable onPress={clearRecentSearches}>
                <Text className="text-xs font-medium text-charcoal/50">Clear</Text>
              </Pressable>
            </View>
            <View className="mt-3 gap-2">
              {recentSearches.map((rq) => (
                <Pressable
                  key={rq}
                  onPress={() => setQuery(rq)}
                  className="flex-row items-center gap-3 rounded-2xl bg-cream p-3.5 active:opacity-80"
                >
                  <Ionicons name="time-outline" size={16} className="text-charcoal/40" />
                  <Text className="flex-1 text-sm text-charcoal" numberOfLines={1}>
                    {rq}
                  </Text>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      removeRecentSearch(rq);
                    }}
                    accessibilityLabel={`Remove "${rq}" from recent searches`}
                    accessibilityRole="button"
                    className="h-6 w-6 items-center justify-center"
                  >
                    <Ionicons name="close" size={14} className="text-charcoal/40" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {q.length === 0 && recentSearches.length === 0 && (
          <EmptyState
            icon="search-outline"
            iconColorClassName="text-charcoal/50"
            title="Search your neighborhood"
            subtitle="Find posts, people, groups, events, and messages all at once."
          />
        )}

        {q.length > 0 && !hasAnyResults && (
          <EmptyState
            icon="search-outline"
            title={`No results for "${query.trim()}"`}
            subtitle="Try a different word or a shorter search."
          />
        )}

        {matchedPeople.length > 0 && (
          <>
            <SectionLabel>People</SectionLabel>
            <View className="gap-3">
              {matchedPeople.map((p) => {
                const status = friendStatuses[p.id] ?? 'none';
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
                        respondFriend(p.id);
                      }}
                      className={`rounded-full px-4 py-2 ${status === 'none' ? 'bg-gold' : 'bg-sand'}`}
                    >
                      <Text className="text-xs font-semibold text-charcoal">
                        {FRIEND_LABEL[status]}
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
                      <Text className="text-base font-bold text-paper">{g.name.charAt(0)}</Text>
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
                      <Ionicons name="chevron-forward" size={16} className="text-charcoal/50" />
                    ) : (
                      <Pressable
                        onPress={(evt) => {
                          evt.stopPropagation();
                          toggleJoin(g.id);
                        }}
                        className="rounded-full bg-ink px-4 py-2"
                      >
                        <Text className="text-xs font-semibold text-paper">Join</Text>
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
                    <Text className="text-[10px] font-semibold text-paper">{e.month}</Text>
                    <Text className="text-lg font-bold text-paper">{e.day}</Text>
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

        {matchedMessages.length > 0 && (
          <>
            <SectionLabel>Messages</SectionLabel>
            <View className="gap-3">
              {matchedMessages.map((m) => (
                <Pressable
                  key={m.key}
                  onPress={() =>
                    router.push(m.kind === 'dm' ? `/chat/${m.threadId}` : `/group-chat/${m.threadId}`)
                  }
                  className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  {m.kind === 'dm' && m.threadAvatar ? (
                    <Image source={{ uri: m.threadAvatar }} className="h-11 w-11 rounded-full" />
                  ) : (
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-terracotta">
                      <Text className="text-base font-bold text-paper">{m.threadName.charAt(0)}</Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-sm font-semibold text-charcoal">{m.threadName}</Text>
                      <Text className="text-xs text-charcoal/40">· {m.senderName}</Text>
                    </View>
                    <Text className="mt-0.5 text-sm text-charcoal/70" numberOfLines={1}>
                      {m.text}
                    </Text>
                  </View>
                  <Text className="text-xs text-charcoal/40">{m.time}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {matchedRecs.length > 0 && (
          <>
            <SectionLabel>Neighborhood Recs</SectionLabel>
            <View className="gap-3">
              {matchedRecs.map((entry) => {
                const author = getUser(entry.authorId);
                const isRec = entry.kind === 'rec';
                return (
                  <Pressable
                    key={entry.id}
                    onPress={() => router.push('/recs')}
                    className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                      <Text style={{ fontSize: 20 }}>{entry.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-charcoal">
                        {isRec ? (entry.name ?? entry.category) : entry.category}
                      </Text>
                      <Text className="text-xs text-charcoal/50" numberOfLines={1}>
                        {isRec
                          ? `Recommended by ${author?.name ?? entry.category}`
                          : `${author?.name ?? 'Someone'} is looking · ${entry.note}`}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {matchedLendItems.length > 0 && (
          <>
            <SectionLabel>Borrow & Lend</SectionLabel>
            <View className="gap-3">
              {matchedLendItems.map((item) => {
                const owner = getUser(item.ownerId);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push('/lend')}
                    className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                      <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-charcoal">{item.title}</Text>
                      <Text className="text-xs text-charcoal/50" numberOfLines={1}>
                        {item.kind === 'have'
                          ? `${owner?.name ?? 'Someone'} has this to lend`
                          : `${owner?.name ?? 'Someone'} is looking to borrow`}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {matchedSaleItems.length > 0 && (
          <>
            <SectionLabel>For Sale</SectionLabel>
            <View className="gap-3">
              {matchedSaleItems.map((item) => {
                const owner = getUser(item.ownerId);
                const isSold = soldMap[item.id] ?? false;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push('/for-sale')}
                    className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                      <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="font-semibold text-charcoal">{item.title}</Text>
                        {isSold && (
                          <View className="rounded-full bg-charcoal/10 px-2 py-0.5">
                            <Text className="text-[10px] font-bold text-charcoal/60">SOLD</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-charcoal/50" numberOfLines={1}>
                        {item.price} · {owner?.name ?? 'Someone'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
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
                const reactionCounts = getEffectiveReactions(post.reactions, myReactions[post.id]);
                const topTypes = getTopReactionTypes(reactionCounts, 2);
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
                        {topTypes.length > 0 ? (
                          <Text style={{ fontSize: 12 }}>
                            {topTypes.map((t) => REACTION_EMOJI[t]).join('')}
                          </Text>
                        ) : (
                          <Ionicons name="heart-outline" size={14} className="text-terracotta" />
                        )}
                        <Text className="text-xs text-charcoal/50">
                          {getReactionTotal(reactionCounts)}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="chatbubble-outline" size={13} className="text-sage" />
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
