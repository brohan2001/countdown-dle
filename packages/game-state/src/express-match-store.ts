import { create } from "zustand";
import { ExpressMatchState, LettersRoundState, NumbersRoundState, ConundrumRoundState } from "./types.js";
import { LettersResult, NumbersResult, ConundrumResult } from "@countdown/engine-core";

interface ExpressMatchStore extends ExpressMatchState {
  startMatch: (letters: string[], numbers: number[], target: number, conundrum: string[]) => void;
  nextRound: () => void;
  completeMatch: () => void;
  completeRound: (score: number, result: LettersResult | NumbersResult | ConundrumResult) => void;
  getCurrentRound: () => LettersRoundState | NumbersRoundState | ConundrumRoundState | null;
  updateCurrentRound: (updates: Partial<LettersRoundState | NumbersRoundState | ConundrumRoundState>) => void;
  reset: () => void;
}


export const useExpressMatch = create<ExpressMatchStore>((set, get) => ({
  status: "not_started",
  rounds: [],
  currentRoundIndex: 0,
  totalScore: 0,
  startedAt: 0,
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
    completeRound: (score: number, result: LettersResult | NumbersResult | ConundrumResult) => {
      const state = get();
      const newRounds = [...state.rounds];
      const current = newRounds[state.currentRoundIndex];
      if (current) {
        newRounds[state.currentRoundIndex] = {
          ...current,
          state: "scored",
          result,
        } as typeof current;
      }
      set({
        rounds: newRounds,
        totalScore: state.totalScore + score,
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
    reset: () => {
      set({
        status: "not_started",
        rounds: [],
        currentRoundIndex: 0,
        totalScore: 0,
        startedAt: 0,
        completedAt: undefined,
      });
    },
}));
