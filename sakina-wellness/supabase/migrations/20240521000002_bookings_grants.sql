-- Ensure service_role can read/write bookings (fixes "permission denied for table bookings")

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.bookings to service_role;
grant insert on table public.bookings to anon;

alter table public.bookings enable row level security;
