-- ============================================================================
-- Alumni mentorship matching: students request mentorship from an alumnus;
-- on acceptance a chat is created so they can start talking.
-- Safe to apply on top of the existing schema — creates new objects only.
-- ============================================================================

create table if not exists public.mentorship_connections (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  alumni_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  chat_id uuid references public.chats(id) on delete set null,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

-- A student can have at most one open (pending) request per alumnus, but may
-- re-request after a decline.
create unique index if not exists mentorship_connections_one_pending
  on public.mentorship_connections (student_id, alumni_id)
  where (status = 'pending');

alter table public.mentorship_connections enable row level security;

create policy "Participants view own mentorship connections"
  on public.mentorship_connections for select
  using (
    auth.uid() = student_id
    or auth.uid() = alumni_id
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Students request mentorship from alumni"
  on public.mentorship_connections for insert
  with check (
    auth.uid() = student_id
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = alumni_id and p.member_type = 'alumni'
    )
  );

create policy "Alumni respond to their mentorship requests"
  on public.mentorship_connections for update
  using (auth.uid() = alumni_id);
