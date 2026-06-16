"use client";
import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { statements, type Statement } from '@/data/information-data';
import styles from '@/styles/ui.module.css';
import type {
  ContentBlock, CardItem, DocItem, StatItem, PersonItem, PublicationItem,
} from '../data';
import {
  getConsent, setConsent, getPreferences, setPreferences,
  clearConsent, clearPreferences, clearSiteCache,
} from '@/utils/consent';

// ─────────────────────────────────────────────────────────────
//  Shared block heading
// ─────────────────────────────────────────────────────────────
const BlockHeading = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-5 sm:mb-6"
    style={{ color: 'var(--content-primary)' }}
  >
    {children}
  </h3>
);

// ─────────────────────────────────────────────────────────────
//  Releases — accordion over the shared `statements` data
// ─────────────────────────────────────────────────────────────
const ReleaseItem = memo(({ statement, isOpen, onToggle }: {
  statement: Statement; isOpen: boolean; onToggle: () => void;
}) => {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const handleMove = (e: MouseEvent) => {
      const rect = box.getBoundingClientRect();
      box.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      box.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };
    box.addEventListener('mousemove', handleMove);
    return () => box.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div ref={boxRef} className={`${styles.notificationBox} group`}>
      <div className={styles.boxInner}>
        <button onClick={onToggle} className="w-full text-left focus:outline-none" aria-expanded={isOpen}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <h4
              className="flex-1 pr-4 font-semibold text-base sm:text-lg lg:text-xl leading-tight"
              style={{ color: 'var(--content-secondary)' }}
            >
              {statement.title}
            </h4>
            <div className="flex-shrink-0 flex items-center gap-3">
              {(statement.pdfUrl || statement.linkUrl) && (
                <div className="flex items-center gap-2">
                  {statement.pdfUrl && (
                    <a
                      href={statement.pdfUrl}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-60 hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--content-secondary)' }}
                      aria-label="Download PDF"
                    >
                      <i className="bi bi-file-earmark-pdf text-base" />
                    </a>
                  )}
                  {statement.linkUrl && (
                    <a
                      href={statement.linkUrl}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-60 hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--content-secondary)' }}
                      aria-label="Open link"
                    >
                      <i className="bi bi-box-arrow-up-right text-sm" />
                    </a>
                  )}
                </div>
              )}
              <i
                className={`bi bi-chevron-down text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--content-muted)' }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs sm:text-sm" style={{ color: 'var(--content-muted)' }}>
              {statement.date}
            </span>
            {statement.tags.map((tag) => (
              <span
                key={tag}
                className="text-[0.65rem] sm:text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--hover-bg)', color: 'var(--content-muted)', border: '1px solid var(--border-color)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </button>

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: isOpen ? '480px' : '0', opacity: isOpen ? 1 : 0 }}
        >
          <p
            className="pt-3 text-sm sm:text-base lg:text-lg leading-relaxed"
            style={{ color: 'var(--content-muted)' }}
          >
            {statement.content}
          </p>
        </div>
      </div>
    </div>
  );
});
ReleaseItem.displayName = 'ReleaseItem';

const ReleasesBlock = memo(() => {
  const [openId, setOpenId] = useState<string | null>(statements[0]?.id ?? null);
  return (
    <div className="space-y-4 sm:space-y-5">
      {statements.map((s) => (
        <ReleaseItem
          key={s.id}
          statement={s}
          isOpen={openId === s.id}
          onToggle={() => setOpenId((prev) => (prev === s.id ? null : s.id))}
        />
      ))}
    </div>
  );
});
ReleasesBlock.displayName = 'ReleasesBlock';

// ─────────────────────────────────────────────────────────────
//  Text
// ─────────────────────────────────────────────────────────────
// ── Inline markdown-style links: "[label](href)" inside copy ──
// Internal paths navigate in place; http(s) and document/mailto
// targets open per the same conventions used by card hrefs.
const renderInline = (text: string) => {
  const parts = text.split(/(\[[^\]]+\]\([^)\s]+\))/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (!m) return part;
    const [, label, href] = m;
    const newTab = href.startsWith('http') || href.startsWith('/documents') || href.startsWith('mailto');
    return (
      <a
        key={i}
        href={href}
        target={newTab && !href.startsWith('mailto') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="underline underline-offset-2 transition-opacity hover:opacity-75"
        style={{ color: 'var(--content-secondary)', textDecorationColor: 'var(--border-color)' }}
      >
        {label}
      </a>
    );
  });
};

const TextBlock = ({ heading, paragraphs }: { heading?: string; paragraphs: string[] }) => (
  <div>
    {heading && <BlockHeading>{heading}</BlockHeading>}
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--content-muted)' }}>
          {renderInline(p)}
        </p>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  Stats
// ─────────────────────────────────────────────────────────────
const StatsBlock = ({ heading, items }: { heading?: string; items: StatItem[] }) => (
  <div>
    {heading && <BlockHeading>{heading}</BlockHeading>}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {items.map((s, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 sm:p-6 text-center"
          style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}
        >
          <div
            className="text-2xl sm:text-3xl lg:text-4xl font-bold"
            style={{ background: 'var(--text-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            {s.value}
          </div>
          <div className="mt-2 text-sm sm:text-base font-medium" style={{ color: 'var(--content-secondary)' }}>{s.label}</div>
          {s.sub && <div className="mt-0.5 text-xs sm:text-sm" style={{ color: 'var(--content-muted)' }}>{s.sub}</div>}
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  Cards
// ─────────────────────────────────────────────────────────────
const CardsBlock = ({ heading, columns = 3, items }: { heading?: string; columns?: 2 | 3; items: CardItem[] }) => {
  const colClass = columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <div>
      {heading && <BlockHeading>{heading}</BlockHeading>}
      <div className={`grid grid-cols-1 ${colClass} gap-4 sm:gap-5`}>
        {items.map((c, i) => {
          const inner = (
            <div
              className="h-full rounded-2xl p-5 sm:p-6 flex flex-col transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                {c.icon && (
                  <span
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                    style={{ background: 'var(--hover-bg)', color: 'var(--content-secondary)' }}
                  >
                    <i className={`bi ${c.icon} text-lg`} />
                  </span>
                )}
                {c.tag && (
                  <span
                    className="text-[0.65rem] sm:text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--hover-bg)', color: 'var(--content-muted)', border: '1px solid var(--border-color)' }}
                  >
                    {c.tag}
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-base sm:text-lg leading-snug" style={{ color: 'var(--content-primary)' }}>{c.title}</h4>
              {c.meta && <div className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--content-muted)' }}>{c.meta}</div>}
              {/* Only parse inline links when the card itself isn't an anchor (no nested <a>) */}
              {c.body && <p className="mt-3 text-sm sm:text-base leading-relaxed flex-1" style={{ color: 'var(--content-muted)' }}>{c.href ? c.body : renderInline(c.body)}</p>}
              {c.cta && (
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--content-secondary)' }}>
                  {c.cta}
                  <i className="bi bi-arrow-right text-xs" />
                </div>
              )}
            </div>
          );
          return c.href ? (
            <a
              key={i}
              href={c.href}
              target={c.href.startsWith('http') || c.href.startsWith('/documents') || c.href.startsWith('mailto') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="block"
            >
              {inner}
            </a>
          ) : (
            <div key={i}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  Documents grid
// ─────────────────────────────────────────────────────────────
const DocumentsBlock = ({ heading, items }: { heading?: string; items: DocItem[] }) => (
  <div>
    {heading && <BlockHeading>{heading}</BlockHeading>}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {items.map((doc, i) => (
        <a
          key={i}
          href={`/documents/${doc.filename}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1"
          style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl" style={{ background: 'var(--hover-bg)', color: 'var(--content-secondary)' }}>
              <i className="bi bi-file-earmark-text text-xl" />
            </span>
            <span className="text-xs" style={{ color: 'var(--content-muted)' }}>{doc.year}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm sm:text-base leading-snug" style={{ color: 'var(--content-primary)' }}>{doc.title}</h4>
            {doc.description && (
              <p className="mt-2 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--content-muted)' }}>{doc.description}</p>
            )}
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--content-secondary)' }}>
            <i className="bi bi-download" /> Download PDF
          </div>
        </a>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  People
