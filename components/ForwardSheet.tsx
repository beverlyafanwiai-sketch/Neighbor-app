import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getUser } from '../data/mock';
import { useConversationsStore } from '../store/useConversationsStore';
import { useGroupsStore } from '../store/useGroupsStore';

export type ForwardTarget =
  | { kind: 'dm'; id: string; name: string; avatar: string }
  | { kind: 'group'; id: string; name: string };

type Props = {
  preview: string;
  excludeConversationId?: string;
  excludeGroupId?: string;
  onForward: (target: ForwardTarget) => void;
  onClose: () => void;
};

export default function ForwardSheet({
  preview,
  excludeConversationId,
  excludeGroupId,
  onForward,
  onClose,
}: Props) {
  const conversations = useConversationsStore((s) => s.conversations);
  const groups = useGroupsStore((s) => s.groups);
  const joined = useGroupsStore((s) => s.joined);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const dmTargets = Object.values(conversations)
    .filter((c) => c.id !== excludeConversationId)
    .map((c) => {
      const user = getUser(c.userId);
      return user ? { kind: 'dm' as const, id: c.id, name: user.name, avatar: user.avatar } : null;
    })
    .filter((t): t is Extract<ForwardTarget, { kind: 'dm' }> => Boolean(t));

  const groupTargets = groups
    .filter((g) => (joined[g.id] ?? false) && g.id !== excludeGroupId)
    .map((g) => ({ kind: 'group' as const, id: g.id, name: g.name }));

  const send = (target: ForwardTarget) => {
    onForward(target);
    setSentTo(target.id);
    setTimeout(onClose, 900);
  };

  return (
    <View className="absolute inset-0 items-center justify-end bg-ink/40">
      <Pressable className="absolute inset-0" onPress={onClose} />
      <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8" style={{ maxHeight: '75%' }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-charcoal">Forward message</Text>
          <Pressable
            onPress={onClose}
            className="h-8 w-8 items-center justify-center rounded-full bg-sand"
          >
            <Ionicons name="close" size={16} className="text-charcoal" />
          </Pressable>
        </View>

        <Text className="text-sm text-charcoal/60" numberOfLines={2}>
          {preview}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="gap-2 pb-1">
            {dmTargets.length > 0 && (
              <>
                <Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  Direct messages
                </Text>
                {dmTargets.map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => send(t)}
                    className="flex-row items-center gap-3 rounded-2xl bg-sand p-3 active:opacity-80"
                  >
                    <Image source={{ uri: t.avatar }} className="h-9 w-9 rounded-full" />
                    <Text className="flex-1 text-sm font-medium text-charcoal">{t.name}</Text>
                    <Ionicons
                      name={sentTo === t.id ? 'checkmark-circle' : 'arrow-redo-outline'}
                      size={sentTo === t.id ? 18 : 16}
                      className={sentTo === t.id ? 'text-sage' : 'text-charcoal/40'}
                    />
                  </Pressable>
                ))}
              </>
            )}

            {groupTargets.length > 0 && (
              <>
                <Text className="mt-3 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  Groups
                </Text>
                {groupTargets.map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => send(t)}
                    className="flex-row items-center gap-3 rounded-2xl bg-sand p-3 active:opacity-80"
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-terracotta">
                      <Text className="text-xs font-bold text-paper">{t.name.charAt(0)}</Text>
                    </View>
                    <Text className="flex-1 text-sm font-medium text-charcoal">{t.name}</Text>
                    <Ionicons
                      name={sentTo === t.id ? 'checkmark-circle' : 'arrow-redo-outline'}
                      size={sentTo === t.id ? 18 : 16}
                      className={sentTo === t.id ? 'text-sage' : 'text-charcoal/40'}
                    />
                  </Pressable>
                ))}
              </>
            )}

            {dmTargets.length === 0 && groupTargets.length === 0 && (
              <Text className="py-4 text-center text-sm text-charcoal/50">
                No other conversations to forward to yet.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
