"use client";
import { useEffect, useRef, useState } from "react";

const PRINCIPLES = [
  { num: "01", title: "Accountability", text: "Authority without accountability is tyranny. We govern ourselves before we govern others." },
  { num: "02", title: "Precision", text: "Precision over velocity. The right decision, executed cleanly, outperforms a hundred fast ones." },
  { num: "03", title: "Architecture", text: "Structure is not a cage — it is the architecture of freedom. When roles are clear, people fly." },
  { num: "04", title: "Loyalty", text: "Loyalty compounds. Betrayal is permanent. We choose our circle with the same care we choose our battles." },
];

export default function ManifestoSection() {
  const [revealed, setRevealed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setRevealed(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <>
      <style>{`
        .manifesto-root {
          --accent: #E31B54;
          background: var(--surface-primary, #000);
          color: var(--content-primary, white);
          padding: 12rem 2rem;
          font-family: 'Inter', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
          cursor: crosshair;
        }
        @media(min-width:640px){ .manifesto-root { padding: 12rem 4rem; } }
        @media(min-width:768px){ .manifesto-root { padding: 12rem 6rem; } }
        @media(min-width:1024px){ .manifesto-root { padding: 12rem 6rem; } }
        @media(min-width:1280px){ .manifesto-root { padding: 12rem 8rem; } }
        @media(min-width:1536px){ .manifesto-root { padding: 12rem 12rem; } }
        @media(min-width:1920px){ .manifesto-root { padding: 12rem 16rem; } }
        :root.light .manifesto-root { background: var(--surface-primary); }

        /* Spotlight Effect */
        .spotlight {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(227, 27, 84, 0.15) 0%, transparent 40%);
          pointer-events: none;
          z-index: 2;
        }

        .manifesto-container {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 6rem;
          position: relative;
          z-index: 3;
        }

        @media (max-width: 1024px) {
          .manifesto-container { grid-template-columns: 1fr; gap: 4rem; }
        }

        /* ── Left: The Big Quote ── */
        .quote-block {
          position: relative;
        }

        .quote-text {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: clamp(2.2rem, 4.8vw, 3.45rem);
          line-height: 1.15;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 3rem;
          font-style: italic;
          background: var(--text-gradient, linear-gradient(135deg, #f1f5f9 0%, rgba(241,245,249,0.7) 100%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
          transform: translateX(-30px);
          transition: all 1s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .revealed .quote-text {
          opacity: 1;
          transform: translateX(0);
        }

        .quote-author {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.8rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .quote-author::before {
          content: "";
          width: 60px;
          height: 1px;
          background: var(--accent);
        }

        /* ── Right: Principles ── */
        .principles-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .principle-item {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 1.5rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        :root.light .principle-item { border-top: 1px solid rgba(0,0,0,0.1); }

        .revealed .principle-item {
          opacity: 1;
          transform: translateY(0);
        }

        .principle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .p-num {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.7rem;
          color: var(--accent);
        }

        .p-title {
          font-size: 1.1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--content-primary);
        }

        .p-text {
          font-size: 1rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.5);
        }
        :root.light .p-text { color: rgba(0,0,0,0.5); }

        /* Noise Texture */
        .manifesto-root::after {
          content: "";
          position: absolute;
          inset: 0;
          background: url("https://grainy-gradients.vercel.app/noise.svg");
          opacity: 0.05;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      <section
        id="section-manifesto"
        className={`manifesto-root ${revealed ? "revealed" : ""}`}
        ref={sectionRef}
        onMouseMove={handleMouseMove}
      >
        <div className="spotlight" />
        
        <div className="manifesto-container">
          <div className="quote-block">
            <h2 className="quote-text">
              &ldquo;We do not build empires by accident. Every stone is placed with deliberate intent.&rdquo;
            </h2>
            <div className="quote-author">
              Notus Regalia Protocol 2026
            </div>
          </div>

          <div className="principles-list">
            {PRINCIPLES.map((p, i) => (
              <div 
                key={p.num} 
                className="principle-item"
                style={{ transitionDelay: `${400 + (i * 150)}ms` }}
              >
                <div className="principle-header">
                  <span className="p-title">{p.title}</span>
                  <span className="p-num">[{p.num}]</span>
                </div>
                <p className="p-text">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
