-- ============================================================================
-- ADDITIVE migration: engagement features (optional, not yet wired in the UI).
-- Safe to apply on top of the existing schema — creates new objects only,
-- never modifies or deletes existing tables/data.
--
-- Enables (once applied + UI wired):
--   * Feed:      post bookmarks ("Saved" filter)
--   * Resources: file favorites ("Starred" filter) + download counts
--   * Chat:      unread counts / read receipts, message reactions, replies
-- ============================================================================

-- ---- Feed: bookmarks -------------------------------------------------------
create table if not exists public.post_bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.post_bookmarks enable row level security;

create policy "Users manage own bookmarks"
  on public.post_bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---- Resources: favorites --------------------------------------------------
create table if not exists public.file_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_id uuid not null references public.filemodels(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, file_id)
);

alter table public.file_favorites enable row level security;

create policy "Users manage own file favorites"
  on public.file_favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---- Resources: download counts -------------------------------------------
alter table public.filemodels
  add column if not exists download_count integer not null default 0;

create or replace function public.increment_download_count(p_file_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.filemodels
     set download_count = download_count + 1
   where id = p_file_id;
$$;

-- ---- Chat: read receipts / unread counts -----------------------------------
alter table public.chat_members
  add column if not exists last_read_at timestamptz;

-- ---- Chat: message reactions ------------------------------------------------
create table if not exists public.chat_message_reactions (
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

alter table public.chat_message_reactions enable row level security;

create policy "Chat members read reactions"
  on public.chat_message_reactions for select
  using (
    exists (
      select 1
        from public.chat_messages m
        join public.chat_members cm on cm.chat_id = m.chat_id
       where m.id = chat_message_reactions.message_id
         and cm.user_id = auth.uid()
    )
  );

create policy "Users manage own reactions"
  on public.chat_message_reactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---- Chat: replies -----------------------------------------------------------
alter table public.chat_messages
  add column if not exists reply_to_message_id uuid references public.chat_messages(id) on delete set null;
