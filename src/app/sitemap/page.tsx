import Link from 'next/link';
import Image from 'next/image';
import { ShaderAnimation } from '@/components/ui/shader-lines';
import SitemapView from '@/components/ui/SitemapView';

export default function SitemapPage() {
  const year = new Date().getFullYear();

  return (
    // `dark` re-scopes every theme token to the dark set — this page is
    // always dark even when the site theme is light.
    <main
      className="dark min-h-screen flex flex-col"
      style={{ background: 'var(--surface-primary)', color: 'var(--content-primary)' }}
    >
      {/* Header — shader background */}
      <section className="relative w-full overflow-hidden" style={{ background: '#04050a', borderBottom: '1px dashed var(--border-dashed)' }}>
        <ShaderAnimation />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(4,5,10,0.35) 0%, rgba(4,5,10,0.72) 70%, rgba(4,5,10,0.92) 100%)' }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(to bottom, transparent, #04050a)' }} />

        <div className="relative z-10 px-4 sm:px-8 lg:px-20 pt-7 pb-12 sm:pb-14">
          {/* Brand logo — top left */}
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 select-none"
            style={{ textDecoration: 'none', color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
          >
            <Image src="/assets/Notus-Regalia-logo.svg" alt="Notus Regalia" width={30} height={30} style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }} />
            <span className="font-bold tracking-tight">
              Notus <span style={{ color: '#EB1143', fontWeight: 300 }}>Regalia</span>
            </span>
          </Link>

          {/* Title */}
          <div className="text-center mt-8 sm:mt-10">
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-bold"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #c7ccd6 60%, #9aa0ab 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.15,
                filter: 'drop-shadow(0 4px 22px rgba(0,0,0,0.75)) drop-shadow(0 1px 4px rgba(0,0,0,0.6))',
              }}
            >
              Sitemap
            </h1>
            <p
              className="mt-4 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.72)', textShadow: '0 2px 14px rgba(0,0,0,0.7)' }}
            >
              Every page across Notus Regalia, organized by website and area.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="relative flex-1" style={{ background: 'var(--gradient-section)' }}>
        <div className="px-4 sm:px-8 lg:px-20 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="max-w-6xl mx-auto">
            <SitemapView />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="px-4 sm:px-8 lg:px-20 py-8"
        style={{ borderTop: '1px solid var(--border-color)', background: 'var(--surface-primary)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-end justify-between gap-6">
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
    </main>
  );
}
