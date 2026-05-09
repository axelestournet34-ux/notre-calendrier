-- ═══════════════════════════════════════════════════════════════
-- Notre Calendrier – Configuration Storage
-- ═══════════════════════════════════════════════════════════════

-- ─── Créer les buckets ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('memory-photos',   'memory-photos',   false, 10485760, array['image/jpeg','image/png','image/webp','image/heic']),
  ('monthly-covers',  'monthly-covers',  false, 10485760, array['image/jpeg','image/png','image/webp']),
  ('avatars',         'avatars',         true,  2097152,  array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- ─── Policies Storage : memory-photos ───────────────────────────
create policy "memory_photos_select"
  on storage.objects for select
  using (
    bucket_id = 'memory-photos'
    and public.is_couple_member(
      (string_to_array(name, '/'))[1]::uuid
    )
  );

create policy "memory_photos_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'memory-photos'
    and auth.uid() is not null
    and public.is_couple_member(
      (string_to_array(name, '/'))[1]::uuid
    )
  );

create policy "memory_photos_delete"
  on storage.objects for delete
  using (
    bucket_id = 'memory-photos'
    and public.is_couple_member(
      (string_to_array(name, '/'))[1]::uuid
    )
  );

-- ─── Policies Storage : monthly-covers ──────────────────────────
create policy "monthly_covers_select"
  on storage.objects for select
  using (
    bucket_id = 'monthly-covers'
    and public.is_couple_member(
      (string_to_array(name, '/'))[1]::uuid
    )
  );

create policy "monthly_covers_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'monthly-covers'
    and auth.uid() is not null
    and public.is_couple_member(
      (string_to_array(name, '/'))[1]::uuid
    )
  );

create policy "monthly_covers_delete"
  on storage.objects for delete
  using (
    bucket_id = 'monthly-covers'
    and public.is_couple_member(
      (string_to_array(name, '/'))[1]::uuid
    )
  );

-- ─── Policies Storage : avatars (bucket public) ─────────────────
create policy "avatars_select_all"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

create policy "avatars_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );
