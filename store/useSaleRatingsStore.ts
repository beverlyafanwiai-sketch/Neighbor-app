import { create } from 'zustand';

import { ME } from '../data/mock';
import { useSaleStore } from './useSaleStore';

export type SaleRating = { stars: number; comment: string };
export type SaleRatingEntry = { userId: string; stars: number; comment: string };

type SaleRatingsState = {
  myRatings: Record<string, SaleRating>;
  rateItem: (itemId: string, stars: number, comment: string) => void;
};

export const useSaleRatingsStore = create<SaleRatingsState>((set) => ({
  myRatings: {},

  rateItem: (itemId, stars, comment) =>
    set((s) => ({ myRatings: { ...s.myRatings, [itemId]: { stars, comment } } })),
}));

// item.ratingBaseline is the list of individual ratings from other
// neighbors, *not including* ME -- same "baseline + mine" pattern as
// event ratings.
export function getEffectiveSaleRatings(
  itemId: string,
  myRating: SaleRating | undefined
): SaleRatingEntry[] {
  const item = useSaleStore.getState().items.find((i) => i.id === itemId);
  const baseline = item?.ratingBaseline ?? [];
  return myRating ? [...baseline, { userId: ME.id, stars: myRating.stars, comment: myRating.comment }] : baseline;
}

export function getEffectiveSaleRatingSummary(itemId: string, myRating: SaleRating | undefined) {
  const ratings = getEffectiveSaleRatings(itemId, myRating);
  const count = ratings.length;
  const total = ratings.reduce((sum, r) => sum + r.stars, 0);
  return { avg: count > 0 ? total / count : 0, count };
}
