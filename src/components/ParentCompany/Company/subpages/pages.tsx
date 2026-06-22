"use client";

import { memo, type ReactNode } from "react";
import PageHero from "./PageHero";
import ExploreNext from "./ExploreNext";
import CompanyHeader from "../CompanyHeader";
import AboutStory from "../AboutStory";
import SectorMissions from "../SectorMissions";
import { StoryHero, StoryHeroStyles, type Story } from "../StoryHero";
import Executives from "../Executives";
import Investors from "../Investors";
import {
  BlocksStyles,
  CtaLink,
} from "./blocks";
import { getCompanySubtab } from "@/data/company-nav";
import { useReveal } from "@/hooks/useScrollReveal";

/* ─────────────────────────────────────────────────────────────
   Standalone Company subtab pages.

   Every page follows the same three-section shape so the navbar
   breadcrumb strip can scrollspy against it:
     <subtab>-overview  → PageHero
     <subtab>-<content> → main content section
     <subtab>-explore   → ExploreNext (link to the next page)
   Section ids must match COMPANY_SUBTABS[..].sections in
   src/data/company-nav.ts.
   ───────────────────────────────────────────────────────────── */

const RevealSection = ({ id, children }: { id: string; children: ReactNode }) => {
  const reveal = useReveal('fade-up', { threshold: 0.08, rootMargin: '0px 0px -40px 0px', duration: 800, cssDelay: 80 });
  return (
    <div id={id} ref={reveal.ref} style={reveal.style}>
      {children}
    </div>
  );
};

export const AboutCompanyPage = memo((_props: { onLearnMore?: (page: string) => void }) => {
  return (
    <>
      {/* Brand hero intro. */}
      <CompanyHeader />
      {/* The company story, told as a sequence of full-bleed hero banners:
          Origin · What We Build · How We Operate (no sidebar tabs). */}
      <AboutStory />
      <RevealSection id="about-explore">
        <ExploreNext current="company-about" />
      </RevealSection>
    </>
  );
});
AboutCompanyPage.displayName = "AboutCompanyPage";

/* ── Vision — the single corporate anchor ──
   One vision for Notus Regalia as a whole; it anchors every sector.
   The italic statement leads the banner, followed by the vision copy. */
const VISION_STORY: Story = {
  id: 'direction-vision',
  index: '',
  lead: true,
  kicker: 'We are structured remnants of dying systems—brief coherence inside an indifferent universe.',
  kickerStyle: 'statement',
  title: 'Vision',
  paragraphs: [
    'A future in which human civilization operates with greater clarity, stability, and capability, where technology serves as a force multiplier for human judgment, coordination, and progress.',
    'We build systems for the world’s most critical domains, public infrastructure, industry, and enterprise, designed to remain resilient under stress and governed with rigor, so that trust can scale alongside complexity.',
    'Notus Regalia exists to serve that trajectory. It functions as an operational backbone for ventures that shape essential systems across Southeast Asia and beyond, enabling work that directly affects how societies function and evolve.',
  ],
  align: 'left',
  variant: 'image',
  bgImage: '/banner-2.jpg',
};

export const DirectionPage = memo(() => {
  return (
    <>
      <BlocksStyles />
      <StoryHeroStyles />
      {/* Vision (corporate anchor) → Sector Missions (operational). */}
      <StoryHero story={VISION_STORY} />
      <SectorMissions />
      <RevealSection id="direction-explore">
        <ExploreNext current="company-direction" />
      </RevealSection>
    </>
  );
});
DirectionPage.displayName = "DirectionPage";

export const ExecutivesPage = memo(() => {
  return (
    <>
      <RevealSection id="executives-leadership">
        <Executives />
      </RevealSection>
      <RevealSection id="executives-explore">
        <ExploreNext current="company-executives" />
      </RevealSection>
    </>
  );
});
ExecutivesPage.displayName = "ExecutivesPage";

export const InvestorsPage = memo(() => {
  const tab = getCompanySubtab('company-investors');
  return (
    <>
      <div id="investors-overview">
        <PageHero {...tab.hero!} />
      </div>
      <RevealSection id="investors-capital">
        <Investors />
      </RevealSection>
      <RevealSection id="investors-explore">
        <ExploreNext current="company-investors" />
      </RevealSection>
    </>
  );
});
InvestorsPage.displayName = "InvestorsPage";
