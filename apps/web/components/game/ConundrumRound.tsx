"use client";

import { useRef, useState } from "react";
import { ConundrumRoundState } from "@countdown/game-state";
import { RoundTimer } from "./RoundTimer";

interface ConundrumRoundProps {
  roundState: ConundrumRoundState;
  onSubmit: (solution: string, timeMs: number) => void;
  onTimeExpire: () => void;
  isActive: boolean;
  startTimeMs: number;
}

export function ConundrumRound({
  roundState,
  onSubmit,
  onTimeExpire,
  isActive,
  startTimeMs,
}: ConundrumRoundProps) {
  const [solution, setSolution] = useState("");
  const timerHandled = useRef(false);

  const handleTimeExpire = () => {
    if (timerHandled.current) return;
    timerHandled.current = true;

    const elapsedMs = Date.now() - startTimeMs;
    onSubmit(solution, elapsedMs);
  };

  const handleSubmit = () => {
    if (timerHandled.current) return;
    timerHandled.current = true;

    const elapsedMs = Date.now() - startTimeMs;
    onSubmit(solution, elapsedMs);
  };

  return (
    <div className="space-y-6">
      <RoundTimer
        durationMs={30000}
        onExpire={handleTimeExpire}
        isActive={isActive}
      />

      {/* Anagram Display */}
      <div className="text-center">
        <p className="text-slate-300 text-sm mb-3">Unscramble the 9-letter word</p>
        <div className="bg-slate-700 rounded-lg p-6 mb-4">
          <div className="flex justify-center gap-2 flex-wrap">
            {roundState.letters.map((letter, idx) => (
              <div
                key={idx}
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-xl"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solution Input */}
      <div>
        <label className="text-slate-300 text-sm mb-1 block">Your Solution</label>
        <input
          type="text"
          value={solution}
          onChange={(e) => setSolution(e.target.value.toUpperCase())}
          placeholder="9-letter word"
          maxLength={9}
          className="w-full px-4 py-3 bg-slate-700 text-white text-lg text-center rounded-lg border-2 border-slate-600 focus:border-purple-500 focus:outline-none font-mono"
        />
        <p className="text-slate-400 text-xs mt-1 text-center">
          {solution.length}/9 letters
        </p>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full px-4 py-3 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-all"
      >
        Submit
      </button>
    </div>
  );
}
