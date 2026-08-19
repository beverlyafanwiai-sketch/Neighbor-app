import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getCurrentNeighborhood } from '../lib/location';

type Props = {
  neighborhood: string;
  crossStreets: string;
  onLocationSet: (neighborhood: string, crossStreets: string) => void;
};

export default function LocationPicker({ neighborhood, crossStreets, onLocationSet }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    const result = await getCurrentNeighborhood();
    setLoading(false);
    if (result.status === 'ok') {
      onLocationSet(result.neighborhood, result.crossStreets);
    } else if (result.status === 'denied') {
      setError('Location access was denied — enable it in your device settings to set your neighborhood.');
    } else if (result.status === 'unsupported') {
      setError("Location detection isn't available in the browser — try the app on your phone.");
    } else {
      setError("Couldn't determine your location. Try again.");
    }
  };

  return (
    <View className="gap-3">
      <Pressable
        onPress={useCurrentLocation}
        disabled={loading}
        className="flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-terracotta/40 bg-terracotta/5 px-4 py-3.5 active:opacity-80 disabled:opacity-60"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#E0533C" />
        ) : (
          <Ionicons name="locate-outline" size={18} className="text-terracotta" />
        )}
        <Text className="text-sm font-semibold text-terracotta">
          {loading
            ? 'Finding your location...'
            : neighborhood
              ? 'Update from current location'
              : 'Use my current location'}
        </Text>
      </Pressable>

      {error && <Text className="text-xs text-terracotta">{error}</Text>}

      {neighborhood.length > 0 && (
        <View className="gap-3">
          <View>
            <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Neighborhood
            </Text>
            <Text className="rounded-2xl bg-sand px-4 py-3 text-base text-charcoal">
              {neighborhood}
            </Text>
          </View>
          {crossStreets.length > 0 && (
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Cross streets
              </Text>
              <Text className="rounded-2xl bg-sand px-4 py-3 text-base text-charcoal">
                {crossStreets}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
