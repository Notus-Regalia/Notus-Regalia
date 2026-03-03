"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────────────────────── */
function useGlitch(intervalMs = 4000) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return glitch;
}

function useClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toTimeString().split(" ")[0]), 1000);
    setTime(new Date().toTimeString().split(" ")[0]);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ─────────────────────────────────────────────────────────────
   SOFTWARE 1 — COMMAND & CONTROL
───────────────────────────────────────────────────────────── */
const C2_NODES = [
  { id: "A-1", label: "Sector Alpha",    status: "Active",    load: 42, color: "#00ffaa" },
  { id: "B-2", label: "Neural Bridge",   status: "Syncing",   load: 88, color: "#E31B54" },
  { id: "C-9", label: "Treasury Vault",  status: "Secure",    load: 12, color: "#00ffaa" },
  { id: "X-0", label: "External Uplink", status: "Encrypted", load: 65, color: "#f59e0b" },
];

function CommandControl() {
  const [active, setActive] = useState(C2_NODES[0]);
  const glitch = useGlitch();
  const time = useClock();

  return (
    <div className="sw-panel c2-panel">
      <div className="scanline" />
      <aside className="c2-sidebar">
        <div className="sw-mono sw-dim" style={{ marginBottom: "1rem", fontSize: "0.6rem", letterSpacing: "0.16em" }}>
          SYSTEM_NODES // VER 4.0
        </div>
        {C2_NODES.map((n) => (
          <div
            key={n.id}
            className={`c2-node${active.id === n.id ? " c2-node-active" : ""}`}
            onClick={() => setActive(n)}
          >
            <div className="sw-mono" style={{ fontSize: "0.55rem", opacity: 0.4 }}>{n.id}</div>
            <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{n.label}</div>
            <div className="sw-mono" style={{ fontSize: "0.65rem", color: n.color }}>● {n.status}</div>
          </div>
        ))}
      </aside>
      <main className="c2-radar">
        <div className="radar-ring" style={{ width: 340, height: 340 }} />
        <div className="radar-ring" style={{ width: 220, height: 220, opacity: 0.5 }} />
        <div className="radar-ring" style={{ width: 110, height: 110, opacity: 0.3 }} />
        <div className="radar-sweep" />
        <div style={{ position: "relative", zIndex: 5, textAlign: "center" }}>
          <div className="sw-mono" style={{ fontSize: "3.5rem", fontWeight: 800, color: "#E31B54", lineHeight: 1 }}>
            {active.load}%
          </div>
          <div className="sw-mono sw-dim" style={{ fontSize: "0.6rem", letterSpacing: "0.2em", marginTop: "0.4rem" }}>
            CORE_LOAD_CAPACITY
          </div>
        </div>
      </main>
      <aside className="c2-stats">
        <div className="sw-mono sw-dim" style={{ fontSize: "0.62rem" }}>OPERATOR: AUTHORIZED</div>
        <div className="sw-mono sw-dim" style={{ fontSize: "0.62rem" }}>LOCAL_TIME: {time}</div>
        <div className="sw-mono sw-dim" style={{ fontSize: "0.62rem" }}>UPLINK: SECURE</div>
        <div className="c2-divider" />
        <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", marginBottom: "0.3rem" }}>SELECTED_MODULE</div>
        <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem" }}>
          {active.label.toUpperCase()}
        </div>
        <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", marginBottom: "0.3rem" }}>ENCRYPTION_KEY</div>
        <div className="sw-mono" style={{ fontSize: "0.68rem", wordBreak: "break-all", opacity: 0.7 }}>
          0x772B...{glitch ? "ERROR" : "882F"}
        </div>
        <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
          <div className="sw-mono" style={{ color: glitch ? "#00fff0" : "#E31B54", fontWeight: 700, fontSize: "0.72rem" }}>
            SYSTEM {glitch ? "STUTTER" : "STABLE"}
          </div>
          <div className="sw-mono sw-dim" style={{ fontSize: "0.62rem" }}>NO THREATS DETECTED</div>
        </div>
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SOFTWARE 2 — INTELLIGENCE HUB
───────────────────────────────────────────────────────────── */
const INTEL_METRICS = [
  { label: "Threat Index",    value: 23, max: 100, color: "#00ffaa" },
  { label: "Signal Strength", value: 76, max: 100, color: "#E31B54" },
  { label: "Data Integrity",  value: 94, max: 100, color: "#60a5fa" },
  { label: "Active Feeds",    value: 12, max: 20,  color: "#f59e0b" },
];

const INTEL_FEED = [
  { ts: "03:41:22", msg: "Uplink handshake confirmed — NODE_7",  lvl: "OK"   },
  { ts: "03:39:58", msg: "Anomaly pattern detected in sector B", lvl: "WARN" },
  { ts: "03:38:11", msg: "Encryption cycle rotated successfully", lvl: "OK"  },
  { ts: "03:36:44", msg: "External probe — origin masked",        lvl: "WARN" },
  { ts: "03:34:02", msg: "Cold storage sync complete",            lvl: "OK"  },
  { ts: "03:31:17", msg: "Auth token refresh issued",             lvl: "OK"  },
];

function IntelDashboard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, []);

  const metrics = INTEL_METRICS.map((m, i) => ({
    ...m,
    live: Math.min(m.max, Math.max(1, m.value + Math.sin(tick * 0.7 + i) * 5)),
  }));

  return (
    <div className="sw-panel intel-panel">
      <div className="intel-metrics">
        {metrics.map((m) => (
          <div key={m.label} className="intel-metric-cell">
            <div className="sw-mono sw-dim" style={{ fontSize: "0.55rem", letterSpacing: "0.16em", marginBottom: "0.5rem" }}>
              {m.label.toUpperCase()}
            </div>
            <div className="sw-mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: m.color, lineHeight: 1 }}>
              {Math.round(m.live)}
            </div>
            <div className="intel-bar-track">
              <div
                className="intel-bar-fill"
                style={{
                  width: `${(m.live / m.max) * 100}%`,
                  background: m.color,
                  boxShadow: `0 0 8px ${m.color}66`,
                  transition: "width 1.8s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="intel-body">
        <div className="intel-wave-wrap">
          <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", letterSpacing: "0.2em", marginBottom: "1rem" }}>
            SIGNAL_ANALYSIS // LIVE
          </div>
          <svg viewBox="0 0 600 100" preserveAspectRatio="none" style={{ width: "100%", height: "80px" }}>
            <defs>
              <linearGradient id="wg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E31B54" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#E31B54" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M0,50 ${Array.from({ length: 30 }, (_, i) => {
                const x = (i / 29) * 600;
                const y = 50 + Math.sin((i + tick) * 0.9) * 20 + Math.sin((i + tick) * 1.7) * 9;
                return `L${x},${y}`;
              }).join(" ")}`}
              fill="none" stroke="#E31B54" strokeWidth="1.5" opacity="0.9"
            />
            <path
              d={`M0,50 ${Array.from({ length: 30 }, (_, i) => {
                const x = (i / 29) * 600;
                const y = 50 + Math.sin((i + tick) * 0.9) * 20 + Math.sin((i + tick) * 1.7) * 9;
                return `L${x},${y}`;
              }).join(" ")} L600,100 L0,100 Z`}
              fill="url(#wg)" opacity="0.2"
            />
            <path
              d={`M0,50 ${Array.from({ length: 30 }, (_, i) => {
                const x = (i / 29) * 600;
                const y = 50 + Math.sin((i + tick) * 1.3 + 2) * 13;
                return `L${x},${y}`;
              }).join(" ")}`}
              fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.35"
            />
          </svg>
        </div>
        <div className="intel-feed">
          <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", letterSpacing: "0.2em", marginBottom: "0.75rem" }}>
            INTELLIGENCE_FEED
          </div>
          {INTEL_FEED.map((f, i) => (
            <div key={i} className="intel-feed-row">
              <span className="sw-mono" style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.58rem", flexShrink: 0 }}>{f.ts}</span>
              <span className="sw-mono" style={{ fontSize: "0.68rem", flex: 1, color: "rgba(255,255,255,0.6)" }}>{f.msg}</span>
              <span className="sw-mono" style={{ fontSize: "0.55rem", color: f.lvl === "OK" ? "#00ffaa" : "#f59e0b", flexShrink: 0 }}>
                {f.lvl}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SOFTWARE 3 — OPERATIONS BOARD
───────────────────────────────────────────────────────────── */
const OPS_COLS = [
  {
    id: "queue", label: "Queued", color: "rgba(255,255,255,0.22)",
    tasks: [
      { id: "T-009", title: "Sector expansion brief",  priority: "HIGH", agent: "CMD-4" },
      { id: "T-010", title: "Logistics route audit",   priority: "MED",  agent: "OPS-2" },
      { id: "T-011", title: "Protocol delta review",   priority: "LOW",  agent: "INF-1" },
    ],
  },
  {
    id: "active", label: "In Progress", color: "#f59e0b",
    tasks: [
      { id: "T-006", title: "Alliance negotiation file", priority: "CRIT", agent: "REL-3" },
      { id: "T-007", title: "Capital reallocation memo", priority: "HIGH", agent: "FIN-1" },
    ],
  },
  {
    id: "done", label: "Complete", color: "#00ffaa",
    tasks: [
      { id: "T-001", title: "Founder charter signed",  priority: "CRIT", agent: "CMD-1" },
      { id: "T-002", title: "Unit mandates published", priority: "HIGH", agent: "CMD-2" },
      { id: "T-003", title: "Uplink encryption v2",    priority: "MED",  agent: "INF-2" },
    ],
  },
];

const P_COLOR: Record<string, string> = {
  CRIT: "#E31B54", HIGH: "#f59e0b", MED: "#60a5fa", LOW: "rgba(255,255,255,0.3)",
};

function OpsTracker() {
  return (
    <div className="sw-panel ops-panel">
      <div className="ops-topbar">
        <div className="sw-mono sw-dim" style={{ fontSize: "0.6rem" }}>OPERATIONS // BOARD_VIEW</div>
        <div className="sw-mono" style={{ fontSize: "0.6rem", color: "#00ffaa" }}>● 5 ACTIVE</div>
      </div>
      <div className="ops-board">
        {OPS_COLS.map((col) => (
          <div key={col.id} className="ops-col">
            <div className="ops-col-header">
              <span className="ops-col-dot" style={{ background: col.color }} />
              <span className="sw-mono" style={{ fontSize: "0.62rem", letterSpacing: "0.16em" }}>
                {col.label.toUpperCase()}
              </span>
              <span className="sw-mono sw-dim" style={{ fontSize: "0.58rem", marginLeft: "auto" }}>
                {col.tasks.length}
              </span>
            </div>
            <div className="ops-task-list">
              {col.tasks.map((t) => (
                <div key={t.id} className="ops-task">
                  <div className="ops-task-top">
                    <span className="sw-mono sw-dim" style={{ fontSize: "0.55rem" }}>{t.id}</span>
                    <span className="sw-mono ops-priority" style={{ color: P_COLOR[t.priority], borderColor: P_COLOR[t.priority] + "55" }}>
                      {t.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, margin: "0.3rem 0" }}>{t.title}</div>
                  <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem" }}>→ {t.agent}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SOFTWARE 4 — TREASURY LEDGER
───────────────────────────────────────────────────────────── */
const LEDGER_ROWS = [
  { ref: "TXN-0041", desc: "Alliance fund deposit",     type: "CREDIT", amt: "+12,400", ts: "2026-01-14" },
  { ref: "TXN-0040", desc: "Ops equipment allocation",  type: "DEBIT",  amt: "-3,800",  ts: "2026-01-13" },
  { ref: "TXN-0039", desc: "Intel subscription fee",    type: "DEBIT",  amt: "-950",    ts: "2026-01-12" },
  { ref: "TXN-0038", desc: "Founder capital injection", type: "CREDIT", amt: "+50,000", ts: "2026-01-10" },
  { ref: "TXN-0037", desc: "Logistics overhead",        type: "DEBIT",  amt: "-2,100",  ts: "2026-01-09" },
  { ref: "TXN-0036", desc: "External uplink license",   type: "DEBIT",  amt: "-1,200",  ts: "2026-01-08" },
];

const ALLOC = [
  { label: "Operations",   pct: 38, color: "#E31B54" },
  { label: "Intelligence", pct: 22, color: "#60a5fa" },
  { label: "Relations",    pct: 18, color: "#f59e0b" },
  { label: "Development",  pct: 14, color: "#a78bfa" },
  { label: "Reserve",      pct:  8, color: "#00ffaa" },
];

function TreasuryLedger() {
  const [hoveredAlloc, setHoveredAlloc] = useState<string | null>(null);

  let acc = 0;
  const segments = ALLOC.map((a) => {
    const seg = { ...a, start: acc };
    acc += a.pct;
    return seg;
  });

  return (
    <div className="sw-panel treasury-panel">
      <div className="treasury-left">
        <div className="sw-mono sw-dim" style={{ fontSize: "0.6rem", letterSpacing: "0.18em", marginBottom: "1.25rem" }}>
          TREASURY // LEDGER_VIEW
        </div>
        <div className="treasury-balance">
          <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", marginBottom: "0.4rem" }}>TOTAL BALANCE</div>
          <div className="sw-mono" style={{ fontSize: "2.5rem", fontWeight: 800, color: "#00ffaa", letterSpacing: "-0.04em", lineHeight: 1 }}>
            ₱ 54,350
          </div>
          <div className="sw-mono" style={{ fontSize: "0.65rem", color: "#00ffaa", opacity: 0.6, marginTop: "0.25rem" }}>
            ▲ 12.4% from last cycle
          </div>
        </div>
        <div className="treasury-divider" />
        <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", letterSpacing: "0.18em", marginBottom: "0.6rem" }}>
          RECENT_TRANSACTIONS
        </div>
        <div className="treasury-rows">
          {LEDGER_ROWS.map((r) => (
            <div key={r.ref} className="treasury-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.desc}
                </div>
                <div className="sw-mono sw-dim" style={{ fontSize: "0.55rem" }}>{r.ref} · {r.ts}</div>
              </div>
              <div className="sw-mono" style={{ fontSize: "0.82rem", fontWeight: 700, flexShrink: 0, color: r.type === "CREDIT" ? "#00ffaa" : "#E31B54" }}>
                {r.amt}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="treasury-right">
        <div className="sw-mono sw-dim" style={{ fontSize: "0.6rem", letterSpacing: "0.18em", marginBottom: "1.25rem" }}>
          CAPITAL_ALLOCATION
        </div>
        <div className="treasury-stack">
          {segments.map((s) => (
            <div
              key={s.label}
              className="treasury-stack-seg"
              style={{
                width: `${s.pct}%`, background: s.color,
                opacity: hoveredAlloc && hoveredAlloc !== s.label ? 0.3 : 1,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={() => setHoveredAlloc(s.label)}
              onMouseLeave={() => setHoveredAlloc(null)}
            />
          ))}
        </div>
        <div className="treasury-legend">
          {ALLOC.map((a) => (
            <div
              key={a.label}
              className="treasury-legend-row"
              style={{ opacity: hoveredAlloc && hoveredAlloc !== a.label ? 0.35 : 1, transition: "opacity 0.2s ease" }}
              onMouseEnter={() => setHoveredAlloc(a.label)}
              onMouseLeave={() => setHoveredAlloc(null)}
            >
              <span className="treasury-legend-dot" style={{ background: a.color }} />
              <span style={{ fontSize: "0.82rem", flex: 1 }}>{a.label}</span>
              <span className="sw-mono" style={{ fontSize: "0.72rem", color: a.color, fontWeight: 700 }}>{a.pct}%</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", paddingTop: "1rem" }}>
          <svg viewBox="0 0 120 120" width="110" height="110">
            {(() => {
              let angle = -90;
              return ALLOC.map((a) => {
                const r = 46, cx = 60, cy = 60;
                const sweep = (a.pct / 100) * 360;
                const rad1 = (angle * Math.PI) / 180;
                const rad2 = ((angle + sweep - 1) * Math.PI) / 180;
                const x1 = cx + r * Math.cos(rad1), y1 = cy + r * Math.sin(rad1);
                const x2 = cx + r * Math.cos(rad2), y2 = cy + r * Math.sin(rad2);
                const large = sweep > 180 ? 1 : 0;
                const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
                angle += sweep;
                return (
                  <path key={a.label} d={path} fill={a.color}
                    opacity={hoveredAlloc && hoveredAlloc !== a.label ? 0.2 : 0.82}
                    style={{ transition: "opacity 0.2s ease" }}
                  />
                );
              });
            })()}
            <circle cx="60" cy="60" r="28" fill="#030308" />
            <text x="60" y="56" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="ui-monospace">ALLOC</text>
            <text x="60" y="67" textAnchor="middle" fill="white" fontSize="9" fontFamily="ui-monospace" fontWeight="bold">100%</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CAROUSEL WRAPPER
───────────────────────────────────────────────────────────── */
const SOFTWARES = [
  {
    id: "c2",       tag: "01", name: "Command & Control", industry: "Defense",
    tagline: "The Sovereign Interface",
    desc: "Real-time node monitoring, system health, and encrypted uplink management across all active sectors.",
    component: CommandControl,
  },
  {
    id: "intel",    tag: "02", name: "Intelligence Hub",  industry: "Intelligence",
    tagline: "Signal. Noise. Truth.",
    desc: "Live signal analysis, threat indexing, and continuous intelligence feed from all monitored channels.",
    component: IntelDashboard,
  },
  {
    id: "ops",      tag: "03", name: "Operations Board",  industry: "Enterprise",
    tagline: "Execution at Every Level",
    desc: "Kanban-style operations tracker with priority tiering, agent assignment, and mission-critical task flow.",
    component: OpsTracker,
  },
  {
    id: "treasury", tag: "04", name: "Treasury Ledger",   industry: "Finance",
    tagline: "Capital. Clarity. Control.",
    desc: "Full capital visibility — transaction history, allocation breakdown, and live balance across all units.",
    component: TreasuryLedger,
  },
];

export default function SoftwareDemo() {
  const [active, setActive]       = useState(0);
  const [transitioning, setTrans] = useState(false);
  const [direction, setDir]       = useState<"next" | "prev">("next");
  const [revealed, setRevealed]   = useState(false);
  const sectionRef                = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const goto = useCallback((i: number) => {
    if (i === active || transitioning) return;
    setDir(i > active ? "next" : "prev");
    setTrans(true);
    setTimeout(() => { setActive(i); setTrans(false); }, 320);
  }, [active, transitioning]);

  const next = () => goto((active + 1) % SOFTWARES.length);
  const back = () => goto((active - 1 + SOFTWARES.length) % SOFTWARES.length);

  const sw = SOFTWARES[active];
  const ActiveComp = sw.component;

  return (
    <>
      <style>{`
        @keyframes sdPulse {
          0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(227,27,84,.5);}
          50%{opacity:.7;box-shadow:0 0 0 5px rgba(227,27,84,0);}
        }

        .sdemo-root {
          background: var(--gradient-section, #06060e);
          border-top: 1px dashed rgba(255,255,255,0.08);
          color: #fff;
          font-family: ui-monospace, 'Geist Mono', monospace;
          overflow: hidden;
          position: relative;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .sdemo-root.revealed { opacity: 1; transform: translateY(0); }
        :root.light .sdemo-root { background: #f4f5f8; border-top: 1px dashed rgba(0,0,0,0.1); color: #0f172a; }

        .sdemo-inner {
          padding: 5rem 2rem 6rem;
        }
        @media(min-width:640px){.sdemo-inner{padding:5rem 4rem 6rem;}}
        @media(min-width:768px){.sdemo-inner{padding:6rem 6rem 7rem;}}
        @media(min-width:1024px){.sdemo-inner{padding:6rem 6rem 7rem;}}
        @media(min-width:1280px){.sdemo-inner{padding:7rem 8rem 8rem;}}
        @media(min-width:1536px){.sdemo-inner{padding:7rem 12rem 8rem;}}
        @media(min-width:1920px){.sdemo-inner{padding:7rem 16rem 8rem;}}

        /* ── Header ── */
        .sdemo-header { display:flex; flex-direction:column; gap:2rem; margin-bottom:3.5rem; }
        @media(min-width:768px){ .sdemo-header { flex-direction:row; align-items:flex-end; justify-content:space-between; } }
        .sdemo-eyebrow {
          display:inline-flex; align-items:center; gap:0.5rem;
          font-size:0.62rem; text-transform:uppercase; letter-spacing:0.24em;
          font-weight:700; color:#E31B54; margin-bottom:1rem;
        }
        .sdemo-eyebrow-dot {
          width:5px; height:5px; border-radius:50%; background:#E31B54; flex-shrink:0;
          animation: sdPulse 2s ease-in-out infinite;
        }
        .sdemo-heading {
          font-size:clamp(1.75rem,4vw,2.75rem); font-weight:700;
          letter-spacing:-0.02em; line-height:1.15;
          font-family:'Inter',system-ui,sans-serif;
          background: var(--text-gradient, linear-gradient(135deg,#f1f5f9 0%,rgba(241,245,249,.7) 100%));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        :root.light .sdemo-heading {
          background: linear-gradient(135deg,#0f172a 0%,rgba(15,23,42,.7) 100%);
          -webkit-background-clip:text; background-clip:text;
        }
        .sdemo-rule { width:40px; height:2px; background:#E31B54; border-radius:999px; box-shadow:0 0 8px rgba(227,27,84,0.5); margin-top:1rem; }
        .sdemo-header-desc { font-size:0.88rem; line-height:1.75; color:rgba(255,255,255,0.4); font-family:'Inter',ui-sans-serif,system-ui,sans-serif; }
        :root.light .sdemo-header-desc { color:rgba(0,0,0,0.45); }

        /* ── Tabs ── */
        .sdemo-tabs {
          display:flex; border:1px dashed rgba(255,255,255,0.1);
          border-radius:2px; margin-bottom:2rem;
          overflow-x:auto; scrollbar-width:none;
        }
        .sdemo-tabs::-webkit-scrollbar { display:none; }
        :root.light .sdemo-tabs { border:1px dashed rgba(0,0,0,0.12); }

        .sdemo-tab {
          flex:1; min-width:120px;
          display:flex; flex-direction:column; gap:0.25rem;
          padding:1.1rem 1.25rem;
          border:none; border-right:1px dashed rgba(255,255,255,0.08);
          background:transparent; cursor:pointer; text-align:left;
          position:relative; transition:background 0.2s ease; white-space:nowrap;
        }
        .sdemo-tab:last-child { border-right:none; }
        .sdemo-tab:hover { background:rgba(255,255,255,0.025); }
        .sdemo-tab.active { background:rgba(227,27,84,0.06); }
        .sdemo-tab::after {
          content:''; position:absolute; bottom:0; left:0; right:0; height:2px;
          background:#E31B54; transform:scaleX(0); transform-origin:left;
          transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .sdemo-tab.active::after { transform:scaleX(1); }
        :root.light .sdemo-tab { border-right:1px dashed rgba(0,0,0,0.09); }
        :root.light .sdemo-tab:hover { background:rgba(0,0,0,0.03); }
        :root.light .sdemo-tab.active { background:rgba(227,27,84,0.04); }

        .sdemo-tab-tag { font-size:0.55rem; letter-spacing:0.18em; color:rgba(255,255,255,0.2); font-weight:700; }
        :root.light .sdemo-tab-tag { color:rgba(0,0,0,0.25); }
        .sdemo-tab.active .sdemo-tab-tag { color:#E31B54; }
        .sdemo-tab-name { font-size:0.8rem; font-weight:600; color:rgba(255,255,255,0.42); transition:color 0.2s ease; }
        :root.light .sdemo-tab-name { color:rgba(0,0,0,0.45); }
        .sdemo-tab.active .sdemo-tab-name,
        .sdemo-tab:hover .sdemo-tab-name { color:rgba(255,255,255,0.9); }
        :root.light .sdemo-tab.active .sdemo-tab-name,
        :root.light .sdemo-tab:hover .sdemo-tab-name { color:rgba(0,0,0,0.9); }
        .sdemo-tab-industry { font-size:0.58rem; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.18); transition:color 0.2s ease; }
        :root.light .sdemo-tab-industry { color:rgba(0,0,0,0.28); }
        .sdemo-tab.active .sdemo-tab-industry { color:rgba(227,27,84,0.7); }
        .sdemo-tab:hover .sdemo-tab-industry { color:rgba(255,255,255,0.35); }
        :root.light .sdemo-tab:hover .sdemo-tab-industry { color:rgba(0,0,0,0.45); }

        /* ── Meta row ── */
        .sdemo-meta { display:flex; align-items:center; justify-content:space-between; gap:1.5rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .sdemo-tagline { font-size:clamp(1rem,2vw,1.3rem); font-weight:700; letter-spacing:-0.02em; color:rgba(255,255,255,0.9); margin-bottom:0.2rem; }
        :root.light .sdemo-tagline { color:rgba(0,0,0,0.9); }
        .sdemo-desc { font-size:0.82rem; line-height:1.6; color:rgba(255,255,255,0.38); font-family:'Inter',ui-sans-serif,system-ui,sans-serif; }
        :root.light .sdemo-desc { color:rgba(0,0,0,0.45); }

        .sdemo-nav { display:flex; gap:0.5rem; align-items:center; flex-shrink:0; }
        .sdemo-arrow {
          width:34px; height:34px;
          border:1px solid rgba(255,255,255,0.1); border-radius:6px;
          background:rgba(255,255,255,0.03);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:rgba(255,255,255,0.4); transition:all 0.2s ease;
        }
        .sdemo-arrow:hover { border-color:#E31B54; color:#E31B54; background:rgba(227,27,84,0.07); }
        :root.light .sdemo-arrow { border:1px solid rgba(0,0,0,0.12); background:rgba(0,0,0,0.03); color:rgba(0,0,0,0.4); }
        :root.light .sdemo-arrow:hover { border-color:#E31B54; color:#E31B54; }
        .sdemo-counter { font-size:0.62rem; letter-spacing:0.14em; color:rgba(255,255,255,0.25); padding:0 0.25rem; }
        :root.light .sdemo-counter { color:rgba(0,0,0,0.3); }

        /* ── Viewport ── */
        .sdemo-viewport {
          position:relative; border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; overflow:hidden; background:#050510;
          height:520px;
        }
        :root.light .sdemo-viewport { border:1px solid rgba(0,0,0,0.12); background:#eceef3; }
        @media(max-width:640px){ .sdemo-viewport { height:460px; } }

        .sdemo-slide {
          position:absolute; inset:0;
          transition:opacity 0.3s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .sdemo-slide-idle    { opacity:1; transform:translateX(0); }
        .sdemo-slide-out-next{ opacity:0; transform:translateX(-28px); }
        .sdemo-slide-out-prev{ opacity:0; transform:translateX(28px); }

        /* ── Dots ── */
        .sdemo-dots { display:flex; justify-content:center; gap:0.5rem; margin-top:1.25rem; }
        .sdemo-dot {
          width:6px; height:6px; border-radius:999px;
          background:rgba(255,255,255,0.15); border:none; cursor:pointer; padding:0;
          transition:all 0.25s ease;
        }
        .sdemo-dot.active { width:20px; background:#E31B54; }
        :root.light .sdemo-dot { background:rgba(0,0,0,0.15); }
        :root.light .sdemo-dot.active { background:#E31B54; }

        /* ══════════════════════════════════════
           SHARED PANEL
        ══════════════════════════════════════ */
        .sw-panel {
          position:absolute; inset:0; display:flex; overflow:hidden;
          font-family:ui-monospace,'Geist Mono',monospace; color:#fff;
        }
        :root.light .sw-panel { color:#0f172a; }
        .sw-mono { font-family:ui-monospace,'Geist Mono',monospace; }
        .sw-dim  { color:rgba(255,255,255,0.35); }
        :root.light .sw-dim { color:rgba(0,0,0,0.38); }

        .scanline {
          position:absolute; width:100%; height:1px;
          background:rgba(227,27,84,0.1); top:0;
          animation:scan 10s linear infinite; z-index:100; pointer-events:none;
        }
        @keyframes scan { from{top:0} to{top:100%} }

        /* ── C2 ── */
        .c2-panel { background:radial-gradient(ellipse at 50% 0%,#0a0010 0%,#030308 100%); }
        :root.light .c2-panel { background:#eceef3; }
        .c2-sidebar {
          width:220px; flex-shrink:0; background:rgba(0,0,0,0.45); padding:1.25rem;
          border-right:1px solid rgba(255,255,255,0.07);
          display:flex; flex-direction:column; gap:0.6rem; overflow-y:auto;
        }
        :root.light .c2-sidebar { background:rgba(0,0,0,0.04); border-right:1px solid rgba(0,0,0,0.09); }
        @media(max-width:640px){ .c2-sidebar { width:160px; } }
        .c2-node {
          padding:0.75rem; border:1px solid rgba(255,255,255,0.05);
          border-radius:6px; cursor:pointer; transition:all 0.2s ease;
        }
        .c2-node:hover:not(.c2-node-active) { background:rgba(255,255,255,0.03); }
        .c2-node-active { background:rgba(227,27,84,0.1)!important; border-color:#E31B54!important; }
        :root.light .c2-node { border:1px solid rgba(0,0,0,0.1); }
        :root.light .c2-node:hover:not(.c2-node-active) { background:rgba(0,0,0,0.04); }
        .c2-radar {
          flex:1; background:radial-gradient(circle at center,#0a0a14 0%,#020206 100%);
          position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden;
        }
        :root.light .c2-radar { background:linear-gradient(135deg,#e2e5ef 0%,#d5d9e8 100%); }
        .radar-ring { position:absolute; border:1px solid rgba(227,27,84,0.18); border-radius:50%; }
        .radar-sweep {
          position:absolute; width:200px; height:200px;
          background:conic-gradient(from 0deg,#E31B54 0%,transparent 35%);
          top:50%; left:50%; transform-origin:top left;
          animation:sweep 4s linear infinite; opacity:0.22;
        }
        @keyframes sweep { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .c2-stats {
          width:200px; flex-shrink:0; background:rgba(0,0,0,0.45); padding:1.25rem;
          border-left:1px solid rgba(255,255,255,0.07);
          display:flex; flex-direction:column; gap:0.35rem; overflow-y:auto;
        }
        :root.light .c2-stats { background:rgba(0,0,0,0.04); border-left:1px solid rgba(0,0,0,0.09); }
        @media(max-width:640px){ .c2-stats { display:none; } }
        .c2-divider { width:100%; height:1px; background:rgba(255,255,255,0.07); margin:0.6rem 0; }
        :root.light .c2-divider { background:rgba(0,0,0,0.09); }

        /* ── Intel ── */
        .intel-panel { flex-direction:column; background:#030308; }
        :root.light .intel-panel { background:#eceef3; }
        .intel-metrics { display:flex; border-bottom:1px solid rgba(255,255,255,0.07); flex-shrink:0; }
        :root.light .intel-metrics { border-bottom:1px solid rgba(0,0,0,0.09); }
        .intel-metric-cell {
          flex:1; padding:1.1rem 1.25rem;
          border-right:1px solid rgba(255,255,255,0.07);
        }
        .intel-metric-cell:last-child { border-right:none; }
        :root.light .intel-metric-cell { border-right:1px solid rgba(0,0,0,0.09); }
        .intel-bar-track { height:3px; background:rgba(255,255,255,0.07); border-radius:999px; overflow:hidden; margin-top:0.6rem; }
        :root.light .intel-bar-track { background:rgba(0,0,0,0.1); }
        .intel-bar-fill { height:100%; border-radius:999px; }
        .intel-body {
          flex:1; display:grid; grid-template-columns:1fr 1fr;
          gap:0; overflow:hidden; min-height:0;
        }
        @media(max-width:640px){ .intel-body { grid-template-columns:1fr; } }
        .intel-wave-wrap {
          padding:1.25rem; border-right:1px solid rgba(255,255,255,0.07); position:relative; overflow:hidden;
        }
        :root.light .intel-wave-wrap { border-right:1px solid rgba(0,0,0,0.09); }
        .intel-feed { padding:1.25rem; overflow-y:auto; }
        .intel-feed-row {
          display:flex; align-items:baseline; gap:0.6rem;
          padding:0.45rem 0; border-bottom:1px solid rgba(255,255,255,0.04);
        }
        .intel-feed-row:last-child { border-bottom:none; }
        :root.light .intel-feed-row { border-bottom:1px solid rgba(0,0,0,0.06); }

        /* ── Ops ── */
        .ops-panel { flex-direction:column; background:#030308; }
        :root.light .ops-panel { background:#eceef3; }
        .ops-topbar {
          display:flex; align-items:center; justify-content:space-between;
          padding:0.85rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.07); flex-shrink:0;
        }
        :root.light .ops-topbar { border-bottom:1px solid rgba(0,0,0,0.09); }
        .ops-board {
          flex:1; display:grid; grid-template-columns:repeat(3,1fr);
          gap:0; overflow:hidden; min-height:0;
        }
        @media(max-width:580px){ .ops-board { grid-template-columns:1fr; overflow-y:auto; } }
        .ops-col {
          display:flex; flex-direction:column;
          border-right:1px solid rgba(255,255,255,0.07); overflow:hidden;
        }
        .ops-col:last-child { border-right:none; }
        :root.light .ops-col { border-right:1px solid rgba(0,0,0,0.09); }
        .ops-col-header {
          display:flex; align-items:center; gap:0.6rem;
          padding:0.75rem 1rem; border-bottom:1px solid rgba(255,255,255,0.07); flex-shrink:0;
        }
        :root.light .ops-col-header { border-bottom:1px solid rgba(0,0,0,0.09); }
        .ops-col-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .ops-task-list {
          flex:1; overflow-y:auto; padding:0.6rem;
          display:flex; flex-direction:column; gap:0.5rem;
          scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.08) transparent;
        }
        .ops-task {
          padding:0.75rem; border:1px solid rgba(255,255,255,0.06);
          border-radius:6px; background:rgba(255,255,255,0.02); transition:background 0.2s ease;
        }
        .ops-task:hover { background:rgba(255,255,255,0.04); }
        :root.light .ops-task { border:1px solid rgba(0,0,0,0.09); background:rgba(255,255,255,0.5); }
        :root.light .ops-task:hover { background:rgba(255,255,255,0.85); }
        .ops-task-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.1rem; }
        .ops-priority {
          font-size:0.5rem; letter-spacing:0.14em;
          border:1px solid; border-radius:3px; padding:1px 5px;
        }

        /* ── Treasury ── */
        .treasury-panel { background:#030308; }
        :root.light .treasury-panel { background:#eceef3; }
        .treasury-left {
          flex:1; padding:1.5rem; border-right:1px solid rgba(255,255,255,0.07);
          display:flex; flex-direction:column; overflow-y:auto; min-width:0;
        }
        :root.light .treasury-left { border-right:1px solid rgba(0,0,0,0.09); }
        .treasury-right {
          width:260px; flex-shrink:0; padding:1.5rem;
          display:flex; flex-direction:column; overflow:hidden;
        }
        @media(max-width:860px){ .treasury-right { display:none; } }
        .treasury-balance { margin-bottom:1.25rem; }
        .treasury-divider {
          width:100%; height:1px;
          background:linear-gradient(90deg,rgba(227,27,84,0.3),rgba(255,255,255,0.06) 50%,transparent);
          margin-bottom:1rem;
        }
        .treasury-rows { display:flex; flex-direction:column; }
        .treasury-row {
          display:flex; align-items:center; gap:1rem;
          padding:0.6rem 0; border-bottom:1px solid rgba(255,255,255,0.05);
        }
        .treasury-row:last-child { border-bottom:none; }
        :root.light .treasury-row { border-bottom:1px solid rgba(0,0,0,0.07); }
        .treasury-stack {
          display:flex; height:7px; border-radius:999px; overflow:hidden; gap:1px; margin-bottom:1.1rem;
        }
        .treasury-stack-seg { height:100%; flex-shrink:0; }
        .treasury-legend { display:flex; flex-direction:column; gap:0.45rem; margin-bottom:0.5rem; }
        .treasury-legend-row { display:flex; align-items:center; gap:0.6rem; cursor:default; }
        .treasury-legend-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
      `}</style>

      <div className={`sdemo-root${revealed ? " revealed" : ""}`} ref={sectionRef}>
        <div className="sdemo-inner">

          {/* Header */}
          <div className="sdemo-header">
            <div>
              <div className="sdemo-eyebrow">
                <span className="sdemo-eyebrow-dot" />
                Platform Suite
              </div>
              <h2 className="sdemo-heading">The Software Arsenal</h2>
              <div className="sdemo-rule" />
            </div>
            <p className="sdemo-header-desc">
              Four purpose-built tools powering every layer of the organisation — from command to capital.
            </p>
          </div>

          {/* Tabs */}
          <div className="sdemo-tabs" role="tablist">
            {SOFTWARES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === active}
                className={`sdemo-tab${i === active ? " active" : ""}`}
                onClick={() => goto(i)}
              >
                <span className="sdemo-tab-tag">{s.tag}</span>
                <span className="sdemo-tab-name">{s.name}</span>
                <span className="sdemo-tab-industry">{s.industry}</span>
              </button>
            ))}
          </div>

          {/* Meta */}
          <div className="sdemo-meta">
            <div>
              <div className="sdemo-tagline">{sw.tagline}</div>
              <div className="sdemo-desc">{sw.desc}</div>
            </div>
            <div className="sdemo-nav">
              <button className="sdemo-arrow" onClick={back} aria-label="Previous software">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="sdemo-counter">{active + 1} / {SOFTWARES.length}</span>
              <button className="sdemo-arrow" onClick={next} aria-label="Next software">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Viewport */}
          <div className="sdemo-viewport">
            <div className={`sdemo-slide ${transitioning ? (direction === "next" ? "sdemo-slide-out-next" : "sdemo-slide-out-prev") : "sdemo-slide-idle"}`}>
              <ActiveComp />
            </div>
          </div>

          {/* Dots */}
          <div className="sdemo-dots">
            {SOFTWARES.map((_, i) => (
              <button
                key={i}
                className={`sdemo-dot${i === active ? " active" : ""}`}
                onClick={() => goto(i)}
                aria-label={`Software ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}