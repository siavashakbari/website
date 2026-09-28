import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Layers, 
  FileText, 
  Receipt, 
  LogOut, 
  ExternalLink, 
  Lock, 
  Key, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Copy,
  Check
} from "lucide-react";
import { 
  getAdminSession, 
  loginAdmin, 
  completeMfaEnrollment, 
  logoutAdmin, 
  isSupabaseConfigured,
  type MfaEnrollmentData 
} from "@/lib/admin-auth";
import type { AdminSession } from "@/types/admin";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secondaryPassword, setSecondaryPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR Code MFA Enrollment state
  const [enrollmentData, setEnrollmentData] = useState<MfaEnrollmentData | null>(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);

  const supabaseActive = isSupabaseConfigured();

  useEffect(() => {
    const current = getAdminSession();
    setSession(current);
    setCheckingAuth(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    try {
      const res = await loginAdmin({
        username,
        password,
        secondaryPassword,
        totpCode,
      });

      if (res.requiresMfaEnrollment && res.enrollmentData) {
        // Switch to QR Code scan screen
        setEnrollmentData(res.enrollmentData);
      } else if (res.success && res.session) {
        setSession(res.session);
      } else {
        setLoginError(res.error || "Authentication failed. Check credentials.");
      }
    } catch (err: any) {
      setLoginError(err.message || "An unexpected error occurred during login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentData) return;
    setLoginError("");
    setIsSubmitting(true);

    try {
      const res = await completeMfaEnrollment({
        factorId: enrollmentData.factorId,
        code: confirmationCode,
        secondaryPassword,
        username,
      });

      if (res.success && res.session) {
        setSession(res.session);
        setEnrollmentData(null);
      } else {
        setLoginError(res.error || "Invalid 6-digit code. Please check your authenticator app.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to confirm Authenticator app enrollment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySecret = () => {
    if (!enrollmentData) return;
    navigator.clipboard.writeText(enrollmentData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleLogout = () => {
    logoutAdmin();
    setSession(null);
    setEnrollmentData(null);
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2CE3C0] border-t-transparent" />
          <span>Verifying encrypted session...</span>
        </div>
      </div>
    );
  }

  // Not authenticated: Render the 3-Factor Zero-Trust Secure Portal
  if (!session) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden selection:bg-[#2CE3C0] selection:text-black">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2CE3C0]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3febcc]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Logo className="h-5 w-auto text-white" />
            <span className="text-xs uppercase tracking-widest text-[#2CE3C0] font-mono border border-[#2CE3C0]/30 px-2 py-0.5 rounded-full">
              STUDIO VAULT
            </span>
          </div>
          <Link
            to="/"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>Back to site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Auth Modal Container */}
        <div className="max-w-md w-full mx-auto my-8 z-10">
          <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-7 sm:p-8 backdrop-blur-xl shadow-2xl relative">
            
            {/* SCREEN 1: QR CODE ENROLLMENT SCREEN (Triggered automatically when user logs in first time) */}
            {enrollmentData ? (
              <div className="space-y-6">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#2CE3C0]/15 border border-[#2CE3C0]/30 flex items-center justify-center mb-4 text-[#2CE3C0]">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
                    Connect Google Authenticator
                  </h1>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Scan the QR code below using <strong>Google Authenticator</strong>, <strong>Apple Passwords</strong>, or <strong>1Password</strong> on your phone.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Rendered QR Code */}
                <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center shadow-lg">
                  <img
                    src={enrollmentData.qrCode}
                    alt="Scan QR Code in Google Authenticator"
                    className="w-56 h-56 object-contain"
                  />
                  <span className="text-[11px] text-neutral-700 font-mono mt-1 font-semibold">
                    Scan with your mobile camera
                  </span>
                </div>

                {/* Manual Secret Key Accordion */}
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Manual Entry Key:</span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="text-[#2CE3C0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSecret ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-white tracking-widest break-all select-all">
                    {enrollmentData.secret}
                  </div>
                </div>

                {/* Confirmation Form */}
                <form onSubmit={handleConfirmEnrollment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      Enter 6-Digit Code from App
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 123456"
                      required
                      autoFocus
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] font-mono text-[#2CE3C0] focus:outline-none focus:border-[#2CE3C0]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEnrollmentData(null)}
                      className="py-3 px-4 rounded-xl border border-white/10 text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || confirmationCode.length !== 6}
                      className="flex-1 bg-[#2CE3C0] text-black hover:bg-[#2CE3C0]/90 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer shadow-[0_0_15px_rgba(44,227,192,0.3)]"
                    >
                      {isSubmitting ? (
                        <span>Activating MFA...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Enter Studio</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* SCREEN 2: STANDARD LOGIN SCREEN */
              <div>
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-[#2CE3C0]/10 border border-[#2CE3C0]/30 flex items-center justify-center mb-4 text-[#2CE3C0]">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                    Studio Management Portal
                  </h1>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Multi-factor encrypted authentication protocol. Requires username, primary key, secondary security key, and dynamic authenticator code.
                  </p>
                </div>

                {/* Connection Status Badge */}
                <div className="mb-6 p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Auth Engine:</span>
                  {supabaseActive ? (
                    <span className="text-[#2CE3C0] flex items-center gap-1.5 font-medium">
                      <span className="h-2 w-2 rounded-full bg-[#2CE3C0] animate-pulse" />
                      Supabase Cloud Auth Active
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1.5 font-medium">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Local Master Vault (Offline Mode)
                    </span>
                  )}
                </div>

                {loginError && (
                  <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      Admin Identifier / Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your-email@example.com"
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      Primary Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
                      <span>Second Password / Vault Key</span>
                      <Key className="w-3.5 h-3.5 text-[#2CE3C0]" />
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={secondaryPassword}
                        onChange={(e) => setSecondaryPassword(e.target.value)}
                        placeholder="Independent secondary passphrase"
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0] transition-colors"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      Derives AES-256 client-side decryption key for invoice and admin records.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
                      <span>Authenticator Code (TOTP)</span>
                      <Smartphone className="w-3.5 h-3.5 text-[#2CE3C0]" />
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="6-digit rolling code (leave empty on first setup)"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm tracking-widest text-[#2CE3C0] font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0] transition-colors"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      If this is your first time, leave empty and click Authorize to generate your QR Code!
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-[#2CE3C0] text-black hover:bg-[#2CE3C0]/90 font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(44,227,192,0.2)] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize Session</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="text-center text-xs text-neutral-500 z-10">
          Encrypted Studio Session · Zero Plaintext Storage · Siavash Akbari Creative Studio
        </div>
      </div>
    );
  }

  // Active Authenticated Studio Shell
  const navTabs = [
    { label: "Content & Projects", path: "/admin/projects", icon: Layers },
    { label: "Blog & Editorial", path: "/admin/blog", icon: FileText },
    { label: "Invoice Studio", path: "/admin/invoices", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col selection:bg-[#2CE3C0] selection:text-black">
      {/* Top Studio Control Bar */}
      <header className="border-b border-white/10 bg-[#0F0F0F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo className="h-5 w-auto text-white group-hover:text-[#2CE3C0] transition-colors" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#2CE3C0] bg-[#2CE3C0]/10 px-2 py-0.5 rounded border border-[#2CE3C0]/20">
                ADMIN STUDIO
              </span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const active =
                  tab.path === "/admin/projects"
                    ? pathname === "/admin" || pathname === "/admin/" || pathname.startsWith("/admin/projects")
                    : pathname.startsWith(tab.path);
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-[#2CE3C0] text-black shadow-[0_0_12px_rgba(44,227,192,0.3)] font-semibold"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Status & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-[#2CE3C0] animate-pulse" />
              <span>{session.username}</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-500 uppercase text-[10px]">{session.source}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-neutral-400 hover:text-white hover:border-red-500/40 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Terminate session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-white/5 px-2 py-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              tab.path === "/admin/projects"
                ? pathname === "/admin" || pathname === "/admin/" || pathname.startsWith("/admin/projects")
                : pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  active ? "bg-[#2CE3C0] text-black font-semibold" : "text-neutral-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
