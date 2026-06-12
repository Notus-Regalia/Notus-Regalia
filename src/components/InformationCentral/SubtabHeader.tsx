"use client";
import { memo } from 'react';
import { motion } from 'framer-motion';
import { ShaderAnimation } from '@/components/ui/shader-lines';

interface SubtabHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: string;
}

const SubtabHeader = memo(({ eyebrow, title, description, icon }: SubtabHeaderProps) => {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col justify-center min-h-[380px] sm:min-h-[440px] lg:min-h-[480px]"
      style={{
        background: '#04050a',
        borderBottom: '1px dashed var(--border-dashed)',
      }}
    >
      {/* Animated shader-lines background */}
      <ShaderAnimation />

      {/* Dark overlay for text legibility over the shader */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(4,5,10,0.35) 0%, rgba(4,5,10,0.72) 70%, rgba(4,5,10,0.92) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{ background: 'linear-gradient(to bottom, transparent, #04050a)' }}
      />

      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-20 pt-24 sm:pt-28 lg:pt-28 pb-12 sm:pb-14">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              {icon && <i className={`bi ${icon} text-sm`} style={{ color: 'rgba(255,255,255,0.65)', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }} />}
              <span
                className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em]"
                style={{ color: 'rgba(255,255,255,0.65)', textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
              >
                {eyebrow}
              </span>
            </div>

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
              {title}
            </h1>

            <p
              className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.72)', textShadow: '0 2px 14px rgba(0,0,0,0.7)' }}
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
