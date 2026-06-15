-- ═══════════════════════════════════════════════════════════════
-- Migration : souvenirs partagés dans le couple
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════
-- Avant : seul l'auteur pouvait modifier / supprimer un souvenir.
-- Après : les deux membres du couple peuvent modifier ET supprimer
-- n'importe quel souvenir du couple. (L'auteur d'origine reste enregistré
-- dans author_id, donc l'attribution « Ajouté par … » ne change pas.)
--
-- Les photos (memory_photos) étaient déjà partagées au niveau du couple.

-- ── Modification ──────────────────────────────────────────────
drop policy if exists "memories_update_author" on public.memories;
create policy "memories_update_member"
  on public.memories for update
  using (is_couple_member(couple_id))
  with check (is_couple_member(couple_id));

-- ── Suppression ───────────────────────────────────────────────
drop policy if exists "memories_delete_author" on public.memories;
create policy "memories_delete_member"
  on public.memories for delete
  using (is_couple_member(couple_id));
