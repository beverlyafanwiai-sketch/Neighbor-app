import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../../components/EmptyState';
import { ME, getUser } from '../../data/mock';
import { useEventsStore } from '../../store/useEventsStore';
import { FRIEND_LABEL, useFriendsStore } from '../../store/useFriendsStore';
import { useProfileStore } from '../../store/useProfileStore';
import { getEffectiveSpots, useRsvpStore } from '../../store/useRsvpStore';

const EVENT_TABS = ['Upcoming', 'Hosting', 'Past'] as const;
type EventTab = (typeof EVENT_TABS)[number];

export default function Events() {
  const [tab, setTab] = useState<EventTab>('Upcoming');
  const profile = useProfileStore((s) => s.profile);
  const events = useEventsStore((s) => s.events);
  const goingMap = useRsvpStore((s) => s.going);
  const toggleRsvp = useRsvpStore((s) => s.toggle);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const respondFriend = useFriendsStore((s) => s.respond);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const matches = (e: (typeof events)[number]) =>
    q.length === 0 ||
    e.title.toLowerCase().includes(q) ||
    e.location.toLowerCase().includes(q) ||
    e.description.toLowerCase().includes(q);

  const upcoming = events.filter((e) => e.status === 'upcoming' && matches(e));
  const past = events.filter((e) => e.status === 'past' && matches(e));
  const hostingTotal = events.filter((e) => e.hostId === ME.id).length;
  const hosting = events.filter((e) => e.hostId === ME.id && matches(e));

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-charcoal">Events</Text>
        <Pressable
          onPress={() => router.push('/create-event')}
          className="h-10 w-10 items-center justify-center rounded-full bg-terracotta"
        >
          <Ionicons name="add" size={22} color="#F5F2E9" />
        </Pressable>
      </View>

      <View className="px-5 pb-3">
        <View className="flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} color="#3D3D3D80" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search events..."
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

      <View className="flex-row gap-2 px-5 pb-3">
        {EVENT_TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`rounded-full px-4 py-2 ${tab === t ? 'bg-charcoal' : 'bg-cream'}`}
          >
            <Text className={`text-sm font-medium ${tab === t ? 'text-cream' : 'text-charcoal/60'}`}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        {tab === 'Upcoming' && (
          <View className="gap-3">
            {upcoming.map((e) => {
              const going = goingMap[e.id] ?? false;
              const { spotsTaken, spotsTotal, isFull } = getEffectiveSpots(e.id, going);
              const otherAvatars = e.attendeeIds.map((id) => getUser(id)).filter(Boolean);
              const avatars = going ? [profile, ...otherAvatars] : otherAvatars;
              return (
                <Pressable
                  key={e.id}
                  onPress={() => router.push(`/event/${e.id}`)}
                  className="flex-row gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  <View className="h-14 w-14 items-center justify-center rounded-xl bg-terracotta">
                    <Text className="text-xs font-semibold text-cream">{e.month}</Text>
                    <Text className="text-xl font-bold text-cream">{e.day}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-charcoal">{e.title}</Text>
                    <Text className="mt-0.5 text-xs text-charcoal/60">
                      {e.time} · {e.location}
                    </Text>
                    <Text className="mt-0.5 text-xs text-sage">{e.hostLabel}</Text>

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
                      <Pressable
                        onPress={(evt) => {
                          evt.stopPropagation();
                          toggleRsvp(e.id);
                        }}
                        disabled={isFull}
                        className={`rounded-full px-4 py-1.5 ${
                          going ? 'bg-gold' : isFull ? 'bg-charcoal/10' : 'bg-sand'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            going ? 'text-charcoal' : isFull ? 'text-charcoal/40' : 'text-charcoal/70'
                          }`}
                        >
                          {going ? 'Going' : isFull ? 'Full' : 'RSVP'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              );
            })}
            {upcoming.length === 0 && q.length > 0 && (
              <EmptyState
                icon="search-outline"
                title={`No upcoming events matching "${query.trim()}"`}
              />
            )}
          </View>
        )}

        {tab === 'Hosting' && (
          <>
            {hostingTotal === 0 ? (
              <View className="mt-10 items-center px-6">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-cream">
                  <Ionicons name="megaphone-outline" size={32} color="#E0533C" />
                </View>
                <Text className="mt-4 text-center text-base font-semibold text-charcoal">
                  You're not hosting anything yet
                </Text>
                <Text className="mt-1.5 text-center text-sm text-charcoal/60">
                  Start small — a porch hangout for 6 is plenty to get to know people.
                </Text>
                <Pressable
                  onPress={() => router.push('/create-event')}
                  className="mt-5 rounded-full bg-charcoal px-6 py-3"
                >
                  <Text className="text-sm font-semibold text-cream">Host an event</Text>
                </Pressable>
              </View>
            ) : hosting.length === 0 ? (
              <EmptyState icon="search-outline" title={`No hosted events matching "${query.trim()}"`} />
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
                        <Text className="text-xs font-semibold text-cream">{e.month}</Text>
                        <Text className="text-xl font-bold text-cream">{e.day}</Text>
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
                          <View className="rounded-full bg-gold px-4 py-1.5">
                            <Text className="text-xs font-semibold text-charcoal">
                              {e.status === 'past' ? 'Hosted' : 'Hosting'}
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
              const met = (e.metIds ?? []).map((id) => getUser(id)).filter(Boolean);
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

                  <Text className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    People you met
                  </Text>
                  <View className="gap-2">
                    {met.map((p) => {
                      const status = friendStatuses[p!.id] ?? 'none';
                      const settled = status === 'friends' || status === 'pending_out';
                      return (
                        <View key={p!.id} className="flex-row items-center gap-2.5">
                          <Image source={{ uri: p!.avatar }} className="h-9 w-9 rounded-full" />
                          <Text className="flex-1 text-sm text-charcoal">{p!.name}</Text>
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
                              color={settled ? '#81A684' : '#3D3D3D'}
                            />
                            <Text
                              className={`text-xs font-medium ${settled ? 'text-sage' : 'text-charcoal'}`}
                            >
                              {FRIEND_LABEL[status]}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                </Pressable>
              );
            })}
            {past.length === 0 && q.length > 0 && (
              <EmptyState icon="search-outline" title={`No past events matching "${query.trim()}"`} />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
