import { create } from "zustand";
import { LettersRoundState, RoundState } from "./types.js";

interface LettersStore extends LettersRoundState {
  setPlayerWord: (word: string) => void;
  setRoundState: (state: RoundState) => void;
  setTimeRemaining: (time: number) => void;
  reset: (letters: string[]) => void;
}

export const useLettersRound = create<LettersStore>((set) => ({
  type: "letters",
  state: "idle",
  letters: [],
  playerWord: "",
  timeRemaining: 30000,
  setPlayerWord: (word: string) => set({ playerWord: word }),
  setRoundState: (state: RoundState) => set({ state }),
  setTimeRemaining: (time: number) => set({ timeRemaining: Math.max(0, time) }),
  reset: (letters: string[]) =>
    set({
      letters,
      playerWord: "",
      timeRemaining: 30000,
      state: "idle",
      result: undefined,
    }),
}));
