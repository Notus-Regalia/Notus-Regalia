"use client";
import { useState, useEffect, useCallback } from 'react';
import { hasConsentDecision, acceptAllConsent, rejectNonEssentialConsent } from '@/utils/consent';

interface CookieBannerProps {
  visible: boolean;
}

const CookieBanner = ({ visible }: CookieBannerProps) => {
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (hasConsentDecision()) return; // already consented
    const t = setTimeout(() => setShow(true), 400); // slight delay after loading finishes
    return () => clearTimeout(t);
  }, [visible]);

  const handleAccept = useCallback((type: 'all' | 'essential') => {
    if (type === 'all') acceptAllConsent();
    else rejectNonEssentialConsent();
    setExiting(true);
    setTimeout(() => setShow(false), 500);
  }, []);

  if (!show) return null;

  return (
    <div className={`nr-cookie-bar${exiting ? ' nr-cookie-bar-exit' : ''}`} role="region" aria-label="Cookie consent">
      {/* Decorative top accent — spans the full width of the banner */}
      <div className="nr-cookie-accent" />

      <div className="nr-cookie-inner">
        <div className="nr-cookie-content">
          <div className="nr-cookie-header">
            <i className="bi bi-shield-lock" />
            <span>Cookie Preferences</span>
          </div>

          <p className="nr-cookie-text">
            We use essential cookies to keep the site functional and optional analytics
            cookies to understand how you interact with Notus Regalia. Your data stays yours.
            <span className="nr-cookie-footnote"> You can change your preferences anytime in Settings.</span>
          </p>
        </div>

        <div className="nr-cookie-actions">
          <button
            className="nr-cookie-btn nr-cookie-btn-secondary"
            onClick={() => handleAccept('essential')}
          >
            Essential Only
          </button>
          <button
            className="nr-cookie-btn nr-cookie-btn-primary"
            onClick={() => handleAccept('all')}
          >
            Accept All
          </button>
        </div>
      </div>

      <style>{`
        .nr-cookie-bar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 90000;
          width: 100%;
          background: linear-gradient(165deg, rgba(12, 12, 18, 0.98) 0%, rgba(6, 6, 10, 0.99) 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            0 -16px 48px rgba(0, 0, 0, 0.5),
            0 -1px 0 rgba(255, 255, 255, 0.04) inset;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: cookieSlideUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .nr-cookie-bar.nr-cookie-bar-exit {
          animation: cookieSlideDown 0.45s cubic-bezier(0.55, 0, 1, 0.45) forwards;
        }

        :root.light .nr-cookie-bar {
          background: linear-gradient(165deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 248, 252, 0.99) 100%);
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow:
            0 -16px 48px rgba(0, 0, 0, 0.1),
            0 -1px 0 rgba(0, 0, 0, 0.03) inset;
        }

        .nr-cookie-accent {
          position: absolute;
          top: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, var(--accent-red) 20%, var(--accent-red) 80%, transparent 100%);
          opacity: 0.7;
          pointer-events: none;
        }

        /* Edge-to-edge bar; inner row aligns content to the shared site gutter. */
        .nr-cookie-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem 2.5rem;
          padding: 1.15rem var(--site-gutter-inline);
          /* Honour the device safe-area on the bottom edge (notched phones). */
          padding-bottom: max(1.15rem, env(safe-area-inset-bottom));
        }

        .nr-cookie-content {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          min-width: 0;
          /* Grow to fill the space left of the action buttons. */
          flex: 1;
        }

        .nr-cookie-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.01em;
        }
        .nr-cookie-header i {
          font-size: 1rem;
          color: var(--accent-red);
        }
        :root.light .nr-cookie-header {
          color: rgba(0, 0, 0, 0.85);
        }

        .nr-cookie-text {
          font-size: 0.82rem;
          font-weight: 400;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.45);
          margin: 0;
          /* Let the copy run the full width left of the buttons. */
          max-width: none;
        }
        :root.light .nr-cookie-text {
          color: rgba(0, 0, 0, 0.5);
        }

        .nr-cookie-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-shrink: 0;
        }

        .nr-cookie-btn {
          position: relative;
          padding: 0.7rem 1.4rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            color 0.35s ease, background 0.2s ease;
          border: none;
          font-family: inherit;
        }
        .nr-cookie-btn > * { position: relative; z-index: 1; }

        .nr-cookie-btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .nr-cookie-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.85);
          border-color: rgba(255, 255, 255, 0.14);
        }
        :root.light .nr-cookie-btn-secondary {
          background: rgba(0, 0, 0, 0.04);
          color: rgba(0, 0, 0, 0.55);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        :root.light .nr-cookie-btn-secondary:hover {
          background: rgba(0, 0, 0, 0.07);
          color: rgba(0, 0, 0, 0.8);
        }

        /* Brand button — matches the hero CTA (white in dark, jet black in light) */
        .nr-cookie-btn-primary {
          background: var(--btn-surface);
          color: var(--btn-text);
          box-shadow: inset 0 0 0 1px var(--btn-inset);
          isolation: isolate;
        }
        .nr-cookie-btn-primary::before {
          content: '';
          position: absolute;
          width: 70%;
          height: 1px;
          bottom: 0;
          left: 15%;
          background: var(--btn-line);
          opacity: 0.2;
          transition: opacity 0.35s ease;
        }
        .nr-cookie-btn-primary::after {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: 11px;
          padding: 1px;
          background: radial-gradient(
            120px circle at 50% 50%,
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
          z-index: -1;
        }
        .nr-cookie-btn-primary:hover {
          color: var(--btn-text-hover);
          transform: translateY(-2px);
          box-shadow: inset 0 0 0 1px var(--btn-inset), 0 6px 18px -6px rgba(0, 0, 0, 0.45);
        }
        .nr-cookie-btn-primary:hover::before { opacity: 1; }
        .nr-cookie-btn-primary:hover::after { opacity: 1; }

        .nr-cookie-footnote {
          color: rgba(255, 255, 255, 0.28);
        }
        :root.light .nr-cookie-footnote {
          color: rgba(0, 0, 0, 0.32);
        }

        @keyframes cookieSlideUp {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cookieSlideDown {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(100%); }
        }

        /* Stack content above the actions on narrow screens; buttons go full width. */
        @media (max-width: 768px) {
          .nr-cookie-inner {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .nr-cookie-actions { width: 100%; }
          .nr-cookie-btn { flex: 1; padding: 0.8rem 1rem; text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default CookieBanner;
