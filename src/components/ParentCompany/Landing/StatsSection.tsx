"use client";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: "2026", label: "Year Founded", accent: false },
  { value: "4",    label: "Founders",     accent: true  },
  { value: "6",    label: "Active Units", accent: false },
  { value: "∞",    label: "Ambition",     accent: true  },
];

const TICKER_ITEMS = [
  "Mission-Critical Systems",
  "Resilient Data Infrastructure",
  "Command & Decision Platforms",
  "Operational Intelligence",
  "Coordinated Execution",
  "High-Performance Systems",
  "Built Where Failure Is Not an Option",
];

export default function StatsSection() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes statReveal {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .stats-root {
          position: relative;
          background: var(--gradient-section, #0a0a12);
          overflow: hidden;
          contain: layout style paint;
        }

        /* ── Top ticker ── */
        .stats-ticker-wrap {
          overflow: hidden;
          border-bottom: 1px dashed rgba(255,255,255,0.09);
          background: rgba(0,0,0,0.25);
        }
        :root.light .stats-ticker-wrap {
          border-bottom: 1px dashed rgba(0,0,0,0.12);
          background: rgba(0,0,0,0.04);
        }
        .stats-ticker-track {
          display: flex;
          width: max-content;
          animation: tickerScroll 34s linear infinite;
          padding: 0.7rem 0;
        }
        .stats-ticker-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 0 2.5rem;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.6rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          font-weight: 700;
          color: rgba(255,255,255,0.34);
          white-space: nowrap;
          flex-shrink: 0;
        }
        :root.light .stats-ticker-item { color: rgba(0,0,0,0.36); }
        .stats-ticker-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #E31B54;
          flex-shrink: 0;
          opacity: 0.6;
        }

        /* ── Stats bar ── */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 2px solid #E31B54;
          border-bottom: 2px solid #E31B54;
          position: relative;
        }
        @media (max-width: 767px) {
          .stats-bar {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            overflow: hidden;
          }
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.75rem 1.5rem;
          gap: 0.6rem;
          border-right: 1px dashed rgba(255,255,255,0.08);
          position: relative;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .stat-item.revealed { opacity: 1; transform: translateY(0); }
        .stat-item:last-child { border-right: none; }
        @media (max-width: 767px) {
          .stat-item {
            min-width: 0;
            padding: 1.15rem 0.45rem;
            transform: none;
            gap: 0.36rem;
          }
          .stat-val {
            font-size: clamp(0.56rem, 2.6vw, 0.72rem);
            letter-spacing: 0;
            line-height: 1;
          }
          .stat-lbl {
            font-size: 0.26rem;
            letter-spacing: 0.18em;
            line-height: 1.45;
          }
        }
        :root.light .stat-item { border-right: 1px dashed rgba(0,0,0,0.1); }
        :root.light .stat-item:last-child { border-right: none; }

        .stat-val {
          font-family: ui-monospace, Menlo, monospace;
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--content-primary, #f1f5f9);
          transition: transform 0.3s ease;
        }
        .stat-val.accent { color: #E31B54; }
        .stat-item:hover .stat-val { transform: scale(1.08); }
        .stat-lbl {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.58rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.28);
          text-align: center;
        }
        :root.light .stat-lbl { color: rgba(0,0,0,0.35); }
        :root.light .stat-val { color: #0f172a; }

        .stat-corner {
          position: absolute;
          width: 6px; height: 6px;
          border-color: rgba(227,27,84,0.4);
          border-style: solid;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .stat-item:hover .stat-corner { opacity: 1; }
        .stat-corner-tl { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
        .stat-corner-tr { top: 8px; right: 8px; border-width: 1px 1px 0 0; }
        .stat-corner-bl { bottom: 8px; left: 8px; border-width: 0 0 1px 1px; }
        .stat-corner-br { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; }

        /* Keep mobile overrides at the end so they win the cascade */
        @media (max-width: 767px) {
          .stats-root .stat-val {
            font-size: clamp(0.92rem, 4.2vw, 1.16rem) !important;
            letter-spacing: 0 !important;
            line-height: 1 !important;
          }
          .stats-root .stat-lbl {
            font-size: 0.52rem !important;
            letter-spacing: 0.18em !important;
            line-height: 1.45 !important;
          }
        }
      `}</style>

      <div id="section-stats" className="stats-root" ref={sectionRef}>
        {/* Ticker */}
        <div className="stats-ticker-wrap">
          <div className="stats-ticker-track" ref={tickerRef}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="stats-ticker-item">
                <span className="stats-ticker-dot" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="stats-bar">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`stat-item${revealed ? " revealed" : ""}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span className="stat-corner stat-corner-tl" />
              <span className="stat-corner stat-corner-tr" />
              <span className="stat-corner stat-corner-bl" />
              <span className="stat-corner stat-corner-br" />
              <span className={`stat-val${s.accent ? " accent" : ""}`}>{s.value}</span>
              <span className="stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
