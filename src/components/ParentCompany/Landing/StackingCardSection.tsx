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
    desc: "When systems think and interfaces unify, control becomes absolute. We engineer coherence — so you lead with certainty in every environment.",
    bg: "#0a0a0a",
    accent: "#E31B54",
    textColor: "#ffffff",
    stat: "100%",
    statLabel: "Decision Authority",
    icon: "bi-trophy-fill",
  },
  {
    id: "02",
    label: "Intelligence",
    tagline: "Information Warfare",
    desc: "We know the landscape before decisions are made. Through data, analysis, and predictive systems, every action is prepared — and every advantage engineered.",
    bg: "#E31B54",
    accent: "#ffffff",
    textColor: "#ffffff",
    stat: "∞",
    statLabel: "Signal Range",
    icon: "bi-cpu-fill",
  },
  {
    id: "03",
    label: "Operations",
    tagline: "Execution Engine",
    desc: "Where strategy becomes reality. Converting intent into outcome with discipline, speed, and accountability. No ambiguity. No excuses. Only results.",
    bg: "#0a0a0a",
    accent: "#E31B54",
    textColor: "#ffffff",
    stat: "0ms",
    statLabel: "Tolerance for Delay",
    icon: "bi-lightning-charge-fill",
  },
];

export default function StackingCards() {
  const outerRef = useRef(null);
  const stickyRef = useRef(null);
  const swipeStartXRef = useRef<number | null>(null);
  const swipeStartYRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const [progress, setProgress] = useState(0);
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
      setProgress(1);
      setMobileStep(0);
      return;
    }

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
          onUpdate: (self) => setProgress(self.progress),
        });
      });
    }, 100);
    return () => {
      clearTimeout(id);
      ctx?.revert();
    };
  }, [isMobile]);

  const getCardStyle = (index) => {
    const p = progress;
    if (index === 0) {
      const scale = 1 - Math.min(p, 0.5) * 0.06;
      const brightness = 1 - Math.min(p, 0.5) * 0.4;
      return { transform: `scale(${scale})`, filter: `brightness(${brightness})`, zIndex: 1 };
    }
    if (index === 1) {
      const raw = Math.min(Math.max(p / 0.45, 0), 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      const translateY = (1 - eased) * 100;
      const scale = p > 0.5 ? 1 - (p - 0.5) * 0.06 : 1;
      const brightness = p > 0.5 ? 1 - (p - 0.5) * 0.8 : 1;
      return { transform: `translateY(${translateY}%) scale(${scale})`, filter: `brightness(${brightness})`, zIndex: 2 };
    }
    if (index === 2) {
      const raw = Math.min(Math.max((p - 0.5) / 0.45, 0), 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      const translateY = (1 - eased) * 100;
      return { transform: `translateY(${translateY}%)`, zIndex: 3 };
    }
    return {};
  };

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
          : `translateY(${14 + queuedOffset * 10}px) scale(${1 - queuedOffset * 0.04})`,
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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=Space+Mono:wght@400;700&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

        .sc-outer { height: 400vh; }

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
          filter: blur(2.5vmin);
          animation: sc-blur-anim 3s ease-in-out alternate infinite;
        }
        @keyframes sc-blur-anim {
          to { filter: blur(4vmin); transform: scale(1.04); }
        }

        /* ── Card wrapper ── */
        .sc-card-wrap {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          will-change: transform, filter;
          box-shadow: 0 40px 80px rgba(0,0,0,0.45), 0 0 0 0.75px rgba(255,255,255,0.06);
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
          grid-template-rows: auto 1fr auto;
          gap: 1.25rem;
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
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.5;
          mix-blend-mode: overlay;
          z-index: 0;
        }

        /* ── Corner accents ── */
        .sc-corner-tl-h, .sc-corner-tl-v,
        .sc-corner-br-h, .sc-corner-br-v {
          position: absolute;
          pointer-events: none;
          border-radius: 999px;
          transition: opacity 0.4s ease, width 0.4s ease, height 0.4s ease;
          z-index: 5;
        }
        /* Top-left — always visible */
        .sc-corner-tl-h { top: 0; left: 0; width: 44px; height: 2px; }
        .sc-corner-tl-v { top: 0; left: 0; width: 2px; height: 44px; }
        /* Bottom-right — appears on hover */
        .sc-corner-br-h { bottom: 0; right: 0; width: 36px; height: 2px; opacity: 0; }
        .sc-corner-br-v { bottom: 0; right: 0; width: 2px; height: 36px; opacity: 0; }
        .sc-card-wrap:hover .sc-corner-br-h,
        .sc-card-wrap:hover .sc-corner-br-v { opacity: 1; }

        /* ── Top row ── */
        .sc-card-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sc-id {
          font-family: 'Space Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.3rem 0.85rem;
          border-radius: 100px;
          font-weight: 700;
        }

        .sc-icon-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          font-size: 1.1rem;
          transition: transform 0.3s ease;
        }
        .sc-card-wrap:hover .sc-icon-badge { transform: translateY(-4px); }

        /* ── Middle ── */
        .sc-card-mid {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 0.35rem;
        }

        .sc-tagline {
          font-family: 'Space Mono', monospace;
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
          overflow: hidden;
        }

        .sc-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 11vw, 6.5rem);
          line-height: 0.92;
          letter-spacing: 0.01em;
          flex-shrink: 0;
          transition: letter-spacing 0.45s cubic-bezier(0.4,0,0.2,1);
        }
        .sc-card-wrap:hover .sc-title { letter-spacing: 0.03em; }

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
          font-family: 'DM Serif Display', serif;
          font-size: clamp(0.8rem, 1.4vw, 0.95rem);
          line-height: 1.7;
          opacity: 0.6;
          max-width: 58ch;
          font-style: italic;
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
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.8rem, 5vw, 3rem);
          line-height: 1;
          letter-spacing: 0.02em;
        }

        .sc-stat-label {
          font-family: 'Space Mono', monospace;
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
          font-family: 'Space Mono', monospace;
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
          padding: 8rem 2rem 4rem;
          position: relative;
          z-index: 1;
        }
        @media(min-width:640px)  { .sc-section-header { padding: 8rem 4rem 4rem; } }
        @media(min-width:768px)  { .sc-section-header { padding: 8rem 6rem 4rem; } }
        @media(min-width:1280px) { .sc-section-header { padding: 8rem 8rem 4rem; } }
        @media(min-width:1536px) { .sc-section-header { padding: 8rem 12rem 4rem; } }

        .sc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.62rem;
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
          font-size: clamp(1.75rem, 4vw, 2.75rem);
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
          font-size: 0.9rem;
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
          font-family: 'Space Mono', monospace;
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
            font-size: 0.82rem;
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
            box-shadow: 0 24px 48px rgba(0,0,0,0.35), 0 0 0 0.75px rgba(255,255,255,0.06);
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
          .sc-icon-badge {
            width: 30px;
            height: 30px;
            font-size: 0.95rem;
          }
          .sc-tagline {
            font-size: 0.52rem;
          }
          .sc-title {
            font-size: clamp(2rem, 11vw, 3.2rem);
            line-height: 0.96;
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
            font-family: 'Space Mono', monospace;
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
          .sc-card-wrap:hover .sc-corner-br-h,
          .sc-card-wrap:hover .sc-corner-br-v {
            opacity: 0;
          }
          .sc-card-wrap:hover .sc-icon-badge {
            transform: none;
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
          .sc-icon-badge,
          .sc-title,
          .sc-title-rule,
          .sc-desc,
          .sc-stat,
          .sc-index-tag,
          .sc-corner-br-h,
          .sc-corner-br-v {
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
          What We Do
        </span>
        <h2 className="sc-heading">What We Can Offer You.</h2>
        <p className="sc-subheading">
          In an advancing world defined by complexity, precision is not optional — it is required.
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
              const isDark = card.bg === "#0a0a0a";
              const isRed = card.bg === "#E31B54";

              const cornerColor = isLight
                ? "rgba(227,27,84,0.55)"
                : "rgba(255,255,255,0.35)";

              const idBg = isRed
                ? "rgba(255,255,255,0.18)"
                : "rgba(227,27,84,0.12)";
              const idColor = card.accent;

              const iconBg = isLight
                ? "rgba(227,27,84,0.1)"
                : "rgba(255,255,255,0.1)";

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
                  style={{
                    ...(isMobile ? getMobileCardStyle(i) : getCardStyle(i)),
                  } as unknown as React.CSSProperties}
                  onMouseEnter={() => {
                    if (!isMobile) setHoveredCard(card.id);
                  }}
                  onMouseLeave={() => {
                    if (!isMobile) setHoveredCard(null);
                  }}
                >

                  {/* Corner accents — top-left (always) */}
                  <div className="sc-corner-tl-h" style={{ background: `linear-gradient(90deg, ${cornerColor}, transparent)` }} />
                  <div className="sc-corner-tl-v" style={{ background: `linear-gradient(to bottom, ${cornerColor}, transparent)` }} />
                  {/* Corner accents — bottom-right (hover) */}
                  <div className="sc-corner-br-h" style={{ background: `linear-gradient(270deg, ${cornerColor}, transparent)` }} />
                  <div className="sc-corner-br-v" style={{ background: `linear-gradient(to top, ${cornerColor}, transparent)` }} />

                  {/* Card inner surface */}
                  <div
                    className="sc-card"
                    style={{ background: card.bg, color: card.textColor }}
                  >
                    {/* Top row */}
                    <div className="sc-card-top">
                      <span className="sc-id" style={{ background: idBg, color: idColor }}>
                        Unit {card.id}
                      </span>
                      <div
                        className="sc-icon-badge"
                        style={{ background: iconBg, color: card.accent }}
                      >
                        <i className={`bi ${card.icon}`} />
                      </div>
                    </div>

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
      {!isMobile && progress < 0.05 && (
        <div className="sc-hint">
          Scroll
          <div className="sc-hint-line" />
        </div>
      )}
    </>
  );
}
