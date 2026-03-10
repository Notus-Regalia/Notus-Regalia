"use client";

import HeroSection from './HeroSection';
import AboutSection from './IndustrySection';
import StatsSection from './StatsSection';
import WhatWeDoBentoSection from './WhatWeDoBentoSection';
import SoftwareDemo from './SoftwareDemo';
import FrameworkSection from './FrameworkSection';
import FeaturesSection from './StackingCardSection';
import ManifestoSection from './ManifestoSection';

const Landing = () => {
  return (
    <>
      {/* Home - Hero Section */}
      <HeroSection />

      {/* Stats / Pillars Strip */}
      <StatsSection />

      {/* Industry */}
      <AboutSection />

      {/* What We Do */}
      <WhatWeDoBentoSection />

      {/* Command & Control Demo */}
      <SoftwareDemo />

      {/* Intelligence Stack — isometric C2 architecture */}
      <FrameworkSection />

      {/* Features / Operations */}
      <FeaturesSection />

      {/* Manifesto */}
      <ManifestoSection />
    </>
  );
};

export default Landing;
