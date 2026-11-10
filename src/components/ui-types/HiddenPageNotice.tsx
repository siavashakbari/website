import React from "react";
import { Link } from "@tanstack/react-router";
import { EyeOff, ArrowLeft } from "lucide-react";

interface HiddenPageNoticeProps {
  title?: string;
  routePath?: string;
}

export function HiddenPageNotice({ title, routePath }: HiddenPageNoticeProps) {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-24 text-center select-none">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6 text-neutral-400">
        <EyeOff className="w-6 h-6 stroke-[1.5]" />
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-light text-white tracking-tight mb-3">
        Nothing here to see
      </h1>

      <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed mb-8">
        This page is temporarily set to private or unpublished. Check back soon.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-xs font-mono tracking-wider text-neutral-300 hover:text-white hover:border-white transition-all duration-200"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}
