"use client";

import HeroSection from './HeroSection';
import AboutSection from './IndustrySection';
import StatsSection from './StatsSection';
import SoftwareDemo from './SoftwareDemo';
import FeaturesSection from './CardSection';
import ManifestoSection from './ManifestoSection';

const Landing = () => {
  return (
    <>
      {/* Home - Hero Section */}
      <HeroSection />

      {/* Stats / Pillars Strip */}
      <StatsSection />

      {/* Command & Control Demo */}
      <SoftwareDemo />

      {/* About / Mission */}
      <AboutSection />

      {/* Features / Operations */}
      <FeaturesSection />

      {/* Manifesto */}
      <ManifestoSection />
    </>
  );
};

export default Landing;