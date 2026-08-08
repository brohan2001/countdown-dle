"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useExpressMatch } from "@countdown/game-state";
import { LettersResult, NumbersResult, ConundrumResult } from "@countdown/engine-core";
import { supabase } from "@/lib/supabase";
import { useGameWorker } from "@/lib/useGameWorker";
import { generateEmojiSummary } from "@/lib/emojiSummary";
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
  const [submitting, setSubmitting] = useState(false);
  const matchStartTime = useRef(Date.now());
  const puzzleId = useRef<string>(`daily-${new Date().toISOString().split("T")[0]}`);

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
        // Match complete - submit results to database
        submitMatchResults();
      }
    }, 1000);
  };

  const submitMatchResults = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      let userId: string | null = null;
      let guestId: string | null = null;

      if (user) {
        userId = user.id;
      } else {
        guestId = localStorage.getItem("countdown_guest_id") ||
          `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (!localStorage.getItem("countdown_guest_id")) {
          localStorage.setItem("countdown_guest_id", guestId);
        }
      }

      const roundResults = match.rounds
        .map((round) => round.result)
        .filter(Boolean);

      const emojiSummary = generateEmojiSummary(
        roundResults[0] as any,
        roundResults[1] as any,
        roundResults[2] as any
      );

      const response = await fetch("/api/game-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || undefined,
          guestId: guestId || undefined,
          puzzleId: puzzleId.current,
          mode: "express",
          roundResults,
          emojiSummary,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to submit results: ${response.statusText}`);
      }

      match.completeMatch();
    } catch (err) {
      console.error("Error submitting match results:", err);
      // Still complete the match even if submission fails
      match.completeMatch();
    } finally {
      setSubmitting(false);
    }
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

      {submitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3" />
            <p className="text-slate-200">Saving your score...</p>
          </div>
        </div>
      )}
    </>
  );
}
