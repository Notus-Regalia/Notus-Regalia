"use client";
import Image from 'next/image';
import { Fragment, useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { NAVBAR_CSS } from './navbar-styles';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import {
  COMPANY_SUBTABS,
  getCompanySubtab,
  type CompanySubtab,
  type CompanySection,
} from '@/data/company-nav';

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
    // Each Company subtab is a standalone page; its in-page sections are
    // defined in src/data/company-nav.ts and drive the breadcrumb strip.
    subtabs: COMPANY_SUBTABS.map(s => ({ id: s.id, label: s.label, external: s.external })),
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
//  Company strip — dual-mode (subtab nav ⟷ breadcrumbs)
// ─────────────────────────────────────────────────────────────

/* Sliding active indicator shared by both strip layers. Buttons are keyed,
   placement walks offsetLeft up to the track so it works with leading
   anchors/separators in the flow. */
const useSlidingIndicator = (activeKey: string | null, visible: boolean) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const btnRefs  = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  const [indStyle, setIndStyle] = useState<{ left: number; width: number } | null>(null);
  const [animate, setAnimate]   = useState(false);
  const hasPlacedRef            = useRef(false);

  const setBtnRef = useCallback((key: string) => (el: HTMLButtonElement | null) => {
    btnRefs.current.set(key, el);
  }, []);

  const place = useCallback((shouldAnimate: boolean) => {
    const track = trackRef.current;
    const btn = activeKey ? btnRefs.current.get(activeKey) : null;
    if (!track || !btn) return;

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

    // Keep the active button centred when the track overflows (mobile)
    if (track.scrollWidth > track.clientWidth + 2) {
      const target = left + width / 2 - track.clientWidth / 2;
      track.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
  }, [activeKey]);

  useEffect(() => {
    if (visible) place(hasPlacedRef.current);
  }, [activeKey, visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // (Re-)enter: place without animation once layout settles
  useEffect(() => {
    if (!visible) { hasPlacedRef.current = false; return; }
    const t = setTimeout(() => place(false), 60);
    return () => clearTimeout(t);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const indicatorStyle: React.CSSProperties = {
    left: indStyle?.left ?? 0,
    width: indStyle?.width ?? 0,
    opacity: indStyle ? 1 : 0,
    transition: animate
      ? 'left 0.32s cubic-bezier(0.4, 0, 0.2, 1), width 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease'
      : 'none',
  };

  return { trackRef, setBtnRef, indicatorStyle };
};

/* Far-right strip arrow: collapses on desktop, scrolls the track on mobile */
const useStripArrow = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  isMobile: boolean | undefined,
  onCollapse: () => void,
) => {
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isMobile) return;
    const update = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      setAtEnd(maxScroll > 0 && track.scrollLeft >= maxScroll - 2);
    };
    track.addEventListener('scroll', update, { passive: true });
    update();
    return () => track.removeEventListener('scroll', update);
  }, [isMobile, trackRef]);

  const handleArrowClick = useCallback(() => {
    const track = trackRef.current;
    if (isMobile && track) {
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
  }, [isMobile, atEnd, onCollapse, trackRef]);

  const arrowIcon = isMobile
    ? (atEnd ? 'bi-chevron-left' : 'bi-chevron-right')
    : 'bi-chevron-up';

  return { handleArrowClick, arrowIcon };
};

const StripIndicator = ({ style }: { style: React.CSSProperties }) => (
  <div className="strip-indicator" style={style} aria-hidden>
    <div className="strip-indicator-bg" />
    <div className="strip-indicator-corner tl" />
    <div className="strip-indicator-corner tr" />
    <div className="strip-indicator-corner bl" />
    <div className="strip-indicator-corner br" />
  </div>
);

/* Layer A — main subtab navigation:
   | Mission | Industries | Executives | Investors | Information Central | */
interface CompanyNavLayerProps {
  visible: boolean;
  activeSubtabId: string;
  onNavigate: (sub: CompanySubtab) => void;
  onExpandCrumbs: () => void;
  onCollapse: () => void;
  isMobile?: boolean;
  previewOnly?: boolean;
}

const CompanyNavLayer = memo(({
  visible, activeSubtabId, onNavigate, onExpandCrumbs, onCollapse, isMobile, previewOnly,
}: CompanyNavLayerProps) => {
  const { trackRef, setBtnRef } = useSlidingIndicator(activeSubtabId, visible);
  const { handleArrowClick, arrowIcon } = useStripArrow(trackRef, isMobile, onCollapse);

  return (
    <div className={`strip-crossfade-layer strip-flip-nav ${visible ? 'strip-layer-visible' : 'strip-layer-hidden'}`}>
      <div className="strip-tabs-track" ref={trackRef}>
        {COMPANY_SUBTABS.map((sub, idx) => {
          const isActive = activeSubtabId === sub.id;
          // External items just open a link, so they stay plain tabs.
          if (sub.external) {
            return (
              <button
                key={sub.id}
                ref={setBtnRef(sub.id)}
                className={`strip-tab strip-tab-external${isActive ? ' strip-tab-active' : ''}`}
                style={{ '--si': idx, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' } as React.CSSProperties}
                onClick={() => window.open(sub.external!, '_blank', 'noopener,noreferrer')}
              >
                {sub.label}
                <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.7rem' }} />
              </button>
            );
          }
          // Every page is the SAME morphing button. The burger + plus are always
          // in the DOM but collapse to zero width when inactive; the active page
          // springs them open into the breadcrumb-title pill. Because only a
          // class toggles (the element is keyed + reused), width/padding/icons
          // animate smoothly as the active page changes — and its siblings glide
          // along in the flex row. Clicking the active pill expands breadcrumbs.
          return (
            <button
              key={sub.id}
              ref={setBtnRef(sub.id)}
              className={`strip-tab strip-tab-morph${isActive ? ' strip-tab-pill' : ''}`}
              style={{ '--si': idx } as React.CSSProperties}
              onClick={() => (isActive && !previewOnly ? onExpandCrumbs() : onNavigate(sub))}
              aria-label={isActive && !previewOnly ? `${sub.label} — show section breadcrumbs` : sub.label}
              title={isActive && !previewOnly ? 'Show sections' : undefined}
            >
              <span className="strip-morph-burger" aria-hidden>
                <span /><span /><span />
              </span>
              <span className="strip-morph-label">{sub.label}</span>
              <i className="bi bi-plus-lg strip-morph-plus" aria-hidden />
            </button>
          );
        })}
      </div>
      <button
        className="strip-collapse"
        onClick={handleArrowClick}
        aria-label={isMobile ? 'Scroll Company pages' : 'Hide Company pages'}
      >
        <i className={`bi ${arrowIcon}`} />
      </button>
    </div>
  );
});
CompanyNavLayer.displayName = 'CompanyNavLayer';

/* Layer B — expanded breadcrumbs of the active subtab page:
   | Sectors ▸ | Overview › Industries › Explore */
interface CompanyCrumbsLayerProps {
  visible: boolean;
  subtab: CompanySubtab;
  activeSectionId: string | null;
  onCrumbClick: (section: CompanySection) => void;
  onShowNav: () => void;
  onCollapse: () => void;
  isMobile?: boolean;
}

const CompanyCrumbsLayer = memo(({
  visible, subtab, activeSectionId, onCrumbClick, onShowNav, onCollapse, isMobile,
}: CompanyCrumbsLayerProps) => {
  const { trackRef, setBtnRef, indicatorStyle } = useSlidingIndicator(activeSectionId, visible);
  const { handleArrowClick, arrowIcon } = useStripArrow(trackRef, isMobile, onCollapse);
  const sections = subtab.sections ?? [];

  return (
    <div className={`strip-crossfade-layer strip-flip-crumbs ${visible ? 'strip-layer-visible' : 'strip-layer-hidden'}`}>
      <div className="strip-tabs-track" ref={trackRef}>
        <button
          className="strip-anchor"
          onClick={onShowNav}
          aria-label="Close breadcrumbs and show all Company pages"
          title="Close breadcrumbs"
        >
          <span className="strip-anchor-burger" aria-hidden>
            <span /><span /><span />
          </span>
          <span className="strip-anchor-label">
            {subtab.label}
          </span>
          <i className="bi bi-x-lg strip-anchor-close" aria-hidden />
        </button>

        <StripIndicator style={indicatorStyle} />

        {sections.map((sec, idx) => (
          <Fragment key={sec.id}>
            {idx > 0 && (
              <span className="strip-crumb-sep" aria-hidden>
                <i className="bi bi-chevron-right" />
              </span>
            )}
            <button
              ref={setBtnRef(sec.id)}
              className={`strip-crumb${activeSectionId === sec.id ? ' strip-crumb-active' : ''}`}
              onClick={() => onCrumbClick(sec)}
            >
              {sec.label}
            </button>
          </Fragment>
        ))}
      </div>
      <button
        className="strip-collapse"
        onClick={handleArrowClick}
        aria-label={isMobile ? `Scroll ${subtab.label} sections` : `Hide ${subtab.label} sections`}
      >
        <i className={`bi ${arrowIcon}`} />
      </button>
    </div>
  );
});
CompanyCrumbsLayer.displayName = 'CompanyCrumbsLayer';

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
  const [companyDetailOpen, setCompanyDetailOpen] = useState(false);

  // ── Hover preview: peek a tab's subtab strip and blur the page behind ──
  const [previewTab, setPreviewTab] = useState<string | null>(null);
  const previewCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Company strip: dual mode (breadcrumbs ⟷ subtab nav) ──
  // Default to the main subtab nav so entering the Company tab shows the subtab
  // strip (with the active-page pill); breadcrumbs open manually via the plus.
  const [stripMode, setStripMode] = useState<'crumbs' | 'nav'>('nav');
  const [modeEpoch, setModeEpoch] = useState(0); // bump to re-place the sliding indicator
  const [scrollSpySection, setScrollSpySection] = useState<string | null>(null);
  // Set when the user picks a new page from the main subtab strip: keep nav
  // mode visible so its indicator slides to the new active subtab, then reveal
  // breadcrumbs after a short delay (instead of switching instantly).
  const navSlideThenCrumbsRef = useRef(false);
  // Tracks the previous active tab so we can tell a fresh entry into the
  // Company tab from a subtab change while already on it.
  const prevActiveTabRef = useRef(activeTab);

  // Active standalone Company page (falls back to Sectors)
  const companySubtab = useMemo(
    () => getCompanySubtab(activeSubtab),
    [activeSubtab],
  );

  // ── Listen for company detail page events ──
  // The Company component fires `open: false` on mount too, so only treat a
  // true→false transition as "returned from a detail page" (→ breadcrumbs).
  // Otherwise a fresh tab entry would immediately flip out of nav mode.
  const detailWasOpenRef = useRef(false);
  useEffect(() => {
    const handler = (e: Event) => {
      const open = (e as CustomEvent).detail?.open ?? false;
      setCompanyDetailOpen(open);

      if (!open && detailWasOpenRef.current) {
        setStripMode('crumbs');
        setModeEpoch(n => n + 1);
      }
      detailWasOpenRef.current = open;
    };
    window.addEventListener('company-detail', handler);
    return () => window.removeEventListener('company-detail', handler);
  }, []);

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

  // The Seraph assistant ("Lock navigation" action) collapses the nav via event.
  useEffect(() => {
    const onCollapse = () => handleCollapseNav();
    window.addEventListener('nav-collapse', onCollapse);
    return () => window.removeEventListener('nav-collapse', onCollapse);
  }, [handleCollapseNav]);

  // ── Hover preview ──
  // Peek a tab's strip on hover (desktop only). A short close delay lets the
  // cursor travel from the tab pill down onto the strip without it collapsing.
  const openPreview = useCallback((tabId: string) => {
    if (isMobile) return;
    const item = NAV_ITEMS.find(i => i.id === tabId);
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

  // When active tab changes: open strip
  useEffect(() => {
    manualOpenRef.current = false;
    const item = NAV_ITEMS.find(i => i.id === activeTab);
    if (!item?.subtabs?.length) { setStripOpen(false); return; }
    setStripOpen(true);
  }, [activeTab]);

  // When the Company page (subtab) changes: reset scroll-spy to the first
  // section. The strip stays on the subtab nav (showing the active-page pill);
  // breadcrumbs are opened manually via the pill's plus. Deep links into a
  // specific section still land on breadcrumbs so the section is highlighted.
  useEffect(() => {
    const wasCompany = prevActiveTabRef.current === 'company';
    prevActiveTabRef.current = activeTab;

    // Leaving the Company tab → reset to nav mode while the strip is hidden.
    if (activeTab !== 'company') {
      navSlideThenCrumbsRef.current = false;
      setStripMode('nav');
      return;
    }

    setScrollSpySection(companySubtab.sections?.[0]?.id ?? null);

    // Fresh entry, or picking another page from the subtab strip → show the
    // subtab nav with the active-page pill.
    if (!wasCompany || navSlideThenCrumbsRef.current) {
      navSlideThenCrumbsRef.current = false;
      setStripMode('nav');
      setModeEpoch(n => n + 1);
      return;
    }

    // Subtab changed from elsewhere (footer, search, deep link) while already on
    // the tab → show that page's breadcrumbs so the target section is in context.
    setStripMode('crumbs');
    setModeEpoch(n => n + 1);
  }, [activeTab, companySubtab]);

  // The strip switches between the subtab nav (with the active-page pill) and the
  // section breadcrumbs only on explicit user action — the active pill's plus
  // expands to breadcrumbs, the breadcrumb anchor collapses back. No timer.
  const toggleStripMode = useCallback(() => {
    setStripMode(m => (m === 'crumbs' ? 'nav' : 'crumbs'));
    setModeEpoch(n => n + 1);
  }, []);

  // Scroll-spy over the active Company page's sections (breadcrumbs).
  // IntersectionObserver is unreliable here because GSAP ScrollSmoother moves
  // content via transform inside a position:fixed wrapper, so we measure
  // positions directly instead — driven by native scroll AND the smoother's
  // own "update" event.
  useEffect(() => {
    if (activeTab !== 'company' || companyDetailOpen) return;
    const sections = companySubtab.sections ?? [];
    if (!sections.length) return;

    let rafId: number | null = null;

    const compute = () => {
      rafId = null;
      if (isProgrammaticScrollRef.current) return;

      const nav = document.querySelector('.glass-navbar') as HTMLElement | null;
      const navH = nav?.offsetHeight ?? 80;
      const line = navH + 8; // reference line just below the navbar

      // Active section = the last one whose top has crossed above the line.
      let bestSec: CompanySection | null = null;
      let bestTop = -Infinity;
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - line <= 0 && top > bestTop) {
          bestTop = top;
          bestSec = sec;
        }
      }
      // Above the first section's trigger point → default to the first section.
      if (!bestSec) bestSec = sections[0];

      setScrollSpySection(prev => (prev === bestSec!.id ? prev : bestSec!.id));
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
  }, [activeTab, companySubtab, companyDetailOpen]);

  useEffect(() => () => {
    if (programmaticScrollTimer.current) clearTimeout(programmaticScrollTimer.current);
    if (previewCloseTimer.current) clearTimeout(previewCloseTimer.current);
  }, []);

  // ── Tab label click ──
  // Main-tab switches just fade; instant scroll-to-top happens while content is invisible
  const handleTabClick = useCallback((tabId: string) => {
    // Re-clicking the already-active Company tab forces the main subtab strip
    // (closes any open breadcrumbs) back to the active-page pill.
    if (tabId === 'company' && activeTab === 'company') {
      navSlideThenCrumbsRef.current = false;
      setStripOpen(true);
      manualOpenRef.current = true;
      setStripMode('nav');
      setModeEpoch(n => n + 1);
    }
    setActiveTab(tabId);
    setNavProgress(0);
    setTimeout(() => {
      gsapScrollToTop(false);
      syncNavProgressFor(450);
    }, 150);
  }, [activeTab, setActiveTab, setNavProgress, syncNavProgressFor]);

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
    clearPreview();
    // Only switch tabs when we're not already on this tab.
    // Calling setActiveTab when already active triggers the "tab-reset" path
    // which scrolls to top and runs transition animations, stomping the
    // section-scroll we're about to perform.
    if (parentTabId !== activeTab) {
      setActiveTab(parentTabId);
    }
    onSubtabClick?.(parentTabId, sub.id);
    if (sub.sectionId) {
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
  }, [activeTab, setActiveTab, onSubtabClick, setNavProgress, syncNavProgressFor, clearPreview]);

  // ── Company strip: navigate to another standalone subtab page ──
  // The Company tab runs its own fade transition + scroll-to-top on swap,
  // so we only update state/URL here and keep the progress border in sync.
  const handleCompanyNavigate = useCallback((sub: CompanySubtab) => {
    // Stay in nav mode so the new page's pill takes over the strip.
    navSlideThenCrumbsRef.current = true;
    clearPreview();
    // When clicked from a hover preview (we're on another tab), switch to the
    // Company tab too — otherwise only the URL changes and nothing opens.
    if (activeTab !== 'company') setActiveTab('company');
    onSubtabClick?.('company', sub.id);
    setNavProgress(0);
    syncNavProgressFor(1200);
  }, [activeTab, setActiveTab, onSubtabClick, setNavProgress, syncNavProgressFor, clearPreview]);

  // ── Company strip: breadcrumb click → scroll to the section ──
  const handleCrumbClick = useCallback((sec: CompanySection) => {
    setScrollSpySection(sec.id);
    setModeEpoch(n => n + 1); // interacting re-places the indicator
    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimer.current) clearTimeout(programmaticScrollTimer.current);
    programmaticScrollTimer.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 1200);

    const el = document.getElementById(sec.id);
    if (el) {
      gsapScrollTo(el);
      syncNavProgressFor(1600);
    }
  }, [syncNavProgressFor]);

  // ── Search ──
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
    if (tabId === 'company') {
      // Company runs its own page transition + scroll-to-top on subtab swap
      syncNavProgressFor(1200);
      return;
    }
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

  // Seraph assistant search → reuse the same in-app navigation as ⌘K.
  useEffect(() => {
    const onNavigate = (e: Event) => {
      const d = (e as CustomEvent).detail as { tabId: string; subtabId?: string };
      if (d?.tabId) handleSearchNavigate(d.tabId, d.subtabId);
    };
    window.addEventListener('seraph-navigate', onNavigate);
    return () => window.removeEventListener('seraph-navigate', onNavigate);
  }, [handleSearchNavigate]);

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
    if (parentTabId === 'company') {
      // Company runs its own page transition + scroll-to-top on subtab swap
      syncNavProgressFor(1200);
    } else if (sub.sectionId) {
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
      '.strip-tab', '.strip-anchor', '.strip-crumb', '.strip-collapse',
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

  // While hovering a tab, that tab's strip is the only one shown (peek mode);
  // otherwise the active tab's strip shows when opened.
  const stripVisibleFor = (id: string) =>
    previewTab ? previewTab === id : (activeTab === id && stripOpen);
  // Peeking the Company strip from another tab → force the subtab nav layer
  // (breadcrumbs only make sense on the active Company page).
  const companyPreviewOnly = previewTab === 'company' && activeTab !== 'company';

  return (
    <>
      <style>{NAVBAR_CSS}</style>
      <SearchModal isOpen={searchOpen} onClose={closeSearch} onNavigate={handleSearchNavigate} />

      {/* ══ HOVER-PREVIEW BACKDROP — blurs the page behind the peeked strip ══ */}
      <div className={`nav-preview-backdrop${previewTab ? ' active' : ''}`} aria-hidden />

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
                    onMouseEnter={() => openPreview(item.id)}
                    onMouseLeave={closePreviewSoon}
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
            <button className="mobile-burger" onClick={openMobile} aria-label="Open menu">
              <i className="bi bi-list" />
            </button>
          </div>
        </div>

        {/* ══ SUBTAB STRIP — active tab only ══ */}
        {/* Company tab: single strip with crossfading inner layers
            (detail back-link / main subtab nav / active-page breadcrumbs) */}
        <div
          className={`subtab-strip-outer${stripVisibleFor('company') ? ' strip-visible' : ''}`}
          onMouseEnter={cancelPreviewClose}
          onMouseLeave={closePreviewSoon}
        >
          <div className="subtab-strip-clip">
            <div
              className={`subtab-strip-inner company-strip${stripMode === 'crumbs' && !companyDetailOpen ? ' mode-crumbs' : ''}`}
              style={{ position: 'relative' }}
            >
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
                {/* Layer 2: main subtab navigation */}
                <CompanyNavLayer
                  visible={!companyDetailOpen && (companyPreviewOnly || stripMode === 'nav')}
                  activeSubtabId={companySubtab.id}
                  onNavigate={handleCompanyNavigate}
                  onExpandCrumbs={toggleStripMode}
                  onCollapse={() => { manualOpenRef.current = false; setStripOpen(false); }}
                  isMobile={isMobile}
                  previewOnly={companyPreviewOnly}
                />
                {/* Layer 3: breadcrumbs of the active standalone page */}
                <CompanyCrumbsLayer
                  visible={!companyDetailOpen && !companyPreviewOnly && stripMode === 'crumbs'}
                  subtab={companySubtab}
                  activeSectionId={scrollSpySection}
                  onCrumbClick={handleCrumbClick}
                  onShowNav={toggleStripMode}
                  onCollapse={() => { manualOpenRef.current = false; setStripOpen(false); }}
                  isMobile={isMobile}
                />
              </div>
            </div>
          </div>
        {/* Other tabs: normal StripRow strips */}
        {NAV_ITEMS.filter(item => item.subtabs?.length && item.id !== 'company').map((item) => {
          const isActiveItem   = item.id === activeTab;
          const isVisible      = stripVisibleFor(item.id);
          // On the active tab, honour the current subtab; when only peeking,
          // highlight the first subtab as a sensible default.
          const activeSubtabId = (isActiveItem ? activeSubtab : undefined) ?? item.subtabs![0].id;

          return (
            <div
              key={`strip-${item.id}`}
              onMouseEnter={cancelPreviewClose}
              onMouseLeave={closePreviewSoon}
            >
              <StripRow
                item={item}
                isVisible={isVisible}
                activeSubtabId={activeSubtabId}
                onSubtabClick={(sub) => handleSubtabClick(item.id, sub)}
                onCollapse={() => { manualOpenRef.current = false; setStripOpen(false); }}
                isMobile={isMobile}
              />
            </div>
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
