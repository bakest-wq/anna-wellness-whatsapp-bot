-- Run once in Supabase → SQL Editor to fix "permission denied for table bookings"
-- Required for admin dashboard reads with SUPABASE_SERVICE_ROLE_KEY (sb_secret_ / service_role)

grant usage on schema public to service_role;

grant select, insert, update, delete on table public.bookings to service_role;

-- Optional: allow anon inserts from the public booking form (if not already set)
grant insert on table public.bookings to anon;
