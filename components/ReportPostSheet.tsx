import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onClose: () => void;
  title?: string;
  actionLabel?: string;
};

export default function ReportPostSheet({
  onClose,
  title = 'Post options',
  actionLabel = 'Report this post',
}: Props) {
  const [reported, setReported] = useState(false);

  return (
    <View className="absolute inset-0 items-center justify-end bg-ink/40">
      <Pressable className="absolute inset-0" onPress={onClose} />
      <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-charcoal">{title}</Text>
          <Pressable
            onPress={onClose}
            className="h-8 w-8 items-center justify-center rounded-full bg-sand"
          >
            <Ionicons name="close" size={16} className="text-charcoal" />
          </Pressable>
        </View>

        {reported ? (
          <View className="rounded-2xl bg-sage/15 p-4">
            <Text className="text-sm text-sage">
              Thanks — we've received your report and will take a look.
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={() => setReported(true)}
            className="flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
          >
            <Ionicons name="flag-outline" size={20} className="text-charcoal" />
            <Text className="text-sm font-medium text-charcoal">{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
