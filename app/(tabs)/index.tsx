import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { COFFEE_FRIENDS_SVG } from '../../assets/illustrations/coffee-friends';
import { PARK_FRIENDS_SVG } from '../../assets/illustrations/park-friends';
import BackgroundSlideshow from '../../components/BackgroundSlideshow';
import EmptyState from '../../components/EmptyState';
import MentionText from '../../components/MentionText';
import PhotoCarousel from '../../components/PhotoCarousel';
import PollView from '../../components/PollView';
import ReactionButton from '../../components/ReactionButton';
import ReactorsSheet from '../../components/ReactorsSheet';
import ReportPostSheet from '../../components/ReportPostSheet';
import ShareSheet from '../../components/ShareSheet';
import { DISCOVER_USERS, ME, USERS, type Post, type User } from '../../data/mock';
import { isAvailable, useAvailabilityStore } from '../../store/useAvailabilityStore';
import { useBlockedStore } from '../../store/useBlockedStore';
import { useMutedStore } from '../../store/useMutedStore';
import { useEventsStore } from '../../store/useEventsStore';
import { useFriendsStore } from '../../store/useFriendsStore';
import { useGroupsStore } from '../../store/useGroupsStore';
import { useNotificationsStore } from '../../store/useNotificationsStore';
import { getEffectiveReplies, usePostsStore } from '../../store/usePostsStore';
import { useProfileStore } from '../../store/useProfileStore';

const WIDE_BREAKPOINT = 900;

const HERO_IMAGES = [
  require('../../assets/images/resort-friends.jpg'),
  require('../../assets/images/onboarding-cafe.jpg'),
];

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

const NAV_ITEMS: { label: string; icon: keyof typeof Ionicons.glyphMap; href: string }[] = [
  { label: 'Home', icon: 'home', href: '/(tabs)' },
  { label: 'Groups', icon: 'people', href: '/(tabs)/groups' },
  { label: 'Events', icon: 'calendar', href: '/(tabs)/events' },
  { label: 'Chat', icon: 'chatbubble-ellipses', href: '/(tabs)/chat' },
  { label: 'Discover', icon: 'compass', href: '/discover' },
  { label: 'Borrow & Lend', icon: 'basket', href: '/lend' },
  { label: 'Neighborhood Recs', icon: 'star', href: '/recs' },
  { label: 'Saved', icon: 'bookmark', href: '/saved' },
  { label: 'Profile', icon: 'person', href: '/(tabs)/profile' },
];

