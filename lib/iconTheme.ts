import { cssInterop } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

cssInterop(Ionicons, {
  className: { target: false, nativeStyleToProp: { color: true } },
});

cssInterop(ActivityIndicator, {
  className: { target: false, nativeStyleToProp: { color: true } },
});
