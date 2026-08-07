import { create } from "zustand";
import { NumbersRoundState, RoundState } from "./types.js";

interface NumbersStore extends NumbersRoundState {
  setState: (state: Partial<NumbersRoundState>) => void;
  setPlayerEquation: (equation: string) => void;
  setSelectedTiles: (indices: number[]) => void;
  setRoundState: (state: RoundState) => void;
  setTimeRemaining: (time: number) => void;
  reset: (numbers: number[], target: number) => void;
}

export const createNumbersRound = (numbers: number[], target: number): NumbersStore => {
  const initialState: NumbersRoundState = {
    type: "numbers",
    state: "idle",
    numbers,
    target,
    playerEquation: "",
    selectedTiles: [],
    timeRemaining: 30000,
  };

  return {
    ...initialState,
    setState: (updates) => {
      useNumbersRound.setState(updates);
    },
    setPlayerEquation: (equation: string) => {
      useNumbersRound.setState({ playerEquation: equation });
    },
    setSelectedTiles: (indices: number[]) => {
      useNumbersRound.setState({ selectedTiles: indices });
    },
    setRoundState: (state: RoundState) => {
      useNumbersRound.setState({ state });
    },
    setTimeRemaining: (time: number) => {
      useNumbersRound.setState({ timeRemaining: Math.max(0, time) });
    },
    reset: (numbers: number[], target: number) => {
      useNumbersRound.setState({
        numbers,
        target,
        playerEquation: "",
        selectedTiles: [],
        timeRemaining: 30000,
        state: "idle",
        result: undefined,
      });
    },
  };
};

export const useNumbersRound = create<NumbersStore>((set) => {
  const initialState = createNumbersRound([], 0);
  return {
    ...initialState,
    setState: (updates) => set(updates),
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
  };
});
