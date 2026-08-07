import { createAdminClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, guestId, puzzleId, mode, roundResults, totalScore, emojiSummary } = body;

    if (!puzzleId || !roundResults) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!userId && !guestId) {
      return NextResponse.json(
        { error: "Either userId or guestId is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("game_results")
      .insert({
        user_id: userId || undefined,
        guest_id: guestId || undefined,
        puzzle_id: puzzleId,
        mode: mode || "express",
        round_results: roundResults,
        total_score: totalScore || 0,
        emoji_summary: emojiSummary || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Update streak if user is authenticated and completed express mode
    if (userId && mode === "express") {
      const today = new Date().toISOString().split("T")[0];

      const { data: streak } = await admin
        .from("streaks")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (streak) {
        const lastPlayedDate = streak.last_played_date;
        const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        let newCurrentStreak = streak.current_streak;
        if (lastPlayedDate === today) {
          // Already played today
        } else if (lastPlayedDate === yesterday) {
          // Continuing streak
          newCurrentStreak = streak.current_streak + 1;
        } else {
          // Streak broken
          newCurrentStreak = 1;
        }

        const newLongestStreak = Math.max(streak.longest_streak, newCurrentStreak);

        await admin
          .from("streaks")
          .update({
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak,
            last_played_date: today,
          })
          .eq("user_id", userId);
      } else {
        // Create new streak
        await admin
          .from("streaks")
          .insert({
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_played_date: today,
          });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error saving game result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const puzzleId = request.nextUrl.searchParams.get("puzzleId");
    const userId = request.nextUrl.searchParams.get("userId");
    const guestId = request.nextUrl.searchParams.get("guestId");

    if (!puzzleId) {
      return NextResponse.json(
        { error: "puzzleId is required" },
        { status: 400 }
      );
    }

    if (!userId && !guestId) {
      return NextResponse.json(
        { error: "Either userId or guestId is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    let query = admin.from("game_results").select("*").eq("puzzle_id", puzzleId);

    if (userId) {
      query = query.eq("user_id", userId);
    } else if (guestId) {
      query = query.eq("guest_id", guestId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching game results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
