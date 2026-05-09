-- ═══════════════════════════════════════════════════════════════
-- Migration : support vidéos dans memory_photos
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Ajout colonne media_type sur memory_photos
alter table public.memory_photos
  add column if not exists media_type text not null default 'photo'
  check (media_type in ('photo', 'video'));

-- 2. Extension du bucket memory-photos : vidéos + limite 100 Mo
update storage.buckets
set
  file_size_limit  = 104857600,
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm', 'video/mov'
  ]
where id = 'memory-photos';
