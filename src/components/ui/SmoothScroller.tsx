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

    // Detect touch / mobile — skip ScrollSmoother to save CPU
    const isMobile =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    if (isMobile) {
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
      effects: true,
      normalizeScroll: true,
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
