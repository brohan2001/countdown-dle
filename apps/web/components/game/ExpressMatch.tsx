"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useExpressMatch } from "@countdown/game-state";
import { LettersResult, NumbersResult, ConundrumResult } from "@countdown/engine-core";
import { useGameWorker } from "@/lib/useGameWorker";
import { LettersRound } from "./LettersRound";
import { NumbersRound } from "./NumbersRound";
import { ConundrumRound } from "./ConundrumRound";
import { ScoreSummary } from "./ScoreSummary";
import { SolverBreakdownModal } from "./SolverBreakdownModal";
import { DictionaryModal } from "./DictionaryModal";

export function ExpressMatch() {
  const match = useExpressMatch();
  const gameWorker = useGameWorker();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [showDictionary, setShowDictionary] = useState(false);
  const [solvePromise, setSolvePromise] = useState<Promise<any> | null>(null);
  const matchStartTime = useRef(Date.now());

  const currentRound = match.rounds[match.currentRoundIndex];
  const isMatchComplete = match.status === "completed";

  // Handle round submissions
  const handleRoundSubmit = async (submission: string, timeMs: number) => {
    if (!currentRound) return;

    if (currentRound.type === "letters") {
      const wordLength = submission.length;
      const score = wordLength > 0 ? (wordLength >= 7 ? 10 : Math.min(wordLength, 5)) : 0;
      const result: LettersResult = {
        word: submission,
        length: wordLength,
        score,
        timeMs,
        isOptimal: false,
      };
      match.completeRound(score, result);
    } else if (currentRound.type === "numbers") {
      const result: NumbersResult = {
        equation: submission,
        target: (currentRound as any).target,
        exact: false,
        distance: 999,
        score: 0,
        timeMs,
        isOptimal: false,
      };
      match.completeRound(0, result);
    } else if (currentRound.type === "conundrum") {
      const score = submission ? 10 : 0;
      const result: ConundrumResult = {
        solution: submission,
        found: !!submission,
        timeMs,
        score,
      };
      match.completeRound(score, result);
    }

    // Move to next round after a brief pause
    setTimeout(() => {
      if (match.currentRoundIndex < match.rounds.length - 1) {
        match.nextRound();
      } else {
        match.completeMatch();
      }
    }, 1000);
  };

  const handlePlayAgain = () => {
    // Reload the page to start a fresh game
    window.location.reload();
  };

  if (isMatchComplete) {
    return <ScoreSummary match={match} onPlayAgain={handlePlayAgain} />;
  }

  if (!currentRound) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-300">Loading match...</p>
      </div>
    );
  }

  const roundNumber = match.currentRoundIndex + 1;
  const isActive = currentRound.state === "active";
  const roundStartTime = Date.now() - ((roundNumber - 1) * 30 * 1000);

  return (
    <>
      {/* Round Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        key={roundNumber}
        className="mb-8"
      >
        <div className="text-center mb-6">
          <p className="text-slate-400 text-sm mb-2">
            Round {roundNumber} of {match.rounds.length}
          </p>
          <h1 className="text-3xl font-bold text-white capitalize">
            {currentRound.type} Round
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            {currentRound.type === "letters"
              ? "Make the longest word from the given letters"
              : currentRound.type === "numbers"
                ? "Use the given numbers and operators to reach the target"
                : "Unscramble the 9-letter anagram"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((roundNumber - 1) / match.rounds.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </motion.div>

      {/* Round Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        key={`round-${roundNumber}`}
      >
        {currentRound.type === "letters" && (
          <LettersRound
            roundState={currentRound as any}
            onSubmit={handleRoundSubmit}
            onTimeExpire={() => handleRoundSubmit("", 30000)}
            isActive={isActive}
            startTimeMs={roundStartTime}
          />
        )}

        {currentRound.type === "numbers" && (
          <NumbersRound
            roundState={currentRound as any}
            onSubmit={handleRoundSubmit}
            onTimeExpire={() => handleRoundSubmit("", 30000)}
            isActive={isActive}
            startTimeMs={roundStartTime}
          />
        )}

        {currentRound.type === "conundrum" && (
          <ConundrumRound
            roundState={currentRound as any}
            onSubmit={handleRoundSubmit}
            onTimeExpire={() => handleRoundSubmit("", 30000)}
            isActive={isActive}
            startTimeMs={roundStartTime}
          />
        )}
      </motion.div>

      {/* Score Display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-slate-700 rounded-lg p-4 text-center"
      >
        <p className="text-slate-400 text-sm">Current Score</p>
        <p className="text-3xl font-bold text-green-400">{match.totalScore}</p>
      </motion.div>

      {/* Modals */}
      <SolverBreakdownModal
        isOpen={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        roundType={currentRound.type as any}
      />

      <DictionaryModal
        isOpen={showDictionary}
        onClose={() => setShowDictionary(false)}
        word={selectedWord}
      />
    </>
  );
}
