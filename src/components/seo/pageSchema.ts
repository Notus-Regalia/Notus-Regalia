import { SITE_URL } from "@/utils/site";

export interface Crumb {
  name: string;
  /** Absolute path, e.g. "/company/mission". Use "/" for Home. */
  path: string;
}

const abs = (path: string) => `${SITE_URL}${path === "/" ? "/" : path}`;

/**
 * Build a per-page JSON-LD `@graph` containing a `WebPage` node and (when the
 * trail has more than one level) a `BreadcrumbList`. Both link back to the
 * site-wide `WebSite` / `Organization` nodes declared in the root layout via
 * stable `@id`s, so Google reads them as one connected entity graph.
 *
 * BreadcrumbList is what earns the breadcrumb trail shown under a result's
 * title in Google Search.
 */
export function buildPageGraph({
  title,
  description,
  canonical,
  crumbs,
}: {
  title: string;
  description: string;
  canonical: string;
  crumbs: Crumb[];
}): object {
  const pageUrl = abs(canonical);
  const hasBreadcrumb = crumbs.length > 1;

  const graph: object[] = [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage: "en",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      ...(hasBreadcrumb ? { breadcrumb: { "@id": `${pageUrl}#breadcrumb` } } : {}),
    },
  ];

  if (hasBreadcrumb) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: abs(c.path),
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
