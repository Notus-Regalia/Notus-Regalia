"use client";

import { memo, type ReactNode } from "react";
import PageHero from "./PageHero";
import ExploreNext from "./ExploreNext";
import CompanyHeader from "../CompanyHeader";
import AboutStory from "../AboutStory";
import SectorMissions from "../SectorMissions";
import { StoryHero, StoryHeroStyles, type Story } from "../StoryHero";
import Governance from "../Governance";
import Executives from "../Executives";
import Investors from "../Investors";
import {
  BlocksStyles,
  ContentSection,
  Timeline,
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
      {/* "Roadmap" — the phased path toward that direction. */}
      <ContentSection
        id="direction-roadmap"
        eyebrow="Where we're headed"
        title="Roadmap"
        subtitle="The phased path of how Notus Regalia scales its systems, sectors, and impact."
      >
        <Timeline
          phases={[
            { phase: 'Phase 01 · Foundation', title: 'Core Platform & Sectors', desc: 'Establish the operational backbone and the first wave of sector deployments across government and defense.' },
            { phase: 'Phase 02 · Expansion', title: 'Cross-Sector Integration', desc: 'Extend into healthcare, enterprise, and energy with shared intelligence and interoperable systems.' },
            { phase: 'Phase 03 · Autonomy', title: 'Adaptive Operations', desc: 'Mature AI-assisted operations that elevate human operators and compress decision cycles at scale.' },
            { phase: 'Phase 04 · Horizon', title: 'Global Resilience Network', desc: 'A resilient, allied network of mission-critical systems spanning every sector we serve.' },
          ]}
        />
      </ContentSection>
      <RevealSection id="direction-explore">
        <ExploreNext current="company-direction" />
      </RevealSection>
    </>
  );
});
DirectionPage.displayName = "DirectionPage";

export const GovernancePage = memo(() => {
  const tab = getCompanySubtab('company-governance');
  return (
    <>
      <div id="governance-overview">
        <PageHero {...tab.hero!} />
      </div>
      {/* Governance · Ethics & Responsibility · Commitments — editorial
          "pillars" layout (no sidebar tabs). */}
      <RevealSection id="governance-framework">
        <Governance />
      </RevealSection>
      <RevealSection id="governance-explore">
        <ExploreNext current="company-governance" />
      </RevealSection>
    </>
  );
});
GovernancePage.displayName = "GovernancePage";

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
