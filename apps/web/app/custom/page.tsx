"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface CustomChallenge {
  id: string;
  short_code: string;
  creator_user_id: string | null;
  created_at: string;
  plays: number;
  puzzle_seed: {
    letters?: string[];
    numbers?: number[];
    target?: number;
    conundrum?: string[];
  };
}

function generateShortCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function CustomChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<CustomChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [seedCode, setSeedCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserId(user?.id || null);

        // Fetch user's challenges if authenticated
        if (user) {
          const { data, error: fetchError } = await supabase
            .from("custom_challenges")
            .select("*")
            .eq("creator_user_id", user.id)
            .order("created_at", { ascending: false });

          if (fetchError) throw fetchError;
          setChallenges(data || []);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load challenges");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateChallenge = async () => {
    if (!userId) {
      router.push("/auth");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // Generate random puzzle seed
      const letters = [];
      const vowels = ["A", "E", "I", "O", "U"];
      const consonants = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"];

      for (let i = 0; i < 9; i++) {
        const pool = i % 3 === 0 ? vowels : consonants;
        letters.push(pool[Math.floor(Math.random() * pool.length)]);
      }

      const numbers = [];
      const largeNumbers = [25, 50, 75, 100];
      for (let i = 0; i < 6; i++) {
        if (i < 2) {
          numbers.push(largeNumbers[Math.floor(Math.random() * largeNumbers.length)]);
        } else {
          numbers.push(Math.floor(Math.random() * 10) + 1);
        }
      }

      const target = Math.floor(Math.random() * 850) + 101;
      const conundrumWords = [
        "GREATNESS",
        "COMPUTERS",
        "ALGORITHM",
        "DATABASES",
        "BEAUTIFUL",
        "CAREFULLY",
        "SPREADING",
        "CELEBRATE",
      ];
      const conundrum = conundrumWords[Math.floor(Math.random() * conundrumWords.length)];

      const code = generateShortCode();

      // Create challenge
      const { data: challenge, error: createError } = await supabase
        .from("custom_challenges")
        .insert({
          short_code: code,
          creator_user_id: userId,
          puzzle_seed: {
            letters,
            numbers,
            target,
            conundrum,
          },
        })
        .select()
        .single();

      if (createError) throw createError;

      setChallenges([challenge as CustomChallenge, ...challenges]);
      setSeedCode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create challenge");
    } finally {
      setCreating(false);
    }
  };

  const copyShareLink = async (code: string) => {
    const link = `${window.location.origin}/c/${code}`;
    try {
      await navigator.clipboard.writeText(link);
      alert("Link copied to clipboard!");
    } catch (err) {
      alert("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Create Custom Challenge</h1>
          <p className="text-slate-400">
            Generate a unique puzzle and share it with friends via a short link.
          </p>
        </motion.div>

        {/* Create Button */}
        {userId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-8 border border-purple-500/30 mb-12"
          >
            <button
              onClick={handleCreateChallenge}
              disabled={creating}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {creating ? "Generating..." : "Generate New Challenge"}
            </button>

            {seedCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-slate-700 rounded-lg"
              >
                <p className="text-slate-300 text-sm mb-2">Share this link:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/c/${seedCode}`}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg text-sm font-mono border border-slate-500"
                  />
                  <button
                    onClick={() => copyShareLink(seedCode)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all"
                  >
                    Copy
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {!userId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 mb-12"
          >
            <p className="text-yellow-300 mb-4">
              Sign in to create and share custom challenges with friends.
            </p>
            <button
              onClick={() => router.push("/auth")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all"
            >
              Sign In
            </button>
          </motion.div>
        )}

        {/* Your Challenges */}
        {userId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Your Challenges</h2>

            {challenges.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No challenges yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {challenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-slate-300 text-sm">Code:</p>
                        <p className="text-2xl font-bold text-blue-400 font-mono">{challenge.short_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-xs">Plays</p>
                        <p className="text-xl font-bold text-purple-400">{challenge.plays}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => copyShareLink(challenge.short_code)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => router.push(`/c/${challenge.short_code}`)}
                        className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-semibold transition-all"
                      >
                        Play
                      </button>
                    </div>

                    <p className="text-slate-500 text-xs mt-3">
                      {new Date(challenge.created_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

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
