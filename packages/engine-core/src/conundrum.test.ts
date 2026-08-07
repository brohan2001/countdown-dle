import { describe, it, expect, beforeEach } from "vitest";
import { Dictionary } from "./dictionary.js";
import { ConundrumSolver } from "./conundrum.js";

describe("ConundrumSolver", () => {
  let solver: ConundrumSolver;

  beforeEach(() => {
    const dict = new Dictionary([
      "EDUCATION", "SCATTERED", "SHOULDERS", "ALGORITHM",
      "NIGHTMARE", "ORCHESTRA", "SOMETHING"
    ]);
    solver = new ConundrumSolver(dict);
  });

  it("validates a correct solution", () => {
    expect(solver.validateSolution("EDUCATION", "UACTIONDE")).toBe(true);
  });

  it("rejects an invalid solution", () => {
    expect(solver.validateSolution("INVALID", "UACTIONDE")).toBe(false);
  });

  it("rejects solution with wrong letter count", () => {
    expect(solver.validateSolution("EDU", "UACTIONDE")).toBe(false);
  });

  it("solves a conundrum", () => {
    const solution = solver.solve("UACTIONDE");
    expect(solution).toBe("EDUCATION");
  });

  it("solves and scores player solution", async () => {
    const result = await solver.solveAndScore(
      "UACTIONDE",
      "EDUCATION",
      5000
    );
    expect(result?.found).toBe(true);
    expect(result?.score).toBe(10);
    expect(result?.solution).toBe("EDUCATION");
  });

  it("handles wrong player solution", async () => {
    const result = await solver.solveAndScore(
      "UACTIONDE",
      "WRONGWORD",
      5000
    );
    expect(result?.found).toBe(false);
    expect(result?.score).toBe(0);
  });

  it("returns all 9-letter solutions", () => {
    const solutions = solver.getAllNineLetterSolutions("UACTIONDE");
    expect(solutions.length).toBeGreaterThan(0);
    expect(solutions[0].length).toBe(9);
  });
});
