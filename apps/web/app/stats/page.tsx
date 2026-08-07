"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_score: number;
  completed_count: number;
  average_score: number;
  longest_streak?: number;
}

interface GlobalStats {
  totalPlayers: number;
  totalGames: number;
  averageScore: number;
  highestScore: number;
}

type Tab = "today" | "alltime" | "streaks";

export default function StatsPage() {
  const [tab, setTab] = useState<Tab>("alltime");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load leaderboard
        const { data: results, error: resultsError } = await supabase
          .from("game_results")
          .select("user_id, total_score, profiles(display_name)")
          .eq("mode", "express")
          .not("user_id", "is", null);

        if (resultsError) throw resultsError;

        // Aggregate results by user
        const userStats: Record<string, LeaderboardEntry> = {};
        results?.forEach((r: any) => {
          if (!userStats[r.user_id]) {
            userStats[r.user_id] = {
              user_id: r.user_id,
              display_name: r.profiles?.display_name || "Anonymous",
              total_score: 0,
              completed_count: 0,
              average_score: 0,
              longest_streak: 0,
            };
          }
          userStats[r.user_id].total_score += r.total_score;
          userStats[r.user_id].completed_count += 1;
        });

        // Load streaks
        const { data: streaks, error: streaksError } = await supabase
          .from("streaks")
          .select("user_id, longest_streak");

        if (streaksError) throw streaksError;

        streaks?.forEach((s) => {
          if (userStats[s.user_id]) {
            userStats[s.user_id].longest_streak = s.longest_streak;
          }
        });

        // Calculate averages
        Object.values(userStats).forEach((entry) => {
          entry.average_score =
            entry.completed_count > 0 ? Math.round(entry.total_score / entry.completed_count) : 0;
        });

        // Sort by total score
        const sorted = Object.values(userStats).sort(
          (a, b) => b.total_score - a.total_score
        );

        setLeaderboard(sorted);

        // Calculate global stats
        const globalStats: GlobalStats = {
          totalPlayers: Object.keys(userStats).length,
          totalGames: results?.length || 0,
          averageScore:
            results && results.length > 0
              ? Math.round(results.reduce((sum: number, r: any) => sum + r.total_score, 0) / results.length)
              : 0,
          highestScore:
            results && results.length > 0
              ? Math.max(...results.map((r: any) => r.total_score))
              : 0,
        };

        setStats(globalStats);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Countdown-dle Stats</h1>

        {/* Global Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-700/20 rounded-lg p-6 border border-purple-500/30">
              <p className="text-slate-400 text-sm mb-1">Total Players</p>
              <p className="text-3xl font-bold text-purple-300">{stats.totalPlayers}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-700/20 rounded-lg p-6 border border-blue-500/30">
              <p className="text-slate-400 text-sm mb-1">Games Played</p>
              <p className="text-3xl font-bold text-blue-300">{stats.totalGames}</p>
            </div>
            <div className="bg-gradient-to-br from-green-900/40 to-green-700/20 rounded-lg p-6 border border-green-500/30">
              <p className="text-slate-400 text-sm mb-1">Avg Score</p>
              <p className="text-3xl font-bold text-green-300">{stats.averageScore}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-700/20 rounded-lg p-6 border border-yellow-500/30">
              <p className="text-slate-400 text-sm mb-1">High Score</p>
              <p className="text-3xl font-bold text-yellow-300">{stats.highestScore}</p>
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header with Tabs */}
          <div className="border-b border-slate-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
            <div className="flex gap-2">
              {(["alltime", "today", "streaks"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    tab === t
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {t === "alltime" ? "All Time" : t === "today" ? "Today" : "Streaks"}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50 border-b border-slate-600">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Player
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">
                    {tab === "alltime"
                      ? "Total Score"
                      : tab === "today"
                        ? "Today's Score"
                        : "Longest Streak"}
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">
                    Games
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">
                    Avg Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No data yet. Be the first to play!
                    </td>
                  </tr>
                ) : (
                  leaderboard.slice(0, 100).map((entry, idx) => (
                    <motion.tr
                      key={entry.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${
                        idx < 3 ? "bg-slate-700/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-slate-300 font-semibold">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                      </td>
                      <td className="px-6 py-4 text-slate-200">{entry.display_name}</td>
                      <td className="px-6 py-4 text-center text-blue-300 font-semibold">
                        {tab === "alltime"
                          ? entry.total_score
                          : tab === "today"
                            ? "—"
                            : entry.longest_streak || 0}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-400">
                        {entry.completed_count}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-400">
                        {entry.average_score}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300"
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
}
