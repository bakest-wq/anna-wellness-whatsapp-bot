-- Status values: new | confirmed | completed | cancelled
-- (legacy "pending" is treated as "new" in the admin UI)

alter table public.bookings
  alter column status set default 'new';

-- Server-side admin reads: use SUPABASE_SERVICE_ROLE_KEY in .env.local
-- Optional dev policy (remove in production):
-- create policy "Allow anon read bookings for admin dev"
--   on public.bookings for select to anon using (true);
