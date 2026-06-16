-- ═══════════════════════════════════════════════════════════════
-- Migration : Question du jour
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════
-- Chaque membre répond une fois par jour à la même question (choisie selon
-- la date côté app). On stocke seulement les réponses.

create table if not exists public.daily_question_answers (
  id         uuid        primary key default gen_random_uuid(),
  couple_id  uuid        not null references public.couples(id)  on delete cascade,
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  answer     text        not null check (char_length(answer) between 1 and 1000),
  date       date        not null default current_date,
  created_at timestamptz not null default now()
);

create unique index if not exists daily_question_answers_user_date_idx
  on public.daily_question_answers(user_id, date);

alter table public.daily_question_answers enable row level security;

create policy "dqa_select" on public.daily_question_answers
  for select using (is_couple_member(couple_id));

create policy "dqa_insert" on public.daily_question_answers
  for insert with check (user_id = auth.uid() and is_couple_member(couple_id));

create policy "dqa_update" on public.daily_question_answers
  for update using (user_id = auth.uid());

create policy "dqa_delete" on public.daily_question_answers
  for delete using (user_id = auth.uid());
