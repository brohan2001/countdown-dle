import { Puzzle, LettersRound, NumbersRound, ConundrumRound } from "./types.js";
import { Dictionary } from "./dictionary.js";
import { LettersSolver } from "./letters.js";
import { NumbersSolver } from "./numbers.js";
import { ConundrumSolver } from "./conundrum.js";

export interface QualityReport {
  longestWordFound: string;
  longestWordLength: number;
  numbersExact: boolean;
  numbersClosestDistance: number;
  conundrumUnique: boolean;
  conundrumSolutionCount: number;
  passed: boolean;
}

export class PuzzleGenerator {
  private lettersSolver: LettersSolver;
  private numbersSolver: NumbersSolver;
  private conundrumSolver: ConundrumSolver;

  constructor(dictionary: Dictionary) {
    this.lettersSolver = new LettersSolver(dictionary);
    this.numbersSolver = new NumbersSolver();
    this.conundrumSolver = new ConundrumSolver(dictionary);
  }

  private generateLettersRound(): LettersRound {
    const vowels = ["A", "E", "I", "O", "U"];
    const consonants = [
      "B", "C", "D", "F", "G", "H", "J", "K", "L", "M",
      "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z",
    ];

    const letters: string[] = [];
    let vowelCount = 0;

    for (let i = 0; i < 9; i++) {
      if (vowelCount < 3 && Math.random() < 0.4) {
        letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
        vowelCount++;
      } else if (vowelCount < 4) {
        letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
        vowelCount++;
      } else {
        letters.push(consonants[Math.floor(Math.random() * consonants.length)]);
      }
    }

    return {
      type: "letters",
      letters,
      timeLimit: 30000,
    };
  }

  private generateNumbersRound(): NumbersRound {
    const small = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const large = [25, 50, 75, 100];

    const numbers: number[] = [];
    const largeCount = Math.random() < 0.5 ? 1 : 2;

    for (let i = 0; i < largeCount; i++) {
      numbers.push(large[Math.floor(Math.random() * large.length)]);
    }

    for (let i = 0; i < 6 - largeCount; i++) {
      numbers.push(small[Math.floor(Math.random() * small.length)]);
    }

    const target = 100 + Math.floor(Math.random() * 900);

    return {
      type: "numbers",
      numbers,
      target,
      timeLimit: 30000,
    };
  }

  private generateConundrumRound(): ConundrumRound {
    const consonants = [
      "B", "C", "D", "F", "G", "H", "J", "K", "L", "M",
      "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z",
    ];
    const vowels = ["A", "E", "I", "O", "U"];

    const letters: string[] = [];
    let vowelCount = 0;

    for (let i = 0; i < 9; i++) {
      if (vowelCount < 3 && Math.random() < 0.4) {
        letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
        vowelCount++;
      } else if (vowelCount < 4) {
        letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
        vowelCount++;
      } else {
        letters.push(consonants[Math.floor(Math.random() * consonants.length)]);
      }
    }

    return {
      type: "conundrum",
      letters,
      solution: "",
      timeLimit: 30000,
    };
  }

  async generatePuzzle(playDate: string): Promise<Puzzle> {
    const lettersRound = this.generateLettersRound();
    const numbersRound = this.generateNumbersRound();
    const conundrumRound = this.generateConundrumRound();

    return {
      id: `puzzle-${playDate}`,
      playDate,
      lettersRound,
      numbersRound,
      conundrumRound,
    };
  }

  async qualityCheck(puzzle: Puzzle): Promise<QualityReport> {
    const lettersSolution = this.lettersSolver.solve(puzzle.lettersRound.letters);
    const numbersSolution = this.numbersSolver.solve(
      puzzle.numbersRound.numbers,
      puzzle.numbersRound.target
    );

    const conundrumAnagram = puzzle.conundrumRound.letters.join("");
    const conundrumSolutions = this.conundrumSolver.getAllNineLetterSolutions(
      conundrumAnagram
    );

    const passed =
      (lettersSolution?.length || 0) >= 5 &&
      numbersSolution.distance <= 5 &&
      conundrumSolutions.length === 1;

    return {
      longestWordFound: lettersSolution?.word || "",
      longestWordLength: lettersSolution?.length || 0,
      numbersExact: numbersSolution.distance === 0,
      numbersClosestDistance: numbersSolution.distance,
      conundrumUnique: conundrumSolutions.length === 1,
      conundrumSolutionCount: conundrumSolutions.length,
      passed,
    };
  }
}
