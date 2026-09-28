import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layers, FileText, Receipt, Plus, ArrowUpRight, CheckCircle2, Shield } from "lucide-react";
import { getStudioProjects, getStudioBlogPosts, getSavedInvoices } from "@/lib/studio-store";
import { isSupabaseConfigured } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [projectCount, setProjectCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);

  useEffect(() => {
    setProjectCount(getStudioProjects().length);
    setBlogCount(getStudioBlogPosts().length);
    setInvoiceCount(getSavedInvoices().length);
  }, []);

  const supabaseReady = isSupabaseConfigured();

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141414] to-[#1c1c1c] border border-white/10 p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2CE3C0]/10 border border-[#2CE3C0]/30 text-[#2CE3C0] text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>ENCRYPTED COMMAND CENTER</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome, Siavash.
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Manage your showcase projects across disciplines, publish high-impact editorial essays with AI search visibility, and generate pixel-perfect client invoices matching your Illustrator master artwork.
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2CE3C0]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Supabase Status Callout */}
      {!supabaseReady && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-amber-300">
              Supabase Cloud Authentication Pending Connection
            </h4>
            <p className="text-xs text-amber-200/70">
              The panel is currently operating in offline zero-trust vault mode. Add your Supabase project keys to activate 100% free cloud sync and Google Authenticator MFA.
            </p>
          </div>
          <span className="shrink-0 text-xs font-mono bg-amber-400 text-black font-semibold px-3 py-1.5 rounded-lg">
            Offline Vault Active
          </span>
        </div>
      )}

      {/* 3 Core Workspace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Workspace 1: Projects */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 flex flex-col justify-between hover:border-[#2CE3C0]/50 transition-all group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#2CE3C0]/10 border border-[#2CE3C0]/20 flex items-center justify-center text-[#2CE3C0] group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                Workspace 01
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Content & Projects</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Add new projects, upload photo sets, write bilingual descriptions, and assign discipline galleries.
              </p>
            </div>
            <div className="pt-2 text-2xl font-bold font-mono text-white">
              {projectCount}{" "}
              <span className="text-xs font-normal text-neutral-500 font-sans">Active Showcases</span>
            </div>
          </div>

          <div className="pt-6">
            <Link
              to="/admin/projects"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#2CE3C0] hover:text-black text-white text-xs font-semibold transition-all"
            >
              <span>Manage Projects</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Workspace 2: Blog */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 flex flex-col justify-between hover:border-[#2CE3C0]/50 transition-all group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#2CE3C0]/10 border border-[#2CE3C0]/20 flex items-center justify-center text-[#2CE3C0] group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                Workspace 02
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Blog & Editorial</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Draft architectural studies, case studies, and studio insights with AI search & GEO summaries.
              </p>
            </div>
            <div className="pt-2 text-2xl font-bold font-mono text-white">
              {blogCount}{" "}
              <span className="text-xs font-normal text-neutral-500 font-sans">Published Articles</span>
            </div>
          </div>

          <div className="pt-6">
            <Link
              to="/admin/blog"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#2CE3C0] hover:text-black text-white text-xs font-semibold transition-all"
            >
              <span>Manage Blog</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Workspace 3: Invoice Studio */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 flex flex-col justify-between hover:border-[#2CE3C0]/50 transition-all group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#2CE3C0]/10 border border-[#2CE3C0]/20 flex items-center justify-center text-[#2CE3C0] group-hover:scale-105 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                Workspace 03
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Invoice Studio</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Replicate Illustrator receipts with sandboxed Gotham typography, auto-computed IRR balances, and vector PDF export.
              </p>
            </div>
            <div className="pt-2 text-2xl font-bold font-mono text-white">
              {invoiceCount}{" "}
              <span className="text-xs font-normal text-neutral-500 font-sans">Generated Invoices</span>
            </div>
          </div>

          <div className="pt-6">
            <Link
              to="/admin/invoices"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#2CE3C0] hover:text-black text-white text-xs font-semibold transition-all"
            >
              <span>Open Invoice Studio</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
