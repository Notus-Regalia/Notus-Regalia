"use client";

import { memo } from "react";
import { StarfieldBackground } from "@/components/ui/starfield-background";

/* ─────────────────────────────────────────────────────────────
   Sleek, brand-aligned "coming soon" placeholder for each Ventures
   subtab. Operations-console aesthetic — starfield, faint grid field,
   crimson accents, monospace system label — matching the site identity.
   ───────────────────────────────────────────────────────────── */

interface ComingSoonProps {
  /** Page title (the subtab name). */
  title: string;
  /** Short supporting line under the title. */
  blurb: string;
  /** Optional sequence label, e.g. "01 / 03". */
  index?: string;
}

const VenturesComingSoon = memo(({ title, blurb, index }: ComingSoonProps) => (
  <section className="vc-root">
    <style>{`
      .vc-root {
        position: relative;
        min-height: 100vh;
        min-height: 100svh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        isolation: isolate;
        background:
          radial-gradient(ellipse 70% 55% at 50% 38%, rgba(227,27,84,0.10), transparent 70%),
          linear-gradient(180deg, #050609 0%, #07080c 55%, #040507 100%);
        color: #fff;
        padding: clamp(140px, 17vh, 184px) var(--vc-gutter, 1.5rem) clamp(4rem, 9vh, 6.5rem);
        border-bottom: 1px dashed rgba(255,255,255,0.12);
      }
      :root.light .vc-root { border-bottom-color: rgba(0,0,0,0.10); }
      @media (min-width: 640px)  { .vc-root { --vc-gutter: 4rem; } }
      @media (min-width: 768px)  { .vc-root { --vc-gutter: 6rem; } }
      @media (min-width: 1280px) { .vc-root { --vc-gutter: 8rem; } }
      @media (min-width: 1536px) { .vc-root { --vc-gutter: 12rem; } }

      :root.light .vc-root {
        background:
          radial-gradient(ellipse 70% 55% at 50% 38%, rgba(227,27,84,0.08), transparent 70%),
          linear-gradient(180deg, #f6f8fc 0%, #eef1f7 60%, #f4f6fa 100%);
        color: #0f172a;
      }

      /* Faint engineering grid field, fading out toward the edges. */
      .vc-grid {
        position: absolute; inset: 0; z-index: 0; pointer-events: none;
        background-image:
          linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
        background-size: 54px 54px;
        -webkit-mask-image: radial-gradient(ellipse 75% 60% at 50% 42%, #000 18%, transparent 78%);
        mask-image: radial-gradient(ellipse 75% 60% at 50% 42%, #000 18%, transparent 78%);
      }
      :root.light .vc-grid {
        background-image:
          linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px);
      }

      .vc-inner {
        position: relative; z-index: 2;
        display: flex; flex-direction: column; align-items: center; text-align: center;
        gap: 1.4rem; max-width: 640px; width: 100%;
      }

      /* Status label — onyx black box matching the Latest Releases tags. */
      .vc-badge {
        display: inline-flex; align-items: center;
        padding: .28rem .6rem; border-radius: 2px;
        border: 1px solid rgba(255,255,255,0.14);
        background: #141414;
        font-family: ui-monospace, Menlo, monospace;
        font-size: .62rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
        color: #f1f5f9;
      }
      :root.light .vc-badge { border-color: rgba(255,255,255,0.1); }

      .vc-index {
        font-family: ui-monospace, Menlo, monospace;
        font-size: .68rem; letter-spacing: .3em; text-transform: uppercase;
        color: rgba(255,255,255,0.32);
      }
      :root.light .vc-index { color: rgba(15,23,42,0.4); }

      .vc-title {
        margin: 0;
        font-size: clamp(2.6rem, 8vw, 4.6rem); font-weight: 700;
        letter-spacing: -0.035em; line-height: 1.02;
        background: linear-gradient(180deg, #ffffff 0%, #c8ccd4 55%, #9aa0ab 100%);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      }
      :root.light .vc-title {
        background: linear-gradient(180deg, #1e293b 0%, #334155 60%, #475569 100%);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      }

      .vc-sub {
        margin: 0; max-width: 30rem;
        font-size: clamp(.95rem, 1.8vw, 1.08rem); line-height: 1.7;
        color: rgba(226,232,240,0.62);
      }
      :root.light .vc-sub { color: rgba(15,23,42,0.62); }

      /* Indeterminate progress sliver — signals "in progress" without a fake %. */
      .vc-meter {
        position: relative; width: clamp(11rem, 32vw, 16rem); height: 2px; margin-top: .4rem;
        border-radius: 999px; overflow: hidden;
        background: rgba(255,255,255,0.10);
      }
      :root.light .vc-meter { background: rgba(15,23,42,0.10); }
      .vc-meter::before {
        content: ""; position: absolute; top: 0; left: 0; height: 100%; width: 40%;
        border-radius: inherit;
        background: linear-gradient(90deg, transparent, #E31B54, transparent);
        animation: vcMeter 1.9s cubic-bezier(0.4,0,0.2,1) infinite;
      }
      @keyframes vcMeter { 0% { left: -40%; } 100% { left: 100%; } }

      .vc-cta {
        margin-top: .9rem;
        display: inline-flex; align-items: center; gap: .55rem;
        padding: .7rem 1.3rem; border-radius: 9px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(255,255,255,0.03);
        color: rgba(255,255,255,0.82); text-decoration: none;
        font-size: .9rem; font-weight: 500;
        transition: transform .25s ease, border-color .25s ease, color .25s ease, background .25s ease;
      }
      .vc-cta:hover {
        transform: translateY(-2px); color: #fff;
        border-color: rgba(227,27,84,0.6); background: rgba(227,27,84,0.10);
      }
      :root.light .vc-cta { color: rgba(15,23,42,0.78); border-color: rgba(15,23,42,0.16); }
      :root.light .vc-cta:hover { color: #0f172a; }
      .vc-cta i { transition: transform .2s ease; }
      .vc-cta:hover i { transform: translateX(3px); }
    `}</style>

    <StarfieldBackground position="absolute" count={200} speed={0.32} starColor="#ffffff" twinkle />
    <div className="vc-grid" aria-hidden />

    <div className="vc-inner">
      <span className="vc-badge">In Development</span>
      {index && <span className="vc-index">{index}</span>}
      <h1 className="vc-title">{title}</h1>
      <p className="vc-sub">{blurb}</p>
      <div className="vc-meter" aria-hidden />
      <a className="vc-cta" href="/company/about">
        <i className="bi bi-arrow-left" />
        <span>Back to Company</span>
      </a>
    </div>
  </section>
));

VenturesComingSoon.displayName = "VenturesComingSoon";

export default VenturesComingSoon;
