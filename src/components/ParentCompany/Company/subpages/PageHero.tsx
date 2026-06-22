"use client";

import { memo } from "react";
import { StarfieldBackground } from "@/components/ui/starfield-background";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  /** When set, the hero uses this image (with the home-hero color grade) instead
      of the starfield background. Path is relative to /public. */
  bgImage?: string;
}

/* Shared hero header for each standalone Company subtab page. */
const PageHero = memo(({ title, subtitle, bgImage }: PageHeroProps) => (
  <section className="relative" style={{ marginBottom: 0 }}>
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        height: "clamp(320px, 46vh, 500px)",
        // Clear the fixed navbar (~84px) + subtab strip (~50px) so the title
        // never sits under the strip on any Company subtab page.
        paddingTop: "clamp(132px, 16vh, 172px)",
      }}
    >
      {bgImage ? (
        // Image background with the same color grade as the home-tab hero:
        // duotone grade + tech-grid mesh + scanlines, plus a readability scrim.
        <div aria-hidden className="absolute inset-0" style={{ background: "#05060a" }}>
          {/* Base image — same filter the home hero applies to its video */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "contrast(1.08) saturate(0.85) brightness(0.95)",
            }}
          />

          {/* Duotone color grade — cool shadows, crimson highlights */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              mixBlendMode: "color",
              opacity: 0.32,
              background:
                "linear-gradient(115deg, #0a1830 0%, #112042 45%, #3a1424 78%, #5a1228 100%)",
            }}
          />

          {/* Fine tech grid mesh */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(120,180,255,0.07) 0 1px, transparent 1px 44px)," +
                "repeating-linear-gradient(0deg, rgba(120,180,255,0.07) 0 1px, transparent 1px 44px)",
              backgroundSize: "44px 44px",
              opacity: 0.7,
            }}
          />

          {/* Scanlines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 3px)",
              opacity: 0.5,
            }}
          />

          {/* Readability scrim — keeps the centered title legible over the image */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, rgba(5,6,10,0.35) 0%, rgba(5,6,10,0.72) 100%)",
            }}
          />
        </div>
      ) : (
        <StarfieldBackground
          position="absolute"
          count={260}
          speed={0.4}
          starColor="#ffffff"
          twinkle={true}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-4 px-6">
        <h1
          className="select-none text-4xl font-bold tracking-[0.25em] sm:text-5xl md:text-6xl"
          style={{
            background:
              "linear-gradient(180deg, #ffffff 0%, #b0b0b0 40%, #8a8a8a 70%, #a0a0a0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {title}
        </h1>

        <p
          className="select-none font-mono text-xs tracking-[0.08em] sm:text-sm"
          style={{
            color: "rgba(180,180,190,0.7)",
            maxWidth: "640px",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>

    <style>{`
      @keyframes heroPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.8); }
      }
    `}</style>
  </section>
));

PageHero.displayName = "PageHero";

export default PageHero;
