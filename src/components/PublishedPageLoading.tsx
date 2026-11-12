import { useEffect, useState } from "react";
import { CONTENT_STATUS_EVENT, getContentStatus, refreshPublishedContent } from "@/lib/published-store";
import LiquidWaveSpinner from "@/components/ui/spinner-10";

export function PublishedPageLoading() {
  const [status, setStatus] = useState("Loading published content…");

  useEffect(() => {
    const update = () => setStatus(getContentStatus());
    update();
    window.addEventListener(CONTENT_STATUS_EVENT, update);
    return () => window.removeEventListener(CONTENT_STATUS_EVENT, update);
  }, []);

  if (status.startsWith("Cannot load published content:")) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">Could not load this page. Check your connection and try again.</p>
        <button type="button" onClick={() => void refreshPublishedContent()} className="rounded-full border border-foreground/40 px-5 py-2 text-sm text-foreground hover:border-foreground">
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-background" aria-busy="true" aria-label="Loading portfolio page">
      <LiquidWaveSpinner size="md" />
      <span className="text-sm text-muted-foreground">Loading portfolio...</span>
    </div>
  );
}
