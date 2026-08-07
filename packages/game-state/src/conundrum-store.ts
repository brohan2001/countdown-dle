import { create } from "zustand";
import { ConundrumRoundState, RoundState } from "./types.js";

interface ConundrumStore extends ConundrumRoundState {
  setState: (state: Partial<ConundrumRoundState>) => void;
  setPlayerSolution: (solution: string) => void;
  setRoundState: (state: RoundState) => void;
  setTimeRemaining: (time: number) => void;
  reset: (letters: string[]) => void;
}

export const createConundrumRound = (letters: string[]): ConundrumStore => {
  const initialState: ConundrumRoundState = {
    type: "conundrum",
    state: "idle",
    letters,
    playerSolution: "",
    timeRemaining: 30000,
  };

  return {
    ...initialState,
    setState: (updates) => {
      useConundrumRound.setState(updates);
    },
    setPlayerSolution: (solution: string) => {
      useConundrumRound.setState({ playerSolution: solution });
    },
    setRoundState: (state: RoundState) => {
      useConundrumRound.setState({ state });
    },
    setTimeRemaining: (time: number) => {
      useConundrumRound.setState({ timeRemaining: Math.max(0, time) });
    },
    reset: (letters: string[]) => {
      useConundrumRound.setState({
        letters,
        playerSolution: "",
        timeRemaining: 30000,
        state: "idle",
        result: undefined,
      });
    },
  };
};

export const useConundrumRound = create<ConundrumStore>((set) => {
  const initialState = createConundrumRound([]);
  return {
    ...initialState,
    setState: (updates) => set(updates),
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
  };
});
