"use client";
import { memo, useCallback } from 'react';
import Threads from '@/components/ParentCompany/Landing/Threads';


const HeroSection = () => {
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);


  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'var(--surface-primary)',
        contain: 'layout paint',
      }}
    >
      <style jsx>{`
        @media (max-width: 768px) {
          section {
            min-height: 100svh !important;
            height: 100svh !important;
            padding: 0;
          }
        }

        @media (max-width: 768px) {
          .heroBtn {
            padding: 0.6rem 1.25rem;
            font-size: 0.8rem;
          }
        }

        .heroBtn {
          min-width: 120px;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 12px 17px;
          font-size: 0.875rem;
          font-weight: 500;
          border: 0;
          border-radius: 7px;
          box-shadow: inset 0 0 0 1px var(--btn-inset);
          background: var(--btn-surface);
          cursor: pointer;
          color: var(--btn-text);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            color 0.35s ease;
        }

        @media (min-width: 1024px) {
          .heroBtn {
            padding: 14px 28px;
            font-size: 1rem;
          }
        }

        .heroBtn > * { position: relative; z-index: 1; }

        .heroBtn::before {
          content: '';
          width: 70%;
          height: 1px;
          position: absolute;
          bottom: 0;
          left: 15%;
          background: var(--btn-line);
          opacity: 0.2;
          transition: opacity 0.35s ease;
        }

        .heroBtn:hover {
          color: var(--btn-text-hover);
          transform: translateY(-2px);
          box-shadow: inset 0 0 0 1px var(--btn-inset), 0 6px 18px -6px rgba(0, 0, 0, 0.45);
        }

        .heroBtn:hover::before {
          opacity: 1;
        }

        .heroBtn::after {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: 8.5px;
          padding: 1px;
          background: radial-gradient(
            180px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(0, 255, 166, 0.9),
            rgba(255, 215, 0, 0.7),
            rgba(236, 72, 153, 0.7),
            rgba(147, 51, 234, 0.6),
            rgba(59, 130, 246, 0.5),
            transparent 70%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
        }

        .heroBtn:hover::after {
          opacity: 1;
        }

        /* Secondary hero button — always jet black (independent of theme),
           so it reads as the non-CTA next to the white "Get Started" button. */
        .heroBtn.heroBtn-secondary {
          --btn-surface: #1f1f1f;
          --btn-text: rgba(255, 255, 255, 0.66);
          --btn-text-hover: rgba(255, 255, 255, 1);
          --btn-inset: rgba(255, 255, 255, 0.28);
          --btn-line: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
        }

        .hero-title {
          background-image: linear-gradient(135deg, #e2e8f0, #94a3b8, #cbd5e1, #64748b);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        :global(.light) .hero-title {
          background-image: none;
          -webkit-background-clip: unset;
          background-clip: unset;
          -webkit-text-fill-color: unset;
          color: #1e293b;
        }

        :global(.light) .hero-grid-base {
          background-image:
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px) !important;
        }

        :global(.light) .hero-grid-fade {
          background-image:
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px) !important;
        }

        :global(.light) .hero-mobile-overlay {
          background: linear-gradient(to top, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 40%, transparent 70%) !important;
        }

        :global(.light) .hero-mobile-overlay .hero-mobile-status {
          color: rgba(0,0,0,0.4) !important;
        }

        :global(.light) .hero-mobile-overlay .hero-mobile-subtitle {
          color: rgba(0,0,0,0.5) !important;
        }

        :global(.light) .hero-mobile-overlay {
          background: linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 35%, transparent 55%) !important;
        }

        :global(.light) .hero-scroll-hint span {
          color: rgba(0,0,0,0.3) !important;
        }

        :global(.light) .hero-scroll-hint svg path {
          stroke: rgba(0,0,0,0.3) !important;
        }

        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }

        .hero-scroll-hint {
          animation: scrollBounce 1.8s ease-in-out infinite;
        }

        /* --- Mission Pill (Uiverse "MuhammadHasann" design — static/decorative,
           locked to the lit state since it is not an interactive button) --- */
        .hud-pill {
          --black-700: hsla(0 0% 12% / 1);
          --pill-radius: 9999px;
          --active: 1;
          position: relative;
          isolation: isolate;
          overflow: visible;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.55rem 1.3rem;
          background-color: transparent;
          border: none;
          border-radius: var(--pill-radius);
        }

        .hud-pill::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background-color: var(--black-700);
          border-radius: var(--pill-radius);
          box-shadow:
            inset 0 0.5px hsl(0, 0%, 100%),
            inset 0 -1px 2px 0 hsl(0, 0%, 0%),
            0px 4px 10px -4px hsla(0 0% 0% / calc(1 - var(--active))),
            0 0 0 calc(var(--active) * 0.3rem) hsl(0 0% 100% / 0.1);
          z-index: 0;
        }

        .hud-pill::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background-color: transparent;
          background-image:
            radial-gradient(at 50% 0%, hsla(0, 0%, 100%, 0.16) 0px, transparent 55%),
            radial-gradient(at 50% 100%, hsla(0, 0%, 0%, 0.55) 0px, transparent 60%);
          background-position: top;
          opacity: var(--active);
          border-radius: var(--pill-radius);
          z-index: 1;
        }

        /* Traveling light that forms the animated border — a conic-gradient
           comet spun at uniform angular speed (smooth on any pill width),
           clipped to the 1px ring that peeks past the solid body. */
        .hud-dots {
          --size-border: calc(100% + 2px);
          overflow: hidden;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: var(--size-border);
          height: var(--size-border);
          background-color: transparent;
          border-radius: var(--pill-radius);
          z-index: -10;
          pointer-events: none;
        }

        .hud-dots::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 220%;
          aspect-ratio: 1 / 1;
          background: conic-gradient(
            from 0deg,
            rgba(255, 255, 255, 0) 0deg,
            rgba(255, 255, 255, 0) 305deg,
            rgba(255, 255, 255, 0.95) 360deg
          );
          transform: translate(-50%, -50%) rotate(0deg);
          transform-origin: center;
          will-change: transform;
          backface-visibility: hidden;
          animation: hudRotate 3s linear infinite;
        }

        @keyframes hudRotate {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Radar dot */
        .hud-dot-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 12px;
          height: 12px;
          flex-shrink: 0;
        }

        .hud-dot-core {
          width: 4px;
          height: 4px;
          background-color: #E31B54;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(235, 17, 67, 0.75);
          z-index: 2;
        }

        .hud-dot-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1px solid rgba(227, 27, 84, 0.6);
          border-radius: 50%;
          animation: radarPulse 2s infinite cubic-bezier(0.45, 0, 0.55, 1);
          z-index: 1;
        }

        @keyframes radarPulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        @keyframes hudPrefixGlow {
          0%, 100% {
            opacity: 0.78;
            text-shadow: 0 0 7px rgba(255, 45, 116, 0.48), 0 0 16px rgba(255, 45, 116, 0.32);
          }
          50% {
            opacity: 1;
            text-shadow: 0 0 12px rgba(255, 45, 116, 0.78), 0 0 26px rgba(255, 45, 116, 0.62);
          }
        }

        .hud-text {
          position: relative;
          z-index: 10;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: rgba(239, 242, 248, 0.82);
          letter-spacing: 0.09em;
          font-weight: 500;
        }

        .hud-prefix {
          color: #ff2d74;
          margin-right: 0.4rem;
          animation: hudPrefixGlow 2.4s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .hud-pill { padding: 0.4rem 1rem; gap: 0.45rem; }
          .hud-dot-wrapper { width: 9px; height: 9px; }
        }

        /* Decorative black pill renders identically in both themes */
        :global(.light) .hud-text { color: rgba(239, 242, 248, 0.82); }
        :global(.light) .hud-dot-core {
          background-color: #E31B54;
          box-shadow: 0 0 6px rgba(235, 17, 67, 0.75);
        }

        /* Light mode glass panel — restore cool white */
        :global(.light) .hero-glass-panel {
          background: linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.05) 50%, rgba(29,78,216,0.03) 100%) !important;
        }
        :global(.light) .hero-glass-radial {
          background: radial-gradient(ellipse at 20% 15%, rgba(96,165,250,0.07) 0%, transparent 60%) !important;
        }

      `}</style>

      {/* Faint grid background — right side, on top of threads */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none hidden md:block" style={{ zIndex: 4, transform: 'translateZ(0)', willChange: 'transform' }}>
        <div className="absolute inset-0 hero-grid-base" style={{ backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 hero-grid-fade" style={{ backgroundSize: '40px 40px' }} />
      </div>

      {/* Threads Background */}
      <div className="absolute inset-0" style={{ width: '100%', height: '100%', zIndex: 2, pointerEvents: 'auto', transform: 'translateZ(0)', willChange: 'transform' }}>
        <Threads amplitude={3.5} distance={0.3} enableMouseInteraction={true} />
      </div>

      {/* Glass Morphism Left Panel */}
      <div className="absolute top-0 left-0 w-1/2 h-full hidden md:flex items-center pointer-events-none hero-glass-panel" style={{ background: 'linear-gradient(135deg, rgba(7,7,14,0.72) 0%, rgba(10,10,15,0.60) 50%, rgba(8,8,16,0.45) 100%)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', borderRight: '1px dashed var(--border-color)', zIndex: 3, transform: 'translateZ(0)', willChange: 'transform' }}>
        <div className="absolute inset-0 pointer-events-none hero-glass-radial" style={{ background: 'radial-gradient(ellipse at 20% 15%, rgba(30,42,56,0.35) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.02), transparent)' }} />
        <div className="relative z-10 w-full px-8 lg:px-14 xl:px-20 flex flex-col gap-8" style={{ marginTop: '5vh' }}>
          <div className="pointer-events-auto hud-pill w-fit">
            <span className="hud-dots" aria-hidden="true" />
            <span className="hud-dot-wrapper" aria-hidden="true">
              <span className="hud-dot-core" />
              <span className="hud-dot-ring" />
            </span>
            <span className="text-xs lg:text-sm font-mono tracking-widest uppercase hud-text"><span className="hud-prefix">[Redefining]</span> Information Superiority</span>
          </div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight hero-title">At the Core of Critical Operations</h1>
          <p className="text-sm lg:text-base xl:text-lg leading-relaxed w-full max-w-none" style={{ color: 'var(--content-tertiary)' }}>We stand at the center of mission-critical operations for government and commercial enterprises. From industrial infrastructure to tactical front lines, we are built for high-stakes environments where failure is not an option.</p>
          <div className="flex items-center gap-4 mt-2 pointer-events-auto">
            <button className="heroBtn" onMouseMove={handleMouseMove}>
              Get Started
              <i className="bi bi-arrow-up-right-square" aria-hidden="true" />
            </button>
            <button className="heroBtn heroBtn-secondary" onMouseMove={handleMouseMove}>View case studies</button>
          </div>
        </div>
      </div>

      {/* Mobile Content Overlay */}
      <div className="relative z-10 flex md:hidden flex-col justify-between w-full h-full px-5 pb-8 pt-24 pointer-events-none hero-mobile-overlay" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 35%, transparent 55%)', transform: 'translateZ(0)', willChange: 'transform' }}>
        <div className="flex flex-col gap-5 w-full">
          <div className="pointer-events-auto hud-pill w-fit">
            <span className="hud-dots" aria-hidden="true" />
            <span className="hud-dot-wrapper" aria-hidden="true">
              <span className="hud-dot-core" />
              <span className="hud-dot-ring" />
            </span>
            <span className="text-[0.65rem] font-mono tracking-widest uppercase hud-text"><span className="hud-prefix">[Redefining]</span> Information Superiority</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight hero-title">At the Core of Critical Operations</h1>
          <p className="text-sm sm:text-base leading-relaxed hero-mobile-subtitle" style={{ color: 'rgba(255,255,255,0.55)' }}>We stand at the center of mission-critical operations for government and commercial enterprises. From industrial infrastructure to tactical front lines, we are built for high-stakes environments where failure is not an option.</p>
          <div className="flex items-center gap-3 mt-1 pointer-events-auto">
            <button className="heroBtn" onMouseMove={handleMouseMove}>
              Get Started
              <i className="bi bi-arrow-up-right-square" aria-hidden="true" />
            </button>
            <button className="heroBtn heroBtn-secondary" onMouseMove={handleMouseMove}>View case studies</button>
          </div>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto hero-scroll-hint self-start">
          <div className="hero-scroll-arrow"><svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <span className="text-xs font-mono tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>Scroll to explore</span>
        </div>
      </div>

    </section>
  );
};

export default memo(HeroSection);