// ─────────────────────────────────────────────────────────────
const PeopleBlock = ({ heading, items }: { heading?: string; items: PersonItem[] }) => (
  <div>
    {heading && <BlockHeading>{heading}</BlockHeading>}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {items.map((p, i) => (
        <div key={i} className="rounded-2xl p-5 sm:p-6" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full" style={{ background: 'var(--hover-bg)', color: 'var(--content-secondary)' }}>
              <i className="bi bi-people text-xl" />
            </span>
            <div>
              <div className="font-semibold text-base" style={{ color: 'var(--content-primary)' }}>{p.name}</div>
              <div className="text-xs sm:text-sm" style={{ color: 'var(--content-muted)' }}>{p.role}</div>
            </div>
          </div>
          {p.bio && <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--content-muted)' }}>{p.bio}</p>}
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  Publications — publication / blog landing layout
// ─────────────────────────────────────────────────────────────
const PubMeta = ({ pub }: { pub: PublicationItem }) => (
  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm" style={{ color: 'var(--content-muted)' }}>
    <span
      className="px-2 py-0.5 rounded-full font-medium"
      style={{ background: 'var(--hover-bg)', color: 'var(--content-secondary)', border: '1px solid var(--border-color)' }}
    >
      {pub.category}
    </span>
    <span>{pub.date}</span>
    {pub.readTime && (<><span aria-hidden>·</span><span>{pub.readTime}</span></>)}
  </div>
);

const PublicationsBlock = ({ featured, items }: { featured: PublicationItem; items: PublicationItem[] }) => {
  const featuredInner = (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}
    >
      {/* cover */}
      <div
        className="relative min-h-[220px] lg:min-h-[340px] flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(235,17,67,0.18) 0%, rgba(147,51,234,0.14) 50%, rgba(59,130,246,0.12) 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <i className="bi bi-journal-richtext" style={{ fontSize: '3.5rem', color: 'var(--content-secondary)', opacity: 0.7 }} />
        <span
          className="absolute top-4 left-4 text-[0.65rem] sm:text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', backdropFilter: 'blur(6px)' }}
        >
          Featured
        </span>
      </div>
      {/* text */}
      <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
        <PubMeta pub={featured} />
        <h3 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight" style={{ color: 'var(--content-primary)' }}>
          {featured.title}
        </h3>
        <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ color: 'var(--content-muted)' }}>
          {featured.excerpt}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--content-secondary)' }}>
          Read publication <i className="bi bi-arrow-right text-xs" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 sm:space-y-12">
      {featured.href ? (
        <a href={featured.href} target="_blank" rel="noopener noreferrer" className="block">{featuredInner}</a>
      ) : featuredInner}

      <div>
        <BlockHeading>Latest Publications</BlockHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {items.map((pub, i) => {
            const card = (
              <article
                className="h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}
              >
                <div
                  className="relative h-36 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', borderBottom: '1px solid var(--border-color)' }}
                >
                  <i className="bi bi-file-earmark-richtext" style={{ fontSize: '1.8rem', color: 'var(--content-muted)' }} />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <PubMeta pub={pub} />
                  <h4 className="mt-3 text-lg font-semibold leading-snug" style={{ color: 'var(--content-primary)' }}>{pub.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed flex-1" style={{ color: 'var(--content-muted)' }}>{pub.excerpt}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--content-secondary)' }}>
                    Read more <i className="bi bi-arrow-right text-xs" />
                  </div>
                </div>
              </article>
            );
            return pub.href ? (
              <a key={i} href={pub.href} target="_blank" rel="noopener noreferrer" className="block">{card}</a>
            ) : <div key={i}>{card}</div>;
          })}
        </div>
      </div>
    </div>
  );
};

// Brand button — mirrors the main hero's `.heroBtn` (subtle fill + animated
// gradient border revealed on hover, tracked to the cursor).
const BRAND_BTN_CSS = `
.nr-brand-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: var(--button-bg);
  box-shadow: var(--button-shadow);
  border: solid 1px var(--button-border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--content-secondary);
  transition: all 0.3s ease;
}
@media (min-width: 1024px) {
  .nr-brand-btn { padding: 0.75rem 2rem; font-size: 1rem; }
}
.nr-brand-btn::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 10px;
  padding: 1px;
  background: radial-gradient(
    200px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(0, 255, 166, 0.9),
    rgba(255, 215, 0, 0.7),
    rgba(236, 72, 153, 0.7),
    rgba(147, 51, 234, 0.6),
    rgba(59, 130, 246, 0.5),
    transparent 70%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}
.nr-brand-btn:hover::before { opacity: 1; }
.nr-brand-btn > * { position: relative; z-index: 1; }

/* Releases hero is always dark — force the dark token set even in light mode. */
.releases-hero,
:root.light .releases-hero {
  --surface-primary: #000000;
  --surface-elevated: rgba(15, 15, 15, 0.75);
  --content-primary: #ffffff;
  --content-secondary: #d4d4d4;
  --content-muted: rgb(163, 163, 163);
  --content-faint: rgba(255, 255, 255, 0.6);
  --border-color: rgba(255, 255, 255, 0.1);
  --hover-bg: rgba(255, 255, 255, 0.05);
  --button-bg: #101010;
  --button-shadow: inset 0px 1px 1px rgba(255, 255, 255, 0.2), inset 0px 2px 2px rgba(255, 255, 255, 0.15), inset 0px 4px 4px rgba(255, 255, 255, 0.1);
  --button-border: rgba(255, 255, 255, 0.133);
}
`;

const handleBtnMouseMove = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
};

