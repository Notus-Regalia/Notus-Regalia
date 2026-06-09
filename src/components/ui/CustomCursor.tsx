"use client";
import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const clickableSelector = `
      button, a, [role="button"],
      .strip-tab, .tab-label-btn, .mob-tab-btn, .mob-subtab-btn,
      .logo-mark, [data-clickable="true"],
      input[type="checkbox"], input[type="radio"], select,
      [onclick], .clickable
    `;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      const isClickable = target?.matches(clickableSelector) ||
                         target?.closest(clickableSelector);

      setIsHoveringClickable(!!isClickable);
    };

    const handleMouseLeave = () => {
      setIsHoveringClickable(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        left: `${mousePos.x}px`,
        top: `${mousePos.y}px`,
        width: '20px',
        height: '20px',
        marginLeft: '-10px',
        marginTop: '-10px',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'background-color 0.3s ease-out, box-shadow 0.3s ease-out',
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '2px solid',
          borderColor: isHoveringClickable ? '#E31B54' : 'rgba(255,255,255,0.5)',
          backgroundColor: isHoveringClickable ? 'rgba(227,27,84,0.1)' : 'transparent',
          boxShadow: isHoveringClickable ? '0 0 12px rgba(227,27,84,0.4)' : 'none',
          transition: 'all 0.3s ease-out',
        }}
      />
    </div>
  );
}
