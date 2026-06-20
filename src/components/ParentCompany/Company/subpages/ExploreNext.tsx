"use client";

import { memo, useCallback, useMemo } from "react";
import { COMPANY_SUBTABS } from "@/data/company-nav";
import { useReveal } from "@/hooks/useScrollReveal";
import { trackBrandGlow } from "./blocks";

/* Closing section of every standalone Company subtab page —
   a modern "Up Next" preview card pointing the visitor to the next
   page in the Company sequence. Navigation is delegated to
   ClientWrapper via a window event so the URL + navbar state stay in sync. */
const ExploreNext = memo(({ current }: { current: string }) => {
  const next = useMemo(() => {
    const pages = COMPANY_SUBTABS.filter(s => !s.external);
    const idx = pages.findIndex(p => p.id === current);
    return pages[(idx + 1) % pages.length];
  }, [current]);

  const reveal = useReveal('fade-up', { threshold: 0.15, duration: 800 });

  const go = useCallback(() => {
    window.dispatchEvent(new CustomEvent('company-navigate', { detail: { subtab: next.id } }));
  }, [next.id]);

  // Preview the next page's inner sections (drop its own "Explore" closer).
  const sections = (next.sections ?? []).filter(s => !s.id.endsWith('-explore') && s.label !== 'Explore');

  return (
    <section
      className="explore-next-root"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px dashed rgba(255,255,255,0.12)',
        background: '#000000',
        color: 'var(--content-primary)',
        padding: 'clamp(6rem, 13vh, 10rem) 2rem',
      }}
    >
      {/* ── Releases-hero background: grid + vignette + ambient glow (always dark) ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px),' +
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px),' +
            'repeating-linear-gradient(45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px),' +
            'repeating-linear-gradient(-45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px),' +
            'radial-gradient(circle, rgba(255,255,255,0.84) 0 1.4px, transparent 1.5px)',
          backgroundSize: '112px 112px',
          backgroundPosition: 'center',
          opacity: 0.42,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at center, transparent 22%, rgba(0,0,0,0.34) 100%),' +
            'linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.48) 100%)',
        }}
      />

      <div ref={reveal.ref} className="en-shell" style={reveal.style}>
        <div className="en-card" onMouseMove={trackBrandGlow}>
          <div className="en-card-main">
            <span className="en-card-kicker">Up Next</span>

            <h2 className="en-title">{next.hero?.title ?? next.label}</h2>

            {next.hero?.subtitle && <p className="en-desc">{next.hero.subtitle}</p>}

            {sections.length > 0 && (
              <ul className="en-chips">
                {sections.map(s => (
                  <li key={s.id} className="en-chip">{s.label}</li>
                ))}
              </ul>
            )}
          </div>

          <button type="button" className="brand-btn en-cta" onClick={go} onMouseMove={trackBrandGlow}>
            <span>Visit {next.label}</span>
            <i className="bi bi-arrow-right" />
          </button>
        </div>
      </div>

      <style>{`
        /* Always-dark section (mirrors the Releases hero) → force the dark
           token set so copy stays light even in light mode. */
        .explore-next-root,
        :root.light .explore-next-root {
          --content-primary: #ffffff;
          --content-secondary: #d4d4d4;
          --content-muted: rgb(163,163,163);
        }

        .en-shell {
          position: relative; z-index: 1;
          width: 100%; max-width: 1040px; margin: 0 auto;
        }

        /* ── The preview card ── */
        .en-card {
          position: relative;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          width: 100%;
          text-align: left;
          padding: clamp(1.8rem, 4vw, 3rem);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          background:
            linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 60%, rgba(255,255,255,0) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          overflow: hidden;
          isolation: isolate;
          transition: transform .45s cubic-bezier(0.22,1,0.36,1),
                      border-color .35s ease,
                      box-shadow .45s cubic-bezier(0.22,1,0.36,1);
        }
        @media(min-width:860px){
          .en-card {
            grid-template-columns: minmax(0,1fr) auto;
            align-items: center;
            gap: clamp(2rem, 4vw, 4rem);
          }
        }
        .en-card > * { position: relative; z-index: 1; }
        /* cursor-tracked gradient outline (matches the brand button) */
        .en-card::after {
          content: ''; position: absolute; inset: 0; z-index: 0;
          border-radius: 24px; padding: 1px;
          background: radial-gradient(
            340px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(0,255,166,0.9),
            rgba(255,215,0,0.7),
            rgba(236,72,153,0.7),
            rgba(147,51,234,0.6),
            rgba(59,130,246,0.5),
            transparent 70%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0; transition: opacity .3s ease; pointer-events: none;
        }
        .en-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.18);
          box-shadow: 0 24px 60px -28px rgba(0,0,0,0.8);
        }
        .en-card:hover::after { opacity: 1; }

        .en-card-main { display: flex; flex-direction: column; gap: 1.1rem; min-width: 0; }

        .en-card-kicker {
          display: inline-flex; align-items: center;
          font-family: ui-monospace, Menlo, monospace;
          font-size: clamp(1.05rem, 2.4vw, 1.45rem); font-weight: 700;
          letter-spacing: .14em; text-transform: uppercase;
          color: var(--content-secondary);
        }

        .en-title {
          font-size: clamp(2.1rem, 5.5vw, 3.6rem);
          font-weight: 700; letter-spacing: -0.025em; line-height: 1.04;
          color: var(--content-primary); margin: 0;
          transition: color .3s ease;
        }
        .en-card:hover .en-title { color: #fff; }

        .en-desc {
          font-size: clamp(1rem, 2.2vw, 1.2rem); line-height: 1.65;
          color: var(--content-muted); margin: 0; max-width: 46rem;
        }

        .en-chips {
          list-style: none; margin: .4rem 0 0; padding: 0;
          display: flex; flex-wrap: wrap; gap: .55rem;
        }
        .en-chip {
          font-family: ui-monospace, Menlo, monospace;
          font-size: .68rem; font-weight: 600; letter-spacing: .04em;
          padding: .4rem .8rem; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.03);
          color: var(--content-secondary);
          white-space: nowrap;
          transition: border-color .3s ease, color .3s ease;
        }
        .en-card:hover .en-chip { border-color: rgba(255,255,255,0.2); }

        /* ── CTA — website black branding button (matches home hero) ── */
        .en-cta.brand-btn {
          flex-shrink: 0;
          padding: 14px 24px;
          font-size: 0.95rem;
        }
        @media(min-width:1024px){
          .en-cta.brand-btn { padding: 16px 30px; font-size: 1rem; }
        }
        .en-cta.brand-btn i { transition: transform .25s ease; }
        .en-cta.brand-btn:hover i { transform: translateX(3px); }
      `}</style>
    </section>
  );
});

ExploreNext.displayName = "ExploreNext";

export default ExploreNext;
