"use client";

import { memo, type ReactNode } from "react";
import { useReveal } from "@/hooks/useScrollReveal";

/* ─────────────────────────────────────────────────────────────
   Shared presentational blocks for the standalone Company pages
   (Roadmap, Ventures, Human Rights). Dark-theme aware via CSS vars.
   ───────────────────────────────────────────────────────────── */

const BLOCKS_CSS = `
.cb-section {
  position: relative;
  background: var(--gradient-section);
  color: var(--content-primary);
  border-top: 1px dashed rgba(255,255,255,0.12);
  /* Site-wide responsive gutter — matches IndustrySection / BentoSection so the
     Company pages align left/right. */
  --site-gutter-inline: 2rem;
  padding: clamp(3.5rem, 8vh, 6rem) var(--site-gutter-inline);
}
@media(min-width:640px){ .cb-section { --site-gutter-inline: 4rem; } }
@media(min-width:768px){ .cb-section { --site-gutter-inline: 6rem; } }
@media(min-width:1280px){ .cb-section { --site-gutter-inline: 8rem; } }
@media(min-width:1536px){ .cb-section { --site-gutter-inline: 12rem; } }
:root.light .cb-section { border-top-color: rgba(0,0,0,0.10); }
.cb-head { max-width: none; margin: 0 0 clamp(2rem, 4vw, 3rem); }
.cb-eyebrow {
  display: inline-flex; align-items: center; gap: .5rem;
  font-size: .65rem; font-family: ui-monospace, Menlo, monospace;
  text-transform: uppercase; letter-spacing: .22em; font-weight: 700;
  color: var(--content-faint); margin-bottom: 1rem;
}
.cb-title {
  font-size: clamp(1.5rem, 4vw, 2.4rem); font-weight: 700;
  letter-spacing: -0.02em; line-height: 1.1; margin: 0;
  color: var(--content-primary);
}
.cb-sub {
  margin: .9rem 0 0; font-size: clamp(.85rem, 1.8vw, 1rem);
  line-height: 1.7; color: var(--content-muted); max-width: none;
}

/* Card grid */
.cb-grid {
  display: grid; gap: clamp(.9rem, 1.8vw, 1.25rem);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
}
.cb-card {
  position: relative; border: 1px solid var(--border-color);
  border-radius: 14px; padding: clamp(1.25rem, 2.5vw, 1.75rem);
  background: var(--hover-bg);
}
/* Rainbow gradient border that follows the cursor — same effect as the
   IndustrySection cards and the brand button. */
.cb-card::before {
  content: ""; position: absolute; inset: 0; z-index: 1;
  border-radius: inherit; padding: 1px; pointer-events: none;
  background: radial-gradient(
    420px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(0, 255, 166, 0.86) 0%,
    rgba(255, 215, 0, 0.72) 22%,
    rgba(236, 72, 153, 0.68) 44%,
    rgba(147, 51, 234, 0.62) 62%,
    rgba(59, 130, 246, 0.56) 76%,
    transparent 88%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity .24s ease;
}
.cb-card:hover::before { opacity: 1; }
/* Hairline, monochrome icon (matches the site's card aesthetic). */
.cb-card-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 11px; margin-bottom: 1.1rem;
  border: 1px solid var(--border-color); background: transparent;
  color: var(--content-primary); font-size: 1.05rem;
}
.cb-card-title {
  margin: 0 0 .5rem; font-size: 1.02rem; font-weight: 650;
  letter-spacing: -0.01em; color: var(--content-primary);
}
.cb-card-desc { margin: 0; font-size: .88rem; line-height: 1.6; color: var(--content-muted); }
.cb-card-tag {
  display: inline-block; margin-top: 1rem; font-size: .68rem;
  font-family: ui-monospace, Menlo, monospace; letter-spacing: .12em;
  text-transform: uppercase; color: var(--content-faint);
}

/* Roadmap section gets extra breathing room before the next section. */
#direction-roadmap { padding-bottom: clamp(6rem, 11vh, 9rem); }
/* Timeline — modern canvas rail */
.cb-timeline {
  position: relative; display: flex; flex-direction: column;
  gap: clamp(1rem, 2.4vw, 1.5rem);
  padding-left: clamp(2.25rem, 4vw, 3rem);
}
/* glowing vertical rail */
.cb-timeline::before {
  content: ''; position: absolute; left: clamp(13px, 1.7vw, 19px); top: 10px; bottom: 10px; width: 2px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(227,27,84,0.95), rgba(227,27,84,0.35) 48%, rgba(227,27,84,0.04));
}
.cb-tl-item {
  position: relative;
  border: 1px solid var(--border-color); border-radius: 16px;
  padding: clamp(1.15rem, 2.4vw, 1.6rem) clamp(1.25rem, 2.6vw, 1.85rem);
  background:
    linear-gradient(180deg, var(--hover-bg), transparent 140%);
}
/* Rainbow gradient border that follows the cursor — same effect as the
   FeatureGrid / IndustrySection cards. */
.cb-tl-item::before {
  content: ""; position: absolute; inset: 0; z-index: 2;
  border-radius: inherit; padding: 1px; pointer-events: none;
  background: radial-gradient(
    420px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(0, 255, 166, 0.86) 0%,
    rgba(255, 215, 0, 0.72) 22%,
    rgba(236, 72, 153, 0.68) 44%,
    rgba(147, 51, 234, 0.62) 62%,
    rgba(59, 130, 246, 0.56) 76%,
    transparent 88%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity .24s ease;
}
.cb-tl-item:hover::before { opacity: 1; }
/* ghost phase number watermark */
.cb-tl-num {
  position: absolute; top: 50%; right: clamp(.6rem, 2vw, 1.4rem); transform: translateY(-50%);
  font-family: ui-monospace, Menlo, monospace; font-weight: 800;
  font-size: clamp(2.8rem, 8vw, 4.6rem); line-height: 1;
  letter-spacing: -0.04em; pointer-events: none; user-select: none;
  color: transparent;
  -webkit-text-stroke: 1.25px var(--content-faint);
  opacity: .4;
}
/* node marker that sits on the rail */
.cb-tl-node {
  position: absolute; left: calc(-1 * clamp(2.25rem, 4vw, 3rem) + clamp(13px, 1.7vw, 19px)); top: clamp(1.35rem, 3vw, 1.85rem);
  width: 14px; height: 14px; border-radius: 50%;
  transform: translateX(-50%);
  background: #E31B54;
  border: 2px solid var(--surface-primary);
  box-shadow: 0 0 0 4px rgba(227,27,84,0.14);
}
/* onyx black label — matches the Latest Releases .release-tag */
.cb-tl-phase {
  display: inline-flex; align-items: center; gap: .5rem;
  font-size: .62rem; font-family: ui-monospace, Menlo, monospace;
  letter-spacing: .16em; text-transform: uppercase; font-weight: 700;
  border: 1px solid rgba(255,255,255,0.14); border-radius: 2px;
  padding: .2rem .55rem; background: #141414; color: #f1f5f9;
  white-space: nowrap;
}
:root.light .cb-tl-phase { border-color: rgba(255,255,255,0.1); }
.cb-tl-title { margin: .85rem 0 .45rem; font-size: clamp(1.05rem, 2vw, 1.2rem); font-weight: 650; letter-spacing: -0.01em; color: var(--content-primary); }
.cb-tl-desc { margin: 0; font-size: .9rem; line-height: 1.65; color: var(--content-muted); max-width: 620px; position: relative; z-index: 1; }
`;

