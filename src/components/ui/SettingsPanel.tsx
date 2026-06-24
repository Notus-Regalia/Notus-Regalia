"use client";
import { useState, useEffect } from 'react';
import {
  getConsent, setConsent, getPreferences, setPreferences,
  clearConsent, clearPreferences, clearSiteCache, clearSefirahTutorial,
} from '@/utils/consent';

// Cookie consent + user-preference controls. Lives in the Sefirah assistant's
// Settings tab (moved out of Information Central). Reads/writes the shared
// consent + preference stores so it stays in sync with the cookie banner.

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--content-primary)' }}>
    {children}
  </h3>
);

const Toggle = ({ on, locked, onChange }: { on: boolean; locked?: boolean; onChange?: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    disabled={locked}
    onClick={locked ? undefined : onChange}
    className="relative flex-shrink-0 rounded-full transition-colors"
    style={{
      width: 42, height: 24,
      background: on ? '#E31B54' : 'var(--hover-bg-strong, rgba(120,120,130,0.3))',
      border: '1px solid var(--border-color)',
      cursor: locked ? 'not-allowed' : 'pointer',
      opacity: locked ? 0.55 : 1,
    }}
  >
    <span
      className="absolute top-1/2 rounded-full transition-all"
      style={{
        width: 18, height: 18,
        left: on ? 21 : 3,
        transform: 'translateY(-50%)',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
      }}
    />
  </button>
);

type PrefRow = { id: string; title: string; desc: string; locked?: boolean; default: boolean };
type PrefGroup = { heading: string; rows: PrefRow[] };

const PREF_GROUPS: PrefGroup[] = [
  {
    heading: 'Cookie Settings',
    rows: [
      { id: 'essential',     title: 'Strictly Necessary', desc: 'Required for the site to function. Always on.', locked: true, default: true },
      { id: 'analytics',     title: 'Analytics',          desc: 'Helps us understand usage to improve the experience.', default: true },
      { id: 'personalization', title: 'Personalization',  desc: 'Remembers your choices to tailor content.', default: true },
      { id: 'marketing',     title: 'Marketing',          desc: 'Used to measure and deliver relevant campaigns.', default: false },
    ],
  },
  {
    heading: 'User Preferences',
    rows: [
      { id: 'emails',        title: 'Product & Release Emails', desc: 'Occasional updates about new releases and research.', default: false },
      { id: 'reducedMotion', title: 'Reduced Motion',           desc: 'Minimize animations and motion effects.', default: false },
      { id: 'highContrast',  title: 'High Contrast',            desc: 'Increase contrast for improved readability.', default: false },
    ],
  },
];

const ActionButton = ({
  onClick, disabled, danger, children,
}: {
  onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex-shrink-0 rounded-xl font-semibold transition-colors"
    style={{
      padding: '0.55rem 1rem',
      fontSize: '0.8rem',
      whiteSpace: 'nowrap',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      border: `1px solid ${danger ? 'rgba(227,27,84,0.5)' : 'var(--border-color)'}`,
      background: 'var(--hover-bg)',
      color: danger ? '#E31B54' : 'var(--content-secondary)',
    }}
  >
    {children}
  </button>
);

export default function SettingsPanel() {
  const [state, setState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    PREF_GROUPS.forEach((g) => g.rows.forEach((r) => { init[r.id] = r.default; }));
    return init;
  });
  const [clearing, setClearing] = useState(false);
  const [cacheMsg, setCacheMsg] = useState<string | null>(null);

  // Hydrate from the shared stores so this panel reflects the banner's choice.
  useEffect(() => {
    const c = getConsent();
    const p = getPreferences();
    setState((s) => ({
      ...s,
      essential: true,
      analytics: c.analytics,
      personalization: c.personalization,
      marketing: c.marketing,
      emails: p.emails,
      reducedMotion: p.reducedMotion,
      highContrast: p.highContrast,
    }));
  }, []);

  // Persist the full consent + preference sets from a state snapshot. Called on
  // every toggle so each change saves immediately (no explicit Save button).
  const persist = (s: Record<string, boolean>) => {
    setConsent({
      analytics: !!s.analytics,
      personalization: !!s.personalization,
      marketing: !!s.marketing,
    });
    setPreferences({
      emails: !!s.emails,
      reducedMotion: !!s.reducedMotion,
      highContrast: !!s.highContrast,
    });
  };

  const toggle = (id: string) => {
    const next = { ...state, [id]: !state[id] };
    setState(next);
    persist(next);
  };

  const handleClearCache = async () => {
    setClearing(true);
    setCacheMsg(null);
    await clearSiteCache();
    setClearing(false);
    setCacheMsg('Cached data cleared — reloading…');
    setTimeout(() => window.location.reload(), 900);
  };

  const handleResetConsent = () => {
    clearConsent();
    clearPreferences();
    clearSefirahTutorial();
    setState((s) => {
      const next = { ...s };
      PREF_GROUPS.forEach((g) => g.rows.forEach((r) => { next[r.id] = r.default; }));
      next.essential = true;
      return next;
    });
    setCacheMsg('Reload the site for changes.');
  };

  return (
    <div className="space-y-8">
      {PREF_GROUPS.map((group) => (
        <div key={group.heading}>
          <Heading>{group.heading}</Heading>
          <div className="space-y-3">
            {group.rows.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-4 rounded-2xl p-4"
                style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--content-secondary)' }}>{row.title}</span>
                    {row.locked && (
                      <span className="text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'var(--hover-bg-strong, rgba(120,120,130,0.18))', color: 'var(--content-muted)' }}>Required</span>
                    )}
                  </div>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--content-muted)' }}>{row.desc}</p>
                </div>
                <Toggle on={state[row.id]} locked={row.locked} onChange={() => toggle(row.id)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ── Data & Cache ── */}
      <div>
        <Heading>Data &amp; Cache</Heading>
        <div className="space-y-3">
          <div
            className="flex items-center justify-between gap-4 rounded-2xl p-4"
            style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="min-w-0">
              <span className="font-semibold text-sm" style={{ color: 'var(--content-secondary)' }}>Clear cached data</span>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--content-muted)' }}>
                Remove locally cached files and temporary session data, then reload with a fresh copy of the site.
              </p>
            </div>
            <ActionButton onClick={handleClearCache} disabled={clearing}>
              {clearing ? 'Clearing…' : 'Clear cache'}
            </ActionButton>
          </div>

          <div
            className="flex items-center justify-between gap-4 rounded-2xl p-4"
            style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="min-w-0">
              <span className="font-semibold text-sm" style={{ color: 'var(--content-secondary)' }}>Reset cookie &amp; site preferences</span>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--content-muted)' }}>
                Forget your consent and preference choices. The cookie banner will appear again on your next visit.
              </p>
            </div>
            <ActionButton onClick={handleResetConsent} danger>Reset</ActionButton>
          </div>
        </div>

        {cacheMsg && (
          <span className="text-sm inline-flex items-center gap-1.5 mt-3" style={{ color: 'var(--content-muted)' }}>
            <i className="bi bi-info-circle-fill" style={{ color: '#22c55e' }} /> {cacheMsg}
          </span>
        )}
      </div>
    </div>
  );
}
