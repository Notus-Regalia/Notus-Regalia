// Shared site search index + scoring. Consumed by the SearchModal (⌘K) and the
// Seraph assistant panel so both stay in sync.

export interface SectionItem {
  label: string;
  tabId: string;
  subtabId?: string;
  infoContent?: string;
  external?: string;   // opens the Information Central site in a new tab
  icon: string;
  aka?: string;
  keywords: string[];
}

/* ── Comprehensive searchable sections with keyword mappings ── */
export const ALL_SECTIONS: SectionItem[] = [
  // Landing
  { label: 'Home',              tabId: 'home',                                                                  icon: 'bi-house',           aka: 'Landing, Main Page',                          keywords: ['home', 'landing', 'main', 'start', 'welcome', 'hero', 'portfolio', 'convergence'] },

  // Company
  { label: 'Overview',          tabId: 'company',    subtabId: 'company-overview',                            icon: 'bi-grid',            aka: 'Summary, Dashboard',                          keywords: ['overview', 'summary', 'dashboard', 'about', 'company', 'grids'] },
  { label: 'About the Company', tabId: 'company',    subtabId: 'company-about',                               icon: 'bi-building',        aka: 'About Us, Company Profile',                   keywords: ['company', 'about us', 'about the company', 'profile', 'mission', 'vision', 'who we are', 'notus', 'regalia', 'corporation', 'entity', 'holding', 'firm'] },
  { label: 'Executives',  tabId: 'company',    subtabId: 'company-executives',                     icon: 'bi-people',          aka: 'Teams, Leadership, Founders',                 keywords: ['executives', 'exec', 'execs', 'organization', 'org', 'org chart', 'team', 'teams', 'leadership', 'founders', 'ceo', 'cto', 'cfo', 'coo', 'management', 'people', 'staff', 'directors', 'board', 'officers', 'personnel'] },
  { label: 'Strategic Capital', tabId: 'company',    subtabId: 'company-strategiccapital',                    icon: 'bi-graph-up-arrow',  aka: 'Investments, Seed, Investors',                keywords: ['capital', 'strategic', 'investments', 'investors', 'seed', 'funding', 'finance', 'venture capital', 'vc', 'fundraise', 'round', 'valuation'] },

  // Information Central (external site)
  { label: 'Announcements',     tabId: 'information', external: '/information/newsroom/announcements', icon: 'bi-bell',           aka: 'Statements, Notices',                         keywords: ['announcements', 'statements', 'notices', 'press', 'notice', 'disclosure', 'public'] },
  { label: 'Releases',          tabId: 'information', external: '/information/newsroom/releases',     icon: 'bi-journal-richtext', aka: 'Publications, Research, Editorial',           keywords: ['releases', 'publications', 'research', 'editorial', 'essays', 'whitepaper', 'blog', 'articles'] },
  { label: 'Media',             tabId: 'information', external: '/information/newsroom/media',        icon: 'bi-images',          aka: 'News, Coverage, Press',                       keywords: ['news', 'media', 'coverage', 'press', 'articles', 'updates'] },
  { label: 'Careers',           tabId: 'information', external: '/information/newsroom/careers',      icon: 'bi-briefcase',       aka: 'Jobs, Hiring, Open Roles',                    keywords: ['careers', 'jobs', 'hiring', 'roles', 'work', 'employment', 'apply', 'recruiting'] },
  { label: 'Licenses',          tabId: 'information', external: '/information/legals/licenses',       icon: 'bi-patch-check',     aka: 'Software Licensing, Open Source',              keywords: ['licenses', 'licensing', 'open source', 'software', 'mit', 'apache', 'gpl'] },
  { label: 'Terms of Service',  tabId: 'information', external: '/information/legals/terms',          icon: 'bi-unlock2',         aka: 'Terms, TOS, Agreement',                       keywords: ['terms', 'conditions', 'tos', 'terms of service', 'agreement', 'usage', 'rules'] },
  { label: 'Privacy Policy',    tabId: 'information', external: '/information/legals/privacy',        icon: 'bi-shield-check',    aka: 'Privacy, Cookie, Data',                       keywords: ['privacy', 'policy', 'cookie', 'cookies', 'data', 'gdpr', 'data protection', 'consent', 'tracking', 'analytics'] },
  { label: 'Corporate Policies',tabId: 'information', external: '/information/legals/policies',       icon: 'bi-journal-check',   aka: 'Acceptable Use, Conduct',                     keywords: ['policies', 'policy', 'acceptable use', 'conduct', 'code of conduct', 'whistleblower', 'compliance'] },
  { label: 'Documents',         tabId: 'information', external: '/information/documents/docs-governance', icon: 'bi-folder',       aka: 'Legal Documents, Filings',                    keywords: ['documents', 'filings', 'legal', 'paperwork', 'files', 'official', 'governance', 'environmental', 'social'] },
  { label: 'Investor Relations',tabId: 'information', external: '/information/investors/resources',   icon: 'bi-graph-up-arrow',  aka: 'Financial, Reports, Shareholders',            keywords: ['investor', 'investors', 'relations', 'financial', 'shareholders', 'equity', 'stock', 'dividends', 'ir', 'quarterly', 'annual report', 'events', 'governance'] },

  // Ventures
  { label: 'Startups',            tabId: 'ventures',     subtabId: 'ventures-startups',                            icon: 'bi-rocket-takeoff',  aka: 'Ventures, Incubator, Early Stage',            keywords: ['ventures', 'startups', 'incubator', 'seed', 'early stage', 'emerging'] },
  { label: 'Subsidiaries',        tabId: 'ventures',     subtabId: 'ventures-subsidiaries',                        icon: 'bi-diagram-3',       aka: 'Ventures, Wholly Owned',                      keywords: ['ventures', 'subsidiaries', 'subsidiary', 'owned', 'operating companies'] },
  { label: 'Portfolio Companies', tabId: 'ventures',     subtabId: 'ventures-portfolio',                           icon: 'bi-briefcase',       aka: 'Ventures, Strategic Stakes',                  keywords: ['ventures', 'portfolio', 'portfolio company', 'portfolio companies', 'stakes', 'partners'] },

  // Technologies
  { label: 'Defense',           tabId: 'technologies', subtabId: 'defense',                                      icon: 'bi-shield',          aka: 'Military, Security, Intelligence',            keywords: ['defense', 'defence', 'military', 'security', 'intelligence', 'warfare', 'weapons', 'tactical', 'army', 'navy'] },
  { label: 'Healthcare',        tabId: 'technologies', subtabId: 'healthcare',                                   icon: 'bi-heart-pulse',     aka: 'Medical, Biotech, Health',                    keywords: ['healthcare', 'health', 'medical', 'biotech', 'pharma', 'hospital', 'clinical', 'patient', 'wellness'] },
  { label: 'Civic Operations',  tabId: 'technologies', subtabId: 'civic-operations',                             icon: 'bi-buildings',       aka: 'Government, Infrastructure, Public',          keywords: ['civic', 'operations', 'government', 'infrastructure', 'public', 'urban', 'city', 'municipal', 'community'] },
];

