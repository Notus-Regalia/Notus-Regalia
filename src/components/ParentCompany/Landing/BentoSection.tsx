"use client";

import { useEffect, useRef, useState } from "react";

type BentoCard = {
  kicker: string;
  title: string;
  description: string;
  layout: "primary" | "spotlight" | "secondary-a" | "secondary-b" | "secondary-c" | "wide";
};

const BENTO_CARDS: BentoCard[] = [
  {
    kicker: "Software Architecture",
    title: "Mission-Critical Software Systems",
    description:
      "Resilient software architecture built for continuity, security, and disciplined recovery in high-stakes environments.",
    layout: "primary",
  },
  {
    kicker: "Autonomous Operations",
    title: "AI That Elevates Human Operators",
    description:
      "Adaptive automation that handles repetitive load, proposes actions, and keeps supervisors in command of every decision path.",
    layout: "spotlight",
  },
  {
    kicker: "Intelligence Fusion",
    title: "Intelligence Processing & Data Analytics",
    description:
      "Decision-ready intelligence from fragmented signals through structured fusion, confidence scoring, and clear reporting.",
    layout: "secondary-a",
  },
  {
    kicker: "Command Surfaces",
    title: "Operational Platforms",
    description:
      "Command surfaces that keep teams synchronized across incidents, escalations, and strategic operations.",
    layout: "secondary-b",
  },
  {
    kicker: "Precision Fabrication",
    title: "Advanced Systems Manufacturing",
    description:
      "Specialized hardware and sensor systems engineered for precision, reliability, and sustained field performance.",
    layout: "secondary-c",
  },
  {
    kicker: "Edge Control",
    title: "Robotics & Embedded Systems",
    description:
      "Edge-ready robotic and embedded platforms that unify sensing, software, and control loops into one stack.",
    layout: "wide",
  },
];

