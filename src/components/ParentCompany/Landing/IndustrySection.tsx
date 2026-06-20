"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import governmentCardPng from "./government-card.webp";
import defenseCardPng from "./defense-card.webp";
import healthcareCardPng from "./healthcare-card.webp";
import enterpriseCardPng from "./enterprise-card.webp";
import energyCardPng from "./energy-card.webp";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Industry = {
  id: string;
  title: string;
  tag: string;
  description: string;
  href: string;
};

type IndustryCardElement = HTMLElement & {
  __industryGlowRaf?: number;
  __industryGlowX?: number;
  __industryGlowY?: number;
  __industryGlowRect?: DOMRect;
};

const INDUSTRIES: Industry[] = [
  {
    id: "government",
    title: "Government",
    tag: "Public Sector",
    description: "Unified public-sector systems for faster, accountable, and coordinated service delivery.",
    href: "/technologies/civic-operations",
  },
  {
    id: "defense",
    title: "Defense",
    tag: "National Security",
    description: "Command environments for decisive coordination, rapid response, and operational clarity.",
    href: "/technologies/defense",
  },
  {
    id: "healthcare",
    title: "Healthcare",
    tag: "Clinical Systems",
    description: "Clinical platforms that improve coordination, data trust, and care delivery speed.",
    href: "/technologies/healthcare",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    tag: "Business Operations",
    description: "Execution systems that align workflows, visibility, and cross-functional decisions.",
    href: "/technologies/enterprise",
  },
  {
    id: "energy",
    title: "Energy",
    tag: "Critical Infrastructure",
    description: "Infrastructure intelligence for uptime, early risk signals, and resilient grid continuity.",
    href: "/technologies/energy",
  },
];

const INDUSTRY_CARD_ART: Record<string, string | undefined> = {
  government: governmentCardPng.src,
  defense: defenseCardPng.src,
  healthcare: healthcareCardPng.src,
  enterprise: enterpriseCardPng.src,
  energy: energyCardPng.src,
};

const MOBILE_BREAKPOINT = 768;

function getVisibleCardCount(width: number) {
  if (width >= 1720) return 3;
  if (width >= 1280) return 3;
  if (width >= 960) return 2.2;
  if (width >= 640) return 1.45;
  return 1.05;
}

