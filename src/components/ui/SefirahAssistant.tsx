"use client";
import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo, useId } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/cn';
import { type SectionItem, searchSections } from '@/data/search-index';
import { Search as AnimatedSearch } from '@/components/animate-ui/icons/search';
import { SlidersHorizontal as AnimatedSliders } from '@/components/animate-ui/icons/sliders-horizontal';
import SettingsPanel from '@/components/ui/SettingsPanel';

// Rotating hints typed out in the placeholder while the field is empty.
const SEARCH_HINTS = ['founders', 'executives', 'investor relations', 'careers', 'privacy policy', 'technologies', 'releases'];

// Draggable FAB: edge margin + clamp helper.
const FAB_MARGIN = 24;
const clampNum = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Left-edge icon rail tabs — each switches the panel body view. `group` decides
// whether the cell sits in the top cluster or is pushed to the bottom of the rail.
type TabId = 'search' | 'settings' | 'about';
const RAIL_TABS: { id: TabId; icon: string; label: string; group: 'top' | 'bottom' }[] = [
  { id: 'search',   icon: 'bi-search',       label: 'Sefirah',  group: 'top' },
  { id: 'about',    icon: 'bi-info-circle',  label: 'About',    group: 'bottom' },
  { id: 'settings', icon: 'bi-sliders',      label: 'Settings', group: 'bottom' },
];

// Curated quick-access suggestions shown when the field is empty.
const SUGGESTIONS: SectionItem[] = [
  { label: 'Home',                tabId: 'home',                                                        icon: 'bi-house',            aka: 'Main website & page',          keywords: [] },
  { label: 'Releases',            tabId: 'information', external: '/information/newsroom/releases',      icon: 'bi-journal-richtext', aka: 'Publications & research',      keywords: [] },
  { label: 'Founders',            tabId: 'company',     subtabId: 'company-executives',                  icon: 'bi-people',           aka: 'Leadership & team',            keywords: [] },
  { label: 'About Us',   tabId: 'company',     subtabId: 'company-about',                       icon: 'bi-flag',             aka: 'Who we are',                   keywords: [] },
  { label: 'Corporate Policies',  tabId: 'information', external: '/information/legals/policies',        icon: 'bi-journal-check',    aka: 'Conduct & compliance',         keywords: [] },
  { label: 'Technologies',        tabId: 'technologies',                                                 icon: 'bi-crosshair',        aka: 'Our ventures & sectors',       keywords: [] },
  { label: 'Information Central', tabId: 'information', external: '/information',                        icon: 'bi-box-arrow-up-right', aka: 'Newsroom, investors, legals', keywords: [] },
];

// ── Animated "Sefirah" goo loader (Uiverse by Nawsome), themeable via currentColor ──
const SefirahIcon = ({ className }: { className?: string }) => {
  const goo = `sefirah-goo-${useId().replace(/:/g, '')}`;
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 248" aria-hidden>
      <filter id={goo}>
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -20" />
      </filter>
      <circle stroke="currentColor" fill="none" strokeWidth="3" cx="124" cy="124" r="120" />
      <g filter={`url(#${goo})`}>
        <circle stroke="currentColor" fill="none" strokeWidth="10" cx="124" cy="124" r="105" />
        <circle fill="currentColor" cx="0" cy="0" r="36" transform="translate(124 124)">
          <animateTransform attributeName="transform" type="scale" additive="sum" values="1.3;0.55;0.55;1.3" keyTimes="0;0.4;0.6;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle fill="currentColor" cx="0" cy="0" r="22">
          <animateMotion path="M124.1,124l-14.9-14.9c-22.3-22.3-2.5-60.3,28.4-54.4c13.3,2.6,26.1,9,36.4,19.4c10.1,10.1,16.5,22.4,19.2,35.4c6.5,31.3-31.7,51.9-54.3,29.3L124.1,124z" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle fill="currentColor" cx="0" cy="0" r="22">
          <animateMotion path="M124.1,124l15.2,15.2c22.2,22.2,2.5,60-28.3,54.2c-13.5-2.5-26.4-9-36.8-19.4c-8.9-8.9-14.9-19.5-18-30.7c-9.1-32.5,31.4-55.7,55.2-31.8L124.1,124z" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
};

