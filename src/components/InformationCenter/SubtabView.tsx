"use client";
import { memo } from 'react';
import SubtabHeader from './SubtabHeader';
import { SubtabBody } from './sections/Blocks';
import { SUBTAB_CONTENT, INFO_TABS, SUBTAB_PARENT } from './data';

const SubtabView = memo(({ subtabId }: { subtabId: string }) => {
  const content = SUBTAB_CONTENT[subtabId];
  if (!content) return null;

  const parentId = SUBTAB_PARENT[subtabId];
  const tabIcon = INFO_TABS.find((t) => t.id === parentId)?.icon;

  // Landing pages (e.g. Releases) render full-bleed — each block owns its layout.
  if (content.hideHeader) {
    return <SubtabBody blocks={content.blocks} flush />;
  }

  return (
    <div>
      <SubtabHeader
        eyebrow={content.header.eyebrow}
        title={content.header.title}
        description={content.header.description}
        icon={tabIcon}
      />
      <div
        className="relative"
        style={{ background: 'var(--gradient-section)' }}
      >
        <div className="px-4 sm:px-8 lg:px-20 pt-14 sm:pt-20 pb-14 sm:pb-20">
          <div className="max-w-6xl mx-auto">
            <SubtabBody blocks={content.blocks} />
          </div>
        </div>
      </div>
    </div>
  );
});

SubtabView.displayName = 'SubtabView';
export default SubtabView;
