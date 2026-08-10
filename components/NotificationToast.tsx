import { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getUser } from '../data/mock';
import { goToTarget, TYPE_ICON } from '../lib/notificationTargets';
import { useNotificationsStore } from '../store/useNotificationsStore';

const AUTO_DISMISS_MS = 4000;

export default function NotificationToast() {
  const toast = useNotificationsStore((s) => s.toast);
  const dismissToast = useNotificationsStore((s) => s.dismissToast);
  const markRead = useNotificationsStore((s) => s.markRead);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const actor = toast.actorId ? getUser(toast.actorId) : undefined;

  const press = () => {
    markRead(toast.id);
    goToTarget(toast.target);
    dismissToast();
  };

  return (
    <View className="absolute left-4 right-4" style={{ top: insets.top + 8 }} pointerEvents="box-none">
      <Pressable
        onPress={press}
        className="flex-row items-center gap-3 rounded-2xl bg-charcoal p-3.5 shadow-lg active:opacity-90"
      >
        {actor ? (
          <Image source={{ uri: actor.avatar }} className="h-10 w-10 rounded-full" />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-sage/20">
            <Ionicons name={TYPE_ICON[toast.type]} size={18} color="#81A684" />
          </View>
        )}
        <Text className="flex-1 text-sm font-medium text-cream" numberOfLines={2}>
          {toast.text}
        </Text>
        <Pressable
          onPress={dismissToast}
          className="h-6 w-6 items-center justify-center rounded-full bg-cream/15"
        >
          <Ionicons name="close" size={13} color="#F5F2E9" />
        </Pressable>
      </Pressable>
    </View>
  );
}
