-- ═══════════════════════════════════════════════════════════════
-- Migration : jeu « Tu me connais ? »
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════
-- L'un pose une question à choix multiple sur lui-même ; l'autre devine.

create table if not exists public.tmc_questions (
  id            uuid        primary key default gen_random_uuid(),
  couple_id     uuid        not null references public.couples(id)  on delete cascade,
  author_id     uuid        not null references public.profiles(id) on delete cascade,
  question      text        not null check (char_length(question) between 1 and 300),
  options       jsonb       not null,        -- tableau de chaînes (mélangé)
  correct_index int         not null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_tmc_questions_couple
  on public.tmc_questions(couple_id, created_at desc);

create table if not exists public.tmc_answers (
  id           uuid        primary key default gen_random_uuid(),
  question_id  uuid        not null references public.tmc_questions(id) on delete cascade,
  user_id      uuid        not null references public.profiles(id)      on delete cascade,
  chosen_index int         not null,
  created_at   timestamptz not null default now(),
  unique (question_id, user_id)
);

alter table public.tmc_questions enable row level security;
alter table public.tmc_answers   enable row level security;

create policy "tmc_q_select" on public.tmc_questions
  for select using (is_couple_member(couple_id));
create policy "tmc_q_insert" on public.tmc_questions
  for insert with check (is_couple_member(couple_id) and author_id = auth.uid());
create policy "tmc_q_delete" on public.tmc_questions
  for delete using (author_id = auth.uid());

create policy "tmc_a_select" on public.tmc_answers
  for select using (
    exists (select 1 from public.tmc_questions q where q.id = question_id and is_couple_member(q.couple_id))
  );
create policy "tmc_a_insert" on public.tmc_answers
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.tmc_questions q where q.id = question_id and is_couple_member(q.couple_id))
  );
