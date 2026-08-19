import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import { DISCOVER_USERS, type Tone } from '../data/mock';
import { getSharedTags } from '../lib/trust';
import { useBlockedStore } from '../store/useBlockedStore';
import { useDismissedDiscoverStore } from '../store/useDismissedDiscoverStore';
import { FRIEND_LABEL, useFriendsStore } from '../store/useFriendsStore';
import { getEffectiveMemberCount, memberCountLabel, useGroupsStore } from '../store/useGroupsStore';
import { useMutedStore } from '../store/useMutedStore';
import { useProfileStore } from '../store/useProfileStore';
import { useSavedDiscoverSearchesStore } from '../store/useSavedDiscoverSearchesStore';
import { useSavedGroupsStore } from '../store/useSavedGroupsStore';

const MODES = ['People', 'Groups'] as const;
type Mode = (typeof MODES)[number];

const PEOPLE_SORTS = ['Suggested', 'A-Z', 'New neighbors'] as const;
type PeopleSort = (typeof PEOPLE_SORTS)[number];

const GROUP_SORTS = ['Suggested', 'A-Z', 'Most members'] as const;
type GroupSort = (typeof GROUP_SORTS)[number];

const TONE_STYLE: Record<Tone, { bg: string; text: string }> = {
  Casual: { bg: 'bg-sage/20', text: 'text-sage' },
  Structured: { bg: 'bg-terracotta/15', text: 'text-terracotta' },
  'Activity-focused': { bg: 'bg-gold/20', text: 'text-gold' },
};

