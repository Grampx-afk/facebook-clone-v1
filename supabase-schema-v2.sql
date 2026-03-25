-- ============================================================
--  Facebook Clone v2 — Add Friends & Image Upload support
--  Run this in: Supabase Dashboard → SQL Editor → New Query
--  (Run AFTER supabase-schema.sql from v1)
-- ============================================================

-- ── FRIENDSHIPS TABLE ─────────────────────────────────────
-- Status: 'pending' | 'accepted'
-- requester_id sends the request, addressee_id receives it
create table public.friendships (
  id             uuid primary key default gen_random_uuid(),
  requester_id   uuid not null references public.profiles(id) on delete cascade,
  addressee_id   uuid not null references public.profiles(id) on delete cascade,
  status         text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at     timestamptz default now(),
  unique(requester_id, addressee_id)
);

alter table public.friendships enable row level security;

-- Anyone can see friendships (needed to show mutual friends, friend counts)
create policy "Friendships are viewable by everyone"
  on public.friendships for select using (true);

-- Only authenticated users can send friend requests
create policy "Authenticated users can send friend requests"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

-- Only the addressee can accept (update status)
create policy "Addressee can accept friend requests"
  on public.friendships for update
  using (auth.uid() = addressee_id);

-- Either party can delete (unfriend or cancel request)
create policy "Either party can remove friendship"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ── STORAGE BUCKETS ───────────────────────────────────────

-- Post images bucket (public read)
insert into storage.buckets (id, name, public)
  values ('post-images', 'post-images', true)
  on conflict (id) do nothing;

-- Avatar images bucket (public read)
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

-- Post images: anyone can view, authenticated can upload
create policy "Anyone can view post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.role() = 'authenticated');

create policy "Users can delete own post images"
  on storage.objects for delete
  using (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars: anyone can view, authenticated can upload
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ── USEFUL VIEWS ──────────────────────────────────────────

-- Helper view: get friend count per user
create or replace view public.friend_counts as
select
  profile_id,
  count(*) as friend_count
from (
  select requester_id as profile_id from public.friendships where status = 'accepted'
  union all
  select addressee_id as profile_id from public.friendships where status = 'accepted'
) sub
group by profile_id;
