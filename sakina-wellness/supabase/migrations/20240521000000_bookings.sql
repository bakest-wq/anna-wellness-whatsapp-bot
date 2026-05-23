-- Run in Supabase SQL Editor if the bookings table is not set up yet.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  service_id text not null,
  service_title text not null,
  package_id text,
  package_name text,
  preferred_date date not null,
  preferred_time text not null,
  client_name text not null,
  phone text not null,
  whatsapp_message text not null,
  status text not null default 'pending',
  source text not null default 'website'
);

alter table public.bookings enable row level security;

drop policy if exists "Allow anonymous booking inserts" on public.bookings;

create policy "Allow anonymous booking inserts"
  on public.bookings
  for insert
  to anon
  with check (true);
