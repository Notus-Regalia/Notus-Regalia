"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

interface SmoothScrollerProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with GSAP ScrollSmoother for buttery-smooth scrolling.
 *
 * Structure produced:
 *   <div id="smooth-wrapper">
 *     <div id="smooth-content">
 *       {children}
 *     </div>
 *   </div>
 */
const SmoothScroller = ({ children }: SmoothScrollerProps) => {
  const smoother = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    const previousRestoration =
      "scrollRestoration" in window.history ? window.history.scrollRestoration : null;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Clear any native/GSAP scroll memory and jump to top on fresh mount/reload.
    ScrollTrigger.clearScrollMemory?.();
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Detect true mobile/tablet — skip ScrollSmoother to save CPU.
    // macOS trackpads report maxTouchPoints > 0, so we also check for
    // a coarse primary pointer to distinguish real touch devices.
    const isMobile =
      window.matchMedia("(pointer: coarse)").matches &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const lowPowerDevice =
      prefersReducedMotion ||
      (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 6) ||
      (typeof deviceMemory === "number" && deviceMemory <= 4);

    if (isMobile || lowPowerDevice) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
      return () => {
        if (previousRestoration && "scrollRestoration" in window.history) {
          window.history.scrollRestoration = previousRestoration;
        }
      };
    }

    smoother.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.5,
      effects: false,
      normalizeScroll: false,
      ignoreMobileResize: true,
    });

    smoother.current.scrollTo(0, false);

    return () => {
      smoother.current?.kill();
      smoother.current = null;
      if (previousRestoration && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = previousRestoration;
      }
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
};

export default SmoothScroller;
