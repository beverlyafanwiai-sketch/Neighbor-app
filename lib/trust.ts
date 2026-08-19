import { EVENTS, GROUPS, ME, getUser, type User } from '../data/mock';

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function getMutualFriends(profileUser: User, viewerFriendIds: string[], viewerId: string): User[] {
  return (profileUser.friendIds ?? [])
    .filter((id) => id !== viewerId && id !== profileUser.id && viewerFriendIds.includes(id))
    .map((id) => getUser(id))
    .filter((u): u is User => Boolean(u));
}

export function getSharedTags(userTags: string[], viewerTags: string[]) {
  const mine = new Set(viewerTags);
  return userTags.filter((t) => mine.has(t));
}

export function getSharedGroups(profileUserId: string, viewerJoinedGroupIds: string[]) {
  return GROUPS.filter(
    (g) => g.memberIds.includes(profileUserId) && viewerJoinedGroupIds.includes(g.id)
  );
}

// Requires both the viewer and the profile user to have actually checked in
// (or hosted) — a shared RSVP isn't enough to claim you were there together.
export function getEventsAttendedTogether(profileUserId: string, myCheckIns: Record<string, boolean>) {
  return EVENTS.filter((e) => {
    if (e.status !== 'past') return false;
    const iAttended = e.hostId === ME.id || Boolean(myCheckIns[e.id]);
    if (!iAttended) return false;
    return e.hostId === profileUserId || (e.checkedInIds ?? []).includes(profileUserId);
  });
}

export function getEventsIAttended(myCheckIns: Record<string, boolean>) {
  return EVENTS.filter(
    (e) => e.status === 'past' && (e.hostId === ME.id || Boolean(myCheckIns[e.id]))
  );
}

export function formatOwnTrustLine(
  friendCount: number,
  groupCount: number,
  myCheckIns: Record<string, boolean>
) {
  const eventCount = getEventsIAttended(myCheckIns).length;
  return `${plural(friendCount, 'friend')} · ${plural(groupCount, 'group')} joined · attended ${plural(eventCount, 'event')}`;
}

export function formatMutualTrustLine(
  profileUser: User,
  viewerFriendIds: string[],
  viewerId: string,
  viewerJoinedGroupIds: string[],
  myCheckIns: Record<string, boolean>
) {
  const mutualFriends = getMutualFriends(profileUser, viewerFriendIds, viewerId);
  const sharedGroups = getSharedGroups(profileUser.id, viewerJoinedGroupIds);
  const eventsTogether = getEventsAttendedTogether(profileUser.id, myCheckIns);

  if (mutualFriends.length === 0 && sharedGroups.length === 0 && eventsTogether.length === 0) {
    return 'No mutual connections yet';
  }

  return `${plural(mutualFriends.length, 'mutual friend')} · ${plural(sharedGroups.length, 'shared group')} · attended ${plural(eventsTogether.length, 'event')} together`;
}
