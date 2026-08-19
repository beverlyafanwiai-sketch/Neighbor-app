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
import { CONVERSATION_STARTER_META } from '../../components/ProfileView';
import MentionText from '../../components/MentionText';
import MentionTextInput from '../../components/MentionTextInput';
import ReactionButton from '../../components/ReactionButton';
import ReactorsSheet from '../../components/ReactorsSheet';
import ReportPostSheet from '../../components/ReportPostSheet';
import { getUser, type Message } from '../../data/mock';
import { useBlockedStore } from '../../store/useBlockedStore';
import { messageKey, useConversationsStore } from '../../store/useConversationsStore';
import { useGroupChatStore } from '../../store/useGroupChatStore';
import { useMutedStore } from '../../store/useMutedStore';

export default function ChatThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = useConversationsStore((s) => s.conversations[id]);
  const sendMessage = useConversationsStore((s) => s.sendMessage);
  const markRead = useConversationsStore((s) => s.markRead);
  const deleteMessage = useConversationsStore((s) => s.deleteMessage);
  const deleteConversation = useConversationsStore((s) => s.deleteConversation);
  const updateMessage = useConversationsStore((s) => s.updateMessage);
  const myReactions = useConversationsStore((s) => s.myReactions);
  const tapReaction = useConversationsStore((s) => s.tapReaction);
  const setReaction = useConversationsStore((s) => s.setReaction);
  const isTyping = useConversationsStore((s) => s.typing[id] ?? false);
  const pinnedMessageId = useConversationsStore((s) => s.pinnedMessageId[id]);
  const pinMessage = useConversationsStore((s) => s.pinMessage);
  const unpinMessage = useConversationsStore((s) => s.unpinMessage);
  const user = conversation ? getUser(conversation.userId) : undefined;
  const isBlocked = useBlockedStore((s) => (user ? (s.blockedIds[user.id] ?? false) : false));
  const toggleBlocked = useBlockedStore((s) => s.toggle);
  const isMuted = useMutedStore((s) => (user ? (s.mutedIds[user.id] ?? false) : false));
  const toggleMuted = useMutedStore((s) => s.toggle);

  const [draft, setDraft] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [reactorsFor, setReactorsFor] = useState<string | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [confirmingBlock, setConfirmingBlock] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [reportedPerson, setReportedPerson] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; senderName: string; preview: string } | null>(
    null
  );
  const listRef = useRef<FlatList>(null);

  const messages = conversation?.messages ?? [];
  const matches = searchQuery.trim()
    ? messages
        .map((m, i) => ({ m, i }))
        .filter(({ m }) => !m.deleted && m.text.toLowerCase().includes(searchQuery.trim().toLowerCase()))
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

  useEffect(() => {
    // Jump to the most recent match first, like most chat search UIs --
    // matches/goToMatch are intentionally excluded from deps since they're
    // recomputed every render and would otherwise re-trigger this on scroll.
    if (!searching || matches.length === 0) return;
    goToMatch(matches.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searching]);

  useEffect(() => {
    markRead(id);
  }, [id, markRead]);

  if (!conversation || !user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="text-charcoal">Conversation not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-terracotta">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const lastMeIndex = messages.reduce(
    (acc, m, i) => (m.from === 'me' ? i : acc),
    -1
  );

  const pinnedMessage = messages.find((m) => m.id === pinnedMessageId);
  const pinnedSenderName = pinnedMessage ? (pinnedMessage.from === 'me' ? 'You' : user.name) : undefined;

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
    sendMessage(conversation.id, draft.trim(), imageUri, undefined, replyingTo?.id);
    setDraft('');
    setImageUri(undefined);
    setReplyingTo(null);
  };

  const saveMessageEdit = () => {
    if (!editDraft.trim() || !editingMessageId) return;
    updateMessage(conversation.id, editingMessageId, editDraft.trim());
    setEditingMessageId(null);
  };

  const closeActions = () => {
    setShowActions(false);
    setConfirmingBlock(false);
    setConfirmingDelete(false);
    setReportedPerson(false);
  };

  const confirmBlock = () => {
    toggleBlocked(user.id);
    router.back();
  };

  const confirmDeleteConversation = () => {
    deleteConversation(conversation.id);
    router.back();
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

  const handleForward = (target: ForwardTarget) => {
    if (!forwardingMessage) return;
    const senderName = forwardingMessage.from === 'me' ? 'You' : user.name;
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
            onPress={() => router.push(`/profile/${user.id}`)}
            className="flex-1 flex-row items-center gap-3"
          >
            <Image source={{ uri: user.avatar }} className="h-10 w-10 rounded-full" />
            <View className="flex-1">
              <Text className="text-base font-semibold text-charcoal">{user.name}</Text>
              <Text className="text-xs text-sage">Active now</Text>
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
            onPress={() => setShowActions(true)}
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Ionicons name="ellipsis-horizontal" size={20} className="text-charcoal" />
          </Pressable>
        </View>
      )}

      {pinnedMessage && pinnedSenderName && (
        <Pressable
          onPress={() => jumpToMessage(pinnedMessage.id)}
          className="flex-row items-center gap-2.5 border-b border-charcoal/10 bg-gold/10 px-4 py-2.5"
        >
          <Ionicons name="pin" size={14} className="text-gold" />
          <View className="flex-1">
            <Text className="text-xs font-semibold text-charcoal/60">
              Pinned · {pinnedSenderName}
            </Text>
            <Text className="text-sm text-charcoal" numberOfLines={1}>
              {pinnedMessage.text || 'Photo'}
            </Text>
          </View>
          <Pressable
            onPress={() => unpinMessage(id)}
            className="h-7 w-7 items-center justify-center rounded-full"
          >
            <Ionicons name="close" size={15} className="text-charcoal/50" />
          </Pressable>
        </Pressable>
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
                This is the beginning of your conversation with {user.name}
              </Text>
              {messages.length === 0 && (
                <View className="mt-4 w-full gap-2">
                  {CONVERSATION_STARTER_META.filter(
                    (m) => user.conversationStarters[m.key].length > 0
                  ).map((m) => (
                    <View
                      key={m.key}
                      className="flex-row items-start gap-2.5 rounded-2xl bg-cream p-3"
                    >
                      <Ionicons name={m.icon} size={15} className="mt-0.5 text-terracotta" />
                      <View className="flex-1">
                        <Text className="text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">
                          {m.label}
                        </Text>
                        <Text className="mt-0.5 text-xs text-charcoal/70">
                          {user.conversationStarters[m.key]}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          }
          renderItem={({ item, index }) => {
            const isMine = item.from === 'me';

            if (deletingMessageId === item.id) {
              return (
                <View className="max-w-[85%] self-end gap-2 rounded-2xl bg-terracotta/10 p-3">
                  <Text className="text-sm text-charcoal">Delete this message?</Text>
                  <View className="flex-row justify-end gap-4">
                    <Pressable onPress={() => setDeletingMessageId(null)}>
                      <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        deleteMessage(conversation.id, item.id);
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
                onLongPress={() => isMine && !item.deleted && setDeletingMessageId(item.id)}
                className={`max-w-[78%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {item.replyToId &&
                  !item.deleted &&
                  (() => {
                    const replied = messages.find((m) => m.id === item.replyToId);
                    if (!replied) return null;
                    const repliedSenderName = replied.from === 'me' ? 'You' : user.name;
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
                      : isMine
                        ? 'rounded-br-sm bg-terracotta'
                        : 'rounded-bl-sm bg-cream'
                  }`}
                >
                  {item.deleted ? (
                    <Text className="text-sm italic text-charcoal/50">You deleted a message</Text>
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
                          className={isMine ? 'text-paper' : 'text-charcoal'}
                          mentionClassName={
                            isMine ? 'font-semibold text-paper underline' : 'font-semibold text-terracotta'
                          }
                        />
                      )}
                    </>
                  )}
                </View>
                {!item.deleted && (
                  <View className="-mt-1 flex-row items-center gap-2">
                    <ReactionButton
                      reactions={item.reactions}
                      myReaction={myReactions[messageKey(conversation.id, item.id)]}
                      onTap={() => tapReaction(conversation.id, item.id)}
                      onSelect={(type) => setReaction(conversation.id, item.id, type)}
                      onShowReactors={() => setReactorsFor(item.id)}
                      pickerAlign={isMine ? 'right' : 'left'}
                      compact
                    />
                    <Pressable
                      onPress={() =>
                        setReplyingTo({
                          id: item.id,
                          senderName: isMine ? 'You' : user.name,
                          preview: item.text.length > 0 ? item.text : '📷 Photo',
                        })
                      }
                      className="h-6 w-6 items-center justify-center"
                    >
                      <Ionicons name="arrow-undo-outline" size={14} className="text-charcoal/40" />
                    </Pressable>
                    <Pressable
                      onPress={() => setForwardingMessage(item)}
                      className="h-6 w-6 items-center justify-center"
                    >
                      <Ionicons name="arrow-redo-outline" size={14} className="text-charcoal/40" />
                    </Pressable>
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
                    {isMine ? (
                      <Pressable
                        onPress={() => {
                          setEditingMessageId(item.id);
                          setEditDraft(item.text);
                        }}
                        className="h-6 w-6 items-center justify-center"
                      >
                        <Ionicons name="pencil" size={13} className="text-charcoal/40" />
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => setReportingMessageId(item.id)}
                        className="h-6 w-6 items-center justify-center"
                      >
                        <Ionicons name="ellipsis-horizontal" size={14} className="text-charcoal/40" />
                      </Pressable>
                    )}
                  </View>
                )}
                <View className="mt-0.5 flex-row items-center gap-1.5">
                  <Text className="text-[11px] text-charcoal/40">
                    {item.time}
                    {item.edited && ' · edited'}
                  </Text>
                  {!item.deleted && (
                    <Pressable
                      onPress={() =>
                        item.id === pinnedMessageId ? unpinMessage(id) : pinMessage(id, item.id)
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
                {index === lastMeIndex && item.seen && !item.deleted && (
                  <Text className="mt-0.5 text-[11px] text-sage">Seen</Text>
                )}
              </Pressable>
            );
          }}
          ListFooterComponent={
            isTyping ? (
              <View className="mt-2 max-w-[78%] items-start self-start">
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
          <View className="flex-1">
            <MentionTextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={replyingTo ? `Reply to ${replyingTo.senderName}...` : `Message ${user.name}...`}
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
          myReaction={myReactions[messageKey(conversation.id, reactorsFor)]}
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
          excludeConversationId={conversation.id}
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
          title={`Photos with ${user.name}`}
          photos={galleryPhotos}
          onSelectPhoto={jumpToMessage}
          onClose={() => setShowGallery(false)}
        />
      )}

      {showActions && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={closeActions} />
          <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">{user.name}</Text>
              <Pressable
                onPress={closeActions}
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>

            <Pressable
              onPress={() => toggleMuted(user.id)}
              className="flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
            >
              <Ionicons
                name={isMuted ? 'volume-high-outline' : 'volume-mute-outline'}
                size={20}
                className="text-charcoal"
              />
              <View className="flex-1">
                <Text className="text-sm font-medium text-charcoal">
                  {isMuted ? `Unmute ${user.name}` : `Mute ${user.name}`}
                </Text>
                {!isMuted && (
                  <Text className="mt-0.5 text-xs text-charcoal/50">
                    Quietly hide their posts — they won't be notified
                  </Text>
                )}
              </View>
            </Pressable>

            {confirmingBlock ? (
              <View className="gap-3 rounded-2xl bg-terracotta/10 p-4">
                <Text className="text-sm text-charcoal">
                  Block {user.name}? You won't see their posts or messages, and they won't be able
                  to reach you.
                </Text>
                <View className="flex-row justify-end gap-4">
                  <Pressable onPress={() => setConfirmingBlock(false)}>
                    <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                  </Pressable>
                  <Pressable onPress={confirmBlock}>
                    <Text className="text-sm font-semibold text-terracotta">Block</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => (isBlocked ? confirmBlock() : setConfirmingBlock(true))}
                className="flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
              >
                <Ionicons
                  name={isBlocked ? 'checkmark-circle-outline' : 'ban-outline'}
                  size={20}
                  className="text-terracotta"
                />
                <Text className="text-sm font-medium text-terracotta">
                  {isBlocked ? `Unblock ${user.name}` : `Block ${user.name}`}
                </Text>
              </Pressable>
            )}

            {confirmingDelete ? (
              <View className="gap-3 rounded-2xl bg-terracotta/10 p-4">
                <Text className="text-sm text-charcoal">
                  Delete this conversation? This can't be undone.
                </Text>
                <View className="flex-row justify-end gap-4">
                  <Pressable onPress={() => setConfirmingDelete(false)}>
                    <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                  </Pressable>
                  <Pressable onPress={confirmDeleteConversation}>
                    <Text className="text-sm font-semibold text-terracotta">Delete</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setConfirmingDelete(true)}
                className="flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
              >
                <Ionicons name="trash-outline" size={20} className="text-terracotta" />
                <Text className="text-sm font-medium text-terracotta">Delete conversation</Text>
              </Pressable>
            )}

            {reportedPerson ? (
              <View className="rounded-2xl bg-sage/15 p-4">
                <Text className="text-sm text-sage">
                  Thanks — we've received your report and will take a look.
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => setReportedPerson(true)}
                className="flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
              >
                <Ionicons name="flag-outline" size={20} className="text-charcoal" />
                <Text className="text-sm font-medium text-charcoal">Report {user.name}</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
