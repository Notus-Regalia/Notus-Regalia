"use client";

import { useEffect, useRef, useState } from "react";

type Capability = {
  icon: string;       // bootstrap-icons class
  badge: string;
  title: string;
  description: string;
};

const CAPABILITIES: Capability[] = [
  {
    icon: "bi-diagram-3",
    badge: "Software Architecture",
    title: "Mission-Critical Software Systems",
    description:
      "Resilient software architecture built for continuity, security, and disciplined recovery in high-stakes environments.",
  },
  {
    icon: "bi-cpu",
    badge: "Autonomous Operations",
    title: "AI That Elevates Human Operators",
    description:
      "Adaptive automation that handles repetitive load, proposes actions, and keeps supervisors in command of every decision path.",
  },
  {
    icon: "bi-graph-up-arrow",
    badge: "Intelligence Fusion",
    title: "Intelligence Processing & Data Analytics",
    description:
      "Decision-ready intelligence from fragmented signals through structured fusion, confidence scoring, and clear reporting.",
  },
  {
    icon: "bi-grid-1x2",
    badge: "Command Surfaces",
    title: "Operational Platforms",
    description:
      "Command surfaces that keep teams synchronized across incidents, escalations, and strategic operations.",
  },
  {
    icon: "bi-gear-wide-connected",
    badge: "Precision Fabrication",
    title: "Advanced Systems Manufacturing",
    description:
      "Specialized hardware and sensor systems engineered for precision, reliability, and sustained field performance.",
  },
  {
    icon: "bi-robot",
    badge: "Edge Control",
    title: "Robotics & Embedded Systems",
    description:
      "Edge-ready robotic and embedded platforms that unify sensing, software, and control loops into one stack.",
  },
];

