"use client";
import { memo } from 'react';
import SubtabHeader from './SubtabHeader';
import { SubtabBody } from './sections/Blocks';
import { SUBTAB_CONTENT, INFO_TABS, SUBTAB_PARENT } from './data';

// ── Always-dark investor grid background (copied from company → investors) ──
const GRID_BG_STYLE: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px),' +
    'repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 112px),' +
    'repeating-linear-gradient(45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px),' +
    'repeating-linear-gradient(-45deg, transparent 0 38px, rgba(255,255,255,0.04) 38px 40px, transparent 40px 78px),' +
    'radial-gradient(circle, rgba(255,255,255,0.84) 0 1.4px, transparent 1.5px)',
  backgroundSize: '112px 112px',
  backgroundPosition: 'center',
  opacity: 0.7,
};
const GRID_VIGNETTE_STYLE: React.CSSProperties = {
  background:
    'radial-gradient(circle at center, transparent 22%, rgba(0,0,0,0.34) 100%),' +
    'linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.48) 100%)',
};

// Force the dark token set so content reads on the always-black grid (even in light mode).
const GRID_SECTION_CSS = `
.info-grid-section, :root.light .info-grid-section {
  background: #000000;
  --surface-primary: #000000;
  --surface-elevated: rgba(15, 15, 15, 0.75);
  --content-primary: #ffffff;
  --content-secondary: #d4d4d4;
  --content-muted: rgb(163, 163, 163);
  --content-faint: rgba(255, 255, 255, 0.6);
  --border-color: rgba(255, 255, 255, 0.1);
  --border-dashed: rgba(255, 255, 255, 0.18);
  --hover-bg: rgba(255, 255, 255, 0.05);
}
`;

const SubtabView = memo(({ subtabId, onNavigate }: { subtabId: string; onNavigate?: (tabId: string, subtabId: string) => void }) => {
  const content = SUBTAB_CONTENT[subtabId];
  if (!content) return null;

  const parentId = SUBTAB_PARENT[subtabId];
  const tabIcon = INFO_TABS.find((t) => t.id === parentId)?.icon;

  // Landing pages (e.g. Releases) render full-bleed — each block owns its layout.
  if (content.hideHeader) {
    return <SubtabBody blocks={content.blocks} flush onNavigate={onNavigate} />;
  }

  return (
    <div>
      {content.gridBg && <style>{GRID_SECTION_CSS}</style>}
      <SubtabHeader
        eyebrow={content.header.eyebrow}
        title={content.header.title}
        description={content.header.description}
        icon={tabIcon}
        link={content.header.link}
        cta={content.header.cta}
        hero={content.heroHeader}
      />
      <div
        id={content.heroHeader ? 'careers-open-roles' : undefined}
        className={`relative scroll-mt-20 ${content.gridBg ? 'info-grid-section' : ''}`}
        style={content.gridBg ? undefined : { background: 'var(--gradient-section)' }}
      >
        {/* Always-dark investor grid background (mirrors the company → investors banner) */}
        {content.gridBg && (
          <>
            <div className="pointer-events-none absolute inset-0 z-0" style={GRID_BG_STYLE} />
            <div className="pointer-events-none absolute inset-0 z-0" style={GRID_VIGNETTE_STYLE} />
            {/* Ease the grid texture in from black so it meets the hero's bottom
                fade seamlessly (only under the careers split hero). */}
            {content.heroHeader && (
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 sm:h-56"
                style={{ background: 'linear-gradient(to bottom, #000000 0%, transparent 100%)' }}
              />
            )}
          </>
        )}
        {/* Horizontal inset = global brand gutter (--site-gutter-inline), so content
            edges line up with the navbar/footer and the rest of the site. */}
        <div
          className="relative z-10 pt-14 sm:pt-20 pb-14 sm:pb-20"
          style={{ paddingLeft: 'var(--site-gutter-inline)', paddingRight: 'var(--site-gutter-inline)' }}
        >
          {/* Section content fills the gutter column edge-to-edge (like the home
              sections) so its edges line up with the navbar/footer. Only text-heavy
              legal docs (justify) keep a readable centered max-width. */}
          <div
            className={content.justify ? 'max-w-6xl mx-auto' : ''}
            style={content.justify ? { textAlign: 'justify', hyphens: 'auto' } : undefined}
          >
            <SubtabBody blocks={content.blocks} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
});

SubtabView.displayName = 'SubtabView';
export default SubtabView;
