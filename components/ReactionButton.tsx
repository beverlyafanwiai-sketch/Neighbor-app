import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { ReactionType } from '../data/mock';
import {
  getEffectiveReactions,
  getReactionTotal,
  getTopReactionTypes,
  REACTION_EMOJI,
  REACTION_TYPES,
} from '../store/usePostsStore';

const pickerShadow = {
  shadowColor: '#3D3D3D',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 8,
};

type Props = {
  reactions: Record<string, ReactionType> | undefined;
  myReaction: ReactionType | undefined;
  onTap: () => void;
  onSelect: (type: ReactionType) => void;
  onShowReactors?: () => void;
  fullWidth?: boolean;
  compact?: boolean;
  pickerAlign?: 'left' | 'right';
};

export default function ReactionButton({
  reactions,
  myReaction,
  onTap,
  onSelect,
  onShowReactors,
  fullWidth,
  compact,
  pickerAlign = 'left',
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const counts = getEffectiveReactions(reactions, myReaction);
  const total = getReactionTotal(counts);
  const topTypes = getTopReactionTypes(counts, 2);
  const iconSize = compact ? 14 : 18;
  const glyphSize = compact ? 13 : 16;
  const topGlyphSize = compact ? 11 : 14;
  const pickerGlyphSize = compact ? 16 : 20;
  const pickerButtonSize = compact ? 32 : 36;

  return (
    <View className={fullWidth ? 'flex-1' : undefined} style={{ position: 'relative' }}>
      {showPicker && (
        <View
          className={`absolute bottom-8 flex-row gap-1 rounded-full bg-cream px-2 py-1.5 ${
            pickerAlign === 'right' ? 'right-0' : 'left-0'
          }`}
          style={pickerShadow}
        >
          {REACTION_TYPES.map((type) => (
            <Pressable
              key={type}
              onPress={() => {
                onSelect(type);
                setShowPicker(false);
              }}
              className="items-center justify-center rounded-full active:bg-sand"
              style={{ height: pickerButtonSize, width: pickerButtonSize }}
            >
              <Text style={{ fontSize: pickerGlyphSize }}>{REACTION_EMOJI[type]}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View className={`flex-row items-center gap-1.5 py-1 ${fullWidth ? 'justify-center' : ''}`}>
        <Pressable
          onPress={() => {
            if (showPicker) {
              setShowPicker(false);
              return;
            }
            onTap();
          }}
          onLongPress={() => setShowPicker(true)}
          delayLongPress={350}
        >
          {myReaction ? (
            <Text style={{ fontSize: glyphSize }}>{REACTION_EMOJI[myReaction]}</Text>
          ) : topTypes.length > 0 ? (
            <Text style={{ fontSize: topGlyphSize }}>
              {topTypes.map((t) => REACTION_EMOJI[t]).join('')}
            </Text>
          ) : (
            <Ionicons name="heart-outline" size={iconSize} className="text-terracotta" />
          )}
        </Pressable>
        <Pressable onPress={() => total > 0 && onShowReactors?.()} disabled={total === 0}>
          <Text
            className={`${compact ? 'text-xs' : 'text-sm'} ${
              myReaction ? 'font-semibold text-terracotta' : 'text-charcoal/70'
            }`}
          >
            {total}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
