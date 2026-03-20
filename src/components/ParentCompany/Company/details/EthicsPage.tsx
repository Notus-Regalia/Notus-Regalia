"use client";
import { IconCard, UnderDevelopmentBanner } from './UnderDevelopmentTemplate';

export const meta = {
  title: 'Ethics',
  subtitle: 'The ethical frameworks, responsible innovation principles, and moral foundations that guide how Notus Regalia builds and operates.',
  eyebrow: 'Company · Ethics',
};

export default function EthicsPage() {
  const items = [
    { title: 'Responsible Innovation', desc: 'Every technology we develop undergoes ethical review to assess potential impacts, unintended consequences, and alignment with our core values before deployment.', icon: 'bi-shield-check' },
    { title: 'Human-Centric Design', desc: 'Systems are designed to augment human capability — not replace human judgment. We maintain clear boundaries on automation and preserve meaningful human oversight in all critical operations.', icon: 'bi-person-check' },
    { title: 'Data & Privacy', desc: 'Institutional commitment to data minimization, purpose limitation, and transparent data governance. We treat data stewardship as a fiduciary obligation.', icon: 'bi-lock' },
    { title: 'Dual-Use Awareness', desc: 'We rigorously evaluate dual-use implications of our technology, maintaining clear frameworks for acceptable use cases and enforcement mechanisms for compliance.', icon: 'bi-eye' },
    { title: 'Stakeholder Accountability', desc: 'Ethical obligations extend beyond shareholders to communities, partners, and the broader public affected by our operations and technology deployments.', icon: 'bi-globe2' },
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
      <UnderDevelopmentBanner text="Ethics Framework Documentation Coming Soon" />
    </>
  );
}
