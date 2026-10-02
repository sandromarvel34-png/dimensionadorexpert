begin;
-- Minimal purchase data only: no documents, telephone, addresses or raw webhook bodies.
create table private.greenn_sales (
  sale_id bigint primary key check(sale_id > 0),
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  offer text not null check(offer in ('4Q1tqK','fMqpDz')),
  status text not null check(status in ('paid','refunded','chargedback')),
  paid_at timestamptz,
  expires_at timestamptz,
  event_updated_at timestamptz not null,
  created_at timestamptz not null default now(),
  check(status <> 'paid' or (paid_at is not null and expires_at is not null))
);
create index greenn_sales_email_idx on private.greenn_sales(email);
create index greenn_sales_user_idx on private.greenn_sales(user_id);
create table private.manual_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check(status in ('active','suspended')),
  plan text not null,
  expires_at timestamptz,
  started_at timestamptz not null
);
alter table private.greenn_sales enable row level security;
alter table private.manual_access enable row level security;
revoke all on private.greenn_sales, private.manual_access from public, anon, authenticated;
-- Preserve every pre-existing access and suspension; awaiting signup is not an admin block.
insert into private.manual_access(user_id,status,plan,expires_at,started_at)
select user_id,status,plan,access_expires_at,access_started_at from public.user_access
where role <> 'admin' and (status='active' or plan <> 'Aguardando liberação');

create function private.refresh_paid_access(p_user uuid) returns void
language plpgsql security definer set search_path='' as $$
declare m private.manual_access%rowtype; expiry timestamptz; paid_plan text; prior text;
begin
  perform 1 from public.user_access where user_id=p_user for update;
  if not found or exists(select 1 from public.user_access where user_id=p_user and role='admin') then return; end if;
  select * into m from private.manual_access where user_id=p_user;
  select max(expires_at) into expiry from private.greenn_sales where user_id=p_user and status='paid';
  select case offer when '4Q1tqK' then 'Greenn — 6 meses' else 'Greenn — 12 meses' end into paid_plan
    from private.greenn_sales where user_id=p_user and status='paid' order by expires_at desc limit 1;
  prior := coalesce(current_setting('dimensionador.payment_update',true),'');
  perform set_config('dimensionador.payment_update','yes',true);
  if m.status='suspended' then
    update public.user_access set status='suspended',plan=m.plan,access_expires_at=m.expires_at,updated_at=now() where user_id=p_user;
  elsif m.status='active' and (m.expires_at is null or m.expires_at >= coalesce(expiry,m.expires_at)) then
    update public.user_access set status='active',plan=m.plan,access_expires_at=m.expires_at,updated_at=now() where user_id=p_user;
  elsif expiry is not null then
    update public.user_access set status='active',plan=paid_plan,access_expires_at=expiry,updated_at=now() where user_id=p_user;
  else
    update public.user_access set status='suspended',plan='Aguardando liberação',access_expires_at=null,updated_at=now() where user_id=p_user;
  end if;
  perform set_config('dimensionador.payment_update',prior,true);
end $$;
revoke all on function private.refresh_paid_access(uuid) from public,anon,authenticated;

create function private.capture_manual_access() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if coalesce(current_setting('dimensionador.payment_update',true),'')='yes' or new.role='admin' then return new; end if;
  insert into private.manual_access(user_id,status,plan,expires_at,started_at)
  values(new.user_id,new.status,new.plan,new.access_expires_at,new.access_started_at)
  on conflict(user_id) do update set status=excluded.status,plan=excluded.plan,expires_at=excluded.expires_at,started_at=excluded.started_at;
  return new;
end $$;
revoke all on function private.capture_manual_access() from public,anon,authenticated;
create trigger capture_dimensionador_manual_access after update of status,plan,access_expires_at on public.user_access
for each row execute function private.capture_manual_access();

