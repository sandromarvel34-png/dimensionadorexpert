-- No unverified legacy seed is copied into the production catalog.
do $$ begin
  if not exists(select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typname='motor_speed_type') then
    create type public.motor_speed_type as enum ('SINGLE','DAHLANDER','DOUBLE_WINDING');
  end if;
end $$;
create table if not exists public.motor_catalog (
 id uuid primary key default gen_random_uuid(), manufacturer text not null default 'WEG', line text not null,
 speed_type public.motor_speed_type not null default 'SINGLE', poles text not null,
 power_cv numeric not null check(power_cv>0), power_kw numeric not null check(power_kw>0), voltage numeric not null check(voltage>0),
 frequency numeric default 60 check(frequency=60), nominal_current numeric not null check(nominal_current>0),
 power_factor numeric not null check(power_factor>0 and power_factor<=1), efficiency numeric not null check(efficiency>0 and efficiency<=1),
 service_factor numeric default 1 check(service_factor>=1), rpm integer, frame text, model_code text,
 catalog_reference text not null check(length(catalog_reference)>0), is_active boolean default false,
 created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.motor_catalog enable row level security;
grant select on public.motor_catalog to authenticated;
grant all on public.motor_catalog to service_role;
create policy verified_catalog_active_access on public.motor_catalog for select to authenticated using (is_active and (select private.dimensionador_access_active()));
create index if not exists motor_catalog_active_filter on public.motor_catalog(line,speed_type,poles,power_cv,voltage) where is_active;
