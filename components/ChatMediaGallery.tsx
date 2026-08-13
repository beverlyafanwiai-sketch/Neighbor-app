import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type GalleryPhoto = {
  id: string;
  uri: string;
};

type Props = {
  title: string;
  photos: GalleryPhoto[];
  onSelectPhoto: (id: string) => void;
  onClose: () => void;
};

export default function ChatMediaGallery({ title, photos, onSelectPhoto, onClose }: Props) {
  return (
    <View className="absolute inset-0 bg-sand">
      <View className="flex-row items-center gap-3 border-b border-charcoal/10 bg-cream px-4 py-3">
        <Pressable
          onPress={onClose}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">{title}</Text>
        {photos.length > 0 && (
          <Text className="text-sm text-charcoal/50">({photos.length})</Text>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-1.5">
        {photos.length === 0 ? (
          <View className="mt-20 items-center px-8">
            <Ionicons name="image-outline" size={32} className="text-charcoal/30" />
            <Text className="mt-3 text-center text-sm text-charcoal/50">
              No photos shared in this conversation yet.
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-1.5">
            {photos.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => onSelectPhoto(p.id)}
                className="w-[32.3%] active:opacity-70"
                style={{ aspectRatio: 1 }}
              >
                <Image source={{ uri: p.uri }} className="h-full w-full rounded-lg" />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
