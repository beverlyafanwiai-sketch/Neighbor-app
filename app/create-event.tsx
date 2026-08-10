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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const createEvent = useEventsStore((s) => s.createEvent);
  const toggleRsvp = useRsvpStore((s) => s.toggle);

  const [title, setTitle] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [spotsTotal, setSpotsTotal] = useState(8);

  const canSave = title.trim() && day.trim() && month.trim() && time.trim() && location.trim();

  const save = () => {
    if (!canSave) return;
    const id = createEvent({
      title: title.trim(),
      day: day.trim(),
      month: month.trim(),
      time: time.trim(),
      date: `${month.trim().toUpperCase()} ${day.trim()}`,
      location: location.trim(),
      description: description.trim() || 'No details yet — just show up.',
      spotsTotal,
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
          <Ionicons name="close" size={20} color="#3D3D3D" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Host an event</Text>
        <Pressable
          onPress={save}
          disabled={!canSave}
          className={`rounded-full px-4 py-2 ${canSave ? 'bg-terracotta' : 'bg-charcoal/10'}`}
        >
          <Text className={`text-sm font-semibold ${canSave ? 'text-cream' : 'text-charcoal/40'}`}>
            Create
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          <Text className="mt-2 text-sm text-charcoal/60">
            Small is good — a porch hangout for 6 beats a party for 60.
          </Text>

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
                  <Ionicons name="remove" size={18} color="#3D3D3D" />
                </Pressable>
                <Text className="w-8 text-center text-lg font-semibold text-charcoal">
                  {spotsTotal}
                </Text>
                <Pressable
                  onPress={() => setSpotsTotal((n) => Math.min(30, n + 1))}
                  className="h-10 w-10 items-center justify-center rounded-full bg-cream"
                >
                  <Ionicons name="add" size={18} color="#3D3D3D" />
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
                          spotsTotal === n ? 'text-cream' : 'text-charcoal/60'
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
