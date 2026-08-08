import { createAdminClient } from "@/lib/supabase";
import { scoreWord, scoreNumbers } from "@countdown/engine-core";
import { NextRequest, NextResponse } from "next/server";

interface RoundResult {
  type: "letters" | "numbers" | "conundrum";
  score?: number;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, guestId, puzzleId, mode, roundResults, emojiSummary } = body;

    // Validation
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

    if (!Array.isArray(roundResults) || roundResults.length !== 3) {
      return NextResponse.json(
        { error: "roundResults must be an array of 3 round results" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Server-side validation: recalculate scores to prevent tampering
    let totalScore = 0;
    const validatedRounds = roundResults.map((result: RoundResult, idx: number) => {
      const type = idx === 0 ? "letters" : idx === 1 ? "numbers" : "conundrum";

      if (type === "letters" && "word" in result) {
        const word = (result.word as string)?.toUpperCase() || "";
        const length = word.length;
        const score =
          length < 2
            ? 0
            : length <= 4
              ? length
              : length === 5
                ? 7
                : length === 6
                  ? 8
                  : length <= 9
                    ? 9 + (length - 7)
                    : 0;
        totalScore += score;
        return { ...result, score };
      } else if (type === "numbers" && "distance" in result) {
        const distance = (result.distance as number) ?? 999;
        const exact = distance === 0;
        const score = exact ? 10 : distance <= 5 ? 7 : distance <= 10 ? 5 : distance <= 50 ? 3 : 0;
        totalScore += score;
        return { ...result, score, exact };
      } else if (type === "conundrum" && "found" in result) {
        const found = result.found === true;
        const score = found ? 10 : 0;
        totalScore += score;
        return { ...result, score };
      }

      return result;
    });

    // Insert result
    const { data, error: insertError } = await admin
      .from("game_results")
      .insert({
        user_id: userId || undefined,
        guest_id: guestId || undefined,
        puzzle_id: puzzleId,
        mode: mode || "express",
        round_results: validatedRounds,
        total_score: totalScore,
        emoji_summary: emojiSummary || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase error:", insertError);
      return NextResponse.json(
        { error: insertError.message },
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

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        totalScore,
        validatedRounds,
      },
    });
  } catch (error) {
    console.error("Error saving game result:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
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
