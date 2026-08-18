import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import MentionTextInput from '../components/MentionTextInput';
import { ALERT_CATEGORIES, type AlertCategoryValue } from '../data/mock';
import { useAlertsStore } from '../store/useAlertsStore';

const DURATION_OPTIONS: { hours: number; label: string }[] = [
  { hours: 6, label: '6 hours' },
  { hours: 24, label: '24 hours' },
  { hours: 72, label: '3 days' },
];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
      {children}
    </Text>
  );
}

export default function CreateAlert() {
  const { editId, duplicateId, draftId } = useLocalSearchParams<{
    editId?: string;
    duplicateId?: string;
    draftId?: string;
  }>();
  const postAlert = useAlertsStore((s) => s.postAlert);
  const updateAlert = useAlertsStore((s) => s.updateAlert);
  const existing = useAlertsStore((s) => (editId ? s.alerts.find((a) => a.id === editId) : undefined));
  const duplicateSource = useAlertsStore((s) =>
    duplicateId ? s.alerts.find((a) => a.id === duplicateId) : undefined
  );
  const isEditing = Boolean(existing);
  const isDuplicating = Boolean(duplicateSource) && !isEditing;
  const existingDraft = useAlertsStore((s) =>
    draftId ? s.drafts.find((d) => d.id === draftId) : undefined
  );
  const saveDraft = useAlertsStore((s) => s.saveDraft);
  const deleteDraft = useAlertsStore((s) => s.deleteDraft);

  const [category, setCategory] = useState<AlertCategoryValue>(
    existing?.category ?? duplicateSource?.category ?? existingDraft?.category ?? 'lost-pet'
  );
  const [text, setText] = useState(existing?.text ?? duplicateSource?.text ?? existingDraft?.text ?? '');
  const [durationHours, setDurationHours] = useState(existingDraft?.durationHours ?? 24);
  const [confirmingClose, setConfirmingClose] = useState(false);

  const canPost = text.trim().length > 0;
  const hasUnsavedContent = !isEditing && text.trim().length > 0;

  const save = () => {
    if (!canPost) return;
    if (existing) {
      updateAlert(existing.id, { category, text: text.trim(), durationHours });
    } else {
      postAlert({ category, text: text.trim(), durationHours });
    }
    if (draftId) deleteDraft(draftId);
    router.replace('/alerts');
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
    saveDraft({ id: draftId, category, text: text.trim(), durationHours });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={close}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="close" size={20} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">
          {isEditing ? 'Edit alert' : isDuplicating ? 'Duplicate alert' : 'Post an alert'}
        </Text>
        <Pressable
          onPress={save}
          disabled={!canPost}
          className={`rounded-full px-4 py-2 ${canPost ? 'bg-terracotta' : 'bg-ink/10'}`}
        >
          <Text className={`text-sm font-semibold ${canPost ? 'text-paper' : 'text-charcoal/40'}`}>
            {isEditing ? 'Save' : 'Post'}
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
          {isDuplicating && (
            <View className="mb-2 mt-2 flex-row items-center gap-2 rounded-2xl bg-gold/15 p-3">
              <Ionicons name="copy-outline" size={16} className="text-gold" />
              <Text className="flex-1 text-xs text-charcoal/70">
                Details copied from your earlier alert — give it a fresh look if needed.
              </Text>
            </View>
          )}
          <Text className="mt-2 text-sm text-charcoal/60">
            For time-sensitive stuff — this'll disappear on its own once it expires.
          </Text>

          <View className="mt-5 gap-4">
            <View>
              <FieldLabel>Category</FieldLabel>
              <View className="flex-row flex-wrap gap-2">
                {ALERT_CATEGORIES.map((c) => (
                  <Pressable
                    key={c.value}
                    onPress={() => setCategory(c.value)}
                    className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5 ${
                      category === c.value ? 'bg-terracotta' : 'bg-cream'
                    }`}
                  >
                    <Text style={{ fontSize: 14 }}>{c.emoji}</Text>
                    <Text
                      className={`text-xs font-medium ${
                        category === c.value ? 'text-paper' : 'text-charcoal/60'
                      }`}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <FieldLabel>What's going on?</FieldLabel>
              <MentionTextInput
                value={text}
                onChangeText={setText}
                placeholder="Lost dog near 5th & Elm — try @ to mention someone"
                multiline
                autoFocus
                className="min-h-[90px] rounded-2xl bg-cream px-4 py-3 text-base text-charcoal"
              />
            </View>

            <View>
              <FieldLabel>{isEditing ? 'Renew for' : 'Expires in'}</FieldLabel>
              <View className="flex-row gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.hours}
                    onPress={() => setDurationHours(opt.hours)}
                    className={`rounded-full px-3.5 py-1.5 ${
                      durationHours === opt.hours ? 'bg-terracotta' : 'bg-cream'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        durationHours === opt.hours ? 'text-paper' : 'text-charcoal/60'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
