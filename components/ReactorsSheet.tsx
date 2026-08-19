import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getUser, ME, type ReactionType } from '../data/mock';
import { getReactorsByType, REACTION_EMOJI, REACTION_TYPES } from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';

type Props = {
  reactions: Record<string, ReactionType> | undefined;
  myReaction: ReactionType | undefined;
  onClose: () => void;
  onPersonPress?: (userId: string) => void;
};

const REACTION_LABEL: Record<ReactionType, string> = {
  love: 'Love',
  haha: 'Haha',
  wow: 'Wow',
  sad: 'Sad',
  clap: 'Clap',
};

export default function ReactorsSheet({ reactions, myReaction, onClose, onPersonPress }: Props) {
  const profile = useProfileStore((s) => s.profile);
  const grouped = getReactorsByType(reactions, myReaction);
  const types = REACTION_TYPES.filter((t) => (grouped[t]?.length ?? 0) > 0);

  return (
    <View className="absolute inset-0 items-center justify-end bg-ink/40">
      <Pressable className="absolute inset-0" onPress={onClose} />
      <View className="max-h-[70%] w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-charcoal">Reactions</Text>
          <Pressable
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
            className="h-8 w-8 items-center justify-center rounded-full bg-sand"
          >
            <Ionicons name="close" size={16} className="text-charcoal" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {types.length === 0 && (
            <Text className="py-6 text-center text-sm text-charcoal/50">No reactions yet.</Text>
          )}
          <View className="gap-5">
            {types.map((type) => (
              <View key={type} className="gap-2">
                <View className="flex-row items-center gap-1.5">
                  <Text style={{ fontSize: 16 }}>{REACTION_EMOJI[type]}</Text>
                  <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                    {REACTION_LABEL[type]} · {grouped[type]!.length}
                  </Text>
                </View>
                <View className="gap-1">
                  {grouped[type]!.map((userId) => {
                    const isMe = userId === ME.id;
                    const person = isMe ? profile : getUser(userId);
                    if (!person) return null;
                    return (
                      <Pressable
                        key={userId}
                        onPress={() => !isMe && onPersonPress?.(userId)}
                        className="flex-row items-center gap-3 rounded-2xl p-2 active:opacity-70"
                      >
                        <Image source={{ uri: person.avatar }} className="h-9 w-9 rounded-full" />
                        <Text className="font-medium text-charcoal">
                          {isMe ? 'You' : person.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
