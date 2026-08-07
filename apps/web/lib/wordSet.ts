import { canFormWord } from "@countdown/engine-core";

let wordSetCache: Set<string> | null = null;

export async function getWordSet(): Promise<Set<string>> {
  if (wordSetCache) return wordSetCache;

  const response = await fetch("/words.txt");
  const text = await response.text();
  const words = text.split("\n").filter((w) => w.length > 0);
  wordSetCache = new Set(words);

  return wordSetCache;
}

export async function isValidWord(word: string): Promise<boolean> {
  const words = await getWordSet();
  return words.has(word.toUpperCase());
}

export async function canFormWordAsync(
  word: string,
  availableLetters: string[]
): Promise<boolean> {
  const words = await getWordSet();
  const upperWord = word.toUpperCase();

  if (!words.has(upperWord)) return false;
  return canFormWord(word, availableLetters);
}

export { canFormWord };
