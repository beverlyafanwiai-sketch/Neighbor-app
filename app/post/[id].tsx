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

import MentionText from '../../components/MentionText';
import MentionTextInput from '../../components/MentionTextInput';
import PhotoCarousel from '../../components/PhotoCarousel';
import PollView from '../../components/PollView';
import ReactionButton from '../../components/ReactionButton';
import ReactorsSheet from '../../components/ReactorsSheet';
import ReportPostSheet from '../../components/ReportPostSheet';
import ShareSheet from '../../components/ShareSheet';
import { ME, getUser, type CommentItem } from '../../data/mock';
import { commentKey, getEffectiveReplies, usePostsStore } from '../../store/usePostsStore';
import { useProfileStore } from '../../store/useProfileStore';

const EMPTY_COMMENTS: CommentItem[] = [];

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
  const comments = usePostsStore((s) => (post ? (s.comments[post.id] ?? EMPTY_COMMENTS) : EMPTY_COMMENTS));
  const myPollVote = usePostsStore((s) => (post ? s.myPollVotes[post.id] : undefined));
  const votePoll = usePostsStore((s) => s.votePoll);
  const addComment = usePostsStore((s) => s.addComment);
  const updateComment = usePostsStore((s) => s.updateComment);
  const deleteComment = usePostsStore((s) => s.deleteComment);
  const deletePost = usePostsStore((s) => s.deletePost);
  const profile = useProfileStore((s) => s.profile);

  const [draft, setDraft] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [reactorsFor, setReactorsFor] = useState<'post' | string | null>(null);
  const [reporting, setReporting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  const resolveUser = (userId: string) => (userId === ME.id ? profile : getUser(userId));
  const author = post ? resolveUser(post.authorId) : undefined;
  const isAuthor = post?.authorId === ME.id;

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

  const commentRows: { comment: CommentItem; isReply: boolean }[] = [];
  for (const c of comments.filter((c) => !c.parentId)) {
    commentRows.push({ comment: c, isReply: false });
    for (const r of comments.filter((r) => r.parentId === c.id)) {
      commentRows.push({ comment: r, isReply: true });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between gap-3 border-b border-charcoal/10 bg-cream px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Ionicons name="chevron-back" size={22} className="text-charcoal" />
          </Pressable>
          <Text className="text-base font-bold text-charcoal">Post</Text>
        </View>
        {isAuthor ? (
          <View className="flex-row items-center gap-1.5">
            <Pressable
              onPress={() => router.push(`/create-post?id=${post.id}`)}
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <Ionicons name="pencil" size={17} className="text-charcoal" />
            </Pressable>
            <Pressable
              onPress={() => setConfirmingDelete(true)}
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <Ionicons name="trash-outline" size={17} className="text-terracotta" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setReporting(true)}
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
                <PhotoCarousel uris={post.imageUris} className="" />
              )}

              {post.poll && (
                <PollView poll={post.poll} myVote={myPollVote} onVote={(optionId) => votePoll(post.id, optionId)} />
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
                {isCommentAuthor && (
                  <View className="flex-row items-center gap-1">
                    <Pressable
                      onPress={() => {
                        setEditingCommentId(item.id);
                        setEditDraft(item.text);
                      }}
                      className="h-7 w-7 items-center justify-center rounded-full"
                    >
                      <Ionicons name="pencil" size={13} className="text-charcoal/50" />
                    </Pressable>
                    <Pressable
                      onPress={() => setDeletingCommentId(item.id)}
                      className="h-7 w-7 items-center justify-center rounded-full"
                    >
                      <Ionicons name="trash-outline" size={13} className="text-terracotta" />
                    </Pressable>
                  </View>
                )}
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
            <Pressable onPress={() => setReplyingTo(null)} className="p-1">
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
        <ShareSheet postId={post.id} postBody={post.body} onClose={() => setSharing(false)} />
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

      {reporting && <ReportPostSheet onClose={() => setReporting(false)} />}
    </SafeAreaView>
  );
}
