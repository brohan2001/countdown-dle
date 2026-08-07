import { createAdminClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");
    const playDate = date || new Date().toISOString().split("T")[0];

    const admin = createAdminClient();

    const { data: puzzle, error } = await admin
      .from("puzzles")
      .select("*")
      .eq("play_date", playDate)
      .eq("status", "published")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!puzzle) {
      // If puzzle doesn't exist, trigger generation
      return NextResponse.json(
        { error: "Puzzle not found for this date" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: puzzle.id,
        playDate: puzzle.play_date,
        lettersRound: {
          type: "letters",
          letters: puzzle.letters_round_seed.letters || [],
          timeLimit: 30000,
        },
        numbersRound: {
          type: "numbers",
          numbers: puzzle.numbers_round_seed.numbers || [],
          target: puzzle.numbers_round_seed.target,
          timeLimit: 30000,
        },
        conundrumRound: {
          type: "conundrum",
          letters: puzzle.conundrum.split(""),
          solution: puzzle.conundrum_solution,
          timeLimit: 30000,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching daily puzzle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
