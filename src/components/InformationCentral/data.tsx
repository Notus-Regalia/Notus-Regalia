// ─────────────────────────────────────────────────────────────
//  Information Central — site map + rich content (single source)
// ─────────────────────────────────────────────────────────────

export interface InfoSubtab {
  id: string;
  label: string;
  external?: string;  // when set, the subtab opens this URL instead of rendering content
}

export interface InfoTab {
  id: string;
  label: string;
  icon: string;
  subtabs: InfoSubtab[];
}

// ── Content block model ──────────────────────────────────────
export interface DocItem {
  title: string;
  year: string;
  filename: string;
  category?: string;
  description?: string;  // short summary shown on the document card
}

export interface CardItem {
  title: string;
  meta?: string;       // date / location / role type
  body?: string;
  tag?: string;
  icon?: string;
  href?: string;
  cta?: string;        // call-to-action label
}

export interface StatItem {
  value: string;
  label: string;
  sub?: string;
}

export interface PersonItem {
  name: string;
  role: string;
  bio?: string;
}

export interface PublicationItem {
  title: string;
  category: string;
  date: string;
  readTime?: string;
  excerpt: string;
  href?: string;
}

export type ContentBlock =
  | { type: 'text'; heading?: string; paragraphs: string[] }
  | { type: 'releases' }                                          // accordion of `statements`
  | { type: 'stats'; heading?: string; items: StatItem[] }
  | { type: 'cards'; heading?: string; columns?: 2 | 3; items: CardItem[] }
  | { type: 'documents'; heading?: string; items: DocItem[] }
  | { type: 'people'; heading?: string; items: PersonItem[] }
  | { type: 'publications'; featured: PublicationItem; items: PublicationItem[] }
  | { type: 'hero'; stories: PublicationItem[] }
  | { type: 'publicationGrid'; heading?: string; items: PublicationItem[] }
  | { type: 'note'; text: string }
  | { type: 'preferences' };                                      // cookie + user preference toggles

export interface SubtabContent {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  /** When true the landing header is omitted (used for the home/landing page). */
  hideHeader?: boolean;
  /** When true, body text is justified (used for formal legal documents). */
  justify?: boolean;
  blocks: ContentBlock[];
}