// ─────────────────────────────────────────────────────────────
//  Hero — full-screen featured publication with a story selector
// ─────────────────────────────────────────────────────────────
const HeroFeature = ({ stories }: { stories: PublicationItem[] }) => {
  const [active, setActive] = useState(0);
  const s = stories[active] ?? stories[0];
  if (!s) return null;

  const EASE = [0.4, 0, 0.2, 1] as const;

  return (
    <section
      className="releases-hero relative w-full flex flex-col"
      style={{ minHeight: '100vh', background: 'var(--surface-primary)' }}
    >
      <style>{BRAND_BTN_CSS}</style>
      {/* grid background (mirrors the main site's "Sectors We Serve" section) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px),' +
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px),' +
            'repeating-linear-gradient(45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px),' +
            'repeating-linear-gradient(-45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px),' +
            'radial-gradient(circle, rgba(255,255,255,0.84) 0 1.4px, transparent 1.5px)',
          backgroundSize: '112px 112px',
          backgroundPosition: 'center',
          opacity: 0.42,
        }}
      />
      {/* vignette over the grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 22%, rgba(0,0,0,0.34) 100%),' +
            'linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.48) 100%)',
        }}
      />
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 80% 10%, rgba(235,17,67,0.10) 0%, transparent 55%)' }}
      />

      {/* ── Top: split hero (text left · media right) ── */}
      <div className="relative z-10 flex-1 flex items-center px-4 sm:px-8 lg:px-16 pt-28 lg:pt-24 pb-10">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center lg:h-[460px]">

          {/* LEFT — text (graceful swap) */}
          <div className="flex flex-col justify-center lg:h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.32, ease: EASE }}
              >
                <div className="text-sm sm:text-base font-bold tracking-wide mb-3" style={{ color: 'var(--content-secondary)' }}>
                  {s.category}
                </div>
                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold"
                  style={{ color: 'var(--content-primary)', lineHeight: 1.08, letterSpacing: '-0.01em' }}
                >
                  {s.title}
                </h1>
                <p className="mt-5 text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: 'var(--content-muted)' }}>
                  {s.excerpt}
                </p>
                {s.href && (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nr-brand-btn mt-8"
                    onMouseMove={handleBtnMouseMove}
                  >
                    <span>Read Publication</span>
                    <i className="bi bi-arrow-right" style={{ fontSize: '0.8rem' }} />
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT — media (fixed size, graceful chip swap) */}
          <div
            className="relative w-full overflow-hidden rounded-3xl aspect-[4/3] lg:aspect-auto lg:h-full"
            style={{
              border: '1px solid var(--border-color)',
              background: 'linear-gradient(160deg, #0b0b12 0%, #0e0e17 55%, #08080f 100%)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(235,17,67,0.16) 0%, transparent 62%)' }}
            />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-1/3 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, #EB1143, transparent)' }}
            />
            {/* active category chip */}
            <AnimatePresence mode="wait">
              <motion.span
                key={active}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="absolute top-5 left-5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', backdropFilter: 'blur(6px)' }}
              >
                {s.category}
              </motion.span>
            </AnimatePresence>
            {/* center emblem */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span
                className="inline-flex items-center justify-center rounded-2xl"
                style={{ width: '4.25rem', height: '4.25rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)' }}
              >
                <i className="bi bi-journal-richtext" style={{ fontSize: '2rem', color: '#fff', opacity: 0.92 }} />
              </span>
              <span className="text-[0.7rem] sm:text-xs uppercase tracking-[0.32em] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Notus Regalia · Releases
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom: story selector strip ── */}
      <div className="relative z-10 w-full" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {stories.map((st, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="relative flex-shrink-0 lg:flex-1 text-left px-5 py-5 transition-colors duration-200"
                style={{
                  minWidth: '180px',
                  borderRight: '1px solid var(--border-color)',
                  background: isActive ? 'var(--hover-bg)' : 'transparent',
                }}
              >
                {/* active accent bar */}
                <span
                  className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-200"
                  style={{ background: '#EB1143', opacity: isActive ? 1 : 0 }}
                />
                <span className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: 'var(--content-muted)' }}>
                  {st.category}
                </span>
                <span
                  className="block text-sm font-medium leading-snug line-clamp-2"
                  style={{ color: isActive ? 'var(--content-primary)' : 'var(--content-secondary)' }}
                >
                  {st.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
//  Publication grid — self-contained "Latest Publications" section
// ─────────────────────────────────────────────────────────────
const PublicationGridBlock = ({ heading, items }: { heading?: string; items: PublicationItem[] }) => (
  <section
    className="px-4 sm:px-8 lg:px-20 py-16 sm:py-24"
    style={{ background: 'var(--gradient-section)', borderTop: '1px solid var(--border-color)' }}
  >
    <div className="max-w-6xl mx-auto">
      {heading && <BlockHeading>{heading}</BlockHeading>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {items.map((pub, i) => {
          const card = (
            <article
              className="h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}
            >
              <div
                className="relative h-40 flex items-center justify-center"
                style={{ background: 'linear-gradient(150deg, rgba(235,17,67,0.10) 0%, rgba(147,51,234,0.07) 60%, transparent 100%)', borderBottom: '1px solid var(--border-color)' }}
              >
                <i className="bi bi-file-earmark-richtext" style={{ fontSize: '1.9rem', color: 'var(--content-secondary)', opacity: 0.85 }} />
                <span
                  className="absolute top-3 left-3 text-[0.62rem] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.35)', color: '#fff', backdropFilter: 'blur(6px)' }}
                >
                  {pub.category}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--content-muted)' }}>
                  <span>{pub.date}</span>
                  {pub.readTime && (<><span aria-hidden>·</span><span>{pub.readTime}</span></>)}
                </div>
                <h4 className="mt-2 text-lg font-semibold leading-snug" style={{ color: 'var(--content-primary)' }}>{pub.title}</h4>
                <p className="mt-2 text-sm leading-relaxed flex-1" style={{ color: 'var(--content-muted)' }}>{pub.excerpt}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--content-secondary)' }}>
                  Read more <i className="bi bi-arrow-right text-xs" />
                </div>
              </div>
            </article>
          );
          return pub.href ? (
            <a key={i} href={pub.href} target="_blank" rel="noopener noreferrer" className="block">{card}</a>
          ) : <div key={i}>{card}</div>;
        })}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
//  Note
// ─────────────────────────────────────────────────────────────
const NoteBlock = ({ text }: { text: string }) => (
  <div
    className="rounded-2xl p-5 sm:p-6 flex items-start gap-3"
    style={{ background: 'var(--hover-bg)', border: '1px dashed var(--border-dashed)' }}
  >
    <i className="bi bi-info-circle text-lg mt-0.5 flex-shrink-0" style={{ color: 'var(--content-secondary)' }} />
    <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--content-muted)' }}>{renderInline(text)}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  Preferences — cookie consent + user preference toggles
// ─────────────────────────────────────────────────────────────
const Toggle = ({ on, locked, onChange }: { on: boolean; locked?: boolean; onChange?: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    disabled={locked}
    onClick={locked ? undefined : onChange}
    className="relative flex-shrink-0 rounded-full transition-colors"
    style={{
      width: 42, height: 24,
      background: on ? '#E31B54' : 'var(--hover-bg-strong, rgba(120,120,130,0.3))',
      border: '1px solid var(--border-color)',
      cursor: locked ? 'not-allowed' : 'pointer',
      opacity: locked ? 0.55 : 1,
    }}
  >
    <span
      className="absolute top-1/2 rounded-full transition-all"
      style={{
        width: 18, height: 18,
        left: on ? 21 : 3,
        transform: 'translateY(-50%)',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
      }}
    />
  </button>
);

type PrefRow = { id: string; title: string; desc: string; locked?: boolean; default: boolean };
type PrefGroup = { heading: string; rows: PrefRow[] };

const PREF_GROUPS: PrefGroup[] = [
  {
    heading: 'Cookie Settings',
    rows: [
      { id: 'essential',     title: 'Strictly Necessary', desc: 'Required for the site to function. Always on.', locked: true, default: true },
      { id: 'analytics',     title: 'Analytics',          desc: 'Helps us understand usage to improve the experience.', default: true },
      { id: 'personalization', title: 'Personalization',  desc: 'Remembers your choices to tailor content.', default: true },
      { id: 'marketing',     title: 'Marketing',          desc: 'Used to measure and deliver relevant campaigns.', default: false },
    ],
  },
  {
    heading: 'User Preferences',
    rows: [
      { id: 'emails',        title: 'Product & Release Emails', desc: 'Occasional updates about new releases and research.', default: false },
      { id: 'reducedMotion', title: 'Reduced Motion',           desc: 'Minimize animations and motion effects.', default: false },
      { id: 'highContrast',  title: 'High Contrast',            desc: 'Increase contrast for improved readability.', default: false },
    ],
  },
];

// Small secondary action button used by the Data & Cache controls.
const ActionButton = ({
  onClick, disabled, danger, children,
}: {
  onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex-shrink-0 rounded-xl font-semibold transition-colors"
    style={{
      padding: '0.6rem 1.15rem',
      fontSize: '0.85rem',
      whiteSpace: 'nowrap',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      border: `1px solid ${danger ? 'rgba(227,27,84,0.5)' : 'var(--border-color)'}`,
      background: 'var(--hover-bg)',
      color: danger ? '#E31B54' : 'var(--content-secondary)',
    }}
  >
    {children}
  </button>
);

const PreferencesBlock = () => {
  const [state, setState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    PREF_GROUPS.forEach((g) => g.rows.forEach((r) => { init[r.id] = r.default; }));
    return init;
  });
  const [saved, setSaved] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [cacheMsg, setCacheMsg] = useState<string | null>(null);

  // Hydrate from the shared stores so this page reflects the banner's choice.
  useEffect(() => {
    const c = getConsent();
    const p = getPreferences();
    setState((s) => ({
      ...s,
      essential: true,
      analytics: c.analytics,
      personalization: c.personalization,
      marketing: c.marketing,
      emails: p.emails,
      reducedMotion: p.reducedMotion,
      highContrast: p.highContrast,
    }));
  }, []);

  const toggle = (id: string) => {
    setState((s) => ({ ...s, [id]: !s[id] }));
    setSaved(false);
  };

  const handleSave = () => {
    setConsent({
      analytics: !!state.analytics,
      personalization: !!state.personalization,
      marketing: !!state.marketing,
    });
    setPreferences({
      emails: !!state.emails,
      reducedMotion: !!state.reducedMotion,
      highContrast: !!state.highContrast,
    });
    setSaved(true);
  };

  const handleClearCache = async () => {
    setClearing(true);
    setCacheMsg(null);
    await clearSiteCache();
    setClearing(false);
    setCacheMsg('Cached data cleared — reloading…');
    setTimeout(() => window.location.reload(), 900);
  };

  const handleResetConsent = () => {
    clearConsent();
    clearPreferences();
    setState((s) => {
      const next = { ...s };
      PREF_GROUPS.forEach((g) => g.rows.forEach((r) => { next[r.id] = r.default; }));
      next.essential = true;
      return next;
    });
    setSaved(false);
    setCacheMsg('Cookie and site preferences reset. The cookie banner will reappear on the main site.');
  };

  return (
    <div className="space-y-10">
      {PREF_GROUPS.map((group) => (
        <div key={group.heading}>
          <BlockHeading>{group.heading}</BlockHeading>
          <div className="space-y-3">
            {group.rows.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-5 rounded-2xl p-4 sm:p-5"
                style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--content-secondary)' }}>{row.title}</span>
                    {row.locked && (
                      <span className="text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'var(--hover-bg-strong, rgba(120,120,130,0.18))', color: 'var(--content-muted)' }}>Required</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: 'var(--content-muted)' }}>{row.desc}</p>
                </div>
                <Toggle on={state[row.id]} locked={row.locked} onChange={() => toggle(row.id)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="brand-btn"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
          }}
        >
          Save preferences
        </button>
        {saved && (
          <span className="text-sm inline-flex items-center gap-1.5" style={{ color: 'var(--content-muted)' }}>
            <i className="bi bi-check-circle-fill" style={{ color: '#22c55e' }} /> Preferences saved
          </span>
        )}
      </div>

      {/* ── Data & Cache ── */}
      <div>
        <BlockHeading>Data &amp; Cache</BlockHeading>
        <div className="space-y-3">
          <div
            className="flex items-center justify-between gap-5 rounded-2xl p-4 sm:p-5"
            style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="min-w-0">
              <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--content-secondary)' }}>Clear cached data</span>
              <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: 'var(--content-muted)' }}>
                Remove locally cached files and temporary session data, then reload with a fresh copy of the site.
              </p>
            </div>
            <ActionButton onClick={handleClearCache} disabled={clearing}>
              {clearing ? 'Clearing…' : 'Clear cache'}
            </ActionButton>
          </div>

          <div
            className="flex items-center justify-between gap-5 rounded-2xl p-4 sm:p-5"
            style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="min-w-0">
              <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--content-secondary)' }}>Reset cookie &amp; site preferences</span>
              <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: 'var(--content-muted)' }}>
                Forget your consent and preference choices. The cookie banner will appear again on your next visit.
              </p>
            </div>
            <ActionButton onClick={handleResetConsent} danger>Reset</ActionButton>
          </div>
        </div>

        {cacheMsg && (
          <span className="text-sm inline-flex items-center gap-1.5 mt-3" style={{ color: 'var(--content-muted)' }}>
            <i className="bi bi-info-circle-fill" style={{ color: '#22c55e' }} /> {cacheMsg}
          </span>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  Dispatcher
// ─────────────────────────────────────────────────────────────
const BlockRenderer = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case 'releases':  return <ReleasesBlock />;
    case 'text':      return <TextBlock heading={block.heading} paragraphs={block.paragraphs} />;
    case 'stats':     return <StatsBlock heading={block.heading} items={block.items} />;
    case 'cards':     return <CardsBlock heading={block.heading} columns={block.columns} items={block.items} />;
    case 'documents': return <DocumentsBlock heading={block.heading} items={block.items} />;
    case 'people':    return <PeopleBlock heading={block.heading} items={block.items} />;
    case 'publications': return <PublicationsBlock featured={block.featured} items={block.items} />;
    case 'hero':      return <HeroFeature stories={block.stories} />;
    case 'publicationGrid': return <PublicationGridBlock heading={block.heading} items={block.items} />;
    case 'note':      return <NoteBlock text={block.text} />;
    case 'preferences': return <PreferencesBlock />;
    default:          return null;
  }
};

export const SubtabBody = memo(({ blocks, flush = false }: { blocks: ContentBlock[]; flush?: boolean }) => {
  // `flush` renders self-contained, full-bleed sections (landing pages) with no
  // inter-block spacing so sections sit seamlessly against each other.
  if (flush) {
    return <>{blocks.map((block, i) => <BlockRenderer key={i} block={block} />)}</>;
  }
  return (
    <div className="space-y-12 sm:space-y-16">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </div>
  );
});
SubtabBody.displayName = 'SubtabBody';
