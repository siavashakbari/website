# Feature Specification & Architecture Guide: Zero-Trust Secure Admin Panel & Studio CMS

## 1. Executive Overview & Security Philosophy

This specification outlines the architecture, UX/UI design, and step-by-step implementation for the **Siavash Akbari Creative Studio Admin Panel** (`/admin`). 

To satisfy the requirement of **non-hackable, zero-trust authentication**, this system replaces vulnerable static credentials with a **3-Layer Defense Protocol**:
1. **Identifier & Primary Secret**: High-entropy Admin Username + Argon2id / Supabase-hashed Primary Password.
2. **Dynamic Second Factor (Supabase TOTP Authenticator)**: 30-second rolling 6-digit cryptographic token generated on your personal mobile device (Google Authenticator, Apple Passwords, 1Password, or Microsoft Authenticator).
3. **Secondary Vault Passphrase (Client-Side AES-256-GCM Decryption Key)**: A secondary secret key required to decrypt admin sessions and local invoice records.

### Is Supabase Authenticator Free?
**Yes, 100% Free.** Supabase's Free Tier includes:
- **50,000 Monthly Active Users (MAU)**.
- **Full MFA (Multi-Factor Authentication / TOTP)** included at no cost.
- **500 MB PostgreSQL Database** (more than enough for thousands of projects and blog posts).
- **1 GB File Storage** for project uploads.

> **Zero-Dependency Fallback Included**: In Section 3, a 100% self-hosted local Nitro server alternative (using Argon2id + Web Crypto API TOTP) is provided in case external cloud services are ever blocked or undesirable.

---

## 2. Supabase Authenticator Setup Guide (Step-by-Step)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and click **Start your project** (Free).
2. Create an organization and name your project `siavash-studio-cms`.
3. Choose your closest region (e.g. Frankfurt / Central EU) and set a strong database password.
4. Under **Project Settings -> API**, copy:
   - `Project URL` (e.g., `https://xyzcompany.supabase.co`)
   - `anon public key` (e.g., `eyJhbGciOi...`)
   - `service_role secret` (keep this safe for server-side operations only).

### Step 2: Configure MFA in Supabase Dashboard
1. In your Supabase Dashboard, navigate to **Authentication -> Multi-Factor (MFA)**.
2. Enable **App Authenticator (TOTP)**.
3. Set **Max Allowed Factors** to `1` or `2`.
4. Under **Authentication -> Sign In / Providers**, ensure **Email & Password** is enabled.

### Step 3: Install Supabase Client in Project
```bash
npm install @supabase/supabase-js
```

### Step 4: Environment Variables (`.env`)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
ADMIN_SECONDARY_SALT=studio_vault_salt_8f92a10e7b4c
```

### Step 5: Enrollment & Login Flow Code

#### A. Initial Enrollment Script (`scripts/enroll-admin-mfa.mjs`)
Run this one-off script locally to generate your QR Code for Google Authenticator:
```javascript
import { createClient } from '@supabase/supabase-js';
import qrcode from 'qrcode-terminal';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function setupAdminMFA() {
  // 1. Sign in with initial email and password
  const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@siavashakbari.com',
    password: process.env.INITIAL_ADMIN_PASSWORD,
  });

  if (loginError) throw loginError;

  // 2. Enroll TOTP Factor
  const { data: mfaData, error: mfaError } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'Siavash Studio Admin',
    friendlyName: 'Admin Phone Authenticator'
  });

  if (mfaError) throw mfaError;

  console.log('Scan this QR code in Google Authenticator or Apple Passwords:');
  qrcode.generate(mfaData.totp.uri, { small: true });
  console.log('Secret key for manual entry:', mfaData.totp.secret);
}

