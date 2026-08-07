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
export interface InitMessage extends WorkerMessage<void> {
  type: "INIT";
  payload: { words: string[] };
}

export interface GeneratePuzzleMessage extends WorkerMessage<void> {
  type: "GENERATE_PUZZLE";
  payload: { playDate: string };
}

export interface SolveLettersMessage extends WorkerMessage<void> {
  type: "SOLVE_LETTERS";
  payload: { letters: string[] };
}

export interface SolveNumbersMessage extends WorkerMessage<void> {
  type: "SOLVE_NUMBERS";
  payload: { numbers: number[]; target: number };
}

export interface SolveConundrumMessage extends WorkerMessage<void> {
  type: "SOLVE_CONUNDRUM";
  payload: { anagram: string };
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

export interface GeneratePuzzleResponse extends WorkerMessage<void> {
  type: "GENERATE_PUZZLE_RESPONSE";
  payload: { puzzle: Puzzle };
}

export interface SolveLettersResponse extends WorkerMessage<void> {
  type: "SOLVE_LETTERS_RESPONSE";
  payload: { result: LettersResult | null };
}

export interface SolveNumbersResponse extends WorkerMessage<void> {
  type: "SOLVE_NUMBERS_RESPONSE";
  payload: {
    result: {
      value: number;
      equation: string;
      distance: number;
    };
  };
}

export interface SolveConundrumResponse extends WorkerMessage<void> {
  type: "SOLVE_CONUNDRUM_RESPONSE";
  payload: { solutions: string[] };
}

export type WorkerResponse =
  | InitResponse
  | GeneratePuzzleResponse
  | SolveLettersResponse
  | SolveNumbersResponse
  | SolveConundrumResponse;
