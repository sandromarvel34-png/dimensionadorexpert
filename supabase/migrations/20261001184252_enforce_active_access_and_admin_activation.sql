-- Existing accounts remain unchanged. New ordinary accounts require admin activation.
create or replace function private.dimensionador_access_active()
returns boolean language sql stable security invoker set search_path = '' as $$
  select exists(select 1 from public.user_access a where a.user_id = (select auth.uid()) and a.status = 'active' and (a.access_expires_at is null or a.access_expires_at > now()));
$$;
revoke all on function private.dimensionador_access_active() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.dimensionador_access_active() to authenticated;
do $$ declare t text; begin
  foreach t in array array['calculations','proposals','company_profiles','clients'] loop
    execute format('create policy paid_access_required on public.%I as restrictive for all to authenticated using ((select private.dimensionador_access_active())) with check ((select private.dimensionador_access_active()))',t);
  end loop;
end $$;
create or replace function private.handle_new_dimensionador_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare initial_role text := 'user'; begin
  if exists(select 1 from private.admin_allowlist a where lower(a.email)=lower(new.email)) then initial_role := 'admin'; end if;
  insert into public.profiles(user_id,full_name,updated_at) values(new.id,nullif(new.raw_user_meta_data->>'full_name',''),now()) on conflict(user_id) do nothing;
  insert into public.user_access(user_id,role,status,plan,access_started_at,updated_at)
  values(new.id,initial_role,case when initial_role='admin' then 'active' else 'suspended' end,case when initial_role='admin' then 'Administrador' else 'Aguardando liberação' end,now(),now()) on conflict(user_id) do nothing;
  return new;
end $$;
revoke all on function private.handle_new_dimensionador_user() from public,anon,authenticated;
