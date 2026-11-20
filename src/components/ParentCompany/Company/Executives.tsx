"use client";
import React, { memo, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FOUNDERS, executiveHref } from '@/data/Company-data';
import { useReveal } from '@/hooks/useScrollReveal';

/* Open an executive's dedicated profile inline (replacing the Executives page)
   rather than navigating to the standalone route. The Links keep their real
   href so SEO crawlers and modified clicks (⌘/ctrl/middle → new tab) still work;
   a plain left-click is intercepted and handled in-page by Company/index.tsx. */
const openExecutiveInline = (slug: string) => (e: React.MouseEvent) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  window.dispatchEvent(new CustomEvent('executive-open', { detail: { slug } }));
};

/* Collapse the (now multi-paragraph) bio into a short card preview, cut on a
   word boundary so the "… Learn more." tail reads cleanly. */
const bioPreview = (bio: string, max = 180) => {
  const flat = bio.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—-]+$/, '').trim();
};

/* ─────────────────────────────────────────
   EXECUTIVE CAROUSEL — landing banner
───────────────────────────────────────── */
const ExecCarousel = memo(() => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = FOUNDERS.length;

  const next = useCallback(() => setIndex(i => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex(i => (i - 1 + count) % count), [count]);

  // Drives the cursor-following gradient border on the brand (hero) CTA button.
  const handleBtnMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

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
            <h3 className="exec-anim exec-name">{f.name}</h3>
            <p className="exec-anim exec-title">{f.title}</p>
            <span className="exec-anim exec-role">{f.role}</span>
            <p className="exec-anim exec-bio">{f.bio}</p>
            <div className="exec-anim exec-actions">
              <Link href={executiveHref(f.slug)} onClick={openExecutiveInline(f.slug)} onMouseMove={handleBtnMouseMove} className="exec-cta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                  <path d="M15 3h6m0 0v6m0-6-7 7M9 21H3m0 0v-6m0 6 7-7" />
                </svg>
                <span>View Profile</span>
              </Link>
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
      </div>
    </div>
  );
});
ExecCarousel.displayName = 'ExecCarousel';

/* ─────────────────────────────────────────
   EXECUTIVES SECTION
───────────────────────────────────────── */
const Executives = () => {
  /* ── Scroll-triggered reveal ── */
  const foundersReveal = useReveal('fade-up', { threshold: 0.1, duration: 800 });

  return (
    <>
      <style>{`

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
        /* View Profile — the site's hero white CTA button. The gradient border
           follows the cursor via --mouse-x / --mouse-y. */
        .exec-cta{
          --btn-surface:radial-gradient(ellipse at bottom, rgba(255,255,255,1) 0%, rgba(226,229,233,1) 48%);
          --btn-text:rgba(0,0,0,0.66);
          --btn-text-hover:rgba(0,0,0,1);
          --btn-inset:rgba(0,0,0,0.12);
          --btn-line:linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 100%);
          position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
          padding:12px 22px;border:0;border-radius:7px;text-decoration:none;
          font-size:.9rem;font-weight:500;line-height:1;cursor:pointer;
          box-shadow:inset 0 0 0 1px var(--btn-inset);
          background:var(--btn-surface);color:var(--btn-text);
          transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s cubic-bezier(.22,1,.36,1),color .35s ease;
        }
        .exec-cta > *{position:relative;z-index:1;}
        .exec-cta svg{flex-shrink:0;}
        .exec-cta::before{
          content:'';width:70%;height:1px;position:absolute;bottom:0;left:15%;
          background:var(--btn-line);opacity:.2;transition:opacity .35s ease;
        }
        .exec-cta:hover{
          color:var(--btn-text-hover);transform:translateY(-2px);
          box-shadow:inset 0 0 0 1px var(--btn-inset),0 6px 18px -6px rgba(0,0,0,0.45);
        }
        .exec-cta:hover::before{opacity:1;}
        .exec-cta::after{
          content:'';position:absolute;inset:-1.5px;border-radius:8.5px;padding:1px;
          background:radial-gradient(180px circle at var(--mouse-x,50%) var(--mouse-y,50%),
            rgba(0,255,166,0.9),rgba(255,215,0,0.7),rgba(236,72,153,0.7),rgba(147,51,234,0.6),rgba(59,130,246,0.5),transparent 70%);
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;mask-composite:exclude;
          opacity:0;transition:opacity .3s ease;pointer-events:none;z-index:0;
        }
        .exec-cta:hover::after{opacity:1;}
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
          .exec-controls{padding:.85rem 1.2rem;}
        }

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
        .exec-overview-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;row-gap:3.5rem;}
        .exec-ov-card{display:block;cursor:pointer;min-width:0;outline:none;text-decoration:none;color:inherit;}
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
          text-align:justify;text-justify:inter-word;hyphens:auto;
        }
        .exec-ov-more{
          color:rgba(255,255,255,.85);font-weight:500;white-space:nowrap;
          text-decoration:underline;text-underline-offset:2px;
          transition:color .25s ease;
        }
        .exec-ov-soon{cursor:default;}
        .exec-ov-soon-badge{
          position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          font-family:ui-monospace,Menlo,monospace;font-size:.65rem;letter-spacing:.2em;
          text-transform:uppercase;color:rgba(255,255,255,.45);
        }
        :root.light .exec-ov-soon-badge{color:rgba(0,0,0,.45);}
        .exec-ov-card:hover .exec-ov-more,
        .exec-ov-card:focus-visible .exec-ov-more{color:#fff;}
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
        :root.light .exec-ov-more{color:rgba(0,0,0,.82);}

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
        /* The banner stays always-dark; only the page grid backdrop
           changes in light mode. */
        :root.light .teams-root::before{ display: none; }

      `}</style>

      <div style={{ paddingBottom: '8rem' }}>
        <section id="section-executives" className="teams-root">
          <div className="founders-section" ref={foundersReveal.ref} style={foundersReveal.style} data-nosnippet>
            <ExecCarousel />
          </div>

          {/* ── Founders overview grid ── */}
          <div className="exec-overview" data-nosnippet>
            <h2 className="exec-overview-title">Notus Executives</h2>
            <div className="exec-overview-grid">
              {FOUNDERS.map(f => (
                <Link
                  key={f.id}
                  href={executiveHref(f.slug)}
                  onClick={openExecutiveInline(f.slug)}
                  className="exec-ov-card"
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
                  <p className="exec-ov-bio">{bioPreview(f.bio)}… <span className="exec-ov-more">Learn more.</span></p>
                </Link>
              ))}
              {/* Placeholder seats for executives not yet announced. */}
              {Array.from({ length: 7 },(_, i) => (
                <div key={`coming-soon-${i}`} className="exec-ov-card exec-ov-soon" aria-label="Executive coming soon">
                  <div className="exec-ov-portrait">
                    <div className="fc-dot-grid" />
                    <span className="exec-ov-soon-badge">Coming Soon</span>
                  </div>
                  <span className="exec-ov-eyebrow">To Be Announced</span>
                  <h3 className="exec-ov-name">Coming Soon</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default memo(Executives);
