import { create } from "zustand";
import { LettersRoundState, RoundState } from "./types.js";

interface LettersStore extends LettersRoundState {
  setState: (state: Partial<LettersRoundState>) => void;
  setPlayerWord: (word: string) => void;
  setRoundState: (state: RoundState) => void;
  setTimeRemaining: (time: number) => void;
  reset: (letters: string[]) => void;
}

export const createLettersRound = (letters: string[]): LettersStore => {
  const initialState: LettersRoundState = {
    type: "letters",
    state: "idle",
    letters,
    playerWord: "",
    timeRemaining: 30000,
  };

  return {
    ...initialState,
    setState: (updates) => {
      const store = useLettersRound.getState();
      useLettersRound.setState(updates);
    },
    setPlayerWord: (word: string) => {
      useLettersRound.setState({ playerWord: word });
    },
    setRoundState: (state: RoundState) => {
      useLettersRound.setState({ state });
    },
    setTimeRemaining: (time: number) => {
      useLettersRound.setState({ timeRemaining: Math.max(0, time) });
    },
    reset: (letters: string[]) => {
      useLettersRound.setState({
        letters,
        playerWord: "",
        timeRemaining: 30000,
        state: "idle",
        result: undefined,
      });
    },
  };
};

export const useLettersRound = create<LettersStore>((set) => {
  const initialState = createLettersRound([]);
  return {
    ...initialState,
    setState: (updates) => set(updates),
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
  };
});
