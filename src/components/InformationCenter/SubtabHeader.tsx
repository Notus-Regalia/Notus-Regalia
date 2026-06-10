"use client";
import { memo } from 'react';
import { motion } from 'framer-motion';

interface SubtabHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: string;
}

const SubtabHeader = memo(({ eyebrow, title, description, icon }: SubtabHeaderProps) => {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: 'var(--gradient-section)',
        borderBottom: '1px dashed var(--border-dashed)',
      }}
    >
      {/* subtle noise + glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '120px 120px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(235,17,67,0.10) 0%, transparent 55%)' }}
      />

      <div className="relative z-10 px-4 sm:px-8 lg:px-20 pt-36 sm:pt-40 lg:pt-44 pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              {icon && <i className={`bi ${icon} text-sm`} style={{ color: 'var(--content-muted)' }} />}
              <span
                className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em]"
                style={{ color: 'var(--content-muted)' }}
              >
                {eyebrow}
              </span>
            </div>

            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-bold"
              style={{
                background: 'var(--text-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.15,
              }}
            >
              {title}
            </h1>

            <p
              className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto"
              style={{ color: 'var(--content-muted)' }}
            >
              {description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

SubtabHeader.displayName = 'SubtabHeader';
export default SubtabHeader;
