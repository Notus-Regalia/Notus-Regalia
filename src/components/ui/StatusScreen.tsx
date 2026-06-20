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
  title,
  description,
  action,
  digest,
}: {
  code: string;
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
          background: linear-gradient(160deg, #0a0a0a 0%, #0d0d0d 55%, #070707 100%);
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
        .ss-logo { border-radius: 9px; flex-shrink: 0; }
        .ss-brand {
          font-size: 12px; font-weight: 700; letter-spacing: 0.3em; color: #cbd5e1;
          font-family: ui-monospace, Menlo, monospace; white-space: nowrap;
        }
        .ss-rainbow {
          flex: 1; height: 1px; margin-left: 4px; min-width: 30px;
          background: linear-gradient(90deg, rgba(0,255,166,0.65), rgba(255,215,0,0.5), rgba(236,72,153,0.55), rgba(147,51,234,0.45), transparent);
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
        @media (max-width: 520px) { .ss-brand { letter-spacing: 0.2em; } }

        /* Site brand button — replicated self-contained (flat #1f1f1f surface,
           bright white hairline, shimmer underline, cursor-tracked gradient border). */
        .nr-cta {
          min-width: 120px;
          position: relative; display: inline-flex; align-items: center; justify-content: center;
          gap: 0.5rem; padding: 12px 22px; font-size: 0.9rem; font-weight: 500; line-height: 1;
          background: #1f1f1f;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.28);
          border: 0; border-radius: 7px; cursor: pointer;
          color: rgba(255,255,255,0.66); text-decoration: none;
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
            box-shadow 0.35s cubic-bezier(0.22,1,0.36,1), color 0.35s ease;
        }
        /* shimmer underline */
        .nr-cta::before {
          content: ''; width: 70%; height: 1px; position: absolute; bottom: 0; left: 15%;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
          opacity: 0.2; transition: opacity 0.35s ease;
        }
        .nr-cta:hover {
          color: rgba(255,255,255,1); transform: translateY(-2px);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.28), 0 6px 18px -6px rgba(0,0,0,0.45);
        }
        .nr-cta:hover::before { opacity: 1; }
        /* cursor-tracked gradient border */
        .nr-cta::after {
          content: ''; position: absolute; inset: -1.5px; border-radius: 8.5px; padding: 1px;
          background: radial-gradient(180px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(0,255,166,0.9), rgba(255,215,0,0.7), rgba(236,72,153,0.7),
            rgba(147,51,234,0.6), rgba(59,130,246,0.5), transparent 70%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity 0.3s ease; pointer-events: none; z-index: 0;
        }
        .nr-cta:hover::after { opacity: 1; }
      `}</style>

      <div className="ss-grid" aria-hidden />
      <div className="ss-code" aria-hidden>{code}</div>

      <div className="ss-panel">
        <div className="ss-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ss-logo" src="/icon-512.png" alt="" width={34} height={34} />
          <span className="ss-brand">NOTUS&nbsp;REGALIA</span>
          <span className="ss-rainbow" aria-hidden />
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
