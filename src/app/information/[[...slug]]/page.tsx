// Optional catch-all so clean Info Central paths like
// /information/newsroom/releases resolve server-side. "/information"
// matches with no slug. The client resolves/validates the tab+subtab.
import type { Metadata } from "next";
import InformationCentral from "@/components/InformationCentral";
import SeoFallback, { type SeoLink } from "@/components/seo/SeoFallback";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageGraph, type Crumb } from "@/components/seo/pageSchema";
import { INFO_TABS, SUBTAB_CONTENT } from "@/components/InformationCentral/data";

const DEFAULT_DESCRIPTION =
  "Newsroom, investor information, research, legal policies, and documents from Notus Regalia.";

const clamp = (s: string, n = 160) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

// Crawlable index of every Information Central page, emitted server-side.
const INFO_SEO_LINKS: SeoLink[] = [
  { href: "/", label: "Home" },
  { href: "/information", label: "Information Central" },
  ...INFO_TABS.flatMap((t) =>
    (t.subtabs ?? [])
      .filter((s) => !s.external)
      .map((s) => ({
        href: `/information/${t.id}/${s.id}`,
        label: `${t.label}: ${s.label}`,
      })),
  ),
];

// Resolve a slug to title/description/canonical. Shared by generateMetadata and
// the server-rendered <h1> + intro.
function resolveInfoMeta(slug?: string[]): {
  title: string;
  description: string;
  canonical: string;
} {
  const tab = slug?.[0];
  const sub = slug?.[1];

  if (sub && SUBTAB_CONTENT[sub]) {
    const { header } = SUBTAB_CONTENT[sub];
    return {
      title: header.title,
      description: header.description || DEFAULT_DESCRIPTION,
      canonical: `/information/${tab}/${sub}`,
    };
  }
  if (tab) {
    const t = INFO_TABS.find((t) => t.id === tab);
    if (t) {
      return { title: t.label, description: DEFAULT_DESCRIPTION, canonical: `/information/${tab}` };
    }
  }
  return { title: "Information Central", description: DEFAULT_DESCRIPTION, canonical: "/information" };
}

// Breadcrumb trail (Home › Information Central › Section › Page).
function infoCrumbs(slug: string[] | undefined, resolvedTitle: string): Crumb[] {
  const tab = slug?.[0];
  const sub = slug?.[1];
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Information Central", path: "/information" },
  ];
  if (tab) {
    const t = INFO_TABS.find((t) => t.id === tab);
    crumbs.push({ name: t?.label ?? tab, path: `/information/${tab}` });
    if (sub) crumbs.push({ name: resolvedTitle, path: `/information/${tab}/${sub}` });
  }
  return crumbs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { title, description, canonical } = resolveInfoMeta(slug);
  const desc = clamp(description);

  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "Notus Regalia",
      title: `${title} | Notus Regalia`,
      description: desc,
      url: canonical,
      // Defining openGraph overrides the opengraph-image.tsx file convention,
      // which would otherwise drop og:image. Re-attach it so social platforms
      // (Messenger, Instagram, Telegram, WhatsApp, Facebook, LinkedIn, etc.)
      // render the share card.
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Notus Regalia — Beyond Fate." }],
    },
  };
}

export default async function InformationCatchAll({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const { title, description, canonical } = resolveInfoMeta(slug);
  const graph = buildPageGraph({
    title,
    description,
    canonical,
    crumbs: infoCrumbs(slug, title),
  });

  return (
    <>
      <JsonLd data={graph} />
      <SeoFallback title={title} description={description} links={INFO_SEO_LINKS} />
      <InformationCentral />
    </>
  );
}
