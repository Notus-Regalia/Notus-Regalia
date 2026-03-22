"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CARDS = [
  {
    id: "01",
    label: "Absolute Command",
    tagline: "Strategic Apex",
    desc: "When systems think and interfaces unify, control becomes decisive. We engineer coherence across complexity so you can lead with clarity, speed, and certainty.",
    bg: "#0a0a0a",
    accent: "#E31B54",
    textColor: "#ffffff",
    stat: "100%",
    statLabel: "Decision Authority",
  },
  {
    id: "02",
    label: "Engineered Intelligence",
    tagline: "Information Warfare",
    desc: "We reveal the landscape before decisions are made. Through data, analysis, and predictive systems, we turn information into foresight and advantage into design.",
    bg: "#000000",
    accent: "#ffffff",
    textColor: "#ffffff",
    stat: "∞",
    statLabel: "Signal Range",
  },
  {
    id: "03",
    label: "Operational Precision",
    tagline: "Execution Engine",
    desc: "Where strategy becomes action. We convert intent into measurable outcomes through disciplined systems, rapid execution, and uncompromising accountability.",
    bg: "#0a0a0a",
    accent: "#E31B54",
    textColor: "#ffffff",
    stat: "0ms",
    statLabel: "Tolerance for Delay",
  },
  {
    id: "04",
    label: "Integrated Architecture",
    tagline: "System Cohesion",
    desc: "We connect intelligence, interfaces, and operations into unified ecosystems that move as one—reducing friction, increasing visibility, and strengthening control.",
    bg: "#000000",
    accent: "#ffffff",
    textColor: "#ffffff",
    stat: "1X",
    statLabel: "System Unity",
  },
];

