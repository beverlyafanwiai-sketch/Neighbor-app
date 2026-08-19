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
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import MentionTextInput from '../components/MentionTextInput';
import type { Poll } from '../data/mock';
import { formatScheduledFor, getAvailablePresets } from '../lib/schedule';
import { usePostsStore } from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';

const MAX_PHOTOS = 4;

const POLL_DURATION_PRESETS: { label: string; hours: number | null }[] = [
  { label: 'No closing time', hours: null },
  { label: '1 hour', hours: 1 },
  { label: '1 day', hours: 24 },
  { label: '3 days', hours: 72 },
];

export default function CreatePost() {
  const { id: editId, duplicateId, draftId, scheduledId } = useLocalSearchParams<{
    id?: string;
    duplicateId?: string;
    draftId?: string;
    scheduledId?: string;
  }>();
  const existing = usePostsStore((s) => (editId ? s.posts.find((p) => p.id === editId) : undefined));
  const duplicateSource = usePostsStore((s) =>
    duplicateId ? s.posts.find((p) => p.id === duplicateId) : undefined
  );
  const existingDraft = usePostsStore((s) => (draftId ? s.drafts.find((d) => d.id === draftId) : undefined));
  const existingScheduled = usePostsStore((s) =>
    scheduledId ? s.scheduledPosts.find((p) => p.id === scheduledId) : undefined
  );
  const isEditing = Boolean(existing);
  const isDuplicating = Boolean(duplicateSource) && !isEditing;
  const profile = useProfileStore((s) => s.profile);
  const createPost = usePostsStore((s) => s.createPost);
  const updatePost = usePostsStore((s) => s.updatePost);
  const saveDraft = usePostsStore((s) => s.saveDraft);
  const deleteDraft = usePostsStore((s) => s.deleteDraft);
  const schedulePost = usePostsStore((s) => s.schedulePost);
  const cancelScheduledPost = usePostsStore((s) => s.cancelScheduledPost);
  const [body, setBody] = useState(
    existing?.body ?? duplicateSource?.body ?? existingDraft?.body ?? existingScheduled?.body ?? ''
  );
  const [imageUris, setImageUris] = useState<string[]>(
    existing?.imageUris ??
      duplicateSource?.imageUris ??
      existingDraft?.imageUris ??
      existingScheduled?.imageUris ??
      []
  );
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [showPollBuilder, setShowPollBuilder] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDurationHours, setPollDurationHours] = useState<number | null>(null);
  const [scheduledFor, setScheduledFor] = useState<number | null>(existingScheduled?.scheduledFor ?? null);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  const validPollOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
  const pollValid = !showPollBuilder || validPollOptions.length >= 2;
  const canPost = body.trim().length > 0 && pollValid;
  const hasUnsavedContent =
    !isEditing &&
    !existingScheduled &&
    (body.trim().length > 0 || imageUris.length > 0 || showPollBuilder);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - imageUris.length,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUris((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
    }
  };

  const removeImage = (uri: string) => {
    setImageUris((prev) => prev.filter((u) => u !== uri));
  };

  const save = () => {
    if (!canPost) return;
    if (existing) {
      updatePost(existing.id, { body: body.trim(), imageUris });
      router.replace(`/post/${existing.id}`);
      return;
    }
    const poll: Poll | undefined =
      showPollBuilder && validPollOptions.length >= 2
        ? {
            options: validPollOptions.map((label, i) => ({ id: `opt-${i}`, label, votes: 0 })),
            closesAt: pollDurationHours
              ? (scheduledFor ?? Date.now()) + pollDurationHours * 60 * 60 * 1000
              : undefined,
          }
        : undefined;
    if (scheduledFor) {
      schedulePost({ id: scheduledId, body: body.trim(), imageUris, poll, scheduledFor });
    } else {
      createPost(body.trim(), imageUris, poll);
      if (scheduledId) cancelScheduledPost(scheduledId);
    }
    if (draftId) deleteDraft(draftId);
    router.back();
  };

  const close = () => {
    if (isEditing || existingScheduled || !hasUnsavedContent) {
      router.back();
      return;
    }
    setConfirmingClose(true);
  };

  const discardAndClose = () => {
    if (draftId) deleteDraft(draftId);
    router.back();
  };

  const saveDraftAndClose = () => {
    saveDraft({ id: draftId, body: body.trim(), imageUris });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={close}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="close" size={20} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">
          {isEditing
            ? 'Edit post'
            : existingScheduled
              ? 'Edit scheduled post'
              : isDuplicating
                ? 'Duplicate post'
                : 'New post'}
        </Text>
        <Pressable
          onPress={save}
          disabled={!canPost}
          className={`rounded-full px-4 py-2 ${canPost ? 'bg-terracotta' : 'bg-ink/10'}`}
        >
          <Text className={`text-sm font-semibold ${canPost ? 'text-paper' : 'text-charcoal/40'}`}>
            {isEditing ? 'Save' : scheduledFor ? 'Schedule' : 'Post'}
          </Text>
        </Pressable>
      </View>

      {confirmingClose && (
        <View className="gap-3 bg-terracotta/10 px-4 py-3">
          <Text className="text-sm text-charcoal">Save this as a draft, or discard it?</Text>
          <View className="flex-row justify-end gap-4">
            <Pressable onPress={() => setConfirmingClose(false)}>
              <Text className="text-sm font-medium text-charcoal/60">Keep editing</Text>
            </Pressable>
            <Pressable onPress={discardAndClose}>
              <Text className="text-sm font-semibold text-terracotta">Discard</Text>
            </Pressable>
            <Pressable onPress={saveDraftAndClose}>
              <Text className="text-sm font-semibold text-sage">Save draft</Text>
            </Pressable>
          </View>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="flex-1 px-5 pt-2" keyboardShouldPersistTaps="handled">
          {isDuplicating && (
            <View className="mb-3 flex-row items-center gap-2 rounded-2xl bg-gold/15 p-3">
              <Ionicons name="copy-outline" size={16} className="text-gold" />
              <Text className="flex-1 text-xs text-charcoal/70">
                Text copied from your earlier post — give it a fresh look if needed.
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-3">
            <Image source={{ uri: profile.avatar }} className="h-11 w-11 rounded-full" />
            <Text className="font-semibold text-charcoal">{profile.name}</Text>
          </View>

          {!isEditing && (
            <Pressable
              onPress={() => setShowSchedulePicker(true)}
              className="mt-3 flex-row items-center gap-1.5 self-start rounded-full bg-cream px-3 py-1.5"
            >
              <Ionicons
                name="time-outline"
                size={14}
                className={scheduledFor ? 'text-terracotta' : 'text-charcoal/60'}
              />
              <Text
                className={`text-xs font-medium ${scheduledFor ? 'text-terracotta' : 'text-charcoal/70'}`}
              >
                {scheduledFor ? `Scheduled for ${formatScheduledFor(new Date(scheduledFor))}` : 'Post now'}
              </Text>
              <Ionicons name="chevron-down" size={12} className="text-charcoal/40" />
            </Pressable>
          )}

          <MentionTextInput
            value={body}
            onChangeText={setBody}
            placeholder="What's going on in your corner of the neighborhood? Try @ to mention someone."
            multiline
            autoFocus
            className="mt-4 min-h-[100px] text-base leading-6 text-charcoal"
            style={{ textAlignVertical: 'top' }}
            dropdownPosition="below"
          />

          {imageUris.length > 0 && (
            <View className="mt-2 flex-row flex-wrap gap-2">
              {imageUris.map((uri) => (
                <View key={uri} className="w-[47%]" style={{ aspectRatio: 1 }}>
                  <Image source={{ uri }} className="h-full w-full rounded-2xl bg-cream" />
                  <Pressable
                    onPress={() => removeImage(uri)}
                    className="absolute right-1.5 top-1.5 h-7 w-7 items-center justify-center rounded-full bg-ink/60"
                  >
                    <Ionicons name="close" size={14} className="text-paper" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {showPollBuilder && (
            <View className="mt-3 gap-2 rounded-2xl bg-cream p-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  Poll
                </Text>
                <Pressable
                  onPress={() => {
                    setShowPollBuilder(false);
                    setPollOptions(['', '']);
                    setPollDurationHours(null);
                  }}
                  className="h-6 w-6 items-center justify-center"
                >
                  <Ionicons name="close" size={16} className="text-charcoal/50" />
                </Pressable>
              </View>
              {pollOptions.map((option, i) => (
                <View key={i} className="flex-row items-center gap-2">
                  <TextInput
                    value={option}
                    onChangeText={(text) => {
                      const next = [...pollOptions];
                      next[i] = text;
                      setPollOptions(next);
                    }}
                    placeholder={`Option ${i + 1}`}
                    placeholderTextColor="#3D3D3D80"
                    className="flex-1 rounded-xl bg-sand px-3 py-2 text-sm text-charcoal"
                  />
                  {pollOptions.length > 2 && (
                    <Pressable
                      onPress={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                      className="h-7 w-7 items-center justify-center"
                    >
                      <Ionicons name="remove-circle-outline" size={18} className="text-terracotta" />
                    </Pressable>
                  )}
                </View>
              ))}
              {pollOptions.length < 4 && (
                <Pressable
                  onPress={() => setPollOptions([...pollOptions, ''])}
                  className="flex-row items-center gap-1.5 self-start py-1"
                >
                  <Ionicons name="add-circle-outline" size={16} className="text-sage" />
                  <Text className="text-xs font-medium text-sage">Add option</Text>
                </Pressable>
              )}
              <Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Closing time
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {POLL_DURATION_PRESETS.map((p) => {
                  const active = pollDurationHours === p.hours;
                  return (
                    <Pressable
                      key={p.label}
                      onPress={() => setPollDurationHours(p.hours)}
                      className={`rounded-full px-3 py-1 ${active ? 'bg-ink' : 'bg-sand'}`}
                    >
                      <Text
                        className={`text-xs font-medium ${active ? 'text-paper' : 'text-charcoal/60'}`}
                      >
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        <View className="flex-row items-center gap-2 border-t border-charcoal/10 px-5 py-3">
          {!showPollBuilder && imageUris.length < MAX_PHOTOS && (
            <Pressable
              onPress={pickImages}
              className="flex-row items-center gap-2 rounded-full bg-cream px-4 py-2"
            >
              <Ionicons name="image-outline" size={18} className="text-sage" />
              <Text className="text-sm font-medium text-charcoal">
                {imageUris.length > 0 ? 'Add more photos' : 'Add photos'}
              </Text>
            </Pressable>
          )}
          {!showPollBuilder && imageUris.length >= MAX_PHOTOS && (
            <View className="flex-row items-center gap-2 rounded-full bg-cream px-4 py-2">
              <Ionicons name="image" size={18} className="text-sage" />
              <Text className="text-sm font-medium text-charcoal/50">
                {MAX_PHOTOS}/{MAX_PHOTOS} photos
              </Text>
            </View>
          )}
          {!isEditing && imageUris.length === 0 && !showPollBuilder && (
            <Pressable
              onPress={() => setShowPollBuilder(true)}
              className="flex-row items-center gap-2 rounded-full bg-cream px-4 py-2"
            >
              <Ionicons name="stats-chart-outline" size={18} className="text-gold" />
              <Text className="text-sm font-medium text-charcoal">Poll</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      {showSchedulePicker && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={() => setShowSchedulePicker(false)} />
          <View className="w-full gap-2 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">When should this post go live?</Text>
              <Pressable
                onPress={() => setShowSchedulePicker(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                setScheduledFor(null);
                setShowSchedulePicker(false);
              }}
              className={`flex-row items-center justify-between rounded-2xl p-4 ${
                !scheduledFor ? 'bg-terracotta' : 'bg-sand'
              }`}
            >
              <Text className={`text-sm font-medium ${!scheduledFor ? 'text-paper' : 'text-charcoal'}`}>
                Post now
              </Text>
              {!scheduledFor && <Ionicons name="checkmark" size={16} className="text-paper" />}
            </Pressable>

            {getAvailablePresets(new Date()).map((preset) => {
              const presetTime = preset.compute(new Date()).getTime();
              const selected = scheduledFor === presetTime;
              return (
                <Pressable
                  key={preset.label}
                  onPress={() => {
                    setScheduledFor(presetTime);
                    setShowSchedulePicker(false);
                  }}
                  className={`flex-row items-center justify-between rounded-2xl p-4 ${
                    selected ? 'bg-terracotta' : 'bg-sand'
                  }`}
                >
                  <Text className={`text-sm font-medium ${selected ? 'text-paper' : 'text-charcoal'}`}>
                    {preset.label}
                  </Text>
                  {selected && <Ionicons name="checkmark" size={16} className="text-paper" />}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
