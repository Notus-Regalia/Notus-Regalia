"use client";
import Link from 'next/link';

/* ─────────────────────────────────────────
   Placeholder shown for executives whose
   dedicated profile is not published yet.
   Kept out of search via noindex (see page meta).
───────────────────────────────────────── */
export default function ExecutiveComingSoon({ name, title, onBack }: { name: string; title: string; onBack?: () => void }) {
  return (
    <main className="ecs-root">
      <style>{`
        .ecs-root{
          position:relative;min-height:100dvh;background:#000;color:#f1f5f9;overflow:hidden;
          display:flex;align-items:center;justify-content:center;text-align:center;
        }
        .ecs-grid{
          position:absolute;inset:0;pointer-events:none;z-index:0;
          background-image:
            repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 112px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 112px);
          background-size:112px 112px;background-position:center;opacity:.30;
          mask-image:radial-gradient(circle at center, black, transparent 75%);
          -webkit-mask-image:radial-gradient(circle at center, black, transparent 75%);
        }
        .ecs-glow{
          position:absolute;inset:0;pointer-events:none;z-index:0;
          background:radial-gradient(ellipse at 50% 30%, rgba(227,27,84,0.10) 0%, transparent 60%);
        }
        .ecs-wrap{position:relative;z-index:1;padding:2rem 1.4rem;max-width:560px;}
        .ecs-badge{
          display:inline-flex;align-items:center;gap:.55rem;
          font-family:ui-monospace,Menlo,monospace;font-size:.62rem;letter-spacing:.22em;
          text-transform:uppercase;font-weight:700;color:#E31B54;margin-bottom:1.6rem;
        }
        .ecs-badge-dot{width:5px;height:5px;border-radius:50%;background:#E31B54;}
        .ecs-name{
          font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;letter-spacing:-.03em;line-height:1.1;margin:0;
          background:linear-gradient(135deg,#f1f5f9 0%,rgba(241,245,249,.6) 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .ecs-title{
          font-family:ui-monospace,Menlo,monospace;font-size:.78rem;color:#E31B54;font-weight:700;
          letter-spacing:.14em;text-transform:uppercase;margin:.9rem 0 0;
        }
        .ecs-msg{font-size:1rem;line-height:1.8;color:rgba(255,255,255,.55);margin:2rem 0 0;}
        .ecs-back{
          display:inline-flex;align-items:center;gap:.5rem;margin-top:2.4rem;
          font-family:ui-monospace,Menlo,monospace;font-size:.62rem;letter-spacing:.18em;
          text-transform:uppercase;color:rgba(255,255,255,.55);text-decoration:none;cursor:pointer;
          border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);
          padding:11px 18px;border-radius:8px;transition:border-color .25s ease,color .25s ease,background .25s ease;
        }
        .ecs-back:hover{border-color:rgba(227,27,84,.6);color:#fff;background:rgba(227,27,84,.12);}
      `}</style>

      <div className="ecs-grid" />
      <div className="ecs-glow" />

      <div className="ecs-wrap">
        <div className="ecs-badge"><span className="ecs-badge-dot" />Profile Coming Soon</div>
        <h1 className="ecs-name">{name}</h1>
        <p className="ecs-title">{title}</p>
        <p className="ecs-msg">
          This executive&rsquo;s full profile is being prepared and will be published soon.
        </p>
        {onBack ? (
          <button type="button" onClick={onBack} className="ecs-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="m15 18-6-6 6-6" /></svg>
            Back to Executives
          </button>
        ) : (
          <Link href="/company/executives" className="ecs-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="m15 18-6-6 6-6" /></svg>
            Back to Executives
          </Link>
        )}
      </div>
    </main>
  );
}