export const TRENDING: SectionItem[] = ALL_SECTIONS.filter(i =>
  ['The Company', 'Executives', 'Strategic Capital'].includes(i.label)
);

export const SUGGESTED: SectionItem[] = ALL_SECTIONS.filter(i =>
  ['Home', 'Overview', 'Releases', 'Technologies', 'Corporate Policies'].includes(i.label)
).map(i => {
  // For Technologies without a subtab, just point to the tab
  if (i.label === 'Technologies') return { ...i, subtabId: undefined };
  return i;
});
// Add a general Technologies entry
const TECHNOLOGIES_ENTRY: SectionItem = { label: 'Technologies', tabId: 'technologies', icon: 'bi-crosshair', aka: 'Portfolio Companies, Ventures', keywords: ['technologies', 'ventures', 'portfolio', 'tech'] };
if (!SUGGESTED.find(s => s.label === 'Technologies')) {
  SUGGESTED.push(TECHNOLOGIES_ENTRY);
}
// Also add an Information Central general entry (external site)
const INFO_ENTRY: SectionItem = { label: 'Information Central', tabId: 'information', external: '/information', icon: 'bi-box-arrow-up-right', aka: 'Newsroom, Investors, Legals, Documents', keywords: ['information', 'info', 'center', 'newsroom', 'investors', 'legals', 'documents'] };
SUGGESTED.push(INFO_ENTRY);

/* ── Search internals ───────────────────────────────────────────────────────
   Reliability + context-awareness goals:
   • Typo tolerance via bounded edit distance ("defence", "invester" still hit).
   • Per-token best-match scoring so items aren't inflated by keyword count.
   • Coverage weighting so multi-word queries favour items matching ALL words.
   • Stop-word / short-token filtering so natural-language queries work
     ("how do I apply for a job" → apply + job).
   ─────────────────────────────────────────────────────────────────────────── */

