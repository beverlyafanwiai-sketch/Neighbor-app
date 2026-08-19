import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Poll } from '../data/mock';
import { getEffectivePollResults, isPollClosed } from '../store/usePostsStore';

type Props = {
  poll: Poll;
  myVote?: string;
  onVote: (optionId: string) => void;
  isAuthor?: boolean;
  onClose?: () => void;
  onReopen?: () => void;
  onAddOption?: (text: string) => void;
};

function formatClosesIn(closesAt: number) {
  const diffMs = closesAt - Date.now();
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  if (diffHours < 1) return 'Closes in less than 1h';
  if (diffHours < 24) return `Closes in ${diffHours}h`;
  return `Closes in ${Math.round(diffHours / 24)}d`;
}

export default function PollView({
  poll,
  myVote,
  onVote,
  isAuthor,
  onClose,
  onReopen,
  onAddOption,
}: Props) {
  const { results, total } = getEffectivePollResults(poll, myVote);
  const closed = isPollClosed(poll);
  const [addingOption, setAddingOption] = useState(false);
  const [optionDraft, setOptionDraft] = useState('');

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
      {isAuthor && onAddOption && !closed && (
        addingOption ? (
          <View className="flex-row items-center gap-1.5">
            <TextInput
              value={optionDraft}
              onChangeText={setOptionDraft}
              placeholder="New option..."
              placeholderTextColor="#3D3D3D80"
              autoFocus
              className="flex-1 rounded-lg bg-sand px-2.5 py-1.5 text-xs text-charcoal"
            />
            <Pressable
              onPress={() => {
                setAddingOption(false);
                setOptionDraft('');
              }}
            >
              <Text className="text-[11px] font-medium text-charcoal/50">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (!optionDraft.trim()) return;
                onAddOption(optionDraft);
                setAddingOption(false);
                setOptionDraft('');
              }}
            >
              <Text className="text-[11px] font-semibold text-terracotta">Add</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setAddingOption(true)}>
            <Text className="text-[11px] font-semibold text-charcoal/50">+ Add an option</Text>
          </Pressable>
        )
      )}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-charcoal/50">
          {total} vote{total === 1 ? '' : 's'}
          {closed
            ? ' · Poll closed'
            : ` · Tap to ${myVote ? 'change your vote' : 'vote'}${poll.closesAt ? ` · ${formatClosesIn(poll.closesAt)}` : ''}`}
        </Text>
        {isAuthor && (onClose || onReopen) && (
          closed ? (
            onReopen && (
              <Pressable onPress={onReopen}>
                <Text className="text-[11px] font-semibold text-terracotta">Reopen poll</Text>
              </Pressable>
            )
          ) : (
            onClose && (
              <Pressable onPress={onClose}>
                <Text className="text-[11px] font-semibold text-charcoal/50">Close poll</Text>
              </Pressable>
            )
          )
        )}
      </View>
    </View>
  );
}
