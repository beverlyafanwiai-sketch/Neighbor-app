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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { VerificationBadge } from '../data/mock';
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

const VERIFICATION_OPTIONS: {
  id: VerificationBadge;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  hint: string;
}[] = [
  { id: 'id', label: 'ID Verified', icon: 'card-outline', hint: 'Confirms your identity' },
  { id: 'phone', label: 'Phone Verified', icon: 'call-outline', hint: 'Confirms your phone number' },
  { id: 'social', label: 'Social Linked', icon: 'link-outline', hint: 'Link an existing social profile' },
];

const STEPS = [
  {
    title: 'Welcome to Neighbor',
    subtitle: "Let's set up your profile so neighbors know who they're meeting.",
  },
  {
    title: 'Tell us about you',
    subtitle: 'A short bio and a few interests help neighbors know what you’re into.',
  },
  {
    title: 'Where are you local?',
    subtitle: 'This helps nearby neighbors find and recognize you.',
  },
  {
    title: 'Verification & safety',
    subtitle: 'Optional badges that help neighbors trust it’s really you.',
  },
  {
    title: 'Break the ice',
    subtitle: 'A few conversation starters neighbors can use to reach out.',
  },
] as const;

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

  const [step, setStep] = useState(0);

  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [neighborhood, setNeighborhood] = useState('');
  const [crossStreets, setCrossStreets] = useState('');
  const [yearsInArea, setYearsInArea] = useState('');
  const [verifications, setVerifications] = useState<VerificationBadge[]>([]);
  const [askMeAbout, setAskMeAbout] = useState('');
  const [skillsToShare, setSkillsToShare] = useState('');
  const [neighborhoodLove, setNeighborhoodLove] = useState('');

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleVerification = (id: VerificationBadge) => {
    setVerifications((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const isLastStep = step === STEPS.length - 1;
  const canContinue =
    step === 0
      ? name.trim().length > 0
      : step === 1
        ? tags.length > 0
        : step === 2
          ? neighborhood.trim().length > 0
          : true;

  const finish = () => {
    updateProfile({
      avatar,
      name: name.trim(),
      tagline: tagline.trim(),
      bio: bio.trim(),
      tags,
      interests: tags.map(capitalize).join(', '),
      neighborhood: neighborhood.trim(),
      crossStreets: crossStreets.trim(),
      yearsInArea: yearsInArea.trim(),
      verifications,
      conversationStarters: {
        askMeAbout: askMeAbout.trim(),
        skillsToShare: skillsToShare.trim(),
        neighborhoodLove: neighborhoodLove.trim(),
      },
    });
    router.replace('/(tabs)');
  };

  const next = () => {
    if (!canContinue) return;
    if (isLastStep) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const skip = () => router.replace('/(tabs)');

  const meta = STEPS[step];

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
            <View className="px-8 pb-6 pt-16">
              {step > 0 && (
                <Pressable
                  onPress={back}
                  className="mb-4 h-9 w-9 items-center justify-center rounded-full bg-cream/20"
                >
                  <Ionicons name="chevron-back" size={20} color="#F5F2E9" />
                </Pressable>
              )}

              <View className="mb-4 flex-row justify-center gap-1.5">
                {STEPS.map((s, i) => (
                  <View
                    key={s.title}
                    className={`h-1.5 rounded-full ${
                      i === step ? 'w-6 bg-terracotta' : i < step ? 'w-1.5 bg-gold' : 'w-1.5 bg-cream/40'
                    }`}
                  />
                ))}
              </View>

              <Text
                className="text-center text-4xl font-bold italic tracking-tight text-cream"
                style={headingShadow}
              >
                {meta.title}
              </Text>
              <Text className="mt-3 text-center text-base leading-6 text-sand" style={headingShadow}>
                {meta.subtitle}
              </Text>
            </View>

            <View className="rounded-t-[36px] bg-cream px-6 pb-10 pt-4" style={cardShadow}>
              {step === 0 && (
                <>
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
                </>
              )}

              {step === 1 && (
                <View className="gap-5 pt-2">
                  <View>
                    <FieldLabel>About / bio</FieldLabel>
                    <Text className="mb-2 text-sm text-charcoal/60">
                      What brings you to the neighborhood? Hobbies, interests, whatever feels right.
                    </Text>
                    <TextInput
                      value={bio}
                      onChangeText={setBio}
                      placeholder="I moved here last spring and I'm always up for..."
                      placeholderTextColor="#3D3D3D80"
                      multiline
                      className="min-h-[96px] rounded-2xl border border-charcoal/10 bg-sand/70 px-4 py-3.5 text-base text-charcoal"
                    />
                  </View>

                  <View>
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
                </View>
              )}

              {step === 2 && (
                <View className="gap-4 pt-2">
                  <View>
                    <FieldLabel>Neighborhood</FieldLabel>
                    <TextInput
                      value={neighborhood}
                      onChangeText={setNeighborhood}
                      placeholder="Maple Hill, Riverside, Old Town..."
                      placeholderTextColor="#3D3D3D80"
                      className="rounded-2xl border border-charcoal/10 bg-sand/70 px-4 py-3.5 text-base text-charcoal"
                    />
                  </View>

                  <View>
                    <FieldLabel>Cross streets (optional)</FieldLabel>
                    <TextInput
                      value={crossStreets}
                      onChangeText={setCrossStreets}
                      placeholder="e.g. 5th & Sycamore"
                      placeholderTextColor="#3D3D3D80"
                      className="rounded-2xl border border-charcoal/10 bg-sand/70 px-4 py-3.5 text-base text-charcoal"
                    />
                  </View>

                  <View>
                    <FieldLabel>Time in the area (optional)</FieldLabel>
                    <TextInput
                      value={yearsInArea}
                      onChangeText={setYearsInArea}
                      placeholder="e.g. 3 years"
                      placeholderTextColor="#3D3D3D80"
                      className="rounded-2xl border border-charcoal/10 bg-sand/70 px-4 py-3.5 text-base text-charcoal"
                    />
                  </View>
                </View>
              )}

              {step === 3 && (
                <View className="gap-3 pt-2">
                  <Text className="text-sm text-charcoal/60">
                    These are self-reported for now — no documents are uploaded or checked. They just
                    help neighbors feel a little more confident it's really you.
                  </Text>
                  {VERIFICATION_OPTIONS.map((v) => {
                    const selected = verifications.includes(v.id);
                    return (
                      <Pressable
                        key={v.id}
                        onPress={() => toggleVerification(v.id)}
                        className={`flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 ${
                          selected ? 'border-terracotta bg-terracotta/10' : 'border-charcoal/10 bg-sand/70'
                        }`}
                      >
                        <View
                          className={`h-9 w-9 items-center justify-center rounded-full ${
                            selected ? 'bg-terracotta' : 'bg-cream'
                          }`}
                        >
                          <Ionicons
                            name={v.icon}
                            size={16}
                            color={selected ? '#F5F2E9' : '#3D3D3D80'}
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`text-sm font-semibold ${
                              selected ? 'text-terracotta' : 'text-charcoal'
                            }`}
                          >
                            {v.label}
                          </Text>
                          <Text className="text-xs text-charcoal/50">{v.hint}</Text>
                        </View>
                        <Ionicons
                          name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={22}
                          color={selected ? '#E0533C' : '#3D3D3D40'}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {step === 4 && (
                <View className="gap-4 pt-2">
                  <View>
                    <FieldLabel>Ask me about...</FieldLabel>
                    <TextInput
                      value={askMeAbout}
                      onChangeText={setAskMeAbout}
                      placeholder="Home brewing, trail routes, my dog..."
                      placeholderTextColor="#3D3D3D80"
                      multiline
                      className="min-h-[64px] rounded-2xl border border-charcoal/10 bg-sand/70 px-4 py-3.5 text-base text-charcoal"
                    />
                  </View>

                  <View>
                    <FieldLabel>Skills I can share</FieldLabel>
                    <TextInput
                      value={skillsToShare}
                      onChangeText={setSkillsToShare}
                      placeholder="Something you could teach or help with"
                      placeholderTextColor="#3D3D3D80"
                      multiline
                      className="min-h-[64px] rounded-2xl border border-charcoal/10 bg-sand/70 px-4 py-3.5 text-base text-charcoal"
                    />
                  </View>

                  <View>
                    <FieldLabel>Things I love about our neighborhood</FieldLabel>
                    <TextInput
                      value={neighborhoodLove}
                      onChangeText={setNeighborhoodLove}
                      placeholder="What makes this place feel like home"
                      placeholderTextColor="#3D3D3D80"
                      multiline
                      className="min-h-[64px] rounded-2xl border border-charcoal/10 bg-sand/70 px-4 py-3.5 text-base text-charcoal"
                    />
                  </View>
                </View>
              )}

              <Pressable
                onPress={next}
                disabled={!canContinue}
                className={`mt-8 items-center rounded-2xl py-4 active:opacity-80 ${
                  canContinue ? 'bg-terracotta' : 'bg-charcoal/10'
                }`}
                style={canContinue ? buttonShadow : undefined}
              >
                <Text
                  className={`text-base font-semibold ${canContinue ? 'text-cream' : 'text-charcoal/40'}`}
                >
                  {isLastStep ? 'Get started' : 'Continue'}
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
