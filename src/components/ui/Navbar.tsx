"use client";
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';
import { type InfoContentType } from '@/data/information-data';
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
  activeInfoContent?: InfoContentType;
  onInfoContentChange?: (content: InfoContentType) => void;
}

interface SubtabItem {
  id: string;
  label: string;
  sectionId?: string;
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
    id: 'discover',
    label: 'Discover',
    icon: 'bi-rocket-takeoff',
    subtabs: [
      { id: 'discover-overview',      label: 'Overview',      sectionId: 'section-overview' },
      { id: 'discover-thecompany',    label: 'The Company',   sectionId: 'section-TheCompany' },
      { id: 'discover-theorganization',  label: 'The Organization',  sectionId: 'section-TheOrganization' },
      { id: 'discover-strategiccapital',  label: 'Strategic Capital',  sectionId: 'section-StrategicCapital' },
    ],
  },
  {
    id: 'information',
    label: 'Information',
    icon: 'bi-pin',
    subtabs: [
      { id: 'statements',          label: 'Releases' },
      { id: 'news',                label: 'Media' },
      { id: 'investor-relations',  label: 'Investor Relations' },
      { id: 'attributions',        label: 'Attributions' },
      { id: 'licenses',            label: 'Licenses' },
      { id: 'terms',               label: 'Terms' },
      { id: 'policies',            label: 'Policies' },
      { id: 'documents',           label: 'Documents' },

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
      { id: 'technologies-disaster-response', label: 'Disaster Response' },
    ],
  },
];

// ── Shared night-mode hook ──
function useNightMode() {
  const [night, setNight] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    setNight(root.classList.contains('night'));
    const obs = new MutationObserver(() => setNight(root.classList.contains('night')));
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const toggle = useCallback(() => {
    const root = document.documentElement;
    root.classList.toggle('night');
    root.classList.toggle('light');
    setNight(prev => !prev);
  }, []);
  return { night, toggle };
}

