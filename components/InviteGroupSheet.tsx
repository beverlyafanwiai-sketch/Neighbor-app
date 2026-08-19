import { useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

type Props = {
  groupName: string;
  code: string;
  onClose: () => void;
  isAdmin?: boolean;
  onRegenerate?: () => void;
};

export default function InviteGroupSheet({ groupName, code, onClose, isAdmin, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const [confirmingRegenerate, setConfirmingRegenerate] = useState(false);
  const link = `https://neighbor.app/invite/${code}`;

  const copyLink = async () => {
    try {
      await Clipboard.setStringAsync(link);
    } catch {
      // Clipboard access can fail (unsupported browser, no permission) -- the
      // sheet still shows the code so the user can share it manually.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const shareNative = async () => {
    try {
      await Share.share({ message: `Join ${groupName} on Neighbor — ${link}` });
    } catch {
      // Share.share rejects when the platform has no share target (most
      // desktop browsers) -- Copy link above is the reliable fallback.
    }
  };

  return (
    <View className="absolute inset-0 items-center justify-end bg-ink/40">
      <Pressable className="absolute inset-0" onPress={onClose} />
      <View className="w-full gap-3 rounded-t-3xl bg-cream p-5 pb-8">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-charcoal">Invite to {groupName}</Text>
          <Pressable
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
            className="h-8 w-8 items-center justify-center rounded-full bg-sand"
          >
            <Ionicons name="close" size={16} className="text-charcoal" />
          </Pressable>
        </View>

        <View className="items-center rounded-2xl bg-sand py-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
            Invite code
          </Text>
          <Text className="mt-1 text-2xl font-bold tracking-[4px] text-terracotta">{code}</Text>
        </View>

        <Pressable
          onPress={copyLink}
          className="mt-1 flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
        >
          <Ionicons
            name={copied ? 'checkmark-circle' : 'link-outline'}
            size={20}
            className={copied ? 'text-sage' : 'text-charcoal'}
          />
          <Text className={`text-sm font-medium ${copied ? 'text-sage' : 'text-charcoal'}`}>
            {copied ? 'Link copied!' : 'Copy invite link'}
          </Text>
        </Pressable>

        <Pressable
          onPress={shareNative}
          className="flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
        >
          <Ionicons name="arrow-redo-outline" size={20} className="text-charcoal" />
          <Text className="text-sm font-medium text-charcoal">Share via...</Text>
        </Pressable>

        {isAdmin && onRegenerate && (
          confirmingRegenerate ? (
            <View className="gap-2 rounded-2xl bg-terracotta/10 p-4">
              <Text className="text-sm text-charcoal">
                Get a new code? The old one will stop working.
              </Text>
              <View className="flex-row justify-end gap-4">
                <Pressable onPress={() => setConfirmingRegenerate(false)}>
                  <Text className="text-sm font-medium text-charcoal/60">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    onRegenerate();
                    setConfirmingRegenerate(false);
                  }}
                >
                  <Text className="text-sm font-semibold text-terracotta">Regenerate</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setConfirmingRegenerate(true)}
              className="flex-row items-center gap-3 rounded-2xl bg-sand p-4 active:opacity-80"
            >
              <Ionicons name="refresh-outline" size={20} className="text-terracotta" />
              <Text className="text-sm font-medium text-terracotta">Regenerate code</Text>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}
