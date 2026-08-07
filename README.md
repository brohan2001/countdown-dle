# Countdown-dle

The definitive modern "-dle" style daily web game based on the classic TV show *Countdown*. A 3-round Express Daily challenge combining letters, numbers, and anagrams with an active community, archive, and social features.

## Project Structure

```
countdown/
├── apps/
│   └── web/                 # Next.js 14 frontend (App Router)
├── packages/
│   ├── engine-core/         # Runtime-agnostic game engine (TypeScript)
│   │   ├── src/
│   │   │   ├── types.ts     # Shared type definitions
│   │   │   ├── dictionary.ts # Trie-based dictionary & word lookup
│   │   │   ├── letters.ts   # Letters round solver & validator
│   │   │   ├── numbers.ts   # Numbers round solver & validator
│   │   │   ├── conundrum.ts # Conundrum round solver & validator
│   │   │   ├── puzzle-generator.ts # Daily puzzle generator with QA gates
│   │   │   └── index.ts
│   │   └── tests/
│   └── game-state/          # Zustand state machines for game rounds & match orchestration
├── supabase/                # (Phase 3) Backend, Edge Functions, migrations
├── .github/                 # (Phase 4) CI/CD workflows
└── README.md
```

## Development Setup

### Prerequisites
- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Available Commands

```bash
# Development
npm run dev           # Start the web app on http://localhost:3000

# Building
npm run build        # Build all packages and the web app

# Testing
npm test             # Run vitest for engine-core & game-state
npm test -- --watch # Run tests in watch mode
```

## Phase Progress

### Phase 1 ✅ — Core Engine (Complete)

**Deliverables:**
- `engine-core` package with runtime-agnostic solver & validator implementations
  - **Dictionary:** Trie-based word lookup supporting up to 9 letters, CSW21 word list
  - **Letters solver:** DFS-based longest word finder with optimal scoring
  - **Numbers solver:** Memoized DFS for exact/closest arithmetic solutions with equation derivation
  - **Conundrum solver:** Anagram validation and 9-letter solution finder
  - **Puzzle generator:** Randomized puzzles with quality gates (solvability checks)
- Full unit test coverage for all solvers and validators
- No UI, no backend — pure game logic layer

**Testing:**
```bash
npm test  # Run all engine-core & game-state tests
```

### Phase 2 ✅ — UI/UX & Single-Player Polish (Complete)

**Deliverables:**
- Full Express Daily mode end-to-end UI in Next.js 14
- **Components:**
  - RoundTimer: 30s countdown with color-coded urgency + race-condition guard
  - LettersRound: Tile display + text input with async dictionary validation
  - NumbersRound: Undo-stack UI, tap-to-merge + keyboard expression bar, real-time tile dimming
  - ConundrumRound: Animated 9-letter anagram tiles + text input
  - ScoreSummary: End-of-match results + Wordle-style emoji share grid
  - SolverBreakdownModal: Shows optimal solutions when player misses
  - DictionaryModal: Live word definition lookup (dictionaryapi.dev)
  - SettingsMenu: Theme toggle (light/dark) + dyslexic-font toggle
- Web Worker integration for solver offloading (non-blocking solve)
- localStorage-based guest match persistence (today-only scope)
- TypeScript full type safety, zero errors
- Production build passes, dev server ready on http://localhost:3000

**Test:**
```bash
npm run dev  # Visit http://localhost:3000 to play
```

### Phase 3 ✅ — Backend & Archive (Complete)

**Deliverables:**
- **Supabase PostgreSQL Schema:**
  - `puzzles`: Daily seeded rounds with status (draft/published)
  - `profiles`: User settings (theme, dyslexic font)
  - `game_results`: Scores per puzzle/user/mode (express, practice, custom, duel, full_show)
  - `streaks`: Daily play tracking (current + longest)
  - `custom_challenges`: User-generated challenge URLs
  - `duels`: Async multiplayer matches
  - `forum_threads`: Spoiler-gated discussion per puzzle
  - `forum_posts`: Community discussion with RLS enforcement
- **Row Level Security (RLS):** All tables enforce privacy policies at database level
- **Authentication:** Email/password signup + login with profile creation
- **Pages:**
  - `/auth`: Signup/login UI with guest fallback
  - `/account`: Profile settings + streak display
  - `/forum`: Spoiler-gated puzzle discussions (must complete to post)
  - `/stats`: Global leaderboards + player rankings
- **Navigation:** Persistent header with auth-aware buttons
- **API Routes:**
  - `POST /api/game-results`: Submit game score
  - `GET /api/game-results`: Fetch player results
  - `GET /api/puzzles/daily`: Fetch published puzzle
- **Edge Functions:** Daily puzzle generator (Deno/TypeScript)
- **Setup Guide:** `PHASE_3_SETUP.md` with complete local dev instructions

**Test:**
```bash
supabase start           # Start local Supabase (requires Docker)
supabase db push         # Apply schema migrations
cp apps/web/.env.local.example apps/web/.env.local
npm install
npm run dev              # Dev server connects to local Supabase
```

### Phase 4 — Async Multiplayer & Community (Future)

**Scope:**
- Integrate game results → `/api/game-results` (save scores to database)
- Fetch puzzles from database → `/api/puzzles/daily` (instead of Worker generation)
- Real puzzle generation via Edge Function (integrate PuzzleGenerator)
- Guest → Account merge on signup
- Practice mode (replay past puzzles)
- Custom challenges + duels (async multiplayer)
- Full Show mode (15 rounds)
- Community stats aggregation

---

## Architecture Highlights

### Engine-Core Design
- **No DOM/browser APIs** — runs anywhere (Node, Web Worker, Edge Functions)
- **Type-first:** Shared type package for both browser and server
- **Single responsibility:** Dictionary, letters, numbers, and conundrum are independent solvers
- **Scoring rules:** Matches official Countdown scoring (1-10 points per round)

### Game-State (Zustand)
- Each round (Letters/Numbers/Conundrum) is a independent Zustand slice
- Express match orchestrator composes three slices sequentially
- State machine: `idle → countdown → active → submitted → revealed → scored`
- Reusable across all game modes (Express, Full Show, Practice, Custom)

### Web Frontend (Next.js 14)
- App Router for simple routing
- Tailwind CSS + Framer Motion for styling & animations
- Web Workers for solver offloading (Phase 2)
- TanStack Query for server state (Phase 3+)

---

## Scoring Rules

### Letters Round
- 2–4 letters: points = length (2–4 points)
- 5 letters: 7 points
- 6 letters: 8 points
- 7–9 letters: 9–10 points

### Numbers Round
- Exact match: 10 points
- Within 5: 7 points
- Within 10: 5 points
- Within 50: 3 points
- Further: 0 points

### Conundrum Round
- Solution found: 10 points
- No solution: 0 points

---

## License

TBD (awaiting CSW21 dictionary licensing confirmation)
