import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { CONVERSATION_SVG } from '../../assets/illustrations/conversation';
import { getUser } from '../../data/mock';
import { useConversationsStore } from '../../store/useConversationsStore';

export default function ChatThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = useConversationsStore((s) => s.conversations[id]);
  const sendMessage = useConversationsStore((s) => s.sendMessage);
  const markRead = useConversationsStore((s) => s.markRead);
  const isTyping = useConversationsStore((s) => s.typing[id] ?? false);
  const user = conversation ? getUser(conversation.userId) : undefined;

  const [draft, setDraft] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    markRead(id);
  }, [id, markRead]);

  if (!conversation || !user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="text-charcoal">Conversation not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-terracotta">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const messages = conversation.messages;
  const lastMeIndex = messages.reduce(
    (acc, m, i) => (m.from === 'me' ? i : acc),
    -1
  );

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const send = () => {
    if (!draft.trim() && !imageUri) return;
    sendMessage(conversation.id, draft.trim(), imageUri);
    setDraft('');
    setImageUri(undefined);
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 border-b border-charcoal/10 bg-cream px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={22} color="#3D3D3D" />
        </Pressable>
        <Pressable
          onPress={() => router.push(`/profile/${user.id}`)}
          className="flex-1 flex-row items-center gap-3"
        >
          <Image source={{ uri: user.avatar }} className="h-10 w-10 rounded-full" />
          <View className="flex-1">
            <Text className="text-base font-semibold text-charcoal">{user.name}</Text>
            <Text className="text-xs text-sage">Active now</Text>
          </View>
        </Pressable>
        <Pressable className="h-9 w-9 items-center justify-center rounded-full">
          <Ionicons name="information-circle-outline" size={22} color="#3D3D3D" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerClassName="gap-2.5 px-4 py-4"
          ListHeaderComponent={
            <View className="mb-4 items-center">
              <View className="h-36 w-36">
                <SvgXml xml={CONVERSATION_SVG} width="100%" height="100%" />
              </View>
              <Text className="mt-2 text-xs text-charcoal/50">
                This is the beginning of your conversation with {user.name}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View
              className={`max-w-[78%] ${item.from === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <View
                className={`overflow-hidden rounded-2xl ${
                  item.text ? 'px-4 py-3' : 'p-1'
                } ${item.from === 'me' ? 'rounded-br-sm bg-terracotta' : 'rounded-bl-sm bg-cream'}`}
              >
                {item.imageUri && (
                  <Image
                    source={{ uri: item.imageUri }}
                    className={`w-48 rounded-xl ${item.text ? 'mb-2' : ''}`}
                    style={{ aspectRatio: 4 / 3 }}
                  />
                )}
                {item.text.length > 0 && (
                  <Text className={item.from === 'me' ? 'text-cream' : 'text-charcoal'}>
                    {item.text}
                  </Text>
                )}
              </View>
              <Text className="mt-1 text-[11px] text-charcoal/40">{item.time}</Text>
              {index === lastMeIndex && item.seen && (
                <Text className="mt-0.5 text-[11px] text-sage">Seen</Text>
              )}
            </View>
          )}
          ListFooterComponent={
            isTyping ? (
              <View className="mt-2 max-w-[78%] items-start self-start">
                <View className="flex-row items-center gap-1 rounded-2xl rounded-bl-sm bg-cream px-4 py-3.5">
                  <View className="h-1.5 w-1.5 rounded-full bg-charcoal/40" />
                  <View className="h-1.5 w-1.5 rounded-full bg-charcoal/40" />
                  <View className="h-1.5 w-1.5 rounded-full bg-charcoal/40" />
                </View>
              </View>
            ) : null
          }
        />

        {imageUri && (
          <View className="border-t border-charcoal/10 bg-cream px-3 pt-2.5">
            <View className="self-start" style={{ position: 'relative' }}>
              <Image source={{ uri: imageUri }} className="h-16 w-16 rounded-xl" />
              <Pressable
                onPress={() => setImageUri(undefined)}
                className="absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full bg-charcoal/70"
              >
                <Ionicons name="close" size={11} color="#F5F2E9" />
              </Pressable>
            </View>
          </View>
        )}

        <View
          className={`flex-row items-center gap-2 bg-cream px-3 py-2.5 ${
            imageUri ? '' : 'border-t border-charcoal/10'
          }`}
        >
          <Pressable
            onPress={pickImage}
            className="h-10 w-10 items-center justify-center rounded-full bg-sand"
          >
            <Ionicons name="image-outline" size={19} color="#81A684" />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${user.name}...`}
            placeholderTextColor="#3D3D3D80"
            className="flex-1 rounded-full bg-sand px-4 py-2.5 text-charcoal"
            multiline
          />
          <Pressable
            onPress={send}
            className="h-10 w-10 items-center justify-center rounded-full bg-terracotta"
          >
            <Ionicons name="arrow-up" size={20} color="#F5F2E9" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
