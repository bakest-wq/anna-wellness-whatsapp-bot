-- Run in Supabase SQL Editor if client notes fail to save

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.client_profiles to service_role;
