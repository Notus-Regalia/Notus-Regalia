"use client";

import { memo } from "react";
import { GOVERNANCE_ITEMS, ABOUT_PANEL_CONTENT } from "@/data/Company-data";
import { useReveal } from "@/hooks/useScrollReveal";
import { trackBrandGlow } from "./subpages/blocks";

/* ─────────────────────────────────────────────────────────────
   Governance — modern editorial "pillars" layout.

   Replaces the sidebar grid-nav panel. Each governance pillar
   (Governance · Ethics & Responsibility · Commitments) is a
   sticky-aside section whose sub-points render as cursor-lit
   cards. Theme-aware via the site CSS vars.
   ───────────────────────────────────────────────────────────── */

const PILLAR_ICONS: Record<string, string> = {
  governance: "bi-diagram-3",
  ethics: "bi-shield-check",
  commitments: "bi-patch-check",
};

const GOV_CSS = `
.gov-root {
  position: relative;
  background: var(--gradient-section);
  color: var(--content-primary);
  border-top: 1px dashed rgba(255,255,255,0.12);
  --site-gutter-inline: 2rem;
  padding: clamp(3.5rem, 8vh, 6rem) var(--site-gutter-inline) clamp(5rem, 10vh, 8rem);
}
@media(min-width:640px){ .gov-root { --site-gutter-inline: 4rem; } }
@media(min-width:768px){ .gov-root { --site-gutter-inline: 6rem; } }
@media(min-width:1280px){ .gov-root { --site-gutter-inline: 8rem; } }
@media(min-width:1536px){ .gov-root { --site-gutter-inline: 12rem; } }
:root.light .gov-root { border-top-color: rgba(0,0,0,0.10); }

/* Section intro */
.gov-intro { max-width: 78rem; margin: 0 0 clamp(3rem, 6vw, 5rem); }
.gov-intro-eyebrow {
  display: inline-flex; align-items: center; gap: .55rem;
  font-size: .65rem; font-family: ui-monospace, Menlo, monospace;
  text-transform: uppercase; letter-spacing: .22em; font-weight: 700;
  color: var(--content-faint); margin-bottom: 1rem;
}
.gov-intro-eyebrow::before {
  content: ''; width: 22px; height: 2px; border-radius: 2px; background: #E31B54;
}
.gov-intro-title {
  margin: 0; font-size: clamp(1.7rem, 4.4vw, 2.7rem); font-weight: 700;
  letter-spacing: -0.025em; line-height: 1.08; color: var(--content-primary);
}
.gov-intro-sub {
  margin: 1rem 0 0; font-size: clamp(.92rem, 1.9vw, 1.08rem); line-height: 1.7;
  color: var(--content-muted); max-width: 64rem;
}

/* Pillars */
.gov-pillars { display: flex; flex-direction: column; gap: clamp(3rem, 7vw, 6rem); }
.gov-pillar { position: relative; }
@media(min-width:980px){
  .gov-pillar {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.6fr);
    gap: clamp(2rem, 4vw, 4rem);
    align-items: start;
  }
}

/* Sticky aside */
.gov-aside { position: relative; margin-bottom: 1.75rem; }
@media(min-width:980px){
  .gov-aside { position: sticky; top: clamp(7rem, 12vh, 9rem); margin-bottom: 0; }
}
.gov-index {
  display: block;
  font-family: ui-monospace, Menlo, monospace; font-weight: 800;
  font-size: clamp(2.6rem, 7vw, 4.4rem); line-height: .9; letter-spacing: -0.04em;
  color: transparent; -webkit-text-stroke: 1.25px var(--content-faint);
  opacity: .55; margin-bottom: 1.1rem;
}
.gov-aside-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 12px; margin-bottom: 1.1rem;
  border: 1px solid var(--border-color); background: var(--hover-bg);
  color: #E31B54; font-size: 1.15rem;
}
.gov-aside-title {
  margin: 0; font-size: clamp(1.4rem, 3vw, 1.95rem); font-weight: 700;
  letter-spacing: -0.02em; line-height: 1.1; color: var(--content-primary);
}
.gov-aside-sub {
  margin: .75rem 0 0; font-size: clamp(.85rem, 1.7vw, .98rem); line-height: 1.6;
  color: var(--content-muted); max-width: 22rem;
}
.gov-aside-rule {
  margin-top: 1.4rem; height: 1px; width: 100%;
  background: linear-gradient(90deg, rgba(227,27,84,0.55), transparent 70%);
}

/* Cards */
.gov-list { display: flex; flex-direction: column; gap: clamp(.9rem, 1.8vw, 1.25rem); }
.gov-card {
  position: relative; overflow: hidden;
  border: 1px solid var(--border-color); border-radius: 16px;
  padding: clamp(1.3rem, 2.6vw, 1.9rem) clamp(1.4rem, 2.8vw, 2.1rem);
  background: linear-gradient(180deg, var(--hover-bg), transparent 160%);
  transition: transform .4s cubic-bezier(.22,1,.36,1), border-color .3s ease;
}
.gov-card > * { position: relative; z-index: 1; }
/* cursor-tracked rainbow border (matches the rest of the Company pages) */
.gov-card::before {
  content: ''; position: absolute; inset: 0; z-index: 0;
  border-radius: inherit; padding: 1px; pointer-events: none;
  background: radial-gradient(
    420px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(0,255,166,0.86) 0%, rgba(255,215,0,0.72) 22%, rgba(236,72,153,0.68) 44%,
    rgba(147,51,234,0.62) 62%, rgba(59,130,246,0.56) 76%, transparent 88%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity .24s ease;
}
.gov-card:hover { transform: translateY(-3px); }
.gov-card:hover::before { opacity: 1; }

.gov-card-head { display: flex; align-items: center; gap: .7rem; margin-bottom: .9rem; }
.gov-card-num {
  font-family: ui-monospace, Menlo, monospace; font-size: .7rem; font-weight: 700;
  letter-spacing: .1em; color: #E31B54;
}
.gov-card-tag {
  font-family: ui-monospace, Menlo, monospace; font-size: .62rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase; color: var(--content-faint);
  border: 1px solid var(--border-color); border-radius: 999px; padding: .25rem .7rem;
}
.gov-card-title {
  margin: 0 0 .65rem; font-size: clamp(1.02rem, 2.1vw, 1.22rem); font-weight: 650;
  letter-spacing: -0.01em; line-height: 1.3; color: var(--content-primary);
}
.gov-card-desc { margin: 0; font-size: clamp(.86rem, 1.7vw, .94rem); line-height: 1.7; color: var(--content-muted); }
.gov-card-desc + .gov-card-desc { margin-top: .7rem; }
`;

