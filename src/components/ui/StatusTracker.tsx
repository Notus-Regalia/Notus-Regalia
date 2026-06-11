"use client";

import { memo, useEffect, useState } from "react";
import { AnimateNumber } from "./animated-blur-number";

/* ─────────────────────────────────────────────────────────────
   Futuristic, grid-based service status tracker (placeholder data).
   HUD aesthetic — monospace technical labels, a uptime cell-matrix,
   and a live clock. Operational uses a neutral light-grey so it reads
   without shouting green.
   ───────────────────────────────────────────────────────────── */

type SvcStatus = "operational" | "degraded" | "outage" | "maintenance";

const STATUS_META: Record<SvcStatus, { label: string; color: string }> = {
  operational: { label: "Operational", color: "#22c55e" },
  degraded:    { label: "Degraded",    color: "#f59e0b" },
  outage:      { label: "Outage",      color: "#ef4444" },
  maintenance: { label: "Maintenance", color: "#3b82f6" },
};

type Service = {
  name: string;
  status: SvcStatus;
  uptime: string;
  href: string;
  report: string;
  since: string;
};

const SERVICES: Service[] = [
  { name: "Main Website",        status: "operational", uptime: "99.99%", href: "/",                                                   report: "All endpoints healthy",        since: "Stable · 23d" },
  { name: "Information Center",  status: "operational", uptime: "99.98%", href: "/information",                                        report: "All endpoints healthy",        since: "Stable · 17d" },
  { name: "Defense Platform",    status: "operational", uptime: "99.95%", href: "/defense",                                           report: "Nominal performance",          since: "Stable · 41d" },
  { name: "API & Integrations",  status: "degraded",    uptime: "99.61%", href: "/information/research/documentations",     report: "Elevated response times",      since: "Investigating · 2h" },
  { name: "Authentication",      status: "operational", uptime: "100.0%", href: "/",                                                   report: "All endpoints healthy",        since: "Stable · 60d" },
  { name: "Documentation & CDN", status: "maintenance", uptime: "99.90%", href: "/information/research/documentations",     report: "Scheduled cache migration",    since: "ETA · 3h" },
  { name: "Support Services",    status: "maintenance", uptime: "99.87%", href: "/contact",                                           report: "Planned ticketing upgrade",    since: "ETA · 6h" },
  { name: "Billing & Payments",  status: "maintenance", uptime: "99.92%", href: "/contact",                                           report: "Gateway maintenance window",   since: "ETA · 4h" },
];

// Deterministic 90-day history (mostly up, a few blips) — placeholder data.
const historyFor = (seed: number): SvcStatus[] =>
  Array.from({ length: 90 }, (_, i) => {
    const v = Math.abs((Math.sin(seed * 12.9898 + i * 4.1414) * 43758.5453) % 1);
    if (v > 0.97) return "outage";
    if (v > 0.9) return "degraded";
    return "operational";
  });

/* Live clock — top-right readout. Renders nothing until mounted to avoid
   any server/client time mismatch. */
const LiveClock = () => {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const date = now
    ? now.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const twoDigit = { minimumIntegerDigits: 2, useGrouping: false } as const;

  return (
    <div className="st-clock">
      <div className="st-clock-time">
        {now ? (
          <>
            <AnimateNumber value={now.getHours()} format={twoDigit} duration={520} blur={7} />
            <span className="st-clock-colon">:</span>
            <AnimateNumber value={now.getMinutes()} format={twoDigit} duration={520} blur={7} />
            <span className="st-clock-colon">:</span>
            <AnimateNumber value={now.getSeconds()} format={twoDigit} duration={520} blur={7} />
          </>
        ) : (
          "--:--:--"
        )}
      </div>
      <div className="st-clock-date">{date}</div>
    </div>
  );
};

