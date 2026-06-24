"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { NAVBAR_CSS } from '@/components/ui/navbar-styles';
import SearchModal from '@/components/ui/SearchModal';
import NavDropdown, { type DropItem } from '@/components/ui/NavDropdown';
import { INFO_TABS, SUBTAB_SUBPAGES, type InfoTab, type InfoSubtab } from './data';

// Per-subtab icon + blurb shown in the hover dropdown panel (keyed by subtab id).
const INFO_SUBTAB_META: Record<string, { icon: string; desc: string }> = {
  // Newsroom
  releases:      { icon: 'bi-megaphone',     desc: 'Official product and company announcements, straight from the source' },
  announcements: { icon: 'bi-bell',          desc: 'Timely notices, updates, and milestones worth knowing about' },
  media:         { icon: 'bi-camera-video',  desc: 'Press coverage, interviews, and downloadable media features' },
  careers:       { icon: 'bi-briefcase',     desc: 'Open roles, our culture, and how the hiring process works' },
  // Investors
  news:          { icon: 'bi-newspaper',     desc: 'Latest investor news, disclosures, and shareholder updates' },
  events:        { icon: 'bi-calendar-event',desc: 'Upcoming earnings calls, presentations, and investor events' },
  financials:    { icon: 'bi-bar-chart',     desc: 'Earnings reports, filings, and detailed financial statements' },
  governance:    { icon: 'bi-bank',          desc: 'Board structure, leadership oversight, and governance policies' },
  resources:     { icon: 'bi-folder2-open',  desc: 'Fact sheets, FAQs, and key resources for shareholders' },
  // Research
  'case-studies':      { icon: 'bi-clipboard-data',     desc: 'Real-world deployments and the measurable outcomes they drove' },
  'technical-reports': { icon: 'bi-file-earmark-text',  desc: 'In-depth research, methodology, and technical findings' },
  documentations:      { icon: 'bi-journal-text',       desc: 'Product guides, API references, and integration docs' },
  'field-testing':     { icon: 'bi-clipboard-check',    desc: 'Field trials, pilot programs, and validated results' },
  'open-source':       { icon: 'bi-github',             desc: 'Open-source projects, libraries, and community contributions' },
  // Legals
  policies:                  { icon: 'bi-file-earmark-ruled', desc: 'Corporate policies governing how we operate and conduct business' },
  'human-rights':            { icon: 'bi-people',             desc: 'Our commitments to human rights across operations and supply chains' },
  privacy:                   { icon: 'bi-shield-lock',        desc: 'How we collect, use, and protect your personal data' },
  'cookie-policy':           { icon: 'bi-file-earmark-text',  desc: 'The cookies we use and how to manage your preferences' },
  terms:                     { icon: 'bi-file-earmark-check', desc: 'The terms and conditions governing use of our services' },
  'acceptable-use':          { icon: 'bi-hand-thumbs-up',     desc: 'Rules and limits for acceptable use of our platforms' },
  'vulnerability-disclosure':{ icon: 'bi-bug',                desc: 'How to responsibly report a security vulnerability to us' },
  licenses:                  { icon: 'bi-card-checklist',     desc: 'Software licenses and third-party attributions we rely on' },
  // Documents
  'docs-governance':    { icon: 'bi-bank',   desc: 'Charters, bylaws, and corporate governance documents' },
  'docs-social':        { icon: 'bi-people',  desc: 'Social impact, community, and workforce disclosures' },
  'docs-environmental': { icon: 'bi-tree',    desc: 'Sustainability reports and environmental commitments' },
  'media-assets':       { icon: 'bi-images',  desc: 'Logos, imagery, and approved media assets for download' },
  'brand-guidelines':   { icon: 'bi-palette', desc: 'How to use our brand, identity, and visual standards' },
};

/* ── GSAP-aware scroll helpers (mirrors main Navbar) ───────────── */
const gsapScrollToTop = (smooth = true) => {
  const sm = typeof window !== 'undefined' ? ScrollSmoother.get?.() : null;
  if (sm) sm.scrollTo(0, smooth);
  else window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'instant' });
};

