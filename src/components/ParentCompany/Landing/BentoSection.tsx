"use client";

import { useEffect, useRef, useState } from "react";

type BentoCard = {
  title: string;
  description: string;
};

const BENTO_CARDS: BentoCard[] = [
  {
    title: "Mission-Critical Software Systems",
    description:
      "Resilient software architecture built for continuity, security, and disciplined recovery in high-stakes environments.",
  },
  {
    title: "Intelligence Processing & Data Analytics",
    description:
      "Decision-ready intelligence from fragmented signals through structured fusion, confidence scoring, and clear reporting.",
  },
  {
    title: "Artificial Intelligence & Automation",
    description:
      "Adaptive AI agents that accelerate recurring workflows while preserving strong operator-level control.",
  },
  {
    title: "Operational Platforms",
    description:
      "Command surfaces that keep teams synchronized across incidents, escalations, and strategic operations.",
  },
  {
    title: "Advanced Systems Manufacturing",
    description:
      "Specialized hardware and sensor systems engineered for precision, reliability, and sustained field performance.",
  },
  {
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
      <style>{`
        .whatwedo-root {
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: #000000;
        }

        :root.light .whatwedo-root {
          border-top: 1px solid rgba(15, 23, 42, 0.1);
          background:
            radial-gradient(130% 120% at 84% 4%, rgba(227, 27, 84, 0.1), transparent 54%),
            radial-gradient(120% 120% at -6% 108%, rgba(2, 132, 199, 0.08), transparent 58%),
            var(--surface-primary, #ffffff);
        }

        .whatwedo-shell {
          position: relative;
          z-index: 2;
          padding: 5.6rem 2rem 4.6rem;
        }

        @media (min-width: 640px) {
          .whatwedo-shell { padding: 5.9rem 3.8rem 4.8rem; }
        }

        @media (min-width: 768px) {
          .whatwedo-shell { padding: 6.2rem 5.2rem 5rem; }
        }

        @media (min-width: 1280px) {
          .whatwedo-shell { padding: 6.4rem 6.2rem 5.2rem; }
        }

        @media (min-width: 1536px) {
          .whatwedo-shell { padding: 6.6rem 7.8rem 5.4rem; }
        }

        .whatwedo-header {
          max-width: min(1280px, 100%);
          margin: 0 auto 2.2rem;
          padding-inline: clamp(0.4rem, 1.6vw, 1.2rem);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.64s cubic-bezier(0.2, 1, 0.3, 1), transform 0.64s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .whatwedo-root.revealed .whatwedo-header {
          opacity: 1;
          transform: translateY(0);
        }

        .whatwedo-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.48rem;
          margin-bottom: 0.78rem;
          font-size: 0.7rem;
          letter-spacing: 0.21em;
          text-transform: uppercase;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          color: rgba(227, 27, 84, 0.9);
        }

        .whatwedo-title {
          margin: 0 0 0.96rem;
          width: 100%;
          font-size: clamp(1.4rem, 3.2vw, 2.85rem);
          line-height: 1.15;
          letter-spacing: -0.02em;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
        }

        .whatwedo-subtitle {
          margin: 0;
          max-width: 900px;
          font-size: clamp(0.98rem, 1.2vw, 1.08rem);
          line-height: 1.76;
          color: rgba(255, 255, 255, 0.58);
        }

        .whatwedo-rule {
          width: 56px;
          height: 2px;
          border-radius: 999px;
          margin: 1.25rem auto 0;
          background: linear-gradient(90deg, rgba(227, 27, 84, 0.96), rgba(227, 27, 84, 0.18));
        }

        :root.light .whatwedo-title {
          color: rgba(15, 23, 42, 0.92);
        }

        :root.light .whatwedo-subtitle {
          color: rgba(30, 41, 59, 0.62);
        }

        .ww-bento-grid {
          max-width: 1180px;
          width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-auto-rows: minmax(188px, auto);
          gap: 1rem;
        }

        .ww-card {
          grid-column: span 4;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background:
            radial-gradient(110% 100% at 16% 0%, rgba(255, 255, 255, 0.08), transparent 54%),
            linear-gradient(145deg, rgba(12, 13, 18, 0.95), rgba(7, 9, 12, 0.95));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 18px 34px rgba(0, 0, 0, 0.34);
          padding: 1.4rem 1.35rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0.9rem;
          opacity: 0;
          transform: translateY(16px);
          transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease, opacity 0.44s ease;
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

        .ww-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.24);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 22px 38px rgba(0, 0, 0, 0.44);
        }

        .ww-card:nth-child(1) {
          grid-column: span 6;
          min-height: 252px;
        }

        .ww-card:nth-child(2),
        .ww-card:nth-child(3) {
          grid-column: span 3;
        }

        .ww-card:nth-child(4),
        .ww-card:nth-child(5),
        .ww-card:nth-child(6) {
          grid-column: span 4;
        }

        .ww-card h3 {
          margin: 0;
          font-size: clamp(1.04rem, 1.22vw, 1.24rem);
          line-height: 1.32;
          letter-spacing: -0.01em;
          color: rgba(255, 255, 255, 0.95);
        }

        .ww-card p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.68;
          color: rgba(255, 255, 255, 0.62);
        }

        :root.light .ww-card {
          border-color: rgba(15, 23, 42, 0.12);
          background:
            radial-gradient(110% 100% at 16% 0%, rgba(255, 255, 255, 0.66), transparent 54%),
            linear-gradient(145deg, #ffffff, #f7fafc);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.76),
            0 14px 26px rgba(15, 23, 42, 0.13);
        }

        :root.light .ww-card:hover {
          border-color: rgba(15, 23, 42, 0.24);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.86),
            0 16px 30px rgba(15, 23, 42, 0.17);
        }

        :root.light .ww-card h3 {
          color: rgba(15, 23, 42, 0.92);
        }

        :root.light .ww-card p {
          color: rgba(51, 65, 85, 0.72);
        }

        @media (max-width: 1180px) {
          .ww-bento-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 0.9rem;
          }

          .ww-card {
            grid-column: span 3;
          }

          .ww-card:nth-child(1) {
            grid-column: span 6;
          }

          .ww-card:nth-child(2),
          .ww-card:nth-child(3) {
            grid-column: span 3;
          }

          .ww-card:nth-child(4),
          .ww-card:nth-child(5),
          .ww-card:nth-child(6) {
            grid-column: span 2;
          }
        }

        @media (max-width: 980px) {
          .ww-bento-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.78rem;
          }

          .ww-card,
          .ww-card:nth-child(1),
          .ww-card:nth-child(2),
          .ww-card:nth-child(3),
          .ww-card:nth-child(4),
          .ww-card:nth-child(5),
          .ww-card:nth-child(6) {
            grid-column: span 1;
            min-height: 214px;
          }

          .ww-card:nth-child(1) {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 640px) {
          .whatwedo-shell {
            padding: 4.6rem 1rem 3.2rem;
          }

          .whatwedo-header {
            margin-bottom: 1.4rem;
            padding-inline: 0;
            text-align: left;
            align-items: flex-start;
          }

          .whatwedo-title {
            font-size: clamp(1.12rem, 6.2vw, 1.58rem);
            white-space: normal;
          }

          .whatwedo-rule {
            margin: 1rem 0 0;
          }

          .ww-bento-grid {
            grid-template-columns: 1fr;
            gap: 0.7rem;
          }

          .ww-card,
          .ww-card:nth-child(1),
          .ww-card:nth-child(2),
          .ww-card:nth-child(3),
          .ww-card:nth-child(4),
          .ww-card:nth-child(5),
          .ww-card:nth-child(6) {
            grid-column: span 1;
            min-height: 188px;
            padding: 1.02rem;
          }

          .ww-card h3 {
            font-size: 0.98rem;
          }

          .ww-card p {
            font-size: 0.88rem;
            line-height: 1.58;
          }
        }
      `}</style>

      <section id="what-we-do" className={`whatwedo-root${revealed ? " revealed" : ""}`} ref={sectionRef}>
        <div className="whatwedo-shell">
          <header className="whatwedo-header">
            <span className="whatwedo-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E31B54" }} />
              Core Systems Engineering
            </span>
            <h2 className="whatwedo-title">Systems Engineered for High-Stakes Operations.</h2>
            <p className="whatwedo-subtitle">
              Six core capabilities, presented as a single modern engineering surface.
            </p>
            <div className="whatwedo-rule" />
          </header>

          <div className="ww-bento-grid">
            {BENTO_CARDS.map((card) => (
              <article key={card.title} className="ww-card">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
