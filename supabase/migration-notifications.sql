-- ═══════════════════════════════════════════════════════════════
-- Migration : Notifications in-app (temps réel)
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════
-- Quand un membre du couple fait une action (message du jour, souvenir,
-- humeur, lettre, mot d'amour, commentaire, réaction), une notification
-- est créée pour l'autre membre. Le destinataire la voit dans la cloche 🔔.

create table if not exists public.notifications (
  id           uuid        primary key default gen_random_uuid(),
  couple_id    uuid        not null references public.couples(id)  on delete cascade,
  recipient_id uuid        not null references public.profiles(id) on delete cascade,
  actor_id     uuid        not null references public.profiles(id) on delete cascade,
  type         text        not null,
  title        text        not null,
  body         text,
  link         text,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists idx_notifications_recipient
  on public.notifications(recipient_id, created_at desc);

create index if not exists idx_notifications_unread
  on public.notifications(recipient_id) where read_at is null;

-- ─── RLS ────────────────────────────────────────────────────────
alter table public.notifications enable row level security;

-- Le destinataire lit ses notifications
create policy "notifications_select_own" on public.notifications
  for select using (recipient_id = auth.uid());

-- Le destinataire les marque comme lues
create policy "notifications_update_own" on public.notifications
  for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

-- Le destinataire peut les supprimer
create policy "notifications_delete_own" on public.notifications
  for delete using (recipient_id = auth.uid());

-- L'acteur (auteur de l'action) crée des notifications dans son couple
create policy "notifications_insert_actor" on public.notifications
  for insert with check (is_couple_member(couple_id) and actor_id = auth.uid());

-- ─── Temps réel (Supabase Realtime) ─────────────────────────────
-- Permet à la cloche de recevoir les nouvelles notifications en direct.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