export default function WhatWeDoBentoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const traceTargetRef = useRef({ x: 50, y: 50 });
  const traceCurrentRef = useRef({ x: 50, y: 50 });
  const traceActiveRef = useRef(false);
  const traceRafRef = useRef<number | null>(null);

  const setTraceTargetFromPointer = (clientX: number, clientY: number) => {
    const grid = gridRef.current;
    if (!grid) return;

    const rect = grid.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);

    traceTargetRef.current = {
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    };
  };

  const setTraceActive = (active: boolean) => {
    const grid = gridRef.current;
    if (!grid) return;

    traceActiveRef.current = active;
    grid.style.setProperty("--ww-trace-opacity", active ? "1" : "0");
    grid.style.setProperty("--ww-trace-border-opacity", active ? "1" : "0");
  };

  const animateTrace = () => {
    const grid = gridRef.current;
    if (!grid) {
      traceRafRef.current = null;
      return;
    }

    const current = traceCurrentRef.current;
    const target = traceTargetRef.current;

    // Lerp keeps pointer tracking smooth while avoiding jitter over child nodes.
    const easing = 0.22;
    current.x += (target.x - current.x) * easing;
    current.y += (target.y - current.y) * easing;

    grid.style.setProperty("--ww-trace-x", `${current.x.toFixed(2)}%`);
    grid.style.setProperty("--ww-trace-y", `${current.y.toFixed(2)}%`);

    const dx = Math.abs(target.x - current.x);
    const dy = Math.abs(target.y - current.y);
    if (traceActiveRef.current || dx > 0.02 || dy > 0.02) {
      traceRafRef.current = requestAnimationFrame(animateTrace);
      return;
    }

    traceRafRef.current = null;
  };

  const ensureTraceAnimation = () => {
    if (traceRafRef.current !== null) return;
    traceRafRef.current = requestAnimationFrame(animateTrace);
  };

  const handleGridPointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    setTraceTargetFromPointer(event.clientX, event.clientY);
    setTraceActive(true);
    ensureTraceAnimation();
  };

  const handleGridPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    setTraceTargetFromPointer(event.clientX, event.clientY);
    if (!traceActiveRef.current) setTraceActive(true);
    ensureTraceAnimation();
  };

  const handleGridPointerLeave = () => {
    setTraceActive(false);
  };

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

  useEffect(() => {
    return () => {
      if (traceRafRef.current !== null) {
        cancelAnimationFrame(traceRafRef.current);
      }
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .whatwedo-root {
          --site-gutter-inline: 2rem;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background:
            radial-gradient(68% 72% at 82% 8%, rgba(255, 255, 255, 0.07), transparent 62%),
            radial-gradient(74% 86% at 69% 30%, rgba(148, 163, 184, 0.08), transparent 68%),
            #020205;
        }

        @media (min-width: 640px) { .whatwedo-root { --site-gutter-inline: 4rem; } }
        @media (min-width: 768px) { .whatwedo-root { --site-gutter-inline: 6rem; } }
        @media (min-width: 1280px) { .whatwedo-root { --site-gutter-inline: 8rem; } }
        @media (min-width: 1536px) { .whatwedo-root { --site-gutter-inline: 12rem; } }

        :root.light .whatwedo-root {
          border-top: 1px solid rgba(15, 23, 42, 0.12);
          border-bottom: 1px solid rgba(15, 23, 42, 0.1);
          background:
            radial-gradient(68% 72% at 82% 8%, rgba(15, 23, 42, 0.07), transparent 62%),
            radial-gradient(74% 86% at 69% 30%, rgba(148, 163, 184, 0.12), transparent 68%),
            var(--surface-primary, #ffffff);
        }

        .whatwedo-shell {
          position: relative;
          z-index: 2;
          padding: clamp(6.1rem, 8.8vw, 8.6rem) var(--site-gutter-inline) clamp(4.8rem, 7vw, 7.1rem);
        }

        .whatwedo-header {
          max-width: min(64rem, 100%);
          margin: 0 0 clamp(2.1rem, 3vw, 3rem);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.64s cubic-bezier(0.2, 1, 0.3, 1), transform 0.64s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .whatwedo-root.revealed .whatwedo-header {
          opacity: 1;
          transform: translateY(0);
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
          width: 68px;
          height: 1px;
          border-radius: 999px;
          margin: 1rem 0 0;
          background: linear-gradient(90deg, rgba(227, 27, 84, 0.94), rgba(227, 27, 84, 0.1));
        }

        :root.light .whatwedo-title {
          color: rgba(15, 23, 42, 0.92);
        }

        :root.light .whatwedo-subtitle {
          color: rgba(30, 41, 59, 0.62);
        }

        :root.light .whatwedo-rule {
          background: linear-gradient(90deg, rgba(227, 27, 84, 0.86), rgba(227, 27, 84, 0.12));
        }

        .ww-bento-grid {
          --ww-trace-x: 50%;
          --ww-trace-y: 50%;
          --ww-trace-opacity: 0;
          --ww-trace-border-opacity: 0;
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-auto-rows: minmax(24rem, auto);
          gap: 1px;
          position: relative;
          background-color: rgba(255, 255, 255, 0.12);
          background-image:
            radial-gradient(
              245px circle at var(--ww-trace-x) var(--ww-trace-y),
              rgba(0, 231, 255, calc(var(--ww-trace-opacity) * 0.95)) 0%,
              rgba(58, 255, 141, calc(var(--ww-trace-opacity) * 0.9)) 23%,
              rgba(255, 230, 0, calc(var(--ww-trace-opacity) * 0.72)) 40%,
              rgba(255, 122, 24, calc(var(--ww-trace-opacity) * 0.52)) 56%,
              rgba(194, 77, 255, calc(var(--ww-trace-opacity) * 0.34)) 78%,
              transparent 93%
            ),
            radial-gradient(
              430px circle at var(--ww-trace-x) var(--ww-trace-y),
              rgba(0, 231, 255, calc(var(--ww-trace-opacity) * 0.22)) 0%,
              rgba(77, 99, 255, calc(var(--ww-trace-opacity) * 0.14)) 56%,
              transparent 90%
            );
          background-repeat: no-repeat;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-image-source: radial-gradient(
            360px circle at var(--ww-trace-x) var(--ww-trace-y),
            rgba(255, 255, 255, calc(var(--ww-trace-border-opacity) * 1)) 0%,
            rgba(0, 231, 255, calc(var(--ww-trace-border-opacity) * 0.98)) 18%,
            rgba(58, 255, 141, calc(var(--ww-trace-border-opacity) * 0.86)) 35%,
            rgba(255, 230, 0, calc(var(--ww-trace-border-opacity) * 0.68)) 52%,
            rgba(255, 122, 24, calc(var(--ww-trace-border-opacity) * 0.5)) 66%,
            rgba(194, 77, 255, calc(var(--ww-trace-border-opacity) * 0.34)) 84%,
            rgba(255, 255, 255, 0.12) 100%
          );
          border-image-slice: 1;
          overflow: visible;
          isolation: isolate;
          transition: none;
        }

        .ww-bento-grid::before {
          content: none;
        }

        .ww-card {
          --ww-card-bg: linear-gradient(140deg, rgba(10, 13, 22, 1), rgba(4, 5, 9, 1));
          position: relative;
          z-index: 1;
          margin: 0;
          border: 0;
          min-height: 24rem;
          overflow: visible;
          opacity: 0;
          transform: translateY(18px);
          transition: transform 0.32s ease, opacity 0.52s ease;
        }

        .ww-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--ww-card-bg);
          pointer-events: none;
          z-index: 0;
        }

        .whatwedo-root.revealed .ww-card {
          opacity: 1;
          transform: translateY(0);
        }

        .whatwedo-root.revealed .ww-card:nth-child(1) { transition-delay: 70ms; }
        .whatwedo-root.revealed .ww-card:nth-child(2) { transition-delay: 110ms; }
        .whatwedo-root.revealed .ww-card:nth-child(3) { transition-delay: 150ms; }
        .whatwedo-root.revealed .ww-card:nth-child(4) { transition-delay: 190ms; }
        .whatwedo-root.revealed .ww-card:nth-child(5) { transition-delay: 230ms; }
        .whatwedo-root.revealed .ww-card:nth-child(6) { transition-delay: 270ms; }

        .ww-card-content {
          padding: clamp(1.45rem, 2.3vw, 2.25rem);
          width: 100%;
          max-width: none;
          position: relative;
          z-index: 2;
        }

        .ww-card-cta {
          position: absolute;
          right: clamp(0.8rem, 1.4vw, 1.25rem);
          bottom: clamp(0.8rem, 1.4vw, 1.25rem);
          z-index: 3;
          width: 2rem;
          height: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(8, 11, 18, 0.62);
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          line-height: 1;
          cursor: pointer;
          transition: border-color 180ms ease, color 180ms ease, background 180ms ease;
        }

        .ww-card-cta:hover {
          border-color: rgba(255, 255, 255, 0.5);
          color: rgba(255, 255, 255, 1);
          background: rgba(12, 16, 25, 0.84);
        }

        .ww-card-kicker {
          display: inline-flex;
          margin-bottom: 0.82rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: clamp(0.68rem, 0.74vw, 0.78rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.44);
        }

        .ww-card h3 {
          margin: 0;
          font-size: clamp(1.24rem, 1.9vw, 1.72rem);
          line-height: 1.26;
          letter-spacing: -0.015em;
          color: rgba(255, 255, 255, 0.95);
          max-width: none;
        }

        .ww-card p {
          margin: 1rem 0 0;
          font-size: clamp(1.02rem, 1.12vw, 1.14rem);
          line-height: 1.74;
          color: rgba(255, 255, 255, 0.62);
          max-width: none;
        }

        :root.light .ww-card-kicker {
          color: rgba(30, 41, 59, 0.52);
        }

        :root.light .ww-card {
          --ww-card-bg: linear-gradient(145deg, rgba(255, 255, 255, 0.84), rgba(245, 248, 255, 0.84));
        }

        :root.light .ww-bento-grid {
          background-color: rgba(15, 23, 42, 0.14);
          background-image:
            radial-gradient(
              245px circle at var(--ww-trace-x) var(--ww-trace-y),
              rgba(14, 116, 144, calc(var(--ww-trace-opacity) * 0.4)) 0%,
              rgba(59, 130, 246, calc(var(--ww-trace-opacity) * 0.3)) 52%,
              transparent 90%
            ),
            radial-gradient(
              430px circle at var(--ww-trace-x) var(--ww-trace-y),
              rgba(14, 116, 144, calc(var(--ww-trace-opacity) * 0.18)) 0%,
              transparent 86%
            );
          border-color: rgba(15, 23, 42, 0.14);
          border-image-source: radial-gradient(
            360px circle at var(--ww-trace-x) var(--ww-trace-y),
            rgba(14, 116, 144, calc(var(--ww-trace-border-opacity) * 0.58)) 0%,
            rgba(59, 130, 246, calc(var(--ww-trace-border-opacity) * 0.42)) 56%,
            rgba(15, 23, 42, 0.14) 100%
          );
        }

        :root.light .ww-card h3 {
          color: rgba(15, 23, 42, 0.92);
        }

        :root.light .ww-card p {
          color: rgba(51, 65, 85, 0.76);
        }

        :root.light .ww-card-cta {
          border-color: rgba(15, 23, 42, 0.24);
          background: rgba(255, 255, 255, 0.78);
          color: rgba(15, 23, 42, 0.88);
        }

        :root.light .ww-card-cta:hover {
          border-color: rgba(15, 23, 42, 0.42);
          background: rgba(255, 255, 255, 0.92);
        }

        .ww-primary,
        .ww-spotlight,
        .ww-secondary-a,
        .ww-secondary-b,
        .ww-secondary-c,
        .ww-wide {
          grid-column: span 1;
          min-height: clamp(24rem, 30vw, 28.5rem);
          padding-bottom: clamp(3rem, 4vw, 4rem);
        }

        @media (max-width: 639px) {
          .whatwedo-root {
            --site-gutter-inline: 1.25rem;
          }

          .whatwedo-shell {
            padding-top: 4.8rem;
            padding-bottom: 4.1rem;
          }

          .whatwedo-header {
            margin-bottom: 1.4rem;
          }

          .whatwedo-title {
            font-size: clamp(1.24rem, 6.4vw, 1.68rem);
          }

          .whatwedo-rule {
            margin: 1rem 0 0;
          }

          .ww-bento-grid {
            grid-template-columns: 1fr;
          }

          .ww-card,
          .ww-primary,
          .ww-spotlight,
          .ww-secondary-a,
          .ww-secondary-b,
          .ww-secondary-c,
          .ww-wide {
            grid-column: 1 / -1;
            min-height: 16.4rem;
          }

          .ww-spotlight {
            min-height: 21rem;
          }

          .ww-card h3 {
            font-size: 1.12rem;
          }

          .ww-card p {
            margin-top: 0.74rem;
            font-size: 0.98rem;
            line-height: 1.66;
          }

          .ww-card-kicker {
            margin-bottom: 0.58rem;
            font-size: 0.62rem;
            letter-spacing: 0.2em;
          }

          .ww-card-content {
            padding: 1.12rem;
          }

          .ww-card-cta {
            right: 0.72rem;
            bottom: 0.72rem;
            width: 1.9rem;
            height: 1.9rem;
            font-size: 0.92rem;
          }
        }
      `}</style>

      <section id="what-we-do" className={`whatwedo-root${revealed ? " revealed" : ""}`} ref={sectionRef}>
        <div className="whatwedo-shell">
          <header className="whatwedo-header">
            <h2 className="whatwedo-title">What We Engineer.</h2>
            <p className="whatwedo-subtitle">
              Systems Engineered for High-Stakes Operations.
            </p>
            <div className="whatwedo-rule" />
          </header>

          <div
            className="ww-bento-grid"
            ref={gridRef}
            onPointerEnter={handleGridPointerEnter}
            onPointerMove={handleGridPointerMove}
            onPointerMoveCapture={handleGridPointerMove}
            onPointerLeave={handleGridPointerLeave}
          >
            {BENTO_CARDS.map((card) => (
              <article key={card.title} className={`ww-card ww-${card.layout}`}>
                <div className="ww-card-content">
                  <span className="ww-card-kicker">{card.kicker}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <button className="ww-card-cta" type="button" aria-label={`Open ${card.title}`}>
                  <i className="bi bi-arrow-up-right-square" aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
