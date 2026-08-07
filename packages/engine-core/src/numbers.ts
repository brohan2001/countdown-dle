import { NumbersResult } from "./types.js";

interface NumberState {
  available: number[];
  value: number;
  equation: string;
}

interface SolverResult {
  value: number;
  equation: string;
  distance: number;
}

export function scoreNumbers(exact: boolean, distance: number): number {
  if (exact) return 10;
  if (distance <= 5) return 7;
  if (distance <= 10) return 5;
  if (distance <= 50) return 3;
  return 0;
}

export class NumbersSolver {
  private memo: Map<string, SolverResult>;

  constructor() {
    this.memo = new Map();
  }

  validateExpression(expr: string, availableNumbers: number[]): boolean {
    const trimmed = expr.trim();

    const numberPattern =
      /^(\d+)([\+\-\*/]\d+)*$|^\((\d+)([\+\-\*/](\d|\(.*\)))+\)$/;
    if (!numberPattern.test(trimmed)) return false;

    const usedNumbers = new Set<string>();
    const matches = trimmed.match(/\d+/g) || [];

    for (const match of matches) {
      const num = parseInt(match, 10);
      let found = false;
      for (let i = 0; i < availableNumbers.length; i++) {
        if (
          availableNumbers[i] === num &&
          !usedNumbers.has(i.toString())
        ) {
          usedNumbers.add(i.toString());
          found = true;
          break;
        }
      }
      if (!found) return false;
    }

    try {
      const result = this.safeEval(trimmed);
      return result !== null && Number.isInteger(result) && result > 0;
    } catch {
      return false;
    }
  }

  private safeEval(expr: string): number | null {
    try {
      const cleaned = expr.replace(/[^\d\+\-\*/\(\)]/g, "");
      if (!/^[\d\+\-\*/\(\)]+$/.test(cleaned)) return null;

      const result = Function('"use strict"; return (' + cleaned + ")")();
      if (typeof result === "number" && Number.isInteger(result) && result > 0) {
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }

  private memoKey(numbers: readonly number[]): string {
    return numbers.slice().sort((a, b) => a - b).join(",");
  }

  solve(numbers: number[], target: number): SolverResult {
    const key = this.memoKey(numbers);
    if (this.memo.has(key)) {
      const cached = this.memo.get(key)!;
      if (Math.abs(cached.value - target) <= Math.abs(cached.value - target)) {
        return cached;
      }
    }

    const initialValue = numbers[0] || 0;
    let bestResult: SolverResult = {
      value: initialValue,
      equation: initialValue.toString(),
      distance: Math.abs(initialValue - target),
    };

    const availableWithExpr = numbers.map(n => ({ value: n, expr: n.toString() }));
    this.dfs(availableWithExpr, target, bestResult);

    this.memo.set(key, bestResult);
    return bestResult;
  }

  private dfs(
    available: Array<{ value: number; expr: string }>,
    target: number,
    best: SolverResult
  ): void {
    if (available.length === 0) return;

    for (let i = 0; i < available.length; i++) {
      const current = available[i];
      const distance = Math.abs(current.value - target);

      if (distance < best.distance) {
        best.distance = distance;
        best.value = current.value;
        best.equation = current.expr;
      }

      if (distance === 0) return;

      const remaining = available.filter((_, idx) => idx !== i);
      for (let j = 0; j < remaining.length; j++) {
        const other = remaining[j];
        const results = this.applyOperators(current.value, other.value, current.expr, other.expr);

        for (const result of results) {
          if (result.value <= 0 || result.value > 1000000) continue;

          const newAvailable = remaining
            .filter((_, idx) => idx !== j)
            .concat([result]);
          this.dfs(newAvailable, target, best);
        }
      }
    }
  }

  private applyOperators(
    a: number,
    b: number,
    aExpr: string,
    bExpr: string
  ): Array<{ value: number; expr: string }> {
    const results: Array<{ value: number; expr: string }> = [];
    results.push({ value: a + b, expr: `(${aExpr}+${bExpr})` });
    if (a >= b) results.push({ value: a - b, expr: `(${aExpr}-${bExpr})` });
    results.push({ value: a * b, expr: `(${aExpr}*${bExpr})` });
    if (b !== 0 && a % b === 0) results.push({ value: a / b, expr: `(${aExpr}/${bExpr})` });
    return results;
  }

  scoreNumbers(exact: boolean, distance: number): number {
    return scoreNumbers(exact, distance);
  }

  async solveAndScore(
    numbers: number[],
    target: number,
    playerEquation?: string,
    timeMs?: number
  ): Promise<NumbersResult | null> {
    const solution = this.solve(numbers, target);
    const optimalScore = this.scoreNumbers(solution.distance === 0, solution.distance);

    if (playerEquation) {
      if (!this.validateExpression(playerEquation, numbers)) {
        return {
          equation: playerEquation,
          target: target,
          exact: false,
          distance: 999,
          score: 0,
          timeMs: timeMs || 0,
          isOptimal: false,
        };
      }

      const playerValue = this.safeEval(playerEquation);
      if (playerValue === null) {
        return {
          equation: playerEquation,
          target: target,
          exact: false,
          distance: 999,
          score: 0,
          timeMs: timeMs || 0,
          isOptimal: false,
        };
      }

      const playerDistance = Math.abs(playerValue - target);
      const playerScore = this.scoreNumbers(playerDistance === 0, playerDistance);

      return {
        equation: playerEquation,
        target: target,
        exact: playerDistance === 0,
        distance: playerDistance,
        score: playerScore,
        timeMs: timeMs || 0,
        isOptimal: playerScore === optimalScore,
      };
    }

    return {
      equation: solution.equation,
      target: target,
      exact: solution.distance === 0,
      distance: solution.distance,
      score: optimalScore,
      timeMs: 0,
      isOptimal: true,
    };
  }
}
