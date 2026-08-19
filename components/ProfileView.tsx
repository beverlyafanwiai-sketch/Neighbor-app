import { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';

import { GROUP_SELFIE_SVG } from '../assets/illustrations/group-selfie';
import { getUser, ME, type User, type VerificationBadge } from '../data/mock';
import {
  formatMutualTrustLine,
  formatOwnTrustLine,
  getEventsAttendedTogether,
  getMutualFriends,
  getSharedGroups,
  getSharedTags,
} from '../lib/trust';
import { getAvailableNote, isAvailable, useAvailabilityStore } from '../store/useAvailabilityStore';
import { useCheckInStore } from '../store/useCheckInStore';
import { getEndorsementGroups, useEndorsementsStore } from '../store/useEndorsementsStore';
import { FRIEND_LABEL, useFriendsStore } from '../store/useFriendsStore';
import { useGroupsStore } from '../store/useGroupsStore';
import { usePostsStore } from '../store/usePostsStore';
import { useProfileNotesStore } from '../store/useProfileNotesStore';
import { useProfileStore } from '../store/useProfileStore';
import { getWelcomeNotes, useWelcomeNotesStore } from '../store/useWelcomeNotesStore';
import EmptyState from './EmptyState';
import ReactionButton from './ReactionButton';
import ShareSheet from './ShareSheet';

const TABS = ['About', 'Prompts', 'Photos', 'Friends'] as const;
type Tab = (typeof TABS)[number];

const VERIFICATION_META: Record<
  VerificationBadge,
  { label: string; icon: keyof typeof Ionicons.glyphMap; description: string }
> = {
  id: {
    label: 'ID Verified',
    icon: 'card-outline',
    description: 'This neighbor confirmed their identity with a government-issued ID.',
  },
  phone: {
    label: 'Phone Verified',
    icon: 'call-outline',
    description: 'This neighbor confirmed a working phone number tied to their account.',
  },
  social: {
    label: 'Social Linked',
    icon: 'link-outline',
    description: 'This neighbor linked an outside social profile to help build trust.',
  },
};

export const CONVERSATION_STARTER_META: {
  key: keyof User['conversationStarters'];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'askMeAbout', label: 'Ask me about...', icon: 'chatbubbles-outline' },
  { key: 'skillsToShare', label: 'Skills I can share', icon: 'bulb-outline' },
  { key: 'neighborhoodLove', label: 'Things I love about our neighborhood', icon: 'heart-outline' },
];

type Props = {
  user: User;
  isMe: boolean;
  friends: User[];
  onBack?: () => void;
  onMessage?: () => void;
  onFriendPress?: (friend: User) => void;
  onEdit?: () => void;
  onSettings?: () => void;
  onMoreOptions?: () => void;
  onSavedPosts?: () => void;
  onRecs?: () => void;
  onFriendRequests?: () => void;
  onPhotoPress?: (postId: string) => void;
  onCreatePost?: () => void;
  onGroupPress?: (groupId: string) => void;
  onEventPress?: (eventId: string) => void;
};

