-- ═══════════════════════════════════════════════════════════════
-- Migration : finitions (prénom partenaire + légendes/couverture photos)
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Voir le profil de son/sa partenaire ────────────────────
-- Avant : chacun ne pouvait lire QUE son propre profil → le prénom du
-- partenaire s'affichait « Partenaire » partout. Après : les membres d'un
-- même couple peuvent lire le profil (prénom, avatar) l'un de l'autre.
drop policy if exists "profiles_select_couple" on public.profiles;
create policy "profiles_select_couple" on public.profiles
  for select using (
    exists (
      select 1 from public.couple_members cm
      where cm.user_id = profiles.id
        and is_couple_member(cm.couple_id)
    )
  );

-- ── 2. Modifier les photos (légendes + ordre/couverture) ──────
-- Il n'existait pas de policy UPDATE sur memory_photos : impossible de
-- changer une légende ou l'ordre. On l'autorise aux membres du couple.
drop policy if exists "photos_update_member" on public.memory_photos;
create policy "photos_update_member" on public.memory_photos
  for update using (
    exists (
      select 1 from public.memories m
      where m.id = memory_id and is_couple_member(m.couple_id)
    )
  );
