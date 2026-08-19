import { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import ForwardSheet, { type ForwardTarget } from '../../components/ForwardSheet';
import MentionText from '../../components/MentionText';
import MentionTextInput from '../../components/MentionTextInput';
import PhotoCarousel from '../../components/PhotoCarousel';
import PhotoViewer from '../../components/PhotoViewer';
import PollView from '../../components/PollView';
import ReactionButton from '../../components/ReactionButton';
import ReactorsSheet from '../../components/ReactorsSheet';
import ReportPostSheet from '../../components/ReportPostSheet';
import ShareSheet from '../../components/ShareSheet';
import { ME, getUser, type CommentItem } from '../../data/mock';
import { useConversationsStore } from '../../store/useConversationsStore';
import { useGroupChatStore } from '../../store/useGroupChatStore';
import { containsMutedWord, useMutedWordsStore } from '../../store/useMutedWordsStore';
import {
  commentKey,
  getEffectiveReactions,
  getEffectiveReplies,
  getReactionTotal,
  usePostsStore,
} from '../../store/usePostsStore';
import { useProfileStore } from '../../store/useProfileStore';

const EMPTY_COMMENTS: CommentItem[] = [];

const COMMENT_SORTS = [
  { value: 'oldest', label: 'Oldest' },
  { value: 'newest', label: 'Newest' },
  { value: 'liked', label: 'Most liked' },
] as const;
type CommentSort = (typeof COMMENT_SORTS)[number]['value'];

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = usePostsStore((s) => s.posts.find((p) => p.id === id));
  const myReaction = usePostsStore((s) => (post ? s.myReactions[post.id] : undefined));
  const tapReaction = usePostsStore((s) => s.tapReaction);
  const setReaction = usePostsStore((s) => s.setReaction);
  const myCommentReactions = usePostsStore((s) => s.myCommentReactions);
  const tapCommentReaction = usePostsStore((s) => s.tapCommentReaction);
  const setCommentReaction = usePostsStore((s) => s.setCommentReaction);
  const saved = usePostsStore((s) => (post ? (s.savedIds[post.id] ?? false) : false));
  const toggleSave = usePostsStore((s) => s.toggleSave);
  const rawComments = usePostsStore((s) =>
    post ? (s.comments[post.id] ?? EMPTY_COMMENTS) : EMPTY_COMMENTS
  );
  const mutedWords = useMutedWordsStore((s) => s.words);
  const comments = rawComments.filter((c) => !containsMutedWord(c.text, mutedWords));
  const myPollVote = usePostsStore((s) => (post ? s.myPollVotes[post.id] : undefined));
  const votePoll = usePostsStore((s) => s.votePoll);
  const closePoll = usePostsStore((s) => s.closePoll);
  const reopenPoll = usePostsStore((s) => s.reopenPoll);
  const addPollOption = usePostsStore((s) => s.addPollOption);
  const addComment = usePostsStore((s) => s.addComment);
  const updateComment = usePostsStore((s) => s.updateComment);
  const deleteComment = usePostsStore((s) => s.deleteComment);
  const pinnedCommentId = usePostsStore((s) => (post ? s.pinnedCommentId[post.id] : undefined));
  const pinComment = usePostsStore((s) => s.pinComment);
  const unpinComment = usePostsStore((s) => s.unpinComment);
  const deletePost = usePostsStore((s) => s.deletePost);
  const pinnedPostId = usePostsStore((s) => s.pinnedPostId);
  const pinPost = usePostsStore((s) => s.pinPost);
  const unpinPost = usePostsStore((s) => s.unpinPost);
  const profile = useProfileStore((s) => s.profile);

  const [draft, setDraft] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [reactorsFor, setReactorsFor] = useState<'post' | string | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [forwardingCommentId, setForwardingCommentId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [commentSort, setCommentSort] = useState<CommentSort>('oldest');
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState<number | null>(null);

  const resolveUser = (userId: string) => (userId === ME.id ? profile : getUser(userId));
  const author = post ? resolveUser(post.authorId) : undefined;
  const isAuthor = post?.authorId === ME.id;
  const isPinned = post ? post.id === pinnedPostId : false;
  const forwardingComment = comments.find((c) => c.id === forwardingCommentId);

  const forwardComment = (target: ForwardTarget) => {
    if (!forwardingComment) return;
    const commentAuthor = resolveUser(forwardingComment.authorId);
    const senderName = forwardingComment.authorId === ME.id ? 'You' : (commentAuthor?.name ?? 'Someone');
    if (target.kind === 'dm') {
      useConversationsStore.getState().sendMessage(target.id, forwardingComment.text, undefined, senderName);
    } else {
      useGroupChatStore.getState().sendMessage(target.id, forwardingComment.text, undefined, senderName);
    }
  };

  if (!post || !author) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="text-charcoal">Post not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-terracotta">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const send = () => {
    if (!draft.trim()) return;
    addComment(post.id, draft.trim(), replyingTo?.id);
    setDraft('');
    setReplyingTo(null);
  };

  const remove = () => {
    deletePost(post.id);
    router.back();
  };

  const saveEdit = () => {
    if (!editDraft.trim() || !editingCommentId) return;
    updateComment(post.id, editingCommentId, editDraft.trim());
    setEditingCommentId(null);
  };

  const commentLikeTotal = (c: CommentItem) =>
    getReactionTotal(getEffectiveReactions(c.reactions, myCommentReactions[commentKey(post.id, c.id)]));

  const topLevelComments = comments.filter((c) => !c.parentId);
  let sortedTopLevelComments = topLevelComments;
  if (commentSort === 'newest') {
    sortedTopLevelComments = [...topLevelComments].reverse();
  } else if (commentSort === 'liked') {
    sortedTopLevelComments = [...topLevelComments].sort(
      (a, b) => commentLikeTotal(b) - commentLikeTotal(a)
    );
  }

  const commentRows: { comment: CommentItem; isReply: boolean }[] = [];
  for (const c of sortedTopLevelComments) {
    commentRows.push({ comment: c, isReply: false });
    for (const r of comments.filter((r) => r.parentId === c.id)) {
      commentRows.push({ comment: r, isReply: true });
    }
  }

  const pinnedComment = comments.find((c) => c.id === pinnedCommentId);
  const pinnedCommentAuthor = pinnedComment ? resolveUser(pinnedComment.authorId) : undefined;

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between gap-3 border-b border-charcoal/10 bg-cream px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Ionicons name="chevron-back" size={22} className="text-charcoal" />
          </Pressable>
          <Text className="text-base font-bold text-charcoal">Post</Text>
        </View>
        {isAuthor ? (
          <View className="flex-row items-center gap-1.5">
            <Pressable
              onPress={() => (isPinned ? unpinPost() : pinPost(post.id))}
              accessibilityLabel={isPinned ? 'Unpin post' : 'Pin post'}
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <Ionicons
                name={isPinned ? 'pin' : 'pin-outline'}
                size={17}
                className={isPinned ? 'text-gold' : 'text-charcoal'}
              />
            </Pressable>
            <Pressable
              onPress={() => router.push(`/create-post?id=${post.id}`)}
              accessibilityLabel="Edit post"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <Ionicons name="pencil" size={17} className="text-charcoal" />
            </Pressable>
            <Pressable
              onPress={() => router.push(`/create-post?duplicateId=${post.id}`)}
              accessibilityLabel="Duplicate post"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <Ionicons name="copy-outline" size={17} className="text-charcoal" />
            </Pressable>
            <Pressable
              onPress={() => setConfirmingDelete(true)}
              accessibilityLabel="Delete post"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <Ionicons name="trash-outline" size={17} className="text-terracotta" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setReporting(true)}
            accessibilityLabel="Post options"
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Ionicons name="ellipsis-horizontal" size={20} className="text-charcoal" />
          </Pressable>
        )}
      </View>

      {confirmingDelete && (
        <View className="flex-row items-center gap-3 bg-terracotta/10 px-4 py-3">
          <Text className="flex-1 text-sm text-charcoal">
            Delete this post? This can't be undone.
          </Text>
          <Pressable onPress={() => setConfirmingDelete(false)} className="rounded-full px-3 py-1.5">
            <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
          </Pressable>
          <Pressable onPress={remove} className="rounded-full bg-terracotta px-3 py-1.5">
            <Text className="text-sm font-semibold text-paper">Delete</Text>
          </Pressable>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={commentRows}
          keyExtractor={(row) => row.comment.id}
          contentContainerClassName="pb-4"
          ListHeaderComponent={
            <View className="gap-3 border-b border-charcoal/10 bg-cream p-4">
              {isPinned && (
                <View className="flex-row items-center gap-1.5 self-start rounded-full bg-gold/15 px-2.5 py-1">
                  <Ionicons name="pin" size={12} className="text-gold" />
                  <Text className="text-xs font-semibold text-gold">Pinned</Text>
                </View>
              )}
              <Pressable
                onPress={() => router.push(`/profile/${author.id}`)}
                className="flex-row items-center gap-3"
              >
                <Image source={{ uri: author.avatar }} className="h-11 w-11 rounded-full" />
                <View>
                  <Text className="font-semibold text-charcoal">{author.name}</Text>
                  <Text className="text-xs text-charcoal/60">
                    {post.time}
                    {post.edited && ' · edited'}
                  </Text>
                </View>
              </Pressable>

              <MentionText text={post.body} className="text-[15px] leading-5 text-charcoal" />

              {post.imageUris && post.imageUris.length > 0 && (
                <PhotoCarousel
                  uris={post.imageUris}
                  className=""
                  onPhotoPress={(i) => setViewingPhotoIndex(i)}
                />
              )}

              {post.poll && (
                <PollView
                  poll={post.poll}
                  myVote={myPollVote}
                  onVote={(optionId) => votePoll(post.id, optionId)}
                  isAuthor={isAuthor}
                  onClose={() => closePoll(post.id)}
                  onReopen={() => reopenPoll(post.id)}
                  onAddOption={(text) => addPollOption(post.id, text)}
                />
              )}

              <View className="flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                <View className="flex-row items-center gap-6">
                  <ReactionButton
                    reactions={post.reactions}
                    myReaction={myReaction}
                    onTap={() => tapReaction(post.id)}
                    onSelect={(type) => setReaction(post.id, type)}
                    onShowReactors={() => setReactorsFor('post')}
                  />
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="chatbubble-outline" size={17} className="text-sage" />
                    <Text className="text-sm text-charcoal/70">
                      {getEffectiveReplies(post, comments)}
                    </Text>
                  </View>
                  <Pressable onPress={() => setSharing(true)} className="flex-row items-center gap-1.5">
                    <Ionicons name="arrow-redo-outline" size={18} className="text-charcoal/50" />
                    <Text className="text-sm text-charcoal/70">Share</Text>
                  </Pressable>
                </View>
                <Pressable onPress={() => toggleSave(post.id)}>
                  <Ionicons
                    name={saved ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    className={saved ? 'text-gold' : 'text-charcoal/50'}
                  />
                </Pressable>
              </View>

              {pinnedComment && pinnedCommentAuthor && (
                <View className="flex-row items-center gap-2.5 rounded-2xl border-t border-charcoal/10 bg-gold/10 p-3 pt-3">
                  <Ionicons name="pin" size={14} className="text-gold" />
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-charcoal/60">
                      Pinned · {pinnedCommentAuthor.name}
                    </Text>
                    <Text className="mt-0.5 text-sm text-charcoal" numberOfLines={2}>
                      {pinnedComment.text}
                    </Text>
                  </View>
                  {isAuthor && (
                    <Pressable
                      onPress={() => unpinComment(post.id)}
                      accessibilityLabel="Unpin comment"
                      accessibilityRole="button"
                      className="h-7 w-7 items-center justify-center"
                    >
                      <Ionicons name="close" size={15} className="text-charcoal/50" />
                    </Pressable>
                  )}
                </View>
              )}

              {topLevelComments.length > 1 && (
                <View className="flex-row items-center gap-2 border-t border-charcoal/10 pt-3">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                    Sort
                  </Text>
                  {COMMENT_SORTS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setCommentSort(opt.value)}
                      className={`rounded-full px-3 py-1 ${
                        commentSort === opt.value ? 'bg-ink' : 'bg-sand'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          commentSort === opt.value ? 'text-paper' : 'text-charcoal/60'
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          }
          renderItem={({ item: row }) => {
            const item = row.comment;
            const commenter = resolveUser(item.authorId);
            if (!commenter) return null;
            const isCommentAuthor = item.authorId === ME.id;

            if (deletingCommentId === item.id) {
              return (
                <View
                  className={`flex-row items-center gap-3 bg-terracotta/10 px-4 py-3 ${row.isReply ? 'ml-10' : ''}`}
                >
                  <Text className="flex-1 text-sm text-charcoal">Delete this comment?</Text>
                  <Pressable
                    onPress={() => setDeletingCommentId(null)}
                    className="rounded-full px-3 py-1.5"
                  >
                    <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      deleteComment(post.id, item.id);
                      setDeletingCommentId(null);
                    }}
                    className="rounded-full bg-terracotta px-3 py-1.5"
                  >
                    <Text className="text-sm font-semibold text-paper">Delete</Text>
                  </Pressable>
                </View>
              );
            }

            if (editingCommentId === item.id) {
              return (
                <View className={`gap-2 px-4 py-3 ${row.isReply ? 'ml-10' : ''}`}>
                  <TextInput
                    value={editDraft}
                    onChangeText={setEditDraft}
                    autoFocus
                    multiline
                    className="rounded-2xl bg-sand px-3 py-2 text-sm text-charcoal"
                  />
                  <View className="flex-row justify-end gap-3">
                    <Pressable onPress={() => setEditingCommentId(null)}>
                      <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                    </Pressable>
                    <Pressable onPress={saveEdit}>
                      <Text className="text-sm font-semibold text-terracotta">Save</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }

            const commentReactionKey = commentKey(post.id, item.id);
            const commentMyReaction = myCommentReactions[commentReactionKey];

            return (
              <View
                className={`flex-row items-start gap-2.5 px-4 py-3 ${row.isReply ? 'ml-10' : ''}`}
              >
                <Image
                  source={{ uri: commenter.avatar }}
                  className={row.isReply ? 'h-7 w-7 rounded-full' : 'h-9 w-9 rounded-full'}
                />
                <View className="flex-1">
                  <Pressable onPress={() => router.push(`/profile/${commenter.id}`)}>
                    <View className="flex-row items-baseline gap-2">
                      <Text className="text-sm font-semibold text-charcoal">{commenter.name}</Text>
                      <Text className="text-[11px] text-charcoal/40">
                        {item.time}
                        {item.edited && ' · edited'}
                      </Text>
                    </View>
                    <MentionText
                      text={item.text}
                      className="mt-0.5 text-sm leading-5 text-charcoal/80"
                    />
                  </Pressable>
                  <View className="mt-1 flex-row items-center gap-3">
                    <ReactionButton
                      reactions={item.reactions}
                      myReaction={commentMyReaction}
                      onTap={() => tapCommentReaction(post.id, item.id)}
                      onSelect={(type) => setCommentReaction(post.id, item.id, type)}
                      onShowReactors={() => setReactorsFor(item.id)}
                      compact
                    />
                    <Pressable
                      onPress={() => setReplyingTo({ id: row.isReply ? item.parentId! : item.id, name: commenter.name })}
                    >
                      <Text className="text-xs font-medium text-charcoal/50">Reply</Text>
                    </Pressable>
                  </View>
                </View>
                <View className="flex-row items-center gap-1">
                  <Pressable
                    onPress={() => setForwardingCommentId(item.id)}
                    accessibilityLabel="Forward comment"
                    accessibilityRole="button"
                    className="h-7 w-7 items-center justify-center rounded-full"
                  >
                    <Ionicons name="arrow-redo-outline" size={13} className="text-charcoal/40" />
                  </Pressable>
                  {isAuthor && (
                    <Pressable
                      onPress={() =>
                        pinnedCommentId === item.id
                          ? unpinComment(post.id)
                          : pinComment(post.id, item.id)
                      }
                      accessibilityLabel={pinnedCommentId === item.id ? 'Unpin comment' : 'Pin comment'}
                      accessibilityRole="button"
                      className="h-7 w-7 items-center justify-center rounded-full"
                    >
                      <Ionicons
                        name={pinnedCommentId === item.id ? 'pin' : 'pin-outline'}
                        size={13}
                        className={pinnedCommentId === item.id ? 'text-gold' : 'text-charcoal/40'}
                      />
                    </Pressable>
                  )}
                  {isCommentAuthor ? (
                    <>
                      <Pressable
                        onPress={() => {
                          setEditingCommentId(item.id);
                          setEditDraft(item.text);
                        }}
                        accessibilityLabel="Edit comment"
                        accessibilityRole="button"
                        className="h-7 w-7 items-center justify-center rounded-full"
                      >
                        <Ionicons name="pencil" size={13} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => setDeletingCommentId(item.id)}
                        accessibilityLabel="Delete comment"
                        accessibilityRole="button"
                        className="h-7 w-7 items-center justify-center rounded-full"
                      >
                        <Ionicons name="trash-outline" size={13} className="text-terracotta" />
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      onPress={() => setReportingCommentId(item.id)}
                      accessibilityLabel="Comment options"
                      accessibilityRole="button"
                      className="h-7 w-7 items-center justify-center rounded-full"
                    >
                      <Ionicons name="ellipsis-horizontal" size={15} className="text-charcoal/40" />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text className="px-4 py-6 text-center text-sm text-charcoal/50">
              No comments yet. Be the first to reply.
            </Text>
          }
        />

        {replyingTo && (
          <View className="flex-row items-center justify-between border-t border-charcoal/10 bg-cream px-4 pt-2">
            <Text className="text-xs text-charcoal/50">
              Replying to <Text className="font-semibold text-charcoal/70">{replyingTo.name}</Text>
            </Text>
            <Pressable
              onPress={() => setReplyingTo(null)}
              accessibilityLabel="Cancel reply"
              accessibilityRole="button"
              className="p-1"
            >
              <Ionicons name="close" size={14} className="text-charcoal/50" />
            </Pressable>
          </View>
        )}
        <View
          className={`flex-row items-center gap-2 bg-cream px-3 py-2.5 ${replyingTo ? '' : 'border-t border-charcoal/10'}`}
        >
          <View className="flex-1">
            <MentionTextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={
                replyingTo
                  ? `Reply to ${replyingTo.name}...`
                  : 'Write a comment... Try @ to mention someone.'
              }
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

      {sharing && (
        <ShareSheet
          link={`https://neighbor.app/post/${post.id}`}
          previewText={post.body}
          onClose={() => setSharing(false)}
        />
      )}

      {viewingPhotoIndex !== null && post.imageUris && (
        <PhotoViewer
          uris={post.imageUris}
          initialIndex={viewingPhotoIndex}
          onClose={() => setViewingPhotoIndex(null)}
        />
      )}

      {reactorsFor && (
        <ReactorsSheet
          reactions={
            reactorsFor === 'post'
              ? post.reactions
              : comments.find((c) => c.id === reactorsFor)?.reactions
          }
          myReaction={
            reactorsFor === 'post' ? myReaction : myCommentReactions[commentKey(post.id, reactorsFor)]
          }
          onClose={() => setReactorsFor(null)}
          onPersonPress={(userId) => {
            setReactorsFor(null);
            router.push(`/profile/${userId}`);
          }}
        />
      )}

      {reporting && post && (
        <ReportPostSheet
          onClose={() => setReporting(false)}
          category="Post"
          subject={`Post by ${author?.name ?? 'a neighbor'}`}
          route={`/post/${post.id}`}
        />
      )}

      {reportingCommentId && (
        <ReportPostSheet
          onClose={() => setReportingCommentId(null)}
          title="Comment options"
          actionLabel="Report this comment"
          category="Comment"
          subject={`Comment by ${
            resolveUser(comments.find((c) => c.id === reportingCommentId)?.authorId ?? '')?.name ??
            'a neighbor'
          }`}
          route={post ? `/post/${post.id}` : undefined}
        />
      )}

      {forwardingComment && (
        <ForwardSheet
          preview={forwardingComment.text}
          onForward={forwardComment}
          onClose={() => setForwardingCommentId(null)}
        />
      )}
    </SafeAreaView>
  );
}
