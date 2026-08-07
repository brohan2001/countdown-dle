import { create } from "zustand";
import { NumbersRoundState, RoundState } from "./types.js";

interface NumbersStore extends NumbersRoundState {
  setPlayerEquation: (equation: string) => void;
  setSelectedTiles: (indices: number[]) => void;
  setRoundState: (state: RoundState) => void;
  setTimeRemaining: (time: number) => void;
  reset: (numbers: number[], target: number) => void;
}

export const useNumbersRound = create<NumbersStore>((set) => ({
  type: "numbers",
  state: "idle",
  numbers: [],
  target: 0,
  playerEquation: "",
  selectedTiles: [],
  timeRemaining: 30000,
  setPlayerEquation: (equation: string) => set({ playerEquation: equation }),
  setSelectedTiles: (indices: number[]) => set({ selectedTiles: indices }),
  setRoundState: (state: RoundState) => set({ state }),
  setTimeRemaining: (time: number) => set({ timeRemaining: Math.max(0, time) }),
  reset: (numbers: number[], target: number) =>
    set({
      numbers,
      target,
      playerEquation: "",
      selectedTiles: [],
      timeRemaining: 30000,
      state: "idle",
      result: undefined,
    }),
}));
