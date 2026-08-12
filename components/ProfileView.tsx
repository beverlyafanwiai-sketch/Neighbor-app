import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';

import { GROUP_SELFIE_SVG } from '../assets/illustrations/group-selfie';
import { getUser, ME, type User, type VerificationBadge } from '../data/mock';
import { formatMutualTrustLine, formatOwnTrustLine } from '../lib/trust';
import { isAvailable, useAvailabilityStore } from '../store/useAvailabilityStore';
import { getEndorsementGroups, useEndorsementsStore } from '../store/useEndorsementsStore';
import { FRIEND_LABEL, useFriendsStore } from '../store/useFriendsStore';
import { useGroupsStore } from '../store/useGroupsStore';
import { usePostsStore } from '../store/usePostsStore';
import { getWelcomeNotes, useWelcomeNotesStore } from '../store/useWelcomeNotesStore';
import EmptyState from './EmptyState';

const TABS = ['About', 'Prompts', 'Photos', 'Friends'] as const;
type Tab = (typeof TABS)[number];

const VERIFICATION_META: Record<
  VerificationBadge,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  id: { label: 'ID Verified', icon: 'card-outline' },
  phone: { label: 'Phone Verified', icon: 'call-outline' },
  social: { label: 'Social Linked', icon: 'link-outline' },
};

