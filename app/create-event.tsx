import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import CoverPhotoPicker from '../components/CoverPhotoPicker';
import { EVENT_CATEGORIES, type EventCategory } from '../data/mock';
import { useEventsStore } from '../store/useEventsStore';
import { useRsvpStore } from '../store/useRsvpStore';

const SUGGESTED_CAPS = [6, 8, 10];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function CreateEvent() {
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const existing = useEventsStore((s) => (editId ? s.events.find((e) => e.id === editId) : undefined));
  const isEditing = Boolean(existing);
  const createEvent = useEventsStore((s) => s.createEvent);
  const updateEvent = useEventsStore((s) => s.updateEvent);
  const toggleRsvp = useRsvpStore((s) => s.toggle);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [day, setDay] = useState(existing?.day ?? '');
  const [month, setMonth] = useState(existing?.month ?? '');
  const [time, setTime] = useState(existing?.time ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [category, setCategory] = useState<EventCategory>(existing?.category ?? 'Social');
  const [spotsTotal, setSpotsTotal] = useState(existing?.spotsTotal ?? 8);
  const [coverImageUri, setCoverImageUri] = useState(existing?.coverImageUri);

  const canSave = title.trim() && day.trim() && month.trim() && time.trim() && location.trim();

  const save = () => {
    if (!canSave) return;
    if (existing) {
      updateEvent(existing.id, {
        title: title.trim(),
        day: day.trim(),
        month: month.trim(),
        time: time.trim(),
        date: `${month.trim().toUpperCase()} ${day.trim()}`,
        location: location.trim(),
        description: description.trim() || 'No details yet — just show up.',
        category,
        spotsTotal,
        coverImageUri,
      });
      router.replace(`/event/${existing.id}`);
      return;
    }
    const id = createEvent({
      title: title.trim(),
      day: day.trim(),
      month: month.trim(),
      time: time.trim(),
      date: `${month.trim().toUpperCase()} ${day.trim()}`,
      location: location.trim(),
      description: description.trim() || 'No details yet — just show up.',
      category,
      spotsTotal,
      coverImageUri,
    });
    toggleRsvp(id);
    router.replace(`/event/${id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="close" size={20} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">
          {isEditing ? 'Edit event' : 'Host an event'}
        </Text>
        <Pressable
          onPress={save}
          disabled={!canSave}
          className={`rounded-full px-4 py-2 ${canSave ? 'bg-terracotta' : 'bg-ink/10'}`}
        >
          <Text className={`text-sm font-semibold ${canSave ? 'text-paper' : 'text-charcoal/40'}`}>
            {isEditing ? 'Save' : 'Create'}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          <Text className="mt-2 text-sm text-charcoal/60">
            Small is good — a porch hangout for 6 beats a party for 60.
          </Text>

          <View className="mt-5">
            <CoverPhotoPicker imageUri={coverImageUri} onChange={setCoverImageUri} />
          </View>

          <View className="mt-5 gap-4">
            <View>
              <FieldLabel>Title</FieldLabel>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Porch potluck, trail walk, book swap..."
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FieldLabel>Day</FieldLabel>
                <TextInput
                  value={day}
                  onChangeText={setDay}
                  placeholder="22"
                  placeholderTextColor="#3D3D3D80"
                  className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
                />
              </View>
              <View className="flex-1">
                <FieldLabel>Month</FieldLabel>
                <TextInput
                  value={month}
                  onChangeText={setMonth}
                  placeholder="AUG"
                  placeholderTextColor="#3D3D3D80"
                  autoCapitalize="characters"
                  className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
                />
              </View>
              <View className="flex-1">
                <FieldLabel>Time</FieldLabel>
                <TextInput
                  value={time}
                  onChangeText={setTime}
                  placeholder="4:00 PM"
                  placeholderTextColor="#3D3D3D80"
                  className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
                />
              </View>
            </View>

            <View>
              <FieldLabel>Location</FieldLabel>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Your place, a park, a coffee shop..."
                placeholderTextColor="#3D3D3D80"
                className="rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Category</FieldLabel>
              <View className="flex-row flex-wrap gap-2">
                {EVENT_CATEGORIES.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(c)}
                    className={`rounded-full px-3.5 py-1.5 ${
                      category === c ? 'bg-terracotta' : 'bg-cream'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        category === c ? 'text-paper' : 'text-charcoal/60'
                      }`}
                    >
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <FieldLabel>Description</FieldLabel>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What should people expect?"
                placeholderTextColor="#3D3D3D80"
                multiline
                className="min-h-[80px] rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>Spots</FieldLabel>
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => setSpotsTotal((n) => Math.max(2, n - 1))}
                  className="h-10 w-10 items-center justify-center rounded-full bg-cream"
                >
                  <Ionicons name="remove" size={18} className="text-charcoal" />
                </Pressable>
                <Text className="w-8 text-center text-lg font-semibold text-charcoal">
                  {spotsTotal}
                </Text>
                <Pressable
                  onPress={() => setSpotsTotal((n) => Math.min(30, n + 1))}
                  className="h-10 w-10 items-center justify-center rounded-full bg-cream"
                >
                  <Ionicons name="add" size={18} className="text-charcoal" />
                </Pressable>
                <View className="ml-2 flex-row gap-2">
                  {SUGGESTED_CAPS.map((n) => (
                    <Pressable
                      key={n}
                      onPress={() => setSpotsTotal(n)}
                      className={`rounded-full px-3 py-1.5 ${
                        spotsTotal === n ? 'bg-terracotta' : 'bg-cream'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          spotsTotal === n ? 'text-paper' : 'text-charcoal/60'
                        }`}
                      >
                        {n}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
