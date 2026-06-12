"use client";
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { NAVBAR_CSS } from '@/components/ui/navbar-styles';
import SearchModal from '@/components/ui/SearchModal';
import { INFO_TABS, type InfoTab, type InfoSubtab } from './data';

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

// ── Theme toggle button (copied verbatim) ──
const ThemeToggleTabBtn = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="tab-item-border nav-icon-btn-wrap" data-tooltip={isDark ? 'Light mode' : 'Dark mode'}>
      <div className="tab-item">
        <button
          className="tab-label-btn"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ padding: '11px 13px' }}
        >
          <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'}`} style={{ fontSize: '0.85rem' }} />
        </button>
      </div>
    </div>
  );
};

const HideNavTabBtn = ({ onClick }: { onClick: () => void }) => (
  <div className="tab-item-border collapse-btn-desktop nav-icon-btn-wrap" data-tooltip="Hide nav">
    <div className="tab-item">
      <button
        className="tab-label-btn collapse-btn-desktop"
        onClick={onClick}
        aria-label="Hide navigation bar"
        style={{ padding: '11px 13px' }}
      >
        <i className="bi bi-eye-slash" style={{ fontSize: '0.85rem' }} />
      </button>
    </div>
  </div>
);

const SearchTabBtn = ({ isMobile, onClick }: { isMobile: boolean; onClick: () => void }) => (
  <div className="tab-item-border">
    <div className="tab-item">
      <button
        className="tab-label-btn"
        onClick={onClick}
        aria-label="Open search"
        style={{ padding: isMobile ? '11px 13px' : '11px 18px 11px 16px' }}
      >
        <i className="bi bi-search" style={{ fontSize: '0.85rem' }} />
        {!isMobile && <span>Search</span>}
        {!isMobile && <span className="search-shortcut">⌘K</span>}
      </button>
    </div>
  </div>
);

