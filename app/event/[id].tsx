import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ME, getUser } from '../../data/mock';
import { addEventToCalendar } from '../../lib/ics';
import { formatOccurrence, getUpcomingOccurrences, RECURRENCE_LABEL } from '../../lib/recurrence';
import { getEffectiveCheckedInIds, useCheckInStore } from '../../store/useCheckInStore';
import { getEventPhotos, useEventAlbumStore } from '../../store/useEventAlbumStore';
import { useEventsStore } from '../../store/useEventsStore';
import { FRIEND_LABEL, useFriendsStore } from '../../store/useFriendsStore';
import { useProfileStore } from '../../store/useProfileStore';
import { getEffectiveSpots, useRsvpStore } from '../../store/useRsvpStore';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEventsStore((s) => s.events.find((e) => e.id === id));
  const deleteEvent = useEventsStore((s) => s.deleteEvent);
  const skipNextOccurrence = useEventsStore((s) => s.skipNextOccurrence);
  const profile = useProfileStore((s) => s.profile);
  const going = useRsvpStore((s) => (event ? (s.going[event.id] ?? false) : false));
  const waitlisted = useRsvpStore((s) => (event ? (s.waitlisted[event.id] ?? false) : false));
  const toggleRsvp = useRsvpStore((s) => s.toggle);
  const joinWaitlist = useRsvpStore((s) => s.joinWaitlist);
  const leaveWaitlist = useRsvpStore((s) => s.leaveWaitlist);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const respondFriend = useFriendsStore((s) => s.respond);
  const myCheckedIn = useCheckInStore((s) => (event ? (s.myCheckIns[event.id] ?? false) : false));
  const toggleCheckIn = useCheckInStore((s) => s.toggleCheckIn);
  const albumPhotos = useEventAlbumStore((s) => s.photos);
  const addPhotos = useEventAlbumStore((s) => s.addPhotos);
  const removePhoto = useEventAlbumStore((s) => s.removePhoto);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);

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
  const isHost = event.hostId === ME.id;
  const { spotsTaken, spotsTotal, isFull } = getEffectiveSpots(event.id, going);
  const otherAttendees = event.attendeeIds.map((id) => getUser(id)).filter(Boolean);
  const attendees = going || isHost ? [profile, ...otherAttendees] : otherAttendees;
  const resolveUser = (userId: string) => (userId === ME.id ? profile : getUser(userId));
  const checkedIn = getEffectiveCheckedInIds(event, myCheckedIn)
    .map(resolveUser)
    .filter(Boolean);
  const eventPhotos = getEventPhotos(event.id, albumPhotos);
  const canAddPhotos = going || isHost;
  const canCheckIn = going || isHost;
  const occurrences = event.recurrence ? getUpcomingOccurrences(event, new Date()) : [];

  const remove = () => {
    deleteEvent(event.id);
    router.back();
  };

  const handleAddToCalendar = async () => {
    try {
      await addEventToCalendar(event);
      setCalendarAdded(true);
      setTimeout(() => setCalendarAdded(false), 2000);
    } catch {
      // Non-critical: calendar export failing shouldn't block the rest of the screen.
    }
  };

  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 6,
    });
    if (!result.canceled && result.assets.length > 0) {
      addPhotos(event.id, result.assets.map((a) => a.uri));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        {isHost && (
          <View className="flex-row items-center gap-1.5">
            {!isPast && (
              <Pressable
                onPress={() => router.push(`/create-event?id=${event.id}`)}
                className="h-9 w-9 items-center justify-center rounded-full bg-cream"
              >
                <Ionicons name="pencil" size={17} className="text-charcoal" />
              </Pressable>
            )}
            <Pressable
              onPress={() => setConfirmingDelete(true)}
              className="h-9 w-9 items-center justify-center rounded-full bg-cream"
            >
              <Ionicons name="trash-outline" size={17} className="text-terracotta" />
            </Pressable>
          </View>
        )}
      </View>

      {confirmingDelete && (
        <View className="flex-row items-center gap-3 bg-terracotta/10 px-4 py-3">
          <Text className="flex-1 text-sm text-charcoal">
            Delete this event? This can't be undone.
          </Text>
          <Pressable onPress={() => setConfirmingDelete(false)} className="rounded-full px-3 py-1.5">
            <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
          </Pressable>
          <Pressable onPress={remove} className="rounded-full bg-terracotta px-3 py-1.5">
            <Text className="text-sm font-semibold text-paper">Delete</Text>
          </Pressable>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        {event.coverImageUri && (
          <Image
            source={{ uri: event.coverImageUri }}
            className="mb-4 w-full rounded-3xl"
            style={{ aspectRatio: 2 }}
          />
        )}
        <View className="rounded-3xl bg-cream p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-terracotta">
              <Text className="text-xs font-semibold text-paper">{event.month}</Text>
              <Text className="text-xl font-bold text-paper">{event.day}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-charcoal">{event.title}</Text>
              <Text className="mt-0.5 text-sm text-charcoal/60">
                {event.time} · {event.location}
              </Text>
              <Text className="mt-0.5 text-xs text-sage">{event.hostLabel}</Text>
            </View>
          </View>

          {event.recurrence && (
            <View className="mt-4 flex-row items-center gap-1.5">
              <Ionicons name="repeat" size={14} className="text-terracotta" />
              <Text className="text-xs font-medium text-terracotta">
                {RECURRENCE_LABEL[event.recurrence]}
              </Text>
            </View>
          )}

          <Text className="mt-4 text-[15px] leading-5 text-charcoal/80">{event.description}</Text>

          {event.recurrence && occurrences.length > 0 && (
            <View className="mt-4 rounded-2xl bg-sand p-3.5">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Next occurrences
              </Text>
              <Text className="mt-1 text-sm text-charcoal/80">
                {occurrences.map(formatOccurrence).join(', ')}
              </Text>
              {isHost && !isPast && (
                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    onPress={() => router.push(`/create-event?id=${event.id}`)}
                    className="rounded-full bg-cream px-3.5 py-1.5"
                  >
                    <Text className="text-xs font-semibold text-charcoal">Edit series</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => skipNextOccurrence(event.id)}
                    className="rounded-full bg-cream px-3.5 py-1.5"
                  >
                    <Text className="text-xs font-semibold text-charcoal">Skip next</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {isHost ? (
            <View className="mt-5 flex-row items-center justify-center gap-1.5 rounded-full bg-gold py-3">
              <Ionicons name="megaphone" size={15} className="text-charcoal" />
              <Text className="text-sm font-semibold text-charcoal">
                {isPast ? 'You hosted this' : "You're hosting"}
              </Text>
            </View>
          ) : (
            !isPast && (
              <Pressable
                onPress={() => {
                  if (going) {
                    toggleRsvp(event.id);
                  } else if (isFull) {
                    waitlisted ? leaveWaitlist(event.id) : joinWaitlist(event.id);
                  } else {
                    toggleRsvp(event.id);
                  }
                }}
                className={`mt-5 flex-row items-center justify-center gap-1.5 rounded-full py-3 ${
                  going ? 'bg-gold' : waitlisted ? 'bg-sage/20' : 'bg-ink'
                }`}
              >
                {waitlisted && <Ionicons name="time-outline" size={16} className="text-sage" />}
                <Text
                  className={`text-sm font-semibold ${
                    going ? 'text-charcoal' : waitlisted ? 'text-sage' : 'text-paper'
                  }`}
                >
                  {going
                    ? "You're going"
                    : waitlisted
                      ? 'On waitlist · tap to leave'
                      : isFull
                        ? 'Join waitlist'
                        : 'RSVP'}
                </Text>
              </Pressable>
            )
          )}

          {!isPast && (
            <Pressable
              onPress={handleAddToCalendar}
              className="mt-3 flex-row items-center justify-center gap-1.5 rounded-full border border-charcoal/15 py-3 active:opacity-70"
            >
              <Ionicons
                name={calendarAdded ? 'checkmark' : 'calendar-outline'}
                size={16}
                className={calendarAdded ? 'text-sage' : 'text-charcoal'}
              />
              <Text
                className={`text-sm font-semibold ${calendarAdded ? 'text-sage' : 'text-charcoal'}`}
              >
                {calendarAdded ? 'Added to calendar' : 'Add to calendar'}
              </Text>
            </Pressable>
          )}

          {canCheckIn && (
            <Pressable
              onPress={() => toggleCheckIn(event.id)}
              className={`mt-3 flex-row items-center justify-center gap-1.5 rounded-full py-3 ${
                myCheckedIn ? 'bg-sage/20' : 'border border-charcoal/15'
              }`}
            >
              <Ionicons
                name={myCheckedIn ? 'checkmark-circle' : 'location-outline'}
                size={16}
                className={myCheckedIn ? 'text-sage' : 'text-charcoal'}
              />
              <Text
                className={`text-sm font-semibold ${myCheckedIn ? 'text-sage' : 'text-charcoal'}`}
              >
                {myCheckedIn ? "You're checked in" : "I'm here"}
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

        {(eventPhotos.length > 0 || canAddPhotos) && (
          <>
            <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Photos from this event{eventPhotos.length > 0 ? ` (${eventPhotos.length})` : ''}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {eventPhotos.map((photo) => (
                <View key={photo.id} className="w-[31%]" style={{ aspectRatio: 1 }}>
                  <Image source={{ uri: photo.uri }} className="h-full w-full rounded-xl" />
                  {photo.uploaderId === ME.id && (
                    <Pressable
                      onPress={() => removePhoto(photo.id)}
                      className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-ink/60"
                    >
                      <Ionicons name="close" size={12} className="text-paper" />
                    </Pressable>
                  )}
                </View>
              ))}
              {canAddPhotos && (
                <Pressable
                  onPress={pickPhotos}
                  className="w-[31%] items-center justify-center rounded-xl border-2 border-dashed border-charcoal/20 bg-cream active:opacity-70"
                  style={{ aspectRatio: 1 }}
                >
                  <Ionicons name="add" size={20} className="text-charcoal/50" />
                  <Text className="mt-1 text-center text-[10px] font-medium text-charcoal/50">
                    Add photos
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        )}

        {checkedIn.length > 0 && (
          <>
            <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              {isPast ? 'Who was there' : 'Checked in'} ({checkedIn.length})
            </Text>
            <View className="gap-2">
              {checkedIn.map((p) => {
                const isMe = p!.id === ME.id;
                const status = friendStatuses[p!.id] ?? 'none';
                const settled = status === 'friends' || status === 'pending_out';
                return (
                  <View
                    key={p!.id}
                    className="flex-row items-center gap-2.5 rounded-2xl bg-cream p-3"
                  >
                    <Image source={{ uri: p!.avatar }} className="h-9 w-9 rounded-full" />
                    <Text className="flex-1 text-sm text-charcoal">{isMe ? 'You' : p!.name}</Text>
                    {!isMe && (
                      <Pressable
                        onPress={() => respondFriend(p!.id)}
                        className={`flex-row items-center gap-1 rounded-full px-3 py-1.5 ${
                          settled ? 'bg-sage/20' : 'bg-sand'
                        }`}
                      >
                        <Ionicons
                          name={status === 'friends' ? 'checkmark' : 'person-add-outline'}
                          size={13}
                          className={settled ? 'text-sage' : 'text-charcoal'}
                        />
                        <Text className={`text-xs font-medium ${settled ? 'text-sage' : 'text-charcoal'}`}>
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
      </ScrollView>
    </SafeAreaView>
  );
}
