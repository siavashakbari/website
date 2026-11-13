/** Only files created by Vault uploads may be physically removed. */
const uploadName =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[a-zA-Z0-9._-]+$/i;

export type ManagedMedia = { storage: "blob" | "supabase"; path: string };

export function managedMediaFromUrl(
  source: string,
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined,
): ManagedMedia | null {
  if (!source) return null;
  try {
    const url = new URL(source, "https://local.invalid");
    if (url.origin === "https://local.invalid" && url.pathname === "/api/blob-media") {
      const path = url.searchParams.get("pathname") || "";
      const name = path.startsWith("images/") ? path.slice("images/".length) : "";
      return uploadName.test(name) ? { storage: "blob", path } : null;
    }
    if (!supabaseUrl || url.origin !== new URL(supabaseUrl).origin) return null;
    const prefix = "/storage/v1/object/public/vault-media/";
    if (!url.pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(url.pathname.slice(prefix.length));
    return uploadName.test(path) ? { storage: "supabase", path } : null;
  } catch {
    return null;
  }
}
