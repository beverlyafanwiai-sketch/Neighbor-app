import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import InviteGroupSheet from '../../components/InviteGroupSheet';
import PhotoViewer from '../../components/PhotoViewer';
import ReportPostSheet from '../../components/ReportPostSheet';
import ShareSheet from '../../components/ShareSheet';
import { ME, getUser } from '../../data/mock';
import { useBlockedStore } from '../../store/useBlockedStore';
import { getGroupPhotos, useGroupAlbumStore } from '../../store/useGroupAlbumStore';
import { useEventsStore } from '../../store/useEventsStore';
import { useGroupChatStore } from '../../store/useGroupChatStore';
import { isGroupAdmin, memberCountLabel, useGroupsStore } from '../../store/useGroupsStore';
import { useGroupNotesStore } from '../../store/useGroupNotesStore';
import { formatMutedUntil, useMutedGroupsStore } from '../../store/useMutedGroupsStore';
import { useSavedGroupsStore } from '../../store/useSavedGroupsStore';
import { useProfileStore } from '../../store/useProfileStore';
import { getEffectiveSpots, useRsvpStore } from '../../store/useRsvpStore';

const TONE_STYLE: Record<string, { bg: string; text: string }> = {
  Casual: { bg: 'bg-sage/20', text: 'text-sage' },
  Structured: { bg: 'bg-terracotta/15', text: 'text-terracotta' },
  'Activity-focused': { bg: 'bg-gold/20', text: 'text-gold' },
};

