-- ═══════════════════════════════════════════════════════════════
-- Migration : Abonnements aux notifications push (Web Push)
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════
-- Chaque appareil (navigateur) d'un membre enregistre un abonnement push.
-- Les deux membres du couple peuvent lire les abonnements du couple, afin
-- de pouvoir s'envoyer mutuellement des push depuis une Server Action.

create table if not exists public.push_subscriptions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  couple_id   uuid        not null references public.couples(id)  on delete cascade,
  endpoint    text        not null unique,
  p256dh      text        not null,
  auth        text        not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

-- Lecture : les membres du couple (pour pouvoir s'envoyer des push)
create policy "push_select_couple" on public.push_subscriptions
  for select using (is_couple_member(couple_id));

-- Insertion : chacun enregistre ses propres appareils
create policy "push_insert_own" on public.push_subscriptions
  for insert with check (user_id = auth.uid() and is_couple_member(couple_id));

-- Mise à jour : le propriétaire de l'abonnement
create policy "push_update_own" on public.push_subscriptions
  for update using (user_id = auth.uid());

-- Suppression : autorisée aux membres du couple (permet le nettoyage des
-- abonnements expirés détectés lors d'un envoi par le partenaire).
create policy "push_delete_couple" on public.push_subscriptions
  for delete using (is_couple_member(couple_id));
