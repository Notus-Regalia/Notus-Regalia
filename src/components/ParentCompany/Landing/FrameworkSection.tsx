"use client";

import { useEffect, useRef, useState, useMemo, type ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Layer config ─────────────────────────────────────────────────────────────
const LAYERS = [
  {
    id: "ui",
    label: "Operational Command",
    sublabel: "LAYER 5 · COMMAND SURFACE",
    tag: "TOP SECRET // SCI",
    status: "LIVE",
    statusColor: "#00ff96",
    annotation: ["SITUATIONAL AWARENESS", "MISSION CONTROL · THREAT DISPLAY", "OPERATOR DECISION SUPPORT"],
    metrics: ["OPS: ACTIVE", "UPLINK: 99.8%"],
    description:
      "Coordinate 100+ workflows with approvals, escalation paths, and full auditability.",
  },
  {
    id: "brand",
    label: "Strategic Intelligence",
    sublabel: "LAYER 4 · ANALYSIS ENGINE",
    tag: "CLASSIFIED",
    status: "PROC",
    statusColor: "#40b0ff",
    annotation: ["PATTERN RECOGNITION · THREAT SCORING", "PREDICTIVE MODELING · NLP FUSION", "AUTONOMOUS DECISION WEIGHTING"],
    metrics: ["MODELS: 14 ACTIVE", "CONF: 97.2%"],
    description:
      "Analyze 100M+ data points daily with machine learning and event detection.",
  },
  {
    id: "components",
    label: "Multi-System Information Oversight",
    sublabel: "LAYER 3 · FUSION & GOVERNANCE",
    tag: "SECRET",
    status: "SYNC",
    statusColor: "#ffcc40",
    annotation: ["MULTI-INT CORRELATION · DECONFLICTION", "TEMPORAL ALIGNMENT · GEO-TAGGING", "CROSS-SOURCE VALIDATION"],
    metrics: ["FEEDS: 847", "LAG: 120ms"],
    description:
      "Maintain governance across 50+ systems with traceability and access controls.",
  },
  {
    id: "tokens",
    label: "24/7 Coordinated Monitoring",
    sublabel: "LAYER 2 · LIVE OBSERVATION GRID",
    tag: "CONFIDENTIAL",
    status: "INGEST",
    statusColor: "#b060ff",
    annotation: ["OSINT · SIGINT · IMINT · HUMINT", "DARKWEB MONITORING · SOC FEEDS", "ALLIED NETWORK EXCHANGE"],
    metrics: ["SOURCES: 2,340", "VOLUME: 18TB/h"],
    description:
      "Watch real-time signals with 24/7 monitoring and sub-minute alerts.",
  },
  {
    id: "foundations",
    label: "Million-Source Integration",
    sublabel: "LAYER 1 · COLLECTION INPUTS",
    tag: "UNCLASSIFIED",
    status: "ACQ",
    statusColor: "#ff6040",
    annotation: ["SATELLITES · UAV · GROUND SENSORS", "RADAR · SONAR · RF INTERCEPT", "IOT MESH · FIELD ASSETS"],
    metrics: ["NODES: 12,884", "UPTIME: 99.97%"],
    description:
      "Ingest large amounts signal and source types across internal and external environments.",
  },
];

const SPREAD_GAP = 110;
const CARD = 280;

// ─── Card contents ────────────────────────────────────────────────────────────
type LayerContentProps = {
  isLight: boolean;
};

const PLATFORM_LAYER_BACKGROUND = [
  "linear-gradient(145deg, #4c515b 0%, #3a4049 48%, #2a2f37 100%)",
  "linear-gradient(140deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 36%, rgba(10,12,16,0.1) 100%)",
  "linear-gradient(60deg, rgba(15,23,42,0.05) 25%, transparent 25%, transparent 75%, rgba(15,23,42,0.05) 75%)",
  "linear-gradient(-60deg, rgba(15,23,42,0.03) 25%, transparent 25%, transparent 75%, rgba(15,23,42,0.03) 75%)",
].join(", ");

const DARK_PLATFORM_LAYER_BACKGROUND = [
  "linear-gradient(145deg, #444952 0%, #323740 48%, #232830 100%)",
  "linear-gradient(140deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 36%, rgba(10,12,16,0.14) 100%)",
  "linear-gradient(60deg, rgba(255,255,255,0.03) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.03) 75%)",
  "linear-gradient(-60deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%)",
].join(", ");

function getLayerTone(isLight: boolean) {
  if (isLight) {
    return {
      panelStrong: "rgba(84,91,104,0.76)",
      panel: "rgba(64,70,82,0.88)",
      panelAlt: "rgba(50,56,66,0.9)",
      border: "rgba(255,255,255,0.09)",
      borderSoft: "rgba(255,255,255,0.06)",
      text: "rgba(248,250,252,0.96)",
      textMuted: "rgba(226,232,240,0.72)",
      textSoft: "rgba(226,232,240,0.46)",
      textFaint: "rgba(226,232,240,0.26)",
      track: "rgba(255,255,255,0.08)",
      trackStrong: "rgba(255,255,255,0.12)",
      inactive: "rgba(255,255,255,0.18)",
      inactiveText: "rgba(226,232,240,0.32)",
      inactiveBg: "rgba(255,255,255,0.04)",
    };
  }

  return {
    panelStrong: "rgba(66,72,83,0.84)",
    panel: "rgba(50,55,65,0.92)",
    panelAlt: "rgba(38,43,52,0.94)",
    border: "rgba(255,255,255,.08)",
    borderSoft: "rgba(255,255,255,.05)",
    text: "#ffffff",
    textMuted: "rgba(255,255,255,.7)",
    textSoft: "rgba(255,255,255,.35)",
    textFaint: "rgba(255,255,255,.2)",
    track: "rgba(255,255,255,.06)",
    trackStrong: "rgba(255,255,255,.08)",
    inactive: "rgba(255,255,255,.15)",
    inactiveText: "rgba(255,255,255,.3)",
    inactiveBg: "rgba(255,255,255,.02)",
  };
}

function getLayerRootStyle(isLight: boolean, darkBackground: string) {
  return {
    height: "100%",
    position: "relative" as const,
    overflow: "hidden" as const,
    fontFamily: "'DM Mono',monospace",
    background: darkBackground,
    backgroundImage: isLight ? PLATFORM_LAYER_BACKGROUND : DARK_PLATFORM_LAYER_BACKGROUND,
    backgroundSize: "100% 100%, 100% 100%, 40px 24px, 40px 24px",
    backgroundPosition: "0 0, 0 0, 0 0, 20px 12px",
    boxShadow: isLight ? "inset 0 1px 0 rgba(255,255,255,0.18)" : "inset 0 1px 0 rgba(255,255,255,0.08)",
  };
}

function UIContent({ isLight }: LayerContentProps) {
  const tone = getLayerTone(isLight);

  return (
    <div style={{ ...getLayerRootStyle(isLight, "#080b14"), display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 1 }}>
      <div style={{ background: tone.panelStrong, borderRight: `1px solid ${tone.border}`, borderBottom: `1px solid ${tone.border}`, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 6, letterSpacing: "0.18em", color: isLight ? "rgba(26,133,95,0.65)" : "rgba(0,255,150,.4)", marginBottom: 2 }}>SYS STATUS</div>
        {[{ label: "RENDER", val: "94%", color: "#00ff96" }, { label: "TOKEN", val: "78%", color: "#40b0ff" }, { label: "BRAND", val: "100%", color: "#ff6b35" }].map((row) => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 6, color: tone.textSoft, letterSpacing: "0.12em", width: 32 }}>{row.label}</div>
            <div style={{ flex: 1, height: 3, background: tone.track, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: row.val, height: "100%", background: row.color, boxShadow: isLight ? `0 0 3px ${row.color}88` : `0 0 6px ${row.color}`, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 6, color: row.color, width: 24, textAlign: "right" }}>{row.val}</div>
          </div>
        ))}
      </div>
      <div style={{ background: tone.panel, borderBottom: `1px solid ${tone.border}`, padding: "10px 12px", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 6, letterSpacing: "0.18em", color: isLight ? "rgba(36,119,176,0.6)" : "rgba(0,200,255,.4)", marginBottom: 6 }}>ACTIVITY</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 44, marginTop: 4 }}>
          {[30,55,40,70,45,85,60,75,50,90,65,80].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, background: isLight ? `rgba(64,176,255,${0.18 + h / 220})` : `rgba(0,200,255,${0.15 + h / 200})`, borderRadius: "2px 2px 0 0", boxShadow: h > 70 ? (isLight ? "0 0 3px rgba(64,176,255,.35)" : "0 0 6px rgba(0,200,255,.5)") : "none" }} />
          ))}
        </div>
        <div style={{ position: "absolute", right: 14, top: 12, width: 5, height: 5, borderRadius: "50%", background: "#00ff96", boxShadow: isLight ? "0 0 5px rgba(0,255,150,.42)" : "0 0 8px #00ff96" }} />
      </div>
      <div style={{ background: tone.panelAlt, borderRight: `1px solid ${tone.border}`, padding: "8px 12px", overflow: "hidden" }}>
        <div style={{ fontSize: 6, letterSpacing: "0.18em", color: isLight ? "rgba(26,133,95,0.65)" : "rgba(0,255,150,.4)", marginBottom: 5 }}>CMD LOG</div>
        {[{ t: "00:01", msg: "SENSOR › feed acquired" }, { t: "00:02", msg: "FUSION › data correlated" }, { t: "00:03", msg: "AI    › threat scored" }, { t: "00:04", msg: "C2    › operator notified" }].map((row, i) => (
          <div key={i} style={{ display: "flex", gap: 5, marginBottom: 3 }}>
            <div style={{ fontSize: 6, color: tone.textFaint, flexShrink: 0 }}>{row.t}</div>
            <div style={{ fontSize: 6, color: isLight ? "rgba(26,133,95,0.85)" : "rgba(0,255,150,.7)", lineHeight: 1.4 }}>{row.msg}</div>
          </div>
        ))}
      </div>
      <div style={{ background: tone.panel, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ fontSize: 6, letterSpacing: "0.18em", color: isLight ? "rgba(36,119,176,0.62)" : "rgba(100,160,255,.4)", marginBottom: 2 }}>CONTROLS</div>
        {[{ label: "DARK MODE", on: true }, { label: "ANIMATIONS", on: true }, { label: "COMPACT", on: false }].map((ctrl) => (
          <div key={ctrl.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 6, color: tone.textSoft, letterSpacing: "0.1em" }}>{ctrl.label}</div>
            <div style={{ width: 20, height: 9, borderRadius: 5, background: ctrl.on ? (isLight ? "rgba(0,255,150,.18)" : "rgba(0,255,150,.35)") : tone.trackStrong, border: `1px solid ${ctrl.on ? (isLight ? "rgba(0,255,150,.35)" : "rgba(0,255,150,.5)") : tone.border}`, position: "relative" }}>
              <div style={{ position: "absolute", top: 1, left: ctrl.on ? 11 : 1, width: 6, height: 6, borderRadius: "50%", background: ctrl.on ? "#00ff96" : tone.inactive, boxShadow: ctrl.on ? (isLight ? "0 0 3px rgba(0,255,150,.42)" : "0 0 5px #00ff96") : "none" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandContent({ isLight }: LayerContentProps) {
  const tone = getLayerTone(isLight);
  const models = [
    { name: "Claude AI",  maker: "Anthropic", color: "#cc9aff", pct: 97 },
    { name: "GPT-4o",     maker: "OpenAI",    color: "#40ffb0", pct: 91 },
    { name: "Gemini Pro", maker: "Google",    color: "#40b0ff", pct: 88 },
    { name: "Llama 3.1",  maker: "Meta",      color: "#ffcc40", pct: 84 },
  ];
  return (
    <div style={{ ...getLayerRootStyle(isLight, "linear-gradient(160deg,#0a0616,#060d1a)"), padding: "12px 14px", display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ fontSize: 6, letterSpacing: "0.16em", color: isLight ? "rgba(117,83,168,0.62)" : "rgba(180,100,255,.45)" }}>STRATEGIC INTELLIGENCE · MODEL ENSEMBLE</div>
      {models.map((m) => (
        <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: m.color, boxShadow: isLight ? `0 0 3px ${m.color}88` : `0 0 5px ${m.color}`, flexShrink: 0 }} />
          <div style={{ width: 60, flexShrink: 0 }}>
            <div style={{ fontSize: 7, color: tone.text, letterSpacing: "0.06em", lineHeight: 1.2 }}>{m.name}</div>
            <div style={{ fontSize: 5.5, color: tone.textSoft, letterSpacing: "0.08em" }}>{m.maker}</div>
          </div>
          <div style={{ flex: 1, height: 4, background: tone.track, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${m.pct}%`, height: "100%", background: `linear-gradient(90deg,${m.color}88,${m.color})`, borderRadius: 2, boxShadow: isLight ? `0 0 4px ${m.color}44` : `0 0 6px ${m.color}66` }} />
          </div>
          <div style={{ fontSize: 6.5, color: m.color, width: 24, textAlign: "right", flexShrink: 0 }}>{m.pct}%</div>
        </div>
      ))}
      <div style={{ marginTop: "auto", fontSize: 5.5, letterSpacing: "0.1em", color: tone.textFaint }}>ENSEMBLE CONFIDENCE · WEIGHTED VOTING · REAL-TIME INFERENCE</div>
    </div>
  );
}

function ComponentsContent({ isLight }: LayerContentProps) {
  const tone = getLayerTone(isLight);
  const nodes = [
    { id: "palantir",   x: 50, y: 50, label: "Palantir",   sub: "GOTHAM",    color: "#40b0ff", r: 15, primary: true  },
    { id: "esri",       x: 20, y: 22, label: "Esri",       sub: "ArcGIS",    color: "#00ff96", r: 11, primary: false },
    { id: "databricks", x: 78, y: 20, label: "Databricks", sub: "LAKEHOUSE", color: "#ff6b35", r: 11, primary: false },
    { id: "elastic",    x: 80, y: 72, label: "Elastic",    sub: "SIEM",      color: "#ffcc40", r: 11, primary: false },
    { id: "kafka",      x: 22, y: 78, label: "Kafka",      sub: "STREAM",    color: "#b060ff", r: 11, primary: false },
    { id: "neo4j",      x: 50, y: 18, label: "Neo4j",      sub: "GRAPH DB",  color: "#cc9aff", r: 8,  primary: false },
    { id: "spark",      x: 82, y: 45, label: "Spark",      sub: "PROCESS",   color: "#ff9040", r: 8,  primary: false },
    { id: "flink",      x: 50, y: 84, label: "Flink",      sub: "STREAM",    color: "#40ffb0", r: 8,  primary: false },
    { id: "redis",      x: 18, y: 48, label: "Redis",      sub: "CACHE",     color: "#ff4060", r: 8,  primary: false },
  ];
  const edges = [
    ["palantir","esri"],["palantir","databricks"],["palantir","elastic"],["palantir","kafka"],
    ["palantir","neo4j"],["palantir","spark"],["palantir","flink"],["palantir","redis"],
    ["esri","neo4j"],["databricks","spark"],["elastic","spark"],["kafka","flink"],["kafka","redis"],
  ];
  const W = 280;
  return (
    <div style={{ ...getLayerRootStyle(isLight, "rgba(4,6,16,.98)"), width: "100%" }}>
      <div style={{ position: "absolute", top: 8, left: 10, fontSize: 6, letterSpacing: "0.18em", color: tone.textFaint, zIndex: 2 }}>INFORMATION OVERSIGHT · CORRELATION MESH</div>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} viewBox={`0 0 ${W} ${W}`}>
        {edges.map(([a, b], ei) => {
          const na = nodes.find((nd) => nd.id === a)!;
          const nb = nodes.find((nd) => nd.id === b)!;
          return <line key={ei} x1={na.x / 100 * W} y1={na.y / 100 * W} x2={nb.x / 100 * W} y2={nb.y / 100 * W} stroke={na.color} strokeWidth={0.8} strokeOpacity={isLight ? 0.18 : 0.22} />;
        })}
        {nodes.map((node) => {
          const cx = node.x / 100 * W;
          const cy = node.y / 100 * W;
          return (
            <g key={node.id}>
              <circle cx={cx} cy={cy} r={node.r + 4} fill="none" stroke={node.color} strokeWidth={0.6} strokeOpacity={isLight ? 0.12 : 0.18} />
              <circle cx={cx} cy={cy} r={node.r} fill={node.color} fillOpacity={node.primary ? (isLight ? 0.12 : 0.18) : (isLight ? 0.08 : 0.1)} stroke={node.color} strokeWidth={1} strokeOpacity={isLight ? 0.55 : 0.7} />
              <circle cx={cx} cy={cy} r={node.primary ? 3 : 2} fill={node.color} fillOpacity={0.88} />
              <text x={cx} y={cy + node.r + 9} textAnchor="middle" fontSize={node.primary ? 7 : 6} fill={node.color} fillOpacity={isLight ? 0.78 : 0.9} fontFamily="'DM Mono',monospace" letterSpacing="0.08em">{node.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TokensContent({ isLight }: LayerContentProps) {
  const tone = getLayerTone(isLight);
  const sources = [
    { name: "Recorded Future", type: "OSINT/CYBER",  color: "#ff6040", active: true  },
    { name: "Maxar EO",        type: "IMINT/SAT",    color: "#40b0ff", active: true  },
    { name: "Shodan",          type: "OSINT/NETINT", color: "#ffcc40", active: true  },
    { name: "XSOAR",           type: "SIEM/SOAR",    color: "#00ff96", active: true  },
    { name: "Maltego",         type: "OSINT/LINK",   color: "#cc9aff", active: true  },
    { name: "OpenCTI",         type: "THREATINT",    color: "#40ffb0", active: false },
  ];
  return (
    <div style={{ ...getLayerRootStyle(isLight, "#04060f"), padding: "10px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ fontSize: 6, letterSpacing: "0.16em", color: isLight ? "rgba(36,119,176,0.62)" : "rgba(100,180,255,.4)", marginBottom: 2 }}>COORDINATED MONITORING · SOURCE REGISTRY</div>
      {sources.map((s) => (
        <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 7px", borderRadius: 3, background: s.active ? `${s.color}${isLight ? "12" : "08"}` : tone.inactiveBg, border: `1px solid ${s.active ? s.color + (isLight ? "28" : "25") : tone.borderSoft}` }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: s.active ? s.color : tone.inactive, boxShadow: s.active ? (isLight ? `0 0 3px ${s.color}66` : `0 0 6px ${s.color}`) : "none", flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 7, color: s.active ? tone.text : tone.inactiveText, letterSpacing: "0.05em" }}>{s.name}</div>
          <div style={{ fontSize: 5.5, letterSpacing: "0.1em", color: s.active ? s.color : tone.textFaint, background: s.active ? `${s.color}${isLight ? "14" : "12"}` : "transparent", border: `1px solid ${s.active ? s.color + (isLight ? "2a" : "30") : tone.borderSoft}`, borderRadius: 2, padding: "1px 4px", flexShrink: 0 }}>{s.type}</div>
          <div style={{ fontSize: 5.5, color: s.active ? (isLight ? "rgba(26,133,95,0.72)" : "rgba(0,255,150,.6)") : tone.textFaint, letterSpacing: "0.1em", flexShrink: 0 }}>{s.active ? "LIVE" : "OFF"}</div>
        </div>
      ))}
    </div>
  );
}

function FoundationsContent({ isLight }: LayerContentProps) {
  const packets = useMemo(() => {
    const rows = 8, cols = 10;
    const colors = ["#ff6040","#40b0ff","#00ff96","#ffcc40","#cc9aff","#40ffb0","#ff9040"];
    return Array.from({ length: rows * cols }, (_, idx) => {
      const seed = (idx * 2654435761) >>> 0;
      const r = (seed & 0xff) / 255;
      const g = ((seed >> 8) & 0xff) / 255;
      const h = ((seed >> 16) & 0xff) / 255;
      const color = colors[idx % colors.length];
      const type = r > 0.82 ? "packet" : r > 0.65 ? "pulse" : "dot";
      return { idx, color, opacity: 0.15 + g * 0.75, type, size: type === "packet" ? 5 + h * 5 : type === "pulse" ? 4 : 2.5 + h * 2.5 };
    });
  }, []);
  return (
    <div style={{ ...getLayerRootStyle(isLight, "#010306") }}>
      <div style={{ position: "absolute", top: 7, left: 10, fontSize: 6, letterSpacing: "0.18em", color: isLight ? "rgba(198,78,46,0.62)" : "rgba(255,96,64,.5)", zIndex: 2 }}>SOURCES & SIGNALS · {packets.length} PACKETS</div>
      <div style={{ position: "absolute", inset: "20px 8px 8px", display: "grid", gridTemplateColumns: "repeat(10,1fr)", gridTemplateRows: "repeat(8,1fr)", gap: 2 }}>
        {packets.map((p) => (
          <div key={p.idx} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {p.type === "packet" ? (
              <div style={{ width: p.size + 5, height: p.size * 0.55, borderRadius: 1, background: `${p.color}${Math.round((isLight ? p.opacity * 0.82 : p.opacity) * 255).toString(16).padStart(2, "0")}`, border: `1px solid ${p.color}${isLight ? "44" : "55"}` }} />
            ) : p.type === "pulse" ? (
              <div style={{ width: p.size, height: p.size, borderRadius: "50%", border: `1px solid ${p.color}`, opacity: isLight ? p.opacity * 0.5 : p.opacity * 0.7 }} />
            ) : (
              <div style={{ width: p.size, height: p.size, borderRadius: "50%", background: p.color, opacity: isLight ? p.opacity * 0.78 : p.opacity }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderLayerContent(id: string, isLight: boolean) {
  switch (id) {
    case "ui":
      return <UIContent isLight={isLight} />;
    case "brand":
      return <BrandContent isLight={isLight} />;
    case "components":
      return <ComponentsContent isLight={isLight} />;
    case "tokens":
      return <TokensContent isLight={isLight} />;
    default:
      return <FoundationsContent isLight={isLight} />;
  }
}

function LayerGlyph({ id }: { id: string }) {
  switch (id) {
    case "ui":
      return (
        <i className="bi bi-crosshair" aria-hidden="true" />
      );
    case "brand":
      return (
        <i className="bi bi-graph-up" aria-hidden="true" />
      );
    case "components":
      return (
        <i className="bi bi-eye" aria-hidden="true" />
      );
    case "tokens":
      return (
        <i className="bi bi-diagram-3" aria-hidden="true" />
      );
    default:
      return (
        <i className="bi bi-node-plus" aria-hidden="true" />
      );
  }
}

function AccordionPanel({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    if (!open) {
      setHeight(0);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setHeight(el.scrollHeight);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, children]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el || !open || typeof ResizeObserver === "undefined") return;

    const syncHeight = () => setHeight(el.scrollHeight);
    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, children]);

  return (
    <div
      className={`fw-accordion-panel${open ? " open" : ""}`}
      style={{ height: open ? `${height}px` : "0px" }}
    >
      <div ref={bodyRef} className="fw-accordion-body">
        {children}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FrameworkSection() {
  const { isDark } = useTheme();
  const sectionRef = useRef<HTMLDivElement>(null);
  const outerRef  = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const rafProgressRef = useRef<number | null>(null);
  const pendingProgressRef = useRef(0);
  const lastCommittedProgressRef = useRef(-1);
  const [progress, setProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const focusedId = hoveredId ?? selectedId;
  const activeAccordionId = focusedId;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setProgress(1);
      lastCommittedProgressRef.current = 1;
      return;
    }

    let ctx: gsap.Context | null = null;
    const id = setTimeout(() => {
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: outerRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: stickyRef.current,
          pinSpacing: false,
          anticipatePin: 1,
          onUpdate: (self) => {
            const raw = self.progress;
            const p = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw;
            pendingProgressRef.current = p;
            if (rafProgressRef.current !== null) return;
            rafProgressRef.current = window.requestAnimationFrame(() => {
              rafProgressRef.current = null;
              const snapped = Math.round(pendingProgressRef.current * 180) / 180;
              if (Math.abs(snapped - lastCommittedProgressRef.current) < 0.003) return;
              lastCommittedProgressRef.current = snapped;
              setProgress(snapped);
            });
          },
        });
      });
    }, 100);
    return () => {
      clearTimeout(id);
      if (rafProgressRef.current !== null) {
        window.cancelAnimationFrame(rafProgressRef.current);
        rafProgressRef.current = null;
      }
      ctx?.revert();
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setHoveredId(null);
    }
  }, [isMobile]);

  useEffect(() => {
    const onDocPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (!sectionRef.current?.contains(target)) {
        setSelectedId(null);
        setHoveredId(null);
      }
    };

    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, []);

  function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

  const n = LAYERS.length;
  const sceneCardSize = isMobile ? 190 : CARD;
  const spreadGap = isMobile ? 72 : SPREAD_GAP;
  const isDesktopCompressed = !isMobile && progress < 0.42;
  const isLight = !isDark;

  function getScreenY(i: number): number {
    const spreadY = (i - (n - 1) / 2) * spreadGap;
    return lerp(0, spreadY, progress);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .fw-outer { height: 500vh; }

        .fw-sticky {
          height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          background: var(--gradient-section, #050505);
          position: relative;
        }

        .fw-left {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          min-height: 0;
          padding: 3.5rem 3rem 2.25rem 2rem;
          position: relative;
          z-index: 10;
          border-right: 1px dashed var(--border-dashed, rgba(255,255,255,0.1));
        }
        @media(min-width:640px)  { .fw-left { padding-left: 4rem; padding-right: 3rem; } }
        @media(min-width:768px)  { .fw-left { padding-left: 6rem; padding-right: 3rem; } }
        @media(min-width:1280px) { .fw-left { padding-left: 8rem; padding-right: 3rem; } }
        @media(min-width:1536px) { .fw-left { padding-left: 12rem; padding-right: 4rem; } }
        .fw-left-header {
          flex-shrink: 0;
          margin-bottom: 1.25rem;
        }
        .fw-left-body {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          padding-bottom: 6.5rem;
        }

        .fw-right {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          /* Grid background matching teams-root */
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        .fw-card-iso {
          width: 100%;
          height: 100%;
          transform: perspective(800px) rotateX(52deg) rotateZ(-45deg);
          border-radius: 8px;
          overflow: hidden;
          transition: box-shadow .4s, filter .4s;
        }

        @keyframes fw-float-bob {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -4px; }
        }

        @keyframes fw-drift1 { from{transform:translate(0,0)scale(1)} to{transform:translate(5%,8%)scale(1.1)} }
        @keyframes fw-drift2 { from{transform:translate(0,0)scale(1)} to{transform:translate(-6%,-5%)scale(1.08)} }

        .fw-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.74rem;
          font-family: ui-monospace, Menlo, monospace;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          font-weight: 700;
          color: #E31B54;
          margin-bottom: 1rem;
        }
        .fw-eyebrow-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #E31B54;
          box-shadow: 0 0 6px rgba(227,27,84,0.7);
          animation: fw-eyepulse 2s ease-in-out infinite;
        }
        @keyframes fw-eyepulse {
          0%,100% { box-shadow: 0 0 6px rgba(227,27,84,0.7); }
          50%      { box-shadow: 0 0 14px rgba(227,27,84,1); }
        }
        .fw-heading {
          font-size: clamp(2.2rem, 4.8vw, 3.45rem);
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.15;
          background: linear-gradient(135deg, #f1f5f9 0%, rgba(241,245,249,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.75rem;
        }
        .fw-rule {
          width: 40px; height: 2px;
          background: #E31B54;
          border-radius: 999px;
          box-shadow: 0 0 8px rgba(227,27,84,0.5);
          margin: 1rem 0 0;
        }
        .fw-desc {
          font-size: clamp(1.02rem, 1.45vw, 1.24rem);
          line-height: 1.7;
          color: rgba(255,255,255,0.4);
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          margin-bottom: 2rem;
        }

        /* Layer accordion */
        .fw-roster {
          display: flex;
          flex-direction: column;
          gap: 0;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-right: 8px;
          margin-right: -8px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.12) transparent;
        }
        .fw-roster::-webkit-scrollbar {
          width: 6px;
        }
        .fw-roster::-webkit-scrollbar-track {
          background: transparent;
        }
        .fw-roster::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
        }
        .fw-accordion-item {
          position: relative;
          border-top: 1px solid rgba(255,255,255,0.09);
          background: transparent;
          overflow: hidden;
          transition: opacity .28s;
          animation: fw-pill-enter 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .fw-accordion-item:last-child {
          border-bottom: 1px solid rgba(255,255,255,0.09);
        }
        .fw-accordion-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: -1px;
          width: min(84%, 540px);
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.14) 100%);
          opacity: 0;
          transition: opacity .25s ease;
          pointer-events: none;
        }
        .fw-accordion-item.active::before {
          opacity: 1;
        }
        .fw-accordion-item.dimmed {
          opacity: 0.7;
        }
        .fw-accordion-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 18px;
          min-height: 5rem;
          padding: 1.15rem 0;
          border: 0;
          background: transparent;
          color: inherit;
          text-align: left;
          cursor: pointer;
          font: inherit;
        }
        .fw-accordion-trigger:focus-visible {
          outline: 1px solid rgba(227,27,84,0.6);
          outline-offset: -1px;
        }
        .fw-accordion-main {
          flex: 1;
          min-width: 0;
          display: block;
        }
        .fw-accordion-indicator {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          flex-shrink: 0;
          font-size: 1rem;
          line-height: 1;
          opacity: 0.44;
          transition: opacity .25s ease;
        }
        .fw-accordion-item.active .fw-accordion-indicator {
          opacity: 0.72;
        }
        @keyframes fw-pill-enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .fw-accordion-item {
            animation: none;
          }
        }
        .fw-accordion-icon {
          width: 52px;
          height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: rgba(255,255,255,0.18);
          transition: color .25s ease, opacity .25s ease;
        }
        .fw-accordion-icon i {
          font-size: 1.55rem;
          line-height: 1;
        }
        .fw-roster-name {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          font-size: clamp(1.14rem, 1.9vw, 1.66rem);
          font-weight: 500;
          letter-spacing: -0.01em;
          color: rgba(255,255,255,0.34);
          text-transform: none;
          transition: color .25s ease, opacity .25s ease;
        }
        .fw-accordion-panel {
          height: 0;
          opacity: 0;
          overflow: hidden;
          will-change: height, opacity;
          transition: height .28s ease, opacity .2s ease;
        }
        .fw-accordion-panel.open {
          opacity: 1;
        }
        .fw-accordion-body {
          padding: 0 0 1.75rem 70px;
        }
        .fw-accordion-desc {
          margin: 0;
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          font-size: clamp(0.96rem, 1.32vw, 1.18rem);
          line-height: 1.5;
          color: rgba(255,255,255,0.56);
          max-width: none;
          width: 100%;
        }
        .fw-scroll-hint {
          position: absolute;
          bottom: 2.5rem;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 1;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .fw-scroll-hint.hidden { opacity: 0; }
        .fw-scroll-label {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.65rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .fw-scroll-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.3);
          animation: fw-arrow-bob 1.8s ease-in-out infinite;
        }
        @keyframes fw-arrow-bob {
          0%,100% { transform: translateY(0); opacity: 0.4; }
          50%      { transform: translateY(3px); opacity: 0.8; }
        }
        .fw-scroll-track {
          width: 160px;
          height: 2px;
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          overflow: hidden;
        }
        .fw-scroll-fill {
          height: 100%;
          background: #E31B54;
          border-radius: 999px;
          box-shadow: 0 0 6px rgba(227,27,84,0.6);
          transition: width 0.1s linear;
        }
        @media (min-width: 768px) and (max-width: 1366px), (min-width: 768px) and (max-height: 860px) {
          .fw-heading {
            font-size: clamp(1.9rem, 3.6vw, 2.7rem);
          }
          .fw-desc {
            font-size: clamp(0.94rem, 1.14vw, 1.06rem);
          }
          .fw-roster-name {
            font-size: clamp(1.02rem, 1.58vw, 1.38rem);
          }
          .fw-accordion-desc {
            font-size: clamp(0.88rem, 1.04vw, 1.02rem);
            line-height: 1.45;
          }
        }
        @media(max-width:767px) {
          .fw-outer {
            height: auto;
            min-height: 0;
          }
          .fw-sticky {
            height: auto;
            display: block;
          }
          .fw-left {
            padding: 1.25rem 1rem;
            justify-content: flex-start;
            border-right: none;
            border-bottom: 1px dashed var(--border-dashed, rgba(255,255,255,0.1));
          }
          .fw-left-body {
            padding-bottom: 0;
          }
          .fw-desc {
            margin-bottom: 1rem;
          }
          .fw-scroll-hint {
            display: none;
          }
          .fw-right {
            min-height: 620px;
          }
          .fw-accordion-item,
          .fw-accordion-trigger,
          .fw-accordion-panel,
          .fw-accordion-icon,
          .fw-roster-name {
            transition: none !important;
          }
          .fw-accordion-body {
            padding: 0 0 1.45rem 60px;
          }
          .fw-accordion-desc {
            font-size: 0.9rem;
          }
        }
        /* ── Light mode overrides ── */
        :root.light .fw-sticky {
          background: var(--gradient-section, #ffffff);
        }
        :root.light .fw-left {
          border-right: 1px dashed var(--border-dashed, rgba(0,0,0,0.12));
        }
        :root.light .fw-heading {
          background: linear-gradient(135deg, #0f172a 0%, rgba(15,23,42,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        :root.light .fw-desc {
          color: rgba(0,0,0,0.5);
        }
        :root.light .fw-roster {
          scrollbar-color: rgba(0,0,0,0.16) transparent;
        }
        :root.light .fw-roster::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.16);
        }
        :root.light .fw-accordion-item {
          border-top-color: rgba(15,23,42,0.1);
          background: transparent;
        }
        :root.light .fw-accordion-item:last-child {
          border-bottom-color: rgba(15,23,42,0.1);
        }
        :root.light .fw-accordion-item::before {
          background: linear-gradient(90deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.1) 100%);
        }
        :root.light .fw-accordion-icon {
          color: rgba(15,23,42,0.18);
        }
        :root.light .fw-roster-name {
          color: rgba(15,23,42,0.26);
        }
        :root.light .fw-accordion-indicator {
          color: rgba(15,23,42,0.34);
        }
        :root.light .fw-accordion-desc {
          color: rgba(15,23,42,0.58);
        }
        :root.light .fw-scroll-label {
          color: rgba(0,0,0,0.3);
        }
        :root.light .fw-scroll-arrow {
          border-color: rgba(0,0,0,0.1);
          color: rgba(0,0,0,0.3);
        }
        :root.light .fw-scroll-track {
          background: rgba(0,0,0,0.08);
        }
        :root.light .fw-right {
          background-color: rgba(249,244,236,0.42);
          background-image:
            linear-gradient(rgba(15,23,42,0.078) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.078) 1px, transparent 1px);
          background-size: 32px 32px, 32px 32px;
        }
        @media(max-width:767px) {
          :root.light .fw-left {
            border-bottom: 1px dashed var(--border-dashed, rgba(0,0,0,0.12));
          }
        }
      `}</style>

      <div
        ref={sectionRef}
        style={{
          position: "relative",
          background: "var(--gradient-section, #050505)",
          borderTop: "1px dashed var(--border-dashed, rgba(255,255,255,0.1))",
          borderBottom: "1px dashed var(--border-dashed, rgba(255,255,255,0.1))",
        }}
        onPointerDown={(event) => {
          const target = event.target as HTMLElement | null;
          if (!target) return;
          if (!target.closest("[data-fw-keep-active='true']")) {
            setSelectedId(null);
            setHoveredId(null);
          }
        }}
      >
        {/* Outer — scroll driver */}
        <div ref={outerRef} className="fw-outer">

          {/* Sticky two-column viewport */}
          <div ref={stickyRef} className="fw-sticky">

            {/* ── LEFT PANEL ── */}
            <div className="fw-left">
              <div className="fw-left-header">
                <span className="fw-eyebrow">
                  <span className="fw-eyebrow-dot" />
                  Our Architecture Framework
                </span>

                <h2 className="fw-heading">How It Comes Together.</h2>
                <div className="fw-rule" />
              </div>

              <div className="fw-left-body">
                {/* Live layer roster */}
                <div className="fw-roster">
                  {LAYERS.map((layer, idx) => {
                    const isActive = activeAccordionId === layer.id;
                    const isDimmed = focusedId !== null && !isActive;
                    return (
                      <div
                        key={layer.id}
                        data-fw-keep-active="true"
                        className={`fw-accordion-item${isActive ? " active" : ""}${isDimmed ? " dimmed" : ""}`}
                        style={{
                          touchAction: "manipulation",
                          animationDelay: `${idx * 70}ms`,
                        }}
                      >
                        <button
                          type="button"
                          data-fw-keep-active="true"
                          className="fw-accordion-trigger"
                          aria-expanded={isActive}
                          onPointerDown={() => {
                            if (isMobile) setSelectedId((prev) => (prev === layer.id ? null : layer.id));
                          }}
                          onClick={() => {
                            if (!isMobile) setSelectedId((prev) => (prev === layer.id ? null : layer.id));
                          }}
                        >
                          <span
                            className="fw-accordion-icon"
                            style={{ color: isActive ? layer.statusColor : undefined }}
                          >
                            <LayerGlyph id={layer.id} />
                          </span>

                          <div className="fw-accordion-main">
                            <span
                              className="fw-roster-name"
                              style={{ color: isActive ? "var(--content-primary, #fff)" : undefined }}
                            >
                              {layer.label}
                            </span>
                          </div>

                          <span className="fw-accordion-indicator" aria-hidden="true">
                            <i className={`bi ${isActive ? "bi-dash" : "bi-plus"}`} />
                          </span>
                        </button>

                        <AccordionPanel open={isActive}>
                          <p className="fw-accordion-desc">{layer.description}</p>
                        </AccordionPanel>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="fw-right">

              {/* CARDS */}
              {[...LAYERS].reverse().map((layer, ri) => {
                const i = LAYERS.length - 1 - ri;
                const sy = getScreenY(i);
                const shadowBlur = isMobile ? 24 : 34;
                const shadowOpacity = isMobile ? 0.34 : 0.44;
                const cardZ = 10 + (LAYERS.length - i) * 2;
                const isHovered = focusedId === layer.id;
                const cardOpacity = focusedId === null ? 1 : isHovered ? 1 : 0.2;
                const cardShadow = isLight
                  ? isMobile
                    ? `0 18px ${shadowBlur}px rgba(33,37,45,0.24), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.16)`
                    : isDesktopCompressed
                      ? isHovered
                        ? `0 10px 20px rgba(33,37,45,0.2), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.18)`
                        : `0 8px 16px rgba(33,37,45,0.16), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.14)`
                      : isHovered
                        ? `0 24px ${shadowBlur + 14}px rgba(33,37,45,0.26), 0 0 0 1px rgba(255,255,255,0.09), inset 0 1px 0 rgba(255,255,255,0.2)`
                        : `0 20px ${shadowBlur}px rgba(33,37,45,0.22), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.16)`
                  : isMobile
                    ? `0 20px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}), 0 1px 0 rgba(255,255,255,0.07)`
                    : isDesktopCompressed
                      ? isHovered
                        ? `0 10px 20px rgba(0,0,0,0.34), 0 1px 0 rgba(255,255,255,0.09)`
                        : `0 8px 16px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.06)`
                      : isHovered
                        ? `0 24px ${shadowBlur + 14}px rgba(0,0,0,${shadowOpacity + 0.18}), 0 1px 0 rgba(255,255,255,0.12)`
                        : `0 20px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}), 0 1px 0 rgba(255,255,255,0.07)`;

                return (
                  <div
                    key={`card-${layer.id}`}
                    data-fw-keep-active="true"
                    style={{
                      position: "absolute",
                      top: "50%", left: "50%",
                      width: sceneCardSize, height: sceneCardSize,
                      marginLeft: -sceneCardSize / 2, marginTop: -sceneCardSize / 2,
                      transform: `translate3d(0, ${sy}px, 0)`,
                      zIndex: cardZ,
                      opacity: cardOpacity,
                      transition: isMobile ? "none" : "opacity .16s linear",
                      willChange: "transform",
                      cursor: "crosshair",
                        animationName: "none",
                        animationDuration: "6.28s",
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                        animationDelay: `${-i * 0.8}s`,
                    }}
                    onMouseEnter={() => {
                      if (!isMobile) setHoveredId(layer.id);
                    }}
                    onMouseLeave={() => {
                      if (!isMobile) setHoveredId(null);
                    }}
                    onPointerDown={() => {
                      if (isMobile) setSelectedId((prev) => (prev === layer.id ? null : layer.id));
                    }}
                    onClick={() => {
                      if (!isMobile) setSelectedId((prev) => (prev === layer.id ? null : layer.id));
                    }}
                  >
                    <div
                      className="fw-card-iso"
                      style={{
                        boxShadow: cardShadow,
                        filter: isMobile || isDesktopCompressed ? "none" : isHovered ? (isLight ? "brightness(1.03) saturate(0.96)" : "brightness(1.12)") : "brightness(1)",
                        background: isLight
                          ? "linear-gradient(145deg, #4b505a 0%, #373d46 54%, #262b33 100%)"
                          : "linear-gradient(145deg, #434851 0%, #2f353e 54%, #20252d 100%)",
                        border: isLight ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {renderLayerContent(layer.id, isLight)}
                    </div>
                  </div>
                );
              })}

              {/* Scroll tooltip */}
              <div className={`fw-scroll-hint${progress > 0.95 ? " hidden" : ""}`}>
                <div className="fw-scroll-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
                <span className="fw-scroll-label">Scroll to expand</span>
                <div className="fw-scroll-track">
                  <div className="fw-scroll-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