const Pillar = memo(({ item, index }: { item: typeof GOVERNANCE_ITEMS[number]; index: number }) => {
  const content = ABOUT_PANEL_CONTENT[item.key];
  const reveal = useReveal("fade-up", { threshold: 0.06, rootMargin: "0px 0px -60px 0px", duration: 800, cssDelay: 60 });

  return (
    <div className="gov-pillar" ref={reveal.ref} style={reveal.style}>
      <div className="gov-aside">
        <span className="gov-index" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
        <span className="gov-aside-icon" aria-hidden><i className={`bi ${PILLAR_ICONS[item.key] ?? "bi-dot"}`} /></span>
        <h3 className="gov-aside-title">{item.title}</h3>
        <p className="gov-aside-sub">{item.subtitle}</p>
        <div className="gov-aside-rule" aria-hidden />
      </div>

      <div className="gov-list">
        {content.subsections.map((s, i) => (
          <article key={s.key} className="gov-card" onMouseMove={trackBrandGlow}>
            <div className="gov-card-head">
              <span className="gov-card-num">{String(index + 1).padStart(2, "0")}.{i + 1}</span>
              <span className="gov-card-tag">{s.label}</span>
            </div>
            <h4 className="gov-card-title">{s.contentTitle}</h4>
            {s.description.map((p, pi) => (
              <p key={pi} className="gov-card-desc">{p}</p>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
});
Pillar.displayName = "GovernancePillar";

const Governance = memo(() => (
  <section className="gov-root" data-nosnippet="true">
    <style>{GOV_CSS}</style>
    <div className="gov-intro">
      <span className="gov-intro-eyebrow">Operating discipline</span>
      <h2 className="gov-intro-title">Structured for speed at the edge, discipline at the center.</h2>
      <p className="gov-intro-sub">
        How Notus Regalia is structured, the standards it holds itself to, and the commitments it
        operates against — the framework that keeps the platform accountable as it scales.
      </p>
    </div>

    <div className="gov-pillars">
      {GOVERNANCE_ITEMS.map((item, i) => (
        <Pillar key={item.key} item={item} index={i} />
      ))}
    </div>
  </section>
));

Governance.displayName = "Governance";

export default Governance;
