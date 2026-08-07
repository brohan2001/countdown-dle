import { LettersResult, NumbersResult, ConundrumResult } from "@countdown/engine-core";

/**
 * Generate a Wordle-style emoji grid summarizing the game results.
 * Shows per-round accuracy with colors for performance.
 */
export function generateEmojiSummary(
  lettersResult?: LettersResult,
  numbersResult?: NumbersResult,
  conundrumResult?: ConundrumResult
): string {
  const lines: string[] = [];
  const title = "Countdown-dle";

  lines.push(title);

  // Letters round: show word length and optimality
  if (lettersResult) {
    const isOptimal = lettersResult.isOptimal ? "✓" : "✗";
    const lengthIndicator = lettersResult.length
      .toString()
      .padStart(2);
    const scoreBar =
      "█".repeat(Math.min(10, Math.ceil(lettersResult.score))) +
      "░".repeat(Math.max(0, 10 - Math.ceil(lettersResult.score)));
    lines.push(`Letters: ${lengthIndicator} letters ${isOptimal} [${scoreBar}] ${lettersResult.score}pts`);
  }

  // Numbers round: show distance and optimality
  if (numbersResult) {
    const isOptimal = numbersResult.isOptimal ? "✓" : "✗";
    const exact = numbersResult.exact ? "📍" : "📏";
    const distanceStr = numbersResult.distance
      .toString()
      .padStart(3);
    const scoreBar =
      "█".repeat(Math.min(10, Math.ceil(numbersResult.score))) +
      "░".repeat(Math.max(0, 10 - Math.ceil(numbersResult.score)));
    lines.push(
      `Numbers: ${exact} ${distanceStr} away ${isOptimal} [${scoreBar}] ${numbersResult.score}pts`
    );
  }

  // Conundrum round: show found/not found
  if (conundrumResult) {
    const found = conundrumResult.found ? "🎯" : "❌";
    const scoreBar = conundrumResult.found
      ? "██████████"
      : "░░░░░░░░░░";
    lines.push(
      `Conundrum: ${found} ${conundrumResult.found ? conundrumResult.solution : "Unsolved"} [${scoreBar}] ${conundrumResult.score}pts`
    );
  }

  return lines.join("\n");
}

/**
 * Generate a compact emoji-grid share format (minimal, grid-based).
 * Useful for sharing on social media.
 */
export function generateCompactEmojiGrid(
  lettersResult?: LettersResult,
  numbersResult?: NumbersResult,
  conundrumResult?: ConundrumResult
): string {
  const grid: string[] = [];

  // Each round as a single emoji representing performance
  if (lettersResult) {
    if (lettersResult.isOptimal && lettersResult.score === 10) {
      grid.push("🟩"); // Optimal 9-letter
    } else if (lettersResult.score >= 7) {
      grid.push("🟨"); // Good score
    } else if (lettersResult.score > 0) {
      grid.push("🟧"); // Some points
    } else {
      grid.push("⬜"); // No points
    }
  }

  if (numbersResult) {
    if (numbersResult.isOptimal && numbersResult.exact) {
      grid.push("🟩"); // Exact match
    } else if (numbersResult.score >= 7) {
      grid.push("🟨"); // Within 5
    } else if (numbersResult.score > 0) {
      grid.push("🟧"); // Some points
    } else {
      grid.push("⬜"); // No points (too far)
    }
  }

  if (conundrumResult) {
    grid.push(conundrumResult.found ? "🟩" : "⬜");
  }

  return `Countdown-dle\n${grid.join("")}`;
}
