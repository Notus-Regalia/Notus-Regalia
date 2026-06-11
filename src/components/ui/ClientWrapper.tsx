"use client";
import { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import MainContent from './MainContent';
import Footer from './Footer';
import LoadingScreen from './LoadingScreen';
import CookieBanner from './CookieBanner';
import SmoothScroller from './SmoothScroller';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

const gsapScrollToTop = (smooth = true) => {
  const sm = typeof window !== 'undefined' ? ScrollSmoother.get?.() : null;
  if (sm) sm.scrollTo(0, smooth);
  else window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'instant' });
};

type TabType = 'home' | 'company' | 'affiliations' | 'technologies';
const VALID_TABS: TabType[] = ['home', 'company', 'affiliations', 'technologies'];

const DEFAULT_SUBTABS: Partial<Record<TabType, string>> = {
  company: 'company-mission',
  technologies: 'technologies-civic-operations',
};

const ClientWrapper = () => {
  const [activeTab, setActiveTab]               = useState<TabType>('home');
  const [activeSubtab, setActiveSubtab]         = useState<string | undefined>(undefined);
  const [loading, setLoading]                   = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  const isValidTab = useCallback((tab: string): tab is TabType => {
    return VALID_TABS.includes(tab as TabType);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabFromUrl = params.get('tab');
    const subtabFromUrl = params.get('subtab');
    if (tabFromUrl && isValidTab(tabFromUrl)) {
      setActiveTab(tabFromUrl);
      setActiveSubtab(subtabFromUrl ?? DEFAULT_SUBTABS[tabFromUrl]);
    } else {
      setActiveSubtab(undefined);
    }
  }, [isValidTab]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab');
      const subtabFromUrl = params.get('subtab');
      if (tabFromUrl && isValidTab(tabFromUrl)) {
        setActiveTab(tabFromUrl);
        setActiveSubtab(subtabFromUrl ?? DEFAULT_SUBTABS[tabFromUrl]);
      } else {
        setActiveTab('home');
        setActiveSubtab(undefined);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isValidTab]);

  const handleTabChange = useCallback((tab: string) => {
    if (!isValidTab(tab)) return;
    if (tab === activeTab) {
      // Re-clicking the active tab resets it (closes detail views, scrolls to top)
      window.dispatchEvent(new CustomEvent('tab-reset', { detail: { tab } }));
      gsapScrollToTop();
      return;
    }
    const nextSubtab = DEFAULT_SUBTABS[tab as TabType];
    setActiveTab(tab);
    setActiveSubtab(nextSubtab);
    const url = new URL(window.location.href);
    url.searchParams.delete('subtab');
    if (tab === 'home') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tab);
      if (nextSubtab) {
        url.searchParams.set('subtab', nextSubtab);
      }
    }
    window.history.pushState({ tab, subtab: nextSubtab }, '', url);
  }, [activeTab, isValidTab]);

  const handleSubtabClick = useCallback((parentTabId: string, subtabId: string) => {
    if (!isValidTab(parentTabId)) return;
    setActiveTab(parentTabId);
    setActiveSubtab(subtabId);
    const url = new URL(window.location.href);
    if (parentTabId === 'home') {
      url.searchParams.delete('tab');
      url.searchParams.delete('subtab');
    } else {
      url.searchParams.set('tab', parentTabId);
      url.searchParams.set('subtab', subtabId);
    }
    window.history.pushState({ tab: parentTabId, subtab: subtabId }, '', url);
  }, [isValidTab]);

  // In-page "Continue Exploring" links on Company subtab pages
  useEffect(() => {
    const handler = (e: Event) => {
      const subtab = (e as CustomEvent).detail?.subtab;
      if (typeof subtab === 'string') handleSubtabClick('company', subtab);
    };
    window.addEventListener('company-navigate', handler);
    return () => window.removeEventListener('company-navigate', handler);
  }, [handleSubtabClick]);

  const handleFooterNavigate = useCallback((tabId: string, subtabId?: string) => {
    if (!isValidTab(tabId)) return;
    setActiveTab(tabId);
    setActiveSubtab(subtabId ?? DEFAULT_SUBTABS[tabId as TabType]);
    const url = new URL(window.location.href);
    if (tabId === 'home') {
      url.searchParams.delete('tab');
      url.searchParams.delete('subtab');
    } else {
      url.searchParams.set('tab', tabId);
      const nextSubtab = subtabId ?? DEFAULT_SUBTABS[tabId as TabType];
      if (nextSubtab) {
        url.searchParams.set('subtab', nextSubtab);
      } else {
        url.searchParams.delete('subtab');
      }
    }
    window.history.pushState({ tab: tabId, subtab: subtabId ?? DEFAULT_SUBTABS[tabId as TabType] }, '', url);
    gsapScrollToTop();
  }, [isValidTab]);

  return (
    <>
      {loading && <LoadingScreen duration={3000} onComplete={handleLoadingComplete} />}
      {/* Navbar stays outside SmoothScroller so position:fixed isn't broken by transforms */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        activeSubtab={activeSubtab}
        onSubtabClick={handleSubtabClick}
      />
      <SmoothScroller>
        <div className="min-h-screen theme-transition" style={{ background: 'var(--surface-primary)', color: 'var(--content-primary)' }}>
          <main>
            <MainContent
              activeTab={activeTab}
              activeSubtab={activeSubtab}
            />
          </main>
          <Footer onNavigate={handleFooterNavigate} />
        </div>
      </SmoothScroller>
      <CookieBanner visible={!loading} />
    </>
  );
};

export default ClientWrapper;
