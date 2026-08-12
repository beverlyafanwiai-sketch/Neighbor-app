import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { getUser, ME } from '../data/mock';
import { getEffectiveAgreeCount, useRecsStore } from '../store/useRecsStore';

export default function RecsBoard() {
  const entries = useRecsStore((s) => s.entries);
  const myAgreed = useRecsStore((s) => s.myAgreed);
  const toggleAgree = useRecsStore((s) => s.toggleAgree);
  const deleteEntry = useRecsStore((s) => s.deleteEntry);

  const myEntries = entries.filter((e) => e.authorId === ME.id);
  const boardEntries = entries.filter((e) => e.authorId !== ME.id);

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Neighborhood Recs</Text>
        <Pressable
          onPress={() => router.push('/create-rec')}
          className="h-9 w-9 items-center justify-center rounded-full bg-terracotta"
        >
          <Ionicons name="add" size={20} className="text-paper" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-sm text-charcoal/60">
          Who do you trust? Share a recommendation, or ask when you need one.
        </Text>

        {myEntries.length > 0 && (
          <>
            <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              My posts
            </Text>
            <View className="gap-3">
              {myEntries.map((entry) => {
                const count = getEffectiveAgreeCount(entry.id, false);
                return (
                  <View key={entry.id} className="rounded-2xl bg-cream p-4">
                    <View className="flex-row items-center gap-3">
                      <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                        <Text style={{ fontSize: 20 }}>{entry.emoji}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-charcoal">
                          {entry.kind === 'rec' ? (entry.name ?? entry.category) : entry.category}
                        </Text>
                        <Text className="text-xs text-charcoal/50">
                          {entry.kind === 'rec' ? `Your ${entry.category} recommendation` : 'You asked the board'}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => deleteEntry(entry.id)}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Ionicons name="trash-outline" size={16} className="text-terracotta" />
                      </Pressable>
                    </View>
                    <Text className="mt-3 border-t border-charcoal/10 pt-3 text-sm text-charcoal/50">
                      {count === 0
                        ? entry.kind === 'rec'
                          ? 'No one else has agreed yet'
                          : 'No suggestions yet'
                        : entry.kind === 'rec'
                          ? `${count} neighbor${count === 1 ? '' : 's'} agree`
                          : `${count} neighbor${count === 1 ? '' : 's'} have a suggestion`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          The board
        </Text>

        <View className="gap-3">
          {boardEntries.map((entry) => {
            const author = getUser(entry.authorId);
            if (!author) return null;
            const agreed = myAgreed[entry.id] ?? false;
            const count = getEffectiveAgreeCount(entry.id, agreed);
            const isRec = entry.kind === 'rec';

            return (
              <View key={entry.id} className="rounded-2xl bg-cream p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-sand">
                    <Text style={{ fontSize: 20 }}>{entry.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-charcoal">
                      {isRec ? (entry.name ?? entry.category) : entry.category}
                    </Text>
                    <Text className="text-xs text-charcoal/50">
                      {isRec ? `Recommended by ${author.name}` : `${author.name} is looking`}
                    </Text>
                  </View>
                </View>
                <Text className="mt-2 text-sm leading-5 text-charcoal/80">{entry.note}</Text>

                <View className="mt-3 flex-row items-center justify-between border-t border-charcoal/10 pt-3">
                  <Text className="flex-1 text-sm text-charcoal/50">
                    {count === 0
                      ? isRec
                        ? 'No agrees yet'
                        : 'No neighbors yet'
                      : isRec
                        ? `+${count} other${count === 1 ? '' : 's'} agree`
                        : `${count} neighbor${count === 1 ? '' : 's'} can help`}
                  </Text>
                  <Pressable
                    onPress={() => toggleAgree(entry.id)}
                    className={`rounded-full px-4 py-1.5 ${agreed ? 'bg-sage/20' : 'bg-ink'}`}
                  >
                    <Text className={`text-xs font-semibold ${agreed ? 'text-sage' : 'text-paper'}`}>
                      {agreed
                        ? isRec
                          ? 'You agree ✓'
                          : 'You offered ✓'
                        : isRec
                          ? "+1, I've used them too"
                          : 'I have one'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          {boardEntries.length === 0 && (
            <EmptyState
              icon="star-outline"
              iconColorClassName="text-charcoal/50"
              title="Nothing on the board yet"
              subtitle="Recommend someone you trust, or ask your neighbors for a suggestion."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
