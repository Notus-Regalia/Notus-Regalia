"use client";

import { memo } from "react";
import { useReveal } from "@/hooks/useScrollReveal";

/* ─────────────────────────────────────────────────────────────
   Sector Missions.

   One corporate vision anchors the company; each industry then has
   its own dedicated mission section — focused, operational, and
   constrained — all mapping back to that vision.

   Relies on StoryHeroStyles being mounted on the page for the sh-*
   header classes. Intro band carries id 'direction-purpose' so the
   navbar breadcrumb strip scrollspies against it.
   ───────────────────────────────────────────────────────────── */

interface Sector {
  no: string;
  name: string;
  domain: string;
  statement: string;
}

const SECTORS: Sector[] = [
  {
    no: "01",
    name: "Government",
    domain: "Public Infrastructure",
    statement:
      "Build the secure, interoperable backbone of public institutions — making civic operations transparent, responsive, and accountable to the people they serve.",
  },
  {
    no: "02",
    name: "Defense",
    domain: "National Security",
    statement:
      "Deliver mission-critical systems that give operators decisive command — resilient and dependable in the moments that cannot fail.",
  },
  {
    no: "03",
    name: "Healthcare",
    domain: "Clinical Systems",
    statement:
      "Turn fragmented health data into coordinated care, extending reliable outcomes to the populations that need them most.",
  },
  {
    no: "04",
    name: "Energy",
    domain: "Critical Grids",
    statement:
      "Engineer intelligent infrastructure that monitors, optimizes, and secures the grids modern life depends on.",
  },
  {
    no: "05",
    name: "Enterprise",
    domain: "Operational Platforms",
    statement:
      "Provide the integrated platforms that let enterprises operate with command and precision across every function.",
  },
];

const SM_CSS = `
/* ── Intro band ── */
.sm-intro {
  position: relative; overflow: hidden; background: #000;
  --sm-gut: 2rem;
  padding: clamp(6.5rem, 15vh, 10rem) var(--sm-gut) clamp(4rem, 8vh, 6rem);
  border-top: 1px solid rgba(255,255,255,0.05);
}
.sm-base { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(170deg, #060810 0%, #05060a 55%, #0a0710 100%); }
.sm-inner { position: relative; z-index: 2; max-width: 1440px; margin: 0 auto; }
/* centered intro */
.sm-center { text-align: center; }
.sm-eyebrow {
  display: block; margin-bottom: clamp(1rem, 2.5vw, 1.5rem);
  font-family: ui-monospace, Menlo, monospace; font-size: .7rem; font-weight: 700;
  letter-spacing: .26em; text-transform: uppercase; color: rgba(190,190,200,0.7);
}
.sm-sub {
  margin: clamp(1rem, 2.5vw, 1.5rem) 0 0; max-width: none;
  font-size: clamp(1rem, 1.5vw, 1.18rem); line-height: 1.7; color: rgba(196,198,206,0.85);
}

/* ── Per-industry mission section ── */
.im-sec {
  position: relative; overflow: hidden; background: #000;
  --im-gut: 2rem;
  padding: clamp(4.5rem, 10vh, 7.5rem) var(--im-gut);
  border-top: 1px solid rgba(255,255,255,0.06);
}
@media(min-width:640px){ .sm-intro, .im-sec { --sm-gut: 4rem; --im-gut: 4rem; } }
@media(min-width:768px){ .sm-intro, .im-sec { --sm-gut: 6rem; --im-gut: 6rem; } }
@media(min-width:1280px){ .sm-intro, .im-sec { --sm-gut: 8rem; --im-gut: 8rem; } }
@media(min-width:1536px){ .sm-intro, .im-sec { --sm-gut: 12rem; --im-gut: 12rem; } }

.im-inner { position: relative; z-index: 2; max-width: 1440px; margin: 0 auto; }
.im-grid {
  display: grid; grid-template-columns: 1fr; gap: clamp(2.25rem, 5.5vw, 5rem);
  align-items: center;
}
@media(min-width:900px){ .im-grid { grid-template-columns: 1fr 1fr; } }
/* alternate: title column moves to the right, description to the left */
@media(min-width:900px){
  .im-flip .im-title-col { order: 2; }
  .im-flip .im-desc-col  { order: 1; }
}

/* title column — number, name + inline icon, domain */
.im-title-col { display: flex; flex-direction: column; gap: .9rem; }
.im-no {
  font-family: ui-monospace, Menlo, monospace; font-weight: 800; line-height: 1;
  font-size: clamp(1.6rem, 3.6vw, 2.4rem); letter-spacing: -0.05em;
  color: transparent; -webkit-text-stroke: 1.25px rgba(255,255,255,0.5);
}
.im-name {
  display: inline-flex; align-items: center; gap: clamp(.7rem, 1.5vw, 1.1rem); flex-wrap: wrap;
  margin: 0; font-size: clamp(1.85rem, 4vw, 2.85rem); font-weight: 700;
  letter-spacing: -0.025em; line-height: 1.04;
}
.im-name-text {
  background: linear-gradient(180deg, #ffffff 0%, #d8d8de 55%, #9a9aa2 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.im-domain {
  font-family: ui-monospace, Menlo, monospace; font-size: .6rem; font-weight: 700;
  letter-spacing: .22em; text-transform: uppercase; color: rgba(190,190,200,0.6);
}

/* description column — mission as a plain paragraph */
.im-desc-col { max-width: 640px; }
.im-statement {
  margin: 0; font-size: clamp(1.05rem, 1.7vw, 1.3rem); font-weight: 400;
  line-height: 1.6; letter-spacing: -0.005em; color: rgba(210,213,221,0.9);
}
`;

