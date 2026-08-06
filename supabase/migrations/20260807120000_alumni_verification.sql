-- ============================================================================
-- Alumni verification: extra profile fields + admin-approved status change.
-- Safe to apply on top of the existing schema — creates new objects only,
-- never modifies or deletes existing tables/data.
-- ============================================================================

-- ---- Profiles: alumni-specific fields --------------------------------------
alter table public.profiles
  add column if not exists graduation_year integer,
  add column if not exists company text,
  add column if not exists designation text;

-- ---- Alumni verification requests ------------------------------------------
create table if not exists public.alumni_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  graduation_year integer,
  company text,
  designation text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Only one open request per user at a time.
create unique index if not exists alumni_verification_requests_one_pending
  on public.alumni_verification_requests (user_id)
  where (status = 'pending');

alter table public.alumni_verification_requests enable row level security;

create policy "Users view own alumni requests"
  on public.alumni_verification_requests for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Users submit own alumni requests"
  on public.alumni_verification_requests for insert
  with check (auth.uid() = user_id and status = 'pending');

create policy "Admins review alumni requests"
  on public.alumni_verification_requests for update
  using (public.has_role(auth.uid(), 'admin'));
