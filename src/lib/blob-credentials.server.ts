import { getRequest } from "@tanstack/react-start/server";

/** Vercel functions use short-lived OIDC; local migration tools use the private store token. */
export function blobCredentials(request?: Request) {
  let oidcToken: string | undefined;
  try {
    oidcToken = (request || getRequest()).headers.get("x-vercel-oidc-token") || undefined;
  } catch {
    // Build scripts and tests can use the local read/write token.
  }
  return {
    token: process.env.VAULT_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || undefined,
    storeId: process.env.BLOB_STORE_ID || process.env.VAULT_BLOB_STORE_ID || undefined,
    oidcToken,
  };
}