export default function IndustrySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const progressFillRef = useRef<HTMLSpanElement | null>(null);
  const lastProgressRef = useRef(-1);
  const refreshRafRef = useRef<number | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(3);

  const queueGlowUpdate = (target: IndustryCardElement, clientX: number, clientY: number) => {
    if (!target.__industryGlowRect) {
      target.__industryGlowRect = target.getBoundingClientRect();
    }

    let x = clientX - target.__industryGlowRect.left;
    let y = clientY - target.__industryGlowRect.top;

    // Re-measure only when pointer leaves cached bounds (e.g., after scroll/layout shift).
    if (
      x < -12 ||
      y < -12 ||
      x > target.__industryGlowRect.width + 12 ||
      y > target.__industryGlowRect.height + 12
    ) {
      target.__industryGlowRect = target.getBoundingClientRect();
      x = clientX - target.__industryGlowRect.left;
      y = clientY - target.__industryGlowRect.top;
    }

    target.__industryGlowX = x;
    target.__industryGlowY = y;

    if (target.__industryGlowRaf !== undefined) return;
    target.__industryGlowRaf = window.requestAnimationFrame(() => {
      target.style.setProperty("--mouse-x", `${target.__industryGlowX ?? 0}px`);
      target.style.setProperty("--mouse-y", `${target.__industryGlowY ?? 0}px`);
      target.__industryGlowRaf = undefined;
    });
  };

  const handleCardPointerEnter = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    queueGlowUpdate(event.currentTarget as IndustryCardElement, event.clientX, event.clientY);
  };

  const handleCardPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    queueGlowUpdate(event.currentTarget as IndustryCardElement, event.clientX, event.clientY);
  };

  const handleCardPointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.currentTarget as IndustryCardElement;
    if (target.__industryGlowRaf !== undefined) {
      window.cancelAnimationFrame(target.__industryGlowRaf);
      target.__industryGlowRaf = undefined;
    }
    target.__industryGlowRect = undefined;
    target.__industryGlowX = undefined;
    target.__industryGlowY = undefined;
    target.style.removeProperty("--mouse-x");
    target.style.removeProperty("--mouse-y");
  };

  useEffect(() => {
    const syncViewportState = () => {
      const width = window.innerWidth;
      setIsMobile(width < MOBILE_BREAKPOINT);
      setCardsVisible(getVisibleCardCount(width));
    };

    syncViewportState();
    window.addEventListener("resize", syncViewportState);
    return () => window.removeEventListener("resize", syncViewportState);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const section = sectionRef.current;
    const sticky = stickyRef.current;

    if (!viewport || !track || !section || !sticky) return;

    const setProgress = (progress: number) => {
      const clamped = Math.min(Math.max(progress, 0), 1);
      if (progressFillRef.current && Math.abs(clamped - lastProgressRef.current) > 0.001) {
        lastProgressRef.current = clamped;
        progressFillRef.current.style.transform = `scaleX(${clamped})`;
      }
    };

    if (isMobile) {
      gsap.set(track, { clearProps: "transform" });

      const syncMobileProgress = () => {
        const maxScroll = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
        setProgress(viewport.scrollLeft / maxScroll);
      };

      syncMobileProgress();
      viewport.addEventListener("scroll", syncMobileProgress, { passive: true });

      return () => {
        viewport.removeEventListener("scroll", syncMobileProgress);
      };
    }

    let ctx: gsap.Context | null = null;
    let observer: ResizeObserver | null = null;

    const setup = () => {
      ctx = gsap.context(() => {
        const getTravelDistance = () => {
          const baseTravel = Math.max(0, track.scrollWidth - viewport.clientWidth);
          const lastCard = cardRefs.current[INDUSTRIES.length - 1];
          if (!lastCard) return baseTravel;

          // Keep scrolling until the final card reaches viewport center.
          const centerTravel = Math.max(
            0,
            (lastCard.offsetLeft + lastCard.offsetWidth / 2) - viewport.clientWidth / 2,
          );

          // Small bias keeps the last card clearly centered before the section releases.
          const centerBias = Math.max(16, viewport.clientWidth * 0.04);

          return Math.max(baseTravel, centerTravel + centerBias);
        };

        gsap.set(track, { x: 0 });
        setProgress(0);

        gsap.to(track, {
          x: () => -getTravelDistance(),
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: section,
            start: "bottom bottom",
            end: () => `+=${getTravelDistance()}`,
            pin: sticky,
            scrub: 0.35,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setProgress(self.progress),
          },
        });
      }, section);

      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          if (refreshRafRef.current !== null) return;
          refreshRafRef.current = window.requestAnimationFrame(() => {
            refreshRafRef.current = null;
            ScrollTrigger.refresh();
          });
        });

        observer.observe(viewport);
        observer.observe(track);
      }
    };

    const timeoutId = window.setTimeout(setup, 60);

    return () => {
      window.clearTimeout(timeoutId);
      if (refreshRafRef.current !== null) {
        window.cancelAnimationFrame(refreshRafRef.current);
        refreshRafRef.current = null;
      }
      observer?.disconnect();
      ctx?.revert();
    };
  }, [cardsVisible, isMobile]);

  return (
    <>
      <style>{`
        .industry-section {
          --site-gutter-inline: 2rem;
          --industry-gap: clamp(0.85rem, 1.2vw, 1.25rem);
          --rail-pad-start: var(--site-gutter-inline);
          --rail-pad-end: clamp(0.85rem, 1.2vw, 1.25rem);
          --industry-visible: 3;
          --industry-radius: clamp(14px, 1.4vw, 20px);
          position: relative;
          background-color: #040507;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--content-primary, #fff);
          overflow: clip;
        }

        @media(min-width:640px){ .industry-section { --site-gutter-inline: 4rem; } }
        @media(min-width:768px){ .industry-section { --site-gutter-inline: 6rem; } }
        @media(min-width:1280px){ .industry-section { --site-gutter-inline: 8rem; } }
        @media(min-width:1536px){ .industry-section { --site-gutter-inline: 12rem; } }

        :root.light .industry-section {
          background-color: #f4f6fa;
          border-top: 1px solid rgba(0, 0, 0, 0.07);
          border-bottom: 1px solid rgba(0, 0, 0, 0.07);
        }

        .industry-sticky {
          min-height: 100vh;
          height: 100vh;
          height: 100svh;
          position: relative;
          isolation: isolate;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          gap: clamp(1.6rem, 2.8vw, 2.8rem);
          padding-block: clamp(4.2rem, 6vw, 6.4rem) clamp(3rem, 3.8vw, 4rem);
          overflow: hidden;
        }

        /* Refined engineered-grid backdrop — softer than before, with a brand-red
           wash bleeding in from the right so the rail feels lit, not noisy. */
        .industry-sticky::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 132px),
            repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 132px);
          background-size: 132px 132px;
          background-position: center;
          mask-image: radial-gradient(120% 90% at 50% 0%, #000 35%, transparent 100%);
          -webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 35%, transparent 100%);
          opacity: 0.6;
        }

        .industry-sticky::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.42) 100%);
        }

        :root.light .industry-sticky::before {
          background-image:
            repeating-linear-gradient(90deg, rgba(15, 23, 42, 0.06) 0 1px, transparent 1px 132px),
            repeating-linear-gradient(0deg, rgba(15, 23, 42, 0.06) 0 1px, transparent 1px 132px);
          opacity: 0.5;
        }

        :root.light .industry-sticky::after {
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0) 55%, rgba(226, 232, 240, 0.5) 100%);
        }

        .industry-header-shell {
          padding-inline: var(--site-gutter-inline);
          position: relative;
          z-index: 2;
        }

        .industry-header {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: clamp(1rem, 2vw, 2.5rem);
        }

        .industry-header-main {
          max-width: 74rem;
        }

        .industry-eyebrow {
          margin: 0 0 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.7rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.46);
        }

        .industry-eyebrow::before {
          content: "";
          width: 1.9rem;
          height: 1px;
          background: linear-gradient(90deg, #E31B54, rgba(227, 27, 84, 0.1));
        }

        :root.light .industry-eyebrow {
          color: rgba(15, 23, 42, 0.5);
        }

        .industry-heading {
          margin: 0;
          max-width: none;
          font-size: clamp(2.2rem, 4.8vw, 3.45rem);
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.12;
          text-wrap: pretty;
        }

        .industry-copy {
          max-width: 70rem;
          margin: 0.95rem 0 0;
          color: rgba(226, 232, 240, 0.6);
          font-size: clamp(1rem, 1.35vw, 1.14rem);
          line-height: 1.66;
        }

        :root.light .industry-copy {
          color: rgba(15, 23, 42, 0.62);
        }

        .industry-progress-shell {
          position: absolute;
          left: var(--site-gutter-inline);
          right: var(--site-gutter-inline);
          bottom: clamp(1rem, 2vw, 1.7rem);
          z-index: 4;
          pointer-events: none;
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .industry-progress-track {
          flex: 1;
          height: 2px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        :root.light .industry-progress-track {
          background: rgba(15, 23, 42, 0.1);
        }

        .industry-progress-fill {
          display: block;
          width: 100%;
          height: 100%;
          transform-origin: left center;
          transform: scaleX(0);
          background: linear-gradient(90deg, #E31B54, #ff5c84);
        }

        .industry-progress-hint {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.35);
          white-space: nowrap;
        }

        :root.light .industry-progress-hint {
          color: rgba(15, 23, 42, 0.4);
        }

        .industry-viewport {
          position: relative;
          z-index: 2;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          /* Vertical breathing room so the card's top border + hover lift aren't
             clipped by the viewport's overflow mask. */
          padding-block: 10px;
          display: flex;
          align-items: stretch;
        }

        .industry-track {
          display: grid;
          grid-auto-flow: column;
          align-items: stretch;
          padding-left: var(--rail-pad-start);
          padding-right: var(--rail-pad-end);
          grid-auto-columns: calc(
            (
              100vw
              - var(--rail-pad-start)
              - var(--rail-pad-end)
              - ((var(--industry-visible) - 1) * var(--industry-gap))
            )
            / var(--industry-visible)
          );
          gap: var(--industry-gap);
          width: max-content;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .industry-card {
          position: relative;
          height: 100%;
          min-height: 0;
          max-height: 56rem;
          border-radius: var(--industry-radius);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: clamp(1.4rem, 2vw, 2.1rem);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 1rem;
          background: #0a0d12;
          overflow: hidden;
          contain: layout paint style;
          backface-visibility: hidden;
          isolation: isolate;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          opacity: 0.86;
          transition: opacity 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.4s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .industry-card:hover,
        .industry-card:focus-visible {
          opacity: 1;
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow: 0 18px 50px -24px rgba(0, 0, 0, 0.8);
          transform: translateY(-4px);
        }

        .industry-card:focus-visible {
          outline: 1px solid rgba(227, 27, 84, 0.8);
          outline-offset: 2px;
        }

        /* Signature multicolor cursor-glow border */
        .industry-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 3;
          border-radius: inherit;
          pointer-events: none;
          padding: 1px;
          background: radial-gradient(
            420px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(0, 255, 166, 0.86) 0%,
            rgba(255, 215, 0, 0.72) 22%,
            rgba(236, 72, 153, 0.68) 44%,
            rgba(147, 51, 234, 0.62) 62%,
            rgba(59, 130, 246, 0.56) 76%,
            transparent 88%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .industry-card:hover::before,
        .industry-card:focus-visible::before {
          opacity: 1;
        }

        .industry-card-media {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .industry-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          opacity: 0.9;
          transform: scale(1.03);
          transition: transform 0.6s cubic-bezier(0.2, 1, 0.3, 1), opacity 0.4s ease;
        }

        .industry-card:hover .industry-card-media img {
          transform: scale(1.08);
          opacity: 1;
        }

        /* Legibility overlay sitting above the image, below the content */
        .industry-card-media::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(5, 8, 14, 0.32) 0%, rgba(5, 8, 14, 0) 30%, rgba(5, 8, 14, 0.55) 64%, rgba(5, 8, 14, 0.95) 100%);
        }

        .industry-card-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .industry-card-tag {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(8, 11, 16, 0.5);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border-radius: 999px;
          padding: 0.28rem 0.7rem;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(248, 250, 252, 0.82);
          white-space: nowrap;
        }

        .industry-card-content {
          position: relative;
          z-index: 2;
          margin-top: auto;
        }

        .industry-card-title {
          margin: 0;
          font-size: clamp(1.5rem, 2.1vw, 2.3rem);
          line-height: 1.04;
          letter-spacing: -0.03em;
          font-weight: 700;
          color: rgba(248, 250, 252, 0.98);
        }

        .industry-card-description {
          margin: 0.7rem 0 0;
          font-size: clamp(0.9rem, 1vw, 1.02rem);
          line-height: 1.55;
          color: rgba(226, 232, 240, 0.82);
          width: 100%;
          max-width: none;
          text-wrap: pretty;
        }

        .industry-card-cta {
          margin-top: 1.2rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: rgba(248, 250, 252, 0.9);
        }

        .industry-card-cta i {
          font-size: 0.95em;
          color: #E31B54;
          transition: transform 0.3s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .industry-card:hover .industry-card-cta i,
        .industry-card:focus-visible .industry-card-cta i {
          transform: translateX(4px);
        }

        :root.light .industry-card {
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          opacity: 1;
        }

        :root.light .industry-card:hover,
        :root.light .industry-card:focus-visible {
          border-color: rgba(15, 23, 42, 0.22);
          box-shadow: 0 20px 50px -28px rgba(15, 23, 42, 0.45);
        }

        :root.light .industry-card-tag {
          border-color: rgba(15, 23, 42, 0.16);
          background: rgba(255, 255, 255, 0.6);
          color: rgba(15, 23, 42, 0.78);
        }

        @media (max-width: 1199px) {
          .industry-header {
            flex-direction: column;
            align-items: flex-start;
            row-gap: 1rem;
          }
        }

        @media (max-width: 767px) {
          .industry-section {
            overflow: visible;
          }

          .industry-sticky {
            min-height: auto;
            height: auto;
            gap: 1.6rem;
            padding-top: 3.8rem;
            padding-bottom: 3.4rem;
          }

          .industry-viewport {
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            -ms-overflow-style: none;
            overscroll-behavior-x: contain;
            padding-bottom: 0.5rem;
          }

          .industry-viewport::-webkit-scrollbar {
            display: none;
          }

          .industry-track {
            padding-inline: var(--site-gutter-inline);
            grid-auto-columns: min(82vw, 27rem);
          }

          .industry-card {
            height: clamp(25rem, 66vh, 33rem);
            scroll-snap-align: start;
            opacity: 1;
          }

          .industry-card-media img {
            transform: scale(1.06);
          }

          .industry-progress-shell {
            position: static;
            transform: none;
            padding-inline: var(--site-gutter-inline);
            margin-top: 0.4rem;
          }
        }

        @media (hover: none), (pointer: coarse) {
          .industry-card {
            opacity: 1;
          }
        }

        @media (max-width: 639px) {
          .industry-section {
            --site-gutter-inline: 1.25rem;
          }

          .industry-heading {
            font-size: clamp(2.02rem, 9vw, 2.85rem);
          }

          .industry-copy {
            margin-top: 0.75rem;
            font-size: 0.94rem;
          }

          .industry-card {
            padding: 1.25rem;
          }

          .industry-card-media img {
            transform: scale(1.07);
          }

          .industry-card-title {
            font-size: clamp(1.35rem, 6.6vw, 1.9rem);
          }

          .industry-card-description {
            font-size: 0.88rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .industry-card,
          .industry-card-media img,
          .industry-card-cta i {
            transition: none;
          }
        }
      `}</style>

      <section
        id="industries-we-serve"
        ref={sectionRef}
        className="industry-section"
        style={{ "--industry-visible": cardsVisible } as CSSProperties}
      >
        <div ref={stickyRef} className="industry-sticky">
          <div className="industry-header-shell">
            <header className="industry-header">
              <div className="industry-header-main">
                <p className="industry-eyebrow">Industries</p>
                <h2 className="industry-heading">Sectors We Serve.</h2>
                <p className="industry-copy">
                  Purpose-built systems deployed where reliability, speed, and accountability are
                  non-negotiable — across the sectors that keep the world running.
                </p>
              </div>
            </header>
          </div>

          <div ref={viewportRef} className="industry-viewport">
            <div ref={trackRef} className="industry-track">
              {INDUSTRIES.map((industry, index) => (
                <a
                  key={industry.id}
                  href={industry.href}
                  aria-label={`Open ${industry.title} page`}
                  onPointerEnter={handleCardPointerEnter}
                  onPointerMove={handleCardPointerMove}
                  onPointerLeave={handleCardPointerLeave}
                  onPointerCancel={handleCardPointerLeave}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className="industry-card"
                >
                  {INDUSTRY_CARD_ART[industry.id] ? (
                    <div className="industry-card-media" aria-hidden="true">
                      <img src={INDUSTRY_CARD_ART[industry.id]} alt="" loading="lazy" decoding="async" />
                    </div>
                  ) : null}
                  <div className="industry-card-top">
                    <span className="industry-card-tag">{industry.tag}</span>
                  </div>
                  <div className="industry-card-content">
                    <h3 className="industry-card-title">{industry.title}</h3>
                    <p className="industry-card-description">{industry.description}</p>
                    <span className="industry-card-cta">
                      Explore sector
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="industry-progress-shell" aria-hidden="true">
            <span className="industry-progress-hint">Scroll to explore</span>
            <div className="industry-progress-track">
              <span ref={progressFillRef} className="industry-progress-fill" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
