"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useExpressMatch } from "@countdown/game-state";
import { useGameWorker } from "@/lib/useGameWorker";
import { getWordSet } from "@/lib/wordSet";
import { ExpressMatch } from "@/components/game/ExpressMatch";

interface Duel {
  id: string;
  puzzle_id: string;
  player_a_id: string;
  player_b_id: string | null;
  player_a_score: number;
  player_b_score: number;
  status: "pending" | "active" | "complete";
  player_a_name?: string;
  player_b_name?: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function DuelPage({ params }: PageProps) {
  const router = useRouter();
  const match = useExpressMatch();
  const gameWorker = useGameWorker();
  const [duel, setDuel] = useState<Duel | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const initializeDuel = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserId(user?.id || null);

        // Fetch duel
        const { data: duelData, error: duelError } = await supabase
          .from("duels")
          .select(
            `
            *,
            player_a:profiles!player_a_id(display_name),
            player_b:profiles!player_b_id(display_name)
          `
          )
          .eq("id", params.id)
          .single();

        if (duelError) throw duelError;

        const formattedDuel: Duel = {
          ...duelData,
          player_a_name: duelData.player_a?.display_name || "Player A",
          player_b_name: duelData.player_b?.display_name || "Player B",
        };

        setDuel(formattedDuel);

        // If user is not player_a and duel is pending, join as player_b
        if (user && formattedDuel.status === "pending" && formattedDuel.player_a_id !== user.id) {
          if (!formattedDuel.player_b_id) {
            // Auto-join as player_b
            setJoining(true);
          }
        }

        setReady(true);
      } catch (err) {
        console.error("Failed to load duel:", err);
        setError(err instanceof Error ? err.message : "Failed to load duel");
      }
    };

    initializeDuel();
  }, [params.id]);

  const handleStartGame = async () => {
    if (!duel || !userId) return;

    try {
      // Load word set
      await getWordSet();

      // Initialize worker
      const words = await fetch("/words.txt").then((res) => res.text());
      const wordList = words.split("\n").filter((w) => w.trim());
      await gameWorker.init(wordList);

      // Fetch puzzle
      const puzzleResponse = await fetch(`/api/puzzles/daily?date=`); // Use puzzle_id from duel
      if (!puzzleResponse.ok) throw new Error("Puzzle not found");

      const puzzleData = await puzzleResponse.json();
      const puzzle = puzzleData.data;

      // Start game
      match.startMatch(
        puzzle.lettersRound.letters,
        puzzle.numbersRound.numbers,
        puzzle.numbersRound.target,
        puzzle.conundrumRound.letters
      );

      setGameStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading duel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
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

  if (!duel) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Duel not found</p>
      </div>
    );
  }

  // If game started, show ExpressMatch
  if (gameStarted) {
    return <ExpressMatch />;
  }

  // Show duel info and invite to join
  const isPlayerA = userId === duel.player_a_id;
  const isPlayerB = userId === duel.player_b_id;
  const isSpectator = !isPlayerA && !isPlayerB;
  const isReady = isPlayerA && duel.player_b_id !== null;

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Async Duel</h1>
          <p className="text-slate-400">Challenge your friend to a battle of wits</p>
        </motion.div>

        {/* Duel Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-lg p-8 shadow-lg mb-8"
        >
          {/* Players */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-blue-900/40 to-blue-700/20 rounded-lg p-6 border border-blue-500/30"
            >
              <p className="text-slate-400 text-sm mb-1">Player A</p>
              <p className="text-2xl font-bold text-white mb-2">{duel.player_a_name}</p>
              <p className="text-4xl font-bold text-blue-400">{duel.player_a_score}</p>
              {isPlayerA && (
                <p className="text-xs text-blue-300 mt-2">That's you!</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-lg p-6 border ${
                duel.player_b_id
                  ? "bg-gradient-to-br from-purple-900/40 to-purple-700/20 border-purple-500/30"
                  : "bg-slate-700/30 border-slate-600/30"
              }`}
            >
              <p className="text-slate-400 text-sm mb-1">Player B</p>
              <p className="text-2xl font-bold text-white mb-2">
                {duel.player_b_name || "Waiting..."}
              </p>
              <p className={`text-4xl font-bold ${duel.player_b_id ? "text-purple-400" : "text-slate-400"}`}>
                {duel.player_b_score}
              </p>
              {isPlayerB && (
                <p className="text-xs text-purple-300 mt-2">That's you!</p>
              )}
              {isPlayerA && !duel.player_b_id && (
                <p className="text-xs text-slate-400 mt-2">Waiting for opponent...</p>
              )}
            </motion.div>
          </div>

          {/* Status Message */}
          {duel.player_b_id === null && isPlayerA && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg text-blue-300 text-center mb-6"
            >
              Share the link below with your opponent. Once they join, you can start playing!
            </motion.div>
          )}

          {/* Share Link (if player_a) */}
          {isPlayerA && duel.player_b_id === null && (
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">Invite Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/duel/${duel.id}`}
                  readOnly
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-mono border border-slate-600"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/duel/${duel.id}`);
                    alert("Copied!");
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Join Button (if spectator or player_b) */}
          {(isSpectator || isPlayerB) && (
            <button
              onClick={handleStartGame}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg transition-all mb-4"
            >
              Start Playing
            </button>
          )}

          {/* Start Button (if player_a and player_b exists) */}
          {isPlayerA && duel.player_b_id && (
            <button
              onClick={handleStartGame}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all mb-4"
            >
              Start Duel
            </button>
          )}

          <button
            onClick={() => router.push("/")}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition-all"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