function LeftRail({ profile }: { profile: User }) {
  return (
    <View className="w-60 gap-1 border-r border-charcoal/10 bg-cream px-3 pb-6 pt-4">
      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        className="mb-2 flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:opacity-70"
      >
        <Image source={{ uri: profile.avatar }} className="h-9 w-9 rounded-full border-2 border-sand" />
        <Text className="flex-1 font-semibold text-charcoal" numberOfLines={1}>
          {profile.name}
        </Text>
      </Pressable>

      {NAV_ITEMS.map((item) => {
        const active = item.label === 'Home';
        return (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.href as never)}
            className={`flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:opacity-70 ${
              active ? 'bg-terracotta/15' : ''
            }`}
          >
            <Ionicons name={item.icon} size={19} color={active ? '#E0533C' : '#3D3D3D'} />
            <Text className={`text-[15px] ${active ? 'font-semibold text-terracotta' : 'text-charcoal'}`}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function RightRail() {
  const events = useEventsStore((s) => s.events)
    .filter((e) => e.status === 'upcoming')
    .slice(0, 3);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const groups = useGroupsStore((s) => s.groups);
  const joinedMap = useGroupsStore((s) => s.joined);
  const myAvailable = useAvailabilityStore((s) => s.myAvailable);

  const friends = [...USERS, ...DISCOVER_USERS]
    .filter((u) => friendStatuses[u.id] === 'friends')
    .slice(0, 5);
  const suggestedGroups = groups.filter((g) => !joinedMap[g.id]).slice(0, 3);

  return (
    <ScrollView className="w-72 border-l border-charcoal/10 bg-cream/60" contentContainerClassName="gap-4 px-4 pb-6 pt-4">
      <View className="rounded-2xl bg-cream p-4">
        <Text className="mb-3 text-sm font-bold text-charcoal">Upcoming events</Text>
        <View className="gap-3">
          {events.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => router.push(`/event/${e.id}`)}
              className="flex-row items-center gap-3 active:opacity-70"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-sand">
                <Text className="text-[9px] font-bold uppercase text-terracotta">{e.month}</Text>
                <Text className="text-sm font-bold leading-4 text-charcoal">{e.day}</Text>
              </View>
              <Text className="flex-1 text-sm text-charcoal" numberOfLines={2}>
                {e.title}
              </Text>
            </Pressable>
          ))}
          {events.length === 0 && (
            <Text className="text-xs text-charcoal/50">No upcoming events yet.</Text>
          )}
        </View>
      </View>

      <View className="rounded-2xl bg-cream p-4">
        <Text className="mb-3 text-sm font-bold text-charcoal">Active neighbors</Text>
        <View className="gap-3">
          {friends.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => router.push(`/profile/${f.id}`)}
              className="flex-row items-center gap-3 active:opacity-70"
            >
              <View>
                <Image source={{ uri: f.avatar }} className="h-9 w-9 rounded-full" />
                {isAvailable(f, myAvailable) && (
                  <View className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-cream bg-sage" />
                )}
              </View>
              <Text className="text-sm text-charcoal">{f.name}</Text>
            </Pressable>
          ))}
          {friends.length === 0 && (
            <Text className="text-xs text-charcoal/50">Add friends to see them here.</Text>
          )}
        </View>
      </View>

      <View className="rounded-2xl bg-cream p-4">
        <Text className="mb-3 text-sm font-bold text-charcoal">Suggested groups</Text>
        <View className="gap-3">
          {suggestedGroups.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => router.push(`/group/${g.id}`)}
              className="flex-row items-center gap-3 active:opacity-70"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-sage">
                <Text className="text-sm font-bold text-cream">{g.name.charAt(0)}</Text>
              </View>
              <Text className="flex-1 text-sm text-charcoal" numberOfLines={1}>
                {g.name}
              </Text>
            </Pressable>
          ))}
          {suggestedGroups.length === 0 && (
            <Text className="text-xs text-charcoal/50">You've joined them all!</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

export default function HomeFeed() {
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;
  const profile = useProfileStore((s) => s.profile);
  const stories = [{ ...profile, isYou: true }, ...USERS];
  const [query, setQuery] = useState('');
  const mutedIds = useMutedStore((s) => s.mutedIds);
  const unreadCount = useNotificationsStore(
    (s) => s.notifications.filter((n) => !n.read && (!n.actorId || !mutedIds[n.actorId])).length
  );
  const posts = usePostsStore((s) => s.posts);
  const draftCount = usePostsStore((s) => s.drafts.length);
  const myReactions = usePostsStore((s) => s.myReactions);
  const tapReaction = usePostsStore((s) => s.tapReaction);
  const setReaction = usePostsStore((s) => s.setReaction);
  const savedIds = usePostsStore((s) => s.savedIds);
  const toggleSave = usePostsStore((s) => s.toggleSave);
  const comments = usePostsStore((s) => s.comments);
  const myAvailable = useAvailabilityStore((s) => s.myAvailable);
  const myPollVotes = usePostsStore((s) => s.myPollVotes);
  const votePoll = usePostsStore((s) => s.votePoll);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const [reactorsPost, setReactorsPost] = useState<Post | null>(null);
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const blockedIds = useBlockedStore((s) => s.blockedIds);

  const greeting = getGreeting();
  const firstName = profile.name.split(' ')[0];

  const postsWithAuthor = posts
    .filter((post) => !blockedIds[post.authorId] && !mutedIds[post.authorId])
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
      <View className={isWide ? 'flex-1 flex-row' : 'flex-1'}>
        {isWide && <LeftRail profile={profile} />}

        <View className="flex-1">
      <View style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' }}>
        <BackgroundSlideshow images={HERO_IMAGES} />
        <LinearGradient
          colors={['rgba(61,61,61,0.55)', 'rgba(61,61,61,0.15)', 'rgba(224,83,60,0.6)']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        <View className="px-5 pb-5 pt-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text
                className="text-2xl font-bold text-cream"
                style={{
                  textShadowColor: 'rgba(61,61,61,0.6)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 6,
                }}
              >
                {greeting.text}, {firstName} {greeting.emoji}
              </Text>
              <Text
                className="mt-1 text-sm text-sand"
                style={{
                  textShadowColor: 'rgba(61,61,61,0.6)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 6,
                }}
              >
                Your neighborhood is glad you're here.
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => router.push('/discover')}
                className="h-10 w-10 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="compass-outline" size={19} color="#F5F2E9" />
              </Pressable>
              <Pressable
                onPress={() => router.push('/lend')}
                className="h-10 w-10 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="basket-outline" size={19} color="#F5F2E9" />
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName={isWide ? 'items-center' : undefined}
      >
        <View className={isWide ? 'w-full max-w-xl' : 'w-full'}>
        {!q && (
          <>
            <Pressable
              onPress={() => router.push('/create-post')}
              className="mx-5 mt-4 rounded-2xl bg-cream p-3.5 active:opacity-80"
            >
              <View className="flex-row items-center gap-3">
                <Image source={{ uri: profile.avatar }} className="h-9 w-9 rounded-full border-2 border-sand" />
                <Text className="flex-1 text-sm text-charcoal/50">
                  Share something with your neighbors, big or small...
                </Text>
              </View>
              <View className="mt-3 flex-row items-center gap-2 border-t border-charcoal/10 pt-3">
                <View className="flex-row items-center gap-1.5 rounded-full bg-sage/15 px-3 py-1.5">
                  <Ionicons name="image-outline" size={15} color="#81A684" />
                  <Text className="text-xs font-medium text-sage">Photo</Text>
                </View>
                <View className="flex-row items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5">
                  <Ionicons name="happy-outline" size={15} color="#D9A441" />
                  <Text className="text-xs font-medium text-gold">Feeling</Text>
                </View>
                {draftCount > 0 && (
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      router.push('/drafts');
                    }}
                    className="flex-row items-center gap-1.5 rounded-full bg-terracotta/15 px-3 py-1.5"
                  >
                    <Ionicons name="document-text-outline" size={15} color="#E0533C" />
                    <Text className="text-xs font-medium text-terracotta">
                      {draftCount} draft{draftCount === 1 ? '' : 's'}
                    </Text>
                  </Pressable>
                )}
              </View>
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

            <Text className="mx-5 mt-4 text-sm font-bold text-charcoal">Neighbors</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-5 py-2"
              contentContainerClassName="gap-4"
            >
              {stories.map((s) => {
                const isYou = 'isYou' in s && s.isYou;
                const online = isAvailable(s, myAvailable);
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => goToProfile(s.id)}
                    className="items-center gap-1.5"
                  >
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-gold p-0.5">
                      <Image source={{ uri: s.avatar }} className="h-14 w-14 rounded-full" />
                      {online && (
                        <View className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-cream bg-sage" />
                      )}
                      {isYou && (
                        <View className="absolute -bottom-0.5 -right-0.5 h-5 w-5 items-center justify-center rounded-full border-2 border-cream bg-terracotta">
                          <Ionicons name="add" size={12} color="#F5F2E9" />
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-charcoal">{isYou ? 'You' : s.name.split(' ')[0]}</Text>
                  </Pressable>
                );
              })}
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
            const myReaction = myReactions[post.id];
            const saved = savedIds[post.id] ?? false;
            const postComments = comments[post.id] ?? [];
            return (
              <View key={post.id} className="rounded-[28px] bg-cream p-5 shadow-sm">
                <View className="flex-row items-start justify-between">
                  <Pressable
                    onPress={() => goToProfile(author.id)}
                    className="flex-1 flex-row items-center gap-3"
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
                  {author.id !== ME.id && (
                    <Pressable
                      onPress={() => setReportingPost(post)}
                      className="h-8 w-8 items-center justify-center rounded-full"
                    >
                      <Ionicons name="ellipsis-horizontal" size={18} color="#3D3D3D80" />
                    </Pressable>
                  )}
                </View>

                <Pressable onPress={() => router.push(`/post/${post.id}`)}>
                  <MentionText text={post.body} className="mt-3 text-[15px] leading-5 text-charcoal" />
                </Pressable>
                {post.imageUris && post.imageUris.length > 0 && (
                  <PhotoCarousel uris={post.imageUris} />
                )}
                {post.poll && (
                  <PollView
                    poll={post.poll}
                    myVote={myPollVotes[post.id]}
                    onVote={(optionId) => votePoll(post.id, optionId)}
                  />
                )}

                <View className="mt-4 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <ReactionButton
                    reactions={post.reactions}
                    myReaction={myReaction}
                    onTap={() => tapReaction(post.id)}
                    onSelect={(type) => setReaction(post.id, type)}
                    onShowReactors={() => setReactorsPost(post)}
                    fullWidth
                  />
                  <Pressable
                    onPress={() => router.push(`/post/${post.id}`)}
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-1"
                  >
                    <Ionicons name="chatbubble-outline" size={17} color="#81A684" />
                    <Text className="text-sm text-charcoal/70">
                      {getEffectiveReplies(post, postComments)}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSharingPost(post)}
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-1"
                  >
                    <Ionicons name="arrow-redo-outline" size={18} color="#3D3D3D80" />
                    <Text className="text-sm text-charcoal/70">Share</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => toggleSave(post.id)}
                    className="flex-row items-center justify-center py-1"
                  >
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
          {q.length === 0 && filteredPosts.length === 0 && (
            <EmptyState
              illustration={PARK_FRIENDS_SVG}
              title="Your feed is quiet right now"
              subtitle="Posts from neighbors will show up here. Try unmuting or unblocking someone in Settings, or explore Discover to meet new people."
              ctaLabel="Go to Discover"
              onPressCta={() => router.push('/discover')}
            />
          )}
        </View>
        </View>
      </ScrollView>
        </View>

        {isWide && <RightRail />}
      </View>

      {sharingPost && (
        <ShareSheet
          postId={sharingPost.id}
          postBody={sharingPost.body}
          onClose={() => setSharingPost(null)}
        />
      )}

      {reactorsPost && (
        <ReactorsSheet
          reactions={reactorsPost.reactions}
          myReaction={myReactions[reactorsPost.id]}
          onClose={() => setReactorsPost(null)}
          onPersonPress={(userId) => {
            setReactorsPost(null);
            goToProfile(userId);
          }}
        />
      )}

      {reportingPost && <ReportPostSheet onClose={() => setReportingPost(null)} />}
    </SafeAreaView>
  );
}