const INFO_LOGO_CSS = `
.info-logo-stack { display: flex; flex-direction: column; align-items: stretch; line-height: 1; }
/* Sub-label letters spread evenly to span exactly the width of the
   "Notus Regalia" wordmark above it. */
.info-logo-subtitle {
  display: flex;
  width: 100%;
  justify-content: space-between;
  font-size: 0.56rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--content-muted);
  margin-top: 7px;
}
.info-logo-subtitle .gap { width: 0.4em; }
@media (max-width: 640px) { .info-logo-subtitle { font-size: 0.5rem; margin-top: 6px; } }
`;

interface InfoNavbarProps {
  activeTab: string;
  activeSubtab: string;
  onTabClick: (tabId: string) => void;
  onSubtabClick: (tabId: string, subtabId: string) => void;
  onLogoClick: () => void;
}


// ─────────────────────────────────────────────────────────────
//  StripRow — morphing-pill subtab strip (mirrors the main Navbar)
//  The active subtab springs its burger open and expands into a
//  rounded pill (burger + label); siblings glide along the flex row.
//  No sliding box indicator — the pill itself marks the active page.
// ─────────────────────────────────────────────────────────────
interface StripRowProps {
  item: InfoTab;
  isVisible: boolean;
  activeSubtabId: string | null;
  onSubtabClick: (sub: InfoSubtab) => void;
  onCollapse: () => void;
  isMobile?: boolean;
  // When set, the strip renders a breadcrumb ("<anchor> › <crumb>") instead of
  // the subtab pills — used when viewing a hidden sub-page.
  breadcrumb?: { anchorLabel: string; crumbLabel: string; onAnchor: () => void };
}

