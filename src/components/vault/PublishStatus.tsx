import { useEffect, useState } from "react";
import {
  browserRecoverySnapshot,
  CONTENT_STATUS_EVENT,
  flushContentSave,
  getContentStatus,
  hasBrowserRecovery,
  hasPendingRecovery,
  isContentReady,
  recoverBrowserContent,
  refreshPublishedContent,
} from "@/lib/published-store";

export function PublishStatus({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState(getContentStatus);
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    setRecovery(hasBrowserRecovery());
    const update = () => setStatus(getContentStatus());
    window.addEventListener(CONTENT_STATUS_EVENT, update);
    update();
    return () => window.removeEventListener(CONTENT_STATUS_EVENT, update);
  }, []);
  const exportBackup = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(browserRecoverySnapshot(), null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "vault-browser-backup.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <section className="mb-6 rounded-xl border border-white/20 p-4 text-sm space-y-3">
        <p role="status" aria-live="polite">
          {status}
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className="underline"
            onClick={() => {
              void refreshPublishedContent();
              void flushContentSave();
            }}
          >
            Retry connection / save
          </button>
          {recovery && (
            <>
              <button type="button" className="underline" onClick={exportBackup}>
                Export browser backup
              </button>
              <button
                type="button"
                className="underline"
                disabled={busy || !isContentReady()}
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Publish this browser’s saved portfolio data? This replaces the corresponding server records. Export a backup first. Use the original browser containing your latest edits.",
                    )
                  )
                    return;
                  setBusy(true);
                  try {
                    await recoverBrowserContent();
                  } catch (error) {
                    alert(error instanceof Error ? error.message : String(error));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Recovering…" : "Recover and publish browser data"}
              </button>
            </>
          )}
        </div>
        {recovery && (
          <p>
            Older edits are available in this browser. Export a backup, then recover them here to
            publish your media and page details.
          </p>
        )}
      </section>
      {isContentReady() && !busy && !hasPendingRecovery() ? (
        children
      ) : (
        <p>Connect and recover any unpublished edits before editing.</p>
      )}
    </>
  );
}
