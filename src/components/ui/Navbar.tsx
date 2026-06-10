"use client";
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { NAVBAR_CSS } from './navbar-styles';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

/* ── GSAP-aware scroll helpers ────────────────────────────────── */
const gsapScrollTo = (target: HTMLElement | number, smooth = true) => {
  const sm = typeof window !== 'undefined' ? ScrollSmoother.get?.() : null;
  if (sm) {
    if (typeof target === 'number') {
      sm.scrollTo(target, smooth);
    } else {
      // offset = navbar + strip height
      const nav = document.querySelector('.glass-navbar') as HTMLElement | null;
      const navH = nav?.offsetHeight ?? 80;
      sm.scrollTo(target, smooth, `top ${navH + 8}px`);
    }
  } else {
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'instant' });
    } else {
      const nav = document.querySelector('.glass-navbar') as HTMLElement | null;
      const navH = nav?.offsetHeight ?? 80;
      const y = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: Math.max(0, y), behavior: smooth ? 'smooth' : 'instant' });
    }
  }
};
const gsapScrollToTop = (smooth = true) => gsapScrollTo(0, smooth);

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubtab?: string;
  onSubtabClick?: (parentTabId: string, subtabId: string) => void;
}

interface SubtabItem {
  id: string;
  label: string;
  sectionId?: string;
  external?: string;   // when set, the subtab opens this URL in a new tab
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  isSpecial?: boolean;
  subtabs?: SubtabItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'company',
    label: 'Company',
    icon: 'bi-rocket-takeoff',
    subtabs: [
      { id: 'company-sectors',       label: 'Sectors',      sectionId: 'section-sectors' },
      { id: 'company-capabilities',  label: 'Capabilities', sectionId: 'section-capabilities' },
      { id: 'company-mission',       label: 'Mission',      sectionId: 'section-mission' },
      { id: 'company-executives',  label: 'Executives',  sectionId: 'section-executives' },
      { id: 'company-investors',     label: 'Investors',    sectionId: 'section-investors' },
      { id: 'company-information-center', label: 'Information Center', external: '/information' },
    ],
  },
  {
    id: 'technologies',
    label: 'Technologies',
    icon: 'bi-crosshair',
    isSpecial: true,
    subtabs: [
      { id: 'technologies-civic-operations', label: 'Government' },
      { id: 'technologies-defense',          label: 'Defense' },
      { id: 'technologies-healthcare',       label: 'Healthcare' },
      { id: 'technologies-enterprise',       label: 'Enterprise' },
      { id: 'technologies-energy',           label: 'Energy' },
    ],
  },
];

// ── Theme toggle button ──
const ThemeToggleTabBtn = ({ isMobile }: { isMobile: boolean }) => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div
      className="tab-item-border nav-icon-btn-wrap"
      data-tooltip={isDark ? 'Light mode' : 'Dark mode'}
    >
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

// ── Hide-navbar button — icon only with tooltip ──
const HideNavTabBtn = ({
  isMobile,
  onClick,
}: {
  isMobile: boolean;
  onClick: () => void;
}) => (
  <div
    className="tab-item-border collapse-btn-desktop nav-icon-btn-wrap"
    data-tooltip="Hide nav"
  >
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

// ── Search button ──
const SearchTabBtn = ({
  isMobile,
  onClick,
}: {
  isMobile: boolean;
  onClick: () => void;
}) => (
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
      {!isMobile && (
        <span>{isDark ? 'Light' : 'Dark'}</span>
      )}
    </button>
  );
};


// ─────────────────────────────────────────────────────────────
//  StripRow — subtab strip with a single sliding indicator
// ─────────────────────────────────────────────────────────────
interface StripRowProps {
  item: NavItem;
  isVisible: boolean;
  activeSubtabId: string | null;
  onSubtabClick: (sub: SubtabItem) => void;
  onCollapse: () => void;
  isMobile?: boolean;
}

