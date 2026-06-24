"use client";
import { useEffect, useState } from 'react';

// Slim sticky strip pinned to the bottom of the mobile sidebar.
// Shows the copyright line plus a live-updating date + time clock.
const SidebarFooter = () => {
  const [now, setNow] = useState<Date | null>(null);

  // Defer the clock to the client so server/client markup matches (no
  // hydration mismatch from a server-rendered timestamp).
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const year = (now ?? new Date()).getFullYear();
  const stamp = now
    ? `${now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} · ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    : ' ';

  return (
    <div className="mob-footer">
      <a className="mob-footer-contact" href="mailto:info@notusregalia.tech">
        <i className="bi bi-envelope" aria-hidden="true" />
        info@notusregalia.tech
      </a>
      <span className="mob-footer-copy">© {year} Notus Regalia</span>
      <span className="mob-footer-time" suppressHydrationWarning>{stamp}</span>
    </div>
  );
};

export default SidebarFooter;
