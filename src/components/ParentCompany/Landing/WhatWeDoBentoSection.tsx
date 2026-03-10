"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type CapabilityCard = {
  id: string;
  title: string;
  description: string;
  tag: string;
  layout: "primary" | "secondary" | "tertiary";
};

const CAPABILITIES: CapabilityCard[] = [
  {
    id: "01",
    title: "Intelligence Processing & Data Analytics",
    description:
      "Convert fragmented operational signals into decision-ready intelligence using structured analytics pipelines, correlation, and live reporting.",
    tag: "Intelligence Processing",
    layout: "primary",
  },
  {
    id: "02",
    title: "Artificial Intelligence & Automation",
    description:
      "Deploy AI-driven workflows and automation layers that reduce manual overhead and accelerate high-confidence execution.",
    tag: "AI Automation",
    layout: "secondary",
  },
  {
    id: "03",
    title: "Mission-Critical Software Systems",
    description:
      "Engineer hardened software systems built for reliability, security, and continuity in environments where failure is unacceptable.",
    tag: "Mission Systems",
    layout: "secondary",
  },
  {
    id: "04",
    title: "Operational Platforms",
    description:
      "Design command and control surfaces and workflow platforms that keep teams synchronized and execution disciplined under pressure.",
    tag: "Operations Platform",
    layout: "tertiary",
  },
  {
    id: "05",
    title: "Advanced Systems Manufacturing",
    description:
      "Design and production of high-performance hardware, sensor, guidance, and embedded systems for specialized operational environments.",
    tag: "Systems Manufacturing",
    layout: "tertiary",
  },
  {
    id: "06",
    title: "Robotics & Embedded Systems",
    description:
      "Engineer edge-ready robotics and embedded platforms that connect sensors, software, and control layers into one operational stack.",
    tag: "Edge Systems",
    layout: "tertiary",
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
          font-family: 'Inter', system-ui, sans-serif;
          background: #000000;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          border-bottom: none;
        }
        :root.light .whatwedo-root {
          background: var(--surface-secondary, #f8f9fa);
          border-top: 1px dashed rgba(0, 0, 0, 0.12);
          border-bottom: none;
        }

        .whatwedo-root::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light;
          opacity: 0.28;
        }
        :root.light .whatwedo-root::after {
          mix-blend-mode: multiply;
          opacity: 0.12;
        }

        .whatwedo-shell {
          position: relative;
          z-index: 2;
          padding: 7rem 2rem;
        }
        @media (min-width: 640px) {
          .whatwedo-shell { padding: 7rem 4rem; }
        }
        @media (min-width: 768px) {
          .whatwedo-shell { padding: 7rem 6rem; }
        }
        @media (min-width: 1280px) {
          .whatwedo-shell { padding: 7rem 8rem; }
        }
        @media (min-width: 1536px) {
          .whatwedo-shell { padding: 7rem 12rem; }
        }
        @media (min-width: 1920px) {
          .whatwedo-shell { padding: 7rem 16rem; }
        }

        .whatwedo-header {
          margin-bottom: 2.2rem;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s cubic-bezier(0.2, 1, 0.3, 1), transform 0.7s cubic-bezier(0.2, 1, 0.3, 1);
        }
        .whatwedo-root.revealed .whatwedo-header {
          opacity: 1;
          transform: translateY(0);
        }

        .whatwedo-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.9rem;
          font-size: 0.62rem;
          font-family: ui-monospace, Menlo, monospace;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          font-weight: 700;
          color: #E31B54;
        }

        .whatwedo-title {
          margin: 0 0 0.75rem;
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.15;
          background: linear-gradient(135deg, #f1f5f9 0%, rgba(241, 245, 249, 0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        :root.light .whatwedo-title {
          background: linear-gradient(135deg, #0f172a 0%, rgba(15, 23, 42, 0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .whatwedo-subtitle {
          margin: 0;
          width: 100%;
          max-width: none;
          font-size: 0.9rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.4);
          font-family: ui-sans-serif, system-ui, sans-serif;
        }
        :root.light .whatwedo-subtitle {
          color: rgba(0, 0, 0, 0.45);
        }

        .whatwedo-rule {
          width: 54px;
          height: 2px;
          border-radius: 999px;
          margin-top: 1.25rem;
          background: #E31B54;
          box-shadow: 0 0 8px rgba(227, 27, 84, 0.45);
        }

        .whatwedo-grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-auto-rows: minmax(210px, auto);
          gap: 1.35rem;
        }

        .whatwedo-card {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 220px;
          border-radius: 18px;
          padding: 1.65rem 1.6rem 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background:
            linear-gradient(162deg, rgba(255, 255, 255, 0.055) 0%, rgba(255, 255, 255, 0.018) 56%, rgba(227, 27, 84, 0.09) 100%);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.08),
            0 16px 32px rgba(0, 0, 0, 0.24);
          overflow: hidden;
          opacity: 0;
          transform: translateY(24px) scale(0.985);
          transition:
            opacity 0.55s cubic-bezier(0.2, 1, 0.3, 1),
            transform 0.55s cubic-bezier(0.2, 1, 0.3, 1),
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }
        :root.light .whatwedo-card {
          border: 1px solid rgba(0, 0, 0, 0.1);
          background:
            linear-gradient(162deg, rgba(255, 255, 255, 0.96) 0%, rgba(246, 247, 249, 0.95) 56%, rgba(227, 27, 84, 0.08) 100%);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.85),
            0 14px 28px rgba(0, 0, 0, 0.08);
        }
        .whatwedo-root.revealed .whatwedo-card {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .whatwedo-card-hover-border {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 18px;
          padding: 1px;
          background: radial-gradient(
            400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(0, 255, 166, 0.8),
            rgba(255, 215, 0, 0.6),
            rgba(236, 72, 153, 0.6),
            rgba(147, 51, 234, 0.6),
            rgba(59, 130, 246, 0.5),
            transparent 70%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 2;
        }
        .whatwedo-card:hover .whatwedo-card-hover-border {
          opacity: 1;
        }

        .whatwedo-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #E31B54, transparent 70%);
          opacity: 0.9;
        }

        .whatwedo-card:hover {
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.1),
            0 20px 36px rgba(0, 0, 0, 0.3);
          transform: translateY(-4px);
        }
        :root.light .whatwedo-card:hover {
          border-color: rgba(0, 0, 0, 0.12);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.85),
            0 18px 30px rgba(0, 0, 0, 0.12);
        }

        .whatwedo-card-content {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 1.1rem;
          height: 100%;
        }

        .whatwedo-card.primary { grid-column: span 7; grid-row: span 2; min-height: 100%; }
        .whatwedo-card.secondary { grid-column: span 5; }
        .whatwedo-card.tertiary { grid-column: span 4; }

        .whatwedo-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          margin-bottom: 0.35rem;
        }

        .whatwedo-id {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.58rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.42);
        }
        :root.light .whatwedo-id {
          color: rgba(0, 0, 0, 0.42);
        }

        .whatwedo-card h3 {
          margin: 0;
          font-size: clamp(1rem, 1.55vw, 1.35rem);
          line-height: 1.4;
          letter-spacing: -0.01em;
          color: rgba(255, 255, 255, 0.92);
          font-family: 'Inter', system-ui, sans-serif;
        }
        :root.light .whatwedo-card h3 {
          color: rgba(15, 23, 42, 0.9);
        }

        .whatwedo-card p {
          margin: 1rem 0 0;
          font-size: 0.95rem;
          line-height: 1.72;
          color: rgba(255, 255, 255, 0.52);
          font-family: ui-sans-serif, system-ui, sans-serif;
        }
        :root.light .whatwedo-card p {
          color: rgba(0, 0, 0, 0.55);
        }

        .whatwedo-tag {
          margin-top: 1.4rem;
          display: inline-flex;
          align-items: center;
          gap: 0.42rem;
          width: fit-content;
          padding: 0.35rem 0.55rem;
          border-radius: 999px;
          border: 1px solid rgba(227, 27, 84, 0.28);
          background: rgba(227, 27, 84, 0.1);
          color: rgba(255, 255, 255, 0.68);
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.56rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        :root.light .whatwedo-tag {
          color: rgba(0, 0, 0, 0.62);
          border: 1px solid rgba(227, 27, 84, 0.22);
          background: rgba(227, 27, 84, 0.08);
        }

        @media (max-width: 1200px) {
          .whatwedo-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-auto-rows: auto;
          }

          .whatwedo-card,
          .whatwedo-card.primary,
          .whatwedo-card.secondary,
          .whatwedo-card.tertiary {
            grid-column: span 1;
            grid-row: span 1;
            min-height: 240px;
          }

          .whatwedo-card.primary {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 640px) {
          .whatwedo-shell {
            padding: 5.5rem 1.25rem;
          }

          .whatwedo-header {
            margin-bottom: 1.45rem;
          }

          .whatwedo-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .whatwedo-card,
          .whatwedo-card.primary,
          .whatwedo-card.secondary,
          .whatwedo-card.tertiary {
            grid-column: 1 / -1;
            min-height: 210px;
            padding: 1.35rem 1.2rem 1.2rem;
          }

          .whatwedo-card h3 {
            font-size: 1rem;
          }

          .whatwedo-card p {
            font-size: 0.84rem;
            line-height: 1.62;
            margin-top: 0.75rem;
          }
        }
      `}</style>

      <section
        id="what-we-do"
        className={`whatwedo-root${revealed ? " revealed" : ""}`}
        ref={sectionRef}
      >
        <div className="whatwedo-shell">
          <header className="whatwedo-header">
            <span className="whatwedo-eyebrow">
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E31B54" }} />
              What We Do
            </span>
            <h2 className="whatwedo-title">Core Systems We Engineer</h2>
            <p className="whatwedo-subtitle">
              We design and deliver integrated systems that convert complexity into
              command-grade clarity.
            </p>
            <div className="whatwedo-rule" />
          </header>

          <div className="whatwedo-grid">
            {CAPABILITIES.map((capability, index) => (
              <article
                key={capability.title}
                className={`whatwedo-card ${capability.layout}`}
                style={{ transitionDelay: `${120 + index * 80}ms` } as CSSProperties}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
                }}
              >
                <div className="whatwedo-card-hover-border" />

                <div className="whatwedo-card-content">
                  <div className="whatwedo-card-top">
                    <span className="whatwedo-id">[{capability.id}]</span>
                  </div>

                  <div>
                    <h3>{capability.title}</h3>
                    <p>{capability.description}</p>
                  </div>

                  <span className="whatwedo-tag">
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#E31B54", flexShrink: 0 }} />
                    {capability.tag}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
