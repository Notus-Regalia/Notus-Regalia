"use client";
import { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/cn';
import { type SectionItem, searchSections } from '@/data/search-index';

// Rotating hints typed out in the placeholder while the field is empty.
const SEARCH_HINTS = ['founders', 'executives', 'investor relations', 'careers', 'privacy policy', 'technologies', 'releases'];

// Draggable FAB: edge margin + clamp helper.
const FAB_MARGIN = 24;
const clampNum = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Curated quick-access suggestions shown when the field is empty.
const SUGGESTIONS: SectionItem[] = [
  { label: 'Home',                tabId: 'home',                                                        icon: 'bi-house',            aka: 'Main website & page',          keywords: [] },
  { label: 'Releases',            tabId: 'information', external: '/information/newsroom/releases',      icon: 'bi-journal-richtext', aka: 'Publications & research',      keywords: [] },
  { label: 'Founders',            tabId: 'company',     subtabId: 'company-executives',                  icon: 'bi-people',           aka: 'Leadership & team',            keywords: [] },
  { label: 'Mission',             tabId: 'company',     subtabId: 'company-thecompany',                  icon: 'bi-flag',             aka: 'Who we are',                   keywords: [] },
  { label: 'Corporate Policies',  tabId: 'information', external: '/information/legals/policies',        icon: 'bi-journal-check',    aka: 'Conduct & compliance',         keywords: [] },
  { label: 'Technologies',        tabId: 'technologies',                                                 icon: 'bi-crosshair',        aka: 'Our ventures & sectors',       keywords: [] },
  { label: 'Information Central', tabId: 'information', external: '/information',                        icon: 'bi-box-arrow-up-right', aka: 'Newsroom, investors, legals', keywords: [] },
];

// ── Animated "Seraph" goo loader (Uiverse by Nawsome), themeable via currentColor ──
const SeraphIcon = ({ className }: { className?: string }) => {
  const goo = `seraph-goo-${useId().replace(/:/g, '')}`;
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

export default function SeraphAssistant() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [placeholder, setPlaceholder] = useState('Search');
  const [bubbleIdx, setBubbleIdx] = useState(0);
  const [bubbleShown, setBubbleShown] = useState(false);
  const [bubblesOff, setBubblesOff] = useState(false); // silenced after first interaction

  // Rotating greeting bubbles (time-aware first message).
  const bubbles = useMemo(() => {
    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    return [greeting, "I am Seraph. What's yours?", 'How can I help?', 'What are you looking for?', 'Need a hand?'];
  }, []);

  // Draggable FAB with magnetic edge-snap.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fabPos, setFabPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [snap, setSnap] = useState<'' | 'left' | 'right'>(''); // jelly squash on release
  const drag = useRef({ active: false, moved: false, ox: 0, oy: 0, sx: 0, sy: 0 });
  const suppressClick = useRef(false);
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

  // Cycle the greeting bubble one message at a time. Paused while the panel is
  // open, and silenced for the rest of the session once Seraph is opened.
  useEffect(() => {
    if (open || bubblesOff) { setBubbleShown(false); return; }
    let hideT: ReturnType<typeof setTimeout>;
    let nextT: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setBubbleShown(true);
      hideT = setTimeout(() => {
        setBubbleShown(false);
        // Pause gap between messages (after the fade-out completes).
        nextT = setTimeout(() => {
          setBubbleIdx(i => (i + 1) % bubbles.length);
          cycle();
        }, 1100);
      }, 3800);
    };
    const startT = setTimeout(cycle, 1400);
    return () => { clearTimeout(startT); clearTimeout(hideT); clearTimeout(nextT); };
  }, [open, bubblesOff, bubbles.length]);

  // Live site search — same index/scoring as the ⌘K search bar.
  const results = useMemo(() => searchSections(value), [value]);

  const navigate = useCallback((item: SectionItem) => {
    if (item.external) {
      window.open(item.external, '_blank', 'noopener,noreferrer');
    } else {
      window.dispatchEvent(new CustomEvent('seraph-navigate', {
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

  const lockNavigation = useCallback(() => {
    window.dispatchEvent(new CustomEvent('nav-collapse'));
    setOpen(false);
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
      setBubblesOff(true);
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
    setBubblesOff(true);
    setOpen(o => !o);
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

  return (
    <>
      {/* Floating assistant button + greeting bubble (draggable, edge-magnetic) */}
      <div
        ref={wrapRef}
        className="seraph-fab-wrap"
        style={fabPos ? {
          left: fabPos.x, top: fabPos.y, right: 'auto', bottom: 'auto',
          transition: dragging ? 'none' : 'left 0.5s cubic-bezier(0.22, 1, 0.36, 1), top 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        } : undefined}
      >
        <button
          type="button"
          className={cn('seraph-bubble', bubbleShown && !open && 'show')}
          onClick={() => { setBubblesOff(true); setOpen(true); }}
          tabIndex={-1}
          aria-hidden
        >
          {bubbles[bubbleIdx]}
        </button>
        <button
          className={cn('seraph-fab', open && 'is-open', dragging && 'dragging', snap && `snapping-${snap}`)}
          onClick={onFabClick}
          onPointerDown={onFabPointerDown}
          onPointerMove={onFabPointerMove}
          onPointerUp={onFabPointerUp}
          onAnimationEnd={() => setSnap('')}
          aria-label="Open Seraph assistant"
          aria-expanded={open}
        >
          <SeraphIcon className="seraph-fab-icon" />
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={cn('seraph-backdrop', open && 'open')}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Right sidebar panel */}
      <aside
        className={cn('seraph-panel', open && 'open')}
        role="dialog"
        aria-modal="true"
        aria-label="Seraph assistant"
      >
        <div className="seraph-panel-head">
          <div className="seraph-panel-title">
            <SeraphIcon className="seraph-title-icon" />
            <span>Seraph</span>
          </div>
          <button className="seraph-close" onClick={() => setOpen(false)} aria-label="Close Seraph">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="seraph-panel-body">
          <h2 className="seraph-greeting">How can I help?</h2>

          {/* Quick settings — pill row above the search */}
          <div className="seraph-actions">
            <button type="button" className="seraph-action" onClick={toggleTheme}>
              <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'}`} />
              <span>Switch theme</span>
            </button>
            <button type="button" className="seraph-action" onClick={lockNavigation}>
              <i className="bi bi-lock" />
              <span>Lock navigation</span>
            </button>
            <button type="button" className="seraph-action" title="Coming soon">
              <i className="bi bi-translate" />
              <span>Language</span>
            </button>
          </div>

          {/* Input field — doubles as the search bar */}
          <div className="seraph-input-box">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="seraph-textarea"
            />
          </div>

          {/* While typing: live results (mirrors the ⌘K search).
              When empty: suggested destinations. */}
          {value.trim() ? (
            <div className="seraph-results">
              {results.length === 0 ? (
                <div className="seraph-empty">No results found</div>
              ) : (
                <>
                <div className="seraph-suggested-head">Results</div>
                {results.map((item) => (
                  <button
                    key={`${item.tabId}-${item.subtabId || ''}-${item.label}`}
                    type="button"
                    className="seraph-result"
                    onClick={() => navigate(item)}
                  >
                    <i className={`bi ${item.icon}`} />
                    <span className="seraph-result-text">
                      <span className="seraph-result-label">{item.label}</span>
                      {item.aka && <span className="seraph-result-aka">{item.aka}</span>}
                    </span>
                    {item.external && <i className="bi bi-box-arrow-up-right seraph-result-ext" />}
                  </button>
                ))}
                </>
              )}
            </div>
          ) : (
            <div className="seraph-results seraph-suggested">
              <div className="seraph-suggested-head">Suggestions</div>
              {SUGGESTIONS.map((item) => (
                <button
                  key={`sug-${item.tabId}-${item.subtabId || ''}-${item.label}`}
                  type="button"
                  className="seraph-result"
                  onClick={() => navigate(item)}
                >
                  <i className={`bi ${item.icon}`} />
                  <span className="seraph-result-text">
                    <span className="seraph-result-label">{item.label}</span>
                    {item.aka && <span className="seraph-result-aka">{item.aka}</span>}
                  </span>
                  {item.external && <i className="bi bi-box-arrow-up-right seraph-result-ext" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <style>{SERAPH_CSS}</style>
    </>
  );
}

const SERAPH_CSS = `
/* ── Floating assistant button + greeting bubble (bottom-right) ── */
.seraph-fab-wrap {
  position: fixed; right: 24px; bottom: 24px; z-index: 70;
  display: inline-flex; align-items: center;
  transform-origin: center;
  animation: seraphPopIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes seraphPopIn {
  0%   { opacity: 0; transform: scale(0); }
  55%  { opacity: 1; transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
}
.seraph-bubble {
  position: absolute; right: calc(100% + 12px); top: 50%;
  max-width: 220px; white-space: nowrap;
  padding: 9px 14px; border-radius: 16px 16px 4px 16px;
  /* Always dark, regardless of theme (matches the FAB). */
  background: rgba(20, 20, 22, 0.96);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92); font-family: inherit; font-size: 0.82rem; font-weight: 500; line-height: 1;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  opacity: 0; transform: translateY(-50%) translateX(10px) scale(0.94); transform-origin: right center;
  pointer-events: none;
  transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.seraph-bubble::after {
  content: ''; position: absolute; right: -5px; top: 50%;
  width: 11px; height: 11px; background: rgba(20, 20, 22, 0.96);
  border-right: 1px solid rgba(255, 255, 255, 0.12); border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  transform: translateY(-50%) rotate(-45deg);
}
.seraph-bubble.show { opacity: 1; transform: translateY(-50%) translateX(0) scale(1); pointer-events: auto; }
.seraph-fab {
  position: relative; flex-shrink: 0;
  width: 58px; height: 58px; border-radius: 50%;
  cursor: grab; touch-action: none;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.16);
  background: radial-gradient(ellipse at 50% 120%, #2b2b2b 0%, #0e0e0e 68%);
  box-shadow: 0 10px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
  color: #fff;
  transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease;
}
.seraph-fab:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 14px 34px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18); }
.seraph-fab:active { transform: scale(0.97); }
.seraph-fab.is-open { transform: scale(0.92); opacity: 0.85; }
.seraph-fab.dragging { cursor: grabbing; transform: scale(1.08); box-shadow: 0 18px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2); }

/* Waterball squash-and-stretch when released and snapping to a side */
.seraph-fab.snapping-left,
.seraph-fab.snapping-right {
  animation: seraphBlob 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.seraph-fab.snapping-left  { transform-origin: left center; }
.seraph-fab.snapping-right { transform-origin: right center; }
@keyframes seraphBlob {
  0%   { transform: scale(1.08, 1.08); }
  30%  { transform: scale(1.26, 0.8); }   /* stretch along flight (horizontal) */
  55%  { transform: scale(0.8, 1.2); }    /* squash against the wall */
  75%  { transform: scale(1.12, 0.92); }  /* rebound */
  90%  { transform: scale(0.97, 1.04); }
  100% { transform: scale(1, 1); }
}
.seraph-fab-icon { width: 30px; height: 30px; display: block; }

/* ── Backdrop ── */
.seraph-backdrop {
  position: fixed; inset: 0; z-index: 79;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
}
.seraph-backdrop.open { opacity: 1; pointer-events: auto; }

/* ── Right sidebar panel ── */
.seraph-panel {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 80;
  width: min(440px, 92vw);
  display: flex; flex-direction: column;
  background: var(--surface-secondary);
  border-left: 1px solid var(--border-color);
  box-shadow: -16px 0 48px rgba(0,0,0,0.4);
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
}
.seraph-panel.open { transform: translateX(0); }

.seraph-panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px; border-bottom: 1px solid var(--border-subtle); flex-shrink: 0;
}
.seraph-panel-title { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; font-size: 1.05rem; color: var(--content-primary); }
.seraph-title-icon { width: 24px; height: 24px; color: var(--content-primary); }
.seraph-close {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 9px; border: none;
  background: transparent; color: var(--content-faint); cursor: pointer; font-size: 0.95rem;
  transition: color 0.15s ease, background 0.15s ease;
}
.seraph-close:hover { color: var(--content-primary); background: var(--hover-bg); }

.seraph-panel-body { flex: 1; overflow-y: auto; padding: 24px 20px; display: flex; flex-direction: column; gap: 22px; }
.seraph-greeting { font-size: 1.4rem; font-weight: 700; text-align: center; color: var(--content-primary); margin-top: 6px; }

/* ── Input box (prompt / search) ── */
.seraph-input-box {
  border-radius: 14px;
  background: var(--surface-card);
  border: 1px solid var(--border-color);
  box-shadow: inset 0 1px 0 var(--glass-inset-top);
  transition: border-color 0.2s ease;
}
.seraph-input-box:focus-within { border-color: var(--content-faint); }
.seraph-textarea {
  width: 100%; resize: none; background: transparent; border: none; outline: none;
  color: var(--content-primary); font-family: inherit; font-size: 0.9rem; line-height: 1.5;
  padding: 14px; min-height: 60px;
}
.seraph-textarea::placeholder { color: var(--content-faint); }

/* ── Quick settings — small rounded pills, single row ── */
.seraph-actions { display: flex; flex-wrap: nowrap; gap: 6px; justify-content: center; }
.seraph-action {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 10px; border-radius: 999px;
  border: 1px solid var(--border-color); background: var(--hover-bg);
  color: var(--content-muted); font-size: 0.72rem; font-weight: 500;
  cursor: pointer; white-space: nowrap;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}
.seraph-action:hover { color: var(--content-primary); background: var(--hover-bg-strong); border-color: var(--content-faint); }
.seraph-action:active { transform: scale(0.96); }
.seraph-action i { font-size: 0.8rem; }

/* ── Live search results ── */
.seraph-results { display: flex; flex-direction: column; gap: 2px; }
.seraph-result {
  display: flex; align-items: center; gap: 11px; width: 100%; text-align: left;
  padding: 10px 12px; border-radius: 10px; border: none; background: transparent;
  color: var(--content-faint); font-size: 0.88rem; font-weight: 500; cursor: pointer;
  transition: color 0.12s ease, background 0.12s ease;
}
.seraph-result:hover { color: var(--content-primary); background: var(--hover-bg); }
.seraph-result > i { font-size: 0.95rem; width: 20px; text-align: center; flex-shrink: 0; }
.seraph-result-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.seraph-result-aka { font-size: 0.72rem; color: var(--content-faint); opacity: 0.6; font-weight: 400; }
.seraph-result-ext { margin-left: auto; font-size: 0.75rem; opacity: 0.55; }
.seraph-empty { padding: 20px; text-align: center; color: var(--content-faint); font-style: italic; font-size: 0.85rem; }
.seraph-suggested-head {
  padding: 4px 12px 8px; font-size: 0.7rem; font-weight: 600;
  letter-spacing: 0.05em; text-transform: uppercase; color: var(--content-muted);
}

@media (max-width: 640px) {
  .seraph-fab-wrap { right: 16px; bottom: 16px; }
  .seraph-fab { width: 52px; height: 52px; }
  .seraph-fab-icon { width: 27px; height: 27px; }
}
`;
