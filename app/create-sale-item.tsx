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

import { useSaleStore } from '../store/useSaleStore';

const EMOJI_PRESETS = ['🚲', '🪑', '🎵', '🪴', '🧰', '📦', '🛋️', '📚', '🖥️', '🎉'];
const MAX_PHOTOS = 4;

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function CreateSaleItem() {
  const { id: editId, duplicateId, draftId } = useLocalSearchParams<{
    id?: string;
    duplicateId?: string;
    draftId?: string;
  }>();
  const existing = useSaleStore((s) => (editId ? s.items.find((i) => i.id === editId) : undefined));
  const isEditing = Boolean(existing);
  const duplicateSource = useSaleStore((s) =>
    duplicateId ? s.items.find((i) => i.id === duplicateId) : undefined
  );
  const isDuplicating = Boolean(duplicateSource) && !isEditing;
  const existingDraft = useSaleStore((s) =>
    draftId ? s.drafts.find((d) => d.id === draftId) : undefined
  );
  const createItem = useSaleStore((s) => s.createItem);
  const updateItem = useSaleStore((s) => s.updateItem);
  const saveDraft = useSaleStore((s) => s.saveDraft);
  const deleteDraft = useSaleStore((s) => s.deleteDraft);

  const [emoji, setEmoji] = useState(
    existing?.emoji ?? duplicateSource?.emoji ?? existingDraft?.emoji ?? '📦'
  );
  const [title, setTitle] = useState(
    existing?.title ?? duplicateSource?.title ?? existingDraft?.title ?? ''
  );
  const [price, setPrice] = useState(
    existing?.price ?? duplicateSource?.price ?? existingDraft?.price ?? ''
  );
  const [note, setNote] = useState(existing?.note ?? duplicateSource?.note ?? existingDraft?.note ?? '');
  const [imageUris, setImageUris] = useState<string[]>(
    existing?.imageUris ?? duplicateSource?.imageUris ?? existingDraft?.imageUris ?? []
  );
  const [confirmingClose, setConfirmingClose] = useState(false);

  const canSave = title.trim() && price.trim() && note.trim();
  const hasUnsavedContent =
    !isEditing && Boolean(title.trim() || price.trim() || note.trim() || imageUris.length > 0);

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
    if (!canSave) return;
    if (existing) {
      updateItem(existing.id, {
        emoji,
        title: title.trim(),
        price: price.trim(),
        note: note.trim(),
        imageUris,
      });
      router.replace('/for-sale');
      return;
    }
    createItem({ emoji, title: title.trim(), price: price.trim(), note: note.trim(), imageUris });
    if (draftId) deleteDraft(draftId);
    router.replace('/for-sale');
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
      emoji,
      title: title.trim(),
      price: price.trim(),
      note: note.trim(),
      imageUris,
    });
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
          {isEditing ? 'Edit listing' : isDuplicating ? 'Duplicate listing' : 'List an item'}
        </Text>
        <Pressable
          onPress={save}
          disabled={!canSave}
          className={`rounded-full px-4 py-2 ${canSave ? 'bg-terracotta' : 'bg-ink/10'}`}
        >
          <Text className={`text-sm font-semibold ${canSave ? 'text-paper' : 'text-charcoal/40'}`}>
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          {isDuplicating && (
            <View className="mb-4 flex-row items-center gap-2 rounded-2xl bg-gold/15 p-3">
              <Ionicons name="copy-outline" size={16} className="text-gold" />
              <Text className="flex-1 text-xs text-charcoal/70">
                Details copied from "{duplicateSource!.title}" — give it a fresh look if needed.
              </Text>
            </View>
          )}

          {imageUris.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
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

          {imageUris.length < MAX_PHOTOS ? (
            <Pressable
              onPress={pickImages}
              className={`flex-row items-center justify-center gap-2 rounded-2xl bg-cream py-3 ${
                imageUris.length > 0 ? 'mt-2' : ''
              }`}
            >
              <Ionicons name="image-outline" size={18} className="text-sage" />
              <Text className="text-sm font-medium text-charcoal">
                {imageUris.length > 0 ? 'Add more photos' : 'Add photos'}
              </Text>
            </Pressable>
          ) : (
            <View className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl bg-cream py-3">
              <Ionicons name="image" size={18} className="text-sage" />
              <Text className="text-sm font-medium text-charcoal/50">
                {MAX_PHOTOS}/{MAX_PHOTOS} photos
              </Text>
            </View>
          )}

          <View className="mt-2 gap-4">
            <View>
              <FieldLabel>Icon</FieldLabel>
              <View className="flex-row items-center gap-3">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-cream">
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                  <View className="flex-row gap-2">
                    {EMOJI_PRESETS.map((e) => (
                      <Pressable
                        key={e}
                        onPress={() => setEmoji(e)}
                        className={`h-11 w-11 items-center justify-center rounded-xl ${
                          emoji === e ? 'bg-terracotta/20' : 'bg-cream'
                        }`}
                      >
                        <Text style={{ fontSize: 20 }}>{e}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View>
              <FieldLabel>What is it?</FieldLabel>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Bike, desk, patio chairs..."
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Price</FieldLabel>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="$25, Free, Best offer..."
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Details</FieldLabel>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Condition, why you're selling, pickup details..."
                placeholderTextColor="#3D3D3D80"
                multiline
                className="min-h-[80px] rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
