"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import DetailView from './details';
import {
  SectorsPage,
  AboutCompanyPage,
  ExecutivesPage,
  InvestorsPage,
  VenturesPage,
  HumanRightsPage,
} from './subpages/pages';
import { getCompanySubtab } from '@/data/company-nav';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

/* ── Transition timings (ms) ── */
const FADE_OUT = 280;
const FADE_IN  = 350;

interface CompanyProps {
  activeSubtab?: string;
}

const Company = ({ activeSubtab }: CompanyProps) => {
  /* Resolve the requested subtab page (external entries fall back to default) */
  const targetSubtab = getCompanySubtab(activeSubtab).id;

  const [displayedSubtab, setDisplayedSubtab] = useState(targetSubtab);
  const [detailPage, setDetailPage] = useState<string | null>(null);

  /* Phase: 'idle' → 'fade-out' → swap → 'fade-in' → 'idle' */
  const [phase, setPhase] = useState<'idle' | 'fade-out' | 'fade-in'>('idle');

  /* ── Scroll helper (works with/without ScrollSmoother) ── */
  const scrollToTop = useCallback(() => {
    const sm = typeof window !== 'undefined' ? ScrollSmoother.get?.() : null;
    if (sm) { sm.scrollTo(0, false); }
    else { window.scrollTo({ top: 0 }); }
  }, []);

  /* ── Transition engine: fade out, apply swap, fade in ── */
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const runTransition = useCallback((apply: () => void) => {
    if (phaseRef.current !== 'idle') return; // ignore during in-flight transition
    setPhase('fade-out');

    setTimeout(() => {
      apply();

      // Jump to top instantly (before fade-in so user doesn't see scroll)
      scrollToTop();

      // Start fade-in on next frame so the DOM has the new content
      requestAnimationFrame(() => {
        setPhase('fade-in');
        setTimeout(() => setPhase('idle'), FADE_IN);
      });
    }, FADE_OUT);
  }, [scrollToTop]);

  /* ── Subtab page switching ──
     Runs whenever the requested subtab differs from the displayed one.
     Re-checked when phase returns to idle so rapid clicks settle on the
     latest target. */
  useEffect(() => {
    if (phase !== 'idle') return;
    if (targetSubtab === displayedSubtab) return;
    runTransition(() => {
      setDisplayedSubtab(targetSubtab);
      setDetailPage(null);
    });
  }, [targetSubtab, displayedSubtab, detailPage, phase, runTransition]);

  /* ── Detail page actions (About the Company "Learn More") ── */
  const openDetail = useCallback((page: string) => {
    runTransition(() => setDetailPage(page));
  }, [runTransition]);

  const closeDetail = useCallback(() => {
    runTransition(() => setDetailPage(null));
  }, [runTransition]);

  // Dispatch navbar events when detail state changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('company-detail', { detail: { open: !!detailPage } }));
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
    transform: phase === 'fade-out' ? 'translateY(12px)' : 'translateY(0)',
    transition: phase === 'fade-out'
      ? `opacity ${FADE_OUT}ms ease, transform ${FADE_OUT}ms ease`
      : phase === 'fade-in'
        ? `opacity ${FADE_IN}ms ease, transform ${FADE_IN}ms ease`
        : 'none',
  };

  if (detailPage) {
    return (
      <div style={wrapStyle}>
        <DetailView page={detailPage} />
      </div>
    );
  }

  const renderPage = () => {
    switch (displayedSubtab) {
      case 'company-sectors':      return <SectorsPage />;
      case 'company-executives':   return <ExecutivesPage />;
      case 'company-investors':    return <InvestorsPage />;
      case 'company-ventures':     return <VenturesPage />;
      case 'company-human-rights': return <HumanRightsPage />;
      case 'company-about':
      default:                     return <AboutCompanyPage onLearnMore={openDetail} />;
    }
  };

  return (
    <div style={{ paddingTop: 'env(safe-area-inset-top)', ...wrapStyle }}>
      {renderPage()}
    </div>
  );
};

export default Company;
