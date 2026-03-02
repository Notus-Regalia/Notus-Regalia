"use client";
import React from 'react';

/* ═══════════════════════════════════════════════
   Shared types & components for detail pages
   ═══════════════════════════════════════════════ */

export interface PageMeta {
  title: string;
  subtitle: string;
  eyebrow: string;
}

/** Reusable card with an icon + content slot */
export function IconCard({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: '2rem 2.5rem', borderRadius: '0.75rem',
      border: '1px solid var(--border-color)', background: 'var(--gradient-card)',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '10px',
          border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, background: 'var(--surface-secondary)',
        }}>
          <i className={`bi ${icon}`} style={{ fontSize: '1.2rem', color: 'var(--content-faint)' }} />
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

/** "Under Development" placeholder banner */
export function UnderDevelopmentBanner({ text }: { text: string }) {
  return (
    <div style={{
      marginTop: '3rem', padding: '3rem', borderRadius: '0.75rem',
      border: '1px dashed var(--border-dashed)', textAlign: 'center',
    }}>
      <i className="bi bi-hourglass-split" style={{ fontSize: '2rem', color: '#E31B54', marginBottom: '1rem', display: 'block' }} />
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', background: 'var(--text-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {text}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--content-muted)', maxWidth: 480, margin: '0 auto' }}>
        Detailed documentation and expanded content are being compiled for this section.
      </p>
    </div>
  );
}
