"use client";
import { useState, useEffect, useLayoutEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────
//  Hover dropdown panel — Profound-style subtab preview.
//  Hovering a top tab expands a panel of its subtabs (icon · title ·
//  description). One panel instance morphs its height and cross-fades
//  its content as you move between tabs, so opening, closing and
//  switching are all smooth. A caret slides to point at the hovered
//  tab. Shared by the main Navbar and InfoNavbar.
// ─────────────────────────────────────────────────────────────
export interface DropItem { id: string; label: string; icon: string; desc: string; external?: string; }

interface NavDropdownProps {
  // The tab currently hovered, or null when nothing is hovered (panel closed).
  tab: string | null;
  // Viewport-x of the hovered tab's centre — the caret slides to point at it.
  pointerX?: number | null;
  getItems: (tabId: string) => DropItem[];
  getHeading: (tabId: string) => string;
  onItemClick: (tabId: string, item: DropItem) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const NavDropdown = ({ tab, pointerX, getItems, getHeading, onItemClick, onMouseEnter, onMouseLeave }: NavDropdownProps) => {
  // `renderTab` is the tab whose content is mounted; it lags `tab` during a
  // switch so the old content can fade out before the new fades in.
  const [renderTab, setRenderTab] = useState<string | null>(tab);
  const [open, setOpen] = useState(false);
  const [contentShown, setContentShown] = useState(true);
  const [height, setHeight] = useState(0);
  const [left, setLeft] = useState<number | null>(null);
  const [arrowLeft, setArrowLeft] = useState(48);
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab == null) { setOpen(false); return; }       // close
    if (!open) { setRenderTab(tab); setContentShown(true); setOpen(true); return; }  // open fresh
    if (tab !== renderTab) {                            // switch: fade out → swap → fade in
      setContentShown(false);
      const t = setTimeout(() => { setRenderTab(tab); setContentShown(true); }, 150);
      return () => clearTimeout(t);
    }
  }, [tab, open, renderTab]);

  // Measure the live content height so the panel morphs between tab sizes.
  // A ResizeObserver keeps it correct even if fonts/icons settle a frame late
  // (an offsetHeight read on first paint can come back short and clip).
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [renderTab]);

  // Centre the panel on the hovered tab (clamped to the viewport), then point
  // the caret at the tab — offset toward it when the panel is clamped at an edge.
  useLayoutEffect(() => {
    if (!open || pointerX == null || !wrapRef.current) return;
    const w = wrapRef.current.offsetWidth;
    const margin = 14;
    const vw = window.innerWidth;
    const l = Math.max(margin, Math.min(pointerX - w / 2, vw - margin - w));
    setLeft(l);
    setArrowLeft(Math.max(24, Math.min(pointerX - l, w - 24)));
  }, [open, pointerX, renderTab, height]);

  const items = renderTab ? getItems(renderTab) : [];

  return (
    <div
      ref={wrapRef}
      className={`nav-dropdown-wrap${open ? ' open' : ''}`}
      style={left != null ? { left } : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-hidden={!open}
    >
      <span className="nav-dropdown-arrow" style={{ left: arrowLeft }} aria-hidden />
      <div className="nav-dropdown-clip" style={{ height: open ? height : 0 }}>
        <div
          ref={innerRef}
          className="nav-dropdown-inner"
          style={{ opacity: contentShown ? 1 : 0, transform: contentShown ? 'none' : 'translateY(6px)' }}
        >
          <div className="nav-dropdown-heading">{renderTab ? getHeading(renderTab) : ''}</div>
          <div className="nav-dropdown-grid">
            {items.map((it) => (
              <button
                key={it.id}
                className="nav-drop-item"
                onClick={() => renderTab && onItemClick(renderTab, it)}
                tabIndex={open ? 0 : -1}
              >
                <span className="nav-drop-ico" aria-hidden><i className={`bi ${it.icon}`} /></span>
                <span className="nav-drop-text">
                  <span className="nav-drop-title">
                    {it.label}
                    {it.external && <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.7rem' }} />}
                  </span>
                  {it.desc && <span className="nav-drop-desc">{it.desc}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavDropdown;