const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'for', 'to', 'in', 'on', 'at', 'and', 'or', 'is', 'are',
  'be', 'do', 'does', 'me', 'my', 'i', 'we', 'you', 'your', 'with', 'from', 'can',
  'show', 'find', 'go', 'goto', 'open', 'page', 'section', 'about', 'please',
  'want', 'need', 'where', 'what', 'whats', 'how', 'who', 'view', 'see', 'get',
]);

/** lowercase + strip accents so "défense" matches "defense". */
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/** Split into meaningful tokens; drop stop-words and single chars, but never
 *  return empty (fall back to raw words so a query is always attempted). */
function tokenize(query: string): string[] {
  const raw = normalize(query).split(/[^a-z0-9]+/).filter(Boolean);
  const cleaned = raw.filter(t => t.length >= 2 && !STOPWORDS.has(t));
  return cleaned.length ? cleaned : raw;
}

/** Bounded Levenshtein — returns max+1 as soon as the distance exceeds `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    let rowMin = prev[0];
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + cost);
      diag = tmp;
      if (prev[j] < rowMin) rowMin = prev[j];
    }
    if (rowMin > max) return max + 1;
  }
  return prev[b.length];
}

/** Typo-tolerant equality — only for tokens long enough that a fuzzy match is
 *  meaningful (avoids short tokens matching everything). */
function fuzzyEqual(token: string, word: string): boolean {
  if (token.length < 4) return false;
  const max = token.length > 6 ? 2 : 1;
  return editDistance(token, word, max) <= max;
}

/** Best score a single query token can earn against one item. */
function tokenScore(token: string, labelWords: string[], akaWords: string[], keywords: string[]): number {
  let best = 0;
  const long = token.length >= 3;

  for (const w of labelWords) {
    if (w === token) best = Math.max(best, 45);
    else if (w.startsWith(token)) best = Math.max(best, 30);
    else if (long && w.includes(token)) best = Math.max(best, 14);
    else if (fuzzyEqual(token, w)) best = Math.max(best, 26);
  }
  for (const w of akaWords) {
    if (w === token) best = Math.max(best, 28);
    else if (w.startsWith(token)) best = Math.max(best, 18);
    else if (fuzzyEqual(token, w)) best = Math.max(best, 14);
  }
  for (const kw of keywords) {
    if (kw === token) best = Math.max(best, 40);
    else if (kw.startsWith(token)) best = Math.max(best, 24);
    else if (kw.includes(' ')) {
      const parts = kw.split(/\s+/);
      if (parts.includes(token)) best = Math.max(best, 30);
      else if (long && kw.includes(token)) best = Math.max(best, 12);
    } else if (long && kw.includes(token)) best = Math.max(best, 12);
    else if (fuzzyEqual(token, kw)) best = Math.max(best, 22);
  }
  return best;
}

/* Keyword-based scoring search across ALL_SECTIONS (highest score first). */
export function searchSections(query: string, limit = 12): SectionItem[] {
  const q = normalize(query);
  if (!q) return [];
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const scored = ALL_SECTIONS
    .map(item => {
      const labelLower = normalize(item.label);
      const akaLower = normalize(item.aka || '');
      const labelWords = labelLower.split(/[^a-z0-9]+/).filter(Boolean);
      const akaWords = akaLower.split(/[^a-z0-9]+/).filter(Boolean);

      let score = 0;

      // Whole-query intent against the label (strongest signal).
      if (labelLower === q) score += 120;
      else if (labelLower.startsWith(q)) score += 60;
      else if (q.length >= 3 && labelLower.includes(q)) score += 35;
      if (q.length >= 3 && akaLower.includes(q)) score += 18;

      // Per-token best match — each query word contributes once, at its strongest.
      let matched = 0;
      for (const token of tokens) {
        const best = tokenScore(token, labelWords, akaWords, item.keywords);
        if (best > 0) { score += best; matched++; }
      }

      // Coverage — reward matching more of a multi-word query so the item that
      // hits every word outranks one that only catches a single word.
      if (tokens.length > 1) {
        score += (matched / tokens.length) * 35;
        if (matched === tokens.length) score += 25;
      }

      return { item, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return [];

  // Trim the weak long tail relative to the top hit, then cap the count.
  const threshold = scored[0].score * 0.18;
  return scored
    .filter(r => r.score >= threshold)
    .slice(0, limit)
    .map(r => r.item);
}
