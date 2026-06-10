export const NAVBAR_CSS = `
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

/* ── Custom cursor for interactive elements ── */
button, a, [role="button"],
.strip-tab, .tab-label-btn, .mob-tab-btn, .mob-subtab-btn,
.logo-mark, [data-clickable="true"],
input[type="checkbox"], input[type="radio"], select,
[onclick], .clickable {
  cursor: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA0VjI0TDEwIDE4TDE4IDI2TDIxIDI0TDEzIDEyTDIwIDEyTDQgNFoiIGZpbGw9IiNFMzFCNTQiLz48L3N2Zz4=') 4 2, auto;
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
  transition: transform 0.15s ease-in-out;
}
.logo-mark:hover { transform: scale(1.03); }
.logo-mark:active { transform: scale(0.98); }
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
  white-space: nowrap; flex-shrink: 0;
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
  font-size: 0.97rem !important;
  letter-spacing: 0.01em;
  font-weight: 500;
  line-height: 1;
  transition: color 0.2s ease;
  min-width: max-content;
  width: auto;
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

/* Enclose the external item (Information Center) like a grid cell. */
.strip-tab-external {
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
}

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

/* ── Crossfade layers inside the company strip when toggling detail/subtabs ── */
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
