"use client";
import { memo } from 'react';
import { motion } from 'framer-motion';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ShaderAnimation } from '@/components/ui/shader-lines';

interface SubtabHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: string;
  link?: { label: string; href: string };
  cta?: { label: string; href?: string; scrollTo?: string };
  /** When true, render a split hero (text left · animated background right). */
  hero?: boolean;
}

const scrollToId = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  const sm = typeof window !== 'undefined' ? ScrollSmoother.get?.() : null;
  if (sm) sm.scrollTo(el, true, 'top top');
  else el.scrollIntoView({ behavior: 'smooth' });
};

// Intercept in-app Information Central links and route via the client SPA
// (preserving the strip/breadcrumb state) instead of a full page reload.
const infoNavigate = (href: string) => (e: React.MouseEvent) => {
  const m = href.match(/^\/information(?:\/([^/?#]+))?(?:\/([^/?#]+))?/);
  if (!m) return;
  e.preventDefault();
  window.dispatchEvent(new CustomEvent('info-navigate', { detail: { tabId: m[1], subtabId: m[2] } }));
};
const isInfoLink = (href?: string) => !!href && href.startsWith('/information');

const handleBtnMouseMove = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
};

// White CTA surface — mirrors the home hero's "Get Started" button.
const CTA_BTN_STYLE = {
  '--btn-surface': 'radial-gradient(ellipse at bottom, rgba(255,255,255,1) 0%, rgba(226,229,233,1) 48%)',
  '--btn-text': 'rgba(0,0,0,0.66)',
  '--btn-text-hover': 'rgba(0,0,0,1)',
  '--btn-inset': 'rgba(0,0,0,0.12)',
  '--btn-line': 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 100%)',
} as React.CSSProperties;

const HeadingMark = ({ title }: { title: string }) => (
  <h1
    className="font-bold"
    style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #c7ccd6 60%, #9aa0ab 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: 1.15,
      filter: 'drop-shadow(0 4px 22px rgba(0,0,0,0.75)) drop-shadow(0 1px 4px rgba(0,0,0,0.6))',
    }}
  >
    {title}
  </h1>
);

// ── Split hero: text on the left, animated shader background on the right ──
const HeroHeader = ({ title, description, link, cta }: Omit<SubtabHeaderProps, 'hero' | 'eyebrow' | 'icon'>) => (
  <section
    className="relative w-full overflow-hidden flex items-center min-h-[600px] md:min-h-[100svh]"
    style={{ background: '#050505' }}
  >
    {/* Right — animated shader background.
        `contain: paint` clips the WebGL canvas to this box so it can't leak past
        the hero during GSAP ScrollSmoother's transform-based scroll (the canvas
        is its own GPU layer and otherwise escapes the ancestor's overflow clip). */}
    <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 overflow-hidden" style={{ contain: 'paint' }}>
      <ShaderAnimation />
      {/* Fade the shader into the dark text side (and at the edges) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, #050505 0%, rgba(5,5,5,0.85) 22%, rgba(5,5,5,0.25) 55%, transparent 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
        style={{ background: 'linear-gradient(to bottom, transparent, #050505)' }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{ background: 'linear-gradient(to top, transparent, #050505)' }}
      />
    </div>

    {/* Black gradient shadow — smooths the seam into the open-roles section below.
        Spans the full width above everything so the hero dissolves into pure black. */}
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 sm:h-56"
      style={{
        background:
          'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.8) 78%, #000000 100%)',
      }}
    />

    {/* Left — text. Inset = global brand gutter so it lines up with the navbar/content. */}
    <div
      className="relative z-10 w-full pt-28 pb-16 sm:py-20"
      style={{ paddingLeft: 'var(--site-gutter-inline)', paddingRight: 'var(--site-gutter-inline)' }}
    >
      <motion.div
        className="max-w-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="text-3xl sm:text-5xl lg:text-6xl">
          <HeadingMark title={title} />
        </div>
        <p
          className="mt-6 text-base sm:text-lg lg:text-xl leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.72)', textShadow: '0 2px 14px rgba(0,0,0,0.7)' }}
        >
          {description}
        </p>
        {(cta || link) && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {/* Primary CTA — white brand button */}
            {cta && (
              <a
                href={cta.scrollTo ? `#${cta.scrollTo}` : (cta.href ?? '#')}
                onClick={cta.scrollTo ? scrollToId(cta.scrollTo) : (isInfoLink(cta.href) ? infoNavigate(cta.href!) : undefined)}
                target={cta.href && !cta.href.startsWith('/') ? '_blank' : undefined}
                rel={cta.href && !cta.href.startsWith('/') ? 'noopener noreferrer' : undefined}
                className="brand-btn"
                onMouseMove={handleBtnMouseMove}
                style={CTA_BTN_STYLE}
              >
                <span>{cta.label}</span>
                <i className="bi bi-arrow-down text-xs" />
              </a>
            )}
            {/* Secondary — default dark brand button */}
            {link && (
              <a
                href={link.href}
                onClick={isInfoLink(link.href) ? infoNavigate(link.href) : undefined}
                target={link.href.startsWith('/') ? undefined : '_blank'}
                rel={link.href.startsWith('/') ? undefined : 'noopener noreferrer'}
                className="brand-btn"
                onMouseMove={handleBtnMouseMove}
              >
                <span>{link.label}</span>
                <i className="bi bi-arrow-right text-xs" />
              </a>
            )}
          </div>
        )}
      </motion.div>
    </div>
  </section>
);

