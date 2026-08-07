import {
  Puzzle,
  LettersResult,
  NumbersResult,
  ConundrumResult,
} from "@countdown/engine-core";

export interface WorkerMessage<T> {
  id: number;
  type: string;
  payload?: T;
  error?: string;
}

// Request messages (main thread → worker)
export interface InitMessage extends WorkerMessage<{ words: string[] }> {
  type: "INIT";
}

export interface GeneratePuzzleMessage extends WorkerMessage<{ playDate: string }> {
  type: "GENERATE_PUZZLE";
}

export interface SolveLettersMessage extends WorkerMessage<{ letters: string[] }> {
  type: "SOLVE_LETTERS";
}

export interface SolveNumbersMessage extends WorkerMessage<{ numbers: number[]; target: number }> {
  type: "SOLVE_NUMBERS";
}

export interface SolveConundrumMessage extends WorkerMessage<{ anagram: string }> {
  type: "SOLVE_CONUNDRUM";
}

export type WorkerRequest =
  | InitMessage
  | GeneratePuzzleMessage
  | SolveLettersMessage
  | SolveNumbersMessage
  | SolveConundrumMessage;

// Response messages (worker → main thread)
export interface InitResponse extends WorkerMessage<void> {
  type: "INIT_RESPONSE";
}

export interface GeneratePuzzleResponse extends WorkerMessage<{ puzzle: Puzzle }> {
  type: "GENERATE_PUZZLE_RESPONSE";
}

export interface SolveLettersResponse extends WorkerMessage<{ result: LettersResult | null }> {
  type: "SOLVE_LETTERS_RESPONSE";
}

export interface SolveNumbersResponse
  extends WorkerMessage<{
    result: {
      value: number;
      equation: string;
      distance: number;
    };
  }> {
  type: "SOLVE_NUMBERS_RESPONSE";
}

export interface SolveConundrumResponse extends WorkerMessage<{ solutions: string[] }> {
  type: "SOLVE_CONUNDRUM_RESPONSE";
}

export type WorkerResponse =
  | InitResponse
  | GeneratePuzzleResponse
  | SolveLettersResponse
  | SolveNumbersResponse
  | SolveConundrumResponse;