// ── Tabs / subtabs ───────────────────────────────────────────
export const INFO_TABS: InfoTab[] = [
  {
    id: 'newsroom',
    label: 'Newsroom',
    icon: 'bi-broadcast',
    subtabs: [
      { id: 'releases',      label: 'Releases' },
      { id: 'announcements', label: 'Announcements' },
      { id: 'media',         label: 'Media' },
      { id: 'careers',       label: 'Careers' },
    ],
  },
  {
    id: 'investors',
    label: 'Investors',
    icon: 'bi-graph-up-arrow',
    subtabs: [
      { id: 'news',       label: 'News' },
      { id: 'events',     label: 'Events & Presentation' },
      { id: 'financials', label: 'Financial Info' },
      { id: 'governance', label: 'Governance' },
      { id: 'resources',  label: 'Investor Resources' },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    icon: 'bi-mortarboard',
    subtabs: [
      { id: 'case-studies',     label: 'Case Studies' },
      { id: 'technical-reports',label: 'Technical Reports' },
      { id: 'documentations',   label: 'Documentations' },
      { id: 'field-testing',    label: 'Field Testing' },
      { id: 'open-source',      label: 'Open Source' },
    ],
  },
  {
    id: 'legals',
    label: 'Legals',
    icon: 'bi-shield-check',
    subtabs: [
      { id: 'policies', label: 'Corporate Policies' },
      { id: 'human-rights', label: 'NR Human Rights Policy' },
      { id: 'privacy',  label: 'Privacy Policy' },
      { id: 'cookie-policy', label: 'Cookie Policy' },
      { id: 'terms',    label: 'Terms of Service' },
      { id: 'acceptable-use', label: 'Acceptable Use Policy' },
      { id: 'vulnerability-disclosure', label: 'Vulnerability Disclosure' },
      { id: 'licenses', label: 'Licenses' },
      { id: 'brand-guidelines', label: 'Brand Guidelines' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'bi-folder',
    subtabs: [
      { id: 'docs-governance',    label: 'Governance' },
      { id: 'docs-social',        label: 'Social' },
      { id: 'docs-environmental', label: 'Environmental' },
      { id: 'media-assets',       label: 'Media Assets' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'bi-gear',
    subtabs: [
      { id: 'preferences', label: 'Preferences' },
      { id: 'sitemap',     label: 'Sitemap', external: '/sitemap' },
      { id: 'status',      label: 'Status', external: '/status' },
    ],
  },
];

export const DEFAULT_SUBTAB: Record<string, string> = {
  newsroom:  'releases',
  investors: 'news',
  research:  'case-studies',
  legals:    'policies',
  documents: 'docs-governance',
  settings:  'preferences',
};

// subtab id → parent tab id (for eyebrow + url integrity)
export const SUBTAB_PARENT: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const tab of INFO_TABS) for (const sub of tab.subtabs) {
    if (!sub.external) map[sub.id] = tab.id; // external subtabs have no in-page content
  }
  return map;
})();

// ─────────────────────────────────────────────────────────────
//  Per-subtab content
// ─────────────────────────────────────────────────────────────
export const SUBTAB_CONTENT: Record<string, SubtabContent> = {
  // ══ NEWSROOM ══════════════════════════════════════════════
  announcements: {
    header: {
      eyebrow: 'Newsroom',
      title: 'Announcements',
      description: 'Official statements, notices, and public disclosures issued by Notus Regalia and its portfolio ventures.',
    },
    blocks: [
      { type: 'releases' },
    ],
  },

  releases: {
    header: {
      eyebrow: 'Newsroom',
      title: 'Releases',
      description: 'Long-form publications, research notes, and editorial from the Notus Regalia operating team.',
    },
    hideHeader: true,
    blocks: [
      {
        type: 'hero',
        stories: [
          {
            title: 'Building Companies Like Systems',
            category: 'Editorial',
            date: 'May 2025',
            readTime: '9 min read',
            excerpt: 'Why we treat ventures as instances of a shared operating system — repeatable infrastructure, disciplined governance, and founder–operator alignment that compound execution across an entire portfolio.',
            href: '/documents/building-companies-like-systems.pdf',
          },
          { title: 'The Stealth Venture-Studio Playbook', category: 'Research', date: 'April 2025', readTime: '12 min read', excerpt: 'A field guide to pre-seed validation: stage-gates, capital efficiency, and knowing when to kill or scale a venture.', href: '/documents/venture-studio-playbook.pdf' },
          { title: 'On Asymmetric Opportunity', category: 'Essay', date: 'March 2025', readTime: '7 min read', excerpt: 'How we identify bets where the downside is bounded and the upside is structurally uncapped.', href: '/documents/asymmetric-opportunity.pdf' },
          { title: 'Shared Infrastructure as Compounding Advantage', category: 'Technical', date: 'February 2025', readTime: '10 min read', excerpt: 'The architecture behind our centralized platform — APIs, data pipelines, and security primitives reused across ventures.', href: '/documents/shared-infrastructure.pdf' },
          { title: 'Governance Without Bureaucracy', category: 'Operations', date: 'January 2025', readTime: '6 min read', excerpt: 'Designing oversight that preserves operational speed while enforcing institutional discipline.', href: '/documents/governance-without-bureaucracy.pdf' },
          { title: 'Carbon Capture at Pilot Scale', category: 'Field Note', date: 'December 2024', readTime: '8 min read', excerpt: 'Lessons from deploying IoT-enabled carbon monitoring across three industrial facilities.', href: '/documents/carbon-capture-pilot.pdf' },
        ],
      },
      {
        type: 'publicationGrid',
        heading: 'Latest Publications',
        items: [
          { title: 'The Stealth Venture-Studio Playbook', category: 'Research', date: 'April 2025', readTime: '12 min read', excerpt: 'A field guide to pre-seed validation: stage-gates, capital efficiency, and knowing when to kill or scale a venture.', href: '/documents/venture-studio-playbook.pdf' },
          { title: 'On Asymmetric Opportunity', category: 'Essay', date: 'March 2025', readTime: '7 min read', excerpt: 'How we identify bets where the downside is bounded and the upside is structurally uncapped.', href: '/documents/asymmetric-opportunity.pdf' },
          { title: 'Shared Infrastructure as Compounding Advantage', category: 'Technical', date: 'February 2025', readTime: '10 min read', excerpt: 'The architecture behind our centralized platform — APIs, data pipelines, and security primitives reused across ventures.', href: '/documents/shared-infrastructure.pdf' },
          { title: 'Governance Without Bureaucracy', category: 'Operations', date: 'January 2025', readTime: '6 min read', excerpt: 'Designing oversight that preserves operational speed while enforcing institutional discipline.', href: '/documents/governance-without-bureaucracy.pdf' },
          { title: 'Carbon Capture at Pilot Scale', category: 'Field Note', date: 'December 2024', readTime: '8 min read', excerpt: 'Lessons from deploying IoT-enabled carbon monitoring across three industrial facilities.', href: '/documents/carbon-capture-pilot.pdf' },
          { title: 'Designing for Offline-First Healthcare', category: 'Case Study', date: 'November 2024', readTime: '11 min read', excerpt: 'How our telemedicine venture delivers diagnostics in low-connectivity regions.', href: '/documents/offline-first-healthcare.pdf' },
        ],
      },
    ],
  },

  media: {
    header: {
      eyebrow: 'Newsroom',
      title: 'Media',
      description: 'Press coverage, brand mentions, interviews, and resources for journalists covering Notus Regalia.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Press & Coverage',
        paragraphs: [
          'Notus Regalia operates in a pre-seed, stealth phase. Selected coverage, feature stories, and interviews with our operating team are catalogued here as they are published.',
          'For interview requests, briefings, or commentary on systems engineering, venture building, and critical-infrastructure technology, reach our communications desk at info@notusregalia.tech.',
        ],
      },
      {
        type: 'cards',
        heading: 'Recent Coverage',
        columns: 2,
        items: [
          { tag: 'Feature', icon: 'bi-newspaper', title: 'Building Companies Like Systems', meta: 'Operator Quarterly · 2025', body: 'A look inside the shared operating platform that lets the holding entity validate ventures with unusual capital efficiency.' },
          { tag: 'Interview', icon: 'bi-mic', title: 'On Asymmetric Opportunity', meta: 'The Build Podcast · 2025', body: 'Our founding operators discuss stage-gate validation, founder–operator alignment, and long-term ownership.' },
          { tag: 'Analysis', icon: 'bi-bar-chart', title: 'The Stealth Venture Studio Model', meta: 'Frontier Markets Review · 2024', body: 'How centralized infrastructure compounds execution across healthcare, fintech, cleantech, and edtech bets.' },
          { tag: 'Mention', icon: 'bi-megaphone', title: 'Carbon Capture Pilots Expand', meta: 'CleanTech Wire · 2024', body: 'Coverage of the Smart Carbon Capture pilot reaching three industrial facilities.' },
        ],
      },
      {
        type: 'cards',
        heading: 'Media Resources',
        columns: 3,
        items: [
          { icon: 'bi-images', title: 'Press Kit', body: 'Logos, executive headshots, and approved boilerplate.', cta: 'Browse Media Assets', href: '/information/documents/media-assets' },
          { icon: 'bi-file-earmark-text', title: 'Fact Sheet', body: 'Company overview, structure, and operating principles.', cta: 'Download PDF', href: '/documents/fact-sheet.pdf' },
          { icon: 'bi-envelope', title: 'Press Contact', body: 'Reach the communications desk directly.', cta: 'info@notusregalia.tech', href: 'mailto:info@notusregalia.tech' },
        ],
      },
    ],
  },

  careers: {
    header: {
      eyebrow: 'Newsroom',
      title: 'Careers',
      description: 'We hire operators who build systems, not just projects. Explore open roles and how we work.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Why Notus Regalia',
        paragraphs: [
          'We are a holding and venture-building entity that develops, stewards, and scales early-stage systems across multiple industries. You will work close to the metal — shipping shared infrastructure and validating ventures under real-world constraints.',
          'We optimize for systems-first thinking, capital efficiency, and founder–operator alignment with genuine long-term ownership. The people who thrive here are comfortable with ambiguity, bias toward action, and care about durable institutional discipline.',
        ],
      },
      {
        type: 'cards',
        heading: 'Open Roles',
        columns: 2,
        items: [
          { tag: 'Engineering', icon: 'bi-cpu', title: 'Founding Platform Engineer', meta: 'Remote · Full-time', body: 'Own the shared technical platform — APIs, data pipelines, and security protocols spanning every venture.', cta: 'Apply', href: '/contact' },
          { tag: 'Engineering', icon: 'bi-shield-lock', title: 'Security & Compliance Lead', meta: 'Remote · Full-time', body: 'Drive HIPAA, KYC/AML, and infosec posture across regulated venture operations.', cta: 'Apply', href: '/contact' },
          { tag: 'Operations', icon: 'bi-diagram-3', title: 'Venture Operator', meta: 'Hybrid · Full-time', body: 'Stand up new ventures from validation through stage-gate advancement.', cta: 'Apply', href: '/contact' },
          { tag: 'Design', icon: 'bi-bezier2', title: 'Product Designer', meta: 'Remote · Contract', body: 'Shape product surfaces for ventures in healthcare, fintech, and edtech.', cta: 'Apply', href: '/contact' },
        ],
      },
      {
        type: 'cards',
        heading: 'How We Hire',
        columns: 3,
        items: [
          { icon: 'bi-chat-dots', title: '1 · Conversation', body: 'A candid talk about your work, what you want to own, and how we operate.' },
          { icon: 'bi-tools', title: '2 · Working Session', body: 'A paid, scoped exercise that mirrors real problems you would solve here.' },
          { icon: 'bi-people', title: '3 · Team & Offer', body: 'Meet the operators you would build alongside, then a fast, transparent offer.' },
        ],
      },
      {
        type: 'note',
        text: "Don't see your role? We are always interested in exceptional operators. Write to info@notusregalia.tech.",
      },
    ],
  },

  // ══ INVESTORS ═════════════════════════════════════════════
  news: {
    header: {
      eyebrow: 'Investors',
      title: 'Investor News',
      description: 'Portfolio milestones, capital updates, and disclosures relevant to current and prospective investors.',
    },
    blocks: [
      {
        type: 'cards',
        heading: 'Latest Updates',
        columns: 2,
        items: [
          { tag: 'Capital', icon: 'bi-cash-coin', title: 'Pre-Seed Operating Framework Established', meta: 'January 2025', body: 'The holding entity formalizes a centralized platform for capital-efficient experimentation and validation.' },
          { tag: 'Portfolio', icon: 'bi-rocket-takeoff', title: 'Healthcare & FinTech Ventures Reach Beta', meta: 'December 2024', body: 'AI Telemedicine and Micro-Lending Blockchain ventures transition to private beta and pilot.' },
          { tag: 'Governance', icon: 'bi-bank', title: 'Governance Framework Published', meta: 'November 2024', body: 'Decision-making protocols, resource allocation, and venture oversight mechanisms formalized.' },
          { tag: 'Milestone', icon: 'bi-wind', title: 'CleanTech Pilot With Industrial Partners', meta: 'October 2024', body: 'Smart Carbon Capture advances to pilot deployment across three facilities.' },
        ],
      },
      {
        type: 'note',
        text: 'Accredited investors can request full disclosure packages through investor relations at info@notusregalia.tech.',
      },
    ],
  },

  events: {
    header: {
      eyebrow: 'Investors',
      title: 'Events & Presentation',
      description: 'Upcoming briefings, earnings-style updates, and downloadable investor presentations.',
    },
    blocks: [
      {
        type: 'cards',
        heading: 'Upcoming',
        columns: 2,
        items: [
          { tag: 'Briefing', icon: 'bi-calendar-event', title: 'Q2 Portfolio Briefing', meta: 'Virtual · By invitation', body: 'Quarterly walk-through of venture progress, key milestones, and forward priorities.', cta: 'Request Invite', href: '/contact' },
          { tag: 'Update', icon: 'bi-broadcast-pin', title: 'Annual Operating Review', meta: 'Virtual · By invitation', body: 'Year-in-review covering capital allocation, validation outcomes, and the operating platform.', cta: 'Request Invite', href: '/contact' },
        ],
      },
      {
        type: 'cards',
        heading: 'Presentations',
        columns: 3,
        items: [
          { icon: 'bi-file-earmark-slides', title: 'Investor Deck', body: 'Current overview of the thesis, structure, and portfolio.', cta: 'Download', href: '/documents/investor-deck.pdf' },
          { icon: 'bi-file-earmark-bar-graph', title: 'Portfolio Snapshot', body: 'Stage and status across active ventures.', cta: 'Download', href: '/documents/portfolio-snapshot.pdf' },
          { icon: 'bi-film', title: 'Recorded Briefing', body: 'Replay of the most recent quarterly briefing.', cta: 'Watch', href: '/contact' },
        ],
      },
      {
        type: 'note',
        text: 'Event access and materials are provided to verified, accredited investors in line with applicable securities regulations.',
      },
    ],
  },

  financials: {
    header: {
      eyebrow: 'Investors',
      title: 'Financial Info',
      description: 'Financial highlights, capital-allocation summaries, and periodic reports for the investor community.',
    },
    blocks: [
      {
        type: 'stats',
        heading: 'At a Glance',
        items: [
          { value: 'Pre-Seed', label: 'Operating Stage', sub: 'Stealth phase' },
          { value: '6+', label: 'Active Ventures', sub: 'Across 4 sectors' },
          { value: '35–40%', label: 'Faster to Production', sub: 'Shared platform' },
          { value: 'Quarterly', label: 'Investor Cadence', sub: 'Disclosure rhythm' },
        ],
      },
      {
        type: 'text',
        heading: 'Capital Allocation',
        paragraphs: [
          'As a pre-seed, stealth-phase holding entity, our financial disclosures reflect our current stage and long-term value-creation strategy. Capital is deployed against asymmetric opportunities and shared infrastructure that compounds across the portfolio.',
          'Periodic financial updates and capital-allocation summaries are made available to accredited investors and stakeholders in accordance with applicable securities regulations.',
        ],
      },
      {
        type: 'cards',
        heading: 'Reports',
        columns: 3,
        items: [
          { icon: 'bi-file-earmark-text', title: 'Q4 2024 Venture Update', meta: 'PDF', cta: 'Download', href: '/documents/q4-2024-venture-update.pdf' },
          { icon: 'bi-file-earmark-text', title: 'Capital Allocation Summary', meta: 'PDF', cta: 'Download', href: '/documents/capital-allocation-summary.pdf' },
          { icon: 'bi-file-earmark-text', title: 'Risk Disclosure Statement', meta: 'PDF', cta: 'Download', href: '/documents/risk-disclosure.pdf' },
        ],
      },
      {
        type: 'note',
        text: 'For access to confidential financial materials, contact investor relations to verify your accreditation status.',
      },
    ],
  },

  governance: {
    header: {
      eyebrow: 'Investors',
      title: 'Governance',
      description: 'How Notus Regalia is governed — board structure, committees, and the principles that guide oversight.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Governance Framework',
        paragraphs: [
          'Our governance framework establishes a clear delineation between holding-entity responsibilities and individual venture operations — ensuring institutional discipline while preserving operational flexibility.',
          'It defines decision-making protocols, resource-allocation methodologies, stage-gate advancement criteria, and risk-management practices applied consistently across the portfolio.',
        ],
      },
      {
        type: 'people',
        heading: 'Advisory Board',
        items: [
          { name: 'Industry Veterans', role: 'Sector Guidance', bio: 'Domain expertise across healthcare technology, financial systems, sustainable infrastructure, and education.' },
          { name: 'Academic Researchers', role: 'Research & Validation', bio: 'External perspective on market assumptions and technical direction.' },
          { name: 'Operational Experts', role: 'Execution Oversight', bio: 'Hands-on review of portfolio performance and resource allocation.' },
        ],
      },
      {
        type: 'cards',
        heading: 'Committees & Charters',
        columns: 3,
        items: [
          { icon: 'bi-bank', title: 'Audit & Risk', body: 'Oversight of compliance, controls, and risk posture across ventures.' },
          { icon: 'bi-people', title: 'Nomination', body: 'Advisory composition and founder–operator alignment.' },
          { icon: 'bi-cash-stack', title: 'Capital', body: 'Allocation discipline and stage-gate funding decisions.' },
        ],
      },
    ],
  },

  resources: {
    header: {
      eyebrow: 'Investors',
      title: 'Investor Resources',
      description: 'Financial disclosures, due-diligence materials, and the contacts you need as an investor.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Overview',
        paragraphs: [
          'Notus Regalia is committed to transparent, open communication with its investor community. This section provides access to financial disclosures, performance updates, and investor resources.',
          'As a pre-seed, stealth-phase holding entity, our investor materials reflect our current stage of development and long-term value-creation strategy.',
        ],
      },
      {
        type: 'cards',
        heading: 'Secure Investor Portal',
        columns: 2,
        items: [
          { icon: 'bi-file-earmark-slides', title: 'Pitch Decks & Diligence', body: 'Pitch decks, due-diligence materials, and cap-table summaries for registered investors.' },
          { icon: 'bi-graph-up', title: 'Performance Reports', body: 'Venture performance reports and quarterly portfolio updates.' },
        ],
      },
      {
        type: 'text',
        heading: 'Contact Investor Relations',
        paragraphs: [
          'For inquiries related to investment opportunities, existing positions, or shareholder matters, contact our investor relations team at info@notusregalia.tech.',
          'All investor communications are handled in strict confidence and in compliance with applicable financial regulations and non-disclosure obligations.',
        ],
      },
    ],
  },

  // ══ RESEARCH ══════════════════════════════════════════════
  'case-studies': {
    header: {
      eyebrow: 'Research',
      title: 'Case Studies',
      description: 'Real-world deployments and outcomes from across the Notus Regalia portfolio.',
    },
    blocks: [
      {
        type: 'cards',
        heading: 'Selected Case Studies',
        columns: 2,
        items: [
          { tag: 'Healthcare', icon: 'bi-heart-pulse', title: 'Offline-First Telemedicine in Low-Connectivity Regions', meta: 'AI Telemedicine Platform', body: 'How controlled deployment with select partners delivered diagnostics with real-time sync and offline capability.', cta: 'Read case study', href: '/documents/case-study-telemedicine.pdf' },
          { tag: 'FinTech', icon: 'bi-cash-coin', title: 'Blockchain Microfinance Across Three Emerging Markets', meta: 'Micro-Lending Blockchain', body: 'Smart-contract audits, pilot lending programs, and the path from beta to production.', cta: 'Read case study', href: '/documents/case-study-microfinance.pdf' },
          { tag: 'CleanTech', icon: 'bi-wind', title: 'Carbon Capture at Industrial Pilot Scale', meta: 'Smart Carbon Capture', body: 'IoT-enabled monitoring across three facilities with measurable emissions reductions.', cta: 'Read case study', href: '/documents/case-study-carbon.pdf' },
          { tag: 'EdTech', icon: 'bi-mortarboard', title: 'Adaptive STEM Learning for 500+ Students', meta: 'Adaptive STEM Learning', body: 'Personalized learning paths with online and offline modes across three regions.', cta: 'Read case study', href: '/documents/case-study-edtech.pdf' },
        ],
      },
    ],
  },

  'technical-reports': {
    header: {
      eyebrow: 'Research',
      title: 'Technical Reports',
      description: 'In-depth technical reports, benchmarks, and methodology papers from our research programs.',
    },
    blocks: [
      {
        type: 'documents',
        items: [
          { title: 'Shared Platform Architecture', year: '2025', filename: 'tr-platform-architecture.pdf' },
          { title: 'Carbon Capture Methodology', year: '2025', filename: 'tr-carbon-methodology.pdf' },
          { title: 'Offline Sync Protocol Benchmark', year: '2025', filename: 'tr-offline-sync.pdf' },
          { title: 'Smart-Contract Security Audit', year: '2024', filename: 'tr-smart-contract-audit.pdf' },
          { title: 'Model Evaluation Framework', year: '2025', filename: 'tr-model-evaluation.pdf' },
          { title: 'Data Pipeline Performance', year: '2025', filename: 'tr-data-pipeline.pdf' },
          { title: 'Security Threat Model', year: '2024', filename: 'tr-threat-model.pdf' },
          { title: 'Reliability & Uptime Study', year: '2025', filename: 'tr-reliability.pdf' },
        ],
      },
    ],
  },

  documentations: {
    header: {
      eyebrow: 'Research',
      title: 'Documentations',
      description: 'Developer guides, API references, and integration documentation for our platform and tools.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Developer Resources',
        paragraphs: [
          'Our shared platform exposes consistent APIs, SDKs, and data pipelines reused across ventures. The documentation below covers getting started, core concepts, and integration patterns.',
        ],
      },
      {
        type: 'cards',
        heading: 'Browse the Docs',
        columns: 3,
        items: [
          { icon: 'bi-rocket-takeoff', title: 'Getting Started', body: 'Set up access, authentication, and your first integration.', cta: 'Open guide', href: '/documents/docs-getting-started.pdf' },
          { icon: 'bi-braces', title: 'API Reference', body: 'Endpoints, schemas, and examples for the core platform APIs.', cta: 'Open reference', href: '/documents/docs-api-reference.pdf' },
          { icon: 'bi-diagram-3', title: 'Architecture Concepts', body: 'How shared infrastructure, data, and security fit together.', cta: 'Open guide', href: '/documents/docs-architecture.pdf' },
          { icon: 'bi-shield-lock', title: 'Security & Compliance', body: 'Auth, data protection, and compliance requirements.', cta: 'Open guide', href: '/documents/docs-security.pdf' },
          { icon: 'bi-plug', title: 'Integrations', body: 'Connect external systems and third-party services.', cta: 'Open guide', href: '/documents/docs-integrations.pdf' },
          { icon: 'bi-life-preserver', title: 'Support', body: 'Troubleshooting, FAQs, and how to reach the team.', cta: 'Contact', href: '/contact' },
        ],
      },
    ],
  },

  'field-testing': {
    header: {
      eyebrow: 'Research',
      title: 'Field Testing',
      description: 'Pilot programs, controlled deployments, and the real-world results that validate our ventures.',
    },
    blocks: [
      {
        type: 'stats',
        heading: 'Field Program Snapshot',
        items: [
          { value: '3', label: 'Active Pilots', sub: 'Across 3 sectors' },
          { value: '500+', label: 'Test Participants', sub: 'EdTech cohort' },
          { value: '40–50%', label: 'Emissions Cut', sub: 'CleanTech pilot' },
          { value: '3', label: 'Markets', sub: 'FinTech pilot' },
        ],
      },
      {
        type: 'cards',
        heading: 'Programs in the Field',
        columns: 2,
        items: [
          { tag: 'Healthcare', icon: 'bi-heart-pulse', title: 'Telemedicine Controlled Deployment', meta: 'Ongoing', body: 'Diagnostic accuracy and sync reliability with select healthcare partners.' },
          { tag: 'CleanTech', icon: 'bi-wind', title: 'Carbon Capture Pilot Sites', meta: 'Ongoing', body: 'Real-time monitoring and capture across three industrial facilities.' },
          { tag: 'FinTech', icon: 'bi-cash-coin', title: 'Microfinance Lending Pilots', meta: 'Ongoing', body: 'Small-business borrower programs in three emerging markets.' },
          { tag: 'EdTech', icon: 'bi-mortarboard', title: 'Adaptive Learning Trials', meta: 'Ongoing', body: 'Engagement and comprehension testing with 500+ students.' },
        ],
      },
      {
        type: 'note',
        text: 'Field-testing results are published as case studies and technical reports once validated.',
      },
    ],
  },

  'open-source': {
    header: {
      eyebrow: 'Research',
      title: 'Open Source',
      description: 'Tools, libraries, and components we share back with the community.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Our Commitment',
        paragraphs: [
          'We build on open source and contribute back where it strengthens the ecosystem. Selected internal tools and libraries are released under permissive licenses.',
        ],
      },
      {
        type: 'cards',
        heading: 'Repositories',
        columns: 3,
        items: [
          { icon: 'bi-github', title: 'nr-platform-sdk', tag: 'TypeScript', body: 'Client SDK for the shared platform APIs.', cta: 'View on GitHub', href: 'https://github.com' },
          { icon: 'bi-github', title: 'nr-data-pipelines', tag: 'Python', body: 'Reusable data-pipeline components and connectors.', cta: 'View on GitHub', href: 'https://github.com' },
          { icon: 'bi-github', title: 'nr-ui-kit', tag: 'React', body: 'Shared design-system components.', cta: 'View on GitHub', href: 'https://github.com' },
          { icon: 'bi-github', title: 'nr-carbon-toolkit', tag: 'Python', body: 'Carbon monitoring and reporting utilities.', cta: 'View on GitHub', href: 'https://github.com' },
          { icon: 'bi-github', title: 'nr-security-baseline', tag: 'Config', body: 'Hardening baselines and security policies.', cta: 'View on GitHub', href: 'https://github.com' },
          { icon: 'bi-git', title: 'Contribution Guide', body: 'How to contribute, report issues, and propose changes.', cta: 'Read guide', href: '/documents/open-source-contributing.pdf' },
        ],
      },
    ],
  },

  // ══ LEGALS ════════════════════════════════════════════════
  licenses: {
    header: {
      eyebrow: 'Legals',
      title: 'Licenses',
      description: 'Software and content licensing terms governing Notus Regalia products and third-party components.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Software Licenses',
        paragraphs: [
          'All software developed by Notus Regalia is subject to specific licensing terms. Please review the applicable license for each product or service.',
          'We respect intellectual property rights and comply with all relevant open-source licenses for third-party components used in our projects.',
        ],
      },
      {
        type: 'text',
        heading: 'Content Licensing',
        paragraphs: [
          'Original content — including text, graphics, and multimedia elements — is protected by copyright and may not be reproduced without permission.',
          'For licensing inquiries or permission requests, please contact our legal department at info@notusregalia.tech.',
        ],
      },
    ],
  },

  'human-rights': {
    header: {
      eyebrow: 'Legals',
      title: 'NR Human Rights Policy',
      description: 'Our commitment to upholding human rights across our operations, products, and partnerships.',
    },
    justify: true,
    blocks: [
      {
        type: 'text',
        heading: '1. Policy Statement',
        paragraphs: [
          'Notus Regalia builds systems for mission-critical operations — including healthcare delivery and national defense — where the consequences of failure, misuse, or abuse fall on human lives. We therefore treat respect for human rights not as a compliance exercise but as an engineering and governance requirement of equal rank to safety and security.',
          'We commit to respecting all internationally recognized human rights as expressed in the International Bill of Human Rights (the Universal Declaration of Human Rights and the two International Covenants) and the ILO Declaration on Fundamental Principles and Rights at Work. We implement this commitment through the UN Guiding Principles on Business and Human Rights (UNGPs) and the OECD Guidelines for Multinational Enterprises, and — for defense-related work — through the rules and principles of international humanitarian law and the Voluntary Principles on Security and Human Rights.',
          'Where national law conflicts with internationally recognized human rights, we comply with the law while seeking ways to honor the spirit of international standards. Where national law is silent, international standards govern our conduct.',
        ],
      },
      {
        type: 'text',
        heading: '2. Scope and Governance',
        paragraphs: [
          'This Policy applies to Notus Regalia, every venture under its control, and every director, officer, employee, and contractor acting on our behalf. We expect — and contractually require, where we have leverage — our suppliers, resellers, integrators, and end customers to uphold equivalent standards in connection with our products and services.',
          'Accountability for this Policy sits at board level. A designated oversight body reviews high-sensitivity engagements, approves exceptions (none of which may cross the red lines in Section 6), tracks remediation, and reports on implementation annually. Operating leaders are responsible for executing the Policy within their ventures; the Human Rights Office administers it day to day.',
        ],
      },
      {
        type: 'text',
        heading: '3. Heightened Duty in Critical Systems',
        paragraphs: [
          'The UNGPs call for due diligence proportionate to the severity of potential impacts. Most of our work concentrates in two domains where potential impacts are at their most severe: systems that touch patients, and systems that touch the use of force. We accordingly apply a heightened standard — earlier review, stricter controls, more conservative defaults — to any engagement in these domains.',
          'In practice this means: severity outranks probability in our risk assessments; irreversibility of harm weighs heaviest of all; and where we cannot adequately prevent or mitigate a salient risk, we decline or exit the engagement rather than manage the optics of it.',
        ],
      },
      {
        type: 'text',
        heading: '4. Commitments in Healthcare',
        paragraphs: [
          'Systems we build for healthcare must widen access to care, never narrow it. We commit to: patient dignity and informed consent as design constraints, not configuration options; clinical safety review and qualified human oversight over any system output that informs diagnosis, triage, or treatment; equitable performance across populations, with bias evaluation before and after deployment; and strict protection of patient data consistent with our [Privacy Policy](/information/legals/privacy) and applicable health-data regulations.',
          'Because several of our ventures serve underserved and low-connectivity regions, we treat accessibility as a human-rights matter: degraded infrastructure must degrade features, never safety. A clinician, not a model, remains the decision-maker of record in every clinical workflow we ship.',
        ],
      },
      {
        type: 'text',
        heading: '5. Commitments in Defense and National Security',
        paragraphs: [
          'We build defense technology for the protection of civilian populations, lawful self-defense, and the security of democratic institutions — and we accept the special responsibility that work entails. All defense engagements must be consistent with international humanitarian law, including the principles of distinction, proportionality, and precaution.',
          'We commit to meaningful human control: systems we provide will not select and engage human targets without accountable human judgment in the decision loop. We support our customers\' own legal review obligations (including Article 36 weapons-review processes where applicable), provide the documentation and system transparency those reviews require, and apply technical and contractual end-use limits on how our systems may be employed.',
          'We serve only customers and jurisdictions screened against applicable sanctions, arms-control, and export-control regimes, and we re-screen on a defined cycle and upon material change in a customer\'s conduct or a jurisdiction\'s standing. Field deployments of high-sensitivity capabilities are subject to post-deployment monitoring and audit rights wherever we can secure them.',
        ],
      },
      {
        type: 'cards',
        heading: '6. Red Lines — What We Will Not Do',
        columns: 3,
        items: [
          { icon: 'bi-crosshair', title: 'No Autonomous Lethal Force', body: 'We will not build or enable systems that select and engage human targets without meaningful human control.' },
          { icon: 'bi-eye-slash', title: 'No Tools of Repression', body: 'We will not supply systems for unlawful mass surveillance, suppression of dissent, or persecution of protected groups.' },
          { icon: 'bi-ban', title: 'No Sanctioned End Users', body: 'We will not sell to embargoed regimes, sanctioned entities, or buyers who conceal end use or end users.' },
          { icon: 'bi-heart-pulse', title: 'No Discriminatory Care', body: 'We will not ship healthcare systems that gate, ration, or degrade care on discriminatory grounds.' },
          { icon: 'bi-person-x', title: 'No Forced or Child Labor', body: 'We will not tolerate forced, bonded, trafficked, or child labor anywhere in our operations or supply chain.' },
          { icon: 'bi-shield-x', title: 'No Knowing IHL Violations', body: 'We will not proceed with any engagement we assess as likely to contribute to violations of the laws of armed conflict.' },
          { icon: 'bi-box-seam', title: 'No Export-Control Evasion', body: 'We will not structure transactions to circumvent export controls, arms regulations, or end-use certifications.' },
          { icon: 'bi-incognito', title: 'No Covert Data Exploitation', body: 'We will not repurpose patient, citizen, or operational data beyond its declared, lawful purpose.' },
          { icon: 'bi-megaphone', title: 'No Retaliation', body: 'We will not retaliate — and will not permit retaliation — against anyone who raises a concern in good faith.' },
        ],
      },
      {
        type: 'text',
        heading: '7. Human Rights Due Diligence',
        paragraphs: [
          'Consistent with UNGPs 17–21, we operate a continuing due-diligence cycle: identify and assess actual and potential impacts; integrate findings and act on them; track the effectiveness of our responses; and communicate how impacts are addressed.',
          'Every prospective engagement is screened for human-rights risk at intake. Engagements flagged as high-sensitivity — by domain, customer profile, jurisdiction, or capability — undergo enhanced review before signature, with conditions attached to approval and documented dissent preserved. Diligence does not end at signature: deployed engagements are re-assessed on a defined cycle, on material change, and on credible allegation.',
          'Where we identify that we have caused or contributed to adverse impacts, we provide for or cooperate in remediation through legitimate processes. Where impacts are directly linked to our products through a business relationship, we use and, where necessary, build leverage to prevent and mitigate them — and we end relationships where leverage fails and the impact is grave.',
        ],
      },
      {
        type: 'text',
        heading: '8. Rights by Design',
        paragraphs: [
          'We engineer human-rights safeguards into the systems themselves: auditable logs of consequential actions; role-based authorization and command accountability; capability partitioning so that escalation requires affirmative, recorded human decisions; abuse-resistant defaults; and kill-switch and revocation mechanisms enforceable under our license terms.',
          'Documentation shipped with high-sensitivity systems states intended use, known limitations, and prohibited applications in unambiguous terms, so that operators, reviewing authorities, and oversight bodies can hold use to account.',
        ],
      },
      {
        type: 'text',
        heading: '9. Our People and Workplace',
        paragraphs: [
          'Within our own walls we uphold the ILO fundamental principles: freedom of association and collective bargaining, elimination of forced and child labor, non-discrimination in employment, and a safe and healthy working environment. Hiring, advancement, and compensation decisions are made on merit and mission contribution alone.',
          'Employees working on high-sensitivity programs receive training on this Policy, international humanitarian law basics relevant to their work, and escalation procedures — and have a protected right to raise objections to specific taskings on conscience grounds without career penalty.',
        ],
      },
      {
        type: 'text',
        heading: '10. Suppliers, Partners, and End Use',
        paragraphs: [
          'We flow these standards down. Supplier and partner agreements include human-rights, labor, and anti-trafficking commitments; high-sensitivity resale and integration require our prior written consent and preservation of end-use restrictions; and we audit critical suppliers on a risk basis.',
          'Violation of these commitments is grounds for remediation requirements, suspension, or termination — applied with regard to the severity of the impact and the counterparty\'s willingness to correct it.',
        ],
      },
      {
        type: 'text',
        heading: '11. Raising Concerns and Access to Remedy',
        paragraphs: [
          'Anyone — employees, patients, civilians, customers, suppliers, or community members — may report a human-rights concern to our Human Rights Office at [info@notusregalia.tech](mailto:info@notusregalia.tech). Reports may be made confidentially and, where the channel permits, anonymously. We accept reports in any language and through intermediaries such as counsel or civil-society organizations.',
          'Our grievance process is built to the effectiveness criteria of UNGP 31: it is legitimate, accessible, predictable, equitable, transparent, rights-compatible, and a source of continuous learning. We acknowledge reports promptly, investigate them with appropriate independence, communicate outcomes to the extent confidentiality allows, and provide for or cooperate in remedy where we have caused or contributed to harm.',
          'Use of our grievance mechanism never precludes access to judicial or state-based remedies, and we will not enforce contractual terms to obstruct lawful claims by affected people.',
        ],
      },
      {
        type: 'text',
        heading: '12. Stakeholder Engagement',
        paragraphs: [
          'We engage in good faith with the people our systems affect — patients and clinicians, civilian communities in deployment regions, human-rights experts, and oversight institutions — and we factor their perspectives into design and deployment decisions, with particular attention to individuals and groups at heightened risk of vulnerability or marginalization.',
        ],
      },
      {
        type: 'text',
        heading: '13. Transparency and Reporting',
        paragraphs: [
          'We publish an annual human-rights disclosure covering: the salient risks we identified, how diligence changed our engagements (including declined or exited business, in aggregate), grievance volumes and outcomes in anonymized form, and remediation undertaken. Reporting follows the UNGP Reporting Framework so that our claims can be examined, not merely read.',
        ],
      },
      {
        type: 'text',
        heading: '14. Review',
        paragraphs: [
          'This Policy is reviewed at least annually, and additionally upon material change in our portfolio, the regulatory landscape, or the nature of armed conflict and healthcare technology. Amendments require approval by the board-level oversight body, and the current version is always the one published on this page.',
        ],
      },
      {
        type: 'note',
        text: 'Version 2.0 · Effective 12 June 2026 · This Policy is aligned with the International Bill of Human Rights, the ILO Declaration on Fundamental Principles and Rights at Work, the UN Guiding Principles on Business and Human Rights, the OECD Guidelines for Multinational Enterprises, international humanitarian law, and the Voluntary Principles on Security and Human Rights.',
      },
    ],
  },

  privacy: {
    header: {
      eyebrow: 'Legals',
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect personal data, and the rights you have over your information.',
    },
    justify: true,
    blocks: [
      {
        type: 'text',
        heading: '1. Who We Are and What This Policy Covers',
        paragraphs: [
          'Notus Regalia ("we", "us", "our") acts as a Personal Information Controller for the personal data described in this Policy. This Privacy Policy explains how we collect, use, store, share, and protect personal data when you visit our websites, contact us, apply for a role, engage with us as an investor or partner, or use products and services operated by Notus Regalia and its portfolio ventures.',
          'We process personal data in accordance with Republic Act No. 10173 (the Philippine Data Privacy Act of 2012), its Implementing Rules and Regulations, and issuances of the [National Privacy Commission](https://privacy.gov.ph) (NPC), as well as, where applicable, the EU/UK General Data Protection Regulation (GDPR) and other data-protection laws in jurisdictions where we operate.',
          'Individual ventures within the portfolio may publish supplemental privacy notices for specific products. Where a supplemental notice exists, it applies in addition to — and prevails over — this Policy for that product.',
        ],
      },
      {
        type: 'text',
        heading: '2. Personal Data We Collect',
        paragraphs: [
          'Information you provide directly: name, email address, phone number, organization and role, and the contents of messages when you contact us, request a demo, subscribe to updates, or report an issue; professional background, CVs, and references when you apply for a role; identity, accreditation, and transaction details when you engage with us as an investor or counterparty, including information required for know-your-customer (KYC) and anti-money-laundering (AML) compliance.',
          'Information collected automatically: IP address, device and browser type, operating system, referring pages, pages visited, approximate (city-level) location derived from IP, timestamps, and interaction events, collected through cookies and similar technologies described in Section 5.',
          'Information from third parties: publicly available professional information, sanctions and watchlist screening results, references you authorize us to contact, and analytics or security signals from our service providers.',
          'We do not knowingly collect sensitive personal information (such as health data, government identifiers, or biometric data) through this website. Where a specific engagement requires it — for example, government-issued ID for investor verification — we collect it under a specific lawful basis, with heightened safeguards, and only to the extent necessary.',
        ],
      },
      {
        type: 'text',
        heading: '3. Why We Process Personal Data and Our Lawful Bases',
        paragraphs: [
          'We process personal data only where a lawful criterion under Sections 12 and 13 of the Data Privacy Act — and, where the GDPR applies, Article 6 — is met. We rely on: (a) consent, for marketing communications and non-essential cookies; (b) contract, to respond to your requests, evaluate applications, and perform agreements with you; (c) legal obligation, for KYC/AML, tax, audit, and regulatory requirements; and (d) legitimate interests, to secure our systems, prevent fraud and abuse, measure and improve our websites, and conduct corporate due diligence — balanced in each case against your rights and freedoms.',
          'Specifically, we use personal data to: operate, secure, and improve our websites and services; respond to inquiries and provide requested materials; assess candidates and manage recruitment; onboard and communicate with investors and partners; meet legal, regulatory, and contractual obligations; detect, investigate, and prevent security incidents and misuse; and, with your consent, send newsletters and announcements you can opt out of at any time.',
          'We do not sell personal data, and we do not share it with third parties for their own cross-context behavioral advertising. We do not use personal data collected through this website for automated decision-making that produces legal or similarly significant effects on you.',
        ],
      },
      {
        type: 'text',
        heading: '4. Proportionality and Data Minimization',
        paragraphs: [
          'Consistent with the Data Privacy Act\'s principles of transparency, legitimate purpose, and proportionality, we collect only the personal data that is adequate, relevant, and necessary for the declared purpose, and we do not retain it longer than needed for that purpose.',
          'Where practicable, we anonymize or aggregate data — for example, in analytics and public reporting — so that it can no longer be used to identify you.',
        ],
      },
      {
        type: 'text',
        heading: '5. Cookies and Similar Technologies',
        paragraphs: [
          'Our use of cookies and similar technologies — including browser local storage and analytics scripts — is governed in detail by our [Cookie Policy](/information/legals/cookie-policy), which forms part of this Privacy Policy, inventories every technology we use, and states the legal basis for each. In summary: strictly necessary technologies run without consent because the site cannot function or honor your choices without them; preference and analytics technologies run only as described there, and analytics only with your consent; and we use no advertising, targeting, or cross-site tracking technologies of any kind.',
          'You can make or change your choices through the cookie banner shown on your first visit, at any time in the [Preferences page](/information/settings/preferences) of this Information Central, and through your browser settings. Declining non-essential technologies does not affect your ability to use the site.',
        ],
      },
      {
        type: 'text',
        heading: '6. Sharing and Disclosure',
        paragraphs: [
          'We share personal data only on a need-to-know basis with: (a) portfolio ventures and affiliates under common control, for the purposes described in this Policy and subject to consistent safeguards; (b) service providers acting as Personal Information Processors on our behalf — such as hosting, analytics, communications, and security vendors — bound by contracts that meet the outsourcing requirements of the Data Privacy Act\'s IRR and, where applicable, GDPR Article 28; (c) professional advisers, auditors, and insurers under duties of confidentiality; (d) competent authorities, where disclosure is required by law, regulation, or enforceable government request, or to establish, exercise, or defend legal claims; and (e) a successor entity in connection with a merger, acquisition, or reorganization, subject to this Policy continuing to apply.',
          'Whenever we engage a processor, we require written commitments on confidentiality, security measures, sub-processing, breach notification, and the return or deletion of data at the end of the engagement.',
        ],
      },
      {
        type: 'text',
        heading: '7. International Data Transfers',
        paragraphs: [
          'We operate from the Philippines and use service providers that may store or process data in other jurisdictions, including the United States and the European Economic Area. When personal data is transferred across borders, we remain accountable for it under Section 21 of the Data Privacy Act.',
          'For transfers out of jurisdictions that restrict international transfers, we use appropriate safeguards such as contractual clauses imposing equivalent protection (including, where the GDPR applies, the European Commission\'s Standard Contractual Clauses), transfer impact assessments, and supplementary technical measures such as encryption in transit and at rest.',
        ],
      },
      {
        type: 'text',
        heading: '8. Retention',
        paragraphs: [
          'We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, comply with legal, regulatory, tax, and audit obligations, resolve disputes, and enforce agreements. As general guidance: inquiry correspondence is kept for up to two (2) years after the matter is closed; recruitment records for unsuccessful applications for up to one (1) year unless you consent to a longer talent-pool retention; investor and KYC/AML records for the period required by applicable financial regulations (typically five (5) years after the relationship ends); and server and security logs for up to twelve (12) months.',
          'When retention periods lapse, we securely delete, destroy, or irreversibly anonymize the data in line with NPC guidance on secure disposal.',
        ],
      },
      {
        type: 'text',
        heading: '9. How We Protect Personal Data',
        paragraphs: [
          'We maintain organizational, physical, and technical security measures appropriate to the risks, as required by the Data Privacy Act and its IRR. These include: a designated Data Protection Officer and documented privacy policies; role-based access controls and least-privilege administration; encryption of data in transit (TLS) and at rest for sensitive stores; network and application hardening, security headers, and rate limiting; logging, monitoring, and regular review of access; vendor security assessments; and personnel confidentiality undertakings and privacy training.',
          'No system is perfectly secure. We ask that you also protect any credentials you use with us and contact us immediately if you suspect unauthorized activity.',
        ],
      },
      {
        type: 'text',
        heading: '10. Personal Data Breach Notification',
        paragraphs: [
          'We maintain a security incident response procedure. Where a personal data breach involving sensitive personal information, or information that may enable identity fraud, is likely to give rise to a real risk of serious harm, we will notify the National Privacy Commission and affected data subjects within seventy-two (72) hours of knowledge of the breach, in accordance with NPC Circular No. 16-03, and — where the GDPR applies — the relevant supervisory authority within the same period.',
          'Notifications will describe the nature of the breach, the data involved, the measures taken to address it, and the steps you can take to protect yourself.',
        ],
      },
      {
        type: 'cards',
        heading: '11. Your Rights as a Data Subject',
        columns: 3,
        items: [
          { icon: 'bi-info-circle', title: 'Right to Be Informed', body: 'Know whether, why, and how your personal data is being processed before it enters our systems.' },
          { icon: 'bi-eye', title: 'Right to Access', body: 'Obtain a copy of the personal data we hold about you and details of how it has been processed.' },
          { icon: 'bi-pencil-square', title: 'Right to Rectification', body: 'Have inaccurate or incomplete personal data corrected or completed without undue delay.' },
          { icon: 'bi-trash', title: 'Right to Erasure or Blocking', body: 'Request deletion or blocking of data that is unlawfully processed, outdated, or no longer necessary.' },
          { icon: 'bi-hand-thumbs-down', title: 'Right to Object', body: 'Object to processing, including for direct marketing, automated processing, or profiling.' },
          { icon: 'bi-box-arrow-right', title: 'Right to Data Portability', body: 'Receive your data in a structured, commonly used electronic format and move it to another controller.' },
          { icon: 'bi-shield-exclamation', title: 'Right to Damages', body: 'Be indemnified for damages caused by inaccurate, incomplete, false, or unlawfully obtained or used data.' },
          { icon: 'bi-megaphone', title: 'Right to Lodge a Complaint', body: 'File a complaint with the National Privacy Commission ([privacy.gov.ph](https://privacy.gov.ph)) or your local supervisory authority.' },
          { icon: 'bi-x-circle', title: 'Right to Withdraw Consent', body: 'Withdraw consent at any time, without affecting the lawfulness of processing before withdrawal.' },
        ],
      },
      {
        type: 'text',
        heading: '12. How to Exercise Your Rights',
        paragraphs: [
          'To exercise any of these rights, contact our Data Protection Officer using the details in Section 15. We may need to verify your identity before acting on a request, and we will respond within the periods required by applicable law — as a rule, within thirty (30) days, extendable with notice where a request is complex.',
          'Exercising your rights is free of charge. Where requests are manifestly unfounded or excessive, we may charge a reasonable administrative fee or decline the request, with an explanation and information on your right to complain to the [NPC](https://privacy.gov.ph).',
          'If you are in the European Economic Area or the United Kingdom, you may also lodge a complaint with your local supervisory authority. If you are a California resident, you may exercise equivalent rights under the CCPA/CPRA — including the right to know, delete, correct, and opt out of sale or sharing (we do not sell or share personal information as defined by that law) — without discrimination for doing so.',
        ],
      },
      {
        type: 'text',
        heading: '13. Children\'s Privacy',
        paragraphs: [
          'Our websites and services are intended for general audiences and are not directed at children. We do not knowingly collect personal data from children below eighteen (18) years of age without verifiable parental or guardian consent. If you believe a child has provided us personal data, contact our [Data Protection Officer](mailto:info@notusregalia.tech) and we will promptly delete it.',
        ],
      },
      {
        type: 'text',
        heading: '14. Third-Party Sites and Services',
        paragraphs: [
          'Our websites may link to third-party sites, and our pages may embed third-party content. Those sites and services operate under their own privacy policies, which we encourage you to review. This Policy applies only to processing carried out by or on behalf of Notus Regalia.',
        ],
      },
      {
        type: 'text',
        heading: '15. Data Protection Officer and Contact',
        paragraphs: [
          'Our Data Protection Officer oversees compliance with this Policy, the Data Privacy Act, and other applicable data-protection laws. Reach the DPO at [info@notusregalia.tech](mailto:info@notusregalia.tech) for any privacy question, request, or concern. For general inquiries, you may also use [info@notusregalia.tech](mailto:info@notusregalia.tech).',
          'You may likewise contact the National Privacy Commission of the Philippines through [privacy.gov.ph](https://privacy.gov.ph) for guidance or to file a complaint.',
        ],
      },
      {
        type: 'text',
        heading: '16. Changes to This Policy',
        paragraphs: [
          'We review this Policy at least annually and update it as our operations, technologies, and legal obligations evolve. Material changes will be announced on this page with an updated effective date and, where the change significantly affects your rights, through direct notice where we have your contact details. Continued use of our websites after the effective date constitutes acknowledgment of the updated Policy — but never a waiver of rights that require your consent.',
        ],
      },
      {
        type: 'note',
        text: 'Version 2.0 · Effective 12 June 2026 · This Privacy Policy is issued in compliance with Republic Act No. 10173 (Data Privacy Act of 2012), its Implementing Rules and Regulations, and National Privacy Commission issuances, and is aligned with the EU/UK GDPR and the California Consumer Privacy Act.',
      },
    ],
  },

  'cookie-policy': {
    header: {
      eyebrow: 'Legals',
      title: 'Cookie Policy',
      description: 'The cookies and similar technologies we use, why we use them, and how you control them.',
    },
    justify: true,
    blocks: [
      {
        type: 'text',
        heading: '1. Introduction',
        paragraphs: [
          'This Cookie Policy explains how Notus Regalia uses cookies and similar technologies on our websites, what they do, the legal basis for each, and the controls you have over them. It supplements — and should be read together with — our [Privacy Policy](/information/legals/privacy), which governs all processing of personal data, and it is drafted in accordance with Republic Act No. 10173 (the Data Privacy Act of 2012), National Privacy Commission guidance on consent, and, where applicable, the EU/UK GDPR and ePrivacy rules.',
          'Where this Policy and the Privacy Policy overlap, the document providing you greater protection or more specific information prevails. Capitalized terms not defined here have the meanings given in the Privacy Policy.',
        ],
      },
      {
        type: 'text',
        heading: '2. What We Mean by "Cookies and Similar Technologies"',
        paragraphs: [
          'Cookies are small text files placed on your device by a website. Similar technologies include browser local storage and session storage (which store values on your device without transmitting them automatically with every request), pixels, scripts, and software development kits. This Policy covers all of them, regardless of technical mechanism — a restriction or right that applies to a cookie applies equally to any equivalent technology used for the same purpose.',
          'In practice, our websites rely primarily on browser local storage rather than traditional cookies, and we use no technology — by any mechanism — for cross-site tracking, behavioral advertising, or the sale or sharing of personal data.',
        ],
      },
      {
        type: 'cards',
        heading: '3. The Technologies We Use',
        columns: 3,
        items: [
          { icon: 'bi-check2-square', title: 'nr-cookie-consent', meta: 'Local storage · Strictly necessary', body: 'Records the consent choice you make in our cookie banner so we can honor it on every visit. Persists until you clear it or change your choice.' },
          { icon: 'bi-moon-stars', title: 'notus-regalia-theme', meta: 'Local storage · Preference', body: 'Remembers your light or dark theme selection. Stores only the word "light" or "dark" and nothing else. Persists until cleared.' },
          { icon: 'bi-graph-up', title: 'Vercel Analytics', meta: 'Script · Analytics', body: 'Privacy-focused, aggregated page analytics from our hosting provider. Does not set cross-site tracking cookies and does not profile individual visitors.' },
        ],
      },
      {
        type: 'text',
        heading: '4. Categories and Legal Basis',
        paragraphs: [
          'Strictly necessary technologies — such as the record of your own consent choice and the security mechanisms of our hosting infrastructure — are required for the site to function and to honor your choices, and are used on the basis of our legitimate interest in operating a secure, lawful service; consent is not required for these, and they cannot be switched off through the banner.',
          'Preference technologies — your theme setting — remember choices you actively make. They activate only upon your action, store no identifying information, and serve no purpose other than honoring your selection.',
          'Analytics technologies run only with your consent, expressed through the cookie banner. Our analytics are aggregate and privacy-preserving: we measure page views and performance, not people. We use no advertising, targeting, or social-media tracking technologies of any kind, and we do not permit third parties to collect personal data through our sites for their own purposes.',
        ],
      },
      {
        type: 'text',
        heading: '5. Consent and Withdrawal',
        paragraphs: [
          'On your first visit, our cookie banner asks for your choice before any non-essential technology runs. Consent under this Policy means what the Data Privacy Act requires it to mean: a freely given, specific, informed indication of will. You may decline non-essential technologies entirely, and declining does not degrade your access to any part of the site.',
          'You can change or withdraw your choice at any time — with effect for the future — through the [Preferences page](/information/settings/preferences) of this Information Central, which also documents what each toggle controls. Withdrawal is as easy as the original consent, as the law requires.',
        ],
      },
      {
        type: 'text',
        heading: '6. Browser Controls',
        paragraphs: [
          'Independently of our banner, your browser lets you block, restrict, or delete cookies and clear local storage for any site, including ours. Instructions live in your browser\'s settings under privacy or site-data controls. Because we do not engage in cross-site tracking, "Do Not Track" and Global Privacy Control signals have no additional tracking to disable on our sites — but we honor their spirit by not tracking anyone in the first place.',
        ],
      },
      {
        type: 'text',
        heading: '7. Third-Party Technologies',
        paragraphs: [
          'Our analytics provider processes data as our Personal Information Processor under contractual safeguards described in the Privacy Policy. Where a page embeds third-party content — for example, externally hosted media — that third party may set its own technologies under its own policies once you interact with the embedded content; we identify such embeds where they occur and encourage you to review the relevant provider\'s policy.',
        ],
      },
      {
        type: 'text',
        heading: '8. Retention',
        paragraphs: [
          'Local-storage values we set remain on your device until you clear them, change them, or withdraw consent; they are not transmitted to us for storage on our servers. Analytics data is retained in aggregate form under the retention rules in the Privacy Policy and cannot be traced back to you by us.',
        ],
      },
      {
        type: 'text',
        heading: '9. Changes and Contact',
        paragraphs: [
          'If we add, remove, or change any technology covered by this Policy, we will update this page — including the inventory in Section 3 — before the change takes effect, and we will re-request consent where the law requires it. Questions about this Policy go to our Data Protection Officer at [info@notusregalia.tech](mailto:info@notusregalia.tech).',
        ],
      },
      {
        type: 'note',
        text: 'Version 1.0 · Effective 12 June 2026 · This Cookie Policy supplements the [Privacy Policy](/information/legals/privacy) and is issued in compliance with R.A. 10173 (Data Privacy Act of 2012), NPC consent guidance, and applicable GDPR/ePrivacy requirements.',
      },
    ],
  },

  terms: {
    header: {
      eyebrow: 'Legals',
      title: 'Terms of Service',
      description: 'The terms and conditions governing your use of Notus Regalia websites, products, and services.',
    },
    justify: true,
    blocks: [
      {
        type: 'text',
        heading: '1. Agreement and Acceptance',
        paragraphs: [
          'These Terms of Service ("Terms") form a binding agreement between you and Notus Regalia ("we", "us", "our") governing your access to and use of our websites, the Information Central, and any content, materials, or services made available through them (collectively, the "Services"). By accessing or using the Services, you accept these Terms; if you do not agree, do not use the Services.',
          'Consistent with Republic Act No. 8792 (the Philippine Electronic Commerce Act), you agree that these Terms, and any notices or records relating to them, may be presented, accepted, and retained in electronic form, and that your continued use of the Services constitutes a valid expression of consent.',
          'If you use the Services on behalf of an organization, you represent that you are authorized to bind that organization, and "you" includes both you and the organization.',
        ],
      },
      {
        type: 'text',
        heading: '2. Eligibility',
        paragraphs: [
          'The Services are intended for users who are at least eighteen (18) years of age or the age of majority in their jurisdiction, whichever is higher. By using the Services, you represent that you meet this requirement and that you are not barred from receiving services under the laws of any applicable jurisdiction, including sanctions and export-control laws described in Section 11.',
        ],
      },
      {
        type: 'text',
        heading: '3. The Services and Supplemental Terms',
        paragraphs: [
          'The Services described on this website are informational: they present our company, portfolio, publications, and contact channels. Specific products operated by Notus Regalia or its portfolio ventures — including healthcare, defense, financial, and other regulated systems — are provided under separate written agreements and product-specific terms ("Supplemental Terms"). Where Supplemental Terms apply, they prevail over these Terms for that product.',
          'Nothing on this website constitutes an offer to sell securities, an invitation to invest, professional, medical, or legal advice, or a commitment to provide any product or capability. Investor materials are provided for information only and are restricted to their intended recipients.',
        ],
      },
      {
        type: 'text',
        heading: '4. Acceptable Use',
        paragraphs: [
          'Your use of the Services is governed by our [Acceptable Use Policy](/information/legals/acceptable-use) (the "AUP"), which is incorporated into these Terms by reference and has the same binding force as if set out in full here. The AUP prohibits, among other things: unauthorized access and security violations; denial-of-service and network abuse; unauthorized scraping, bulk extraction, and automated access, including for the training of machine-learning models; impersonation, fraud, and misrepresentation; infringement of intellectual-property, privacy, and other rights; and any use that violates applicable law, including export-control, sanctions, anti-corruption, and data-protection law.',
          'A violation of the AUP is a violation of these Terms. The AUP\'s prohibitions apply whether you act directly or through another person, account, automated agent, or intermediary, and an attempt to commit a prohibited act is itself a violation. If a provision of the AUP and these Terms conflict, the provision imposing the stricter obligation on you prevails.',
          'Good-faith security research is governed exclusively by our [Vulnerability Disclosure Policy](/information/legals/vulnerability-disclosure) (the "VDP"). Security testing of any kind is prohibited except as expressly authorized by, and conducted in compliance with, the VDP.',
        ],
      },
      {
        type: 'text',
        heading: '5. Intellectual Property',
        paragraphs: [
          'The Services and all content on them — including text, graphics, logos, marks, software, page designs, and multimedia — are owned by or licensed to Notus Regalia and are protected by Philippine and international intellectual-property laws, including Republic Act No. 8293 (the Intellectual Property Code of the Philippines) and applicable treaties.',
          'We grant you a limited, revocable, non-exclusive, non-transferable license to access and view the Services for your internal, non-commercial use. Except as expressly permitted — for instance, brand assets downloaded from [Media Assets](/information/documents/media-assets) and used in accordance with our [Brand Guidelines](/information/legals/brand-guidelines) — you may not reproduce, modify, distribute, publicly display, or create derivative works from our content without prior written permission. All rights not expressly granted are reserved.',
          '"Notus Regalia", the NR mark, and our venture and product names are trademarks of Notus Regalia. Nothing in these Terms grants any right to use them except as allowed by the Brand Guidelines or separate written consent.',
        ],
      },
      {
        type: 'text',
        heading: '6. Feedback and Submissions',
        paragraphs: [
          'If you send us ideas, suggestions, or other feedback about the Services, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use that feedback for any purpose without obligation to you. Do not submit information you consider confidential or proprietary through unsecured public channels; unsolicited submissions are not received in confidence.',
        ],
      },
      {
        type: 'text',
        heading: '7. Privacy',
        paragraphs: [
          'Our collection and use of personal data in connection with the Services are governed by our [Privacy Policy](/information/legals/privacy), and our use of cookies and similar technologies by our [Cookie Policy](/information/legals/cookie-policy), both of which form part of these Terms by reference and comply with Republic Act No. 10173 (the Data Privacy Act of 2012) and other applicable data-protection laws. Please review them to understand your rights and our obligations.',
        ],
      },
      {
        type: 'text',
        heading: '8. Third-Party Content and Links',
        paragraphs: [
          'The Services may reference or link to third-party websites, content, or services that we do not control. Such references are provided for convenience only and do not constitute endorsement. We are not responsible for third-party content, policies, or practices, and your use of third-party services is at your own risk and subject to their terms.',
        ],
      },
      {
        type: 'text',
        heading: '9. Disclaimers',
        paragraphs: [
          'The Services and all content are provided on an "as is" and "as available" basis. To the maximum extent permitted by law, we disclaim all warranties of any kind, whether express, implied, or statutory — including warranties of merchantability, fitness for a particular purpose, title, non-infringement, accuracy, and uninterrupted or error-free operation. Content on the Services may be updated, corrected, or withdrawn at any time without notice.',
          'Nothing in this Section limits warranties or rights that cannot be excluded under applicable law, including mandatory consumer protections under Republic Act No. 7394 (the Consumer Act of the Philippines) and equivalent laws of your place of residence.',
        ],
      },
      {
        type: 'text',
        heading: '10. Limitation of Liability and Indemnity',
        paragraphs: [
          'To the maximum extent permitted by law, Notus Regalia and its directors, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, revenues, data, goodwill, or business interruption, arising out of or relating to your use of — or inability to use — the Services, even if advised of the possibility of such damages. To the same extent, our total aggregate liability for all claims relating to the Services shall not exceed one hundred US dollars (US$100) or its Philippine peso equivalent, this being a website provided without charge.',
          'Nothing in these Terms excludes or limits liability that cannot lawfully be excluded — including liability arising from fraud, willful misconduct, gross negligence, or death or personal injury caused by negligence. Where applicable law allows limitation but not exclusion, our liability is limited to the minimum extent that law permits.',
          'You agree to indemnify and hold us harmless from claims, damages, and reasonable expenses (including attorneys\' fees) arising from your violation of these Terms or misuse of the Services, except to the extent caused by our own fault.',
        ],
      },
      {
        type: 'text',
        heading: '11. Export Controls and Sanctions',
        paragraphs: [
          'Content and materials available through the Services may be subject to export-control and sanctions laws, including those of the Philippines, the United States, and other jurisdictions. You represent that you are not located in, organized under the laws of, or ordinarily resident in any embargoed jurisdiction, and that you are not a sanctioned or restricted party. You agree not to access, download, export, re-export, or transfer any controlled content in violation of applicable law, and not to use the Services in connection with any prohibited end use.',
        ],
      },
      {
        type: 'text',
        heading: '12. Enforcement and Reservation of Rights',
        paragraphs: [
          'We actively monitor the Services for abuse and reserve the right to investigate any suspected violation of these Terms or applicable law. Depending on the nature and severity of a violation, enforcement actions we may take include, without limitation: issuing warnings; rate-limiting, filtering, or blocking traffic, IP addresses, networks, or user agents; removing or disabling access to content; suspending or permanently terminating access under Section 14; revoking licenses granted under these Terms; demanding the destruction of unlawfully obtained content or data; and pursuing civil remedies — including injunctive relief, which you agree is an appropriate remedy for breaches involving intellectual property, confidential information, or system security, where damages alone would be inadequate.',
          'We may also refer matters for criminal investigation and prosecution, including under Republic Act No. 10175 (the Philippine Cybercrime Prevention Act of 2012), Republic Act No. 8792, the Intellectual Property Code, and equivalent laws of other jurisdictions. Our decision to take, delay, or forgo any enforcement action in a given case is not a waiver of our right to act on that or any other violation, and all rights and remedies not expressly granted in these Terms are reserved cumulatively — exercise of one remedy does not preclude another.',
        ],
      },
      {
        type: 'text',
        heading: '13. Cooperation with Law Enforcement',
        paragraphs: [
          'We cooperate with law-enforcement agencies, regulators, and courts of competent jurisdiction. We may disclose information — including access logs, IP addresses, and records of activity on the Services — in response to lawful orders, subpoenas, warrants, or equivalent legal process, and as otherwise described in our [Privacy Policy](/information/legals/privacy). Where legally permitted and operationally safe, we will direct legal process narrowly, challenge demands we consider overbroad or unlawful, and notify affected users before disclosure unless prohibited by law or where notice would create risk to an investigation, to other users, or to life or safety.',
          'We may report suspected criminal activity to the authorities on our own initiative — particularly conduct that threatens critical systems, patient safety, national security, or the integrity of the Services — and you acknowledge that nothing in these Terms obliges us to keep unlawful conduct confidential. Given the nature of our defense and healthcare work, attempted intrusions into the Services are treated as serious incidents and are preserved, investigated, and escalated accordingly.',
        ],
      },
      {
        type: 'text',
        heading: '14. Suspension and Termination',
        paragraphs: [
          'We may suspend or terminate your access to all or part of the Services at any time, with or without notice, if we reasonably believe you have violated these Terms or applicable law, or where necessary to protect the Services, our users, or third parties. Sections that by their nature should survive termination — including Sections 5, 6, 9, 10, 11, 12, 13, 16, and 17 — survive.',
        ],
      },
      {
        type: 'text',
        heading: '15. Changes to the Services and These Terms',
        paragraphs: [
          'We may modify, suspend, or discontinue any part of the Services at any time. We may also revise these Terms from time to time; the current version, with its effective date, will always be published on this page, and material changes will be highlighted with reasonable prominence. Changes take effect upon posting unless a later date is stated, and your continued use of the Services after the effective date constitutes acceptance of the revised Terms. Changes do not apply retroactively and do not affect rights accrued before the effective date.',
        ],
      },
      {
        type: 'text',
        heading: '16. Governing Law and Dispute Resolution',
        paragraphs: [
          'These Terms are governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to conflict-of-law rules. Subject to the remainder of this Section, the competent courts of the Philippines shall have exclusive jurisdiction over disputes arising out of or relating to these Terms or the Services, and the parties consent to that venue.',
          'Before filing any claim, you agree to first contact us at [info@notusregalia.tech](mailto:info@notusregalia.tech) and attempt in good faith to resolve the dispute informally within sixty (60) days. For disputes the parties agree to arbitrate, arbitration shall be conducted in accordance with Republic Act No. 9285 (the Alternative Dispute Resolution Act of 2004) and applicable arbitration rules, seated in the Philippines, in the English language.',
          'If you are a consumer habitually resident in a jurisdiction whose law grants you mandatory protections or a right to bring proceedings in your local courts, nothing in this Section deprives you of those protections or that right.',
        ],
      },
      {
        type: 'text',
        heading: '17. General Provisions',
        paragraphs: [
          'Entire Agreement. These Terms — together with the [Acceptable Use Policy](/information/legals/acceptable-use), the [Privacy Policy](/information/legals/privacy), the [Cookie Policy](/information/legals/cookie-policy), the [Vulnerability Disclosure Policy](/information/legals/vulnerability-disclosure), and any applicable Supplemental Terms, each incorporated by reference — constitute the entire agreement between you and us regarding the Services and supersede prior understandings on that subject. Severability. If any provision is held invalid or unenforceable, it will be enforced to the maximum extent permissible and the remainder will remain in full force. No Waiver. Failure to enforce a provision is not a waiver of the right to enforce it later. Assignment. You may not assign these Terms without our prior written consent; we may assign them in connection with a merger, acquisition, or reorganization. Force Majeure. Neither party is liable for delay or failure caused by events beyond its reasonable control. Language. These Terms are executed in English; translations are for convenience only and the English text prevails.',
          'Questions about these Terms may be directed to [info@notusregalia.tech](mailto:info@notusregalia.tech).',
        ],
      },
      {
        type: 'note',
        text: 'Version 2.1 · Effective 12 June 2026 · These Terms of Service incorporate the Acceptable Use Policy, Privacy Policy, Cookie Policy, and Vulnerability Disclosure Policy by reference, and are governed by the laws of the Republic of the Philippines, including R.A. 8792 (E-Commerce Act), R.A. 8293 (Intellectual Property Code), R.A. 7394 (Consumer Act), and R.A. 9285 (ADR Act), with regard to mandatory consumer protections in other jurisdictions where our visitors reside.',
      },
    ],
  },

  'acceptable-use': {
    header: {
      eyebrow: 'Legals',
      title: 'Acceptable Use Policy',
      description: 'The binding rules governing how our websites and services may — and may not — be used.',
    },
    justify: true,
    blocks: [
      {
        type: 'text',
        heading: '1. Purpose, Application, and Interpretation',
        paragraphs: [
          'This Acceptable Use Policy (the "AUP") sets the rules of conduct for all use of the websites, applications, content, and services operated by Notus Regalia (the "Services"). It is incorporated by reference into our [Terms of Service](/information/legals/terms) and binds every person and entity that accesses the Services, with or without an account, directly or through any intermediary, tool, or automated agent (each, a "User").',
          'This AUP is to be interpreted purposively: its object is the protection of the Services, our users, our personnel, and the public. Lists of prohibited conduct are illustrative, not exhaustive; conduct of the same character as a listed prohibition is equally prohibited. Where any doubt exists as to whether conduct is permitted, the User must seek our prior written confirmation at [info@notusregalia.tech](mailto:info@notusregalia.tech) — absence of an explicit prohibition is not authorization.',
          'In this AUP, "use" includes accessing, browsing, querying, downloading, transmitting to, interacting with, and deriving data from the Services by any means, whether manual or automated, and whether or not the Service\'s ordinary user interface is employed.',
        ],
      },
      {
        type: 'text',
        heading: '2. General Standard of Conduct',
        paragraphs: [
          'Users must use the Services lawfully, honestly, and in good faith; must respect the rights, safety, and dignity of others; and must not compromise — or attempt to compromise — the security, integrity, availability, or intended operation of the Services or of any system, network, or data connected to them.',
          'Users are responsible for all activity conducted through their access, devices, credentials, and network connections, and for the conduct of any person or system they permit, instruct, or enable to interact with the Services on their behalf.',
        ],
      },
      {
        type: 'text',
        heading: '3. Security Violations',
        paragraphs: [
          'Except as expressly authorized under our [Vulnerability Disclosure Policy](/information/legals/vulnerability-disclosure), Users must not: (a) access, or attempt to access, any system, account, data, or area of the Services for which they lack explicit authorization; (b) probe, scan, fingerprint, fuzz, or test the Services for vulnerabilities or misconfigurations; (c) breach, disable, defeat, or circumvent any authentication, authorization, encryption, rate-limiting, filtering, logging, or other security or access control, or assist anyone in doing so; (d) engage in credential attacks of any kind, including brute forcing, credential stuffing, password spraying, session hijacking, token forgery, or the use of stolen, leaked, or fabricated credentials; (e) introduce, transmit, or store malware, ransomware, spyware, logic bombs, web shells, or any other harmful or surreptitious code; (f) intercept, monitor, or capture traffic, communications, or data of the Services or of other Users; or (g) retain, use, disclose, or fail to report any access, data, or capability obtained in excess of authorization, however obtained — accidental acquisition followed by retention or exploitation is itself a violation.',
        ],
      },
      {
        type: 'text',
        heading: '4. Network and Service Abuse',
        paragraphs: [
          'Users must not: (a) conduct denial-of-service, distributed denial-of-service, amplification, reflection, or resource-exhaustion attacks of any kind, at any scale, for any purpose; (b) impose unreasonable or disproportionate load on the Services, including through stress testing, benchmarking, or load testing without our prior written agreement; (c) transmit malformed, deceptive, or protocol-violating traffic intended to disrupt, confuse, or degrade the Services or their security tooling; (d) use the Services to originate, relay, or facilitate spam, bulk unsolicited messages, or phishing; (e) tamper with, spoof, or forge network identifiers, headers, or routing information to disguise the origin or nature of traffic; or (f) resell, sublicense, rent, or commercially exploit access to the Services without our written agreement.',
        ],
      },
      {
        type: 'text',
        heading: '5. Automated Access, Scraping, and Machine-Learning Use',
        paragraphs: [
          'Automated access to the Services is permitted only by well-behaved agents that: identify themselves truthfully via user-agent string; honor robots.txt directives, rate limits, and cache headers; and impose no material burden on the Services. All other automated access — including scraping, crawling, harvesting, mirroring, systematic downloading, or bulk extraction of content, data, or metadata — is prohibited without our prior written consent.',
          'Without limiting the foregoing, Users must not use the Services or any content obtained from them to train, fine-tune, ground, augment, or evaluate any machine-learning model, large language model, or other artificial-intelligence system, or include such content in any dataset assembled for those purposes, whether directly or through an intermediary or aggregated corpus, without our prior written license. Circumventing this restriction by acquiring our content from a third party who scraped it does not cure the violation.',
          'We may employ technical countermeasures against unauthorized automation — including blocking, rate-limiting, tarpitting, and serving altered responses — and Users waive any claim arising from the effect of such countermeasures on unauthorized access.',
        ],
      },
      {
        type: 'text',
        heading: '6. Content and Conduct Violations',
        paragraphs: [
          'Users must not use the Services to: (a) infringe, misappropriate, or violate any intellectual-property right, including by reproducing or redistributing our content in breach of the license granted in the Terms of Service; (b) violate the privacy, data-protection, or publicity rights of any person, including by collecting, processing, or disclosing personal data of others without lawful basis; (c) defame, harass, threaten, stalk, or intimidate any person, including our personnel; (d) transmit content that is unlawful in the Republic of the Philippines or in the place from which the User acts, including content that incites violence, constitutes child sexual abuse material, or violates anti-terrorism, anti-obscenity, or hate-speech laws; or (e) submit to any contact, application, or reporting channel content that is knowingly false, deceptive, or submitted in bad faith, including fraudulent job applications, fabricated vulnerability reports, and vexatious grievances.',
        ],
      },
      {
        type: 'text',
        heading: '7. Fraud, Misrepresentation, and Brand Abuse',
        paragraphs: [
          'Users must not: (a) impersonate Notus Regalia, any venture, or any person, or misrepresent an affiliation, endorsement, or authorization; (b) register, use, or traffic in domain names, social-media handles, certificates, or applications confusingly similar to our marks; (c) use our marks, branding, or content in connection with phishing, fraud, investment solicitation, or any scheme likely to deceive; (d) present any portion of the Services within a frame, overlay, or interface that obscures its origin or suggests false sponsorship; or (e) hold themselves out as authorized to bind, speak for, or act on behalf of Notus Regalia without written authority. We enforce against brand abuse through every avenue described in the Terms of Service, including domain-dispute proceedings and referral to platform operators and registrars.',
        ],
      },
      {
        type: 'text',
        heading: '8. Sanctioned, Export-Controlled, and High-Risk Uses',
        paragraphs: [
          'Users must not access or use the Services: (a) from, on behalf of, or for the benefit of any embargoed jurisdiction, sanctioned party, or restricted end user; (b) in violation of export-control or arms-regulation law, or to obtain, transfer, or analyze controlled content unlawfully; (c) to further any activity that violates our [NR Human Rights Policy](/information/legals/human-rights), including unlawful surveillance, repression, or the development of weapons outside lawful, authorized programs; or (d) to plan, facilitate, or conceal any criminal activity. Given the nature of our healthcare and defense work, we treat violations of this Section as our most serious category and escalate them as described in the Terms of Service, including proactive referral to competent authorities.',
        ],
      },
      {
        type: 'text',
        heading: '9. Indirect Violations, Attempts, and Circumvention',
        paragraphs: [
          'Each prohibition in this AUP extends to: attempting, soliciting, inducing, facilitating, funding, or conspiring in the prohibited conduct; performing it through or with the assistance of any third party, contractor, affiliate, automated agent, or anonymizing service; performing it against any mirror, cache, backup, staging environment, or API of the Services; and reconstituting prohibited outcomes from permitted acts (for example, assembling a bulk extraction from individually permissible requests). A violation is complete upon the attempt; success, harm, or profit is not required.',
          'Evading an enforcement measure — including returning after a block or suspension under a different identity, network, entity, or agent — is an independent violation of this AUP, regardless of the conduct that prompted the original measure.',
        ],
      },
      {
        type: 'text',
        heading: '10. Reporting Violations',
        paragraphs: [
          'Suspected violations of this AUP may be reported to [info@notusregalia.tech](mailto:info@notusregalia.tech). Reports of security vulnerabilities should instead follow the [Vulnerability Disclosure Policy](/information/legals/vulnerability-disclosure). We investigate credible reports, treat reporter identities as confidential to the extent the law allows, and prohibit retaliation against good-faith reporters.',
        ],
      },
      {
        type: 'text',
        heading: '11. Enforcement',
        paragraphs: [
          'Violations of this AUP are enforced as set out in Section 12 (Enforcement and Reservation of Rights) and Section 14 (Suspension and Termination) of the [Terms of Service](/information/legals/terms), up to and including permanent termination of access, civil action, and criminal referral, including under Republic Act No. 10175 (the Cybercrime Prevention Act of 2012). We may act on a reasonable, good-faith determination that a violation has occurred or is imminent; we are not required to await completion of the violation, demonstrate actual damage, or provide prior notice where delay would prejudice the Services, our users, an investigation, or the public.',
          'Our forbearance, delay, or partial response to any violation is not a waiver, and no course of dealing creates a right to continued access. All determinations under this AUP are made by us and are final to the maximum extent permitted by applicable law.',
        ],
      },
      {
        type: 'text',
        heading: '12. Changes and Severability',
        paragraphs: [
          'We may revise this AUP as the Services and the threat landscape evolve; the current version, with its effective date, is the one published on this page, and continued use after the effective date constitutes acceptance. If any provision of this AUP is held unenforceable, it shall be enforced to the maximum extent permissible and the remainder shall continue in full force. In the event of conflict between this AUP and the Terms of Service, the provision imposing the stricter obligation on the User prevails.',
        ],
      },
      {
        type: 'note',
        text: 'Version 1.0 · Effective 12 June 2026 · This Acceptable Use Policy is incorporated by reference into the [Terms of Service](/information/legals/terms) and is governed by the laws of the Republic of the Philippines. Report abuse to info@notusregalia.tech.',
      },
    ],
  },

  'vulnerability-disclosure': {
    header: {
      eyebrow: 'Legals',
      title: 'Vulnerability Disclosure Policy',
      description: 'How to report security vulnerabilities to us safely — scope, rules of engagement, safe harbor, and bug bounty rules.',
    },
    justify: true,
    blocks: [
      {
        type: 'text',
        heading: '1. Purpose and Standing Authorization',
        paragraphs: [
          'Security research makes our systems — and the people who depend on them — safer. Because our portfolio includes healthcare and defense systems where vulnerabilities can translate into harm to human life, we treat vulnerability reports as priority work, and we treat the researchers who submit them in good faith as partners, not adversaries.',
          'This Vulnerability Disclosure Policy (the "VDP") is the sole and exclusive grant of authorization to test the security of anything we operate. Security testing not conducted in compliance with this VDP is unauthorized, violates our [Acceptable Use Policy](/information/legals/acceptable-use) and [Terms of Service](/information/legals/terms), and may violate criminal law. Authorization under this VDP is conditional and continuous: it exists only while, and only to the extent that, your conduct complies with every requirement of this VDP, and it terminates automatically and retroactively as to any conduct that departs from it.',
        ],
      },
      {
        type: 'text',
        heading: '2. Scope',
        paragraphs: [
          'In scope: the public websites and web applications operated by Notus Regalia, including this website and the Information Central, and any other system we explicitly designate as in scope in writing. Designation of a system as in scope authorizes testing of that system only — not of any system it connects to, depends on, or shares infrastructure with.',
          'Out of scope, without exception: production healthcare and defense systems and any system processing live patient, operational, or classified data (testing against these without a separate written agreement signed by an authorized officer is never authorized, and no employee may authorize it informally); systems operated by our portfolio ventures under their own disclosure policies; third-party services, vendors, and infrastructure we do not own — including hosting providers, analytics platforms, and content-delivery networks — whose findings must be reported to the relevant provider; physical security, office premises, devices, and personnel; and social engineering, phishing, pretexting, or impersonation directed at our employees, contractors, ventures, or partners in any form.',
          'If you are uncertain whether a target is in scope, ask first at [info@notusregalia.tech](mailto:info@notusregalia.tech) — we would much rather answer a question than have you guess. Uncertainty is not authorization, and a target is out of scope unless this VDP or a written designation says otherwise.',
        ],
      },
      {
        type: 'cards',
        heading: '3. Rules of Engagement',
        columns: 3,
        items: [
          { icon: 'bi-shield-lock', title: 'Report Privately', body: 'Send findings to us first and keep them confidential until a coordinated disclosure date is agreed in writing.' },
          { icon: 'bi-heart', title: 'Do No Harm', body: 'Never degrade service, corrupt data, or put users at risk to prove a point — a minimal proof of concept is enough.' },
          { icon: 'bi-database-x', title: 'Do Not Exfiltrate', body: 'Access only the minimum data needed to demonstrate the issue. If you encounter personal or patient data, stop and report immediately.' },
          { icon: 'bi-bullseye', title: 'Stay in Scope', body: 'Test only in-scope systems, only with accounts and data that belong to you, and never pivot to connected systems.' },
          { icon: 'bi-hourglass-split', title: 'Give Us Time', body: 'Allow our standard ninety (90) day coordinated-disclosure window before any publication, extendable by mutual agreement for complex fixes.' },
          { icon: 'bi-slash-circle', title: 'No Destructive Techniques', body: 'Denial-of-service, spam, brute-force at scale, and physical or social-engineering attacks are never authorized.' },
        ],
      },
      {
        type: 'text',
        heading: '4. Prohibited Conduct',
        paragraphs: [
          'The following are prohibited under this VDP in all circumstances, and conducting them voids your authorization in its entirety: (a) accessing, copying, downloading, or retaining data beyond the minimum necessary to demonstrate the vulnerability, or retaining any data after submitting your report; (b) modifying, deleting, or encrypting data, creating or escalating accounts, installing persistence mechanisms, or leaving any system in a state different from how you found it; (c) pivoting from an in-scope system to any other system, network segment, or tenant; (d) high-volume automated scanning that materially burdens the Services — targeted, rate-limited tooling is acceptable; indiscriminate mass scanning is not; (e) testing with credentials, sessions, or data belonging to any person other than yourself; (f) conditioning a report, or the withholding of publication, on payment or any other benefit — which we will treat as extortion and refer accordingly; (g) submitting reports generated by automated tools or AI systems without human verification of exploitability; and (h) publicly disclosing, selling, or sharing the vulnerability or any proof of concept with any third party before a coordinated disclosure date is agreed, including disclosure to vulnerability brokers or government exploit programs.',
        ],
      },
      {
        type: 'text',
        heading: '5. How to Report',
        paragraphs: [
          'Email [info@notusregalia.tech](mailto:info@notusregalia.tech) with: a description of the vulnerability and its class (e.g., XSS, SSRF, broken access control); the affected URL, endpoint, or component; reproducible steps or a minimal proof of concept; your assessment of impact; and the environment used (IP address, user agent, timestamps) so we can correlate logs. If your report contains sensitive material, say so in your first message and we will arrange an encrypted channel before you send details.',
          'Submit one report per distinct vulnerability. A chain of issues that together produce a single impact may be reported together and is assessed as one finding at the severity of the chain.',
        ],
      },
      {
        type: 'text',
        heading: '6. Our Commitments and Timelines',
        paragraphs: [
          'What you can expect from us: acknowledgment of your report within three (3) business days; an initial triage assessment within ten (10) business days; a primary point of contact and regular status updates while we remediate; and credit for the finding, with your consent, when the issue is disclosed. We triage by severity using industry-standard scoring (CVSS v3.1 or successor), prioritizing issues that affect critical systems.',
          'Our standard coordinated-disclosure window is ninety (90) days from acknowledgment, extendable by mutual written agreement where remediation is genuinely complex. If we conclude a report is not a vulnerability, is out of scope, or is a duplicate, we will tell you so and why. If you believe our assessment is wrong, you may ask for re-review by a different reviewer; our determination after re-review is final.',
        ],
      },
      {
        type: 'text',
        heading: '7. Safe Harbor',
        paragraphs: [
          'We consider security research conducted in good-faith compliance with this VDP to be: authorized access for the purposes of Republic Act No. 10175 (the Cybercrime Prevention Act of 2012) and analogous computer-misuse laws; authorized processing under Republic Act No. 10173 (the Data Privacy Act of 2012) to the limited extent personal data is incidentally encountered and immediately reported; a permitted exception to the access restrictions of our Terms of Service and Acceptable Use Policy; and exempt from any anti-circumvention claim we could otherwise assert with respect to security controls tested within scope. We will not initiate or support civil claims or criminal referral against you for research that complies with this VDP, and if a third party brings action against you for such research, we will make it known that your conduct was authorized under this VDP.',
          'This safe harbor is strictly conditional. It does not extend to conduct that violates Section 4, targets out-of-scope systems, exceeds the minimum access necessary, or breaks laws we have no power to waive, and it cannot bind third parties or law-enforcement agencies acting independently — which is precisely why staying within this VDP matters. Where conduct partially complies, the safe harbor protects only the compliant portion.',
        ],
      },
      {
        type: 'text',
        heading: '8. Bug Bounty Rules',
        paragraphs: [
          'We do not currently operate a fixed-payout public bug-bounty program; rewards are discretionary, assessed per finding on severity, quality of report, and impact. The following rules (the "Bug Bounty Rules") govern any reward we choose to pay, and will continue to govern if we introduce a structured program with published tiers.',
          'Eligibility: you must be at least eighteen (18) years of age (or report through a parent or guardian); you must not be a resident or national of, or located in, an embargoed jurisdiction, nor a sanctioned or restricted party; you must not be a current employee, contractor, or supplier of Notus Regalia or its ventures, an immediate family or household member of one, or any person whose report draws on non-public information obtained through such a relationship; and your participation must be lawful where you are located. We may require identity verification and tax documentation before paying any reward, and we may decline to pay where payment would violate sanctions, tax, or anti-money-laundering law.',
          'Award mechanics: the first complete, reproducible report of a vulnerability is eligible; duplicates — including reports of an issue we can document as already known internally or already reported — are not, though we will tell you the report was a duplicate. Findings from automated scanners without demonstrated exploitability, theoretical issues without security impact, out-of-scope findings, and best-practice observations (such as header or version-disclosure notes without an exploit path) are not eligible. One reward per vulnerability, allocated among collaborators as they jointly direct. Rewards are forfeited in full — and repayable on demand if already paid — for any violation of this VDP discovered before or after payment.',
          'Rewards are voluntary payments, not wages, prizes in a game of chance, or consideration for services; nothing in this VDP creates an employment, agency, partnership, or fiduciary relationship. You are responsible for taxes on any reward in your jurisdiction. Our determinations of severity, eligibility, duplication, and reward amount are made in good faith and are final.',
        ],
      },
      {
        type: 'text',
        heading: '9. Coordinated Disclosure and Publication',
        paragraphs: [
          'After remediation and the agreed disclosure date, you may publish your finding, and we encourage it — accurate public research strengthens the ecosystem. Publication must not include personal data, our unreleased confidential information beyond what is necessary to describe the vulnerability, or working exploit code for issues that remain unpatched in deployed systems. We maintain a researcher acknowledgments page crediting, with their consent, those whose reports have made our systems safer.',
        ],
      },
      {
        type: 'text',
        heading: '10. Changes and Contact',
        paragraphs: [
          'We may revise this VDP and the Bug Bounty Rules at any time; the version published on this page at the time you begin testing governs that testing, and continued testing after a revision constitutes acceptance of the revised VDP. Questions about this VDP, scope clarifications, and reports all go to [info@notusregalia.tech](mailto:info@notusregalia.tech).',
        ],
      },
      {
        type: 'note',
        text: 'Version 2.0 · Effective 12 June 2026 · This Vulnerability Disclosure Policy operates alongside our [Terms of Service](/information/legals/terms), [Acceptable Use Policy](/information/legals/acceptable-use), and [Privacy Policy](/information/legals/privacy). Report vulnerabilities to info@notusregalia.tech.',
      },
    ],
  },

  policies: {
    header: {
      eyebrow: 'Legals',
      title: 'Corporate Policies',
      description: 'Acceptable use, conduct, and the operating policies that govern how we work and serve our users.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Acceptable Use',
        paragraphs: [
          'Our services are intended for lawful purposes only. You may use our platform to access information, engage with content, and utilize provided features.',
          'We encourage responsible and ethical use of our services that respects the rights and dignity of all users and stakeholders.',
        ],
      },
      {
        type: 'text',
        heading: 'Prohibited Activities',
        paragraphs: [
          'Users must not engage in activities that could harm, disable, or impair our services or interfere with other users\' access.',
          'Prohibited activities include distributing malware, attempting unauthorized access, harassing other users, violating intellectual property rights, or using our services for illegal purposes.',
        ],
      },
      {
        type: 'cards',
        heading: 'Operating Policies',
        columns: 3,
        items: [
          { icon: 'bi-shield-check', title: 'Code of Conduct', body: 'Standards of behavior for our team and partners.' },
          { icon: 'bi-megaphone', title: 'Whistleblower Policy', body: 'Confidential channels for reporting concerns.' },
          { icon: 'bi-people', title: 'Conflict of Interest', body: 'How we identify and manage conflicts.' },
          { icon: 'bi-lock', title: 'Information Security', body: 'Controls protecting data and systems.' },
          { icon: 'bi-bank2', title: 'Anti-Money Laundering', body: 'KYC/AML framework across regulated ventures.' },
          { icon: 'bi-diagram-2', title: 'Third-Party Vendor', body: 'Diligence and standards for vendors.' },
        ],
      },
    ],
  },

  'brand-guidelines': {
    header: {
      eyebrow: 'Legals',
      title: 'Brand Guidelines',
      description: 'How to use the Notus Regalia name, logo, and visual identity correctly.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Using Our Brand',
        paragraphs: [
          'The Notus Regalia name, logo, and marks are protected assets. These guidelines ensure the brand is represented consistently and correctly across media, partnerships, and publications.',
          'For editorial and partnership use, please follow the rules below and use only the approved assets from our Media Assets library.',
        ],
      },
      {
        type: 'cards',
        heading: 'Core Rules',
        columns: 3,
        items: [
          { icon: 'bi-vector-pen', title: 'Logo Usage', body: 'Use the approved marks only. Do not alter, recolor, rotate, or distort the logo.' },
          { icon: 'bi-palette', title: 'Color', body: 'Primary crimson is #EB1143 on dark or light neutral backgrounds. Maintain contrast.' },
          { icon: 'bi-fonts', title: 'Typography', body: 'Use the system wordmark styling. Do not substitute decorative fonts for the name.' },
          { icon: 'bi-arrows-fullscreen', title: 'Clear Space', body: 'Preserve clear space around the logo equal to the height of the mark.' },
          { icon: 'bi-ban', title: 'Don\'ts', body: 'No drop shadows, gradients, outlines, or busy backgrounds behind the mark.' },
          { icon: 'bi-images', title: 'Get Assets', body: 'Download approved logos and the press kit from Media Assets.', cta: 'Open Media Assets', href: '/information/documents/media-assets' },
        ],
      },
      {
        type: 'note',
        text: 'Questions about brand usage or permissions? Contact info@notusregalia.tech.',
      },
    ],
  },

  // ══ DOCUMENTS ═════════════════════════════════════════════
  'docs-governance': {
    header: {
      eyebrow: 'Documents',
      title: 'Governance Documents',
      description: 'Formation records, charters, and the governing documents of Notus Regalia.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Corporate Governance',
        paragraphs: [
          'These documents establish how Notus Regalia is formed, governed, and held accountable — from our founding charters to the policies that guide day-to-day conduct across every venture.',
          'We maintain a transparent governance posture, publishing the frameworks and compliance records that define our oversight, ethics, and regulatory standing.',
        ],
      },
      {
        type: 'documents',
        items: [
          { title: 'Certificate of Formation', year: '2024', filename: 'certificate-of-formation.pdf', description: 'Legal incorporation record establishing the entity.' },
          { title: 'Operating Agreement', year: '2024', filename: 'operating-agreement.pdf', description: 'Ownership structure, roles, and member rights.' },
          { title: 'Governance Framework', year: '2024', filename: 'governance-framework.pdf', description: 'Decision-making, oversight, and accountability model.' },
          { title: 'Code of Conduct', year: '2024', filename: 'code-of-conduct.pdf', description: 'Ethical standards expected across the organization.' },
          { title: 'Conflict of Interest Policy', year: '2024', filename: 'conflict-of-interest.pdf', description: 'Rules for disclosing and managing conflicts.' },
          { title: 'Whistleblower Policy', year: '2025', filename: 'whistleblower-policy.pdf', description: 'Safe, confidential channels for reporting concerns.' },
          { title: 'Compliance Certification', year: '2024', filename: 'compliance-certification.pdf', description: 'Attestation of adherence to applicable standards.' },
          { title: 'Regulatory Compliance Report', year: '2025', filename: 'regulatory-compliance.pdf', description: 'Annual summary of regulatory posture and controls.' },
        ],
      },
    ],
  },

  'docs-social': {
    header: {
      eyebrow: 'Documents',
      title: 'Social',
      description: 'Our commitments to people, communities, and responsible operations across the portfolio.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Social Responsibility',
        paragraphs: [
          'Several ventures under the Notus Regalia umbrella are built to serve underserved regions — from offline-capable telemedicine to adaptive STEM learning and blockchain-based microfinance.',
          'We hold ourselves to clear standards on data protection, fair access, and the responsible deployment of technology in sensitive contexts.',
        ],
      },
      {
        type: 'documents',
        items: [
          { title: 'Code of Conduct', year: '2024', filename: 'code-of-conduct.pdf', description: 'Ethical standards expected across the organization.' },
          { title: 'Human Rights Statement', year: '2025', filename: 'human-rights-statement.pdf', description: 'Our commitment to dignity and fair treatment.' },
          { title: 'Diversity & Inclusion Policy', year: '2025', filename: 'diversity-inclusion.pdf', description: 'Building equitable, inclusive teams and ventures.' },
          { title: 'Community Impact Summary', year: '2025', filename: 'community-impact.pdf', description: 'How our work serves underserved communities.' },
          { title: 'Supplier Standards', year: '2025', filename: 'supplier-standards.pdf', description: 'Responsible sourcing and partner expectations.' },
          { title: 'Data Protection Commitment', year: '2025', filename: 'data-protection.pdf', description: 'Safeguards for user privacy and sensitive data.' },
        ],
      },
    ],
  },

  'docs-environmental': {
    header: {
      eyebrow: 'Documents',
      title: 'Environmental',
      description: 'Environmental commitments, sustainability reporting, and our CleanTech initiatives.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Sustainability',
        paragraphs: [
          'Our Smart Carbon Capture initiative pairs IoT-enabled monitoring with real-time analytics, with pilot data indicating meaningful emissions reductions at participating industrial facilities.',
          'We are establishing tradeable carbon-credit generation protocols in partnership with verification agencies, and we report on environmental impact as ventures mature.',
        ],
      },
      {
        type: 'documents',
        items: [
          { title: 'Environmental Policy', year: '2025', filename: 'environmental-policy.pdf', description: 'Our principles for responsible operations.' },
          { title: 'CleanTech Pilot Report', year: '2024', filename: 'cleantech-pilot-report.pdf', description: 'Results from Smart Carbon Capture deployments.' },
          { title: 'Carbon Methodology', year: '2025', filename: 'carbon-methodology.pdf', description: 'How we measure and verify emissions impact.' },
          { title: 'Sustainability Summary', year: '2025', filename: 'sustainability-summary.pdf', description: 'Portfolio-wide environmental progress at a glance.' },
          { title: 'Energy Efficiency Report', year: '2025', filename: 'energy-efficiency.pdf', description: 'Efficiency gains across facilities and ventures.' },
        ],
      },
    ],
  },

  'media-assets': {
    header: {
      eyebrow: 'Documents',
      title: 'Media Assets',
      description: 'Brand assets, logos, and press materials for approved use by media and partners.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Brand & Media',
        paragraphs: [
          'Everything you need to represent Notus Regalia accurately — logos, brand guidelines, executive photography, and approved company facts in one place.',
          'These assets are made available for editorial coverage and partner use. For anything not listed here, reach out to our communications desk directly.',
        ],
      },
      {
        type: 'cards',
        heading: 'Brand & Press Kit',
        columns: 3,
        items: [
          { icon: 'bi-vector-pen', title: 'Logo Pack', body: 'Primary mark in SVG and PNG, light and dark variants.', cta: 'Download', href: '/documents/notus-regalia-logos.zip' },
          { icon: 'bi-palette', title: 'Brand Guidelines', body: 'Color, type, spacing, and usage rules.', cta: 'Download', href: '/documents/brand-guidelines.pdf' },
          { icon: 'bi-person-badge', title: 'Executive Headshots', body: 'Approved photography of the operating team.', cta: 'Download', href: '/documents/headshots.zip' },
          { icon: 'bi-card-image', title: 'Product Imagery', body: 'High-resolution screenshots and renders.', cta: 'Download', href: '/documents/product-imagery.zip' },
          { icon: 'bi-file-earmark-text', title: 'Boilerplate & Fact Sheet', body: 'Approved company description and key facts.', cta: 'Download', href: '/documents/fact-sheet.pdf' },
          { icon: 'bi-envelope', title: 'Media Contact', body: 'Reach the communications desk.', cta: 'info@notusregalia.tech', href: 'mailto:info@notusregalia.tech' },
        ],
      },
      {
        type: 'note',
        text: 'Brand assets are provided for editorial and partnership use. Please follow the brand guidelines and do not alter the marks.',
      },
    ],
  },

  // ══ SETTINGS ══════════════════════════════════════════════
  preferences: {
    header: {
      eyebrow: 'Settings',
      title: 'Preferences',
      description: 'Manage your cookie consent, privacy choices, and how Notus Regalia experiences behave for you.',
    },
    blocks: [
      { type: 'preferences' },
    ],
  },

};
