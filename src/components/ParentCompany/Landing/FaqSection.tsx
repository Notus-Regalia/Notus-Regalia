"use client";
import { useEffect, useRef, useState } from "react";
import PixelCanvas from "@/components/ui/PixelCanvas";

interface FaqItem { q: string; a: string; }
interface FaqGroup { label: string; items: FaqItem[]; }

const FAQ_GROUPS: FaqGroup[] = [
  {
    label: "The Company",
    items: [
      {
        q: "What exactly does Notus Regalia do?",
        a: "Notus Regalia is a private technology holding and venture-building company. We design, fund, and operate mission-critical systems across defense, government, healthcare, energy, and enterprise — building durable operating systems rather than one-off projects.",
      },
      {
        q: "Are you a venture fund or an operating company?",
        a: "Both, by design. We deploy strategic capital like an investor, but we build and run ventures like an operator — sharing infrastructure, governance, and engineering discipline across the portfolio.",
      },
      {
        q: "Which industries do you focus on?",
        a: "We concentrate where failure is not an option: defense and intelligence, civic and government operations, healthcare, and critical energy and infrastructure. Each venture is matched to a sector with long-horizon, high-stakes demand.",
      },
      {
        q: "What stage of companies do you build?",
        a: "Predominantly early stage — from formation and validation through to scaled operations. We favor capital-efficient experimentation, stage-gated advancement, and founder-operator alignment over speculative bets.",
      },
    ],
  },
  {
    label: "Engagement",
    items: [
      {
        q: "How can I partner or work with Notus Regalia?",
        a: "We work with operators, institutions, and capital partners aligned with long-term value creation. The fastest path is to reach out directly with context on what you're building or proposing.",
      },
      {
        q: "Do you accept inbound proposals?",
        a: "Yes. We read everything. Whether it's a venture proposal, a partnership, or a research collaboration, send it through and our team will review it.",
      },
      {
        q: "How do I get in touch?",
        a: "Email info@notusregalia.tech, or use the Contact panel in the footer. For press, investor, and careers enquiries, the Information Central newsroom routes to the right team.",
      },
    ],
  },
];

