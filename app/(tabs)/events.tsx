import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../../components/EmptyState';
import EventCalendar from '../../components/EventCalendar';
import { EVENT_CATEGORIES, ME, getUser, type EventCategory } from '../../data/mock';
import { getCountdownLabel } from '../../lib/eventCountdown';
import { useBlockedStore } from '../../store/useBlockedStore';
import { useDismissedEventsStore } from '../../store/useDismissedEventsStore';
import { getEffectiveCheckedInIds, useCheckInStore } from '../../store/useCheckInStore';
import { useEventsStore } from '../../store/useEventsStore';
import { FRIEND_LABEL, useFriendsStore } from '../../store/useFriendsStore';
import { isEventVisible, useGroupsStore } from '../../store/useGroupsStore';
import { useMutedStore } from '../../store/useMutedStore';
import { useProfileStore } from '../../store/useProfileStore';
import { getEffectiveSpots, getWaitlistPosition, useRsvpStore } from '../../store/useRsvpStore';
import { useSavedEventSearchesStore } from '../../store/useSavedEventSearchesStore';
import { useSavedEventsStore } from '../../store/useSavedEventsStore';

const EVENT_TABS = ['Upcoming', 'Hosting', 'Past'] as const;
type EventTab = (typeof EVENT_TABS)[number];

const CATEGORY_FILTERS = ['All', ...EVENT_CATEGORIES] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

