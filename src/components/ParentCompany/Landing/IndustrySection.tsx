"use client";
import { useState, useEffect, useRef } from "react";

const TABS = [
  {
    id: "government",
    label: "Government",
    title: "Government Systems for Public Impact",
    description: "The Notus Regalia develops structured frameworks that support transparent governance and coordinated public services.",
    paragraphs: [
      "Government environments require reliability, accountability, and seamless collaboration across institutions. We design systems that organize information flow, clarify operational responsibilities, and strengthen the connection between policy and implementation.",
    ],
    color: "#059669"
  },
  {
    id: "defense",
    label: "Defense",
    title: "Built on Layered Authority for Command and Control",
    description: "Notus Regalia was forged with a singular intent — to design systems that endure in high-stakes environments.",
    paragraphs: [
      "In defense, clarity of command is not optional. It is foundational. We do not rely on intuition. We engineer frameworks. Structures built on layered authority — where decision rights are defined, execution is precise, and accountability is absolute. Power is distributed intentionally, escalation paths are clear, and mission-critical actions are concentrated where expertise matters most.",
    ],
    color: "#E31B54"
  },
  {
    id: "healthcare",
    label: "Healthcare",
    title: "Intelligence for Clinical Excellence and Human Performance",
    description: "The Notus Regalia exists to strengthen the systems that support patient care across every stage of treatment.",
    paragraphs: [
      "Our focus is not on trends or surface innovation. It is on improving workflows, reinforcing data integrity, and enabling healthcare professionals to deliver consistent, high-quality care. We build tools that integrate seamlessly into clinical environments, designed to enhance decision-making, optimize resource allocation, and ultimately improve patient outcomes.",
    ],
    color: "#7C3AED"
  },
  {
    id: "enterprise",
    label: "Enterprise",
    title: "Operational Architecture for Modern Organizations",
    description: "The Notus Regalia develops structured systems that transform organizational complexity into coordinated performance.",
    paragraphs: [
      "Enterprises succeed when strategy, execution, and communication function as a unified framework. We create environments where processes are clearly defined, responsibilities are transparent, and decisions are supported by reliable information.",
    ],
    color: "#2563EB"
  },
  {
    id: "energy",
    label: "Energy",
    title: "Infrastructure Intelligence for the Energy Sector",
    description: "The Notus Regalia builds systems that bring precision and resilience to critical energy infrastructure and operations.",
    paragraphs: [
      "Energy systems demand zero-tolerance reliability. We engineer monitoring frameworks, operational hierarchies, and decision support tools that keep infrastructure running at peak performance. From grid management to resource allocation, our systems are designed for environments where failure is not an option.",
    ],
    color: "#f59e0b"
  },
  {
    id: "disaster",
    label: "Disaster Response",
    title: "Command Structures for Crisis and Disaster Response",
    description: "The Notus Regalia develops rapid-deployment frameworks that coordinate multi-agency disaster response with clarity and speed.",
    paragraphs: [
      "In disaster scenarios, fragmented command costs lives. We design unified response architectures that eliminate coordination gaps, accelerate resource deployment, and maintain situational awareness across all response teams. Our systems are built to function under pressure, in degraded environments, where every second of clarity counts.",
    ],
    color: "#f97316"
  },
];

const TIMER_DURATION = 10000;
const CIRCLE_R = 9;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

function CircleTimer({ color, running, timerKey }: { color: string; running: boolean; timerKey: number }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      style={{ flexShrink: 0, transform: "rotate(-90deg)" }}
    >
      <circle
        cx="12" cy="12" r={CIRCLE_R}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="2"
      />
      <circle
        key={timerKey}
        cx="12" cy="12" r={CIRCLE_R}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          strokeDasharray: CIRCLE_CIRCUMFERENCE,
          strokeDashoffset: 0,
          animation: running
            ? `industry-countdown ${TIMER_DURATION}ms linear forwards`
            : "none",
        }}
      />
    </svg>
  );
}

