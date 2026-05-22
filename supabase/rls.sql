-- ═══════════════════════════════════════════════════════════════
-- Notre Calendrier – Policies RLS
-- À exécuter après schema.sql
-- ═══════════════════════════════════════════════════════════════

-- ─── Activer RLS ────────────────────────────────────────────────
alter table public.profiles            enable row level security;
alter table public.couples             enable row level security;
alter table public.couple_members      enable row level security;
alter table public.couple_invitations  enable row level security;
alter table public.memories            enable row level security;
alter table public.memory_photos       enable row level security;
alter table public.monthly_covers      enable row level security;
alter table public.reactions           enable row level security;
alter table public.comments            enable row level security;
alter table public.important_dates     enable row level security;
alter table public.bucket_list_items   enable row level security;
alter table public.time_capsules       enable row level security;
alter table public.activity_logs       enable row level security;

-- ─── Fonction helper ────────────────────────────────────────────
create or replace function public.is_couple_member(p_couple_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.couple_members
    where couple_id = p_couple_id
      and user_id   = auth.uid()
  );
$$;

-- ─── PROFILES ───────────────────────────────────────────────────
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ─── COUPLES ────────────────────────────────────────────────────
create policy "couples_select_member"
  on public.couples for select
  using (is_couple_member(id));

create policy "couples_insert_authenticated"
  on public.couples for insert
  with check (auth.uid() is not null);

create policy "couples_update_member"
  on public.couples for update
  using (is_couple_member(id));

-- ─── COUPLE_MEMBERS ─────────────────────────────────────────────
create policy "members_select_member"
  on public.couple_members for select
  using (is_couple_member(couple_id));

create policy "members_insert_own"
  on public.couple_members for insert
  with check (user_id = auth.uid());

create policy "members_delete_own"
  on public.couple_members for delete
  using (user_id = auth.uid());

-- ─── COUPLE_INVITATIONS ─────────────────────────────────────────
-- Membres du couple voient leurs invitations ; utilisateur connecté peut lire
-- une invitation non expirée pour la rejoindre (avant d'être membre)
create policy "invitations_select_member"
  on public.couple_invitations for select
  using (
    is_couple_member(couple_id)
    OR (auth.uid() is not null AND accepted_at IS NULL AND expires_at > now())
  );

create policy "invitations_insert_member"
  on public.couple_invitations for insert
  with check (is_couple_member(couple_id) and invited_by = auth.uid());

create policy "invitations_update_authenticated"
  on public.couple_invitations for update
  using (auth.uid() is not null);

-- ─── MEMORIES ───────────────────────────────────────────────────
create policy "memories_select_member"
  on public.memories for select
  using (is_couple_member(couple_id));

create policy "memories_insert_member"
  on public.memories for insert
  with check (is_couple_member(couple_id) and author_id = auth.uid());

create policy "memories_update_author"
  on public.memories for update
  using (is_couple_member(couple_id) and author_id = auth.uid());

create policy "memories_delete_author"
  on public.memories for delete
  using (is_couple_member(couple_id) and author_id = auth.uid());

-- ─── MEMORY_PHOTOS ──────────────────────────────────────────────
create policy "photos_select_member"
  on public.memory_photos for select
  using (
    exists (
      select 1 from public.memories m
      where m.id = memory_id
        and is_couple_member(m.couple_id)
    )
  );

create policy "photos_insert_member"
  on public.memory_photos for insert
  with check (
    exists (
      select 1 from public.memories m
      where m.id = memory_id
        and is_couple_member(m.couple_id)
    )
  );

create policy "photos_delete_member"
  on public.memory_photos for delete
  using (
    exists (
      select 1 from public.memories m
      where m.id = memory_id
        and is_couple_member(m.couple_id)
    )
  );

-- ─── MONTHLY_COVERS ─────────────────────────────────────────────
create policy "covers_select_member"
  on public.monthly_covers for select
  using (is_couple_member(couple_id));

create policy "covers_insert_member"
  on public.monthly_covers for insert
  with check (is_couple_member(couple_id));

create policy "covers_update_member"
  on public.monthly_covers for update
  using (is_couple_member(couple_id));

create policy "covers_delete_member"
  on public.monthly_covers for delete
  using (is_couple_member(couple_id));

-- ─── REACTIONS ──────────────────────────────────────────────────
create policy "reactions_select_member"
  on public.reactions for select
  using (
    exists (
      select 1 from public.memories m
      where m.id = memory_id and is_couple_member(m.couple_id)
    )
  );

create policy "reactions_insert_member"
  on public.reactions for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.memories m
      where m.id = memory_id and is_couple_member(m.couple_id)
    )
  );

create policy "reactions_delete_own"
  on public.reactions for delete
  using (user_id = auth.uid());

-- ─── COMMENTS ───────────────────────────────────────────────────
create policy "comments_select_member"
  on public.comments for select
  using (
    exists (
      select 1 from public.memories m
      where m.id = memory_id and is_couple_member(m.couple_id)
    )
  );

create policy "comments_insert_member"
  on public.comments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.memories m
      where m.id = memory_id and is_couple_member(m.couple_id)
    )
  );

create policy "comments_update_own"
  on public.comments for update
  using (user_id = auth.uid());

create policy "comments_delete_own"
  on public.comments for delete
  using (user_id = auth.uid());

-- ─── IMPORTANT_DATES ────────────────────────────────────────────
create policy "dates_select_member"
  on public.important_dates for select using (is_couple_member(couple_id));

create policy "dates_insert_member"
  on public.important_dates for insert with check (is_couple_member(couple_id));

create policy "dates_update_member"
  on public.important_dates for update using (is_couple_member(couple_id));

create policy "dates_delete_member"
  on public.important_dates for delete using (is_couple_member(couple_id));

-- ─── BUCKET_LIST_ITEMS ──────────────────────────────────────────
create policy "bucket_select_member"
  on public.bucket_list_items for select using (is_couple_member(couple_id));

create policy "bucket_insert_member"
  on public.bucket_list_items for insert
  with check (is_couple_member(couple_id) and created_by = auth.uid());

create policy "bucket_update_member"
  on public.bucket_list_items for update using (is_couple_member(couple_id));

create policy "bucket_delete_creator"
  on public.bucket_list_items for delete
  using (is_couple_member(couple_id) and created_by = auth.uid());

-- ─── TIME_CAPSULES ──────────────────────────────────────────────
create policy "capsules_select_member"
  on public.time_capsules for select
  using (
    is_couple_member(couple_id)
    and (open_date <= current_date or created_by = auth.uid())
  );

create policy "capsules_insert_member"
  on public.time_capsules for insert
  with check (is_couple_member(couple_id) and created_by = auth.uid());

create policy "capsules_delete_creator"
  on public.time_capsules for delete
  using (created_by = auth.uid() and opened_at is null);

-- ─── ACTIVITY_LOGS ──────────────────────────────────────────────
create policy "activity_select_member"
  on public.activity_logs for select using (is_couple_member(couple_id));

create policy "activity_insert_member"
  on public.activity_logs for insert
  with check (is_couple_member(couple_id) and user_id = auth.uid());
