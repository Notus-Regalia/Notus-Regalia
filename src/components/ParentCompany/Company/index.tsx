"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import DetailView from './details';
import ExecutiveProfile from './ExecutiveProfile';
import ExecutiveComingSoon from './ExecutiveComingSoon';
import {
  AboutCompanyPage,
  DirectionPage,
  ExecutivesPage,
  InvestorsPage,
} from './subpages/pages';
import { getCompanySubtab } from '@/data/company-nav';
import { getFounderBySlug, executiveHref } from '@/data/Company-data';
import { rootHref } from '@/utils/routes';
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
  /* Slug of the executive whose dedicated profile replaces the Executives page. */
  const [executiveSlug, setExecutiveSlug] = useState<string | null>(null);
  const executiveSlugRef = useRef<string | null>(null);
  executiveSlugRef.current = executiveSlug;

  /* Phase: 'idle' → 'fade-out' → swap → 'fade-in' → 'idle' */
  const [phase, setPhase] = useState<'idle' | 'fade-out' | 'fade-in'>('idle');

  /* ── Preload the Direction "Vision" banner so it's already cached when the
     subtab opens, instead of streaming in and popping after the fade-in. ── */
  useEffect(() => {
    const img = new Image();
    img.src = '/banner-2.jpg';
  }, []);

  /* ── Scroll helper (works with/without ScrollSmoother) ── */
  const scrollToTop = useCallback(() => {
    const sm = typeof window !== 'undefined' ? ScrollSmoother.get?.() : null;
    if (sm) { sm.scrollTo(0, false); }
    else { window.scrollTo({ top: 0, behavior: 'instant' }); }
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
      setExecutiveSlug(null);
    });
  }, [targetSubtab, displayedSubtab, detailPage, phase, runTransition]);

  /* ── Detail page actions (About the Company "Learn More") ── */
  const openDetail = useCallback((page: string) => {
    runTransition(() => setDetailPage(page));
  }, [runTransition]);

  const closeDetail = useCallback(() => {
    runTransition(() => setDetailPage(null));
  }, [runTransition]);

  /* ── Executive profile actions ──
     A profile replaces the entire Executives page in place (no full navigation),
     and the navbar strip swaps to a breadcrumb for the selected executive. The
     address bar is kept in sync (/company/executives/<slug>) for SEO and so the
     URL is shareable — without leaving the SPA. */
  const openExecutive = useCallback((slug: string) => {
    if (slug === executiveSlugRef.current) return;
    runTransition(() => setExecutiveSlug(slug));
    window.history.pushState(null, '', executiveHref(slug));
  }, [runTransition]);

  const closeExecutive = useCallback(() => {
    if (!executiveSlugRef.current) return;
    runTransition(() => setExecutiveSlug(null));
    window.history.pushState(null, '', rootHref('company', 'company-executives'));
  }, [runTransition]);

  // An Executives card / "View Profile" left-click opens the profile inline.
  useEffect(() => {
    const handler = (e: Event) => {
      const slug = (e as CustomEvent).detail?.slug as string | undefined;
      if (slug) openExecutive(slug);
    };
    window.addEventListener('executive-open', handler);
    return () => window.removeEventListener('executive-open', handler);
  }, [openExecutive]);

  // Direct load + browser back/forward: sync the profile to the path without
  // re-pushing. /company/executives/<slug> → open that profile; else → close.
  useEffect(() => {
    const syncFromPath = (animate: boolean) => {
      const segs = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
      const slug = segs[0] === 'company' && segs[1] === 'executives' && segs[2] ? segs[2] : null;
      const next = slug && getFounderBySlug(slug) ? slug : null;
      if (next === executiveSlugRef.current) return;
      if (animate) runTransition(() => setExecutiveSlug(next));
      else setExecutiveSlug(next);
    };
    syncFromPath(false); // initial: open instantly if landed on a profile URL
    const onPop = () => syncFromPath(true);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [runTransition]);

  // Tell the navbar to swap its strip to the executive breadcrumb (and back).
  useEffect(() => {
    const founder = executiveSlug ? getFounderBySlug(executiveSlug) : null;
    window.dispatchEvent(new CustomEvent('company-executive', {
      detail: { open: !!founder, name: founder?.name ?? '', slug: executiveSlug },
    }));
  }, [executiveSlug]);

  // Closing the breadcrumb returns to the Executives main page.
  useEffect(() => {
    const handler = () => closeExecutive();
    window.addEventListener('company-executive-back', handler);
    return () => window.removeEventListener('company-executive-back', handler);
  }, [closeExecutive]);

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
      if (tab === 'company') { closeDetail(); closeExecutive(); }
    };
    window.addEventListener('tab-reset', handler);
    return () => window.removeEventListener('tab-reset', handler);
  }, [closeDetail, closeExecutive]);

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

  if (executiveSlug) {
    const founder = getFounderBySlug(executiveSlug);
    if (founder) {
      return (
        <div style={{ paddingTop: 'env(safe-area-inset-top)', ...wrapStyle }}>
          {founder.published
            ? <ExecutiveProfile founder={founder} onBack={closeExecutive} />
            : <ExecutiveComingSoon name={founder.name} title={founder.title} onBack={closeExecutive} />}
        </div>
      );
    }
  }

  if (detailPage) {
    return (
      <div style={wrapStyle}>
        <DetailView page={detailPage} />
      </div>
    );
  }

  const renderPage = () => {
    switch (displayedSubtab) {
      case 'company-direction':    return <DirectionPage />;
      case 'company-executives':   return <ExecutivesPage />;
      case 'company-investors':    return <InvestorsPage />;
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