const SubtabHeader = memo(({ eyebrow, title, description, icon, link, cta, hero }: SubtabHeaderProps) => {
  if (hero) return <HeroHeader title={title} description={description} link={link} cta={cta} />;

  return (
    <section
      className="relative w-full overflow-hidden flex flex-col justify-center min-h-[380px] sm:min-h-[440px] lg:min-h-[480px]"
      style={{
        background: '#050505',
        borderBottom: '1px dashed var(--border-dashed)',
      }}
    >
      {/* Animated shader-lines background — wrapped so `contain: paint` keeps the
          WebGL canvas from leaking past the header during smooth-scroll transforms. */}
      <div className="absolute inset-0 overflow-hidden" style={{ contain: 'paint' }}>
        <ShaderAnimation />
      </div>

      {/* Dark overlay for text legibility over the shader */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(4,5,10,0.35) 0%, rgba(4,5,10,0.72) 70%, rgba(4,5,10,0.92) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{ background: 'linear-gradient(to bottom, transparent, #050505)' }}
      />

      <div
        className="relative z-10 w-full pt-24 sm:pt-28 lg:pt-28 pb-12 sm:pb-14"
        style={{ paddingLeft: 'var(--site-gutter-inline)', paddingRight: 'var(--site-gutter-inline)' }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            {eyebrow && (
              <div className="flex items-center justify-center gap-2 mb-4">
                {icon && <i className={`bi ${icon} text-sm`} style={{ color: 'rgba(255,255,255,0.65)', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }} />}
                <span
                  className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em]"
                  style={{ color: 'rgba(255,255,255,0.65)', textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
                >
                  {eyebrow}
                </span>
              </div>
            )}

            <div className="text-3xl sm:text-5xl lg:text-6xl">
              <HeadingMark title={title} />
            </div>

            <p
              className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed max-w-5xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.72)', textShadow: '0 2px 14px rgba(0,0,0,0.7)' }}
            >
              {description}
            </p>

            {link && (
              <a
                href={link.href}
                target={link.href.startsWith('/') ? undefined : '_blank'}
                rel={link.href.startsWith('/') ? undefined : 'noopener noreferrer'}
                className="mt-6 inline-flex items-center gap-1.5 text-sm sm:text-base font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
                style={{ color: 'rgba(255,255,255,0.9)', textDecorationColor: 'rgba(255,255,255,0.4)', textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
              >
                {link.label}
                <i className="bi bi-arrow-right text-xs" />
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
});

SubtabHeader.displayName = 'SubtabHeader';
export default SubtabHeader;
