"use client";

import { useState, useRef, useEffect } from "react";
import { NAVBAR_CSS } from "./navbar-styles";

/* ─────────────────────────────────────────────────────────────
   Standalone sitemap — per-website tabs (the exact website
   subtab-strip design, with a sliding indicator) + grouped,
   nested clickable links.
   ───────────────────────────────────────────────────────────── */

type Leaf = { label: string; href: string };
type Entry = Leaf & { children?: Leaf[] };
type Group = { title: string; links: Entry[]; cols?: number };
type Site = { id: string; label: string; sub?: string; groups: Group[] };

const SITES: Site[] = [
  {
    id: "main",
    label: "Notus Regalia",
    sub: "Main Website",
    groups: [
      {
        title: "Main Site",
        links: [
          { label: "Home",          href: "/" },
          { label: "Defense",       href: "/defense" },
          { label: "Contact",       href: "/contact" },
          { label: "System Status", href: "/status" },
        ],
      },
      {
        title: "Company",
        cols: 2,
        links: [
          { label: "Mission", href: "/?tab=company&subtab=company-mission", children: [
            { label: "Our Company",      href: "/?tab=company&subtab=company-mission" },
            { label: "What We Engineer", href: "/?tab=company&subtab=company-mission" },
            { label: "Roadmap",          href: "/?tab=company&subtab=company-mission" },
          ] },
          { label: "Industries", href: "/?tab=company&subtab=company-sectors", children: [
            { label: "Overview", href: "/?tab=company&subtab=company-sectors" },
            { label: "Sectors",  href: "/?tab=company&subtab=company-sectors" },
          ] },
          { label: "Executives", href: "/?tab=company&subtab=company-executives", children: [
            { label: "Overview",   href: "/?tab=company&subtab=company-executives" },
            { label: "Leadership", href: "/?tab=company&subtab=company-executives" },
          ] },
          { label: "Investors", href: "/?tab=company&subtab=company-investors", children: [
            { label: "Overview", href: "/?tab=company&subtab=company-investors" },
            { label: "Capital",  href: "/?tab=company&subtab=company-investors" },
          ] },
          { label: "Ventures", href: "/?tab=company&subtab=company-ventures", children: [
            { label: "Subsidiaries",        href: "/?tab=company&subtab=company-ventures" },
            { label: "Portfolio Companies", href: "/?tab=company&subtab=company-ventures" },
            { label: "Startups",            href: "/?tab=company&subtab=company-ventures" },
          ] },
          { label: "Human Rights", href: "/?tab=company&subtab=company-human-rights", children: [
            { label: "Principles",      href: "/?tab=company&subtab=company-human-rights" },
            { label: "Safeguards",      href: "/?tab=company&subtab=company-human-rights" },
            { label: "Report an Issue", href: "/?tab=company&subtab=company-human-rights" },
            { label: "Transparency",    href: "/?tab=company&subtab=company-human-rights" },
            { label: "Learn More",      href: "/?tab=company&subtab=company-human-rights" },
          ] },
        ],
      },
      {
        title: "Technologies",
        links: [
          { label: "Government",  href: "/?tab=technologies&subtab=technologies-civic-operations" },
          { label: "Defense",     href: "/?tab=technologies&subtab=technologies-defense" },
          { label: "Healthcare",  href: "/?tab=technologies&subtab=technologies-healthcare" },
          { label: "Enterprise",  href: "/?tab=technologies&subtab=technologies-enterprise" },
          { label: "Energy",      href: "/?tab=technologies&subtab=technologies-energy" },
        ],
      },
    ],
  },
  {
    id: "info",
    label: "Information Center",
    sub: "Resource Hub",
    groups: [
      {
        title: "Newsroom",
        links: [
          { label: "Releases",      href: "/information?tab=newsroom&subtab=releases" },
          { label: "Announcements", href: "/information?tab=newsroom&subtab=announcements" },
          { label: "Media",         href: "/information?tab=newsroom&subtab=media" },
          { label: "Careers",       href: "/information?tab=newsroom&subtab=careers" },
        ],
      },
      {
        title: "Investors",
        links: [
          { label: "News",                  href: "/information?tab=investors&subtab=news" },
          { label: "Events & Presentation", href: "/information?tab=investors&subtab=events" },
          { label: "Financial Info",        href: "/information?tab=investors&subtab=financials" },
          { label: "Governance",            href: "/information?tab=investors&subtab=governance" },
          { label: "Investor Resources",    href: "/information?tab=investors&subtab=resources" },
        ],
      },
      {
        title: "Research",
        links: [
          { label: "Case Studies",      href: "/information?tab=research&subtab=case-studies" },
          { label: "Technical Reports", href: "/information?tab=research&subtab=technical-reports" },
          { label: "Documentations",    href: "/information?tab=research&subtab=documentations" },
          { label: "Field Testing",     href: "/information?tab=research&subtab=field-testing" },
          { label: "Open Source",       href: "/information?tab=research&subtab=open-source" },
        ],
      },
      {
        title: "Legals",
        links: [
          { label: "Corporate Policies",     href: "/information?tab=legals&subtab=policies" },
          { label: "NR Human Rights Policy", href: "/information?tab=legals&subtab=human-rights" },
          { label: "Privacy Policy",         href: "/information?tab=legals&subtab=privacy" },
          { label: "Terms of Service",       href: "/information?tab=legals&subtab=terms" },
          { label: "Licenses",               href: "/information?tab=legals&subtab=licenses" },
          { label: "Brand Guidelines",       href: "/information?tab=legals&subtab=brand-guidelines" },
        ],
      },
      {
        title: "Documents",
        links: [
          { label: "Governance",    href: "/information?tab=documents&subtab=docs-governance" },
          { label: "Social",        href: "/information?tab=documents&subtab=docs-social" },
          { label: "Environmental", href: "/information?tab=documents&subtab=docs-environmental" },
          { label: "Media Assets",  href: "/information?tab=documents&subtab=media-assets" },
        ],
      },
      {
        title: "Settings",
        links: [
          { label: "Preferences", href: "/information?tab=settings&subtab=preferences" },
          { label: "Sitemap",     href: "/sitemap" },
          { label: "Status",      href: "/status" },
        ],
      },
    ],
  },
];

