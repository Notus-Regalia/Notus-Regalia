"use client";

import { memo } from "react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { useReveal } from "@/hooks/useScrollReveal";

/* ─────────────────────────────────────────────────────────────
   Principles strip — sits directly below the video hero.

   A continuously scrolling marquee of our operating principles, with
   a fade at each edge so the words dissolve into the section
   background. Until partner / customer announcements are ready, this
   strip carries our ethos rather than third-party wordmarks — keeping
   the design intact without implying partnerships we don't yet have.
   Rendered as text (not logo files) so it stays theme-aware and has
   no broken-asset risk.
   ───────────────────────────────────────────────────────────── */

const PRINCIPLES = [
  "MISSION-CRITICAL",
  "SOVEREIGN BY DESIGN",
  "SECURE BY DEFAULT",
  "ENGINEERED TO ENDURE",
  "OPERATOR-FIRST",
  "RELENTLESSLY RELIABLE",
  "PRECISION AT SCALE",
];

const PartnersStrip = memo(() => {
  const reveal = useReveal("fade-up", { threshold: 0.25, duration: 800 });

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: "var(--surface-primary)",
        // Seal the boundary with the mission banner below. Its top is a
        // bright-skied background photo; under GSAP ScrollSmoother's per-frame
        // sub-pixel transform, the photo can peek a 1px white hairline past its
        // black top-fade while scrolling. Painting this section's solid black
        // 2px over the mission's top edge (zIndex + negative margin) covers it.
        zIndex: 1,
        marginBottom: "-2px",
        paddingBottom: "2px",
      }}
      aria-label="Our operating principles"
    >
      {/* ── Soft tech grid — anchored to the top, fades out downward so it
          dissolves before reaching the marquee / lower black gradient. ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "62%",
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px)," +
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px)," +
            "repeating-linear-gradient(45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px)," +
            "repeating-linear-gradient(-45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px)," +
            "radial-gradient(circle, rgba(255,255,255,0.84) 0 1.4px, transparent 1.5px)",
          backgroundSize: "112px 112px",
          backgroundPosition: "center",
          maskImage:
            "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
          opacity: 0.42,
        }}
      />

      {/* ── Bottom-weighted black gradient — sinks the strip into solid black
          at the boundary with the mission banner below. ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, transparent 0%, transparent 40%, rgba(0,0,0,0.55) 78%, var(--surface-primary) 100%)",
        }}
      />

      <div
        ref={reveal.ref}
        className="relative z-10"
        style={{
          width: "100%",
          padding: "clamp(4rem, 11vh, 7.5rem) 0",
          ...reveal.style,
        }}
      >
        {/* Marquee — full-bleed, spans the entire viewport width.
            Promoted to its own pixel-snapped GPU layer (translateZ + backface)
            so the overflow clip edge doesn't shimmer a hairline while GSAP
            ScrollSmoother sub-pixel-transforms the page during scroll. */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            height: "clamp(72px, 12vw, 116px)",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <InfiniteSlider
            className="flex h-full w-full items-center"
            duration={36}
            gap={80}
          >
            {PRINCIPLES.map((name) => (
              <div
                key={name}
                className="flex items-center justify-center whitespace-nowrap"
              >
                <span
                  style={{
                    fontFamily: "ui-monospace, Menlo, monospace",
                    fontSize: "clamp(0.85rem, 1.4vw, 1.15rem)",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: "var(--content-secondary)",
                    opacity: 0.78,
                  }}
                >
                  {name}
                </span>
              </div>
            ))}
          </InfiniteSlider>

          {/* Edge fades — plain background-colored gradients (no backdrop-filter,
              which would otherwise produce a flickering white compositing seam
              at the layer edge during scroll). */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 h-full w-[clamp(56px,16vw,220px)]"
            style={{
              background:
                "linear-gradient(90deg, var(--surface-primary) 0%, transparent 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 h-full w-[clamp(56px,16vw,220px)]"
            style={{
              background:
                "linear-gradient(270deg, var(--surface-primary) 0%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
});

PartnersStrip.displayName = "PartnersStrip";

export default PartnersStrip;
