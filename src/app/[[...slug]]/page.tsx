import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientWrapper from "@/components/ui/ClientWrapper";
import SeoFallback, { type SeoLink } from "@/components/seo/SeoFallback";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageGraph, type Crumb } from "@/components/seo/pageSchema";
import { isRootTab } from "@/utils/routes";
import { COMPANY_SUBTABS } from "@/data/company-nav";

const DEFAULT_DESCRIPTION =
  "Notus Regalia engineers operational systems and builds ventures across defense, government, healthcare, enterprise, and energy. Beyond Fate.";

// Tab-level metadata (when a tab is visited without a subtab).
const TAB_META: Record<string, { title: string; description: string }> = {
  company: {
    title: "Company",
    description: "Notus Regalia's mission, industries, leadership, ventures, and governance.",
  },
  technologies: {
    title: "Technologies",
    description: "The systems we engineer across government, defense, healthcare, enterprise, and energy.",
  },
  affiliations: {
    title: "Affiliations",
    description: "The partners, subsidiaries, and organizations aligned with Notus Regalia.",
  },
};

// Technologies subtab metadata (no central data file for these yet).
const TECH_SUBTABS: Record<string, { title: string; description: string }> = {
  "civic-operations": {
    title: "Government & Civic Operations",
    description: "Technology for public institutions — secure, accountable systems that modernize civic and government operations.",
  },
  defense: {
    title: "Defense Technology",
    description: "Mission-grade defense systems engineered for resilience, security, and operational advantage.",
  },
  healthcare: {
    title: "Healthcare Technology",
    description: "Healthcare systems that connect care delivery, data, and infrastructure into one operational backbone.",
  },
  enterprise: {
    title: "Enterprise Technology",
    description: "Enterprise platforms and shared infrastructure that scale across the ventures we build and back.",
  },
  energy: {
    title: "Energy Systems",
    description: "Energy systems and monitoring — from grid intelligence to industrial carbon capture at pilot scale.",
  },
};

const clamp = (s: string, n = 160) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

// Crawlable site index emitted in the initial HTML of every root route, so the
// internal link graph is discoverable without running the client SPA.
const ROOT_SEO_LINKS: SeoLink[] = [
  { href: "/", label: "Home" },
  ...COMPANY_SUBTABS.filter((s) => !s.external).map((s) => ({
    href: `/company/${s.id.replace(/^company-/, "")}`,
    label: s.label,
  })),
  ...Object.entries(TECH_SUBTABS).map(([slug, v]) => ({
    href: `/technologies/${slug}`,
    label: v.title,
  })),
  { href: "/affiliations", label: "Affiliations" },
  { href: "/defense", label: "Defense Systems" },
  { href: "/information", label: "Information Central" },
  { href: "/status", label: "System Status" },
  { href: "/sitemap", label: "Sitemap" },
  { href: "/contact", label: "Contact" },
];

// Resolve a slug to its title/description/canonical. Shared by generateMetadata
// (head tags) and the page component (server-rendered <h1> + intro).
function resolveRouteMeta(slug?: string[]): {
  title: string;
  description: string;
  canonical: string;
  home: boolean;
} {
  const tab = slug?.[0];
  const sub = slug?.[1];

  if (!tab) {
    return {
      title: "Notus Regalia: At the Core of Critical Operations",
      description: DEFAULT_DESCRIPTION,
      canonical: "/",
      home: true,
    };
  }

  let title = TAB_META[tab]?.title ?? "Notus Regalia";
  let description = TAB_META[tab]?.description ?? DEFAULT_DESCRIPTION;
  let canonical = `/${tab}`;

  if (tab === "company" && sub) {
    const st = COMPANY_SUBTABS.find((s) => s.id === `company-${sub}` && !s.external);
    if (st?.hero) {
      title = st.hero.title;
      description = st.hero.subtitle;
    } else if (st) {
      title = st.label;
    }
    canonical = `/company/${sub}`;
  } else if (tab === "technologies" && sub && TECH_SUBTABS[sub]) {
    ({ title, description } = TECH_SUBTABS[sub]);
    canonical = `/technologies/${sub}`;
  }

  return { title, description, canonical, home: false };
}

// Breadcrumb trail (Home › Tab › Page) for BreadcrumbList structured data.
function rootCrumbs(slug: string[] | undefined, resolvedTitle: string): Crumb[] {
  const tab = slug?.[0];
  const sub = slug?.[1];
  const crumbs: Crumb[] = [{ name: "Home", path: "/" }];
  if (!tab) return crumbs;
  crumbs.push({ name: TAB_META[tab]?.title ?? tab, path: `/${tab}` });
  if (sub) crumbs.push({ name: resolvedTitle, path: `/${tab}/${sub}` });
  return crumbs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { title, description, canonical, home } = resolveRouteMeta(slug);
  const desc = clamp(description);

  return {
    title: home ? { absolute: title } : title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "Notus Regalia",
      title: home ? title : `${title} | Notus Regalia`,
      description: desc,
      url: canonical,
      // Defining openGraph here overrides the opengraph-image.tsx file
      // convention, which would otherwise drop og:image. Re-attach it
      // explicitly so every social platform (Messenger, Instagram, Telegram,
      // WhatsApp, Facebook, LinkedIn, Discord, Slack) renders the share card.
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Notus Regalia — Beyond Fate.",
        },
      ],
    },
  };
}

// Optional catch-all so clean paths like /company/sectors and /technologies/defense
// all resolve server-side to the single-page app. "/" matches with no slug.
// Literal sibling routes (/contact, /information, /sitemap, ...) take precedence.
export default async function RootCatchAll({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const tab = slug?.[0];
  // Home ("/") has no slug; otherwise the first segment must be a known tab.
  if (tab && (!isRootTab(tab) || tab === "home")) {
    notFound();
  }

  const { title, description, canonical } = resolveRouteMeta(slug);
  const graph = buildPageGraph({
    title,
    description,
    canonical,
    crumbs: rootCrumbs(slug, title),
  });

  return (
    <main className="min-h-screen" style={{ background: 'var(--surface-primary)', color: 'var(--content-primary)' }}>
      <JsonLd data={graph} />
      <SeoFallback title={title} description={description} links={ROOT_SEO_LINKS} />
      <ClientWrapper />
    </main>
  );
}
