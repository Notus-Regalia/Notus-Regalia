"use client";
import { IconCard, UnderDevelopmentBanner } from './UnderDevelopmentTemplate';

export const meta = {
  title: 'Philosophy',
  subtitle: 'The foundational principles, intellectual frameworks, and guiding beliefs that inform every decision across the organization.',
  eyebrow: 'Company · Philosophy',
};

export default function PhilosophyPage() {
  const items = [
    { title: 'First Principles Thinking', desc: 'Every system we build begins from fundamental truths rather than convention. We decompose problems to their atomic components before reconstruction — ensuring that our solutions are genuinely novel rather than iterative.', icon: 'bi-lightning-charge' },
    { title: 'Long-Horizon Orientation', desc: 'We operate on decadal timelines. Short-term optimization is subordinated to long-term institutional resilience and compounding capability development.', icon: 'bi-hourglass-split' },
    { title: 'Constructive Tension', desc: 'We believe the best ideas emerge from structured disagreement. Our decision-making frameworks institutionalize productive conflict to surface blind spots and strengthen conclusions.', icon: 'bi-arrows-angle-expand' },
    { title: 'Asymmetric Impact', desc: 'We seek leverage points — interventions where bounded effort produces unbounded results. This shapes our portfolio allocation, technology bets, and operational focus.', icon: 'bi-graph-up-arrow' },
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
      <UnderDevelopmentBanner text="Full Philosophy Documentation Coming Soon" />
    </>
  );
}
