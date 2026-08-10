import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ME, getEvent, getUser } from '../../data/mock';
import { getEffectiveSpots, useRsvpStore } from '../../store/useRsvpStore';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = getEvent(id);
  const going = useRsvpStore((s) => (event ? (s.going[event.id] ?? false) : false));
  const toggleRsvp = useRsvpStore((s) => s.toggle);

  if (!event) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="text-charcoal">Event not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-terracotta">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isPast = event.status === 'past';
  const { spotsTaken, spotsTotal, isFull } = getEffectiveSpots(event.id, going);
  const otherAttendees = event.attendeeIds.map((id) => getUser(id)).filter(Boolean);
  const attendees = going ? [ME, ...otherAttendees] : otherAttendees;
  const met = (event.metIds ?? []).map((id) => getUser(id)).filter(Boolean);

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} color="#3D3D3D" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        <View className="rounded-3xl bg-cream p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-terracotta">
              <Text className="text-xs font-semibold text-cream">{event.month}</Text>
              <Text className="text-xl font-bold text-cream">{event.day}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-charcoal">{event.title}</Text>
              <Text className="mt-0.5 text-sm text-charcoal/60">
                {event.time} · {event.location}
              </Text>
              <Text className="mt-0.5 text-xs text-sage">{event.hostLabel}</Text>
            </View>
          </View>

          <Text className="mt-4 text-[15px] leading-5 text-charcoal/80">{event.description}</Text>

          {!isPast && (
            <Pressable
              onPress={() => toggleRsvp(event.id)}
              disabled={isFull}
              className={`mt-5 items-center rounded-full py-3 ${
                going ? 'bg-gold' : isFull ? 'bg-charcoal/10' : 'bg-charcoal'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  going ? 'text-charcoal' : isFull ? 'text-charcoal/40' : 'text-cream'
                }`}
              >
                {going ? "You're going" : isFull ? 'Event full' : 'RSVP'}
              </Text>
            </Pressable>
          )}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          {isPast ? 'Who was there' : `Attending · ${spotsTaken}/${spotsTotal} spots`}
        </Text>
        <View className="gap-3">
          {attendees.map((a) => {
            const isMe = a!.id === ME.id;
            return (
              <Pressable
                key={a!.id}
                onPress={() => !isMe && router.push(`/profile/${a!.id}`)}
                className="flex-row items-center gap-3 rounded-2xl bg-cream p-3 active:opacity-70"
              >
                <Image source={{ uri: a!.avatar }} className="h-11 w-11 rounded-full" />
                <View className="flex-1">
                  <Text className="font-medium text-charcoal">{isMe ? 'You' : a!.name}</Text>
                  <Text className="text-xs text-charcoal/50" numberOfLines={1}>
                    {a!.tagline}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {isPast && met.length > 0 && (
          <>
            <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              People you met
            </Text>
            <View className="gap-2">
              {met.map((p) => (
                <View
                  key={p!.id}
                  className="flex-row items-center gap-2.5 rounded-2xl bg-cream p-3"
                >
                  <Image source={{ uri: p!.avatar }} className="h-9 w-9 rounded-full" />
                  <Text className="flex-1 text-sm text-charcoal">{p!.name}</Text>
                  <Pressable
                    onPress={() => router.push(`/profile/${p!.id}`)}
                    className="flex-row items-center gap-1 rounded-full bg-sand px-3 py-1.5"
                  >
                    <Ionicons name="person-add-outline" size={13} color="#3D3D3D" />
                    <Text className="text-xs font-medium text-charcoal">Add friend</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
