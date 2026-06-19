"use client";

import HeroSection from './HeroSection';
import AboutSection from './IndustrySection';
import ReleasesSection from './ReleasesSection';
import FaqSection from './FaqSection';
import WhatWeDoBentoSection from './BentoSection';
import FrameworkSection from './FrameworkSection';
import ManifestoSection from './ManifestoSection';

const Landing = () => {
  return (
    <>
      {/* Home - Hero Section */}
      <HeroSection />

      {/* Latest Releases */}
      <ReleasesSection />

      {/* Frequently Asked Questions */}
      <FaqSection />
    </>
  );
};

export default Landing;
