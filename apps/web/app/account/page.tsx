"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  display_name: string;
  dyslexic_font: boolean;
  theme: "light" | "dark" | "system";
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  last_played_date: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") throw profileError;

        if (profileData) {
          setProfile(profileData);
          setDisplayName(profileData.display_name || "");
          setTheme(profileData.theme);
          setDyslexicFont(profileData.dyslexic_font);
        }

        const { data: streakData } = await supabase
          .from("streaks")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (streakData) {
          setStreak(streakData);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          theme,
          dyslexic_font: dyslexicFont,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setSuccess("Profile updated successfully!");
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              display_name: displayName,
              theme,
              dyslexic_font: dyslexicFont,
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-lg p-8 shadow-lg"
        >
          <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

          {/* Streaks */}
          {streak && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Your Streaks</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-yellow-400">{streak.current_streak}</p>
                  <p className="text-xs text-slate-500">days</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Longest Streak</p>
                  <p className="text-3xl font-bold text-green-400">{streak.longest_streak}</p>
                  <p className="text-xs text-slate-500">days</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSaveProfile}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm text-slate-300 mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <label className="text-slate-300 font-semibold">
                Dyslexic-Friendly Font
              </label>
              <button
                type="button"
                onClick={() => setDyslexicFont(!dyslexicFont)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  dyslexicFont ? "bg-blue-600" : "bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    dyslexicFont ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </motion.form>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 pt-8 border-t border-slate-700"
          >
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 font-semibold rounded-lg border border-red-900/50 transition-all"
            >
              Sign Out
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
