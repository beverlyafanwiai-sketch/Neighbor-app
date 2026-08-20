import { Image, Pressable, Text, TextInput, View } from 'react-native';

import { mentionableUsers } from '../lib/mentions';
import { useBlockedStore } from '../store/useBlockedStore';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  style?: object;
  dropdownPosition?: 'above' | 'below';
};

export default function MentionTextInput({
  value,
  onChangeText,
  placeholder,
  className,
  multiline,
  autoFocus,
  style,
  dropdownPosition = 'below',
}: Props) {
  const blockedIds = useBlockedStore((s) => s.blockedIds);
  const match = value.match(/@(\w*)$/);
  const query = match ? match[1].toLowerCase() : null;
  const suggestions =
    query === null
      ? []
      : mentionableUsers().filter(
          (u) => !blockedIds[u.id] && u.name.split(' ')[0].toLowerCase().startsWith(query)
        );

  const pick = (name: string) => {
    onChangeText(value.replace(/@(\w*)$/, `@${name} `));
  };

  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#3D3D3D80"
        multiline={multiline}
        autoFocus={autoFocus}
        className={className}
        style={style}
      />
      {suggestions.length > 0 && (
        <View
          className="overflow-hidden rounded-2xl bg-cream shadow-lg"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            [dropdownPosition === 'above' ? 'bottom' : 'top']: '100%',
            zIndex: 20,
          }}
        >
          {suggestions.map((u) => {
            const first = u.name.split(' ')[0];
            return (
              <Pressable
                key={u.id}
                onPress={() => pick(first)}
                className="flex-row items-center gap-2.5 p-2.5 active:opacity-70"
              >
                <Image source={{ uri: u.avatar }} className="h-8 w-8 rounded-full" />
                <Text className="text-sm text-charcoal">{u.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
