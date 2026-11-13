begin;

-- Vault administrators can delete uploaded videos after Vercel confirms that
-- no published page or media record still references the object.
drop policy if exists "vault-media admin video select" on storage.objects;
create policy "vault-media admin video select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'vault-media'
    and coalesce(auth.jwt()->'app_metadata'->>'vault_admin', '') = 'true'
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[^/]+\.(mp4|webm|mov)$'
  );

drop policy if exists "vault-media admin video delete" on storage.objects;
create policy "vault-media admin video delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'vault-media'
    and coalesce(auth.jwt()->'app_metadata'->>'vault_admin', '') = 'true'
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[^/]+\.(mp4|webm|mov)$'
  );

commit;