const IndustryMission = memo(({ sector, flip }: { sector: Sector; flip: boolean }) => {
  const reveal = useReveal("fade-up", { threshold: 0.12, duration: 800, cssDelay: 60 });
  return (
    <section className="im-sec">
      <div aria-hidden className={`sh-bg ${flip ? "sh-glow-br" : "sh-glow-tl"}`} />
      <div ref={reveal.ref} className="im-inner" style={reveal.style}>
        <div className={`im-grid${flip ? " im-flip" : ""}`}>
          <div className="im-title-col">
            <span className="im-no" aria-hidden>{sector.no}</span>
            <h3 className="im-name">
              <span className="im-name-text">{sector.name}</span>
            </h3>
            <span className="im-domain">{sector.domain}</span>
          </div>
          <div className="im-desc-col">
            <p className="im-statement">{sector.statement}</p>
          </div>
        </div>
      </div>
    </section>
  );
});
IndustryMission.displayName = "IndustryMission";

const SectorMissions = memo(() => {
  const reveal = useReveal("fade-up", { threshold: 0.14, duration: 850, cssDelay: 80 });
  return (
    <>
      <style>{SM_CSS}</style>

      {/* Intro band — carries the scrollspy id. */}
      <section id="direction-purpose" className="sm-intro">
        <div aria-hidden className="sm-base" />
        <div aria-hidden className="sh-bg sh-grid-mesh" />
        <div aria-hidden className="sh-bg sh-vignette" />
        <div ref={reveal.ref} className="sm-inner sm-center" style={reveal.style}>
          <h2 className="sh-title">Sector Missions</h2>
          <p className="sm-sub">
            One vision anchors the company. Within it, each industry has its own
            dedicated mission — distinct in domain, focused and operational, yet all
            mapping back to the same corporate vision.
          </p>
        </div>
      </section>

      {/* One dedicated mission section per industry, alternating sides. */}
      {SECTORS.map((sector, i) => (
        <IndustryMission key={sector.name} sector={sector} flip={i % 2 === 1} />
      ))}
    </>
  );
});

SectorMissions.displayName = "SectorMissions";

export default SectorMissions;
