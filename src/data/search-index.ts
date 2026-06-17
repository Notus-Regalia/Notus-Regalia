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
  { label: 'The Company',       tabId: 'company',    subtabId: 'company-thecompany',                          icon: 'bi-building',        aka: 'About Us, Company Profile',                   keywords: ['company', 'about us', 'profile', 'mission', 'vision', 'who we are', 'notus', 'regalia', 'corporation', 'entity', 'holding', 'firm'] },
  { label: 'Executives',  tabId: 'company',    subtabId: 'company-executives',                     icon: 'bi-people',          aka: 'Teams, Leadership, Founders',                 keywords: ['executives', 'organization', 'team', 'teams', 'leadership', 'founders', 'ceo', 'cto', 'cfo', 'coo', 'management', 'people', 'staff', 'directors', 'board', 'officers', 'personnel'] },
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

  // Technologies
  { label: 'Defense',           tabId: 'technologies', subtabId: 'defense',                                      icon: 'bi-shield',          aka: 'Military, Security, Intelligence',            keywords: ['defense', 'military', 'security', 'intelligence', 'warfare', 'weapons', 'tactical', 'army', 'navy'] },
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

/* Keyword-based scoring search across ALL_SECTIONS (highest score first). */
export function searchSections(query: string): SectionItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/);

  return ALL_SECTIONS
    .map(item => {
      let score = 0;
      const labelLower = item.label.toLowerCase();
      const akaLower = (item.aka || '').toLowerCase();

      if (labelLower === q) score += 100;
      else if (labelLower.startsWith(q)) score += 50;
      else if (labelLower.includes(q)) score += 30;
      if (akaLower.includes(q)) score += 20;

      for (const kw of item.keywords) {
        for (const token of tokens) {
          if (kw === token) score += 40;
          else if (kw.startsWith(token)) score += 25;
          else if (kw.includes(token)) score += 15;
        }
      }

      return { item, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.item);
}
