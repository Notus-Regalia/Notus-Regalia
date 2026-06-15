import type { MetadataRoute } from 'next';
import { SITE_URL as CANONICAL_SITE_URL } from '@/utils/site';

// Canonical, indexable public URLs. Excludes routes blocked from search:
//   /teams, /about   — noindex in next.config.ts
// Keep this list in sync with the human-facing sitemap in
// src/components/ui/SitemapView.tsx when public routes change.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? CANONICAL_SITE_URL).replace(/\/$/, '');

// [path, priority]
const ROUTES: [string, number][] = [
  ['/', 1.0],
  ['/defense', 0.9],
  ['/contact', 0.5],
  ['/status', 0.3],

  // Company
  ['/company/mission', 0.8],
  ['/company/sectors', 0.8],
  ['/company/executives', 0.7],
  ['/company/investors', 0.7],
  ['/company/ventures', 0.7],
  ['/company/human-rights', 0.6],

  // Technologies
  ['/technologies/civic-operations', 0.7],
  ['/technologies/defense', 0.7],
  ['/technologies/healthcare', 0.7],
  ['/technologies/enterprise', 0.7],
  ['/technologies/energy', 0.7],

  // Information Central — Newsroom
  ['/information/newsroom/releases', 0.6],
  ['/information/newsroom/announcements', 0.6],
  ['/information/newsroom/media', 0.5],
  ['/information/newsroom/careers', 0.6],

  // Information Central — Investors
  ['/information/investors/news', 0.5],
  ['/information/investors/events', 0.5],
  ['/information/investors/financials', 0.5],
  ['/information/investors/governance', 0.5],
  ['/information/investors/resources', 0.5],

  // Information Central — Research
  ['/information/research/case-studies', 0.5],
  ['/information/research/technical-reports', 0.5],
  ['/information/research/documentations', 0.5],
  ['/information/research/field-testing', 0.5],
  ['/information/research/open-source', 0.5],

  // Information Central — Legals
  ['/information/legals/policies', 0.4],
  ['/information/legals/human-rights', 0.4],
  ['/information/legals/privacy', 0.4],
  ['/information/legals/cookie-policy', 0.4],
  ['/information/legals/terms', 0.4],
  ['/information/legals/acceptable-use', 0.4],
  ['/information/legals/vulnerability-disclosure', 0.4],
  ['/information/legals/licenses', 0.4],
  ['/information/legals/brand-guidelines', 0.4],

  // Information Central — Documents
  ['/information/documents/docs-governance', 0.4],
  ['/information/documents/docs-social', 0.4],
  ['/information/documents/docs-environmental', 0.4],
  ['/information/documents/media-assets', 0.4],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(([path, priority]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority,
  }));
}
