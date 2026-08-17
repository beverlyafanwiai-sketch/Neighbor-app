import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Poll } from '../data/mock';
import { getEffectivePollResults, isPollClosed } from '../store/usePostsStore';

type Props = {
  poll: Poll;
  myVote?: string;
  onVote: (optionId: string) => void;
};

function formatClosesIn(closesAt: number) {
  const diffMs = closesAt - Date.now();
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  if (diffHours < 1) return 'Closes in less than 1h';
  if (diffHours < 24) return `Closes in ${diffHours}h`;
  return `Closes in ${Math.round(diffHours / 24)}d`;
}

export default function PollView({ poll, myVote, onVote }: Props) {
  const { results, total } = getEffectivePollResults(poll, myVote);
  const closed = isPollClosed(poll);

  return (
    <View className="mt-3 gap-2">
      {results.map((option) => {
        const pct = total === 0 ? 0 : Math.round((option.votes / total) * 100);
        const isMine = option.id === myVote;
        return (
          <Pressable
            key={option.id}
            disabled={closed}
            onPress={() => onVote(option.id)}
            className="overflow-hidden rounded-xl bg-sand"
            style={closed ? { opacity: 0.7 } : undefined}
          >
            <View
              className={`absolute inset-y-0 left-0 ${isMine ? 'bg-terracotta/25' : 'bg-ink/10'}`}
              style={{ width: `${pct}%` }}
            />
            <View className="flex-row items-center justify-between gap-2 px-3 py-2.5">
              <View className="flex-1 flex-row items-center gap-2">
                <Ionicons
                  name={isMine ? 'radio-button-on' : 'radio-button-off'}
                  size={16}
                  className={isMine ? 'text-terracotta' : 'text-charcoal/50'}
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
        {total} vote{total === 1 ? '' : 's'}
        {closed
          ? ' · Poll closed'
          : ` · Tap to ${myVote ? 'change your vote' : 'vote'}${poll.closesAt ? ` · ${formatClosesIn(poll.closesAt)}` : ''}`}
      </Text>
    </View>
  );
}
