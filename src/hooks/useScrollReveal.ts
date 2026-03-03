"use client";
import { useEffect, useRef, useState, useCallback } from 'react';

export type RevealVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade';

interface UseScrollRevealOptions {
  /** IntersectionObserver threshold (0–1). Default 0.15 */
  threshold?: number;
  /** Root margin string. Default "0px 0px -60px 0px" */
  rootMargin?: string;
  /** Only trigger once? Default true */
  once?: boolean;
  /** Extra delay in ms before marking revealed (staggers). Default 0 */
  delay?: number;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {},
) {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true, delay = 0 } = options;
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            const timer = setTimeout(() => setRevealed(true), delay);
            if (once) observer.unobserve(el);
            return () => clearTimeout(timer);
          }
          setRevealed(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setRevealed(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, delay]);

  return { ref, revealed };
}

/**
 * Returns inline styles for a scroll-reveal element.
 * Apply these to the container along with the ref from useScrollReveal.
 */
export function revealStyles(
  revealed: boolean,
  variant: RevealVariant = 'fade-up',
  duration = 700,
  delay = 0,
): React.CSSProperties {
  const base: React.CSSProperties = {
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  };

  const offsets: Record<RevealVariant, React.CSSProperties> = {
    'fade-up':    { opacity: 0, transform: 'translateY(32px)' },
    'fade-down':  { opacity: 0, transform: 'translateY(-32px)' },
    'fade-left':  { opacity: 0, transform: 'translateX(32px)' },
    'fade-right': { opacity: 0, transform: 'translateX(-32px)' },
    'zoom-in':    { opacity: 0, transform: 'scale(0.92)' },
    'fade':       { opacity: 0, transform: 'none' },
  };

  if (!revealed) {
    return { ...base, ...offsets[variant] };
  }

  return { ...base, opacity: 1, transform: 'translateY(0) translateX(0) scale(1)' };
}

/**
 * Convenience wrapper — a single hook that returns ref + style.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  variant: RevealVariant = 'fade-up',
  options: UseScrollRevealOptions & { duration?: number; cssDelay?: number } = {},
) {
  const { duration = 700, cssDelay = 0, ...obsOptions } = options;
  const { ref, revealed } = useScrollReveal<T>(obsOptions);
  const style = revealStyles(revealed, variant, duration, cssDelay);
  return { ref, style, revealed };
}