export default function WhatWeDoBentoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style jsx>{`
        .whatwedo-root {
          --site-gutter-inline: 2rem;
          /* This section is ALWAYS dark — pin dark-theme tokens locally so the
             light theme never affects it. */
          --surface-card: #0f0f0f;
          --content-primary: #ffffff;
          --content-secondary: #d4d4d4;
          --content-tertiary: #a3a3a3;
          --content-muted: rgb(163, 163, 163);
          --content-faint: rgba(255, 255, 255, 0.6);
          --border-color: rgba(255, 255, 255, 0.1);
          --hover-bg: rgba(255, 255, 255, 0.05);
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background-color: #040507;
          color: #ffffff;
        }
        @media (min-width: 640px) { .whatwedo-root { --site-gutter-inline: 4rem; } }
        @media (min-width: 768px) { .whatwedo-root { --site-gutter-inline: 6rem; } }
        @media (min-width: 1280px) { .whatwedo-root { --site-gutter-inline: 8rem; } }
        @media (min-width: 1536px) { .whatwedo-root { --site-gutter-inline: 12rem; } }

        /* Engineered-grid backdrop — matches the Industries We Serve section */
        .whatwedo-root::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.12) 0 1px, transparent 1px 112px),
            repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.12) 0 1px, transparent 1px 112px),
            repeating-linear-gradient(45deg, transparent 0 38px, rgba(255, 255, 255, 0.04) 38px 40px, transparent 40px 78px),
            repeating-linear-gradient(-45deg, transparent 0 38px, rgba(255, 255, 255, 0.04) 38px 40px, transparent 40px 78px),
            radial-gradient(circle, rgba(255, 255, 255, 0.84) 0 1.4px, transparent 1.5px);
          background-size: 112px 112px, 112px 112px, 112px 112px, 112px 112px, 112px 112px;
          background-position: center;
          opacity: 0.52;
        }
        .whatwedo-root::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(circle at center, transparent 22%, rgba(0, 0, 0, 0.34) 100%),
            linear-gradient(180deg, rgba(0, 0, 0, 0.16) 0%, rgba(0, 0, 0, 0.48) 100%);
        }
        .whatwedo-shell {
          position: relative;
          z-index: 2;
          padding: clamp(6.1rem, 8.8vw, 8.6rem) var(--site-gutter-inline) clamp(7rem, 10vw, 10.5rem);
        }

        .whatwedo-header {
          max-width: min(64rem, 100%);
          margin: 0 0 clamp(2.4rem, 3.4vw, 3.4rem);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.64s cubic-bezier(0.2, 1, 0.3, 1), transform 0.64s cubic-bezier(0.2, 1, 0.3, 1);
        }
        .whatwedo-root.revealed .whatwedo-header { opacity: 1; transform: translateY(0); }

        .whatwedo-eyebrow {
          margin: 0 0 0.9rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.7rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.42);
        }
        .whatwedo-title {
          margin: 0 0 0.86rem;
          width: 100%;
          font-size: clamp(1.4rem, 3.5vw, 2.72rem);
          line-height: 1.15;
          letter-spacing: -0.025em;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
        }
        .whatwedo-subtitle {
          margin: 0;
          max-width: 60ch;
          font-size: clamp(0.97rem, 1.18vw, 1.06rem);
          line-height: 1.66;
          color: rgba(255, 255, 255, 0.64);
        }
        .whatwedo-rule {
          width: 68px; height: 1px; border-radius: 999px; margin: 1rem 0 0;
          background: linear-gradient(90deg, rgba(227, 27, 84, 0.94), rgba(227, 27, 84, 0.1));
        }

        /* ── Capability grid (dark-grid design) ── */
        .cap-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.35rem;
        }
        @media (min-width: 640px) { .cap-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .cap-grid { grid-template-columns: repeat(3, 1fr); } }

        .cap-card {
          position: relative;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: linear-gradient(to bottom, var(--surface-card, rgba(12, 12, 16, 0.6)), transparent);
          overflow: visible;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.55s cubic-bezier(0.2, 1, 0.3, 1) calc(var(--i) * 70ms),
            transform 0.55s cubic-bezier(0.2, 1, 0.3, 1) calc(var(--i) * 70ms),
            border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .whatwedo-root.revealed .cap-card { opacity: 1; transform: translateY(0); }
        .cap-card:hover {
          border-color: var(--content-faint);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 0 36px rgba(255, 255, 255, 0.045);
        }

        /* white corner squares — outside the card, appear on hover */
        .cap-corner {
          position: absolute;
          width: 11px; height: 11px;
          background: var(--content-primary);
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .cap-card:hover .cap-corner { opacity: 1; }
        .cap-corner.tl { left: -6px; top: -6px; }
        .cap-corner.tr { right: -6px; top: -6px; }
        .cap-corner.bl { left: -6px; bottom: -6px; }
        .cap-corner.br { right: -6px; bottom: -6px; }

        .cap-head {
          position: relative; z-index: 1;
          display: flex; align-items: flex-start; gap: 1rem;
          padding: 2rem 2rem 0;
        }
        .cap-icon {
          display: flex; align-items: center; justify-content: center;
          width: 54px; height: 54px; flex-shrink: 0;
          border-radius: 13px;
          border: 1px solid var(--border-color);
          background: var(--hover-bg);
          color: var(--content-secondary);
        }
        .cap-icon i { font-size: 1.45rem; }
        .cap-titlerow { display: flex; flex-direction: column; align-items: flex-start; gap: 0.55rem; }
        .cap-title { margin: 0; font-size: 1.05rem; font-weight: 500; line-height: 1.3; color: var(--content-primary); }
        .cap-badge {
          align-self: flex-start;
          border: 1px solid var(--border-color); border-radius: 999px;
          padding: 2px 8px; font-size: 0.58rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--content-tertiary); white-space: nowrap;
        }
        .cap-desc {
          position: relative; z-index: 1;
          margin: 0; padding: 1.15rem 2rem 2rem;
          font-size: 0.875rem; line-height: 1.66; color: var(--content-muted);
        }

        @media (prefers-reduced-motion: reduce) {
          .cap-card, .whatwedo-header { transition: none; }
        }
      `}</style>

      <section id="what-we-do" className={`whatwedo-root${revealed ? " revealed" : ""}`} ref={sectionRef}>
        <div className="whatwedo-shell">
          <header className="whatwedo-header">
            <h2 className="whatwedo-title">What We Engineer.</h2>
            <p className="whatwedo-subtitle">Systems Engineered for High-Stakes Operations.</p>
            <div className="whatwedo-rule" />
          </header>

          <div className="cap-grid">
            {CAPABILITIES.map((cap, i) => (
              <article key={cap.title} className="cap-card" style={{ "--i": i } as React.CSSProperties}>
                <span className="cap-corner tl" aria-hidden />
                <span className="cap-corner tr" aria-hidden />
                <span className="cap-corner bl" aria-hidden />
                <span className="cap-corner br" aria-hidden />

                <div className="cap-head">
                  <div className="cap-icon">
                    <i className={`bi ${cap.icon}`} aria-hidden="true" />
                  </div>
                  <div className="cap-titlerow">
                    <h3 className="cap-title">{cap.title}</h3>
                    <span className="cap-badge">{cap.badge}</span>
                  </div>
                </div>

                <p className="cap-desc">{cap.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
