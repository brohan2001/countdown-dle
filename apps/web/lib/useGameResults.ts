"use client";

import { supabase } from "./supabase";
import { useAuth } from "./useAuth";
import { ExpressMatchState } from "@countdown/game-state";
import { generateEmojiSummary } from "./emojiSummary";

export function useGameResults() {
  const { userId, guestId } = useAuth();

  const saveResult = async (match: ExpressMatchState, puzzleId: string, mode: string = "express") => {
    try {
      if (!userId && !guestId) {
        console.error("No user ID or guest ID available");
        return null;
      }

      const lettersResult = match.rounds[0]?.result;
      const numbersResult = match.rounds[1]?.result;
      const conundrumResult = match.rounds[2]?.result;

      const roundResults = {
        letters: lettersResult || null,
        numbers: numbersResult || null,
        conundrum: conundrumResult || null,
      };

      const emojiSummary = generateEmojiSummary(
        lettersResult as any,
        numbersResult as any,
        conundrumResult as any
      );

      const { data, error } = await supabase.from("game_results").insert({
        user_id: userId || undefined,
        guest_id: guestId || undefined,
        puzzle_id: puzzleId,
        mode: mode as any,
        round_results: roundResults,
        total_score: match.totalScore,
        emoji_summary: emojiSummary,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Failed to save game result:", err);
      return null;
    }
  };

  const getResultsForPuzzle = async (puzzleId: string) => {
    try {
      const { data, error } = await supabase
        .from("game_results")
        .select("*")
        .eq("puzzle_id", puzzleId)
        .eq(userId ? "user_id" : "guest_id", userId || guestId);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Failed to fetch game results:", err);
      return [];
    }
  };

  const updateStreak = async (completed: boolean) => {
    if (!userId) return; // Only update streaks for authenticated users

    try {
      const today = new Date().toISOString().split("T")[0];

      // Get or create streak record
      let { data: streak, error } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found

      if (!streak) {
        // Create new streak record
        const { data: newStreak, error: createError } = await supabase
          .from("streaks")
          .insert({
            user_id: userId,
            current_streak: completed ? 1 : 0,
            longest_streak: completed ? 1 : 0,
            last_played_date: today,
          })
          .select()
          .single();

        if (createError) throw createError;
        return newStreak;
      }

      // Update existing streak
      const lastPlayedDate = streak.last_played_date;
      const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      let newCurrentStreak = streak.current_streak;
      if (completed) {
        if (lastPlayedDate === today) {
          // Already played today, don't change streak
        } else if (lastPlayedDate === yesterday) {
          // Continuing streak
          newCurrentStreak = streak.current_streak + 1;
        } else {
          // Streak broken, restart
          newCurrentStreak = 1;
        }
      } else {
        // Failed to complete today
        newCurrentStreak = 0;
      }

      const newLongestStreak = Math.max(streak.longest_streak, newCurrentStreak);

      const { data: updated, error: updateError } = await supabase
        .from("streaks")
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_played_date: today,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updated;
    } catch (err) {
      console.error("Failed to update streak:", err);
      return null;
    }
  };

  return {
    saveResult,
    getResultsForPuzzle,
    updateStreak,
  };
}
