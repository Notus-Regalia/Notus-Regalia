"use client";

import { memo, useState } from "react";
import { trackBrandGlow } from "./blocks";

/* ─────────────────────────────────────────────────────────────
   Interactive section bodies for the Human Rights page. Each one
   has its own layout/interaction so the page never reads as a
   repeating card grid.

   Brand language (not generic red neon): dark --surface-card panels
   with white hairline insets, the site's rainbow gradient as the
   accent — animated orbit for active/selected states, cursor-follow
   for hover — and onyx (#141414) monospace chips for meta tags.

   Fixed footprint: every section reserves the height of its tallest
   state (switchable panels stack all states in one grid cell; hover
   reveals fade in over reserved space), so opening/switching content
   never resizes the section or shifts the page.
   ───────────────────────────────────────────────────────────── */

/* ── 1 · Frameworks — selectable list ⇄ detail panel ── */
const FRAMEWORKS = [
  {
    key: "ibhr",
    label: "International Bill of Human Rights",
    scope: "Foundation",
    body: "We respect every right expressed in the Universal Declaration of Human Rights and the two International Covenants — the baseline against which all of our work is measured.",
  },
  {
    key: "ungp",
    label: "UN Guiding Principles & OECD",
    scope: "Implementation",
    body: "We operationalize our commitment through the UN Guiding Principles on Business and Human Rights and the OECD Guidelines for Multinational Enterprises — protect, respect, and remedy.",
  },
  {
    key: "ihl",
    label: "Law of Armed Conflict",
    scope: "Defense",
    body: "For defense-related work, international humanitarian law and the Voluntary Principles on Security and Human Rights govern our conduct — distinction, proportionality, and precaution.",
  },
];

