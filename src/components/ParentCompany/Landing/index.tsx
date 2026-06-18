"use client";

import HeroSection from './HeroSection';
import AboutSection from './IndustrySection';
import StatsSection from './StatsSection';
import ReleasesSection from './ReleasesSection';
import WhatWeDoBentoSection from './BentoSection';
import FrameworkSection from './FrameworkSection';
import ManifestoSection from './ManifestoSection';

const Landing = () => {
  return (
    <>
      {/* Home - Hero Section */}
      <HeroSection />

      {/* Stats / Pillars Strip */}
      <StatsSection />

      {/* Latest Releases */}
      <ReleasesSection />
    </>
  );
};

export default Landing;
