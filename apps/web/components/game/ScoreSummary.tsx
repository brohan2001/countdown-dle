"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LettersResult, NumbersResult, ConundrumResult } from "@countdown/engine-core";
import { ExpressMatchState } from "@countdown/game-state";
import { generateEmojiSummary } from "@/lib/emojiSummary";

interface ScoreSummaryProps {
  match: ExpressMatchState;
  onPlayAgain: () => void;
}

export function ScoreSummary({ match, onPlayAgain }: ScoreSummaryProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyShare = async () => {
    const lettersResult = (match.rounds[0]?.result as LettersResult | undefined);
    const numbersResult = (match.rounds[1]?.result as NumbersResult | undefined);
    const conundrumResult = (match.rounds[2]?.result as ConundrumResult | undefined);

    const emoji = generateEmojiSummary(lettersResult, numbersResult, conundrumResult);
    const text = `Countdown-dle ${new Date().toLocaleDateString()}\n\n${emoji}\n\nhttps://countdown-dle.com`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy share text:", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Title */}
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Match Complete!</h2>
        <p className="text-slate-300">{new Date().toLocaleDateString()}</p>
      </motion.div>

      {/* Round Results */}
      <motion.div variants={itemVariants} className="space-y-2">
        {match.rounds.map((round, idx) => (
          <div
            key={idx}
            className="bg-slate-700 rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex-1">
              <p className="text-slate-300 text-sm capitalize font-semibold">
                {round.type}
              </p>
              <p className="text-slate-400 text-xs">
                {round.result
                  ? round.type === "letters"
                    ? `"${(round.result as any).word || "—"}"`
                    : round.type === "numbers"
                      ? `${(round.result as any).equation || "—"}`
                      : `"${(round.result as any).word || "—"}"`
                  : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                {round.result ? (round.result as any).score || 0 : 0}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Total Score */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-center"
      >
        <p className="text-slate-200 text-sm mb-2">Total Score</p>
        <p className="text-4xl font-bold text-white">{match.totalScore}</p>
      </motion.div>

      {/* Emoji Summary */}
      <motion.div variants={itemVariants} className="bg-slate-700 rounded-lg p-6">
        <p className="text-slate-300 text-center text-sm font-semibold mb-3">
          Share Your Result
        </p>
        <pre className="text-center text-sm text-slate-200 font-mono mb-4 whitespace-pre-wrap break-words">
          {generateEmojiSummary(
            match.rounds[0]?.result as LettersResult | undefined,
            match.rounds[1]?.result as NumbersResult | undefined,
            match.rounds[2]?.result as ConundrumResult | undefined
          )}
        </pre>
        <button
          onClick={handleCopyShare}
          className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
            copied
              ? "bg-green-600 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </motion.div>

      {/* Buttons */}
      <motion.div variants={itemVariants} className="flex gap-4">
        <button
          onClick={onPlayAgain}
          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-all"
        >
          Play Again
        </button>
        <button
          onClick={() => window.location.href = "/"}
          className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition-all"
        >
          Home
        </button>
      </motion.div>
    </motion.div>
  );
}
