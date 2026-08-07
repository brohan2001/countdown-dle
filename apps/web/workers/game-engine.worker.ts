import {
  Dictionary,
  LettersSolver,
  NumbersSolver,
  ConundrumSolver,
  PuzzleGenerator,
} from "@countdown/engine-core";
import type {
  WorkerRequest,
  WorkerResponse,
  InitMessage,
  GeneratePuzzleMessage,
  SolveLettersMessage,
  SolveNumbersMessage,
  SolveConundrumMessage,
} from "../lib/workerProtocol";

let dictionary: Dictionary | null = null;
let lettersSolver: LettersSolver | null = null;
let numbersSolver: NumbersSolver | null = null;
let conundrumSolver: ConundrumSolver | null = null;
let puzzleGenerator: PuzzleGenerator | null = null;

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, type, payload } = event.data;

  try {
    let response: WorkerResponse | null = null;

    switch (type) {
      case "INIT": {
        const msg = event.data as InitMessage;
        if (!msg.payload) throw new Error("INIT payload missing");
        dictionary = new Dictionary(msg.payload.words);
        lettersSolver = new LettersSolver(dictionary);
        numbersSolver = new NumbersSolver();
        conundrumSolver = new ConundrumSolver(dictionary);
        puzzleGenerator = new PuzzleGenerator(dictionary);

        response = {
          id,
          type: "INIT_RESPONSE",
        };
        break;
      }

      case "GENERATE_PUZZLE": {
        if (!puzzleGenerator) throw new Error("Worker not initialized");
        const msg = event.data as GeneratePuzzleMessage;
        if (!msg.payload) throw new Error("GENERATE_PUZZLE payload missing");
        const puzzle = await puzzleGenerator.generatePuzzle(msg.payload.playDate);

        response = {
          id,
          type: "GENERATE_PUZZLE_RESPONSE",
          payload: { puzzle },
        };
        break;
      }

      case "SOLVE_LETTERS": {
        if (!lettersSolver) throw new Error("Worker not initialized");
        const msg = event.data as SolveLettersMessage;
        if (!msg.payload) throw new Error("SOLVE_LETTERS payload missing");
        const result = await lettersSolver.solveAndScore(msg.payload.letters);

        response = {
          id,
          type: "SOLVE_LETTERS_RESPONSE",
          payload: { result },
        };
        break;
      }

      case "SOLVE_NUMBERS": {
        if (!numbersSolver) throw new Error("Worker not initialized");
        const msg = event.data as SolveNumbersMessage;
        if (!msg.payload) throw new Error("SOLVE_NUMBERS payload missing");
        const solveResult = numbersSolver.solve(msg.payload.numbers, msg.payload.target);

        response = {
          id,
          type: "SOLVE_NUMBERS_RESPONSE",
          payload: { result: solveResult },
        };
        break;
      }

      case "SOLVE_CONUNDRUM": {
        if (!conundrumSolver) throw new Error("Worker not initialized");
        const msg = event.data as SolveConundrumMessage;
        if (!msg.payload) throw new Error("SOLVE_CONUNDRUM payload missing");
        const solutions = conundrumSolver.getAllNineLetterSolutions(msg.payload.anagram);

        response = {
          id,
          type: "SOLVE_CONUNDRUM_RESPONSE",
          payload: { solutions },
        };
        break;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    if (response) {
      self.postMessage(response);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    self.postMessage({
      id,
      type: `${event.data.type}_RESPONSE`,
      error: errorMessage,
    } as WorkerResponse);
  }
};