/* Render once near the top of each page that uses these blocks. */
export const BlocksStyles = () => <style>{BLOCKS_CSS}</style>;

export interface Feature {
  title: string;
  desc: string;
  icon?: string;
  tag?: string;
}

export interface Phase {
  phase: string;
  title: string;
  desc: string;
}

interface SectionProps {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

/* A revealed section with heading + arbitrary body. */
export const ContentSection = memo(({ id, eyebrow, title, subtitle, children }: SectionProps) => {
  const reveal = useReveal("fade-up", { threshold: 0.08, rootMargin: "0px 0px -40px 0px", duration: 800, cssDelay: 60 });
  return (
    <section id={id} className="cb-section">
      <div ref={reveal.ref} style={reveal.style}>
        <div className="cb-head">
          {eyebrow && <div className="cb-eyebrow">{eyebrow}</div>}
          <h2 className="cb-title">{title}</h2>
          {subtitle && <p className="cb-sub">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
});
ContentSection.displayName = "ContentSection";

export const FeatureGrid = memo(({ items }: { items: Feature[] }) => (
  <div className="cb-grid">
    {items.map((f) => (
      <article key={f.title} className="cb-card" onMouseMove={trackBrandGlow}>
        {f.icon && <span className="cb-card-icon"><i className={`bi ${f.icon}`} /></span>}
        <h3 className="cb-card-title">{f.title}</h3>
        <p className="cb-card-desc">{f.desc}</p>
        {f.tag && <span className="cb-card-tag">{f.tag}</span>}
      </article>
    ))}
  </div>
));
FeatureGrid.displayName = "FeatureGrid";

export const Timeline = memo(({ phases }: { phases: Phase[] }) => (
  <div className="cb-timeline">
    {phases.map((p, i) => (
      <div key={p.phase + p.title} className="cb-tl-item" onMouseMove={trackBrandGlow}>
        <span className="cb-tl-node" aria-hidden />
        <span className="cb-tl-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
        <div className="cb-tl-phase">{p.phase}</div>
        <h3 className="cb-tl-title">{p.title}</h3>
        <p className="cb-tl-desc">{p.desc}</p>
      </div>
    ))}
  </div>
));
Timeline.displayName = "Timeline";

/* Makes a ".brand-btn" rainbow border follow the cursor, like the Home hero. */
export const trackBrandGlow = (e: React.MouseEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
};

/* Internal CTA link (e.g. → Information Central). */
export const CtaLink = memo(({ href, label, icon = "bi-arrow-right" }: { href: string; label: string; icon?: string }) => (
  <a className="brand-btn" href={href} style={{ marginTop: "1.25rem" }} onMouseMove={trackBrandGlow}>
    <span>{label}</span>
    <i className={`bi ${icon}`} />
  </a>
));
CtaLink.displayName = "CtaLink";