const MUTE_DURATIONS = [
  { label: '8 hours', ms: 8 * 60 * 60 * 1000 },
  { label: '24 hours', ms: 24 * 60 * 60 * 1000 },
  { label: '1 week', ms: 7 * 24 * 60 * 60 * 1000 },
] as const;

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = useGroupsStore((s) => s.groups.find((g) => g.id === id));
  const profile = useProfileStore((s) => s.profile);
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const joined = useGroupsStore((s) => (group ? (s.joined[group.id] ?? false) : false));
  const toggleJoin = useGroupsStore((s) => s.toggle);
  const joinByInviteCode = useGroupsStore((s) => s.joinByInviteCode);
  const deleteGroup = useGroupsStore((s) => s.deleteGroup);
  const promoteCoAdmin = useGroupsStore((s) => s.promoteCoAdmin);
  const demoteCoAdmin = useGroupsStore((s) => s.demoteCoAdmin);
  const transferOwnership = useGroupsStore((s) => s.transferOwnership);
  const removeMember = useGroupsStore((s) => s.removeMember);
  const announcementHistory = useGroupsStore((s) => (group ? (s.announcementHistory[group.id] ?? []) : []));
  const pinnedMessageId = useGroupChatStore((s) => (group ? s.pinnedMessageId[group.id] : undefined));
  const pinnedMessage = useGroupChatStore((s) =>
    group ? (s.messages[group.id] ?? []).find((m) => m.id === pinnedMessageId) : undefined
  );
  const albumPhotos = useGroupAlbumStore((s) => s.photos);
  const addPhotos = useGroupAlbumStore((s) => s.addPhotos);
  const removePhoto = useGroupAlbumStore((s) => s.removePhoto);
  const photoCaptions = useGroupAlbumStore((s) => s.captions);
  const setPhotoCaption = useGroupAlbumStore((s) => s.setCaption);
  const photoTags = useGroupAlbumStore((s) => s.tags);
  const setPhotoTags = useGroupAlbumStore((s) => s.setTags);
  const savedGroupIds = useSavedGroupsStore((s) => s.savedIds);
  const toggleSaveGroup = useSavedGroupsStore((s) => s.toggleSave);
  const events = useEventsStore((s) => s.events);
  const goingMap = useRsvpStore((s) => s.going);
  const inviteCode = useGroupsStore((s) => (group ? s.inviteCodes[group.id] : undefined));
  const regenerateInviteCode = useGroupsStore((s) => s.regenerateInviteCode);
  const welcomeMessage = useGroupsStore((s) => (group ? s.welcomeMessages[group.id] : undefined));
  const setWelcomeMessage = useGroupsStore((s) => s.setWelcomeMessage);
  const clearWelcomeMessage = useGroupsStore((s) => s.clearWelcomeMessage);
  const mutedUntil = useMutedGroupsStore((s) => s.mutedUntil);
  const toggleMutedGroup = useMutedGroupsStore((s) => s.toggle);
  const muteGroupFor = useMutedGroupsStore((s) => s.muteFor);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [redeemingCode, setRedeemingCode] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteError, setInviteError] = useState(false);
  const groupNotes = useGroupNotesStore((s) => s.notes);
  const setGroupNote = useGroupNotesStore((s) => s.setNote);
  const [editingGroupNote, setEditingGroupNote] = useState(false);
  const [groupNoteDraft, setGroupNoteDraft] = useState('');
  const [choosingMuteDuration, setChoosingMuteDuration] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [reportingGroup, setReportingGroup] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState<number | null>(null);
  const [confirmingRemovePhotoId, setConfirmingRemovePhotoId] = useState<string | null>(null);
  const [confirmingRemoveMemberId, setConfirmingRemoveMemberId] = useState<string | null>(null);
  const [memberQuery, setMemberQuery] = useState('');
  const [confirmingTransferId, setConfirmingTransferId] = useState<string | null>(null);
  const [showingWelcome, setShowingWelcome] = useState(false);
  const [composingWelcome, setComposingWelcome] = useState(false);
  const [welcomeDraft, setWelcomeDraft] = useState('');

  if (!group) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="text-charcoal">Group not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-terracotta">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const otherMembers = group.memberIds
    .filter((id) => !blockedIds[id])
    .map((id) => getUser(id))
    .filter(Boolean);
  const members = joined ? [profile, ...otherMembers] : otherMembers;
  const taggableUsers = members
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((m) => ({ id: m.id, name: m.name, avatar: m.avatar }));
  const memberQ = memberQuery.trim().toLowerCase();
  const visibleMembers =
    memberQ.length === 0 ? members : members.filter((m) => m!.name.toLowerCase().includes(memberQ));
  const toneStyle = TONE_STYLE[group.tone] ?? TONE_STYLE.Casual;
  const isCreator = group.createdBy === ME.id;
  const isAdmin = isGroupAdmin(group, ME.id);
  const isMuted = (mutedUntil[group.id] ?? 0) > Date.now();
  const pinnedSender = pinnedMessage
    ? pinnedMessage.senderId === ME.id
      ? profile
      : getUser(pinnedMessage.senderId)
    : undefined;
  const groupPhotos = getGroupPhotos(group.id, albumPhotos);
  const groupEvents = events.filter((e) => e.hostGroupId === group.id && e.status === 'upcoming');

  const remove = () => {
    deleteGroup(group.id);
    router.back();
  };

  const leave = () => {
    toggleJoin(group.id);
    setConfirmingLeave(false);
  };

  const join = () => {
    toggleJoin(group.id);
    if (welcomeMessage) setShowingWelcome(true);
  };

  const redeemCode = () => {
    const groupId = joinByInviteCode(inviteCodeInput);
    if (!groupId || groupId !== group.id) {
      setInviteError(true);
      return;
    }
    setRedeemingCode(false);
    setInviteCodeInput('');
    setInviteError(false);
    if (welcomeMessage) setShowingWelcome(true);
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
      addPhotos(group.id, result.assets.map((a) => a.uri));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <View className="flex-row items-center gap-1.5">
          <Pressable
            onPress={() => setSharing(true)}
            accessibilityLabel="Share circle"
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center rounded-full bg-cream"
          >
            <Ionicons name="arrow-redo-outline" size={17} className="text-charcoal" />
          </Pressable>
          <Pressable
            onPress={() => toggleSaveGroup(group.id)}
            accessibilityLabel={savedGroupIds[group.id] ? 'Unsave circle' : 'Save circle'}
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center rounded-full bg-cream"
          >
            <Ionicons
              name={savedGroupIds[group.id] ? 'bookmark' : 'bookmark-outline'}
              size={17}
              className={savedGroupIds[group.id] ? 'text-gold' : 'text-charcoal'}
            />
          </Pressable>
          {joined && (
            <>
            <Pressable
              onPress={() => (isMuted ? toggleMutedGroup(group.id) : setChoosingMuteDuration(true))}
              accessibilityLabel={isMuted ? 'Unmute circle' : 'Mute circle'}
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full bg-cream"
            >
              <Ionicons
                name={isMuted ? 'notifications-off' : 'notifications-outline'}
                size={17}
                className={isMuted ? 'text-terracotta' : 'text-charcoal'}
              />
            </Pressable>
            <Pressable
              onPress={() => setInviting(true)}
              accessibilityLabel="Invite people"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full bg-cream"
            >
              <Ionicons name="person-add-outline" size={17} className="text-charcoal" />
            </Pressable>
            {isAdmin && (
              <Pressable
                onPress={() => router.push(`/create-group?id=${group.id}`)}
                accessibilityLabel="Edit circle"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full bg-cream"
              >
                <Ionicons name="pencil" size={17} className="text-charcoal" />
              </Pressable>
            )}
            {isAdmin && (
              <Pressable
                onPress={() => router.push(`/create-group?duplicateId=${group.id}`)}
                accessibilityLabel="Duplicate circle"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full bg-cream"
              >
                <Ionicons name="copy-outline" size={17} className="text-charcoal" />
              </Pressable>
            )}
            {isAdmin && (
              <Pressable
                onPress={() => {
                  setWelcomeDraft(welcomeMessage ?? '');
                  setComposingWelcome(true);
                }}
                accessibilityLabel="Edit welcome message"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full bg-cream"
              >
                <Ionicons name="hand-left-outline" size={17} className="text-charcoal" />
              </Pressable>
            )}
            {isCreator && (
              <Pressable
                onPress={() => setConfirmingDelete(true)}
                accessibilityLabel="Delete circle"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full bg-cream"
              >
                <Ionicons name="trash-outline" size={17} className="text-terracotta" />
              </Pressable>
            )}
            {!isCreator && (
              <Pressable
                onPress={() => setReportingGroup(true)}
                accessibilityLabel="Report circle"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full bg-cream"
              >
                <Ionicons name="flag-outline" size={17} className="text-charcoal" />
              </Pressable>
            )}
            </>
          )}
        </View>
      </View>

      {confirmingDelete && (
        <View className="flex-row items-center gap-3 bg-terracotta/10 px-4 py-3">
          <Text className="flex-1 text-sm text-charcoal">
            Delete this circle? This can't be undone.
          </Text>
          <Pressable onPress={() => setConfirmingDelete(false)} className="rounded-full px-3 py-1.5">
            <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
          </Pressable>
          <Pressable onPress={remove} className="rounded-full bg-terracotta px-3 py-1.5">
            <Text className="text-sm font-semibold text-paper">Delete</Text>
          </Pressable>
        </View>
      )}

      {confirmingLeave && (
        <View className="flex-row items-center gap-3 bg-terracotta/10 px-4 py-3">
          <Text className="flex-1 text-sm text-charcoal">
            Leave {group.name}? You'll stop seeing messages from this circle.
          </Text>
          <Pressable onPress={() => setConfirmingLeave(false)} className="rounded-full px-3 py-1.5">
            <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
          </Pressable>
          <Pressable onPress={leave} className="rounded-full bg-terracotta px-3 py-1.5">
            <Text className="text-sm font-semibold text-paper">Leave</Text>
          </Pressable>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        {group.coverImageUri && (
          <Image
            source={{ uri: group.coverImageUri }}
            className="mb-4 w-full rounded-3xl"
            style={{ aspectRatio: 2 }}
          />
        )}
        <View className="items-center rounded-3xl bg-cream p-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-terracotta">
            <Text className="text-2xl font-bold text-paper">{group.name.charAt(0)}</Text>
          </View>
          <Text className="mt-3 text-xl font-bold text-charcoal">{group.name}</Text>
          <View className="mt-2 flex-row items-center gap-2">
            <Text className="text-xs text-charcoal/60">
              {memberCountLabel(group.id, joined)}
            </Text>
            <View className={`rounded-full px-2.5 py-1 ${toneStyle.bg}`}>
              <Text className={`text-xs font-semibold ${toneStyle.text}`}>{group.tone}</Text>
            </View>
            {group.privacy === 'private' && (
              <View className="flex-row items-center gap-1 rounded-full bg-charcoal/10 px-2.5 py-1">
                <Ionicons name="lock-closed-outline" size={11} className="text-charcoal/60" />
                <Text className="text-xs font-semibold text-charcoal/60">Private</Text>
              </View>
            )}
            {isMuted && (
              <View className="flex-row items-center gap-1 rounded-full bg-charcoal/10 px-2.5 py-1">
                <Ionicons name="notifications-off" size={11} className="text-charcoal/60" />
                <Text className="text-xs font-semibold text-charcoal/60">
                  {formatMutedUntil(mutedUntil[group.id])}
                </Text>
              </View>
            )}
          </View>
          <Text className="mt-4 text-center text-[15px] leading-5 text-charcoal/80">
            {group.description}
          </Text>

          {!joined && group.privacy === 'private' ? (
            redeemingCode ? (
              <View className="mt-5 w-full gap-2">
                <TextInput
                  value={inviteCodeInput}
                  onChangeText={(text) => {
                    setInviteCodeInput(text.toUpperCase());
                    setInviteError(false);
                  }}
                  placeholder="Enter invite code"
                  placeholderTextColor="#3D3D3D80"
                  autoCapitalize="characters"
                  className="rounded-2xl bg-sand px-4 py-3 text-center text-base font-semibold tracking-widest text-charcoal"
                />
                {inviteError && (
                  <Text className="text-center text-xs text-terracotta">
                    That code doesn't match this circle — double check and try again.
                  </Text>
                )}
                <View className="flex-row justify-center gap-4">
                  <Pressable
                    onPress={() => {
                      setRedeemingCode(false);
                      setInviteCodeInput('');
                      setInviteError(false);
                    }}
                  >
                    <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                  </Pressable>
                  <Pressable onPress={redeemCode}>
                    <Text className="text-sm font-semibold text-terracotta">Join</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="mt-5 items-center gap-2">
                <Text className="text-center text-xs text-charcoal/50">
                  This circle is private. Ask a member for an invite code to join.
                </Text>
                <Pressable
                  onPress={() => setRedeemingCode(true)}
                  className="rounded-full bg-ink px-6 py-3"
                >
                  <Text className="text-sm font-semibold text-paper">Enter invite code</Text>
                </Pressable>
              </View>
            )
          ) : (
            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => (joined ? setConfirmingLeave(true) : join())}
                className={`rounded-full px-6 py-3 ${joined ? 'bg-sand' : 'bg-ink'}`}
              >
                <Text className={`text-sm font-semibold ${joined ? 'text-charcoal' : 'text-paper'}`}>
                  {joined ? 'Leave circle' : 'Join group'}
                </Text>
              </Pressable>
              {joined && (
                <Pressable
                  onPress={() => router.push(`/group-chat/${group.id}`)}
                  className="flex-row items-center gap-1.5 rounded-full bg-terracotta px-6 py-3"
                >
                  <Ionicons name="chatbubbles-outline" size={16} className="text-paper" />
                  <Text className="text-sm font-semibold text-paper">Group chat</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {pinnedMessage && pinnedSender && (
          <Pressable
            onPress={() => router.push(`/group-chat/${group.id}`)}
            className="mt-4 flex-row items-center gap-3 rounded-2xl bg-gold/10 p-4 active:opacity-80"
          >
            <Ionicons name="pin" size={16} className="text-gold" />
            <View className="flex-1">
              <Text className="text-xs font-semibold text-charcoal/60">
                Pinned · {pinnedSender.name}
              </Text>
              <Text className="mt-0.5 text-sm text-charcoal" numberOfLines={2}>
                {pinnedMessage.text || 'Photo'}
              </Text>
            </View>
          </Pressable>
        )}

        {joined && announcementHistory.length > 0 && (
          <Pressable
            onPress={() => router.push(`/group-announcement-history?groupId=${group.id}`)}
            className="mt-4 flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
          >
            <Ionicons name="megaphone-outline" size={16} className="text-charcoal" />
            <Text className="flex-1 text-sm font-medium text-charcoal">
              Announcements ({announcementHistory.length})
            </Text>
            <Ionicons name="chevron-forward" size={16} className="text-charcoal/50" />
          </Pressable>
        )}

        <View className="mt-4 rounded-2xl bg-cream p-4">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="lock-closed-outline" size={12} className="text-charcoal/40" />
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Private note · only you can see this
            </Text>
          </View>
          {editingGroupNote ? (
            <View className="mt-2 gap-2">
              <TextInput
                value={groupNoteDraft}
                onChangeText={setGroupNoteDraft}
                placeholder="e.g. meets every other Tuesday"
                placeholderTextColor="#3D3D3D80"
                multiline
                autoFocus
                className="rounded-xl bg-sand px-3 py-2.5 text-sm text-charcoal"
              />
              <View className="flex-row justify-end gap-4">
                <Pressable onPress={() => setEditingGroupNote(false)}>
                  <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setGroupNote(group.id, groupNoteDraft);
                    setEditingGroupNote(false);
                  }}
                >
                  <Text className="text-sm font-semibold text-terracotta">Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setGroupNoteDraft(groupNotes[group.id] ?? '');
                setEditingGroupNote(true);
              }}
              className="mt-1.5"
            >
              <Text
                className={`text-sm ${
                  groupNotes[group.id] ? 'text-charcoal' : 'italic text-charcoal/40'
                }`}
              >
                {groupNotes[group.id] || 'Add a note'}
              </Text>
            </Pressable>
          )}
        </View>

        {(groupEvents.length > 0 || joined) && (
          <>
            <View className="mb-3 mt-8 flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Events
              </Text>
              {joined && (
                <Pressable
                  onPress={() => router.push(`/create-event?groupId=${group.id}`)}
                  className="flex-row items-center gap-1 rounded-full bg-terracotta/15 px-3 py-1"
                >
                  <Ionicons name="add" size={14} className="text-terracotta" />
                  <Text className="text-xs font-semibold text-terracotta">Host an event</Text>
                </Pressable>
              )}
            </View>
            <View className="gap-3">
              {groupEvents.map((e) => {
                const going = goingMap[e.id] ?? false;
                const { spotsTaken, spotsTotal } = getEffectiveSpots(e.id, going);
                return (
                  <Pressable
                    key={e.id}
                    onPress={() => router.push(`/event/${e.id}`)}
                    className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
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
                    <Text className="text-xs text-charcoal/50">
                      {spotsTaken}/{spotsTotal}
                    </Text>
                  </Pressable>
                );
              })}
              {groupEvents.length === 0 && (
                <Text className="text-sm text-charcoal/50">No events hosted yet.</Text>
              )}
            </View>
          </>
        )}

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Members
        </Text>
        {members.length > 4 && (
          <View className="mb-3 flex-row items-center rounded-full bg-cream px-4 py-2.5">
            <Ionicons name="search" size={16} className="text-charcoal/50" />
            <TextInput
              value={memberQuery}
              onChangeText={setMemberQuery}
              placeholder="Search members..."
              placeholderTextColor="#3D3D3D80"
              className="ml-2 flex-1 text-sm text-charcoal"
            />
            {memberQuery.length > 0 && (
              <Pressable
                onPress={() => setMemberQuery('')}
                accessibilityLabel="Clear search"
                accessibilityRole="button"
              >
                <Ionicons name="close-circle" size={16} className="text-charcoal/50" />
              </Pressable>
            )}
          </View>
        )}
        {visibleMembers.length === 0 && (
          <Text className="text-sm text-charcoal/50">No members match "{memberQuery.trim()}".</Text>
        )}
        <View className="gap-3">
          {visibleMembers.map((m) => {
            const isMe = m!.id === ME.id;
            const isMemberCreator = m!.id === group.createdBy;
            const isMemberCoAdmin = (group.coAdminIds ?? []).includes(m!.id);
            const canRemove = isCreator && !isMe && !isMemberCreator;

            if (confirmingRemoveMemberId === m!.id) {
              return (
                <View key={m!.id} className="gap-2 rounded-2xl bg-terracotta/10 p-4">
                  <Text className="text-sm text-charcoal">
                    Remove {m!.name} from the group?
                  </Text>
                  <View className="flex-row justify-end gap-4">
                    <Pressable onPress={() => setConfirmingRemoveMemberId(null)}>
                      <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        removeMember(group.id, m!.id);
                        setConfirmingRemoveMemberId(null);
                      }}
                    >
                      <Text className="text-sm font-semibold text-terracotta">Remove</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }

            if (confirmingTransferId === m!.id) {
              return (
                <View key={m!.id} className="gap-2 rounded-2xl bg-terracotta/10 p-4">
                  <Text className="text-sm text-charcoal">
                    Make {m!.name} the owner of {group.name}? You'll stay on as a co-admin.
                  </Text>
                  <View className="flex-row justify-end gap-4">
                    <Pressable onPress={() => setConfirmingTransferId(null)}>
                      <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        transferOwnership(group.id, m!.id);
                        setConfirmingTransferId(null);
                      }}
                    >
                      <Text className="text-sm font-semibold text-terracotta">Make owner</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }

            return (
              <Pressable
                key={m!.id}
                onPress={() => !isMe && router.push(`/profile/${m!.id}`)}
                className="flex-row items-center gap-3 rounded-2xl bg-cream p-3 active:opacity-70"
              >
                <Image source={{ uri: m!.avatar }} className="h-11 w-11 rounded-full" />
                <View className="flex-1">
                  <Text className="font-medium text-charcoal">{isMe ? 'You' : m!.name}</Text>
                  <Text className="text-xs text-charcoal/50" numberOfLines={1}>
                    {m!.tagline}
                  </Text>
                </View>
                {isMemberCoAdmin && (
                  <View className="items-end gap-1.5">
                    <View className="flex-row items-center gap-1.5">
                      <View className="rounded-full bg-sage/20 px-2.5 py-1">
                        <Text className="text-xs font-semibold text-sage">🛡️ Co-admin</Text>
                      </View>
                      {isCreator && !isMemberCreator && (
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            demoteCoAdmin(group.id, m!.id);
                          }}
                          accessibilityLabel="Remove co-admin"
                          accessibilityRole="button"
                          className="h-7 w-7 items-center justify-center rounded-full bg-sand"
                        >
                          <Ionicons name="close" size={14} className="text-charcoal/60" />
                        </Pressable>
                      )}
                    </View>
                    {isCreator && !isMemberCreator && (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          setConfirmingTransferId(m!.id);
                        }}
                      >
                        <Text className="text-[11px] font-semibold text-terracotta">
                          Make owner
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
                {isCreator && !isMemberCoAdmin && !isMemberCreator && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      promoteCoAdmin(group.id, m!.id);
                    }}
                    className="rounded-full bg-sand px-3 py-1.5"
                  >
                    <Text className="text-xs font-semibold text-charcoal">Make co-admin</Text>
                  </Pressable>
                )}
                {canRemove && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      setConfirmingRemoveMemberId(m!.id);
                    }}
                    accessibilityLabel={`Remove ${m!.name} from circle`}
                    accessibilityRole="button"
                    className="h-8 w-8 items-center justify-center rounded-full"
                  >
                    <Ionicons name="person-remove-outline" size={16} className="text-terracotta" />
                  </Pressable>
                )}
              </Pressable>
            );
          })}
        </View>

        {(groupPhotos.length > 0 || joined) && (
          <>
            <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Group photos{groupPhotos.length > 0 ? ` (${groupPhotos.length})` : ''}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {groupPhotos.map((photo, index) => (
                <View key={photo.id} className="w-[31%]" style={{ aspectRatio: 1 }}>
                  <Pressable onPress={() => setViewingPhotoIndex(index)}>
                    <Image source={{ uri: photo.uri }} className="h-full w-full rounded-xl" />
                  </Pressable>
                  {photo.uploaderId === ME.id && (
                    <Pressable
                      onPress={() => setConfirmingRemovePhotoId(photo.id)}
                      accessibilityLabel="Remove photo"
                      accessibilityRole="button"
                      className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-ink/60"
                    >
                      <Ionicons name="close" size={12} className="text-paper" />
                    </Pressable>
                  )}
                </View>
              ))}
              {joined && (
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
      </ScrollView>

      {inviting && (
        <InviteGroupSheet
          groupName={group.name}
          code={inviteCode ?? ''}
          onClose={() => setInviting(false)}
          isAdmin={isAdmin}
          onRegenerate={() => regenerateInviteCode(group.id)}
        />
      )}

      {reportingGroup && (
        <ReportPostSheet
          onClose={() => setReportingGroup(false)}
          title="Group options"
          actionLabel="Report this group"
          category="Circle"
          subject={`Circle: ${group.name}`}
          route={`/group/${group.id}`}
        />
      )}

      {sharing && (
        <ShareSheet
          title="Share group"
          link={`https://neighbor.app/group/${group.id}`}
          previewText={`${group.name} — ${group.description}`}
          onClose={() => setSharing(false)}
        />
      )}

      {choosingMuteDuration && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={() => setChoosingMuteDuration(false)} />
          <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">Mute this circle</Text>
              <Pressable
                onPress={() => setChoosingMuteDuration(false)}
                accessibilityLabel="Close"
                accessibilityRole="button"
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>
            {MUTE_DURATIONS.map((d) => (
              <Pressable
                key={d.label}
                onPress={() => {
                  muteGroupFor(group.id, d.ms);
                  setChoosingMuteDuration(false);
                }}
                className="rounded-2xl bg-sand p-4 active:opacity-80"
              >
                <Text className="text-sm font-medium text-charcoal">{d.label}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                toggleMutedGroup(group.id);
                setChoosingMuteDuration(false);
              }}
              className="rounded-2xl bg-sand p-4 active:opacity-80"
            >
              <Text className="text-sm font-medium text-charcoal">Until I unmute</Text>
            </Pressable>
          </View>
        </View>
      )}

      {composingWelcome && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable
            className="absolute inset-0"
            onPress={() => {
              setComposingWelcome(false);
              setWelcomeDraft('');
            }}
          />
          <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">Welcome message</Text>
              <Pressable
                onPress={() => {
                  setComposingWelcome(false);
                  setWelcomeDraft('');
                }}
                accessibilityLabel="Close"
                accessibilityRole="button"
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>
            <Text className="text-xs text-charcoal/50">
              Shown once to anyone who newly joins this circle.
            </Text>

            <TextInput
              value={welcomeDraft}
              onChangeText={setWelcomeDraft}
              placeholder="Welcome! A few things to know before you dive in..."
              placeholderTextColor="#3D3D3D80"
              multiline
              autoFocus
              className="min-h-[80px] rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
            />

            <View className="flex-row items-center justify-between">
              {welcomeMessage ? (
                <Pressable
                  onPress={() => {
                    clearWelcomeMessage(group.id);
                    setComposingWelcome(false);
                    setWelcomeDraft('');
                  }}
                >
                  <Text className="text-sm font-semibold text-terracotta">Remove message</Text>
                </Pressable>
              ) : (
                <View />
              )}
              <Pressable
                disabled={!welcomeDraft.trim()}
                onPress={() => {
                  setWelcomeMessage(group.id, welcomeDraft.trim());
                  setComposingWelcome(false);
                  setWelcomeDraft('');
                }}
                className="rounded-full bg-terracotta px-4 py-2"
                style={{ opacity: welcomeDraft.trim() ? 1 : 0.4 }}
              >
                <Text className="text-sm font-semibold text-paper">
                  {welcomeMessage ? 'Update' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {showingWelcome && welcomeMessage && (
        <View className="absolute inset-0 items-center justify-center bg-ink/50 px-6">
          <View className="w-full items-center gap-3 rounded-3xl bg-cream p-6">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-terracotta/15">
              <Ionicons name="hand-left" size={22} className="text-terracotta" />
            </View>
            <Text className="text-base font-bold text-charcoal">Welcome to {group.name}!</Text>
            <Text className="text-center text-sm leading-5 text-charcoal/80">{welcomeMessage}</Text>
            <Pressable
              onPress={() => setShowingWelcome(false)}
              className="mt-2 rounded-full bg-terracotta px-6 py-2.5"
            >
              <Text className="text-sm font-semibold text-paper">Got it</Text>
            </Pressable>
          </View>
        </View>
      )}

      {viewingPhotoIndex !== null && (
        <PhotoViewer
          uris={groupPhotos.map((p) => p.uri)}
          initialIndex={viewingPhotoIndex}
          onClose={() => setViewingPhotoIndex(null)}
          captions={groupPhotos.map((p) => photoCaptions[p.id] ?? '')}
          editableIndices={groupPhotos.map((p) => p.uploaderId === ME.id)}
          onCaptionChange={(i, text) => setPhotoCaption(groupPhotos[i].id, text)}
          tags={groupPhotos.map((p) => photoTags[p.id] ?? [])}
          taggableUsers={taggableUsers}
          onTagsChange={(i, userIds) => setPhotoTags(groupPhotos[i].id, userIds)}
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
    </SafeAreaView>
  );
}
