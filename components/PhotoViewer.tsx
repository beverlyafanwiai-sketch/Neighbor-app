import { useEffect, useRef, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TaggableUser = { id: string; name: string; avatar: string };

type Props = {
  uris: string[];
  initialIndex?: number;
  onClose: () => void;
  captions?: string[];
  editableIndices?: boolean[];
  onCaptionChange?: (index: number, text: string) => void;
  tags?: string[][];
  taggableUsers?: TaggableUser[];
  onTagsChange?: (index: number, userIds: string[]) => void;
};

export default function PhotoViewer({
  uris,
  initialIndex = 0,
  onClose,
  captions,
  editableIndices,
  onCaptionChange,
  tags,
  taggableUsers,
  onTagsChange,
}: Props) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState('');
  const [editingTags, setEditingTags] = useState(false);
  const [tagDraft, setTagDraft] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const currentCaption = captions?.[index] ?? '';
  const canEditCaption = editableIndices?.[index] ?? false;
  const currentTags = tags?.[index] ?? [];
  const canEditTags = editableIndices?.[index] ?? false;

  useEffect(() => {
    if (containerWidth > 0 && initialIndex > 0) {
      scrollRef.current?.scrollTo({ x: initialIndex * containerWidth, animated: false });
    }
    // Only run once the container has a measured width -- re-scrolling on
    // every render would fight the user's own swipes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerWidth]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth === 0) return;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / containerWidth));
    setZoomed(false);
    setEditingCaption(false);
    setEditingTags(false);
  };

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View
        className="flex-1 bg-ink"
        onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <View className="flex-row items-center justify-between px-4 pb-3 pt-12">
          <Pressable
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center rounded-full bg-cream/15"
          >
            <Ionicons name="close" size={22} className="text-paper" />
          </Pressable>
          {uris.length > 1 ? (
            <Text className="text-sm font-medium text-paper">
              {index + 1} / {uris.length}
            </Text>
          ) : (
            <View />
          )}
          <View className="h-9 w-9" />
        </View>

        {containerWidth > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            style={{ width: containerWidth, flex: 1 }}
          >
            {uris.map((uri, i) => (
              <Pressable
                key={i}
                onPress={() => i === index && setZoomed((z) => !z)}
                style={{
                  width: containerWidth,
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Image
                  source={{ uri }}
                  resizeMode="contain"
                  style={{
                    width: containerWidth,
                    height: '100%',
                    transform: [{ scale: i === index && zoomed ? 2.2 : 1 }],
                  }}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {editingCaption ? (
          <View className="gap-2 px-4 pb-8 pt-3">
            <TextInput
              value={captionDraft}
              onChangeText={setCaptionDraft}
              placeholder="Add a caption..."
              placeholderTextColor="#FAF3E680"
              autoFocus
              className="rounded-xl bg-cream/15 px-3 py-2 text-center text-sm text-paper"
            />
            <View className="flex-row justify-center gap-6">
              <Pressable onPress={() => setEditingCaption(false)}>
                <Text className="text-sm font-medium text-paper/60">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onCaptionChange?.(index, captionDraft);
                  setEditingCaption(false);
                }}
              >
                <Text className="text-sm font-semibold text-paper">Save</Text>
              </Pressable>
            </View>
          </View>
        ) : editingTags ? (
          <View className="gap-2 px-4 pb-8 pt-3">
            <Text className="text-center text-xs text-paper/70">Tag people in this photo</Text>
            <ScrollView style={{ maxHeight: 160 }}>
              <View className="gap-1">
                {taggableUsers?.map((u) => {
                  const selected = tagDraft.includes(u.id);
                  return (
                    <Pressable
                      key={u.id}
                      onPress={() =>
                        setTagDraft((prev) =>
                          prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                        )
                      }
                      accessibilityLabel={u.name}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      className="flex-row items-center gap-2.5 rounded-xl px-2 py-2"
                      style={{ backgroundColor: selected ? 'rgba(250,243,230,0.15)' : 'transparent' }}
                    >
                      <Image source={{ uri: u.avatar }} className="h-8 w-8 rounded-full" />
                      <Text className="flex-1 text-sm text-paper">{u.name}</Text>
                      {selected && <Ionicons name="checkmark-circle" size={18} className="text-paper" />}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <View className="flex-row justify-center gap-6">
              <Pressable onPress={() => setEditingTags(false)}>
                <Text className="text-sm font-medium text-paper/60">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onTagsChange?.(index, tagDraft);
                  setEditingTags(false);
                }}
              >
                <Text className="text-sm font-semibold text-paper">Save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="gap-1 px-4 pb-8 pt-3">
            <Pressable
              disabled={!canEditCaption}
              onPress={() => {
                setCaptionDraft(currentCaption);
                setEditingCaption(true);
              }}
              className="flex-row items-center justify-center gap-1.5"
            >
              <Text className="text-center text-xs text-paper/70">
                {currentCaption || (canEditCaption ? 'Add a caption' : 'Tap the photo to zoom')}
              </Text>
              {canEditCaption && (
                <Ionicons name="pencil" size={11} className="text-paper/50" />
              )}
            </Pressable>
            {taggableUsers && taggableUsers.length > 0 && (canEditTags || currentTags.length > 0) && (
              <Pressable
                disabled={!canEditTags}
                onPress={() => {
                  setTagDraft(currentTags);
                  setEditingTags(true);
                }}
                className="flex-row items-center justify-center gap-1.5"
              >
                <Text className="text-center text-xs text-paper/70">
                  {currentTags.length > 0
                    ? `With ${currentTags
                        .map((id) => taggableUsers.find((u) => u.id === id)?.name.split(' ')[0])
                        .filter(Boolean)
                        .join(', ')}`
                    : 'Tag people'}
                </Text>
                {canEditTags && <Ionicons name="person-add-outline" size={11} className="text-paper/50" />}
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}
