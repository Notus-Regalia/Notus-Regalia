"use client";

// Top-level error boundary. Unlike error.tsx (which only covers route
// segments), this also catches errors thrown by the ROOT layout itself, so it
// must render its own <html>/<body>. Last line of defense before React's bare
// "An error occurred in the Server Components render" message.
import { useEffect } from "react";
import MaintenanceScreen from "@/components/ui/MaintenanceScreen";

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
        <MaintenanceScreen reset={reset} digest={error.digest} />
      </body>
    </html>
  );
}
