// Daily puzzle generator Edge Function
// Runs daily via cron to generate and publish puzzles

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Import from engine-core (this would need to be bundled or re-implemented)
// For now, we'll assume it's available via a module or we'll implement a simplified version

interface PuzzleGeneratorRequest {
  playDate?: string;
  publish?: boolean;
}

export async function generateDailyPuzzle(req: PuzzleGeneratorRequest) {
  const playDate = req.playDate || new Date().toISOString().split("T")[0];
  const publish = req.publish ?? true;

  try {
    // Check if puzzle already exists for this date
    const { data: existing, error: checkError } = await supabase
      .from("puzzles")
      .select("id")
      .eq("play_date", playDate)
      .single();

    if (existing) {
      return {
        status: 200,
        body: {
          success: false,
          message: `Puzzle already exists for ${playDate}`,
          puzzleId: existing.id,
        },
      };
    }

    // Generate puzzle seed using engine-core logic
    // For now, this is a placeholder - in production, use PuzzleGenerator from engine-core
    const puzzle = generatePuzzleSeed(playDate);

    // Insert puzzle
    const { data: inserted, error: insertError } = await supabase
      .from("puzzles")
      .insert({
        play_date: playDate,
        letters_round_seed: puzzle.lettersRound,
        numbers_round_seed: puzzle.numbersRound,
        conundrum: puzzle.conundrum,
        conundrum_solution: puzzle.conundrumSolution,
        quality_report: puzzle.quality,
        status: publish ? "published" : "draft",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Create forum thread for this puzzle
    const { error: threadError } = await supabase
      .from("forum_threads")
      .insert({
        puzzle_id: inserted.id,
      });

    if (threadError) console.error("Failed to create forum thread:", threadError);

    return {
      status: 200,
      body: {
        success: true,
        message: `Puzzle generated for ${playDate}`,
        puzzleId: inserted.id,
        puzzle: inserted,
      },
    };
  } catch (error) {
    console.error("Error generating puzzle:", error);
    return {
      status: 500,
      body: {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

// Simplified puzzle seed generator
// In production, this would use PuzzleGenerator from engine-core
function generatePuzzleSeed(date: string) {
  const seed = new Date(date).getTime();

  // Pseudo-random letter selection (using seed)
  const vowels = ["A", "E", "I", "O", "U"];
  const consonants = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"];

  const letters: string[] = [];
  let rand = seed;
  for (let i = 0; i < 9; i++) {
    rand = (rand * 1103515245 + 12345) & 0x7fffffff;
    const pool = i % 3 === 0 ? vowels : consonants;
    letters.push(pool[rand % pool.length]);
  }

  // Numbers: 6 random from 1-100, with some from 25, 50, 75, 100
  rand = seed;
  const numbers: number[] = [];
  const largeNumbers = [25, 50, 75, 100];
  for (let i = 0; i < 6; i++) {
    rand = (rand * 1103515245 + 12345) & 0x7fffffff;
    if (i < 2) {
      // Pick 2 from large numbers
      numbers.push(largeNumbers[rand % largeNumbers.length]);
    } else {
      // Pick from 1-10
      numbers.push((rand % 10) + 1);
    }
  }

  // Target: random 3-4 digit number
  rand = (rand * 1103515245 + 12345) & 0x7fffffff;
  const target = (rand % 850) + 101; // 101-950

  // Conundrum: simple anagram (in production, generate from word list)
  const conundrumWords = [
    "GREATNESS",
    "COMPUTERS",
    "ALGORITHM",
    "DATABASES",
    "BEAUTIFUL",
    "CAREFULLY",
    "SPREADING",
    "CELEBRATE",
    "CELEBRATE",
  ];
  rand = (rand * 1103515245 + 12345) & 0x7fffffff;
  const conundrum = conundrumWords[rand % conundrumWords.length];

  return {
    lettersRound: { letters },
    numbersRound: { numbers, target },
    conundrum: conundrum.split("").sort(() => 0.5 - Math.random()).join(""),
    conundrumSolution: conundrum,
    quality: {
      generated: true,
      seed,
    },
  };
}

// Handle the HTTP request
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as PuzzleGeneratorRequest;
    const result = await generateDailyPuzzle(body);

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
