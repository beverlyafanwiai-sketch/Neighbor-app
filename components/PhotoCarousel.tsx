import { useState } from 'react';
import { Image, LayoutChangeEvent, NativeSyntheticEvent, NativeScrollEvent, ScrollView, View } from 'react-native';

type Props = {
  uris: string[];
  className?: string;
};

export default function PhotoCarousel({ uris, className = 'mt-3' }: Props) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [index, setIndex] = useState(0);

  if (uris.length === 0) return null;

  if (uris.length === 1) {
    return (
      <Image
        source={{ uri: uris[0] }}
        className={`w-full rounded-2xl ${className}`}
        style={{ aspectRatio: 4 / 3 }}
      />
    );
  }

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth === 0) return;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / containerWidth));
  };

  return (
    <View
      className={className}
      onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          className="overflow-hidden rounded-2xl"
          style={{ width: containerWidth, aspectRatio: 4 / 3 }}
        >
          {uris.map((uri, i) => (
            <Image key={i} source={{ uri }} style={{ width: containerWidth, aspectRatio: 4 / 3 }} />
          ))}
        </ScrollView>
      )}
      <View className="mt-2 flex-row items-center justify-center gap-1.5">
        {uris.map((_, i) => (
          <View
            key={i}
            className={`h-1.5 rounded-full ${i === index ? 'w-4 bg-terracotta' : 'w-1.5 bg-ink/20'}`}
          />
        ))}
      </View>
    </View>
  );
}