export const FrameworkSwitcher = memo(() => {
  const [active, setActive] = useState(0);
  return (
    <div className="hr-fw">
      <div className="hr-fw-list" role="tablist" aria-label="Frameworks">
        {FRAMEWORKS.map((it, i) => (
          <button
            key={it.key}
            role="tab"
            aria-selected={i === active}
            className={`hr-tab${i === active ? " active" : ""}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
          >
            <span className="hr-tab-idx">{String(i + 1).padStart(2, "0")}</span>
            <span className="hr-tab-label">{it.label}</span>
            <i className="bi bi-arrow-right hr-tab-arrow" />
          </button>
        ))}
      </div>
      <div className="hr-panel hr-glow" onMouseMove={trackBrandGlow}>
        <div className="hr-stack">
          {FRAMEWORKS.map((it, i) => (
            <div key={it.key} className={`hr-stack-item${i === active ? " show" : ""}`} aria-hidden={i !== active}>
              <span className="hr-chip">{it.scope}</span>
              <p className="hr-panel-body">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
FrameworkSwitcher.displayName = "FrameworkSwitcher";

/* ── 2 · Focus — two spotlight tiles; detail reserved + revealed ── */
const FOCUS = [
  {
    key: "health",
    icon: "bi-heart-pulse",
    title: "Healthcare",
    lead: "Systems must widen access to care, never narrow it.",
    body: "A clinician — not a model — remains the decision-maker of record in every clinical workflow we ship. Degraded infrastructure may degrade features, never safety.",
  },
  {
    key: "defense",
    icon: "bi-crosshair",
    title: "Defense & National Security",
    lead: "Meaningful human control, always.",
    body: "Our systems will not select and engage human targets without accountable human judgment in the loop — consistent with distinction, proportionality, and precaution.",
  },
];

export const FocusDuo = memo(() => (
  <div className="hr-focus">
    {FOCUS.map((t) => (
      <article key={t.key} className="hr-focus-tile hr-glow" onMouseMove={trackBrandGlow}>
        <i className={`bi ${t.icon} hr-focus-icon`} />
        <h3 className="hr-focus-title">{t.title}</h3>
        <p className="hr-focus-lead">{t.lead}</p>
        <p className="hr-focus-body">{t.body}</p>
      </article>
    ))}
  </div>
));
FocusDuo.displayName = "FocusDuo";

/* ── 3 · Red lines — a refusal ledger; detail reserved + revealed ── */
const RED_LINES = [
  { title: "No Autonomous Lethal Force", body: "No systems that select and engage human targets without meaningful human control." },
  { title: "No Tools of Repression", body: "No systems for unlawful mass surveillance, suppression of dissent, or persecution of protected groups." },
  { title: "No Discriminatory Care", body: "No healthcare systems that gate, ration, or degrade care on discriminatory grounds." },
  { title: "No Sanctioned End Users", body: "No sales to embargoed regimes, sanctioned entities, or buyers who conceal end use." },
  { title: "No Forced or Child Labor", body: "No tolerance for forced, bonded, trafficked, or child labor in our operations or supply chain." },
  { title: "No Retaliation", body: "No retaliation — ever — against anyone who raises a concern in good faith." },
];

export const RedLinesList = memo(() => (
  <div className="hr-rl">
    {RED_LINES.map((r, i) => (
      <div key={r.title} className="hr-rl-row" tabIndex={0}>
        <span className="hr-rl-mark">
          <span className="hr-rl-idx">{String(i + 1).padStart(2, "0")}</span>
          <i className="bi bi-slash-lg hr-rl-x" />
        </span>
        <div>
          <h3 className="hr-rl-title">{r.title}</h3>
          <p className="hr-rl-body">{r.body}</p>
        </div>
      </div>
    ))}
  </div>
));
RedLinesList.displayName = "RedLinesList";

/* ── 4 · Accountability — clickable stepper ⇄ detail ── */
const STEPS = [
  { tag: "Continuous", name: "Due Diligence", title: "Human Rights Due Diligence", body: "Every engagement is screened for risk at intake. High-sensitivity work undergoes enhanced review before signature, and deployed engagements are re-assessed on a defined cycle, on material change, and on credible allegation." },
  { tag: "Engineered", name: "Rights by Design", title: "Safeguards built into the system", body: "Auditable logs of consequential actions, role-based command accountability, abuse-resistant defaults, and kill-switch and revocation mechanisms enforceable under our license terms." },
  { tag: "Open", name: "Access to Remedy", title: "A grievance channel for anyone affected", body: "A confidential channel built to the UNGP 31 effectiveness criteria — legitimate, accessible, predictable, and equitable — open to employees, patients, civilians, customers, and communities alike." },
  { tag: "Annual", name: "Transparency", title: "Reporting you can examine", body: "An annual human-rights disclosure following the UNGP Reporting Framework: salient risks, how diligence changed our engagements, grievance outcomes in aggregate, and remediation undertaken." },
];

export const AccountabilityStepper = memo(() => {
  const [active, setActive] = useState(0);
  return (
    <div className="hr-step">
      <div className="hr-step-nav" role="tablist" aria-label="Accountability mechanisms">
        {STEPS.map((it, i) => (
          <button
            key={it.name}
            role="tab"
            aria-selected={i === active}
            className={`hr-tab hr-step-node${i === active ? " active" : ""}`}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            <span className="hr-tab-idx">{String(i + 1).padStart(2, "0")}</span>
            <span className="hr-tab-label">{it.name}</span>
          </button>
        ))}
      </div>
      <div className="hr-panel hr-glow" onMouseMove={trackBrandGlow}>
        <div className="hr-stack">
          {STEPS.map((it, i) => (
            <div key={it.name} className={`hr-stack-item${i === active ? " show" : ""}`} aria-hidden={i !== active}>
              <span className="hr-chip">{it.tag}</span>
              <h3 className="hr-step-title">{it.title}</h3>
              <p className="hr-panel-body">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
AccountabilityStepper.displayName = "AccountabilityStepper";

/* ── Shared styles (render once per page) ── */
export const HumanRightsStyles = () => <style>{HR_CSS}</style>;

const HR_CSS = `
/* ── Fixed section rhythm: equal, generous space top & bottom so the
   sections read as stable bands and never shift as content changes. ── */
#hr-commitment, #hr-focus, #hr-red-lines, #hr-accountability, #hr-learn-more {
  padding-top: clamp(7rem, 17vh, 13rem);
  padding-bottom: clamp(7rem, 17vh, 13rem);
}

/* Cursor-following rainbow glow border (brand signature) */
.hr-glow::before {
  content: ""; position: absolute; inset: 0; z-index: 1; border-radius: inherit;
  padding: 1px; pointer-events: none;
  background: radial-gradient(
    420px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(0, 255, 166, 0.86) 0%, rgba(255, 215, 0, 0.72) 22%,
    rgba(236, 72, 153, 0.68) 44%, rgba(147, 51, 234, 0.62) 62%,
    rgba(59, 130, 246, 0.56) 76%, transparent 88%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity .24s ease;
}
.hr-glow:hover::before { opacity: 1; }
.hr-glow > * { position: relative; z-index: 2; }

@keyframes hrOrbit { to { background-position: 200% 0; } }

/* ── Shared control surface: dark card + white hairline inset (brand) ── */
.hr-tab {
  position: relative; display: flex; align-items: center; gap: .9rem; width: 100%; text-align: left;
  padding: 1rem 1.15rem; border-radius: 12px; cursor: pointer; font: inherit;
  border: 1px solid var(--border-color); background: var(--surface-card);
  box-shadow: inset 0 1px 0 var(--glass-inset-top);
  color: var(--content-faint);
  transition: color .2s ease, border-color .2s ease;
}
.hr-tab:hover { color: var(--content-primary); border-color: var(--content-faint); }
.hr-tab.active { color: var(--content-primary); border-color: transparent; }
/* Brand rainbow orbit ring — the selected indicator (replaces the red accent) */
.hr-tab::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none;
  background: linear-gradient(90deg,
    rgba(0,255,166,0) 0%, rgba(0,255,166,0.9) 15%, rgba(255,215,0,0.7) 30%,
    rgba(236,72,153,0.7) 45%, rgba(147,51,234,0.7) 60%, rgba(59,130,246,0.6) 75%,
    rgba(0,255,166,0) 90%);
  background-size: 200% 100%;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity .3s ease;
}
.hr-tab.active::after { opacity: 1; animation: hrOrbit 3.5s linear infinite; }
.hr-tab-idx { font-family: ui-monospace, Menlo, monospace; font-size: .72rem; font-weight: 700; color: var(--content-faint); flex-shrink: 0; transition: color .2s ease; }
.hr-tab.active .hr-tab-idx { color: var(--content-primary); }
.hr-tab-label { font-size: .95rem; font-weight: 600; letter-spacing: -0.01em; }
.hr-tab-arrow { margin-left: auto; font-size: .8rem; opacity: 0; transform: translateX(-4px); transition: opacity .2s ease, transform .2s ease; }
.hr-tab.active .hr-tab-arrow { opacity: 1; transform: none; }

/* ── Shared detail panel + onyx chip ── */
.hr-panel {
  position: relative; overflow: hidden;
  border: 1px solid var(--border-color); border-radius: 14px;
  padding: clamp(1.5rem, 3vw, 2.25rem); background: var(--surface-card);
  box-shadow: inset 0 1px 0 var(--glass-inset-top);
  display: flex; flex-direction: column; justify-content: center; min-height: 180px;
}
/* Stack every state in one grid cell so the panel always reserves the tallest
   one — switching never changes its height. */
.hr-stack { display: grid; }
.hr-stack > * { grid-area: 1 / 1; display: flex; flex-direction: column; gap: 1rem; }
.hr-stack-item { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity .35s ease; }
.hr-stack-item.show { opacity: 1; visibility: visible; pointer-events: auto; }
.hr-panel-body { margin: 0; font-size: clamp(1rem, 2vw, 1.15rem); line-height: 1.7; color: var(--content-primary); }
.hr-chip {
  align-self: flex-start;
  font-family: ui-monospace, Menlo, monospace; font-size: .6rem; font-weight: 700;
  letter-spacing: .18em; text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.14); border-radius: 2px;
  padding: .25rem .6rem; background: #141414; color: #f1f5f9; white-space: nowrap;
}
:root.light .hr-chip { border-color: rgba(255,255,255,0.1); }

/* 1 · Framework switcher layout */
.hr-fw { display: grid; gap: 1.1rem; }
@media (min-width: 860px) {
  .hr-fw { grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); gap: 1.75rem; align-items: stretch; }
}
.hr-fw-list { display: flex; flex-direction: column; gap: .55rem; }

/* 2 · Focus spotlight tiles */
.hr-focus { display: grid; gap: 1.1rem; align-items: stretch; }
@media (min-width: 760px) { .hr-focus { grid-template-columns: 1fr 1fr; } }
.hr-focus-tile {
  position: relative; overflow: hidden;
  border: 1px solid var(--border-color); border-radius: 16px;
  padding: clamp(1.5rem, 3vw, 2.25rem);
  background: linear-gradient(180deg, var(--hover-bg), transparent 140%);
  box-shadow: inset 0 1px 0 var(--glass-inset-top);
  transition: opacity .3s ease;
}
.hr-focus:hover .hr-focus-tile:not(:hover) { opacity: .5; }
.hr-focus-icon { font-size: 1.55rem; color: var(--content-primary); }
.hr-focus-title { margin: .9rem 0 .45rem; font-size: clamp(1.2rem, 2.4vw, 1.45rem); font-weight: 700; letter-spacing: -0.02em; color: var(--content-primary); }
.hr-focus-lead { margin: 0; font-size: .98rem; line-height: 1.6; color: var(--content-muted); }
/* Detail text stays in flow (space reserved); only fades in on hover, so the
   tile height is fixed and the section never grows. */
.hr-focus-body {
  margin: .9rem 0 0; font-size: .9rem; line-height: 1.65; color: var(--content-faint);
  opacity: 0; transform: translateY(6px);
  transition: opacity .3s ease, transform .35s cubic-bezier(.33,1,.68,1);
}
.hr-focus-tile:hover .hr-focus-body, .hr-focus-tile:focus-within .hr-focus-body { opacity: 1; transform: none; }

/* 3 · Refusal ledger */
.hr-rl { border-top: 1px solid var(--border-color); }
.hr-rl-row {
  position: relative; display: grid; grid-template-columns: auto 1fr; gap: 1.1rem; align-items: start;
  padding: 1.15rem .35rem; border-bottom: 1px solid var(--border-color); outline: none;
  transition: padding-left .3s ease, background .25s ease;
}
.hr-rl-row:hover, .hr-rl-row:focus-visible { padding-left: 1.15rem; background: var(--hover-bg); }
/* brand rainbow rail draws down on hover (replaces the red line) */
.hr-rl-row::before {
  content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; border-radius: 999px;
  background: linear-gradient(180deg, rgba(0,255,166,0.9), rgba(236,72,153,0.8) 50%, rgba(59,130,246,0.7));
  transform: scaleY(0); transform-origin: top; transition: transform .35s cubic-bezier(.33,1,.68,1);
}
.hr-rl-row:hover::before, .hr-rl-row:focus-visible::before { transform: scaleY(1); }
.hr-rl-mark { display: inline-flex; align-items: center; gap: .7rem; padding-top: .1rem; color: var(--content-faint); transition: color .25s ease; }
.hr-rl-row:hover .hr-rl-mark, .hr-rl-row:focus-visible .hr-rl-mark { color: var(--content-primary); }
.hr-rl-idx { font-family: ui-monospace, Menlo, monospace; font-size: .72rem; font-weight: 700; }
.hr-rl-x { font-size: .9rem; }
.hr-rl-title { margin: 0; font-size: 1.02rem; font-weight: 650; letter-spacing: -0.01em; color: var(--content-primary); }
/* reserved in flow; fades in on hover (no height change → no section reflow) */
.hr-rl-body {
  margin: .5rem 0 0; font-size: .9rem; line-height: 1.6; color: var(--content-muted);
  opacity: 0; transform: translateY(-4px);
  transition: opacity .3s ease, transform .35s cubic-bezier(.33,1,.68,1);
}
.hr-rl-row:hover .hr-rl-body, .hr-rl-row:focus-visible .hr-rl-body { opacity: 1; transform: none; }

/* 4 · Accountability stepper layout */
.hr-step { display: grid; gap: 1.1rem; }
.hr-step-nav { display: grid; grid-template-columns: repeat(2, 1fr); gap: .55rem; }
@media (min-width: 760px) { .hr-step-nav { grid-template-columns: repeat(4, 1fr); } }
.hr-step-node { flex-direction: column; align-items: flex-start; gap: .35rem; }
.hr-step-node .hr-tab-idx { font-size: .7rem; }
.hr-step-node .hr-tab-label { font-size: .92rem; }
.hr-step-title { margin: .25rem 0 .6rem; font-size: clamp(1.05rem, 2.2vw, 1.2rem); font-weight: 700; letter-spacing: -0.01em; color: var(--content-primary); }

/* Touch / no-hover: reveal the reserved detail text */
@media (hover: none) {
  .hr-focus-body { opacity: 1; transform: none; }
  .hr-rl-body { opacity: 1; transform: none; }
  .hr-rl-row::before { transform: scaleY(1); }
}
@media (prefers-reduced-motion: reduce) {
  .hr-tab.active::after { animation: none; }
}
`;
