import * as fs from "fs";
import * as readline from "readline";
import { Dictionary, LettersSolver, NumbersSolver, ConundrumSolver, PuzzleGenerator } from "./index.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function runDemo() {
  console.log("\n🎮 Countdown-dle Engine Demo\n");

  // Load a demo dictionary
  const demoWords = [
    "CAT", "CATS", "CARTS", "CART", "CARS", "ART", "ARTS", "RAT", "RATS",
    "TAR", "TARS", "CAR", "SAT", "AT", "AS", "IS", "AND", "THE", "THAT",
    "WITH", "HAVE", "FROM", "THEY", "BEEN", "EACH", "WORD", "SAID", "SOME",
    "MAKE", "LIKE", "TAKE", "JUST", "KNOW", "GOOD", "COME", "MORE", "GIVE",
    "EDUCATION", "SCATTERED", "SHOULDERS", "ALGORITHM", "NIGHTMARE", "ORCHESTRA", "SOMETHING"
  ];

  const dict = new Dictionary(demoWords);
  const lettersSolver = new LettersSolver(dict);
  const numbersSolver = new NumbersSolver();
  const conundrumSolver = new ConundrumSolver(dict);
  const generator = new PuzzleGenerator(dict);

  let running = true;
  while (running) {
    console.log("\n--- Main Menu ---");
    console.log("1. Play Letters Round");
    console.log("2. Play Numbers Round");
    console.log("3. Play Conundrum Round");
    console.log("4. Generate & Evaluate Puzzle");
    console.log("5. Exit");

    const choice = await question("\nChoose an option: ");

    switch (choice) {
      case "1": {
        console.log("\n--- Letters Round ---");
        const letters = ["C", "A", "R", "T", "S", "R", "X", "Y", "Z"];
        console.log(`Letters: ${letters.join(" ")}`);

        const solution = lettersSolver.solve(letters);
        if (solution) {
          console.log(`Optimal word: ${solution.word} (${solution.length} letters)`);
        }

        const playerWord = await question("Enter your word: ");
        const result = await lettersSolver.solveAndScore(letters, playerWord);
        if (result) {
          console.log(`\nResult: ${result.word}`);
          console.log(`Score: ${result.score} points`);
          console.log(`Optimal: ${result.isOptimal ? "Yes ✓" : "No ✗"}`);
        }
        break;
      }

      case "2": {
        console.log("\n--- Numbers Round ---");
        const numbers = [75, 50, 25, 10, 5, 1];
        const target = 481;
        console.log(`Numbers: ${numbers.join(", ")}`);
        console.log(`Target: ${target}`);

        const solution = numbersSolver.solve(numbers, target);
        console.log(`Solution distance: ${solution.distance}`);
        console.log(`Closest value: ${solution.value}`);

        const playerEq = await question("Enter your equation: ");
        const result = await numbersSolver.solveAndScore(numbers, target, playerEq);
        if (result) {
          console.log(`\nResult: ${result.equation} = ${result.target}`);
          console.log(`Your value: ${result.target}`);
          console.log(`Distance: ${result.distance}`);
          console.log(`Score: ${result.score} points`);
          console.log(`Exact: ${result.exact ? "Yes ✓" : "No ✗"}`);
        }
        break;
      }

      case "3": {
        console.log("\n--- Conundrum Round ---");
        const anagram = "UACTIONDE";
        console.log(`Anagram: ${anagram}`);

        const solution = conundrumSolver.solve(anagram);
        console.log(`Solution: ${solution}`);

        const playerSol = await question("Enter your solution: ");
        const result = await conundrumSolver.solveAndScore(anagram, playerSol);
        if (result) {
          console.log(`\nResult: ${result.solution}`);
          console.log(`Found: ${result.found ? "Yes ✓" : "No ✗"}`);
          console.log(`Score: ${result.score} points`);
        }
        break;
      }

      case "4": {
        console.log("\n--- Generating Puzzle ---");
        const today = new Date().toISOString().split("T")[0];
        const puzzle = await generator.generatePuzzle(today);
        const qualityReport = await generator.qualityCheck(puzzle);

        console.log(`\nLetters: ${puzzle.lettersRound.letters.join(" ")}`);
        console.log(`Numbers: ${puzzle.numbersRound.numbers.join(", ")} → ${puzzle.numbersRound.target}`);
        console.log(`Conundrum: ${puzzle.conundrumRound.letters.join("")}`);

        console.log(`\n--- Quality Report ---`);
        console.log(`Longest word: ${qualityReport.longestWordFound} (${qualityReport.longestWordLength} letters)`);
        console.log(`Numbers exact: ${qualityReport.numbersExact ? "Yes" : "No"}`);
        console.log(`Numbers closest distance: ${qualityReport.numbersClosestDistance}`);
        console.log(`Conundrum solvable: ${qualityReport.conundrumUnique ? "Yes" : "No"}`);
        console.log(`Quality passed: ${qualityReport.passed ? "✓" : "✗"}`);
        break;
      }

      case "5":
        running = false;
        console.log("\nGoodbye! 👋");
        break;

      default:
        console.log("Invalid choice. Please try again.");
    }
  }

  rl.close();
}

runDemo().catch(console.error);
