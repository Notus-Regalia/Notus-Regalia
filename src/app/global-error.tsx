"use client";

// Top-level error boundary. Unlike error.tsx (which only covers route
// segments), this also catches errors thrown by the ROOT layout itself, so it
// must render its own <html>/<body>. This is the last line of defense before
// React's bare "An error occurred in the Server Components render" message.
import { useEffect } from "react";

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
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "48px",
          background: "#0a0a0f",
          color: "#ffffff",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>Something went wrong</h1>
        <p style={{ color: "#94a3b8", maxWidth: "520px", margin: 0 }}>
          The site hit an unexpected error. Please retry in a moment.
        </p>
        {error.digest ? (
          <code style={{ fontSize: "12px", color: "#64748b" }}>ref: {error.digest}</code>
        ) : null}
        <button
          onClick={reset}
          style={{
            marginTop: "8px",
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
      </body>
    </html>
  );
}
