import { Text } from 'react-native';
import { router } from 'expo-router';

import { ME } from '../data/mock';
import { findUserByMentionToken } from '../lib/mentions';

type Props = {
  text: string;
  className?: string;
  numberOfLines?: number;
  mentionClassName?: string;
};

function goToProfile(userId: string) {
  router.push(userId === ME.id ? '/(tabs)/profile' : `/profile/${userId}`);
}

export default function MentionText({
  text,
  className,
  numberOfLines,
  mentionClassName = 'font-semibold text-terracotta',
}: Props) {
  const parts = text.split(/(@\w+)/g);

  return (
    <Text className={className} numberOfLines={numberOfLines}>
      {parts.map((part, i) => {
        const match = part.match(/^@(\w+)$/);
        const user = match ? findUserByMentionToken(match[1]) : undefined;
        if (user) {
          return (
            <Text key={i} onPress={() => goToProfile(user.id)} className={mentionClassName}>
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}