export default function ProfileView({
  user,
  isMe,
  friends,
  onBack,
  onMessage,
  onFriendPress,
  onEdit,
  onSettings,
  onMoreOptions,
  onSavedPosts,
  onRecs,
  onFriendRequests,
  onPhotoPress,
  onCreatePost,
  onGroupPress,
  onEventPress,
}: Props) {
  const [tab, setTab] = useState<Tab>('About');
  const myAvailable = useAvailabilityStore((s) => s.myAvailable);
  const setAvailable = useAvailabilityStore((s) => s.setAvailable);
  const myAvailableNote = useAvailabilityStore((s) => s.myAvailableNote);
  const setAvailableNote = useAvailabilityStore((s) => s.setAvailableNote);
  const available = isAvailable(user, myAvailable);
  const availableNote = getAvailableNote(user, myAvailableNote);
  const [editingAvailableNote, setEditingAvailableNote] = useState(false);
  const [availableNoteDraft, setAvailableNoteDraft] = useState('');
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const friendStatus = friendStatuses[user.id] ?? 'none';
  const pendingRequestCount = Object.values(friendStatuses).filter(
    (status) => status === 'pending_in'
  ).length;
  const respondFriend = useFriendsStore((s) => s.respond);
  const sendFriendRequest = useFriendsStore((s) => s.sendRequest);
  const friendRequestNotes = useFriendsStore((s) => s.requestNotes);
  const [composingFriendRequest, setComposingFriendRequest] = useState(false);
  const profileNotes = useProfileNotesStore((s) => s.notes);
  const setProfileNote = useProfileNotesStore((s) => s.setNote);
  const [editingProfileNote, setEditingProfileNote] = useState(false);
  const [profileNoteDraft, setProfileNoteDraft] = useState('');
  const [friendRequestNoteDraft, setFriendRequestNoteDraft] = useState('');
  const joinedGroups = useGroupsStore((s) => s.joined);
  const posts = usePostsStore((s) => s.posts);
  const photoPosts = posts.filter((p) => p.authorId === user.id && (p.imageUris?.length ?? 0) > 0);
  const allWelcomeNotes = useWelcomeNotesStore((s) => s.notes);
  const addWelcomeNote = useWelcomeNotesStore((s) => s.addNote);
  const deleteWelcomeNote = useWelcomeNotesStore((s) => s.deleteNote);
  const editWelcomeNote = useWelcomeNotesStore((s) => s.editNote);
  const myNoteReactions = useWelcomeNotesStore((s) => s.myReactions);
  const tapNoteReaction = useWelcomeNotesStore((s) => s.tapReaction);
  const setNoteReaction = useWelcomeNotesStore((s) => s.setReaction);
  const welcomeNotes = getWelcomeNotes(user.id, allWelcomeNotes);
  const [composingNote, setComposingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [confirmingDeleteNoteId, setConfirmingDeleteNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteDraft, setEditNoteDraft] = useState('');
  const endorsements = useEndorsementsStore((s) => s.endorsements);
  const addEndorsement = useEndorsementsStore((s) => s.addEndorsement);
  const removeEndorsement = useEndorsementsStore((s) => s.removeEndorsement);
  const updateEndorsementNote = useEndorsementsStore((s) => s.updateEndorsementNote);
  const endorsementGroups = getEndorsementGroups(user.id, endorsements);
  const [composingEndorsement, setComposingEndorsement] = useState(false);
  const [endorsementDraft, setEndorsementDraft] = useState('');
  const [endorsementNoteDraft, setEndorsementNoteDraft] = useState('');
  const [editingEndorsementSkill, setEditingEndorsementSkill] = useState<string | null>(null);
  const [endorsementNoteEditDraft, setEndorsementNoteEditDraft] = useState('');
  const [confirmingUnfriend, setConfirmingUnfriend] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [viewingConnections, setViewingConnections] = useState(false);
  const [viewingBadge, setViewingBadge] = useState<VerificationBadge | null>(null);
  const [friendQuery, setFriendQuery] = useState('');
  const [confirmingRemoveEndorsementSkill, setConfirmingRemoveEndorsementSkill] = useState<
    string | null
  >(null);

  const myCheckIns = useCheckInStore((s) => s.myCheckIns);
  const myProfile = useProfileStore((s) => s.profile);
  const sharedInterests = isMe ? [] : getSharedTags(user.tags, myProfile.tags);
  const myFriendIds = Object.keys(friendStatuses).filter((id) => friendStatuses[id] === 'friends');
  const myJoinedGroupIds = Object.keys(joinedGroups).filter((id) => joinedGroups[id]);
  const trustLine = isMe
    ? formatOwnTrustLine(myFriendIds.length, myJoinedGroupIds.length, myCheckIns)
    : formatMutualTrustLine(user, myFriendIds, ME.id, myJoinedGroupIds, myCheckIns);
  const sharedGroups = isMe ? [] : getSharedGroups(user.id, myJoinedGroupIds);
  const mutualFriends = isMe ? [] : getMutualFriends(user, myFriendIds, ME.id);
  const eventsTogether = isMe ? [] : getEventsAttendedTogether(user.id, myCheckIns);
  const hasConnections =
    mutualFriends.length > 0 || sharedGroups.length > 0 || eventsTogether.length > 0;
  const friendQ = friendQuery.trim().toLowerCase();
  const visibleFriends =
    friendQ.length === 0 ? friends : friends.filter((f) => f.name.toLowerCase().includes(friendQ));

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-cream">
      <View className="items-center overflow-hidden rounded-b-[36px] bg-terracotta pb-8 pt-10">
        {user.coverImageUri && (
          <>
            <Image
              source={{ uri: user.coverImageUri }}
              className="absolute inset-0 h-full w-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-ink/45" />
          </>
        )}
        {onBack && (
          <Pressable
            onPress={onBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="absolute left-4 top-10 h-9 w-9 items-center justify-center rounded-full bg-cream/20"
          >
            <Ionicons name="chevron-back" size={22} className="text-paper" />
          </Pressable>
        )}
        {isMe && (
          <View className="absolute right-4 top-10 flex-row items-center gap-1.5">
            {onFriendRequests && (
              <Pressable
                onPress={onFriendRequests}
                accessibilityLabel={
                  pendingRequestCount > 0
                    ? `Friend requests, ${pendingRequestCount} pending`
                    : 'Friend requests'
                }
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
                style={{ position: 'relative' }}
              >
                <Ionicons name="person-add-outline" size={18} className="text-paper" />
                {pendingRequestCount > 0 && (
                  <View className="absolute -right-0.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1">
                    <Text className="text-[10px] font-bold text-charcoal">
                      {pendingRequestCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}
            {onRecs && (
              <Pressable
                onPress={onRecs}
                accessibilityLabel="Your recs"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="star-outline" size={19} className="text-paper" />
              </Pressable>
            )}
            {onSavedPosts && (
              <Pressable
                onPress={onSavedPosts}
                accessibilityLabel="Saved posts"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="bookmark-outline" size={19} className="text-paper" />
              </Pressable>
            )}
            <Pressable
              onPress={() => setSharing(true)}
              accessibilityLabel="Share profile"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
            >
              <Ionicons name="arrow-redo-outline" size={18} className="text-paper" />
            </Pressable>
            {onSettings && (
              <Pressable
                onPress={onSettings}
                accessibilityLabel="Settings"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="settings-outline" size={20} className="text-paper" />
              </Pressable>
            )}
          </View>
        )}
        {!isMe && (
          <View className="absolute right-4 top-10 flex-row items-center gap-1.5">
            <Pressable
              onPress={() => setSharing(true)}
              accessibilityLabel="Share profile"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
            >
              <Ionicons name="arrow-redo-outline" size={18} className="text-paper" />
            </Pressable>
            {onMoreOptions && (
              <Pressable
                onPress={onMoreOptions}
                accessibilityLabel="More options"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="ellipsis-horizontal" size={20} className="text-paper" />
              </Pressable>
            )}
          </View>
        )}
        <Image
          source={{ uri: user.avatar }}
          className="h-24 w-24 rounded-full border-4 border-cream"
        />
        <View className="mt-3 flex-row items-baseline gap-2">
          <Text className="text-2xl font-bold text-paper">{user.name}</Text>
          {user.pronouns && <Text className="text-sm text-sand">{user.pronouns}</Text>}
        </View>
        <Text className="mt-1 text-sm text-sand">{user.tagline}</Text>

        {user.neighborhood.length > 0 && (
          <View className="mt-2 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={13} className="text-paper" />
            <Text className="text-xs text-sand">
              {user.neighborhood}
              {user.yearsInArea ? ` · ${user.yearsInArea}` : ''}
            </Text>
          </View>
        )}

        {user.link && (
          <Pressable
            onPress={() => {
              const url = /^https?:\/\//i.test(user.link!) ? user.link! : `https://${user.link}`;
              Linking.openURL(url).catch(() => {});
            }}
            className="mt-2 flex-row items-center gap-1"
          >
            <Ionicons name="link-outline" size={13} className="text-sand" />
            <Text className="text-xs text-sand underline" numberOfLines={1}>
              {user.link}
            </Text>
          </Pressable>
        )}

        {isMe ? (
          <>
            <Pressable
              onPress={() => setAvailable(!myAvailable)}
              className={`mt-3 flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
                myAvailable ? 'bg-sage' : 'bg-cream/20'
              }`}
            >
              <Ionicons
                name={myAvailable ? 'sunny' : 'sunny-outline'}
                size={13}
                className={myAvailable ? 'text-charcoal' : 'text-paper'}
              />
              <Text className={`text-xs font-semibold ${myAvailable ? 'text-charcoal' : 'text-paper'}`}>
                {myAvailable ? 'Free for a coffee or walk today' : "Tap if you're free today"}
              </Text>
            </Pressable>
            {myAvailable &&
              (editingAvailableNote ? (
                <View className="mt-2 w-full flex-row items-center gap-2 px-6">
                  <TextInput
                    value={availableNoteDraft}
                    onChangeText={setAvailableNoteDraft}
                    placeholder="e.g. free after 3pm"
                    placeholderTextColor="#FAF3E680"
                    autoFocus
                    className="flex-1 rounded-full bg-cream/20 px-4 py-2 text-sm text-paper"
                  />
                  <Pressable onPress={() => setEditingAvailableNote(false)} className="px-1 py-2">
                    <Text className="text-xs font-semibold text-sand">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setAvailableNote(availableNoteDraft);
                      setEditingAvailableNote(false);
                    }}
                    className="rounded-full bg-sage px-3 py-2"
                  >
                    <Text className="text-xs font-semibold text-charcoal">Save</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    setAvailableNoteDraft(myAvailableNote);
                    setEditingAvailableNote(true);
                  }}
                  className="mt-2"
                >
                  <Text className="text-xs text-sand">
                    {myAvailableNote ? myAvailableNote : 'Add a note'}
                  </Text>
                </Pressable>
              ))}
          </>
        ) : (
          available && (
            <>
              <View className="mt-3 flex-row items-center gap-1.5 rounded-full bg-sage px-4 py-2">
                <Ionicons name="sunny" size={13} className="text-charcoal" />
                <Text className="text-xs font-semibold text-charcoal">
                  Free for a coffee or walk today
                </Text>
              </View>
              {availableNote.length > 0 && (
                <Text className="mt-2 text-xs text-sand">{availableNote}</Text>
              )}
            </>
          )
        )}

        {user.verifications.length > 0 && (
          <View className="mt-3 flex-row flex-wrap justify-center gap-1.5 px-6">
            {user.verifications.map((v) => (
              <Pressable
                key={v}
                onPress={() => setViewingBadge(v)}
                className="flex-row items-center gap-1 rounded-full bg-cream/20 px-2.5 py-1 active:opacity-70"
              >
                <Ionicons name={VERIFICATION_META[v].icon} size={11} className="text-paper" />
                <Text className="text-[10px] font-semibold text-paper">
                  {VERIFICATION_META[v].label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {confirmingUnfriend ? (
          <View className="mt-5 flex-row items-center gap-4 rounded-full bg-cream/20 px-5 py-2.5">
            <Text className="text-sm text-paper">Unfriend {user.name}?</Text>
            <Pressable onPress={() => setConfirmingUnfriend(false)}>
              <Text className="text-sm font-medium text-paper/70">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                respondFriend(user.id);
                setConfirmingUnfriend(false);
              }}
            >
              <Text className="text-sm font-semibold text-paper">Unfriend</Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-5">
            <View className="flex-row gap-3">
              {isMe ? (
                <Pressable onPress={onEdit} className="rounded-full bg-gold px-6 py-2.5">
                  <Text className="font-semibold text-charcoal">Edit profile</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={() => {
                      if (friendStatus === 'friends') {
                        setConfirmingUnfriend(true);
                        return;
                      }
                      if (friendStatus === 'none') {
                        setComposingFriendRequest(true);
                        setFriendRequestNoteDraft('');
                        return;
                      }
                      respondFriend(user.id);
                    }}
                    className={`flex-row items-center gap-1.5 rounded-full px-6 py-2.5 ${
                      friendStatus === 'none' ? 'bg-gold' : 'bg-cream/20'
                    }`}
                  >
                    {friendStatus === 'friends' && (
                      <Ionicons name="checkmark" size={16} className="text-paper" />
                    )}
                    {friendStatus === 'pending_in' && (
                      <Ionicons name="person-add" size={16} className="text-paper" />
                    )}
                    <Text
                      className={`font-semibold ${friendStatus === 'none' ? 'text-charcoal' : 'text-paper'}`}
                    >
                      {FRIEND_LABEL[friendStatus]}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={onMessage}
                    accessibilityLabel="Message"
                    accessibilityRole="button"
                    className="items-center justify-center rounded-full bg-cream/20 px-4 py-2.5"
                  >
                    <Ionicons name="chatbubble-outline" size={18} className="text-paper" />
                  </Pressable>
                </>
              )}
            </View>
            {!isMe && composingFriendRequest && (
              <View className="mt-3 gap-2 rounded-2xl bg-cream/20 p-4">
                <TextInput
                  value={friendRequestNoteDraft}
                  onChangeText={setFriendRequestNoteDraft}
                  placeholder="Optional note, e.g. we met at the potluck!"
                  placeholderTextColor="#FAF3E680"
                  autoFocus
                  className="rounded-xl bg-cream/20 px-3 py-2.5 text-sm text-paper"
                />
                <View className="flex-row justify-end gap-4">
                  <Pressable onPress={() => setComposingFriendRequest(false)}>
                    <Text className="text-sm font-medium text-sand">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      sendFriendRequest(user.id, friendRequestNoteDraft);
                      setComposingFriendRequest(false);
                    }}
                  >
                    <Text className="text-sm font-semibold text-paper">Send request</Text>
                  </Pressable>
                </View>
              </View>
            )}
            {!isMe && friendStatus === 'pending_out' && friendRequestNotes[user.id] && (
              <Text className="mt-2 text-xs text-sand">
                You said: "{friendRequestNotes[user.id]}"
              </Text>
            )}
          </View>
        )}
      </View>

      {!isMe && (
        <View className="border-b border-charcoal/10 bg-cream px-5 py-4">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="lock-closed-outline" size={12} className="text-charcoal/40" />
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Private note · only you can see this
            </Text>
          </View>
          {editingProfileNote ? (
            <View className="mt-2 gap-2">
              <TextInput
                value={profileNoteDraft}
                onChangeText={setProfileNoteDraft}
                placeholder="e.g. met at the potluck, has a dog named Biscuit"
                placeholderTextColor="#3D3D3D80"
                multiline
                autoFocus
                className="rounded-xl bg-sand px-3 py-2.5 text-sm text-charcoal"
              />
              <View className="flex-row justify-end gap-4">
                <Pressable onPress={() => setEditingProfileNote(false)}>
                  <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setProfileNote(user.id, profileNoteDraft);
                    setEditingProfileNote(false);
                  }}
                >
                  <Text className="text-sm font-semibold text-terracotta">Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setProfileNoteDraft(profileNotes[user.id] ?? '');
                setEditingProfileNote(true);
              }}
              className="mt-1.5"
            >
              <Text
                className={`text-sm ${
                  profileNotes[user.id] ? 'text-charcoal' : 'italic text-charcoal/40'
                }`}
              >
                {profileNotes[user.id] || 'Add a note'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {user.isNew && (
        <View className="border-b border-charcoal/10 bg-cream px-5 py-5">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="sparkles" size={13} className="text-gold" />
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              {isMe ? 'Welcome notes from your neighbors' : `New to the neighborhood`}
            </Text>
          </View>

          {!isMe && welcomeNotes.length === 0 && (
            <Text className="mt-2 text-sm text-charcoal/50">
              No welcome notes yet — be the first to say hi.
            </Text>
          )}

          {welcomeNotes.length > 0 && (
            <View className="mt-3 gap-2">
              {welcomeNotes.map((note) => {
                const author = getUser(note.fromUserId);
                const isMine = note.fromUserId === ME.id;

                if (confirmingDeleteNoteId === note.id) {
                  return (
                    <View key={note.id} className="gap-2 rounded-2xl bg-terracotta/10 p-3">
                      <Text className="text-sm text-charcoal">Delete this welcome note?</Text>
                      <View className="flex-row justify-end gap-4">
                        <Pressable onPress={() => setConfirmingDeleteNoteId(null)}>
                          <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            deleteWelcomeNote(note.id);
                            setConfirmingDeleteNoteId(null);
                          }}
                        >
                          <Text className="text-sm font-semibold text-terracotta">Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                }

                if (editingNoteId === note.id) {
                  return (
                    <View key={note.id} className="gap-2 rounded-2xl bg-sand p-3">
                      <TextInput
                        value={editNoteDraft}
                        onChangeText={setEditNoteDraft}
                        autoFocus
                        multiline
                        className="min-h-[60px] rounded-xl bg-cream px-3 py-2 text-sm text-charcoal"
                      />
                      <View className="flex-row justify-end gap-4">
                        <Pressable onPress={() => setEditingNoteId(null)}>
                          <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            editWelcomeNote(note.id, editNoteDraft);
                            setEditingNoteId(null);
                          }}
                        >
                          <Text className="text-sm font-semibold text-terracotta">Save</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={note.id} className="flex-row items-start gap-2 rounded-2xl bg-sand p-3">
                    <View className="flex-1">
                      <Text className="text-sm leading-5 text-charcoal">“{note.text}”</Text>
                      <Text className="mt-1 text-xs text-charcoal/50">
                        — {isMine ? 'You' : (author?.name ?? 'A neighbor')}
                        {note.edited && ' · edited'}
                      </Text>
                      <ReactionButton
                        compact
                        reactions={note.reactions}
                        myReaction={myNoteReactions[note.id]}
                        onTap={() => tapNoteReaction(note.id)}
                        onSelect={(type) => setNoteReaction(note.id, type)}
                      />
                    </View>
                    {isMine && (
                      <>
                        <Pressable
                          onPress={() => {
                            setEditingNoteId(note.id);
                            setEditNoteDraft(note.text);
                          }}
                          accessibilityLabel="Edit note"
                          accessibilityRole="button"
                          className="h-7 w-7 items-center justify-center rounded-full"
                        >
                          <Ionicons name="pencil" size={13} className="text-charcoal/40" />
                        </Pressable>
                        <Pressable
                          onPress={() => setConfirmingDeleteNoteId(note.id)}
                          accessibilityLabel="Delete note"
                          accessibilityRole="button"
                          className="h-7 w-7 items-center justify-center rounded-full"
                        >
                          <Ionicons name="trash-outline" size={14} className="text-charcoal/40" />
                        </Pressable>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {!isMe &&
            (composingNote ? (
              <View className="mt-3 gap-2">
                <TextInput
                  value={noteDraft}
                  onChangeText={setNoteDraft}
                  placeholder="A tip, a favorite spot, an offer to say hi..."
                  placeholderTextColor="#3D3D3D80"
                  multiline
                  autoFocus
                  className="min-h-[70px] rounded-2xl bg-sand px-3 py-2.5 text-sm text-charcoal"
                />
                <View className="flex-row justify-end gap-4">
                  <Pressable
                    onPress={() => {
                      setComposingNote(false);
                      setNoteDraft('');
                    }}
                  >
                    <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      if (!noteDraft.trim()) return;
                      addWelcomeNote(user.id, noteDraft.trim());
                      setNoteDraft('');
                      setComposingNote(false);
                    }}
                  >
                    <Text className="text-sm font-semibold text-terracotta">Send</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setComposingNote(true)}
                className="mt-3 self-start rounded-full bg-gold px-4 py-2"
              >
                <Text className="text-sm font-semibold text-charcoal">Leave a welcome note</Text>
              </Pressable>
            ))}
        </View>
      )}

      <View className="flex-row justify-around border-b border-charcoal/10 bg-cream px-2 pt-3">
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} className="items-center pb-3">
            <Text
              className={`text-[15px] ${
                tab === t ? 'font-semibold text-terracotta' : 'text-charcoal/60'
              }`}
            >
              {t}
            </Text>
            {tab === t && <View className="mt-1.5 h-0.5 w-6 rounded-full bg-terracotta" />}
          </Pressable>
        ))}
      </View>

      <View className="px-5 py-6">
        {tab === 'About' && (
          <View className="gap-4">
            {user.bio.length > 0 && (
              <View className="rounded-2xl bg-sand p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  About
                </Text>
                <Text className="mt-1 text-[15px] leading-5 text-charcoal">{user.bio}</Text>
              </View>
            )}
            {(user.neighborhood.length > 0 || user.crossStreets.length > 0) && (
              <View className="rounded-2xl bg-sand p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  Neighborhood
                </Text>
                <Text className="mt-1 text-charcoal">
                  {[user.neighborhood, user.crossStreets, user.yearsInArea]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            )}
            <View className="rounded-2xl bg-sand p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Interests
              </Text>
              <Text className="mt-1 text-charcoal">{user.interests}</Text>
              {sharedInterests.length > 0 && (
                <View className="mt-2 flex-row flex-wrap gap-1.5">
                  {sharedInterests.map((tag) => (
                    <View key={tag} className="rounded-full bg-sage/20 px-2.5 py-1">
                      <Text className="text-xs font-semibold text-sage">✓ {tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View className="rounded-2xl bg-sand p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Values
              </Text>
              <Text className="mt-1 text-charcoal">{user.values}</Text>
            </View>
            <Pressable
              disabled={isMe || !hasConnections}
              onPress={() => setViewingConnections(true)}
              className="rounded-2xl bg-sand p-4"
            >
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Trust
              </Text>
              <Text className="mt-1 text-charcoal">{trustLine}</Text>
            </Pressable>
            {sharedGroups.length > 0 && (
              <View className="rounded-2xl bg-sand p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  {sharedGroups.length === 1 ? 'Group in common' : 'Groups in common'}
                </Text>
                <View className="mt-2 gap-2">
                  {sharedGroups.map((g) => (
                    <Pressable
                      key={g.id}
                      onPress={() => onGroupPress?.(g.id)}
                      className="flex-row items-center gap-2.5 rounded-xl bg-cream p-2.5 active:opacity-70"
                    >
                      <View className="h-8 w-8 items-center justify-center rounded-full bg-terracotta">
                        <Text className="text-xs font-bold text-paper">{g.name.charAt(0)}</Text>
                      </View>
                      <Text className="flex-1 text-sm font-medium text-charcoal">{g.name}</Text>
                      <Ionicons name="chevron-forward" size={16} className="text-charcoal/30" />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
            <View className="rounded-2xl bg-sand p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Endorsements
              </Text>
              {endorsementGroups.length === 0 && (
                <Text className="mt-1 text-sm text-charcoal/50">
                  {isMe
                    ? 'Nothing yet — endorsements from neighbors will show up here.'
                    : 'No endorsements yet — be the first to vouch for a skill.'}
                </Text>
              )}
              {endorsementGroups.length > 0 && (
                <View className="mt-2 gap-2">
                  {endorsementGroups.map(({ skill, entries }) => {
                    const mine = entries.some((e) => e.endorserId === ME.id);
                    const myNote = entries.find((e) => e.endorserId === ME.id)?.note;
                    const names = entries
                      .map((e) => (e.endorserId === ME.id ? 'You' : getUser(e.endorserId)?.name))
                      .filter((n): n is string => Boolean(n))
                      .join(', ');

                    if (confirmingRemoveEndorsementSkill === skill) {
                      return (
                        <View key={skill} className="gap-2 rounded-xl bg-terracotta/10 p-3">
                          <Text className="text-sm text-charcoal">
                            Remove your endorsement for {skill}?
                          </Text>
                          <View className="flex-row justify-end gap-4">
                            <Pressable onPress={() => setConfirmingRemoveEndorsementSkill(null)}>
                              <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                removeEndorsement(user.id, skill);
                                setConfirmingRemoveEndorsementSkill(null);
                              }}
                            >
                              <Text className="text-sm font-semibold text-terracotta">Remove</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    }

                    if (editingEndorsementSkill === skill) {
                      return (
                        <View key={skill} className="gap-2 rounded-xl bg-cream px-3 py-2.5">
                          <Text className="text-sm font-medium text-charcoal">{skill}</Text>
                          <TextInput
                            value={endorsementNoteEditDraft}
                            onChangeText={setEndorsementNoteEditDraft}
                            placeholder="Add a note (optional)"
                            placeholderTextColor="#3D3D3D80"
                            autoFocus
                            className="rounded-lg bg-sand px-3 py-2 text-xs text-charcoal"
                          />
                          <View className="flex-row justify-end gap-4">
                            <Pressable onPress={() => setEditingEndorsementSkill(null)}>
                              <Text className="text-xs font-medium text-charcoal/50">Cancel</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                updateEndorsementNote(user.id, skill, endorsementNoteEditDraft);
                                setEditingEndorsementSkill(null);
                              }}
                            >
                              <Text className="text-xs font-semibold text-terracotta">Save</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    }

                    return (
                      <View
                        key={skill}
                        className="flex-row items-center gap-2 rounded-xl bg-cream px-3 py-2.5"
                      >
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-charcoal">
                            {skill}
                            <Text className="text-charcoal/50"> · {entries.length}</Text>
                          </Text>
                          <Text className="mt-0.5 text-xs text-charcoal/50">— {names}</Text>
                          {myNote && (
                            <Text className="mt-1 text-xs italic text-charcoal/60">"{myNote}"</Text>
                          )}
                        </View>
                        {mine && (
                          <>
                            <Pressable
                              onPress={() => {
                                setEndorsementNoteEditDraft(myNote ?? '');
                                setEditingEndorsementSkill(skill);
                              }}
                              accessibilityLabel={`Edit note for ${skill} endorsement`}
                              accessibilityRole="button"
                              className="h-7 w-7 items-center justify-center"
                            >
                              <Ionicons name="pencil" size={14} className="text-charcoal/40" />
                            </Pressable>
                            <Pressable
                              onPress={() => setConfirmingRemoveEndorsementSkill(skill)}
                              accessibilityLabel={`Remove endorsement for ${skill}`}
                              accessibilityRole="button"
                              className="h-7 w-7 items-center justify-center"
                            >
                              <Ionicons name="close" size={16} className="text-charcoal/40" />
                            </Pressable>
                          </>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
              {!isMe &&
                (composingEndorsement ? (
                  <View className="mt-3 gap-2">
                    <TextInput
                      value={endorsementDraft}
                      onChangeText={setEndorsementDraft}
                      placeholder="e.g. Great with power tools"
                      placeholderTextColor="#3D3D3D80"
                      autoFocus
                      className="rounded-2xl bg-cream px-3 py-2.5 text-sm text-charcoal"
                    />
                    <TextInput
                      value={endorsementNoteDraft}
                      onChangeText={setEndorsementNoteDraft}
                      placeholder="Add a note (optional)"
                      placeholderTextColor="#3D3D3D80"
                      className="rounded-2xl bg-cream px-3 py-2.5 text-sm text-charcoal"
                    />
                    <View className="flex-row justify-end gap-4">
                      <Pressable
                        onPress={() => {
                          setComposingEndorsement(false);
                          setEndorsementDraft('');
                          setEndorsementNoteDraft('');
                        }}
                      >
                        <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          if (!endorsementDraft.trim()) return;
                          addEndorsement(user.id, endorsementDraft.trim(), endorsementNoteDraft);
                          setEndorsementDraft('');
                          setEndorsementNoteDraft('');
                          setComposingEndorsement(false);
                        }}
                      >
                        <Text className="text-sm font-semibold text-terracotta">Send</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setComposingEndorsement(true)}
                    className="mt-3 self-start rounded-full bg-gold px-4 py-2"
                  >
                    <Text className="text-sm font-semibold text-charcoal">+ Endorse a skill</Text>
                  </Pressable>
                ))}
            </View>
          </View>
        )}

        {tab === 'Prompts' && (
          <View className="gap-4">
            {CONVERSATION_STARTER_META.filter((m) => user.conversationStarters[m.key].length > 0).map(
              (m) => (
                <View key={m.key} className="rounded-2xl bg-terracotta/10 p-4">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name={m.icon} size={13} className="text-terracotta" />
                    <Text className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                      {m.label}
                    </Text>
                  </View>
                  <Text className="mt-1.5 text-[15px] text-charcoal">
                    {user.conversationStarters[m.key]}
                  </Text>
                </View>
              )
            )}
            {user.prompts.map((p) => (
              <View key={p.q} className="rounded-2xl bg-sand p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  {p.q}
                </Text>
                <Text className="mt-1 text-[15px] text-charcoal">{p.a}</Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'Photos' && (
          <>
            {photoPosts.length > 0 ? (
              <View className="flex-row flex-wrap gap-3">
                {photoPosts.map((post) => (
                  <Pressable
                    key={post.id}
                    onPress={() => onPhotoPress?.(post.id)}
                    className="w-[31%]"
                    style={{ aspectRatio: 1 }}
                  >
                    <Image source={{ uri: post.imageUris![0] }} className="h-full w-full rounded-xl" />
                    {post.imageUris!.length > 1 && (
                      <View className="absolute right-1 top-1">
                        <Ionicons name="copy" size={15} className="text-paper" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="image-outline"
                iconColorClassName="text-charcoal/50"
                title={isMe ? 'No photos yet' : `No photos from ${user.name} yet`}
                subtitle={
                  isMe ? 'Photos you add to a post will show up here.' : undefined
                }
                ctaLabel={isMe && onCreatePost ? 'Share a photo' : undefined}
                onPressCta={isMe ? onCreatePost : undefined}
              />
            )}
          </>
        )}

        {tab === 'Friends' && (
          <View className="gap-3">
            {isMe && (
              <View className="mb-1 h-32 items-center justify-center">
                <SvgXml xml={GROUP_SELFIE_SVG} width="100%" height="100%" />
              </View>
            )}
            {friends.length > 3 && (
              <View className="flex-row items-center rounded-full bg-sand px-4 py-2.5">
                <Ionicons name="search" size={16} className="text-charcoal/50" />
                <TextInput
                  value={friendQuery}
                  onChangeText={setFriendQuery}
                  placeholder="Search friends..."
                  placeholderTextColor="#3D3D3D80"
                  className="ml-2 flex-1 text-sm text-charcoal"
                />
                {friendQuery.length > 0 && (
                  <Pressable
                    onPress={() => setFriendQuery('')}
                    accessibilityLabel="Clear search"
                    accessibilityRole="button"
                  >
                    <Ionicons name="close-circle" size={16} className="text-charcoal/50" />
                  </Pressable>
                )}
              </View>
            )}
            {visibleFriends.length === 0 && (
              <Text className="text-sm text-charcoal/50">
                No friends match "{friendQuery.trim()}".
              </Text>
            )}
            {visibleFriends.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => onFriendPress?.(f)}
                className="flex-row items-center gap-3 rounded-2xl bg-sand p-3 active:opacity-70"
              >
                <Image source={{ uri: f.avatar }} className="h-11 w-11 rounded-full" />
                <Text className="font-medium text-charcoal">{f.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
    {sharing && (
      <ShareSheet
        title="Share profile"
        link={`https://neighbor.app/profile/${user.id}`}
        previewText={`${isMe ? 'My' : `${user.name}'s`} profile on Neighbor — ${user.tagline}`}
        onClose={() => setSharing(false)}
      />
    )}
    {viewingConnections && (
      <View className="absolute inset-0 items-center justify-end bg-ink/40">
        <Pressable className="absolute inset-0" onPress={() => setViewingConnections(false)} />
        <View className="max-h-[75%] w-full gap-4 rounded-t-3xl bg-cream p-5 pb-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-charcoal">Mutual connections</Text>
            <Pressable
              onPress={() => setViewingConnections(false)}
              accessibilityLabel="Close"
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-sand"
            >
              <Ionicons name="close" size={16} className="text-charcoal" />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-4">
              {mutualFriends.length > 0 && (
                <View className="gap-2">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    Mutual friends
                  </Text>
                  {mutualFriends.map((f) => (
                    <Pressable
                      key={f.id}
                      onPress={() => {
                        setViewingConnections(false);
                        onFriendPress?.(f);
                      }}
                      className="flex-row items-center gap-3 rounded-2xl bg-sand p-3 active:opacity-70"
                    >
                      <Image source={{ uri: f.avatar }} className="h-9 w-9 rounded-full" />
                      <Text className="font-medium text-charcoal">{f.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              {sharedGroups.length > 0 && (
                <View className="gap-2">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    Shared groups
                  </Text>
                  {sharedGroups.map((g) => (
                    <Pressable
                      key={g.id}
                      onPress={() => {
                        setViewingConnections(false);
                        onGroupPress?.(g.id);
                      }}
                      className="flex-row items-center gap-3 rounded-2xl bg-sand p-3 active:opacity-70"
                    >
                      <Text className="flex-1 font-medium text-charcoal">{g.name}</Text>
                      <Ionicons name="chevron-forward" size={16} className="text-charcoal/40" />
                    </Pressable>
                  ))}
                </View>
              )}
              {eventsTogether.length > 0 && (
                <View className="gap-2">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    Events attended together
                  </Text>
                  {eventsTogether.map((e) => (
                    <Pressable
                      key={e.id}
                      onPress={() => {
                        setViewingConnections(false);
                        onEventPress?.(e.id);
                      }}
                      className="rounded-2xl bg-sand p-3 active:opacity-70"
                    >
                      <Text className="font-medium text-charcoal">{e.title}</Text>
                      <Text className="text-xs text-charcoal/50">{e.date}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    )}
    {viewingBadge && (
      <View className="absolute inset-0 items-center justify-end bg-ink/40">
        <Pressable className="absolute inset-0" onPress={() => setViewingBadge(null)} />
        <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-terracotta/15">
              <Ionicons
                name={VERIFICATION_META[viewingBadge].icon}
                size={20}
                className="text-terracotta"
              />
            </View>
            <Text className="flex-1 text-base font-bold text-charcoal">
              {VERIFICATION_META[viewingBadge].label}
            </Text>
            <Pressable
              onPress={() => setViewingBadge(null)}
              accessibilityLabel="Close"
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-sand"
            >
              <Ionicons name="close" size={16} className="text-charcoal" />
            </Pressable>
          </View>
          <Text className="text-sm leading-5 text-charcoal/70">
            {VERIFICATION_META[viewingBadge].description}
          </Text>
        </View>
      </View>
    )}
    </>
  );
}
