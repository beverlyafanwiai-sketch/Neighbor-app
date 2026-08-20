import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import CoverPhotoPicker from '../components/CoverPhotoPicker';
import LocationPicker from '../components/LocationPicker';
import type { Prompt, VerificationBadge } from '../data/mock';
import { useProfileStore } from '../store/useProfileStore';

const MAX_PROMPTS = 3;

const PROMPT_QUESTIONS = [
  'How I recharge',
  'A belief I hold that not everyone agrees with',
  'What I’m looking for',
  'The way to my heart is',
  'I’m weirdly competitive about',
  'A skill I’m proud of',
  'My go-to comfort food',
  'You’ll find me on weekends',
  'A cause I care about',
  'The best local secret I know',
  'My ideal neighbor hangout',
  'Something I’m currently learning',
];

const AVATAR_OPTIONS = [47, 1, 3, 4, 6, 7, 8, 10].map((n) => `https://i.pravatar.cc/300?img=${n}`);

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

function capitalize(tag: string) {
  return tag.replace(/\b\w/g, (c) => c.toUpperCase());
}

function sameSet(a: string[], b: string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

function SectionHeading({ children }: { children: string }) {
  return <Text className="mb-3 mt-8 text-base font-bold text-charcoal">{children}</Text>;
}

export default function EditProfile() {
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const setPrompts = useProfileStore((s) => s.setPrompts);

  const [avatar, setAvatar] = useState(profile.avatar);
  const [coverImageUri, setCoverImageUri] = useState(profile.coverImageUri);
  const [name, setName] = useState(profile.name);
  const [pronouns, setPronouns] = useState(profile.pronouns ?? '');
  const [link, setLink] = useState(profile.link ?? '');
  const [tagline, setTagline] = useState(profile.tagline);
  const [bio, setBio] = useState(profile.bio);
  const [interests, setInterests] = useState(profile.interests);
  const [values, setValues] = useState(profile.values);
  const [tags, setTags] = useState(profile.tags);
  const [neighborhood, setNeighborhood] = useState(profile.neighborhood);
  const [crossStreets, setCrossStreets] = useState(profile.crossStreets);
  const [yearsInArea, setYearsInArea] = useState(profile.yearsInArea);
  const [verifications, setVerifications] = useState(profile.verifications);
  const [askMeAbout, setAskMeAbout] = useState(profile.conversationStarters.askMeAbout);
  const [skillsToShare, setSkillsToShare] = useState(profile.conversationStarters.skillsToShare);
  const [neighborhoodLove, setNeighborhoodLove] = useState(profile.conversationStarters.neighborhoodLove);
  const [prompts, setPromptsLocal] = useState<Prompt[]>(profile.prompts);
  const [pickingPrompt, setPickingPrompt] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);

  const unusedPromptQuestions = PROMPT_QUESTIONS.filter(
    (q) => !prompts.some((p) => p.q === q)
  );

  const updatePromptAnswer = (index: number, answer: string) => {
    setPromptsLocal((prev) => prev.map((p, i) => (i === index ? { ...p, a: answer } : p)));
  };

  const addPrompt = (q: string) => {
    setPromptsLocal((prev) => [...prev, { q, a: '' }]);
    setPickingPrompt(false);
  };

  const removePrompt = (index: number) => {
    setPromptsLocal((prev) => prev.filter((_, i) => i !== index));
  };

  const hasUnsavedChanges =
    avatar !== profile.avatar ||
    coverImageUri !== profile.coverImageUri ||
    name !== profile.name ||
    pronouns !== (profile.pronouns ?? '') ||
    link !== (profile.link ?? '') ||
    tagline !== profile.tagline ||
    bio !== profile.bio ||
    interests !== profile.interests ||
    values !== profile.values ||
    neighborhood !== profile.neighborhood ||
    crossStreets !== profile.crossStreets ||
    yearsInArea !== profile.yearsInArea ||
    askMeAbout !== profile.conversationStarters.askMeAbout ||
    skillsToShare !== profile.conversationStarters.skillsToShare ||
    neighborhoodLove !== profile.conversationStarters.neighborhoodLove ||
    !sameSet(tags, profile.tags) ||
    !sameSet(verifications, profile.verifications) ||
    prompts.length !== profile.prompts.length ||
    prompts.some((p, i) => p.q !== profile.prompts[i]?.q || p.a !== profile.prompts[i]?.a);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleVerification = (id: VerificationBadge) => {
    setVerifications((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const save = () => {
    updateProfile({
      avatar,
      coverImageUri,
      name: name.trim(),
      pronouns: pronouns.trim() || undefined,
      link: link.trim() || undefined,
      tagline: tagline.trim(),
      bio: bio.trim(),
      interests: interests.trim(),
      values: values.trim(),
      tags,
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
    setPrompts(prompts.map((p) => ({ q: p.q, a: p.a.trim() })).filter((p) => p.a.length > 0));
    router.back();
  };

  const close = () => {
    if (!hasUnsavedChanges) {
      router.back();
      return;
    }
    setConfirmingClose(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={close}
          accessibilityLabel="Close"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-sand"
        >
          <Ionicons name="close" size={20} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Edit profile</Text>
        <Pressable onPress={save} className="rounded-full bg-terracotta px-4 py-2">
          <Text className="text-sm font-semibold text-paper">Save</Text>
        </Pressable>
      </View>

      {confirmingClose && (
        <View className="gap-3 bg-terracotta/10 px-4 py-3">
          <Text className="text-sm text-charcoal">Discard your unsaved changes?</Text>
          <View className="flex-row justify-end gap-4">
            <Pressable onPress={() => setConfirmingClose(false)}>
              <Text className="text-sm font-medium text-charcoal/60">Keep editing</Text>
            </Pressable>
            <Pressable onPress={() => router.back()}>
              <Text className="text-sm font-semibold text-terracotta">Discard</Text>
            </Pressable>
          </View>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          <View className="items-center py-4">
            <Image source={{ uri: avatar }} className="h-24 w-24 rounded-full border-4 border-terracotta" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 pb-2"
          >
            {AVATAR_OPTIONS.map((uri) => (
              <Pressable key={uri} onPress={() => setAvatar(uri)}>
                <Image
                  source={{ uri }}
                  className={`h-14 w-14 rounded-full ${
                    avatar === uri ? 'border-2 border-terracotta' : 'opacity-70'
                  }`}
                />
              </Pressable>
            ))}
          </ScrollView>

          <View className="mt-6 gap-4">
            <View>
              <FieldLabel>Cover photo</FieldLabel>
              <CoverPhotoPicker imageUri={coverImageUri} onChange={setCoverImageUri} />
            </View>
            <View>
              <FieldLabel>Name</FieldLabel>
              <TextInput
                value={name}
                onChangeText={setName}
                className="rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Pronouns (optional)</FieldLabel>
              <TextInput
                value={pronouns}
                onChangeText={setPronouns}
                placeholder="e.g. she/her, he/him, they/them"
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Website or social link (optional)</FieldLabel>
              <TextInput
                value={link}
                onChangeText={setLink}
                placeholder="e.g. instagram.com/you"
                placeholderTextColor="#3D3D3D80"
                autoCapitalize="none"
                keyboardType="url"
                className="rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Tagline</FieldLabel>
              <TextInput
                value={tagline}
                onChangeText={setTagline}
                placeholder="What are you looking for?"
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Bio</FieldLabel>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="What brings you to the neighborhood?"
                placeholderTextColor="#3D3D3D80"
                multiline
                className="min-h-[80px] rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Interests</FieldLabel>
              <TextInput
                value={interests}
                onChangeText={setInterests}
                multiline
                className="min-h-[64px] rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Values</FieldLabel>
              <TextInput
                value={values}
                onChangeText={setValues}
                multiline
                className="min-h-[64px] rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>

            {prompts.map((p, i) => (
              <View key={p.q}>
                <View className="mb-1.5 flex-row items-center justify-between">
                  <FieldLabel>{p.q}</FieldLabel>
                  <Pressable
                    onPress={() => removePrompt(i)}
                    accessibilityLabel={`Remove prompt "${p.q}"`}
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={14} className="text-charcoal/40" />
                  </Pressable>
                </View>
                <TextInput
                  value={p.a}
                  onChangeText={(text) => updatePromptAnswer(i, text)}
                  multiline
                  className="min-h-[64px] rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
                />
              </View>
            ))}

            {prompts.length < MAX_PROMPTS && (
              <Pressable
                onPress={() => setPickingPrompt(true)}
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-charcoal/20 py-3.5"
              >
                <Ionicons name="add" size={16} className="text-charcoal/60" />
                <Text className="text-sm font-medium text-charcoal/60">Add a prompt</Text>
              </Pressable>
            )}
          </View>

          <SectionHeading>What are you into?</SectionHeading>
          <View className="flex-row flex-wrap gap-2">
            {INTEREST_TAGS.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  className={`rounded-full px-4 py-2 ${
                    selected ? 'bg-terracotta' : 'border border-charcoal/10 bg-sand'
                  }`}
                >
                  <Text className={`text-sm font-medium ${selected ? 'text-paper' : 'text-charcoal/70'}`}>
                    {capitalize(tag)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <SectionHeading>Neighborhood</SectionHeading>
          <View className="gap-4">
            <LocationPicker
              neighborhood={neighborhood}
              crossStreets={crossStreets}
              onLocationSet={(nextNeighborhood, nextCrossStreets) => {
                setNeighborhood(nextNeighborhood);
                setCrossStreets(nextCrossStreets);
              }}
            />
            <View>
              <FieldLabel>Time in the area</FieldLabel>
              <TextInput
                value={yearsInArea}
                onChangeText={setYearsInArea}
                placeholder="e.g. 3 years"
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>
          </View>

          <SectionHeading>Verification & safety</SectionHeading>
          <Text className="mb-3 text-sm text-charcoal/60">
            Self-reported for now — no documents are uploaded or checked.
          </Text>
          <View className="gap-3">
            {VERIFICATION_OPTIONS.map((v) => {
              const selected = verifications.includes(v.id);
              return (
                <Pressable
                  key={v.id}
                  onPress={() => toggleVerification(v.id)}
                  className={`flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 ${
                    selected ? 'border-terracotta bg-terracotta/10' : 'border-charcoal/10 bg-sand'
                  }`}
                >
                  <View
                    className={`h-9 w-9 items-center justify-center rounded-full ${
                      selected ? 'bg-terracotta' : 'bg-cream'
                    }`}
                  >
                    <Ionicons name={v.icon} size={16} className={selected ? 'text-paper' : 'text-charcoal/50'} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-semibold ${selected ? 'text-terracotta' : 'text-charcoal'}`}
                    >
                      {v.label}
                    </Text>
                    <Text className="text-xs text-charcoal/50">{v.hint}</Text>
                  </View>
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    className={selected ? 'text-terracotta' : 'text-charcoal/25'}
                  />
                </Pressable>
              );
            })}
          </View>

          <SectionHeading>Conversation starters</SectionHeading>
          <View className="gap-4">
            <View>
              <FieldLabel>Ask me about...</FieldLabel>
              <TextInput
                value={askMeAbout}
                onChangeText={setAskMeAbout}
                placeholder="Home brewing, trail routes, my dog..."
                placeholderTextColor="#3D3D3D80"
                multiline
                className="min-h-[64px] rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
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
                className="min-h-[64px] rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
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
                className="min-h-[64px] rounded-2xl bg-sand px-4 py-3 text-base text-charcoal"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {pickingPrompt && (
        <View className="absolute inset-0 items-center justify-end bg-ink/40">
          <Pressable className="absolute inset-0" onPress={() => setPickingPrompt(false)} />
          <View className="max-h-[70%] w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-charcoal">Choose a prompt</Text>
              <Pressable
                onPress={() => setPickingPrompt(false)}
                accessibilityLabel="Close"
                accessibilityRole="button"
                className="h-8 w-8 items-center justify-center rounded-full bg-sand"
              >
                <Ionicons name="close" size={16} className="text-charcoal" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-1 pb-2">
                {unusedPromptQuestions.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => addPrompt(q)}
                    className="rounded-2xl p-3 active:opacity-70"
                  >
                    <Text className="text-sm font-medium text-charcoal">{q}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
