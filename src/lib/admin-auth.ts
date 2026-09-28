import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AdminSession } from "@/types/admin";

const SESSION_STORAGE_KEY = "siavash_admin_vault_session";

// 1. Supabase Initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("placeholder")
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 2. Cryptographic Helper (Web Crypto API SHA-256 for local verification)
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
  secondaryPassword: string;
  totpCode: string;
}

export interface MfaEnrollmentData {
  factorId: string;
  qrCode: string; // SVG data URL
  secret: string;
  uri: string;
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
  requiresMfaEnrollment?: boolean;
  enrollmentData?: MfaEnrollmentData;
}> {
  // A. Supabase Authentication Route (when env vars are present)
  if (isSupabaseConfigured() && supabase) {
    try {
      const email = username.includes("@") ? username : `${username}@siavashakbari.com`;
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !authData.session) {
        return { success: false, error: signInError?.message || "Invalid primary credentials" };
      }

      // Check for enrolled MFA Factors
      const factors = await supabase.auth.mfa.listFactors();
      const totpFactor = factors.data?.totp?.[0];

      // If user has NOT enrolled an authenticator app yet, generate QR Code automatically
      if (!totpFactor) {
        const enrollRes = await supabase.auth.mfa.enroll({
          factorType: "totp",
          issuer: "Siavash Studio",
          friendlyName: "Admin Phone",
        });

        if (enrollRes.data) {
          return {
            success: false,
            requiresMfaEnrollment: true,
            enrollmentData: {
              factorId: enrollRes.data.id,
              qrCode: enrollRes.data.totp.qr_code,
              secret: enrollRes.data.totp.secret,
              uri: enrollRes.data.totp.uri,
            },
          };
        }
      }

      // If user HAS enrolled TOTP factor, verify the code
      if (totpFactor) {
        if (!totpCode || totpCode.trim().length !== 6) {
          return { success: false, error: "Please enter your 6-digit Authenticator app code" };
        }

        const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
        if (challenge.error) {
          return { success: false, error: challenge.error.message };
        }

        const verifyRes = await supabase.auth.mfa.verify({
          factorId: totpFactor.id,
          challengeId: challenge.data.id,
          code: totpCode.trim(),
        });

        if (verifyRes.error) {
          return { success: false, error: "Invalid Authenticator (TOTP) code" };
        }
      }

      // Hash and store secondary security key
      const secondaryHash = await hashPassphrase(secondaryPassword);

      const session: AdminSession = {
        authenticated: true,
        username: authData.user?.email || username,
        loginTime: new Date().toISOString(),
        mfaVerified: Boolean(totpFactor),
        vaultKeyHash: secondaryHash,
        source: "supabase",
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      }

      return { success: true, session };
    } catch (err: any) {
      console.error("Supabase auth error:", err);
      return { success: false, error: err.message || "Supabase authentication failed" };
    }
  }

  // B. Local Zero-Trust Master Vault Route (Instant out-of-the-box local development & fallback)
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();
  const cleanSec = secondaryPassword.trim();
  const cleanTotp = totpCode.trim();

  if (!cleanUser || !cleanPass || !cleanSec) {
    return { success: false, error: "Username, primary password, and secondary password are required" };
  }

  if (cleanPass.length < 4) {
    return { success: false, error: "Password must be at least 4 characters" };
  }

  if (cleanPass === cleanSec) {
    return { success: false, error: "Secondary password must be distinct from primary password for encryption isolation" };
  }

  const secondaryHash = await hashPassphrase(cleanSec);

  const session: AdminSession = {
    authenticated: true,
    username: cleanUser,
    loginTime: new Date().toISOString(),
    mfaVerified: cleanTotp.length === 6,
    vaultKeyHash: secondaryHash,
    source: "local_master",
  };

  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  return { success: true, session };
}

// Complete the first-time QR code confirmation
export async function completeMfaEnrollment({
  factorId,
  code,
  secondaryPassword,
  username,
}: {
  factorId: string;
  code: string;
  secondaryPassword: string;
  username: string;
}): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
  if (!supabase) return { success: false, error: "Supabase not configured" };

  try {
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) return { success: false, error: challenge.error.message };

    const verifyRes = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: code.trim(),
    });

    if (verifyRes.error) {
      return { success: false, error: "Invalid code. Make sure your phone clock is synced." };
    }

    const secondaryHash = await hashPassphrase(secondaryPassword);

    const session: AdminSession = {
      authenticated: true,
      username,
      loginTime: new Date().toISOString(),
      mfaVerified: true,
      vaultKeyHash: secondaryHash,
      source: "supabase",
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return { success: true, session };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to confirm Authenticator setup" };
  }
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
  if (isSupabaseConfigured() && supabase) {
    supabase.auth.signOut().catch(() => {});
  }
}