export default function Discover() {
  const [mode, setMode] = useState<Mode>('People');
  const [query, setQuery] = useState('');
  const [peopleSort, setPeopleSort] = useState<PeopleSort>('Suggested');
  const [groupSort, setGroupSort] = useState<GroupSort>('Suggested');
  const allGroups = useGroupsStore((s) => s.groups);
  const joinedMap = useGroupsStore((s) => s.joined);
  const toggleJoin = useGroupsStore((s) => s.toggle);
  const savedGroupIds = useSavedGroupsStore((s) => s.savedIds);
  const toggleSaveGroup = useSavedGroupsStore((s) => s.toggleSave);
  const joinByInviteCode = useGroupsStore((s) => s.joinByInviteCode);
  const [redeemingCode, setRedeemingCode] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteError, setInviteError] = useState(false);
  const friendStatuses = useFriendsStore((s) => s.statuses);
  const respondFriend = useFriendsStore((s) => s.respond);
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const mutedIds = useMutedStore((s) => s.mutedIds);
  const toggleBlocked = useBlockedStore((s) => s.toggle);
  const [confirmingBlockId, setConfirmingBlockId] = useState<string | null>(null);
  const dismissedIds = useDismissedDiscoverStore((s) => s.dismissedIds);
  const dismiss = useDismissedDiscoverStore((s) => s.dismiss);
  const dismissedGroupIds = useDismissedDiscoverStore((s) => s.dismissedGroupIds);
  const dismissGroup = useDismissedDiscoverStore((s) => s.dismissGroup);
  const [menuForId, setMenuForId] = useState<string | null>(null);
  const myTags = useProfileStore((s) => s.profile.tags);
  const savedSearches = useSavedDiscoverSearchesStore((s) => s.searches);
  const saveSearch = useSavedDiscoverSearchesStore((s) => s.saveSearch);
  const renameSearch = useSavedDiscoverSearchesStore((s) => s.renameSearch);
  const deleteSearch = useSavedDiscoverSearchesStore((s) => s.deleteSearch);
  const [savingSearch, setSavingSearch] = useState(false);
  const [searchNameDraft, setSearchNameDraft] = useState('');
  const [renamingSearchId, setRenamingSearchId] = useState<string | null>(null);

  const isSearchModified =
    query.trim().length > 0 || peopleSort !== 'Suggested' || groupSort !== 'Suggested';

  const applySearch = (search: (typeof savedSearches)[number]) => {
    setMode(search.mode as Mode);
    setQuery(search.query);
    setPeopleSort(search.peopleSort as PeopleSort);
    setGroupSort(search.groupSort as GroupSort);
  };

  const discoverGroups = allGroups.filter((g) => !joinedMap[g.id] && !dismissedGroupIds[g.id]);
  const discoverableUsers = DISCOVER_USERS.filter(
    (u) => !blockedIds[u.id] && !mutedIds[u.id] && !dismissedIds[u.id]
  );

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q
      ? discoverableUsers
      : discoverableUsers.filter(
          (u) => u.name.toLowerCase().includes(q) || u.tags.some((t) => t.includes(q))
        );
    if (peopleSort === 'Suggested') return base;
    const sorted = [...base];
    if (peopleSort === 'A-Z') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (peopleSort === 'New neighbors') {
      sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
    }
    return sorted;
  }, [query, discoverableUsers, peopleSort]);

  const redeemCode = () => {
    const groupId = joinByInviteCode(inviteCodeInput);
    if (!groupId) {
      setInviteError(true);
      return;
    }
    setRedeemingCode(false);
    setInviteCodeInput('');
    setInviteError(false);
    router.push(`/group/${groupId}`);
  };

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q
      ? discoverGroups
      : discoverGroups.filter(
          (g) => g.name.toLowerCase().includes(q) || g.tag?.toLowerCase().includes(q)
        );
    if (groupSort === 'Suggested') return base;
    const sorted = [...base];
    if (groupSort === 'A-Z') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (groupSort === 'Most members') {
      sorted.sort(
        (a, b) => getEffectiveMemberCount(b.id, false) - getEffectiveMemberCount(a.id, false)
      );
    }
    return sorted;
  }, [query, discoverGroups, groupSort]);

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
        <Text className="text-xl font-bold text-charcoal">Discover</Text>
      </View>

      <View className="px-5 pb-3">
        <View className="flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} className="text-charcoal/50" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={mode === 'People' ? 'Search by name or interest...' : 'Search groups...'}
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
          {isSearchModified && (
            <Pressable
              onPress={() => {
                setSearchNameDraft('');
                setSavingSearch(true);
              }}
              className="ml-1 h-7 w-7 items-center justify-center"
            >
              <Ionicons name="bookmark-outline" size={17} className="text-charcoal/50" />
            </Pressable>
          )}
        </View>
        {(savingSearch || renamingSearchId) && (
          <View className="mt-2 flex-row items-center gap-2 rounded-full bg-cream px-4 py-2">
            <TextInput
              value={searchNameDraft}
              onChangeText={setSearchNameDraft}
              placeholder={renamingSearchId ? 'Rename search...' : 'Name this search...'}
              placeholderTextColor="#3D3D3D80"
              autoFocus
              className="flex-1 text-sm text-charcoal"
            />
            <Pressable
              onPress={() => {
                setSavingSearch(false);
                setRenamingSearchId(null);
              }}
            >
              <Text className="text-xs font-medium text-charcoal/50">Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!searchNameDraft.trim()}
              onPress={() => {
                if (renamingSearchId) {
                  renameSearch(renamingSearchId, searchNameDraft);
                } else {
                  saveSearch({
                    name: searchNameDraft.trim(),
                    mode,
                    query,
                    peopleSort,
                    groupSort,
                  });
                }
                setSavingSearch(false);
                setRenamingSearchId(null);
              }}
            >
              <Text
                className={`text-xs font-semibold ${
                  searchNameDraft.trim() ? 'text-terracotta' : 'text-charcoal/30'
                }`}
              >
                Save
              </Text>
            </Pressable>
          </View>
        )}
        {savedSearches.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="mt-2 gap-2"
          >
            {savedSearches.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => applySearch(s)}
                className="flex-row items-center gap-1.5 rounded-full bg-cream px-3 py-1.5"
              >
                <Ionicons name="bookmark" size={11} className="text-terracotta" />
                <Text className="text-xs font-medium text-charcoal">{s.name}</Text>
                <Pressable
                  onPress={(evt) => {
                    evt.stopPropagation();
                    setSearchNameDraft(s.name);
                    setRenamingSearchId(s.id);
                  }}
                  className="ml-0.5"
                >
                  <Ionicons name="pencil" size={11} className="text-charcoal/40" />
                </Pressable>
                <Pressable
                  onPress={(evt) => {
                    evt.stopPropagation();
                    deleteSearch(s.id);
                  }}
                  className="ml-0.5"
                >
                  <Ionicons name="close" size={12} className="text-charcoal/40" />
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <View className="flex-row gap-2 px-5 pb-3">
        {MODES.map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            className={`rounded-full px-4 py-2 ${mode === m ? 'bg-ink' : 'bg-cream'}`}
          >
            <Text className={`text-sm font-medium ${mode === m ? 'text-paper' : 'text-charcoal/60'}`}>
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row items-center gap-2 px-5 pb-3">
        <Ionicons name="swap-vertical-outline" size={14} className="text-charcoal/40" />
        {(mode === 'People' ? PEOPLE_SORTS : GROUP_SORTS).map((s) => {
          const active = mode === 'People' ? peopleSort === s : groupSort === s;
          return (
            <Pressable
              key={s}
              onPress={() => (mode === 'People' ? setPeopleSort(s as PeopleSort) : setGroupSort(s as GroupSort))}
              className={`rounded-full px-3 py-1.5 ${active ? 'bg-sage/20' : 'bg-cream'}`}
            >
              <Text className={`text-xs font-medium ${active ? 'text-sage' : 'text-charcoal/60'}`}>
                {s}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        {mode === 'People' && (
          <View className="gap-3">
            {people.map((p) => {
              const shared = getSharedTags(p.tags, myTags);
              const status = friendStatuses[p.id] ?? 'none';

              if (confirmingBlockId === p.id) {
                return (
                  <View key={p.id} className="gap-2 rounded-2xl bg-terracotta/10 p-4">
                    <Text className="text-sm text-charcoal">
                      Block {p.name}? You won't see each other on the app anymore.
                    </Text>
                    <View className="flex-row justify-end gap-4">
                      <Pressable onPress={() => setConfirmingBlockId(null)}>
                        <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          toggleBlocked(p.id);
                          setConfirmingBlockId(null);
                        }}
                      >
                        <Text className="text-sm font-semibold text-terracotta">Block</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }

              if (menuForId === p.id) {
                return (
                  <View key={p.id} className="gap-1 rounded-2xl bg-cream p-2">
                    <Pressable
                      onPress={() => {
                        dismiss(p.id);
                        setMenuForId(null);
                      }}
                      className="flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:bg-sand"
                    >
                      <Ionicons name="eye-off-outline" size={17} className="text-charcoal" />
                      <Text className="text-sm font-medium text-charcoal">
                        Not interested — hide from Discover
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setMenuForId(null);
                        setConfirmingBlockId(p.id);
                      }}
                      className="flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:bg-sand"
                    >
                      <Ionicons name="ban-outline" size={17} className="text-terracotta" />
                      <Text className="text-sm font-medium text-terracotta">Block</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setMenuForId(null)}
                      className="rounded-xl px-3 py-2.5 active:bg-sand"
                    >
                      <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                    </Pressable>
                  </View>
                );
              }

              return (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/profile/${p.id}`)}
                  className="rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  <View className="flex-row items-center gap-3">
                    <Image source={{ uri: p.avatar }} className="h-12 w-12 rounded-full" />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="font-semibold text-charcoal">{p.name}</Text>
                        {p.isNew && (
                          <View className="rounded-full bg-gold/20 px-2 py-0.5">
                            <Text className="text-[10px] font-bold text-gold">NEW</Text>
                          </View>
                        )}
                      </View>
                      <Text className="mt-0.5 text-xs text-charcoal/60" numberOfLines={1}>
                        {p.tagline}
                      </Text>
                    </View>
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        respondFriend(p.id);
                      }}
                      className={`rounded-full px-4 py-2 ${status === 'none' ? 'bg-gold' : 'bg-sand'}`}
                    >
                      <Text className="text-xs font-semibold text-charcoal">
                        {FRIEND_LABEL[status]}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={(evt) => {
                        evt.stopPropagation();
                        setMenuForId(p.id);
                      }}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Ionicons name="ellipsis-horizontal" size={16} className="text-charcoal/40" />
                    </Pressable>
                  </View>

                  {shared.length > 0 && (
                    <View className="mt-3 flex-row flex-wrap items-center gap-1.5 border-t border-charcoal/10 pt-3">
                      <Ionicons name="sparkles-outline" size={13} className="text-sage" />
                      <Text className="text-xs text-sage">
                        Shares {shared.length === 1 ? 'an interest' : `${shared.length} interests`}
                        : {shared.join(', ')}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
            {people.length === 0 && (
              <EmptyState
                icon="search-outline"
                title="No one matches that search yet"
                subtitle="Try a different name or interest."
              />
            )}
          </View>
        )}

        {mode === 'Groups' && (
          <View className="gap-3">
            {redeemingCode ? (
              <View className="gap-2 rounded-2xl bg-cream p-4">
                <Text className="text-sm font-semibold text-charcoal">Enter invite code</Text>
                <TextInput
                  value={inviteCodeInput}
                  onChangeText={(v) => {
                    setInviteCodeInput(v);
                    setInviteError(false);
                  }}
                  placeholder="e.g. HK92QP"
                  placeholderTextColor="#3D3D3D80"
                  autoCapitalize="characters"
                  className="rounded-xl bg-sand px-3 py-2.5 text-base tracking-widest text-charcoal"
                />
                {inviteError && (
                  <Text className="text-xs text-terracotta">
                    That code doesn't match a group — double check and try again.
                  </Text>
                )}
                <View className="flex-row justify-end gap-4 pt-1">
                  <Pressable
                    onPress={() => {
                      setRedeemingCode(false);
                      setInviteCodeInput('');
                      setInviteError(false);
                    }}
                  >
                    <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                  </Pressable>
                  <Pressable onPress={redeemCode}>
                    <Text className="text-sm font-semibold text-terracotta">Join</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setRedeemingCode(true)}
                className="flex-row items-center gap-2 rounded-2xl bg-cream p-4 active:opacity-80"
              >
                <Ionicons name="key-outline" size={18} className="text-charcoal" />
                <Text className="text-sm font-medium text-charcoal">Have an invite code?</Text>
              </Pressable>
            )}
            {groups.map((g) => {
              const toneStyle = TONE_STYLE[g.tone];
              return (
                <Pressable
                  key={g.id}
                  onPress={() => router.push(`/group/${g.id}`)}
                  className="flex-row items-center gap-3 rounded-2xl bg-cream p-4 active:opacity-80"
                >
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-sage">
                    <Text className="text-lg font-bold text-paper">{g.name.charAt(0)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-charcoal">{g.name}</Text>
                    <View className="mt-1.5 flex-row items-center gap-2">
                      <Text className="text-xs text-charcoal/60">
                        {memberCountLabel(g.id, false)}
                      </Text>
                      <View className={`rounded-full px-2.5 py-1 ${toneStyle.bg}`}>
                        <Text className={`text-xs font-semibold ${toneStyle.text}`}>{g.tone}</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      toggleSaveGroup(g.id);
                    }}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons
                      name={savedGroupIds[g.id] ? 'bookmark' : 'bookmark-outline'}
                      size={16}
                      className={savedGroupIds[g.id] ? 'text-gold' : 'text-charcoal/40'}
                    />
                  </Pressable>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      toggleJoin(g.id);
                    }}
                    className="rounded-full bg-ink px-4 py-2"
                  >
                    <Text className="text-xs font-semibold text-paper">Join</Text>
                  </Pressable>
                  <Pressable
                    onPress={(evt) => {
                      evt.stopPropagation();
                      dismissGroup(g.id);
                    }}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons name="close" size={16} className="text-charcoal/40" />
                  </Pressable>
                </Pressable>
              );
            })}
            {groups.length === 0 && (
              <EmptyState
                icon="search-outline"
                title="No groups match that search yet"
                subtitle="Try a different search term."
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
