-- Chạy trong Supabase SQL Editor (một lần)

create table if not exists public.player_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  save_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.player_saves enable row level security;

drop policy if exists "player_saves_select_own" on public.player_saves;
drop policy if exists "player_saves_insert_own" on public.player_saves;
drop policy if exists "player_saves_update_own" on public.player_saves;
drop policy if exists "player_saves_delete_own" on public.player_saves;

create policy "player_saves_select_own"
  on public.player_saves for select
  using (auth.uid() = user_id);

create policy "player_saves_insert_own"
  on public.player_saves for insert
  with check (auth.uid() = user_id);

create policy "player_saves_update_own"
  on public.player_saves for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "player_saves_delete_own"
  on public.player_saves for delete
  using (auth.uid() = user_id);
