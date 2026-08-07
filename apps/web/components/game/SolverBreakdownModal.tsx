"use client";

import { motion } from "framer-motion";
import { NumbersResult, LettersResult } from "@countdown/engine-core";

interface SolverBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundType: "letters" | "numbers" | "conundrum";
  optimalResult?: LettersResult | NumbersResult;
  playerResult?: LettersResult | NumbersResult;
}

export function SolverBreakdownModal({
  isOpen,
  onClose,
  roundType,
  optimalResult,
  playerResult,
}: SolverBreakdownModalProps) {
  if (!isOpen || !optimalResult) return null;

  const isLetters = roundType === "letters";
  const isNumbers = roundType === "numbers";
  const isConundrum = roundType === "conundrum";

  const optimalScore = "score" in optimalResult ? optimalResult.score : 0;
  const playerScore = playerResult && "score" in playerResult ? playerResult.score : 0;

  const didPlayerWin = playerScore >= optimalScore;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {didPlayerWin ? "Perfect! 🎉" : "Optimal Solution"}
        </h2>

        {isLetters && "word" in optimalResult && (
          <div className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Best Word</p>
              <p className="text-3xl font-bold text-green-400">
                {optimalResult.word || "—"}
              </p>
              <p className="text-slate-400 text-xs mt-2">
                {optimalResult.score} points
              </p>
            </div>

            {playerResult && "word" in playerResult && playerResult.word !== optimalResult.word && (
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Your Answer</p>
                <p className="text-xl text-blue-400">{playerResult.word}</p>
                <p className="text-slate-400 text-xs mt-2">
                  {playerResult.score} points
                </p>
              </div>
            )}
          </div>
        )}

        {isNumbers && "equation" in optimalResult && (
          <div className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Optimal Equation</p>
              <p className="text-xl font-mono text-purple-400 break-all">
                {optimalResult.equation || "—"}
              </p>
              <p className="text-slate-300 text-sm mt-2">
                Target: {optimalResult.target}
              </p>
              <p className="text-slate-400 text-xs mt-2">
                {optimalResult.exact ? "Exact!" : `${optimalResult.distance} away`} —{" "}
                {optimalResult.score} points
              </p>
            </div>

            {playerResult && "equation" in playerResult && playerResult.equation !== optimalResult.equation && (
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Your Equation</p>
                <p className="text-lg font-mono text-blue-400 break-all">
                  {playerResult.equation}
                </p>
                <p className="text-slate-300 text-sm mt-2">
                  Target: {playerResult.target}
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  {playerResult.exact ? "Exact!" : `${playerResult.distance} away`} —{" "}
                  {playerResult.score} points
                </p>
              </div>
            )}
          </div>
        )}

        {isConundrum && "word" in optimalResult && (
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">The Answer</p>
            <p className="text-3xl font-bold text-pink-400">
              {optimalResult.word || "—"}
            </p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all"
        >
          Dismiss
        </button>
      </motion.div>
    </motion.div>
  );
}
