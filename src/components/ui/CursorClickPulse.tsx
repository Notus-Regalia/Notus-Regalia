"use client";

import { useEffect, useRef, useState } from "react";

type Pulse = {
  id: number;
  x: number;
  y: number;
};

export default function CursorClickPulse() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const nextIdRef = useRef(0);
  const finePointerRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const update = () => {
      finePointerRef.current = media.matches;
      if (!media.matches) setPulses([]);
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!finePointerRef.current) return;
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;

      const id = nextIdRef.current++;
      setPulses((current) => [...current, { id, x: event.clientX, y: event.clientY }]);

      window.setTimeout(() => {
        setPulses((current) => current.filter((pulse) => pulse.id !== id));
      }, 520);
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <>
      <style jsx global>{`
        .cursor-click-pulse-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 2147483000;
        }

        .cursor-click-pulse {
          position: absolute;
          width: 42px;
          height: 42px;
          transform: translate(-50%, -50%);
          mix-blend-mode: difference;
        }

        .cursor-click-pulse-ring,
        .cursor-click-pulse-core {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 999px;
          background: #ffffff;
        }

        .cursor-click-pulse-ring {
          width: 16px;
          height: 16px;
          margin-left: -8px;
          margin-top: -8px;
          background: transparent;
          border: 1px solid #ffffff;
          animation: cursor-click-ring 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .cursor-click-pulse-core {
          width: 6px;
          height: 6px;
          margin-left: -3px;
          margin-top: -3px;
          animation: cursor-click-core 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes cursor-click-ring {
          0% {
            opacity: 0.9;
            transform: scale(0.45);
          }
          100% {
            opacity: 0;
            transform: scale(2.8);
          }
        }

        @keyframes cursor-click-core {
          0% {
            opacity: 0.95;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.15);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cursor-click-pulse-ring,
          .cursor-click-pulse-core {
            animation-duration: 120ms;
          }
        }
      `}</style>

      <div className="cursor-click-pulse-layer" aria-hidden="true">
        {pulses.map((pulse) => (
          <div
            key={pulse.id}
            className="cursor-click-pulse"
            style={{ left: pulse.x, top: pulse.y }}
          >
            <span className="cursor-click-pulse-ring" />
            <span className="cursor-click-pulse-core" />
          </div>
        ))}
      </div>
    </>
  );
}
