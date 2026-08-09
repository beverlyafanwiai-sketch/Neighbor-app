import { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { CONVERSATION_SVG } from '../../assets/illustrations/conversation';

type Message = { id: string; from: 'me' | 'them'; text: string; time: string };

const initialMessages: Message[] = [
  { id: '1', from: 'them', text: "Hey! Are we still on for coffee Saturday?", time: '9:02 AM' },
  { id: '2', from: 'me', text: 'Yes! I was just thinking about that porch place.', time: '9:05 AM' },
  { id: '3', from: 'them', text: 'Perfect, I love that spot. 10am work?', time: '9:06 AM' },
  { id: '4', from: 'me', text: "10 is great, see you then — can't wait to catch up properly.", time: '9:07 AM' },
];

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');

  const send = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: String(prev.length + 1), from: 'me', text: draft.trim(), time: 'Now' },
    ]);
    setDraft('');
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 border-b border-charcoal/10 bg-cream px-4 py-3">
        <Pressable className="h-9 w-9 items-center justify-center rounded-full">
          <Ionicons name="chevron-back" size={22} color="#3D3D3D" />
        </Pressable>
        <Image source={{ uri: 'https://i.pravatar.cc/150?img=5' }} className="h-10 w-10 rounded-full" />
        <View className="flex-1">
          <Text className="text-base font-semibold text-charcoal">Maya</Text>
          <Text className="text-xs text-sage">Active now</Text>
        </View>
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
                This is the beginning of your conversation with Maya
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className={`max-w-[78%] ${item.from === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
              <View
                className={`rounded-2xl px-4 py-3 ${
                  item.from === 'me'
                    ? 'rounded-br-sm bg-terracotta'
                    : 'rounded-bl-sm bg-cream'
                }`}
              >
                <Text className={item.from === 'me' ? 'text-cream' : 'text-charcoal'}>
                  {item.text}
                </Text>
              </View>
              <Text className="mt-1 text-[11px] text-charcoal/40">{item.time}</Text>
            </View>
          )}
        />

        <View className="flex-row items-center gap-2 border-t border-charcoal/10 bg-cream px-3 py-2.5">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message Maya..."
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
