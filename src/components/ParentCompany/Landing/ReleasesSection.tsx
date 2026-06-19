"use client";
import { useEffect, useRef, useState } from "react";
import { statements } from "@/data/information-data";

const RELEASES_HREF = "/information/newsroom/releases";
const LATEST = statements.slice(0, 3);

export default function ReleasesSection() {
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .releases-root {
          --accent: #E31B54;
          position: relative;
          background: var(--gradient-section, #0a0a0a);
          color: var(--content-primary, #f1f5f9);
          /* horizontal gutters match HeroSection: px-8 lg:px-14 xl:px-20 */
          padding: 7rem 2rem;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          border-top: 1px dashed rgba(255,255,255,0.09);
        }
        :root.light .releases-root { border-top: 1px dashed rgba(0,0,0,0.12); }
        @media(min-width:768px){ .releases-root { padding: 8rem 2rem; } }
        @media(min-width:1024px){ .releases-root { padding: 8rem 3.5rem; } }
        @media(min-width:1280px){ .releases-root { padding: 8rem 5rem; } }

        .releases-inner { position: relative; z-index: 1; width: 100%; }

        /* ── Header ── */
        .releases-head {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 3.5rem;
        }
        @media(min-width:768px){
          .releases-head {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            gap: 2rem;
          }
        }
        .releases-eyebrow {
          display: inline-flex; align-items: center; gap: 0.65rem;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.62rem; font-weight: 700;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: var(--accent);
        }
        .releases-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent); flex-shrink: 0;
        }
        .releases-title {
          margin-top: 1rem;
          font-size: clamp(1.9rem, 4vw, 3rem);
          font-weight: 700; letter-spacing: -0.03em; line-height: 1.05;
          color: var(--content-primary, #f1f5f9);
        }
        .releases-title em { color: var(--accent); font-style: normal; font-weight: 300; }
        .releases-all {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--content-secondary, rgba(255,255,255,0.55));
          white-space: nowrap;
          transition: color 0.2s ease, gap 0.2s ease;
        }
        :root.light .releases-all { color: rgba(0,0,0,0.55); }
        .releases-all:hover { color: var(--accent); gap: 0.75rem; }

        /* ── Grid of cards ── */
        .releases-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
        }
        :root.light .releases-grid {
          background: rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.1);
        }
        @media(min-width:900px){ .releases-grid { grid-template-columns: repeat(3, 1fr); } }

        .release-card {
          display: flex; flex-direction: column;
          gap: 1.25rem;
          padding: 2.25rem;
          background: var(--gradient-section, #0a0a0a);
          text-decoration: none;
          position: relative;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1),
                      transform 0.6s cubic-bezier(0.16,1,0.3,1),
                      background 0.3s ease;
        }
        .releases-root.revealed .release-card { opacity: 1; transform: translateY(0); }
        .release-card:hover { background: rgba(255,255,255,0.02); }
        :root.light .release-card:hover { background: rgba(0,0,0,0.02); }

        /* top accent line on hover */
        .release-card::before {
          content: ''; position: absolute; top: -1px; left: 0; right: 0; height: 2px;
          background: var(--accent); opacity: 0;
          transition: opacity 0.3s ease;
        }
        .release-card:hover::before { opacity: 1; }

        .release-meta {
          display: flex; align-items: center; gap: 0.85rem;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--content-faint, rgba(255,255,255,0.4));
        }
        :root.light .release-meta { color: rgba(0,0,0,0.45); }
        .release-tag {
          padding: 0.2rem 0.55rem;
          border: 1px solid rgba(227,27,84,0.35);
          border-radius: 2px;
          color: var(--accent);
          font-weight: 700;
          white-space: nowrap;
        }

        .release-card-title {
          font-size: 1.05rem; font-weight: 600; line-height: 1.35;
          letter-spacing: -0.01em;
          color: var(--content-primary, #f1f5f9);
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .release-excerpt {
          font-size: 0.875rem; line-height: 1.6;
          color: var(--content-secondary, rgba(255,255,255,0.5));
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        :root.light .release-excerpt { color: rgba(0,0,0,0.55); }

        .release-readmore {
          margin-top: auto;
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.64rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--content-secondary, rgba(255,255,255,0.55));
          transition: color 0.2s ease, gap 0.2s ease;
        }
        :root.light .release-readmore { color: rgba(0,0,0,0.55); }
        .release-card:hover .release-readmore { color: var(--accent); gap: 0.7rem; }
      `}</style>

      <section
        id="section-releases"
        className={`releases-root${revealed ? " revealed" : ""}`}
        ref={sectionRef}
      >
        <div className="releases-inner">
          <div className="releases-head">
            <div>
              <span className="releases-eyebrow">
                <span className="releases-eyebrow-dot" />
                Newsroom
              </span>
              <h2 className="releases-title">
                Latest <em>Releases</em>
              </h2>
            </div>
            <a className="releases-all" href={RELEASES_HREF}>
              All Releases
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          <div className="releases-grid">
            {LATEST.map((s, i) => (
              <a
                key={s.id}
                href={RELEASES_HREF}
                className="release-card"
                style={{ transitionDelay: `${i * 110}ms` }}
              >
                <div className="release-meta">
                  <span>{s.date}</span>
                  {s.tags[0] && <span className="release-tag">{s.tags[0]}</span>}
                </div>
                <h3 className="release-card-title">{s.title}</h3>
                <p className="release-excerpt">{s.content}</p>
                <span className="release-readmore">
                  Read
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
