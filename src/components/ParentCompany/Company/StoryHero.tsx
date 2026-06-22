"use client";

import { memo, useEffect, useState } from "react";
import { StarfieldBackground } from "@/components/ui/starfield-background";
import { useReveal } from "@/hooks/useScrollReveal";

/* ─────────────────────────────────────────────────────────────
   StoryHero — a full-bleed, cinematic hero banner that carries one
   chapter of narrative copy. Shared by the About Us story chapters
   and the Direction Mission / Vision sections.

   Backgrounds: starfield · perspective grid · radial mesh · image
   (banner with the home-hero color grade). All fade into #000 top
   and bottom so consecutive banners stack seamlessly.
   ───────────────────────────────────────────────────────────── */

export type StoryVariant = "starfield" | "grid" | "mesh" | "image";
export type StoryAlign = "left" | "right";

export interface Story {
  id: string;
  index: string;
  kicker: string;
  title: string;
  paragraphs: string[];
  align?: StoryAlign;
  variant?: StoryVariant;
  /** Background image (relative to /public) — used when variant === 'image'. */
  bgImage?: string;
  /** 'label' (default) = compact uppercase eyebrow. 'statement' = readable,
   *  full-width sentence that spans across the banner. */
  kickerStyle?: "label" | "statement";
  /** First banner on a page — adds extra top padding to clear the fixed
   *  navbar + subtab strip so the index row doesn't crowd them. */
  lead?: boolean;
}

const STORY_CSS = `
.sh-sec {
  position: relative; overflow: hidden; background: #000;
  display: flex; align-items: center;
  min-height: clamp(600px, 90vh, 900px);
  --sh-gut: 2rem;
  padding: clamp(5rem, 13vh, 9rem) var(--sh-gut);
  border-top: 1px solid rgba(255,255,255,0.05);
}
@media(min-width:640px){ .sh-sec { --sh-gut: 4rem; } }
@media(min-width:768px){ .sh-sec { --sh-gut: 6rem; } }
@media(min-width:1280px){ .sh-sec { --sh-gut: 8rem; } }
@media(min-width:1536px){ .sh-sec { --sh-gut: 12rem; } }
/* lead banner clears the fixed navbar (~84px) + subtab strip (~50px) */
.sh-sec.sh-lead { padding-top: clamp(9rem, 19vh, 12.5rem); }

.sh-inner { position: relative; z-index: 2; width: 100%; max-width: 1440px; margin: 0 auto; }
.sh-col { max-width: 700px; }
.sh-right .sh-col { margin-left: auto; }
/* statement banners use the full width so the kicker can span across; the
   title and body keep their own readable measures. */
.sh-col-wide { max-width: min(1232px, 98%); }
.sh-col-wide .sh-title { max-width: 16ch; }
.sh-col-wide .sh-body { max-width: 720px; }

.sh-indexrow { display: flex; align-items: center; gap: 1.1rem; margin-bottom: clamp(1.9rem, 4vw, 3rem); }
.sh-index {
  font-family: ui-monospace, Menlo, monospace; font-weight: 800; line-height: 1;
  font-size: clamp(1.6rem, 3.6vw, 2.4rem); letter-spacing: -0.05em;
  color: transparent; -webkit-text-stroke: 1.25px rgba(255,255,255,0.8);
}
.sh-rule { height: 1px; width: clamp(2rem, 6vw, 4.5rem); flex-shrink: 0; background: linear-gradient(90deg, rgba(255,255,255,0.8), transparent); }
.sh-kicker {
  flex: 1; min-width: 0;
  font-family: ui-monospace, Menlo, monospace; font-size: .7rem; font-weight: 700;
  letter-spacing: .26em; text-transform: uppercase; color: rgba(190,190,200,0.7);
}
/* readable, full-width statement (no caps, no wide tracking) */
.sh-kicker-statement {
  font-family: inherit; text-transform: none; font-weight: 500; font-style: italic;
  font-size: clamp(.78rem, 1.1vw, .92rem); letter-spacing: 0; line-height: 1.55;
  color: rgba(214,216,224,0.82);
}
.sh-kicker-statement::before { content: "“"; }
.sh-kicker-statement::after { content: "”"; }

.sh-title {
  margin: 0 0 clamp(2.25rem, 5vw, 3.5rem);
  font-size: clamp(2.6rem, 7vw, 5rem); line-height: 1.02; letter-spacing: -0.03em; font-weight: 700;
  background: linear-gradient(180deg, #ffffff 0%, #d8d8de 50%, #9a9aa2 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.sh-body p { margin: 0 0 1.15rem; font-size: clamp(1rem, 1.5vw, 1.18rem); line-height: 1.78; color: rgba(196,198,206,0.85); }
.sh-body p:last-child { margin-bottom: 0; }

/* shared decorative layers */
.sh-bg { position: absolute; inset: 0; pointer-events: none; }
.sh-grid-mesh {
  background-image:
    repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 96px),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 96px);
  background-size: 96px 96px; background-position: center;
  -webkit-mask-image: radial-gradient(ellipse 75% 65% at center, #000 35%, transparent 82%);
  mask-image: radial-gradient(ellipse 75% 65% at center, #000 35%, transparent 82%);
  opacity: 0.55;
}
.sh-glow-tl { background: radial-gradient(circle at 18% 12%, rgba(229,43,80,0.22) 0%, rgba(229,43,80,0.05) 34%, transparent 64%); filter: blur(6px); }
.sh-glow-br { background: radial-gradient(circle at 82% 86%, rgba(229,43,80,0.20) 0%, rgba(229,43,80,0.05) 36%, transparent 66%); filter: blur(6px); }
.sh-radial { background: radial-gradient(ellipse 60% 50% at 30% 40%, rgba(120,180,255,0.10) 0%, transparent 60%); }
.sh-scanlines { background-image: repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px); opacity: 0.5; }
/* image backdrop — same color grade as the home / page heroes */
.sh-img {
  background-size: cover; background-position: center;
  filter: contrast(1.08) saturate(0.85) brightness(0.9);
  /* fade the image in once it has decoded so it never "pops" in */
  opacity: 0; transition: opacity .5s ease;
}
.sh-img.is-loaded { opacity: 1; }
.sh-img-grade { mix-blend-mode: color; opacity: 0.32; background: linear-gradient(115deg, #0a1830 0%, #112042 45%, #3a1424 78%, #5a1228 100%); }
.sh-img-scrim { background: radial-gradient(ellipse at center, rgba(5,6,10,0.45) 0%, rgba(5,6,10,0.82) 100%); }
/* vignette + bottom/top fade so chapters blend into one another */
.sh-vignette {
  background:
    radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.55) 100%),
    linear-gradient(180deg, #000 0%, transparent 14%, transparent 78%, #000 100%);
}
`;

