-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Puzzles table: daily puzzles with seeded rounds
create table if not exists puzzles (
  id uuid primary key default uuid_generate_v4(),
  play_date date unique not null,
  letters_round_seed jsonb not null, -- { letters: string[] }
  numbers_round_seed jsonb not null, -- { numbers: number[], target: number }
  conundrum text not null,
  conundrum_solution text not null,
  quality_report jsonb, -- { longestWord: string, longestLength: number, numbersOptimal: {...}, conundrumUnique: boolean }
  status text check (status in ('draft', 'published')) default 'draft',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index on play_date for daily lookups
create index if not exists idx_puzzles_play_date on puzzles(play_date);
create index if not exists idx_puzzles_status on puzzles(status);

-- Profiles table: extends auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  dyslexic_font boolean default false,
  theme text check (theme in ('light', 'dark', 'system')) default 'system',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Game results: tracks player submissions per puzzle per mode
create table if not exists game_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  guest_id uuid, -- For guest players, use a local UUID until claimed
  puzzle_id uuid references puzzles(id) on delete cascade,
  mode text check (mode in ('express', 'full_show', 'practice', 'custom', 'duel')) default 'express',
  round_results jsonb not null, -- { letters: LettersResult, numbers: NumbersResult, conundrum: ConundrumResult }
  total_score integer not null default 0,
  emoji_summary text,
  completed_at timestamp with time zone default now(),
  unique(user_id, puzzle_id, mode),
  unique(guest_id, puzzle_id, mode)
);

-- Indexes for fast lookups
create index if not exists idx_game_results_user on game_results(user_id);
create index if not exists idx_game_results_puzzle on game_results(puzzle_id);
create index if not exists idx_game_results_guest on game_results(guest_id);
create index if not exists idx_game_results_completed on game_results(completed_at);

-- Streaks table: tracks current and longest streaks per user
create table if not exists streaks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_played_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

create index if not exists idx_streaks_user on streaks(user_id);

-- Custom challenges: user-generated puzzle challenges with short codes
create table if not exists custom_challenges (
  id uuid primary key default uuid_generate_v4(),
  short_code text unique not null,
  creator_user_id uuid references profiles(id) on delete cascade,
  puzzle_seed jsonb not null, -- { letters: string[], numbers: number[], target: number, conundrum: string[] }
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  plays integer default 0
);

create index if not exists idx_custom_challenges_code on custom_challenges(short_code);
create index if not exists idx_custom_challenges_creator on custom_challenges(creator_user_id);

-- Duels table: async duel matches
create table if not exists duels (
  id uuid primary key default uuid_generate_v4(),
  custom_challenge_id uuid references custom_challenges(id) on delete set null,
  puzzle_id uuid references puzzles(id) on delete set null,
  player_a_id uuid not null references profiles(id) on delete cascade,
  player_b_id uuid references profiles(id) on delete cascade,
  player_a_score integer default 0,
  player_b_score integer default 0,
  status text check (status in ('pending', 'active', 'complete')) default 'pending',
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_duels_players on duels(player_a_id, player_b_id);
create index if not exists idx_duels_status on duels(status);

-- Forum threads: one thread per puzzle, gated by completion
create table if not exists forum_threads (
  id uuid primary key default uuid_generate_v4(),
  puzzle_id uuid not null references puzzles(id) on delete cascade unique,
  created_at timestamp with time zone default now()
);

create index if not exists idx_forum_threads_puzzle on forum_threads(puzzle_id);

-- Forum posts: discussion within a thread
create table if not exists forum_posts (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references forum_threads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_forum_posts_thread on forum_posts(thread_id);
create index if not exists idx_forum_posts_user on forum_posts(user_id);
create index if not exists idx_forum_posts_created on forum_posts(created_at);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table game_results enable row level security;
alter table streaks enable row level security;
alter table custom_challenges enable row level security;
alter table duels enable row level security;
alter table forum_threads enable row level security;
alter table forum_posts enable row level security;

-- RLS Policies

-- Profiles: users can read all, update own
create policy "Profiles are public" on profiles
  for select using (true);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Game results: users can read their own + all public ones (for leaderboards), not guest results
create policy "Users can read own game results" on game_results
  for select using (auth.uid() = user_id or user_id is not null);

create policy "Guests can read own game results" on game_results
  for select using (guest_id is not null);

create policy "Users can insert own game results" on game_results
  for insert with check (auth.uid() = user_id);

-- Streaks: users can read their own + public stats
create policy "Users can read own streaks" on streaks
  for select using (auth.uid() = user_id);

create policy "Users can insert own streaks" on streaks
  for insert with check (auth.uid() = user_id);

-- Custom challenges: public read, authenticated create/update own
create policy "Custom challenges are public" on custom_challenges
  for select using (true);

create policy "Users can create challenges" on custom_challenges
  for insert with check (auth.uid() = creator_user_id);

-- Duels: users can read their own, authenticated create
create policy "Users can read own duels" on duels
  for select using (auth.uid() = player_a_id or auth.uid() = player_b_id);

create policy "Users can create duels" on duels
  for insert with check (auth.uid() = player_a_id);

-- Forum threads: public read
create policy "Forum threads are public" on forum_threads
  for select using (true);

-- Forum posts: public read, require game completion for write
create policy "Forum posts are public" on forum_posts
  for select using (true);

create policy "Users with completed game can post" on forum_posts
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from game_results gr
      join forum_threads ft on ft.puzzle_id = gr.puzzle_id
      where ft.id = forum_posts.thread_id
      and gr.user_id = auth.uid()
    )
  );

-- Helper function: update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_puzzles_updated_at before update on puzzles
  for each row execute function update_updated_at_column();

create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_streaks_updated_at before update on streaks
  for each row execute function update_updated_at_column();

create trigger update_duels_updated_at before update on duels
  for each row execute function update_updated_at_column();

create trigger update_forum_posts_updated_at before update on forum_posts
  for each row execute function update_updated_at_column();
