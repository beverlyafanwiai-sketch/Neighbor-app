import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

type Props = {
  imageUri: string | undefined;
  onChange: (uri: string | undefined) => void;
};

export default function CoverPhotoPicker({ imageUri, onChange }: Props) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  };

  if (imageUri) {
    return (
      <View>
        <Image
          source={{ uri: imageUri }}
          className="w-full rounded-2xl bg-sand"
          style={{ aspectRatio: 2 }}
        />
        <Pressable
          onPress={() => onChange(undefined)}
          className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-ink/60"
        >
          <Ionicons name="close" size={16} className="text-paper" />
        </Pressable>
        <Pressable
          onPress={pickImage}
          className="absolute bottom-2 right-2 flex-row items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5"
        >
          <Ionicons name="image-outline" size={14} className="text-paper" />
          <Text className="text-xs font-medium text-paper">Change</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={pickImage}
      className="flex-row items-center justify-center gap-2 rounded-2xl bg-cream py-6"
      style={{ borderWidth: 1, borderColor: '#3D3D3D20', borderStyle: 'dashed' }}
    >
      <Ionicons name="image-outline" size={18} className="text-sage" />
      <Text className="text-sm font-medium text-charcoal">Add cover photo</Text>
    </Pressable>
  );
}
