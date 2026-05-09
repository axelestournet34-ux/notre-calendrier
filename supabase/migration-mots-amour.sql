-- ═══════════════════════════════════════════════════════════════
-- Migration : mots d'amour avec photos
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.mots_amour (
  id         uuid        primary key default gen_random_uuid(),
  couple_id  uuid        not null references public.couples(id) on delete cascade,
  author_id  uuid        not null references public.profiles(id),
  content    text        not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.mots_amour_photos (
  id           uuid        primary key default gen_random_uuid(),
  mot_id       uuid        not null references public.mots_amour(id) on delete cascade,
  storage_path text        not null,
  sort_order   int         not null default 0,
  created_at   timestamptz not null default now()
);

-- RLS
alter table public.mots_amour        enable row level security;
alter table public.mots_amour_photos enable row level security;

create policy "mots_amour_select" on public.mots_amour
  for select using (is_couple_member(couple_id));
create policy "mots_amour_insert" on public.mots_amour
  for insert with check (is_couple_member(couple_id) and author_id = auth.uid());
create policy "mots_amour_delete" on public.mots_amour
  for delete using (author_id = auth.uid());

create policy "mots_amour_photos_select" on public.mots_amour_photos
  for select using (
    exists (select 1 from public.mots_amour m where m.id = mot_id and is_couple_member(m.couple_id))
  );
create policy "mots_amour_photos_insert" on public.mots_amour_photos
  for insert with check (
    exists (select 1 from public.mots_amour m where m.id = mot_id and m.author_id = auth.uid())
  );
create policy "mots_amour_photos_delete" on public.mots_amour_photos
  for delete using (
    exists (select 1 from public.mots_amour m where m.id = mot_id and m.author_id = auth.uid())
  );
