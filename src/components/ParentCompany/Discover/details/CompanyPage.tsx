"use client";
import { UnderDevelopmentBanner } from './UnderDevelopmentTemplate';

export const meta = {
  title: 'The Company',
  subtitle: 'An extended profile into the formation, structure, and operational philosophy of Notus Regalia as an institution.',
  eyebrow: 'Company Profile',
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <span style={{
      display: 'block',
      fontFamily: 'ui-monospace, Menlo, monospace',
      fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase',
      color: '#E31B54', fontWeight: 700, marginBottom: '1.25rem',
    }}>
      {text}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 400,
      letterSpacing: '-0.03em', lineHeight: 1.15,
      background: 'var(--text-gradient)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      margin: 0, marginBottom: '1.25rem',
    }}>
      {children}
    </h2>
  );
}

function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="cp-body-text"
      style={{
        color: 'var(--content-muted)', margin: 0, marginBottom: '1.75rem',
        textAlign: 'justify',
      }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return (
    <div style={{
      width: '100%', height: '1px', margin: '2.5rem 0',
      background: 'linear-gradient(90deg, #E31B54 0%, rgba(227,27,84,0.4) 25%, rgba(255,255,255,0.08) 60%, transparent 100%)',
    }} />
  );
}

function ContentBlock({
  eyebrow,
  title,
  paragraphs,
}: {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
}) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {eyebrow && <SectionLabel text={eyebrow} />}
      <SectionTitle>{title}</SectionTitle>
      {paragraphs.map((p, i) => (
        <BodyText key={i}>{p}</BodyText>
      ))}
    </div>
  );
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'what-we-do',   label: 'What We Do'   },
  { key: 'why-we-exist', label: 'Why We Exist' },
  { key: 'timeline',     label: 'Timeline'     },
] as const;
type TabKey = typeof TABS[number]['key'];

// ─── Page ────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';

const TAB_ORBIT_STYLE = `
  @keyframes cpTabIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cpTabOut {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-10px); }
  }
  .cp-content-enter {
    animation: cpTabIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  .cp-content-exit {
    animation: cpTabOut 0.2s cubic-bezier(0.4, 0, 0.2, 1) both;
    pointer-events: none;
  }
    0%   { background-position: 0% 0%; }
    100% { background-position: 200% 0%; }
  }
  .cp-body-text { font-size: 0.85rem; line-height: 1.625; }
  @media (min-width: 640px)  { .cp-body-text { font-size: 1rem; } }
  @media (min-width: 768px)  { .cp-body-text { font-size: 1.2rem; } }
  @media (min-width: 1024px) { .cp-body-text { font-size: 1.4rem; } }
  .cp-tab-border {
    display: inline-flex; flex-shrink: 0;
    border-radius: 10.5px; padding: 1px;
    position: relative; background: transparent; isolation: isolate;
  }
  .cp-tab-border::before {
    content: ''; position: absolute; inset: 0; z-index: 0;
    border-radius: 10.5px;
    background: linear-gradient(90deg,
      rgba(0,255,166,0.0) 0%, rgba(0,255,166,0.9) 15%,
      rgba(255,215,0,0.7) 30%, rgba(236,72,153,0.7) 45%,
      rgba(147,51,234,0.7) 60%, rgba(59,130,246,0.6) 75%,
      rgba(0,255,166,0.0) 90%);
    background-size: 200% 100%;
    animation: companyTabOrbit 3s linear infinite;
    opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
  }
  .cp-tab-border:hover::before { opacity: 1; }
  .cp-tab-border-active::before { opacity: 1; }
  .cp-tab-btn {
    position: relative; z-index: 1;
    display: inline-flex; align-items: center; justify-content: center;
    border: none; border-radius: 9.5px;
    padding: 0.8rem 1.25rem;
    font-family: inherit;
    font-size: 0.88rem; font-weight: 500; letter-spacing: 0.01em; line-height: 1;
    cursor: pointer; user-select: none; white-space: nowrap;
    background: var(--navbar-bg, #0f0f0f);
    color: var(--content-faint, rgba(255,255,255,0.45));
    box-shadow: 0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 var(--glass-inset-top, rgba(255,255,255,0.06));
    transition: color 0.15s ease, background 0.15s ease, box-shadow 0.2s ease;
  }
  @media (min-width: 640px) { .cp-tab-btn { padding: 0.9rem 2rem; } }
  .cp-tab-border:hover .cp-tab-btn {
    color: var(--content-primary, rgba(255,255,255,0.92));
    box-shadow: 0 4px 14px rgba(0,0,0,0.26), inset 0 1px 0 var(--glass-inset-top, rgba(255,255,255,0.06));
  }
  .cp-tab-btn-active {
    color: var(--content-primary, rgba(255,255,255,0.92));
    font-weight: 600;
    background: var(--navbar-bg-active, #1a1a1a);
    box-shadow: 0 4px 14px rgba(0,0,0,0.26), inset 0 1px 0 var(--glass-inset-top, rgba(255,255,255,0.06));
  }
  :root.light .cp-tab-btn {
    background: #ffffff; color: rgba(0,0,0,0.45);
    box-shadow: 0 2px 6px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1);
    outline: 1px solid rgba(0,0,0,0.11);
  }
  :root.light .cp-tab-border:hover .cp-tab-btn {
    color: rgba(0,0,0,0.9);
    box-shadow: 0 4px 12px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,1);
    outline: 1px solid rgba(0,0,0,0.15);
  }
  :root.light .cp-tab-btn-active {
    background: #f5f5f5; color: rgba(0,0,0,0.9);
    box-shadow: 0 2px 8px rgba(0,0,0,0.13), 0 5px 20px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.8);
    outline: 1px solid rgba(0,0,0,0.15);
  }
`;

