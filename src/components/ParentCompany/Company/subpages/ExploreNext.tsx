"use client";

import { memo, useCallback, useMemo } from "react";
import { COMPANY_SUBTABS } from "@/data/company-nav";
import { useReveal } from "@/hooks/useScrollReveal";
import { trackBrandGlow } from "./blocks";

/* Closing section of every standalone Company subtab page —
   points the visitor to the next page in the Company sequence.
   Navigation is delegated to ClientWrapper via a window event so
   the URL + navbar state stay in sync. */
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

  return (
    <section
      className="explore-next-root"
      style={{
        position: 'relative',
        borderTop: '1px dashed rgba(255,255,255,0.12)',
        background: 'var(--gradient-section)',
        color: 'var(--content-primary)',
        padding: 'clamp(4rem, 9vh, 7rem) 2rem',
      }}
    >
      <div
        ref={reveal.ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.1rem',
          maxWidth: '720px',
          margin: '0 auto',
          ...reveal.style,
        }}
      >
        <div className="en-eyebrow">
          <span className="en-eyebrow-dot" />
          Continue Exploring
        </div>

        <h2 className="en-title">
          Next: <span style={{ color: '#E31B54' }}>{next.label}</span>
        </h2>

        {next.hero && (
          <p className="en-desc">{next.hero.subtitle}</p>
        )}

        <button className="brand-btn" onClick={go} onMouseMove={trackBrandGlow} style={{ marginTop: '.8rem' }}>
          <span>Visit {next.label}</span>
          <i className="bi bi-arrow-right" />
        </button>
      </div>

      <style>{`
        .en-eyebrow {
          display: inline-flex; align-items: center; gap: .5rem;
          font-size: .65rem; font-family: ui-monospace, Menlo, monospace;
          text-transform: uppercase; letter-spacing: .22em; font-weight: 700;
          color: #E31B54;
        }
        .en-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #E31B54;
          flex-shrink: 0; animation: enPulse 2s ease-in-out infinite;
        }
        @keyframes enPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .45; }
        }
        .en-title {
          font-size: clamp(1.6rem, 4.5vw, 2.6rem);
          font-weight: 700; letter-spacing: -0.02em; line-height: 1.1;
          color: var(--content-primary); margin: 0;
        }
        .en-desc {
          font-size: clamp(.85rem, 2vw, 1rem); line-height: 1.7;
          color: var(--content-muted); margin: 0; max-width: 560px;
        }
        .brand-btn i { transition: transform .2s ease; }
        .brand-btn:hover i { transform: translateX(3px); }
      `}</style>
    </section>
  );
});

ExploreNext.displayName = "ExploreNext";

export default ExploreNext;
