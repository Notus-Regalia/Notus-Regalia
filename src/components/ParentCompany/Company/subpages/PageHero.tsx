"use client";

import { memo } from "react";
import { StarfieldBackground } from "@/components/ui/starfield-background";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
}

/* Shared hero header for each standalone Company subtab page. */
const PageHero = memo(({ title, subtitle }: PageHeroProps) => (
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
      <StarfieldBackground
        position="absolute"
        count={260}
        speed={0.4}
        starColor="#ffffff"
        twinkle={true}
      />

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
