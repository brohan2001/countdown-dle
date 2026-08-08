"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CreateDuelPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [puzzleDate, setPuzzleDate] = useState(new Date().toISOString().split("T")[0]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duelLink, setDuelLink] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUserId(user.id);

      // Get display name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || "");
      }
    };

    checkAuth();
  }, [router]);

  const handleCreateDuel = async () => {
    if (!userId) return;

    setCreating(true);
    setError(null);

    try {
      // Fetch puzzle for the selected date
      const puzzleResponse = await fetch(`/api/puzzles/daily?date=${puzzleDate}`);

      if (!puzzleResponse.ok) {
        throw new Error("Puzzle not found for this date");
      }

      const puzzleData = await puzzleResponse.json();
      const puzzle = puzzleData.data;

      // Create duel entry
      const { data: duel, error: createError } = await supabase
        .from("duels")
        .insert({
          puzzle_id: puzzle.id,
          player_a_id: userId,
          status: "pending",
          player_a_score: 0,
        })
        .select()
        .single();

      if (createError) throw createError;

      setDuelLink(`${window.location.origin}/duel/${duel.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create duel");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      alert("Duel link copied to clipboard!");
    } catch {
      alert("Failed to copy link");
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Challenge a Friend</h1>
          <p className="text-slate-400">
            Create a duel and invite your friend to compete on the same puzzle.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-lg p-8 shadow-lg"
        >
          {!duelLink ? (
            <div className="space-y-6">
              {/* Your Name Display */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">You</label>
                <p className="text-lg font-semibold text-white">{displayName || "Player"}</p>
              </div>

              {/* Puzzle Date Selection */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Puzzle Date</label>
                <input
                  type="date"
                  value={puzzleDate}
                  onChange={(e) => setPuzzleDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Create Button */}
              <button
                onClick={handleCreateDuel}
                disabled={creating}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
              >
                {creating ? "Creating Duel..." : "Create Duel"}
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-green-400 mb-2">✓ Duel Created!</h2>
                <p className="text-slate-400">Share this link with your friend:</p>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <input
                  type="text"
                  value={duelLink}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-600 text-white rounded-lg text-sm font-mono border border-slate-500 text-center"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => copyLink(duelLink)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => router.push(duelLink.replace(window.location.origin, ""))}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all"
                >
                  Go to Duel
                </button>
              </div>

              <button
                onClick={() => {
                  setDuelLink("");
                  setPuzzleDate(new Date().toISOString().split("T")[0]);
                }}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition-all"
              >
                Create Another
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
