"use client";
import { useState, useEffect, useRef, Suspense, lazy } from 'react';

const LandingTab     = lazy(() => import('@/components/ParentCompany/Landing'));
const CompanyTab     = lazy(() => import('@/components/ParentCompany/Company'));
const TechnologiesTab = lazy(() => import('@/components/ParentCompany/Technologies'));

interface MainContentProps {
  activeTab: string;
  activeSubtab?: string;
}

const TabLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm" style={{ color: 'var(--content-muted)' }}>Loading...</p>
    </div>
  </div>
);

const MainContent = ({ activeTab, activeSubtab }: MainContentProps) => {
  const [displayedTab, setDisplayedTab] = useState(activeTab);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab !== displayedTab) {
      const timer = setTimeout(() => {
        setDisplayedTab(activeTab);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, displayedTab]);

  const renderContent = () => {
    switch (displayedTab) {
      case 'home':
        return <LandingTab />;
      case 'company':
        return <CompanyTab />;
      case 'technologies':
        return <TechnologiesTab activeSubtab={activeSubtab} />;
      default:
        return null;
    }
  };

  const isTransitioning = activeTab !== displayedTab;

  return (
    <div
      ref={mainContentRef}
      className={`relative z-10 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
    >
      <Suspense fallback={<TabLoadingFallback />}>
        {renderContent()}
      </Suspense>
    </div>
  );
};

export default MainContent;
