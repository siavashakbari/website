begin;

-- Published content and private Vault records now live in Vercel Blob.
-- This removes only the obsolete Supabase document and its publishing RPC.
drop function if exists public.save_vault_content(integer, jsonb) restrict;
drop table if exists public.vault_content restrict;

commit;
