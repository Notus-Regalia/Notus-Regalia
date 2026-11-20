"use client";
import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { statements, type Statement } from '@/data/information-data';
import styles from '@/styles/ui.module.css';
import type {
  ContentBlock, CardItem, DocItem, StatItem, PersonItem, PublicationItem, RoleItem,
  SwatchItem, MisuseItem, MisuseVariant, LogoPairItem,
} from '../data';
import { CAREER_PROGRAMS, pubSubpageId } from '../data';
import { infoHref } from '@/utils/routes';

// In-app navigation passed down from the Information Central shell.
export type NavigateFn = (tabId: string, subtabId: string) => void;

// Link props for a publication card: when the item has a `slug` it opens the
// in-app article (real href for middle-click/SEO, SPA nav on plain click);
// otherwise it falls back to the static href (e.g. a PDF) in a new tab.
const pubLinkProps = (
  item: { slug?: string; href?: string },
  onNavigate?: NavigateFn,
): React.AnchorHTMLAttributes<HTMLAnchorElement> | null => {
  if (item.slug) {
    const subtabId = pubSubpageId(item.slug);
    return {
      href: infoHref('newsroom', subtabId),
      onClick: (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let new-tab gestures through
        e.preventDefault();
        onNavigate?.('newsroom', subtabId);
      },
    };
  }
  if (item.href) return { href: item.href, target: '_blank', rel: 'noopener noreferrer' };
  return null;
};

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
              {statement.pdfUrl && (
                <a
                  href={statement.pdfUrl}
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--content-muted)' }}
                  aria-label="Open PDF in new tab"
                >
                  <i className="bi bi-file-earmark-pdf text-sm" />
                </a>
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

const PublicationsBlock = ({ featured, items, onNavigate }: { featured: PublicationItem; items: PublicationItem[]; onNavigate?: NavigateFn }) => {
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

  const featuredLink = pubLinkProps(featured, onNavigate);
  return (
    <div className="space-y-10 sm:space-y-12">
      {featuredLink ? (
        <a {...featuredLink} className="block">{featuredInner}</a>
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
            const link = pubLinkProps(pub, onNavigate);
            return link ? (
              <a key={i} {...link} className="block">{card}</a>
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
  /* Standard (non-CTA) button — flat dark-gray with a brighter white hairline. */
  --btn-surface: #1f1f1f;
  --btn-text: rgba(255, 255, 255, 0.66);
  --btn-text-hover: rgba(255, 255, 255, 1);
  --btn-inset: rgba(255, 255, 255, 0.28);
  --btn-line: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
  min-width: 120px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 12px 17px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 0;
  border-radius: 7px;
  box-shadow: inset 0 0 0 1px var(--btn-inset);
  background: var(--btn-surface);
  cursor: pointer;
  color: var(--btn-text);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.35s ease;
}
@media (min-width: 1024px) {
  .nr-brand-btn { padding: 14px 28px; font-size: 1rem; }
}
.nr-brand-btn::before {
  content: '';
  width: 70%;
  height: 1px;
  position: absolute;
  bottom: 0;
  left: 15%;
  background: var(--btn-line);
  opacity: 0.2;
  transition: opacity 0.35s ease;
}
.nr-brand-btn:hover {
  color: var(--btn-text-hover);
  transform: translateY(-2px);
  box-shadow: inset 0 0 0 1px var(--btn-inset), 0 6px 18px -6px rgba(0, 0, 0, 0.45);
}
.nr-brand-btn:hover::before { opacity: 1; }
.nr-brand-btn::after {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: 8.5px;
  padding: 1px;
  background: radial-gradient(
    180px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
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
.nr-brand-btn:hover::after { opacity: 1; }
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
  /* Always-dark hero → keep the WHITE button token set even in light mode. */
  --btn-surface: radial-gradient(ellipse at bottom, rgba(255, 255, 255, 1) 0%, rgba(226, 229, 233, 1) 48%);
  --btn-text: rgba(0, 0, 0, 0.66);
  --btn-text-hover: rgba(0, 0, 0, 1);
  --btn-inset: rgba(0, 0, 0, 0.12);
  --btn-line: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 50%, rgba(0, 0, 0, 0) 100%);
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
const HeroFeature = ({ stories, onNavigate }: { stories: PublicationItem[]; onNavigate?: NavigateFn }) => {
  const [active, setActive] = useState(0);
  const s = stories[active] ?? stories[0];
  if (!s) return null;

  const EASE = [0.4, 0, 0.2, 1] as const;
  const readLink = pubLinkProps(s, onNavigate);

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

      {/* ── Top: split hero (text left · media right) ──
          Horizontal inset = global brand gutter so the text edge lines up with
          the navbar logo, the footer, and the rest of the site. */}
      <div
        className="relative z-10 flex-1 flex items-center pt-40 sm:pt-36 lg:pt-24 pb-10"
        style={{ paddingLeft: 'var(--site-gutter-inline)', paddingRight: 'var(--site-gutter-inline)' }}
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center lg:h-[460px]">

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
                {readLink && (
                  <a
                    {...readLink}
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
              background: 'linear-gradient(160deg, #0b0b0b 0%, #0e0e0e 55%, #080808 100%)',
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

      {/* ── Bottom: story selector strip ──
          Tabs are spaced cards (no dividers) inset to the brand gutter so they
          line up with the hero text above. */}
      <div className="relative z-10 w-full" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div
          className="flex gap-3 sm:gap-4 overflow-x-auto py-5 sm:py-6 snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingLeft: 'var(--site-gutter-inline)',
            paddingRight: 'var(--site-gutter-inline)',
          }}
        >
          {stories.map((st, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className="relative flex-shrink-0 lg:flex-1 text-left px-5 py-5 sm:py-4 overflow-hidden transition-all duration-200 rounded-lg snap-start min-w-[78vw] sm:min-w-[200px]"
                style={{
                  borderTop: `1px solid ${isActive ? 'transparent' : 'var(--border-color)'}`,
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
const PublicationGridBlock = ({ heading, items, onNavigate }: { heading?: string; items: PublicationItem[]; onNavigate?: NavigateFn }) => (
  <section
    className="py-16 sm:py-24"
    style={{
      background: 'var(--gradient-section)',
      borderTop: '1px solid var(--border-color)',
      paddingLeft: 'var(--site-gutter-inline)',
      paddingRight: 'var(--site-gutter-inline)',
    }}
  >
    <div className="w-full">
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
          const link = pubLinkProps(pub, onNavigate);
          return link ? (
            <a key={i} {...link} className="block">{card}</a>
          ) : <div key={i}>{card}</div>;
        })}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
//  Brand guidelines — paired logo specimens (light + dark)
// ─────────────────────────────────────────────────────────────
// One panel per background: black-ink art on a near-white panel, white-ink art
// on near-black. The artwork is never recolored. A small download pill sits in
// the corner of each panel so the exact transparent PNG is one click away.
const LogoPanel = ({ src, dark, label, tall }: { src: string; dark?: boolean; label: string; tall?: boolean }) => (
  <div
    className="relative flex items-center justify-center p-3 sm:p-4"
    style={{ background: dark ? '#0a0a0a' : '#f6f7f9', minHeight: tall ? 300 : 260 }}
  >
    <span
      className="absolute top-3 left-3 text-[0.6rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{
        background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)',
      }}
    >
      {label}
    </span>
    <a
      href={encodeURI(src)}
      download
      className="absolute top-2.5 right-3 inline-flex items-center justify-center w-7 h-7 rounded-full opacity-60 hover:opacity-100 transition-opacity"
      style={{ color: dark ? '#fff' : '#0a0a0a', background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
      aria-label={`Download ${label.toLowerCase()} PNG`}
    >
      <i className="bi bi-download text-xs" />
    </a>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={encodeURI(src)} alt="" className="w-auto object-contain" style={{ maxHeight: tall ? 280 : 240, maxWidth: '96%' }} />
  </div>
);

const LogoPairCard = ({ item }: { item: LogoPairItem }) => {
  const single = !item.dark;
  const stack = item.layout === 'stack';
  const divider = stack
    ? { borderBottom: '1px solid var(--border-color)' }
    : { borderRight: '1px solid var(--border-color)' };

  return (
    <div
      className={`h-full rounded-2xl overflow-hidden flex flex-col ${item.wide ? 'lg:col-span-2' : ''}`}
      style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}
    >
      <div className={single ? '' : stack ? 'flex flex-col' : 'grid grid-cols-2'}>
        <div style={single ? undefined : divider}>
          <LogoPanel src={item.light} label="Light" tall={item.wide} />
        </div>
        {!single && <LogoPanel src={item.dark!} dark label="Dark" tall={item.wide} />}
      </div>
      <div className="p-5 mt-auto">
        <h4 className="font-semibold text-sm sm:text-base leading-snug" style={{ color: 'var(--content-primary)' }}>{item.title}</h4>
        {item.caption && (
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--content-muted)' }}>{item.caption}</p>
        )}
      </div>
    </div>
  );
};

const LogoPairsBlock = ({ heading, items }: { heading?: string; items: LogoPairItem[] }) => (
  <div>
    {heading && <BlockHeading>{heading}</BlockHeading>}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
      {items.map((item, i) => <LogoPairCard key={i} item={item} />)}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  Brand guidelines — clear space & minimum size
// ─────────────────────────────────────────────────────────────
const ClearspaceBlock = ({ heading, src, note }: { heading?: string; src: string; note?: string }) => (
  <div>
    {heading && <BlockHeading>{heading}</BlockHeading>}
    <div
      className="rounded-2xl p-8 sm:p-12 flex flex-col items-center"
      style={{ background: '#0a0a0a', border: '1px solid var(--border-color)' }}
    >
      {/* dashed frame = clear-space margin; inner solid frame = logo bounds */}
      <div className="relative" style={{ padding: 56 }}>
        <span className="pointer-events-none absolute inset-0 rounded-lg" style={{ border: '1px dashed rgba(255,255,255,0.28)' }} />
        <span className="absolute top-1.5 left-2 text-[0.6rem] font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>X</span>
        <span className="absolute bottom-1.5 right-2 text-[0.6rem] font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>X</span>
        <div className="relative" style={{ outline: '1px solid rgba(255,255,255,0.14)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={encodeURI(src)} alt="Logo clear space" className="block w-36 h-36 sm:w-44 sm:h-44 object-contain" />
        </div>
      </div>
      {note && (
        <p className="mt-7 text-xs sm:text-sm leading-relaxed text-center max-w-xl" style={{ color: 'rgba(255,255,255,0.62)' }}>{note}</p>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  Brand guidelines — color palette
// ─────────────────────────────────────────────────────────────
const PaletteBlock = ({ heading, items }: { heading?: string; items: SwatchItem[] }) => (
  <div>
    {heading && <BlockHeading>{heading}</BlockHeading>}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {items.map((sw, i) => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
          <div className="h-28 sm:h-32 flex items-end p-4" style={{ background: sw.hex }}>
            <span
              className="text-xs font-semibold tracking-wide"
              style={{ color: sw.ink === 'dark' ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.92)' }}
            >
              {sw.hex.toUpperCase()}
            </span>
          </div>
          <div className="p-4" style={{ background: 'var(--surface-elevated)' }}>
            <div className="font-semibold text-sm" style={{ color: 'var(--content-primary)' }}>{sw.name}</div>
            {sw.usage && <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--content-muted)' }}>{sw.usage}</p>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  Brand guidelines — logo misuse grid
// ─────────────────────────────────────────────────────────────
// Each preset distorts the base mark to demonstrate a prohibited treatment.
const MISUSE_STYLE: Record<MisuseVariant, React.CSSProperties> = {
  stretch:     { transform: 'scaleX(1.7)' },
  squish:      { transform: 'scaleY(1.7)' },
  rotate:      { transform: 'rotate(22deg)' },
  recolor:     { filter: 'grayscale(1) brightness(2.2)' },
  effects:     { filter: 'drop-shadow(0 6px 9px rgba(0,0,0,0.95)) drop-shadow(0 0 16px rgba(235,17,67,0.85))' },
  lowContrast: { opacity: 0.16 },
  crop:        { transform: 'scale(1.95)' },
  busy:        {},
};
const MISUSE_CARD_BG: Partial<Record<MisuseVariant, string>> = {
  busy: 'repeating-linear-gradient(45deg, #4b4b52 0 14px, #8a8a93 14px 28px)',
};

const MisuseBlock = ({ heading, base, items }: { heading?: string; base: string; items: MisuseItem[] }) => (
  <div>
    {heading && <BlockHeading>{heading}</BlockHeading>}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {items.map((m, i) => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
          <div
            className="relative h-48 sm:h-56 flex items-center justify-center overflow-hidden"
            style={{ background: MISUSE_CARD_BG[m.variant] ?? '#f6f7f9' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={encodeURI(base)} alt="" aria-hidden className="w-28 h-28 sm:w-32 sm:h-32 object-contain" style={MISUSE_STYLE[m.variant]} />
            <span className="absolute top-3 right-3 inline-flex items-center justify-center w-7 h-7 rounded-full" style={{ background: '#EB1143', color: '#fff' }}>
              <i className="bi bi-x-lg text-xs" />
            </span>
          </div>
          <div className="p-4 flex items-start gap-2" style={{ background: 'var(--surface-elevated)' }}>
            <i className="bi bi-x-circle-fill mt-0.5 flex-shrink-0" style={{ color: '#EB1143' }} />
            <span className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--content-muted)' }}>{m.label}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
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
//  Careers — search + program filter over a single column of roles
// ─────────────────────────────────────────────────────────────
const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('/documents');

const RoleRow = ({ role }: { role: RoleItem }) => (
  <div
    className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 transition-all duration-300 hover:-translate-y-0.5"
    style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}
  >
    {/* Left — title, description, location */}
    <div className="min-w-0 flex-1">
      <h4 className="font-semibold text-lg sm:text-xl leading-snug" style={{ color: 'var(--content-primary)' }}>
        {role.title}
      </h4>
      <p className="mt-2 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--content-muted)' }}>
        {role.description}
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm" style={{ color: 'var(--content-muted)' }}>
        <i className="bi bi-geo-alt" />
        {role.location}
      </div>
    </div>

    {/* Right — apply (primary brand CTA) + learn more (secondary brand button), stacked */}
    <div className="flex flex-shrink-0 flex-col items-stretch gap-3">
      <a
        href={role.applyHref}
        target={isInternal(role.applyHref) ? undefined : '_blank'}
        rel={isInternal(role.applyHref) ? undefined : 'noopener noreferrer'}
        className="brand-btn brand-btn-sm"
        onMouseMove={handleBtnMouseMove}
        // White CTA surface — mirrors the home hero's "Get Started" button.
        style={{
          '--btn-surface': 'radial-gradient(ellipse at bottom, rgba(255,255,255,1) 0%, rgba(226,229,233,1) 48%)',
          '--btn-text': 'rgba(0,0,0,0.66)',
          '--btn-text-hover': 'rgba(0,0,0,1)',
          '--btn-inset': 'rgba(0,0,0,0.12)',
          '--btn-line': 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 100%)',
        } as React.CSSProperties}
      >
        <span>Apply</span>
        <i className="bi bi-arrow-up-right-square" style={{ fontSize: '0.8rem' }} />
      </a>
      <a
        href={role.learnMoreHref}
        target={isInternal(role.learnMoreHref) ? undefined : '_blank'}
        rel={isInternal(role.learnMoreHref) ? undefined : 'noopener noreferrer'}
        className="brand-btn brand-btn-sm"
        onMouseMove={handleBtnMouseMove}
      >
        <span>Learn more</span>
      </a>
    </div>
  </div>
);

const CareersBlock = ({ roles }: { roles: RoleItem[] }) => {
  const [query, setQuery] = useState('');
  const [program, setProgram] = useState<string>('all');

  const q = query.trim().toLowerCase();
  const filtered = roles.filter((r) => {
    const matchesProgram = program === 'all' || r.program === program;
    const matchesQuery =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q);
    return matchesProgram && matchesQuery;
  });

  return (
    <div>
      {/* Search + filter — one row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i
            className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'var(--content-muted)' }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search open roles…"
            aria-label="Search open roles"
            className="w-full rounded-xl pl-11 pr-4 py-3 text-sm sm:text-base outline-none transition-colors focus:border-[var(--content-secondary)]"
            style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--content-primary)' }}
          />
        </div>
        <div className="relative sm:w-72">
          <i
            className="bi bi-funnel absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
            style={{ color: 'var(--content-muted)' }}
          />
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            aria-label="Filter by program"
            className="w-full appearance-none rounded-xl pl-11 pr-10 py-3 text-sm sm:text-base outline-none cursor-pointer transition-colors focus:border-[var(--content-secondary)]"
            style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--content-primary)' }}
          >
            <option value="all">All Programs</option>
            {CAREER_PROGRAMS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <i
            className="bi bi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
            style={{ color: 'var(--content-muted)' }}
          />
        </div>
      </div>

      {/* Open roles — one column of rows */}
      <div className="mt-6 sm:mt-8 space-y-4">
        {filtered.length > 0 ? (
          filtered.map((role, i) => <RoleRow key={i} role={role} />)
        ) : (
          <div
            className="rounded-2xl p-8 text-center text-sm sm:text-base"
            style={{ background: 'var(--hover-bg)', border: '1px dashed var(--border-dashed)', color: 'var(--content-muted)' }}
          >
            No open roles match your search.
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  Dispatcher
// ─────────────────────────────────────────────────────────────
const BlockRenderer = ({ block, onNavigate }: { block: ContentBlock; onNavigate?: NavigateFn }) => {
  switch (block.type) {
    case 'releases':  return <ReleasesBlock />;
    case 'text':      return <TextBlock heading={block.heading} paragraphs={block.paragraphs} />;
    case 'stats':     return <StatsBlock heading={block.heading} items={block.items} />;
    case 'cards':     return <CardsBlock heading={block.heading} columns={block.columns} items={block.items} />;
    case 'documents': return <DocumentsBlock heading={block.heading} items={block.items} />;
    case 'people':    return <PeopleBlock heading={block.heading} items={block.items} />;
    case 'publications': return <PublicationsBlock featured={block.featured} items={block.items} onNavigate={onNavigate} />;
    case 'hero':      return <HeroFeature stories={block.stories} onNavigate={onNavigate} />;
    case 'publicationGrid': return <PublicationGridBlock heading={block.heading} items={block.items} onNavigate={onNavigate} />;
    case 'note':      return <NoteBlock text={block.text} />;
    case 'careers':   return <CareersBlock roles={block.roles} />;
    case 'logoPairs': return <LogoPairsBlock heading={block.heading} items={block.items} />;
    case 'clearspace': return <ClearspaceBlock heading={block.heading} src={block.src} note={block.note} />;
    case 'palette':   return <PaletteBlock heading={block.heading} items={block.items} />;
    case 'misuse':    return <MisuseBlock heading={block.heading} base={block.base} items={block.items} />;
    default:          return null;
  }
};

export const SubtabBody = memo(({ blocks, flush = false, onNavigate }: { blocks: ContentBlock[]; flush?: boolean; onNavigate?: NavigateFn }) => {
  // `flush` renders self-contained, full-bleed sections (landing pages) with no
  // inter-block spacing so sections sit seamlessly against each other.
  if (flush) {
    return <>{blocks.map((block, i) => <BlockRenderer key={i} block={block} onNavigate={onNavigate} />)}</>;
  }
  return (
    <div className="space-y-12 sm:space-y-16">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} onNavigate={onNavigate} />
      ))}
    </div>
  );
});
SubtabBody.displayName = 'SubtabBody';
