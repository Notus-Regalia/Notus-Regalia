// ─────────────────────────────────────────────────────────────
//  Information Center — site map + rich content (single source)
// ─────────────────────────────────────────────────────────────

export interface InfoSubtab {
  id: string;
  label: string;
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
  | { type: 'note'; text: string };

export interface SubtabContent {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  /** When true the landing header is omitted (used for the home/landing page). */
  hideHeader?: boolean;
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
      { id: 'privacy',  label: 'Privacy Policy' },
      { id: 'terms',    label: 'Terms of Service' },
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
];

export const DEFAULT_SUBTAB: Record<string, string> = {
  newsroom:  'releases',
  investors: 'news',
  research:  'case-studies',
  legals:    'policies',
  documents: 'docs-governance',
};

// subtab id → parent tab id (for eyebrow + url integrity)
export const SUBTAB_PARENT: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const tab of INFO_TABS) for (const sub of tab.subtabs) map[sub.id] = tab.id;
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
          'For interview requests, briefings, or commentary on systems engineering, venture building, and critical-infrastructure technology, reach our communications desk at press@notusregalia.com.',
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
          { icon: 'bi-images', title: 'Press Kit', body: 'Logos, executive headshots, and approved boilerplate.', cta: 'Browse Media Assets', href: '?tab=documents&subtab=media-assets' },
          { icon: 'bi-file-earmark-text', title: 'Fact Sheet', body: 'Company overview, structure, and operating principles.', cta: 'Download PDF', href: '/documents/fact-sheet.pdf' },
          { icon: 'bi-envelope', title: 'Press Contact', body: 'Reach the communications desk directly.', cta: 'press@notusregalia.com', href: 'mailto:press@notusregalia.com' },
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
        text: "Don't see your role? We are always interested in exceptional operators. Write to careers@notusregalia.com.",
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
        text: 'Accredited investors can request full disclosure packages through investor relations at ir@notusregalia.com.',
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
          'For inquiries related to investment opportunities, existing positions, or shareholder matters, contact our investor relations team at ir@notusregalia.com.',
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
          'For licensing inquiries or permission requests, please contact our legal department at legal@notusregalia.com.',
        ],
      },
    ],
  },

  privacy: {
    header: {
      eyebrow: 'Legals',
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect personal data, and the rights you have over your information.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Data Collection',
        paragraphs: [
          'We collect information to provide better services to our users. This includes personal information you provide and data collected automatically.',
          'We are committed to protecting your privacy and handling your data with care and respect in accordance with applicable data-protection laws.',
        ],
      },
      {
        type: 'text',
        heading: 'Cookie Usage',
        paragraphs: [
          'Our website uses cookies to enhance user experience, analyze site traffic, and personalize content. You can control cookie settings through your browser.',
          'Essential cookies are necessary for the website to function properly, while optional cookies help us improve our services.',
        ],
      },
      {
        type: 'text',
        heading: 'Data Protection',
        paragraphs: [
          'We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.',
          'You have rights regarding your personal data, including the right to access, correct, delete, or restrict processing of your information.',
        ],
      },
    ],
  },

  terms: {
    header: {
      eyebrow: 'Legals',
      title: 'Terms of Service',
      description: 'The terms and conditions governing your use of Notus Regalia websites, products, and services.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'General Terms',
        paragraphs: [
          'By accessing and using our services, you agree to be bound by these Terms of Service. Please read them carefully.',
          'These terms govern your use of our website, products, and services. We reserve the right to modify these terms at any time with notice.',
        ],
      },
      {
        type: 'text',
        heading: 'User Responsibilities',
        paragraphs: [
          'Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.',
          'You agree to use our services in compliance with all applicable laws and regulations and to respect the rights of other users.',
        ],
      },
      {
        type: 'text',
        heading: 'Limitation of Liability',
        paragraphs: [
          'Our services are provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages.',
          'The maximum liability shall not exceed the amount paid by you for the specific service giving rise to the claim.',
        ],
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
          { icon: 'bi-images', title: 'Get Assets', body: 'Download approved logos and the press kit from Media Assets.', cta: 'Open Media Assets', href: '?tab=documents&subtab=media-assets' },
        ],
      },
      {
        type: 'note',
        text: 'Questions about brand usage or permissions? Contact legal@notusregalia.com.',
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
        type: 'documents',
        items: [
          { title: 'Certificate of Formation', year: '2024', filename: 'certificate-of-formation.pdf' },
          { title: 'Operating Agreement', year: '2024', filename: 'operating-agreement.pdf' },
          { title: 'Governance Framework', year: '2024', filename: 'governance-framework.pdf' },
          { title: 'Code of Conduct', year: '2024', filename: 'code-of-conduct.pdf' },
          { title: 'Conflict of Interest Policy', year: '2024', filename: 'conflict-of-interest.pdf' },
          { title: 'Whistleblower Policy', year: '2025', filename: 'whistleblower-policy.pdf' },
          { title: 'Compliance Certification', year: '2024', filename: 'compliance-certification.pdf' },
          { title: 'Regulatory Compliance Report', year: '2025', filename: 'regulatory-compliance.pdf' },
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
          { title: 'Code of Conduct', year: '2024', filename: 'code-of-conduct.pdf' },
          { title: 'Human Rights Statement', year: '2025', filename: 'human-rights-statement.pdf' },
          { title: 'Diversity & Inclusion Policy', year: '2025', filename: 'diversity-inclusion.pdf' },
          { title: 'Community Impact Summary', year: '2025', filename: 'community-impact.pdf' },
          { title: 'Supplier Standards', year: '2025', filename: 'supplier-standards.pdf' },
          { title: 'Data Protection Commitment', year: '2025', filename: 'data-protection.pdf' },
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
          { title: 'Environmental Policy', year: '2025', filename: 'environmental-policy.pdf' },
          { title: 'CleanTech Pilot Report', year: '2024', filename: 'cleantech-pilot-report.pdf' },
          { title: 'Carbon Methodology', year: '2025', filename: 'carbon-methodology.pdf' },
          { title: 'Sustainability Summary', year: '2025', filename: 'sustainability-summary.pdf' },
          { title: 'Energy Efficiency Report', year: '2025', filename: 'energy-efficiency.pdf' },
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
        type: 'cards',
        heading: 'Brand & Press Kit',
        columns: 3,
        items: [
          { icon: 'bi-vector-pen', title: 'Logo Pack', body: 'Primary mark in SVG and PNG, light and dark variants.', cta: 'Download', href: '/documents/notus-regalia-logos.zip' },
          { icon: 'bi-palette', title: 'Brand Guidelines', body: 'Color, type, spacing, and usage rules.', cta: 'Download', href: '/documents/brand-guidelines.pdf' },
          { icon: 'bi-person-badge', title: 'Executive Headshots', body: 'Approved photography of the operating team.', cta: 'Download', href: '/documents/headshots.zip' },
          { icon: 'bi-card-image', title: 'Product Imagery', body: 'High-resolution screenshots and renders.', cta: 'Download', href: '/documents/product-imagery.zip' },
          { icon: 'bi-file-earmark-text', title: 'Boilerplate & Fact Sheet', body: 'Approved company description and key facts.', cta: 'Download', href: '/documents/fact-sheet.pdf' },
          { icon: 'bi-envelope', title: 'Media Contact', body: 'Reach the communications desk.', cta: 'press@notusregalia.com', href: 'mailto:press@notusregalia.com' },
        ],
      },
      {
        type: 'note',
        text: 'Brand assets are provided for editorial and partnership use. Please follow the brand guidelines and do not alter the marks.',
      },
    ],
  },
};
