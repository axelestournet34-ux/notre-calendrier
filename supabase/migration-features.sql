-- ═══════════════════════════════════════════════════════════════
-- Migration : messages du jour, humeurs, lettres, citation/chanson
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Messages du jour ────────────────────────────────────────
create table if not exists public.daily_messages (
  id         uuid        primary key default gen_random_uuid(),
  couple_id  uuid        not null references public.couples(id) on delete cascade,
  author_id  uuid        not null references public.profiles(id),
  content    text        not null check (char_length(content) between 1 and 500),
  date       date        not null default current_date,
  created_at timestamptz not null default now()
);
create unique index if not exists daily_messages_author_date_idx
  on public.daily_messages(author_id, date);

alter table public.daily_messages enable row level security;
create policy "daily_messages_select" on public.daily_messages
  for select using (is_couple_member(couple_id));
create policy "daily_messages_insert" on public.daily_messages
  for insert with check (is_couple_member(couple_id) and author_id = auth.uid());
create policy "daily_messages_delete" on public.daily_messages
  for delete using (author_id = auth.uid());

-- ── 2. Humeur du jour ─────────────────────────────────────────
create table if not exists public.daily_moods (
  id         uuid        primary key default gen_random_uuid(),
  couple_id  uuid        not null references public.couples(id) on delete cascade,
  user_id    uuid        not null references public.profiles(id),
  mood       text        not null check (mood in ('heureux','amoureux','fatigue','stresse','nostalgique','excite')),
  date       date        not null default current_date,
  created_at timestamptz not null default now()
);
create unique index if not exists daily_moods_user_date_idx
  on public.daily_moods(user_id, date);

alter table public.daily_moods enable row level security;
create policy "daily_moods_select" on public.daily_moods
  for select using (is_couple_member(couple_id));
create policy "daily_moods_insert" on public.daily_moods
  for insert with check (user_id = auth.uid() and is_couple_member(couple_id));
create policy "daily_moods_update" on public.daily_moods
  for update using (user_id = auth.uid());
create policy "daily_moods_delete" on public.daily_moods
  for delete using (user_id = auth.uid());

-- ── 3. Lettres d'amour ────────────────────────────────────────
create table if not exists public.lettres (
  id         uuid        primary key default gen_random_uuid(),
  couple_id  uuid        not null references public.couples(id) on delete cascade,
  author_id  uuid        not null references public.profiles(id),
  title      text        not null check (char_length(title) between 1 and 200),
  content    text        not null check (char_length(content) between 1 and 10000),
  created_at timestamptz not null default now()
);

alter table public.lettres enable row level security;
create policy "lettres_select" on public.lettres
  for select using (is_couple_member(couple_id));
create policy "lettres_insert" on public.lettres
  for insert with check (is_couple_member(couple_id) and author_id = auth.uid());
create policy "lettres_delete" on public.lettres
  for delete using (author_id = auth.uid());

-- ── 4. Citation + chanson sur les souvenirs ───────────────────
alter table public.memories
  add column if not exists citation    text,
  add column if not exists chanson_url text;
