"use client";

import { memo, type ReactNode } from "react";
import PageHero from "./PageHero";
import ExploreNext from "./ExploreNext";
import IndustrySection from "../../Landing/IndustrySection";
import WhatWeDoBentoSection from "../../Landing/BentoSection";
import CompanyHeader from "../CompanyHeader";
import Mission from "../Mission";
import Executives from "../Executives";
import Investors from "../Investors";
import {
  BlocksStyles,
  ContentSection,
  FeatureGrid,
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

export const SectorsPage = memo(() => {
  const tab = getCompanySubtab('company-sectors');
  return (
    <>
      <div id="sectors-overview">
        <PageHero {...tab.hero!} />
      </div>
      <RevealSection id="sectors-industries">
        <IndustrySection />
      </RevealSection>
      <RevealSection id="sectors-explore">
        <ExploreNext current="company-sectors" />
      </RevealSection>
    </>
  );
});
SectorsPage.displayName = "SectorsPage";

export const MissionPage = memo(({ onLearnMore }: { onLearnMore?: (page: string) => void }) => {
  return (
    <>
      {/* "Our Company" — the original brand header (NOTUS REGALIA + the Manila /
          coordinates typing animation) followed by the company profile panel. */}
      <div id="mission-our-company">
        <CompanyHeader />
        <Mission onLearnMore={onLearnMore} />
      </div>
      {/* "What we do" — capabilities */}
      <RevealSection id="mission-what-we-do">
        <WhatWeDoBentoSection />
      </RevealSection>
      {/* "Roadmap" — where we're headed */}
      <BlocksStyles />
      <ContentSection
        id="mission-roadmap"
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
      <RevealSection id="mission-explore">
        <ExploreNext current="company-mission" />
      </RevealSection>
    </>
  );
});
MissionPage.displayName = "MissionPage";

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

export const VenturesPage = memo(() => {
  const tab = getCompanySubtab('company-ventures');
  return (
    <>
      <div id="ventures-overview">
        <PageHero {...tab.hero!} />
      </div>
      <BlocksStyles />
      <ContentSection
        id="ventures-subsidiaries"
        eyebrow="Wholly owned"
        title="Subsidiaries"
        subtitle="Operating companies built and owned by Notus Regalia, delivering mission-critical systems within their domains."
      >
        <FeatureGrid
          items={[
            { title: 'NR Defense Systems', desc: 'Command environments and operational platforms for allied defense.', icon: 'bi-shield-shaded', tag: 'Defense' },
            { title: 'NR Civic Operations', desc: 'Unified public-sector systems for coordinated service delivery.', icon: 'bi-building', tag: 'Government' },
            { title: 'NR Health Platforms', desc: 'Clinical coordination and data-trust infrastructure for healthcare.', icon: 'bi-heart-pulse', tag: 'Healthcare' },
          ]}
        />
      </ContentSection>
      <ContentSection
        id="ventures-portfolio"
        eyebrow="Strategic stakes"
        title="Portfolio Companies"
        subtitle="Established companies we back and partner with to extend our reach across sectors."
      >
        <FeatureGrid
          items={[
            { title: 'Gridline Energy', desc: 'Infrastructure intelligence for grid uptime and resilience.', icon: 'bi-lightning-charge', tag: 'Energy' },
            { title: 'Meridian Logistics', desc: 'Execution systems aligning cross-functional operations.', icon: 'bi-diagram-3', tag: 'Enterprise' },
            { title: 'Vantage Analytics', desc: 'Intelligence processing and data analytics at scale.', icon: 'bi-graph-up', tag: 'Data' },
          ]}
        />
      </ContentSection>
      <ContentSection
        id="ventures-startups"
        eyebrow="Early stage"
        title="Startups"
        subtitle="Emerging ventures we incubate from the ground up, exploring the next frontier of operational technology."
      >
        <FeatureGrid
          items={[
            { title: 'Sentry Robotics', desc: 'Robotics and embedded systems for autonomous operations.', icon: 'bi-robot', tag: 'Incubating' },
            { title: 'Aperture AI', desc: 'Human-centered AI that elevates operators, not replaces them.', icon: 'bi-cpu', tag: 'Seed' },
            { title: 'Beacon Secure', desc: 'Zero-trust security fabric for mission-critical networks.', icon: 'bi-lock', tag: 'Seed' },
          ]}
        />
      </ContentSection>
      <RevealSection id="ventures-explore">
        <ExploreNext current="company-ventures" />
      </RevealSection>
    </>
  );
});
VenturesPage.displayName = "VenturesPage";

export const HumanRightsPage = memo(() => {
  const tab = getCompanySubtab('company-human-rights');
  return (
    <>
      <div id="hr-overview">
        <PageHero {...tab.hero!} />
      </div>
      <BlocksStyles />
      <ContentSection
        id="hr-principles"
        eyebrow="Our commitment"
        title="Principles"
        subtitle="The foundational commitments that guide every decision across our operations, products, and partnerships."
      >
        <FeatureGrid
          items={[
            { title: 'Dignity & Respect', desc: 'We uphold the inherent dignity of every individual affected by our work.', icon: 'bi-person-check' },
            { title: 'Non-Discrimination', desc: 'We oppose discrimination in all forms across hiring, deployment, and partnership.', icon: 'bi-people' },
            { title: 'Responsible Technology', desc: 'We design systems that respect rights and resist misuse by intent and by safeguard.', icon: 'bi-shield-check' },
          ]}
        />
      </ContentSection>
      <ContentSection
        id="hr-safeguards"
        eyebrow="How we protect"
        title="Safeguards"
        subtitle="Concrete mechanisms that embed human-rights protection into how we build and operate."
      >
        <FeatureGrid
          items={[
            { title: 'Impact Assessments', desc: 'Human-rights due diligence on engagements before and during deployment.', icon: 'bi-clipboard-check' },
            { title: 'Use Restrictions', desc: 'Contractual and technical limits on how our systems may be used.', icon: 'bi-slash-circle' },
            { title: 'Oversight Review', desc: 'Independent review of high-sensitivity programs and partnerships.', icon: 'bi-eye' },
          ]}
        />
      </ContentSection>
      <ContentSection
        id="hr-report"
        eyebrow="Speak up"
        title="Report an issue"
        subtitle="If you believe our work has caused or contributed to a human-rights concern, we want to hear from you. Reports can be made confidentially and without retaliation."
      >
        <CtaLink href="mailto:humanrights@notusregalia.com" label="Contact the Human Rights Office" icon="bi-envelope" />
      </ContentSection>
      <ContentSection
        id="hr-transparency"
        eyebrow="Accountability"
        title="Transparency"
        subtitle="We publish how we govern human-rights commitments and report on our progress over time."
      >
        <FeatureGrid
          items={[
            { title: 'Annual Disclosure', desc: 'Yearly reporting on human-rights performance and remediation.', icon: 'bi-file-earmark-text', tag: 'Published' },
            { title: 'Grievance Records', desc: 'Aggregated, anonymized records of concerns raised and resolved.', icon: 'bi-journal-text', tag: 'Annual' },
            { title: 'Policy Governance', desc: 'Board-level oversight of the human-rights policy and its enforcement.', icon: 'bi-diagram-2', tag: 'Governed' },
          ]}
        />
      </ContentSection>
      <ContentSection
        id="hr-learn-more"
        eyebrow="Go deeper"
        title="Learn more"
        subtitle="Read the full NR Human Rights Policy and related corporate policies in our Information Central."
      >
        <CtaLink href="/information/legals/human-rights" label="Open the Information Central" icon="bi-box-arrow-up-right" />
      </ContentSection>
    </>
  );
});
HumanRightsPage.displayName = "HumanRightsPage";
