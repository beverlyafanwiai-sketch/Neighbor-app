import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  illustration?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
};

export default function EmptyState({
  icon,
  illustration,
  iconColor = '#E0533C',
  title,
  subtitle,
  ctaLabel,
  onPressCta,
}: Props) {
  return (
    <View className="mt-10 items-center px-6">
      {illustration ? (
        <View className="h-32 w-32">
          <SvgXml xml={illustration} width="100%" height="100%" />
        </View>
      ) : icon ? (
        <View className="h-20 w-20 items-center justify-center rounded-full bg-cream">
          <Ionicons name={icon} size={32} color={iconColor} />
        </View>
      ) : null}
      <Text className="mt-4 text-center text-base font-semibold text-charcoal">{title}</Text>
      {subtitle && (
        <Text className="mt-1.5 text-center text-sm text-charcoal/60">{subtitle}</Text>
      )}
      {ctaLabel && onPressCta && (
        <Pressable onPress={onPressCta} className="mt-5 rounded-full bg-charcoal px-6 py-3">
          <Text className="text-sm font-semibold text-cream">{ctaLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
