import { create } from 'zustand';

type MutedWordsState = {
  words: string[];
  addWord: (word: string) => void;
  removeWord: (word: string) => void;
};

export const useMutedWordsStore = create<MutedWordsState>((set) => ({
  words: [],

  addWord: (word) => {
    const clean = word.trim();
    if (!clean) return;
    set((s) =>
      s.words.some((w) => w.toLowerCase() === clean.toLowerCase())
        ? s
        : { words: [...s.words, clean] }
    );
  },

  removeWord: (word) => set((s) => ({ words: s.words.filter((w) => w !== word) })),
}));

export function containsMutedWord(text: string, mutedWords: string[]): boolean {
  if (mutedWords.length === 0) return false;
  const lower = text.toLowerCase();
  return mutedWords.some((w) => {
    const clean = w.trim().toLowerCase();
    return clean.length > 0 && lower.includes(clean);
  });
}
