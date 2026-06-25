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
  slug?: string;       // when set, the card opens the in-app article at pub-<slug>
}

// ── Careers ──────────────────────────────────────────────────
// Program a role belongs to; drives the careers filter.
export type CareerProgram = 'corporate' | 'internship' | 'sefirah';

export interface RoleItem {
  title: string;
  description: string;
  location: string;
  program: CareerProgram;
  applyHref: string;
  learnMoreHref: string;
}

// Filter options surfaced in the careers Program dropdown.
export const CAREER_PROGRAMS: { id: CareerProgram; label: string }[] = [
  { id: 'corporate',  label: 'Corporate (Notus Regalia)' },
  { id: 'internship', label: 'Internship' },
  { id: 'sefirah',    label: 'Project Sefirah' },
];

// ── Brand guidelines ─────────────────────────────────────────
// A single brand color swatch. `ink` sets the legible text color painted over
// the swatch fill.
export interface SwatchItem {
  name: string;
  hex: string;
  usage?: string;
  ink?: 'light' | 'dark';
}

// Each misuse tile distorts the base mark via a preset CSS transform/filter to
// illustrate a "don't" — mirroring NVIDIA's logo-misuse grid.
export type MisuseVariant =
  | 'stretch' | 'squish' | 'rotate' | 'recolor' | 'effects' | 'busy' | 'lowContrast' | 'crop';
export interface MisuseItem {
  label: string;
  variant: MisuseVariant;
}

