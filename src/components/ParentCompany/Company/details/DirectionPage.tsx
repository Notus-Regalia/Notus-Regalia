"use client";
import { UnderDevelopmentBanner } from './UnderDevelopmentTemplate';

export const meta = {
  title: 'Direction',
  subtitle: 'The strategic roadmap, long-range planning frameworks, and directional thesis guiding Notus Regalia\'s institutional trajectory.',
  eyebrow: 'Company · Direction',
};

const items = [
  { phase: 'Phase I',   title: 'Foundation & Infrastructure', period: '2024 – 2025', desc: 'Establish core operational platforms, assemble founding teams, and deploy initial technology stacks across defense and healthcare verticals.', status: 'Active' },
  { phase: 'Phase II',  title: 'Expansion & Integration',     period: '2025 – 2027', desc: 'Scale operational capacity, integrate cross-domain systems, and expand the partner network to accelerate institutional compounding.', status: 'Pending' },
  { phase: 'Phase III', title: 'Sovereign-Grade Operations',  period: '2027 – 2030', desc: 'Achieve full operational sovereignty across all verticals with self-sustaining technology ecosystems and institutional resilience.', status: 'Planned' },
  { phase: 'Phase IV',  title: 'Global Framework Deployment', period: '2030+',       desc: 'Deploy proven frameworks globally, establish institutional permanence, and transition from building to enduring operational excellence.', status: 'Vision' },
];

export default function DirectionPage() {
  return (
    <>
      <style>{`
        .rm { --rm-accent: #E31B54; display: flex; flex-direction: column; margin-top: 2.75rem; }

        .rm-row {
          display: grid;
          grid-template-columns: 2.25rem minmax(0, 1fr);
          gap: 1.25rem;
        }
        @media (min-width: 640px) {
          .rm-row { grid-template-columns: 3rem minmax(0, 1fr); gap: 1.75rem; }
        }

        /* ── Progress spine ── */
        .rm-rail { position: relative; display: flex; flex-direction: column; align-items: center; }
        .rm-node {
          margin-top: 1.55rem; flex-shrink: 0; z-index: 1;
          width: 13px; height: 13px; border-radius: 3px;
          transform: rotate(45deg);
          border: 1px solid var(--border-color);
          background: var(--gradient-card, #111);
          transition: border-color .35s ease, box-shadow .35s ease, background .35s ease;
        }
        .rm-row.is-active .rm-node {
          border-color: var(--rm-accent);
          background: var(--rm-accent);
          box-shadow: 0 0 0 4px rgba(227,27,84,0.12), 0 0 16px rgba(227,27,84,0.55);
        }
        /* upcoming segment = dashed; the active segment = solid accent fade */
        .rm-line {
          width: 0; flex: 1; min-height: 44px; margin-top: 7px;
          border-left: 1px dashed var(--border-color);
        }
        .rm-row.is-active .rm-line {
          border: 0; width: 1px;
          background: linear-gradient(to bottom, var(--rm-accent), var(--border-color));
        }

        /* ── Card ── */
        .rm-card {
          position: relative; overflow: hidden;
          margin-bottom: 1.5rem;
          padding: 1.5rem 1.75rem 1.6rem;
          border-radius: 14px;
          border: 1px solid var(--border-color);
          background: var(--gradient-card);
          transition: border-color .35s ease, transform .35s ease;
        }
        .rm-row:last-child .rm-card { margin-bottom: 0; }
        .rm-card:hover { transform: translateY(-2px); border-color: rgba(227,27,84,0.22); }
        .rm-row.is-active .rm-card {
          border-color: rgba(227,27,84,0.32);
          background:
            radial-gradient(130% 110% at 0% 0%, rgba(227,27,84,0.07), transparent 55%),
            var(--gradient-card);
        }
        /* accent left edge — always on for active, on hover for the rest */
        .rm-card::after {
          content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 2px;
          background: linear-gradient(to bottom, var(--rm-accent), transparent);
          opacity: 0; transition: opacity .35s ease;
        }
        .rm-card:hover::after, .rm-row.is-active .rm-card::after { opacity: 1; }

        /* big faint phase index watermark */
        .rm-num {
          position: absolute; top: 0.35rem; right: 1rem;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 3.25rem; font-weight: 800; line-height: 1;
          letter-spacing: -0.04em;
          color: var(--content-primary, #f1f5f9);
          opacity: 0.05; user-select: none; pointer-events: none;
        }
        .rm-row.is-active .rm-num { color: var(--rm-accent); opacity: 0.12; }

        /* ── Meta row ── */
        .rm-meta { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; margin-bottom: 0.9rem; }
        .rm-phase {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.6rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--rm-accent);
        }
        .rm-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--border-color); flex-shrink: 0; }
        .rm-period {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.58rem; letter-spacing: 0.1em; color: var(--content-faint);
        }
        .rm-status {
          margin-left: auto;
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 3px 10px; border-radius: 999px;
          border: 1px solid var(--border-color);
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.5rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--content-faint);
        }
        .rm-status::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: var(--content-faint);
        }
        .rm-row.is-active .rm-status { color: var(--rm-accent); border-color: rgba(227,27,84,0.3); }
        .rm-row.is-active .rm-status::before {
          background: var(--rm-accent);
          box-shadow: 0 0 0 0 rgba(227,27,84,0.5);
          animation: rmPulse 2.2s ease-in-out infinite;
        }
        @keyframes rmPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(227,27,84,0.5); }
          50%      { box-shadow: 0 0 0 4px rgba(227,27,84,0); }
        }

        /* ── Body ── */
        .rm-title {
          position: relative; z-index: 1;
          font-size: 1.15rem; font-weight: 650; letter-spacing: -0.015em;
          line-height: 1.25; margin-bottom: 0.6rem;
          color: var(--content-primary);
        }
        .rm-desc {
          position: relative; z-index: 1;
          font-size: 0.875rem; line-height: 1.75;
          color: var(--content-tertiary); max-width: 62ch;
        }

        @media (prefers-reduced-motion: reduce) {
          .rm-card, .rm-node, .rm-card::after { transition: none; }
          .rm-row.is-active .rm-status::before { animation: none; }
        }
      `}</style>

      <div className="rm">
        {items.map((item, i) => (
          <div key={item.phase} className={`rm-row${i === 0 ? ' is-active' : ''}`}>
            <div className="rm-rail">
              <span className="rm-node" />
              {i < items.length - 1 && <span className="rm-line" />}
            </div>

            <div className="rm-card">
              <span className="rm-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="rm-meta">
                <span className="rm-phase">{item.phase}</span>
                <span className="rm-dot" />
                <span className="rm-period">{item.period}</span>
                <span className="rm-status">{item.status}</span>
              </div>
              <h3 className="rm-title">{item.title}</h3>
              <p className="rm-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <UnderDevelopmentBanner text="Strategic Roadmap Details Coming Soon" />
    </>
  );
}
