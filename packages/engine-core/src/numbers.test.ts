import { describe, it, expect, beforeEach } from "vitest";
import { NumbersSolver } from "./numbers.js";

describe("NumbersSolver", () => {
  let solver: NumbersSolver;

  beforeEach(() => {
    solver = new NumbersSolver();
  });

  it("validates a correct expression", () => {
    expect(solver.validateExpression("75+50", [75, 50, 1, 2, 3, 4])).toBe(true);
  });

  it("rejects an expression with unavailable numbers", () => {
    expect(solver.validateExpression("75+60", [75, 50, 1, 2, 3, 4])).toBe(false);
  });

  it("rejects invalid expressions", () => {
    expect(solver.validateExpression("abc", [75, 50, 1, 2, 3, 4])).toBe(false);
  });

  it("solves a numbers puzzle", () => {
    const result = solver.solve([75, 50, 25, 10, 5, 1], 100);
    expect(result.distance).toBeLessThanOrEqual(1);
    expect(result.value).toBe(100);
  });

  it("finds closest when exact is impossible", () => {
    const result = solver.solve([1, 2, 3, 4, 5, 6], 1000);
    expect(result.distance).toBeGreaterThan(0);
  });

  it("scores numbers correctly", () => {
    expect(solver.scoreNumbers(true, 0)).toBe(10);
    expect(solver.scoreNumbers(false, 3)).toBe(7);
    expect(solver.scoreNumbers(false, 8)).toBe(5);
    expect(solver.scoreNumbers(false, 30)).toBe(3);
    expect(solver.scoreNumbers(false, 100)).toBe(0);
  });

  it("validates and scores a player equation", async () => {
    const result = await solver.solveAndScore(
      [75, 50, 25, 10, 5, 1],
      100,
      "75+25",
      2000
    );
    expect(result?.exact).toBe(true);
    expect(result?.distance).toBe(0);
    expect(result?.score).toBe(10);
  });

  it("handles invalid player equation", async () => {
    const result = await solver.solveAndScore(
      [75, 50, 25, 10, 5, 1],
      100,
      "999+999",
      2000
    );
    expect(result?.exact).toBe(false);
    expect(result?.score).toBe(0);
  });
});
