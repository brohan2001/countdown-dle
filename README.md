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
  - **Dictionary:** Trie-based word lookup supporting up to 9 letters
  - **Letters solver:** DFS-based longest word finder with optimal scoring
  - **Numbers solver:** Memoized DFS for exact/closest arithmetic solutions
  - **Conundrum solver:** Anagram validation and 9-letter solution finder
  - **Puzzle generator:** Randomized puzzles with quality gates (solvability checks)
- Full unit test coverage for all solvers and validators
- No UI, no backend — pure game logic layer

**Testing:**
```bash
npm test  # Run all engine-core & game-state tests
```

### Phase 2 — UI/UX & Single-Player Polish (In Progress)

**Roadmap:**
- Next.js Express Daily mode end-to-end UI
- Tap-to-merge tile interaction + keyboard fallback for numbers
- Letters & conundrum UI
- Web Worker integration for solver performance
- Theme toggle, dyslexic font, emoji share summary
- Guest persistence via IndexedDB/localStorage

### Phase 3 — Backend & Archive (Future)

**Scope:**
- Supabase Auth + Postgres schema
- Daily puzzle generation + curation
- Calendar archive & streaks
- Spoiler-gated daily forum
- Practice/Custom challenge modes

### Phase 4 — Async Multiplayer & Community (Future)

**Scope:**
- Async Duels (shared link, same board)
- Full Show mode (15 rounds)
- Community stats aggregation
- (Deferred) Real-time Ranked ELO

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
