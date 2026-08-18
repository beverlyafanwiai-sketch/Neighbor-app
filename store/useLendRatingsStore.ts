import { create } from 'zustand';

import { ME } from '../data/mock';
import { useLendStore } from './useLendStore';

export type LendRating = { stars: number; comment: string };
export type LendRatingEntry = { userId: string; stars: number; comment: string };

type LendRatingsState = {
  myRatings: Record<string, LendRating>;
  rateItem: (itemId: string, stars: number, comment: string) => void;
};

export const useLendRatingsStore = create<LendRatingsState>((set) => ({
  myRatings: {},

  rateItem: (itemId, stars, comment) =>
    set((s) => ({ myRatings: { ...s.myRatings, [itemId]: { stars, comment } } })),
}));

// item.ratingBaseline is the list of individual ratings from other
// neighbors, *not including* ME -- same "baseline + mine" pattern as
// event ratings.
export function getEffectiveLendRatings(
  itemId: string,
  myRating: LendRating | undefined
): LendRatingEntry[] {
  const item = useLendStore.getState().items.find((i) => i.id === itemId);
  const baseline = item?.ratingBaseline ?? [];
  return myRating ? [...baseline, { userId: ME.id, stars: myRating.stars, comment: myRating.comment }] : baseline;
}

export function getEffectiveLendRatingSummary(itemId: string, myRating: LendRating | undefined) {
  const ratings = getEffectiveLendRatings(itemId, myRating);
  const count = ratings.length;
  const total = ratings.reduce((sum, r) => sum + r.stars, 0);
  return { avg: count > 0 ? total / count : 0, count };
}
