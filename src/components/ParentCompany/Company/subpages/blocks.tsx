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
  padding: clamp(3.5rem, 8vh, 6rem) clamp(1.5rem, 5vw, 6rem);
}
:root.light .cb-section { border-top-color: rgba(0,0,0,0.10); }
.cb-head { max-width: 760px; margin: 0 0 clamp(2rem, 4vw, 3rem); }
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
  line-height: 1.7; color: var(--content-muted); max-width: 680px;
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
  transition: border-color .25s ease, transform .25s ease, background .25s ease;
}
.cb-card:hover { border-color: rgba(227,27,84,0.5); transform: translateY(-3px); }
.cb-card-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border-radius: 10px; margin-bottom: 1rem;
  background: rgba(227,27,84,0.10); color: #E31B54; font-size: 1rem;
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

/* Timeline */
.cb-timeline { position: relative; display: flex; flex-direction: column; gap: clamp(1.25rem, 3vw, 2rem); }
.cb-timeline::before {
  content: ''; position: absolute; left: 7px; top: 6px; bottom: 6px; width: 2px;
  background: linear-gradient(180deg, rgba(227,27,84,0.8), rgba(227,27,84,0.05));
}
.cb-tl-item { position: relative; padding-left: 2.5rem; }
.cb-tl-dot {
  position: absolute; left: 0; top: 4px; width: 16px; height: 16px;
  border-radius: 50%; background: var(--surface-primary);
  border: 2px solid #E31B54; box-shadow: 0 0 0 4px rgba(227,27,84,0.12);
}
.cb-tl-phase {
  font-size: .68rem; font-family: ui-monospace, Menlo, monospace;
  letter-spacing: .16em; text-transform: uppercase; color: #E31B54; font-weight: 700;
}
.cb-tl-title { margin: .35rem 0 .4rem; font-size: 1.1rem; font-weight: 650; color: var(--content-primary); }
.cb-tl-desc { margin: 0; font-size: .9rem; line-height: 1.65; color: var(--content-muted); max-width: 620px; }
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
          {eyebrow && <div className="cb-eyebrow"><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E31B54" }} />{eyebrow}</div>}
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
      <article key={f.title} className="cb-card">
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
    {phases.map((p) => (
      <div key={p.phase + p.title} className="cb-tl-item">
        <span className="cb-tl-dot" />
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
