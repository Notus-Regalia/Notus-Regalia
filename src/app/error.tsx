"use client";

// Route-segment error boundary. Catches errors thrown while rendering any page
// under the app router and shows the branded maintenance screen instead of
// React's bare production message. The `digest` ties this back to the full
// stack trace in the server logs (Vercel → Runtime Logs).
import { useEffect } from "react";
import MaintenanceScreen from "@/components/ui/MaintenanceScreen";

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

  return <MaintenanceScreen reset={reset} digest={error.digest} />;
}
