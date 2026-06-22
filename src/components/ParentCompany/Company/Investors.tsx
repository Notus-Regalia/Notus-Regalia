"use client";
import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { type CapitalGroup, CAPITAL_GROUPS, type InvestorUpdate, INVESTOR_UPDATES } from '@/data/Company-data';
import { useReveal } from '@/hooks/useScrollReveal';

function springPress(el: Element) {
  el.classList.remove('sc-tab-pressed');
  void (el as HTMLElement).offsetWidth;
  el.classList.add('sc-tab-pressed');
  const cleanup = () => {
    el.classList.remove('sc-tab-pressed');
    el.removeEventListener('animationend', cleanup);
  };
  el.addEventListener('animationend', cleanup);
}

function EmailCopyButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const doCopy = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(email).then(doCopy).catch(() => {
        // fallback for mobile / insecure context
        fallbackCopy(email);
        doCopy();
      });
    } else {
      fallbackCopy(email);
      doCopy();
    }
  }, [email]);
  return (
    <span onClick={handleClick} className="sc-email-copy" title="Click to copy">
      <span className={`sc-email-text${copied ? ' sc-email-hidden' : ''}`}>{email}</span>
      <span className={`sc-email-copied${copied ? ' sc-email-copied-visible' : ''}`}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Copied to clipboard
      </span>
    </span>
  );
}

function fallbackCopy(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.style.top = '-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); } catch { /* noop */ }
  document.body.removeChild(ta);
}

function DisclosureTooltip() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calcPos = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const tooltipW = Math.min(300, window.innerWidth - 24);
    const rawLeft = rect.left + rect.width / 2;
    const pad = 12;
    const clampedLeft = Math.max(pad + tooltipW / 2, Math.min(rawLeft, window.innerWidth - pad - tooltipW / 2));
    setTooltipPos({
      top: Math.max(12, rect.top - 10),
      left: clampedLeft,
    });
  }, []);

  const openTooltip = useCallback(() => {
    calcPos();
    setVisible(true);
    setActive(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setActive(false);
    }, 5000);
  }, [calcPos]);

  const closeTooltip = useCallback(() => {
    setVisible(false);
    setActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      if (tooltipRef.current?.contains(target)) return;
      closeTooltip();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [visible, closeTooltip]);

  useEffect(() => {
    if (!visible) return;
    const recalc = () => calcPos();
    window.addEventListener('scroll', recalc, true);
    window.addEventListener('resize', recalc);
    return () => {
      window.removeEventListener('scroll', recalc, true);
      window.removeEventListener('resize', recalc);
    };
  }, [visible, calcPos]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: tooltipPos.top,
    left: tooltipPos.left,
    transform: visible ? 'translate(-50%, calc(-100% - 10px))' : 'translate(-50%, calc(-100% - 4px))',
  };

  const tooltipNode = (
    <span
      ref={tooltipRef}
      className={`sc-disclosure-tooltip${visible ? ' sc-disclosure-tooltip-visible' : ''}`}
      style={tooltipStyle}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => { if (!active) setVisible(false); }}
    >
      <span className="sc-disclosure-arrow" />
      All investor names, logos, and related information are disclosed with prior written consent and in accordance with governing agreements and applicable confidentiality obligations.
      {' '}Refer to the{' '}
      <a href="#" className="sc-disclosure-link" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>Disclosure</a>
      {' '}section under Information Tab to learn more.
    </span>
  );

  return (
    <span
      ref={ref}
      className="sc-disclosure-wrap"
      onMouseEnter={() => { calcPos(); if (!active) setVisible(true); }}
      onMouseLeave={() => { if (!active) setVisible(false); }}
      onClick={() => { active ? closeTooltip() : openTooltip(); }}
    >
      <span className={`sc-disclosure-badge${active ? ' sc-disclosure-badge-active' : ''}`}>
        <i className="bi bi-info-square sc-disclosure-icon" />
        <span className="sc-disclosure-label">Disclosure Agreement</span>
      </span>
      {typeof window !== 'undefined' ? createPortal(tooltipNode, document.body) : null}
    </span>
  );
}

