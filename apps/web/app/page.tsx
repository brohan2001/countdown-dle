"use client";

import { useEffect, useState } from "react";
import { useExpressMatch } from "@countdown/game-state";
import { Dictionary, PuzzleGenerator } from "@countdown/engine-core";

export default function Home() {
  const expressMatch = useExpressMatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeGame = async () => {
      // For now, use a small demo dictionary
      const demoDict = new Dictionary([
        "HELLO", "WORLD", "COUNTDOWN", "LETTERS", "NUMBERS",
        "PUZZLE", "GAME", "PLAY", "CONTEST", "MATCH"
      ]);

      const generator = new PuzzleGenerator(demoDict);
      const puzzle = await generator.generatePuzzle(new Date().toISOString().split('T')[0]);

      // Start the match
      expressMatch.startMatch(
        puzzle.lettersRound.letters,
        puzzle.numbersRound.numbers,
        puzzle.numbersRound.target,
        puzzle.conundrumRound.letters
      );

      setIsReady(true);
    };

    initializeGame();
  }, []);

  if (!isReady) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Countdown-dle</h1>
        <div className="bg-slate-700 rounded-lg p-6 text-white">
          <p className="text-lg">Game Status: {expressMatch.status}</p>
          <p className="text-lg">Round: {expressMatch.currentRoundIndex + 1} / {expressMatch.rounds.length}</p>
          <p className="text-lg">Total Score: {expressMatch.totalScore}</p>
          {expressMatch.getCurrentRound() && (
            <div className="mt-4 p-4 bg-slate-600 rounded">
              <p className="text-sm">Current Round Type: {expressMatch.getCurrentRound()?.type}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
