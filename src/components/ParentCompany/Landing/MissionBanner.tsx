"use client";

import { memo, useCallback } from "react";
import { useReveal } from "@/hooks/useScrollReveal";
import { trackBrandGlow } from "../Company/subpages/blocks";

/* ─────────────────────────────────────────────────────────────
   Mission banner — sits directly below the About Us hero.

   The Banner-1 facility photograph is used as a full-bleed
   background; a left-weighted gradient scrim keeps the overlaid
   mission statement legible against the sunset highlights on the
   right of the image.
   ───────────────────────────────────────────────────────────── */

const MissionBanner = memo(() => {
  const eyebrowReveal = useReveal("fade-up", { threshold: 0.3, duration: 700 });
  const titleReveal = useReveal("fade-up", { threshold: 0.3, duration: 800, cssDelay: 120 });
  const bodyReveal = useReveal("fade-up", { threshold: 0.3, duration: 800, cssDelay: 240 });
  const ctaReveal = useReveal("fade-up", { threshold: 0.3, duration: 800, cssDelay: 360 });

  /* Navigate to the About Us page (company → company-about) via the
     root SPA, matching the in-page "Continue Exploring" pattern. */
  const goToAboutUs = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("company-navigate", { detail: { subtab: "company-about" } })
    );
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "#000000" }}
      aria-label="Our mission"
    >
      <div
        className="relative flex items-center"
        style={{
          minHeight: "clamp(420px, 64vh, 640px)",
        }}
      >
        {/* ── Credit / attribution marker (bottom-right) ── */}
        <div
          className="mission-credit"
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            zIndex: 20,
          }}
        >
          <span
            role="img"
            tabIndex={0}
            aria-label="Image attribution"
            className="flex items-center justify-center w-8 h-8 rounded-md"
            style={{
              background: "rgba(10,10,15,0.5)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.85)",
              cursor: "help",
            }}
          >
            <i
              className="bi bi-exclamation-square"
              aria-hidden="true"
              style={{ fontSize: "0.7rem", lineHeight: 1 }}
            />
          </span>
          <span className="mission-credit-tip" role="tooltip">
            Designed by Notus Regalia
            <br />
            Artist rendition by Team Sefirah
          </span>
        </div>

        {/* ── Background photograph (subtle futuristic color grade) ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/Banner-1.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "contrast(1.08) saturate(0.85) brightness(0.95)",
          }}
        />

        {/* ── Duotone color grade — cool shadows, crimson highlights ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            mixBlendMode: "color",
            opacity: 0.32,
            background:
              "linear-gradient(115deg, #0a1830 0%, #112042 45%, #3a1424 78%, #5a1228 100%)",
          }}
        />

        {/* ── Fine tech grid mesh ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(120,180,255,0.07) 0 1px, transparent 1px 44px)," +
              "repeating-linear-gradient(0deg, rgba(120,180,255,0.07) 0 1px, transparent 1px 44px)",
            backgroundSize: "44px 44px",
            maskImage:
              "linear-gradient(90deg, transparent 0%, #000 35%, #000 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, #000 35%, #000 100%)",
            opacity: 0.7,
          }}
        />

        {/* ── Scanlines + animated sweep ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 3px)",
            opacity: 0.5,
          }}
        />
        {/* ── Legibility scrim: dark on the left, fading right ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.7) 38%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.15) 100%)",
          }}
        />

        {/* ── Top/bottom fade to blend with the black sections ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, #000000 0%, transparent 18%, transparent 78%, #000000 100%)",
          }}
        />

        {/* ── Crimson ambient glow (matches the hero) ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "0%",
            transform: "translateY(-50%)",
            width: "min(700px, 80vw)",
            height: "min(700px, 80vw)",
            pointerEvents: "none",
            background:
              "radial-gradient(circle, rgba(229,43,80,0.18) 0%, rgba(229,43,80,0.05) 40%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />

        {/* ── Content ── */}
        <div
          className="relative z-10 mission-content"
          style={{
            width: "100%",
            paddingBlock: "clamp(3rem, 8vh, 6rem)",
            paddingInline: "var(--site-gutter-inline)",
          }}
        >
          <div style={{ maxWidth: "640px" }}>
            {/* Eyebrow */}
            <div
              ref={eyebrowReveal.ref}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                ...eyebrowReveal.style,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: "32px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "#E31B54",
                }}
              />
              <span
                style={{
                  fontFamily: "ui-monospace, Menlo, monospace",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#f1f5f9",
                }}
              >
                Our Mission
              </span>
            </div>

            {/* Headline */}
            <h2
              ref={titleReveal.ref}
              style={{
                margin: "1.4rem 0 0",
                fontSize: "clamp(1.9rem, 4.2vw, 3.1rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "#ffffff",
                ...titleReveal.style,
              }}
            >
              To build the systems the world{" "}
              <span
                style={{
                  background:
                    "linear-gradient(180deg, #ff5e7e 0%, #E52B50 60%, #b01038 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                cannot fail
              </span>
              .
            </h2>

            {/* Body */}
            <p
              ref={bodyReveal.ref}
              style={{
                margin: "1.6rem 0 0",
                maxWidth: "560px",
                fontSize: "clamp(1rem, 1.5vw, 1.18rem)",
                lineHeight: 1.7,
                color: "rgba(225,225,232,0.9)",
                ...bodyReveal.style,
              }}
            >
              We exist to engineer the mission-critical infrastructure that
              nations, institutions, and people depend on — uniting defense,
              healthcare, and the public sector under one standard of
              reliability.
            </p>

            {/* CTA → About Us */}
            <div
              ref={ctaReveal.ref}
              style={{ marginTop: "2.2rem", display: "flex", ...ctaReveal.style }}
            >
              <button
                type="button"
                className="brand-btn mission-cta"
                onClick={goToAboutUs}
                onMouseMove={trackBrandGlow}
              >
                <span>Learn more</span>
                <i className="bi bi-arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Match the hero "Get Started" button's sizing (padding + font-size)
           so the mission CTA reads at the same scale as the hero above. */
        .mission-cta { padding: 12px 17px; font-size: 0.875rem; }
        @media (max-width: 768px)  { .mission-cta { padding: 0.6rem 1.25rem; font-size: 0.8rem; } }
        @media (min-width: 1024px) { .mission-cta { padding: 14px 28px; font-size: 1rem; } }

        /* Match the site's standard page gutter so the mission copy
           lines up with the Industries / Hero sections below. */
        .mission-content { --site-gutter-inline: 2rem; }
        @media (min-width: 640px)  { .mission-content { --site-gutter-inline: 4rem; } }
        @media (min-width: 768px)  { .mission-content { --site-gutter-inline: 6rem; } }
        @media (min-width: 1280px) { .mission-content { --site-gutter-inline: 8rem; } }
        @media (min-width: 1536px) { .mission-content { --site-gutter-inline: 12rem; } }

        .mission-credit .mission-credit-tip {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          width: max-content;
          max-width: 220px;
          padding: 0.5rem 0.7rem;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 4px;
          background: rgba(10,10,12,0.92);
          backdrop-filter: blur(6px);
          color: rgba(225,225,232,0.9);
          font-size: 0.66rem;
          line-height: 1.5;
          letter-spacing: 0.01em;
          text-align: right;
          white-space: nowrap;
          opacity: 0;
          transform: translateY(4px);
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .mission-credit:hover .mission-credit-tip,
        .mission-credit:focus-within .mission-credit-tip {
          opacity: 1;
          transform: translateY(0);
        }
        .mission-credit:hover .bi-exclamation-square,
        .mission-credit:focus-within .bi-exclamation-square {
          color: rgba(255,255,255,0.9);
        }
      `}</style>
    </section>
  );
});

MissionBanner.displayName = "MissionBanner";

export default MissionBanner;