const StatusTracker = memo(() => {
  const operationalCount = SERVICES.filter((s) => s.status === "operational").length;
  const allOperational = operationalCount === SERVICES.length;
  const incidents = SERVICES.reduce((n, s) => n + historyFor(SERVICES.indexOf(s) + 1).filter((h) => h !== "operational").length, 0);
  const opColor = STATUS_META.operational.color;

  const stats = [
    { k: "Operational", v: `${operationalCount}/${SERVICES.length}` },
    { k: "Overall Uptime", v: "99.90%" },
    { k: "Incidents · 90d", v: String(incidents) },
  ];

  return (
    <div className="st-root">
      {/* Overall banner — the only card with the grid background */}
      <div className="st-banner" data-ok={allOperational}>
        <div className="st-gridbg" aria-hidden />
        <div className="st-banner-left">
          <span className="st-pulse" style={{ ["--c" as string]: allOperational ? opColor : "#f59e0b" }}>
            <span className="st-pulse-ring" />
            <span className="st-pulse-dot" />
          </span>
          <div className="st-banner-title">{allOperational ? "All Systems Operational" : "Partial Degradation"}</div>
        </div>
        <LiveClock />
        <div className="st-scan" aria-hidden />
      </div>

      {/* Stats grid */}
      <div className="st-stats">
        {stats.map((s) => (
          <div key={s.k} className="st-stat">
            <div className="st-stat-v">{s.v}</div>
            <div className="st-stat-k">{s.k}</div>
          </div>
        ))}
        <a className="st-stat st-stat-link" href="/contact">
          <div className="st-stat-v"><i className="bi bi-exclamation-triangle" /></div>
          <div className="st-stat-k">Report an Issue</div>
        </a>
      </div>

      {/* Services grid */}
      <div className="st-services">
        {SERVICES.map((svc, idx) => {
          const meta = STATUS_META[svc.status];
          const history = historyFor(idx + 1);
          return (
            <div key={svc.name} className="st-card" style={{ ["--svc" as string]: meta.color }}>
              <div className="st-card-head">
                <div className="st-card-id">
                  <a className="st-card-name" href={svc.href} target="_blank" rel="noopener noreferrer">
                    <span>{svc.name}</span>
                    <i className="bi bi-box-arrow-up-right st-card-ext" />
                  </a>
                </div>
                <span className="st-chip">{meta.label}</span>
              </div>

              {/* Uptime cell-matrix */}
              <div className="st-matrix" role="img" aria-label={`${svc.uptime} uptime over 90 days`}>
                {history.map((h, i) => (
                  <span
                    key={i}
                    className="st-cell"
                    style={{
                      background: STATUS_META[h].color,
                      opacity: h === "operational" ? 0.5 : 1,
                      boxShadow: h === "operational" ? "none" : `0 0 3px ${STATUS_META[h].color}66`,
                    }}
                  />
                ))}
              </div>

              {/* Status report + timeframe */}
              <div className="st-report">
                <span className="st-report-dot" />
                <span className="st-report-text">{svc.report}</span>
                <span className="st-report-time">{svc.since}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="st-legend">
        {(Object.keys(STATUS_META) as SvcStatus[]).map((k) => (
          <span key={k} className="st-legend-item">
            <span className="st-cell" style={{ background: STATUS_META[k].color, opacity: k === "operational" ? 0.7 : 1 }} />
            {STATUS_META[k].label}
          </span>
        ))}
      </div>

      <style>{`
        .st-root { position: relative; }
        .st-root :is(.st-banner, .st-stat, .st-card) { position: relative; overflow: hidden; }

        /* Graph-paper grid — only inside the main status banner */
        .st-gridbg {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 30px 30px;
          -webkit-mask-image: radial-gradient(ellipse at 30% 0%, #000 0%, transparent 90%);
          mask-image: radial-gradient(ellipse at 30% 0%, #000 0%, transparent 90%);
        }
        .st-banner-left, .st-banner .st-clock { position: relative; z-index: 1; }

        /* Banner */
        .st-banner {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          padding: 1.4rem 1.6rem; border-radius: 12px; margin-bottom: 1rem;
          border: 1px solid var(--border-color); background: var(--hover-bg);
        }
        .st-banner[data-ok="false"] { border-color: rgba(245,158,11,0.4); }
        .st-banner-left { display: flex; align-items: center; gap: 1rem; min-width: 0; }
        .st-banner-title { font-size: clamp(1.1rem, 3vw, 1.5rem); font-weight: 700; letter-spacing: -0.01em; color: var(--content-primary); }
        .st-pulse { position: relative; width: 14px; height: 14px; flex-shrink: 0; }
        .st-pulse-dot, .st-pulse-ring { position: absolute; inset: 0; margin: auto; border-radius: 50%; }
        .st-pulse-dot { width: 10px; height: 10px; background: var(--c); box-shadow: 0 0 10px var(--c); }
        .st-pulse-ring { width: 14px; height: 14px; background: var(--c); opacity: .5; animation: stPing 1.8s cubic-bezier(0,0,0.2,1) infinite; }
        @keyframes stPing { 75%, 100% { transform: scale(2.4); opacity: 0; } }

        /* Live clock readout */
        .st-clock { text-align: right; flex-shrink: 0; font-family: ui-monospace, Menlo, monospace; }
        .st-clock-time {
          display: inline-flex; align-items: baseline; justify-content: flex-end;
          font-size: clamp(1rem, 2.6vw, 1.35rem); font-weight: 700; line-height: 1;
          color: var(--content-primary); letter-spacing: .04em; font-variant-numeric: tabular-nums;
        }
        .st-clock-colon { opacity: .55; margin: 0 1px; }
        .st-clock-date {
          margin-top: 5px; font-size: .6rem; letter-spacing: .18em; text-transform: uppercase;
          color: var(--content-faint, rgba(160,160,170,.55));
        }

        .st-scan {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          width: 40%; transform: translateX(-120%);
          animation: stScan 5.5s ease-in-out infinite;
        }
        @keyframes stScan { 0% { transform: translateX(-120%); } 60%,100% { transform: translateX(320%); } }

        /* Stats grid */
        .st-stats {
          display: grid; gap: .75rem; margin-bottom: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }
        .st-stat {
          padding: 1rem 1.1rem; border-radius: 10px;
          border: 1px solid var(--border-color); background: var(--hover-bg);
        }
        .st-stat-v {
          font-family: ui-monospace, Menlo, monospace; font-size: 1.4rem; font-weight: 700;
          color: var(--content-primary); line-height: 1; letter-spacing: -0.01em; font-variant-numeric: tabular-nums;
        }
        .st-stat-k {
          margin-top: .5rem; font-size: .64rem; letter-spacing: .18em; text-transform: uppercase;
          font-family: ui-monospace, Menlo, monospace; color: var(--content-faint, rgba(160,160,170,.55));
        }

        /* Report-an-issue tile — same stat card, just clickable */
        .st-stat-link {
          display: block; text-decoration: none; cursor: pointer;
          transition: border-color .2s ease, background .2s ease;
        }
        .st-stat-link:hover { border-color: var(--content-faint, rgba(160,160,170,.4)); background: var(--hover-bg-strong, rgba(255,255,255,0.05)); }
        .st-stat-link .st-stat-v i { font-size: 1.25rem; color: var(--content-secondary); }

        /* Services grid */
        .st-services {
          display: grid; gap: 1.5rem;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr));
        }
        .st-card {
          padding: 1.2rem 1.25rem; border-radius: 12px;
          border: 1px solid var(--border-color); background: var(--hover-bg);
        }
        .st-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.75rem; }
        .st-card-id { min-width: 0; }
        .st-card-name {
          display: inline-flex; align-items: center; gap: .45rem;
          font-weight: 650; font-size: .98rem; color: var(--content-secondary);
          letter-spacing: -0.01em; text-decoration: none; transition: color .15s ease;
        }
        .st-card-name:hover { color: var(--content-primary); }
        .st-card-ext { font-size: .68rem; color: var(--content-faint, rgba(160,160,170,.5)); }
        .st-card-name:hover .st-card-ext { color: var(--content-secondary); }

        /* Revamped status tag — square LED + left accent bar, sharp + technical */
        .st-chip {
          flex-shrink: 0; display: inline-flex; align-items: center;
          font-family: ui-monospace, Menlo, monospace; font-size: .6rem; font-weight: 700;
          letter-spacing: .16em; text-transform: uppercase;
          color: color-mix(in srgb, var(--svc) 78%, var(--content-primary));
        }

        /* Uptime cell-matrix — small, dense grid */
        .st-matrix {
          display: grid; grid-template-columns: repeat(30, 1fr);
          gap: 2px;
        }
        .st-cell { aspect-ratio: 1; border-radius: 1.5px; border: 1px solid rgba(255,255,255,0.07); box-sizing: border-box; }

        /* Per-card status report + timeframe */
        .st-report {
          display: flex; align-items: center; gap: .55rem;
          margin-top: 1.1rem; padding-top: .9rem;
          border-top: 1px solid var(--border-color);
          font-family: ui-monospace, Menlo, monospace; font-size: .66rem; letter-spacing: .03em;
        }
        .st-report-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--svc); flex-shrink: 0; box-shadow: 0 0 5px var(--svc); }
        .st-report-text { color: var(--content-secondary); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .st-report-time { margin-left: auto; flex-shrink: 0; color: var(--content-faint, rgba(160,160,170,.55)); text-transform: uppercase; letter-spacing: .12em; font-size: .58rem; }

        /* Legend */
        .st-legend { display: flex; flex-wrap: wrap; gap: 1.1rem; margin-top: 1.5rem; }
        .st-legend-item {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: ui-monospace, Menlo, monospace; font-size: .68rem; letter-spacing: .06em;
          color: var(--content-muted);
        }
        .st-legend-item .st-cell { width: 9px; height: 9px; aspect-ratio: auto; }

        @media (max-width: 480px) {
          .st-banner { flex-wrap: wrap; }
          .st-clock { text-align: left; }
        }
      `}</style>
    </div>
  );
});

StatusTracker.displayName = "StatusTracker";
export default StatusTracker;
