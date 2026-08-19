import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { DISCOVER_USERS, USERS, type User } from '../data/mock';
import { useFriendsStore } from '../store/useFriendsStore';

const ALL_PEOPLE: User[] = [...USERS, ...DISCOVER_USERS];

export default function FriendRequests() {
  const statuses = useFriendsStore((s) => s.statuses);
  const requestNotes = useFriendsStore((s) => s.requestNotes);
  const acceptRequest = useFriendsStore((s) => s.acceptRequest);
  const declineRequest = useFriendsStore((s) => s.declineRequest);
  const cancelRequest = useFriendsStore((s) => s.cancelRequest);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [declineNoteDraft, setDeclineNoteDraft] = useState('');

  const incoming = ALL_PEOPLE.filter((u) => statuses[u.id] === 'pending_in');
  const sent = ALL_PEOPLE.filter((u) => statuses[u.id] === 'pending_out');

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
        <Text className="text-base font-bold text-charcoal">Friend Requests</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mb-3 mt-2 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Requests ({incoming.length})
        </Text>
        {incoming.length === 0 ? (
          <Text className="text-sm text-charcoal/50">No pending requests.</Text>
        ) : (
          <View className="gap-3">
            {incoming.map((u) => (
              <View key={u.id} className="rounded-2xl bg-cream p-4">
                <Pressable
                  onPress={() => router.push(`/profile/${u.id}`)}
                  className="flex-row items-center gap-3 active:opacity-70"
                >
                  <Image source={{ uri: u.avatar }} className="h-11 w-11 rounded-full" />
                  <View className="flex-1">
                    <Text className="font-semibold text-charcoal">{u.name}</Text>
                    <Text className="text-xs text-charcoal/60" numberOfLines={1}>
                      {u.tagline}
                    </Text>
                  </View>
                </Pressable>
                {requestNotes[u.id] && (
                  <Text className="mt-2 text-sm italic text-charcoal/60">
                    "{requestNotes[u.id]}"
                  </Text>
                )}
                {decliningId === u.id ? (
                  <View className="mt-3 gap-2">
                    <TextInput
                      value={declineNoteDraft}
                      onChangeText={setDeclineNoteDraft}
                      placeholder="Optional note, e.g. maybe another time"
                      placeholderTextColor="#3D3D3D80"
                      autoFocus
                      className="rounded-xl bg-sand px-3 py-2 text-sm text-charcoal"
                    />
                    <View className="flex-row justify-end gap-4">
                      <Pressable
                        onPress={() => {
                          setDecliningId(null);
                          setDeclineNoteDraft('');
                        }}
                      >
                        <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          declineRequest(u.id, declineNoteDraft);
                          setDecliningId(null);
                          setDeclineNoteDraft('');
                        }}
                      >
                        <Text className="text-sm font-semibold text-terracotta">Decline</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View className="mt-3 flex-row gap-2">
                    <Pressable
                      onPress={() => acceptRequest(u.id)}
                      className="rounded-full bg-terracotta px-4 py-1.5"
                    >
                      <Text className="text-xs font-semibold text-paper">Accept</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setDecliningId(u.id)}
                      className="rounded-full bg-sand px-4 py-1.5"
                    >
                      <Text className="text-xs font-semibold text-charcoal">Decline</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Sent ({sent.length})
        </Text>
        {sent.length === 0 ? (
          <Text className="text-sm text-charcoal/50">You haven't sent any requests.</Text>
        ) : (
          <View className="gap-3">
            {sent.map((u) => (
              <View key={u.id} className="flex-row items-center gap-3 rounded-2xl bg-cream p-4">
                <Pressable
                  onPress={() => router.push(`/profile/${u.id}`)}
                  className="flex-1 flex-row items-center gap-3 active:opacity-70"
                >
                  <Image source={{ uri: u.avatar }} className="h-11 w-11 rounded-full" />
                  <View className="flex-1">
                    <Text className="font-semibold text-charcoal">{u.name}</Text>
                    <Text className="text-xs text-charcoal/60">Waiting for a response</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => cancelRequest(u.id)}
                  className="rounded-full bg-sand px-4 py-1.5"
                >
                  <Text className="text-xs font-semibold text-charcoal">Cancel</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {incoming.length === 0 && sent.length === 0 && (
          <EmptyState
            icon="person-add-outline"
            iconColorClassName="text-charcoal/50"
            title="No friend requests"
            subtitle="Requests you send or receive will show up here."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
