-- CRM: admin notes per client (keyed by normalized phone)

create table if not exists public.client_profiles (
  phone_normalized text primary key,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.client_profiles enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.client_profiles to service_role;
