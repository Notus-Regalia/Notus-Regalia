"use client";

import { memo, type ReactNode } from "react";
import PageHero from "./PageHero";
import ExploreNext from "./ExploreNext";
import WhatWeDoBentoSection from "../../Landing/BentoSection";
import CompanyHeader from "../CompanyHeader";
import AboutCompany from "../AboutCompany";
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

export const AboutCompanyPage = memo(({ onLearnMore }: { onLearnMore?: (page: string) => void }) => {
  return (
    <>
      {/* "Our Company" — the original brand header (NOTUS REGALIA + the Manila /
          coordinates typing animation) followed by the company profile panel. */}
      <div id="about-our-company">
        <CompanyHeader />
        <AboutCompany onLearnMore={onLearnMore} />
      </div>
      {/* "What we do" — capabilities */}
      <RevealSection id="about-what-we-do">
        <WhatWeDoBentoSection />
      </RevealSection>
      {/* "Roadmap" — where we're headed */}
      <BlocksStyles />
      <ContentSection
        id="about-roadmap"
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
      <RevealSection id="about-explore">
        <ExploreNext current="company-about" />
      </RevealSection>
    </>
  );
});
AboutCompanyPage.displayName = "AboutCompanyPage";

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
