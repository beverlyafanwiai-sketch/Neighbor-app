import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SvgXml } from 'react-native-svg';

import { PARK_FRIENDS_SVG } from '../assets/illustrations/park-friends';
import { RESORT_FUN_SVG } from '../assets/illustrations/resort-fun';
import { useBackgroundStore, type PresetId } from '../store/useBackgroundStore';

type Props = {
  onClose: () => void;
};

const PRESETS: {
  id: PresetId;
  label: string;
  swatchColor: string;
  svg?: string;
  image?: number;
}[] = [
  { id: 'photo', label: 'Resort photo', swatchColor: '#6FB3AC', image: require('../assets/images/resort-friends.jpg') },
  { id: 'resort', label: 'Resort', swatchColor: '#6FB3AC', svg: RESORT_FUN_SVG },
  { id: 'neighbor', label: 'Neighbor', swatchColor: '#E0533C', svg: PARK_FRIENDS_SVG },
];

export default function BackgroundPickerSheet({ onClose }: Props) {
  const background = useBackgroundStore((s) => s.background);
  const setPreset = useBackgroundStore((s) => s.setPreset);
  const setCustom = useBackgroundStore((s) => s.setCustom);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCustom(result.assets[0].uri);
      onClose();
    }
  };

  return (
    <View className="absolute inset-0 items-center justify-end bg-ink/40">
      <Pressable className="absolute inset-0" onPress={onClose} />
      <View className="w-full gap-4 rounded-t-3xl bg-cream p-5 pb-8">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-charcoal">Background</Text>
          <Pressable
            onPress={onClose}
            className="h-8 w-8 items-center justify-center rounded-full bg-sand"
          >
            <Ionicons name="close" size={16} className="text-charcoal" />
          </Pressable>
        </View>

        <View className="flex-row gap-3">
          {PRESETS.map((preset) => {
            const active = background.kind === 'preset' && background.id === preset.id;
            return (
              <Pressable
                key={preset.id}
                onPress={() => {
                  setPreset(preset.id);
                  onClose();
                }}
                className="flex-1 items-center gap-1.5"
              >
                <View
                  className={`h-20 w-full items-center justify-center overflow-hidden rounded-2xl ${
                    active ? 'border-2 border-terracotta' : 'border border-charcoal/10'
                  }`}
                  style={{ backgroundColor: preset.swatchColor }}
                >
                  {preset.image ? (
                    <Image source={preset.image} className="h-full w-full" resizeMode="cover" />
                  ) : (
                    <View className="h-14 w-20">
                      <SvgXml xml={preset.svg ?? ''} width="100%" height="100%" />
                    </View>
                  )}
                </View>
                <Text
                  className={`text-xs ${active ? 'font-semibold text-terracotta' : 'text-charcoal/60'}`}
                >
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={pickPhoto}
          className="flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
        >
          <Ionicons name="image-outline" size={20} className="text-sage" />
          <Text className="flex-1 text-sm font-medium text-charcoal">
            Upload from your photos
          </Text>
          {background.kind === 'custom' && (
            <Image source={{ uri: background.uri }} className="h-9 w-9 rounded-lg" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
