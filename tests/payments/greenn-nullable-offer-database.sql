begin;
do $$
declare expiry timestamptz; stamp timestamptz := now()-interval '2 minutes';
begin
 perform private.record_greenn_sale(9900900101,'nullable-test@example.com','ndY8mn','paid',stamp,stamp);
 select expires_at into expiry from private.greenn_sales where sale_id=9900900101;
 if expiry<>stamp+interval '6 months' then raise exception 'Wrong duration'; end if;
 perform private.record_greenn_sale(9900900101,'nullable-test@example.com','mkimrj','paid',stamp,stamp+interval '1 second');
 if (select expires_at from private.greenn_sales where sale_id=9900900101)<>expiry then raise exception 'Duplicate extended access'; end if;
 perform private.record_greenn_sale(9900900101,'nullable-test@example.com','mkimrj','refunded',stamp,stamp+interval '2 seconds');
 if (select status from private.greenn_sales where sale_id=9900900101)<>'refunded' then raise exception 'Refund failed'; end if;
 perform private.record_greenn_sale(9900900102,'nullable-test@example.com','mkimrj','paid',stamp,stamp);
 perform private.record_greenn_sale(9900900102,'nullable-test@example.com','ndY8mn','chargedback',stamp,stamp+interval '2 seconds');
 if (select status from private.greenn_sales where sale_id=9900900102)<>'chargedback' then raise exception 'Chargeback failed'; end if;
 begin
  perform private.record_greenn_sale(9900900102,'other@example.com','mkimrj','paid',stamp,stamp+interval '3 seconds');
  raise exception 'Buyer mismatch accepted';
 exception when others then
  if sqlerrm<>'Sale identity mismatch' then raise; end if;
 end;
end $$;
select true as passed, 'nullable offer duration, duplicate, refund, chargeback, buyer identity' as tested;
rollback;
