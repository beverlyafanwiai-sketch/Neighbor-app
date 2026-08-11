import { DISCOVER_USERS, USERS, type User } from '../data/mock';
import { useProfileStore } from '../store/useProfileStore';

export function mentionableUsers(): User[] {
  return [useProfileStore.getState().profile, ...USERS, ...DISCOVER_USERS];
}

function firstName(user: User) {
  return user.name.split(' ')[0];
}

export function findUserByMentionToken(token: string): User | undefined {
  const lower = token.toLowerCase();
  return mentionableUsers().find((u) => firstName(u).toLowerCase() === lower);
}

const MENTION_PATTERN = /@(\w+)/g;

export function findMentionedUsers(text: string): User[] {
  const seen = new Set<string>();
  const matches: User[] = [];
  for (const match of text.matchAll(MENTION_PATTERN)) {
    const user = findUserByMentionToken(match[1]);
    if (user && !seen.has(user.id)) {
      seen.add(user.id);
      matches.push(user);
    }
  }
  return matches;
}
