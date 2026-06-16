"use client";

// Route-segment error boundary. Catches errors thrown while rendering any
// page under the app router (Server or Client Components) and renders a
// recoverable fallback instead of React's bare production message.
//
// The `digest` is the only handle that ties this client-visible error back to
// the full stack trace in the server logs (Vercel → Runtime Logs). Surface it
// so it can be matched without guesswork.
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Forward to the browser console (and any client logging pipeline).
    console.error("[render-error]", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "48px",
        background: "var(--surface-primary, #0a0a0f)",
        color: "var(--content-primary, #ffffff)",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>Something went wrong</h1>
      <p style={{ color: "#94a3b8", maxWidth: "520px", margin: 0 }}>
        This page hit an unexpected error. You can retry, or head back to the homepage.
      </p>
      {error.digest ? (
        <code style={{ fontSize: "12px", color: "#64748b" }}>ref: {error.digest}</code>
      ) : null}
      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #EB1143",
            background: "transparent",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #334155",
            color: "#ffffff",
            textDecoration: "none",
          }}
        >
          Go home
        </a>
      </div>
    </main>
  );
}
