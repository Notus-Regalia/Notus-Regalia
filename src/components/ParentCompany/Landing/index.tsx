"use client";

import HeroSection from './HeroSection';
import AboutSection from './IndustrySection';
import StatsSection from './StatsSection';
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

      {/* What We Do */}
      <WhatWeDoBentoSection />

      {/* Industry */}
      <AboutSection />

      {/* Intelligence Stack — isometric C2 architecture */}
      <FrameworkSection />

      {/* Manifesto */}
      {/* <ManifestoSection /> */}
    </>
  );
};

export default Landing;