const StripRow = memo(({
  item, isVisible, activeSubtabId, onSubtabClick, onCollapse, isMobile,
}: StripRowProps) => {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [indStyle, setIndStyle] = useState<{ left: number; width: number } | null>(null);
  const [animate, setAnimate] = useState(false);
  const [entering, setEntering] = useState(false);
  const hasPlacedRef = useRef(false);
  const [atEnd, setAtEnd] = useState(false);

  // Track scroll position to determine arrow direction
  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setAtEnd(maxScroll > 2 && track.scrollLeft >= maxScroll - 2);
  }, []);

  // Listen for scroll events on the track
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const handler = () => updateScrollState();
    track.addEventListener('scroll', handler, { passive: true });
    // initial check
    updateScrollState();
    return () => track.removeEventListener('scroll', handler);
  }, [isVisible, updateScrollState]);

  // Auto-scroll the active subtab button into center view
  useEffect(() => {
    if (!activeSubtabId || !isVisible) return;
    const idx = item.subtabs!.findIndex(s => s.id === activeSubtabId);
    if (idx < 0) return;
    const btn = btnRefs.current[idx];
    const track = trackRef.current;
    if (!btn || !track) return;

    // Wait a frame for layout to settle
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
    const idx = item.subtabs!.findIndex(s => s.id === activeSubtabId);
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
        // Arrow is pointing left — scroll back to start
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Arrow is pointing right — scroll forward
        const maxScroll = track.scrollWidth - track.clientWidth;
        const newLeft = Math.min(track.scrollLeft + track.clientWidth * 0.65, maxScroll);
        track.scrollTo({ left: newLeft, behavior: 'smooth' });
      }
    } else {
      onCollapse();
    }
  }, [isMobile, atEnd, onCollapse]);

  const arrowIcon = isMobile
    ? (atEnd ? 'bi-chevron-left' : 'bi-chevron-right')
    : 'bi-chevron-up';

  return (
    <div className={`subtab-strip-outer${isVisible ? ' strip-visible' : ''}${entering ? ' strip-entering' : ''}`}>
      <div className="subtab-strip-clip">
        <div className="subtab-strip-inner">

          <div className="strip-tabs-track" ref={trackRef}>
            <div
              className="strip-indicator"
              style={indicatorCSSStyle}
              aria-hidden
            >
              <div className="strip-indicator-bg" />
              <div className="strip-indicator-corner tl" />
              <div className="strip-indicator-corner tr" />
              <div className="strip-indicator-corner bl" />
              <div className="strip-indicator-corner br" />
            </div>

            {item.subtabs!.map((sub, idx) => (
              <button
                key={sub.id}
                ref={el => { btnRefs.current[idx] = el; }}
                className={`strip-tab${activeSubtabId === sub.id ? ' strip-tab-active' : ''}`}
                style={{ '--si': idx } as React.CSSProperties}
                onClick={() => onSubtabClick(sub)}
              >
                {sub.label}
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
StripRow.displayName = 'StripRow';

// ─────────────────────────────────────────────────────────────
//  CompanyStripContent — subtab buttons + indicator for use
//  inside the crossfade company strip (no outer wrapper)
// ─────────────────────────────────────────────────────────────
const COMPANY_SUBTABS = NAV_ITEMS.find(i => i.id === 'company')!.subtabs!;

interface CompanyStripContentProps {
  activeSubtabId: string | null;
  onSubtabClick: (sub: SubtabItem) => void;
  onCollapse: () => void;
  isMobile?: boolean;
}

const CompanyStripContent = memo(({
  activeSubtabId, onSubtabClick, onCollapse, isMobile,
}: CompanyStripContentProps) => {
  const btnRefs  = useRef<(HTMLButtonElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [indStyle, setIndStyle] = useState<{ left: number; width: number } | null>(null);
  const [animate, setAnimate]   = useState(false);
  const hasPlacedRef            = useRef(false);
  const [atEnd, setAtEnd]       = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setAtEnd(maxScroll > 0 && track.scrollLeft >= maxScroll - 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isMobile) return;
    track.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => track.removeEventListener('scroll', updateScrollState);
  }, [isMobile, updateScrollState]);

  const place = useCallback((shouldAnimate: boolean) => {
    const idx = COMPANY_SUBTABS.findIndex(s => s.id === activeSubtabId);
    const btn = btnRefs.current[idx];
    const track = trackRef.current;
    if (!btn || !track) return;
    const tRect = track.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setIndStyle({ left: bRect.left - tRect.left + track.scrollLeft, width: bRect.width });
    if (shouldAnimate) setAnimate(true);
    hasPlacedRef.current = true;
  }, [activeSubtabId]);

  useEffect(() => {
    place(hasPlacedRef.current);
  }, [activeSubtabId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-place on mount
  useEffect(() => {
    const t = setTimeout(() => place(false), 40);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const arrowIcon = isMobile
    ? (atEnd ? 'bi-chevron-left' : 'bi-chevron-right')
    : 'bi-chevron-up';

  return (
    <>
      <div className="strip-tabs-track" ref={trackRef}>
        <div className="strip-indicator" style={indicatorCSSStyle} aria-hidden>
          <div className="strip-indicator-bg" />
          <div className="strip-indicator-corner tl" />
          <div className="strip-indicator-corner tr" />
          <div className="strip-indicator-corner bl" />
          <div className="strip-indicator-corner br" />
        </div>
        {COMPANY_SUBTABS.map((sub, idx) => {
          const button = (
            <button
              key={sub.id}
              ref={el => { btnRefs.current[idx] = el; }}
              className={`strip-tab${activeSubtabId === sub.id ? ' strip-tab-active' : ''}${sub.external ? ' strip-tab-external' : ''}`}
              style={{ '--si': idx, ...(sub.external ? { display: 'inline-flex', alignItems: 'center', gap: '0.4rem' } : null) } as React.CSSProperties}
              onClick={() => sub.external ? window.open(sub.external, '_blank', 'noopener,noreferrer') : onSubtabClick(sub)}
            >
              {sub.label}
              {sub.external && <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.7rem' }} />}
            </button>
          );
          return button;
        })}
      </div>
      <button
        className="strip-collapse"
        onClick={handleArrowClick}
        aria-label={isMobile ? 'Scroll Company sections' : 'Hide Company sections'}
      >
        <i className={`bi ${arrowIcon}`} />
      </button>
    </>
  );
});
CompanyStripContent.displayName = 'CompanyStripContent';

// ─────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────
const Navbar = ({
  activeTab,
  setActiveTab,
  activeSubtab,
  onSubtabClick,
}: NavbarProps) => {
  const [isMobile, setIsMobile]                   = useState(false);
  const [searchOpen, setSearchOpen]               = useState(false);
  const [stripOpen, setStripOpen]                 = useState(false);
  const [mobileOpen, setMobileOpen]               = useState(false);
  const [mobileExpandedTab, setMobileExpandedTab] = useState<string | null>(null);
  const [navCollapsed, setNavCollapsed]           = useState(false);

  const navContainerRef          = useRef<HTMLDivElement>(null);
  const navProgressRafRef        = useRef<number | null>(null);
  const navProgressSyncRafRef    = useRef<number | null>(null);
  const navProgressUpdateRef     = useRef<(() => void) | null>(null);
  const touchRef                 = useRef<{ startX: number; startY: number } | null>(null);
  const navCollapsedRef          = useRef(false);
  const manualOpenRef            = useRef(false);
  const isProgrammaticScrollRef  = useRef(false);
  const programmaticScrollTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scrollSpySubtab, setScrollSpySubtab] = useState<string | null>(null);
  const [companyDetailOpen, setCompanyDetailOpen] = useState(false);

  // ── Listen for company detail page events ──
  useEffect(() => {
    const handler = (e: Event) => {
      const open = (e as CustomEvent).detail?.open ?? false;
      setCompanyDetailOpen(open);

      // Returning from a detail page → reset strip to "Sectors"
      if (!open) {
        setScrollSpySubtab('company-sectors');
        onSubtabClick?.('company', 'company-sectors');
      }
    };
    window.addEventListener('company-detail', handler);
    return () => window.removeEventListener('company-detail', handler);
  }, [onSubtabClick]);

  // ── Collapse / show nav ──
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
  }, []);

  // ── Responsive ──
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const check = () => { clearTimeout(t); t = setTimeout(() => setIsMobile(window.innerWidth < 640), 150); };
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('resize', check); };
  }, []);

  const setNavProgress = useCallback((value: number) => {
    const navEl = navContainerRef.current;
    if (!navEl) return;
    const clamped = Math.min(1, Math.max(0, value));
    navEl.style.setProperty('--nav-scroll-progress', clamped.toString());
  }, []);

  const syncNavProgressFor = useCallback((durationMs = 1200) => {
    const stopAt = performance.now() + durationMs;
    const tick = (now: number) => {
      navProgressUpdateRef.current?.();
      if (now < stopAt) {
        navProgressSyncRafRef.current = requestAnimationFrame(tick);
      } else {
        navProgressSyncRafRef.current = null;
      }
    };

    if (navProgressSyncRafRef.current !== null) {
      cancelAnimationFrame(navProgressSyncRafRef.current);
    }
    navProgressSyncRafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Nav scroll progress border ──
  useEffect(() => {
    const scheduleProgressUpdate = () => {
      if (navProgressRafRef.current !== null) return;
      navProgressRafRef.current = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollRange = Math.max(1, doc.scrollHeight - window.innerHeight);
        const sm = ScrollSmoother.get();
        const currentScroll = sm ? sm.scrollTop() : window.scrollY;
        const progress = Math.min(1, Math.max(0, currentScroll / scrollRange));
        setNavProgress(progress);
        navProgressRafRef.current = null;
      });
    };
    navProgressUpdateRef.current = scheduleProgressUpdate;

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => scheduleProgressUpdate())
      : null;
    resizeObserver?.observe(document.body);

    const smoother = ScrollSmoother.get() as {
      scrollTrigger?: {
        addEventListener?: (event: string, cb: () => void) => void;
        removeEventListener?: (event: string, cb: () => void) => void;
      };
    } | null;
    smoother?.scrollTrigger?.addEventListener?.('update', scheduleProgressUpdate);

    scheduleProgressUpdate();
    window.addEventListener('scroll', scheduleProgressUpdate, { passive: true });
    window.addEventListener('resize', scheduleProgressUpdate, { passive: true });

    return () => {
      navProgressUpdateRef.current = null;
      window.removeEventListener('scroll', scheduleProgressUpdate);
      window.removeEventListener('resize', scheduleProgressUpdate);
      smoother?.scrollTrigger?.removeEventListener?.('update', scheduleProgressUpdate);
      resizeObserver?.disconnect();
      if (navProgressRafRef.current !== null) {
        cancelAnimationFrame(navProgressRafRef.current);
      }
      if (navProgressSyncRafRef.current !== null) {
        cancelAnimationFrame(navProgressSyncRafRef.current);
      }
    };
  }, [setNavProgress]);

  // When active tab changes: open strip, reset scroll-spy to first subtab
  useEffect(() => {
    manualOpenRef.current = false;
    const item = NAV_ITEMS.find(i => i.id === activeTab);
    if (!item?.subtabs?.length) { setStripOpen(false); setScrollSpySubtab(null); return; }
    setStripOpen(true);
    setScrollSpySubtab(activeSubtab ?? item.subtabs[0].id);
  }, [activeTab, activeSubtab]);

  // Scroll-spy: compute the active section on scroll. IntersectionObserver is
  // unreliable here because GSAP ScrollSmoother moves content via transform
  // inside a position:fixed wrapper, so we measure positions directly instead —
  // driven by native scroll AND the smoother's own "update" event.
  useEffect(() => {
    const item = NAV_ITEMS.find(i => i.id === activeTab);
    if (!item?.subtabs?.length) return;

    const sectionSubtabs = item.subtabs.filter(s => s.sectionId);
    if (!sectionSubtabs.length) return;

    let rafId: number | null = null;

    const compute = () => {
      rafId = null;
      if (isProgrammaticScrollRef.current) return;

      const nav = document.querySelector('.glass-navbar') as HTMLElement | null;
      const navH = nav?.offsetHeight ?? 80;
      const line = navH + 8; // reference line just below the navbar

      // Active section = the last one whose top has crossed above the line.
      let bestSub: SubtabItem | null = null;
      let bestTop = -Infinity;
      for (const sub of sectionSubtabs) {
        const el = document.getElementById(sub.sectionId!);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - line <= 0 && top > bestTop) {
          bestTop = top;
          bestSub = sub;
        }
      }
      // Above the first section's trigger point → default to the first section.
      if (!bestSub) bestSub = sectionSubtabs[0];

      setScrollSpySubtab(prev => (prev === bestSub!.id ? prev : bestSub!.id));
    };

    const schedule = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(compute);
    };

    schedule(); // initial placement
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    const smoother = ScrollSmoother.get() as {
      scrollTrigger?: {
        addEventListener?: (event: string, cb: () => void) => void;
        removeEventListener?: (event: string, cb: () => void) => void;
      };
    } | null;
    smoother?.scrollTrigger?.addEventListener?.('update', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      smoother?.scrollTrigger?.removeEventListener?.('update', schedule);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [activeTab]);

  useEffect(() => () => {
    if (programmaticScrollTimer.current) clearTimeout(programmaticScrollTimer.current);
  }, []);

  // ── Tab label click ──
  // Main-tab switches just fade; instant scroll-to-top happens while content is invisible
  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setNavProgress(0);
    setTimeout(() => {
      gsapScrollToTop(false);
      syncNavProgressFor(450);
    }, 150);
  }, [setActiveTab, setNavProgress, syncNavProgressFor]);

  // ── Arrow click ──
  const handleArrowToggle = useCallback((tabId: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      setNavProgress(0);
      setTimeout(() => {
        gsapScrollToTop(false);
        syncNavProgressFor(450);
      }, 150);
      return;
    }
    setStripOpen(prev => {
      const next = !prev;
      manualOpenRef.current = next;
      return next;
    });
  }, [activeTab, setActiveTab, setNavProgress, syncNavProgressFor]);

  // ── Subtab click inside the strip ──
  const handleSubtabClick = useCallback((parentTabId: string, sub: SubtabItem) => {
    // Only switch tabs when we're not already on this tab.
    // Calling setActiveTab when already active triggers the "tab-reset" path
    // which scrolls to top and runs transition animations, stomping the
    // section-scroll we're about to perform.
    if (parentTabId !== activeTab) {
      setActiveTab(parentTabId);
    }
    onSubtabClick?.(parentTabId, sub.id);
    if (sub.sectionId) {
      setScrollSpySubtab(sub.id);
      isProgrammaticScrollRef.current = true;
      if (programmaticScrollTimer.current) clearTimeout(programmaticScrollTimer.current);
      programmaticScrollTimer.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 1200);

      const scrollToSection = () => {
        const el = document.getElementById(sub.sectionId!);
        if (el) {
          gsapScrollTo(el);
          syncNavProgressFor(1600);
          return;
        }
        // Element not in DOM yet (tab switch still rendering) — retry once
        setTimeout(() => {
          const el2 = document.getElementById(sub.sectionId!);
          if (el2) {
            gsapScrollTo(el2);
            syncNavProgressFor(1600);
          }
        }, 80);
      };
      requestAnimationFrame(scrollToSection);
    } else {
      setNavProgress(0);
      gsapScrollToTop(false);
      syncNavProgressFor(450);
    }
  }, [activeTab, setActiveTab, onSubtabClick, setNavProgress, syncNavProgressFor]);

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
    setActiveTab(tabId);
    if (subtabId) onSubtabClick?.(tabId, subtabId);
    // Find matching subtab's sectionId so we can scroll to it
    const navItem = NAV_ITEMS.find(i => i.id === tabId);
    const sub = navItem?.subtabs?.find(s => s.id === subtabId);
    if (sub?.sectionId) {
      // Give time for the tab to render, then scroll
      setTimeout(() => {
        const el = document.getElementById(sub.sectionId!);
        if (el) {
          gsapScrollTo(el);
          syncNavProgressFor(1600);
        }
      }, 450);
    } else {
      setNavProgress(0);
      gsapScrollToTop(false);
      syncNavProgressFor(450);
    }
  }, [setActiveTab, onSubtabClick, setNavProgress, syncNavProgressFor]);

  // ── Mobile sidebar ──
  const openMobile      = useCallback(() => setMobileOpen(true), []);
  const closeMobile     = useCallback(() => { setMobileOpen(false); setMobileExpandedTab(null); }, []);
  const toggleMobileTab = useCallback((id: string) => setMobileExpandedTab(p => p === id ? null : id), []);

  const handleMobileTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId); setMobileOpen(false); setMobileExpandedTab(null);
    setNavProgress(0);
    setTimeout(() => {
      gsapScrollToTop(false);
      syncNavProgressFor(450);
    }, 150);
  }, [setActiveTab, setNavProgress, syncNavProgressFor]);

  const handleMobileSubtabClick = useCallback((parentTabId: string, sub: SubtabItem) => {
    if (sub.external) {
      window.open(sub.external, '_blank', 'noopener,noreferrer');
      setMobileOpen(false); setMobileExpandedTab(null);
      return;
    }
    setActiveTab(parentTabId); onSubtabClick?.(parentTabId, sub.id);
    setMobileOpen(false); setMobileExpandedTab(null);
    if (sub.sectionId) {
      requestAnimationFrame(() => {
        const el = document.getElementById(sub.sectionId!);
        if (el) {
          gsapScrollTo(el);
          syncNavProgressFor(1600);
        }
      });
    } else {
      setNavProgress(0);
      gsapScrollToTop(false);
      syncNavProgressFor(450);
    }
  }, [setActiveTab, onSubtabClick, setNavProgress, syncNavProgressFor]);

  const handleMobileSearch = useCallback(() => { setMobileOpen(false); setSearchOpen(true); }, []);

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
      '.strip-tab', '.strip-collapse',
      '.logo-mark', '.mob-tab-btn', '.mob-subtab-btn',
      '.mob-close', '.mob-search', '.nav-reveal-tab', '.nav-theme-tab', '.mobile-burger',
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

  // ── Derived state ──
  const activeSet = useMemo(() => {
    const set = new Set<string>();
    for (const item of NAV_ITEMS) {
      if (activeTab === item.id) { set.add(item.id); continue; }
      if (activeSubtab && item.subtabs?.some(s => s.id === activeSubtab)) set.add(item.id);
    }
    return set;
  }, [activeTab, activeSubtab]);

  const barStyle = useMemo(() => ({
    height: isMobile ? '68px' : '84px',
    paddingLeft:  isMobile ? '16px' : '36px',
    paddingRight: isMobile ? '16px' : '36px',
    gap: isMobile ? '10px' : '16px',
  }), [isMobile]);

  const labelFontStyle = useMemo(() => ({ fontSize: isMobile ? '0.84rem' : '0.97rem' }), [isMobile]);

  return (
    <>
      <style>{NAVBAR_CSS}</style>
      <SearchModal isOpen={searchOpen} onClose={closeSearch} onNavigate={handleSearchNavigate} />

      {/* ══ STICKY REVEAL TAB ══ */}
      <button
        className={`nav-reveal-tab${navCollapsed ? ' tab-visible' : ''}`}
        onClick={handleShowNav}
        aria-label="Show navigation bar"
      >
        <i className="bi bi-eye reveal-tab-icon" style={{ fontSize: '0.9rem' }} />
        {!isMobile && <span>Show Nav</span>}
      </button>

      {/* ══ STICKY THEME TOGGLE TAB ══ */}
      <StickyThemeTab visible={navCollapsed} isMobile={isMobile} />

      <nav ref={navContainerRef} className={`glass-navbar${navCollapsed ? ' nav-collapsed' : ''}`}>

        {/* ══ MAIN BAR ROW ══ */}
        <div className="w-full flex items-center" style={barStyle}>

          <button
            className="logo-mark flex-shrink-0"
            onClick={() => handleTabClick('home')}
            aria-label="Go to home page"
          >
            <div className="logo-icon">
              <Image src="/assets/Notus-Regalia-logo.svg" alt="Notus Regalia" width={42} height={42} priority />
            </div>
            <div
              className="logo-text"
              style={{ fontSize: isMobile ? '0.95rem' : undefined, letterSpacing: 'normal', textTransform: 'none', margin: 0 }}
            >
              Notus <span style={{ color: '#EB1143', fontWeight: 300 }}>Regalia</span>
            </div>
          </button>

          <div className="nav-divider desktop-only" style={{ height: '32px', alignSelf: 'center' }} />

          {/* ── Tab pills ── */}
          <div className="nav-center">
            <div className="tabs-row">
              {NAV_ITEMS.map((item) => {
                const active      = activeSet.has(item.id);
                const hasSubtabs  = !!(item.subtabs?.length);
                const isActiveTab = item.id === activeTab;
                const arrowOpen   = isActiveTab && stripOpen;
                return (
                  <div
                    key={item.id}
                    className={`tab-item-border${active ? ' is-active' : ''}`}
                  >
                    <div className={`tab-item${active ? ' is-active' : ''}`}>
                      {/* ── Tab label — icon removed ── */}
                      <button
                        className={`tab-label-btn${active ? ' is-active' : ''}`}
                        onClick={() => handleTabClick(item.id)}
                        style={labelFontStyle}
                      >
                        {item.label}
                      </button>

                      {hasSubtabs && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right controls ── */}
          <div className="nav-right-controls">
            <ThemeToggleTabBtn isMobile={isMobile} />
            <HideNavTabBtn isMobile={isMobile} onClick={handleCollapseNav} />
            <SearchTabBtn isMobile={isMobile} onClick={openSearch} />
            <button className="mobile-burger" onClick={openMobile} aria-label="Open menu">
              <i className="bi bi-list" />
            </button>
          </div>
        </div>

        {/* ══ SUBTAB STRIP — active tab only ══ */}
        {/* Company tab: single strip with crossfading inner layers */}
        <div className={`subtab-strip-outer${activeTab === 'company' && stripOpen ? ' strip-visible' : ''}`}>
          <div className="subtab-strip-clip">
            <div className="subtab-strip-inner" style={{ position: 'relative' }}>
                {/* Layer 1: "Return to Previous Page" — visible when detail open */}
                <div className={`strip-crossfade-layer ${companyDetailOpen ? 'strip-layer-visible' : 'strip-layer-hidden'}`}>
                  <div className="strip-tabs-track">
                    <button
                      className="strip-tab strip-tab-active"
                      onClick={() => window.dispatchEvent(new CustomEvent('company-detail-back'))}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <i className="bi bi-arrow-left" style={{ fontSize: '0.7rem' }} />
                      Return to Previous Page
                    </button>
                  </div>
                  <button
                    className="strip-collapse"
                    onClick={() => { manualOpenRef.current = false; setStripOpen(false); }}
                    aria-label="Hide strip"
                  >
                    <i className="bi bi-chevron-up" />
                  </button>
                </div>
                {/* Layer 2: Normal subtabs — visible when NOT in detail */}
                <div className={`strip-crossfade-layer ${!companyDetailOpen ? 'strip-layer-visible' : 'strip-layer-hidden'}`}>
                  <CompanyStripContent
                    activeSubtabId={(scrollSpySubtab ?? activeSubtab) ?? null}
                    onSubtabClick={(sub) => handleSubtabClick('company', sub)}
                    onCollapse={() => { manualOpenRef.current = false; setStripOpen(false); }}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            </div>
          </div>
        {/* Other tabs: normal StripRow strips */}
        {NAV_ITEMS.filter(item => item.subtabs?.length && item.id !== 'company').map((item) => {
          const isActiveItem   = item.id === activeTab;
          const isVisible      = isActiveItem && stripOpen;
          const activeSubtabId = isActiveItem ? (activeSubtab ?? scrollSpySubtab) : undefined;

          return (
            <StripRow
              key={`strip-${item.id}`}
              item={item}
              isVisible={isVisible}
              activeSubtabId={activeSubtabId ?? null}
              onSubtabClick={(sub) => handleSubtabClick(item.id, sub)}
              onCollapse={() => { manualOpenRef.current = false; setStripOpen(false); }}
              isMobile={isMobile}
            />
          );
        })}

      </nav>

      {/* ══ MOBILE SIDEBAR ══ */}
      <div className={`mob-overlay${mobileOpen ? ' open' : ''}`} onClick={closeMobile} />
      <div
        className={`mob-sidebar${mobileOpen ? ' open' : ''}`}
        onTouchStart={onSidebarTouchStart}
        onTouchEnd={onSidebarTouchEnd}
      >
        <div className="mob-header">
          <span className="mob-header-title">Menu</span>
          <ThemeToggle />
          <button className="mob-close" onClick={closeMobile} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="mob-search" onClick={handleMobileSearch}>
          <i className="bi bi-search" />
          <span>Search…</span>
        </div>
        <div className="mob-nav-list">
          {NAV_ITEMS.map(item => {
            const active        = activeSet.has(item.id);
            const isTabExpanded = mobileExpandedTab === item.id;
            const hasSubtabs    = !!(item.subtabs?.length);
            return (
              <div key={item.id}>
                <button
                  className={`mob-tab-btn${active ? ' is-active' : ''}`}
                  onClick={() => hasSubtabs ? toggleMobileTab(item.id) : handleMobileTabClick(item.id)}
                >
                  <span className="mob-tab-left">
                    <i className={`bi ${item.icon}`} />
                    {item.label}
                  </span>
                  {hasSubtabs && (
                    <i className={`bi bi-chevron-right mob-tab-chevron${isTabExpanded ? ' open' : ''}`} />
                  )}
                </button>
                {hasSubtabs && (
                  <div className={`mob-subtabs ${isTabExpanded ? 'expanded' : 'collapsed'}`}>
                    <button
                      className={`mob-subtab-btn${active && !activeSubtab ? ' is-active' : ''}`}
                      onClick={() => handleMobileTabClick(item.id)}
                    >
                      All {item.label}
                    </button>
                    {item.subtabs!.map(sub => (
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default memo(Navbar);