/* ─────────────────────────────────────────
   INVESTOR UPDATES CAROUSEL — landing banner
───────────────────────────────────────── */
const InvestorHero = memo(() => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = INVESTOR_UPDATES.length;

  const next = useCallback(() => setIndex(i => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex(i => (i - 1 + count) % count), [count]);

  // Drives the cursor-following gradient border on the hero CTA button.
  const handleBtnMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div
      className={`iv-carousel${paused ? ' iv-paused' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={e => {
        setPaused(false);
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 48) { if (dx < 0) next(); else prev(); }
      }}
    >
      <div className="iv-bg-grid" />
      <div className="iv-bg-vignette" />
      <div className="iv-bg-glow" />

      {INVESTOR_UPDATES.map((u: InvestorUpdate, i) => (
        <div key={u.id} className={`iv-slide${i === index ? ' iv-active' : ''}`} aria-hidden={i !== index}>
          <div className="iv-slide-content">
            <h3 className="iv-anim iv-title">{u.title}</h3>
            <span className="iv-anim iv-status">{u.status}</span>
            <p className="iv-anim iv-summary">{u.summary}</p>
            <div className="iv-anim iv-actions">
              <a
                href={u.ctaHref ?? '#section-investors'}
                onMouseMove={handleBtnMouseMove}
                className="iv-cta"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span>{u.ctaLabel ?? 'View capital structure'}</span>
              </a>
              <span className="iv-date">{u.date}</span>
            </div>
          </div>
        </div>
      ))}

      <span className="iv-counter">{String(index + 1).padStart(2, '0')} — {String(count).padStart(2, '0')}</span>

      <div className="iv-controls">
        <div className="iv-dots">
          {INVESTOR_UPDATES.map((u, i) => (
            <button key={u.id} className={`iv-dot${i === index ? ' iv-active' : ''}`} onClick={() => setIndex(i)} aria-label={`Show ${u.category}`}>
              <span className="iv-dot-track">
                <span className="iv-dot-fill" onAnimationEnd={i === index ? next : undefined} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
InvestorHero.displayName = 'InvestorHero';

/* ── Redacted slots ──────────────────────────────────────────────────────── */

const RedactedLogo = memo(({ index }: { index: number }) => (
  <div className="sc-cell sc-cell-logo" style={{ animationDelay: `${index * 55}ms` }}>
    <div className="sc-redact-logo">
      <span className="sc-redact-shimmer" />
      <i className="bi bi-lock-fill sc-redact-lock" />
    </div>
    <span className="sc-cell-cap">Confidential</span>
  </div>
));
RedactedLogo.displayName = 'RedactedLogo';

const RedactedPerson = memo(({ index }: { index: number }) => (
  <div className="sc-cell sc-cell-person" style={{ animationDelay: `${index * 55}ms` }}>
    <div className="sc-redact-avatar">
      <span className="sc-redact-shimmer" />
      <i className="bi bi-person-fill sc-redact-silhouette" />
    </div>
    <span className="sc-redact-bar sc-redact-bar-name"><span className="sc-redact-shimmer" /></span>
    <span className="sc-cell-sub">To be disclosed</span>
  </div>
));
RedactedPerson.displayName = 'RedactedPerson';

const Group = memo(({ group, index }: { group: CapitalGroup; index: number }) => (
  <div className="sc-group" style={{ animationDelay: `${index * 120}ms` }}>
    <div className="sc-group-head">
      <span className="sc-group-tag">
        <i className="bi bi-lock sc-group-tag-icon" />Under NDA
      </span>
    </div>
    <h3 className="sc-group-title">{group.title}</h3>
    <p className="sc-group-desc">{group.description}</p>
    <div className={`sc-cell-grid sc-cell-grid-${group.layout}`}>
      {Array.from({ length: group.slots }).map((_, i) =>
        group.layout === 'logos'
          ? <RedactedLogo key={i} index={i} />
          : <RedactedPerson key={i} index={i} />
      )}
    </div>
  </div>
));
Group.displayName = 'Group';

const Investors = () => {
  /* ── Scroll-triggered reveals ── */
  const heroReveal = useReveal('fade-up', { threshold: 0.1, duration: 800 });
  const bodyReveal = useReveal('fade-up', { threshold: 0.05, duration: 800, cssDelay: 120 });

  return (
    <>
      <style>{`
        /* ── Keyframes ── */
        @keyframes sc-orbit {
          0%   { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        @keyframes sc-cell-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sc-group-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes sc-shimmer {
          0%   { transform: translateX(-130%) skewX(-18deg); }
          100% { transform: translateX(130%) skewX(-18deg); }
        }
        @keyframes scTabPress {
          0%   { transform: scale(1); }
          15%  { transform: scale(0.96); }
          50%  { transform: scale(1.02); }
          72%  { transform: scale(0.992); }
          88%  { transform: scale(1.004); }
          100% { transform: scale(1); }
        }

        /* ── Tab spring press ── */
        .sc-tab-pressed {
          animation: scTabPress 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          transform-origin: center !important;
        }

        /* ── Tab border / item / btn ── */
        .sc-tab-border {
          display: inline-flex; flex-shrink: 0; border-radius: 10.5px; padding: 1px;
          position: relative; background: transparent; transform-origin: center;
        }
        .sc-tab-border::before {
          content: ''; position: absolute; inset: 0; border-radius: 10.5px;
          background: linear-gradient(90deg,
            rgba(0,255,166,0.0) 0%, rgba(0,255,166,0.9) 15%, rgba(255,215,0,0.7) 30%,
            rgba(236,72,153,0.7) 45%, rgba(147,51,234,0.7) 60%, rgba(59,130,246,0.6) 75%,
            rgba(0,255,166,0.0) 90%);
          background-size: 200% 100%; animation: sc-orbit 3s linear infinite;
          opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
        }
        .sc-tab-border:hover::before { opacity: 1; }
        .sc-tab-item {
          display: inline-flex; align-items: stretch; border-radius: 9.5px; overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 var(--glass-inset-top, rgba(255,255,255,0.06));
          transition: box-shadow 0.2s ease; flex-shrink: 0;
          background: var(--navbar-bg, #0f0f0f); position: relative; z-index: 1;
        }
        .sc-tab-border:hover .sc-tab-item {
          box-shadow: 0 4px 14px rgba(0,0,0,0.26), inset 0 1px 0 var(--glass-inset-top, rgba(255,255,255,0.06));
        }
        .sc-tab-btn {
          display: inline-flex; align-items: center; gap: 6px; border: none; background: transparent; cursor: pointer;
          font-weight: 500; letter-spacing: 0.01em; color: var(--content-faint, rgba(255,255,255,0.4));
          padding: 8px 14px; font-size: 0.88rem; line-height: 1;
          transition: color 0.15s ease; user-select: none; white-space: nowrap; text-decoration: none;
        }
        .sc-tab-btn:hover { color: var(--content-primary, #f1f5f9); }
        .sc-cta-btn { padding: 11px 18px !important; font-size: 0.9rem !important; font-weight: 600 !important; }

        /* ── Section root ── */
        .sc-root {
          position: relative; background: var(--gradient-section); color: var(--content-primary);
          border-top: 1px dashed var(--border-dashed); border-bottom: 1px dashed var(--border-dashed);
          contain: layout style paint;
        }
        .sc-root::before {
          content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: linear-gradient(to bottom, transparent, black 4%, black 96%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 4%, black 96%, transparent);
        }

        /* ── Hero ── */
        .sc-hero {
          display: flex; flex-direction: column;
          padding: 5rem 2rem 3rem; position: relative; z-index: 1;
        }
        @media(min-width: 640px)  { .sc-hero { padding-left: 4rem; padding-right: 4rem; } }
        @media(min-width: 768px)  { .sc-hero { padding: 6rem 6rem 3.5rem; } }
        @media(min-width: 1024px) { .sc-hero { padding-left: 6rem; padding-right: 6rem; } }
        @media(min-width: 1280px) { .sc-hero { padding-left: 8rem; padding-right: 8rem; } }
        @media(min-width: 1536px) { .sc-hero { padding-left: 12rem; padding-right: 12rem; } }
        @media(min-width: 1920px) { .sc-hero { padding-left: 16rem; padding-right: 16rem; } }

        .sc-heading {
          font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 700; letter-spacing: -.02em; line-height: 1.15;
          background: var(--text-gradient, linear-gradient(135deg, #f1f5f9 0%, rgba(241,245,249,.7) 100%));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin-bottom: 1rem;
        }
        .sc-disclosure-row { display: flex; align-items: center; margin-bottom: 1rem; }
        .sc-sub { font-size: .9rem; line-height: 2; color: var(--content-muted); }
        @media(min-width: 640px) { .sc-sub { font-size: 1.2rem; } }

        /* ── Disclosure badge ── */
        .sc-disclosure-wrap {
          position: relative; display: inline-flex; align-items: center; cursor: pointer; flex-shrink: 0;
        }
        /* Onyx "black label" — matches .release-tag in the home Latest Releases section */
        .sc-disclosure-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px 4px 8px; border-radius: 2px;
          border: 1px solid rgba(255,255,255,0.14);
          background: #141414;
          transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .sc-disclosure-wrap:hover .sc-disclosure-badge,
        .sc-disclosure-badge-active {
          background: #C81040 !important; border-color: #E31B54 !important;
          box-shadow: 0 0 18px rgba(227,27,84,0.45), 0 2px 8px rgba(0,0,0,0.4) !important;
        }
        .sc-disclosure-icon {
          font-size: 0.85rem; line-height: 1;
          color: rgba(255,255,255,0.55); -webkit-text-fill-color: rgba(255,255,255,0.55);
          transition: color 0.2s ease, -webkit-text-fill-color 0.2s ease;
        }
        .sc-disclosure-wrap:hover .sc-disclosure-icon,
        .sc-disclosure-badge-active .sc-disclosure-icon {
          color: #fff !important; -webkit-text-fill-color: #fff !important;
        }
        .sc-disclosure-label {
          font-family: ui-monospace, Menlo, monospace; font-size: 9px;
          text-transform: uppercase; letter-spacing: 0.18em; font-weight: 700;
          color: #f1f5f9; -webkit-text-fill-color: #f1f5f9;
          background: none; background-clip: unset; -webkit-background-clip: unset;
          transition: color 0.2s ease, -webkit-text-fill-color 0.2s ease; white-space: nowrap;
        }
        .sc-disclosure-wrap:hover .sc-disclosure-label,
        .sc-disclosure-badge-active .sc-disclosure-label {
          color: #fff !important; -webkit-text-fill-color: #fff !important;
        }

        /* Tooltip */
        .sc-disclosure-tooltip {
          position: fixed; width: 300px; max-width: calc(100vw - 24px); padding: 14px 16px;
          background: linear-gradient(160deg, #050505 0%, #090909 50%, #0d0509 100%);
          border: 1px solid rgba(227,27,84,0.5); border-radius: 10px;
          font-size: 12px; line-height: 1.7;
          color: rgba(255,255,255,0.65); -webkit-text-fill-color: rgba(255,255,255,0.65);
          background-clip: unset; -webkit-background-clip: unset;
          font-weight: 400; font-family: inherit; letter-spacing: 0;
          box-shadow: 0 20px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(227,27,84,0.1), 0 0 32px rgba(227,27,84,0.1);
          pointer-events: none; opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
          z-index: 99999; text-transform: none; white-space: normal; text-align: justify;
        }
        .sc-disclosure-tooltip-visible { opacity: 1; pointer-events: auto; }
        .sc-disclosure-arrow {
          position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%) rotate(45deg);
          width: 8px; height: 8px; background: #050505;
          border-right: 1px solid rgba(227,27,84,0.5); border-bottom: 1px solid rgba(227,27,84,0.5);
        }
        .sc-disclosure-link {
          color: #E31B54; -webkit-text-fill-color: #E31B54;
          text-decoration: underline; text-underline-offset: 2px;
          text-decoration-color: rgba(227,27,84,0.5); font-weight: 600; cursor: pointer;
          transition: text-decoration-color 0.15s ease, color 0.15s ease;
        }
        .sc-disclosure-link:hover {
          color: #ff3366; -webkit-text-fill-color: #ff3366;
          text-decoration-color: rgba(255,51,102,0.8);
        }

        /* ── Body ── */
        .sc-body { position: relative; z-index: 1; padding: 1rem 2rem 6rem; }
        @media(min-width: 640px)  { .sc-body { padding-left: 4rem; padding-right: 4rem; } }
        @media(min-width: 768px)  { .sc-body { padding: 1rem 6rem 6rem; } }
        @media(min-width: 1024px) { .sc-body { padding-left: 6rem; padding-right: 6rem; } }
        @media(min-width: 1280px) { .sc-body { padding-left: 8rem; padding-right: 8rem; } }
        @media(min-width: 1536px) { .sc-body { padding-left: 12rem; padding-right: 12rem; } }
        @media(min-width: 1920px) { .sc-body { padding-left: 16rem; padding-right: 16rem; } }

        /* ── Group ── */
        .sc-group { margin-bottom: 4rem; animation: sc-group-in 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .sc-group:last-child { margin-bottom: 0; }
        .sc-group-head { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 0.85rem; }
        @media(max-width: 767px) { .sc-group-head { gap: 0.75rem; } }
        .sc-group-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: ui-monospace, Menlo, monospace; font-size: 9px; text-transform: uppercase;
          letter-spacing: 0.18em; color: rgba(255,255,255,0.4); white-space: nowrap; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 3px;
        }
        .sc-group-tag-icon { font-size: 9px; line-height: 1; }
        .sc-group-title {
          font-size: clamp(1.1rem, 2.5vw, 1.5rem); font-weight: 300;
          letter-spacing: -0.02em; color: var(--content-primary); margin: 0 0 0.6rem;
        }
        .sc-group-desc { font-size: .9rem; line-height: 1.9; color: var(--content-muted); margin: 0 0 2rem; max-width: 920px; }

        /* ── Closed dashed grid (cells share borders) ── */
        .sc-cell-grid {
          display: grid;
          border-top: 1px dashed var(--border-dashed);
          border-left: 1px dashed var(--border-dashed);
        }
        .sc-cell-grid-logos  { grid-template-columns: repeat(3, 1fr); }
        .sc-cell-grid-people { grid-template-columns: repeat(4, 1fr); }
        @media(max-width: 1023px) { .sc-cell-grid-people { grid-template-columns: repeat(3, 1fr); } }
        @media(max-width: 767px)  {
          .sc-cell-grid-logos  { grid-template-columns: repeat(2, 1fr); }
          .sc-cell-grid-people { grid-template-columns: repeat(2, 1fr); }
        }
        .sc-cell {
          position: relative;
          /* Opaque so the ambient section grid never shows through the tiles/text */
          background: var(--surface-secondary);
          border-right: 1px dashed var(--border-dashed);
          border-bottom: 1px dashed var(--border-dashed);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.85rem; text-align: center;
          transition: background 0.3s ease;
          animation: sc-cell-in .5s cubic-bezier(.22,1,.36,1) both;
        }
        .sc-cell:hover { background: var(--surface-tertiary); }
        .sc-cell-logo   { min-height: 150px; padding: 2rem 1.5rem; }
        .sc-cell-person { min-height: 190px; padding: 2.25rem 1.25rem; }
        @media(max-width: 767px) {
          .sc-cell-logo   { min-height: 118px; padding: 1.5rem 1rem; }
          .sc-cell-person { min-height: 168px; padding: 1.75rem 0.85rem; }
        }

        /* ── Redaction primitives ── */
        .sc-redact-logo, .sc-redact-avatar, .sc-redact-bar { position: relative; overflow: hidden; }
        .sc-redact-shimmer {
          position: absolute; top: 0; bottom: 0; left: 0; width: 55%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent);
          animation: sc-shimmer 2.6s ease-in-out infinite; pointer-events: none;
        }

        .sc-redact-logo {
          display: flex; align-items: center; justify-content: center;
          width: clamp(120px, 60%, 180px); height: 42px; border-radius: 7px;
          background: repeating-linear-gradient(115deg,
            rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 7px,
            rgba(255,255,255,0.02) 7px, rgba(255,255,255,0.02) 14px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .sc-redact-lock {
          position: relative; z-index: 1; font-size: 0.95rem;
          color: rgba(255,255,255,0.32); -webkit-text-fill-color: rgba(255,255,255,0.32);
        }

        .sc-redact-avatar {
          display: flex; align-items: center; justify-content: center;
          width: 58px; height: 58px; border-radius: 50%;
          background: radial-gradient(circle at 50% 38%, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.1);
        }
        .sc-redact-silhouette {
          font-size: 1.5rem;
          color: rgba(255,255,255,0.28); -webkit-text-fill-color: rgba(255,255,255,0.28);
        }
        .sc-redact-bar {
          height: 9px; border-radius: 4px;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.06);
        }
        .sc-redact-bar-name { width: 78px; }

        .sc-cell-cap, .sc-cell-sub {
          font-family: ui-monospace, Menlo, monospace; font-size: 9px;
          text-transform: uppercase; letter-spacing: 0.18em;
          color: rgba(255,255,255,0.28);
        }
        .sc-cell-sub { letter-spacing: 0.14em; }

        /* ── Footer contact ── */
        .sc-footer {
          margin-top: 3.25rem; padding: 1.75rem 2rem;
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.25rem;
          border: 1px dashed var(--border-dashed); border-radius: 12px; background: rgba(255,255,255,0.01);
          position: relative; overflow: hidden;
        }
        .sc-footer-grid-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 24px 24px; opacity: 0.5;
        }
        .sc-footer-text { position: relative; z-index: 1; font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.4); margin: 0; }
        .sc-footer-text strong { color: rgba(255,255,255,0.7); font-weight: 600; }
        .sc-footer-cta { position: relative; z-index: 1; }

        /* ── Email copy ── */
        .sc-email-copy { position: relative; display: inline-flex; align-items: center; color: #E31B54; cursor: pointer; opacity: 0.85; }
        .sc-email-text {
          display: inline-block; background-image: linear-gradient(#E31B54, #E31B54);
          background-size: 0% 1px; background-repeat: no-repeat; background-position: left bottom;
          transition: background-size 0.3s ease, opacity 0.15s ease; white-space: nowrap;
        }
        .sc-email-copy:hover .sc-email-text { background-size: 100% 1px; }
        .sc-email-text.sc-email-hidden { opacity: 0; pointer-events: none; }
        .sc-email-copied {
          position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          display: inline-flex; align-items: center; color: #10b981; font-size: 12px; font-weight: 600;
          opacity: 0; transition: opacity 0.15s ease; white-space: nowrap; pointer-events: none;
        }
        .sc-email-copied.sc-email-copied-visible { opacity: 1; }

        /* ════════ LIGHT MODE ════════ */
        :root.light .sc-root::before { display: none; }
        :root.light .sc-group-title  { color: #0f172a; }
        :root.light .sc-group-desc   { color: #64748b; }
        :root.light .sc-group-tag    { color: rgba(0,0,0,.5); border-color: rgba(0,0,0,.2); }
        :root.light .sc-redact-shimmer { background: linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent); }
        :root.light .sc-redact-logo  {
          background: repeating-linear-gradient(115deg,
            rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 7px,
            rgba(0,0,0,0.02) 7px, rgba(0,0,0,0.02) 14px);
          border-color: rgba(0,0,0,0.1);
        }
        :root.light .sc-redact-lock  { color: rgba(0,0,0,.35) !important; -webkit-text-fill-color: rgba(0,0,0,.35) !important; }
        :root.light .sc-redact-avatar {
          background: radial-gradient(circle at 50% 38%, rgba(0,0,0,0.07), rgba(0,0,0,0.02));
          border-color: rgba(0,0,0,0.12);
        }
        :root.light .sc-redact-silhouette { color: rgba(0,0,0,.3) !important; -webkit-text-fill-color: rgba(0,0,0,.3) !important; }
        :root.light .sc-redact-bar   { background: rgba(0,0,0,0.06); border-color: rgba(0,0,0,0.07); }
        :root.light .sc-cell-cap,
        :root.light .sc-cell-sub     { color: rgba(0,0,0,.4); }
        :root.light .sc-footer       { border-color: rgba(0,0,0,0.15); background: rgba(0,0,0,0.02); }
        :root.light .sc-footer-text  { color: rgba(0,0,0,.5); }
        :root.light .sc-footer-text strong { color: rgba(0,0,0,.8); }
        :root.light .sc-tab-item {
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,.10), 0 4px 16px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,1);
          outline: 1px solid rgba(0,0,0,.11);
        }
        :root.light .sc-tab-border:hover .sc-tab-item {
          box-shadow: 0 4px 12px rgba(0,0,0,.14), 0 8px 24px rgba(0,0,0,.09), inset 0 1px 0 rgba(255,255,255,1);
          outline: 1px solid rgba(0,0,0,.15);
        }
        :root.light .sc-tab-btn       { color: rgba(0,0,0,.45); }
        :root.light .sc-tab-btn:hover { color: rgba(0,0,0,.9); }

        /* light — disclosure */
        :root.light .sc-disclosure-badge { border-color: rgba(255,255,255,0.1) !important; background: #141414 !important; }
        :root.light .sc-disclosure-wrap:hover .sc-disclosure-badge,
        :root.light .sc-disclosure-badge-active { background: #C81040 !important; border-color: #E31B54 !important; box-shadow: 0 0 18px rgba(227,27,84,0.1), 0 2px 8px rgba(0,0,0,0.4) !important; }
        :root.light .sc-disclosure-icon  { color: rgba(255,255,255,0.55) !important; -webkit-text-fill-color: rgba(255,255,255,0.55) !important; }
        :root.light .sc-disclosure-wrap:hover .sc-disclosure-icon,
        :root.light .sc-disclosure-badge-active .sc-disclosure-icon { color: #fff !important; -webkit-text-fill-color: #fff !important; }
        :root.light .sc-disclosure-label { color: #f1f5f9 !important; -webkit-text-fill-color: #f1f5f9 !important; }
        :root.light .sc-disclosure-wrap:hover .sc-disclosure-label,
        :root.light .sc-disclosure-badge-active .sc-disclosure-label { color: #fff !important; -webkit-text-fill-color: #fff !important; }
        :root.light .sc-disclosure-tooltip { background: linear-gradient(160deg,#050505 0%,#090909 50%,#0d0509 100%) !important; border: 1px solid rgba(227,27,84,0.5) !important; color: rgba(255,255,255,0.65) !important; -webkit-text-fill-color: rgba(255,255,255,0.65) !important; }
        :root.light .sc-disclosure-arrow { background: #050505 !important; border-color: rgba(227,27,84,0.5) !important; }

        /* ════════ INVESTOR UPDATES CAROUSEL (always-dark banner) ════════ */
        @keyframes iv-rise{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes iv-progress{from{transform:scaleX(0);}to{transform:scaleX(1);}}

        .iv-banner { position: relative; }
        .iv-carousel{
          position:relative;width:100%;height:100dvh;overflow:hidden;
          background:#000000;contain:layout style paint;
        }
        .iv-bg-grid{
          position:absolute;inset:0;pointer-events:none;z-index:0;
          background-image:
            repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px),
            repeating-linear-gradient(45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px),
            repeating-linear-gradient(-45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px),
            radial-gradient(circle, rgba(255,255,255,0.84) 0 1.4px, transparent 1.5px);
          background-size:112px 112px;background-position:center;opacity:.42;
        }
        .iv-bg-vignette{
          position:absolute;inset:0;pointer-events:none;z-index:0;
          background:radial-gradient(circle at center, transparent 22%, rgba(0,0,0,0.34) 100%),
                     linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.48) 100%);
        }
        .iv-bg-glow{
          position:absolute;inset:0;pointer-events:none;z-index:0;
          background:radial-gradient(ellipse at 82% 14%, rgba(227,27,84,0.12) 0%, transparent 55%);
        }
        .iv-slide{
          position:absolute;inset:0;display:flex;z-index:1;opacity:0;visibility:hidden;
          transition:opacity .65s cubic-bezier(.22,1,.36,1), visibility 0s linear .65s;
        }
        .iv-slide.iv-active{
          opacity:1;visibility:visible;z-index:2;
          transition:opacity .65s cubic-bezier(.22,1,.36,1);
        }
        .iv-slide-content{
          position:relative;z-index:2;flex:1 1 100%;min-width:0;
          display:flex;flex-direction:column;justify-content:center;
          padding:clamp(2.5rem,10vw,13rem);padding-bottom:7.5rem;
        }
        .iv-slide .iv-anim{opacity:0;}
        .iv-slide.iv-active .iv-anim{animation:iv-rise .6s cubic-bezier(.22,1,.36,1) both;}
        .iv-slide.iv-active .iv-anim:nth-child(1){animation-delay:.10s;}
        .iv-slide.iv-active .iv-anim:nth-child(2){animation-delay:.16s;}
        .iv-slide.iv-active .iv-anim:nth-child(3){animation-delay:.22s;}
        .iv-slide.iv-active .iv-anim:nth-child(4){animation-delay:.34s;}
        .iv-title{
          font-size:clamp(1.9rem,4.2vw,3.4rem);font-weight:700;letter-spacing:-.03em;line-height:1.06;
          background:linear-gradient(135deg,#f1f5f9 0%,rgba(241,245,249,.6) 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          margin:0 0 1.1rem;max-width:18ch;
        }
        .iv-status{
          align-self:flex-start;font-family:ui-monospace,Menlo,monospace;font-size:.62rem;
          letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4);
          border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);
          padding:5px 12px;border-radius:4px;margin-bottom:1.5rem;
        }
        .iv-summary{
          font-size:.95rem;line-height:1.9;color:rgba(255,255,255,.52);max-width:60ch;margin:0 0 2rem;
          display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;
        }
        .iv-actions{display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;}
        .iv-date{
          font-family:ui-monospace,Menlo,monospace;font-size:.66rem;letter-spacing:.16em;
          text-transform:uppercase;color:rgba(255,255,255,.4);
        }
        .iv-cta{
          --btn-surface:radial-gradient(ellipse at bottom, rgba(255,255,255,1) 0%, rgba(226,229,233,1) 48%);
          --btn-text:rgba(0,0,0,0.66);--btn-text-hover:rgba(0,0,0,1);--btn-inset:rgba(0,0,0,0.12);
          --btn-line:linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 100%);
          position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
          padding:12px 22px;border:0;border-radius:7px;text-decoration:none;
          font-size:.9rem;font-weight:500;line-height:1;cursor:pointer;
          box-shadow:inset 0 0 0 1px var(--btn-inset);
          background:var(--btn-surface);color:var(--btn-text);
          transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s cubic-bezier(.22,1,.36,1),color .35s ease;
        }
        .iv-cta > *{position:relative;z-index:1;}
        .iv-cta svg{flex-shrink:0;}
        .iv-cta::before{
          content:'';width:70%;height:1px;position:absolute;bottom:0;left:15%;
          background:var(--btn-line);opacity:.2;transition:opacity .35s ease;
        }
        .iv-cta:hover{color:var(--btn-text-hover);transform:translateY(-2px);box-shadow:inset 0 0 0 1px var(--btn-inset),0 6px 18px -6px rgba(0,0,0,0.45);}
        .iv-cta:hover::before{opacity:1;}
        .iv-cta::after{
          content:'';position:absolute;inset:-1.5px;border-radius:8.5px;padding:1px;
          background:radial-gradient(180px circle at var(--mouse-x,50%) var(--mouse-y,50%),
            rgba(0,255,166,0.9),rgba(255,215,0,0.7),rgba(236,72,153,0.7),rgba(147,51,234,0.6),rgba(59,130,246,0.5),transparent 70%);
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;mask-composite:exclude;
          opacity:0;transition:opacity .3s ease;pointer-events:none;z-index:0;
        }
        .iv-cta:hover::after{opacity:1;}
        .iv-counter{
          position:absolute;top:clamp(96px,12vh,116px);right:clamp(2.5rem,10vw,13rem);z-index:5;
          font-family:ui-monospace,Menlo,monospace;font-size:.65rem;letter-spacing:.2em;color:rgba(255,255,255,.4);
        }
        .iv-controls{
          position:absolute;left:0;right:0;bottom:0;z-index:5;
          display:flex;align-items:center;justify-content:space-between;gap:1rem;
          padding:1rem clamp(2.5rem,10vw,13rem);
          border-top:1px solid rgba(255,255,255,.07);
          background:rgba(0,0,0,.6);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
        }
        .iv-dots{display:flex;align-items:center;gap:1rem;min-width:0;flex-wrap:wrap;}
        .iv-dot{display:flex;align-items:center;background:none;border:none;cursor:pointer;padding:6px 0;min-width:0;}
        .iv-dot-track{display:block;width:56px;height:2px;border-radius:2px;background:rgba(255,255,255,.14);overflow:hidden;transition:background .25s ease;}
        .iv-dot:hover .iv-dot-track{background:rgba(255,255,255,.28);}
        .iv-dot-fill{display:block;width:100%;height:100%;background:#E31B54;transform:scaleX(0);transform-origin:left;}
        .iv-dot.iv-active .iv-dot-fill{animation:iv-progress 6.5s linear forwards;}
        .iv-carousel.iv-paused .iv-dot-fill{animation-play-state:paused;}

        @media(max-width:767px){
          .iv-carousel{height:100dvh;}
          .iv-slide-content{justify-content:flex-end;padding:1.5rem 1.4rem 6.75rem;}
          .iv-title{font-size:1.7rem;max-width:none;}
          .iv-summary{font-size:.85rem;line-height:1.7;margin-bottom:1.5rem;-webkit-line-clamp:3;}
          .iv-status{display:none;}
          .iv-counter{top:82px;right:1.2rem;}
          .iv-dots{gap:.75rem;flex-wrap:nowrap;overflow:hidden;}
          .iv-dot-track{width:30px;}
          .iv-controls{padding:.85rem 1.2rem;}
        }

        @media (prefers-reduced-motion: reduce) {
          .sc-redact-shimmer { animation: none; }
          .sc-cell, .sc-group { animation: none; }
          .iv-anim, .iv-dot-fill { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <div style={{ paddingBottom: '8rem' }}>
        <div className="iv-banner" data-nosnippet>
          <InvestorHero />
        </div>

        <section id="section-investors" className="sc-root">
          <div className="sc-hero" ref={heroReveal.ref} style={heroReveal.style}>
            <h2 className="sc-heading">Investors</h2>
            <div className="sc-disclosure-row">
              <DisclosureTooltip />
            </div>
            <p className="sc-sub">
              Backed by founders, operators, and institutional partners aligned with conviction.
              Every identity below is held under disclosure agreement and released only with prior written consent.
            </p>
          </div>

          <div className="sc-body" ref={bodyReveal.ref} style={bodyReveal.style}>
            {CAPITAL_GROUPS.map((group, i) => (
              <Group key={group.id} group={group} index={i} />
            ))}

            <div className="sc-footer">
              <div className="sc-footer-grid-overlay" />
              <p className="sc-footer-text">
                <strong>Under disclosure agreement.</strong>{' '}
                Investor and advisor identities are released individually as confidentiality obligations allow.
              </p>
              <p className="sc-footer-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Inquiries:&nbsp;<EmailCopyButton email="info@notusregalia.tech" />
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default memo(Investors);
