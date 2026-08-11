import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, type ImageSourcePropType } from 'react-native';

type Props = {
  images: ImageSourcePropType[];
  intervalMs?: number;
};

export default function BackgroundSlideshow({ images, intervalMs = 6000 }: Props) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }).start(() => {
        setIndex((i) => (i + 1) % images.length);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }).start();
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs, opacity]);

  return (
    <Animated.Image
      source={images[index]}
      resizeMode="cover"
      style={[StyleSheet.absoluteFill, { opacity }]}
    />
  );
}
