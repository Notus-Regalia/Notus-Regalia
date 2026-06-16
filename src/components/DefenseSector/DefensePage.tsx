"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import Footer from '@/components/ui/Footer';
import { useTheme } from '@/context/ThemeContext';
import SearchModal from '@/components/ui/SearchModal';
import { DEFENSE_NAV_ITEMS, DEFAULT_SUBTABS, type SubtabItem } from './nav-data';
import { DEFENSE_NAVBAR_CSS } from './styles';
import { NAVBAR_CSS } from '@/components/ui/navbar-styles';
import StripRow from './StripRow';
import DefenseHero from './DefenseHero';
import DefenseContent from './DefenseContent';
import { rootHref } from '@/utils/routes';
import DefenseLoadingScreen from './DefenseLoadingScreen';
import SmoothScroller from '@/components/ui/SmoothScroller';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

export default function DefenseSitePage() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [activeSubtab, setActiveSubtab] = useState<string | undefined>('overview');
  const [stripOpen, setStripOpen] = useState(true);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedTab, setMobileExpandedTab] = useState<string | null>(null);
  const [displayedTab, setDisplayedTab] = useState('home');
  const [displayedSubtab, setDisplayedSubtab] = useState('overview');
  const [searchOpen, setSearchOpen] = useState(false);

  // ── Hover preview: peek a tab's subtab strip and blur the page behind ──
  const [previewTab, setPreviewTab] = useState<string | null>(null);
  const previewCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const navProgressRafRef = useRef<number | null>(null);
  const manualOpenRef = useRef(false);
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);
  const navCollapsedRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollAnimRafRef = useRef<number | null>(null);
  const spyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Smooth scroll helper (delegates to GSAP ScrollSmoother) ──
  const smoothScrollTo = useCallback((targetY: number, duration = 1100) => {
    const sm = ScrollSmoother.get();
    if (sm) {
      sm.scrollTo(targetY, true, `top top`);
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }, []);

  // ── Mark a programmatic scroll and auto-release scroll-spy after it settles ──
  const startProgrammaticScroll = useCallback(() => {
    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimerRef.current) clearTimeout(programmaticScrollTimerRef.current);
    programmaticScrollTimerRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 1500);
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
  useEffect(() => {
    const navEl = navContainerRef.current;
    if (!navEl) return;

    const scheduleProgressUpdate = () => {
      if (navProgressRafRef.current !== null) return;
      navProgressRafRef.current = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollRange = Math.max(1, doc.scrollHeight - window.innerHeight);
        const sm = ScrollSmoother.get();
        const currentScroll = sm ? sm.scrollTop() : window.scrollY;
        const progress = Math.min(1, Math.max(0, currentScroll / scrollRange));
        navEl.style.setProperty('--nav-scroll-progress', progress.toString());
        navProgressRafRef.current = null;
      });
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => scheduleProgressUpdate())
      : null;
    resizeObserver?.observe(document.body);

    scheduleProgressUpdate();
    window.addEventListener('scroll', scheduleProgressUpdate, { passive: true });
    window.addEventListener('resize', scheduleProgressUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleProgressUpdate);
      window.removeEventListener('resize', scheduleProgressUpdate);
      resizeObserver?.disconnect();
      if (navProgressRafRef.current !== null) {
        cancelAnimationFrame(navProgressRafRef.current);
      }
    };
  }, []);

  // ── Content transitions ──
  useEffect(() => {
    // Home tab renders all sections at once — no subtab transition delay needed
    if (activeTab === 'home' && displayedTab === 'home') {
      setDisplayedSubtab(activeSubtab || DEFAULT_SUBTABS[activeTab]);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayedTab(activeTab);
      setDisplayedSubtab(activeSubtab || DEFAULT_SUBTABS[activeTab]);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, activeSubtab, displayedTab]);

  // ── Tab changes → reset strip ──
  useEffect(() => {
    manualOpenRef.current = false;
    setStripOpen(true);
    setActiveSubtab(DEFAULT_SUBTABS[activeTab]);
  }, [activeTab]);

  // ── Collapse / show nav ──
  const handleCollapseNav = useCallback(() => {
    setNavCollapsed(true);
    navCollapsedRef.current = true;
    setStripOpen(false);
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
  }, []);

  // ── Hover preview (desktop only) — mirrors the main Navbar ──
  const openPreview = useCallback((tabId: string) => {
    if (isMobile) return;
    const item = DEFENSE_NAV_ITEMS.find(i => i.id === tabId);
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

  // ── Tab click ──
  const handleTabClick = useCallback((tabId: string) => {
    clearPreview();
    // If already on this tab and on home, use guarded scroll to avoid scroll-spy jitter
    if (tabId === activeTab && tabId === 'home' && window.scrollY > 10) {
      startProgrammaticScroll();
      setActiveSubtab('overview');
      smoothScrollTo(0, 900);
      return;
    }
    setActiveTab(tabId);
    startProgrammaticScroll();
    smoothScrollTo(0, 600);
  }, [activeTab, smoothScrollTo, startProgrammaticScroll, clearPreview]);

  // ── Arrow toggle ──
  const handleArrowToggle = useCallback((tabId: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      startProgrammaticScroll();
      smoothScrollTo(0, 600);
      return;
    }
    setStripOpen(prev => {
      const next = !prev;
      manualOpenRef.current = next;
      return next;
    });
  }, [activeTab, smoothScrollTo, startProgrammaticScroll]);

  // ── Subtab click ──
  const handleSubtabClick = useCallback((sub: SubtabItem) => {
    clearPreview();
    // Special subtabs (e.g. "Return to Main Site")
    if (sub.isSpecial && sub.id === 'return-main') {
      window.location.href = '/technologies';
      return;
    }

    // Home tab subtabs scroll to sections instead of switching content
    if (sub.sectionId && activeTab === 'home') {
      setActiveSubtab(sub.id);
      const el = document.getElementById(sub.sectionId);
      if (el) {
        startProgrammaticScroll();
        const sm = ScrollSmoother.get();
        const navH = stripOpen ? 134 : 84;
        if (sm) {
          sm.scrollTo(el, true, `top ${navH}px`);
        } else {
          const targetY = el.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }
      return;
    }

    setActiveSubtab(sub.id);
    startProgrammaticScroll();
    smoothScrollTo(0, 600);
  }, [activeTab, smoothScrollTo, stripOpen, startProgrammaticScroll, clearPreview]);

  // While hovering a tab, that tab's strip is the only one shown (peek mode);
  // otherwise the active tab's strip shows when opened.
  const stripVisibleFor = (id: string) =>
    previewTab ? previewTab === id : (id === activeTab && stripOpen);

  // ── Go home ──
  const goHome = useCallback(() => {
    window.location.href = '/technologies';
  }, []);

  // ── Search ──
  const openSearch  = useCallback(() => setSearchOpen(true),  []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(p => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearchNavigate = useCallback((tabId: string, subtabId?: string) => {
    const defenseTabIds = ['home', 'megiddo', 'argos', 'rnd'];
    if (defenseTabIds.includes(tabId)) {
      setActiveTab(tabId);
      if (subtabId) setActiveSubtab(subtabId);
      startProgrammaticScroll();
      smoothScrollTo(0, 600);
    } else {
      window.location.href = rootHref(tabId, subtabId);
    }
    setSearchOpen(false);
  }, [smoothScrollTo, startProgrammaticScroll]);

  // ── Mobile sidebar ──
  const openMobile = useCallback(() => setMobileOpen(true), []);

  // ── Scroll-spy for home (Systems Overview) tab ──
  useEffect(() => {
    if (activeTab !== 'home') return;
    const homeItem = DEFENSE_NAV_ITEMS.find(n => n.id === 'home')!;
    const sections = homeItem.subtabs
      .filter(s => s.sectionId)
      .map(s => ({ subtabId: s.id, sectionId: s.sectionId! }));

    let lastSetId: string | null = null;

    const computeActive = () => {
      if (isProgrammaticScrollRef.current) return;
      const scrollY = window.scrollY;
      const navH = 160;  // slightly above actual nav (134) to trigger early enough
      let active = sections[0]?.subtabId;
      for (const { subtabId, sectionId } of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.getBoundingClientRect().top + scrollY;
          // Add hysteresis: require passing the threshold by 40px to prevent flicker
          if (scrollY + navH >= top + (subtabId === lastSetId ? -40 : 0)) {
            active = subtabId;
          }
        }
      }
      if (active !== lastSetId) {
        lastSetId = active;
        setActiveSubtab(active);
      }
    };

    const onScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      // Debounce scroll-spy to avoid rapid-fire updates
      if (spyDebounceRef.current) clearTimeout(spyDebounceRef.current);
      spyDebounceRef.current = setTimeout(computeActive, 30);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (spyDebounceRef.current) clearTimeout(spyDebounceRef.current);
    };
  }, [activeTab]);
  const closeMobile = useCallback(() => { setMobileOpen(false); setMobileExpandedTab(null); }, []);
  const toggleMobileTab = useCallback((id: string) => setMobileExpandedTab(p => p === id ? null : id), []);

  const handleMobileTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId); setMobileOpen(false); setMobileExpandedTab(null);
    startProgrammaticScroll();
    smoothScrollTo(0, 600);
  }, [smoothScrollTo, startProgrammaticScroll]);

  const handleMobileSubtabClick = useCallback((parentTabId: string, sub: SubtabItem) => {
    if (sub.isSpecial && sub.id === 'return-main') {
      window.location.href = '/technologies';
      return;
    }
    setActiveTab(parentTabId); setActiveSubtab(sub.id);
    setMobileOpen(false); setMobileExpandedTab(null);
    if (sub.sectionId && parentTabId === 'home') {
      requestAnimationFrame(() => {
        const el = document.getElementById(sub.sectionId!);
        if (el) {
          startProgrammaticScroll();
          const sm = ScrollSmoother.get();
          const navH = stripOpen ? 134 : 84;
          if (sm) {
            sm.scrollTo(el, true, `top ${navH}px`);
          } else {
            const targetY = el.getBoundingClientRect().top + window.scrollY - navH;
            window.scrollTo({ top: targetY, behavior: 'smooth' });
          }
        }
      });
    } else {
      startProgrammaticScroll();
      smoothScrollTo(0, 600);
    }
  }, [smoothScrollTo, stripOpen, startProgrammaticScroll]);

  const onSidebarTouchStart = useCallback((e: React.TouchEvent) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
  }, []);
  const onSidebarTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchRef.current.startY);
    touchRef.current = null;
    if (dx > 60 && dy < dx) closeMobile();
  }, [closeMobile]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // ── Spring press listener ──
  useEffect(() => {
    const SELECTORS = [
      '.tab-item-border', '.tab-label-btn', '.tab-arrow-btn',
      '.strip-tab', '.strip-collapse', '.mob-tab-btn',
      '.mob-subtab-btn', '.mob-close', '.nav-reveal-tab', '.nav-theme-tab', '.mobile-burger',
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

  // ── Derived ──
  const activeSet = useMemo(() => {
    const set = new Set<string>();
    set.add(activeTab);
    return set;
  }, [activeTab]);

  const barStyle = useMemo(() => ({
    height: isMobile ? '68px' : '84px',
    paddingLeft: isMobile ? '16px' : '36px',
    paddingRight: isMobile ? '16px' : '36px',
    gap: isMobile ? '10px' : '16px',
  }), [isMobile]);

  const isTransitioning = activeTab !== displayedTab || (activeTab !== 'home' && activeSubtab !== displayedSubtab);

  // Footer navigate — route back to main site sections
  const handleFooterNavigate = useCallback((tabId: string) => {
    window.location.href = rootHref(tabId);
  }, []);

  return (
    <>
      <style>{DEFENSE_NAVBAR_CSS}</style>
      {/* Shared navbar CSS rendered AFTER the Defense copy so its navbar rules
          win — making the navbar pixel-identical to the main site and
          Information Central (and bringing the hover-preview backdrop). Defense
          content styles (.dv-*) and strip-tab-special remain from the copy. */}
      <style>{NAVBAR_CSS}</style>

      {loading && <DefenseLoadingScreen onComplete={() => setLoading(false)} />}

      {/* ══ HOVER-PREVIEW BACKDROP — blurs the page behind the peeked strip ══ */}
      <div className={`nav-preview-backdrop${previewTab ? ' active' : ''}`} aria-hidden />

      <div className="min-h-screen theme-transition" style={{ background: 'var(--surface-primary)', color: 'var(--content-primary)' }}>

        {/* ══ STICKY REVEAL TAB ══ */}
        <button
          className={`nav-reveal-tab${navCollapsed ? ' tab-visible' : ''}`}
          onClick={handleShowNav}
          aria-label="Show navigation bar"
        >
          <i className="bi bi-eye reveal-tab-icon" style={{ fontSize: '0.9rem' }} />
          {!isMobile && <span>Show Nav</span>}
        </button>

        {/* ══ NAVBAR ══ */}
        <nav ref={navContainerRef} className={`glass-navbar${navCollapsed ? ' nav-collapsed' : ''}`}>

          {/* Main bar row */}
          <div className="w-full flex items-center" style={barStyle}>

            {/* ── Logo ── */}
            <div
              onClick={goHome}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goHome(); } }}
              role="button"
              tabIndex={0}
              aria-label="Back to Notus Regalia"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                flexShrink: 0, cursor: 'pointer', userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                transform: 'translateZ(0)',
                willChange: 'transform',
                isolation: 'isolate',
              }}
            >
              <Image
                src="/assets/Notus-Regalia-logo.svg"
                alt="Notus Regalia"
                width={36}
                height={36}
                priority
                style={{ width: 36, height: 36, flexShrink: 0, display: 'block' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, lineHeight: 1 }}>
                <span style={{
                  fontFamily: 'inherit',
                  fontSize: isMobile ? '13px' : '15px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--content-primary)',
                  whiteSpace: 'nowrap',
                  transform: 'translateZ(0)',
                  display: 'inline-block',
                }}>
                  Notus Regalia
                </span>
                <span style={{
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  fontSize: '7px',
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#E31B54',
                  whiteSpace: 'nowrap',
                }}>
                  Defense Systems
                </span>
              </div>
            </div>

            <div className="nav-divider desktop-only" style={{ height: '32px', alignSelf: 'center' }} />

            {/* Tab pills */}
            <div className="nav-center">
              <div className="tabs-row">
                {DEFENSE_NAV_ITEMS.map(item => {
                  const active = activeSet.has(item.id);
                  const isActiveTab = item.id === activeTab;
                  const arrowOpen = isActiveTab && stripOpen;
                  return (
                    <div
                      key={item.id}
                      className={`tab-item-border${active ? ' is-active' : ''}`}
                      onMouseEnter={() => openPreview(item.id)}
                      onMouseLeave={closePreviewSoon}
                    >
                      <div className={`tab-item${active ? ' is-active' : ''}`}>
                        <button
                          className={`tab-label-btn${active ? ' is-active' : ''}`}
                          onClick={() => handleTabClick(item.id)}
                          style={{ fontSize: isMobile ? '0.84rem' : '0.97rem' }}
                        >
                          {item.label}
                        </button>
                        <span className="tab-sep" />
                        <button
                          className={`tab-arrow-btn${arrowOpen ? ' arrow-open' : ''}`}
                          onClick={() => handleArrowToggle(item.id)}
                          aria-label={arrowOpen ? `Hide ${item.label} sections` : `Show ${item.label} sections`}
                        >
                          <i className="bi bi-chevron-down arrow-icon" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right controls */}
            <div className="nav-right-controls">
              <div className="tab-item-border nav-icon-btn-wrap" data-tooltip={isDark ? 'Light mode' : 'Night mode'}>
                <div className="tab-item">
                  <button
                    className="tab-label-btn"
                    onClick={toggleTheme}
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to night mode'}
                    style={{ padding: '11px 13px' }}
                  >
                    <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'}`} style={{ fontSize: '0.85rem' }} />
                  </button>
                </div>
              </div>
              <div className="tab-item-border collapse-btn-desktop nav-icon-btn-wrap" data-tooltip="Hide nav">
                <div className="tab-item">
                  <button
                    className="tab-label-btn collapse-btn-desktop"
                    onClick={handleCollapseNav}
                    aria-label="Hide navigation bar"
                    style={{ padding: '11px 13px' }}
                  >
                    <i className="bi bi-eye-slash" style={{ fontSize: '0.85rem' }} />
                  </button>
                </div>
              </div>
              <div className="tab-item-border" data-tooltip="Search">
                <div className="tab-item">
                  <button
                    className="tab-label-btn"
                    onClick={openSearch}
                    aria-label="Open search"
                    style={{ padding: isMobile ? '11px 13px' : '11px 18px 11px 16px' }}
                  >
                    <i className="bi bi-search" style={{ fontSize: '0.85rem' }} />
                    {!isMobile && <span>Search</span>}
                    {!isMobile && <span className="search-shortcut">⌘K</span>}
                  </button>
                </div>
              </div>
              <button className="mobile-burger" onClick={openMobile} aria-label="Open menu">
                <i className="bi bi-list" />
              </button>
            </div>
          </div>

          {/* Subtab strip — active tab, or hover-previewed tab */}
          {DEFENSE_NAV_ITEMS.map(item => (
            <div
              key={`strip-${item.id}`}
              onMouseEnter={cancelPreviewClose}
              onMouseLeave={closePreviewSoon}
            >
              <StripRow
                item={item}
                isVisible={stripVisibleFor(item.id)}
                activeSubtabId={item.id === activeTab ? (activeSubtab ?? null) : (item.subtabs[0]?.id ?? null)}
                onSubtabClick={handleSubtabClick}
                onCollapse={() => { manualOpenRef.current = false; setStripOpen(false); }}
                isMobile={isMobile}
              />
            </div>
          ))}
        </nav>

        {/* ══ MOBILE SIDEBAR ══ */}
        <div className={`mob-overlay${mobileOpen ? ' open' : ''}`} onClick={closeMobile} />
        <div
          className={`mob-sidebar${mobileOpen ? ' open' : ''}`}
          onTouchStart={onSidebarTouchStart}
          onTouchEnd={onSidebarTouchEnd}
        >
          <div className="mob-header">
            <span className="mob-header-title">Defense Systems</span>
            <button
              className="mob-close"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to night mode'}
              style={{ color: 'var(--content-faint)', fontSize: '0.85rem' }}
            >
              <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'}`} />
            </button>
            <button className="mob-close" onClick={() => { setMobileOpen(false); setSearchOpen(true); }} aria-label="Search" style={{ color: 'var(--content-faint)', fontSize: '0.85rem' }}>
              <i className="bi bi-search" />
            </button>
            <button className="mob-close" onClick={closeMobile} aria-label="Close menu"><i className="bi bi-x-lg" /></button>
          </div>
          <div className="mob-nav-list">
            {DEFENSE_NAV_ITEMS.map(item => {
              const active = activeSet.has(item.id);
              const isTabExpanded = mobileExpandedTab === item.id;
              return (
                <div key={item.id}>
                  <button
                    className={`mob-tab-btn${active ? ' is-active' : ''}`}
                    onClick={() => toggleMobileTab(item.id)}
                  >
                    <span className="mob-tab-left"><i className={`bi ${item.icon}`} />{item.label}</span>
                    <i className={`bi bi-chevron-right mob-tab-chevron${isTabExpanded ? ' open' : ''}`} />
                  </button>
                  <div className={`mob-subtabs ${isTabExpanded ? 'expanded' : 'collapsed'}`}>
                    {item.subtabs.map(sub => {
                      const isSubActive = activeTab === item.id && activeSubtab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          className={`mob-subtab-btn${isSubActive ? ' is-active' : ''}`}
                          onClick={() => handleMobileSubtabClick(item.id, sub)}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ MAIN CONTENT (inside ScrollSmoother) ══ */}
        <SmoothScroller>
          <main style={{ paddingTop: stripOpen ? '134px' : '84px', transition: 'padding-top 0.38s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            {displayedTab === 'home' ? (
              <div className={`relative z-10 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                <div id="defense-section-overview" style={{ scrollMarginTop: stripOpen ? '134px' : '84px' }}>
                  <DefenseHero />
                </div>
                <div id="defense-section-features" style={{ scrollMarginTop: stripOpen ? '134px' : '84px' }}>
                  <DefenseContent tabId="home" subtabId="features" />
                </div>
                <div id="defense-section-portfolio" style={{ scrollMarginTop: stripOpen ? '134px' : '84px' }}>
                  <DefenseContent tabId="home" subtabId="systems-portfolio" />
                </div>
              </div>
            ) : (
              <div className={`relative z-10 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                <DefenseContent tabId={displayedTab} subtabId={displayedSubtab} />
              </div>
            )}
          </main>

          {/* ══ FOOTER — same component as main site ══ */}
          <Footer onNavigate={handleFooterNavigate} />
        </SmoothScroller>
      </div>

      {/* ══ SEARCH MODAL ══ */}
      <SearchModal isOpen={searchOpen} onClose={closeSearch} onNavigate={handleSearchNavigate} />
    </>
  );
}
