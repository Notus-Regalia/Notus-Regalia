"use client";
import { memo, useMemo, useCallback, useRef, useState, useEffect } from "react";
import { ABOUT_PANEL_ITEMS, ABOUT_PANEL_CONTENT } from "@/data/Company-data";
import { useAboutNavigation } from "@/hooks/useAboutNavigation";
import { useAboutMouseTracking } from "@/hooks/useAboutMouseTracking";
import GridNavButton from "@/components/ui/GridNavButton";
import styles from "@/styles/About.module.css";
import { useReveal } from "@/hooks/useScrollReveal";

type AboutContentType = "company" | "philosophy" | "ecosystem" | "direction" | "governance" | "ethics";

type CornerPosition = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  borderL?: boolean;
  borderR?: boolean;
  borderT?: boolean;
  borderB?: boolean;
  delay: number;
};

const CORNER_POSITIONS: CornerPosition[] = [
  { top: 0, left: 0, borderL: true, borderT: true, delay: 0 },
  { top: 0, right: 0, borderR: true, borderT: true, delay: 0.5 },
  { bottom: 0, left: 0, borderL: true, borderB: true, delay: 1 },
  { bottom: 0, right: 0, borderR: true, borderB: true, delay: 1.5 },
];

interface AboutTabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  onMouseMove?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const AboutTabButton = memo<AboutTabButtonProps>(({ label, isActive, onClick, onMouseMove }) => (
  <div className={`${styles.tabBorder}${isActive ? ` ${styles.tabBorderActive}` : ""}`}>
    <button
      className={`${styles.tabBtn}${isActive ? ` ${styles.tabBtnActive}` : ""}`}
      onClick={onClick}
      onMouseMove={onMouseMove}
    >
      {label}
    </button>
  </div>
));
AboutTabButton.displayName = "AboutTabButton";

