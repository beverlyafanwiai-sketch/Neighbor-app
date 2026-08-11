import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Post, ReactionType } from '../data/mock';
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
  post: Post;
  myReaction: ReactionType | undefined;
  onTap: () => void;
  onSelect: (type: ReactionType) => void;
  fullWidth?: boolean;
};

export default function ReactionButton({ post, myReaction, onTap, onSelect, fullWidth }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const counts = getEffectiveReactions(post, myReaction);
  const total = getReactionTotal(counts);
  const topTypes = getTopReactionTypes(counts, 2);

  return (
    <View className={fullWidth ? 'flex-1' : undefined} style={{ position: 'relative' }}>
      {showPicker && (
        <View
          className="absolute bottom-9 left-0 flex-row gap-1 rounded-full bg-cream px-2 py-1.5"
          style={pickerShadow}
        >
          {REACTION_TYPES.map((type) => (
            <Pressable
              key={type}
              onPress={() => {
                onSelect(type);
                setShowPicker(false);
              }}
              className="h-9 w-9 items-center justify-center rounded-full active:bg-sand"
            >
              <Text style={{ fontSize: 20 }}>{REACTION_EMOJI[type]}</Text>
            </Pressable>
          ))}
        </View>
      )}

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
        className={`flex-row items-center gap-1.5 py-1 ${fullWidth ? 'justify-center' : ''}`}
      >
        {myReaction ? (
          <Text style={{ fontSize: 16 }}>{REACTION_EMOJI[myReaction]}</Text>
        ) : topTypes.length > 0 ? (
          <Text style={{ fontSize: 14 }}>{topTypes.map((t) => REACTION_EMOJI[t]).join('')}</Text>
        ) : (
          <Ionicons name="heart-outline" size={18} color="#E0533C" />
        )}
        <Text className={`text-sm ${myReaction ? 'font-semibold text-terracotta' : 'text-charcoal/70'}`}>
          {total}
        </Text>
      </Pressable>
    </View>
  );
}
