"use client";
import { useState, useEffect, useCallback, useLayoutEffect } from 'react';

interface SefirahTutorialProps {
  /** Called when the tutorial is dismissed (skipped or finished). */
  onClose: () => void;
}

interface Spot { cx: number; cy: number; r: number; }

// Coachmark steps — each reveals a little more of what Sefirah does.
const STEPS = [
  {
    title: 'Your guide, everywhere',
    body: 'This orb follows you on every page — always one tap away. Drag it anywhere you like.',
  },
  {
    title: 'Search anything',
    body: 'Tap to find founders, releases, technologies or policies — then jump straight there.',
  },
  {
    title: 'Make it yours',
    body: 'Switch the theme, change the language, or lock the navigation — all from one place.',
  },
];

const SefirahTutorial = ({ onClose }: SefirahTutorialProps) => {
  const [spot, setSpot] = useState<Spot | null>(null);
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  // Track the live position of the Sefirah orb so the spotlight stays glued to
  // it (it docks to the nav line on desktop, bottom-right on mobile).
  useLayoutEffect(() => {
    const measure = () => {
      const fab = document.querySelector('.sefirah-fab') as HTMLElement | null;
      if (!fab) return;
      const r = fab.getBoundingClientRect();
      setSpot({ cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width / 2 });
    };
    // The orb's docking effect positions it on the next frame — measure after.
    const raf = requestAnimationFrame(() => { measure(); requestAnimationFrame(measure); });
    window.addEventListener('resize', measure);
    const interval = window.setInterval(measure, 500); // follow the nav strip glide
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', measure); clearInterval(interval); };
  }, []);

  const dismiss = useCallback(() => {
    setLeaving(true);
    window.setTimeout(onClose, 400);
  }, [onClose]);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  }, [step, dismiss]);

  // Esc skips the tour.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
      else if (e.key === 'Enter' || e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dismiss, next]);

  if (!spot) return null;

  const haloR = spot.r + 16;          // glowing ring radius around the orb
  const reveal = haloR + 6;           // clear radius of the spotlight cutout
  const inBottomHalf = spot.cy > window.innerHeight / 2;
  const inRightHalf = spot.cx > window.innerWidth / 2;

  // Place the card on the open side of the orb (opposite the nearest corner).
  const cardStyle: React.CSSProperties = {
    [inBottomHalf ? 'bottom' : 'top']: `${(inBottomHalf ? window.innerHeight - spot.cy : spot.cy) + reveal + 18}px`,
    [inRightHalf ? 'right' : 'left']: `${Math.max(16, (inRightHalf ? window.innerWidth - spot.cx : spot.cx) - 120)}px`,
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div className={`sef-tut${leaving ? ' sef-tut-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="Sefirah introduction">
      {/* Transparent full-screen blocker BELOW the orb (z 60 < orb 70): swallows
          clicks on the page so only the orb and the card stay interactive. */}
      <div className="sef-tut-block" />

      {/* Dim layer ABOVE the orb with a transparent spotlight cut over it
          (box-shadow trick). Visual only — pointer-events: none. */}
      <div
        className="sef-tut-spot"
        style={{ left: spot.cx, top: spot.cy, width: reveal * 2, height: reveal * 2 }}
      />

      {/* Pulsing focus ring drawing the eye to the orb. */}
      <div className="sef-tut-ring" style={{ left: spot.cx, top: spot.cy, width: haloR * 2, height: haloR * 2 }} />
      <div className="sef-tut-ring sef-tut-ring-2" style={{ left: spot.cx, top: spot.cy, width: haloR * 2, height: haloR * 2 }} />

      {/* Explanation card */}
      <div key={step} className={`sef-tut-card ${inBottomHalf ? 'from-bottom' : 'from-top'}`} style={cardStyle}>
        <div className="sef-tut-eyebrow">
          <span className="sef-tut-dot" /> Meet Sefirah
        </div>
        <h2 className="sef-tut-title">{STEPS[step].title}</h2>
        <p className="sef-tut-body">{STEPS[step].body}</p>

        <div className="sef-tut-foot">
          <div className="sef-tut-dots" aria-hidden>
            {STEPS.map((_, i) => (
              <span key={i} className={`sef-tut-pip${i === step ? ' active' : ''}`} />
            ))}
          </div>
          <div className="sef-tut-btns">
            {!isLast && (
              <button type="button" className="sef-tut-btn sef-tut-skip" onClick={dismiss}><span>Skip</span></button>
            )}
            <button type="button" className="sef-tut-btn sef-tut-next" onClick={next}>
              <span>{isLast ? 'Got it' : 'Next'}</span>
            </button>
          </div>
        </div>
      </div>

      <style>{SEF_TUT_CSS}</style>
    </div>
  );
};

export default SefirahTutorial;

const SEF_TUT_CSS = `
/* display:contents so this wrapper creates NO stacking context — each layer
   below participates in the root stacking order and can straddle the orb
   (orb wrap = z-index 70). */
.sef-tut { display: contents; }

/* Click-blocker, BELOW the orb: page is inert, orb + card stay live. */
.sef-tut-block {
  position: fixed; inset: 0; z-index: 60;
  pointer-events: auto;
  animation: sefTutIn 0.5s ease both;
}
.sef-tut-leaving .sef-tut-block,
.sef-tut-leaving .sef-tut-spot,
.sef-tut-leaving .sef-tut-ring,
.sef-tut-leaving .sef-tut-card.from-top,
.sef-tut-leaving .sef-tut-card.from-bottom { animation: sefTutOut 0.4s ease forwards; }
@keyframes sefTutIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes sefTutOut { from { opacity: 1; } to { opacity: 0; } }

/* Dim everything except a clear disc over the orb, via an enormous box-shadow.
   Sits ABOVE the orb (z 78 > 70) but is non-interactive, so the orb shows
   through the transparent hole and stays clickable. */
.sef-tut-spot {
  position: fixed; z-index: 78; border-radius: 50%;
  transform: translate(-50%, -50%);
  background: transparent;
  box-shadow: 0 0 0 9999px rgba(2, 2, 5, 0.94);
  pointer-events: none;
  animation: sefTutIn 0.5s ease both;
  transition: left 0.4s ease, top 0.4s ease, width 0.4s ease, height 0.4s ease;
}

/* Glowing concentric pulse rings around the orb. */
.sef-tut-ring {
  position: fixed; z-index: 79; border-radius: 50%;
  transform: translate(-50%, -50%);
  border: 1.5px solid rgba(235, 17, 67, 0.85);
  box-shadow: 0 0 24px rgba(235, 17, 67, 0.45), inset 0 0 12px rgba(235, 17, 67, 0.25);
  pointer-events: none;
  animation: sefTutPulse 2.2s ease-out infinite;
}
.sef-tut-ring-2 { animation-delay: 1.1s; }
@keyframes sefTutPulse {
  0%   { opacity: 0.9; transform: translate(-50%, -50%) scale(0.85); }
  70%  { opacity: 0;   transform: translate(-50%, -50%) scale(1.5); }
  100% { opacity: 0;   transform: translate(-50%, -50%) scale(1.5); }
}
@media (prefers-reduced-motion: reduce) {
  .sef-tut-ring-2 { display: none; }
  .sef-tut-ring { animation: none; opacity: 0.8; }
}

/* Explanation card */
.sef-tut-card {
  position: fixed; z-index: 80; pointer-events: auto;
  width: min(340px, calc(100vw - 32px));
  padding: 20px 22px;
  border-radius: 18px;
  background: rgba(16, 16, 20, 0.96);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
}
.sef-tut-card.from-top    { animation: sefTutCardTop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
.sef-tut-card.from-bottom { animation: sefTutCardBot 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes sefTutCardTop { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sefTutCardBot { from { opacity: 0; transform: translateY(14px); }  to { opacity: 1; transform: translateY(0); } }

.sef-tut-eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55); margin-bottom: 12px;
}
.sef-tut-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #EB1143; box-shadow: 0 0 8px rgba(235, 17, 67, 0.9);
  animation: sefTutDot 1.6s ease-in-out infinite;
}
@keyframes sefTutDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

.sef-tut-title { font-size: 1.25rem; font-weight: 600; letter-spacing: 0.01em; margin: 0 0 8px; }
.sef-tut-body  { font-size: 0.9rem; line-height: 1.55; color: rgba(255, 255, 255, 0.72); margin: 0; }

.sef-tut-foot {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 20px; gap: 12px;
}
.sef-tut-dots { display: inline-flex; gap: 6px; }
.sef-tut-pip {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.22); transition: all 0.3s ease;
}
.sef-tut-pip.active { width: 18px; border-radius: 3px; background: #EB1143; }

/* ── Buttons — mirror the site's brand CTA (same as the cookie banner) ── */
.sef-tut-btns { display: inline-flex; align-items: center; gap: 8px; }
.sef-tut-btn {
  position: relative;
  padding: 0.55rem 1.1rem;
  border-radius: 10px;
  font: inherit; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.02em;
  cursor: pointer; border: none;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.35s ease, background 0.2s ease;
}
.sef-tut-btn > * { position: relative; z-index: 1; }

/* Secondary (Skip) — subtle translucent pill */
.sef-tut-skip {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.sef-tut-skip:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.14);
}

/* Primary (Next / Got it) — brand hero CTA with the rainbow gradient edge */
.sef-tut-next {
  background: var(--btn-surface);
  color: var(--btn-text);
  box-shadow: inset 0 0 0 1px var(--btn-inset);
  isolation: isolate;
}
.sef-tut-next::before {
  content: ''; position: absolute; width: 70%; height: 1px; bottom: 0; left: 15%;
  background: var(--btn-line); opacity: 0.2; transition: opacity 0.35s ease;
}
.sef-tut-next::after {
  content: ''; position: absolute; inset: -1.5px; border-radius: 11px; padding: 1px;
  background: radial-gradient(120px circle at 50% 50%,
    rgba(0, 255, 166, 0.9), rgba(255, 215, 0, 0.7), rgba(236, 72, 153, 0.7),
    rgba(147, 51, 234, 0.6), rgba(59, 130, 246, 0.5), transparent 70%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity 0.3s ease; pointer-events: none; z-index: -1;
}
.sef-tut-next:hover {
  color: var(--btn-text-hover); transform: translateY(-2px);
  box-shadow: inset 0 0 0 1px var(--btn-inset), 0 6px 18px -6px rgba(0, 0, 0, 0.45);
}
.sef-tut-next:hover::before { opacity: 1; }
.sef-tut-next:hover::after { opacity: 1; }
.sef-tut-next:active { transform: translateY(0) scale(0.98); }
`;
