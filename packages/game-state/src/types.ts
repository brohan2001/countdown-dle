import { LettersResult, NumbersResult, ConundrumResult } from "@countdown/engine-core";

export type RoundState = "idle" | "countdown" | "active" | "submitted" | "timeout" | "revealed" | "scored";

export interface LettersRoundState {
  type: "letters";
  state: RoundState;
  letters: string[];
  playerWord: string;
  timeRemaining: number;
  result?: LettersResult;
}

export interface NumbersRoundState {
  type: "numbers";
  state: RoundState;
  numbers: number[];
  target: number;
  playerEquation: string;
  selectedTiles: number[];
  timeRemaining: number;
  result?: NumbersResult;
}

export interface ConundrumRoundState {
  type: "conundrum";
  state: RoundState;
  letters: string[];
  playerSolution: string;
  timeRemaining: number;
  result?: ConundrumResult;
}

export type RoundStateType = LettersRoundState | NumbersRoundState | ConundrumRoundState;

export interface ExpressMatchState {
  status: "not_started" | "in_progress" | "completed";
  rounds: RoundStateType[];
  currentRoundIndex: number;
  totalScore: number;
  startedAt: number;
  completedAt?: number;
}