/* Render once per page that uses StoryHero. */
export const StoryHeroStyles = () => <style>{STORY_CSS}</style>;

const ImageBackdrop = ({ bgImage }: { bgImage?: string }) => {
  /* Decode the image up-front; reveal the layer only once it's ready so it
     fades in cleanly instead of streaming/popping in mid-fade. If it's
     already cached (e.g. preloaded), `complete` is true → instant. */
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!bgImage) return;
    let cancelled = false;
    const img = new Image();
    const done = () => { if (!cancelled) setLoaded(true); };
    img.onload = done;
    img.onerror = done;
    img.src = bgImage;
    if (img.complete) done();
    return () => { cancelled = true; };
  }, [bgImage]);

  return (
    <>
      <div aria-hidden className="sh-bg" style={{ background: "#05060a" }} />
      <div aria-hidden className={`sh-bg sh-img${loaded ? " is-loaded" : ""}`} style={{ backgroundImage: `url(${bgImage})` }} />
      <div aria-hidden className="sh-bg sh-img-grade" />
      <div aria-hidden className="sh-bg sh-grid-mesh" />
      <div aria-hidden className="sh-bg sh-scanlines" />
      <div aria-hidden className="sh-bg sh-img-scrim" />
      <div aria-hidden className="sh-bg sh-vignette" />
    </>
  );
};

const Backdrop = ({ variant, bgImage }: { variant: StoryVariant; bgImage?: string }) => {
  if (variant === "image") {
    return <ImageBackdrop bgImage={bgImage} />;
  }
  if (variant === "starfield") {
    return (
      <>
        <StarfieldBackground position="absolute" count={300} speed={0.4} starColor="#ffffff" twinkle />
        <div aria-hidden className="sh-bg sh-grid-mesh" />
        <div aria-hidden className="sh-bg sh-glow-tl" />
        <div aria-hidden className="sh-bg sh-vignette" />
      </>
    );
  }
  if (variant === "grid") {
    return (
      <>
        <div aria-hidden className="sh-bg" style={{ background: "linear-gradient(160deg, #05060a 0%, #0a0d16 55%, #120810 100%)" }} />
        <div aria-hidden className="sh-bg sh-grid-mesh" />
        <div aria-hidden className="sh-bg sh-glow-br" />
        <div aria-hidden className="sh-bg sh-vignette" />
      </>
    );
  }
  // mesh
  return (
    <>
      <div aria-hidden className="sh-bg" style={{ background: "linear-gradient(200deg, #0a0810 0%, #060608 60%, #05060a 100%)" }} />
      <div aria-hidden className="sh-bg sh-radial" />
      <div aria-hidden className="sh-bg sh-glow-tl" />
      <div aria-hidden className="sh-bg sh-scanlines" />
      <div aria-hidden className="sh-bg sh-vignette" />
    </>
  );
};

export const StoryHero = memo(({ story }: { story: Story }) => {
  const reveal = useReveal("fade-up", { threshold: 0.18, duration: 850, cssDelay: 80 });
  const align = story.align ?? "left";
  const variant = story.variant ?? "mesh";
  const statement = story.kickerStyle === "statement";
  return (
    <section id={story.id} className={`sh-sec sh-${align}${story.lead ? " sh-lead" : ""}`}>
      <Backdrop variant={variant} bgImage={story.bgImage} />
      <div className="sh-inner">
        <div ref={reveal.ref} className={`sh-col${statement ? " sh-col-wide" : ""}`} style={reveal.style}>
          <div className="sh-indexrow">
            {story.index && <span className="sh-index" aria-hidden>{story.index}</span>}
            {!statement && <span className="sh-rule" aria-hidden />}
            <span className={`sh-kicker${statement ? " sh-kicker-statement" : ""}`}>{story.kicker}</span>
          </div>
          <h2 className="sh-title">{story.title}</h2>
          <div className="sh-body">
            {story.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
});
StoryHero.displayName = "StoryHero";