function Plus({ className }: { className: string }) {
  return (
    <svg
      className={className}
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const PIXELS_DARK = [
  "rgba(255,255,255,0.10)", "rgba(255,255,255,0.14)", "rgba(255,255,255,0.10)",
  "rgba(255,255,255,0.18)", "rgba(227,27,84,0.5)",
];

export default function FaqSection() {
  const [open, setOpen] = useState<string>("0-0");
  const [revealed, setRevealed] = useState(false);
  const [pixelColors, setPixelColors] = useState<string[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // The FAQ section is always dark, regardless of theme — always use dark pixels.
  useEffect(() => {
    setPixelColors(PIXELS_DARK);
  }, []);

  // Reserve the height of the tallest answer so the section's overall height stays
  // constant — opening/closing a question no longer grows/shrinks the section and
  // shifts the rest of the page. (Desktop only; mobile keeps its natural flow.)
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let lastWidth = list.getBoundingClientRect().width;
    const measure = () => {
      list.style.minHeight = "";
      if (!window.matchMedia("(min-width: 1024px)").matches) return;
      const answers = Array.from(list.querySelectorAll<HTMLElement>(".faq-a"));
      if (!answers.length) return;
      const maxAns = Math.max(...answers.map((el) => el.scrollHeight));
      const openEl = list.querySelector<HTMLElement>(".faq-item.open .faq-a");
      const openAns = openEl ? openEl.scrollHeight : 0;
      // current list height already accounts for the open item's margins; swapping
      // the open answer for the tallest one gives the constant reserved height.
      const min = Math.ceil(list.offsetHeight + (maxAns - openAns));
      if (min > 0) list.style.minHeight = `${min}px`;
    };

    const raf = requestAnimationFrame(measure);
    const settle = setTimeout(measure, 350); // re-measure once fonts settle
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (Math.abs(w - lastWidth) < 1) return; // ignore our own height changes
      lastWidth = w;
      measure();
    });
    ro.observe(list);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        .faq-root {
          --accent: #E31B54;
          /* Pin dark-theme tokens locally so the FAQ stays dark on every theme
             and light mode. Children inherit these custom properties. */
          --gradient-section: linear-gradient(to bottom, rgb(20,20,20) 0%, rgb(10,10,10) 50%, rgb(0,0,0) 100%);
          --content-primary: #ffffff;
          --content-secondary: #d4d4d4;
          position: relative;
          background: var(--gradient-section, #0a0a0a);
          color: var(--content-primary, #f1f5f9);
          /* horizontal gutter matches the site standard (--site-gutter-inline) */
          --faq-pad-x: 2rem; --faq-pad-y: 7rem;
          padding: var(--faq-pad-y) var(--faq-pad-x);
          font-family: 'Inter', system-ui, sans-serif;
          border-top: 1px dashed rgba(255,255,255,0.09);
          overflow: hidden;

          /* CTA-3 frame tokens (dark defaults) — applied to the ACTIVE item only */
          --faq-frame-line: rgba(255,255,255,0.18);
          --faq-frame-glow: rgba(255,255,255,0.08);
          --faq-frame-dash: rgba(255,255,255,0.12);
          --faq-frame-mark: rgba(255,255,255,0.6);
        }
        @media(min-width:640px){ .faq-root { --faq-pad-x: 4rem; } }
        @media(min-width:768px){ .faq-root { --faq-pad-y: 9rem; --faq-pad-x: 6rem; } }
        @media(min-width:1280px){ .faq-root { --faq-pad-x: 8rem; } }
        @media(min-width:1536px){ .faq-root { --faq-pad-x: 12rem; } }

        .faq-inner { position: relative; z-index: 1; width: 100%; }
        /* Two columns on desktop: title (left) + accordions (right) */
        @media(min-width:1024px){
          .faq-inner {
            display: grid;
            grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.5fr);
            gap: 4.5rem;
            align-items: start;
          }
        }

        /* ── Header — centered when stacked, left-aligned on desktop ── */
        .faq-head { position: relative; text-align: center; margin-bottom: 3.5rem; }
        /* pixel-canvas fills the WHOLE left side — bleeds past the section padding
           (left + top edges) and fades only on the right, toward the accordion */
        .faq-canvas {
          position: absolute; z-index: 0; pointer-events: none;
          top: calc(-1 * var(--faq-pad-y)); bottom: 0;
          left: calc(-1 * var(--faq-pad-x)); right: 0;
          -webkit-mask-image: linear-gradient(to right, #000 0%, #000 86%, transparent 100%);
          mask-image: linear-gradient(to right, #000 0%, #000 86%, transparent 100%);
        }
        @media(min-width:1024px){
          .faq-canvas { bottom: calc(-1 * var(--faq-pad-y)); }
        }
        .faq-head-inner { position: relative; z-index: 1; }
        @media(min-width:1024px){
          .faq-head { text-align: left; margin-bottom: 0; align-self: stretch; }
          .faq-head-inner { position: sticky; top: 6rem; }
        }
        /* ── Title — clean, single-style heading ── */
        .faq-title {
          display: block;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.4rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          font-weight: 600;
          color: var(--content-primary, #ffffff);
        }
        .faq-subtitle {
          margin-top: 1.1rem;
          font-size: clamp(0.95rem, 2vw, 1.05rem);
          color: var(--content-secondary, rgba(255,255,255,0.55));
          line-height: 1.6;
        }

        /* ── Category group ── */
        .faq-group { margin-bottom: 3.5rem; }
        .faq-group:last-child { margin-bottom: 0; }
        /* Category label — muted uppercase monospace with a trailing hairline.
           Clean/editorial; clearly distinct from the white question rows. */
        .faq-group-label {
          display: flex; align-items: center; gap: 1rem;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.64rem; font-weight: 600;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: rgba(255,255,255,0.42);
          margin-bottom: 1.35rem;
          padding: 0 0.25rem;
        }
        .faq-group-label::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(to right, rgba(255,255,255,0.14), transparent);
        }

        /* ── Accordion item ── */
        .faq-item {
          position: relative;
          transition: margin 0.46s cubic-bezier(0.33, 1, 0.68, 1),
                      border-color 0.3s ease;
        }

        .faq-q {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
          padding: 1.4rem 1.25rem;
          background: transparent; border: none; cursor: pointer;
          text-align: left;
          font-family: inherit;
          font-size: clamp(0.95rem, 2vw, 1.05rem); font-weight: 500;
          color: var(--content-primary, #f1f5f9);
          letter-spacing: -0.01em;
          transition: color 0.2s ease;
        }
        .faq-q:hover { color: var(--accent); }

        /* plus → × toggle */
        .faq-icon { position: relative; width: 18px; height: 18px; flex-shrink: 0; }
        .faq-icon::before, .faq-icon::after {
          content: ''; position: absolute; top: 50%; left: 50%;
          background: var(--content-secondary, rgba(255,255,255,0.65));
          transition: transform 0.4s cubic-bezier(0.33, 1, 0.68, 1), background 0.25s ease;
        }
        .faq-icon::before { width: 16px; height: 1.5px; transform: translate(-50%, -50%); }
        .faq-icon::after  { width: 1.5px; height: 16px; transform: translate(-50%, -50%); }
        .faq-item.open .faq-icon { }
        .faq-item.open .faq-icon::before { transform: translate(-50%, -50%) rotate(135deg); }
        .faq-item.open .faq-icon::after  { transform: translate(-50%, -50%) rotate(135deg); }
        .faq-item.open .faq-q { color: var(--content-primary, #f1f5f9); }

        /* answer reveal */
        /* grid-rows reveal: animates to the REAL content height (no fixed max-height),
           so open/close timing always matches the content — smooth both ways */
        .faq-a-wrap {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows 0.46s cubic-bezier(0.33, 1, 0.68, 1),
                      opacity 0.3s ease;
        }
        .faq-item.open .faq-a-wrap { grid-template-rows: 1fr; opacity: 1; }
        .faq-a {
          min-height: 0; overflow: hidden;
          padding: 0 1.5rem 1.6rem;
          font-size: clamp(0.9rem, 1.9vw, 0.98rem); line-height: 1.7;
          color: var(--content-secondary, rgba(255,255,255,0.55));
          width: 100%;
          transform: translateY(-6px);
          transition: transform 0.46s cubic-bezier(0.33, 1, 0.68, 1);
        }
        .faq-item.open .faq-a { transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .faq-a-wrap, .faq-a { transition: none; }
        }

        /* ── Active panel = CTA-3 frame (border-y + radial glow), grid ONLY here ── */
        .faq-list { position: relative; }
        .faq-item.open {
          position: relative;
          border-top: 1px dashed var(--faq-frame-line);
          border-bottom: 1px dashed var(--faq-frame-line);
          background: radial-gradient(35% 80% at 25% 0%, var(--faq-frame-glow), transparent);
          margin: 2rem 0;
        }
        /* keep the question/answer above the glow + rails */
        .faq-item.open .faq-q,
        .faq-item.open .faq-a-wrap { position: relative; z-index: 1; }

        /* left/right edge rails — dashed, extend 1.5rem beyond the panel (CTA -inset-y-6) */
        .faq-rail {
          position: absolute; top: -1.5rem; bottom: -1.5rem; width: 0;
          border-left: 1px dashed var(--faq-frame-line); pointer-events: none;
          opacity: 0; transition: opacity 0.4s ease 0.06s;
        }
        .faq-item.open .faq-rail { opacity: 1; }
        .faq-rail-l { left: 0; }
        .faq-rail-r { right: 0; }

        /* corner plus-marks (CTA PlusIcon at the four corners) */
        .faq-plus {
          position: absolute; z-index: 2; color: var(--faq-frame-mark);
          pointer-events: none;
          opacity: 0; transform: scale(0.6);
          transition: opacity 0.35s ease 0.08s, transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1) 0.08s;
        }
        .faq-item.open .faq-plus { opacity: 1; transform: scale(1); }
        .faq-plus-tl { top: -12.5px; left: -11.5px; }
        .faq-plus-tr { top: -12.5px; right: -11.5px; }
        .faq-plus-bl { bottom: -12.5px; left: -11.5px; }
        .faq-plus-br { right: -11.5px; bottom: -12.5px; }

        /* reveal on scroll */
        .faq-group { opacity: 0; transform: translateY(32px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .faq-root.revealed .faq-group { opacity: 1; transform: translateY(0); }
      `}</style>

      <section id="section-faq" className={`faq-root${revealed ? " revealed" : ""}`} ref={sectionRef}>
        <div className="faq-inner">
          <div className="faq-head">
            {revealed && pixelColors.length > 0 && (
              <div className="faq-canvas" aria-hidden>
                <PixelCanvas colors={pixelColors} gap={10} speed={30} fps={30} />
              </div>
            )}
            <div className="faq-head-inner">
              <h2 className="faq-title">Frequently Asked Questions</h2>
              <p className="faq-subtitle">
                Everything you need to know about how Notus Regalia builds, funds, and operates.
              </p>
            </div>
          </div>

          <div className="faq-list" ref={listRef}>
            {FAQ_GROUPS.map((group, gi) => (
              <div
                key={group.label}
                className="faq-group"
                style={{ transitionDelay: `${gi * 120}ms` }}
              >
                <div className="faq-group-label">{group.label}</div>
                {group.items.map((item, ii) => {
                  const id = `${gi}-${ii}`;
                  const isOpen = open === id;
                  return (
                    <div key={id} className={`faq-item${isOpen ? " open" : ""}`}>
                      {/* always rendered so they fade in/out smoothly (CSS handles
                          visibility via .open) instead of popping on mount */}
                      <Plus className="faq-plus faq-plus-tl" />
                      <Plus className="faq-plus faq-plus-tr" />
                      <Plus className="faq-plus faq-plus-bl" />
                      <Plus className="faq-plus faq-plus-br" />
                      <span className="faq-rail faq-rail-l" />
                      <span className="faq-rail faq-rail-r" />
                      <button
                        className="faq-q"
                        aria-expanded={isOpen}
                        onClick={() => setOpen(isOpen ? "" : id)}
                      >
                        <span>{item.q}</span>
                        <span className="faq-icon" aria-hidden />
                      </button>
                      <div className="faq-a-wrap">
                        <p className="faq-a">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
