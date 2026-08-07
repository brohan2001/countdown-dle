"use client";

import { useEffect, useState } from "react";
import { useExpressMatch } from "@countdown/game-state";
import { useGameWorker } from "@/lib/useGameWorker";
import { getWordSet } from "@/lib/wordSet";
import { ExpressMatch } from "@/components/game/ExpressMatch";

export default function Home() {
  const match = useExpressMatch();
  const gameWorker = useGameWorker();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Load word set
        await getWordSet();

        // Initialize worker with words
        const words = await fetch("/words.txt").then((res) => res.text());
        const wordList = words.split("\n").filter((w) => w.trim());
        await gameWorker.init(wordList);

        // Generate today's puzzle
        const today = new Date();
        const puzzle = await gameWorker.generatePuzzle(today.toISOString().split("T")[0]);

        // Start the match
        match.startMatch(
          puzzle.lettersRound.letters,
          puzzle.numbersRound.numbers,
          puzzle.numbersRound.target,
          puzzle.conundrumRound.letters
        );

        setReady(true);
      } catch (err) {
        console.error("Failed to initialize game:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize game");
      }
    };

    initializeGame();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading today's puzzle...</p>
        </div>
      </div>
    );
  }

  return <ExpressMatch />;
}