const SORTS = [
  { value: 'soonest', label: 'Soonest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'open', label: 'Most spots open' },
] as const;
type SortBy = (typeof SORTS)[number]['value'];

export default function Events() {
  const [tab, setTab] = useState<EventTab>('Upcoming');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const profile = useProfileStore((s) => s.profile);
  const events = useEventsStore((s) => s.events);
  const eventDrafts = useEventsStore((s) => s.drafts);
  const joinedGroups = useGroupsStore((s) => s.joined);
  const goingMap = useRsvpStore((s) => s.going);
  const waitlistMap = useRsvpStore((s) => s.waitlisted);
  const toggleRsvp = useRsvpStore((s) => s.toggle);
  const joinWaitlist = useRsvpStore((s) => s.joinWaitlist);
  const leaveWaitlist = useRsvpStore((s) => s.leaveWaitlist);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const respondFriend = useFriendsStore((s) => s.respond);
  const myCheckIns = useCheckInStore((s) => s.myCheckIns);
  const savedEventIds = useSavedEventsStore((s) => s.savedIds);
  const pinnedEventId = useEventsStore((s) => s.pinnedEventId);
  const pinEvent = useEventsStore((s) => s.pinEvent);
  const unpinEvent = useEventsStore((s) => s.unpinEvent);
  const dismissedIds = useDismissedEventsStore((s) => s.dismissedIds);
  const dismissEvent = useDismissedEventsStore((s) => s.dismissEvent);
  const toggleSaveEvent = useSavedEventsStore((s) => s.toggleSave);
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const mutedIds = useMutedStore((s) => s.mutedIds);
  const savedSearches = useSavedEventSearchesStore((s) => s.searches);
  const saveSearch = useSavedEventSearchesStore((s) => s.saveSearch);
  const renameSearch = useSavedEventSearchesStore((s) => s.renameSearch);
  const deleteSearch = useSavedEventSearchesStore((s) => s.deleteSearch);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyGoing, setOnlyGoing] = useState(false);
  const [onlyFriends, setOnlyFriends] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('soonest');
  const [savingSearch, setSavingSearch] = useState(false);
  const [searchNameDraft, setSearchNameDraft] = useState('');
  const [renamingSearchId, setRenamingSearchId] = useState<string | null>(null);

  const isSearchModified =
    query.trim().length > 0 ||
    categoryFilter !== 'All' ||
    onlyOpen ||
    onlyGoing ||
    onlyFriends ||
    sortBy !== 'soonest';

  const applySearch = (search: (typeof savedSearches)[number]) => {
    setQuery(search.query);
    setCategoryFilter(search.categoryFilter as CategoryFilter);
    setOnlyOpen(Boolean(search.onlyOpen));
    setOnlyGoing(Boolean(search.onlyGoing));
    setOnlyFriends(Boolean(search.onlyFriends));
    setSortBy(search.sortBy as SortBy);
  };

  const q = query.trim().toLowerCase();
  const matches = (e: (typeof events)[number]) =>
    (!e.hostId || (!blockedIds[e.hostId] && !mutedIds[e.hostId])) &&
    (categoryFilter === 'All' || e.category === categoryFilter) &&
    (q.length === 0 ||
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q));

  const hostingTotal = events.filter((e) => e.hostId === ME.id).length;
  const hosting = events.filter((e) => e.hostId === ME.id && matches(e));
  const past = events.filter(
    (e) => e.status === 'past' && matches(e) && isEventVisible(e.hostGroupId, joinedGroups)
  );

  let upcoming = events.filter(
    (e) =>
      e.status === 'upcoming' &&
      matches(e) &&
      !dismissedIds[e.id] &&
      isEventVisible(e.hostGroupId, joinedGroups)
  );
  if (onlyOpen) {
    upcoming = upcoming.filter((e) => {
      const { spotsTaken, spotsTotal } = getEffectiveSpots(e.id, goingMap[e.id] ?? false);
      return spotsTaken < spotsTotal;
    });
  }
  if (onlyGoing) {
    upcoming = upcoming.filter((e) => goingMap[e.id] ?? false);
  }
  if (onlyFriends) {
    upcoming = upcoming.filter((e) => e.hostId && friendStatuses[e.hostId] === 'friends');
  }
  upcoming = (() => {
    const pinned = upcoming.find((e) => e.id === pinnedEventId);
    const rest = upcoming.filter((e) => e.id !== pinnedEventId);
    const sortedRest = [...rest].sort((a, b) => {
      if (sortBy === 'popular') return b.spotsTaken - a.spotsTaken;
      if (sortBy === 'open') {
        const openA = a.spotsTotal - getEffectiveSpots(a.id, goingMap[a.id] ?? false).spotsTaken;
        const openB = b.spotsTotal - getEffectiveSpots(b.id, goingMap[b.id] ?? false).spotsTaken;
        return openB - openA;
      }
      return Number(a.day) - Number(b.day);
    });
    return pinned ? [pinned, ...sortedRest] : sortedRest;
  })();

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-charcoal">Events</Text>
        <View className="flex-row items-center gap-2">
          {tab === 'Upcoming' && (
            <View className="flex-row items-center gap-1 rounded-full bg-cream p-1">
              <Pressable
                onPress={() => setView('list')}
                accessibilityLabel="List view"
                accessibilityRole="button"
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  view === 'list' ? 'bg-ink' : ''
                }`}
              >
                <Ionicons
                  name="list-outline"
                  size={16}
                  className={view === 'list' ? 'text-paper' : 'text-charcoal/50'}
                />
              </Pressable>
              <Pressable
                onPress={() => setView('calendar')}
                accessibilityLabel="Calendar view"
                accessibilityRole="button"
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  view === 'calendar' ? 'bg-ink' : ''
                }`}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  className={view === 'calendar' ? 'text-paper' : 'text-charcoal/50'}
                />
              </Pressable>
            </View>
          )}
          {eventDrafts.length > 0 && (
            <Pressable
              onPress={() => router.push('/drafts')}
              accessibilityLabel="Drafts"
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center rounded-full bg-cream"
            >
              <Ionicons name="document-text-outline" size={18} className="text-terracotta" />
            </Pressable>
          )}
          <Pressable
            onPress={() => router.push('/create-event')}
            accessibilityLabel="Create event"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-terracotta"
          >
            <Ionicons name="add" size={22} className="text-paper" />
          </Pressable>
        </View>
      </View>

      <View className="px-5 pb-3">
        <View className="flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} className="text-charcoal/50" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search events..."
            placeholderTextColor="#3D3D3D80"
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
          {isSearchModified && (
            <Pressable
              onPress={() => {
                setSearchNameDraft('');
                setSavingSearch(true);
              }}
              accessibilityLabel="Save this search"
              accessibilityRole="button"
              className="ml-1 h-7 w-7 items-center justify-center"
            >
              <Ionicons name="bookmark-outline" size={17} className="text-charcoal/50" />
            </Pressable>
          )}
        </View>
        {(savingSearch || renamingSearchId) && (
          <View className="mt-2 flex-row items-center gap-2 rounded-full bg-cream px-4 py-2">
            <TextInput
              value={searchNameDraft}
              onChangeText={setSearchNameDraft}
              placeholder={renamingSearchId ? 'Rename search...' : 'Name this search...'}
              placeholderTextColor="#3D3D3D80"
              autoFocus
              className="flex-1 text-sm text-charcoal"
            />
            <Pressable
              onPress={() => {
                setSavingSearch(false);
                setRenamingSearchId(null);
              }}
            >
              <Text className="text-xs font-medium text-charcoal/50">Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!searchNameDraft.trim()}
              onPress={() => {
                if (renamingSearchId) {
                  renameSearch(renamingSearchId, searchNameDraft);
                } else {
                  saveSearch({
                    name: searchNameDraft.trim(),
                    query,
                    categoryFilter,
                    onlyOpen,
                    onlyGoing,
                    onlyFriends,
                    sortBy,
                  });
                }
                setSavingSearch(false);
                setRenamingSearchId(null);
              }}
            >
              <Text
                className={`text-xs font-semibold ${
                  searchNameDraft.trim() ? 'text-terracotta' : 'text-charcoal/30'
                }`}
              >
                Save
              </Text>
            </Pressable>
          </View>
        )}
        {savedSearches.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="mt-2 gap-2"
          >
            {savedSearches.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => applySearch(s)}
                className="flex-row items-center gap-1.5 rounded-full bg-cream px-3 py-1.5"
              >
                <Ionicons name="bookmark" size={11} className="text-terracotta" />
                <Text className="text-xs font-medium text-charcoal">{s.name}</Text>
                <Pressable
                  onPress={(evt) => {
                    evt.stopPropagation();
                    setSearchNameDraft(s.name);
                    setRenamingSearchId(s.id);
                  }}
                  accessibilityLabel={`Rename saved search "${s.name}"`}
                  accessibilityRole="button"
                  className="ml-0.5"
                >
                  <Ionicons name="pencil" size={11} className="text-charcoal/40" />
                </Pressable>
                <Pressable
                  onPress={(evt) => {
                    evt.stopPropagation();
                    deleteSearch(s.id);
                  }}
                  accessibilityLabel={`Delete saved search "${s.name}"`}
                  accessibilityRole="button"
                  className="ml-0.5"
                >
                  <Ionicons name="close" size={12} className="text-charcoal/40" />
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <View className="flex-row gap-2 px-5 pb-3">
        {EVENT_TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
            className={`rounded-full px-4 py-2 ${tab === t ? 'bg-ink' : 'bg-cream'}`}
          >
            <Text className={`text-sm font-medium ${tab === t ? 'text-paper' : 'text-charcoal/60'}`}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5 pb-3">
        {CATEGORY_FILTERS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategoryFilter(c)}
            accessibilityRole="radio"
            accessibilityState={{ checked: categoryFilter === c }}
            className={`rounded-full px-3.5 py-1.5 ${
              categoryFilter === c ? 'bg-terracotta' : 'bg-cream'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                categoryFilter === c ? 'text-paper' : 'text-charcoal/60'
              }`}
            >
              {c}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === 'Upcoming' && (
        <View className="gap-2 pb-3">
          <View className="flex-row gap-2 px-5">
            <Pressable
              onPress={() => setOnlyOpen((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: onlyOpen }}
              className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5 ${
                onlyOpen ? 'bg-sage/20' : 'bg-cream'
              }`}
            >
              {onlyOpen && <Ionicons name="checkmark" size={13} className="text-sage" />}
              <Text className={`text-xs font-medium ${onlyOpen ? 'text-sage' : 'text-charcoal/60'}`}>
                Has open spots
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setOnlyGoing((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: onlyGoing }}
              className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5 ${
                onlyGoing ? 'bg-sage/20' : 'bg-cream'
              }`}
            >
              {onlyGoing && <Ionicons name="checkmark" size={13} className="text-sage" />}
              <Text className={`text-xs font-medium ${onlyGoing ? 'text-sage' : 'text-charcoal/60'}`}>
                I'm going
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setOnlyFriends((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: onlyFriends }}
              className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5 ${
                onlyFriends ? 'bg-sage/20' : 'bg-cream'
              }`}
            >
              {onlyFriends && <Ionicons name="checkmark" size={13} className="text-sage" />}
              <Text
                className={`text-xs font-medium ${onlyFriends ? 'text-sage' : 'text-charcoal/60'}`}
              >
                Hosted by friends
              </Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="items-center gap-2 px-5"
          >
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
              Sort
            </Text>
            {SORTS.map((s) => (
              <Pressable
                key={s.value}
                onPress={() => setSortBy(s.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: sortBy === s.value }}
                className={`rounded-full px-3.5 py-1.5 ${
                  sortBy === s.value ? 'bg-ink' : 'bg-cream'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    sortBy === s.value ? 'text-paper' : 'text-charcoal/60'
                  }`}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        {tab === 'Upcoming' && view === 'calendar' && (
          <EventCalendar events={upcoming} onSelectEvent={(id) => router.push(`/event/${id}`)} />
        )}

        {tab === 'Upcoming' && view === 'list' && (
          <View className="gap-3">
            {upcoming.map((e) => {
              const going = goingMap[e.id] ?? false;
              const waitlisted = waitlistMap[e.id] ?? false;
              const { spotsTaken, spotsTotal, isFull } = getEffectiveSpots(e.id, going);
              const otherAvatars = e.attendeeIds.map((id) => getUser(id)).filter(Boolean);
              const avatars = going ? [profile, ...otherAvatars] : otherAvatars;
              const saved = savedEventIds[e.id] ?? false;
              const isPinned = e.id === pinnedEventId;
              const countdownLabel = getCountdownLabel(e);
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
                      {isPinned && <Ionicons name="pin" size={12} className="text-gold" />}
                      <Text className="flex-1 font-semibold text-charcoal" numberOfLines={1}>
                        {e.title}
                      </Text>
                      {e.recurrence && (
                        <Ionicons name="repeat" size={12} className="text-terracotta" />
                      )}
                      <Pressable
                        onPress={(evt) => {
                          evt.stopPropagation();
                          isPinned ? unpinEvent() : pinEvent(e.id);
                        }}
                        accessibilityLabel={isPinned ? 'Unpin event' : 'Pin event'}
                        accessibilityRole="button"
                        className="h-6 w-6 items-center justify-center"
                      >
                        <Ionicons
                          name={isPinned ? 'pin' : 'pin-outline'}
                          size={14}
                          className={isPinned ? 'text-gold' : 'text-charcoal/40'}
                        />
                      </Pressable>
                      <Pressable
                        onPress={(evt) => {
                          evt.stopPropagation();
                          toggleSaveEvent(e.id);
                        }}
                        accessibilityLabel={saved ? 'Unsave event' : 'Save event'}
                        accessibilityRole="button"
                        className="h-6 w-6 items-center justify-center"
                      >
                        <Ionicons
                          name={saved ? 'bookmark' : 'bookmark-outline'}
                          size={15}
                          className={saved ? 'text-gold' : 'text-charcoal/40'}
                        />
                      </Pressable>
                      {e.hostId !== ME.id && (
                        <Pressable
                          onPress={(evt) => {
                            evt.stopPropagation();
                            dismissEvent(e.id);
                          }}
                          accessibilityLabel="Not interested"
                          accessibilityRole="button"
                          className="h-6 w-6 items-center justify-center"
                        >
                          <Ionicons name="close" size={15} className="text-charcoal/40" />
                        </Pressable>
                      )}
                    </View>
                    <Text className="mt-0.5 text-xs text-charcoal/60">
                      {e.time} · {e.location}
                    </Text>
                    <View className="mt-0.5 flex-row items-center gap-1.5">
                      <Text className="text-xs text-sage">
                        {e.hostLabel} · {e.category}
                      </Text>
                      {e.cancelled ? (
                        <Text className="text-xs font-semibold text-terracotta">· Cancelled</Text>
                      ) : (
                        countdownLabel && (
                          <Text className="text-xs font-semibold text-terracotta">
                            · {countdownLabel}
                          </Text>
                        )
                      )}
                    </View>

                    <View className="mt-3 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <View className="flex-row">
                          {avatars.map((a, i) => (
                            <Image
                              key={a!.id}
                              source={{ uri: a!.avatar }}
                              className="h-6 w-6 rounded-full border-2 border-cream"
                              style={{ marginLeft: i === 0 ? 0 : -8 }}
                            />
                          ))}
                        </View>
                        <Text className="text-xs text-charcoal/50">
                          {spotsTaken}/{spotsTotal} spots
                        </Text>
                      </View>
                      {e.cancelled ? (
                        <View className="rounded-full bg-terracotta/10 px-4 py-1.5">
                          <Text className="text-xs font-semibold text-terracotta">Cancelled</Text>
                        </View>
                      ) : (
                        <Pressable
                          onPress={(evt) => {
                            evt.stopPropagation();
                            if (going) {
                              toggleRsvp(e.id);
                            } else if (isFull) {
                              waitlisted ? leaveWaitlist(e.id) : joinWaitlist(e.id);
                            } else {
                              toggleRsvp(e.id);
                            }
                          }}
                          className={`rounded-full px-4 py-1.5 ${
                            going ? 'bg-gold' : waitlisted ? 'bg-sage/20' : 'bg-sand'
                          }`}
                        >
                          <Text
                            className={`text-xs font-semibold ${
                              going ? 'text-charcoal' : waitlisted ? 'text-sage' : 'text-charcoal/70'
                            }`}
                          >
                            {going
                              ? 'Going'
                              : waitlisted
                                ? `Waitlisted · #${getWaitlistPosition(e.id, true)}`
                                : isFull
                                  ? 'Join waitlist'
                                  : 'RSVP'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
            {upcoming.length === 0 && (
              <EmptyState
                icon="search-outline"
                title={
                  q.length > 0
                    ? `No upcoming events matching "${query.trim()}"`
                    : 'No upcoming events match these filters'
                }
                subtitle={
                  q.length === 0 ? 'Try a different category, or clear "Has open spots" / "I\'m going".' : undefined
                }
              />
            )}
          </View>
        )}

        {tab === 'Hosting' && (
          <>
            {hostingTotal === 0 ? (
              <View className="mt-10 items-center px-6">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-cream">
                  <Ionicons name="megaphone-outline" size={32} className="text-terracotta" />
                </View>
                <Text className="mt-4 text-center text-base font-semibold text-charcoal">
                  You're not hosting anything yet
                </Text>
                <Text className="mt-1.5 text-center text-sm text-charcoal/60">
                  Start small — a porch hangout for 6 is plenty to get to know people.
                </Text>
                <Pressable
                  onPress={() => router.push('/create-event')}
                  className="mt-5 rounded-full bg-ink px-6 py-3"
                >
                  <Text className="text-sm font-semibold text-paper">Host an event</Text>
                </Pressable>
              </View>
            ) : hosting.length === 0 ? (
              <EmptyState
                icon="search-outline"
                title={
                  q.length > 0
                    ? `No hosted events matching "${query.trim()}"`
                    : 'No hosted events match this category'
                }
              />
            ) : (
              <View className="gap-3">
                {hosting.map((e) => {
                  const { spotsTaken, spotsTotal } = getEffectiveSpots(e.id, goingMap[e.id] ?? false);
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
                        <Text className="font-semibold text-charcoal">{e.title}</Text>
                        <Text className="mt-0.5 text-xs text-charcoal/60">
                          {e.time} · {e.location}
                        </Text>
                        <View className="mt-3 flex-row items-center justify-between">
                          <Text className="text-xs text-charcoal/50">
                            {spotsTaken}/{spotsTotal} spots
                          </Text>
                          <View
                            className={`rounded-full px-4 py-1.5 ${
                              e.cancelled ? 'bg-terracotta/10' : 'bg-gold'
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                e.cancelled ? 'text-terracotta' : 'text-charcoal'
                              }`}
                            >
                              {e.cancelled ? 'Cancelled' : e.status === 'past' ? 'Hosted' : 'Hosting'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}

        {tab === 'Past' && (
          <View className="gap-3">
            {past.map((e) => {
              const checkedIn = getEffectiveCheckedInIds(e, myCheckIns[e.id] ?? false)
                .map((uid) => (uid === ME.id ? profile : getUser(uid)))
                .filter(Boolean);
              return (
                <Pressable
                  key={e.id}
                  onPress={() => router.push(`/event/${e.id}`)}
                  className="rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  <Text className="font-semibold text-charcoal">{e.title}</Text>
                  <Text className="mt-0.5 text-xs text-charcoal/60">
                    {e.date} · {e.location}
                  </Text>

                  {checkedIn.length > 0 && (
                    <>
                      <Text className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                        Who was there
                      </Text>
                      <View className="gap-2">
                        {checkedIn.map((p) => {
                          const isMe = p!.id === ME.id;
                          const status = friendStatuses[p!.id] ?? 'none';
                          const settled = status === 'friends' || status === 'pending_out';
                          return (
                            <View key={p!.id} className="flex-row items-center gap-2.5">
                              <Image source={{ uri: p!.avatar }} className="h-9 w-9 rounded-full" />
                              <Text className="flex-1 text-sm text-charcoal">
                                {isMe ? 'You' : p!.name}
                              </Text>
                              {!isMe && (
                                <Pressable
                                  onPress={(evt) => {
                                    evt.stopPropagation();
                                    respondFriend(p!.id);
                                  }}
                                  className={`flex-row items-center gap-1 rounded-full px-3 py-1.5 ${
                                    settled ? 'bg-sage/20' : 'bg-sand'
                                  }`}
                                >
                                  <Ionicons
                                    name={status === 'friends' ? 'checkmark' : 'person-add-outline'}
                                    size={13}
                                    className={settled ? 'text-sage' : 'text-charcoal'}
                                  />
                                  <Text
                                    className={`text-xs font-medium ${settled ? 'text-sage' : 'text-charcoal'}`}
                                  >
                                    {FRIEND_LABEL[status]}
                                  </Text>
                                </Pressable>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </>
                  )}
                </Pressable>
              );
            })}
            {past.length === 0 && (
              <EmptyState
                icon="search-outline"
                title={
                  q.length > 0
                    ? `No past events matching "${query.trim()}"`
                    : 'No past events match this category'
                }
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
