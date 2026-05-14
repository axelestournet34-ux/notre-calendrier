create table public.liste_courses (
  id         uuid primary key default uuid_generate_v4(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 200),
  done       boolean not null default false,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz default now() not null
);

alter table public.liste_courses enable row level security;

create policy "Membres du couple" on public.liste_courses
  using (exists (select 1 from public.couple_members where couple_id = liste_courses.couple_id and user_id = auth.uid()))
  with check (exists (select 1 from public.couple_members where couple_id = liste_courses.couple_id and user_id = auth.uid()));
