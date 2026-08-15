import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { ALERT_CATEGORIES, ME, getUser } from '../data/mock';
import { useAlertCommentsStore } from '../store/useAlertCommentsStore';
import {
  formatExpiresIn,
  formatPostedAgo,
  getActiveAlerts,
  useAlertsStore,
} from '../store/useAlertsStore';
import { useProfileStore } from '../store/useProfileStore';

export default function NeighborhoodAlerts() {
  const allAlerts = useAlertsStore((s) => s.alerts);
  const deleteAlert = useAlertsStore((s) => s.deleteAlert);
  const comments = useAlertCommentsStore((s) => s.comments);
  const addComment = useAlertCommentsStore((s) => s.addComment);
  const deleteComment = useAlertCommentsStore((s) => s.deleteComment);
  const profile = useProfileStore((s) => s.profile);
  const [now] = useState(() => Date.now());
  const [viewingCommentsId, setViewingCommentsId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [confirmingDeleteCommentId, setConfirmingDeleteCommentId] = useState<string | null>(null);

  const activeAlerts = getActiveAlerts(allAlerts, now);
  const viewingCommentsAlert = activeAlerts.find((a) => a.id === viewingCommentsId);
  const viewingComments = viewingCommentsAlert ? (comments[viewingCommentsAlert.id] ?? []) : [];

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Neighborhood Alerts</Text>
        <Pressable
          onPress={() => router.push('/create-alert')}
          className="h-9 w-9 items-center justify-center rounded-full bg-terracotta"
        >
          <Ionicons name="add" size={20} className="text-paper" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          Time-sensitive stuff worth knowing — lost pets, road work, safety heads-up. Alerts expire
          on their own.
        </Text>

        <View className="mt-5 gap-3">
          {activeAlerts.map((alert) => {
            const author = getUser(alert.authorId);
            const meta = ALERT_CATEGORIES.find((c) => c.value === alert.category);
            const isMine = alert.authorId === ME.id;
            const commentCount = (comments[alert.id] ?? []).length;
            return (
              <View key={alert.id} className="rounded-2xl bg-cream p-4">
                <View className="flex-row items-start gap-3">
                  <Text style={{ fontSize: 22 }}>{meta?.emoji ?? '📢'}</Text>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                      {meta?.label ?? 'Alert'}
                    </Text>
                    <Text className="mt-1 text-[15px] leading-5 text-charcoal">{alert.text}</Text>
                    <Text className="mt-2 text-xs text-charcoal/50">
                      {author?.name ?? 'A neighbor'} · {formatPostedAgo(alert.postedAt, now)} ·{' '}
                      {formatExpiresIn(alert.expiresAt, now)}
                    </Text>
                  </View>
                  {isMine && (
                    <View className="flex-row gap-1">
                      <Pressable
                        onPress={() => router.push(`/create-alert?editId=${alert.id}`)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="pencil" size={16} className="text-charcoal/50" />
                      </Pressable>
                      <Pressable
                        onPress={() => deleteAlert(alert.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                      </Pressable>
                    </View>
                  )}
                </View>
                <Pressable
                  onPress={() => setViewingCommentsId(alert.id)}
                  className="mt-3 flex-row items-center gap-1.5 self-start border-t border-charcoal/10 pt-3"
                >
                  <Ionicons name="chatbubble-outline" size={14} className="text-charcoal/40" />
                  <Text className="text-xs text-charcoal/50">
                    {commentCount === 0
                      ? 'Comment'
                      : `${commentCount} comment${commentCount === 1 ? '' : 's'}`}
                  </Text>
                </Pressable>
              </View>
            );
          })}

          {activeAlerts.length === 0 && (
            <EmptyState
              icon="warning-outline"
              iconColorClassName="text-charcoal/50"
              title="No active alerts"
              subtitle="Post one if there's something time-sensitive your neighbors should know."
            />
          )}
        </View>
      </ScrollView>

      {viewingCommentsAlert && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable
            className="absolute inset-0"
            onPress={() => {
              setViewingCommentsId(null);
              setConfirmingDeleteCommentId(null);
              setCommentDraft('');
            }}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="w-full"
          >
            <View className="max-h-[75%] w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-charcoal">Comments</Text>
                <Pressable
                  onPress={() => {
                    setViewingCommentsId(null);
                    setConfirmingDeleteCommentId(null);
                    setCommentDraft('');
                  }}
                  className="h-8 w-8 items-center justify-center rounded-full bg-sand"
                >
                  <Ionicons name="close" size={16} className="text-charcoal" />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-2">
                  {viewingComments.length === 0 && (
                    <Text className="py-2 text-sm text-charcoal/50">
                      No comments yet — share an update or ask a question.
                    </Text>
                  )}
                  {viewingComments.map((c) => {
                    const isMine = c.authorId === ME.id;
                    const author = isMine ? profile : getUser(c.authorId);
                    if (!author) return null;

                    if (confirmingDeleteCommentId === c.id) {
                      return (
                        <View key={c.id} className="gap-2 rounded-2xl bg-terracotta/10 p-3">
                          <Text className="text-sm text-charcoal">Delete this comment?</Text>
                          <View className="flex-row justify-end gap-4">
                            <Pressable onPress={() => setConfirmingDeleteCommentId(null)}>
                              <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                deleteComment(viewingCommentsAlert.id, c.id);
                                setConfirmingDeleteCommentId(null);
                              }}
                            >
                              <Text className="text-sm font-semibold text-terracotta">Delete</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    }

                    return (
                      <View key={c.id} className="flex-row items-start gap-2.5 rounded-2xl bg-sand p-3">
                        <Image source={{ uri: author.avatar }} className="h-8 w-8 rounded-full" />
                        <View className="flex-1">
                          <View className="flex-row items-center gap-1.5">
                            <Text className="text-sm font-semibold text-charcoal">
                              {isMine ? 'You' : author.name}
                            </Text>
                            <Text className="text-xs text-charcoal/40">{c.time}</Text>
                          </View>
                          <Text className="mt-0.5 text-sm leading-5 text-charcoal">{c.text}</Text>
                        </View>
                        {isMine && (
                          <Pressable
                            onPress={() => setConfirmingDeleteCommentId(c.id)}
                            className="h-7 w-7 items-center justify-center"
                          >
                            <Ionicons name="trash-outline" size={14} className="text-charcoal/40" />
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
              <View className="flex-row items-center gap-2 border-t border-charcoal/10 pt-3">
                <TextInput
                  value={commentDraft}
                  onChangeText={setCommentDraft}
                  placeholder="Add a comment..."
                  placeholderTextColor="#3D3D3D80"
                  multiline
                  className="max-h-24 flex-1 rounded-2xl bg-sand px-3 py-2.5 text-sm text-charcoal"
                />
                <Pressable
                  disabled={!commentDraft.trim()}
                  onPress={() => {
                    addComment(viewingCommentsAlert.id, commentDraft);
                    setCommentDraft('');
                  }}
                  className="h-9 w-9 items-center justify-center rounded-full bg-terracotta"
                  style={{ opacity: commentDraft.trim() ? 1 : 0.4 }}
                >
                  <Ionicons name="arrow-up" size={18} className="text-paper" />
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>
  );
}
