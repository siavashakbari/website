import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;

export async function requireVaultToken(): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session || data.session.user.app_metadata.vault_admin !== true) {
    throw new Error("Sign in with your authorized Vault account before saving.");
  }
  return data.session.access_token;
}
