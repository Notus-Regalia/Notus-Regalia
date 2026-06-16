"use client";

// Branded "Website Under Maintenance" screen shown by the app's error
// boundaries (error.tsx / global-error.tsx). Self-contained inline styles so it
// renders even when the root layout / global CSS is the thing that failed.

export default function MaintenanceScreen({
  reset,
  digest,
}: {
  reset?: () => void;
  digest?: string;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        color: "#ffffff",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        background:
          "radial-gradient(1100px 560px at 50% -10%, rgba(235,17,67,0.08), transparent 60%), linear-gradient(160deg, #0a0a0f 0%, #0d0d14 55%, #080810 100%)",
      }}
    >
      <style>{`
        @keyframes mntGlow {
          0%,100% { opacity: .85; filter: drop-shadow(0 0 16px rgba(235,17,67,.22)); }
          50%     { opacity: 1;   filter: drop-shadow(0 0 30px rgba(235,17,67,.45)); }
        }
        @keyframes mntPulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
        .mnt-logo { animation: mntGlow 3.4s ease-in-out infinite; }
        .mnt-dot  { animation: mntPulse 1.8s ease-in-out infinite; }
        .mnt-retry { transition: background .15s ease, transform .12s ease, border-color .15s ease; }
        .mnt-retry:hover  { background: rgba(235,17,67,.12); border-color: rgba(235,17,67,.85); }
        .mnt-retry:active { transform: scale(.97); }
      `}</style>

      {/* Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="mnt-logo"
        src="/icon-512.png"
        alt="Notus Regalia"
        width={88}
        height={88}
        style={{ borderRadius: 20, marginBottom: 26 }}
      />

      {/* Wordmark */}
      <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 22 }}>
        Notus <span style={{ color: "#EB1143", fontWeight: 300 }}>Regalia</span>
      </div>

      {/* Status pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 999,
          border: "1px solid rgba(235,17,67,0.35)",
          background: "rgba(235,17,67,0.06)",
          fontSize: 11.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#f1a9b8",
          marginBottom: 26,
        }}
      >
        <span
          className="mnt-dot"
          style={{ width: 7, height: 7, borderRadius: 999, background: "#EB1143", display: "inline-block" }}
        />
        Temporarily Offline
      </div>

      {/* Heading */}
      <h1
        style={{
          fontSize: "clamp(28px, 6vw, 44px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          margin: "0 0 16px",
        }}
      >
        Website Under Maintenance
      </h1>

      <p
        style={{
          color: "#94a3b8",
          fontSize: "clamp(15px, 2.4vw, 17px)",
          lineHeight: 1.6,
          maxWidth: 540,
          margin: "0 0 32px",
        }}
      >
        We&apos;re carrying out scheduled upkeep to improve your experience. Notus Regalia will
        be back online shortly — thank you for your patience.
      </p>

      {reset ? (
        <button
          className="mnt-retry"
          onClick={reset}
          style={{
            padding: "12px 28px",
            borderRadius: 10,
            border: "1px solid rgba(235,17,67,0.6)",
            background: "transparent",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      ) : null}

      {/* Motto */}
      <div
        style={{
          marginTop: 48,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
        }}
      >
        Beyond Perception &nbsp;·&nbsp; Beyond Form &nbsp;·&nbsp; Beyond Fate
      </div>

      {digest ? (
        <code
          style={{
            marginTop: 14,
            fontSize: 11,
            color: "rgba(255,255,255,0.18)",
            fontFamily: "ui-monospace, Menlo, monospace",
          }}
        >
          ref: {digest}
        </code>
      ) : null}
    </div>
  );
}
