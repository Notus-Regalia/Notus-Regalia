"use client";

import { memo } from "react";
import { StoryHero, StoryHeroStyles, type Story } from "./StoryHero";

/* ─────────────────────────────────────────────────────────────
   About Us — cinematic story banners.

   The company narrative told as a sequence of full-bleed hero
   banners: Origin · What We Build · How We Operate. Section ids
   match COMPANY_SUBTABS['company-about'].sections in
   src/data/company-nav.ts so the navbar breadcrumb strip scrollspies.
   ───────────────────────────────────────────────────────────── */

const STORIES: Story[] = [
  {
    id: "about-origin",
    index: "01",
    kicker: "Est. 2025",
    title: "Origin",
    paragraphs: [
      "Notus Regalia was founded in 2025 as a response to a growing gap between rapid technological development and the systems required to support it. What began as a student-led initiative in information systems quickly evolved into a structured effort to design and build critical technologies across essential industries.",
      "The company was formed on a simple but rigid premise: modern systems are no longer isolated products—they are interdependent infrastructures that demand long-term ownership, continuous engineering, and disciplined execution.",
    ],
    align: "left",
    variant: "starfield",
  },
  {
    id: "about-build",
    index: "02",
    kicker: "Our Mandate",
    title: "What We Build",
    paragraphs: [
      "Notus Regalia operates as a technology holding and venture-building company focused on critical sectors including government, defense, healthcare, enterprise systems, and energy.",
      "We do not limit ourselves to a single product category. Instead, we develop and scale ventures that address foundational problems in high-impact domains. Each initiative is designed either to become a standalone company or to operate as part of a larger integrated system within the Notus Regalia ecosystem.",
    ],
    align: "right",
    variant: "grid",
  },
  {
    id: "about-operate",
    index: "03",
    kicker: "Operating Model",
    title: "How We Operate",
    paragraphs: [
      "Our model combines venture incubation, systems engineering, and long-horizon operational design.",
      "We build internal capabilities first—architecture, infrastructure, and governance—before externalizing them into ventures. This allows each initiative to inherit a mature technical backbone from day one, rather than building in isolation.",
      "Over time, selected ventures may evolve into subsidiaries or independent portfolio companies, depending on scale, ownership structure, and strategic alignment.",
    ],
    align: "left",
    variant: "mesh",
  },
];

const AboutStory = memo(() => (
  <>
    <StoryHeroStyles />
    {STORIES.map((story) => <StoryHero key={story.id} story={story} />)}
  </>
));

AboutStory.displayName = "AboutStory";

export default AboutStory;
