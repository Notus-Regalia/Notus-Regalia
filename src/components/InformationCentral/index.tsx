"use client";
import { useState, useEffect, useCallback } from 'react';
import InfoNavbar from './InfoNavbar';
import SubtabView from './SubtabView';
import InfoLoadingScreen from './InfoLoadingScreen';
import CookieBanner from '@/components/ui/CookieBanner';
import SmoothScroller from '@/components/ui/SmoothScroller';
import Footer, { type FooterSection } from '@/components/ui/Footer';
import SefirahAssistant from '@/components/ui/SefirahAssistant';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { INFO_TABS, DEFAULT_SUBTAB, SUBTAB_PARENT } from './data';
import { infoHref, parseInfoPath } from '@/utils/routes';

// Dedicated Information Central footer columns. Own sections navigate in-app
// (via onNavigate); the Company group redirects back to the main site section.
const INFO_FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Newsroom',
    links: [
      { label: 'Releases',      tabId: 'newsroom', subtabId: 'releases' },
      { label: 'Announcements', tabId: 'newsroom', subtabId: 'announcements' },
      { label: 'Media',         tabId: 'newsroom', subtabId: 'media' },
      { label: 'Careers',       tabId: 'newsroom', subtabId: 'careers' },
    ],
  },
  {
    title: 'Investors',
    links: [
      { label: 'News',                    tabId: 'investors', subtabId: 'news' },
      { label: 'Events & Presentation',   tabId: 'investors', subtabId: 'events' },
      { label: 'Financial Info',          tabId: 'investors', subtabId: 'financials' },
      { label: 'Governance',              tabId: 'investors', subtabId: 'governance' },
      { label: 'Investor Resources',      tabId: 'investors', subtabId: 'resources' },
    ],
  },
  {
    title: 'Research',
    links: [
      { label: 'Case Studies',      tabId: 'research', subtabId: 'case-studies' },
      { label: 'Technical Reports', tabId: 'research', subtabId: 'technical-reports' },
      { label: 'Documentations',    tabId: 'research', subtabId: 'documentations' },
      { label: 'Field Testing',     tabId: 'research', subtabId: 'field-testing' },
      { label: 'Open Source',       tabId: 'research', subtabId: 'open-source' },
    ],
  },
  {
    title: 'Legals',
    links: [
      { label: 'Corporate Policies',       tabId: 'legals', subtabId: 'policies' },
      { label: 'NR Human Rights Policy',   tabId: 'legals', subtabId: 'human-rights' },
      { label: 'Privacy Policy',           tabId: 'legals', subtabId: 'privacy' },
      { label: 'Cookie Policy',            tabId: 'legals', subtabId: 'cookie-policy' },
      { label: 'Terms of Service',         tabId: 'legals', subtabId: 'terms' },
      { label: 'Acceptable Use Policy',    tabId: 'legals', subtabId: 'acceptable-use' },
      { label: 'Vulnerability Disclosure', tabId: 'legals', subtabId: 'vulnerability-disclosure' },
      { label: 'Licenses',                 tabId: 'legals', subtabId: 'licenses' },
    ],
  },
  {
    title: 'Documents',
    links: [
      { label: 'Governance',    tabId: 'documents', subtabId: 'docs-governance' },
      { label: 'Social',        tabId: 'documents', subtabId: 'docs-social' },
      { label: 'Environmental', tabId: 'documents', subtabId: 'docs-environmental' },
      { label: 'Media Assets',  tabId: 'documents', subtabId: 'media-assets' },
      { label: 'Brand Guidelines', tabId: 'documents', subtabId: 'brand-guidelines' },
    ],
  },
  {
    title: 'Settings',
    links: [
      { label: 'Preferences',       tabId: 'settings', subtabId: 'preferences' },
      { label: 'Sitemap',           external: '/sitemap' },
      { label: 'Status',            external: '/status' },
      { label: 'Contact & Support', external: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/company/about' },
      { label: 'Industries',       href: '/company/sectors' },
      { label: 'Executives',       href: '/company/executives' },
      { label: 'Investors',        href: '/company/investors' },
      { label: 'Ventures',         href: '/ventures/startups' },
      { label: 'Human Rights',     href: '/company/human-rights' },
    ],
  },
];

