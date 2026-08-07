export interface LettersRound {
  type: "letters";
  letters: string[];
  targetWord?: string;
  timeLimit: number;
}

export interface NumbersRound {
  type: "numbers";
  numbers: number[];
  target: number;
  targetEquation?: string;
  timeLimit: number;
}

export interface ConundrumRound {
  type: "conundrum";
  letters: string[];
  solution: string;
  timeLimit: number;
}

export type Round = LettersRound | NumbersRound | ConundrumRound;

export interface Puzzle {
  id: string;
  playDate: string;
  lettersRound: LettersRound;
  numbersRound: NumbersRound;
  conundrumRound: ConundrumRound;
}

export interface LettersResult {
  word: string;
  length: number;
  score: number;
  timeMs: number;
  isOptimal: boolean;
}

export interface NumbersResult {
  equation: string;
  target: number;
  exact: boolean;
  distance: number;
  score: number;
  timeMs: number;
  isOptimal: boolean;
}

export interface ConundrumResult {
  solution: string;
  found: boolean;
  timeMs: number;
  score: number;
}

export interface RoundResult {
  letters?: LettersResult;
  numbers?: NumbersResult;
  conundrum?: ConundrumResult;
}

export interface GameScore {
  letters: number;
  numbers: number;
  conundrum: number;
  total: number;
}
