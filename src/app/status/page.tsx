import Link from 'next/link';
import Image from 'next/image';
import StatusTracker from '@/components/ui/StatusTracker';

export default function StatusPage() {
  const year = new Date().getFullYear();
  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--surface-primary)', color: 'var(--content-primary)' }}
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-14 sm:py-20">
        {/* Header */}
        <header className="mb-10 sm:mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 mb-8 select-none"
            style={{ textDecoration: 'none', color: 'var(--content-primary)' }}
          >
            <Image src="/assets/Notus-Regalia-logo.svg" alt="Notus Regalia" width={32} height={32} />
            <span className="font-bold tracking-tight">
              Notus <span style={{ color: '#EB1143', fontWeight: 300 }}>Regalia</span>
              <span style={{ fontWeight: 300, color: 'var(--content-muted)' }}> Seraph</span>
            </span>
          </Link>

          <div
            className="text-xs font-medium uppercase tracking-[0.2em] mb-3"
            style={{ color: 'var(--content-muted)' }}
          >
            System Status
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--content-primary)' }}>
            Status &amp; Uptime
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--content-muted)' }}>
            Real-time operational status of Notus Regalia websites, platforms, and services. This page is
            served independently of the systems it monitors.
          </p>
        </header>

        <StatusTracker />

        {/* Footer */}
        <footer className="mt-14 pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            {/* Left — quick links above credits */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-5 text-xs sm:text-sm">
                <Link href="/sitemap" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--content-secondary)', textDecoration: 'none' }}>Sitemap</Link>
                <Link href="/status" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--content-secondary)', textDecoration: 'none' }}>Status</Link>
              </div>
              <span className="text-xs sm:text-sm" style={{ color: 'var(--content-muted)' }}>
                © {year} Notus Regalia. All rights reserved.
              </span>
            </div>

            {/* Right — logo above powered-by */}
            <div className="flex flex-col items-end gap-3">
              <Image src="/assets/seraph-logo.png" alt="Seraph" width={68} height={40} style={{ objectFit: 'contain' }} />
              <span
                className="inline-flex items-center gap-1.5 select-none text-xs uppercase"
                style={{ letterSpacing: '0.18em', color: 'var(--content-faint, rgba(160,160,170,0.5))' }}
              >
                Powered by <span style={{ fontWeight: 600, color: '#ffffff' }}>Seraph</span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
