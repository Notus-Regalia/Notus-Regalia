import type { ReactNode } from "react";

// Brand-aligned status screen for the app's error boundaries (error.tsx /
// global-error.tsx) and the 404 page. Intentionally NOT "use client" — it has no
// hooks/handlers of its own (interactivity lives in the `action` prop), so it
// stays a shared component that server-renders for the 404 (otherwise the page
// flashes blank until hydration). Styled like an operations console — giant
// ghosted status code, grid field, crimson glow, monospace system labels — to
// match the "At the Core of Critical Operations" identity. Fully self-contained
// inline styles so it renders even when global CSS is what failed.

export default function StatusScreen({
  code,
  status,
  title,
  description,
  action,
  digest,
}: {
  code: string;
  status: string;
  title: string;
  description: string;
  action?: ReactNode;
  digest?: string;
}) {
  return (
    <div className="ss-root">
      <style>{`
        .ss-root {
          position: relative; min-height: 100vh; margin: 0; overflow: hidden;
          display: flex; align-items: center; justify-content: center; padding: 40px 28px;
          background: linear-gradient(160deg, #0a0a0f 0%, #0d0d14 55%, #080810 100%);
          color: #ffffff;
          font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        }
        .ss-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
          background-size: 46px 46px;
          -webkit-mask-image: radial-gradient(ellipse 78% 58% at 50% 42%, #000 24%, transparent 72%);
          mask-image: radial-gradient(ellipse 78% 58% at 50% 42%, #000 24%, transparent 72%);
        }
        .ss-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(700px 380px at 50% -8%, rgba(235,17,67,0.14), transparent 62%);
        }
        .ss-code {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%);
          font-size: clamp(190px, 40vw, 440px); font-weight: 800; letter-spacing: -0.045em; line-height: 1;
          white-space: nowrap; user-select: none; pointer-events: none;
          background: linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.004));
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .ss-panel {
          position: relative; z-index: 1; width: 100%; max-width: 560px;
          display: flex; flex-direction: column; align-items: flex-start; text-align: left;
        }
        .ss-head { display: flex; align-items: center; gap: 12px; width: 100%; margin-bottom: 32px; }
        .ss-logo { border-radius: 9px; filter: drop-shadow(0 0 14px rgba(235,17,67,0.3)); flex-shrink: 0; }
        .ss-brand {
          font-size: 12px; font-weight: 700; letter-spacing: 0.3em; color: #cbd5e1;
          font-family: ui-monospace, Menlo, monospace; white-space: nowrap;
        }
        .ss-rainbow {
          flex: 1; height: 1px; margin-left: 4px; min-width: 30px;
          background: linear-gradient(90deg, rgba(0,255,166,0.65), rgba(255,215,0,0.5), rgba(236,72,153,0.55), rgba(147,51,234,0.45), transparent);
        }
        .ss-status {
          display: inline-flex; align-items: center; gap: 9px; margin-bottom: 24px;
          font-family: ui-monospace, Menlo, monospace; font-size: 12.5px;
          letter-spacing: 0.2em; text-transform: uppercase; color: #f1a9b8;
        }
        .ss-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #EB1143;
          box-shadow: 0 0 10px rgba(235,17,67,0.9); animation: ssPulse 1.7s ease-in-out infinite;
        }
        .ss-title {
          font-size: clamp(34px, 7vw, 58px); font-weight: 700; letter-spacing: -0.035em;
          line-height: 1.04; margin: 0 0 18px;
        }
        .ss-desc {
          font-size: clamp(15px, 2.3vw, 17px); line-height: 1.6; color: #94a3b8;
          max-width: 470px; margin: 0 0 36px;
        }
        .ss-action { margin-bottom: 46px; }
        .ss-foot {
          display: flex; flex-wrap: wrap; align-items: center; gap: 8px 18px;
          font-family: ui-monospace, Menlo, monospace; font-size: 10.5px;
          letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.34);
        }
        .ss-ref { color: rgba(255,255,255,0.2); }
        @keyframes ssPulse { 0%,100% { opacity: .4; transform: scale(.82); } 50% { opacity: 1; transform: scale(1); } }
        @media (max-width: 520px) { .ss-brand { letter-spacing: 0.2em; } }

        /* Site brand button — replicated self-contained */
        .nr-cta {
          position: relative; display: inline-flex; align-items: center; justify-content: center;
          gap: 0.5rem; padding: 0.85rem 2rem; font-size: 0.9rem; font-weight: 500; line-height: 1;
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

      <div className="ss-grid" aria-hidden />
      <div className="ss-glow" aria-hidden />
      <div className="ss-code" aria-hidden>{code}</div>

      <div className="ss-panel">
        <div className="ss-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ss-logo" src="/icon-512.png" alt="" width={34} height={34} />
          <span className="ss-brand">NOTUS&nbsp;REGALIA</span>
          <span className="ss-rainbow" aria-hidden />
        </div>

        <div className="ss-status">
          <span className="ss-dot" aria-hidden />
          <span>{status}</span>
        </div>

        <h1 className="ss-title">{title}</h1>
        <p className="ss-desc">{description}</p>

        {action ? <div className="ss-action">{action}</div> : null}

        <div className="ss-foot">
          <span>Beyond&nbsp;Perception · Beyond&nbsp;Form · Beyond&nbsp;Fate</span>
          {digest ? <span className="ss-ref">REF&nbsp;{digest}</span> : null}
        </div>
      </div>
    </div>
  );
}
