-- ═══════════════════════════════════════════════════════════════
-- Migration : lieu sur memories + audio dans memory_photos
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Champ lieu sur memories
alter table public.memories
  add column if not exists lieu text;

-- 2. Étendre media_type pour inclure 'audio'
alter table public.memory_photos
  drop constraint if exists memory_photos_media_type_check;

alter table public.memory_photos
  add constraint memory_photos_media_type_check
  check (media_type in ('photo', 'video', 'audio'));

-- 3. Autoriser audio dans le bucket memory-photos
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg','image/png','image/webp','image/heic','image/gif',
  'video/mp4','video/quicktime','video/webm','video/mov',
  'audio/webm','audio/mp4','audio/mpeg','audio/ogg'
]
where id = 'memory-photos';