const StripRow = memo(({ item, isVisible, activeSubtabId, onSubtabClick, onCollapse, isMobile, breadcrumb }: StripRowProps) => {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [entering, setEntering] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  // Retain the last breadcrumb so the crumbs layer keeps its label while it
  // flips *out* (after navigating off a sub-page `breadcrumb` goes undefined).
  const [lastCrumb, setLastCrumb] = useState(breadcrumb);
  useEffect(() => { if (breadcrumb) setLastCrumb(breadcrumb); }, [breadcrumb]);

  // Track scroll position to determine arrow direction (mobile overflow)
  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setAtEnd(maxScroll > 2 && track.scrollLeft >= maxScroll - 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const handler = () => updateScrollState();
    track.addEventListener('scroll', handler, { passive: true });
    updateScrollState();
    return () => track.removeEventListener('scroll', handler);
  }, [isVisible, updateScrollState]);

  // Auto-scroll the active subtab pill into center view (mobile overflow)
  useEffect(() => {
    if (!activeSubtabId || !isVisible) return;
    const idx = item.subtabs.findIndex(s => s.id === activeSubtabId);
    if (idx < 0) return;
    const btn = btnRefs.current[idx];
    const track = trackRef.current;
    if (!btn || !track) return;
    // Wait a frame for layout (the pill morph) to settle
    requestAnimationFrame(() => {
      const trackRect = track.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const btnCenter = btnRect.left + btnRect.width / 2 - trackRect.left + track.scrollLeft;
      const targetScroll = btnCenter - trackRect.width / 2;
      track.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    });
  }, [activeSubtabId, isVisible, item.subtabs]);

  // Staggered entrance the first frame the strip opens
  useEffect(() => {
    if (!isVisible) { setEntering(false); return; }
    setEntering(true);
    const t = setTimeout(() => setEntering(false), 400);
    return () => clearTimeout(t);
  }, [isVisible]);

  const handleArrowClick = useCallback(() => {
    if (isMobile && trackRef.current) {
      const track = trackRef.current;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const maxScroll = track.scrollWidth - track.clientWidth;
        const newLeft = Math.min(track.scrollLeft + track.clientWidth * 0.65, maxScroll);
        track.scrollTo({ left: newLeft, behavior: 'smooth' });
      }
    } else {
      onCollapse();
    }
  }, [isMobile, atEnd, onCollapse]);

  const arrowIcon = isMobile ? (atEnd ? 'bi-chevron-left' : 'bi-chevron-right') : 'bi-chevron-up';

  // Opening a publication swaps the subtab pills for a breadcrumb. Both layers
  // are always mounted and card-flip around the horizontal axis (rotateX) — the
  // exact same flip the main Navbar's Company strip uses for the executives ⟷
  // show-profile swap (.company-strip / .strip-flip-nav / .strip-flip-crumbs).
  const showCrumbs = !!breadcrumb;
  const crumb = breadcrumb ?? lastCrumb;
  const collapseLabel = isMobile ? `Scroll ${item.label} sections` : `Hide ${item.label} sections`;

  return (
    <div className={`subtab-strip-outer${isVisible ? ' strip-visible' : ''}${entering ? ' strip-entering' : ''}`}>
      <div className="subtab-strip-clip">
        <div className="subtab-strip-inner company-strip" style={{ position: 'relative' }}>
          {/* Layer A — subtab pills (flips "up" out of view when crumbs show) */}
          <div className={`strip-crossfade-layer strip-flip-nav ${showCrumbs ? 'strip-layer-hidden' : 'strip-layer-visible'}`}>
            <div className="strip-tabs-track" ref={trackRef}>
              {item.subtabs.map((sub, idx) => {
                const isActive = activeSubtabId === sub.id;
                // External items just open a link, so they stay plain tabs.
                if (sub.external) {
                  return (
                    <button
                      key={sub.id}
                      ref={el => { btnRefs.current[idx] = el; }}
                      className={`strip-tab strip-tab-external${isActive ? ' strip-tab-active' : ''}`}
                      style={{ '--si': idx, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' } as React.CSSProperties}
                      onClick={() => onSubtabClick(sub)}
                    >
                      {sub.label}
                      <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.7rem' }} />
                    </button>
                  );
                }
                // Same morphing button as the main Navbar's strip: the active page
                // springs the burger open and expands into the breadcrumb-title
                // pill. Only a class toggles (the keyed element is reused), so
                // width/padding/icons animate smoothly as the active page changes.
                return (
                  <button
                    key={sub.id}
                    ref={el => { btnRefs.current[idx] = el; }}
                    className={`strip-tab strip-tab-morph${isActive ? ' strip-tab-pill' : ''}`}
                    style={{ '--si': idx } as React.CSSProperties}
                    onClick={() => onSubtabClick(sub)}
                    aria-label={sub.label}
                  >
                    <span className="strip-morph-burger" aria-hidden>
                      <span /><span /><span />
                    </span>
                    <span className="strip-morph-label">{sub.label}</span>
                  </button>
                );
              })}
            </div>
            <button className="strip-collapse" onClick={handleArrowClick} aria-label={collapseLabel}>
              <i className={`bi ${arrowIcon}`} />
            </button>
          </div>

          {/* Layer B — publication breadcrumb (flips "down" into view) */}
          <div className={`strip-crossfade-layer strip-flip-crumbs ${showCrumbs ? 'strip-layer-visible' : 'strip-layer-hidden'}`}>
            <div className="strip-tabs-track">
              {/* Anchor — returns to the parent subtab page */}
              <button
                className="strip-anchor"
                onClick={crumb?.onAnchor}
                aria-label={crumb ? `Back to ${crumb.anchorLabel}` : undefined}
                title={crumb ? `Back to ${crumb.anchorLabel}` : undefined}
              >
                <span className="strip-anchor-burger" aria-hidden>
                  <span /><span /><span />
                </span>
                <span className="strip-anchor-label">{crumb?.anchorLabel}</span>
                <i className="bi bi-x-lg strip-anchor-close" aria-hidden />
              </button>
              <span className="strip-crumb-sep" aria-hidden>
                <i className="bi bi-chevron-right" />
              </span>
              <button className="strip-crumb strip-crumb-active" aria-current="page">
                {crumb?.crumbLabel}
              </button>
            </div>
            <button className="strip-collapse" onClick={handleArrowClick} aria-label={collapseLabel}>
              <i className={`bi ${arrowIcon}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
StripRow.displayName = 'InfoStripRow';

// ─────────────────────────────────────────────────────────────
//  InfoNavbar — mirrors the main Navbar shell
// ─────────────────────────────────────────────────────────────
const InfoNavbar = ({ activeTab, activeSubtab, onTabClick, onSubtabClick, onLogoClick }: InfoNavbarProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [stripOpen, setStripOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedTab, setMobileExpandedTab] = useState<string | null>(null);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [navLocked, setNavLocked] = useState(false);

  // ── Hover preview: peek a tab's subtabs in the dropdown panel ──
  const [previewTab, setPreviewTab] = useState<string | null>(null);
  // Viewport-x of the hovered tab's centre, so the panel + caret align to it.
  const [previewX, setPreviewX] = useState<number | null>(null);
  const previewCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const navProgressRafRef = useRef<number | null>(null);
  const navCollapsedRef = useRef(false);
  const navLockedRef = useRef(false);
  const manualOpenRef = useRef(false);

  // ── Manual reveal (the "Show Nav" tab) ──
  // ── Lock navigation ──
  // When locked, the navbar is pinned visible and the scroll-direction auto-hide
  // is disabled. Toggled from the Sefirah assistant; we echo the new state back
  // so its button can reflect lock/unlock.
  const handleToggleLock = useCallback(() => {
    const next = !navLockedRef.current;
    navLockedRef.current = next;
    setNavLocked(next);
    if (next) { setNavCollapsed(false); navCollapsedRef.current = false; }
    window.dispatchEvent(new CustomEvent('nav-lock-changed', { detail: { locked: next } }));
  }, []);

  // ── Auto hide / show on scroll direction ──
  // Scrolling down slides the navbar away; scrolling up (or returning near the
  // top) brings it back. Disabled while locked.
  useEffect(() => {
    const readY = () => {
      const sm = ScrollSmoother.get();
      return sm ? sm.scrollTop() : window.scrollY;
    };
    let lastY = readY();
    let ticking = false;

    const evaluate = () => {
      ticking = false;
      const y = readY();
      if (navLockedRef.current) { lastY = y; return; }
      const delta = y - lastY;
      if (y <= 80) {
        if (navCollapsedRef.current) { setNavCollapsed(false); navCollapsedRef.current = false; }
        lastY = y;
      } else if (delta > 6) {            // scrolling down → hide
        if (!navCollapsedRef.current) { setNavCollapsed(true); navCollapsedRef.current = true; manualOpenRef.current = false; }
        lastY = y;
      } else if (delta < -6) {           // scrolling up → show
        if (navCollapsedRef.current) { setNavCollapsed(false); navCollapsedRef.current = false; }
        lastY = y;
      }
    };

    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(evaluate); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    const smoother = ScrollSmoother.get() as {
      scrollTrigger?: {
        addEventListener?: (event: string, cb: () => void) => void;
        removeEventListener?: (event: string, cb: () => void) => void;
      };
    } | null;
    smoother?.scrollTrigger?.addEventListener?.('update', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      smoother?.scrollTrigger?.removeEventListener?.('update', onScroll);
    };
  }, []);

  // ── Hover preview (desktop only) — mirrors the main Navbar ──
  const openPreview = useCallback((tabId: string) => {
    if (isMobile) return;
    const item = INFO_TABS.find(i => i.id === tabId);
    if (!item?.subtabs?.length) return;
    if (previewCloseTimer.current) clearTimeout(previewCloseTimer.current);
    setPreviewTab(tabId);
  }, [isMobile]);

  const cancelPreviewClose = useCallback(() => {
    if (previewCloseTimer.current) { clearTimeout(previewCloseTimer.current); previewCloseTimer.current = null; }
  }, []);

  const closePreviewSoon = useCallback(() => {
    if (previewCloseTimer.current) clearTimeout(previewCloseTimer.current);
    previewCloseTimer.current = setTimeout(() => setPreviewTab(null), 140);
  }, []);

  const clearPreview = useCallback(() => {
    if (previewCloseTimer.current) clearTimeout(previewCloseTimer.current);
    setPreviewTab(null);
  }, []);

  // ── Responsive ──
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const check = () => { clearTimeout(t); t = setTimeout(() => setIsMobile(window.innerWidth < 640), 150); };
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('resize', check); };
  }, []);

  // ── Nav scroll progress border ──
  const setNavProgress = useCallback((value: number) => {
    const navEl = navContainerRef.current;
    if (!navEl) return;
    navEl.style.setProperty('--nav-scroll-progress', Math.min(1, Math.max(0, value)).toString());
  }, []);

  useEffect(() => {
    const schedule = () => {
      if (navProgressRafRef.current !== null) return;
      navProgressRafRef.current = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollRange = Math.max(1, doc.scrollHeight - window.innerHeight);
        const sm = ScrollSmoother.get();
        const currentScroll = sm ? sm.scrollTop() : window.scrollY;
        setNavProgress(Math.min(1, Math.max(0, currentScroll / scrollRange)));
        navProgressRafRef.current = null;
      });
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (navProgressRafRef.current !== null) cancelAnimationFrame(navProgressRafRef.current);
    };
  }, [setNavProgress]);

  // Open the strip whenever the active tab changes.
  useEffect(() => {
    manualOpenRef.current = false;
    setStripOpen(true);
  }, [activeTab]);

  // Always reset the rainbow scroll-progress bar when a new tab/subtab opens.
  useEffect(() => {
    setNavProgress(0);
  }, [activeTab, activeSubtab, setNavProgress]);

  // ── Handlers ──
  const handleTabLabelClick = useCallback((tabId: string) => {
    clearPreview();
    if (tabId === activeTab) {
      gsapScrollToTop();
      return;
    }
    onTabClick(tabId);
  }, [activeTab, onTabClick, clearPreview]);

  const handleArrowToggle = useCallback((tabId: string) => {
    if (tabId !== activeTab) { onTabClick(tabId); return; }
    setStripOpen(prev => { const next = !prev; manualOpenRef.current = next; return next; });
  }, [activeTab, onTabClick]);

  const handleStripSubtabClick = useCallback((tabId: string, sub: InfoSubtab) => {
    clearPreview();
    if (sub.external) { window.open(sub.external, '_blank', 'noopener,noreferrer'); return; }
    onSubtabClick(tabId, sub.id);
  }, [onSubtabClick, clearPreview]);

  // ── Hover dropdown panel: data + click routing ──
  const dropGetItems = useCallback((tabId: string): DropItem[] => {
    const tab = INFO_TABS.find(t => t.id === tabId);
    return (tab?.subtabs ?? []).map(s => ({
      id: s.id,
      label: s.label,
      external: s.external,
      icon: INFO_SUBTAB_META[s.id]?.icon ?? 'bi-dot',
      desc: INFO_SUBTAB_META[s.id]?.desc ?? '',
    }));
  }, []);
  const dropGetHeading = useCallback((tabId: string) =>
    INFO_TABS.find(t => t.id === tabId)?.label ?? '', []);
  const dropItemClick = useCallback((tabId: string, item: DropItem) => {
    const tab = INFO_TABS.find(t => t.id === tabId);
    const sub = tab?.subtabs.find(s => s.id === item.id);
    if (sub) handleStripSubtabClick(tabId, sub);
  }, [handleStripSubtabClick]);

  // Breadcrumb anchor on a hidden sub-page → return to its parent subtab.
  const handleSubPageBack = useCallback((tabId: string, parentSubtabId: string) => {
    clearPreview();
    onSubtabClick(tabId, parentSubtabId);
  }, [onSubtabClick, clearPreview]);

  // The active subtab may be a hidden sub-page (e.g. Recruitment Process).
  const activeSubPage = SUBTAB_SUBPAGES[activeSubtab];

  // ── Search (⌘K) ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(p => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearchNavigate = useCallback((tabId: string, subtabId?: string) => {
    // Search indexes the main site — route there with a full navigation.
    const url = new URL('/', window.location.origin);
    if (tabId && tabId !== 'home' && tabId !== 'information') {
      url.searchParams.set('tab', tabId);
      if (subtabId) url.searchParams.set('subtab', subtabId);
    }
    window.location.href = url.toString();
  }, []);

  // Sefirah assistant (mounted on Information Central) → search + lock nav.
  useEffect(() => {
    const onNav = (e: Event) => {
      const d = (e as CustomEvent).detail as { tabId: string; subtabId?: string };
      if (d?.tabId) handleSearchNavigate(d.tabId, d.subtabId);
    };
    const onToggle = () => handleToggleLock();
    const onQuery  = () => window.dispatchEvent(new CustomEvent('nav-lock-changed', { detail: { locked: navLockedRef.current } }));
    window.addEventListener('sefirah-navigate', onNav);
    window.addEventListener('nav-toggle-lock', onToggle);
    window.addEventListener('nav-lock-query', onQuery);
    return () => {
      window.removeEventListener('sefirah-navigate', onNav);
      window.removeEventListener('nav-toggle-lock', onToggle);
      window.removeEventListener('nav-lock-query', onQuery);
    };
  }, [handleSearchNavigate, handleToggleLock]);

  // ── Mobile ──
  const closeMobile = useCallback(() => { setMobileOpen(false); setMobileExpandedTab(null); }, []);
  const toggleMobileTab = useCallback((id: string) => setMobileExpandedTab(p => p === id ? null : id), []);
  const handleMobileSubtabClick = useCallback((tabId: string, sub: InfoSubtab) => {
    if (sub.external) {
      window.open(sub.external, '_blank', 'noopener,noreferrer');
      setMobileOpen(false); setMobileExpandedTab(null);
      return;
    }
    onSubtabClick(tabId, sub.id);
    setMobileOpen(false); setMobileExpandedTab(null);
  }, [onSubtabClick]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // ── Spring press listener (copied) ──
  useEffect(() => {
    const SELECTORS = [
      '.tab-item-border', '.tab-label-btn', '.tab-arrow-btn', '.strip-tab', '.strip-collapse',
      '.logo-mark', '.mob-tab-btn', '.mob-subtab-btn', '.mob-close', '.mob-search',
      '.mobile-burger',
    ].join(', ');
    const onPointerDown = (e: PointerEvent) => {
      const target = (e.target as Element).closest(SELECTORS);
      if (!target) return;
      target.classList.remove('tab-pressed');
      void (target as HTMLElement).offsetWidth;
      target.classList.add('tab-pressed');
      const cleanup = () => { target.classList.remove('tab-pressed'); target.removeEventListener('animationend', cleanup); };
      target.addEventListener('animationend', cleanup);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const activeSet = useMemo(() => new Set<string>([activeTab]), [activeTab]);

  const barStyle = useMemo(() => ({
    height: isMobile ? '68px' : '84px',
    // Align the navbar's left (logo) and right (controls) edges with the main
    // page content column — same responsive gutter the main site navbar uses.
    paddingLeft:  'var(--site-gutter-inline)',
    paddingRight: 'var(--site-gutter-inline)',
    gap: isMobile ? '10px' : '16px',
  }), [isMobile]);

  const labelFontStyle = useMemo(() => ({ fontSize: isMobile ? '0.84rem' : '0.97rem' }), [isMobile]);

  // The hover preview now lives in the dropdown panel (which drops below the
  // navbar), so previewing no longer touches the strips — the active tab's strip
  // stays open the whole time.
  const stripVisibleFor = (id: string) =>
    id === activeTab && stripOpen;

  return (
    <>
      <style>{NAVBAR_CSS}</style>
      <style>{INFO_LOGO_CSS}</style>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={handleSearchNavigate} />

      {/* ══ HOVER-PREVIEW BACKDROP — blurs the page behind the peeked strip ══ */}
      <div className={`nav-preview-backdrop${previewTab ? ' active' : ''}`} aria-hidden />

      <nav ref={navContainerRef} className={`glass-navbar${navCollapsed ? ' nav-collapsed' : ''}`}>
        {/* ══ MAIN BAR ROW ══ */}
        <div className="w-full flex items-center" style={barStyle}>
          <button className="logo-mark flex-shrink-0" onClick={onLogoClick} aria-label="Information Central home">
            <div className="logo-icon">
              <Image src="/assets/Notus-Regalia-logo.svg" alt="Notus Regalia" width={42} height={42} priority />
            </div>
            <div className="info-logo-stack">
              <div
                className="logo-text"
                style={{ fontSize: isMobile ? '0.95rem' : undefined, letterSpacing: 'normal', textTransform: 'none', margin: 0 }}
              >
                Notus <span style={{ color: '#EB1143', fontWeight: 300 }}>Regalia</span>
              </div>
              <div className="info-logo-subtitle" aria-label="Information Central">
                {'Information Central'.split('').map((ch, i) =>
                  ch === ' '
                    ? <span key={i} className="gap" aria-hidden />
                    : <span key={i} aria-hidden>{ch}</span>
                )}
              </div>
            </div>
          </button>

          <div className="nav-divider desktop-only" style={{ height: '32px', alignSelf: 'center' }} />

          {/* ── Tab pills ── */}
          <div className="nav-center">
            <div className="tabs-row">
              {INFO_TABS.map((item) => {
                const active = activeSet.has(item.id);
                const isActiveTab = item.id === activeTab;
                const arrowOpen = isActiveTab && stripOpen;
                return (
                  <div
                    key={item.id}
                    className={`tab-item-border${active ? ' is-active' : ''}`}
                    onMouseEnter={(e) => {
                      openPreview(item.id);
                      const r = e.currentTarget.getBoundingClientRect();
                      setPreviewX(r.left + r.width / 2);
                    }}
                    onMouseLeave={closePreviewSoon}
                  >
                    <div className={`tab-item${active ? ' is-active' : ''}`}>
                      <button
                        className={`tab-label-btn${active ? ' is-active' : ''}`}
                        onClick={() => handleTabLabelClick(item.id)}
                        style={labelFontStyle}
                      >
                        {item.label}
                      </button>
                      <span className="tab-sep" />
                      <button
                        className={`tab-arrow-btn${arrowOpen ? ' arrow-open' : ''}`}
                        onClick={() => handleArrowToggle(item.id)}
                        aria-label={isActiveTab
                          ? (arrowOpen ? `Hide ${item.label} sections` : `Show ${item.label} sections`)
                          : `Go to ${item.label}`}
                      >
                        <i className="bi bi-chevron-down arrow-icon" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right controls ── */}
          <div className="nav-right-controls">
            <button className="mobile-burger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <i className="bi bi-list" />
            </button>
          </div>
        </div>

        {/* ══ HOVER DROPDOWN PANEL — Profound-style subtab preview (desktop) ══ */}
        <NavDropdown
          tab={isMobile ? null : previewTab}
          pointerX={previewX}
          getItems={dropGetItems}
          getHeading={dropGetHeading}
          onItemClick={dropItemClick}
          onMouseEnter={cancelPreviewClose}
          onMouseLeave={closePreviewSoon}
        />

        {/* ══ SUBTAB STRIPS — active tab only (preview handled by the panel) ══ */}
        {INFO_TABS.map((item) => (
          <div
            key={`strip-${item.id}`}
            onMouseEnter={cancelPreviewClose}
            onMouseLeave={closePreviewSoon}
          >
            <StripRow
              item={item}
              isVisible={stripVisibleFor(item.id)}
              activeSubtabId={item.id === activeTab ? activeSubtab : (item.subtabs[0]?.id ?? null)}
              onSubtabClick={(sub) => handleStripSubtabClick(item.id, sub)}
              onCollapse={() => { manualOpenRef.current = false; setStripOpen(false); }}
              isMobile={isMobile}
              breadcrumb={
                activeSubPage && activeSubPage.tabId === item.id && item.id === activeTab && !previewTab
                  ? {
                      anchorLabel: activeSubPage.parentSubtabLabel,
                      crumbLabel: activeSubPage.label,
                      onAnchor: () => handleSubPageBack(item.id, activeSubPage.parentSubtabId),
                    }
                  : undefined
              }
            />
          </div>
        ))}
      </nav>

      {/* ══ MOBILE SIDEBAR ══ */}
      <div className={`mob-overlay${mobileOpen ? ' open' : ''}`} onClick={closeMobile} />
      <div className={`mob-sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="mob-header">
          <span className="mob-header-title">Information Central</span>
          <button className="mob-close" onClick={closeMobile} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="mob-search" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}>
          <i className="bi bi-search" />
          <span>Search…</span>
        </div>
        <div className="mob-nav-list">
          {INFO_TABS.map(item => {
            const active = activeSet.has(item.id);
            const isTabExpanded = mobileExpandedTab === item.id;
            return (
              <div key={item.id}>
                <button
                  className={`mob-tab-btn${active ? ' is-active' : ''}`}
                  onClick={() => toggleMobileTab(item.id)}
                >
                  <span className="mob-tab-left">
                    <i className={`bi ${item.icon}`} />
                    {item.label}
                  </span>
                  <i className={`bi bi-chevron-right mob-tab-chevron${isTabExpanded ? ' open' : ''}`} />
                </button>
                <div className={`mob-subtabs ${isTabExpanded ? 'expanded' : 'collapsed'}`}>
                  {item.subtabs.map(sub => (
                    <button
                      key={sub.id}
                      className={`mob-subtab-btn${activeSubtab === sub.id ? ' is-active' : ''}`}
                      onClick={() => handleMobileSubtabClick(item.id, sub)}
                    >
                      {sub.label}
                      {sub.external && <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.7rem', marginLeft: '0.4rem' }} />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <Link className="mob-tab-btn" href="/">
            <span className="mob-tab-left">
              <i className="bi bi-arrow-left" />
              Back to Notus Regalia
            </span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default memo(InfoNavbar);
