"use client";

// Route-segment error boundary. Catches errors thrown while rendering any page
// under the app router and shows the branded status screen instead of React's
// bare production message. The `digest` ties this back to the full stack trace
// in the server logs (Vercel → Runtime Logs).
import { useEffect } from "react";
import StatusScreen from "@/components/ui/StatusScreen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[render-error]", { digest: error.digest, message: error.message });
  }, [error]);

  return (
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
  );
}
