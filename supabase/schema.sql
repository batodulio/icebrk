-- ============================================================================
-- IceBrk — Supabase schema
-- One table per game, one row per user per game, holding everything that
-- user entered in that game's Customize tab. Run this whole file once in
-- the Supabase SQL Editor (project: icebrk).
--
-- Every table:
--   * links to auth.users via user_id (row deleted when the user is deleted)
--   * is unique per user, so the app can upsert on user_id
--   * has Row Level Security: a user can only see/write their own row
--   * list-shaped entries (rosters, questions, boards, items) are stored as
--     jsonb in the exact shape the app already uses in src/games/*/types.ts,
--     so saving is a single upsert and loading is a single select.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Shared: keep updated_at fresh on every update
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Roulette  (src/games/roulette)
--    participants: [{ "id": "<uuid>", "name": "Ana" }, ...]
-- ---------------------------------------------------------------------------
create table if not exists public.roulette_settings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users (id) on delete cascade,
  participants  jsonb not null default '[]'::jsonb,
  spin_seconds  integer not null default 5 check (spin_seconds in (5, 10, 15, 20, 25)),
  theme_id      text not null default 'colorful' check (theme_id in ('colorful', 'summer', 'ocean', 'night')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Would You Rather  (src/games/would-you-rather)
--    questions: [{ "id": "<uuid>", "a": "Adobo every day", "b": "Sinigang every day" }, ...]
-- ---------------------------------------------------------------------------
create table if not exists public.would_you_rather_settings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null unique references auth.users (id) on delete cascade,
  questions      jsonb not null default '[]'::jsonb,
  timer_seconds  integer not null default 0 check (timer_seconds in (0, 30, 60, 90)),
  theme_id       text not null default 'colorful' check (theme_id in ('colorful', 'summer', 'ocean', 'night')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Jeopardy  (src/games/jeopardy)
--    board: [{ "id": "<uuid>", "name": "Movies",
--              "clues": [{ "id": "<uuid>", "points": 200, "question": "...", "answer": "..." }] }, ...]
--    teams: [{ "id": "<uuid>", "name": "Team Adobo", "score": 0 }, ...]
-- ---------------------------------------------------------------------------
create table if not exists public.jeopardy_settings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  board       jsonb not null default '[]'::jsonb,
  teams       jsonb not null default '[]'::jsonb,
  theme_id    text not null default 'colorful' check (theme_id in ('colorful', 'summer', 'ocean', 'night')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. Bingo  (src/games/bingo)
--    cards: [{ "id": "<uuid>", "rows": [[1, 16, "FREE", ...], ...] }, ...]
--    Cards are saved so the same generated set can be restored after a refresh.
-- ---------------------------------------------------------------------------
create table if not exists public.bingo_settings (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references auth.users (id) on delete cascade,
  card_count         integer not null default 4 check (card_count in (2, 4, 6, 8, 10, 12)),
  cards              jsonb not null default '[]'::jsonb,
  auto_call_seconds  integer not null default 0 check (auto_call_seconds in (0, 5, 8, 12)),
  theme_id           text not null default 'colorful' check (theme_id in ('colorful', 'summer', 'ocean', 'night')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. Two Truths & a Lie  (src/games/two-truths)
--    participants: [{ "id": "<uuid>", "name": "Ana" }, ...]
-- ---------------------------------------------------------------------------
create table if not exists public.two_truths_settings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null unique references auth.users (id) on delete cascade,
  participants   jsonb not null default '[]'::jsonb,
  timer_seconds  integer not null default 0 check (timer_seconds in (0, 30, 60, 90)),
  theme_id       text not null default 'colorful' check (theme_id in ('colorful', 'summer', 'ocean', 'night')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. Scavenger Hunt  (src/games/scavenger-hunt)
--    items: [{ "id": "<uuid>", "text": "Something yellow" }, ...]
-- ---------------------------------------------------------------------------
create table if not exists public.scavenger_hunt_settings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users (id) on delete cascade,
  items         jsonb not null default '[]'::jsonb,
  hunt_minutes  integer not null default 5 check (hunt_minutes in (0, 2, 5, 10, 15)),
  theme_id      text not null default 'colorful' check (theme_id in ('colorful', 'summer', 'ocean', 'night')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists set_updated_at on public.roulette_settings;
create trigger set_updated_at before update on public.roulette_settings
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.would_you_rather_settings;
create trigger set_updated_at before update on public.would_you_rather_settings
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.jeopardy_settings;
create trigger set_updated_at before update on public.jeopardy_settings
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.bingo_settings;
create trigger set_updated_at before update on public.bingo_settings
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.two_truths_settings;
create trigger set_updated_at before update on public.two_truths_settings
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.scavenger_hunt_settings;
create trigger set_updated_at before update on public.scavenger_hunt_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: each user can only touch their own row
-- ---------------------------------------------------------------------------
alter table public.roulette_settings         enable row level security;
alter table public.would_you_rather_settings enable row level security;
alter table public.jeopardy_settings         enable row level security;
alter table public.bingo_settings            enable row level security;
alter table public.two_truths_settings       enable row level security;
alter table public.scavenger_hunt_settings   enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'roulette_settings',
    'would_you_rather_settings',
    'jeopardy_settings',
    'bingo_settings',
    'two_truths_settings',
    'scavenger_hunt_settings'
  ]
  loop
    execute format('drop policy if exists "Users can view own %1$s"   on public.%1$I', t);
    execute format('drop policy if exists "Users can insert own %1$s" on public.%1$I', t);
    execute format('drop policy if exists "Users can update own %1$s" on public.%1$I', t);
    execute format('drop policy if exists "Users can delete own %1$s" on public.%1$I', t);

    execute format(
      'create policy "Users can view own %1$s" on public.%1$I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Users can insert own %1$s" on public.%1$I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Users can update own %1$s" on public.%1$I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Users can delete own %1$s" on public.%1$I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end;
$$;