// ── Auto-resizing textarea (ported from the v0 prompt) ──
function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback((reset?: boolean) => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (reset) { ta.style.height = `${minHeight}px`; return; }
    ta.style.height = `${minHeight}px`;
    ta.style.height = `${Math.max(minHeight, Math.min(ta.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY))}px`;
  }, [minHeight, maxHeight]);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

export default function SefirahAssistant() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [placeholder, setPlaceholder] = useState('Search');
  const [navLocked, setNavLocked] = useState(false);
  const [tab, setTab] = useState<TabId>('search');

  // Rail active-indicator: measured from the active cell so it works even though
  // the cells are split into top/bottom clusters (non-contiguous).
  const railRef = useRef<HTMLDivElement>(null);
  const [indStyle, setIndStyle] = useState<{ top: number; height: number }>({ top: 0, height: 64 });
  useLayoutEffect(() => {
    const el = railRef.current?.querySelector<HTMLElement>('.sefirah-rail-tab.is-active');
    if (el) setIndStyle({ top: el.offsetTop, height: el.offsetHeight });
  }, [tab, open]);

  // Draggable FAB with magnetic edge-snap.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fabPos, setFabPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [snap, setSnap] = useState<'' | 'left' | 'right'>(''); // jelly squash on release
  const drag = useRef({ active: false, moved: false, ox: 0, oy: 0, sx: 0, sy: 0 });
  const suppressClick = useRef(false);
  // Once the user drags the FAB, stop auto-docking it to the nav border line.
  const manuallyPlaced = useRef(false);
  const { isDark, toggleTheme } = useTheme();
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 });

  // Esc closes; lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  // Animated "active suggestion" placeholder — types/erases rotating hints.
  useEffect(() => {
    if (!open || value) { setPlaceholder('Search'); return; }
    let word = 0, chars = 0, deleting = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const hint = SEARCH_HINTS[word];
      if (!deleting) {
        chars++;
        setPlaceholder(`Search "${hint.slice(0, chars)}"`);
        if (chars === hint.length) { deleting = true; t = setTimeout(tick, 1500); return; }
        t = setTimeout(tick, 85);
      } else {
        chars--;
        setPlaceholder(chars > 0 ? `Search "${hint.slice(0, chars)}"` : 'Search');
        if (chars === 0) { deleting = false; word = (word + 1) % SEARCH_HINTS.length; t = setTimeout(tick, 400); return; }
        t = setTimeout(tick, 40);
      }
    };
    t = setTimeout(tick, 700);
    return () => clearTimeout(t);
  }, [open, value]);

  // Live site search — same index/scoring as the ⌘K search bar.
  const results = useMemo(() => searchSections(value), [value]);

  const navigate = useCallback((item: SectionItem) => {
    if (item.external) {
      window.open(item.external, '_blank', 'noopener,noreferrer');
    } else {
      window.dispatchEvent(new CustomEvent('sefirah-navigate', {
        detail: { tabId: item.tabId, subtabId: item.subtabId },
      }));
    }
    setValue('');
    adjustHeight(true);
    setOpen(false);
  }, [adjustHeight]);

  const submit = useCallback(() => {
    if (results.length > 0) navigate(results[0]);
  }, [results, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  // Lock navigation: toggles whether the navbar is pinned visible (disabling its
  // scroll-direction auto-hide). The active navbar owns the state and echoes it
  // back via `nav-lock-changed`; we query it on mount so the pill reflects it.
  const toggleNavLock = useCallback(() => {
    window.dispatchEvent(new CustomEvent('nav-toggle-lock'));
  }, []);

  useEffect(() => {
    const onChanged = (e: Event) => setNavLocked(!!(e as CustomEvent).detail?.locked);
    window.addEventListener('nav-lock-changed', onChanged);
    window.dispatchEvent(new CustomEvent('nav-lock-query'));
    return () => window.removeEventListener('nav-lock-changed', onChanged);
  }, []);

  // ── FAB drag + magnetic edge-snap ──
  const onFabPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    drag.current = { active: true, moved: false, ox: e.clientX - r.left, oy: e.clientY - r.top, sx: e.clientX, sy: e.clientY };
    setFabPos({ x: r.left, y: r.top });
    setSnap(''); // cancel any in-flight jelly
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onFabPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    const el = wrapRef.current;
    if (!d.active || !el) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 4) {
      d.moved = true;
      setDragging(true);
    }
    if (!d.moved) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    setFabPos({
      x: clampNum(e.clientX - d.ox, FAB_MARGIN, window.innerWidth - w - FAB_MARGIN),
      y: clampNum(e.clientY - d.oy, FAB_MARGIN, window.innerHeight - h - FAB_MARGIN),
    });
  }, []);

  const onFabPointerUp = useCallback(() => {
    const d = drag.current;
    const el = wrapRef.current;
    if (!d.active) return;
    d.active = false;
    if (!d.moved || !el) { setDragging(false); return; }
    manuallyPlaced.current = true;    // user took over — stop auto-docking to nav
    suppressClick.current = true;     // the drag shouldn't also fire a click
    // Safety: clear the flag if no click follows (e.g. touch drags emit none).
    setTimeout(() => { suppressClick.current = false; }, 0);
    setDragging(false);
    const w = el.offsetWidth, h = el.offsetHeight;
    const r = el.getBoundingClientRect();
    const toLeft = r.left + w / 2 < window.innerWidth / 2;
    setFabPos({
      x: toLeft ? FAB_MARGIN : window.innerWidth - w - FAB_MARGIN,
      y: clampNum(r.top, FAB_MARGIN, window.innerHeight - h - FAB_MARGIN),
    });
    setSnap(toLeft ? 'left' : 'right'); // waterball squash toward the wall
  }, []);

  const onFabClick = useCallback(() => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    setOpen(o => !o);
  }, []);

  // Default position (desktop): dock the FAB top-right, centred on the nav's
  // bottom border line, and keep tracking it. The subtab strip lives inside
  // .glass-navbar, so the nav grows/shrinks as the strip opens/closes — a
  // ResizeObserver makes the FAB follow it down when a strip opens and glide
  // back up to the main nav line when it closes. Once the user drags the FAB it
  // stays put. Mobile keeps the CSS bottom-right default.
  useEffect(() => {
    const el = wrapRef.current;
    const nav = document.querySelector('.glass-navbar') as HTMLElement | null;
    if (!el || !nav) return;

    const dock = () => {
      if (manuallyPlaced.current || drag.current.active) return;
      if (window.innerWidth < 640) return; // mobile → CSS default (bottom-right)
      // While the nav is hidden (scroll-direction auto-hide), freeze the FAB —
      // it should stay put, not ride the bar as it slides off-screen.
      if (nav.classList.contains('nav-collapsed')) return;
      const w = el.offsetWidth, h = el.offsetHeight;
      // offsetTop/offsetHeight are transform-independent, so the FAB docks to the
      // bar's resting bottom line even mid-slide (getBoundingClientRect would
      // follow the translateY animation and drag the FAB along with it).
      const bottom = nav.offsetTop + nav.offsetHeight;
      setFabPos({
        x: window.innerWidth - w - FAB_MARGIN,
        y: Math.round(bottom - h / 2), // centre the icon on the border line
      });
    };

    dock(); // initial placement
    const ro = new ResizeObserver(dock);
    ro.observe(nav);
    window.addEventListener('resize', dock);
    return () => { ro.disconnect(); window.removeEventListener('resize', dock); };
  }, []);

  // Keep the FAB on-screen when the viewport resizes.
  useEffect(() => {
    const onResize = () => {
      const el = wrapRef.current;
      if (!el) return;
      const w = el.offsetWidth, h = el.offsetHeight;
      setFabPos(p => p ? {
        x: clampNum(p.x, FAB_MARGIN, window.innerWidth - w - FAB_MARGIN),
        y: clampNum(p.y, FAB_MARGIN, window.innerHeight - h - FAB_MARGIN),
      } : p);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // One rail cell. Only the active tab's icon animates.
  const renderRailTab = (t: (typeof RAIL_TABS)[number]) => {
    const active = tab === t.id;
    return (
      <button
        key={t.id}
        type="button"
        className={cn('sefirah-rail-tab', active && 'is-active')}
        onClick={() => setTab(t.id)}
        aria-label={t.label}
        aria-current={active ? 'page' : undefined}
        title={t.label}
      >
        {t.id === 'search' ? (
          <AnimatedSearch className="sefirah-rail-icon" size={18} animate={active} loop loopDelay={1400} />
        ) : t.id === 'settings' ? (
          <AnimatedSliders className="sefirah-rail-icon" size={18} animate={active} loop loopDelay={1400} />
        ) : (
          <i className={`bi ${t.icon}`} />
        )}
        <span className="sefirah-rail-tip">{t.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Floating assistant button (draggable, edge-magnetic) */}
      <div
        ref={wrapRef}
        className="sefirah-fab-wrap"
        style={fabPos ? {
          left: fabPos.x, top: fabPos.y, right: 'auto', bottom: 'auto',
          // Exact follow while auto-docking to the nav line (the strip's own
          // open/close animation drives it); glide only for the post-drag snap.
          transition: (!dragging && snap) ? 'left 0.5s cubic-bezier(0.22, 1, 0.36, 1), top 0.5s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        } : undefined}
      >
        <button
          className={cn('sefirah-fab', open && 'is-open', dragging && 'dragging', snap && `snapping-${snap}`)}
          onClick={onFabClick}
          onPointerDown={onFabPointerDown}
          onPointerMove={onFabPointerMove}
          onPointerUp={onFabPointerUp}
          onAnimationEnd={() => setSnap('')}
          aria-label="Open Sefirah assistant"
          aria-expanded={open}
        >
          <SefirahIcon className="sefirah-fab-icon" />
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={cn('sefirah-backdrop', open && 'open')}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Right sidebar panel */}
      <aside
        className={cn('sefirah-panel', open && 'open')}
        role="dialog"
        aria-modal="true"
        aria-label="Sefirah assistant"
      >
        {/* Left-edge icon-tab rail */}
        <nav className="sefirah-rail" aria-label="Sefirah sections">
          <div className="sefirah-rail-tabs" ref={railRef}>
            {/* Single indicator that slides to the measured position of the active cell */}
            <span
              className="sefirah-rail-ind"
              aria-hidden
              style={{ transform: `translateY(${indStyle.top}px)`, height: indStyle.height }}
            />
            {RAIL_TABS.filter((t) => t.group === 'top').map((t) => renderRailTab(t))}
            {/* Spacer pushes the bottom cluster (About, Settings) to the rail floor */}
            <div className="sefirah-rail-spacer" />
            {RAIL_TABS.filter((t) => t.group === 'bottom').map((t) => renderRailTab(t))}
          </div>
        </nav>

        <div className="sefirah-main">
          <div className="sefirah-panel-head">
            <div className="sefirah-panel-title">
              <SefirahIcon className="sefirah-title-icon" />
              <span>{RAIL_TABS.find((t) => t.id === tab)?.label ?? 'Sefirah'}</span>
            </div>
            <button className="sefirah-close" onClick={() => setOpen(false)} aria-label="Close Sefirah">
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="sefirah-panel-body">
            {/* Keyed wrapper: remounts on tab change so the enter animation replays */}
            <div className="sefirah-view" key={tab}>
            {tab === 'search' && (
              <>
                <h2 className="sefirah-greeting">How can I help?</h2>

                {/* Quick settings — pill row above the search */}
                <div className="sefirah-actions">
                  <button type="button" className="sefirah-action" onClick={toggleTheme}>
                    <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'}`} />
                    <span className="sefirah-action-label">
                      <span className="sefirah-action-sizer" aria-hidden>Light Theme</span>
                      <span className="sefirah-action-live">{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={cn('sefirah-action', navLocked && 'is-on')}
                    onClick={toggleNavLock}
                    aria-pressed={navLocked}
                  >
                    <i className={`bi ${navLocked ? 'bi-lock-fill' : 'bi-unlock'}`} />
                    <span className="sefirah-action-label">
                      <span className="sefirah-action-sizer" aria-hidden>Navigation locked</span>
                      <span className="sefirah-action-live">{navLocked ? 'Navigation locked' : 'Lock navigation'}</span>
                    </span>
                  </button>
                  <button type="button" className="sefirah-action" title="Coming soon">
                    <i className="bi bi-translate" />
                    <span>Language</span>
                  </button>
                </div>

                {/* Input field — doubles as the search bar */}
                <div className="sefirah-input-box">
                  <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="sefirah-textarea"
                  />
                </div>

                {/* While typing: live results (mirrors the ⌘K search).
                    When empty: suggested destinations. */}
                {value.trim() ? (
                  <div className="sefirah-results">
                    {results.length === 0 ? (
                      <div className="sefirah-empty">No results found</div>
                    ) : (
                      <>
                      <div className="sefirah-suggested-head">Results</div>
                      {results.map((item) => (
                        <button
                          key={`${item.tabId}-${item.subtabId || ''}-${item.label}`}
                          type="button"
                          className="sefirah-result"
                          onClick={() => navigate(item)}
                        >
                          <i className={`bi ${item.icon}`} />
                          <span className="sefirah-result-text">
                            <span className="sefirah-result-label">{item.label}</span>
                            {item.aka && <span className="sefirah-result-aka">{item.aka}</span>}
                          </span>
                          {item.external && <i className="bi bi-box-arrow-up-right sefirah-result-ext" />}
                        </button>
                      ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="sefirah-results sefirah-suggested">
                    <div className="sefirah-suggested-head">Suggestions</div>
                    {SUGGESTIONS.map((item) => (
                      <button
                        key={`sug-${item.tabId}-${item.subtabId || ''}-${item.label}`}
                        type="button"
                        className="sefirah-result"
                        onClick={() => navigate(item)}
                      >
                        <i className={`bi ${item.icon}`} />
                        <span className="sefirah-result-text">
                          <span className="sefirah-result-label">{item.label}</span>
                          {item.aka && <span className="sefirah-result-aka">{item.aka}</span>}
                        </span>
                        {item.external && <i className="bi bi-box-arrow-up-right sefirah-result-ext" />}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'settings' && <SettingsPanel />}

            {tab === 'about' && (
              <div className="sefirah-about">
                <SefirahIcon className="sefirah-about-icon" />
                <h2 className="sefirah-greeting">Sefirah</h2>
                <p className="sefirah-about-text">
                  Your guide across Notus Regalia. Search the site, jump between
                  sections, and tune your experience — all from one place.
                </p>
              </div>
            )}
            </div>
          </div>
        </div>
      </aside>

      <style>{SEFIRAH_CSS}</style>
    </>
  );
}

const SEFIRAH_CSS = `
/* ── Floating assistant button (bottom-right) ── */
.sefirah-fab-wrap {
  position: fixed; right: 24px; bottom: 24px; z-index: 70;
  display: inline-flex; align-items: center;
  transform-origin: center;
  animation: sefirahPopIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes sefirahPopIn {
  0%   { opacity: 0; transform: scale(0); }
  55%  { opacity: 1; transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
}
.sefirah-fab {
  position: relative; flex-shrink: 0; isolation: isolate;
  width: 58px; height: 58px; border-radius: 50%;
  cursor: grab; touch-action: none;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.16);
  background: radial-gradient(ellipse at 50% 120%, #2b2b2b 0%, #0e0e0e 68%);
  box-shadow: 0 10px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
  color: #fff;
  transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease;
}

/* ── Rainbow light wave — a localized band of light that travels around the
   border (the rest of the ring stays dark), not a uniformly lit spinning ring.
   Both layers are ring-masked, so the black button face/icon stay black. */
/* A crest of rainbow light that washes back and forth across the border like a
   wave — easing slow at the edges, quick through the middle — instead of a
   constant spin. Both layers are the SAME thin ring (concentric): ::after is the
   crisp light line, ::before is a blurred copy that disperses the light outward.
   Ring-masked, so the black face/icon stay black. */
.sefirah-fab::before,
.sefirah-fab::after {
  content: ''; position: absolute; inset: -1.5px; border-radius: 50%;
  pointer-events: none; z-index: -1;
  background: conic-gradient(from 0deg,
    transparent 110deg,
    rgba(0, 255, 166, 0.5)  145deg,
    rgba(255, 215, 0, 0.9)  165deg,
    rgba(236, 72, 153, 1)   180deg,
    rgba(147, 51, 234, 0.9) 195deg,
    rgba(59, 130, 246, 0.5) 215deg,
    transparent 250deg);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.6px), #000 calc(100% - 1.6px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 1.6px), #000 calc(100% - 1.6px));
  animation: sefirahWave 3s ease-in-out infinite alternate;
}
/* blurred copy — the light dispersing outward from the crest */
.sefirah-fab::before {
  inset: -2.5px; filter: blur(4px); opacity: 0.7;
}
.sefirah-fab:hover::before { opacity: 0.95; }
@keyframes sefirahWave {
  from { transform: rotate(-140deg); }
  to   { transform: rotate(140deg); }
}
@media (prefers-reduced-motion: reduce) {
  .sefirah-fab::before, .sefirah-fab::after { animation: none; }
}
.sefirah-fab:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 14px 34px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18); }
.sefirah-fab:active { transform: scale(0.97); }
.sefirah-fab.is-open { transform: scale(0.92); opacity: 0.85; }
.sefirah-fab.dragging { cursor: grabbing; transform: scale(1.08); box-shadow: 0 18px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2); }

/* Waterball squash-and-stretch when released and snapping to a side */
.sefirah-fab.snapping-left,
.sefirah-fab.snapping-right {
  animation: sefirahBlob 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.sefirah-fab.snapping-left  { transform-origin: left center; }
.sefirah-fab.snapping-right { transform-origin: right center; }
@keyframes sefirahBlob {
  0%   { transform: scale(1.08, 1.08); }
  30%  { transform: scale(1.26, 0.8); }   /* stretch along flight (horizontal) */
  55%  { transform: scale(0.8, 1.2); }    /* squash against the wall */
  75%  { transform: scale(1.12, 0.92); }  /* rebound */
  90%  { transform: scale(0.97, 1.04); }
  100% { transform: scale(1, 1); }
}
.sefirah-fab-icon { width: 30px; height: 30px; display: block; }

/* ── Backdrop ── */
.sefirah-backdrop {
  position: fixed; inset: 0; z-index: 79;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
}
.sefirah-backdrop.open { opacity: 1; pointer-events: auto; }

/* ── Right sidebar panel ── */
.sefirah-panel {
  /* Pin dark-theme tokens locally so the sidebar stays dark on every theme,
     light mode, and mobile. Children inherit these custom properties. */
  --surface-secondary: rgb(10, 10, 10);
  --surface-card: #0f0f0f;
  --content-primary: #ffffff;
  --content-secondary: rgba(255, 255, 255, 0.85);
  --content-muted: rgb(163, 163, 163);
  --content-faint: rgba(255, 255, 255, 0.6);
  --border-color: rgba(255, 255, 255, 0.1);
  --border-subtle: rgba(255, 255, 255, 0.05);
  --glass-inset-top: rgba(255, 255, 255, 0.1);
  --hover-bg: rgba(255, 255, 255, 0.05);
  --hover-bg-strong: rgba(255, 255, 255, 0.08);

  position: fixed; top: 0; right: 0; bottom: 0; z-index: 80;
  width: min(600px, 96vw);
  display: flex; flex-direction: row;
  background: var(--surface-secondary);
  border-left: 1px solid var(--border-color);
  box-shadow: -16px 0 48px rgba(0,0,0,0.4);
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
}
.sefirah-panel.open { transform: translateX(0); }

/* ── Left-edge icon-tab rail — styled as a vertical grid strip, mirroring the
   subtab strip in the navbar (bordered grid cells + pulsing corner indicator). ── */
.sefirah-rail {
  flex-shrink: 0; width: 76px;
  display: flex; flex-direction: column;
  background: var(--surface-secondary);
  border-right: 1px solid var(--border-color);
}
.sefirah-rail-tabs { position: relative; flex: 1; display: flex; flex-direction: column; width: 100%; }
/* Flexible gap between the top and bottom clusters */
.sefirah-rail-spacer { flex: 1; }
.sefirah-rail-tab {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  /* Every cell is the exact size of the first (search) cell — never shrinks. */
  width: 100%; height: 64px; flex: 0 0 64px; box-sizing: border-box;
  border: none; background: transparent;
  color: var(--content-muted); font-size: 1.05rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: color 0.22s ease;
  z-index: 1;
}
/* First cell of each cluster gets a top border so both clusters read as enclosed
   grids (top cluster follows the indicator span, bottom follows the spacer). */
.sefirah-rail-ind + .sefirah-rail-tab,
.sefirah-rail-spacer + .sefirah-rail-tab { border-top: 1px solid var(--border-color); }
.sefirah-rail-tab > i,
.sefirah-rail-tab > .sefirah-rail-icon { position: relative; z-index: 1; }
.sefirah-rail-tab:hover { color: var(--content-primary); }
.sefirah-rail-tab.is-active { color: var(--content-primary); }

/* Single sliding active indicator — glides vertically between cells */
.sefirah-rail-ind {
  position: absolute; top: 0; left: 0; right: 0; height: 64px;
  pointer-events: none; z-index: 0;
  background: rgba(255,255,255,0.06);
  box-shadow: inset 2px 0 0 0 var(--content-primary);
  transition: transform 0.36s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}
:root.light .sefirah-rail-ind { background: rgba(0,0,0,0.065); }
@media (prefers-reduced-motion: reduce) {
  .sefirah-rail-ind { transition: none; }
}
/* Hover tooltip */
.sefirah-rail-tip {
  position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
  padding: 4px 8px; border-radius: 7px; white-space: nowrap;
  background: var(--surface-card); border: 1px solid var(--border-color);
  color: var(--content-primary); font-size: 0.72rem; font-weight: 500;
  opacity: 0; pointer-events: none; transition: opacity 0.15s ease;
  z-index: 2;
}
.sefirah-rail-tab:hover .sefirah-rail-tip { opacity: 1; }

/* Main column to the right of the rail */
.sefirah-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

.sefirah-panel-head {
  display: flex; align-items: center; justify-content: space-between;
  height: 64px; box-sizing: border-box; flex-shrink: 0;
  padding: 0 24px 0 38px;
  /* Match the rail cell height + border so this line meets the first tab's */
  border-bottom: 1px solid var(--border-color);
}
.sefirah-panel-title { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; font-size: 1.05rem; color: var(--content-primary); }
.sefirah-title-icon { width: 24px; height: 24px; color: var(--content-primary); }
.sefirah-close {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 9px; border: none;
  background: transparent; color: var(--content-faint); cursor: pointer; font-size: 0.95rem;
  transition: color 0.15s ease, background 0.15s ease;
}
.sefirah-close:hover { color: var(--content-primary); background: var(--hover-bg); }

.sefirah-panel-body { flex: 1; overflow-y: auto; padding: 36px 38px; }
/* Keyed per-tab wrapper — carries the column layout and replays on switch */
.sefirah-view { display: flex; flex-direction: column; gap: 26px; }
.sefirah-view { animation: sefirahViewIn 0.34s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes sefirahViewIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .sefirah-view { animation: none; }
}
.sefirah-greeting { font-size: 1.4rem; font-weight: 700; text-align: center; color: var(--content-primary); margin-top: 6px; }

/* ── Input box (prompt / search) ── */
.sefirah-input-box {
  border-radius: 14px;
  background: var(--surface-card);
  border: 1px solid var(--border-color);
  box-shadow: inset 0 1px 0 var(--glass-inset-top);
  transition: border-color 0.2s ease;
}
.sefirah-input-box:focus-within { border-color: var(--content-faint); }
.sefirah-textarea {
  width: 100%; resize: none; background: transparent; border: none; outline: none;
  color: var(--content-primary); font-family: inherit; font-size: 0.9rem; line-height: 1.5;
  padding: 14px; min-height: 60px;
}
.sefirah-textarea::placeholder { color: var(--content-faint); }

/* ── Quick settings — small rounded pills, single row ── */
.sefirah-actions { display: flex; flex-wrap: nowrap; gap: 6px; justify-content: center; }

/* ── About view ── */
.sefirah-about { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 18px 6px; }
.sefirah-about-icon { width: 64px; height: 64px; color: var(--content-primary); }
.sefirah-about-text { font-size: 0.9rem; line-height: 1.6; color: var(--content-faint); max-width: 30ch; }
.sefirah-action {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 10px; border-radius: 999px;
  border: 1px solid var(--border-color); background: var(--hover-bg);
  color: var(--content-muted); font-size: 0.72rem; font-weight: 500;
  cursor: pointer; white-space: nowrap;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}
.sefirah-action:hover { color: var(--content-primary); background: var(--hover-bg-strong); border-color: var(--content-faint); }
.sefirah-action:active { transform: scale(0.96); }
.sefirah-action i { font-size: 0.8rem; }
/* Reserve width for the longest label so toggling text doesn't reflow the row. */
.sefirah-action-label { display: inline-grid; text-align: center; }
.sefirah-action-label > span { grid-area: 1 / 1; }
.sefirah-action-sizer { visibility: hidden; }
/* Active/locked state — green accent so the lock toggle reads as "on". */
.sefirah-action.is-on {
  color: #04140e; background: rgba(0,255,166,0.92);
  border-color: rgba(0,255,166,0.92);
}
.sefirah-action.is-on:hover { color: #04140e; background: rgba(0,255,166,1); border-color: rgba(0,255,166,1); }

/* ── Live search results ── */
.sefirah-results { display: flex; flex-direction: column; gap: 2px; }
.sefirah-result {
  display: flex; align-items: center; gap: 11px; width: 100%; text-align: left;
  padding: 10px 12px; border-radius: 10px; border: none; background: transparent;
  color: var(--content-faint); font-size: 0.88rem; font-weight: 500; cursor: pointer;
  transition: color 0.12s ease, background 0.12s ease;
}
.sefirah-result:hover { color: var(--content-primary); background: var(--hover-bg); }
.sefirah-result > i { font-size: 0.95rem; width: 20px; text-align: center; flex-shrink: 0; }
.sefirah-result-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.sefirah-result-aka { font-size: 0.72rem; color: var(--content-faint); opacity: 0.6; font-weight: 400; }
.sefirah-result-ext { margin-left: auto; font-size: 0.75rem; opacity: 0.55; }
.sefirah-empty { padding: 20px; text-align: center; color: var(--content-faint); font-style: italic; font-size: 0.85rem; }
.sefirah-suggested-head {
  padding: 4px 12px 8px; font-size: 0.7rem; font-weight: 600;
  letter-spacing: 0.05em; text-transform: uppercase; color: var(--content-muted);
}

@media (max-width: 640px) {
  .sefirah-fab-wrap { right: 16px; bottom: 16px; }
  .sefirah-fab { width: 52px; height: 52px; }
  .sefirah-fab-icon { width: 27px; height: 27px; }
}
`;
