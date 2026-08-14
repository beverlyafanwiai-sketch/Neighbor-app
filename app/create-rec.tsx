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

import type { RecEntryKind } from '../data/mock';
import { useRecsStore } from '../store/useRecsStore';

const KINDS: { value: RecEntryKind; label: string; description: string }[] = [
  { value: 'rec', label: 'Recommend someone', description: 'A business or person you trust' },
  { value: 'ask', label: 'Ask for a recommendation', description: 'Neighbors can offer a suggestion' },
];

const EMOJI_PRESETS = ['🔧', '💡', '🌿', '🧸', '🐕', '🚗', '🧹', '🎨', '⭐', '📦'];
const MAX_PHOTOS = 4;

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function CreateRec() {
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const existing = useRecsStore((s) => (editId ? s.entries.find((e) => e.id === editId) : undefined));
  const isEditing = Boolean(existing);
  const createEntry = useRecsStore((s) => s.createEntry);
  const updateEntry = useRecsStore((s) => s.updateEntry);

  const [kind, setKind] = useState<RecEntryKind>(existing?.kind ?? 'rec');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '⭐');
  const [category, setCategory] = useState(existing?.category ?? '');
  const [name, setName] = useState(existing?.name ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [imageUris, setImageUris] = useState<string[]>(existing?.imageUris ?? []);

  const canSave = category.trim() && note.trim() && (kind === 'ask' || name.trim());

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
      updateEntry(existing.id, {
        kind,
        emoji,
        category: category.trim(),
        name: kind === 'rec' ? name.trim() : undefined,
        note: note.trim(),
        imageUris,
      });
      router.replace('/recs');
      return;
    }
    createEntry({
      kind,
      emoji,
      category: category.trim(),
      name: kind === 'rec' ? name.trim() : undefined,
      note: note.trim(),
      imageUris,
    });
    router.replace('/recs');
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="close" size={20} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">
          {isEditing ? 'Edit post' : 'Post to the board'}
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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          <View className="mt-2 gap-2">
            {KINDS.map((k) => (
              <Pressable
                key={k.value}
                onPress={() => setKind(k.value)}
                className={`flex-row items-center justify-between rounded-2xl px-4 py-3 ${
                  kind === k.value ? 'bg-terracotta' : 'bg-cream'
                }`}
              >
                <View>
                  <Text
                    className={`text-sm font-semibold ${
                      kind === k.value ? 'text-paper' : 'text-charcoal'
                    }`}
                  >
                    {k.label}
                  </Text>
                  <Text
                    className={`mt-0.5 text-xs ${
                      kind === k.value ? 'text-paper/80' : 'text-charcoal/50'
                    }`}
                  >
                    {k.description}
                  </Text>
                </View>
                {kind === k.value && <Ionicons name="checkmark-circle" size={20} className="text-paper" />}
              </Pressable>
            ))}
          </View>

          {imageUris.length > 0 && (
            <View className="mt-5 flex-row flex-wrap gap-2">
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
              className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-cream py-3"
            >
              <Ionicons name="image-outline" size={18} className="text-sage" />
              <Text className="text-sm font-medium text-charcoal">
                {imageUris.length > 0 ? 'Add more photos' : 'Add photos'}
              </Text>
            </Pressable>
          ) : (
            <View className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-cream py-3">
              <Ionicons name="image" size={18} className="text-sage" />
              <Text className="text-sm font-medium text-charcoal/50">
                {MAX_PHOTOS}/{MAX_PHOTOS} photos
              </Text>
            </View>
          )}

          <View className="mt-5 gap-4">
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
              <FieldLabel>Category</FieldLabel>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="Plumber, dog groomer, babysitter..."
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            {kind === 'rec' && (
              <View>
                <FieldLabel>Who do you recommend?</FieldLabel>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Business or person's name"
                  placeholderTextColor="#3D3D3D80"
                  className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
                />
              </View>
            )}

            <View>
              <FieldLabel>{kind === 'rec' ? 'Why do you recommend them?' : 'What do you need?'}</FieldLabel>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={
                  kind === 'rec'
                    ? 'What made them worth recommending...'
                    : 'What for, and anything helpful to know...'
                }
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