export default function CompanyPage() {
  const [active, setActive] = useState<TabKey>('what-we-do');
  const [displayed, setDisplayed] = useState<TabKey>('what-we-do');
  const [animClass, setAnimClass] = useState('cp-content-enter');
  const isAnimating = useRef(false);

  const handleTabChange = (key: TabKey) => {
    if (key === active || isAnimating.current) return;
    isAnimating.current = true;
    setAnimClass('cp-content-exit');
    setTimeout(() => {
      setActive(key);
      setDisplayed(key);
      setAnimClass('cp-content-enter');
      setTimeout(() => { isAnimating.current = false; }, 350);
    }, 200);
  };

  return (
    <>
      <style>{TAB_ORBIT_STYLE}</style>

      {/* Tab navigation */}
      <div style={{
        display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
        marginTop: '2rem', marginBottom: '0.75rem',
      }}>
        {TABS.map(tab => {
          const isActive = active === tab.key;
          return (
            <div
              key={tab.key}
              className={`cp-tab-border${isActive ? ' cp-tab-border-active' : ''}`}
            >
              <button
                className={`cp-tab-btn${isActive ? ' cp-tab-btn-active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Crimson divider under tabs */}
      <div style={{
        width: '100%', height: '1px', marginBottom: '2rem',
        background: 'linear-gradient(90deg, #E31B54 0%, rgba(227,27,84,0.4) 25%, rgba(255,255,255,0.08) 60%, transparent 100%)',
      }} />

      {/* Animated content wrapper */}
      <div className={animClass}>

      {/* ── What We Do ── */}
      {displayed === 'what-we-do' && (
        <div>
          <ContentBlock
            eyebrow="01 — What We Do"
            title="We build foundational information systems for complex, real-world data."
            paragraphs={[
              "At Notus Regalia, we believe the next wave of Philippine tech innovation won't just be about flashy apps—it will be about strategic intelligence. We're a startup designing the future of connected information systems, built for leaders who demand true strategic intelligence.",
              "Having data is one thing; having command over it is another. Think of us as the builders of your ultimate digital engine. We engineer the heavy-duty backend architecture that wrangles complex, real-world data and bring it to life through modernized, advanced interfaces.",
              "We don't just give you a place to look at numbers; we give you a true command and control center. By turning raw information into crystal-clear, interactive environments, we empower teams to cut through the noise and make confident, razor-sharp decisions.",
              "We're quietly building in stealth mode right now, but our vision is massive: to engineer the data ecosystems that will power the next generation of high-impact tech ventures and give Philippine businesses absolute control over their future.",
            ]}
          />

          <Divider />

          <ContentBlock
            eyebrow="02 — What We Do"
            title="We are not simply a data company."
            paragraphs={[
              'People often hear "information systems" and assume we\'re a data analytics firm. But at Notus Regalia, our work goes far beyond analytics. We are the architects of command and control for industries where there is zero margin for error.',
              "From defense networks and healthcare systems to civic infrastructure, we build the digital engines that keep high-stakes operations running. In these sectors, leaders don't just need to see information; they need strategic intelligence to execute real-time decisions with total authority. We build the resilient backends and advanced interfaces that allow them to oversee the battlefield, manage a hospital network, or coordinate a city. We give them the tools to turn chaos into order, instantly.",
            ]}
          />
        </div>
      )}

      {/* ── Why We Exist ── */}
      {displayed === 'why-we-exist' && (
        <div>
          <ContentBlock
            eyebrow="01 — Why We Exist"
            title="Because the future won't build itself. Someone has to make the first move."
            paragraphs={[
              'We exist because the systems running our most critical sectors are too often fragmented, outdated, or painfully siloed. In high-stakes environments like defense, healthcare, and civic infrastructure, having only a partial view of the battlefield—whether literal or operational—leads to compromised decisions.',
              'We are here to change that. Our mission is to completely modernize Philippine command and control, but more importantly, to make it holistic.',
              "We don't believe in just patching a shiny new interface onto a broken, legacy database. True command and control requires connecting every single dot. We engineer the entire operational nervous system from the ground up—bridging heavy-duty backend architecture with advanced, synchronized interfaces. We exist to give leaders a unified, real-time view of their entire operation, turning fragmented chaos into complete, centralized clarity.",
            ]}
          />

          <Divider />

          <ContentBlock
            eyebrow="02 — Why We Exist"
            title="Born from a belief that builders closest to the problem should own the solution."
            paragraphs={[
              'For too long, critical Philippine infrastructure has relied on off-the-shelf, imported systems that were never truly designed for our unique operational realities. At Notus Regalia, we are rewriting that script.',
              "We were born from a simple but radical belief: the people who most intimately understand the local landscape—its friction, its complexities, and its stakes—are the exact people who should be architecting the systems to master it.",
              "We are a team of engineers and innovators building world-class tech right here at home. We aren't waiting for outside solutions to modernize our defense networks, hospitals, or cities. We are taking ownership. By empowering the builders closest to the problem, we are engineering the foundation ourselves—and proving that the next generation of high-impact, mission-critical technology belongs in the Philippines.",
            ]}
          />
        </div>
      )}

      {/* ── Timeline ── */}
      {displayed === 'timeline' && (
        <UnderDevelopmentBanner text="Company Timeline Under Development" />
      )}

      </div> {/* end animated content wrapper */}
    </>
  );
}