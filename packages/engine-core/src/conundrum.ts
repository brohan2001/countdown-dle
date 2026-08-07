import { Dictionary } from "./dictionary.js";
import { ConundrumResult } from "./types.js";

export class ConundrumSolver {
  constructor(private dictionary: Dictionary) {}

  validateSolution(solution: string, anagram: string): boolean {
    const upperSolution = solution.toUpperCase();
    const upperAnagram = anagram.toUpperCase();

    if (upperSolution.length !== 9 || upperAnagram.length !== 9) {
      return false;
    }

    if (!this.dictionary.isValid(upperSolution)) {
      return false;
    }

    const solutionChars = [...upperSolution].sort();
    const anagramChars = [...upperAnagram].sort();

    return solutionChars.join() === anagramChars.join();
  }

  solve(anagram: string): string | null {
    const words = this.dictionary.getAllWordsFromLetters([...anagram]);
    if (words.length === 0) return null;

    const nineLetterWords = words.filter((w) => w.length === 9);
    if (nineLetterWords.length === 0) return null;

    return nineLetterWords[0];
  }

  async solveAndScore(
    anagram: string,
    playerSolution?: string,
    timeMs?: number
  ): Promise<ConundrumResult | null> {
    const solution = this.solve(anagram);
    if (!solution) return null;

    if (playerSolution) {
      const valid = this.validateSolution(playerSolution, anagram);
      return {
        solution: playerSolution.toUpperCase(),
        found: valid,
        timeMs: timeMs || 0,
        score: valid ? 10 : 0,
      };
    }

    return {
      solution: solution.toUpperCase(),
      found: true,
      timeMs: 0,
      score: 10,
    };
  }
}
