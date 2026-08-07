"use client";

import { useEffect, useRef, useState } from "react";
import { LettersRoundState } from "@countdown/game-state";
import { canFormWord, scoreWord } from "@countdown/engine-core";
import { RoundTimer } from "./RoundTimer";
import { isValidWord } from "@/lib/wordSet";

interface LettersRoundProps {
  roundState: LettersRoundState;
  onSubmit: (word: string, timeMs: number) => void;
  onTimeExpire: () => void;
  isActive: boolean;
  startTimeMs: number;
}

export function LettersRound({
  roundState,
  onSubmit,
  onTimeExpire,
  isActive,
  startTimeMs,
}: LettersRoundProps) {
  const [word, setWord] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const timerHandled = useRef(false);

  const handleTimeExpire = () => {
    if (timerHandled.current) return;
    timerHandled.current = true;

    const elapsedMs = Date.now() - startTimeMs;
    onSubmit(word, elapsedMs);
  };

  // Validate word in real-time
  useEffect(() => {
    const validateAsync = async () => {
      if (!word.trim()) {
        setIsValid(false);
        setError("");
        return;
      }

      const hasWordInDict = await isValidWord(word);
      const canForm = canFormWord(word, roundState.letters);

      if (!hasWordInDict) {
        setError("Word not in dictionary");
        setIsValid(false);
      } else if (!canForm) {
        setError("Not enough letters");
        setIsValid(false);
      } else {
        setError("");
        setIsValid(true);
      }
    };

    validateAsync();
  }, [word, roundState.letters]);

  const handleSubmit = () => {
    if (timerHandled.current) return;
    timerHandled.current = true;

    const elapsedMs = Date.now() - startTimeMs;
    onSubmit(word, elapsedMs);
  };

  return (
    <div className="space-y-6">
      <RoundTimer
        durationMs={30000}
        onExpire={handleTimeExpire}
        isActive={isActive}
      />

      {/* Letters Display */}
      <div>
        <p className="text-slate-300 text-sm mb-2">Available Letters</p>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-9">
          {roundState.letters.map((letter, idx) => (
            <div
              key={idx}
              className="aspect-square flex items-center justify-center rounded-lg bg-slate-600 text-white font-bold text-lg"
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      {/* Word Input */}
      <div>
        <label className="text-slate-300 text-sm mb-1 block">Your Word</label>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value.toUpperCase())}
          placeholder="Type or paste a word"
          className="w-full px-4 py-3 bg-slate-700 text-white text-lg rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>

      {/* Word Stats */}
      {word && isValid && (
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-300 text-sm">Points</p>
          <p className="text-3xl font-bold text-green-400">{scoreWord(word.length)}</p>
          <p className="text-slate-400 text-xs mt-1">{word.length}-letter word</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full px-4 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Submit
      </button>
    </div>
  );
}
