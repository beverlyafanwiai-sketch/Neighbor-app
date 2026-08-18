import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onClose: () => void;
  title?: string;
  actionLabel?: string;
};

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or scam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Something else' },
] as const;

export default function ReportPostSheet({
  onClose,
  title = 'Post options',
  actionLabel = 'Report this post',
}: Props) {
  const [reported, setReported] = useState(false);
  const [choosingReason, setChoosingReason] = useState(false);
  const [selectedReason, setSelectedReason] = useState<(typeof REPORT_REASONS)[number] | null>(null);
  const [detailsDraft, setDetailsDraft] = useState('');

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
        ) : selectedReason ? (
          <View className="gap-3">
            <Pressable
              onPress={() => setSelectedReason(null)}
              className="flex-row items-center gap-1.5 self-start"
            >
              <Ionicons name="chevron-back" size={14} className="text-charcoal/50" />
              <Text className="text-xs font-medium text-charcoal/50">{selectedReason.label}</Text>
            </Pressable>
            <TextInput
              value={detailsDraft}
              onChangeText={setDetailsDraft}
              placeholder="Add details (optional)..."
              placeholderTextColor="#3D3D3D80"
              multiline
              className="min-h-[80px] rounded-2xl bg-sand px-4 py-3 text-sm text-charcoal"
            />
            <Pressable
              onPress={() => setReported(true)}
              className="items-center rounded-2xl bg-terracotta p-3.5"
            >
              <Text className="text-sm font-semibold text-paper">Submit report</Text>
            </Pressable>
          </View>
        ) : choosingReason ? (
          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Why are you reporting this?
            </Text>
            {REPORT_REASONS.map((reason) => (
              <Pressable
                key={reason.value}
                onPress={() => setSelectedReason(reason)}
                className="rounded-2xl bg-sand p-4 active:opacity-80"
              >
                <Text className="text-sm font-medium text-charcoal">{reason.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable
            onPress={() => setChoosingReason(true)}
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