export default function StackingCards() {
  const outerRef = useRef(null);
  const stickyRef = useRef(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const swipeStartXRef = useRef<number | null>(null);
  const swipeStartYRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const hintVisibleRef = useRef(true);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileStep, setMobileStep] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (isMobile) {
      hintVisibleRef.current = false;
      setShowScrollHint(false);
      setMobileStep(0);
      return;
    }

    hintVisibleRef.current = true;
    setShowScrollHint(true);

    const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
    const updateDesktopCards = (nextProgress: number) => {
      const cardCount = CARDS.length;
      const transitionCount = cardCount - 1;
      const step = 1 / transitionCount;
      const transitionSpan = step * 0.86;

      for (let index = 0; index < cardCount; index += 1) {
        const cardEl = cardRefs.current[index];
        if (!cardEl) continue;

        const inStart = index === 0 ? 0 : (index - 1) * step;
        const inRaw = index === 0 ? 1 : clamp01((nextProgress - inStart) / transitionSpan);
        const inEased = index === 0 ? 1 : easeOutCubic(inRaw);
        const queuedGap = 12;
        const queuedDepth = Math.max(0, index - 1) * 8;
        const translateY = index === 0 ? 0 : (1 - inEased) * (100 + queuedGap + queuedDepth);

        let scale = 1;
        let brightness = 1;
        if (index < cardCount - 1) {
          const outStart = index * step;
          const outRaw = clamp01((nextProgress - outStart) / transitionSpan);
          scale = 1 - outRaw * 0.06;
          brightness = 1 - outRaw * 0.55;
        }

        cardEl.style.transform = `translateY(${translateY}%) scale(${scale})`;
        cardEl.style.filter = `brightness(${brightness})`;
        cardEl.style.zIndex = String(index + 1);
      }
    };

    const updateHint = (nextProgress: number) => {
      const shouldShow = nextProgress < 0.05;
      if (shouldShow !== hintVisibleRef.current) {
        hintVisibleRef.current = shouldShow;
        setShowScrollHint(shouldShow);
      }
    };

    updateDesktopCards(0);
    updateHint(0);

    let ctx: gsap.Context | null = null;
    const id = setTimeout(() => {
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: outerRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: stickyRef.current,
          pinSpacing: false,
          anticipatePin: 1,
          onUpdate: (self) => {
            updateDesktopCards(self.progress);
            updateHint(self.progress);
          },
          onRefresh: (self) => {
            updateDesktopCards(self.progress);
            updateHint(self.progress);
          },
        });
      });
    }, 100);
    return () => {
      clearTimeout(id);
      ctx?.revert();
    };
  }, [isMobile]);

  const getMobileCardStyle = (index: number) => {
    const dropped = index < mobileStep;
    const active = index === mobileStep;
    const queued = index > mobileStep;
    const queuedOffset = Math.min(index - mobileStep, 2);
    return {
      zIndex: CARDS.length - index,
      transform: dropped
        ? "translateY(118%) scale(0.98)"
        : active
          ? "translateY(0) scale(1)"
          : `translateY(${38 + queuedOffset * 18}px) scale(${1 - queuedOffset * 0.04})`,
      opacity: dropped ? 0 : queued ? Math.max(0.35, 0.88 - queuedOffset * 0.24) : 1,
      pointerEvents: active ? "auto" : "none",
    };
  };

  const advanceMobileDeck = () => {
    setMobileStep((prev) => Math.min(prev + 1, CARDS.length - 1));
  };

  const retreatMobileDeck = () => {
    setMobileStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <>
      <style>{`
        .sc-outer { height: 500vh; }

        .sc-pinned {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 2rem;
          overflow: hidden;
        }
        @media(min-width:640px)  { .sc-pinned { padding: 0 4rem; } }
        @media(min-width:768px)  { .sc-pinned { padding: 0 6rem; } }
        @media(min-width:1280px) { .sc-pinned { padding: 0 8rem; } }
        @media(min-width:1536px) { .sc-pinned { padding: 0 12rem; } }

        .sc-stack {
          position: relative;
          width: 100%;
          height: min(520px, 80vh);
        }


        /* ── Back spotlight glow ── */
        .sc-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          border-radius: 20px;
        }
        .sc-glow::before,
        .sc-glow::after {
          --size: 8px;
          content: "";
          position: absolute;
          top: calc(var(--size) / -2);
          left: calc(var(--size) / -2);
          width: calc(100% + var(--size));
          height: calc(100% + var(--size));
          border-radius: 20px;
          background:
            radial-gradient(circle at 0% 0%,    hsl(27deg 93% 55%), transparent 60%),
            radial-gradient(circle at 100% 0%,   #00a6ff,           transparent 60%),
            radial-gradient(circle at 0% 100%,   #ff0056,           transparent 60%),
            radial-gradient(circle at 100% 100%, #6500ff,           transparent 60%);
        }
        .sc-glow::after {
          --size: 2px;
          z-index: -1;
        }
        .sc-glow::before {
          --size: 14px;
          z-index: -2;
          filter: blur(2.25rem);
          opacity: 0.55;
        }

        /* ── Card wrapper ── */
        .sc-card-wrap {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          will-change: transform, filter;
          box-shadow: 0 40px 80px rgba(0,0,0,0.45);
          isolation: isolate;
          overflow: hidden;
        }

        /* ── Inner card surface ── */
        .sc-card {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 19px;
          padding: clamp(1.75rem, 4vw, 3.5rem);
          display: grid;
          grid-template-rows: minmax(0, 1fr) auto;
          gap: 1rem;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        /* Noise overlay */
        .sc-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 19px;
          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.03) 0,
              rgba(255,255,255,0.03) 1px,
              transparent 1px,
              transparent 3px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.02) 0,
              rgba(255,255,255,0.02) 1px,
              transparent 1px,
              transparent 4px
            );
          pointer-events: none;
          opacity: 0.28;
          mix-blend-mode: soft-light;
          z-index: 0;
        }

        /* ── Middle ── */
        .sc-card-mid {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0.35rem;
        }

        .sc-tagline {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.6rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          opacity: 0.38;
        }

        /* Title + animated red rule row */
        .sc-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: visible;
          padding-bottom: 0.12em;
        }

        .sc-title {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          font-size: clamp(2.35rem, 8.5vw, 4.8rem);
          line-height: 1.02;
          letter-spacing: -0.02em;
          font-weight: 800;
          flex-shrink: 0;
          transition: letter-spacing 0.45s cubic-bezier(0.4,0,0.2,1);
        }
        .sc-card-wrap:hover .sc-title { letter-spacing: -0.01em; }

        /* Red extending line — same as Overview */
        .sc-title-rule {
          flex: 1;
          height: 2px;
          border-radius: 999px;
          max-width: 0;
          opacity: 0;
          transition: max-width 0.45s cubic-bezier(0.4,0,0.2,1) 0.1s,
                      opacity 0.3s ease 0.1s,
                      box-shadow 0.3s ease;
        }
        .sc-card-wrap:hover .sc-title-rule {
          max-width: 100%;
          opacity: 1;
        }

        /* ── Bottom row ── */
        .sc-card-bot {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
        }

        .sc-desc {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          font-size: clamp(0.8rem, 1.4vw, 0.95rem);
          line-height: 1.7;
          opacity: 0.6;
          max-width: 58ch;
          font-style: normal;
          flex: 1;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .sc-card-wrap:hover .sc-desc {
          opacity: 0.85;
          transform: translateY(-4px);
        }

        /* Stat block */
        .sc-stat {
          text-align: right;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .sc-card-wrap:hover .sc-stat { transform: translateY(-4px); }

        .sc-stat-num {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          font-size: clamp(1.8rem, 5vw, 3rem);
          line-height: 1;
          letter-spacing: -0.02em;
          font-weight: 800;
        }

        .sc-stat-label {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.55rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.38;
          display: block;
          margin-top: 0.1rem;
        }

        /* Index tag — bottom-right corner, appears on hover */
        .sc-index-tag {
          position: absolute;
          bottom: 0.75rem;
          right: 0.75rem;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.5rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 4px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 6;
        }
        .sc-card-wrap:hover .sc-index-tag { opacity: 1; }

        /* ── Section header ── */
        .sc-section-header {
          padding: 8rem 2rem 3.4rem;
          position: relative;
          z-index: 1;
        }
        @media(min-width:640px)  { .sc-section-header { padding: 8rem 4rem 3.2rem; } }
        @media(min-width:768px)  { .sc-section-header { padding: 8rem 6rem 2.2rem; } }
        @media(min-width:1280px) { .sc-section-header { padding: 8rem 8rem 2.1rem; } }
        @media(min-width:1536px) { .sc-section-header { padding: 8rem 12rem 2.1rem; } }

        .sc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.74rem;
          font-family: ui-monospace, Menlo, monospace;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          font-weight: 700;
          color: #E31B54;
          margin-bottom: 1rem;
        }
        .sc-eyebrow-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #E31B54;
          box-shadow: 0 0 6px rgba(227,27,84,0.7);
          animation: eyepulse 2s ease-in-out infinite;
        }
        @keyframes eyepulse {
          0%,100% { box-shadow: 0 0 6px rgba(227,27,84,0.7); }
          50% { box-shadow: 0 0 14px rgba(227,27,84,1); }
        }

        .sc-heading {
          font-size: clamp(2.2rem, 4.8vw, 3.45rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.15;
          background: linear-gradient(135deg, #f1f5f9 0%, rgba(241,245,249,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.75rem;
        }

        .sc-subheading {
          font-size: clamp(1.02rem, 1.45vw, 1.24rem);
          line-height: 1.7;
          color: rgba(255,255,255,0.4);
          font-family: ui-sans-serif, system-ui, sans-serif;
        }

        .sc-heading-rule {
          width: 48px; height: 2px;
          background: #E31B54;
          border-radius: 999px;
          box-shadow: 0 0 8px rgba(227,27,84,0.5);
          margin-top: 1.25rem;
        }

        /* ── Scroll hint ── */
        .sc-hint {
          position: fixed;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          animation: hintpulse 2s ease-in-out infinite;
          pointer-events: none;
          z-index: 9999;
        }
        .sc-hint-line {
          width: 1px; height: 32px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.25));
          animation: hintline 2s ease-in-out infinite;
        }
        @keyframes hintpulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes hintline {
          0%   { transform: scaleY(0); transform-origin: top; }
          50%  { transform: scaleY(1); transform-origin: top; }
          51%  { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }

        @media(max-width:767px) {
          .sc-section-header {
            padding: 5rem 1rem 2rem;
          }
          .sc-subheading {
            font-size: 0.96rem;
            line-height: 1.6;
            max-width: 60ch;
          }
          .sc-outer {
            height: auto;
          }
          .sc-pinned {
            height: auto;
            padding: 1.25rem 1rem 2rem;
            align-items: flex-start;
            flex-direction: column;
            overflow: visible;
            width: 100%;
          }
          .sc-stack {
            height: min(460px, 72vh);
            display: block;
            overflow: visible;
            margin-top: 0.55rem;
            width: 100%;
          }
          .sc-glow {
            display: block;
            opacity: 0.75;
          }
          .sc-glow::before {
            filter: blur(3.2vmin);
          }
          .sc-card-wrap {
            position: absolute;
            inset: 0;
            box-shadow: 0 24px 48px rgba(0,0,0,0.35);
            transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
            touch-action: pan-y;
          }
          .sc-card {
            padding: 1.15rem;
            gap: 0.95rem;
          }
          .sc-card-mid {
            justify-content: flex-start;
            gap: 0.55rem;
          }
          .sc-tagline {
            font-size: 0.52rem;
          }
          .sc-title {
            font-size: clamp(1.55rem, 8.4vw, 2.45rem);
            line-height: 1.04;
          }
          .sc-title-rule {
            max-width: 100%;
            opacity: 1;
          }
          .sc-card-bot {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.85rem;
          }
          .sc-desc {
            max-width: none;
            font-size: 0.78rem;
            line-height: 1.6;
            opacity: 0.84;
            font-style: normal;
          }
          .sc-stat {
            text-align: left;
          }
          .sc-stat-num {
            font-size: 2rem;
          }
          .sc-index-tag {
            opacity: 1;
            font-size: 0.46rem;
          }
          .sc-mobile-swipe-hint {
            position: static;
            pointer-events: none;
            font-family: ui-monospace, Menlo, monospace;
            font-size: 0.48rem;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.62);
            background: rgba(8,8,8,0.56);
            border: 1px solid rgba(255,255,255,0.14);
            border-radius: 999px;
            padding: 0.28rem 0.48rem;
            backdrop-filter: blur(4px);
            white-space: nowrap;
          }
          .sc-mobile-swipe-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.6rem;
            margin-top: 1.65rem;
            margin-bottom: 0.35rem;
            width: 100%;
            padding: 0 0.15rem;
          }
          .sc-mobile-progress {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.45rem;
            margin-top: 0.35rem;
          }
          .sc-mobile-progress-dash {
            width: 34px;
            height: 3px;
            border-radius: 999px;
            background: rgba(255,255,255,0.2);
            transition: background-color 160ms ease, box-shadow 160ms ease;
          }
          .sc-mobile-progress-dash.active {
            background: #E31B54;
            box-shadow: 0 0 8px rgba(227,27,84,0.55);
          }
          .sc-card-wrap:hover .sc-title {
            letter-spacing: 0.01em;
          }
          .sc-card-wrap:hover .sc-title-rule {
            max-width: 100%;
            opacity: 1;
            box-shadow: none;
          }
          .sc-card-wrap:hover .sc-desc {
            opacity: 0.84;
            transform: none;
          }
          .sc-card-wrap:hover .sc-stat {
            transform: none;
          }
          .sc-card-wrap:hover .sc-index-tag {
            opacity: 1;
          }
          .sc-title,
          .sc-title-rule,
          .sc-desc,
          .sc-stat,
          .sc-index-tag {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      {/* Section wrapper with dotted bg */}
      <div style={{
        position: "relative",
        background: "#080808",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.13) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        borderTop: "1px dashed rgba(255,255,255,0.12)",
        borderBottom: "1px dashed rgba(255,255,255,0.12)",
        paddingTop: "2.5rem",
        paddingBottom: "2.5rem",
      }}>

      {/* Section Header */}
      <div className="sc-section-header">
        <span className="sc-eyebrow">
          <span className="sc-eyebrow-dot" />
          What We Deliver
        </span>
        <h2 className="sc-heading">Capabilities We Offer.</h2>
        <p className="sc-subheading">
          From intelligence processing to mission-critical platforms, we provide the systems, structure, and technical foundation organizations need to operate with confidence.
        </p>
        <div className="sc-heading-rule" />
      </div>

      {/* Outer — 400vh scroll distance */}
      <div ref={outerRef} className="sc-outer">
        {/* Inner — GSAP pins this */}
        <div ref={stickyRef} className="sc-pinned">
          <div
            className="sc-stack"
            onPointerDown={(event) => {
              if (!isMobile) return;
              swipeStartXRef.current = event.clientX;
              swipeStartYRef.current = event.clientY;
              didSwipeRef.current = false;
            }}
            onPointerUp={(event) => {
              if (!isMobile || swipeStartXRef.current === null || swipeStartYRef.current === null) return;
              const deltaX = event.clientX - swipeStartXRef.current;
              const deltaY = event.clientY - swipeStartYRef.current;
              swipeStartXRef.current = null;
              swipeStartYRef.current = null;
              if (Math.abs(deltaX) < 30 || Math.abs(deltaX) < Math.abs(deltaY)) return;
              didSwipeRef.current = true;
              if (deltaX > 0) advanceMobileDeck();
              if (deltaX < 0) retreatMobileDeck();
            }}
            onClick={() => {
              if (!isMobile) return;
              if (didSwipeRef.current) {
                didSwipeRef.current = false;
                return;
              }
              advanceMobileDeck();
            }}
          >
            <div className="sc-glow" />
            {CARDS.map((card, i) => {
              const isLight = card.bg === "#f5f0e8";

              const titleRuleGradient = isLight
                ? "linear-gradient(90deg, #E31B54, rgba(227,27,84,0.2))"
                : "linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.05))";

              const titleRuleGlow = isLight
                ? "0 0 6px rgba(227,27,84,0.4)"
                : "0 0 6px rgba(255,255,255,0.2)";

              const indexTagBg = isLight
                ? "rgba(227,27,84,0.1)"
                : "rgba(255,255,255,0.08)";

              return (
                <div
                  key={card.id}
                  className="sc-card-wrap"
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  style={{
                    ...(isMobile ? getMobileCardStyle(i) : { zIndex: i + 1 }),
                  } as unknown as React.CSSProperties}
                  onMouseEnter={() => {
                    if (!isMobile) setHoveredCard(card.id);
                  }}
                  onMouseLeave={() => {
                    if (!isMobile) setHoveredCard(null);
                  }}
                >
                  {/* Card inner surface */}
                  <div
                    className="sc-card"
                    style={{ background: card.bg, color: card.textColor }}
                  >
                    {/* Middle */}
                    <div className="sc-card-mid">
                      <span className="sc-tagline" style={{ color: card.textColor }}>
                        {card.tagline}
                      </span>
                      <div className="sc-title-row">
                        <div className="sc-title" style={{ color: card.textColor }}>
                          {card.label}
                        </div>
                        <div
                          className="sc-title-rule"
                          style={{
                            background: titleRuleGradient,
                            boxShadow: hoveredCard === card.id ? titleRuleGlow : "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="sc-card-bot">
                      <p className="sc-desc" style={{ color: card.textColor }}>
                        {card.desc}
                      </p>
                      <div className="sc-stat">
                        <div className="sc-stat-num" style={{ color: card.accent }}>
                          {card.stat}
                        </div>
                        <span className="sc-stat-label" style={{ color: card.textColor }}>
                          {card.statLabel}
                        </span>
                      </div>
                    </div>

                    {/* Index tag */}
                    <div
                      className="sc-index-tag"
                      style={{ background: indexTagBg, color: card.accent }}
                    >
                      {card.id}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {isMobile && (
            <>
              <div className="sc-mobile-swipe-row">
                <div className="sc-mobile-swipe-hint">Slide Next</div>
                <div className="sc-mobile-swipe-hint">Slide Back</div>
              </div>
              <div className="sc-mobile-progress" aria-label={`Card ${mobileStep + 1} of ${CARDS.length}`}>
                {CARDS.map((card, idx) => (
                  <span
                    key={`mobile-progress-${card.id}`}
                    className={`sc-mobile-progress-dash${idx <= mobileStep ? " active" : ""}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      </div>{/* end dotted bg wrapper */}

      {/* Scroll hint */}
      {!isMobile && showScrollHint && (
        <div className="sc-hint">
          Scroll
          <div className="sc-hint-line" />
        </div>
      )}
    </>
  );
}
