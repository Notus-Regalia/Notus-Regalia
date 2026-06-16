// Branded 404 page. A missing page isn't an error/maintenance state, so it
// keeps the brand look but says "Page Not Found" with a route home. Server
// component — static, no interactivity needed.
import Link from "next/link";

export default function NotFound() {
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
        @keyframes nfGlow {
          0%,100% { opacity: .85; filter: drop-shadow(0 0 16px rgba(235,17,67,.22)); }
          50%     { opacity: 1;   filter: drop-shadow(0 0 30px rgba(235,17,67,.45)); }
        }
        .nf-logo { animation: nfGlow 3.4s ease-in-out infinite; }
        .nf-home { transition: background .15s ease, transform .12s ease, border-color .15s ease; }
        .nf-home:hover  { background: rgba(235,17,67,.12); border-color: rgba(235,17,67,.85); }
        .nf-home:active { transform: scale(.97); }
      `}</style>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="nf-logo"
        src="/icon-512.png"
        alt="Notus Regalia"
        width={88}
        height={88}
        style={{ borderRadius: 20, marginBottom: 26 }}
      />

      <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 22 }}>
        Notus <span style={{ color: "#EB1143", fontWeight: 300 }}>Regalia</span>
      </div>

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
        Error 404
      </div>

      <h1
        style={{
          fontSize: "clamp(28px, 6vw, 44px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          margin: "0 0 16px",
        }}
      >
        Page Not Found
      </h1>

      <p
        style={{
          color: "#94a3b8",
          fontSize: "clamp(15px, 2.4vw, 17px)",
          lineHeight: 1.6,
          maxWidth: 520,
          margin: "0 0 32px",
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Let&apos;s get you back on track.
      </p>

      <Link
        href="/"
        className="nf-home"
        style={{
          padding: "12px 28px",
          borderRadius: 10,
          border: "1px solid rgba(235,17,67,0.6)",
          background: "transparent",
          color: "#ffffff",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Back to Homepage
      </Link>

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
    </div>
  );
}