// ── Brand guidelines ─────────────────────────────────────────
// A logo paired across both backgrounds: the black-ink art (`light`) and the
// white-ink art (`dark`) of the same lockup are shown together so usage is
// unambiguous. `dark` is omitted for the icon (one mark, no themed variants).
// `layout` controls how the two panels sit: `side` (left/right) or `stack`
// (top/bottom — used for wide horizontal lockups). `wide` spans both columns.
export interface LogoPairItem {
  title: string;
  caption?: string;
  light: string;
  dark?: string;
  layout?: 'side' | 'stack';
  wide?: boolean;
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
  | { type: 'careers'; roles: RoleItem[] }                        // search + program filter over open roles
  | { type: 'logoPairs'; heading?: string; items: LogoPairItem[] }                     // light/dark paired specimens
  | { type: 'clearspace'; heading?: string; src: string; note?: string }              // clear space / min size
  | { type: 'palette'; heading?: string; items: SwatchItem[] }    // brand color swatches
  | { type: 'misuse'; heading?: string; base: string; items: MisuseItem[] };          // logo misuse grid

export interface SubtabContent {
  header: {
    eyebrow: string;
    title: string;
    description: string;
    /** Optional secondary link rendered below the description. */
    link?: { label: string; href: string };
    /** Optional primary CTA. `scrollTo` smooth-scrolls to the element id; otherwise `href`. */
    cta?: { label: string; href?: string; scrollTo?: string };
  };
  /** When true the landing header is omitted (used for the home/landing page). */
  hideHeader?: boolean;
  /** When true, body text is justified (used for formal legal documents). */
  justify?: boolean;
  /** When true, the body renders on the always-dark investor grid background. */
  gridBg?: boolean;
  /** When true, the header renders as a split hero (text left · animated bg right). */
  heroHeader?: boolean;
  /** When true, the header drops the animated shader background for a plain black
   *  banner with extra top clearance (used for publication article pages). */
  staticHeader?: boolean;
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
      { id: 'brand-guidelines',   label: 'Brand Guidelines' },
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

// ── Hidden sub-pages ─────────────────────────────────────────
// Pages that aren't listed in the subtab strip but are reachable from within a
// parent subtab (e.g. a CTA). On a sub-page the strip swaps to a breadcrumb:
// "<parent subtab> › <sub-page>". They route like any other subtab id.
export interface SubPage {
  label: string;
  tabId: string;            // parent tab (drives which strip is active)
  parentSubtabId: string;   // the subtab the breadcrumb anchors back to
  parentSubtabLabel: string;
  crumbMeta?: string;       // optional secondary crumb text (e.g. a publication date)
}

// ── Publications (blog / read-more articles) ─────────────────
// Long-form pieces surfaced on Releases. Each becomes a hidden sub-page at
// `pub-<slug>` whose breadcrumb reads "Releases › <title>" with the date.
export interface PublicationArticle extends PublicationItem {
  slug: string;
  body: ContentBlock[];     // rendered with the standard block renderer
}

export const PUB_SUBPAGE_PREFIX = 'pub-';
export const pubSubpageId = (slug: string) => PUB_SUBPAGE_PREFIX + slug;

export const PUBLICATIONS: PublicationArticle[] = [
  {
    slug: 'introducing-project-sefirah',
    title: 'Building the Foundation First: An Introduction to Project Sefirah',
    category: 'Editorial',
    date: 'May 2025',
    readTime: '14 min read',
    excerpt: 'Why Notus Regalia is investing in a single infrastructural and technical foundation — Project Sefirah — before anything is built on top of it, and what that foundation is designed to carry.',
    body: [
      {
        type: 'text',
        paragraphs: [
          'Most companies build a product and discover the platform later — usually under duress, after the product has outgrown the assumptions it was first shipped on. The familiar shape of it: a first version ships quickly, finds some traction, and then every subsequent feature is bolted onto scaffolding that was only ever meant to hold the demo up. By the time anyone admits a platform is needed, there is a live product depending on the very thing that has to be rebuilt. Notus Regalia is doing the opposite. Before we ship anything to anyone, we are building the foundation that everything else will stand on. We call it Project Sefirah.',
          'Sefirah is not a feature or an app. It is the company’s infrastructural and technical foundation: the data layer that holds the system’s memory, the service orchestration that ties individual capabilities together, the security model that governs access to all of it, and the assistant that turns the whole platform into something a person can actually operate. Each of those is a hard problem in its own right. Treated as one system, with shared contracts and a single source of truth, they become something more than the sum of their parts — a backbone that every future product can stand on without re-litigating the basics.',
          'This piece is an introduction, not a specification. It is meant to explain why we are spending our earliest, most expensive effort on infrastructure that no customer will ever see directly, and what we expect that discipline to buy us. The short version: the foundation is the product right now, and getting it right is the work.',
        ],
      },
      {
        type: 'text',
        heading: 'Why the foundation comes first',
        paragraphs: [
          'The systems we intend to build operate in domains where failure is not an inconvenience — it is a consequence. In healthcare, finance, and other regulated environments, a mistake is not a bad review; it is a harmed person, a lost record, a breached obligation. Foundations laid carelessly there cannot be quietly repaired later. Building Sefirah first lets us make the hard architectural decisions once, deliberately, while the cost of changing our mind is still measured in code rather than in incidents.',
          'There is a simple economics to this. Early on, the cost of getting the structure wrong is low — you change a few interfaces and move on. Later, that same change ripples through everything built on top of it, and the bill arrives with interest. By paying down the hardest design questions before there is a product riding on them, we trade a slower first milestone for a far faster tenth. The foundation is slower to a first demo and dramatically cheaper to extend afterward.',
          'It also means every capability we add inherits a mature backbone from day one: consistent data, auditable access, and a single place where security and governance are enforced rather than reimplemented. A new product team should not have to invent its own way to store records, check permissions, or prove what happened. Those are solved problems inside Sefirah, and solving them once — well — is the entire point.',
        ],
      },
      {
        type: 'text',
        heading: 'The four layers',
        paragraphs: [
          'Sefirah is built in layers, each with a single responsibility and a clear contract with the layers above and below it. The discipline is deliberate: a foundation earns trust by being predictable, and predictability comes from boundaries you can reason about. Four layers carry the weight.',
          'The data layer sits at the bottom. It is designed to stay consistent and auditable as the platform grows — every consequential change recorded, every read travelling the same access path. We would rather pay a little structure up front than inherit an unaccountable data sprawl later, because data is the one thing you cannot casually rebuild.',
          'Above it, the orchestration core lets new capabilities plug into the platform without rework. Capabilities declare what they need and what they produce; the core handles wiring, sequencing, and failure handling. Adding a capability should feel like extending the system, not patching it.',
          'The security model runs through all of it rather than sitting beside it. Access control, auditability, and data protection are properties of the foundation, not options layered on at the end — every action passes through a single authorization path, and there is no privileged side door, because side doors are exactly what later become the incident.',
          'At the surface is the assistant, which turns the platform into something a person operates by intent rather than by menu. Because it speaks the same contracts as everything beneath it, the path from “take me there” to “do this for me” is an evolution rather than a rebuild.',
        ],
      },
      {
        type: 'text',
        heading: 'A system, not a stack of silos',
        paragraphs: [
          'It would be easy to read those four layers as four separate projects with four separate owners. That is precisely the failure mode we are designing against. Engineering, security, and governance break down when they are owned by separate fiefdoms that meet only at integration time — each makes locally reasonable decisions that are collectively incoherent, and the seams between them are where things go wrong.',
          'In Sefirah they share contracts and a single source of truth, so a decision in one layer is visible to the others by construction. Governance is not a committee that reviews the system after the fact; wherever we can, oversight is encoded into the platform itself — access rules, audit trails, and approval gates that apply consistently because they do not depend on anyone remembering to apply them. Human judgment is reserved for the decisions that genuinely need it, not spent rubber-stamping the routine.',
        ],
      },
      {
        type: 'text',
        heading: 'What this means for the people who build on it',
        paragraphs: [
          'The promise of a foundation-first approach is leverage. When the next venture or product begins, it does not start from an empty repository and a list of solved-everywhere problems to solve again. It starts on infrastructure that already knows how to store data safely, enforce who can see what, record what happened, and present itself through a coherent assistant. The team’s attention goes to the part that is actually novel — the thing only they can build — instead of the plumbing every system needs.',
          'That is also how we intend to stay capital-efficient without cutting the corners that matter. Discipline at the foundation is not the opposite of speed; it is what makes durable speed possible. Shortcuts taken in the basement are paid for on every floor above.',
        ],
      },
      {
        type: 'text',
        heading: 'What we are building toward',
        paragraphs: [
          'Over the coming releases we will write about each layer of Sefirah in its own right — the data model, the orchestration core, the security posture, and the assistant — and about the operating principles that hold them together. This piece is the frame around those: a statement that the foundation is the product right now, and that getting it right is the work.',
          'We are in an early, deliberately quiet phase. The work is not glamorous, and much of it will never be visible to the people it ultimately serves. That is fine. The measure of a foundation is not how it looks on the day it is poured — it is everything it lets you build, safely, for years afterward.',
        ],
      },
    ],
  },
  {
    slug: 'sefirah-architecture',
    title: 'Inside Sefirah’s Architecture',
    category: 'Technical',
    date: 'April 2025',
    readTime: '12 min read',
    excerpt: 'The data layer, service orchestration, and assistant that make up the core platform — and the design decisions behind each.',
    body: [
      {
        type: 'text',
        paragraphs: [
          'Sefirah is built in layers, each with a single responsibility and a clear contract with the layers above and below it. The discipline is deliberate: a foundation earns trust by being predictable, and predictability comes from boundaries you can reason about.',
        ],
      },
      {
        type: 'text',
        heading: 'The data layer',
        paragraphs: [
          'At the bottom sits a data model designed to stay consistent and auditable as the platform grows. Every consequential change is recorded; every read goes through the same access path. We would rather pay a little structure up front than inherit an unaccountable data sprawl later.',
        ],
      },
      {
        type: 'text',
        heading: 'Orchestration',
        paragraphs: [
          'Above the data layer, an orchestration core lets new capabilities plug into the platform without rework. Capabilities declare what they need and what they produce; the core handles wiring, sequencing, and failure handling. Adding a capability should feel like extending the system, not patching it.',
        ],
      },
      {
        type: 'text',
        heading: 'The assistant',
        paragraphs: [
          'At the surface, the Sefirah assistant turns the platform into something a person operates by intent rather than by menu. It is not bolted on — it speaks the same contracts the rest of the system does, which is what lets it search, navigate, and eventually act on the user’s behalf.',
        ],
      },
    ],
  },
  {
    slug: 'sefirah-security',
    title: 'Security as a First Principle',
    category: 'Technical',
    date: 'March 2025',
    readTime: '7 min read',
    excerpt: 'How Project Sefirah treats access control, auditability, and data protection as foundational requirements rather than later additions.',
    body: [
      {
        type: 'text',
        paragraphs: [
          'Security added late is security working against the grain of a system. In Sefirah, the security model is part of the foundation — access control, auditability, and data protection are properties of the platform, not options layered on top of it.',
        ],
      },
      {
        type: 'text',
        heading: 'Access from first principles',
        paragraphs: [
          'Every action runs through a single authorization path with role-based rules and recorded outcomes. There is no privileged side door, because side doors are exactly what later become the incident. Consequential actions are logged so that what happened can always be reconstructed.',
        ],
      },
      {
        type: 'text',
        heading: 'Protecting data by default',
        paragraphs: [
          'Data is protected in transit and at rest, and access to it is scoped to purpose. The default is least privilege; broad access is the exception that has to be justified, not the convenience that has to be revoked.',
        ],
      },
    ],
  },
  {
    slug: 'sefirah-assistant',
    title: 'Designing the Sefirah Assistant',
    category: 'Product',
    date: 'February 2025',
    readTime: '10 min read',
    excerpt: 'The reasoning behind Sefirah’s conversational surface — search, navigation, and the path toward a unified operating layer.',
    body: [
      {
        type: 'text',
        paragraphs: [
          'The assistant is how Sefirah meets a person. Its job is to collapse the distance between intent and action — to let someone ask for what they want and have the platform do the routing, rather than forcing them to learn where everything lives.',
        ],
      },
      {
        type: 'text',
        heading: 'Start with search and navigation',
        paragraphs: [
          'We began with the two things people do most: finding and moving. The assistant indexes the platform and can take you to the right place directly. It is a deliberately modest start — earning trust on simple, verifiable tasks before it is given more consequential ones.',
        ],
      },
      {
        type: 'text',
        heading: 'Toward an operating layer',
        paragraphs: [
          'Because the assistant speaks the same contracts as the rest of Sefirah, the path from “take me there” to “do this for me” is an evolution rather than a rebuild. Each new capability the platform gains is, almost for free, something the assistant can help you operate.',
        ],
      },
    ],
  },
  {
    slug: 'governance-without-bureaucracy',
    title: 'Governance Without Bureaucracy',
    category: 'Operations',
    date: 'January 2025',
    readTime: '6 min read',
    excerpt: 'Designing oversight that preserves operational speed while enforcing institutional discipline.',
    body: [
      {
        type: 'text',
        paragraphs: [
          'Governance has a reputation problem: people assume it means slowing down. Done well, it is the opposite — it is what lets you move quickly without accumulating the kind of risk that eventually forces you to stop.',
        ],
      },
      {
        type: 'text',
        heading: 'Make the rules part of the system',
        paragraphs: [
          'Wherever we can, oversight is encoded rather than enforced by meeting. Access rules, audit trails, and approval gates live in Sefirah itself. The result is discipline that is consistent and fast, because it does not depend on someone remembering to apply it.',
        ],
      },
      {
        type: 'text',
        heading: 'Reserve human judgment for what needs it',
        paragraphs: [
          'People should spend their attention on the decisions that genuinely require judgment — not on rubber-stamping the routine. Good governance clears the routine out of the way so that the hard calls get the scrutiny they deserve.',
        ],
      },
    ],
  },
  {
    slug: 'building-companies-like-systems',
    title: 'Building Companies Like Systems',
    category: 'Essay',
    date: 'December 2024',
    readTime: '8 min read',
    excerpt: 'Why Notus Regalia treats engineering, infrastructure, and governance as one system — and builds the platform before the product.',
    body: [
      {
        type: 'text',
        paragraphs: [
          'We treat the company itself as a system to be engineered: its infrastructure, its governance, and its products are not separate concerns but parts of one design. That belief is why our first project is a foundation rather than a feature.',
        ],
      },
      {
        type: 'text',
        heading: 'One system, not three silos',
        paragraphs: [
          'Engineering, security, and governance fail when they are owned by separate fiefdoms that meet only at integration time. In Sefirah they share contracts and a single source of truth, so a decision in one is visible to the others by construction.',
        ],
      },
      {
        type: 'text',
        heading: 'Build the platform first',
        paragraphs: [
          'Building the foundation before the product is slower to a first demo and far faster to the tenth. Every capability we add lands on mature infrastructure instead of improvising its own — which is the whole point of building a company like a system.',
        ],
      },
    ],
  },
];

export const PUBLICATION_BY_SUBPAGE: Record<string, PublicationArticle> = Object.fromEntries(
  PUBLICATIONS.map((a) => [pubSubpageId(a.slug), a]),
);

export const SUBTAB_SUBPAGES: Record<string, SubPage> = {
  'recruitment-process': {
    label: 'Recruitment Process',
    tabId: 'newsroom',
    parentSubtabId: 'careers',
    parentSubtabLabel: 'Careers',
  },
  // Generated: one hidden sub-page per publication, anchored back to Releases.
  ...Object.fromEntries(
    PUBLICATIONS.map((a) => [
      pubSubpageId(a.slug),
      {
        label: a.title,
        tabId: 'newsroom',
        parentSubtabId: 'releases',
        parentSubtabLabel: 'Releases',
        crumbMeta: a.date,
      } satisfies SubPage,
    ]),
  ),
};

// subtab id → parent tab id (for eyebrow + url integrity). Includes sub-pages.
export const SUBTAB_PARENT: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const tab of INFO_TABS) for (const sub of tab.subtabs) {
    if (!sub.external) map[sub.id] = tab.id; // external subtabs have no in-page content
  }
  for (const [id, sp] of Object.entries(SUBTAB_SUBPAGES)) map[id] = sp.tabId;
  return map;
})();

