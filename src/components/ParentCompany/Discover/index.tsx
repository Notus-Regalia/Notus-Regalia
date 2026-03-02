"use client";
import { memo, useState, useEffect, useRef } from 'react';
import Overview from './OverviewGrids';
import DiscoverHeader from './DiscoverHeader';
import TheOrganization from './TheOrganization';
import TheCompany from './TheCompany';
import StrategicCapital from './StrategicCapital';
import DetailView from './details';

const Discover = () => {
  const [detailPage, setDetailPage] = useState<string | null>(null);
  const returnSectionRef = useRef<string | null>(null);

  const openDetail = (page: string, sectionId?: string) => {
    returnSectionRef.current = sectionId ?? null;
    setDetailPage(page);
  };

  const closeDetail = () => {
    const sectionId = returnSectionRef.current;
    setDetailPage(null);
    if (sectionId) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      });
    }
  };

  // Scroll to top when detail page opens, and dispatch events for navbar
  useEffect(() => {
    if (detailPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('discover-detail', { detail: { open: true } }));
    } else {
      window.dispatchEvent(new CustomEvent('discover-detail', { detail: { open: false } }));
    }
  }, [detailPage]);

  // Listen for strip "Return to Previous Page" click
  useEffect(() => {
    const handler = () => closeDetail();
    window.addEventListener('discover-detail-back', handler);
    return () => window.removeEventListener('discover-detail-back', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when the Discover nav tab is re-clicked
  useEffect(() => {
    const handler = (e: Event) => {
      const { tab } = (e as CustomEvent).detail;
      if (tab === 'discover') closeDetail();
    };
    window.addEventListener('tab-reset', handler);
    return () => window.removeEventListener('tab-reset', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (detailPage) {
    return <DetailView page={detailPage} />;
  }

  return (
    <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Discover Header */}
      <DiscoverHeader />

      {/* Overview Section */}
      <div id="section-overview">
        <Overview onLearnMore={() => openDetail('overview', 'section-overview')} />
      </div>

      {/* About panel: company / direction / governance / reachout */}
      <div id="section-TheCompany">
        <TheCompany onLearnMore={(page) => openDetail(page, 'section-TheCompany')} />
      </div>

      {/* Teams */}
      <div id="section-TheOrganization">
        <TheOrganization />
      </div>

      {/* StrategicCapital */}
      <div id="section-StrategicCapital">
        <StrategicCapital />
      </div>
    </div>
  );
};

export default Discover;