"use client";

import { useEffect, useState } from "react";
import { useExpressMatch } from "@countdown/game-state";
import { scoreWord, scoreNumbers } from "@countdown/engine-core";
import { useGameWorker } from "@/lib/useGameWorker";

interface ExpressMatchProps {
  onComplete?: (totalScore: number) => void;
}

export function ExpressMatch({ onComplete }: ExpressMatchProps) {
  const match = useExpressMatch();
  const worker = useGameWorker();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the game on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch words and init worker
        const response = await fetch("/words.txt");
        const wordText = await response.text();
        const words = wordText.split("\n").filter((w) => w.length > 0);

        await worker.init(words);

        // Generate today's puzzle
        const today = new Date().toISOString().split("T")[0];
        const puzzle = await worker.generatePuzzle(today);

        // Start the match
        match.startMatch(
          puzzle.lettersRound.letters,
          puzzle.numbersRound.numbers,
          puzzle.numbersRound.target,
          puzzle.conundrumRound.letters
        );

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize game:", error);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Handle match completion
  useEffect(() => {
    if (match.status === "completed" && onComplete) {
      onComplete(match.totalScore);
    }
  }, [match.status, match.totalScore, onComplete]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Loading game...</p>
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentRound = match.getCurrentRound();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            Countdown-dle
          </h1>
          <p className="text-slate-300">Express Daily Mode</p>
        </header>

        {/* Score Display */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm mb-1">Letters</p>
            <p className="text-2xl font-bold text-blue-400">
              {match.rounds[0]?.result?.score || 0}
            </p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm mb-1">Numbers</p>
            <p className="text-2xl font-bold text-purple-400">
              {match.rounds[1]?.result?.score || 0}
            </p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm mb-1">Conundrum</p>
            <p className="text-2xl font-bold text-pink-400">
              {match.rounds[2]?.result?.score || 0}
            </p>
          </div>
        </div>

        {/* Total Score */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-center">
          <p className="text-slate-200 text-sm mb-2">Total Score</p>
          <p className="text-5xl font-bold text-white">{match.totalScore}</p>
        </div>

        {/* Game Status */}
        <div className="text-center mb-8">
          {match.status === "not_started" && (
            <p className="text-slate-300">Starting game...</p>
          )}
          {match.status === "in_progress" && (
            <div>
              <p className="text-slate-300 mb-2">
                Round {match.currentRoundIndex + 1} of {match.rounds.length}
              </p>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((match.currentRoundIndex + 1) / match.rounds.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
          {match.status === "completed" && (
            <p className="text-green-400 text-lg font-semibold">Game Complete! 🎉</p>
          )}
        </div>

        {/* Current Round Display (placeholder) */}
        {currentRound && (
          <div className="bg-slate-700 rounded-lg p-6 text-white">
            <p className="text-center text-slate-300">
              Round Type: {currentRound.type.toUpperCase()}
            </p>
            <p className="text-center text-slate-400 text-sm mt-2">
              Components coming in next update
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>Countdown-dle v0.1.0 • Phase 2 Development</p>
        </footer>
      </div>
    </main>
  );
}
