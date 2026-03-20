"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import DefenseTab from './Defense';
import CivicTab from './Civic';
import HealthcareTab from './Healthcare';

type TechnologiesSubtab =
  | 'technologies-defense'
  | 'technologies-civic-operations'
  | 'technologies-healthcare'
  | 'technologies-enterprise'
  | 'technologies-energy';

interface TechnologiesProps {
  activeSubtab?: string;
}

type TechnologiesPanel = 'defense' | 'civic' | 'healthcare';

const FADE_OUT_MS = 180;
const FADE_IN_MS = 260;

const getPanelFromSubtab = (subtab?: string): TechnologiesPanel => {
  if (subtab === 'technologies-defense') {
    return 'defense';
  }
  if (subtab === 'technologies-healthcare') return 'healthcare';
  return 'civic';
};

const Technologies = ({ activeSubtab }: TechnologiesProps) => {
  const active: TechnologiesSubtab = (
    activeSubtab === 'technologies-defense' ||
    activeSubtab === 'technologies-civic-operations' ||
    activeSubtab === 'technologies-healthcare' ||
    activeSubtab === 'technologies-enterprise' ||
    activeSubtab === 'technologies-energy'
  ) ? activeSubtab : 'technologies-civic-operations';

  const targetPanel = useMemo(() => getPanelFromSubtab(active), [active]);
  const [displayedPanel, setDisplayedPanel] = useState<TechnologiesPanel>(targetPanel);
  const [phase, setPhase] = useState<'idle' | 'fade-out' | 'fade-in'>('idle');
  const pendingPanelRef = useRef<TechnologiesPanel>(targetPanel);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    pendingPanelRef.current = targetPanel;
    if (targetPanel === displayedPanel || phase === 'fade-out') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPhase('fade-out');
  }, [targetPanel, displayedPanel, phase]);

  useEffect(() => {
    if (phase !== 'fade-out') return;
    timeoutRef.current = setTimeout(() => {
      setDisplayedPanel(pendingPanelRef.current);
      setPhase('fade-in');
      timeoutRef.current = setTimeout(() => {
        setPhase('idle');
      }, FADE_IN_MS);
    }, FADE_OUT_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const transitionStyle: React.CSSProperties = {
    opacity: phase === 'fade-out' ? 0 : 1,
    transform: phase === 'fade-out' ? 'translateY(10px)' : 'translateY(0)',
    transition: phase === 'fade-out'
      ? `opacity ${FADE_OUT_MS}ms ease, transform ${FADE_OUT_MS}ms ease`
      : phase === 'fade-in'
        ? `opacity ${FADE_IN_MS}ms ease, transform ${FADE_IN_MS}ms ease`
        : 'none',
  };

  return (
    <div style={transitionStyle}>
      {displayedPanel === 'defense' && <DefenseTab />}
      {displayedPanel === 'civic' && <CivicTab />}
      {displayedPanel === 'healthcare' && <HealthcareTab />}
    </div>
  );
};

export default Technologies;
