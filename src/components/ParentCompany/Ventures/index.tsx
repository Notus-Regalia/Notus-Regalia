"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ComingSoon from "./ComingSoon";
import { getVenturesSubtab } from "@/data/ventures-nav";

interface VenturesProps {
  activeSubtab?: string;
}

const FADE_OUT_MS = 180;
const FADE_IN_MS = 260;

const Ventures = ({ activeSubtab }: VenturesProps) => {
  const target = useMemo(() => getVenturesSubtab(activeSubtab).id, [activeSubtab]);

  const [displayed, setDisplayed] = useState(target);
  const [phase, setPhase] = useState<"idle" | "fade-out" | "fade-in">("idle");
  const pendingRef = useRef(target);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    pendingRef.current = target;
    if (target === displayed || phase === "fade-out") return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPhase("fade-out");
  }, [target, displayed, phase]);

  useEffect(() => {
    if (phase !== "fade-out") return;
    timeoutRef.current = setTimeout(() => {
      setDisplayed(pendingRef.current);
      setPhase("fade-in");
      timeoutRef.current = setTimeout(() => setPhase("idle"), FADE_IN_MS);
    }, FADE_OUT_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const transitionStyle: React.CSSProperties = {
    opacity: phase === "fade-out" ? 0 : 1,
    transform: phase === "fade-out" ? "translateY(10px)" : "translateY(0)",
    transition:
      phase === "fade-out"
        ? `opacity ${FADE_OUT_MS}ms ease, transform ${FADE_OUT_MS}ms ease`
        : phase === "fade-in"
          ? `opacity ${FADE_IN_MS}ms ease, transform ${FADE_IN_MS}ms ease`
          : "none",
  };

  const sub = getVenturesSubtab(displayed);

  return (
    <div style={{ paddingTop: "env(safe-area-inset-top)", ...transitionStyle }}>
      <ComingSoon title={sub.title} blurb={sub.blurb} />
    </div>
  );
};

export default Ventures;
