begin;

create table if not exists public.vault_content (
  id integer primary key check (id = 1),
  revision integer not null default 0,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.vault_content(id) values (1) on conflict do nothing;
alter table public.vault_content enable row level security;
revoke all on public.vault_content from anon, authenticated;
grant select on public.vault_content to anon, authenticated;
drop policy if exists "Public portfolio read" on public.vault_content;
create policy "Public portfolio read" on public.vault_content for select to anon, authenticated using (true);

create or replace function public.save_vault_content(expected_revision integer, next_content jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare new_revision integer; entry record;
begin
  if coalesce(auth.jwt()->'app_metadata'->>'vault_admin', '') <> 'true' then
    raise exception 'Only the Vault administrator can publish content.' using errcode = '42501';
  end if;
  if jsonb_typeof(next_content) <> 'object' or pg_column_size(next_content) > 20000000 then
    raise exception 'Invalid or oversized content snapshot.';
  end if;
  for entry in select * from jsonb_each(next_content) loop
    if entry.key <> all(array[
      'siavash_vault_pages_v2','siavash_vault_media_v2',
      'siavash_vault_deleted_pages_v1','siavash_vault_deleted_media_v1',
      'siavash_studio_custom_projects','siavash_studio_deleted_projects',
      'siavash_custom_photo_assets_v2','siavash_portfolio_inventory_v3',
      'siavash_custom_taxonomy_v2','siavash_studio_custom_blogs'
    ]) or jsonb_typeof(entry.value) <> 'string' then
      raise exception 'Unexpected content key.';
    end if;
    perform (entry.value #>> '{}')::jsonb;
    if (entry.value #>> '{}') ~* '"(idb|blob):' then
      raise exception 'Browser-only media must be uploaded before publishing.';
    end if;
  end loop;
  update public.vault_content set content = next_content,
    revision = revision + 1, updated_at = now()
    where id = 1 and revision = expected_revision returning revision into new_revision;
  if new_revision is null then
    raise exception 'Newer changes exist on the server. Export your edits, reload, and reconcile before saving.' using errcode = '40001';
  end if;
  return new_revision;
end;
$$;
revoke all on function public.save_vault_content(integer,jsonb) from public, anon;
grant execute on function public.save_vault_content(integer,jsonb) to authenticated;

drop policy if exists "vault-media public upload" on storage.objects;
drop policy if exists "vault-media admin upload" on storage.objects;
create policy "vault-media admin upload" on storage.objects for insert to authenticated
with check (bucket_id = 'vault-media' and coalesce(auth.jwt()->'app_metadata'->>'vault_admin', '') = 'true');

commit;
