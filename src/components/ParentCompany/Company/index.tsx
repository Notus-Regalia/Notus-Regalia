"use client";
import { memo, useState, useEffect, useRef, useCallback } from 'react';
import CompanyHeader from './CompanyHeader';
import Organization from './Organization';
import Mission from './Mission';
import Investors from './Investors';
import DetailView from './details';
import IndustrySection from '../Landing/IndustrySection';
import WhatWeDoBentoSection from '../Landing/BentoSection';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { useReveal } from '@/hooks/useScrollReveal';

/* ── Transition timings (ms) ── */
const FADE_OUT = 280;
const FADE_IN  = 350;

const Company = () => {
  const [detailPage, setDetailPage] = useState<string | null>(null);
  const returnSectionRef = useRef<string | null>(null);

  /* Phase: 'idle' → 'fade-out' → swap → 'fade-in' → 'idle' */
  const [phase, setPhase] = useState<'idle' | 'fade-out' | 'fade-in'>('idle');
  const pendingRef = useRef<string | null | undefined>(undefined); // queued value for detailPage

  /* ── Scroll helper (works with/without ScrollSmoother) ── */
  const scrollToTop = useCallback(() => {
    const sm = typeof window !== 'undefined' ? ScrollSmoother.get?.() : null;
    if (sm) { sm.scrollTo(0, false); }
    else { window.scrollTo({ top: 0 }); }
  }, []);

  /* ── Transition engine ── */
  const runTransition = useCallback((nextPage: string | null) => {
    if (phase !== 'idle') return; // ignore during in-flight transition
    pendingRef.current = nextPage;
    setPhase('fade-out');

    setTimeout(() => {
      // Swap content
      setDetailPage(nextPage);

      // Jump to top instantly (before fade-in so user doesn't see scroll)
      scrollToTop();

      // Start fade-in on next frame so the DOM has the new content
      requestAnimationFrame(() => {
        setPhase('fade-in');

        // After fade-in, cleanup
        setTimeout(() => {
          setPhase('idle');
          pendingRef.current = undefined;
        }, FADE_IN);
      });
    }, FADE_OUT);
  }, [phase, scrollToTop]);

  /* ── Public actions ── */
  const openDetail = useCallback((page: string, sectionId?: string) => {
    returnSectionRef.current = sectionId ?? null;
    runTransition(page);
  }, [runTransition]);

  const closeDetail = useCallback(() => {
    runTransition(null);
  }, [runTransition]);

  // Dispatch navbar events when detail state changes
  useEffect(() => {
    if (detailPage) {
      window.dispatchEvent(new CustomEvent('company-detail', { detail: { open: true } }));
    } else {
      window.dispatchEvent(new CustomEvent('company-detail', { detail: { open: false } }));
    }
  }, [detailPage]);

  // Listen for strip "Return to Previous Page" click
  useEffect(() => {
    const handler = () => closeDetail();
    window.addEventListener('company-detail-back', handler);
    return () => window.removeEventListener('company-detail-back', handler);
  }, [closeDetail]);

  // Reset when the Company nav tab is re-clicked
  useEffect(() => {
    const handler = (e: Event) => {
      const { tab } = (e as CustomEvent).detail;
      if (tab === 'company') closeDetail();
    };
    window.addEventListener('tab-reset', handler);
    return () => window.removeEventListener('tab-reset', handler);
  }, [closeDetail]);

  /* ── Transition style ── */
  const wrapStyle: React.CSSProperties = {
    opacity: phase === 'fade-out' ? 0 : 1,
    transform: phase === 'fade-out'
      ? 'translateY(12px)'
      : phase === 'fade-in'
        ? 'translateY(0)'
        : 'translateY(0)',
    transition: phase === 'fade-out'
      ? `opacity ${FADE_OUT}ms ease, transform ${FADE_OUT}ms ease`
      : phase === 'fade-in'
        ? `opacity ${FADE_IN}ms ease, transform ${FADE_IN}ms ease`
        : 'none',
  };

  /* ── Scroll-triggered entrance animations ── */
  const sectorsReveal = useReveal('fade-up', { threshold: 0.08, rootMargin: '0px 0px -40px 0px', duration: 800 });
  const capabilitiesReveal = useReveal('fade-up', { threshold: 0.08, rootMargin: '0px 0px -40px 0px', duration: 800, cssDelay: 80 });
  const missionReveal = useReveal('fade-up', { threshold: 0.08, rootMargin: '0px 0px -40px 0px', duration: 800, cssDelay: 80 });
  const organizationReveal = useReveal('fade-up', { threshold: 0.08, rootMargin: '0px 0px -40px 0px', duration: 800, cssDelay: 80 });
  const investorsReveal = useReveal('fade-up', { threshold: 0.08, rootMargin: '0px 0px -40px 0px', duration: 800, cssDelay: 80 });

  if (detailPage) {
    return (
      <div style={wrapStyle}>
        <DetailView page={detailPage} />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'env(safe-area-inset-top)', ...wrapStyle }}>
      {/* Company Header */}
      <CompanyHeader />

      {/* Sectors Section */}
      <div id="section-sectors" ref={sectorsReveal.ref} style={sectorsReveal.style}>
        <IndustrySection />
      </div>

      {/* Capabilities Section */}
      <div id="section-capabilities" ref={capabilitiesReveal.ref} style={capabilitiesReveal.style}>
        <WhatWeDoBentoSection />
      </div>

      {/* Mission panel: company / direction / governance / reachout */}
      <div id="section-mission" ref={missionReveal.ref} style={missionReveal.style}>
        <Mission onLearnMore={(page) => openDetail(page, 'section-mission')} />
      </div>

      {/* Teams */}
      <div id="section-organization" ref={organizationReveal.ref} style={organizationReveal.style}>
        <Organization />
      </div>

      {/* Investors */}
      <div id="section-investors" ref={investorsReveal.ref} style={investorsReveal.style}>
        <Investors />
      </div>
    </div>
  );
};

export default Company;
