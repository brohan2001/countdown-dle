# Phase 3 Setup — Backend & Archive

## Overview
Phase 3 brings Supabase backend, authentication, daily puzzle generation, streak tracking, and a spoiler-gated community forum.

## Prerequisites

1. **Supabase CLI**: Already installed (v2.111.0)
2. **Docker**: Required for local Supabase development
3. **Node.js**: v18+

## Local Development Setup

### 1. Start Supabase Locally

```bash
supabase start
```

This will:
- Pull Docker images (PostgreSQL 15, Vector, GoTrue, PostgREST, etc.)
- Start containers on default ports
- Create a local database
- Output connection strings and default credentials

### 2. Apply Database Migrations

Once Supabase is running:

```bash
supabase db push
```

This applies the schema from `supabase/migrations/20260807000001_init_schema.sql`, creating:
- **puzzles** — daily seeded puzzles
- **profiles** — user settings (theme, dyslexic font)
- **game_results** — player submissions per puzzle
- **streaks** — daily play streaks
- **custom_challenges** — user-generated challenge URLs
- **duels** — async multiplayer matches
- **forum_threads** — spoiler-gated discussion per puzzle
- **forum_posts** — community posts (visible only after puzzle completion)

### 3. Set Environment Variables

Copy `.env.local.example` to `.env.local` in `apps/web/`:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

The example includes default local Supabase credentials. For production, replace with your hosted Supabase project keys.

### 4. Install Dependencies

```bash
npm install
```

This installs `@supabase/supabase-js` which was added to web/package.json.

### 5. Start Dev Server

```bash
npm run dev
```

The app now connects to the local Supabase instance.

## Architecture

### Frontend Integration

**Files Created:**
- `apps/web/lib/supabase.ts` — Supabase client initialization
- `apps/web/lib/useAuth.ts` — React hook for guest vs authenticated state
- `apps/web/lib/useGameResults.ts` — Hook for saving/retrieving game results and streaks

**Key Features:**
- **Guest Players**: Unauth users get a persistent `guest_id` (localStorage)
- **Score Submission**: ExpressMatch saves results to `game_results` table
- **Streak Tracking**: Daily play streaks auto-increment for authenticated users
- **Emoji Sharing**: Results include Wordle-style emoji grids

### Backend APIs

**Routes Created:**
- `POST /api/game-results` — Save game submission
- `GET /api/game-results?puzzleId=...&userId=...` — Fetch player results
- `GET /api/puzzles/daily?date=...` — Fetch daily puzzle (or today's if no date)

### Edge Functions

**Supabase Edge Functions (TypeScript/Deno):**
- `functions/daily-puzzle-generator/index.ts` — Generates & publishes daily puzzle
  - Runs via cron (setup in Supabase dashboard)
  - Seeds letters, numbers, conundrum for the day
  - Creates forum thread for discussion

## Database Schema Highlights

### Puzzles
```sql
play_date: date UNIQUE    -- Today's date
status: 'draft' | 'published'
letters_round_seed: { letters: string[] }
numbers_round_seed: { numbers: number[], target: number }
conundrum: string (scrambled)
conundrum_solution: string
quality_report: { longestWord, numbersOptimal, ... }
```

### Game Results
```sql
user_id | guest_id (one must be set)
puzzle_id (FK to puzzles)
mode: 'express' | 'practice' | 'custom' | 'duel' | 'full_show'
round_results: { letters, numbers, conundrum } (JSON)
total_score: integer
emoji_summary: "Countdown-dle\n🟩🟨⬜"
```

### Streaks
```sql
user_id (unique)
current_streak: integer (resets if no play today/yesterday)
longest_streak: integer (max ever achieved)
last_played_date: date
```

### Forum (RLS Protected)
```sql
forum_threads (one per puzzle)
  └─ forum_posts (visible only to users who completed that puzzle)
     RLS: Can read all, can post only if game_results.puzzle_id = thread.puzzle_id
```

## Row Level Security (RLS)

All tables have RLS enabled with policies:

- **profiles**: Public read, users update own
- **game_results**: Public read (leaderboards), users insert own
- **streaks**: Users read own
- **custom_challenges**: Public read, users create own
- **forum_threads**: Public read
- **forum_posts**: Public read; write only if user has completed that puzzle

This is enforced at the database level, not just the client.

## Guest → Account Merge

When a guest signs up:
1. Client stores `guest_id` in localStorage
2. During signup, game_results are queried by `(guest_id, puzzle_id, mode)`
3. If an authenticated result already exists for that puzzle/mode, keep the higher score
4. Update guest results with new `user_id`, null out `guest_id`

*Implementation*: API route in `POST /api/auth/claim-results` (to be added)

## Daily Puzzle Generation

Currently, the Edge Function generates a deterministic seed-based puzzle using a simplified algorithm. In production:

1. Import `PuzzleGenerator` from `@countdown/engine-core`
2. Seed the generator with the date
3. Validate that:
   - Longest word is ≥7 letters
   - Numbers target is solvable (or within acceptable distance)
   - Conundrum is a valid, unique anagram
4. Publish to the `puzzles` table
5. Create a forum thread

### Cron Trigger

In the Supabase dashboard, add a cron job:
```
POST https://<project-id>.functions.supabase.co/functions/v1/daily-puzzle-generator
Authorization: Bearer <anon-key>
Trigger: 0 0 * * * (daily at midnight UTC)
```

## Next Steps for Phase 3

1. **Complete Puzzle Generation**
   - Integrate `PuzzleGenerator` from engine-core into Edge Function
   - Implement quality validation (longest word, equation solvability)
   - Deploy to production Supabase project

2. **Authentication UI**
   - Sign up / login pages (Supabase Auth with email/password)
   - Account merge after sign up (guest results → authenticated user)

3. **Forum Page**
   - List forum threads (one per puzzle)
   - Post/reply system with RLS enforcing spoiler gating
   - Moderation tools (delete posts, ban users)

4. **Streaks & Archive**
   - Streaks display (current + longest)
   - Calendar view of past puzzles + scores
   - Leaderboards (all-time, monthly, weekly)

5. **Practice/Custom Modes**
   - Practice: replay past puzzles
   - Custom: user-generated puzzles with short URLs
   - Duels: share puzzle link, both play, compare scores

## Troubleshooting

### Docker not running
```bash
open /Applications/Docker.app
# Wait ~30s for Docker daemon to start
supabase start
```

### Reset local Supabase
```bash
supabase stop --no-backup
supabase start
supabase db push  # Re-apply migrations
```

### View Supabase logs
```bash
supabase logs --filter postgres
supabase logs --filter gotrue   # Auth logs
```

### Query database directly
```bash
supabase psql
# psql CLI opens to local postgres
```

## Environment Variables Summary

| Var | Purpose | Example |
|-----|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public API endpoint | `http://localhost:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon token | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin token (server-only) | `eyJ...` |

**Never** commit `.env.local` with real credentials. Use `.env.local.example` as a template.