interface AboutLearnMoreButtonProps {
  onClick: () => void;
  onMouseMove?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const AboutLearnMoreButton = memo<AboutLearnMoreButtonProps>(({ onClick, onMouseMove }) => (
  <button className="brand-btn" onClick={onClick} onMouseMove={onMouseMove}>
    <span>Learn More</span>
    <i className="bi bi-arrow-up-right-square"></i>
  </button>
));
AboutLearnMoreButton.displayName = "AboutLearnMoreButton";

const Mission = memo(({ onLearnMore }: { onLearnMore?: (page: string) => void }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const {
    activeContent,
    displayContent,
    isTransitioning,
    selectorPosition,
    activeSubsection,
    displaySubsection,
    isTabTransitioning,
    handleContentChange,
    handleSubsectionChange,
  } = useAboutNavigation(ABOUT_PANEL_ITEMS);

  const { handleMouseMove } = useAboutMouseTracking();

  /* ── Scroll-triggered reveals ── */
  const headerReveal = useReveal('fade-up', { threshold: 0.1, duration: 800 });
  const panelReveal = useReveal('fade-up', { threshold: 0.08, duration: 800, cssDelay: 120 });

  const activeContentData = ABOUT_PANEL_CONTENT[activeContent];
  const currentSubsectionKey = displaySubsection[activeContent];
  const currentSubsection =
    activeContentData.subsections.find((s) => s.key === currentSubsectionKey) ||
    activeContentData.subsections[0];

  const selectorStyles = useMemo(
    () => ({
      top: `${selectorPosition * (100 / ABOUT_PANEL_ITEMS.length)}%`,
      height: `${100 / ABOUT_PANEL_ITEMS.length}%`,
    }),
    [selectorPosition]
  );

  return (
    <div style={{ paddingBottom: '8rem' }}>
    <section
      ref={sectionRef}
      className={styles.aboutSection}
      data-nosnippet="true"
      data-hydrated={hydrated ? "true" : undefined}
      style={{
        borderTop: '1px dashed rgba(255,255,255,0.12)',
        opacity: hydrated ? 1 : 0,
        transition: hydrated ? 'opacity 0.25s ease' : 'none',
        pointerEvents: hydrated ? 'auto' : 'none',
      }}
    >
        <div className={styles.noiseTexture} />

        <div className="relative z-10 h-full">

          {/* ── Section header strip — title only ── */}
          <div
            ref={headerReveal.ref}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(0.85rem, 2vw, 1.25rem)',
              padding: '0.5rem clamp(1.5rem, 5vw, 4rem)',
              marginTop: '1.5rem',
              background: 'transparent',
              ...headerReveal.style,
            }}
          >
            <span
              aria-hidden
              style={{
                width: '4px',
                height: 'clamp(2rem, 4.5vw, 2.9rem)',
                borderRadius: '2px',
                background: '#E31B54',
                flexShrink: 0,
              }}
            />
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(2rem, 5.5vw, 3.2rem)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1,
                color: 'var(--content-primary)',
              }}
            >
              Our Company
            </h2>
          </div>

          {/* ── Panel ── */}
          <div ref={panelReveal.ref} style={{ marginTop: "1.5rem", position: 'relative', ...panelReveal.style }}>

          {/* Mobile scroll hint tooltip */}
          <div className={styles.scrollHint} aria-hidden="true">
            Scroll <i className="bi bi-chevron-right" style={{ fontSize: '0.6rem' }} />
          </div>

          <div className={styles.mainGrid}>

            <div ref={navRef} className={styles.gridNavigation} data-hydrated={hydrated ? "true" : undefined} style={{ opacity: hydrated ? 1 : 0, transition: hydrated ? 'opacity 0.2s ease' : 'none' }}>
              <div className={styles.activeSelector} style={selectorStyles}>
                <div className={styles.selectorBackground} />
                <div className={styles.selectorCrimson} />
                {CORNER_POSITIONS.map((corner, idx) => (
                  <div
                    key={idx}
                    className={styles.cornerIndicator}
                    style={{
                      ...corner,
                      borderLeftWidth: corner.borderL ? "2px" : 0,
                      borderRightWidth: corner.borderR ? "2px" : 0,
                      borderTopWidth: corner.borderT ? "2px" : 0,
                      borderBottomWidth: corner.borderB ? "2px" : 0,
                      animation: `cornerPulse 2s ease-in-out infinite ${corner.delay}s`,
                    }}
                  />
                ))}
              </div>

              {ABOUT_PANEL_ITEMS.map((item, index) => (
                <GridNavButton
                  key={item.key}
                  item={item}
                  index={index}
                  isActive={displayContent === item.key}
                  onClick={handleContentChange}
                  onMouseMove={handleMouseMove}
                />
              ))}

              <div className={styles.navDivider} />
            </div>

            <div className={styles.contentPanel}>
              <div className={`${styles.contentWrapper} ${isTransitioning ? styles.transitioning : ""}`}>

                {(activeContentData.buttonType === "tabs" || activeContentData.buttonType === "cards") && (
                  <>
                    <div className={styles.tabButtonsContainer}>
                      {activeContentData.subsections.map((subsection) => (
                        <AboutTabButton
                          key={subsection.key}
                          label={subsection.label}
                          isActive={activeSubsection[activeContent] === subsection.key}
                          onClick={() => handleSubsectionChange(subsection.key)}
                          onMouseMove={handleMouseMove}
                        />
                      ))}
                    </div>
                    <div className={styles.dividerCrimson} />
                  </>
                )}

                <div
                  className={`${styles.tabContent} ${isTabTransitioning ? styles.transitioning : ""}`}
                  style={{ paddingTop: '2rem' }}
                >
                  <h3 className={styles.sectionTitle}>{currentSubsection.contentTitle}</h3>
                  {currentSubsection.description && (
                    <div className={styles.descriptionContainer}>
                      {currentSubsection.description.map((paragraph, index) => (
                        <p key={index} className={styles.descriptionText}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.learnMoreSection}>
                  <div className={styles.learnMoreInner}>
                    <AboutLearnMoreButton onClick={() => onLearnMore?.(activeContent)} onMouseMove={handleMouseMove} />
                  </div>
                </div>

              </div>
            </div>

          </div>
          </div>
        </div>
      </section>
    </div>
  );
});

Mission.displayName = "Mission";

export default Mission;