setupAdminMFA();
```

#### B. Verification API Handler (`src/routes/api.admin.verify-auth.ts`)
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/admin/verify-auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { username, password, secondaryKey, totpCode } = await request.json();

        // 1. Verify credentials against Supabase
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_ANON_KEY!
        );

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: username,
          password: password,
        });

        if (signInError || !signInData.session) {
          return new Response(JSON.stringify({ error: "Invalid primary credentials" }), { status: 401 });
        }

        // 2. Verify Supabase TOTP MFA Challenge
        const factors = await supabase.auth.mfa.listFactors();
        const totpFactor = factors.data?.totp[0];

        if (!totpFactor) {
          return new Response(JSON.stringify({ error: "MFA not enrolled" }), { status: 403 });
        }

        const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
        const verifyRes = await supabase.auth.mfa.verify({
          factorId: totpFactor.id,
          challengeId: challenge.data.id,
          code: totpCode,
        });

        if (verifyRes.error) {
          return new Response(JSON.stringify({ error: "Invalid authenticator code" }), { status: 401 });
        }

        // 3. Verify Second Password / Vault Key Hash
        // (Ensures knowledge of the secondary secret before issuing secure cookie)
        const expectedSecondaryHash = process.env.ADMIN_SECONDARY_HASH;
        // Verify secondaryKey using Web Crypto API PBKDF2...
        
        return new Response(JSON.stringify({ success: true, token: verifyRes.data.access_token }), {
          status: 200,
          headers: {
            "Set-Cookie": `studio_admin_session=${verifyRes.data.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`
          }
        });
      }
    }
  }
});
```

---

## 3. Free Self-Hosted Alternative (Zero Cloud Reliance)

If you prefer not using Supabase, you can run an **autonomous, zero-cost authentication system** directly inside your TanStack Start / Nitro server:

- **Primary Password**: Hashed using `argon2` or Web Crypto `PBKDF2` (100,000 iterations + salt).
- **Authenticator (TOTP)**: Powered by `otplib` (RFC 6238 standard) — displays a QR code that scans into Google Authenticator or iOS Passwords without communicating with any external server.
- **Session Token**: Signed HMAC-SHA256 HTTP-only secure cookie with auto-expiry (8 hours).

---

## 4. Admin Studio UI/UX & Information Architecture

The admin panel follows a **luxury dark command center** aesthetic matching your brand palette:
- **Base Canvas**: `#0A0A0A` and `#121212`.
- **Card Surfaces**: `#161616` with `border border-white/10`.
- **Active Accents**: `#3febcc` (Brand Cyan) for focused states, indicators, and primary actions.
- **Typography**: Display font `Satoshi` for structural headers, `Peyda` for Persian content, mono font for codes.

### Navigation Hierarchy (`/admin`)
```text
/admin
├── /login                   # 3-Factor Secure Portal (User, Password, 2nd Key, TOTP)
├── /dashboard               # Studio health overview, visitor metrics, quick actions
├── /projects                # Functionality 1: Portfolio Content Manager
│   ├── /new                 # Create new multi-discipline showcase project
│   └── /$id                 # Edit, reorder media, change disciplines, publish/archive
├── /blog                    # Functionality 2: Editorial & Blog Post Manager
│   ├── /new                 # Rich markdown editor, SEO/GEO metadata, live preview
│   └── /$slug               # Edit, update date, draft/published status
└── /invoices                # Functionality 3: Interactive Receipt & Invoice Studio
    └── (Dedicated workspace specified in FEATURE_4)
```

---

## 5. Functionality 1: Project & Portfolio Content Studio

### A. Core Capabilities
1. **Multi-Discipline Assignment**: Select one or multiple target disciplines:
   - Fashion Photography (`fashion-photography`)
   - Food Photography (`food-photography`)
   - Portrait Photography (`portrait-photography`)
   - Product Photography (`product-photography`)
   - Visual Identity (`visual-identity`)
   - Graphic Design (`graphic-design`)
   - Video & Motion (`video`)
2. **Drag-and-Drop Asset Pipeline**:
   - Multi-file dropzone for `.webp`, `.jpg`, `.png`, and `.mp4` video reels.
   - Client-side auto-generation of WebP thumbnails and dominant accent color palette (`image-colors.json`).
   - Interactive reordering (drag thumbnail cards to change gallery display order).
   - "Set as Cover" selector.
3. **Bilingual Metadata Support**:
   - English Title & Persian Title (`عنوان پروژه`).
   - Client name, completion year, and role.
   - Rich Markdown project description and art direction notes (EN & FA).
   - Live URL preview linking directly to `/projects/$id` and `/$discipline`.

### B. Project Data Model (`src/data/projects.ts` / Database)
```typescript
export interface StudioProject {
  id: string;
  slug: string;
  title: string;
  titleFa?: string;
  client: string;
  year: number | string;
  discipline: "photography" | "graphic-design" | "product-design" | "video";
  subCategory?: string; // e.g. "fashion", "food", "portrait", "posters", "book-covers"
  coverImage: string;
  description: string;
  descriptionFa?: string;
  aspectRatio?: "16:9" | "4:5" | "1:1" | "9:16";
  images: {
    id: string;
    url: string;
    thumbnailUrl: string;
    alt: string;
    caption?: string;
    width: number;
    height: number;
    accentColor?: string;
  }[];
  published: boolean;
  featuredOrder?: number;
}
```

---

## 6. Functionality 2: Editorial & Blog Post Manager

### A. Core Capabilities
1. **Rich Markdown & Split-Screen Live Preview**:
   - Real-time side-by-side rendering using your website's exact typography and styling.
   - Inline image embedding, callouts, pull quotes, and code blocks.
2. **Reading Time & Excerpt Engine**:
   - Automated reading time calculation (words per minute for EN and FA).
   - Clean 2-sentence teaser generator with character counter.
3. **Search & AI Optimization (GEO/AEO) Controls**:
   - **Direct Answer Block**: 50-word factual summary optimized for Google AI Overviews & ChatGPT Search citations.
   - **JSON-LD Preview**: Live validator for `BlogPosting` and `BreadcrumbList` schema.
   - **Sitemap & `llms.txt` Sync**: Automatically flags new posts for inclusion in `/llms.txt`.
4. **Editorial Workflow**:
   - Status toggle: `Draft` (visible only in admin) vs `Published` (public on `/blog`).
   - Scheduled publication date picker.

---

## 7. Security Hardening & Threat Mitigation Checklist

- [ ] **Brute-Force Rate Limiting**: Max 5 failed attempts per IP per 15 minutes via Nitro middleware.
- [ ] **No Hardcoded Passwords**: All secrets stored in environment variables or salted cryptographic hashes.
- [ ] **HTTP-Only Cookies**: Session tokens cannot be accessed by client JavaScript (XSS immune).
- [ ] **CSRF Protection**: SameSite `Strict` cookie headers with validation tokens on mutating POST/PUT/DELETE requests.
- [ ] **Encrypted Payload Storage**: Sensitive metadata (invoices, client phone numbers) encrypted with AES-256 before storage.
