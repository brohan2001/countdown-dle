import { createAdminClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { guestId } = await request.json();

    if (!guestId) {
      return NextResponse.json(
        { error: "guestId is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Get the authenticated user from the request
    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Fetch guest's game results
    const { data: guestResults, error: fetchError } = await admin
      .from("game_results")
      .select("*")
      .eq("guest_id", guestId);

    if (fetchError) {
      console.error("Error fetching guest results:", fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      );
    }

    // Migrate each result, keeping higher scores if conflicts exist
    let mergedCount = 0;
    for (const guestResult of guestResults || []) {
      // Check if user already has a result for this puzzle/mode
      const { data: existingResult } = await admin
        .from("game_results")
        .select("*")
        .eq("user_id", userId)
        .eq("puzzle_id", guestResult.puzzle_id)
        .eq("mode", guestResult.mode)
        .single();

      if (existingResult) {
        // Keep the higher score
        if (guestResult.total_score > existingResult.total_score) {
          await admin
            .from("game_results")
            .update({
              user_id: userId,
              guest_id: null,
              round_results: guestResult.round_results,
              total_score: guestResult.total_score,
              emoji_summary: guestResult.emoji_summary,
            })
            .eq("id", existingResult.id);
          mergedCount++;
        }
      } else {
        // No conflict, just assign to user
        await admin
          .from("game_results")
          .update({
            user_id: userId,
            guest_id: null,
          })
          .eq("id", guestResult.id);
        mergedCount++;
      }
    }

    // Merge streaks (guest streaks are typically lower priority)
    const { data: guestStreaks } = await admin
      .from("streaks")
      .select("*")
      .eq("user_id", guestId);

    const { data: userStreaks } = await admin
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (guestStreaks && guestStreaks.length > 0) {
      const guestStreak = guestStreaks[0];

      if (userStreaks) {
        // Merge: keep the higher streak values
        if (guestStreak.current_streak > userStreaks.current_streak) {
          await admin
            .from("streaks")
            .update({
              current_streak: guestStreak.current_streak,
              last_played_date: guestStreak.last_played_date,
            })
            .eq("user_id", userId);
        }

        if (guestStreak.longest_streak > userStreaks.longest_streak) {
          await admin
            .from("streaks")
            .update({
              longest_streak: guestStreak.longest_streak,
            })
            .eq("user_id", userId);
        }
      } else {
        // No user streak yet, copy guest streak
        await admin
          .from("streaks")
          .insert({
            user_id: userId,
            current_streak: guestStreak.current_streak,
            longest_streak: guestStreak.longest_streak,
            last_played_date: guestStreak.last_played_date,
          });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Guest results merged successfully",
      mergedCount,
      userId,
    });
  } catch (error) {
    console.error("Error merging guest data:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