const TAB_IDS = new Set(INFO_TABS.map((t) => t.id));
const isValidTab = (id: string | null): id is string => !!id && TAB_IDS.has(id);
const isValidSubtab = (id: string | null): id is string => !!id && id in SUBTAB_PARENT;

const gsapScrollToTop = (smooth = true) => {
  const sm = typeof window !== 'undefined' ? ScrollSmoother.get?.() : null;
  if (sm) sm.scrollTo(0, smooth);
  else window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'instant' });
};

const InformationCentral = () => {
  const [activeTab, setActiveTab] = useState<string>('newsroom');
  const [activeSubtab, setActiveSubtab] = useState<string>('releases');
  const [loading, setLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => setLoading(false), []);

  const resolve = useCallback((tab: string | null, subtab: string | null) => {
    if (isValidSubtab(subtab)) return { tab: SUBTAB_PARENT[subtab], subtab };
    if (isValidTab(tab)) return { tab, subtab: DEFAULT_SUBTAB[tab] };
    return { tab: 'newsroom', subtab: DEFAULT_SUBTAB['newsroom'] };
  }, []);

  useEffect(() => {
    const apply = () => {
      const parsed = parseInfoPath(window.location.pathname);
      const { tab, subtab } = resolve(parsed.tab, parsed.subtab);
      setActiveTab(tab);
      setActiveSubtab(subtab);
    };
    apply();
    window.addEventListener('popstate', apply);
    return () => window.removeEventListener('popstate', apply);
  }, [resolve]);

  const navigate = useCallback((tab: string, subtab: string) => {
    setActiveTab(tab);
    setActiveSubtab(subtab);
    window.history.pushState({ tab, subtab }, '', infoHref(tab, subtab));
    gsapScrollToTop(false);
  }, []);

  // In-app navigation requested from within content (e.g. the careers hero CTA
  // linking to the Recruitment Process sub-page).
  useEffect(() => {
    const onNav = (e: Event) => {
      const d = (e as CustomEvent).detail as { tabId?: string; subtabId?: string };
      if (isValidSubtab(d?.subtabId ?? null)) navigate(SUBTAB_PARENT[d.subtabId!], d.subtabId!);
      else if (isValidTab(d?.tabId ?? null)) navigate(d.tabId!, DEFAULT_SUBTAB[d.tabId!]);
    };
    window.addEventListener('info-navigate', onNav);
    return () => window.removeEventListener('info-navigate', onNav);
  }, [navigate]);

  const handleTabClick = useCallback((tabId: string) => navigate(tabId, DEFAULT_SUBTAB[tabId]), [navigate]);
  const handleSubtabClick = useCallback((tabId: string, subtabId: string) => navigate(tabId, subtabId), [navigate]);
  const handleLogoClick = useCallback(() => navigate('newsroom', DEFAULT_SUBTAB['newsroom']), [navigate]);

  // The Information Central footer's own columns navigate in-app; the Company
  // column uses plain hrefs that redirect back to the main site.
  const handleFooterNavigate = useCallback((tabId: string, subtabId?: string) => {
    if (TAB_IDS.has(tabId)) {
      navigate(tabId, subtabId ?? DEFAULT_SUBTAB[tabId]);
    }
  }, [navigate]);

  return (
    <>
      {loading && <InfoLoadingScreen duration={3000} onComplete={handleLoadingComplete} />}
      {/* Navbar stays outside SmoothScroller so position:fixed isn't broken by transforms */}
      <InfoNavbar
        activeTab={activeTab}
        activeSubtab={activeSubtab}
        onTabClick={handleTabClick}
        onSubtabClick={handleSubtabClick}
        onLogoClick={handleLogoClick}
      />
      <SmoothScroller>
        <div className="min-h-screen theme-transition" style={{ background: 'var(--surface-primary)', color: 'var(--content-primary)' }}>
          <main>
            <SubtabView subtabId={activeSubtab} />
          </main>
          <Footer onNavigate={handleFooterNavigate} sections={INFO_FOOTER_SECTIONS} logoHref="/" brandSubtitle="Information Central" />
        </div>
      </SmoothScroller>
      <CookieBanner visible={!loading} />
      {!loading && <SefirahAssistant />}
    </>
  );
};

export default InformationCentral;