const SmLink = ({ href, label, sub }: { href: string; label: string; sub?: boolean }) => (
  <a
    href={href}
    className={`sm-link${sub ? " sm-link-sub" : ""}`}
  >
    {!sub && <i className="bi bi-chevron-right sm-link-chevron" />}
    {label}
  </a>
);

export default function SitemapView() {
  const [active, setActive] = useState(0);
  const site = SITES[active];

  // Sliding strip indicator — measures the active tab, exactly like the navbar.
  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const placedRef = useRef(false);
  const [ind, setInd] = useState<{ left: number; width: number } | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const btn = btnRefs.current[active];
    if (!btn) return;
    const place = () => {
      if (placedRef.current) setAnimate(true);
      setInd({ left: btn.offsetLeft, width: btn.offsetWidth });
      placedRef.current = true;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  const indStyle: React.CSSProperties = {
    left: ind?.left ?? 0,
    width: ind?.width ?? 0,
    opacity: ind ? 1 : 0,
    transition: animate
      ? "left 0.32s cubic-bezier(0.4,0,0.2,1), width 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease"
      : "none",
  };

  return (
    <div className="sm-root">
      {/* The website's exact subtab strip (same classes + CSS as the navbar) */}
      <style>{NAVBAR_CSS}</style>

      <div className="subtab-strip-outer strip-visible" style={{ marginBottom: "2.75rem" }}>
        <div className="subtab-strip-clip">
          <div className="subtab-strip-inner">
            <div className="strip-tabs-track" ref={trackRef} role="tablist" aria-label="Websites">
              <div className="strip-indicator" style={indStyle} aria-hidden>
                <div className="strip-indicator-bg" />
                <div className="strip-indicator-corner tl" />
                <div className="strip-indicator-corner tr" />
                <div className="strip-indicator-corner bl" />
                <div className="strip-indicator-corner br" />
              </div>
              {SITES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  ref={(el) => { btnRefs.current[i] = el; }}
                  onClick={() => setActive(i)}
                  className={`strip-tab${i === active ? " strip-tab-active" : ""}`}
                >
                  <span className="sm-tab-stack">
                    <span className="sm-tab-label">{s.label}</span>
                    {s.sub && <span className="sm-tab-sub">{s.sub}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active website's groups */}
      <div className="sm-groups" key={site.id}>
        {site.groups.map((group) => (
          <nav
            key={group.title}
            aria-label={group.title}
            style={group.cols === 2 ? { gridColumn: "span 2" } : undefined}
          >
            <h3 className="sm-group-title">{group.title}</h3>
            <ul className={`sm-list${group.cols === 2 ? " sm-list-2col" : ""}`}>
              {group.links.map((link) => (
                <li key={link.label}>
                  <SmLink href={link.href} label={link.label} />
                  {link.children && (
                    <ul className="sm-sublist">
                      {link.children.map((child) => (
                        <li key={child.label}>
                          <SmLink href={child.href} label={child.label} sub />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <style>{`
        .sm-root { position: relative; }

        /* Frame the strip fully — on the live site the navbar closes the box;
           standalone it needs its own complete (square) border grid. */
        .sm-root .subtab-strip-outer.strip-visible {
          border: 1px solid var(--border-color);
          border-radius: 0;
        }
        .sm-root .subtab-strip-clip { border-radius: 0; }
        /* Tabs fill the strip as equal grid cells (min-width keeps them scrollable
           once there are too many to fit). */
        .sm-root .strip-tab { flex: 1 1 0; min-width: 150px; }
        .sm-root .strip-tab:last-child { border-right: none; }

        /* Two-line tab: name + subtitle */
        .sm-tab-stack { display: inline-flex; flex-direction: column; align-items: center; gap: 2px; line-height: 1.15; }
        .sm-tab-label { font-size: 0.92rem; }
        .sm-tab-sub {
          font-size: 0.6rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--content-faint, rgba(160,160,170,.55));
        }

        /* ── Groups ── */
        .sm-groups {
          display: grid; gap: 2rem 2rem;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr));
          align-items: start;
          animation: smContentIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes smContentIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sm-groups { animation: none; }
        }
        .sm-group-title {
          font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .18em;
          color: var(--content-muted); margin: 0 0 1rem; padding-bottom: .5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .sm-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
        .sm-list-2col {
          display: grid; flex-direction: initial;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem 2rem;
        }
        .sm-sublist {
          list-style: none; margin: .55rem 0 0 .3rem; padding-left: .85rem;
          border-left: 1px solid var(--border-color);
          display: flex; flex-direction: column; gap: .55rem;
        }
        .sm-link {
          display: inline-flex; align-items: center; gap: .4rem;
          font-size: .9rem; font-weight: 500; color: var(--content-secondary);
          text-decoration: none; transition: color .15s ease;
        }
        .sm-link:hover { color: var(--content-primary); }
        .sm-link-chevron { font-size: .6rem; color: #E31B54; }
        .sm-link-sub { font-size: .82rem; font-weight: 400; color: var(--content-muted); }
        .sm-link-sub:hover { color: var(--content-primary); }

        @media (max-width: 640px) {
          .sm-groups nav[style] { grid-column: auto !important; }
          .sm-list-2col { grid-template-columns: minmax(0, 1fr); }
        }
      `}</style>
    </div>
  );
}
