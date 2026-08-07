import { Dictionary, canFormWord } from "./dictionary.js";
import { LettersResult } from "./types.js";

export function scoreWord(length: number): number {
  if (length < 2) return 0;
  if (length <= 4) return length;
  if (length === 5) return 7;
  if (length === 6) return 8;
  if (length === 7) return 9;
  if (length === 8) return 9;
  return 10; // 9 letters
}

export class LettersSolver {
  constructor(private dictionary: Dictionary) {}

  validateWord(word: string, availableLetters: string[]): boolean {
    const upperWord = word.toUpperCase();
    return this.dictionary.isValid(upperWord) && canFormWord(word, availableLetters);
  }

  solve(letters: string[]): { word: string; length: number } | null {
    const longestWord = this.dictionary.getLongestWord(letters);
    if (!longestWord) return null;

    return {
      word: longestWord.toUpperCase(),
      length: longestWord.length,
    };
  }

  scoreWord(length: number): number {
    return scoreWord(length);
  }

  async solveAndScore(
    letters: string[],
    playerWord?: string,
    timeMs?: number
  ): Promise<LettersResult | null> {
    const solution = this.solve(letters);
    if (!solution) return null;

    const optimalScore = this.scoreWord(solution.length);

    if (playerWord) {
      const valid = this.validateWord(playerWord, letters);
      if (!valid) {
        return {
          word: playerWord,
          length: playerWord.length,
          score: 0,
          timeMs: timeMs || 0,
          isOptimal: false,
        };
      }

      const playerScore = this.scoreWord(playerWord.length);
      return {
        word: playerWord.toUpperCase(),
        length: playerWord.length,
        score: playerScore,
        timeMs: timeMs || 0,
        isOptimal: playerScore === optimalScore,
      };
    }

    return {
      word: solution.word,
      length: solution.length,
      score: optimalScore,
      timeMs: 0,
      isOptimal: true,
    };
  }
}