export default function IndustrySection() {
  const [active, setActive] = useState(0);
  const [contentActive, setContentActive] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [pillStyle, setPillStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const [timerKey, setTimerKey] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const activeRef = useRef(0);
  const contentFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  activeRef.current = active;

  // ── Scroll reveal ──
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setRevealed(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Pill position — reacts to active immediately ──
  useEffect(() => {
    const btn = navRefs.current[active];
    const sidebar = sidebarRef.current;
    if (!btn || !sidebar) return;
    const br = btn.getBoundingClientRect();
    const sr = sidebar.getBoundingClientRect();
    setPillStyle({ top: br.top - sr.top, height: br.height, opacity: 1 });
  }, [active, revealed]);

  // ── Auto-advance scheduler ──
  const scheduleNext = () => {
    if (autoRef.current) clearTimeout(autoRef.current);
    autoRef.current = setTimeout(() => {
      const next = (activeRef.current + 1) % TABS.length;
      switchTo(next);
    }, TIMER_DURATION);
  };

  // ── Shared switch ──
  // Pill + nav update INSTANTLY. Content fades out → swaps → fades in.
  const switchTo = (next: number) => {
    if (next === activeRef.current) return;

    if (autoRef.current) clearTimeout(autoRef.current);
    if (contentFadeRef.current) clearTimeout(contentFadeRef.current);

    // 1. Move pill & highlight immediately
    setActive(next);
    setTimerKey(k => k + 1);

    // 2. Fade content out
    setContentVisible(false);

    // 3. After fade-out, swap content and fade back in
    contentFadeRef.current = setTimeout(() => {
      setContentActive(next);
      setContentVisible(true);
      scheduleNext();
    }, 160);
  };

  // ── Start auto-advance on mount ──
  useEffect(() => {
    scheduleNext();
    return () => {
      if (autoRef.current) clearTimeout(autoRef.current);
      if (contentFadeRef.current) clearTimeout(contentFadeRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabClick = (i: number) => { switchTo(i); };

  const tab = TABS[contentActive];

  return (
    <>
      <style>{`
        @keyframes industry-countdown {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: ${CIRCLE_CIRCUMFERENCE}; }
        }
        .modern-about {
          background: var(--surface-secondary, #050505);
          border-top: 1px dashed rgba(255,255,255,0.1);
          border-bottom: 1px dashed rgba(255,255,255,0.1);
          padding: 8rem 2rem;
          color: var(--content-primary, white);
          font-family: 'Inter', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
        }
        :root.light .modern-about {
          background: var(--surface-secondary);
          border-top: 1px dashed rgba(0,0,0,0.12);
          border-bottom: 1px dashed rgba(0,0,0,0.12);
        }
        @media(min-width:640px){  .modern-about { padding: 8rem 4rem; } }
        @media(min-width:768px){  .modern-about { padding: 8rem 6rem; } }
        @media(min-width:1024px){ .modern-about { padding: 8rem 6rem; } }
        @media(min-width:1280px){ .modern-about { padding: 8rem 8rem; } }
        @media(min-width:1536px){ .modern-about { padding: 8rem 12rem; } }
        @media(min-width:1920px){ .modern-about { padding: 8rem 16rem; } }

        .about-section-header {
          position: relative;
          z-index: 1;
          margin-bottom: 3.5rem;
        }

        .about-container {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 4rem;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 1024px) {
          .about-container { grid-template-columns: 1fr; gap: 2rem; }
        }

        .about-sidebar {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
        }
        @media (max-width: 768px) {
          .about-sidebar {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.65rem;
          }
        }

        .about-nav-pill {
          position: absolute;
          left: 0; right: 0;
          border-radius: 16px;
          background: rgba(255,255,255,0.05);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.08);
          pointer-events: none;
          transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.3s ease;
          z-index: 0;
        }
        :root.light .about-nav-pill {
          background: rgba(0,0,0,0.04);
          box-shadow: inset 0 1px 1px rgba(0,0,0,0.06);
        }
        @media (max-width: 768px) {
          .about-nav-pill { display: none; }
        }

        .about-nav-pill::before {
          content: "";
          position: absolute;
          left: 0; top: 25%; bottom: 25%;
          width: 3px;
          background: #E31B54;
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 6px rgba(227,27,84,0.5);
        }

        .nav-item {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.3);
          text-align: left;
          padding: 1.5rem;
          border-radius: 16px;
          cursor: pointer;
          transition: color 0.2s ease;
          position: relative;
          font-size: 1.1rem;
          font-weight: 500;
          font-family: 'Inter', system-ui, sans-serif;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          width: 100%;
        }
        @media (max-width: 768px) {
          .nav-item {
            padding: 0.9rem 0.8rem;
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 12px;
            min-height: 80px;
            align-items: flex-start;
            font-size: 0.92rem;
            line-height: 1.25;
          }
        }
        :root.light .nav-item { color: rgba(0,0,0,0.35); }
        @media (max-width: 768px) {
          :root.light .nav-item { border: 1px solid rgba(0,0,0,0.12); }
        }
        .nav-item:hover { color: rgba(255,255,255,0.6); }
        :root.light .nav-item:hover { color: rgba(0,0,0,0.6); }
        .nav-item.active { color: white; }
        :root.light .nav-item.active { color: var(--content-primary); }
        @media (max-width: 768px) {
          .nav-item.active {
            background: rgba(227,27,84,0.12);
            border-color: rgba(227,27,84,0.45);
          }
          :root.light .nav-item.active {
            background: rgba(227,27,84,0.08);
            border-color: rgba(227,27,84,0.4);
          }
        }

        .nav-item-left {
          display: flex;
          align-items: center;
          gap: 0;
        }
        @media (max-width: 768px) {
          .nav-item-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.3rem;
          }
          .nav-item-left > span:first-child {
            margin-right: 0 !important;
            font-size: 0.62rem !important;
            letter-spacing: 0.12em;
            opacity: 0.45 !important;
          }
        }

        .content-panel {
          height: 480px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
        }
        @media(max-width:1024px){ .content-panel { height: 540px; } }
        @media(max-width:640px){  .content-panel { height: 620px; } }

        .content-inner {
          width: 100%;
          transition: opacity 0.14s ease, transform 0.14s ease;
        }
        .content-inner.fading-out {
          opacity: 0;
          transform: translateY(-6px);
        }
        .content-inner.fading-in {
          opacity: 1;
          transform: translateY(0);
        }

        .content-label {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          margin-bottom: 1rem;
          display: block;
          transition: color 0.4s ease;
        }

        .content-title {
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
          background: var(--text-gradient, linear-gradient(to bottom, #fff, rgba(255,255,255,0.7)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        :root.light .content-title {
          background: linear-gradient(to bottom, #0f172a, rgba(15,23,42,0.7));
          -webkit-background-clip: text;
          background-clip: text;
        }

        .content-body {
          font-size: 1.15rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.5);
          text-align: justify;
        }
        :root.light .content-body { color: rgba(0,0,0,0.5); }
        .content-description {
          color: var(--content-primary);
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          text-align: justify;
          line-height: 1.55;
        }
        @media (max-width: 768px) {
          .content-label {
            font-size: 0.66rem;
            letter-spacing: 0.22em;
            margin-bottom: 0.8rem;
          }
          .content-title {
            font-size: clamp(1.3rem, 7vw, 1.9rem);
            margin-bottom: 1rem;
          }
          .content-body {
            font-size: 0.98rem;
            line-height: 1.55;
          }
          .content-description {
            font-size: 1.05rem;
            margin-bottom: 1rem;
          }
        }

        .reveal-up {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.2, 1, 0.3, 1);
        }
        .revealed .reveal-up {
          opacity: 1;
          transform: translateY(0);
        }

        .nav-timer {
          opacity: 0;
          transition: opacity 0.3s ease;
          flex-shrink: 0;
        }
        .nav-item.active .nav-timer {
          opacity: 1;
        }
        @media (max-width: 768px) {
          .nav-timer { opacity: 0.55; }
          .nav-item.active .nav-timer { opacity: 1; }
        }
      `}</style>

      <section id="industries-we-serve" className={`modern-about${revealed ? " revealed" : ""}`} ref={sectionRef}>

        <div className="about-section-header reveal-up" style={{ transitionDelay: "0ms" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            fontSize: "0.74rem", fontFamily: "ui-monospace, Menlo, monospace",
            textTransform: "uppercase" as const, letterSpacing: "0.24em",
            fontWeight: 700, color: "#E31B54", marginBottom: "1rem"
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E31B54", flexShrink: 0 }} />
            Sectors We Serve
          </span>
          <h2 style={{
            fontSize: "clamp(2.2rem, 4.8vw, 3.45rem)", fontWeight: 700,
            letterSpacing: "-0.02em", lineHeight: 1.15,
            background: "var(--text-gradient, linear-gradient(135deg,#f1f5f9 0%,rgba(241,245,249,.7) 100%))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", marginBottom: "0.75rem"
          }}>
            Our Presence throughout Critical Industries.
          </h2>
          <p style={{
            fontSize: "clamp(1.02rem, 1.45vw, 1.24rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.4)",
            fontFamily: "ui-sans-serif, system-ui, sans-serif"
          }}>
            From infrastructure and public systems to defense-adjacent and mission-critical operations, we build for environments where failure is not an option.
          </p>
          <div style={{
            width: 48, height: 2, background: "#E31B54",
            borderRadius: 999, boxShadow: "0 0 8px rgba(227,27,84,0.5)",
            marginTop: "1.25rem"
          }} />
        </div>

        <div className="about-container">
          <div className="about-sidebar reveal-up" style={{ transitionDelay: "100ms" }} ref={sidebarRef}>
            <div
              className="about-nav-pill"
              style={{ top: pillStyle.top, height: pillStyle.height, opacity: pillStyle.opacity }}
            />

            {TABS.map((t, i) => (
              <button
                key={t.id}
                className={`nav-item${active === i ? " active" : ""}`}
                style={{ "--nav-accent": t.color } as React.CSSProperties}
                ref={(el) => { navRefs.current[i] = el; }}
                onClick={() => handleTabClick(i)}
              >
                <span className="nav-item-left">
                  <span style={{ opacity: 0.3, marginRight: "1rem", fontSize: "0.8rem" }}>0{i + 1}</span>
                  {t.label}
                </span>
                <span className="nav-timer">
                  <CircleTimer
                    color={t.color}
                    running={active === i}
                    timerKey={timerKey}
                  />
                </span>
              </button>
            ))}
          </div>

          <div className="content-panel reveal-up" style={{ transitionDelay: "300ms" }}>
            <div className={`content-inner${contentVisible ? " fading-in" : " fading-out"}`}>
              <span className="content-label" style={{ color: tab.color }}>{tab.label}</span>
              <h2 className="content-title">{tab.title}</h2>
              <div className="content-body">
                <p className="content-description">
                  {tab.description}
                </p>
                {tab.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
