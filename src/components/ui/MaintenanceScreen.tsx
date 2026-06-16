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

        /* Site brand button — replicated self-contained (global CSS is not
           guaranteed here, e.g. global-error replaces the root layout). */
        .nr-cta {
          position: relative; display: inline-flex; align-items: center; justify-content: center;
          gap: 0.5rem; padding: 0.8rem 1.9rem; font-size: 0.9rem; font-weight: 500; line-height: 1;
          background-color: #101010;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.2), inset 0 2px 2px rgba(255,255,255,0.15), inset 0 4px 4px rgba(255,255,255,0.1);
          border: solid 1px rgba(255,255,255,0.133); border-radius: 8px; cursor: pointer;
          color: #d4d4d4; text-decoration: none;
          transition: color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
        }
        .nr-cta:hover { transform: translateY(-1px); color: #ffffff; }
        .nr-cta::before {
          content: ''; position: absolute; inset: -2px; border-radius: 10px; padding: 1px;
          background: radial-gradient(200px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(0,255,166,0.9), rgba(255,215,0,0.7), rgba(236,72,153,0.7),
            rgba(147,51,234,0.6), rgba(59,130,246,0.5), transparent 70%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity 0.3s ease; pointer-events: none; z-index: 0;
        }
        .nr-cta:hover::before { opacity: 1; }
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
