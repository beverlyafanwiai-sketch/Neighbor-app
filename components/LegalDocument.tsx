import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export type LegalSection = {
  heading: string;
  body: string[];
};

type Props = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export default function LegalDocument({ title, lastUpdated, intro, sections }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">{title}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-1 text-xs text-charcoal/50">Last updated {lastUpdated}</Text>

        <View className="mt-3 gap-2 rounded-2xl bg-gold/15 p-4">
          <Text className="text-xs leading-5 text-charcoal/70">
            Neighbor is a demo community app. This document is a good-faith draft describing how
            the app is designed to handle data, written for clarity rather than as legal advice —
            it hasn't been reviewed by an attorney. Don't rely on it as a substitute for real
            legal counsel before using it in production.
          </Text>
        </View>

        <Text className="mt-5 text-sm leading-6 text-charcoal/80">{intro}</Text>

        {sections.map((section) => (
          <View key={section.heading} className="mt-6">
            <Text className="text-base font-bold text-charcoal">{section.heading}</Text>
            <View className="mt-2 gap-3">
              {section.body.map((paragraph, i) => (
                <Text key={i} className="text-sm leading-6 text-charcoal/80">
                  {paragraph}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
