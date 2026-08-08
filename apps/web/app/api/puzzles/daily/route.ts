import { createAdminClient } from "@/lib/supabase";
import { PuzzleGenerator } from "@countdown/engine-core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");
    const playDate = date || new Date().toISOString().split("T")[0];

    const admin = createAdminClient();

    // Try to fetch existing published puzzle
    const { data: puzzle, error: fetchError } = await admin
      .from("puzzles")
      .select("*")
      .eq("play_date", playDate)
      .eq("status", "published")
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Supabase error:", fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      );
    }

    // If puzzle exists, return it
    if (puzzle) {
      return NextResponse.json({
        success: true,
        source: "database",
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
    }

    // If no published puzzle exists, generate one on-the-fly
    const generator = new PuzzleGenerator();
    const generatedPuzzle = generator.generate(playDate);

    // Store it for future requests
    const { data: inserted, error: insertError } = await admin
      .from("puzzles")
      .insert({
        play_date: playDate,
        letters_round_seed: {
          letters: generatedPuzzle.lettersRound.letters,
        },
        numbers_round_seed: {
          numbers: generatedPuzzle.numbersRound.numbers,
          target: generatedPuzzle.numbersRound.target,
        },
        conundrum: generatedPuzzle.conundrumRound.letters.join(""),
        conundrum_solution: generatedPuzzle.conundrumRound.solution,
        status: "published",
      })
      .select()
      .single();

    if (insertError && insertError.code !== "23505") {
      // 23505 is unique constraint violation (puzzle already exists)
      console.error("Error inserting puzzle:", insertError);
    }

    return NextResponse.json({
      success: true,
      source: "generated",
      data: {
        id: inserted?.id || `generated-${playDate}`,
        playDate,
        lettersRound: generatedPuzzle.lettersRound,
        numbersRound: generatedPuzzle.numbersRound,
        conundrumRound: generatedPuzzle.conundrumRound,
      },
    });
  } catch (error) {
    console.error("Error fetching/generating puzzle:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
