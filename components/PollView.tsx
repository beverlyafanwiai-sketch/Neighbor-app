import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Poll } from '../data/mock';
import { getEffectivePollResults } from '../store/usePostsStore';

type Props = {
  poll: Poll;
  myVote?: string;
  onVote: (optionId: string) => void;
};

export default function PollView({ poll, myVote, onVote }: Props) {
  const { results, total } = getEffectivePollResults(poll, myVote);

  return (
    <View className="mt-3 gap-2">
      {results.map((option) => {
        const pct = total === 0 ? 0 : Math.round((option.votes / total) * 100);
        const isMine = option.id === myVote;
        return (
          <Pressable
            key={option.id}
            onPress={() => onVote(option.id)}
            className="overflow-hidden rounded-xl bg-sand"
          >
            <View
              className={`absolute inset-y-0 left-0 ${isMine ? 'bg-terracotta/25' : 'bg-charcoal/10'}`}
              style={{ width: `${pct}%` }}
            />
            <View className="flex-row items-center justify-between gap-2 px-3 py-2.5">
              <View className="flex-1 flex-row items-center gap-2">
                <Ionicons
                  name={isMine ? 'radio-button-on' : 'radio-button-off'}
                  size={16}
                  color={isMine ? '#E0533C' : '#3D3D3D80'}
                />
                <Text className="flex-1 text-sm text-charcoal" numberOfLines={1}>
                  {option.label}
                </Text>
              </View>
              <Text className="text-xs font-semibold text-charcoal/70">
                {pct}% ({option.votes})
              </Text>
            </View>
          </Pressable>
        );
      })}
      <Text className="text-xs text-charcoal/50">
        {total} vote{total === 1 ? '' : 's'} · Tap to {myVote ? 'change your vote' : 'vote'}
      </Text>
    </View>
  );
}
