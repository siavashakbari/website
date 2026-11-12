import { createClient } from "@supabase/supabase-js";

/** Verify the browser's Supabase session on every privileged Vercel request. */
export async function requireVaultAdmin(request: Request): Promise<void> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new Error("Vault sign-in required.");
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Vault authentication is not configured.");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || data.user?.app_metadata.vault_admin !== true) {
    throw new Error("Vault administrator access required.");
  }
}
