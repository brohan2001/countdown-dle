import { Dictionary } from "./dictionary.js";
import { LettersResult } from "./types.js";

export class LettersSolver {
  constructor(private dictionary: Dictionary) {}

  validateWord(word: string, availableLetters: string[]): boolean {
    const upperWord = word.toUpperCase();
    if (!this.dictionary.isValid(upperWord)) return false;

    const letterCounts = new Map<string, number>();
    for (const letter of availableLetters) {
      const upper = letter.toUpperCase();
      letterCounts.set(upper, (letterCounts.get(upper) || 0) + 1);
    }

    for (const char of upperWord) {
      const count = letterCounts.get(char) || 0;
      if (count <= 0) return false;
      letterCounts.set(char, count - 1);
    }

    return true;
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
    if (length < 2) return 0;
    if (length <= 4) return length;
    if (length === 5) return 7;
    if (length === 6) return 8;
    if (length === 7) return 9;
    if (length === 8) return 9;
    return 10; // 9 letters
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
