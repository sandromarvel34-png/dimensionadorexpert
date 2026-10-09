begin;
do $$
declare u uuid:=gen_random_uuid(); e text:='email-audit-'||u||'@example.invalid'; n timestamptz:=date_trunc('second',now()); c jsonb; lease uuid;
begin
 perform private.record_greenn_sale(910001,e,'mkimrj','paid',n,n);
 if (select expires_at from private.greenn_sales where sale_id=910001) is distinct from n+interval '6 months' then raise exception 'Current offer duration'; end if;
 c:=public.claim_greenn_access_email(910001);
 if c->>'email' <> e or (c->>'confirmed')::boolean then raise exception 'New user claim'; end if;
 lease:=(c->>'leaseId')::uuid;
 begin
  perform public.claim_greenn_access_email(910001);
  raise exception 'Concurrent duplicate allowed';
 exception when others then if sqlerrm='Concurrent duplicate allowed' then raise; end if; end;
 perform public.finish_greenn_access_email(910001,lease,'auth_email_failed');
 c:=public.claim_greenn_access_email(910001);
 if c is null then raise exception 'Retry suppressed'; end if;
 perform public.finish_greenn_access_email(910001,(c->>'leaseId')::uuid,null);
 if public.claim_greenn_access_email(910001) is not null then raise exception 'Already sent duplicate'; end if;
 insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data,created_at,updated_at) values(u,e,'{}','{}',now(),now());
 if (select status from public.user_access where user_id=u) <> 'suspended' then raise exception 'Premature activation'; end if;
 update auth.users set email_confirmed_at=now() where id=u;
 if not exists(select 1 from public.user_access where user_id=u and status='active' and access_expires_at=n+interval '6 months' and plan='Greenn — 6 meses') then raise exception 'Invite confirmation activation'; end if;
 perform private.record_greenn_sale(910002,e,'mkimrj','paid',n,n);
 c:=public.claim_greenn_access_email(910002);
 if not (c->>'confirmed')::boolean then raise exception 'Existing buyer detection'; end if;
 perform public.finish_greenn_access_email(910002,(c->>'leaseId')::uuid,'auth_email_failed');
 perform private.record_greenn_sale(910002,e,'mkimrj','refunded',n,n);
 if public.claim_greenn_access_email(910002) is not null then raise exception 'Refund invitation allowed'; end if;
 if has_function_privilege('anon','public.claim_greenn_access_email(bigint)','execute') or has_function_privilege('authenticated','public.finish_greenn_access_email(bigint,uuid,text)','execute') then raise exception 'Public email RPC'; end if;
end $$;
select 'offer, invite confirmation, renewal, leases, retries, duplicate suppression, refunds, permissions' as tested, true as passed;
rollback;
