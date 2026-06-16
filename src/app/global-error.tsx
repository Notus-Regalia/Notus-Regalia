"use client";

// Top-level error boundary. Unlike error.tsx (which only covers route
// segments), this also catches errors thrown by the ROOT layout itself, so it
// must render its own <html>/<body>. Last line of defense before React's bare
// "An error occurred in the Server Components render" message.
import { useEffect } from "react";
import StatusScreen from "@/components/ui/StatusScreen";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-render-error]", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <StatusScreen
          code="503"
          status="System Maintenance"
          title="Website Under Maintenance"
          description="We're carrying out scheduled upkeep to sharpen the experience. Notus Regalia will be back online shortly."
          digest={error.digest}
          action={
            <button
              className="nr-cta"
              onClick={reset}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
              }}
            >
              Try Again
            </button>
          }
        />
      </body>
    </html>
  );
}
