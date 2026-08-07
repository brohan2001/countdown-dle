import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client for server-side operations (only use in API routes/Edge Functions)
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export type Database = {
  public: {
    Tables: {
      puzzles: {
        Row: {
          id: string;
          play_date: string;
          letters_round_seed: Record<string, any>;
          numbers_round_seed: Record<string, any>;
          conundrum: string;
          conundrum_solution: string;
          quality_report: Record<string, any> | null;
          status: "draft" | "published";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["puzzles"]["Row"], "id" | "created_at" | "updated_at">;
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          dyslexic_font: boolean;
          theme: "light" | "dark" | "system";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
      };
      game_results: {
        Row: {
          id: string;
          user_id: string | null;
          guest_id: string | null;
          puzzle_id: string;
          mode: "express" | "full_show" | "practice" | "custom" | "duel";
          round_results: Record<string, any>;
          total_score: number;
          emoji_summary: string | null;
          completed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["game_results"]["Row"], "id" | "completed_at">;
      };
      streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_played_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["streaks"]["Row"], "id" | "created_at" | "updated_at">;
      };
      custom_challenges: {
        Row: {
          id: string;
          short_code: string;
          creator_user_id: string | null;
          puzzle_seed: Record<string, any>;
          created_at: string;
          expires_at: string | null;
          plays: number;
        };
        Insert: Omit<Database["public"]["Tables"]["custom_challenges"]["Row"], "id" | "created_at" | "plays">;
      };
      duels: {
        Row: {
          id: string;
          custom_challenge_id: string | null;
          puzzle_id: string | null;
          player_a_id: string;
          player_b_id: string | null;
          player_a_score: number;
          player_b_score: number;
          status: "pending" | "active" | "complete";
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["duels"]["Row"], "id" | "created_at" | "updated_at">;
      };
      forum_threads: {
        Row: {
          id: string;
          puzzle_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["forum_threads"]["Row"], "id" | "created_at">;
      };
      forum_posts: {
        Row: {
          id: string;
          thread_id: string;
          user_id: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["forum_posts"]["Row"], "id" | "created_at" | "updated_at">;
      };
    };
  };
};
