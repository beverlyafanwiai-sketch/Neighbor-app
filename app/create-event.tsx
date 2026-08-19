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
import { EVENT_CATEGORIES, type EventCategory, type EventRecurrence } from '../data/mock';
import { useEventsStore } from '../store/useEventsStore';
import { useGroupsStore } from '../store/useGroupsStore';
import { useRsvpStore } from '../store/useRsvpStore';

const SUGGESTED_CAPS = [6, 8, 10];

const REPEAT_OPTIONS: { value: EventRecurrence | undefined; label: string }[] = [
  { value: undefined, label: "Doesn't repeat" },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function CreateEvent() {
  const { id: editId, groupId, duplicateId, draftId } = useLocalSearchParams<{
    id?: string;
    groupId?: string;
    duplicateId?: string;
    draftId?: string;
  }>();
  const existing = useEventsStore((s) => (editId ? s.events.find((e) => e.id === editId) : undefined));
  const duplicateSource = useEventsStore((s) =>
    duplicateId ? s.events.find((e) => e.id === duplicateId) : undefined
  );
  const existingDraft = useEventsStore((s) =>
    draftId ? s.drafts.find((d) => d.id === draftId) : undefined
  );
  const hostGroup = useGroupsStore((s) =>
    s.groups.find((g) => g.id === (groupId ?? existingDraft?.groupId))
  );
  const isEditing = Boolean(existing);
  const isDuplicating = Boolean(duplicateSource) && !isEditing;
  const createEvent = useEventsStore((s) => s.createEvent);
  const updateEvent = useEventsStore((s) => s.updateEvent);
  const saveDraft = useEventsStore((s) => s.saveDraft);
  const deleteDraft = useEventsStore((s) => s.deleteDraft);
  const toggleRsvp = useRsvpStore((s) => s.toggle);

  const [title, setTitle] = useState(existing?.title ?? duplicateSource?.title ?? existingDraft?.title ?? '');
  const [day, setDay] = useState(existing?.day ?? existingDraft?.day ?? '');
  const [month, setMonth] = useState(existing?.month ?? existingDraft?.month ?? '');
  const [time, setTime] = useState(existing?.time ?? duplicateSource?.time ?? existingDraft?.time ?? '');
  const [location, setLocation] = useState(
    existing?.location ?? duplicateSource?.location ?? existingDraft?.location ?? ''
  );
  const [description, setDescription] = useState(
    existing?.description ?? duplicateSource?.description ?? existingDraft?.description ?? ''
  );
  const [category, setCategory] = useState<EventCategory>(
    existing?.category ?? duplicateSource?.category ?? existingDraft?.category ?? 'Social'
  );
  const [recurrence, setRecurrence] = useState<EventRecurrence | undefined>(
    existing?.recurrence ?? duplicateSource?.recurrence ?? existingDraft?.recurrence
  );
  const [spotsTotal, setSpotsTotal] = useState(
    existing?.spotsTotal ?? duplicateSource?.spotsTotal ?? existingDraft?.spotsTotal ?? 8
  );
  const [coverImageUri, setCoverImageUri] = useState(
    existing?.coverImageUri ?? duplicateSource?.coverImageUri ?? existingDraft?.coverImageUri
  );
  const [confirmingClose, setConfirmingClose] = useState(false);

  const canSave = title.trim() && day.trim() && month.trim() && time.trim() && location.trim();
  const hasUnsavedContent =
    !isEditing &&
    Boolean(
      title.trim() || day.trim() || month.trim() || location.trim() || description.trim()
    );

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
        recurrence,
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
      recurrence,
      spotsTotal,
      coverImageUri,
      hostGroupId: hostGroup?.id,
    });
    toggleRsvp(id);
    if (draftId) deleteDraft(draftId);
    router.replace(`/event/${id}`);
  };

  const close = () => {
    if (isEditing || !hasUnsavedContent) {
      router.back();
      return;
    }
    setConfirmingClose(true);
  };

  const discardAndClose = () => {
    if (draftId) deleteDraft(draftId);
    router.back();
  };

  const saveDraftAndClose = () => {
    saveDraft({
      id: draftId,
      title: title.trim(),
      day: day.trim(),
      month: month.trim(),
      time: time.trim(),
      location: location.trim(),
      description: description.trim(),
      category,
      recurrence,
      spotsTotal,
      coverImageUri,
      groupId: hostGroup?.id,
    });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={close}
          accessibilityLabel="Close"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="close" size={20} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">
          {isEditing
            ? 'Edit event'
            : isDuplicating
              ? 'Duplicate event'
              : hostGroup
                ? `Host for ${hostGroup.name}`
                : 'Host an event'}
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

      {confirmingClose && (
        <View className="gap-3 bg-terracotta/10 px-4 py-3">
          <Text className="text-sm text-charcoal">Save this as a draft, or discard it?</Text>
          <View className="flex-row justify-end gap-4">
            <Pressable onPress={() => setConfirmingClose(false)}>
              <Text className="text-sm font-medium text-charcoal/60">Keep editing</Text>
            </Pressable>
            <Pressable onPress={discardAndClose}>
              <Text className="text-sm font-semibold text-terracotta">Discard</Text>
            </Pressable>
            <Pressable onPress={saveDraftAndClose}>
              <Text className="text-sm font-semibold text-sage">Save draft</Text>
            </Pressable>
          </View>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          <Text className="mt-2 text-sm text-charcoal/60">
            Small is good — a porch hangout for 6 beats a party for 60.
          </Text>

          {hostGroup && (
            <View className="mt-3 flex-row items-center gap-2 rounded-2xl bg-sage/15 p-3">
              <Ionicons name="people" size={16} className="text-sage" />
              <Text className="flex-1 text-xs text-sage">
                Hosting for {hostGroup.name} — members will get first notice.
              </Text>
            </View>
          )}

          {isDuplicating && (
            <View className="mt-3 flex-row items-center gap-2 rounded-2xl bg-gold/15 p-3">
              <Ionicons name="copy-outline" size={16} className="text-gold" />
              <Text className="flex-1 text-xs text-charcoal/70">
                Details copied from "{duplicateSource!.title}" — pick a new day and month below.
              </Text>
            </View>
          )}

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
                    accessibilityRole="radio"
                    accessibilityState={{ checked: category === c }}
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
              <FieldLabel>Repeats</FieldLabel>
              <View className="flex-row flex-wrap gap-2">
                {REPEAT_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.label}
                    onPress={() => setRecurrence(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: recurrence === opt.value }}
                    className={`rounded-full px-3.5 py-1.5 ${
                      recurrence === opt.value ? 'bg-terracotta' : 'bg-cream'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        recurrence === opt.value ? 'text-paper' : 'text-charcoal/60'
                      }`}
                    >
                      {opt.label}
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
                  accessibilityLabel="Decrease spots"
                  accessibilityRole="button"
                  className="h-10 w-10 items-center justify-center rounded-full bg-cream"
                >
                  <Ionicons name="remove" size={18} className="text-charcoal" />
                </Pressable>
                <Text className="w-8 text-center text-lg font-semibold text-charcoal">
                  {spotsTotal}
                </Text>
                <Pressable
                  onPress={() => setSpotsTotal((n) => Math.min(30, n + 1))}
                  accessibilityLabel="Increase spots"
                  accessibilityRole="button"
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
