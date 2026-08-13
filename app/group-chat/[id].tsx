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
import { groupMessageKey, useGroupChatStore, type GroupMessage } from '../../store/useGroupChatStore';

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
  const markRead = useGroupsStore((s) => s.markRead);
  const toggleJoin = useGroupsStore((s) => s.toggle);

  const [draft, setDraft] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [reactorsFor, setReactorsFor] = useState<string | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<GroupMessage | null>(null);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

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
    sendMessage(group.id, draft.trim(), imageUri);
    setDraft('');
    setImageUri(undefined);
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

      {pinnedMessage && pinnedSender && (
        <View className="flex-row items-center gap-2.5 border-b border-charcoal/10 bg-gold/10 px-4 py-2.5">
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
                  <Text className="text-sm text-charcoal">Delete this message?</Text>
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
                    {isMe ? (
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

        <View
          className={`flex-row items-center gap-2 bg-cream px-3 py-2.5 ${
            imageUri ? '' : 'border-t border-charcoal/10'
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
              placeholder={`Message ${group.name}...`}
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
    </SafeAreaView>
  );
}
