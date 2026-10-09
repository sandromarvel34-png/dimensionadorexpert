-- The current product has one 6-month plan. A nullable-offer event
-- uses mkimrj; a replay/reversal may contain the explicit test-offer alias.
create or replace function private.record_greenn_sale(p_sale_id bigint,p_email text,p_offer text,p_status text,p_paid_at timestamptz,p_updated_at timestamptz)
returns void language plpgsql security definer set search_path='' as $$
declare existing private.greenn_sales%rowtype; uid uuid; expiry timestamptz; base timestamptz; months integer;
begin
  if p_sale_id<=0 or p_email is null or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or p_offer not in ('4Q1tqK','fMqpDz','mkimrj','ndY8mn') or p_offer is null or p_status not in ('paid','refunded','chargedback') or p_status is null
    or p_updated_at is null or p_updated_at > now()+interval '5 minutes'
    or (p_status='paid' and (p_paid_at is null or p_paid_at>now()+interval '5 minutes')) then raise exception 'Invalid sale'; end if;
  p_email := lower(trim(p_email));
  perform pg_advisory_xact_lock(hashtextextended(p_email,196035));
  perform pg_advisory_xact_lock(p_sale_id);
  select * into existing from private.greenn_sales where sale_id=p_sale_id for update;
  if found then
    if existing.email<>p_email or (existing.offer<>p_offer and not (existing.offer in ('mkimrj','ndY8mn') and p_offer in ('mkimrj','ndY8mn'))) then raise exception 'Sale identity mismatch'; end if;
    -- Refunds/chargebacks are final. Delayed paid events cannot restore a revoked sale.
    if existing.status in ('refunded','chargedback') or existing.event_updated_at>p_updated_at
      or (existing.event_updated_at=p_updated_at and p_status='paid') then return; end if;
    expiry := existing.expires_at; uid := existing.user_id;
  end if;
  if uid is null then select id into uid from auth.users where lower(email)=p_email and email_confirmed_at is not null limit 1; end if;
  if uid is not null then perform 1 from public.user_access where user_id=uid for update; end if;
  if p_status='paid' and expiry is null then
    months := case p_offer when '4Q1tqK' then 6 when 'mkimrj' then 6 when 'ndY8mn' then 6 else 12 end;
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
