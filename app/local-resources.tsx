import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type ResourceItem = {
  id: string;
  label: string;
  detail: string;
  phone?: string;
};

type ResourceSection = {
  heading: string;
  items: ResourceItem[];
};

const SECTIONS: ResourceSection[] = [
  {
    heading: 'In an emergency',
    items: [
      {
        id: 'emergency',
        label: 'Police, fire, or medical emergency',
        detail: 'Call for anything requiring immediate help.',
        phone: '911',
      },
      {
        id: 'crisis',
        label: 'Suicide & Crisis Lifeline',
        detail: 'Free, confidential support, 24/7, in the US.',
        phone: '988',
      },
      {
        id: 'poison',
        label: 'Poison Control',
        detail: 'US Poison Help line, 24/7.',
        phone: '1-800-222-1222',
      },
    ],
  },
  {
    heading: 'Non-emergency help',
    items: [
      {
        id: '311',
        label: 'City services (311)',
        detail:
          'Many US cities route non-emergency issues — potholes, noise complaints, code violations — through 311. Check whether your city offers it.',
        phone: '311',
      },
      {
        id: '211',
        label: 'Community & social services (211)',
        detail:
          'Connects you to local food, housing, utility assistance, and other social services across most of the US and Canada.',
        phone: '211',
      },
      {
        id: 'nonemergency-police',
        label: 'Police non-emergency line',
        detail:
          "For situations that need a police response but aren't urgent. Look up your local department's non-emergency number — it's usually on their website.",
      },
    ],
  },
  {
    heading: 'Utilities & city services',
    items: [
      {
        id: 'utilities',
        label: 'Water, power, and gas',
        detail:
          "Neighbor doesn't have your specific providers on file — check a recent bill or your city/county website for the right contact.",
      },
      {
        id: 'trash',
        label: 'Trash & recycling',
        detail: 'Pickup schedules and rules vary by city — your local government website will have the current calendar.',
      },
    ],
  },
];

export default function LocalResources() {
  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Local Resources</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <View className="mt-1 gap-2 rounded-2xl bg-gold/15 p-4">
          <Text className="text-xs leading-5 text-charcoal/70">
            These are general US/Canada numbers we can vouch for, not specific to your city or
            county — Neighbor doesn't know your exact municipality. Always trust your own
            judgment and local authorities over anything listed here.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.heading} className="mt-6">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              {section.heading}
            </Text>
            <View className="gap-2">
              {section.items.map((item) => (
                <View key={item.id} className="rounded-2xl bg-cream p-4">
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="flex-1 text-sm font-semibold text-charcoal">
                      {item.label}
                    </Text>
                    {item.phone && (
                      <Pressable
                        onPress={() => Linking.openURL(`tel:${item.phone!.replace(/[^0-9+]/g, '')}`)}
                        accessibilityLabel={`Call ${item.label} at ${item.phone}`}
                        accessibilityRole="button"
                        className="rounded-full bg-terracotta px-3 py-1.5"
                      >
                        <Text className="text-xs font-semibold text-paper">{item.phone}</Text>
                      </Pressable>
                    )}
                  </View>
                  <Text className="mt-1 text-xs leading-5 text-charcoal/60">{item.detail}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
