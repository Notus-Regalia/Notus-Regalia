"use client";
import { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import MainContent from './MainContent';
import Footer from './Footer';
import LoadingScreen from './LoadingScreen';
import CookieBanner from './CookieBanner';
import SmoothScroller from './SmoothScroller';
import CustomCursor from './CustomCursor';
import type { InfoContentType } from '@/data/information-data';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

const gsapScrollToTop = (smooth = true) => {
  const sm = typeof window !== 'undefined' ? ScrollSmoother.get?.() : null;
  if (sm) sm.scrollTo(0, smooth);
  else window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'instant' });
};

type TabType = 'home' | 'company' | 'information' | 'affiliations' | 'technologies';
const VALID_TABS: TabType[] = ['home', 'company', 'information', 'affiliations', 'technologies'];

const DEFAULT_SUBTABS: Partial<Record<TabType, string>> = {
  company: 'company-sectors',
  technologies: 'technologies-civic-operations',
};

const ClientWrapper = () => {
  const [activeTab, setActiveTab]               = useState<TabType>('home');
  const [activeSubtab, setActiveSubtab]         = useState<string | undefined>(undefined);
  const [activeInfoContent, setActiveInfoContent] = useState<InfoContentType>('statements');
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
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.infoTab) {
        setActiveInfoContent(event.state.infoTab as InfoContentType);
        return;
      }
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

const handleInfoContentChange = useCallback((content: InfoContentType) => {
  setActiveInfoContent(content);
}, []);

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

  const handleFooterNavigate = useCallback((tabId: string, subtabId?: string, infoContent?: string) => {
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
    if (infoContent) setActiveInfoContent(infoContent as InfoContentType);
    gsapScrollToTop();
  }, [isValidTab]);

  return (
    <>
      <style>{`
        * { cursor: none; }
        input, textarea, select { cursor: text; }
      `}</style>
      <CustomCursor />
      {loading && <LoadingScreen duration={3000} onComplete={handleLoadingComplete} />}
      {/* Navbar stays outside SmoothScroller so position:fixed isn't broken by transforms */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        activeSubtab={activeSubtab}
        onSubtabClick={handleSubtabClick}
        activeInfoContent={activeInfoContent}
        onInfoContentChange={handleInfoContentChange}
      />
      <SmoothScroller>
        <div className="min-h-screen theme-transition" style={{ background: 'var(--surface-primary)', color: 'var(--content-primary)' }}>
          <main>
            <MainContent
              activeTab={activeTab}
              activeSubtab={activeSubtab}
              activeInfoContent={activeInfoContent}
              onInfoContentChange={handleInfoContentChange}
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
