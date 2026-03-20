"use client";
import { memo, useState, useEffect, useRef, useCallback } from 'react';
import Overview from './OverviewGrids';
import CompanyHeader from './CompanyHeader';
import TheOrganization from './TheOrganization';
import TheCompany from './TheCompany';
import StrategicCapital from './StrategicCapital';
import DetailView from './details';
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
  const overviewReveal = useReveal('fade-up', { threshold: 0.08, rootMargin: '0px 0px -40px 0px', duration: 800 });
  const companyReveal = useReveal('fade-up', { threshold: 0.08, rootMargin: '0px 0px -40px 0px', duration: 800, cssDelay: 80 });
  const orgReveal = useReveal('fade-up', { threshold: 0.08, rootMargin: '0px 0px -40px 0px', duration: 800, cssDelay: 80 });
  const capitalReveal = useReveal('fade-up', { threshold: 0.08, rootMargin: '0px 0px -40px 0px', duration: 800, cssDelay: 80 });

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

      {/* Overview Section */}
      <div id="section-overview" ref={overviewReveal.ref} style={overviewReveal.style}>
        <Overview onLearnMore={() => openDetail('overview', 'section-overview')} />
      </div>

      {/* About panel: company / direction / governance / reachout */}
      <div id="section-TheCompany" ref={companyReveal.ref} style={companyReveal.style}>
        <TheCompany onLearnMore={(page) => openDetail(page, 'section-TheCompany')} />
      </div>

      {/* Teams */}
      <div id="section-TheOrganization" ref={orgReveal.ref} style={orgReveal.style}>
        <TheOrganization />
      </div>

      {/* StrategicCapital */}
      <div id="section-StrategicCapital" ref={capitalReveal.ref} style={capitalReveal.style}>
        <StrategicCapital />
      </div>
    </div>
  );
};

export default Company;
