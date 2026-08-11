import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileStore } from '../store/useProfileStore';

const AVATAR_OPTIONS = [1, 3, 4, 6, 7, 8, 10, 47].map((n) => `https://i.pravatar.cc/300?img=${n}`);

const INTEREST_TAGS = [
  'hiking',
  'pottery',
  'board games',
  'live music',
  'trail running',
  'photography',
  'coffee',
  'chess',
  'vinyl records',
  'cooking',
  'journaling',
  'gardening',
  'crosswords',
];

function capitalize(tag: string) {
  return tag.replace(/\b\w/g, (c) => c.toUpperCase());
}

const cardShadow = {
  shadowColor: '#3D3D3D',
  shadowOffset: { width: 0, height: -6 },
  shadowOpacity: 0.18,
  shadowRadius: 24,
  elevation: 12,
};

const avatarShadow = {
  shadowColor: '#3D3D3D',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 8,
};

const buttonShadow = {
  shadowColor: '#E0533C',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 14,
  elevation: 8,
};

const headingShadow = {
  textShadowColor: 'rgba(61,61,61,0.5)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 10,
};

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function Onboarding() {
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const canContinue = name.trim().length > 0 && tags.length > 0;

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const finish = () => {
    if (!canContinue) return;
    updateProfile({
      avatar,
      name: name.trim(),
      tagline: tagline.trim(),
      tags,
      interests: tags.map(capitalize).join(', '),
    });
    router.replace('/(tabs)');
  };

  const skip = () => router.replace('/(tabs)');

  return (
    <View className="flex-1 bg-charcoal">
      <Image
        source={require('../assets/images/onboarding-cafe.jpg')}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full"
      />
      <LinearGradient
        colors={['rgba(217,164,65,0.4)', 'rgba(224,83,60,0.18)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.7 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(61,61,61,0.1)', 'rgba(61,61,61,0.94)']}
        locations={[0, 0.4, 0.78]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="flex-grow justify-end">
            <View className="px-8 pb-10 pt-16">
              <Text
                className="text-center text-4xl font-bold italic tracking-tight text-cream"
                style={headingShadow}
              >
                Welcome to Neighbor
              </Text>
              <Text className="mt-3 text-center text-base leading-6 text-sand" style={headingShadow}>
                Let's set up your profile so neighbors know who they're meeting.
              </Text>
            </View>

            <View className="rounded-t-[36px] bg-cream px-6 pb-10 pt-4" style={cardShadow}>
              <View className="items-center">
                <View className="-mt-16 rounded-full bg-cream p-1.5" style={avatarShadow}>
                  <Image
                    source={{ uri: avatar }}
                    className="h-28 w-28 rounded-full border-[3px] border-terracotta"
                  />
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="mt-5 gap-3 px-1 pb-2"
              >
                {AVATAR_OPTIONS.map((uri) => (
                  <Pressable key={uri} onPress={() => setAvatar(uri)}>
                    <Image
                      source={{ uri }}
                      className={`h-14 w-14 rounded-full ${
                        avatar === uri
                          ? 'border-2 border-terracotta opacity-100'
                          : 'border-2 border-transparent opacity-60'
                      }`}
                    />
                  </Pressable>
                ))}
              </ScrollView>

              <View className="mt-6 gap-4">
                <View>
                  <FieldLabel>Name</FieldLabel>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="What should neighbors call you?"
                    placeholderTextColor="#3D3D3D80"
                    className="rounded-2xl border border-charcoal/10 bg-sand/70 px-4 py-3.5 text-base text-charcoal"
                  />
                </View>

                <View>
                  <FieldLabel>Tagline</FieldLabel>
                  <TextInput
                    value={tagline}
                    onChangeText={setTagline}
                    placeholder="What are you looking for?"
                    placeholderTextColor="#3D3D3D80"
                    className="rounded-2xl border border-charcoal/10 bg-sand/70 px-4 py-3.5 text-base text-charcoal"
                  />
                </View>
              </View>

              <View className="mt-6">
                <FieldLabel>What are you into?</FieldLabel>
                <Text className="mb-3 text-sm text-charcoal/60">
                  Pick a few things — we'll use them to match you with the right neighbors.
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {INTEREST_TAGS.map((tag) => {
                    const selected = tags.includes(tag);
                    return (
                      <Pressable
                        key={tag}
                        onPress={() => toggleTag(tag)}
                        className={`rounded-full px-4 py-2 ${
                          selected ? 'bg-terracotta' : 'border border-charcoal/10 bg-sand/70'
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            selected ? 'text-cream' : 'text-charcoal/70'
                          }`}
                        >
                          {capitalize(tag)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                onPress={finish}
                disabled={!canContinue}
                className={`mt-8 items-center rounded-2xl py-4 active:opacity-80 ${
                  canContinue ? 'bg-terracotta' : 'bg-charcoal/10'
                }`}
                style={canContinue ? buttonShadow : undefined}
              >
                <Text
                  className={`text-base font-semibold ${canContinue ? 'text-cream' : 'text-charcoal/40'}`}
                >
                  Get started
                </Text>
              </Pressable>

              <Pressable onPress={skip} className="mt-4 items-center">
                <Text className="text-sm text-charcoal/50 underline">Skip for now</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
