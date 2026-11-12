import { useEffect, useState } from "react";
import {
  CONTENT_STATUS_EVENT,
  discardPendingContentSave,
  getContentStatus,
  hasPendingRecovery,
  isContentReady,
  retryContentSave,
} from "@/lib/published-store";

export function PublishStatus({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState(getContentStatus);
  useEffect(() => {
    const update = () => setStatus(getContentStatus());
    window.addEventListener(CONTENT_STATUS_EVENT, update);
    update();
    void retryContentSave();
    return () => window.removeEventListener(CONTENT_STATUS_EVENT, update);
  }, []);
  const failed =
    status.startsWith("Not saved:") || status.startsWith("Cannot load") || hasPendingRecovery();
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
        <span role="status" aria-live="polite">
          {status}
        </span>
        {failed && (
          <>
            <button
              type="button"
              className="underline text-white"
              onClick={() => void retryContentSave()}
            >
              Retry save / connection
            </button>
            {(hasPendingRecovery() || status.startsWith("Not saved:")) && (
              <button
                type="button"
                className="underline"
                onClick={() => {
                  if (window.confirm("Discard unsaved changes and load the latest server version?"))
                    void discardPendingContentSave();
                }}
              >
                Discard unsaved changes
              </button>
            )}
          </>
        )}
      </div>
      {isContentReady() && !hasPendingRecovery() ? children : <p>Connecting to saved content...</p>}
    </>
  );
}
