/* ─────────────────────────────────────────────────────────────
   Company navigation model.

   Each Company subtab is a standalone page with its own sections.
   `sections[].id` doubles as the DOM id of the section wrapper on
   that page — the navbar breadcrumb strip scrollspies against it.
   ───────────────────────────────────────────────────────────── */

export interface CompanySection {
  id: string;     // DOM id of the section on the subtab page
  label: string;  // breadcrumb label
}

export interface CompanySubtab {
  id: string;
  label: string;
  external?: string;  // opens this URL in a new tab instead of a page
  hero?: {
    eyebrow?: string;
    title: string;
    subtitle: string;
  };
  sections?: CompanySection[];
}

export const COMPANY_SUBTABS: CompanySubtab[] = [
  {
    id: 'company-about',
    label: 'About Us',
    hero: {
      eyebrow: 'Company Profile',
      title: 'About the Company',
      subtitle: 'Why we build — our philosophy, direction, and the governance that keeps us accountable.',
    },
    sections: [
      { id: 'about-our-company', label: 'Our Company' },
      { id: 'about-what-we-do',  label: 'What we Engineer' },
      { id: 'about-roadmap',     label: 'Roadmap' },
      { id: 'about-explore',     label: 'Explore' },
    ],
  },
  {
    id: 'company-executives',
    label: 'Executives',
    hero: {
      eyebrow: 'Governance Structure',
      title: 'Executives',
      subtitle: 'The leadership behind Notus Regalia — founders and officers steering the mission.',
    },
    sections: [
      { id: 'executives-leadership', label: 'Leadership' },
      { id: 'executives-explore',    label: 'Explore' },
    ],
  },
  {
    id: 'company-investors',
    label: 'Investors',
    hero: {
      eyebrow: 'Capital Structure',
      title: 'Investors',
      subtitle: 'Our capital structure and the partners who back the mission across every phase.',
    },
    sections: [
      { id: 'investors-overview', label: 'Overview' },
      { id: 'investors-capital',  label: 'Capital' },
      { id: 'investors-explore',  label: 'Explore' },
    ],
  },
];

export const DEFAULT_COMPANY_SUBTAB = 'company-about';

export const getCompanySubtab = (id?: string | null): CompanySubtab =>
  COMPANY_SUBTABS.find(s => s.id === id && !s.external)
  ?? COMPANY_SUBTABS.find(s => s.id === DEFAULT_COMPANY_SUBTAB)!;
