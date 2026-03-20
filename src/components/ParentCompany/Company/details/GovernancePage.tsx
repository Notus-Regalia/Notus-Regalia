"use client";
import { IconCard, UnderDevelopmentBanner } from './UnderDevelopmentTemplate';

export const meta = {
  title: 'Governance',
  subtitle: 'The institutional governance structures, accountability frameworks, and compliance mechanisms that ensure integrity at every operational level.',
  eyebrow: 'Company · Governance',
};

export default function GovernancePage() {
  const items = [
    { title: 'Board Structure', desc: 'The governing board operates with clear separation of oversight and execution, ensuring that strategic decisions undergo rigorous multi-perspective evaluation before implementation.', icon: 'bi-people' },
    { title: 'Compliance Framework', desc: 'Multi-jurisdictional compliance architecture covering defense regulations, healthcare standards, financial reporting, and data sovereignty requirements across all operational domains.', icon: 'bi-clipboard-check' },
    { title: 'Risk Management', desc: 'Institutional risk assessment protocols spanning operational, strategic, financial, and reputational dimensions — with early warning systems and escalation pathways.', icon: 'bi-exclamation-triangle' },
    { title: 'Transparency & Reporting', desc: 'Structured disclosure practices including regular operational reports, financial statements, and stakeholder communications that maintain institutional accountability.', icon: 'bi-file-earmark-text' },
    { title: 'Audit & Oversight', desc: 'Independent audit mechanisms, internal review cycles, and external assessment partnerships ensuring continuous operational integrity verification.', icon: 'bi-search' },
  ];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
        {items.map((item, i) => (
          <IconCard key={i} icon={item.icon}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--content-tertiary)' }}>{item.desc}</p>
          </IconCard>
        ))}
      </div>
      <UnderDevelopmentBanner text="Governance Documentation Coming Soon" />
    </>
  );
}
