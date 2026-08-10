import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePostsStore } from '../store/usePostsStore';
import { useProfileStore } from '../store/useProfileStore';

export default function CreatePost() {
  const profile = useProfileStore((s) => s.profile);
  const createPost = usePostsStore((s) => s.createPost);
  const [body, setBody] = useState('');

  const canPost = body.trim().length > 0;

  const save = () => {
    if (!canPost) return;
    createPost(body.trim());
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="close" size={20} color="#3D3D3D" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">New post</Text>
        <Pressable
          onPress={save}
          disabled={!canPost}
          className={`rounded-full px-4 py-2 ${canPost ? 'bg-terracotta' : 'bg-charcoal/10'}`}
        >
          <Text className={`text-sm font-semibold ${canPost ? 'text-cream' : 'text-charcoal/40'}`}>
            Post
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 px-5 pt-2">
          <View className="flex-row items-center gap-3">
            <Image source={{ uri: profile.avatar }} className="h-11 w-11 rounded-full" />
            <Text className="font-semibold text-charcoal">{profile.name}</Text>
          </View>

          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="What's going on in your corner of the neighborhood?"
            placeholderTextColor="#3D3D3D80"
            multiline
            autoFocus
            className="mt-4 flex-1 text-base leading-6 text-charcoal"
            style={{ textAlignVertical: 'top' }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
