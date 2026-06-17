"use client";
import { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import MainContent from './MainContent';
import Footer from './Footer';
import LoadingScreen from './LoadingScreen';
import CookieBanner from './CookieBanner';
import SeraphAssistant from './SeraphAssistant';
import SmoothScroller from './SmoothScroller';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { DEFAULT_SUBTABS, isRootTab, parseRootPath, rootHref, type RootTab } from '@/utils/routes';

const gsapScrollToTop = (smooth = true) => {
  const sm = typeof window !== 'undefined' ? ScrollSmoother.get?.() : null;
  if (sm) sm.scrollTo(0, smooth);
  else window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'instant' });
};

type TabType = RootTab;

const ClientWrapper = () => {
  const [activeTab, setActiveTab]               = useState<TabType>('home');
  const [activeSubtab, setActiveSubtab]         = useState<string | undefined>(undefined);
  const [loading, setLoading]                   = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  // Sync state from the current path (initial mount + browser back/forward).
  useEffect(() => {
    const apply = () => {
      const { tab, subtab } = parseRootPath(window.location.pathname);
      setActiveTab(tab);
      setActiveSubtab(subtab);
    };
    apply();
    window.addEventListener('popstate', apply);
    return () => window.removeEventListener('popstate', apply);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    if (!isRootTab(tab)) return;
    if (tab === activeTab) {
      // Re-clicking the active tab resets it (closes detail views, scrolls to top)
      window.dispatchEvent(new CustomEvent('tab-reset', { detail: { tab } }));
      gsapScrollToTop();
      return;
    }
    const nextSubtab = DEFAULT_SUBTABS[tab];
    setActiveTab(tab);
    setActiveSubtab(nextSubtab);
    window.history.pushState({ tab, subtab: nextSubtab }, '', rootHref(tab, nextSubtab));
  }, [activeTab]);

  const handleSubtabClick = useCallback((parentTabId: string, subtabId: string) => {
    if (!isRootTab(parentTabId)) return;
    setActiveTab(parentTabId);
    setActiveSubtab(subtabId);
    window.history.pushState({ tab: parentTabId, subtab: subtabId }, '', rootHref(parentTabId, subtabId));
  }, []);

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
    if (!isRootTab(tabId)) return;
    const nextSubtab = subtabId ?? DEFAULT_SUBTABS[tabId];
    setActiveTab(tabId);
    setActiveSubtab(nextSubtab);
    window.history.pushState({ tab: tabId, subtab: nextSubtab }, '', rootHref(tabId, nextSubtab));
    gsapScrollToTop();
  }, []);

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
      {!loading && <SeraphAssistant />}
    </>
  );
};

export default ClientWrapper;
