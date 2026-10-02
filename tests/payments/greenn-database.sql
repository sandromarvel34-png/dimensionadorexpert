create temp table audit_result (test text, passed boolean);
do $$
declare u uuid:=gen_random_uuid(); v uuid:=gen_random_uuid(); w uuid:=gen_random_uuid();
 e text:='greenn-audit-'||u||'@example.invalid'; f text:='greenn-audit-'||v||'@example.invalid'; g text:='greenn-audit-'||w||'@example.invalid';
 expiry timestamptz; before_expiry timestamptz; nowpaid timestamptz:=date_trunc('second',now());
begin
 insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at)
 values(u,e,now(),'{}','{}',now(),now());
 if not exists(select 1 from public.user_access where user_id=u and status='suspended') then raise exception 'Signup regression'; end if;
 perform private.record_greenn_sale(900001,e,'4Q1tqK','paid',nowpaid,nowpaid);
 select access_expires_at into expiry from public.user_access where user_id=u and status='active';
 if expiry is distinct from nowpaid+interval '6 months' then raise exception 'Six month access'; end if;
 insert into audit_result values('6 meses e usuário existente',true);
 perform private.record_greenn_sale(900001,e,'4Q1tqK','paid',nowpaid,nowpaid);
 if (select access_expires_at from public.user_access where user_id=u) is distinct from expiry then raise exception 'Duplicate extended access'; end if;
 insert into audit_result values('Evento repetido não aumenta prazo',true);
 perform private.record_greenn_sale(900002,e,'fMqpDz','paid',nowpaid,nowpaid);
 if (select access_expires_at from public.user_access where user_id=u) is distinct from expiry+interval '12 months' then raise exception 'Renewal failed'; end if;
 insert into audit_result values('12 meses e renovação acumulada',true);
 perform private.record_greenn_sale(900002,e,'fMqpDz','refunded',nowpaid,nowpaid);
 if (select access_expires_at from public.user_access where user_id=u) is distinct from expiry then raise exception 'Refund removed other purchase'; end if;
 insert into audit_result values('Reembolso preserva outra compra',true);
 perform private.record_greenn_sale(900002,e,'fMqpDz','paid',nowpaid,nowpaid+interval '1 second');
 if (select status from private.greenn_sales where sale_id=900002)<>'refunded' then raise exception 'Delayed paid restored refund'; end if;
 insert into audit_result values('Pagamento atrasado não reverte reembolso',true);
 perform private.record_greenn_sale(900001,e,'4Q1tqK','chargedback',nowpaid,nowpaid);
 if (select status from public.user_access where user_id=u)<>'suspended' then raise exception 'Chargeback did not revoke'; end if;
 insert into audit_result values('Chargeback encerra acesso sem outras concessões',true);
 perform private.record_greenn_sale(900003,f,'fMqpDz','paid',nowpaid,nowpaid);
 insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data,created_at,updated_at)
 values(v,f,'{"role":"admin"}','{}',now(),now());
 if (select status from public.user_access where user_id=v)<>'suspended' then raise exception 'Unconfirmed signup released'; end if;
 update auth.users set email_confirmed_at=now() where id=v;
 if not exists(select 1 from public.user_access where user_id=v and status='active' and role='user' and access_expires_at=nowpaid+interval '12 months') then raise exception 'Pending purchase not claimed'; end if;
 insert into audit_result values('Compra anterior ao cadastro: liberação após confirmação',true);
 insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at)
 values(w,g,now(),'{}','{}',now(),now());
 update public.user_access set status='active',plan='Bônus',access_expires_at=nowpaid+interval '30 days' where user_id=w;
 perform private.record_greenn_sale(900004,g,'4Q1tqK','paid',nowpaid,nowpaid);
 perform private.record_greenn_sale(900004,g,'4Q1tqK','refunded',nowpaid,nowpaid);
 if not exists(select 1 from public.user_access where user_id=w and status='active' and plan='Bônus' and access_expires_at=nowpaid+interval '30 days') then raise exception 'Bonus lost'; end if;
 insert into audit_result values('Bônus manual preservado no reembolso',true);
 update public.user_access set status='suspended' where user_id=w;
 perform private.record_greenn_sale(900005,g,'fMqpDz','paid',nowpaid,nowpaid);
 if (select status from public.user_access where user_id=w)<>'suspended' then raise exception 'Admin suspension bypassed'; end if;
 insert into audit_result values('Suspensão administrativa respeitada',true);
 perform private.record_greenn_sale(900006,g,'4Q1tqK','refunded',null,nowpaid);
 perform private.record_greenn_sale(900006,g,'4Q1tqK','paid',nowpaid,nowpaid-interval '1 second');
 if (select status from private.greenn_sales where sale_id=900006)<>'refunded' then raise exception 'Reordered refund failed'; end if;
 insert into audit_result values('Reembolso anterior ao pagamento permanece definitivo',true);
 begin
   perform private.record_greenn_sale(900001,f,'4Q1tqK','paid',nowpaid,nowpaid);
   raise exception 'Changed identity accepted';
 exception when others then if sqlerrm='Changed identity accepted' then raise; end if; end;
 insert into audit_result values('Identidade da venda imutável',true);
 if has_function_privilege('authenticated','public.record_greenn_sale(bigint,text,text,text,timestamptz,timestamptz)','execute') or has_function_privilege('anon','public.record_greenn_sale(bigint,text,text,text,timestamptz,timestamptz)','execute') then raise exception 'RPC exposed'; end if;
 insert into audit_result values('RPC restrita ao servidor',true);
 if (timestamptz '2026-08-31T12:00:00Z'+interval '6 months') <> timestamptz '2027-02-28T12:00:00Z' then raise exception 'Calendar month failed'; end if;
 insert into audit_result values('Prazo em meses de calendário',true);
end $$;
select * from audit_result;
