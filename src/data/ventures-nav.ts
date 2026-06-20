/* ─────────────────────────────────────────────────────────────
   Ventures navigation model.

   Ventures is a top-level tab (like Technologies). Each subtab is a
   standalone page. Subtab ids carry the redundant "ventures-" prefix
   so they round-trip through the URL helpers in src/utils/routes.ts
   (e.g. ventures-subsidiaries <-> /ventures/subsidiaries).
   ───────────────────────────────────────────────────────────── */

export interface VenturesSubtab {
  id: string;     // in-app subtab id (ventures-<slug>)
  slug: string;   // url slug after /ventures/
  label: string;  // navbar + page title
  title: string;  // hero title (defaults to label)
  blurb: string;  // coming-soon description
}

export const VENTURES_SUBTABS: VenturesSubtab[] = [
  {
    id: 'ventures-startups',
    slug: 'startups',
    label: 'Startups',
    title: 'Startups',
    blurb:
      'Emerging ventures we incubate from the ground up, exploring the next frontier of operational technology. Launching soon.',
  },
  {
    id: 'ventures-subsidiaries',
    slug: 'subsidiaries',
    label: 'Subsidiaries',
    title: 'Subsidiaries',
    blurb:
      'Operating companies built and owned by Notus Regalia, delivering mission-critical systems within their domains. This space is being prepared.',
  },
  {
    id: 'ventures-portfolio',
    slug: 'portfolio',
    label: 'Portfolio Companies',
    title: 'Portfolio Companies',
    blurb:
      'Established companies we back and partner with to extend our reach across sectors. Details are on the way.',
  },
];

export const DEFAULT_VENTURES_SUBTAB = 'ventures-startups';

export const getVenturesSubtab = (id?: string | null): VenturesSubtab =>
  VENTURES_SUBTABS.find((s) => s.id === id) ??
  VENTURES_SUBTABS.find((s) => s.id === DEFAULT_VENTURES_SUBTAB)!;
