import { describe, it, expect, beforeEach } from "vitest";
import { Dictionary } from "./dictionary.js";
import { LettersSolver } from "./letters.js";

describe("LettersSolver", () => {
  let solver: LettersSolver;

  beforeEach(() => {
    const dict = new Dictionary([
      "CAT", "CATS", "CARTS", "CART", "CARS", "ART", "ARTS", "RAT", "RATS",
      "TAR", "TARS", "CAR", "SAT", "AT", "AS", "IS"
    ]);
    solver = new LettersSolver(dict);
  });

  it("validates a correct word", () => {
    expect(solver.validateWord("CAT", ["C", "A", "T", "S", "R", "X", "Y", "Z", "Q"])).toBe(true);
  });

  it("rejects a word with unavailable letters", () => {
    expect(solver.validateWord("DOG", ["C", "A", "T", "S", "R", "X", "Y", "Z", "Q"])).toBe(false);
  });

  it("rejects a word with insufficient letter count", () => {
    expect(solver.validateWord("CATSS", ["C", "A", "T", "S", "R", "X", "Y", "Z", "Q"])).toBe(false);
  });

  it("finds the longest word", () => {
    const result = solver.solve(["C", "A", "R", "T", "S", "R", "X", "Y", "Z"]);
    expect(result).not.toBeNull();
    expect(result?.word).toBe("CARTS");
    expect(result?.length).toBe(5);
  });

  it("scores words correctly", () => {
    expect(solver.scoreWord(2)).toBe(2);
    expect(solver.scoreWord(4)).toBe(4);
    expect(solver.scoreWord(5)).toBe(7);
    expect(solver.scoreWord(6)).toBe(8);
    expect(solver.scoreWord(7)).toBe(9);
    expect(solver.scoreWord(8)).toBe(9);
    expect(solver.scoreWord(9)).toBe(10);
  });

  it("solves and scores player word", async () => {
    const result = await solver.solveAndScore(
      ["C", "A", "R", "T", "S", "R", "X", "Y", "Z"],
      "CAR",
      1500
    );
    expect(result).not.toBeNull();
    expect(result?.word).toBe("CAR");
    expect(result?.length).toBe(3);
    expect(result?.score).toBe(3);
    expect(result?.isOptimal).toBe(false);
  });
});
