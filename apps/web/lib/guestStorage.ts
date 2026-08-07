import { RoundResult } from "@countdown/engine-core";

export interface CompletedMatch {
  date: string; // YYYY-MM-DD
  totalScore: number;
  roundResults: RoundResult[];
  emojiSummary: string;
  completedAt: number; // timestamp in ms
}

const STORAGE_KEY = "countdown_guest_match";

export function getCompletedMatch(): CompletedMatch | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Check if it's from today
    const today = new Date().toISOString().split("T")[0];
    if (data.date !== today) {
      // Clear old match if it's from a different day
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function saveCompletedMatch(match: CompletedMatch): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
  } catch (e) {
    console.warn("Failed to save match to localStorage:", e);
  }
}

export function clearCompletedMatch(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear match from localStorage:", e);
  }
}
