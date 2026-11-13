begin;

-- Historical content remains available as a backup, but browsers must no longer
-- publish to the obsolete Supabase document after the Vercel Blob cutover.
revoke execute on function public.save_vault_content(integer, jsonb) from authenticated;

-- Vault photos now upload to Vercel Blob. Keep this bucket for video files.
drop policy if exists "vault-media admin upload" on storage.objects;
create policy "vault-media admin video upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'vault-media'
    and coalesce(auth.jwt()->'app_metadata'->>'vault_admin', '') = 'true'
    and name ~* '\.(mp4|webm|mov)$'
  );

commit;
