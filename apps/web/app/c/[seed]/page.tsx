"use client";

import { useEffect, useState } from "react";
import { useExpressMatch } from "@countdown/game-state";
import { useGameWorker } from "@/lib/useGameWorker";
import { getWordSet } from "@/lib/wordSet";
import { ExpressMatch } from "@/components/game/ExpressMatch";
import { useRouter } from "next/navigation";

interface PageProps {
  params: {
    seed: string;
  };
}

export default function CustomChallengePage({ params }: PageProps) {
  const router = useRouter();
  const match = useExpressMatch();
  const gameWorker = useGameWorker();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Load word set
        await getWordSet();

        // Initialize worker
        const words = await fetch("/words.txt").then((res) => res.text());
        const wordList = words.split("\n").filter((w) => w.trim());
        await gameWorker.init(wordList);

        // Fetch custom challenge from database
        const response = await fetch(
          `/api/challenges/get?code=${params.seed}`
        );

        if (!response.ok) {
          throw new Error("Challenge not found");
        }

        const data = await response.json();
        const puzzle = data.data;

        // Increment play count
        await fetch(`/api/challenges/play`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId: puzzle.id }),
        });

        // Start the match with custom puzzle
        match.startMatch(
          puzzle.puzzle_seed.letters,
          puzzle.puzzle_seed.numbers,
          puzzle.puzzle_seed.target,
          puzzle.puzzle_seed.conundrum
        );

        setReady(true);
      } catch (err) {
        console.error("Failed to initialize game:", err);
        setError(err instanceof Error ? err.message : "Failed to load challenge");
      }
    };

    initializeGame();
  }, [params.seed]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Challenge Not Found</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading challenge...</p>
        </div>
      </div>
    );
  }

  return <ExpressMatch />;
}
