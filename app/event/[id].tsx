import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import PhotoViewer from '../../components/PhotoViewer';
import ShareSheet from '../../components/ShareSheet';
import { ME, getUser } from '../../data/mock';
import { getCountdownLabel } from '../../lib/eventCountdown';
import { addEventToCalendar } from '../../lib/ics';
import { formatOccurrence, getUpcomingOccurrences, RECURRENCE_LABEL } from '../../lib/recurrence';
import { useCarpoolStore } from '../../store/useCarpoolStore';
import { getEffectiveCheckedInIds, useCheckInStore } from '../../store/useCheckInStore';
import {
  getEffectiveRatings,
  getEffectiveRatingSummary,
  useEventRatingsStore,
} from '../../store/useEventRatingsStore';
import { getEventPhotos, useEventAlbumStore } from '../../store/useEventAlbumStore';
import { useEventUpdatesStore } from '../../store/useEventUpdatesStore';
import { canManageEvent, useEventsStore } from '../../store/useEventsStore';
import { FRIEND_LABEL, useFriendsStore } from '../../store/useFriendsStore';
import { useProfileStore } from '../../store/useProfileStore';
import { getEffectiveSpots, getWaitlistPosition, useRsvpStore } from '../../store/useRsvpStore';
import { useSavedEventsStore } from '../../store/useSavedEventsStore';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEventsStore((s) => s.events.find((e) => e.id === id));
  const deleteEvent = useEventsStore((s) => s.deleteEvent);
  const cancelEvent = useEventsStore((s) => s.cancelEvent);
  const reinstateEvent = useEventsStore((s) => s.reinstateEvent);
  const promoteCoHost = useEventsStore((s) => s.promoteCoHost);
  const demoteCoHost = useEventsStore((s) => s.demoteCoHost);
  const skipNextOccurrence = useEventsStore((s) => s.skipNextOccurrence);
  const profile = useProfileStore((s) => s.profile);
  const going = useRsvpStore((s) => (event ? (s.going[event.id] ?? false) : false));
  const waitlisted = useRsvpStore((s) => (event ? (s.waitlisted[event.id] ?? false) : false));
  const bringingGuest = useRsvpStore((s) => (event ? (s.plusOne[event.id] ?? false) : false));
  const toggleRsvp = useRsvpStore((s) => s.toggle);
  const togglePlusOne = useRsvpStore((s) => s.togglePlusOne);
  const joinWaitlist = useRsvpStore((s) => s.joinWaitlist);
  const leaveWaitlist = useRsvpStore((s) => s.leaveWaitlist);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const respondFriend = useFriendsStore((s) => s.respond);
  const myCheckedIn = useCheckInStore((s) => (event ? (s.myCheckIns[event.id] ?? false) : false));
  const toggleCheckIn = useCheckInStore((s) => s.toggleCheckIn);
  const checkInNotes = useCheckInStore((s) => s.checkInNotes);
  const albumPhotos = useEventAlbumStore((s) => s.photos);
  const addPhotos = useEventAlbumStore((s) => s.addPhotos);
  const removePhoto = useEventAlbumStore((s) => s.removePhoto);
  const photoCaptions = useEventAlbumStore((s) => s.captions);
  const setPhotoCaption = useEventAlbumStore((s) => s.setCaption);
  const allCarpoolOffers = useCarpoolStore((s) => s.offers);
  const allCarpoolRequests = useCarpoolStore((s) => s.requests);
  const offerRide = useCarpoolStore((s) => s.offerRide);
  const updateOffer = useCarpoolStore((s) => s.updateOffer);
  const cancelOffer = useCarpoolStore((s) => s.cancelOffer);
  const requestSeat = useCarpoolStore((s) => s.requestSeat);
  const leaveSeat = useCarpoolStore((s) => s.leaveSeat);
  const removeRider = useCarpoolStore((s) => s.removeRider);
  const offerSeatTo = useCarpoolStore((s) => s.offerSeatTo);
  const allEventUpdates = useEventUpdatesStore((s) => s.updates);
  const postEventUpdate = useEventUpdatesStore((s) => s.postUpdate);
  const requestRide = useCarpoolStore((s) => s.requestRide);
  const updateRequest = useCarpoolStore((s) => s.updateRequest);
  const cancelRideRequest = useCarpoolStore((s) => s.cancelRideRequest);
  const savedIds = useSavedEventsStore((s) => s.savedIds);
  const toggleSaveEvent = useSavedEventsStore((s) => s.toggleSave);
  const myRatings = useEventRatingsStore((s) => s.myRatings);
  const rateEvent = useEventRatingsStore((s) => s.rateEvent);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [confirmingCancelOfferId, setConfirmingCancelOfferId] = useState<string | null>(null);
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [attendeeQuery, setAttendeeQuery] = useState('');
  const [checkInNoteDraft, setCheckInNoteDraft] = useState('');
  const [updateDraft, setUpdateDraft] = useState('');
  const [confirmingRemoveRiderId, setConfirmingRemoveRiderId] = useState<string | null>(null);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [offeringRide, setOfferingRide] = useState(false);
  const [offerSeats, setOfferSeats] = useState(2);
  const [offerNote, setOfferNote] = useState('');
  const [requestingRide, setRequestingRide] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [requestingSeatOfferId, setRequestingSeatOfferId] = useState<string | null>(null);
  const [seatRequestNote, setSeatRequestNote] = useState('');
  const [sharing, setSharing] = useState(false);
  const [ratingDraftStars, setRatingDraftStars] = useState(0);
  const [ratingDraftComment, setRatingDraftComment] = useState('');
  const [editingRating, setEditingRating] = useState(false);
  const [viewingRatings, setViewingRatings] = useState(false);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState<number | null>(null);
  const [confirmingRemovePhotoId, setConfirmingRemovePhotoId] = useState<string | null>(null);

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
  const isCancelled = Boolean(event.cancelled);
  const countdownLabel = isPast || isCancelled ? null : getCountdownLabel(event);
  const isHost = event.hostId === ME.id;
  const canManage = canManageEvent(event, ME.id);
  const isCoHost = canManage && !isHost;
  const eventUpdates = allEventUpdates[event.id] ?? [];
  const { spotsTaken, spotsTotal, isFull } = getEffectiveSpots(event.id, going, bringingGuest);
  const waitlistPosition = getWaitlistPosition(event.id, waitlisted);
  const otherAttendees = event.attendeeIds.map((id) => getUser(id)).filter(Boolean);
  const attendees = going || canManage ? [profile, ...otherAttendees] : otherAttendees;
  const attendeeQ = attendeeQuery.trim().toLowerCase();
  const visibleAttendees =
    attendeeQ.length === 0
      ? attendees
      : attendees.filter((a) => a!.name.toLowerCase().includes(attendeeQ));
  const resolveUser = (userId: string) => (userId === ME.id ? profile : getUser(userId));
  const checkedIn = getEffectiveCheckedInIds(event, myCheckedIn)
    .map(resolveUser)
    .filter(Boolean);
  const eventPhotos = getEventPhotos(event.id, albumPhotos);
  const canAddPhotos = going || canManage;
  const canCheckIn = (going || canManage) && !isCancelled;
  const canCarpool = (going || canManage) && !isPast && !isCancelled;
  const occurrences = event.recurrence ? getUpcomingOccurrences(event, new Date()) : [];
  const carpoolOffers = allCarpoolOffers.filter((o) => o.eventId === event.id);
  const carpoolRequests = allCarpoolRequests.filter((r) => r.eventId === event.id);
  const myOffer = carpoolOffers.find((o) => o.driverId === ME.id);
  const myRequest = carpoolRequests.find((r) => r.riderId === ME.id);
  const saved = savedIds[event.id] ?? false;
  const myRating = myRatings[event.id];
  const ratingSummary = getEffectiveRatingSummary(event.id, myRating);
  const effectiveRatings = getEffectiveRatings(event.id, myRating);

  const remove = () => {
    deleteEvent(event.id);
    router.back();
  };

  const confirmCancel = () => {
    cancelEvent(event.id);
    setConfirmingCancel(false);
  };

  const submitOffer = () => {
    if (myOffer) {
      updateOffer(event.id, offerSeats, offerNote.trim());
    } else {
      offerRide(event.id, offerSeats, offerNote.trim());
    }
    setOfferingRide(false);
    setOfferNote('');
    setOfferSeats(2);
  };

  const startEditingOffer = () => {
    if (!myOffer) return;
    setOfferSeats(myOffer.seats);
    setOfferNote(myOffer.note);
    setOfferingRide(true);
  };

  const submitRequest = () => {
    if (myRequest) {
      updateRequest(event.id, requestNote.trim());
    } else {
      requestRide(event.id, requestNote.trim());
    }
    setRequestingRide(false);
    setRequestNote('');
  };

  const startEditingRequest = () => {
    if (!myRequest) return;
    setRequestNote(myRequest.note);
    setRequestingRide(true);
  };

  const startEditingRating = () => {
    setRatingDraftStars(myRating?.stars ?? 0);
    setRatingDraftComment(myRating?.comment ?? '');
    setEditingRating(true);
  };

  const submitRating = () => {
    if (ratingDraftStars === 0) return;
    rateEvent(event.id, ratingDraftStars, ratingDraftComment.trim());
    setEditingRating(false);
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
        <View className="flex-row items-center gap-1.5">
          <Pressable
            onPress={() => toggleSaveEvent(event.id)}
            className="h-9 w-9 items-center justify-center rounded-full bg-cream"
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={17}
              className={saved ? 'text-gold' : 'text-charcoal'}
            />
          </Pressable>
          {canManage && (
            <>
              {!isPast && (
                <Pressable
                  onPress={() => router.push(`/create-event?id=${event.id}`)}
                  className="h-9 w-9 items-center justify-center rounded-full bg-cream"
                >
                  <Ionicons name="pencil" size={17} className="text-charcoal" />
                </Pressable>
              )}
              <Pressable
                onPress={() => router.push(`/create-event?duplicateId=${event.id}`)}
                className="h-9 w-9 items-center justify-center rounded-full bg-cream"
              >
                <Ionicons name="copy-outline" size={17} className="text-charcoal" />
              </Pressable>
              {!isPast &&
                (isCancelled ? (
                  <Pressable
                    onPress={() => reinstateEvent(event.id)}
                    className="h-9 w-9 items-center justify-center rounded-full bg-cream"
                  >
                    <Ionicons name="arrow-undo-outline" size={17} className="text-sage" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => setConfirmingCancel(true)}
                    className="h-9 w-9 items-center justify-center rounded-full bg-cream"
                  >
                    <Ionicons name="ban-outline" size={17} className="text-terracotta" />
                  </Pressable>
                ))}
            </>
          )}
          {isHost && (
            <Pressable
              onPress={() => setConfirmingDelete(true)}
              className="h-9 w-9 items-center justify-center rounded-full bg-cream"
            >
              <Ionicons name="trash-outline" size={17} className="text-terracotta" />
            </Pressable>
          )}
        </View>
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

      {confirmingCancel && (
        <View className="gap-2 bg-terracotta/10 px-4 py-3">
          <Text className="text-sm text-charcoal">
            Cancel this event? It'll stay visible to neighbors, marked as cancelled, instead of
            disappearing.
          </Text>
          <View className="flex-row justify-end gap-4">
            <Pressable onPress={() => setConfirmingCancel(false)} className="rounded-full px-3 py-1.5">
              <Text className="text-sm font-medium text-charcoal/60">Keep it</Text>
            </Pressable>
            <Pressable onPress={confirmCancel} className="rounded-full bg-terracotta px-3 py-1.5">
              <Text className="text-sm font-semibold text-paper">Cancel event</Text>
            </Pressable>
          </View>
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
              <View className="flex-row items-center gap-1.5">
                <Text className="flex-1 text-lg font-bold text-charcoal" numberOfLines={1}>
                  {event.title}
                </Text>
                {isCancelled && (
                  <View className="rounded-full bg-terracotta/15 px-2.5 py-1">
                    <Text className="text-xs font-semibold text-terracotta">Cancelled</Text>
                  </View>
                )}
                {!isCancelled && countdownLabel && (
                  <View className="rounded-full bg-terracotta/15 px-2.5 py-1">
                    <Text className="text-xs font-semibold text-terracotta">{countdownLabel}</Text>
                  </View>
                )}
              </View>
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

          {(eventUpdates.length > 0 || canManage) && (
            <View className="mt-4 gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Updates
              </Text>
              {eventUpdates.map((u) => (
                <View key={u.id} className="rounded-2xl bg-sand p-3.5">
                  <Text className="text-sm leading-5 text-charcoal">{u.text}</Text>
                  <Text className="mt-1 text-xs text-charcoal/50">{u.time}</Text>
                </View>
              ))}
              {canManage &&
                (postingUpdate ? (
                  <View className="gap-2 rounded-2xl bg-sand p-3.5">
                    <TextInput
                      value={updateDraft}
                      onChangeText={setUpdateDraft}
                      placeholder="e.g. Bring your own chairs!"
                      placeholderTextColor="#3D3D3D80"
                      multiline
                      autoFocus
                      className="rounded-xl bg-cream px-3 py-2 text-sm text-charcoal"
                    />
                    <View className="flex-row justify-end gap-4">
                      <Pressable
                        onPress={() => {
                          setPostingUpdate(false);
                          setUpdateDraft('');
                        }}
                      >
                        <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          if (!updateDraft.trim()) return;
                          postEventUpdate(event.id, updateDraft);
                          setPostingUpdate(false);
                          setUpdateDraft('');
                        }}
                      >
                        <Text className="text-sm font-semibold text-terracotta">Send to attendees</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setPostingUpdate(true)}
                    className="flex-row items-center gap-2 rounded-2xl bg-sand p-3.5 active:opacity-80"
                  >
                    <Ionicons name="megaphone-outline" size={16} className="text-terracotta" />
                    <Text className="text-sm font-medium text-terracotta">
                      Post an update to attendees
                    </Text>
                  </Pressable>
                ))}
            </View>
          )}

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

          {isCancelled ? (
            <View className="mt-5 flex-row items-center justify-center gap-1.5 rounded-full bg-terracotta/15 py-3">
              <Ionicons name="ban-outline" size={15} className="text-terracotta" />
              <Text className="text-sm font-semibold text-terracotta">
                {canManage ? 'You cancelled this event' : 'Cancelled by the host'}
              </Text>
            </View>
          ) : canManage ? (
            <View className="mt-5 flex-row items-center justify-center gap-1.5 rounded-full bg-gold py-3">
              <Ionicons name="megaphone" size={15} className="text-charcoal" />
              <Text className="text-sm font-semibold text-charcoal">
                {isPast
                  ? isCoHost
                    ? 'You co-hosted this'
                    : 'You hosted this'
                  : isCoHost
                    ? "You're co-hosting"
                    : "You're hosting"}
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
                      ? `On waitlist · you're #${waitlistPosition} · tap to leave`
                      : isFull
                        ? 'Join waitlist'
                        : 'RSVP'}
                </Text>
              </Pressable>
            )
          )}

          {going && !isPast && (
            <Pressable
              onPress={() => togglePlusOne(event.id)}
              disabled={!bringingGuest && event.spotsTaken + 1 >= event.spotsTotal}
              className="mt-3 flex-row items-center justify-center gap-1.5 rounded-full border border-charcoal/15 py-3 active:opacity-70"
              style={
                !bringingGuest && event.spotsTaken + 1 >= event.spotsTotal
                  ? { opacity: 0.4 }
                  : undefined
              }
            >
              <Ionicons
                name={bringingGuest ? 'checkmark-circle' : 'person-add-outline'}
                size={16}
                className={bringingGuest ? 'text-sage' : 'text-charcoal'}
              />
              <Text
                className={`text-sm font-semibold ${bringingGuest ? 'text-sage' : 'text-charcoal'}`}
              >
                {bringingGuest ? "Bringing a guest (+1)" : 'Bring a guest (+1)'}
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => setSharing(true)}
            className="mt-3 flex-row items-center justify-center gap-1.5 rounded-full border border-charcoal/15 py-3 active:opacity-70"
          >
            <Ionicons name="arrow-redo-outline" size={16} className="text-charcoal" />
            <Text className="text-sm font-semibold text-charcoal">Share</Text>
          </Pressable>

          {!isPast && !isCancelled && (
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

          {canCheckIn &&
            (checkingIn ? (
              <View className="mt-3 gap-2 rounded-2xl bg-cream p-4">
                <TextInput
                  value={checkInNoteDraft}
                  onChangeText={setCheckInNoteDraft}
                  placeholder="Optional note, e.g. brought dessert!"
                  placeholderTextColor="#3D3D3D80"
                  className="rounded-xl bg-sand px-3 py-2.5 text-sm text-charcoal"
                />
                <View className="flex-row justify-end gap-4">
                  <Pressable
                    onPress={() => {
                      setCheckingIn(false);
                      setCheckInNoteDraft('');
                    }}
                  >
                    <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      toggleCheckIn(event.id, checkInNoteDraft);
                      setCheckingIn(false);
                      setCheckInNoteDraft('');
                    }}
                  >
                    <Text className="text-sm font-semibold text-terracotta">I'm here</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => (myCheckedIn ? toggleCheckIn(event.id) : setCheckingIn(true))}
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
            ))}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          {isPast ? 'Who was there' : `Attending · ${spotsTaken}/${spotsTotal} spots`}
        </Text>
        {attendees.length > 3 && (
          <View className="mb-3 flex-row items-center rounded-full bg-cream px-4 py-2.5">
            <Ionicons name="search" size={16} className="text-charcoal/50" />
            <TextInput
              value={attendeeQuery}
              onChangeText={setAttendeeQuery}
              placeholder="Search attendees..."
              placeholderTextColor="#3D3D3D80"
              className="ml-2 flex-1 text-sm text-charcoal"
            />
            {attendeeQuery.length > 0 && (
              <Pressable onPress={() => setAttendeeQuery('')}>
                <Ionicons name="close-circle" size={16} className="text-charcoal/50" />
              </Pressable>
            )}
          </View>
        )}
        {visibleAttendees.length === 0 && (
          <Text className="text-sm text-charcoal/50">
            No attendees match "{attendeeQuery.trim()}".
          </Text>
        )}
        <View className="gap-3">
          {visibleAttendees.map((a) => {
            const isMe = a!.id === ME.id;
            const isAttendeeHost = a!.id === event.hostId;
            const isAttendeeCoHost = (event.coHostIds ?? []).includes(a!.id);
            return (
              <Pressable
                key={a!.id}
                onPress={() => !isMe && router.push(`/profile/${a!.id}`)}
                className="flex-row items-center gap-3 rounded-2xl bg-cream p-3 active:opacity-70"
              >
                <Image source={{ uri: a!.avatar }} className="h-11 w-11 rounded-full" />
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="font-medium text-charcoal">{isMe ? 'You' : a!.name}</Text>
                    {isMe && bringingGuest && (
                      <View className="rounded-full bg-sage/20 px-2 py-0.5">
                        <Text className="text-[10px] font-bold text-sage">+1 GUEST</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-charcoal/50" numberOfLines={1}>
                    {a!.tagline}
                  </Text>
                </View>
                {isAttendeeCoHost && (
                  <View className="flex-row items-center gap-1.5">
                    <View className="rounded-full bg-sage/20 px-2.5 py-1">
                      <Text className="text-xs font-semibold text-sage">🛡️ Co-host</Text>
                    </View>
                    {isHost && (
                      <Pressable
                        onPress={(evt) => {
                          evt.stopPropagation();
                          demoteCoHost(event.id, a!.id);
                        }}
                        className="h-7 w-7 items-center justify-center rounded-full bg-sand"
                      >
                        <Ionicons name="close" size={14} className="text-charcoal/60" />
                      </Pressable>
                    )}
                  </View>
                )}
                {isHost && !isAttendeeCoHost && !isAttendeeHost && (
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      promoteCoHost(event.id, a!.id);
                    }}
                    className="rounded-full bg-sand px-3 py-1.5"
                  >
                    <Text className="text-xs font-semibold text-charcoal">Make co-host</Text>
                  </Pressable>
                )}
              </Pressable>
            );
          })}
        </View>

        {isPast && (
          <>
            <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Rating
            </Text>
            <View className="rounded-2xl bg-cream p-4">
              {ratingSummary.count > 0 && (
                <Pressable
                  onPress={() => setViewingRatings(true)}
                  className="mb-3 flex-row items-center gap-2"
                >
                  <View className="flex-row">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Ionicons
                        key={n}
                        name={n <= Math.round(ratingSummary.avg) ? 'star' : 'star-outline'}
                        size={16}
                        className="text-gold"
                      />
                    ))}
                  </View>
                  <Text className="text-sm text-charcoal/60">
                    {ratingSummary.avg.toFixed(1)} · {ratingSummary.count} rating
                    {ratingSummary.count === 1 ? '' : 's'}
                  </Text>
                </Pressable>
              )}

              {editingRating ? (
                <View className="gap-3">
                  <View className="flex-row gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Pressable key={n} onPress={() => setRatingDraftStars(n)}>
                        <Ionicons
                          name={n <= ratingDraftStars ? 'star' : 'star-outline'}
                          size={28}
                          className="text-gold"
                        />
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    value={ratingDraftComment}
                    onChangeText={setRatingDraftComment}
                    placeholder="Add a comment (optional)"
                    placeholderTextColor="#3D3D3D80"
                    multiline
                    className="rounded-xl bg-sand px-3 py-2.5 text-sm text-charcoal"
                  />
                  <View className="flex-row justify-end gap-4">
                    <Pressable onPress={() => setEditingRating(false)}>
                      <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                    </Pressable>
                    <Pressable onPress={submitRating} disabled={ratingDraftStars === 0}>
                      <Text
                        className={`text-sm font-semibold ${
                          ratingDraftStars === 0 ? 'text-charcoal/30' : 'text-terracotta'
                        }`}
                      >
                        Save
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : myRating ? (
                <Pressable
                  onPress={startEditingRating}
                  className="flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                      Your rating
                    </Text>
                    <View className="mt-1 flex-row">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Ionicons
                          key={n}
                          name={n <= myRating.stars ? 'star' : 'star-outline'}
                          size={16}
                          className="text-gold"
                        />
                      ))}
                    </View>
                    {myRating.comment.length > 0 && (
                      <Text className="mt-1.5 text-sm text-charcoal/70">{myRating.comment}</Text>
                    )}
                  </View>
                  <Ionicons name="pencil" size={16} className="text-charcoal/40" />
                </Pressable>
              ) : (
                <Pressable
                  onPress={startEditingRating}
                  className="flex-row items-center justify-center gap-1.5 rounded-full bg-sand py-2.5"
                >
                  <Ionicons name="star-outline" size={16} className="text-charcoal" />
                  <Text className="text-sm font-semibold text-charcoal">Rate this event</Text>
                </Pressable>
              )}
            </View>
          </>
        )}

        {(canCarpool || carpoolOffers.length > 0 || carpoolRequests.length > 0) && (
          <>
            <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Carpool
            </Text>
            <View className="gap-3">
              {carpoolOffers.map((offer) => {
                const driver = resolveUser(offer.driverId);
                if (!driver) return null;
                const isMyOffer = offer.driverId === ME.id;
                const iAmRiding = offer.riderIds.includes(ME.id);
                const full = offer.riderIds.length >= offer.seats;
                return (
                  <View key={offer.id} className="rounded-2xl bg-cream p-4">
                    <View className="flex-row items-center gap-3">
                      <Image source={{ uri: driver.avatar }} className="h-10 w-10 rounded-full" />
                      <View className="flex-1">
                        <Text className="font-medium text-charcoal">
                          {isMyOffer ? 'You' : driver.name} driving · {offer.riderIds.length}/
                          {offer.seats} seats
                        </Text>
                        {offer.note.length > 0 && (
                          <Text className="mt-0.5 text-xs text-charcoal/50">{offer.note}</Text>
                        )}
                      </View>
                    </View>

                    {isMyOffer && offer.riderIds.length > 0 && (
                      <View className="mt-3 gap-2 border-t border-charcoal/10 pt-3">
                        {offer.riderIds.map((riderId) => {
                          const rider = resolveUser(riderId);
                          if (!rider) return null;
                          if (confirmingRemoveRiderId === riderId) {
                            return (
                              <View key={riderId} className="gap-2 rounded-xl bg-terracotta/10 p-3">
                                <Text className="text-sm text-charcoal">
                                  Remove {rider.name} from your carpool?
                                </Text>
                                <View className="flex-row justify-end gap-4">
                                  <Pressable onPress={() => setConfirmingRemoveRiderId(null)}>
                                    <Text className="text-sm font-medium text-charcoal/60">
                                      Keep them
                                    </Text>
                                  </Pressable>
                                  <Pressable
                                    onPress={() => {
                                      removeRider(offer.id, riderId);
                                      setConfirmingRemoveRiderId(null);
                                    }}
                                  >
                                    <Text className="text-sm font-semibold text-terracotta">
                                      Remove
                                    </Text>
                                  </Pressable>
                                </View>
                              </View>
                            );
                          }
                          const riderNote = offer.riderNotes?.[riderId];
                          return (
                            <View key={riderId} className="flex-row items-center gap-2.5">
                              <Pressable
                                onPress={() => router.push(`/profile/${riderId}`)}
                                className="flex-1 flex-row items-center gap-2.5 active:opacity-70"
                              >
                                <Image
                                  source={{ uri: rider.avatar }}
                                  className="h-7 w-7 rounded-full"
                                />
                                <View className="flex-1">
                                  <Text className="text-sm text-charcoal">{rider.name}</Text>
                                  {riderNote && (
                                    <Text className="text-xs text-charcoal/50">{riderNote}</Text>
                                  )}
                                </View>
                              </Pressable>
                              <Pressable
                                onPress={() => setConfirmingRemoveRiderId(riderId)}
                                className="h-7 w-7 items-center justify-center"
                              >
                                <Ionicons
                                  name="close-circle-outline"
                                  size={17}
                                  className="text-charcoal/40"
                                />
                              </Pressable>
                            </View>
                          );
                        })}
                      </View>
                    )}
                    {canCarpool && confirmingCancelOfferId === offer.id && (
                      <View className="mt-3 gap-2 border-t border-charcoal/10 pt-3">
                        <Text className="text-sm text-charcoal">
                          {offer.riderIds.length > 0
                            ? `Cancel your offer to drive? ${offer.riderIds.length} neighbor${offer.riderIds.length === 1 ? '' : 's'} already claimed a seat and will need another ride.`
                            : 'Cancel your offer to drive?'}
                        </Text>
                        <View className="flex-row justify-end gap-4">
                          <Pressable onPress={() => setConfirmingCancelOfferId(null)}>
                            <Text className="text-sm font-medium text-charcoal/60">Keep it</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              cancelOffer(event.id);
                              setConfirmingCancelOfferId(null);
                            }}
                          >
                            <Text className="text-sm font-semibold text-terracotta">
                              Cancel offer
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                    {canCarpool && confirmingCancelOfferId !== offer.id && (
                      <View className="mt-3 flex-row items-center justify-end gap-2 border-t border-charcoal/10 pt-3">
                        {isMyOffer ? (
                          <>
                            <Pressable
                              onPress={startEditingOffer}
                              className="rounded-full bg-sand px-4 py-1.5"
                            >
                              <Text className="text-xs font-semibold text-charcoal">Edit</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => setConfirmingCancelOfferId(offer.id)}
                              className="rounded-full bg-sand px-4 py-1.5"
                            >
                              <Text className="text-xs font-semibold text-charcoal">
                                Cancel offer
                              </Text>
                            </Pressable>
                          </>
                        ) : iAmRiding ? (
                          <Pressable
                            onPress={() => leaveSeat(offer.id)}
                            className="rounded-full bg-sage/20 px-4 py-1.5"
                          >
                            <Text className="text-xs font-semibold text-sage">
                              You're riding ✓
                            </Text>
                          </Pressable>
                        ) : full ? (
                          <Text className="text-xs text-charcoal/50">Full</Text>
                        ) : (
                          <Pressable
                            onPress={() => {
                              setRequestingSeatOfferId(offer.id);
                              setSeatRequestNote('');
                            }}
                            className="rounded-full bg-ink px-4 py-1.5"
                          >
                            <Text className="text-xs font-semibold text-paper">
                              Request a seat
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    )}
                    {requestingSeatOfferId === offer.id && (
                      <View className="mt-3 gap-2 border-t border-charcoal/10 pt-3">
                        <TextInput
                          value={seatRequestNote}
                          onChangeText={setSeatRequestNote}
                          placeholder="Optional note, e.g. I'll bring snacks!"
                          placeholderTextColor="#3D3D3D80"
                          className="rounded-xl bg-sand px-3 py-2.5 text-sm text-charcoal"
                        />
                        <View className="flex-row justify-end gap-4">
                          <Pressable
                            onPress={() => {
                              setRequestingSeatOfferId(null);
                              setSeatRequestNote('');
                            }}
                          >
                            <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              requestSeat(offer.id, seatRequestNote);
                              setRequestingSeatOfferId(null);
                              setSeatRequestNote('');
                            }}
                          >
                            <Text className="text-sm font-semibold text-terracotta">
                              Request seat
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}

              {canCarpool &&
                (offeringRide ? (
                  <View className="gap-2.5 rounded-2xl bg-cream p-4">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                      Seats available
                    </Text>
                    <View className="flex-row gap-2">
                      {[1, 2, 3, 4].map((n) => {
                        const minSeats = myOffer?.riderIds.length ?? 0;
                        const tooFew = n < minSeats;
                        return (
                          <Pressable
                            key={n}
                            disabled={tooFew}
                            onPress={() => setOfferSeats(n)}
                            className={`h-9 w-9 items-center justify-center rounded-full ${
                              offerSeats === n ? 'bg-terracotta' : 'bg-sand'
                            } ${tooFew ? 'opacity-30' : ''}`}
                          >
                            <Text
                              className={`text-sm font-semibold ${
                                offerSeats === n ? 'text-paper' : 'text-charcoal'
                              }`}
                            >
                              {n}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <TextInput
                      value={offerNote}
                      onChangeText={setOfferNote}
                      placeholder="Where you're leaving from, timing..."
                      placeholderTextColor="#3D3D3D80"
                      className="rounded-xl bg-sand px-3 py-2.5 text-sm text-charcoal"
                    />
                    <View className="flex-row justify-end gap-4">
                      <Pressable
                        onPress={() => {
                          setOfferingRide(false);
                          setOfferNote('');
                          setOfferSeats(2);
                        }}
                      >
                        <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                      </Pressable>
                      <Pressable onPress={submitOffer}>
                        <Text className="text-sm font-semibold text-terracotta">
                          {myOffer ? 'Save' : 'Post'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  !myOffer && (
                    <Pressable
                      onPress={() => setOfferingRide(true)}
                      className="flex-row items-center gap-2 rounded-2xl bg-sand p-4 active:opacity-80"
                    >
                      <Ionicons name="car-outline" size={18} className="text-charcoal" />
                      <Text className="text-sm font-medium text-charcoal">Offer to drive</Text>
                    </Pressable>
                  )
                ))}

              {carpoolRequests.length > 0 && (
                <View className="mt-2 gap-2">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    Need a ride
                  </Text>
                  {carpoolRequests.map((req) => {
                    const rider = resolveUser(req.riderId);
                    if (!rider) return null;
                    const isMe = req.riderId === ME.id;
                    const canOfferSeat =
                      !isMe && !!myOffer && myOffer.riderIds.length < myOffer.seats;
                    return (
                      <View
                        key={req.id}
                        className="flex-row items-center gap-3 rounded-2xl bg-cream p-3"
                      >
                        <Image source={{ uri: rider.avatar }} className="h-9 w-9 rounded-full" />
                        <View className="flex-1">
                          <Text className="text-sm text-charcoal">{isMe ? 'You' : rider.name}</Text>
                          {req.note.length > 0 && (
                            <Text className="text-xs text-charcoal/50">{req.note}</Text>
                          )}
                        </View>
                        {isMe && !requestingRide && (
                          <>
                            <Pressable
                              onPress={startEditingRequest}
                              className="h-7 w-7 items-center justify-center rounded-full"
                            >
                              <Ionicons name="pencil" size={13} className="text-charcoal/50" />
                            </Pressable>
                            <Pressable
                              onPress={() => cancelRideRequest(event.id)}
                              className="h-7 w-7 items-center justify-center rounded-full"
                            >
                              <Ionicons name="close" size={14} className="text-charcoal/50" />
                            </Pressable>
                          </>
                        )}
                        {canOfferSeat && (
                          <Pressable
                            onPress={() => offerSeatTo(event.id, req.riderId)}
                            className="rounded-full bg-terracotta px-3 py-1.5"
                          >
                            <Text className="text-xs font-semibold text-paper">Offer a seat</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {canCarpool &&
                (requestingRide ? (
                  <View className="gap-2.5 rounded-2xl bg-cream p-4">
                    <TextInput
                      value={requestNote}
                      onChangeText={setRequestNote}
                      placeholder="Where you'd need to be picked up..."
                      placeholderTextColor="#3D3D3D80"
                      className="rounded-xl bg-sand px-3 py-2.5 text-sm text-charcoal"
                    />
                    <View className="flex-row justify-end gap-4">
                      <Pressable
                        onPress={() => {
                          setRequestingRide(false);
                          setRequestNote('');
                        }}
                      >
                        <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                      </Pressable>
                      <Pressable onPress={submitRequest}>
                        <Text className="text-sm font-semibold text-terracotta">
                          {myRequest ? 'Save' : 'Post'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  !myRequest && (
                    <Pressable
                      onPress={() => setRequestingRide(true)}
                      className="flex-row items-center gap-2 rounded-2xl bg-sand p-4 active:opacity-80"
                    >
                      <Ionicons name="hand-left-outline" size={18} className="text-charcoal" />
                      <Text className="text-sm font-medium text-charcoal">I need a ride</Text>
                    </Pressable>
                  )
                ))}
            </View>
          </>
        )}

        {(eventPhotos.length > 0 || canAddPhotos) && (
          <>
            <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Photos from this event{eventPhotos.length > 0 ? ` (${eventPhotos.length})` : ''}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {eventPhotos.map((photo, index) => (
                <View key={photo.id} className="w-[31%]" style={{ aspectRatio: 1 }}>
                  <Pressable onPress={() => setViewingPhotoIndex(index)}>
                    <Image source={{ uri: photo.uri }} className="h-full w-full rounded-xl" />
                  </Pressable>
                  {photo.uploaderId === ME.id && (
                    <Pressable
                      onPress={() => setConfirmingRemovePhotoId(photo.id)}
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
                    <View className="flex-1">
                      <Text className="text-sm text-charcoal">{isMe ? 'You' : p!.name}</Text>
                      {isMe && checkInNotes[event.id] && (
                        <Text className="text-xs text-charcoal/50">{checkInNotes[event.id]}</Text>
                      )}
                    </View>
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

      {sharing && (
        <ShareSheet
          title="Share event"
          link={`https://neighbor.app/event/${event.id}`}
          previewText={`${event.title} — ${event.date}, ${event.time} at ${event.location}`}
          onClose={() => setSharing(false)}
        />
      )}

      {viewingPhotoIndex !== null && (
        <PhotoViewer
          uris={eventPhotos.map((p) => p.uri)}
          initialIndex={viewingPhotoIndex}
          onClose={() => setViewingPhotoIndex(null)}
          captions={eventPhotos.map((p) => photoCaptions[p.id] ?? '')}
          editableIndices={eventPhotos.map((p) => p.uploaderId === ME.id)}
          onCaptionChange={(i, text) => setPhotoCaption(eventPhotos[i].id, text)}
        />
      )}

      {confirmingRemovePhotoId && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable
            className="absolute inset-0"
            onPress={() => setConfirmingRemovePhotoId(null)}
          />
          <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <Text className="text-sm text-charcoal">
              Remove this photo? This can't be undone.
            </Text>
            <View className="flex-row justify-end gap-4">
              <Pressable onPress={() => setConfirmingRemovePhotoId(null)}>
                <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  removePhoto(confirmingRemovePhotoId);
                  setConfirmingRemovePhotoId(null);
                }}
              >
                <Text className="text-sm font-semibold text-terracotta">Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {viewingRatings && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={() => setViewingRatings(false)} />
          <View className="max-h-[70%] w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">Ratings & reviews</Text>
              <Pressable
                onPress={() => setViewingRatings(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-2">
                {effectiveRatings.map((r) => {
                  const isMe = r.userId === ME.id;
                  const person = isMe ? profile : getUser(r.userId);
                  if (!person) return null;
                  return (
                    <Pressable
                      key={r.userId}
                      onPress={() => {
                        if (isMe) return;
                        setViewingRatings(false);
                        router.push(`/profile/${r.userId}`);
                      }}
                      className="gap-1.5 rounded-2xl bg-sand p-3 active:opacity-70"
                    >
                      <View className="flex-row items-center gap-2.5">
                        <Image source={{ uri: person.avatar }} className="h-8 w-8 rounded-full" />
                        <Text className="flex-1 font-medium text-charcoal">
                          {isMe ? 'You' : person.name}
                        </Text>
                        <View className="flex-row">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Ionicons
                              key={n}
                              name={n <= r.stars ? 'star' : 'star-outline'}
                              size={13}
                              className="text-gold"
                            />
                          ))}
                        </View>
                      </View>
                      {r.comment.length > 0 && (
                        <Text className="text-sm leading-5 text-charcoal/70">{r.comment}</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
