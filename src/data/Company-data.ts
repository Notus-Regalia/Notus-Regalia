export interface TeamMember {
  name: string;
  role: string;
  color: string;
}

export interface OverviewSection {
  title: string;
  description: string[];
  buttonText: string;
}

export interface OverviewContent {
  icon: string;
  title: string;
  description: string[];
}

export interface SubSection {
  key: string;
  /** Text shown on the tab button — unchanged */
  label: string;
  /** Heading rendered inside the content area */
  contentTitle: string;
  description: string[];
}

export interface AboutContent {
  title: string;
  subsections: SubSection[];
  buttonType: 'link' | 'tabs' | 'cards';
  buttonText?: string;
  buttonLink?: string;
}

export interface AboutGridItem {
  key: 'company' | 'philosophy' | 'ecosystem' | 'direction' | 'governance' | 'ethics';
  title: string;
  subtitle: string;
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface FounderEducation {
  school: string;
  degree: string;
  years: string;
}

export interface Founder {
  id: string;
  codename: string;
  name: string;
  title: string;
  role: string;
  src: string | null;
  bio: string;
  since: string;
  linkedin: string;
  instagram?: string;
  x?: string;
  github?: string;
  education: FounderEducation[];
}

export interface CompanyStat {
  value: string;
  accent: boolean;
  label: string;
}

export const FOUNDERS: Founder[] = [
  {
    id: 'F-001',
    codename: 'Alpha',
    name: 'Jansen Jekk Tesnado',
    title: 'Founder & CEO',
    role: 'Governance, Systems Architecture & Engineering',
    src: '/assets/Founder-1.jpg',
    bio: "Leading Notus Regalia with an unwavering focus on long-term vision and strategic direction. Responsible for shaping the organizational culture and ensuring every unit operates in alignment with the company's core mission.",
    since: '2025',
    linkedin: '#',
    instagram: '#',
    x: '#',
    github: '#',
    education: [
      { school: 'University Name', degree: 'BS Information Technology', years: '2022 — Present' },
    ],
  },
  {
    id: 'F-002',
    codename: 'Beta',
    name: 'Kenneth Tomaniog',
    title: 'Founder & Lead Engineer',
    role: 'Core & Systems Engineering',
    src: '/assets/Founder-2.jpg',
    bio: 'Architect of the operational backbone that keeps six active units running with precision. Converts high-level strategy into executable systems, ensuring efficiency and accountability across all levels of the organization.',
    since: '2025',
    linkedin: '#',
    instagram: '#',
    x: '#',
    github: '#',
    education: [
      { school: 'University Name', degree: 'BS Computer Engineering', years: '2022 — Present' },
    ],
  },
  {
    id: 'F-003',
    codename: 'Delta',
    name: 'Alyanna Ricci Evangelista',
    title: 'Founder & Engineer',
    role: 'Operations, Infrastructure & Systems Deployment',
    src: '/assets/Founder-3.jpg',
    bio: "Drives the technological foundation of the company — from internal infrastructure to external-facing systems. Ensures every tool, platform, and pipeline is built to scale alongside the organization's ambitions.",
    since: '2025',
    linkedin: '#',
    instagram: '#',
    x: '#',
    github: '#',
    education: [
      { school: 'University Name', degree: 'BS Computer Science', years: '2022 — Present' },
    ],
  },
  {
    id: 'F-004',
    codename: 'Epsilon',
    name: 'Andrei Brent Bangajo',
    title: 'Founder & Engineer',
    role: 'Design & Perception',
    src: '/assets/Founder-4.jpg',
    bio: 'Defines the visual language and creative identity of Notus Regalia. Responsible for every touchpoint of brand perception — from aesthetics and communications to the emotional resonance the organization creates.',
    since: '2025',
    linkedin: '#',
    instagram: '#',
    x: '#',
    github: '#',
    education: [
      { school: 'University Name', degree: 'BS Multimedia Arts', years: '2022 — Present' },
    ],
  },
];

export const COMPANY_STATS: CompanyStat[] = [
  { value: '4',  accent: true,  label: 'Founders'      },
  { value: '6',  accent: false, label: 'Active Units'  },
  { value: '44', accent: false, label: 'Total Members' },
];

// ─── Overview ─────────────────────────────────────────────────────────────────

export const OverviewContent: OverviewContent[] = [
  {
    icon: 'bi-collection',
    title: 'Venture-Building Platform',
    description: [
      'We develop and oversee multiple ventures through a centralized operating framework, rather than managing a single standalone company.'
    ]
  },
  {
    icon: 'bi-arrows-move',
    title: 'Cross-Sector Mandate',
    description: [
      'Our activities are sector-agnostic, allowing capital and effort to be allocated toward opportunities with asymmetric impact.'
    ]
  },
  {
    icon: 'bi-mortarboard',
    title: 'Founding Governance',
    description: [
      'Notus Regalia functions as a founder-operator platform. While student-founded, ventures are governed with institutional discipline and long-term ownership principles.'
    ]
  },
  {
    icon: 'bi-leaf',
    title: 'Seed Stage',
    description: [
      'We focus on converting undeveloped concepts into venture-ready entities through disciplined validation and controlled deployment of resources.'
    ]
  },
  {
    icon: 'bi-eye-slash',
    title: 'Stealth Operations',
    description: [
      'Operating in stealth enables concentrated development, reduced external signaling, and strategic optionality ahead of public exposure.'
    ]
  }
];

// ─── About Panel ──────────────────────────────────────────────────────────────

export const ABOUT_PANEL_ITEMS: AboutGridItem[] = [
  { key: 'company',    title: 'Company',                subtitle: 'About Us, Our Story, Timeline' },
  { key: 'philosophy', title: 'Philosophy',              subtitle: 'Core Beliefs, Operating Doctrine, Systems Principles' },
  { key: 'ecosystem',  title: 'Ecosystem',               subtitle: 'Subsidiaries, Venture Model, Platform Architecture' },
  { key: 'direction',  title: 'Direction',               subtitle: 'Mission, Vision, Focus Areas, Ambitions' },
  { key: 'governance', title: 'Governance',              subtitle: 'Organizational Structure, Leadership Model' },
  { key: 'ethics',     title: 'Ethics & Responsibility', subtitle: 'Ethical Framework, Risk & Compliance' }
];

export const ABOUT_PANEL_CONTENT: Record<
  'company' | 'philosophy' | 'ecosystem' | 'direction' | 'governance' | 'ethics',
  AboutContent
> = {
  company: {
    title: 'Company',
    buttonType: 'tabs',
    subsections: [
      {
        key: 'what-we-do',
        label: 'What We Do',
        contentTitle: 'We build foundational information systems for complex, real-world data.',
        description: [
          'Notus Regalia is a technology holding and venture-building company headquartered in the Philippines. We develop and operate multiple ventures through a single, centralized framework — a shared engineering backbone of APIs, data pipelines, and security infrastructure reused across every company we build, back, and incubate.',
          'Our focus is connected information systems: the backend architecture and data ecosystems that turn complex, real-world data into systems organizations can operate with command and precision. We currently work in a pre-seed, stealth phase, concentrating on development and validation across government and civic operations, defense, healthcare, enterprise, and energy.'
        ]
      },
      {
        key: 'why-we-exist',
        label: 'Why We Exist',
        contentTitle: 'Born from a belief that builders closest to the problem should own the solution.',
        description: [
          'Notus Regalia began as a student-led initiative — a small group of builders convinced that the people closest to a problem should own its solution. That conviction became a founder-operator platform: one team, one technical backbone, many ventures.',
          'We exist to close the gap between emerging technology and real-world impact. Rather than chasing isolated products, we build repeatable operating systems and shared infrastructure that compound across a portfolio, directing capital and effort toward opportunities of asymmetric impact.'
        ]
      },
      {
        key: 'timeline',
        label: 'Timeline',
        contentTitle: 'Every milestone is a decision made, a lesson earned, and a capability built.',
        description: [
          'Founded in 2025, Notus Regalia is early by design. Our trajectory favors disciplined, capital-efficient progress over premature scale — validating concepts through stage-gates before committing resources.',
          'Each milestone marks a deliberate decision, a lesson earned in execution, and a capability added to the shared platform. We are building for decades, not quarters.'
        ]
      }
    ]
  },
  philosophy: {
    title: 'Philosophy',
    buttonType: 'tabs',
    subsections: [
      {
        key: 'core-beliefs',
        label: 'Core Beliefs',
        contentTitle: 'Responsible innovation is not a constraint — it is our competitive edge.',
        description: [
          'We believe responsible innovation is an advantage, not a tax. Systems thinking, long-term ownership, and accountability are built into how we design and operate — not bolted on afterward.',
          'Durable value comes from infrastructure that compounds, governance that preserves speed, and a refusal to confuse motion with progress.'
        ]
      },
      {
        key: 'operating-doctrine',
        label: 'Operating Doctrine',
        contentTitle: 'Discipline and autonomy are not opposites — they are the same engine running at different speeds.',
        description: [
          'Our doctrine pairs institutional discipline with operational autonomy. Ventures move fast and independently, but on a common backbone with clear stage-gates, capital-efficiency expectations, and founder-operator alignment.',
          'We standardize what should be standardized — infrastructure, security, governance — so teams can spend their freedom on the problems that actually differentiate them.'
        ]
      },
      {
        key: 'systems-principles',
        label: 'Systems Principles',
        contentTitle: 'We design for resilience first, because fragile systems do not scale.',
        description: [
          'We design for resilience, composability, and human-centered outcomes. Systems are built to fail gracefully, to be reused across ventures, and to keep qualified human judgment in the loop where it matters.',
          'Shared primitives — APIs, data pipelines, security controls — are treated as products in their own right, so every venture inherits a hardened foundation instead of rebuilding it.'
        ]
      }
    ]
  },
  ecosystem: {
    title: 'Ecosystem',
    buttonType: 'tabs',
    subsections: [
      {
        key: 'subsidiaries',
        label: 'Subsidiaries',
        contentTitle: 'Each subsidiary is a focused operator within a unified platform.',
        description: [
          'Our ecosystem spans wholly-owned subsidiaries, portfolio companies, and early-stage startups. Each is a focused operator with its own mandate, yet all interoperate on one platform and draw from shared services.',
          'This structure lets every venture stay close to its market while inheriting centralized infrastructure, capital discipline, and governance.'
        ]
      },
      {
        key: 'venture-model',
        label: 'Venture Model',
        contentTitle: 'We do not just fund ideas — we build, validate, and own them.',
        description: [
          'We operate as a venture studio, not a passive investor. We incubate ideas internally, validate them through disciplined stage-gates, and take long-term ownership of the ones that prove out.',
          'Capital, engineering, and operating expertise are deployed together under a founder-operator framework — so a venture is backed by builders, not just a balance sheet.'
        ]
      },
      {
        key: 'platform-architecture',
        label: 'Platform Architecture',
        contentTitle: 'Shared infrastructure. Independent velocity. No duplicated effort.',
        description: [
          'A centralized platform provides the APIs, data pipelines, and security primitives every venture needs, so new companies launch on hardened infrastructure instead of reinventing it.',
          'The result is independent velocity without duplicated effort: shared where it compounds, autonomous where it differentiates.'
        ]
      }
    ]
  },
  direction: {
    title: 'Direction',
    buttonType: 'tabs',
    subsections: [
      {
        key: 'mission',
        label: 'Mission',
        contentTitle: 'Identify, develop, and scale ventures that solve real problems through technology.',
        description: [
          'Our mission is to identify, develop, and scale ventures that solve real-world problems through technology and disciplined execution — across government and civic operations, defense, healthcare, enterprise, and energy.',
          'We measure success by the durability of the systems we build and the operational command they give the organizations that rely on them.'
        ]
      },
      {
        key: 'vision',
        label: 'Vision',
        contentTitle: 'A future where technology empowers human flourishing at scale.',
        description: [
          'We envision critical operations — public, industrial, and enterprise — running on resilient, well-governed information systems that earn trust at scale.',
          'Notus Regalia aims to be the operational backbone beneath that future: the engine behind the next generation of high-impact ventures in Southeast Asia and beyond.'
        ]
      },
      {
        key: 'strategic-focus',
        label: 'Strategic Focus Areas',
        contentTitle: 'We concentrate where the gap between impact and investment is widest.',
        description: [
          'We focus on five sectors where reliable systems matter most: government and civic operations, defense, healthcare, enterprise, and energy.',
          'Within them, we prioritize the problems where the gap between potential impact and current investment is widest — and where shared infrastructure gives us a compounding advantage.'
        ]
      },
      {
        key: 'ambition',
        label: 'Ambition',
        contentTitle: 'We are building for decades, not quarters.',
        description: [
          'Our ambition is measured in decades. We are building a durable platform whose value compounds as ventures, infrastructure, and institutional knowledge accumulate.',
          'Short-term optionality is preserved deliberately; long-term ownership is the goal.'
        ]
      }
    ]
  },
  governance: {
    title: 'Governance',
    buttonType: 'tabs',
    subsections: [
      {
        key: 'org-structure',
        label: 'Organizational Structure',
        contentTitle: 'Oversight without bottleneck. Autonomy without drift.',
        description: [
          'Notus Regalia separates holding-entity responsibilities from individual venture operations. The platform sets standards, allocates capital, and provides oversight; ventures retain the autonomy to execute.',
          'This keeps decision-making fast at the edge while preserving institutional discipline at the center.'
        ]
      },
      {
        key: 'leadership-model',
        label: 'Leadership Model',
        contentTitle: 'Leadership is distributed by design, not by default.',
        description: [
          'Leadership is distributed across founder-operators, each accountable for a domain — governance and systems architecture, core engineering, infrastructure and deployment, and design and perception.',
          'Authority follows responsibility: the people building a system are the people empowered to decide how it runs.'
        ]
      },
      {
        key: 'advisory-framework',
        label: 'Advisory Framework',
        contentTitle: 'External expertise sharpens internal judgment.',
        description: [
          'A formal governance framework defines decision-making protocols, resource allocation, stage-gate criteria, and risk management across the portfolio.',
          'External advisors and domain experts complement founder-operator judgment with outside perspective, without compromising operational autonomy.'
        ]
      }
    ]
  },
  ethics: {
    title: 'Ethics & Responsibility',
    buttonType: 'tabs',
    subsections: [
      {
        key: 'ethical-framework',
        label: 'Ethical Framework',
        contentTitle: 'Our values are not a policy document — they are the operating system.',
        description: [
          'Our ethical framework is embedded in how we build: human dignity and informed consent as design constraints, qualified human oversight over consequential system outputs, and equitable performance across the populations we serve.',
          'We treat ethics as an operating system, not a compliance afterthought — and the same standards flow down to the partners and suppliers we work with.'
        ]
      },
      {
        key: 'compliance-risk',
        label: 'Risk and Compliance',
        contentTitle: 'We treat risk identification as a continuous practice, not a periodic audit.',
        description: [
          'We identify, monitor, and mitigate operational, regulatory, and reputational risk continuously — building security, privacy, and accountability into systems from the start.',
          'Our practices align with applicable data-protection law, including the Philippine Data Privacy Act, and scale in rigor with the sensitivity of the systems we operate.'
        ]
      }
    ]
  }
};

// ─── Strategic Capital ────────────────────────────────────────────────────────

export type InvestorType =
  | 'Founder Capital'
  | 'Angel Investor'
  | 'Private Investor'
  | 'Strategic Investor'
  | 'Institutional Investor'
  | 'Seed Investor'
  | 'Growth Investor';

export type InvestmentStructure =
  | 'Equity'
  | 'SAFE'
  | 'Convertible'
  | 'Direct';

export interface Investor {
  id: string;
  name: string;
  /** URL to logo image — omit to use auto-generated initials placeholder */
  logo?: string;
  type: InvestorType;
  /** Internal phase ID, e.g. 'phase-1' */
  phase: string;
  /** Human-readable label shown in modal eyebrow, e.g. 'Phase I — Foundational Capital' */
  phaseLabel: string;
  description: string;
  year: string;
  roundName: string;
  investmentStructure: InvestmentStructure;
  strategicImpact: string[];
  link?: string;
}

export interface CapitalPhase {
  id: string;
  label: string;
  title: string;
  description: string;
  investors: Investor[];
  /** true = render investor cards; false = render Coming Soon block */
  live: boolean;
  /** Optional date shown in the Coming Soon block, e.g. 'January 2027' */
  comingSoonDate?: string;
  /** Override the badge in the not-live block (default 'Not Yet Open') */
  comingSoonLabel?: string;
  /** Override the main line in the not-live block (default 'Coming Soon …') */
  comingSoonText?: string;
}

export interface CapitalStat {
  value: string;
  label: string;
  accent: boolean;
}

/** Accent color per investor type — used by cards and modal. */
export const INVESTOR_TYPE_COLORS: Record<InvestorType, string> = {
  'Founder Capital':                       '#E31B54',
  'Angel Investor':                        '#f59e0b',
  'Private Investor':                      '#8b5cf6',
  'Strategic Investor':                    '#3b82f6',
  'Institutional Investor':                '#06b6d4',
  'Seed Investor':                         '#10b981',
  'Growth Investor':                       '#f97316',
};

// ── Phase I investors ─────────────────────────────────────────────────────────

// Investor profiles are withheld pending disclosure. The Phase I card renders a
// "to be disclosed" state (see CAPITAL_PHASES below) until names are released.
const PHASE_I_INVESTORS: Investor[] = [];

// ── Phase definitions ─────────────────────────────────────────────────────────

export const CAPITAL_PHASES: CapitalPhase[] = [
  {
    id: 'phase-1',
    label: 'Phase I',
    title: 'Phase I — Foundational Capital (Pre-Seed, Seed Capital)',
    description:
      'Initial seed funding from founders and early angel investors allocated toward foundational development, system architecture, and early-stage execution.',
    investors: PHASE_I_INVESTORS,
    live: false,
    comingSoonLabel: 'Confidential',
    comingSoonText: 'To be disclosed soon',
  },
  {
    id: 'phase-2',
    label: 'Phase II',
    title: 'Phase II — Strategic Capital (Series A Stage)',
    description:
      'Selective external investors participating in structured growth funding to support product scaling, operational expansion, and early market deployment (Seed Extension).',
    investors: [],
    live: false,
    comingSoonDate: 'January 2027',
  },
  {
    id: 'phase-3',
    label: 'Phase III',
    title: 'Phase III — Institutional Capital (Series A+ ,Series B Stage)',
    description:
      'Institutional investors and structured funds supporting large-scale expansion, infrastructure development, and long-term market growth (Growth Stage).',
    investors: [],
    live: false,
    comingSoonDate: 'October 2027',
  },
];

// ── Hero stats box ────────────────────────────────────────────────────────────

export const CAPITAL_STATS: CapitalStat[] = [
  { value: 'Confidential', label: 'Raised in Phase I', accent: true  },
  { value: '2025',         label: 'Active Since',      accent: false },
];