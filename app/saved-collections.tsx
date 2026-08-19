import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { useSavedCollectionsStore } from '../store/useSavedCollectionsStore';

export default function SavedCollections() {
  const collections = useSavedCollectionsStore((s) => s.collections);
  const itemCollectionIds = useSavedCollectionsStore((s) => s.itemCollectionIds);
  const createCollection = useSavedCollectionsStore((s) => s.createCollection);
  const renameCollection = useSavedCollectionsStore((s) => s.renameCollection);
  const deleteCollection = useSavedCollectionsStore((s) => s.deleteCollection);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [creating, setCreating] = useState(false);
  const [newDraft, setNewDraft] = useState('');

  const countFor = (collectionId: string) =>
    Object.values(itemCollectionIds).filter((ids) => ids.includes(collectionId)).length;

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Collections</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        {collections.length === 0 && !creating && (
          <EmptyState
            icon="folder-outline"
            iconColorClassName="text-charcoal/50"
            title="No collections yet"
            subtitle={
              'Create one here, then add saved posts, listings, and more to it from their "Add to collection" menu.'
            }
          />
        )}

        {collections.length > 0 && (
          <View className="mt-2 gap-3">
            {collections.map((c) => {
              const count = countFor(c.id);
              if (renamingId === c.id) {
                return (
                  <View key={c.id} className="flex-row items-center gap-2 rounded-2xl bg-cream p-4">
                    <TextInput
                      value={renameDraft}
                      onChangeText={setRenameDraft}
                      autoFocus
                      className="flex-1 text-sm text-charcoal"
                    />
                    <Pressable onPress={() => setRenamingId(null)}>
                      <Text className="text-xs font-medium text-charcoal/50">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        renameCollection(c.id, renameDraft);
                        setRenamingId(null);
                      }}
                    >
                      <Text className="text-xs font-semibold text-terracotta">Save</Text>
                    </Pressable>
                  </View>
                );
              }
              return (
                <View key={c.id} className="flex-row items-center gap-2 rounded-2xl bg-cream p-4">
                  <Pressable
                    onPress={() => router.push(`/saved?collectionId=${c.id}`)}
                    className="flex-1 flex-row items-center gap-3 active:opacity-70"
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-sand">
                      <Ionicons name="folder" size={16} className="text-sage" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-charcoal">{c.name}</Text>
                      <Text className="text-xs text-charcoal/50">
                        {count} item{count === 1 ? '' : 's'}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setRenamingId(c.id);
                      setRenameDraft(c.name);
                    }}
                    accessibilityLabel={`Rename collection "${c.name}"`}
                    accessibilityRole="button"
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons name="pencil" size={14} className="text-charcoal/40" />
                  </Pressable>
                  <Pressable
                    onPress={() => deleteCollection(c.id)}
                    accessibilityLabel={`Delete collection "${c.name}"`}
                    accessibilityRole="button"
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={14} className="text-terracotta" />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {creating ? (
          <View className="mt-4 flex-row items-center gap-2 rounded-2xl bg-cream p-4">
            <TextInput
              value={newDraft}
              onChangeText={setNewDraft}
              placeholder="Collection name..."
              placeholderTextColor="#3D3D3D80"
              autoFocus
              className="flex-1 text-sm text-charcoal"
            />
            <Pressable
              onPress={() => {
                setCreating(false);
                setNewDraft('');
              }}
            >
              <Text className="text-xs font-medium text-charcoal/50">Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!newDraft.trim()}
              onPress={() => {
                createCollection(newDraft);
                setCreating(false);
                setNewDraft('');
              }}
            >
              <Text
                className={`text-xs font-semibold ${newDraft.trim() ? 'text-terracotta' : 'text-charcoal/30'}`}
              >
                Create
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setCreating(true)}
            className="mt-4 flex-row items-center justify-center gap-1.5 rounded-2xl bg-cream py-3.5"
          >
            <Ionicons name="add-circle-outline" size={16} className="text-terracotta" />
            <Text className="text-sm font-semibold text-terracotta">New collection</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
