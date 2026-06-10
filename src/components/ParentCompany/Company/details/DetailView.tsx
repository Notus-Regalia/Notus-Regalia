"use client";
import { memo } from 'react';
import type { PageMeta } from './UnderDevelopmentTemplate';

/* ─── Page registry ─── */
import OverviewPage, { meta as overviewMeta } from './OverviewPage';
import CompanyPage, { meta as companyMeta } from './CompanyPage';
import PhilosophyPage, { meta as philosophyMeta } from './PhilosophyPage';
import EcosystemPage, { meta as ecosystemMeta } from './EcosystemPage';
import DirectionPage, { meta as directionMeta } from './DirectionPage';
import GovernancePage, { meta as governanceMeta } from './GovernancePage';
import EthicsPage, { meta as ethicsMeta } from './EthicsPage';

const PAGES: Record<string, { meta: PageMeta; Content: () => React.JSX.Element }> = {
  overview:   { meta: overviewMeta,   Content: OverviewPage },
  company:    { meta: companyMeta,    Content: CompanyPage },
  philosophy: { meta: philosophyMeta, Content: PhilosophyPage },
  ecosystem:  { meta: ecosystemMeta,  Content: EcosystemPage },
  direction:  { meta: directionMeta,  Content: DirectionPage },
  governance: { meta: governanceMeta, Content: GovernancePage },
  ethics:     { meta: ethicsMeta,     Content: EthicsPage },
};

/*
 * Responsive horizontal padding matching Investors / Executives:
 *   base  → 2rem
 *   640px → 4rem
 *   768px → 6rem
 *  1024px → 6rem
 *  1280px → 8rem
 *  1536px → 12rem
 *  1920px → 16rem
 */
const DETAIL_CSS = `
  .dv-header {
    padding: 9rem 2rem 4rem;
    position: relative; z-index: 1;
  }
  .dv-body {
    position: relative; z-index: 1;
    padding: 3rem 2rem 6rem;
  }
  @media(min-width: 640px)  { .dv-header, .dv-body { padding-left: 4rem; padding-right: 4rem; } }
  @media(min-width: 768px)  { .dv-header { padding: 10rem 6rem 5rem; } .dv-body { padding: 3rem 6rem 6rem; } }
  @media(min-width: 1024px) { .dv-header, .dv-body { padding-left: 6rem; padding-right: 6rem; } }
  @media(min-width: 1280px) { .dv-header, .dv-body { padding-left: 8rem; padding-right: 8rem; } }
  @media(min-width: 1536px) { .dv-header, .dv-body { padding-left: 12rem; padding-right: 12rem; } }
  @media(min-width: 1920px) { .dv-header, .dv-body { padding-left: 16rem; padding-right: 16rem; } }
`;

/* ═══════════════════════════════════════════════
   DetailView — layout shell for Company detail pages
   ═══════════════════════════════════════════════ */

interface DetailViewProps {
  page: string;
}

const DetailView = memo(({ page }: DetailViewProps) => {
  const entry = PAGES[page];
  if (!entry) return null;

  const { meta, Content } = entry;

  return (
    <>
      <style>{DETAIL_CSS}</style>
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* ── Header ── */}
        <div style={{
          borderBottom: '1px dashed var(--border-dashed)',
          background: 'var(--gradient-section)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative noise */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.02,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat', backgroundSize: '100px 100px',
          }} />

          <div className="dv-header">
            {/* Eyebrow */}
            <span style={{
              fontFamily: 'ui-monospace, Menlo, monospace',
              fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#E31B54', fontWeight: 600,
              display: 'block', marginBottom: '1rem',
            }}>
              {meta.eyebrow}
            </span>

            <h1 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700,
              letterSpacing: '-0.03em', lineHeight: 1.15,
              background: 'var(--text-gradient)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              margin: 0, marginBottom: '0.75rem',
            }}>
              {meta.title}
            </h1>
            <p style={{
              fontSize: 'clamp(0.88rem, 1.1vw, 1rem)', lineHeight: 1.7,
              color: 'var(--content-tertiary)', margin: 0,
            }}>
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="dv-body">
          <Content />
        </div>
      </div>
    </>
  );
});

DetailView.displayName = 'DetailView';

export default DetailView;