create function private.claim_greenn_access() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.email_confirmed_at is null or new.email is null then return new; end if;
  perform pg_advisory_xact_lock(hashtextextended(lower(trim(new.email)),196035));
  update private.greenn_sales set user_id=new.id where user_id is null and email=lower(trim(new.email));
  if exists(select 1 from private.greenn_sales where user_id=new.id) then perform private.refresh_paid_access(new.id); end if;
  return new;
end $$;
revoke all on function private.claim_greenn_access() from public,anon,authenticated;
-- Runs after the existing signup trigger, without replacing it.
create trigger zz_claim_greenn_after_signup after insert or update of email,email_confirmed_at on auth.users
for each row execute function private.claim_greenn_access();

create function private.record_greenn_sale(p_sale_id bigint,p_email text,p_offer text,p_status text,p_paid_at timestamptz,p_updated_at timestamptz)
returns void language plpgsql security definer set search_path='' as $$
declare existing private.greenn_sales%rowtype; uid uuid; expiry timestamptz; base timestamptz; months integer;
begin
  if p_sale_id<=0 or p_email is null or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or p_offer not in ('4Q1tqK','fMqpDz') or p_offer is null or p_status not in ('paid','refunded','chargedback') or p_status is null
    or p_updated_at is null or p_updated_at > now()+interval '5 minutes'
    or (p_status='paid' and (p_paid_at is null or p_paid_at>now()+interval '5 minutes')) then raise exception 'Invalid sale'; end if;
  p_email := lower(trim(p_email));
  perform pg_advisory_xact_lock(hashtextextended(p_email,196035));
  perform pg_advisory_xact_lock(p_sale_id);
  select * into existing from private.greenn_sales where sale_id=p_sale_id for update;
  if found then
    if existing.email<>p_email or existing.offer<>p_offer then raise exception 'Sale identity mismatch'; end if;
    -- Refunds/chargebacks are final. Delayed paid events cannot restore a revoked sale.
    if existing.status in ('refunded','chargedback') or existing.event_updated_at>p_updated_at
      or (existing.event_updated_at=p_updated_at and p_status='paid') then return; end if;
    expiry := existing.expires_at; uid := existing.user_id;
  end if;
  if uid is null then select id into uid from auth.users where lower(email)=p_email and email_confirmed_at is not null limit 1; end if;
  if uid is not null then perform 1 from public.user_access where user_id=uid for update; end if;
  if p_status='paid' and expiry is null then
    months := case p_offer when '4Q1tqK' then 6 else 12 end;
    select greatest(p_paid_at,coalesce(max(expires_at),p_paid_at)) into base from private.greenn_sales
      where email=p_email and status='paid' and sale_id<>p_sale_id;
    if uid is not null then
      select greatest(base,coalesce(max(expires_at),base)) into base from private.manual_access where user_id=uid and status='active';
    end if;
    expiry := base + make_interval(months=>months);
  end if;
  insert into private.greenn_sales(sale_id,email,user_id,offer,status,paid_at,expires_at,event_updated_at)
  values(p_sale_id,p_email,uid,p_offer,p_status,p_paid_at,expiry,p_updated_at)
  on conflict(sale_id) do update set status=excluded.status,event_updated_at=excluded.event_updated_at,user_id=excluded.user_id;
  if uid is not null then perform private.refresh_paid_access(uid); end if;
end $$;
revoke all on function private.record_greenn_sale(bigint,text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.record_greenn_sale(bigint,text,text,text,timestamptz,timestamptz) to service_role;
create function public.record_greenn_sale(p_sale_id bigint,p_email text,p_offer text,p_status text,p_paid_at timestamptz,p_updated_at timestamptz)
returns void language sql security invoker set search_path='' as $$
  select private.record_greenn_sale(p_sale_id,p_email,p_offer,p_status,p_paid_at,p_updated_at);
$$;
revoke all on function public.record_greenn_sale(bigint,text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.record_greenn_sale(bigint,text,text,text,timestamptz,timestamptz) to service_role;
commit;
