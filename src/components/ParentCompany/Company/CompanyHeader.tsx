"use client";

import { memo, useCallback, useRef } from "react";
import { StarfieldBackground } from "@/components/ui/starfield-background";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useReveal } from "@/hooks/useScrollReveal";
import { trackBrandGlow } from "./subpages/blocks";

/* ─────────────────────────────────────────────────────────────
   About Us — full modern hero.

   Replaces the old "NOTUS REGALIA + Manila typing" banner with a
   text-forward hero: eyebrow chip, headline, supporting line and a
   CTA, over an elevated starfield (crimson ambient glow, vignette,
   faint grid, and a bottom fade that blends into the company panel).
   ───────────────────────────────────────────────────────────── */

const NAVBAR_OFFSET = 96; // fixed navbar (~84px) + breathing room

const CompanyHeader = memo(() => {
  const sectionRef = useRef<HTMLElement>(null);

  const eyebrowReveal = useReveal("fade-up", { threshold: 0.2, duration: 700 });
  const titleReveal = useReveal("fade-up", { threshold: 0.2, duration: 800, cssDelay: 100 });
  const subReveal = useReveal("fade-up", { threshold: 0.2, duration: 800, cssDelay: 220 });
  const ctaReveal = useReveal("fade-up", { threshold: 0.2, duration: 800, cssDelay: 340 });

  /* Scroll past the hero into the company profile panel below it. */
  const scrollToContent = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const target = el.getBoundingClientRect().bottom + window.scrollY - NAVBAR_OFFSET;
    const sm = typeof window !== "undefined" ? ScrollSmoother.get?.() : null;
    if (sm) sm.scrollTo(target, true);
    else window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ marginBottom: 0, background: "#000000" }}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          minHeight: "clamp(560px, 92vh, 860px)",
          // Clear the fixed navbar (~84px) + subtab strip (~50px).
          paddingTop: "clamp(140px, 16vh, 180px)",
          paddingBottom: "clamp(3rem, 8vh, 6rem)",
        }}
      >
        <StarfieldBackground
          position="absolute"
          count={320}
          speed={0.4}
          starColor="#ffffff"
          twinkle={true}
        />

        {/* ── Faint perspective grid ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 96px)," +
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 96px)",
            backgroundSize: "96px 96px",
            backgroundPosition: "center",
            maskImage:
              "radial-gradient(ellipse 70% 60% at center, #000 35%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at center, #000 35%, transparent 80%)",
            opacity: 0.6,
          }}
        />

        {/* ── Crimson ambient glow ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(900px, 90vw)",
            height: "min(900px, 90vw)",
            pointerEvents: "none",
            background:
              "radial-gradient(circle, rgba(229,43,80,0.20) 0%, rgba(229,43,80,0.06) 38%, transparent 68%)",
            filter: "blur(8px)",
          }}
        />

        {/* ── Vignette + bottom fade into the next section ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)," +
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 70%, #000000 100%)",
          }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center px-6" style={{ maxWidth: "920px" }}>
          {/* Eyebrow chip */}
          <span
            ref={eyebrowReveal.ref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.2rem 0.55rem",
              borderRadius: "2px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "#141414", /* onyx black — matches .release-tag */
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#f1f5f9",
              ...eyebrowReveal.style,
            }}
          >
            Who we are
          </span>

          {/* Headline */}
          <h1
            ref={titleReveal.ref}
            className="select-none text-center font-bold"
            style={{
              margin: "1.4rem 0 0",
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              background:
                "linear-gradient(180deg, #ffffff 0%, #d8d8de 46%, #9a9aa2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              ...titleReveal.style,
            }}
          >
            Building the systems
            <br />
            our world{" "}
            <span
              style={{
                background:
                  "linear-gradient(180deg, #ff5e7e 0%, #E52B50 60%, #b01038 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              depends on
            </span>
            .
          </h1>

          {/* Supporting line */}
          <p
            ref={subReveal.ref}
            className="select-none text-center"
            style={{
              margin: "1.6rem 0 0",
              maxWidth: "620px",
              fontSize: "clamp(1rem, 1.6vw, 1.18rem)",
              lineHeight: 1.65,
              color: "rgba(190,190,200,0.82)",
              ...subReveal.style,
            }}
          >
            Notus Regalia engineers mission-critical systems across defense,
            healthcare, and the public sector — built for the moments that
            cannot fail.
          </p>

          {/* CTA */}
          <div
            ref={ctaReveal.ref}
            style={{ marginTop: "2.2rem", display: "flex", ...ctaReveal.style }}
          >
            <button
              type="button"
              className="brand-btn"
              onClick={scrollToContent}
              onMouseMove={trackBrandGlow}
            >
              <span>Explore the company</span>
              <i className="bi bi-arrow-down" />
            </button>
          </div>
        </div>

        {/* ── Scroll cue ── */}
        <button
          type="button"
          aria-label="Scroll to company profile"
          onClick={scrollToContent}
          style={{
            position: "absolute",
            bottom: "clamp(1.5rem, 4vh, 2.5rem)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: "rgba(190,190,200,0.55)",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.62rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            animation: "heroScrollBob 2.4s ease-in-out infinite",
          }}
        >
          Scroll
          <i className="bi bi-chevron-double-down" style={{ fontSize: "0.85rem" }} />
        </button>
      </div>

      <style>{`
        @keyframes heroScrollBob {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.55; }
          50% { transform: translateX(-50%) translateY(6px); opacity: 1; }
        }
      `}</style>
    </section>
  );
});

CompanyHeader.displayName = "CompanyHeader";

export default CompanyHeader;
