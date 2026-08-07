import { create } from "zustand";
import { ExpressMatchState, LettersRoundState, NumbersRoundState, ConundrumRoundState } from "./types.js";

interface ExpressMatchStore extends ExpressMatchState {
  startMatch: (letters: string[], numbers: number[], target: number, conundrum: string[]) => void;
  nextRound: () => void;
  completeMatch: () => void;
  getCurrentRound: () => LettersRoundState | NumbersRoundState | ConundrumRoundState | null;
  updateCurrentRound: (updates: Partial<LettersRoundState | NumbersRoundState | ConundrumRoundState>) => void;
}

export const createExpressMatch = (): ExpressMatchStore => {
  const initialState: ExpressMatchState = {
    status: "not_started",
    rounds: [],
    currentRoundIndex: 0,
    totalScore: 0,
    startedAt: 0,
  };

  return {
    ...initialState,
    startMatch: (letters: string[], numbers: number[], target: number, conundrum: string[]) => {
      const state = useExpressMatch.getState();
      const newRounds: (LettersRoundState | NumbersRoundState | ConundrumRoundState)[] = [
        {
          type: "letters",
          state: "idle",
          letters,
          playerWord: "",
          timeRemaining: 30000,
        },
        {
          type: "numbers",
          state: "idle",
          numbers,
          target,
          playerEquation: "",
          selectedTiles: [],
          timeRemaining: 30000,
        },
        {
          type: "conundrum",
          state: "idle",
          letters: conundrum,
          playerSolution: "",
          timeRemaining: 30000,
        },
      ];

      useExpressMatch.setState({
        status: "in_progress",
        rounds: newRounds,
        currentRoundIndex: 0,
        totalScore: 0,
        startedAt: Date.now(),
      });
    },
    nextRound: () => {
      const state = useExpressMatch.getState();
      if (state.currentRoundIndex < state.rounds.length - 1) {
        useExpressMatch.setState({
          currentRoundIndex: state.currentRoundIndex + 1,
        });
      }
    },
    completeMatch: () => {
      useExpressMatch.setState({
        status: "completed",
        completedAt: Date.now(),
      });
    },
    getCurrentRound: () => {
      const state = useExpressMatch.getState();
      return state.rounds[state.currentRoundIndex] || null;
    },
    updateCurrentRound: (updates) => {
      const state = useExpressMatch.getState();
      const newRounds = [...state.rounds];
      const current = newRounds[state.currentRoundIndex];
      if (current) {
        newRounds[state.currentRoundIndex] = { ...current, ...updates } as typeof current;
      }
      useExpressMatch.setState({ rounds: newRounds });
    },
  };
};

export const useExpressMatch = create<ExpressMatchStore>((set, get) => {
  const initial = createExpressMatch();
  return {
    ...initial,
    startMatch: (letters, numbers, target, conundrum) => {
      const newRounds = [
        {
          type: "letters" as const,
          state: "idle" as const,
          letters,
          playerWord: "",
          timeRemaining: 30000,
        },
        {
          type: "numbers" as const,
          state: "idle" as const,
          numbers,
          target,
          playerEquation: "",
          selectedTiles: [],
          timeRemaining: 30000,
        },
        {
          type: "conundrum" as const,
          state: "idle" as const,
          letters: conundrum,
          playerSolution: "",
          timeRemaining: 30000,
        },
      ];
      set({
        status: "in_progress",
        rounds: newRounds,
        currentRoundIndex: 0,
        totalScore: 0,
        startedAt: Date.now(),
      });
    },
    nextRound: () => {
      const state = get();
      if (state.currentRoundIndex < state.rounds.length - 1) {
        set({ currentRoundIndex: state.currentRoundIndex + 1 });
      }
    },
    completeMatch: () => {
      set({
        status: "completed",
        completedAt: Date.now(),
      });
    },
    getCurrentRound: () => {
      const state = get();
      return state.rounds[state.currentRoundIndex] || null;
    },
    updateCurrentRound: (updates) => {
      const state = get();
      const newRounds = [...state.rounds];
      const current = newRounds[state.currentRoundIndex];
      if (current) {
        newRounds[state.currentRoundIndex] = { ...current, ...updates } as typeof current;
      }
      set({ rounds: newRounds });
    },
  };
});
