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
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  uris: string[];
  initialIndex?: number;
  onClose: () => void;
};

export default function PhotoViewer({ uris, initialIndex = 0, onClose }: Props) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

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

        <Text className="px-4 pb-8 pt-3 text-center text-xs text-paper/50">
          Tap the photo to zoom
        </Text>
      </View>
    </Modal>
  );
}
