import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import MentionTextInput from '../components/MentionTextInput';
import { usePostsStore } from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';

export default function CreatePost() {
  const { id: editId, draftId } = useLocalSearchParams<{ id?: string; draftId?: string }>();
  const existing = usePostsStore((s) => (editId ? s.posts.find((p) => p.id === editId) : undefined));
  const existingDraft = usePostsStore((s) => (draftId ? s.drafts.find((d) => d.id === draftId) : undefined));
  const isEditing = Boolean(existing);
  const profile = useProfileStore((s) => s.profile);
  const createPost = usePostsStore((s) => s.createPost);
  const updatePost = usePostsStore((s) => s.updatePost);
  const saveDraft = usePostsStore((s) => s.saveDraft);
  const deleteDraft = usePostsStore((s) => s.deleteDraft);
  const [body, setBody] = useState(existing?.body ?? existingDraft?.body ?? '');
  const [imageUri, setImageUri] = useState<string | undefined>(
    existing?.imageUri ?? existingDraft?.imageUri
  );
  const [confirmingClose, setConfirmingClose] = useState(false);

  const canPost = body.trim().length > 0;
  const hasUnsavedContent = !isEditing && (body.trim().length > 0 || Boolean(imageUri));

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

  const save = () => {
    if (!canPost) return;
    if (existing) {
      updatePost(existing.id, { body: body.trim(), imageUri });
      router.replace(`/post/${existing.id}`);
      return;
    }
    createPost(body.trim(), imageUri);
    if (draftId) deleteDraft(draftId);
    router.back();
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
    saveDraft({ id: draftId, body: body.trim(), imageUri });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={close}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="close" size={20} color="#3D3D3D" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">{isEditing ? 'Edit post' : 'New post'}</Text>
        <Pressable
          onPress={save}
          disabled={!canPost}
          className={`rounded-full px-4 py-2 ${canPost ? 'bg-terracotta' : 'bg-charcoal/10'}`}
        >
          <Text className={`text-sm font-semibold ${canPost ? 'text-cream' : 'text-charcoal/40'}`}>
            {isEditing ? 'Save' : 'Post'}
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
          <View className="flex-row items-center gap-3">
            <Image source={{ uri: profile.avatar }} className="h-11 w-11 rounded-full" />
            <Text className="font-semibold text-charcoal">{profile.name}</Text>
          </View>

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

          {imageUri && (
            <View className="mt-2">
              <Image
                source={{ uri: imageUri }}
                className="w-full rounded-2xl bg-cream"
                style={{ aspectRatio: 4 / 3 }}
              />
              <Pressable
                onPress={() => setImageUri(undefined)}
                className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-charcoal/60"
              >
                <Ionicons name="close" size={16} color="#F5F2E9" />
              </Pressable>
            </View>
          )}
        </ScrollView>

        <View className="flex-row items-center gap-2 border-t border-charcoal/10 px-5 py-3">
          <Pressable
            onPress={pickImage}
            className="flex-row items-center gap-2 rounded-full bg-cream px-4 py-2"
          >
            <Ionicons name="image-outline" size={18} color="#81A684" />
            <Text className="text-sm font-medium text-charcoal">
              {imageUri ? 'Change photo' : 'Add photo'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
