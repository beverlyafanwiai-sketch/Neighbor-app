import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const TONE_STYLE: Record<string, { bg: string; text: string }> = {
  Casual: { bg: 'bg-sage/20', text: 'text-sage' },
  Structured: { bg: 'bg-terracotta/15', text: 'text-terracotta' },
  'Activity-focused': { bg: 'bg-gold/20', text: 'text-gold' },
};

const circles = [
  {
    id: '1',
    name: 'Weekend Hikers',
    members: 8,
    tone: 'Casual',
    unread: 3,
    avatars: [
      'https://i.pravatar.cc/150?img=33',
      'https://i.pravatar.cc/150?img=5',
      'https://i.pravatar.cc/150?img=48',
    ],
  },
  {
    id: '2',
    name: 'Book & Bourbon',
    members: 6,
    tone: 'Casual',
    unread: 0,
    avatars: ['https://i.pravatar.cc/150?img=15', 'https://i.pravatar.cc/150?img=47'],
  },
  {
    id: '3',
    name: 'Pottery Wheel Beginners',
    members: 11,
    tone: 'Activity-focused',
    unread: 1,
    avatars: [
      'https://i.pravatar.cc/150?img=12',
      'https://i.pravatar.cc/150?img=33',
      'https://i.pravatar.cc/150?img=15',
    ],
  },
];

const discover = [
  { id: '4', name: 'Uptown Neighbors', members: 142, tone: 'Structured', tag: 'Neighborhood' },
  { id: '5', name: 'Remote Workers Collective', members: 58, tone: 'Casual', tag: 'Interest' },
  { id: '6', name: 'Sunday Supper Club', members: 24, tone: 'Activity-focused', tag: 'Interest' },
];

function ToneTag({ tone }: { tone: string }) {
  const style = TONE_STYLE[tone] ?? TONE_STYLE.Casual;
  return (
    <View className={`rounded-full px-2.5 py-1 ${style.bg}`}>
      <Text className={`text-xs font-semibold ${style.text}`}>{tone}</Text>
    </View>
  );
}

export default function Groups() {
  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-charcoal">Groups</Text>
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-terracotta">
          <Ionicons name="add" size={22} color="#F5F2E9" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        <Text className="mb-3 mt-2 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Your circles
        </Text>
        <View className="gap-3">
          {circles.map((c) => (
            <Pressable
              key={c.id}
              className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-terracotta">
                <Text className="text-lg font-bold text-cream">{c.name.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-charcoal">{c.name}</Text>
                <View className="mt-1.5 flex-row items-center gap-2">
                  <Text className="text-xs text-charcoal/60">{c.members} members</Text>
                  <ToneTag tone={c.tone} />
                </View>
              </View>
              <View className="items-end gap-1.5">
                <View className="flex-row">
                  {c.avatars.map((a, i) => (
                    <Image
                      key={a}
                      source={{ uri: a }}
                      className="h-6 w-6 rounded-full border-2 border-cream"
                      style={{ marginLeft: i === 0 ? 0 : -8 }}
                    />
                  ))}
                </View>
                {c.unread > 0 && (
                  <View className="h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5">
                    <Text className="text-[11px] font-bold text-charcoal">{c.unread}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Discover
        </Text>
        <View className="gap-3">
          {discover.map((g) => (
            <View key={g.id} className="flex-row items-center gap-3 rounded-2xl bg-cream p-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-sage">
                <Text className="text-lg font-bold text-cream">{g.name.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-charcoal">{g.name}</Text>
                <View className="mt-1.5 flex-row items-center gap-2">
                  <Text className="text-xs text-charcoal/60">{g.members} members</Text>
                  <ToneTag tone={g.tone} />
                </View>
              </View>
              <Pressable className="rounded-full bg-charcoal px-4 py-2">
                <Text className="text-xs font-semibold text-cream">Join</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
