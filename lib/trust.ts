import { EVENTS, GROUPS, getUser, type User } from '../data/mock';

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function getMutualFriends(profileUser: User, viewerFriendIds: string[], viewerId: string): User[] {
  return (profileUser.friendIds ?? [])
    .filter((id) => id !== viewerId && id !== profileUser.id && viewerFriendIds.includes(id))
    .map((id) => getUser(id))
    .filter((u): u is User => Boolean(u));
}

export function getSharedGroups(profileUserId: string, viewerJoinedGroupIds: string[]) {
  return GROUPS.filter(
    (g) => g.memberIds.includes(profileUserId) && viewerJoinedGroupIds.includes(g.id)
  );
}

export function getEventsAttendedTogether(profileUserId: string) {
  return EVENTS.filter(
    (e) =>
      e.status === 'past' &&
      (e.metIds?.length ?? 0) > 0 &&
      (e.attendeeIds.includes(profileUserId) || e.hostId === profileUserId)
  );
}

export function getEventsIAttended() {
  return EVENTS.filter((e) => e.status === 'past' && (e.metIds?.length ?? 0) > 0);
}

export function formatOwnTrustLine(friendCount: number, groupCount: number) {
  const eventCount = getEventsIAttended().length;
  return `${plural(friendCount, 'friend')} · ${plural(groupCount, 'group')} joined · attended ${plural(eventCount, 'event')}`;
}

export function formatMutualTrustLine(
  profileUser: User,
  viewerFriendIds: string[],
  viewerId: string,
  viewerJoinedGroupIds: string[]
) {
  const mutualFriends = getMutualFriends(profileUser, viewerFriendIds, viewerId);
  const sharedGroups = getSharedGroups(profileUser.id, viewerJoinedGroupIds);
  const eventsTogether = getEventsAttendedTogether(profileUser.id);

  if (mutualFriends.length === 0 && sharedGroups.length === 0 && eventsTogether.length === 0) {
    return 'No mutual connections yet';
  }

  return `${plural(mutualFriends.length, 'mutual friend')} · ${plural(sharedGroups.length, 'shared group')} · attended ${plural(eventsTogether.length, 'event')} together`;
}
