"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { statements } from "@/data/information-data";

const RELEASES_HREF = "/information/newsroom/releases";
const INFO_CENTRAL_HREF = "/information";
const LATEST = statements.slice(0, 4);
const [FEATURED, ...REST] = LATEST;

const Arrow = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function ReleasesSection() {
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Make the brand-button hover ring track the cursor (matches the hero CTA).
  const handleBtnMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .releases-root {
          --accent: #E31B54;
          --rl-line: rgba(255,255,255,0.1);
          --rl-line-soft: rgba(255,255,255,0.06);
          position: relative;
          background: var(--gradient-section, #0a0a0a);
          color: var(--content-primary, #f1f5f9);
          /* horizontal gutters match HeroSection: px-8 lg:px-14 xl:px-20 */
          padding: 7rem 2rem;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          border-top: 1px dashed rgba(255,255,255,0.09);
        }
        :root.light .releases-root {
          border-top: 1px dashed rgba(0,0,0,0.12);
          --rl-line: rgba(0,0,0,0.12);
          --rl-line-soft: rgba(0,0,0,0.07);
        }
        @media(min-width:768px){ .releases-root { padding: 8rem 2rem; } }
        @media(min-width:1024px){ .releases-root { padding: 9rem 3.5rem; } }
        @media(min-width:1280px){ .releases-root { padding: 9rem 5rem; } }

        .releases-inner { position: relative; z-index: 1; width: 100%; }

        /* ── Header ── */
        .releases-head {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 3rem;
        }
        @media(min-width:768px){
          .releases-head {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            gap: 2rem;
          }
        }
        .releases-title {
          margin-top: 1rem;
          font-size: clamp(1.9rem, 4vw, 3rem);
          font-weight: 700; letter-spacing: -0.03em; line-height: 1.05;
          color: var(--content-primary, #f1f5f9);
        }
        .releases-title em { color: var(--accent); font-style: normal; font-weight: 300; }
        .releases-sub {
          margin-top: 0.9rem; max-width: 34rem;
          font-size: 0.95rem; line-height: 1.6;
          color: var(--content-secondary, rgba(255,255,255,0.5));
        }
        :root.light .releases-sub { color: rgba(0,0,0,0.55); }
        .releases-all {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding-bottom: 0.35rem;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--content-secondary, rgba(255,255,255,0.55));
          white-space: nowrap;
          border-bottom: 1px solid transparent;
          transition: color 0.2s ease, gap 0.2s ease, border-color 0.2s ease;
        }
        :root.light .releases-all { color: rgba(0,0,0,0.55); }
        .releases-all:hover { color: var(--accent); gap: 0.75rem; border-color: var(--accent); }

        /* ── Shared meta row (date · tag) ── */
        .release-meta {
          display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--content-faint, rgba(255,255,255,0.4));
        }
        :root.light .release-meta { color: rgba(0,0,0,0.45); }
        .release-tag {
          padding: 0.2rem 0.55rem;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 2px;
          background: #141414; /* onyx black */
          color: #f1f5f9;
          font-weight: 700;
          white-space: nowrap;
        }
        :root.light .release-tag { border-color: rgba(255,255,255,0.1); }

        /* ── Reveal helper (lives on WRAPPERS only, never on hover targets, so it
              never delays the hover transitions) ── */
        .rl-reveal {
          opacity: 0; transform: translateY(22px);
          transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1) var(--rl-delay, 0ms),
                      transform 0.6s cubic-bezier(0.16,1,0.3,1) var(--rl-delay, 0ms);
        }
        .releases-root.revealed .rl-reveal { opacity: 1; transform: translateY(0); }

        /* ── Featured (latest) release ── */
        .release-featured {
          display: grid; grid-template-columns: 1fr; gap: 1.5rem;
          padding: 2.5rem 0 3rem;
          text-decoration: none; position: relative;
          border-top: 1px solid var(--rl-line);
        }
        @media(min-width:900px){
          .release-featured {
            grid-template-columns: minmax(0, 0.34fr) minmax(0, 1fr);
            gap: 3.5rem; padding: 3rem 0 3.5rem; align-items: start;
          }
        }
        /* underline wipe — scaleX (GPU) instead of animating width */
        .release-featured::before {
          content: ''; position: absolute; top: -1px; left: 0; right: 0; height: 2px;
          background: var(--accent);
          transform: scaleX(0); transform-origin: left center;
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .release-featured:hover::before { transform: scaleX(1); }

        .release-featured-aside {
          display: flex; flex-direction: column; gap: 1rem;
        }
        .release-featured-index {
          font-family: ui-monospace, Menlo, monospace;
          font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 700;
          line-height: 1; letter-spacing: -0.03em;
          color: var(--content-faint, rgba(255,255,255,0.16));
        }
        :root.light .release-featured-index { color: rgba(0,0,0,0.14); }

        .release-featured-body { display: flex; flex-direction: column; gap: 1.1rem; }
        .release-featured-title {
          font-size: clamp(1.4rem, 2.6vw, 2.1rem); font-weight: 600;
          line-height: 1.22; letter-spacing: -0.02em;
          color: var(--content-primary, #f1f5f9);
          transition: color 0.2s ease;
        }
        .release-featured:hover .release-featured-title { color: var(--accent); }
        .release-featured-excerpt {
          font-size: 0.95rem; line-height: 1.7;
          color: var(--content-secondary, rgba(255,255,255,0.55));
          display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
        }
        :root.light .release-featured-excerpt { color: rgba(0,0,0,0.58); }

        .release-readmore {
          margin-top: 0.4rem;
          display: inline-flex; align-items: center; gap: 0.45rem;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.66rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--content-secondary, rgba(255,255,255,0.6));
          transition: color 0.2s ease, gap 0.2s ease;
        }
        :root.light .release-readmore { color: rgba(0,0,0,0.6); }
        .release-featured:hover .release-readmore { color: var(--accent); gap: 0.7rem; }

        /* ── List of the rest ── */
        .release-list { list-style: none; margin: 0; padding: 0; }
        .release-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1.25rem;
          padding: 1.6rem 0;
          text-decoration: none;
          position: relative;
          border-top: 1px solid var(--rl-line-soft);
          /* transform (GPU) instead of padding — snappy, no reflow, no delay */
          transition: transform 0.28s cubic-bezier(0.16,1,0.3,1);
          will-change: transform;
        }
        @media(min-width:768px){
          .release-row { grid-template-columns: 3.5rem minmax(0,1fr) auto; gap: 2rem; padding: 1.8rem 0; }
        }
        /* growing accent rail on the left on hover */
        .release-row::before {
          content: ''; position: absolute; left: -2rem; top: 0; bottom: 0; width: 2px;
          background: var(--accent); transform: scaleY(0); transform-origin: center;
          transition: transform 0.28s cubic-bezier(0.16,1,0.3,1);
        }
        .release-row:hover { transform: translateX(0.6rem); }
        .release-row:hover::before { transform: scaleY(1); }

        .release-row-index {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em;
          color: var(--content-faint, rgba(255,255,255,0.32));
          transition: color 0.18s ease;
        }
        :root.light .release-row-index { color: rgba(0,0,0,0.32); }
        .release-row:hover .release-row-index { color: var(--accent); }

        .release-row-main { display: flex; flex-direction: column; gap: 0.55rem; min-width: 0; }
        .release-row-title {
          font-size: clamp(1rem, 1.4vw, 1.18rem); font-weight: 600; line-height: 1.4;
          letter-spacing: -0.01em;
          color: var(--content-primary, #f1f5f9);
          transition: color 0.18s ease;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .release-row:hover .release-row-title { color: var(--accent); }

        .release-row-arrow {
          display: inline-flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid var(--rl-line);
          color: var(--content-secondary, rgba(255,255,255,0.5));
          flex-shrink: 0;
          transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }
        .release-row:hover .release-row-arrow {
          color: #fff; background: var(--accent); border-color: var(--accent);
        }

        /* ── Footer CTA → Information Central ── */
        .releases-more {
          display: flex; justify-content: center;
          margin-top: 3rem;
        }
        /* Brand button — forced to the DARK (onyx) variant in both themes:
           jet-black surface with a light label, like the hero's secondary CTA. */
        .releases-more-link {
          --btn-surface: #1f1f1f;
          --btn-text: rgba(255,255,255,0.7);
          --btn-text-hover: #ffffff;
          --btn-inset: rgba(255,255,255,0.28);
          --btn-line: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
          position: relative;
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 12px 22px; border: 0; border-radius: 7px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.875rem; font-weight: 500;
          letter-spacing: 0;
          background: var(--btn-surface);
          color: var(--btn-text);
          box-shadow: inset 0 0 0 1px var(--btn-inset);
          text-decoration: none;
          isolation: isolate;
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
                      box-shadow 0.35s cubic-bezier(0.22,1,0.36,1),
                      color 0.35s ease, gap 0.2s ease;
        }
        .releases-more-link::before {
          content: ''; position: absolute; width: 70%; height: 1px; bottom: 0; left: 15%;
          background: var(--btn-line); opacity: 0.2; transition: opacity 0.35s ease;
        }
        .releases-more-link::after {
          content: ''; position: absolute; inset: -1.5px; border-radius: 8.5px; padding: 1px;
          background: radial-gradient(120px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(0,255,166,0.9), rgba(255,215,0,0.7), rgba(236,72,153,0.7),
            rgba(147,51,234,0.6), rgba(59,130,246,0.5), transparent 70%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity 0.3s ease; pointer-events: none; z-index: -1;
        }
        .releases-more-link:hover {
          color: var(--btn-text-hover);
          transform: translateY(-2px);
          box-shadow: inset 0 0 0 1px var(--btn-inset), 0 6px 18px -6px rgba(0,0,0,0.45);
          gap: 0.7rem;
        }
        .releases-more-link:hover::before { opacity: 1; }
        .releases-more-link:hover::after { opacity: 1; }
      `}</style>

      <section
        id="section-releases"
        className={`releases-root${revealed ? " revealed" : ""}`}
        ref={sectionRef}
      >
        <div className="releases-inner">
          <div className="releases-head rl-reveal">
            <div>
              <h2 className="releases-title">
                Latest <em>Releases</em>
              </h2>
              <p className="releases-sub">
                Formation milestones, venture progress, governance, and compliance —
                straight from the Notus Regalia newsroom.
              </p>
            </div>
            <a className="releases-all" href={INFO_CENTRAL_HREF}>
              Information Central
              <Arrow size={14} />
            </a>
          </div>

          {/* Featured latest release */}
          {FEATURED && (
            <div className="rl-reveal" style={{ "--rl-delay": "80ms" } as React.CSSProperties}>
              <a href={RELEASES_HREF} className="release-featured">
                <div className="release-featured-aside">
                  <span className="release-featured-index">01</span>
                  <div className="release-meta">
                    <span>{FEATURED.date}</span>
                    {FEATURED.tags[0] && <span className="release-tag">{FEATURED.tags[0]}</span>}
                  </div>
                </div>
                <div className="release-featured-body">
                  <h3 className="release-featured-title">{FEATURED.title}</h3>
                  <p className="release-featured-excerpt">{FEATURED.content}</p>
                  <span className="release-readmore">
                    Read full release
                    <Arrow size={13} />
                  </span>
                </div>
              </a>
            </div>
          )}

          {/* List of the rest */}
          <ul className="release-list">
            {REST.map((s, i) => (
              <li
                key={s.id}
                className="rl-reveal"
                style={{ "--rl-delay": `${160 + i * 80}ms` } as React.CSSProperties}
              >
                <a href={RELEASES_HREF} className="release-row">
                  <span className="release-row-index">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                  <div className="release-row-main">
                    <div className="release-meta">
                      <span>{s.date}</span>
                      {s.tags[0] && <span className="release-tag">{s.tags[0]}</span>}
                    </div>
                    <h4 className="release-row-title">{s.title}</h4>
                  </div>
                  <span className="release-row-arrow">
                    <Arrow size={15} />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* For more → Information Central */}
          <div className="releases-more rl-reveal" style={{ "--rl-delay": "420ms" } as React.CSSProperties}>
            <a className="releases-more-link" href={INFO_CENTRAL_HREF} onMouseMove={handleBtnMouseMove}>
              Explore more in Information Central
              <Arrow size={14} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