// ── Theme toggle button ──
const ThemeToggleTabBtn = ({ isMobile }: { isMobile: boolean }) => {
  const { night, toggle } = useNightMode();
  return (
    <div
      className="tab-item-border nav-icon-btn-wrap"
      data-tooltip={night ? 'Light mode' : 'Night mode'}
    >
      <div className="tab-item">
        <button
          className="tab-label-btn"
          onClick={toggle}
          aria-label={night ? 'Switch to light mode' : 'Switch to night mode'}
          style={{ padding: '11px 13px' }}
        >
          <i className={`bi ${night ? 'bi-sun' : 'bi-moon'}`} style={{ fontSize: '0.85rem' }} />
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
  const handleClick = useCallback(() => {
    const root = document.documentElement;
    root.classList.toggle('night');
    root.classList.toggle('light');
  }, []);

  return (
    <button
      className={`nav-theme-tab${visible ? ' tab-visible' : ''}`}
      onClick={handleClick}
      aria-label="Toggle light/night mode"
    >
      <span className="sticky-theme-icon reveal-tab-icon" aria-hidden>
        <i className="bi bi-moon sticky-icon-moon" />
        <i className="bi bi-sun  sticky-icon-sun" />
      </span>
      {!isMobile && (
        <span className="sticky-theme-label">
          <span className="sticky-label-night">Night</span>
          <span className="sticky-label-light">Light</span>
        </span>
      )}
    </button>
  );
};

const NAVBAR_CSS = `
@keyframes orbitBorder {
  0%   { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}
@keyframes slimTabIn {
  from { opacity: 0; transform: translateX(8px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes stripCornerPulse {
  0%, 100% { opacity: 0.78; }
  50%      { opacity: 1; }
}

/* ── Light-mode navbar ── */
:root.light .glass-navbar {
  background: linear-gradient(to bottom, #f8fafc 0%, #eef2f6 60%);
  border-bottom: 1px solid rgba(0,0,0,0.08);
}

.glass-navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 60;
  --nav-scroll-progress: 0;
  background: linear-gradient(160deg, #0a0a0f 0%, #0d0d14 60%, #080810 100%);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  box-shadow:
    0 8px 32px var(--glass-shadow-1), 0 12px 48px var(--glass-shadow-2),
    inset 0 1px 1px var(--glass-inset-top), inset 0 -1px 1px var(--glass-inset-bottom);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease;
  will-change: transform, opacity;
}
.glass-navbar.nav-collapsed {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}
.glass-navbar::before {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px;
  background: var(--border-color); opacity: 0.95; pointer-events: none;
}
.glass-navbar::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: calc(var(--nav-scroll-progress, 0) * 100%);
  height: 1.1px;
  background: linear-gradient(90deg, rgba(0,255,166,0.72) 0%, rgba(255,215,0,0.66) 28%, rgba(236,72,153,0.62) 58%, rgba(147,51,234,0.58) 80%, rgba(59,130,246,0.52) 100%);
  box-shadow: 0 0 5px rgba(0,255,166,0.24), 0 0 7px rgba(227,27,84,0.14);
  transition: width 0.1s linear;
  pointer-events: none;
}
:root.light .glass-navbar::after { box-shadow: 0 0 4px rgba(0,255,166,0.16), 0 0 6px rgba(227,27,84,0.1); }

/* ── Logo ── */
.logo-mark {
  display: flex; align-items: center; gap: 12px; user-select: none;
  border: none; background: transparent; padding: 0; cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.34,1.18,0.64,1);
}
.logo-mark:hover { transform: scale(1.08); }
.logo-mark:active { transform: scale(1.02); }
.logo-icon {
  width: 42px; height: 42px; border-radius: 10px;
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 60%, #111 100%);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  box-shadow: 0 0 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08);
  overflow: hidden;
}
.logo-text { font-size: 1.18rem; font-weight: 800; letter-spacing: -0.03em; color: var(--content-primary); line-height: 1; }

/* ── Sticky reveal + theme tabs ── */
.nav-reveal-tab,
.nav-theme-tab {
  position: fixed; right: 0; z-index: 59;
  display: flex; align-items: center; gap: 7px;
  padding: 9px 14px 9px 12px;
  border-radius: 10px 0 0 10px;
  background: var(--glass-bg, rgba(15,15,15,0.85));
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color); border-right: none;
  color: var(--content-faint); font-size: 0.8rem; font-weight: 600;
  letter-spacing: 0.02em; cursor: pointer;
  box-shadow: -4px 4px 24px rgba(0,0,0,0.25);
  opacity: 0; pointer-events: none; transform: translateX(100%);
  transition:
    opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.38s cubic-bezier(0.34, 1.18, 0.64, 1),
    color 0.15s ease, box-shadow 0.2s ease;
}
.nav-reveal-tab { top: 16px; }
.nav-theme-tab  { top: calc(16px + 38px + 6px); }
.nav-reveal-tab, .nav-theme-tab { min-width: 118px; justify-content: flex-start; }
.nav-reveal-tab.tab-visible,
.nav-theme-tab.tab-visible  { opacity: 1; pointer-events: auto; transform: translateX(0); }
.nav-reveal-tab:hover,
.nav-theme-tab:hover { color: var(--content-primary); box-shadow: -6px 4px 28px rgba(0,0,0,0.35); }
.nav-reveal-tab:hover .reveal-tab-icon,
.nav-theme-tab:hover  .reveal-tab-icon { transform: translateX(-2px); }
.reveal-tab-icon { font-size: 0.82rem; transition: transform 0.2s cubic-bezier(0.34,1.18,0.64,1); }

.sticky-theme-icon { position: relative; display: inline-flex; width: 0.9rem; height: 0.9rem; font-size: 0.9rem; flex-shrink: 0; }
.sticky-icon-moon, .sticky-icon-sun { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; transition: opacity 0.18s ease; }
.sticky-icon-moon { opacity: 1; }
.sticky-icon-sun  { opacity: 0; }
:root.night .sticky-icon-moon { opacity: 0; }
:root.night .sticky-icon-sun  { opacity: 1; }
.sticky-theme-label { position: relative; display: inline-block; min-width: 2.6rem; }
.sticky-label-night, .sticky-label-light { transition: opacity 0.18s ease; }
.sticky-label-night { opacity: 1; position: relative; }
.sticky-label-light { opacity: 0; position: absolute; left: 0; top: 0; pointer-events: none; }
:root.night .sticky-label-night { opacity: 0; pointer-events: none; }
:root.night .sticky-label-light { opacity: 1; pointer-events: auto; }
.nav-reveal-tab::before,
.nav-theme-tab::before {
  content: ''; position: absolute; left: 0; top: 4px; bottom: 4px; width: 2.5px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(220,20,60,1) 0%, rgba(200,15,50,0.9) 50%, rgba(180,10,40,0.75) 100%);
  opacity: 0.9; box-shadow: 0 0 6px rgba(220,20,60,0.6);
}

/* ── Tooltip (bottom) ── */
.nav-icon-btn-wrap { position: relative; }
.nav-icon-btn-wrap::after {
  content: attr(data-tooltip);
  position: absolute; top: calc(100% + 8px); left: 50%;
  transform: translateX(-50%) translateY(-4px);
  background: rgba(20,20,28,0.96); color: rgba(255,255,255,0.88);
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.03em; white-space: nowrap;
  padding: 5px 9px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4); pointer-events: none; opacity: 0;
  transition: opacity 0.18s ease, transform 0.18s ease; z-index: 100;
}
.nav-icon-btn-wrap:hover::after { opacity: 1; transform: translateX(-50%) translateY(0); }
:root.light .nav-icon-btn-wrap::after {
  background: rgba(255,255,255,0.97); color: rgba(0,0,0,0.8);
  border-color: rgba(0,0,0,0.12); box-shadow: 0 4px 16px rgba(0,0,0,0.14);
}

/* ── Layout ── */
.nav-divider {
  width: 1px;
  background: linear-gradient(to bottom, transparent, var(--border-color), transparent);
  margin: 0 4px; flex-shrink: 0;
}
.nav-center { position: relative; flex: 1; min-width: 0; display: flex; align-items: center; overflow: visible; }
.tabs-row { display: flex; align-items: center; gap: 12px; width: 100%; pointer-events: auto; }
.nav-right-controls {
  display: flex; align-items: center; gap: 8px;
  flex-shrink: 0; margin-left: auto; position: relative; z-index: 20;
}

/* ── Tab pill ── */
.tab-item-border {
  display: inline-flex; flex-shrink: 0;
  border-radius: 10.5px; padding: 1.5px; position: relative; background: transparent;
}
.tab-item-border::before {
  content: ''; position: absolute; inset: 0; border-radius: 10.5px;
  padding: 1.5px;
  background: linear-gradient(90deg,
    rgba(0,255,166,0.0) 0%, rgba(0,255,166,0.7) 15%,
    rgba(255,215,0,0.6) 30%, rgba(236,72,153,0.6) 45%,
    rgba(147,51,234,0.6) 60%, rgba(59,130,246,0.55) 75%,
    rgba(0,255,166,0.0) 90%);
  background-size: 200% 100%;
  animation: orbitBorder 3s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
}
.tab-item-border:hover::before,
.tab-item-border.is-active::before { opacity: 1; }

.tab-item {
  display: inline-flex; align-items: stretch; border-radius: 9.5px; overflow: hidden;
  box-shadow: inset 0 1px 0 var(--glass-inset-top); transition: box-shadow 0.2s ease;
  flex-shrink: 0; background: var(--navbar-bg, #0f0f0f); position: relative; width: 100%; z-index: 1;
}
.tab-item-border:hover .tab-item { box-shadow: 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 var(--glass-inset-top); }
.tab-item.is-active { background: var(--navbar-bg-active, #1a1a1a); }

:root.light .tab-item {
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1);
  outline: 1px solid rgba(0,0,0,0.11);
}
:root.light .tab-item.is-active {
  background: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0,0,0,0.13), 0 5px 20px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.8);
  outline: 1px solid rgba(0,0,0,0.15);
}
:root.light .tab-item-border:hover .tab-item {
  box-shadow: 0 4px 12px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,1);
  outline: 1px solid rgba(0,0,0,0.15);
}

.tab-label-btn {
  display: inline-flex; align-items: center; gap: 7px; border: none; background: transparent;
  cursor: pointer; font-weight: 500; letter-spacing: 0.01em; color: var(--content-faint);
  padding: 11px 14px 11px 20px; font-size: 0.97rem; line-height: 1;
  transition: color 0.15s ease; user-select: none;
}
.tab-label-btn:hover, .tab-label-btn.is-active { color: var(--content-primary); }
.tab-label-btn.is-active { font-weight: 600; }

.tab-sep { width: 1px; margin: 6px 0; background: var(--border-color); opacity: 0.45; flex-shrink: 0; pointer-events: none; }

/* ── Arrow down button on each tab pill ── */
.tab-arrow-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; border: none; background: transparent; cursor: pointer;
  color: var(--content-faint); transition: color 0.15s ease, background 0.15s ease;
  flex-shrink: 0; padding: 0; border-radius: 0 8px 8px 0;
}
.tab-arrow-btn:hover { color: var(--content-primary); background: rgba(255,255,255,0.08); }
.tab-arrow-btn .arrow-icon {
  font-size: 0.62rem;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease;
}
.tab-arrow-btn.arrow-open .arrow-icon { transform: rotate(180deg); }
.tab-arrow-btn.arrow-open { color: var(--content-primary); background: rgba(255,255,255,0.06); }

/* ── Main tab row: text-only modern tabs (keeps arrow) ── */
.tabs-row > .tab-item-border {
  border-radius: 0;
  padding: 0;
  background: transparent;
}
.tabs-row > .tab-item-border::before {
  inset: auto 4px -6px;
  height: 1px;
  border-radius: 999px;
  padding: 0;
  animation: none;
  -webkit-mask: none;
  mask: none;
  -webkit-mask-composite: initial;
  mask-composite: initial;
  background: linear-gradient(90deg, rgba(0,255,166,0.95) 0%, rgba(255,215,0,0.85) 45%, rgba(236,72,153,0.9) 100%);
  opacity: 0;
  transform: scaleX(0.65);
  transform-origin: left;
  transition: opacity 0.2s ease, transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.tabs-row > .tab-item-border:hover::before,
.tabs-row > .tab-item-border.is-active::before {
  opacity: 1;
  transform: scaleX(1);
}
.tabs-row > .tab-item-border > .tab-item {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  overflow: visible;
}
.tabs-row > .tab-item-border:hover > .tab-item,
.tabs-row > .tab-item-border > .tab-item.is-active {
  background: transparent;
  box-shadow: none;
}
:root.light .tabs-row > .tab-item-border > .tab-item,
:root.light .tabs-row > .tab-item-border > .tab-item.is-active,
:root.light .tabs-row > .tab-item-border:hover > .tab-item {
  background: transparent;
  box-shadow: none;
  outline: none;
}
.tabs-row .tab-label-btn {
  padding: 9px 4px;
  font-size: 0.97rem;
  letter-spacing: 0.01em;
  font-weight: 500;
  line-height: 1;
  transition: color 0.2s ease;
}
.tabs-row .tab-label-btn.is-active {
  font-weight: 500;
}
.tabs-row .tab-sep {
  display: none;
}
.tabs-row .tab-arrow-btn {
  width: auto;
  padding: 9px 3px 9px 0;
  border-radius: 0;
  background: transparent;
}
.tabs-row .tab-arrow-btn .arrow-icon {
  font-size: 0.64rem;
}
.tabs-row .tab-arrow-btn:hover {
  color: var(--content-primary);
  background: transparent;
  transform: translateY(-1px);
}
.tabs-row .tab-arrow-btn.arrow-open {
  color: var(--content-primary);
  background: transparent;
}

/* ── Subtab strip — below main bar row, per-tab ── */
.subtab-strip-outer {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  pointer-events: none;
  border-top: 1px solid transparent;
  transition:
    grid-template-rows 0.44s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    border-top-color 0.3s ease;
  will-change: grid-template-rows, opacity;
}
.subtab-strip-outer.strip-visible {
  grid-template-rows: 1fr;
  opacity: 1;
  border-top-color: var(--border-color);
  pointer-events: auto;
}
.subtab-strip-clip { overflow: hidden; min-height: 0; }
.subtab-strip-inner {
  display: flex;
  align-items: stretch;
  height: 50px;
  overflow: hidden;
  transform: translateY(-6px);
  opacity: 0;
  transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1) 0.06s,
             opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1) 0.06s;
}
.subtab-strip-outer.strip-visible .subtab-strip-inner {
  transform: translateY(0);
  opacity: 1;
}

/* ── Tab buttons track (relative container for the sliding indicator) ── */
.strip-tabs-track {
  position: relative;
  display: flex;
  align-items: stretch;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.strip-tabs-track::-webkit-scrollbar { display: none; }

/* ── Individual subtab button in the strip ── */
.strip-tab {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 22px;
  border: none; background: transparent;
  color: var(--content-muted); font-size: 0.88rem; font-weight: 500;
  cursor: pointer; flex-shrink: 0; white-space: nowrap;
  transition: color 0.22s ease;
  border-right: 1px solid var(--border-color);
  letter-spacing: 0.01em;
  z-index: 1;
}
.strip-tab:hover { color: var(--content-primary); }
.strip-tab.strip-tab-active { color: var(--content-primary); font-weight: 600; }

/* ── Sliding active indicator (pill bg + underline) ──
   Lives absolutely inside .strip-tabs-track so it slides
   across the full track width as left/width are updated.  */
.strip-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  /* left + width set via inline style from JS */
  transition: left 0.32s cubic-bezier(0.4, 0, 0.2, 1),
              width 0.32s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.18s ease;
}
.strip-indicator-bg {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.06);
  transition: background 0.2s ease;
}
:root.light .strip-indicator-bg { background: rgba(0,0,0,0.065); }
.strip-indicator-line {
  display: none;
}
.strip-indicator-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border-color: rgba(227,27,84,0.88);
  pointer-events: none;
  animation: stripCornerPulse 2s ease-in-out infinite;
}
.strip-indicator-corner.tl { top: 3px; left: 3px; border-top: 1.5px solid currentColor; border-left: 1.5px solid currentColor; }
.strip-indicator-corner.tr { top: 3px; right: 3px; border-top: 1.5px solid currentColor; border-right: 1.5px solid currentColor; }
.strip-indicator-corner.bl { bottom: 3px; left: 3px; border-bottom: 1.5px solid currentColor; border-left: 1.5px solid currentColor; }
.strip-indicator-corner.br { bottom: 3px; right: 3px; border-bottom: 1.5px solid currentColor; border-right: 1.5px solid currentColor; }
@media (max-width: 640px) {
  .strip-indicator-corner { width: 7px; height: 7px; }
}

/* Staggered entrance animation for strip tabs — only on initial open */
.subtab-strip-outer.strip-entering .strip-tab {
  animation: slimTabIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--si, 0) * 0.045s + 0.06s);
}

/* ── Crossfade layers inside the discover strip when toggling detail/subtabs ── */
.strip-crossfade-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: stretch;
  transition: opacity 0.28s ease;
  pointer-events: none;
}
.strip-crossfade-layer.strip-layer-visible {
  opacity: 1;
  pointer-events: auto;
}
.strip-crossfade-layer.strip-layer-hidden {
  opacity: 0;
  pointer-events: none;
}

/* ── Collapse chevron at the far right of strip ── */
.strip-collapse {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 20px;
  border: none; background: transparent;
  color: var(--content-muted); cursor: pointer; flex-shrink: 0;
  transition: color 0.14s ease, background 0.14s ease;
  border-left: 1px solid var(--border-color);
  margin-left: auto;
}
.strip-collapse:hover { color: var(--content-primary); background: rgba(255,255,255,0.03); }
.strip-collapse i { font-size: 0.7rem; transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1); }
.strip-collapse:hover i { transform: translateY(-2px); }

/* ── Search shortcut badge ── */
.search-shortcut {
  display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 5px;
  font-size: 0.72rem; font-weight: 600; color: var(--content-faint);
  background: var(--hover-bg); border: 1px solid var(--border-color);
  opacity: 0.7; letter-spacing: 0.03em; margin-left: 2px;
}

/* ── Spring press keyframe ── */
@keyframes tabPress {
  0%   { transform: scale(1); }
  15%  { transform: scale(0.96); }
  50%  { transform: scale(1.02); }
  72%  { transform: scale(0.992); }
  88%  { transform: scale(1.004); }
  100% { transform: scale(1); }
}
.tab-pressed {
  animation: tabPress 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
  transform-origin: center !important;
}
.tab-item-border,
.tab-label-btn,
.tab-arrow-btn,
.strip-tab,
.strip-collapse,
.logo-mark,
.mob-tab-btn,
.mob-subtab-btn,
.mob-close,
.mob-search,
.nav-reveal-tab,
.nav-theme-tab,
.mobile-burger { transform-origin: center; }

.tab-item-border:active { animation: tabPress 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.tab-label-btn:active   { animation: tabPress 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.tab-arrow-btn:active   { animation: tabPress 0.72s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.strip-tab:active       { animation: tabPress 0.72s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.strip-collapse:active  { animation: tabPress 0.68s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.logo-mark:active       { animation: tabPress 0.8s  cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.mobile-burger:active   { animation: tabPress 0.68s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.mob-tab-btn:active,
.mob-subtab-btn:active  { animation: tabPress 0.7s  cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.mob-close:active       { animation: tabPress 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.mob-search:active      { animation: tabPress 0.7s  cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.nav-reveal-tab:active,
.nav-theme-tab:active   { animation: tabPress 0.72s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

/* ── Mobile ── */
@media (max-width: 640px) {
  .nav-center, .nav-divider.desktop-only { display: none; }
  .tab-sep, .tab-arrow-btn { display: none; }
  .tab-label-btn { padding: 6px 11px; font-size: 0.84rem; }
  .collapse-btn-desktop { display: none !important; }
  .nav-reveal-tab { top: 12px; padding: 7px 11px 7px 10px; font-size: 0.74rem; }
  .nav-theme-tab  { top: calc(12px + 34px + 5px); padding: 7px 11px 7px 10px; font-size: 0.74rem; }
  .nav-icon-btn-wrap::after { display: none; }
  .strip-tab { padding: 0 14px; font-size: 0.82rem; }
  .strip-collapse { padding: 0 14px; }
  .strip-collapse:hover i { transform: translateX(2px); }
}

.mobile-burger {
  display: none; align-items: center; justify-content: center;
  width: 42px; height: 42px; border-radius: 10px;
  border: none; background: transparent; color: var(--content-faint);
  font-size: 1.2rem; cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
  flex-shrink: 0; margin-left: auto;
}
.mobile-burger:hover { color: var(--content-primary); background: var(--hover-bg); }
@media (max-width: 640px) { .mobile-burger { display: inline-flex; } }

/* ── Mobile sidebar ── */
.mob-overlay {
  position: fixed; inset: 0; z-index: 90;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  opacity: 0; pointer-events: none; transition: opacity 0.25s ease;
}
.mob-overlay.open { opacity: 1; pointer-events: auto; }
.mob-sidebar {
  position: fixed; top: 0; right: 0; bottom: 0; width: min(320px, 85vw); z-index: 91;
  background: var(--surface-secondary); border-left: 1px solid var(--border-color);
  box-shadow: -8px 0 32px rgba(0,0,0,0.3); display: flex; flex-direction: column;
  transform: translateX(100%); transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto; -webkit-overflow-scrolling: touch;
}
.mob-sidebar.open { transform: translateX(0); }
.mob-header { display: flex; align-items: center; gap: 12px; padding: 18px 20px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
.mob-header-title { font-size: 1rem; font-weight: 700; color: var(--content-primary); letter-spacing: -0.01em; }
.mob-close { margin-left: auto; display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; border: none; background: transparent; color: var(--content-faint); font-size: 0.9rem; cursor: pointer; transition: color 0.12s ease, background 0.12s ease; }
.mob-close:hover { color: var(--content-primary); background: var(--hover-bg-strong); }
.mob-search { display: flex; align-items: center; gap: 10px; margin: 12px 16px; padding: 11px 14px; border-radius: 10px; background: var(--hover-bg); border: 1px solid var(--border-color); cursor: pointer; transition: background 0.12s ease; flex-shrink: 0; }
.mob-search:hover { background: var(--hover-bg-strong); }
.mob-search i { color: var(--content-faint); font-size: 0.93rem; }
.mob-search span { color: var(--content-faint); font-size: 0.93rem; font-weight: 500; }
.mob-nav-list { display: flex; flex-direction: column; padding: 8px 0; flex: 1; }
.mob-tab-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 15px 20px; border: none; background: transparent; color: var(--content-faint); font-size: 1rem; font-weight: 500; cursor: pointer; transition: color 0.12s ease, background 0.12s ease; user-select: none; }
.mob-tab-btn:hover { color: var(--content-primary); background: var(--hover-bg); }
.mob-tab-btn.is-active { color: var(--content-primary); font-weight: 600; background: var(--hover-bg-strong); }
.mob-tab-left { display: flex; align-items: center; gap: 10px; }
.mob-tab-left i { font-size: 0.92rem; width: 20px; text-align: center; }
.mob-tab-chevron { font-size: 0.65rem; transition: transform 0.2s ease; color: var(--content-faint); }
.mob-tab-chevron.open { transform: rotate(90deg); }
.mob-subtabs { overflow: hidden; transition: max-height 0.25s ease, opacity 0.2s ease; }
.mob-subtabs.collapsed { max-height: 0; opacity: 0; }
.mob-subtabs.expanded { max-height: 400px; opacity: 1; }
.mob-subtab-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 20px 12px 50px; border: none; background: transparent; color: var(--content-faint); font-size: 0.93rem; font-weight: 400; cursor: pointer; transition: color 0.12s ease, background 0.12s ease; user-select: none; }
.mob-subtab-btn:hover { color: var(--content-primary); background: var(--hover-bg); }
.mob-subtab-btn.is-active { color: var(--content-primary); font-weight: 600; position: relative; }
.mob-subtab-btn.is-active::before { content: ''; position: absolute; left: 36px; top: 50%; transform: translateY(-50%); width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.8); }
`;

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
//  DiscoverStripContent — subtab buttons + indicator for use
//  inside the crossfade discover strip (no outer wrapper)
// ─────────────────────────────────────────────────────────────
const DISCOVER_SUBTABS = NAV_ITEMS.find(i => i.id === 'discover')!.subtabs!;

interface DiscoverStripContentProps {
  activeSubtabId: string | null;
  onSubtabClick: (sub: SubtabItem) => void;
  onCollapse: () => void;
  isMobile?: boolean;
}

const DiscoverStripContent = memo(({
  activeSubtabId, onSubtabClick, onCollapse, isMobile,
}: DiscoverStripContentProps) => {
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
    const idx = DISCOVER_SUBTABS.findIndex(s => s.id === activeSubtabId);
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
        {DISCOVER_SUBTABS.map((sub, idx) => (
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
        aria-label={isMobile ? 'Scroll Discover sections' : 'Hide Discover sections'}
      >
        <i className={`bi ${arrowIcon}`} />
      </button>
    </>
  );
});
DiscoverStripContent.displayName = 'DiscoverStripContent';

// ─────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────
const Navbar = ({
  activeTab,
  setActiveTab,
  activeSubtab,
  onSubtabClick,
  activeInfoContent,
  onInfoContentChange,
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
  const [discoverDetailOpen, setDiscoverDetailOpen] = useState(false);

  // ── Listen for discover detail page events ──
  useEffect(() => {
    const handler = (e: Event) => {
      const open = (e as CustomEvent).detail?.open ?? false;
      setDiscoverDetailOpen(open);

      // Returning from a detail page → reset strip to "Overview"
      if (!open) {
        setScrollSpySubtab('discover-overview');
        onSubtabClick?.('discover', 'discover-overview');
      }
    };
    window.addEventListener('discover-detail', handler);
    return () => window.removeEventListener('discover-detail', handler);
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

  // Scroll-spy — use ScrollTrigger's scroll position for reliability with ScrollSmoother
  useEffect(() => {
    const item = NAV_ITEMS.find(i => i.id === activeTab);
    if (!item?.subtabs?.length) return;

    const sectionSubtabs = item.subtabs.filter(s => s.sectionId);
    if (!sectionSubtabs.length) return;

    const computeActive = () => {
      const nav = document.querySelector('.glass-navbar') as HTMLElement | null;
      const navH = nav?.offsetHeight ?? 80;
      const scrollY = window.scrollY + navH + 40;
      let active = sectionSubtabs[0].id;
      for (const sub of sectionSubtabs) {
        const el = document.getElementById(sub.sectionId!);
        if (el && el.getBoundingClientRect().top + window.scrollY <= scrollY) {
          active = sub.id;
        }
      }
      return active;
    };

    const onScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      setScrollSpySubtab(computeActive());
    };

    setScrollSpySubtab(computeActive());
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
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

  // ── Info tab subtab click — sub.id is the InfoContentType value directly ──
  const handleInfoSubtabClick = useCallback((sub: SubtabItem) => {
    setNavProgress(0);
    onInfoContentChange?.(sub.id as InfoContentType);
    gsapScrollToTop(false);
    syncNavProgressFor(450);
  }, [onInfoContentChange, setNavProgress, syncNavProgressFor]);

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

  const handleSearchNavigate = useCallback((tabId: string, subtabId?: string, infoContent?: string) => {
    setActiveTab(tabId);
    if (subtabId) onSubtabClick?.(tabId, subtabId);
    if (infoContent) onInfoContentChange?.(infoContent as import('@/data/information-data').InfoContentType);
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
  }, [setActiveTab, onSubtabClick, onInfoContentChange, setNavProgress, syncNavProgressFor]);

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

  const handleMobileInfoSubtabClick = useCallback((sub: SubtabItem) => {
    setActiveTab('information');
    setNavProgress(0);
    onInfoContentChange?.(sub.id as InfoContentType);
    setMobileOpen(false); setMobileExpandedTab(null);
    gsapScrollToTop(false);
    syncNavProgressFor(450);
  }, [setActiveTab, onInfoContentChange, setNavProgress, syncNavProgressFor]);

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
        {/* Discover tab: single strip with crossfading inner layers */}
        <div className={`subtab-strip-outer${activeTab === 'discover' && stripOpen ? ' strip-visible' : ''}`}>
          <div className="subtab-strip-clip">
            <div className="subtab-strip-inner" style={{ position: 'relative' }}>
                {/* Layer 1: "Return to Previous Page" — visible when detail open */}
                <div className={`strip-crossfade-layer ${discoverDetailOpen ? 'strip-layer-visible' : 'strip-layer-hidden'}`}>
                  <div className="strip-tabs-track">
                    <button
                      className="strip-tab strip-tab-active"
                      onClick={() => window.dispatchEvent(new CustomEvent('discover-detail-back'))}
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
                <div className={`strip-crossfade-layer ${!discoverDetailOpen ? 'strip-layer-visible' : 'strip-layer-hidden'}`}>
                  <DiscoverStripContent
                    activeSubtabId={(activeSubtab ?? scrollSpySubtab) ?? null}
                    onSubtabClick={(sub) => handleSubtabClick('discover', sub)}
                    onCollapse={() => { manualOpenRef.current = false; setStripOpen(false); }}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            </div>
          </div>
        {/* Other tabs: normal StripRow strips */}
        {NAV_ITEMS.filter(item => item.subtabs?.length && item.id !== 'discover').map((item) => {
          const isActiveItem   = item.id === activeTab;
          const isVisible      = isActiveItem && stripOpen;
          const isInfoTab      = item.id === 'information';
          const activeSubtabId = isInfoTab
            ? (activeInfoContent as string | undefined)
            : (isActiveItem ? (activeSubtab ?? scrollSpySubtab) : undefined);

          return (
            <StripRow
              key={`strip-${item.id}`}
              item={item}
              isVisible={isVisible}
              activeSubtabId={activeSubtabId ?? null}
              onSubtabClick={(sub) => isInfoTab ? handleInfoSubtabClick(sub) : handleSubtabClick(item.id, sub)}
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
            const isInfoTab     = item.id === 'information';
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
                      className={`mob-subtab-btn${active && !activeSubtab && !(isInfoTab && activeInfoContent) ? ' is-active' : ''}`}
                      onClick={() => handleMobileTabClick(item.id)}
                    >
                      All {item.label}
                    </button>
                    {item.subtabs!.map(sub => {
                      const isSubActive = isInfoTab
                        ? activeInfoContent === sub.id
                        : activeSubtab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          className={`mob-subtab-btn${isSubActive ? ' is-active' : ''}`}
                          onClick={() => isInfoTab ? handleMobileInfoSubtabClick(sub) : handleMobileSubtabClick(item.id, sub)}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
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
