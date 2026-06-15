import Link from "next/link";

/**
 * Server-rendered, crawlable fallback for the JS-driven single-page apps.
 *
 * The root and Information Central routes mount a client SPA, so without this
 * the initial HTML for every URL is an empty shell — no unique <h1>, no real
 * <a href> links between pages. Crawlers and non-JS bots (many AI/social
 * fetchers) would see nothing route-specific.
 *
 * This emits, in the initial server HTML:
 *   • a unique <h1> + intro matching the page,
 *   • a real <a href> site index so the internal link graph is crawlable.
 *
 * It's visually hidden (not display:none, which crawlers ignore) but remains in
 * the accessibility tree — it doubles as a screen-reader site index.
 */

// Standard "visually hidden" technique — present for assistive tech + crawlers,
// removed from the visual layout (absolute + 1px, no layout impact).
const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

export interface SeoLink {
  href: string;
  label: string;
}

export default function SeoFallback({
  title,
  description,
  links,
}: {
  title: string;
  description: string;
  links: SeoLink[];
}) {
  return (
    <div style={srOnly}>
      <h1>{title}</h1>
      <p>{description}</p>
      <nav aria-label="Site index">
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
