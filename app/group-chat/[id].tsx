import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { CONVERSATION_SVG } from '../../assets/illustrations/conversation';
import ChatMediaGallery from '../../components/ChatMediaGallery';
import ForwardSheet, { type ForwardTarget } from '../../components/ForwardSheet';
import MentionText from '../../components/MentionText';
import MentionTextInput from '../../components/MentionTextInput';
import ReactionButton from '../../components/ReactionButton';
import ReactorsSheet from '../../components/ReactorsSheet';
import ReportPostSheet from '../../components/ReportPostSheet';
import { ME, getUser } from '../../data/mock';
import { useConversationsStore } from '../../store/useConversationsStore';
import { isGroupAdmin, memberCountLabel, useGroupsStore } from '../../store/useGroupsStore';
import {
  groupMessageKey,
  useGroupChatStore,
  type GroupMessage,
  type PollOption,
} from '../../store/useGroupChatStore';

const EMPTY_MESSAGES: GroupMessage[] = [];

export default function GroupChatThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = useGroupsStore((s) => s.groups.find((g) => g.id === id));
  const joined = useGroupsStore((s) => (group ? (s.joined[group.id] ?? false) : false));
  const messages = useGroupChatStore((s) => (group ? (s.messages[group.id] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES));
  const typingId = useGroupChatStore((s) => (group ? s.typing[group.id] : undefined));
  const pinnedMessageId = useGroupChatStore((s) => (group ? s.pinnedMessageId[group.id] : undefined));
  const sendMessage = useGroupChatStore((s) => s.sendMessage);
  const pinMessage = useGroupChatStore((s) => s.pinMessage);
  const unpinMessage = useGroupChatStore((s) => s.unpinMessage);
  const deleteMessage = useGroupChatStore((s) => s.deleteMessage);
  const updateMessage = useGroupChatStore((s) => s.updateMessage);
  const myReactions = useGroupChatStore((s) => s.myReactions);
  const tapReaction = useGroupChatStore((s) => s.tapReaction);
  const setReaction = useGroupChatStore((s) => s.setReaction);
  const sendPoll = useGroupChatStore((s) => s.sendPoll);
  const votePoll = useGroupChatStore((s) => s.votePoll);
  const closePoll = useGroupChatStore((s) => s.closePoll);
  const reopenPoll = useGroupChatStore((s) => s.reopenPoll);
  const addPollOption = useGroupChatStore((s) => s.addPollOption);
  const markRead = useGroupsStore((s) => s.markRead);
  const toggleJoin = useGroupsStore((s) => s.toggle);

  const [draft, setDraft] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [addingOptionForId, setAddingOptionForId] = useState<string | null>(null);
  const [newOptionDraft, setNewOptionDraft] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [reactorsFor, setReactorsFor] = useState<string | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<GroupMessage | null>(null);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
  const [replyingTo, setReplyingTo] = useState<{ id: string; senderName: string; preview: string } | null>(
    null
  );
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const listRef = useRef<FlatList>(null);

  const matches = searchQuery.trim()
    ? messages
        .map((m, i) => ({ m, i }))
        .filter(({ m }) => {
          if (m.deleted) return false;
          const q = searchQuery.trim().toLowerCase();
          return m.text.toLowerCase().includes(q) || Boolean(m.poll?.question.toLowerCase().includes(q));
        })
    : [];

  const goToMatch = (idx: number) => {
    if (matches.length === 0) return;
    const clamped = ((idx % matches.length) + matches.length) % matches.length;
    setMatchIndex(clamped);
    const target = matches[clamped];
    setHighlightId(target.m.id);
    listRef.current?.scrollToIndex({ index: target.i, animated: true, viewPosition: 0.4 });
    setTimeout(() => setHighlightId((h) => (h === target.m.id ? null : h)), 1500);
  };

  useEffect(() => {
    // Jump to the most recent match first, like most chat search UIs --
    // matches/goToMatch are intentionally excluded from deps since they're
    // recomputed every render and would otherwise re-trigger this on scroll.
    if (!searching || matches.length === 0) return;
    goToMatch(matches.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searching]);

  useEffect(() => {
    if (group) markRead(group.id);
  }, [group?.id, markRead]);

  if (!group || !joined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="text-charcoal">
          {group ? 'Join this circle to see its chat.' : 'Group not found.'}
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-terracotta">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const typingUser = typingId ? getUser(typingId) : undefined;
  const isAdmin = isGroupAdmin(group, ME.id);
  const pinnedMessage = messages.find((m) => m.id === pinnedMessageId);
  const pinnedSender = pinnedMessage
    ? pinnedMessage.senderId === ME.id
      ? { name: 'You' }
      : getUser(pinnedMessage.senderId)
    : undefined;
  const lastMeIndex = messages.reduce(
    (acc, m, i) => (m.senderId === ME.id ? i : acc),
    -1
  );
  const lastMeSeenBy = lastMeIndex >= 0 ? messages[lastMeIndex].seenBy : undefined;
  const seenByNames = (lastMeSeenBy ?? [])
    .map((id) => getUser(id)?.name.split(' ')[0])
    .filter((name): name is string => Boolean(name));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const send = () => {
    if (!draft.trim() && !imageUri) return;
    sendMessage(group.id, draft.trim(), imageUri, undefined, replyingTo?.id);
    setDraft('');
    setImageUri(undefined);
    setReplyingTo(null);
  };

  const canSubmitPoll =
    pollQuestion.trim().length > 0 && pollOptions.filter((o) => o.trim().length > 0).length >= 2;

  const submitPoll = () => {
    const cleanOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || cleanOptions.length < 2) return;
    sendPoll(group.id, pollQuestion.trim(), cleanOptions);
    setCreatingPoll(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const saveMessageEdit = () => {
    if (!editDraft.trim() || !editingMessageId) return;
    updateMessage(group.id, editingMessageId, editDraft.trim());
    setEditingMessageId(null);
  };

  const copyMessage = async (messageId: string, text: string) => {
    try {
      await Clipboard.setStringAsync(text);
    } catch {
      // Clipboard access can fail (unsupported browser, no permission) -- the
      // copy icon just won't flip to a checkmark in that case.
    }
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId((id) => (id === messageId ? null : id)), 1500);
  };

  const galleryPhotos = messages
    .filter((m) => m.imageUri && !m.deleted)
    .map((m) => ({ id: m.id, uri: m.imageUri! }));

  const jumpToMessage = (messageId: string) => {
    setShowGallery(false);
    const index = messages.findIndex((m) => m.id === messageId);
    if (index === -1) return;
    setHighlightId(messageId);
    setTimeout(() => {
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.4 });
    }, 300);
    setTimeout(() => setHighlightId((h) => (h === messageId ? null : h)), 1800);
  };

  const handleForward = (target: ForwardTarget) => {
    if (!forwardingMessage) return;
    const sender = forwardingMessage.senderId === ME.id ? undefined : getUser(forwardingMessage.senderId);
    const senderName = forwardingMessage.senderId === ME.id ? 'You' : (sender?.name ?? 'Someone');
    if (target.kind === 'dm') {
      useConversationsStore.getState().sendMessage(
        target.id,
        forwardingMessage.text,
        forwardingMessage.imageUri,
        senderName
      );
    } else {
      useGroupChatStore.getState().sendMessage(
        target.id,
        forwardingMessage.text,
        forwardingMessage.imageUri,
        senderName
      );
    }
  };

  const leave = () => {
    toggleJoin(group.id);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      {searching ? (
        <View className="flex-row items-center gap-2 border-b border-charcoal/10 bg-cream px-4 py-3">
          <Pressable
            onPress={() => {
              setSearching(false);
              setSearchQuery('');
              setHighlightId(null);
            }}
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Ionicons name="chevron-back" size={22} className="text-charcoal" />
          </Pressable>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search this conversation..."
            placeholderTextColor="#3D3D3D80"
            autoFocus
            className="flex-1 rounded-full bg-sand px-4 py-2 text-charcoal"
          />
          {searchQuery.trim().length > 0 && (
            <Text className="text-xs text-charcoal/50">
              {matches.length > 0 ? `${matchIndex + 1}/${matches.length}` : '0/0'}
            </Text>
          )}
          {matches.length > 0 && (
            <>
              <Pressable
                onPress={() => goToMatch(matchIndex - 1)}
                className="h-8 w-8 items-center justify-center rounded-full"
              >
                <Ionicons name="chevron-up" size={18} className="text-charcoal" />
              </Pressable>
              <Pressable
                onPress={() => goToMatch(matchIndex + 1)}
                className="h-8 w-8 items-center justify-center rounded-full"
              >
                <Ionicons name="chevron-down" size={18} className="text-charcoal" />
              </Pressable>
            </>
          )}
        </View>
      ) : (
        <View className="flex-row items-center gap-3 border-b border-charcoal/10 bg-cream px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Ionicons name="chevron-back" size={22} className="text-charcoal" />
          </Pressable>
          <Pressable
            onPress={() => router.push(`/group/${group.id}`)}
            className="flex-1 flex-row items-center gap-3"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-terracotta">
              <Text className="text-base font-bold text-paper">{group.name.charAt(0)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-charcoal">{group.name}</Text>
              <Text className="text-xs text-sage">{memberCountLabel(group.id, joined)}</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setSearching(true)}
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Ionicons name="search-outline" size={20} className="text-charcoal" />
          </Pressable>
          <Pressable
            onPress={() => setShowGallery(true)}
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Ionicons name="images-outline" size={20} className="text-charcoal" />
          </Pressable>
          <Pressable
            onPress={() => setConfirmingLeave(true)}
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Ionicons name="information-circle-outline" size={22} className="text-charcoal" />
          </Pressable>
        </View>
      )}

      {pinnedMessage && pinnedSender && (
        <Pressable
          onPress={() => jumpToMessage(pinnedMessage.id)}
          className="flex-row items-center gap-2.5 border-b border-charcoal/10 bg-gold/10 px-4 py-2.5"
        >
          <Ionicons name="pin" size={14} className="text-gold" />
          <View className="flex-1">
            <Text className="text-xs font-semibold text-charcoal/60">
              Pinned · {pinnedSender.name}
            </Text>
            <Text className="text-sm text-charcoal" numberOfLines={1}>
              {pinnedMessage.text || 'Photo'}
            </Text>
          </View>
          {isAdmin && (
            <Pressable
              onPress={() => unpinMessage(group.id)}
              className="h-7 w-7 items-center justify-center rounded-full"
            >
              <Ionicons name="close" size={15} className="text-charcoal/50" />
            </Pressable>
          )}
        </Pressable>
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerClassName="gap-2.5 px-4 py-4"
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.4 });
            }, 100);
          }}
          ListHeaderComponent={
            <View className="mb-4 items-center">
              <View className="h-36 w-36">
                <SvgXml xml={CONVERSATION_SVG} width="100%" height="100%" />
              </View>
              <Text className="mt-2 text-xs text-charcoal/50">
                This is the beginning of the {group.name} chat
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const isMe = item.senderId === ME.id;
            const sender = isMe ? ME : getUser(item.senderId);

            if (deletingMessageId === item.id) {
              return (
                <View className="max-w-[85%] self-end gap-2 rounded-2xl bg-terracotta/10 p-3">
                  <Text className="text-sm text-charcoal">
                    {item.poll ? 'Delete this poll?' : 'Delete this message?'}
                  </Text>
                  <View className="flex-row justify-end gap-4">
                    <Pressable onPress={() => setDeletingMessageId(null)}>
                      <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        deleteMessage(group.id, item.id);
                        setDeletingMessageId(null);
                      }}
                    >
                      <Text className="text-sm font-semibold text-terracotta">Delete</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }

            if (editingMessageId === item.id) {
              return (
                <View className="max-w-[85%] self-end gap-2 rounded-2xl bg-cream p-3">
                  <TextInput
                    value={editDraft}
                    onChangeText={setEditDraft}
                    autoFocus
                    multiline
                    className="rounded-2xl bg-sand px-3 py-2 text-sm text-charcoal"
                  />
                  <View className="flex-row justify-end gap-4">
                    <Pressable onPress={() => setEditingMessageId(null)}>
                      <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                    </Pressable>
                    <Pressable onPress={saveMessageEdit}>
                      <Text className="text-sm font-semibold text-terracotta">Save</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }

            return (
              <Pressable
                onLongPress={() => isMe && !item.deleted && setDeletingMessageId(item.id)}
                className={`max-w-[78%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {!isMe && sender && (
                  <View className="mb-1 flex-row items-center gap-1.5 pl-1">
                    <Image source={{ uri: sender.avatar }} className="h-5 w-5 rounded-full" />
                    <Text className="text-xs font-medium text-charcoal/60">{sender.name}</Text>
                  </View>
                )}
                {item.replyToId &&
                  !item.deleted &&
                  (() => {
                    const replied = messages.find((m) => m.id === item.replyToId);
                    if (!replied) return null;
                    const repliedSenderName =
                      replied.senderId === ME.id ? 'You' : (getUser(replied.senderId)?.name ?? 'Someone');
                    return (
                      <Pressable
                        onPress={() => jumpToMessage(replied.id)}
                        className="mb-1 max-w-[240px] rounded-lg border-l-2 border-charcoal/25 bg-charcoal/5 px-2 py-1.5"
                      >
                        <Text className="text-[11px] font-semibold text-charcoal/60">
                          {repliedSenderName}
                        </Text>
                        <Text className="text-[11px] text-charcoal/50" numberOfLines={1}>
                          {replied.deleted
                            ? 'Message deleted'
                            : replied.poll
                              ? `📊 ${replied.poll.question}`
                              : replied.text.length > 0
                                ? replied.text
                                : '📷 Photo'}
                        </Text>
                      </Pressable>
                    );
                  })()}
                {item.forwardedFrom && !item.deleted && (
                  <Text className="mb-0.5 text-[11px] italic text-charcoal/40">
                    Forwarded from {item.forwardedFrom}
                  </Text>
                )}
                <View
                  className={`overflow-hidden rounded-2xl px-4 py-3 ${
                    item.id === highlightId ? 'border-2 border-gold' : ''
                  } ${
                    item.deleted
                      ? 'border border-charcoal/15'
                      : isMe
                        ? 'rounded-br-sm bg-terracotta'
                        : 'rounded-bl-sm bg-cream'
                  }`}
                >
                  {item.deleted ? (
                    <Text className="text-sm italic text-charcoal/50">
                      {isMe ? 'You deleted a message' : `${sender?.name ?? 'They'} deleted a message`}
                    </Text>
                  ) : item.poll ? (
                    <View className="w-56 gap-2">
                      <View className="flex-row items-center gap-1.5">
                        <Text className={`flex-1 text-sm font-semibold ${isMe ? 'text-paper' : 'text-charcoal'}`}>
                          {item.poll.question}
                        </Text>
                        {item.poll.closed && (
                          <View className={`rounded-full px-2 py-0.5 ${isMe ? 'bg-paper/20' : 'bg-charcoal/10'}`}>
                            <Text className={`text-[10px] font-bold ${isMe ? 'text-paper/80' : 'text-charcoal/60'}`}>
                              CLOSED
                            </Text>
                          </View>
                        )}
                      </View>
                      {(() => {
                        const poll = item.poll;
                        const totalVotes = Object.keys(poll.votes).length;
                        const myVote = poll.votes[ME.id];
                        return poll.options.map((opt: PollOption) => {
                          const optionVotes = Object.values(poll.votes).filter(
                            (v) => v === opt.id
                          ).length;
                          const pct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                          const isMyVote = myVote === opt.id;
                          return (
                            <Pressable
                              key={opt.id}
                              disabled={poll.closed}
                              onPress={() => votePoll(group.id, item.id, opt.id)}
                              className={`overflow-hidden rounded-xl border ${
                                isMyVote ? 'border-sage' : isMe ? 'border-paper/30' : 'border-charcoal/15'
                              } ${poll.closed ? 'opacity-70' : ''}`}
                            >
                              <View
                                className={`absolute inset-y-0 left-0 ${
                                  isMyVote ? 'bg-sage/25' : isMe ? 'bg-paper/15' : 'bg-charcoal/10'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                              <View className="flex-row items-center justify-between px-3 py-2">
                                <Text
                                  className={`mr-2 flex-1 text-xs font-medium ${
                                    isMe ? 'text-paper' : 'text-charcoal'
                                  }`}
                                  numberOfLines={2}
                                >
                                  {isMyVote ? '✓ ' : ''}
                                  {opt.text}
                                </Text>
                                <Text
                                  className={`text-[11px] ${isMe ? 'text-paper/70' : 'text-charcoal/50'}`}
                                >
                                  {optionVotes}
                                </Text>
                              </View>
                            </Pressable>
                          );
                        });
                      })()}
                      {isMe && !item.poll.closed && (
                        addingOptionForId === item.id ? (
                          <View className="flex-row items-center gap-1.5">
                            <TextInput
                              value={newOptionDraft}
                              onChangeText={setNewOptionDraft}
                              placeholder="New option..."
                              placeholderTextColor={isMe ? '#FAF3E680' : '#3D3D3D80'}
                              autoFocus
                              className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs ${
                                isMe ? 'bg-paper/15 text-paper' : 'bg-charcoal/5 text-charcoal'
                              }`}
                            />
                            <Pressable
                              onPress={() => {
                                setAddingOptionForId(null);
                                setNewOptionDraft('');
                              }}
                            >
                              <Text
                                className={`text-[11px] font-medium ${isMe ? 'text-paper/70' : 'text-charcoal/50'}`}
                              >
                                Cancel
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                if (!newOptionDraft.trim()) return;
                                addPollOption(group.id, item.id, newOptionDraft);
                                setAddingOptionForId(null);
                                setNewOptionDraft('');
                              }}
                            >
                              <Text
                                className={`text-[11px] font-semibold ${isMe ? 'text-paper' : 'text-terracotta'}`}
                              >
                                Add
                              </Text>
                            </Pressable>
                          </View>
                        ) : (
                          <Pressable
                            onPress={() => {
                              setAddingOptionForId(item.id);
                              setNewOptionDraft('');
                            }}
                          >
                            <Text
                              className={`text-[11px] font-semibold ${isMe ? 'text-paper/70' : 'text-charcoal/50'}`}
                            >
                              + Add an option
                            </Text>
                          </Pressable>
                        )
                      )}
                      <View className="flex-row items-center justify-between">
                        <Text className={`text-[11px] ${isMe ? 'text-paper/60' : 'text-charcoal/40'}`}>
                          {Object.keys(item.poll.votes).length} vote
                          {Object.keys(item.poll.votes).length === 1 ? '' : 's'}
                        </Text>
                        {isMe && (
                          <View className="flex-row items-center gap-3">
                            {item.poll.closed ? (
                              <Pressable onPress={() => reopenPoll(group.id, item.id)}>
                                <Text className="text-[11px] font-semibold text-paper/80">
                                  Reopen poll
                                </Text>
                              </Pressable>
                            ) : (
                              <Pressable onPress={() => closePoll(group.id, item.id)}>
                                <Text className="text-[11px] font-semibold text-paper/80">
                                  Close poll
                                </Text>
                              </Pressable>
                            )}
                            <Pressable onPress={() => setDeletingMessageId(item.id)}>
                              <Text className="text-[11px] font-semibold text-paper/80">
                                Delete poll
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    </View>
                  ) : (
                    <>
                      {item.imageUri && (
                        <Image
                          source={{ uri: item.imageUri }}
                          className={`w-48 rounded-xl ${item.text ? 'mb-2' : ''}`}
                          style={{ aspectRatio: 4 / 3 }}
                        />
                      )}
                      {item.text.length > 0 && (
                        <MentionText
                          text={item.text}
                          className={isMe ? 'text-paper' : 'text-charcoal'}
                          mentionClassName={
                            isMe ? 'font-semibold text-paper underline' : 'font-semibold text-terracotta'
                          }
                        />
                      )}
                    </>
                  )}
                </View>
                <View className="mt-1 flex-row items-center gap-1.5">
                  <Text className="text-[11px] text-charcoal/40">
                    {item.time}
                    {item.edited && ' · edited'}
                  </Text>
                  {isAdmin && !item.deleted && (
                    <Pressable
                      onPress={() =>
                        item.id === pinnedMessageId
                          ? unpinMessage(group.id)
                          : pinMessage(group.id, item.id)
                      }
                      className="h-4 w-4 items-center justify-center"
                    >
                      <Ionicons
                        name={item.id === pinnedMessageId ? 'pin' : 'pin-outline'}
                        size={12}
                        className={item.id === pinnedMessageId ? 'text-gold' : 'text-charcoal/25'}
                      />
                    </Pressable>
                  )}
                </View>
                {!item.deleted && (
                  <View className="-mt-1 flex-row items-center gap-2">
                    <ReactionButton
                      reactions={item.reactions}
                      myReaction={myReactions[groupMessageKey(group.id, item.id)]}
                      onTap={() => tapReaction(group.id, item.id)}
                      onSelect={(type) => setReaction(group.id, item.id, type)}
                      onShowReactors={() => setReactorsFor(item.id)}
                      pickerAlign={isMe ? 'right' : 'left'}
                      compact
                    />
                    <Pressable
                      onPress={() =>
                        setReplyingTo({
                          id: item.id,
                          senderName: isMe ? 'You' : (sender?.name ?? 'Someone'),
                          preview: item.poll
                            ? `📊 ${item.poll.question}`
                            : item.text.length > 0
                              ? item.text
                              : '📷 Photo',
                        })
                      }
                      className="h-6 w-6 items-center justify-center"
                    >
                      <Ionicons name="arrow-undo-outline" size={14} className="text-charcoal/40" />
                    </Pressable>
                    {!item.poll && (
                      <Pressable
                        onPress={() => setForwardingMessage(item)}
                        className="h-6 w-6 items-center justify-center"
                      >
                        <Ionicons name="arrow-redo-outline" size={14} className="text-charcoal/40" />
                      </Pressable>
                    )}
                    {item.text.length > 0 && (
                      <Pressable
                        onPress={() => copyMessage(item.id, item.text)}
                        className="h-6 w-6 items-center justify-center"
                      >
                        <Ionicons
                          name={copiedMessageId === item.id ? 'checkmark' : 'copy-outline'}
                          size={13}
                          className={copiedMessageId === item.id ? 'text-sage' : 'text-charcoal/40'}
                        />
                      </Pressable>
                    )}
                    {isMe && !item.poll ? (
                      <Pressable
                        onPress={() => {
                          setEditingMessageId(item.id);
                          setEditDraft(item.text);
                        }}
                        className="h-6 w-6 items-center justify-center"
                      >
                        <Ionicons name="pencil" size={13} className="text-charcoal/40" />
                      </Pressable>
                    ) : !isMe ? (
                      <Pressable
                        onPress={() => setReportingMessageId(item.id)}
                        className="h-6 w-6 items-center justify-center"
                      >
                        <Ionicons name="ellipsis-horizontal" size={14} className="text-charcoal/40" />
                      </Pressable>
                    ) : null}
                  </View>
                )}
                {index === lastMeIndex && seenByNames.length > 0 && !item.deleted && (
                  <Text className="mt-0.5 text-[11px] text-sage">
                    Seen by {seenByNames.join(', ')}
                  </Text>
                )}
              </Pressable>
            );
          }}
          ListFooterComponent={
            typingUser ? (
              <View className="mt-2 max-w-[78%] items-start self-start">
                <View className="mb-1 flex-row items-center gap-1.5 pl-1">
                  <Image source={{ uri: typingUser.avatar }} className="h-5 w-5 rounded-full" />
                  <Text className="text-xs font-medium text-charcoal/60">{typingUser.name}</Text>
                </View>
                <View className="flex-row items-center gap-1 rounded-2xl rounded-bl-sm bg-cream px-4 py-3.5">
                  <View className="h-1.5 w-1.5 rounded-full bg-ink/40" />
                  <View className="h-1.5 w-1.5 rounded-full bg-ink/40" />
                  <View className="h-1.5 w-1.5 rounded-full bg-ink/40" />
                </View>
              </View>
            ) : null
          }
        />

        {imageUri && (
          <View className="border-t border-charcoal/10 bg-cream px-3 pt-2.5">
            <View className="self-start" style={{ position: 'relative' }}>
              <Image source={{ uri: imageUri }} className="h-16 w-16 rounded-xl" />
              <Pressable
                onPress={() => setImageUri(undefined)}
                className="absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full bg-ink/70"
              >
                <Ionicons name="close" size={11} className="text-paper" />
              </Pressable>
            </View>
          </View>
        )}

        {replyingTo && (
          <View className="flex-row items-center justify-between gap-2 border-t border-charcoal/10 bg-cream px-4 pt-2">
            <View className="flex-1">
              <Text className="text-xs text-charcoal/50">
                Replying to <Text className="font-semibold text-charcoal/70">{replyingTo.senderName}</Text>
              </Text>
              <Text className="text-xs text-charcoal/50" numberOfLines={1}>
                {replyingTo.preview}
              </Text>
            </View>
            <Pressable onPress={() => setReplyingTo(null)} className="p-1">
              <Ionicons name="close" size={14} className="text-charcoal/50" />
            </Pressable>
          </View>
        )}

        <View
          className={`flex-row items-center gap-2 bg-cream px-3 py-2.5 ${
            imageUri || replyingTo ? '' : 'border-t border-charcoal/10'
          }`}
        >
          <Pressable
            onPress={pickImage}
            className="h-10 w-10 items-center justify-center rounded-full bg-sand"
          >
            <Ionicons name="image-outline" size={19} className="text-sage" />
          </Pressable>
          <Pressable
            onPress={() => setCreatingPoll(true)}
            className="h-10 w-10 items-center justify-center rounded-full bg-sand"
          >
            <Ionicons name="stats-chart-outline" size={18} className="text-sage" />
          </Pressable>
          <View className="flex-1">
            <MentionTextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={replyingTo ? `Reply to ${replyingTo.senderName}...` : `Message ${group.name}...`}
              className="rounded-full bg-sand px-4 py-2.5 text-charcoal"
              multiline
              dropdownPosition="above"
            />
          </View>
          <Pressable
            onPress={send}
            className="h-10 w-10 items-center justify-center rounded-full bg-terracotta"
          >
            <Ionicons name="arrow-up" size={20} className="text-paper" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {reactorsFor && (
        <ReactorsSheet
          reactions={messages.find((m) => m.id === reactorsFor)?.reactions}
          myReaction={myReactions[groupMessageKey(group.id, reactorsFor)]}
          onClose={() => setReactorsFor(null)}
          onPersonPress={(userId) => {
            setReactorsFor(null);
            router.push(`/profile/${userId}`);
          }}
        />
      )}

      {forwardingMessage && (
        <ForwardSheet
          preview={forwardingMessage.imageUri ? '📷 Photo' : forwardingMessage.text}
          excludeGroupId={group.id}
          onForward={handleForward}
          onClose={() => setForwardingMessage(null)}
        />
      )}

      {reportingMessageId && (
        <ReportPostSheet
          onClose={() => setReportingMessageId(null)}
          title="Message options"
          actionLabel="Report this message"
        />
      )}

      {showGallery && (
        <ChatMediaGallery
          title={`Photos in ${group.name}`}
          photos={galleryPhotos}
          onSelectPhoto={jumpToMessage}
          onClose={() => setShowGallery(false)}
        />
      )}

      {creatingPoll && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable
            className="absolute inset-0"
            onPress={() => {
              setCreatingPoll(false);
              setPollQuestion('');
              setPollOptions(['', '']);
            }}
          />
          <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">New poll</Text>
              <Pressable
                onPress={() => {
                  setCreatingPoll(false);
                  setPollQuestion('');
                  setPollOptions(['', '']);
                }}
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>

            <TextInput
              value={pollQuestion}
              onChangeText={setPollQuestion}
              placeholder="Ask the group something..."
              placeholderTextColor="#3D3D3D80"
              className="rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
            />

            <View className="gap-2">
              {pollOptions.map((option, i) => (
                <View key={i} className="flex-row items-center gap-2">
                  <TextInput
                    value={option}
                    onChangeText={(v) =>
                      setPollOptions((opts) => opts.map((o, oi) => (oi === i ? v : o)))
                    }
                    placeholder={`Option ${i + 1}`}
                    placeholderTextColor="#3D3D3D80"
                    className="flex-1 rounded-2xl bg-sand px-4 py-2.5 text-sm text-charcoal"
                  />
                  {pollOptions.length > 2 && (
                    <Pressable
                      onPress={() => setPollOptions((opts) => opts.filter((_, oi) => oi !== i))}
                      className="h-8 w-8 items-center justify-center rounded-full"
                    >
                      <Ionicons name="close-circle" size={18} className="text-charcoal/30" />
                    </Pressable>
                  )}
                </View>
              ))}
            </View>

            {pollOptions.length < 4 && (
              <Pressable
                onPress={() => setPollOptions((opts) => [...opts, ''])}
                className="flex-row items-center gap-1.5 self-start"
              >
                <Ionicons name="add-circle-outline" size={16} className="text-terracotta" />
                <Text className="text-sm font-medium text-terracotta">Add option</Text>
              </Pressable>
            )}

            <Pressable
              onPress={submitPoll}
              disabled={!canSubmitPoll}
              className={`mt-1 items-center rounded-full py-3 ${
                canSubmitPoll ? 'bg-terracotta' : 'bg-ink/10'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${canSubmitPoll ? 'text-paper' : 'text-charcoal/40'}`}
              >
                Create poll
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