const StickyThemeTab = ({ visible, isMobile }: { visible: boolean; isMobile: boolean }) => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      className={`nav-theme-tab${visible ? ' tab-visible' : ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="reveal-tab-icon" aria-hidden>
        <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'}`} />
      </span>
      {!isMobile && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
//  StripRow — copied verbatim from the main Navbar (content-switch)
// ─────────────────────────────────────────────────────────────
interface StripRowProps {
  item: InfoTab;
  isVisible: boolean;
  activeSubtabId: string | null;
  onSubtabClick: (sub: InfoSubtab) => void;
  onCollapse: () => void;
  isMobile?: boolean;
}

const StripRow = memo(({ item, isVisible, activeSubtabId, onSubtabClick, onCollapse, isMobile }: StripRowProps) => {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [indStyle, setIndStyle] = useState<{ left: number; width: number } | null>(null);
  const [animate, setAnimate] = useState(false);
  const [entering, setEntering] = useState(false);
  const hasPlacedRef = useRef(false);
  const [atEnd, setAtEnd] = useState(false);

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

  useEffect(() => {
    if (!activeSubtabId || !isVisible) return;
    const idx = item.subtabs.findIndex(s => s.id === activeSubtabId);
    if (idx < 0) return;
    const btn = btnRefs.current[idx];
    const track = trackRef.current;
    if (!btn || !track) return;
    requestAnimationFrame(() => {
      const trackRect = track.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const btnCenter = btnRect.left + btnRect.width / 2 - trackRect.left + track.scrollLeft;
      const targetScroll = btnCenter - trackRect.width / 2;
      track.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    });
  }, [activeSubtabId, isVisible, item.subtabs]);

  const place = useCallback((shouldAnimate: boolean) => {
    if (!activeSubtabId) return;
    const idx = item.subtabs.findIndex(s => s.id === activeSubtabId);
    if (idx < 0) return;
    const btn = btnRefs.current[idx];
    const track = trackRef.current;
    if (!btn || !track) return;

    let left = 0;
    let el: HTMLElement | null = btn;
    while (el && el !== track) {
      left += el.offsetLeft;
      el = el.offsetParent as HTMLElement | null;
    }
    const width = btn.offsetWidth;

    if (!shouldAnimate) {
      setAnimate(false);
      setIndStyle({ left, width });
      requestAnimationFrame(() => setAnimate(true));
    } else {
      setAnimate(true);
      setIndStyle({ left, width });
    }
    hasPlacedRef.current = true;
  }, [activeSubtabId, item.subtabs]);

  useEffect(() => {
    place(hasPlacedRef.current);
  }, [activeSubtabId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isVisible) {
      hasPlacedRef.current = false;
      setAnimate(false);
      setIndStyle(null);
      setEntering(false);
      return;
    }
    setEntering(true);
    const enterTimer = setTimeout(() => setEntering(false), 400);
    const t = setTimeout(() => place(false), 40);
    return () => { clearTimeout(t); clearTimeout(enterTimer); };
  }, [isVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  const indicatorCSSStyle: React.CSSProperties = {
    left: indStyle?.left ?? 0,
    width: indStyle?.width ?? 0,
    opacity: indStyle ? 1 : 0,
    transition: animate
      ? 'left 0.32s cubic-bezier(0.4, 0, 0.2, 1), width 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease'
      : 'none',
  };

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

  return (
    <div className={`subtab-strip-outer${isVisible ? ' strip-visible' : ''}${entering ? ' strip-entering' : ''}`}>
      <div className="subtab-strip-clip">
        <div className="subtab-strip-inner">
          <div className="strip-tabs-track" ref={trackRef}>
            <div className="strip-indicator" style={indicatorCSSStyle} aria-hidden>
              <div className="strip-indicator-bg" />
              <div className="strip-indicator-corner tl" />
              <div className="strip-indicator-corner tr" />
              <div className="strip-indicator-corner bl" />
              <div className="strip-indicator-corner br" />
            </div>
            {item.subtabs.map((sub, idx) => (
              <button
                key={sub.id}
                ref={el => { btnRefs.current[idx] = el; }}
                className={`strip-tab${activeSubtabId === sub.id ? ' strip-tab-active' : ''}`}
                style={{ '--si': idx, ...(sub.external ? { display: 'inline-flex', alignItems: 'center', gap: '0.4rem' } : null) } as React.CSSProperties}
                onClick={() => onSubtabClick(sub)}
              >
                {sub.label}
                {sub.external && <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.7rem' }} />}
              </button>
            ))}
          </div>
          <button
            className="strip-collapse"
            onClick={handleArrowClick}
            aria-label={isMobile ? `Scroll ${item.label} sections` : `Hide ${item.label} sections`}
          >
            <i className={`bi ${arrowIcon}`} />
          </button>
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

  const navContainerRef = useRef<HTMLDivElement>(null);
  const navProgressRafRef = useRef<number | null>(null);
  const navCollapsedRef = useRef(false);
  const manualOpenRef = useRef(false);

  // ── Collapse / show nav (copied behavior) ──
  const handleCollapseNav = useCallback(() => {
    setNavCollapsed(true);
    navCollapsedRef.current = true;
    setStripOpen(false);
    manualOpenRef.current = false;
    let hasScrolledAway = window.scrollY > 10;
    const restore = () => {
      if (!hasScrolledAway) { if (window.scrollY > 10) hasScrolledAway = true; return; }
      if (window.scrollY <= 10) { setNavCollapsed(false); navCollapsedRef.current = false; window.removeEventListener('scroll', restore); }
    };
    window.addEventListener('scroll', restore, { passive: true });
  }, []);

  const handleShowNav = useCallback(() => {
    setNavCollapsed(false);
    navCollapsedRef.current = false;
    setStripOpen(true);
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
    if (tabId === activeTab) {
      gsapScrollToTop();
      return;
    }
    onTabClick(tabId);
  }, [activeTab, onTabClick]);

  const handleArrowToggle = useCallback((tabId: string) => {
    if (tabId !== activeTab) { onTabClick(tabId); return; }
    setStripOpen(prev => { const next = !prev; manualOpenRef.current = next; return next; });
  }, [activeTab, onTabClick]);

  const handleStripSubtabClick = useCallback((tabId: string, sub: InfoSubtab) => {
    if (sub.external) { window.open(sub.external, '_blank', 'noopener,noreferrer'); return; }
    onSubtabClick(tabId, sub.id);
  }, [onSubtabClick]);

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
      '.nav-reveal-tab', '.nav-theme-tab', '.mobile-burger',
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
    paddingLeft: isMobile ? '16px' : '36px',
    paddingRight: isMobile ? '16px' : '36px',
    gap: isMobile ? '10px' : '16px',
  }), [isMobile]);

  const labelFontStyle = useMemo(() => ({ fontSize: isMobile ? '0.84rem' : '0.97rem' }), [isMobile]);

  return (
    <>
      <style>{NAVBAR_CSS}</style>
      <style>{INFO_LOGO_CSS}</style>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={handleSearchNavigate} />

      {/* ══ STICKY REVEAL TAB ══ */}
      <button
        className={`nav-reveal-tab${navCollapsed ? ' tab-visible' : ''}`}
        onClick={handleShowNav}
        aria-label="Show navigation bar"
      >
        <i className="bi bi-eye reveal-tab-icon" style={{ fontSize: '0.9rem' }} />
        {!isMobile && <span>Show Nav</span>}
      </button>

      <StickyThemeTab visible={navCollapsed} isMobile={isMobile} />

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
                  <div key={item.id} className={`tab-item-border${active ? ' is-active' : ''}`}>
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
            <ThemeToggleTabBtn />
            <HideNavTabBtn onClick={handleCollapseNav} />
            <SearchTabBtn isMobile={isMobile} onClick={() => setSearchOpen(true)} />
            <button className="mobile-burger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <i className="bi bi-list" />
            </button>
          </div>
        </div>

        {/* ══ SUBTAB STRIPS — active tab only ══ */}
        {INFO_TABS.map((item) => (
          <StripRow
            key={`strip-${item.id}`}
            item={item}
            isVisible={item.id === activeTab && stripOpen}
            activeSubtabId={item.id === activeTab ? activeSubtab : null}
            onSubtabClick={(sub) => handleStripSubtabClick(item.id, sub)}
            onCollapse={() => { manualOpenRef.current = false; setStripOpen(false); }}
            isMobile={isMobile}
          />
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
          <a className="mob-tab-btn" href="/">
            <span className="mob-tab-left">
              <i className="bi bi-arrow-left" />
              Back to Notus Regalia
            </span>
          </a>
        </div>
      </div>
    </>
  );
};

export default memo(InfoNavbar);
