import { useState } from 'react';
import {
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
import { SafeAreaView } from 'react-native-safe-area-context';

import CoverPhotoPicker from '../components/CoverPhotoPicker';
import type { Tone } from '../data/mock';
import { useGroupsStore } from '../store/useGroupsStore';

const TONES: { value: Tone; description: string }[] = [
  { value: 'Casual', description: 'Easy-going, drop in whenever' },
  { value: 'Structured', description: 'Regular schedule, clear expectations' },
  { value: 'Activity-focused', description: 'Built around doing one thing together' },
];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function CreateGroup() {
  const { id: editId, duplicateId, draftId } = useLocalSearchParams<{
    id?: string;
    duplicateId?: string;
    draftId?: string;
  }>();
  const existing = useGroupsStore((s) => (editId ? s.groups.find((g) => g.id === editId) : undefined));
  const isEditing = Boolean(existing);
  const duplicateSource = useGroupsStore((s) =>
    duplicateId ? s.groups.find((g) => g.id === duplicateId) : undefined
  );
  const isDuplicating = Boolean(duplicateSource) && !isEditing;
  const existingDraft = useGroupsStore((s) =>
    draftId ? s.drafts.find((d) => d.id === draftId) : undefined
  );
  const createGroup = useGroupsStore((s) => s.createGroup);
  const updateGroup = useGroupsStore((s) => s.updateGroup);
  const saveDraft = useGroupsStore((s) => s.saveDraft);
  const deleteDraft = useGroupsStore((s) => s.deleteDraft);

  const [name, setName] = useState(existing?.name ?? duplicateSource?.name ?? existingDraft?.name ?? '');
  const [description, setDescription] = useState(
    existing?.description ?? duplicateSource?.description ?? existingDraft?.description ?? ''
  );
  const [tone, setTone] = useState<Tone>(
    existing?.tone ?? duplicateSource?.tone ?? existingDraft?.tone ?? 'Casual'
  );
  const [coverImageUri, setCoverImageUri] = useState(
    existing?.coverImageUri ?? duplicateSource?.coverImageUri ?? existingDraft?.coverImageUri
  );
  const [privacy, setPrivacy] = useState<'public' | 'private'>(
    existing?.privacy ?? duplicateSource?.privacy ?? existingDraft?.privacy ?? 'public'
  );
  const [confirmingClose, setConfirmingClose] = useState(false);

  const canSave = name.trim() && description.trim();
  const hasUnsavedContent = !isEditing && Boolean(name.trim() || description.trim());

  const save = () => {
    if (!canSave) return;
    if (existing) {
      updateGroup(existing.id, {
        name: name.trim(),
        description: description.trim(),
        tone,
        coverImageUri,
        privacy,
      });
      router.replace(`/group/${existing.id}`);
      return;
    }
    const id = createGroup({
      name: name.trim(),
      description: description.trim(),
      tone,
      coverImageUri,
      privacy,
    });
    if (draftId) deleteDraft(draftId);
    router.replace(`/group/${id}`);
  };

  const close = () => {
    if (isEditing || !hasUnsavedContent) {
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
    saveDraft({
      id: draftId,
      name: name.trim(),
      description: description.trim(),
      tone,
      coverImageUri,
      privacy,
    });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={close}
          accessibilityLabel="Close"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="close" size={20} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">
          {isEditing ? 'Edit circle' : isDuplicating ? 'Duplicate circle' : 'Start a circle'}
        </Text>
        <Pressable
          onPress={save}
          disabled={!canSave}
          className={`rounded-full px-4 py-2 ${canSave ? 'bg-terracotta' : 'bg-ink/10'}`}
        >
          <Text className={`text-sm font-semibold ${canSave ? 'text-paper' : 'text-charcoal/40'}`}>
            {isEditing ? 'Save' : 'Create'}
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          <Text className="mt-2 text-sm text-charcoal/60">
            A small circle for people who share something specific — a hobby, a street, a stage of
            life. You'll be the first member.
          </Text>

          {isDuplicating && (
            <View className="mt-4 rounded-2xl bg-gold/15 px-4 py-3">
              <Text className="text-sm text-charcoal">
                Details copied from "{duplicateSource!.name}" — give this circle its own name below.
              </Text>
            </View>
          )}

          <View className="mt-5">
            <CoverPhotoPicker imageUri={coverImageUri} onChange={setCoverImageUri} />
          </View>

          <View className="mt-5 gap-4">
            <View>
              <FieldLabel>Name</FieldLabel>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Weekend Hikers, Book & Bourbon..."
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Description</FieldLabel>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What brings this circle together?"
                placeholderTextColor="#3D3D3D80"
                multiline
                className="min-h-[80px] rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Tone</FieldLabel>
              <View className="gap-2">
                {TONES.map((t) => (
                  <Pressable
                    key={t.value}
                    onPress={() => setTone(t.value)}
                    className={`flex-row items-center justify-between rounded-2xl px-4 py-3 ${
                      tone === t.value ? 'bg-terracotta' : 'bg-cream'
                    }`}
                  >
                    <View>
                      <Text
                        className={`text-sm font-semibold ${
                          tone === t.value ? 'text-paper' : 'text-charcoal'
                        }`}
                      >
                        {t.value}
                      </Text>
                      <Text
                        className={`mt-0.5 text-xs ${
                          tone === t.value ? 'text-paper/80' : 'text-charcoal/50'
                        }`}
                      >
                        {t.description}
                      </Text>
                    </View>
                    {tone === t.value && <Ionicons name="checkmark-circle" size={20} className="text-paper" />}
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <FieldLabel>Privacy</FieldLabel>
              <View className="gap-2">
                <Pressable
                  onPress={() => setPrivacy('public')}
                  className={`flex-row items-center justify-between rounded-2xl px-4 py-3 ${
                    privacy === 'public' ? 'bg-terracotta' : 'bg-cream'
                  }`}
                >
                  <View className="flex-1 flex-row items-center gap-3">
                    <Ionicons
                      name="globe-outline"
                      size={18}
                      className={privacy === 'public' ? 'text-paper' : 'text-charcoal'}
                    />
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-semibold ${
                          privacy === 'public' ? 'text-paper' : 'text-charcoal'
                        }`}
                      >
                        Public
                      </Text>
                      <Text
                        className={`mt-0.5 text-xs ${
                          privacy === 'public' ? 'text-paper/80' : 'text-charcoal/50'
                        }`}
                      >
                        Anyone browsing Discover can find and join this circle
                      </Text>
                    </View>
                  </View>
                  {privacy === 'public' && (
                    <Ionicons name="checkmark-circle" size={20} className="text-paper" />
                  )}
                </Pressable>
                <Pressable
                  onPress={() => setPrivacy('private')}
                  className={`flex-row items-center justify-between rounded-2xl px-4 py-3 ${
                    privacy === 'private' ? 'bg-terracotta' : 'bg-cream'
                  }`}
                >
                  <View className="flex-1 flex-row items-center gap-3">
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      className={privacy === 'private' ? 'text-paper' : 'text-charcoal'}
                    />
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-semibold ${
                          privacy === 'private' ? 'text-paper' : 'text-charcoal'
                        }`}
                      >
                        Private
                      </Text>
                      <Text
                        className={`mt-0.5 text-xs ${
                          privacy === 'private' ? 'text-paper/80' : 'text-charcoal/50'
                        }`}
                      >
                        Hidden from Discover — people can only join with an invite code
                      </Text>
                    </View>
                  </View>
                  {privacy === 'private' && (
                    <Ionicons name="checkmark-circle" size={20} className="text-paper" />
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
