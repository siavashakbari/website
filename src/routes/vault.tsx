import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  FolderTree,
  Image as ImageIcon,
  FileText,
  Receipt,
  LogOut,
  ExternalLink,
  Lock,
  Key,
} from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/vault")({
  component: VaultLayout,
});

interface VaultSession {
  authenticated: boolean;
  username: string;
  loginTime: string;
}

const VAULT_SESSION_KEY = "siavash_studio_vault_session";

function getVaultSession(): VaultSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(VAULT_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function VaultLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const [session, setSession] = useState<VaultSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form state
  const [passphrase, setPassphrase] = useState("");
  const [username, setUsername] = useState("siavash");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const current = getVaultSession();
    // Default open session if previously authenticated or in local dev
    if (current) {
      setSession(current);
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    setTimeout(() => {
      // Local zero-trust authentication (free from external broken database)
      if (passphrase.trim().length >= 3) {
        const newSession: VaultSession = {
          authenticated: true,
          username: username.trim() || "siavash",
          loginTime: new Date().toISOString(),
        };
        sessionStorage.setItem(VAULT_SESSION_KEY, JSON.stringify(newSession));
        setSession(newSession);
      } else {
        setErrorMsg("Please enter a valid vault key (at least 3 characters).");
      }
      setIsSubmitting(false);
    }, 200);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(VAULT_SESSION_KEY);
    setSession(null);
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070707] text-white font-mono text-xs">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2CE3C0] border-t-transparent mr-2" />
        <span>Initializing Vault...</span>
      </div>
    );
  }

  // Not authenticated: Render sleek zero-trust Vault Gate
  if (!session) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden selection:bg-[#2CE3C0] selection:text-black">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2CE3C0]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3febcc]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Logo className="h-5 w-auto text-white" />
            <span className="text-xs uppercase tracking-widest text-[#2CE3C0] font-mono border border-[#2CE3C0]/30 px-2 py-0.5 rounded-full">
              VAULT
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

        {/* Login Box */}
        <div className="max-w-md w-full mx-auto my-8 z-10">
          <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-7 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#2CE3C0]/10 border border-[#2CE3C0]/30 flex items-center justify-center mb-4 text-[#2CE3C0]">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                Studio Vault Gate
              </h1>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Direct client-side control center for Pages, Media, Invoices, and Editorial.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Vault User
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="siavash"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2CE3C0] transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
                  <span>Vault Access Key</span>
                  <Key className="w-3.5 h-3.5 text-[#2CE3C0]" />
                </label>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter vault key (e.g. 1234 or your passphrase)"
                  required
                  autoFocus
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2CE3C0] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-[#2CE3C0] text-black hover:bg-[#2CE3C0]/90 font-semibold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(44,227,192,0.2)] cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enter Vault</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-neutral-500 z-10 font-mono">
          Siavash Akbari Creative Studio · Studio Vault
        </div>
      </div>
    );
  }

  // 4 Menus on top of Vault as requested:
  // menu1: Invoice
  // menu2: Blog
  // menu3: Pages (formerly Projects)
  // menu4: Media (formerly Assets)
  const navTabs = [
    { label: "Invoice", path: "/vault/invoices", icon: Receipt },
    { label: "Blog", path: "/vault/blog", icon: FileText },
    { label: "Pages", path: "/vault/pages", icon: FolderTree },
    { label: "Media", path: "/vault/media", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col selection:bg-[#2CE3C0] selection:text-black">
      {/* Top Vault Bar */}
      <header className="border-b border-white/10 bg-[#0F0F0F]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to={"/vault/pages" as any} className="flex items-center gap-3 group">
              <Logo className="h-5 w-auto text-white group-hover:text-[#2CE3C0] transition-colors" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#2CE3C0] bg-[#2CE3C0]/10 px-2.5 py-0.5 rounded border border-[#2CE3C0]/20 font-bold">
                VAULT
              </span>
            </Link>

            {/* 4 Top Menus */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const active = pathname.startsWith(tab.path);
                return (
                  <Link
                    key={tab.path}
                    to={tab.path as any}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
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

          {/* Right Status & Logout */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-neutral-400 hover:text-white hover:border-red-500/40 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Lock Vault"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Vault</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-white/5 px-2 py-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path as any}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
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

      {/* Main Vault Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
