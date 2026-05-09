-- ═══════════════════════════════════════════════════════════════
-- Notre Calendrier – Schéma Supabase
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── Extensions ─────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ─── TYPES ENUM ─────────────────────────────────────────────────
create type public.memory_type as enum (
  'sortie', 'voyage', 'repas', 'anniversaire',
  'quotidien', 'premiere_fois', 'autre'
);

create type public.reaction_type as enum (
  'coeur', 'rire', 'etoile', 'nostalgie'
);

create type public.important_date_type as enum (
  'anniversaire', 'premiere_rencontre', 'voyage', 'personnalise'
);

create type public.bucket_status as enum (
  'a_faire', 'en_cours', 'realise'
);

-- ─── PROFILES ───────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

comment on table public.profiles is 'Profil étendu lié à auth.users';

-- Trigger : créer le profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger : mettre à jour updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─── COUPLES ────────────────────────────────────────────────────
create table public.couples (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null default 'Notre histoire',
  start_date  date,
  cover_url   text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create trigger couples_updated_at
  before update on public.couples
  for each row execute function public.set_updated_at();

-- ─── COUPLE_MEMBERS ─────────────────────────────────────────────
create table public.couple_members (
  id         uuid primary key default uuid_generate_v4(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null default 'member'
                check (role in ('owner', 'member')),
  joined_at  timestamptz default now() not null,
  unique (couple_id, user_id)
);

create index idx_couple_members_user on public.couple_members(user_id);

-- ─── COUPLE_INVITATIONS ─────────────────────────────────────────
create table public.couple_invitations (
  id          uuid primary key default uuid_generate_v4(),
  couple_id   uuid not null references public.couples(id) on delete cascade,
  invited_by  uuid not null references public.profiles(id),
  token       text not null unique default encode(gen_random_bytes(32), 'hex'),
  email       text,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at  timestamptz default now() not null
);

-- ─── MEMORIES ───────────────────────────────────────────────────
create table public.memories (
  id         uuid primary key default uuid_generate_v4(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  author_id  uuid not null references public.profiles(id),
  date       date not null,
  title      text not null check (char_length(title) <= 200),
  note       text check (char_length(note) <= 2000),
  type       public.memory_type not null default 'autre',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_memories_couple_date on public.memories(couple_id, date desc);
create index idx_memories_author on public.memories(author_id);
create index idx_memories_search on public.memories using gin(title gin_trgm_ops);

create trigger memories_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

-- ─── MEMORY_PHOTOS ──────────────────────────────────────────────
create table public.memory_photos (
  id           uuid primary key default uuid_generate_v4(),
  memory_id    uuid not null references public.memories(id) on delete cascade,
  storage_path text not null,
  caption      text check (char_length(caption) <= 300),
  sort_order   int not null default 0,
  created_at   timestamptz default now() not null
);

create index idx_memory_photos_memory on public.memory_photos(memory_id, sort_order);

-- ─── MONTHLY_COVERS ─────────────────────────────────────────────
create table public.monthly_covers (
  id           uuid primary key default uuid_generate_v4(),
  couple_id    uuid not null references public.couples(id) on delete cascade,
  year         int not null,
  month        int not null check (month between 1 and 12),
  photo_id     uuid references public.memory_photos(id) on delete set null,
  storage_path text,
  created_at   timestamptz default now() not null,
  unique (couple_id, year, month)
);

-- ─── REACTIONS ──────────────────────────────────────────────────
create table public.reactions (
  id         uuid primary key default uuid_generate_v4(),
  memory_id  uuid not null references public.memories(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       public.reaction_type not null,
  created_at timestamptz default now() not null,
  unique (memory_id, user_id, type)
);

create index idx_reactions_memory on public.reactions(memory_id);

-- ─── COMMENTS ───────────────────────────────────────────────────
create table public.comments (
  id         uuid primary key default uuid_generate_v4(),
  memory_id  uuid not null references public.memories(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 500),
  created_at timestamptz default now() not null
);

create index idx_comments_memory on public.comments(memory_id, created_at);

-- ─── IMPORTANT_DATES ────────────────────────────────────────────
create table public.important_dates (
  id         uuid primary key default uuid_generate_v4(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  title      text not null check (char_length(title) <= 150),
  date       date not null,
  type       public.important_date_type not null default 'personnalise',
  recurrent  boolean not null default false,
  notes      text check (char_length(notes) <= 500),
  created_at timestamptz default now() not null
);

create index idx_important_dates_couple on public.important_dates(couple_id, date);

-- ─── BUCKET_LIST_ITEMS ──────────────────────────────────────────
create table public.bucket_list_items (
  id           uuid primary key default uuid_generate_v4(),
  couple_id    uuid not null references public.couples(id) on delete cascade,
  created_by   uuid not null references public.profiles(id),
  title        text not null check (char_length(title) <= 200),
  description  text check (char_length(description) <= 1000),
  status       public.bucket_status not null default 'a_faire',
  planned_date date,
  memory_id    uuid references public.memories(id) on delete set null,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create index idx_bucket_couple on public.bucket_list_items(couple_id, status);

create trigger bucket_updated_at
  before update on public.bucket_list_items
  for each row execute function public.set_updated_at();

-- ─── TIME_CAPSULES ──────────────────────────────────────────────
create table public.time_capsules (
  id          uuid primary key default uuid_generate_v4(),
  couple_id   uuid not null references public.couples(id) on delete cascade,
  created_by  uuid not null references public.profiles(id),
  title       text not null check (char_length(title) <= 200),
  content     text not null check (char_length(content) <= 5000),
  open_date   date not null,
  opened_at   timestamptz,
  created_at  timestamptz default now() not null
);

create index idx_capsules_couple on public.time_capsules(couple_id, open_date);

-- ─── ACTIVITY_LOGS ──────────────────────────────────────────────
create table public.activity_logs (
  id            uuid primary key default uuid_generate_v4(),
  couple_id     uuid not null references public.couples(id) on delete cascade,
  user_id       uuid not null references public.profiles(id),
  action        text not null,
  resource_type text,
  resource_id   uuid,
  created_at    timestamptz default now() not null
);

create index idx_activity_couple_date on public.activity_logs(couple_id, created_at desc);
