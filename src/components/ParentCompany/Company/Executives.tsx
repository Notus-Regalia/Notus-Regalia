"use client";
import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { FOUNDERS, type Founder } from '@/data/Company-data';
import { useReveal } from '@/hooks/useScrollReveal';

const LINKEDIN_PATH = 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';

const INSTAGRAM_PATH = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z';
const X_PATH = 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.826l4.713 6.231 5.451-6.231zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z';
const GITHUB_PATH = 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12';

/* ─────────────────────────────────────────
   MODAL — portaled to document.body
───────────────────────────────────────── */
function FounderModal({ founder, onClose }: { founder: Founder; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  const socials = [
    { label: 'LinkedIn',  href: founder.linkedin,         path: LINKEDIN_PATH },
    { label: 'Instagram', href: founder.instagram ?? '#', path: INSTAGRAM_PATH },
    { label: 'X',         href: founder.x ?? '#',         path: X_PATH },
    { label: 'GitHub',    href: founder.github ?? '#',    path: GITHUB_PATH },
  ];

  const socialGrid = (
    <div className="fc-modal-socials">
      {socials.map(s => (
        <div key={s.label} className="tab-item-border">
          <div className="tab-item">
            <a href={s.href} aria-label={s.label} onClick={e => e.stopPropagation()} className="tab-label-btn fc-modal-social-tile">
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d={s.path} /></svg>
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  return createPortal(
    <div
      onClick={onClose}
      onWheel={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
      className="fc-modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box',
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        overflow: 'hidden',
      }}
    >
      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        className="fc-modal-outer"
        onMouseMove={e => {
          const el = e.currentTarget;
          const rect = el.getBoundingClientRect();
          el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
          el.style.setProperty('--my', `${e.clientY - rect.top}px`);
        }}
        style={{
          position: 'relative', width: '70vw', maxWidth: 'none', height: '100dvh',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div className="fc-modal-gradient-border" />
        <div
          className="fc-modal-panel"
          style={{
            position: 'relative', display: 'flex', flexDirection: 'row',
            width: '100%', flex: 1, minHeight: 0, /* minHeight:0 lets flex child shrink & scroll */
            overflow: 'hidden',
            background: '#000000',
            borderLeft: '1px solid rgba(255,255,255,0.10)',
            borderRight: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
          }}
        >
        {/* Backdrop — same grid + glow as the banner */}
        <div className="exec-bg-grid" style={{ opacity: 0.15, zIndex: 0 }} />
        <div className="exec-bg-glow" style={{ zIndex: 0 }} />

        {/* ── Mobile: top row with image + title side-by-side ── */}
        <div className="fc-modal-top-row">

          {/* Portrait column */}
          <div className="fc-modal-portrait-mobile" style={{
            position: 'relative', flexShrink: 0, width: '320px',
            overflow: 'hidden',
            background: 'linear-gradient(170deg, #0a0a0a 0%, #101010 100%)',
          }}>
            {founder.src ? (
              <Image src={founder.src} alt={founder.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} sizes="320px" />
            ) : (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(227,27,84,0.15) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, #000000 20%, transparent)', pointerEvents: 'none', zIndex: 1 }} />
            <span className="fc-modal-chip" style={{
              position: 'absolute', top: '14px', left: '14px', zIndex: 3,
              fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '10px',
              letterSpacing: '0.16em', textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)', padding: '5px 11px', borderRadius: '4px',
            }}>{founder.codename}</span>
          </div>

          {/* Mobile-only title block (next to image) */}
          <div className="fc-modal-title-mobile">
            <div className="fc-modal-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, fontWeight: 700, color: 'rgba(255,255,255,0.30)', marginBottom: '8px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#E31B54', flexShrink: 0 }} />
              Since {founder.since}
            </div>
            <h2 className="fc-modal-name" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, background: 'linear-gradient(135deg, #f1f5f9 0%, rgba(241,245,249,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 }}>{founder.name}</h2>
            <p style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '10px', color: '#E31B54', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.14em', margin: '6px 0 0' }}>{founder.title}</p>
            <span className="fc-modal-role-tag" style={{ display: 'inline-block', marginTop: '8px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.30)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', padding: '3px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>{founder.role}</span>
            {socialGrid}
          </div>

        </div>

        {/* Info column */}
        <div className="fc-modal-info" style={{ position: 'relative', zIndex: 1, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', minWidth: 0 }}>
          <div className="fc-modal-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', minWidth: 0, padding: '2.25rem 2.5rem 1.5rem 2rem' }}>
            {/* Desktop-only eyebrow/name/title (hidden on mobile since it's in the top row) */}
            <div className="fc-modal-desktop-header" style={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>
              <div style={{ minWidth: 0 }}>
                <div className="fc-modal-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, fontWeight: 700, color: 'rgba(255,255,255,0.30)', marginBottom: '16px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#E31B54', flexShrink: 0 }} />
                  {founder.role}
                </div>
                <h2 className="fc-modal-name" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, background: 'linear-gradient(135deg, #f1f5f9 0%, rgba(241,245,249,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 }}>{founder.name}</h2>
                <p style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px', color: '#E31B54', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.14em', margin: '10px 0 0' }}>{founder.title}</p>
              </div>
              {/* Socials — top right, aligned with the name line */}
              <div style={{ marginTop: '26px', flexShrink: 0 }}>{socialGrid}</div>
            </div>
            <div className="fc-modal-divider" style={{ width: '100%', height: '1px', margin: '24px 0', background: 'linear-gradient(90deg, rgba(227,27,84,0.3), rgba(255,255,255,0.06) 50%, transparent)' }} />
            <div>
              <span className="fc-modal-about-label" style={{ display: 'block', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.25)', marginBottom: '10px' }}>About</span>
              <p className="fc-modal-bio" style={{ fontSize: '14px', lineHeight: 1.85, color: 'rgba(255,255,255,0.55)', margin: 0 }}>{founder.bio}</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────
   EXECUTIVE CAROUSEL — landing banner
───────────────────────────────────────── */
const ExecCarousel = memo(({ onExpand }: { onExpand: (f: Founder) => void }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = FOUNDERS.length;

  const next = useCallback(() => setIndex(i => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex(i => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (scrolled) return;
    const onScroll = () => { if (window.scrollY > 60) setScrolled(true); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrolled]);

  return (
    <div
      className={`exec-carousel${paused ? ' exec-paused' : ''}`}
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
      <div className="exec-bg-grid" />
      <div className="exec-bg-vignette" />
      <div className="exec-bg-glow" />

      {FOUNDERS.map((f, i) => (
        <div key={f.id} className={`exec-slide${i === index ? ' exec-active' : ''}`} aria-hidden={i !== index}>
          <div className="exec-slide-content">
            <div className="exec-anim exec-eyebrow"><span className="exec-eyebrow-dot" />{f.codename} · Since {f.since}</div>
            <h3 className="exec-anim exec-name">{f.name}</h3>
            <p className="exec-anim exec-title">{f.title}</p>
            <span className="exec-anim exec-role">{f.role}</span>
            <p className="exec-anim exec-bio">{f.bio}</p>
            <div className="exec-anim exec-actions">
              <div className="tab-item-border">
                <div className="tab-item">
                  <button className="tab-label-btn" onClick={() => onExpand(f)} style={{ padding: '11px 18px 11px 16px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                      <path d="M15 3h6m0 0v6m0-6-7 7M9 21H3m0 0v-6m0 6 7-7" />
                    </svg>
                    <span>View Profile</span>
                  </button>
                </div>
              </div>
              <div className="tab-item-border">
                <div className="tab-item">
                  <a href={f.linkedin} aria-label="LinkedIn" className="tab-label-btn" style={{ padding: '11px 18px 11px 16px', textDecoration: 'none' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d={LINKEDIN_PATH} /></svg>
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="exec-slide-portrait">
            {f.src ? (
              <Image src={f.src} alt={f.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} sizes="(max-width: 767px) 100vw, 50vw" priority={i === 0} />
            ) : (
              <div className="fc-dot-grid" />
            )}
            <div className="exec-portrait-fade" />
          </div>
        </div>
      ))}

      <span className="exec-counter">{String(index + 1).padStart(2, '0')} — {String(count).padStart(2, '0')}</span>

      <div className={`exec-scroll-hint${scrolled ? ' exec-hidden' : ''}`} aria-hidden="true">
        <span>Scroll to explore</span>
        <svg className="exec-scroll-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
          <path d="M12 5v14m0 0 6-6m-6 6-6-6" />
        </svg>
      </div>

      <div className="exec-controls">
        <div className="exec-dots">
          {FOUNDERS.map((f, i) => (
            <button key={f.id} className={`exec-dot${i === index ? ' exec-active' : ''}`} onClick={() => setIndex(i)} aria-label={`Show ${f.name}`}>
              <span className="exec-dot-name">{f.name.split(' ')[0]}</span>
              <span className="exec-dot-track">
                <span className="exec-dot-fill" onAnimationEnd={i === index ? next : undefined} />
              </span>
            </button>
          ))}
        </div>
        <div className="exec-arrows">
          <button className="exec-arrow" onClick={prev} aria-label="Previous executive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button className="exec-arrow" onClick={next} aria-label="Next executive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
});
ExecCarousel.displayName = 'ExecCarousel';

/* ─────────────────────────────────────────
   EXECUTIVES SECTION
───────────────────────────────────────── */
const Executives = () => {
  const [activeFounder, setActiveFounder] = useState<Founder | null>(null);
  const handleExpand = useCallback((f: Founder) => {
    setActiveFounder(f);
  }, []);

  /* ── Scroll-triggered reveal ── */
  const foundersReveal = useReveal('fade-up', { threshold: 0.1, duration: 800 });

  const handleClose = useCallback(() => {
    setActiveFounder(null);
  }, []);

  return (
    <>
      <style>{`

        @keyframes epulse {
          0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(227,27,84,.5);}
          50%{opacity:.7;box-shadow:0 0 0 5px rgba(227,27,84,0);}
        }

        .teams-root{
          position:relative;background:var(--gradient-section);color:var(--content-primary);
          border-top:1px dashed var(--border-dashed);border-bottom:1px dashed var(--border-dashed);
          overflow:hidden;contain:layout style paint;
        }
        .teams-root::before{
          content:'';position:absolute;inset:0;pointer-events:none;
          background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size:32px 32px;
          mask-image:linear-gradient(to bottom,transparent,black 4%,black 96%,transparent);
          -webkit-mask-image:linear-gradient(to bottom,transparent,black 4%,black 96%,transparent);
          will-change:transform;
        }
        .founders-section{position:relative;z-index:1;padding:0;}
        .fc-dot-grid{ position:absolute;inset:0;background-image:radial-gradient(circle,rgba(227,27,84,.12) 1px,transparent 1px);background-size:22px 22px; }

        /* ── Executive carousel banner ── */
        @keyframes exec-rise{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes exec-zoom{from{transform:scale(1.06);}to{transform:scale(1);}}
        @keyframes exec-progress{from{transform:scaleX(0);}to{transform:scaleX(1);}}

        .exec-carousel{
          position:relative;width:100%;height:100dvh;overflow:hidden;
          background:#000000;
          contain:layout style paint;
        }
        /* ── Background — mirrors the Info Central releases hero ── */
        .exec-bg-grid{
          position:absolute;inset:0;pointer-events:none;z-index:0;
          background-image:
            repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px),
            repeating-linear-gradient(45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px),
            repeating-linear-gradient(-45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px),
            radial-gradient(circle, rgba(255,255,255,0.84) 0 1.4px, transparent 1.5px);
          background-size:112px 112px;background-position:center;opacity:.42;
        }
        .exec-bg-vignette{
          position:absolute;inset:0;pointer-events:none;z-index:0;
          background:radial-gradient(circle at center, transparent 22%, rgba(0,0,0,0.34) 100%),
                     linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.48) 100%);
        }
        .exec-bg-glow{
          position:absolute;inset:0;pointer-events:none;z-index:0;
          background:radial-gradient(ellipse at 80% 10%, rgba(235,17,67,0.10) 0%, transparent 55%);
        }
        .exec-slide{
          position:absolute;inset:0;display:flex;z-index:1;
          opacity:0;visibility:hidden;
          transition:opacity .65s cubic-bezier(.22,1,.36,1), visibility 0s linear .65s;
        }
        .exec-slide.exec-active{
          opacity:1;visibility:visible;z-index:2;
          transition:opacity .65s cubic-bezier(.22,1,.36,1);
        }
        .exec-slide-content{
          position:relative;z-index:2;flex:1 1 54%;min-width:0;
          display:flex;flex-direction:column;justify-content:center;
          padding:clamp(2.5rem,10vw,13rem);padding-bottom:7.5rem;
        }
        .exec-slide-portrait{position:relative;flex:1 1 46%;min-width:0;overflow:hidden;}
        .exec-slide.exec-active .exec-slide-portrait{animation:exec-zoom 1.2s cubic-bezier(.22,1,.36,1) both;}
        .exec-portrait-fade{
          position:absolute;inset:0;z-index:1;pointer-events:none;
          background:linear-gradient(to right,#000000 0%,rgba(0,0,0,.45) 32%,transparent 62%),
                     linear-gradient(to top,#000000 0%,transparent 32%);
        }
        .exec-slide .exec-anim{opacity:0;}
        .exec-slide.exec-active .exec-anim{animation:exec-rise .6s cubic-bezier(.22,1,.36,1) both;}
        .exec-slide.exec-active .exec-anim:nth-child(1){animation-delay:.10s;}
        .exec-slide.exec-active .exec-anim:nth-child(2){animation-delay:.16s;}
        .exec-slide.exec-active .exec-anim:nth-child(3){animation-delay:.22s;}
        .exec-slide.exec-active .exec-anim:nth-child(4){animation-delay:.28s;}
        .exec-slide.exec-active .exec-anim:nth-child(5){animation-delay:.34s;}
        .exec-slide.exec-active .exec-anim:nth-child(6){animation-delay:.40s;}
        .exec-eyebrow{
          display:inline-flex;align-items:center;gap:.5rem;align-self:flex-start;
          font-family:ui-monospace,Menlo,monospace;font-size:.65rem;letter-spacing:.22em;
          text-transform:uppercase;font-weight:700;color:#E31B54;margin-bottom:1.2rem;
        }
        .exec-eyebrow-dot{width:5px;height:5px;border-radius:50%;background:#E31B54;flex-shrink:0;animation:epulse 2s ease-in-out infinite;}
        .exec-name{
          font-size:clamp(1.9rem,4.2vw,3.4rem);font-weight:700;letter-spacing:-.03em;line-height:1.05;
          background:linear-gradient(135deg,#f1f5f9 0%,rgba(241,245,249,.6) 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          margin:0 0 .9rem;
        }
        .exec-title{
          font-family:ui-monospace,Menlo,monospace;font-size:.78rem;color:#E31B54;font-weight:700;
          letter-spacing:.14em;text-transform:uppercase;margin:0 0 1rem;
        }
        .exec-role{
          align-self:flex-start;font-family:ui-monospace,Menlo,monospace;font-size:.62rem;
          letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.35);
          border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.04);
          padding:5px 12px;border-radius:4px;margin-bottom:1.4rem;
        }
        .exec-bio{
          font-size:.92rem;line-height:1.9;color:rgba(255,255,255,.5);max-width:68ch;margin:0 0 1.9rem;
          display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;
        }
        .exec-actions{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap;}
        .exec-counter{
          position:absolute;top:clamp(96px,12vh,116px);right:clamp(2.5rem,10vw,13rem);z-index:5;
          font-family:ui-monospace,Menlo,monospace;font-size:.65rem;letter-spacing:.2em;color:rgba(255,255,255,.4);
        }
        .exec-controls{
          position:absolute;left:0;right:0;bottom:0;z-index:5;
          display:flex;align-items:center;justify-content:space-between;gap:1rem;
          padding:1rem clamp(2.5rem,10vw,13rem);
          border-top:1px solid rgba(255,255,255,.07);
          background:rgba(0,0,0,.6);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
        }
        .exec-dots{display:flex;align-items:center;gap:1.4rem;min-width:0;}
        .exec-dot{display:flex;flex-direction:column;align-items:flex-start;gap:6px;background:none;border:none;cursor:pointer;padding:4px 0;min-width:0;}
        .exec-dot-name{
          font-family:ui-monospace,Menlo,monospace;font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;
          color:rgba(255,255,255,.3);transition:color .25s ease;white-space:nowrap;
        }
        .exec-dot:hover .exec-dot-name{color:rgba(255,255,255,.7);}
        .exec-dot.exec-active .exec-dot-name{color:#f1f5f9;}
        .exec-dot-track{display:block;width:56px;height:2px;border-radius:2px;background:rgba(255,255,255,.14);overflow:hidden;}
        .exec-dot-fill{display:block;width:100%;height:100%;background:#E31B54;transform:scaleX(0);transform-origin:left;}
        .exec-dot.exec-active .exec-dot-fill{animation:exec-progress 6.5s linear forwards;}
        .exec-carousel.exec-paused .exec-dot-fill{animation-play-state:paused;}
        .exec-arrows{display:flex;gap:.6rem;flex-shrink:0;}
        .exec-arrow{
          width:42px;height:42px;border-radius:50%;
          border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:rgba(255,255,255,.6);
          display:inline-flex;align-items:center;justify-content:center;cursor:pointer;
          transition:border-color .25s ease,color .25s ease,background .25s ease,transform .25s ease;
        }
        .exec-arrow:hover{border-color:rgba(227,27,84,.6);color:#fff;background:rgba(227,27,84,.12);transform:translateY(-1px);}

        @media(max-width:767px){
          .exec-carousel{height:100dvh;}
          .exec-slide-portrait{position:absolute;inset:0;flex:none;}
          .exec-portrait-fade{
            background:linear-gradient(to top,#000000 22%,rgba(0,0,0,.55) 55%,rgba(0,0,0,.15) 100%);
          }
          .exec-slide-content{position:absolute;inset:0;justify-content:flex-end;padding:1.5rem 1.4rem 6.75rem;}
          .exec-name{font-size:1.7rem;}
          .exec-bio{font-size:.85rem;line-height:1.7;margin-bottom:1.4rem;}
          .exec-role{display:none;}
          .exec-counter{top:82px;right:1.2rem;}
          .exec-dots{gap:1rem;}
          .exec-dot-name{display:none;}
          .exec-dot-track{width:34px;}
          .exec-arrow{width:38px;height:38px;}
          .exec-controls{padding:.85rem 1.2rem;}
        }

        /* ── Scroll hint — bottom-center tooltip, dismissed on scroll ── */
        @keyframes exec-arrow-bob{
          0%,100%{transform:translateY(-1px);opacity:.95;}
          50%{transform:translateY(4px);opacity:.45;}
        }
        .exec-scroll-hint{
          position:absolute;left:50%;bottom:96px;transform:translateX(-50%);z-index:6;
          display:inline-flex;align-items:center;gap:9px;
          padding:9px 16px;border-radius:999px;
          border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.55);
          backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
          font-family:ui-monospace,Menlo,monospace;font-size:.6rem;letter-spacing:.22em;
          text-transform:uppercase;color:rgba(255,255,255,.5);
          pointer-events:none;
          transition:opacity .5s ease,transform .5s ease;
        }
        .exec-scroll-hint .exec-scroll-arrow{color:#E31B54;animation:exec-arrow-bob 1.6s ease-in-out infinite;flex-shrink:0;}
        .exec-scroll-hint.exec-hidden{opacity:0;transform:translateX(-50%) translateY(10px);}

        /* ── Founders overview grid (below the banner) ── */
        .exec-overview{
          position:relative;background:#000000;
          padding:5rem clamp(2.5rem,10vw,13rem) 6.5rem;
        }
        .exec-overview-title{
          margin:0 0 3rem;font-size:clamp(1.5rem,3vw,2.25rem);font-weight:700;
          letter-spacing:-.02em;line-height:1.1;
          background:linear-gradient(135deg,#f1f5f9 0%,rgba(241,245,249,.6) 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .exec-overview-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;}
        .exec-ov-card{cursor:pointer;min-width:0;outline:none;}
        .exec-ov-portrait{
          position:relative;width:100%;aspect-ratio:3/4;overflow:hidden;
          background:linear-gradient(170deg,#0a0a0a 0%,#101010 100%);
        }
        .exec-ov-img{filter:grayscale(100%) brightness(.88);transition:filter .45s cubic-bezier(.4,0,.2,1),transform .6s cubic-bezier(.22,1,.36,1);}
        .exec-ov-card:hover .exec-ov-img,
        .exec-ov-card:focus-visible .exec-ov-img{filter:grayscale(0%) brightness(1);transform:scale(1.03);}
        .exec-ov-eyebrow{
          display:block;margin:2.4rem 0 0;
          font-family:ui-monospace,Menlo,monospace;font-size:.6rem;letter-spacing:.18em;
          text-transform:uppercase;font-weight:700;color:#E31B54;
        }
        .exec-ov-name{
          margin:.7rem 0 0;font-size:1.2rem;font-weight:700;letter-spacing:-.01em;
          color:#f1f5f9;line-height:1.25;
        }
        .exec-ov-bio{
          margin:1rem 0 0;padding-right:1.75rem;
          font-size:.85rem;line-height:1.9;color:rgba(255,255,255,.45);
        }
        /* Light mode — overview section follows the page theme
           (the banner above stays always-dark). */
        :root.light .exec-overview{background:#f8fafc;}
        :root.light .exec-overview-title{
          background:linear-gradient(135deg,#0f172a 0%,rgba(15,23,42,.65) 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        :root.light .exec-ov-portrait{background:linear-gradient(170deg,#e2e8f0 0%,#cbd5e1 100%);}
        :root.light .exec-ov-name{color:#0f172a;}
        :root.light .exec-ov-bio{color:rgba(0,0,0,.55);}

        @media(max-width:1023px){
          .exec-overview-grid{grid-template-columns:repeat(2,1fr);gap:2px;row-gap:3.5rem;}
        }
        @media(max-width:639px){
          .exec-overview{padding:3.5rem 1.4rem 5rem;}
          .exec-overview-title{margin-bottom:2rem;}
          .exec-overview-grid{grid-template-columns:1fr;row-gap:3rem;}
          .exec-ov-eyebrow{margin-top:1.5rem;}
          .exec-ov-bio{padding-right:0;}
        }
        /* ── Modal social grid — navbar-style icon pills
           (LinkedIn / IG / X / GitHub), same system as search/theme/hide ── */
        .fc-modal-socials{
          display:grid;grid-template-columns:repeat(4,auto);gap:8px;flex-shrink:0;
        }
        .fc-modal-social-tile{
          width:40px;height:40px;padding:0 !important;
          align-items:center;justify-content:center;
        }
        .fc-modal-scroll{
          overflow-y:auto;
          overscroll-behavior:contain;
        }

        /* ── Mobile modal layout ── */
        @media(max-width:767px){
          .fc-modal-panel{flex-direction:column !important;}
          .fc-modal-top-row{
            display:flex !important;flex-direction:row !important;
            border-bottom:1px solid rgba(255,255,255,.08);
            min-height:160px;
          }
          .fc-modal-portrait-mobile{
            position:relative;width:30%;min-width:30%;max-width:30%;flex-shrink:0;
            overflow:hidden;
            background:linear-gradient(170deg,#0a0a0a 0%,#101010 100%);
          }
          .fc-modal-title-mobile{
            position:relative;z-index:1;
            flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;
            padding:1rem 1rem;min-width:0;width:70%;
          }
          .fc-modal-chip{display:none !important;}
          .fc-modal-role-tag{display:none !important;}
          .fc-modal-divider{display:none !important;}
          .fc-modal-info{
            border-left:none !important;
            padding:0 !important;
          }
          .fc-modal-scroll{padding:1.25rem 1.25rem 1rem !important;}
          .fc-modal-outer{width:100% !important;max-width:100% !important;height:92dvh !important;margin:0 8px;border-radius:16px;}
          .fc-modal-panel{border-radius:16px !important;border:1px solid rgba(255,255,255,.10) !important;}
          .fc-modal-gradient-border{border-radius:16px;padding:1px;}
          .fc-modal-socials{gap:6px;margin-top:14px;}
          .fc-modal-social-tile{width:33px;height:33px;}
          .fc-modal-social-tile svg{width:12px;height:12px;}
        }
        @media(min-width:768px){
          .fc-modal-top-row{display:contents !important;}
          .fc-modal-portrait-mobile{
            position:relative;width:320px;min-width:320px;flex-shrink:0;
            overflow:hidden;
            background:linear-gradient(170deg,#0a0a0a 0%,#101010 100%);
          }
          .fc-modal-title-mobile{display:none !important;}
          .fc-modal-desktop-header{display:flex;}
        }
        @media(max-width:767px){
          .fc-modal-desktop-header{display:none !important;}
        }

        .fc-modal-outer {
          position:relative; display:flex; flex-direction:column;
          width:70vw; max-width:none; height:100dvh; border-radius:0;
          margin:0 auto;
          transform-origin: center bottom;
        }
        .fc-modal-gradient-border {
          position:absolute; inset:0; border-radius:0; padding:0 1px;
          opacity:0; transition:opacity .4s ease; pointer-events:none; z-index:10;
          background:radial-gradient(700px circle at var(--mx,50%) var(--my,50%), rgba(0,255,166,.7),rgba(255,215,0,.5),rgba(236,72,153,.5),rgba(147,51,234,.5),rgba(59,130,246,.4),transparent 65%);
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude;
        }
        .fc-modal-outer:hover .fc-modal-gradient-border { opacity:1; }

        /* Modal is always dark — matches the banner; only the page grid
           backdrop changes in light mode. */
        :root.light .teams-root::before{ display: none; }

        @keyframes modal-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modal-panel-in {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(16px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }
        .fc-modal-overlay {
          animation: modal-overlay-in 0.2s ease both;
        }
        .fc-modal-outer {
          animation: modal-panel-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

      `}</style>

      <div style={{ paddingBottom: '8rem' }}>
        <section id="section-executives" className="teams-root">
          <div className="founders-section" ref={foundersReveal.ref} style={foundersReveal.style} data-nosnippet>
            <ExecCarousel onExpand={handleExpand} />
          </div>

          {/* ── Founders overview grid ── */}
          <div className="exec-overview" data-nosnippet>
            <h2 className="exec-overview-title">Notus Executives</h2>
            <div className="exec-overview-grid">
              {FOUNDERS.map(f => (
                <article
                  key={f.id}
                  className="exec-ov-card"
                  onClick={() => handleExpand(f)}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleExpand(f); } }}
                >
                  <div className="exec-ov-portrait">
                    {f.src ? (
                      <Image src={f.src} alt={f.name} fill className="exec-ov-img" style={{ objectFit: 'cover', objectPosition: 'center top' }} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw" />
                    ) : (
                      <div className="fc-dot-grid" />
                    )}
                  </div>
                  <span className="exec-ov-eyebrow">{f.title}</span>
                  <h3 className="exec-ov-name">{f.name}</h3>
                  <p className="exec-ov-bio">{f.bio}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {activeFounder && <FounderModal founder={activeFounder} onClose={handleClose} />}
    </>
  );
};

export default memo(Executives);