// ─────────────────────────────────────────────────────────────
//  Per-subtab content
// ─────────────────────────────────────────────────────────────
export const SUBTAB_CONTENT: Record<string, SubtabContent> = {
  // ══ NEWSROOM ══════════════════════════════════════════════
  announcements: {
    header: {
      eyebrow: '',
      title: 'Announcements',
      description: 'Official statements, notices, and public disclosures issued by Notus Regalia on the development of Project Sefirah.',
    },
    blocks: [
      { type: 'releases' },
    ],
  },

  releases: {
    header: {
      eyebrow: '',
      title: 'Releases',
      description: 'Long-form publications, research notes, and editorial from the Notus Regalia operating team.',
    },
    hideHeader: true,
    blocks: [
      // Hero + grid are driven by the PUBLICATIONS registry, so each card links
      // to its in-app article (pub-<slug>) instead of a static PDF.
      { type: 'hero', stories: PUBLICATIONS },
      { type: 'publicationGrid', heading: 'Latest Publications', items: PUBLICATIONS },
    ],
  },

  media: {
    header: {
      eyebrow: '',
      title: 'Media',
      description: 'Press coverage, brand mentions, interviews, and resources for journalists covering Notus Regalia.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Press & Coverage',
        paragraphs: [
          'Notus Regalia operates in a pre-seed, stealth phase. Our work is currently focused on a single project — Project Sefirah, the infrastructural and technical foundation of the company. Selected coverage and interviews will be catalogued here as they are published.',
          'For interview requests, briefings, or commentary on systems engineering and critical-infrastructure technology, reach our communications desk at info@notusregalia.tech.',
        ],
      },
      {
        type: 'note',
        text: 'Notus Regalia is in stealth. There is no press coverage to publish yet — this page will be updated as Project Sefirah moves toward public milestones. For early briefings, contact info@notusregalia.tech.',
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
      eyebrow: '',
      title: 'Find Your Future',
      description: 'Notus Regalia is looking for exceptional people ready to take on hard problems across our programs and ventures. We bring together engineers, operators, and builders to do their best work — with real ownership, room to grow, and the support to make a lasting impact.',
      cta: { label: 'View Open Roles', scrollTo: 'careers-open-roles' },
      link: { label: 'Recruitment Process', href: '/information/newsroom/recruitment-process' },
    },
    heroHeader: true,
    gridBg: true,
    blocks: [
      {
        type: 'careers',
        roles: [
          { program: 'corporate', title: 'Founding Platform Engineer', description: 'Own the core technical platform behind Project Sefirah — APIs, data pipelines, and security protocols at the foundation of the company.', location: 'Remote · Full-time', applyHref: '/contact', learnMoreHref: '/contact' },
          { program: 'corporate', title: 'Security & Compliance Lead', description: 'Drive information security, data protection, and compliance posture across Project Sefirah and company operations.', location: 'Remote · Full-time', applyHref: '/contact', learnMoreHref: '/contact' },
          { program: 'corporate', title: 'Operations Lead', description: 'Stand up the operating disciplines — governance, process, and execution — that Project Sefirah is built on.', location: 'Hybrid · Full-time', applyHref: '/contact', learnMoreHref: '/contact' },
          { program: 'internship', title: 'Engineering Intern', description: 'Ship real features alongside the platform team while you learn how we build and operate systems.', location: 'Remote · Internship', applyHref: '/contact', learnMoreHref: '/contact' },
          { program: 'internship', title: 'Operations Intern', description: 'Support Project Sefirah operations and research with hands-on, scoped projects.', location: 'Hybrid · Internship', applyHref: '/contact', learnMoreHref: '/contact' },
          { program: 'sefirah', title: 'Sefirah Systems Engineer', description: 'Build and harden the core infrastructure behind Project Sefirah’s assistant and data layer.', location: 'Remote · Full-time', applyHref: '/contact', learnMoreHref: '/contact' },
          { program: 'sefirah', title: 'Applied AI Researcher', description: 'Prototype and evaluate retrieval, reasoning, and orchestration approaches for Project Sefirah.', location: 'Remote · Full-time', applyHref: '/contact', learnMoreHref: '/contact' },
          { program: 'sefirah', title: 'Product Designer — Sefirah', description: 'Shape the conversational and visual surfaces of Project Sefirah end to end.', location: 'Remote · Contract', applyHref: '/contact', learnMoreHref: '/contact' },
        ],
      },
    ],
  },

  // Hidden sub-page of Careers — reached via the careers hero CTA.
  'recruitment-process': {
    header: {
      eyebrow: '',
      title: 'Recruitment Process',
      description: 'How we evaluate and hire — a candid, paid, and fast process designed to respect your time and show you how we actually work.',
    },
    gridBg: true,
    blocks: [
      {
        type: 'text',
        heading: 'What to expect',
        paragraphs: [
          'Our process is deliberately short and high-signal. You will speak with the people you would actually work with, do real (paid) work rather than abstract puzzles, and get a transparent decision quickly.',
        ],
      },
      {
        type: 'cards',
        heading: 'The Steps',
        columns: 3,
        items: [
          { icon: 'bi-chat-dots', title: '1 · Conversation', body: 'A candid talk about your work, what you want to own, and how we operate.' },
          { icon: 'bi-tools', title: '2 · Working Session', body: 'A paid, scoped exercise that mirrors real problems you would solve here.' },
          { icon: 'bi-people', title: '3 · Team & Offer', body: 'Meet the operators you would build alongside, then a fast, transparent offer.' },
        ],
      },
      {
        type: 'note',
        text: "Questions about the process or accommodations? Reach us at [info@notusregalia.tech](mailto:info@notusregalia.tech).",
      },
    ],
  },

  // ══ INVESTORS ═════════════════════════════════════════════
  news: {
    header: {
      eyebrow: '',
      title: 'Investor News',
      description: 'Project milestones, capital updates, and disclosures relevant to current and prospective investors.',
    },
    blocks: [
      {
        type: 'cards',
        heading: 'Latest Updates',
        columns: 2,
        items: [
          { tag: 'Capital', icon: 'bi-cash-coin', title: 'Pre-Seed Operating Framework Established', meta: 'January 2025', body: 'Notus Regalia formalizes its operating framework and commits initial capital to Project Sefirah.' },
          { tag: 'Project', icon: 'bi-rocket-takeoff', title: 'Project Sefirah Enters Active Development', meta: 'December 2024', body: 'Work begins on the core platform — the data layer, service orchestration, and the Sefirah assistant.' },
          { tag: 'Governance', icon: 'bi-bank', title: 'Governance Framework Published', meta: 'November 2024', body: 'Decision-making protocols, resource allocation, and oversight mechanisms formalized.' },
          { tag: 'Milestone', icon: 'bi-diagram-3', title: 'Foundation Architecture Defined', meta: 'October 2024', body: 'The architectural blueprint for Project Sefirah — the company’s technical foundation — is set.' },
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
      eyebrow: '',
      title: 'Events & Presentation',
      description: 'Upcoming briefings, earnings-style updates, and downloadable investor presentations.',
    },
    blocks: [
      {
        type: 'cards',
        heading: 'Upcoming',
        columns: 2,
        items: [
          { tag: 'Briefing', icon: 'bi-calendar-event', title: 'Q2 Project Briefing', meta: 'Virtual · By invitation', body: 'Quarterly walk-through of Project Sefirah progress, key milestones, and forward priorities.', cta: 'Request Invite', href: '/contact' },
          { tag: 'Update', icon: 'bi-broadcast-pin', title: 'Annual Operating Review', meta: 'Virtual · By invitation', body: 'Year-in-review covering capital allocation, engineering progress, and the operating platform.', cta: 'Request Invite', href: '/contact' },
        ],
      },
      {
        type: 'cards',
        heading: 'Presentations',
        columns: 3,
        items: [
          { icon: 'bi-file-earmark-slides', title: 'Investor Deck', body: 'Current overview of the thesis, structure, and Project Sefirah.', cta: 'Download', href: '/documents/investor-deck.pdf' },
          { icon: 'bi-file-earmark-bar-graph', title: 'Project Snapshot', body: 'Stage and status of Project Sefirah.', cta: 'Download', href: '/documents/project-snapshot.pdf' },
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
      eyebrow: '',
      title: 'Financial Info',
      description: 'Financial highlights, capital-allocation summaries, and periodic reports for the investor community.',
    },
    blocks: [
      {
        type: 'stats',
        heading: 'At a Glance',
        items: [
          { value: 'Pre-Seed', label: 'Operating Stage', sub: 'Stealth phase' },
          { value: '1', label: 'Active Project', sub: 'Project Sefirah' },
          { value: 'Foundation', label: 'Current Focus', sub: 'Technical & infrastructural' },
          { value: 'Quarterly', label: 'Investor Cadence', sub: 'Disclosure rhythm' },
        ],
      },
      {
        type: 'text',
        heading: 'Capital Allocation',
        paragraphs: [
          'As a pre-seed, stealth-phase company, our financial disclosures reflect our current stage and long-term value-creation strategy. Capital is concentrated on Project Sefirah — the infrastructural and technical foundation on which everything we build will stand.',
          'Periodic financial updates and capital-allocation summaries are made available to accredited investors and stakeholders in accordance with applicable securities regulations.',
        ],
      },
      {
        type: 'cards',
        heading: 'Reports',
        columns: 3,
        items: [
          { icon: 'bi-file-earmark-text', title: 'Q4 2024 Project Update', meta: 'PDF', cta: 'Download', href: '/documents/q4-2024-project-update.pdf' },
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
      eyebrow: '',
      title: 'Governance',
      description: 'How Notus Regalia is governed — board structure, committees, and the principles that guide oversight.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Governance Framework',
        paragraphs: [
          'Our governance framework establishes clear lines of responsibility and oversight for Project Sefirah — ensuring institutional discipline while preserving the operational flexibility an early-stage build requires.',
          'It defines decision-making protocols, resource-allocation methodologies, milestone criteria, and risk-management practices applied consistently to the project.',
        ],
      },
      {
        type: 'people',
        heading: 'Advisory Board',
        items: [
          { name: 'Industry Veterans', role: 'Domain Guidance', bio: 'Deep expertise in systems engineering, critical infrastructure, and platform security.' },
          { name: 'Academic Researchers', role: 'Research & Validation', bio: 'External perspective on technical direction and architectural decisions.' },
          { name: 'Operational Experts', role: 'Execution Oversight', bio: 'Hands-on review of project progress and resource allocation.' },
        ],
      },
      {
        type: 'cards',
        heading: 'Committees & Charters',
        columns: 3,
        items: [
          { icon: 'bi-bank', title: 'Audit & Risk', body: 'Oversight of compliance, controls, and risk posture for the project.' },
          { icon: 'bi-people', title: 'Nomination', body: 'Advisory composition and founder–operator alignment.' },
          { icon: 'bi-cash-stack', title: 'Capital', body: 'Allocation discipline and milestone-based funding decisions.' },
        ],
      },
    ],
  },

  resources: {
    header: {
      eyebrow: '',
      title: 'Investor Resources',
      description: 'Financial disclosures, due-diligence materials, and the contacts you need as an investor.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Overview',
        paragraphs: [
          'Notus Regalia is committed to transparent, open communication with its investor community. This section provides access to financial disclosures, performance updates, and investor resources.',
          'As a pre-seed, stealth-phase company building a single project — Project Sefirah — our investor materials reflect our current stage of development and long-term value-creation strategy.',
        ],
      },
      {
        type: 'cards',
        heading: 'Secure Investor Portal',
        columns: 2,
        items: [
          { icon: 'bi-file-earmark-slides', title: 'Pitch Decks & Diligence', body: 'Pitch decks, due-diligence materials, and cap-table summaries for registered investors.' },
          { icon: 'bi-graph-up', title: 'Progress Reports', body: 'Project Sefirah progress reports and quarterly updates.' },
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
      eyebrow: '',
      title: 'Case Studies',
      description: 'Engineering deep-dives and design notes from the build of Project Sefirah.',
    },
    blocks: [
      {
        type: 'cards',
        heading: 'Selected Case Studies',
        columns: 2,
        items: [
          { tag: 'Architecture', icon: 'bi-diagram-3', title: 'Designing Sefirah’s Data Layer', meta: 'Project Sefirah', body: 'How the foundational data model and access patterns were chosen to stay consistent, auditable, and extensible.', cta: 'Read case study', href: '/documents/case-study-sefirah-data-layer.pdf' },
          { tag: 'Security', icon: 'bi-shield-lock', title: 'Access Control From First Principles', meta: 'Project Sefirah', body: 'Building role-based authorization and audit logging into the foundation rather than bolting them on later.', cta: 'Read case study', href: '/documents/case-study-sefirah-security.pdf' },
          { tag: 'Platform', icon: 'bi-cpu', title: 'Service Orchestration at the Core', meta: 'Project Sefirah', body: 'The orchestration layer that lets new capabilities plug into the platform without rework.', cta: 'Read case study', href: '/documents/case-study-sefirah-orchestration.pdf' },
          { tag: 'Product', icon: 'bi-chat-dots', title: 'Building the Sefirah Assistant', meta: 'Project Sefirah', body: 'Turning the platform into a conversational surface for search, navigation, and operations.', cta: 'Read case study', href: '/documents/case-study-sefirah-assistant.pdf' },
        ],
      },
    ],
  },

  'technical-reports': {
    header: {
      eyebrow: '',
      title: 'Technical Reports',
      description: 'In-depth technical reports, benchmarks, and methodology papers from our research programs.',
    },
    blocks: [
      {
        type: 'documents',
        items: [
          { title: 'Sefirah Platform Architecture', year: '2025', filename: 'tr-platform-architecture.pdf' },
          { title: 'Data Layer Design & Schema', year: '2025', filename: 'tr-data-layer.pdf' },
          { title: 'Service Orchestration Benchmark', year: '2025', filename: 'tr-orchestration.pdf' },
          { title: 'Access Control & Authorization Model', year: '2024', filename: 'tr-access-control.pdf' },
          { title: 'Assistant Evaluation Framework', year: '2025', filename: 'tr-assistant-evaluation.pdf' },
          { title: 'Data Pipeline Performance', year: '2025', filename: 'tr-data-pipeline.pdf' },
          { title: 'Security Threat Model', year: '2024', filename: 'tr-threat-model.pdf' },
          { title: 'Reliability & Uptime Study', year: '2025', filename: 'tr-reliability.pdf' },
        ],
      },
    ],
  },

  documentations: {
    header: {
      eyebrow: '',
      title: 'Documentations',
      description: 'Developer guides, API references, and integration documentation for our platform and tools.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Developer Resources',
        paragraphs: [
          'Project Sefirah exposes consistent APIs, SDKs, and data pipelines as the company’s technical foundation. The documentation below covers getting started, core concepts, and integration patterns.',
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
      eyebrow: '',
      title: 'Field Testing',
      description: 'Internal testing and validation of Project Sefirah as it is built toward production readiness.',
    },
    blocks: [
      {
        type: 'stats',
        heading: 'Validation Snapshot',
        items: [
          { value: '1', label: 'Project in Test', sub: 'Project Sefirah' },
          { value: 'Internal', label: 'Testing Stage', sub: 'Pre-deployment' },
          { value: 'Continuous', label: 'Integration', sub: 'CI on every change' },
          { value: 'Foundation', label: 'Focus', sub: 'Platform & data layer' },
        ],
      },
      {
        type: 'cards',
        heading: 'In Test',
        columns: 2,
        items: [
          { tag: 'Platform', icon: 'bi-cpu', title: 'Core Platform Validation', meta: 'Ongoing', body: 'Correctness and reliability testing across Sefirah’s service orchestration layer.' },
          { tag: 'Data', icon: 'bi-database-check', title: 'Data Layer Integrity', meta: 'Ongoing', body: 'Consistency, migration, and audit-trail testing of the foundational data model.' },
          { tag: 'Security', icon: 'bi-shield-lock', title: 'Access Control Hardening', meta: 'Ongoing', body: 'Authorization and audit-logging tests against the platform threat model.' },
          { tag: 'Product', icon: 'bi-chat-dots', title: 'Assistant Evaluation', meta: 'Ongoing', body: 'Quality and reliability testing of the Sefirah assistant’s search and navigation.' },
        ],
      },
      {
        type: 'note',
        text: 'Validation results are published as case studies and technical reports once they are confirmed.',
      },
    ],
  },

  'open-source': {
    header: {
      eyebrow: '',
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
          { icon: 'bi-github', title: 'sefirah-sdk', tag: 'TypeScript', body: 'Client SDK for the Project Sefirah platform APIs.', cta: 'View on GitHub', href: 'https://github.com' },
          { icon: 'bi-github', title: 'sefirah-data-pipelines', tag: 'Python', body: 'Reusable data-pipeline components and connectors.', cta: 'View on GitHub', href: 'https://github.com' },
          { icon: 'bi-github', title: 'nr-ui-kit', tag: 'React', body: 'Shared design-system components.', cta: 'View on GitHub', href: 'https://github.com' },
          { icon: 'bi-github', title: 'sefirah-cli', tag: 'Go', body: 'Command-line tooling for working with the Sefirah platform.', cta: 'View on GitHub', href: 'https://github.com' },
          { icon: 'bi-github', title: 'nr-security-baseline', tag: 'Config', body: 'Hardening baselines and security policies.', cta: 'View on GitHub', href: 'https://github.com' },
          { icon: 'bi-git', title: 'Contribution Guide', body: 'How to contribute, report issues, and propose changes.', cta: 'Read guide', href: '/documents/open-source-contributing.pdf' },
        ],
      },
    ],
  },

  // ══ LEGALS ════════════════════════════════════════════════
  licenses: {
    header: {
      eyebrow: '',
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
      eyebrow: '',
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
      eyebrow: '',
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
          'You can make or change your choices through the cookie banner shown on your first visit, at any time in the Settings panel of the Sefirah assistant, and through your browser settings. Declining non-essential technologies does not affect your ability to use the site.',
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
      eyebrow: '',
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
          'You can change or withdraw your choice at any time — with effect for the future — through the Settings panel of the Sefirah assistant, which also documents what each toggle controls. Withdrawal is as easy as the original consent, as the law requires.',
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
      eyebrow: '',
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
          'We grant you a limited, revocable, non-exclusive, non-transferable license to access and view the Services for your internal, non-commercial use. Except as expressly permitted — for instance, brand assets downloaded from [Media Assets](/information/documents/media-assets) and used in accordance with our [Brand Guidelines](/information/documents/brand-guidelines) — you may not reproduce, modify, distribute, publicly display, or create derivative works from our content without prior written permission. All rights not expressly granted are reserved.',
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
      eyebrow: '',
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
      eyebrow: '',
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
      eyebrow: '',
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
          { icon: 'bi-bank2', title: 'Anti-Money Laundering', body: 'KYC/AML framework for regulated operations.' },
          { icon: 'bi-diagram-2', title: 'Third-Party Vendor', body: 'Diligence and standards for vendors.' },
        ],
      },
    ],
  },

  // ══ DOCUMENTS ═════════════════════════════════════════════
  'brand-guidelines': {
    header: {
      eyebrow: 'Brand',
      title: 'Logo & Brand Usage',
      description: 'The Notus Regalia logo, color, and identity — and the rules for using them correctly across media, partnerships, and publications.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Our Brand',
        paragraphs: [
          'The Notus Regalia name, logo, and marks are protected assets. Use only the approved, unmodified artwork below — every file is a transparent PNG, so it drops cleanly onto any layout.',
          'Pick the lockup that fits your space, and the ink color that contrasts with your background: black-ink art for light surfaces, white-ink art for dark surfaces. Never recolor, redraw, or otherwise alter the marks.',
        ],
      },
      {
        type: 'logoPairs',
        heading: 'Logo Lockups',
        items: [
          {
            title: 'Horizontal · with tagline',
            caption: 'The full primary lockup — symbol, wordmark, and tagline. Use it wherever space allows.',
            light: '/Notus Regalia Brand Logo/Horizontal, Title, Tagline, Black Text.png',
            dark: '/Notus Regalia Brand Logo/Horizontal, Title, Tagline, White Text.png',
            layout: 'stack',
            wide: true,
          },
          {
            title: 'Horizontal',
            caption: 'Compact horizontal lockup without the tagline.',
            light: '/Notus Regalia Brand Logo/Horizontal, Title, Black Text.png',
            dark: '/Notus Regalia Brand Logo/Horizontal, Title, White Text.png',
            layout: 'stack',
            wide: true,
          },
          {
            title: 'Vertical · with tagline',
            caption: 'Stacked lockup for square and centered layouts.',
            light: '/Notus Regalia Brand Logo/Vertical, Title, Tagline, Black Text.png',
            dark: '/Notus Regalia Brand Logo/Vertical, Title, Tagline, White Text.png',
            layout: 'side',
          },
          {
            title: 'Vertical',
            caption: 'Compact stacked lockup without the tagline.',
            light: '/Notus Regalia Brand Logo/Vertical, Title, Black Text.png',
            dark: '/Notus Regalia Brand Logo/Vertical, Title, White Text.png',
            layout: 'side',
          },
          {
            title: 'Monogram',
            caption: 'The “NR” wordmark for tight, text-only contexts where the full lockup won’t fit.',
            light: '/Notus Regalia Brand Logo/NR text, black text.png',
            dark: '/Notus Regalia Brand Logo/NR text, white text.png',
            layout: 'side',
          },
          {
            title: 'Symbol',
            caption: 'The standalone mark for avatars, app icons, and favicons. One mark — no themed variants.',
            light: '/Notus Regalia Brand Logo/Square Icon.png',
          },
        ],
      },
      {
        type: 'clearspace',
        heading: 'Clear Space & Minimum Size',
        src: '/Notus Regalia Brand Logo/Square Icon.png',
        note: 'Always preserve clear space around the logo equal to at least the width of the central core (X). Never crowd the mark with text, imagery, or other logos. Do not reproduce the symbol smaller than 24 px or the full lockup smaller than 120 px wide.',
      },
      {
        type: 'palette',
        heading: 'Color',
        items: [
          { name: 'Regalia Crimson', hex: '#EB1143', usage: 'Primary brand color. The core, accents, and the “REGALIA” wordmark.', ink: 'light' },
          { name: 'Core Black', hex: '#0A0A0A', usage: 'Primary ink on light surfaces and dark-mode backgrounds.', ink: 'light' },
          { name: 'Pure White', hex: '#FFFFFF', usage: 'Logo ink and type on dark surfaces.', ink: 'dark' },
          { name: 'Operations Grey', hex: '#6B7280', usage: 'Supporting tone for the tagline and secondary text.', ink: 'light' },
        ],
      },
      {
        type: 'text',
        heading: 'Typography',
        paragraphs: [
          'The wordmark is a fixed piece of artwork — never re-typeset “NOTUS REGALIA” in another font, and never alter its letterspacing, weight, or color split.',
          'For surrounding communications, headlines, and body copy, use Inter (or the closest available system sans-serif). Set the tagline “AT THE CORE OF CRITICAL OPERATIONS” in uppercase with wide tracking, in Operations Grey, exactly as it appears in the supplied lockups.',
        ],
      },
      {
        type: 'misuse',
        heading: 'Logo Misuse',
        base: '/Notus Regalia Brand Logo/Square Icon.png',
        items: [
          { variant: 'stretch', label: 'Don’t stretch or distort the proportions.' },
          { variant: 'squish', label: 'Don’t compress or condense the mark.' },
          { variant: 'rotate', label: 'Don’t rotate or tilt the logo.' },
          { variant: 'recolor', label: 'Don’t recolor the mark or its core.' },
          { variant: 'effects', label: 'Don’t add shadows, glows, or other effects.' },
          { variant: 'busy', label: 'Don’t place the logo on busy or low-contrast backgrounds.' },
        ],
      },
      {
        type: 'cards',
        heading: 'Get the Assets',
        columns: 2,
        items: [
          { icon: 'bi-images', title: 'Media Assets Library', body: 'Logos, the press kit, executive photography, and approved company facts.', cta: 'Open Media Assets', href: '/information/documents/media-assets' },
          { icon: 'bi-envelope', title: 'Brand Permissions', body: 'Co-branding, partnership lockups, or anything not covered here.', cta: 'Email info@notusregalia.tech', href: 'mailto:info@notusregalia.tech' },
        ],
      },
      {
        type: 'note',
        text: 'These marks are provided for editorial and approved partnership use only. Do not imply endorsement or affiliation. Questions about brand usage or permissions? Contact info@notusregalia.tech.',
      },
    ],
  },

  'docs-governance': {
    header: {
      eyebrow: '',
      title: 'Governance Documents',
      description: 'Formation records, charters, and the governing documents of Notus Regalia.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Corporate Governance',
        paragraphs: [
          'These documents establish how Notus Regalia is formed, governed, and held accountable — from our founding charters to the policies that guide day-to-day conduct across the company.',
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
      eyebrow: '',
      title: 'Social',
      description: 'Our commitments to people, communities, and responsible operations.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Social Responsibility',
        paragraphs: [
          'Project Sefirah is built as the technical and infrastructural foundation for systems that operate in high-stakes, sensitive contexts. We treat responsible engineering — fair access, data protection, and human oversight — as a requirement of the foundation itself, not an afterthought.',
          'We hold ourselves to clear standards on data protection, fair access, and the responsible deployment of technology.',
        ],
      },
      {
        type: 'documents',
        items: [
          { title: 'Code of Conduct', year: '2024', filename: 'code-of-conduct.pdf', description: 'Ethical standards expected across the organization.' },
          { title: 'Human Rights Statement', year: '2025', filename: 'human-rights-statement.pdf', description: 'Our commitment to dignity and fair treatment.' },
          { title: 'Diversity & Inclusion Policy', year: '2025', filename: 'diversity-inclusion.pdf', description: 'Building an equitable, inclusive team.' },
          { title: 'Community Impact Summary', year: '2025', filename: 'community-impact.pdf', description: 'How our work is intended to serve the communities it reaches.' },
          { title: 'Supplier Standards', year: '2025', filename: 'supplier-standards.pdf', description: 'Responsible sourcing and partner expectations.' },
          { title: 'Data Protection Commitment', year: '2025', filename: 'data-protection.pdf', description: 'Safeguards for user privacy and sensitive data.' },
        ],
      },
    ],
  },

  'docs-environmental': {
    header: {
      eyebrow: '',
      title: 'Environmental',
      description: 'Environmental commitments and the sustainability principles behind how we build and operate.',
    },
    blocks: [
      {
        type: 'text',
        heading: 'Sustainability',
        paragraphs: [
          'As an early-stage company building a single project — Project Sefirah — our environmental footprint is concentrated in the infrastructure we run. We design the platform for efficient, responsible use of compute and energy from the start.',
          'We will report on environmental impact in greater depth as Project Sefirah matures and our operations grow.',
        ],
      },
      {
        type: 'documents',
        items: [
          { title: 'Environmental Policy', year: '2025', filename: 'environmental-policy.pdf', description: 'Our principles for responsible operations.' },
          { title: 'Infrastructure Efficiency Notes', year: '2025', filename: 'infrastructure-efficiency.pdf', description: 'How we keep Sefirah’s compute and energy use efficient.' },
          { title: 'Sustainability Summary', year: '2025', filename: 'sustainability-summary.pdf', description: 'Our environmental commitments at a glance.' },
        ],
      },
    ],
  },

  'media-assets': {
    header: {
      eyebrow: '',
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

};

// Generate a read-more article page for every publication. Each reuses the
// standard header + block renderer; the eyebrow carries the category, date, and
// read time, and the navbar shows the "Releases › <title>" breadcrumb.
for (const article of PUBLICATIONS) {
  SUBTAB_CONTENT[pubSubpageId(article.slug)] = {
    header: {
      eyebrow: [article.date, article.readTime].filter(Boolean).join('  ·  '),
      title: article.title,
      description: article.excerpt,
    },
    justify: true,
    staticHeader: true,
    blocks: article.body,
  };
}
