import type { AdminSession } from "@/types/admin";

const SESSION_STORAGE_KEY = "siavash_admin_vault_session";

// 1. Cryptographic Helper (Web Crypto API SHA-256 for local vault verification)
export async function hashPassphrase(text: string, salt: string = "siavash-studio-vault-salt"): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface LoginParams {
  username: string;
  password: string;
  secondaryPassword?: string;
  totpCode?: string;
}

export async function loginAdmin({
  username,
  password,
  secondaryPassword,
  totpCode,
}: LoginParams): Promise<{
  success: boolean;
  error?: string;
  session?: AdminSession;
}> {
  const cleanUser = (username || "siavash").trim().toLowerCase();
  const cleanPass = (password || "").trim();

  if (!cleanPass || cleanPass.length < 3) {
    return { success: false, error: "Please enter a valid passphrase (at least 3 characters)" };
  }

  const secondaryHash = await hashPassphrase(secondaryPassword || cleanPass);

  const session: AdminSession = {
    authenticated: true,
    username: cleanUser,
    loginTime: new Date().toISOString(),
    mfaVerified: Boolean(totpCode && totpCode.trim().length === 6),
    vaultKeyHash: secondaryHash,
    source: "vault",
  };

  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  return { success: true, session };
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (parsed && parsed.authenticated) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function logoutAdmin(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}
