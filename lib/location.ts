import { Platform } from 'react-native';
import * as Location from 'expo-location';

export type LocationResult =
  | { status: 'ok'; neighborhood: string; crossStreets: string }
  | { status: 'unsupported' }
  | { status: 'denied' }
  | { status: 'error' };

// Reverse geocoding isn't implemented on web — only native (iOS/Android).
export async function getCurrentNeighborhood(): Promise<LocationResult> {
  if (Platform.OS === 'web') return { status: 'unsupported' };

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return { status: 'denied' };

  try {
    const position = await Location.getCurrentPositionAsync({});
    const [place] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    if (!place) return { status: 'error' };

    const neighborhood = place.district || place.subregion || place.city || place.region || '';
    const crossStreets = [place.streetNumber, place.street].filter(Boolean).join(' ');

    if (!neighborhood) return { status: 'error' };

    return { status: 'ok', neighborhood, crossStreets };
  } catch {
    return { status: 'error' };
  }
}
