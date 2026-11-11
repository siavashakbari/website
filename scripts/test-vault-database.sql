-- Roll back all test writes; live portfolio content is unchanged.
begin;
select set_config('request.jwt.claims', '{"role":"authenticated","app_metadata":{"vault_admin":true}}', true);
set local role authenticated;
do $$
declare rev integer; next_rev integer; original jsonb;
begin
  select revision, content into rev, original from public.vault_content where id = 1;
  next_rev := public.save_vault_content(rev, original || jsonb_build_object('siavash_vault_media_v2', '[{"id":"regression-vishnu","year":"2026","model":"Regression","imgSrc":"https://example.com/video.mp4","assignedRoute":"/video/vishnu"}]'));
  if next_rev <> rev + 1 then raise exception 'Revision did not advance'; end if;
  begin
    perform public.save_vault_content(rev, original);
    raise exception 'Stale write was accepted';
  exception when serialization_failure then null; end;
  begin
    perform public.save_vault_content(next_rev, '{"siavash_studio_invoices_archive":"[]"}');
    raise exception 'Private data was accepted';
  exception when raise_exception then
    if sqlerrm <> 'Unexpected content key.' then raise; end if;
  end;
end $$;
select set_config('request.jwt.claims', '{"role":"authenticated","app_metadata":{}}', true);
do $$ begin
  begin
    perform public.save_vault_content(0, '{}');
    raise exception 'Non-admin write accepted';
  exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  if not exists(select 1 from public.vault_content where (content->>'siavash_vault_media_v2')::jsonb->0->>'id' = 'regression-vishnu') then
    raise exception 'Public reader cannot see published video';
  end if;
  begin
    perform public.save_vault_content(0, '{}');
    raise exception 'Anonymous write accepted';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'Public read, admin write, stale-write rejection, private-data rejection, anonymous and non-admin denial passed' as result;
