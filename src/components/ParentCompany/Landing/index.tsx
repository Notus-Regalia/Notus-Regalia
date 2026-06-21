"use client";

import HeroSection from './HeroSection';
import PartnersStrip from './PartnersStrip';
import MissionBanner from './MissionBanner';
import AboutSection from './IndustrySection';
import ReleasesSection from './ReleasesSection';
import FaqSection from './FaqSection';
import WhatWeDoBentoSection from './BentoSection';
import FrameworkSection from './FrameworkSection';
import ManifestoSection from './ManifestoSection';

const Landing = () => {
  return (
    <>
      {/* Hero, partners carousel and mission banner are locked to the dark
          palette regardless of the active site theme. The `dark` class
          re-scopes the dark CSS variables for this subtree, overriding the
          `.light` class on <html>. */}
      <div className="dark">
        {/* Home - Hero Section */}
        <HeroSection />

        {/* Partners / Trusted By */}
        <PartnersStrip />

        {/* Our Mission */}
        <MissionBanner />
      </div>

      {/* Industries */}
      <AboutSection />

      {/* Latest Releases */}
      <ReleasesSection />

      {/* Frequently Asked Questions */}
      <FaqSection />
    </>
  );
};

export default Landing;
