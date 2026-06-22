/* ─────────────────────────────────────────────────────────────
   Centralized URL <-> state routing for the path-based navigation.

   The site root ("/") and the Information Central ("/information") are
   both client-side single-page apps: content is swapped in React state
   and the URL is kept in sync via history.pushState. These helpers are
   the single source of truth for translating between the in-app
   tab/subtab ids and the clean path URLs the address bar shows.

     Root SPA:     /company/executives     <-> tab=company,  subtab=company-executives
     Info Central:  /information/newsroom/releases <-> tab=newsroom, subtab=releases

   Root subtab ids carry a redundant "<tab>-" prefix (e.g. company-executives);
   it is stripped for the URL slug and re-added when parsing back.
   ───────────────────────────────────────────────────────────── */

// ── Root SPA ──────────────────────────────────────────────────
export const ROOT_TABS = ['home', 'company', 'affiliations', 'technologies', 'ventures'] as const;
export type RootTab = (typeof ROOT_TABS)[number];

export const DEFAULT_SUBTABS: Partial<Record<RootTab, string>> = {
  company: 'company-about',
  technologies: 'technologies-civic-operations',
  ventures: 'ventures-incubating',
};

export const isRootTab = (tab: string | null | undefined): tab is RootTab =>
  !!tab && (ROOT_TABS as readonly string[]).includes(tab);

/** subtab id -> url slug (strip the redundant "<tab>-" prefix) */
export const subtabToSlug = (tab: string, subtabId?: string | null): string | undefined => {
  if (!subtabId) return undefined;
  const prefix = `${tab}-`;
  return subtabId.startsWith(prefix) ? subtabId.slice(prefix.length) : subtabId;
};

/** url slug -> subtab id (re-add the "<tab>-" prefix) */
export const slugToSubtab = (tab: string, slug?: string | null): string | undefined => {
  if (!slug) return undefined;
  const prefix = `${tab}-`;
  return slug.startsWith(prefix) ? slug : `${prefix}${slug}`;
};

/** Build the clean root path for a tab/subtab. */
export const rootHref = (tab: string, subtabId?: string | null): string => {
  if (!tab || tab === 'home') return '/';
  const slug = subtabToSlug(tab, subtabId);
  return slug ? `/${tab}/${slug}` : `/${tab}`;
};

/** Parse a pathname into the root SPA's {tab, subtab}. */
export const parseRootPath = (pathname: string): { tab: RootTab; subtab?: string } => {
  const segs = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (segs.length === 0) return { tab: 'home' };
  const [tab, slug] = segs;
  if (!isRootTab(tab) || tab === 'home') return { tab: 'home' };
  return { tab, subtab: slug ? slugToSubtab(tab, slug) : DEFAULT_SUBTABS[tab] };
};

// ── Information Central ─────────────────────────────────────────
// Info subtab ids are already unique/clean, so they pass through as-is.
export const infoHref = (tab: string, subtab?: string | null): string =>
  subtab ? `/information/${tab}/${subtab}` : `/information/${tab}`;

/** Parse a pathname into the Info Central's {tab, subtab} (segments after /information). */
export const parseInfoPath = (pathname: string): { tab: string | null; subtab: string | null } => {
  const segs = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  // segs[0] === 'information'
  return { tab: segs[1] ?? null, subtab: segs[2] ?? null };
};
