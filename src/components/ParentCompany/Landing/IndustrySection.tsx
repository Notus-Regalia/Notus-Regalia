"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import governmentCardPng from "./government-card.png";
import defenseCardPng from "./defense-card.png";
import healthcareCardPng from "./healthcare-card.png";
import enterpriseCardPng from "./enterprise-card.png";
import energyCardPng from "./energy-card.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Industry = {
  id: string;
  title: string;
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
    description: "Unified public-sector systems for faster, accountable, and coordinated service delivery.",
    href: "/technologies/civic-operations",
  },
  {
    id: "defense",
    title: "Defense",
    description: "Command environments for decisive coordination, rapid response, and operational clarity.",
    href: "/defense",
  },
  {
    id: "healthcare",
    title: "Healthcare",
    description: "Clinical platforms that improve coordination, data trust, and care delivery speed.",
    href: "/technologies/healthcare",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    description: "Execution systems that align workflows, visibility, and cross-functional decisions.",
    href: "/technologies/enterprise",
  },
  {
    id: "energy",
    title: "Energy",
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
          --industry-gap: clamp(0.5rem, 0.85vw, 0.8rem);
          --rail-pad-start: var(--site-gutter-inline);
          --rail-pad-end: clamp(0.35rem, 0.9vw, 0.75rem);
          --industry-visible: 3;
          position: relative;
          background-color: #040507;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
          color: var(--content-primary, #fff);
          overflow: clip;
        }

        @media(min-width:640px){ .industry-section { --site-gutter-inline: 4rem; } }
        @media(min-width:768px){ .industry-section { --site-gutter-inline: 6rem; } }
        @media(min-width:1280px){ .industry-section { --site-gutter-inline: 8rem; } }
        @media(min-width:1536px){ .industry-section { --site-gutter-inline: 12rem; } }

        :root.light .industry-section {
          background-color: #f4f6fa;
          border-top: 1px dashed rgba(0, 0, 0, 0.08);
          border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
        }

        .industry-sticky {
          min-height: 122vh;
          height: 122vh;
          position: relative;
          isolation: isolate;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          gap: clamp(1.9rem, 3.2vw, 3.2rem);
          padding-block: clamp(5.4rem, 7.2vw, 8.2rem) clamp(1.4rem, 2.2vw, 2.2rem);
          overflow: hidden;
        }

        .industry-sticky::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.12) 0 1px,
              transparent 1px 112px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.12) 0 1px,
              transparent 1px 112px
            ),
            repeating-linear-gradient(
              45deg,
              transparent 0 38px,
              rgba(255, 255, 255, 0.04) 38px 40px,
              transparent 40px 78px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent 0 38px,
              rgba(255, 255, 255, 0.04) 38px 40px,
              transparent 40px 78px
            ),
            radial-gradient(
              circle,
              rgba(255, 255, 255, 0.84) 0 1.4px,
              transparent 1.5px
            );
          background-size: 112px 112px, 112px 112px, 112px 112px, 112px 112px, 112px 112px;
          background-position: center;
          opacity: 0.52;
        }

        .industry-sticky::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(circle at center, transparent 22%, rgba(0, 0, 0, 0.34) 100%),
            linear-gradient(180deg, rgba(0, 0, 0, 0.16) 0%, rgba(0, 0, 0, 0.48) 100%);
        }

        :root.light .industry-sticky::before {
          background-image:
            repeating-linear-gradient(
              90deg,
              rgba(15, 23, 42, 0.13) 0 1px,
              transparent 1px 112px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(15, 23, 42, 0.13) 0 1px,
              transparent 1px 112px
            ),
            repeating-linear-gradient(
              45deg,
              transparent 0 38px,
              rgba(15, 23, 42, 0.045) 38px 40px,
              transparent 40px 78px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent 0 38px,
              rgba(15, 23, 42, 0.045) 38px 40px,
              transparent 40px 78px
            ),
            radial-gradient(
              circle,
              rgba(15, 23, 42, 0.58) 0 1.35px,
              transparent 1.5px
            );
          opacity: 0.42;
        }

        :root.light .industry-sticky::after {
          background:
            radial-gradient(circle at center, transparent 18%, rgba(148, 163, 184, 0.2) 100%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(203, 213, 225, 0.24) 100%);
        }

        .industry-header-shell {
          padding-inline: var(--site-gutter-inline);
          position: relative;
          z-index: 2;
        }

        .industry-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          column-gap: clamp(1rem, 1.8vw, 2rem);
          align-items: end;
        }

        .industry-heading {
          margin: 0;
          max-width: none;
          font-size: clamp(2.2rem, 4.8vw, 3.45rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.14;
          text-wrap: pretty;
        }

        .industry-copy {
          max-width: 58rem;
          margin: 0.8rem 0 0;
          color: rgba(226, 232, 240, 0.62);
          font-size: clamp(1.02rem, 1.45vw, 1.2rem);
          line-height: 1.68;
        }

        :root.light .industry-copy {
          color: rgba(15, 23, 42, 0.66);
        }

        .industry-progress-shell {
          position: absolute;
          left: 50%;
          bottom: clamp(0.75rem, 1.8vw, 1.45rem);
          transform: translateX(-50%);
          z-index: 4;
          pointer-events: none;
        }

        .industry-progress-track {
          width: clamp(11rem, 26vw, 18rem);
          height: 2px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          overflow: hidden;
        }

        :root.light .industry-progress-track {
          background: rgba(15, 23, 42, 0.12);
        }

        .industry-progress-fill {
          display: block;
          width: 100%;
          height: 100%;
          transform-origin: left center;
          transform: scaleX(0);
          background: #E31B54;
        }

        .industry-viewport {
          position: relative;
          z-index: 2;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          display: flex;
          align-items: flex-start;
        }

        .industry-track {
          display: grid;
          grid-auto-flow: column;
          align-items: start;
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
          height: clamp(28rem, 74vh, 56rem);
          min-height: 0;
          border-radius: 0;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: clamp(1.25rem, 1.8vw, 1.8rem);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          background: linear-gradient(180deg, rgba(11, 14, 19, 0.68) 0%, rgba(8, 11, 16, 0.9) 52%, rgba(6, 9, 14, 0.98) 100%);
          contain: layout paint style;
          backface-visibility: hidden;
          isolation: isolate;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          opacity: 0.78;
          transition: opacity 0.22s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .industry-card:hover,
        .industry-card:focus-visible {
          opacity: 1;
        }

        .industry-card:focus-visible {
          outline: 1px solid rgba(227, 27, 84, 0.75);
          outline-offset: -1px;
        }

        .industry-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 3;
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
          transition: opacity 0.24s ease;
        }

        .industry-card:hover::before,
        .industry-card:focus-visible::before {
          opacity: 1;
        }

        .industry-card::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 62%;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(
              180deg,
              rgba(5, 8, 14, 0) 0%,
              rgba(5, 8, 14, 0.62) 52%,
              rgba(5, 8, 14, 0.94) 100%
            );
        }

        .industry-card-media {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          display: flex;
          align-items: stretch;
          justify-content: center;
        }

        .industry-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          opacity: 0.94;
          transform: scale(1.02);
        }

        .industry-card-content {
          position: relative;
          z-index: 2;
          margin-top: auto;
        }

        :root.light .industry-card {
          border: 1px solid rgba(15, 23, 42, 0.15);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(250, 252, 255, 0.96) 44%, rgba(242, 246, 252, 1) 100%);
          opacity: 1;
        }

        :root.light .industry-card::after {
          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(247, 250, 255, 0.86) 52%,
              rgba(242, 246, 252, 1) 100%
            );
        }

        :root.light .industry-card:focus-visible {
          outline-color: rgba(227, 27, 84, 0.8);
        }

        .industry-card-title {
          margin: 0;
          font-size: clamp(1.42rem, 2vw, 2.22rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: rgba(248, 250, 252, 0.98);
          display: inline-flex;
          align-items: center;
          gap: 1.1rem;
        }

        .industry-card-title i {
          font-size: 0.65em;
          line-height: 1;
          opacity: 0.9;
        }

        .industry-card-description {
          margin: 0.8rem 0 0;
          font-size: clamp(0.9rem, 1vw, 1.04rem);
          line-height: 1.5;
          color: rgba(226, 232, 240, 0.84);
          width: 100%;
          max-width: none;
          text-wrap: pretty;
        }

        :root.light .industry-card-title {
          color: rgba(15, 23, 42, 0.94);
        }

        :root.light .industry-card-description {
          color: rgba(15, 23, 42, 0.72);
        }

        @media (max-width: 1199px) {
          .industry-header {
            grid-template-columns: 1fr;
            row-gap: 0.85rem;
          }

          .industry-progress-track {
            width: clamp(10rem, 42vw, 14.5rem);
          }
        }

        @media (max-width: 767px) {
          .industry-section {
            overflow: visible;
          }

          .industry-sticky {
            min-height: auto;
            height: auto;
            gap: 1.45rem;
            padding-top: 3.8rem;
            padding-bottom: 3.1rem;
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

          .industry-viewport::before,
          .industry-viewport::after {
            display: none;
          }

          .industry-track {
            padding-inline: var(--site-gutter-inline);
            grid-auto-columns: min(86vw, 28rem);
          }

          .industry-card {
            height: clamp(24rem, 64vh, 32rem);
          }

          .industry-card-media img {
            transform: scale(1.06);
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
            margin-top: 0.7rem;
            font-size: 0.92rem;
          }

          .industry-card {
            padding: 1.1rem;
          }

          .industry-card-media img {
            transform: scale(1.07);
          }

          .industry-card-title {
            font-size: clamp(1.28rem, 6.4vw, 1.8rem);
          }

          .industry-card-description {
            font-size: 0.87rem;
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
              <div>
                <h2 className="industry-heading">Sectors We Serve.</h2>
                <p className="industry-copy">
                  Scroll to move through the industry rail while the section stays pinned until the last card.
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
                  <div className="industry-card-content">
                    <h3 className="industry-card-title">
                      <span>{industry.title}</span>
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                    </h3>
                    <p className="industry-card-description">{industry.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="industry-progress-shell" aria-hidden="true">
            <div className="industry-progress-track">
              <span ref={progressFillRef} className="industry-progress-fill" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