const CONVERSATION_STARTER_META: {
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
  onPhotoPress?: (postId: string) => void;
  onCreatePost?: () => void;
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
  onPhotoPress,
  onCreatePost,
}: Props) {
  const [tab, setTab] = useState<Tab>('About');
  const myAvailable = useAvailabilityStore((s) => s.myAvailable);
  const setAvailable = useAvailabilityStore((s) => s.setAvailable);
  const available = isAvailable(user, myAvailable);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const friendStatus = friendStatuses[user.id] ?? 'none';
  const respondFriend = useFriendsStore((s) => s.respond);
  const joinedGroups = useGroupsStore((s) => s.joined);
  const posts = usePostsStore((s) => s.posts);
  const photoPosts = posts.filter((p) => p.authorId === user.id && (p.imageUris?.length ?? 0) > 0);
  const allWelcomeNotes = useWelcomeNotesStore((s) => s.notes);
  const addWelcomeNote = useWelcomeNotesStore((s) => s.addNote);
  const welcomeNotes = getWelcomeNotes(user.id, allWelcomeNotes);
  const [composingNote, setComposingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const endorsements = useEndorsementsStore((s) => s.endorsements);
  const addEndorsement = useEndorsementsStore((s) => s.addEndorsement);
  const removeEndorsement = useEndorsementsStore((s) => s.removeEndorsement);
  const endorsementGroups = getEndorsementGroups(user.id, endorsements);
  const [composingEndorsement, setComposingEndorsement] = useState(false);
  const [endorsementDraft, setEndorsementDraft] = useState('');

  const myFriendIds = Object.keys(friendStatuses).filter((id) => friendStatuses[id] === 'friends');
  const myJoinedGroupIds = Object.keys(joinedGroups).filter((id) => joinedGroups[id]);
  const trustLine = isMe
    ? formatOwnTrustLine(myFriendIds.length, myJoinedGroupIds.length)
    : formatMutualTrustLine(user, myFriendIds, ME.id, myJoinedGroupIds);

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-cream">
      <View className="items-center rounded-b-[36px] bg-terracotta pb-8 pt-10">
        {onBack && (
          <Pressable
            onPress={onBack}
            className="absolute left-4 top-10 h-9 w-9 items-center justify-center rounded-full bg-cream/20"
          >
            <Ionicons name="chevron-back" size={22} className="text-paper" />
          </Pressable>
        )}
        {isMe && (onSettings || onSavedPosts || onRecs) && (
          <View className="absolute right-4 top-10 flex-row items-center gap-1.5">
            {onRecs && (
              <Pressable
                onPress={onRecs}
                className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="star-outline" size={19} className="text-paper" />
              </Pressable>
            )}
            {onSavedPosts && (
              <Pressable
                onPress={onSavedPosts}
                className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="bookmark-outline" size={19} className="text-paper" />
              </Pressable>
            )}
            {onSettings && (
              <Pressable
                onPress={onSettings}
                className="h-9 w-9 items-center justify-center rounded-full bg-cream/20"
              >
                <Ionicons name="settings-outline" size={20} className="text-paper" />
              </Pressable>
            )}
          </View>
        )}
        {!isMe && onMoreOptions && (
          <Pressable
            onPress={onMoreOptions}
            className="absolute right-4 top-10 h-9 w-9 items-center justify-center rounded-full bg-cream/20"
          >
            <Ionicons name="ellipsis-horizontal" size={20} className="text-paper" />
          </Pressable>
        )}
        <Image
          source={{ uri: user.avatar }}
          className="h-24 w-24 rounded-full border-4 border-cream"
        />
        <Text className="mt-3 text-2xl font-bold text-paper">{user.name}</Text>
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

        {isMe ? (
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
        ) : (
          available && (
            <View className="mt-3 flex-row items-center gap-1.5 rounded-full bg-sage px-4 py-2">
              <Ionicons name="sunny" size={13} className="text-charcoal" />
              <Text className="text-xs font-semibold text-charcoal">
                Free for a coffee or walk today
              </Text>
            </View>
          )
        )}

        {user.verifications.length > 0 && (
          <View className="mt-3 flex-row flex-wrap justify-center gap-1.5 px-6">
            {user.verifications.map((v) => (
              <View
                key={v}
                className="flex-row items-center gap-1 rounded-full bg-cream/20 px-2.5 py-1"
              >
                <Ionicons name={VERIFICATION_META[v].icon} size={11} className="text-paper" />
                <Text className="text-[10px] font-semibold text-paper">
                  {VERIFICATION_META[v].label}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="mt-5 flex-row gap-3">
          {isMe ? (
            <Pressable onPress={onEdit} className="rounded-full bg-gold px-6 py-2.5">
              <Text className="font-semibold text-charcoal">Edit profile</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={() => respondFriend(user.id)}
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
                className="items-center justify-center rounded-full bg-cream/20 px-4 py-2.5"
              >
                <Ionicons name="chatbubble-outline" size={18} className="text-paper" />
              </Pressable>
            </>
          )}
        </View>
      </View>

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
                return (
                  <View key={note.id} className="rounded-2xl bg-sand p-3">
                    <Text className="text-sm leading-5 text-charcoal">“{note.text}”</Text>
                    <Text className="mt-1 text-xs text-charcoal/50">
                      — {author?.name ?? 'A neighbor'}
                    </Text>
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
            </View>
            <View className="rounded-2xl bg-sand p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Values
              </Text>
              <Text className="mt-1 text-charcoal">{user.values}</Text>
            </View>
            <View className="rounded-2xl bg-sand p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Trust
              </Text>
              <Text className="mt-1 text-charcoal">{trustLine}</Text>
            </View>
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
                    const names = entries
                      .map((e) => (e.endorserId === ME.id ? 'You' : getUser(e.endorserId)?.name))
                      .filter((n): n is string => Boolean(n))
                      .join(', ');
                    return (
                      <Pressable
                        key={skill}
                        disabled={!mine}
                        onPress={() => removeEndorsement(user.id, skill)}
                        className="rounded-xl bg-cream px-3 py-2.5"
                      >
                        <Text className="text-sm font-medium text-charcoal">
                          {skill}
                          <Text className="text-charcoal/50"> · {entries.length}</Text>
                        </Text>
                        <Text className="mt-0.5 text-xs text-charcoal/50">— {names}</Text>
                      </Pressable>
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
                    <View className="flex-row justify-end gap-4">
                      <Pressable
                        onPress={() => {
                          setComposingEndorsement(false);
                          setEndorsementDraft('');
                        }}
                      >
                        <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          if (!endorsementDraft.trim()) return;
                          addEndorsement(user.id, endorsementDraft.trim());
                          setEndorsementDraft('');
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
            {friends.map((f) => (
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
  );
}
