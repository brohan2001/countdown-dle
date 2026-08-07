import { create } from "zustand";
import { ConundrumRoundState, RoundState } from "./types.js";

interface ConundrumStore extends ConundrumRoundState {
  setPlayerSolution: (solution: string) => void;
  setRoundState: (state: RoundState) => void;
  setTimeRemaining: (time: number) => void;
  reset: (letters: string[]) => void;
}

export const useConundrumRound = create<ConundrumStore>((set) => ({
  type: "conundrum",
  state: "idle",
  letters: [],
  playerSolution: "",
  timeRemaining: 30000,
  setPlayerSolution: (solution: string) => set({ playerSolution: solution }),
  setRoundState: (state: RoundState) => set({ state }),
  setTimeRemaining: (time: number) => set({ timeRemaining: Math.max(0, time) }),
  reset: (letters: string[]) =>
    set({
      letters,
      playerSolution: "",
      timeRemaining: 30000,
      state: "idle",
      result: undefined,
    }),
}));
