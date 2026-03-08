"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Layer config ─────────────────────────────────────────────────────────────
const LAYERS = [
  {
    id: "ui",
    label: "C2 OPERATOR INTERFACE",
    sublabel: "LAYER 5 · COMMAND DECK",
    tag: "TOP SECRET // SCI",
    status: "LIVE",
    statusColor: "#00ff96",
    annotation: ["SITUATIONAL AWARENESS", "MISSION CONTROL · THREAT DISPLAY", "OPERATOR DECISION SUPPORT"],
    metrics: ["OPS: ACTIVE", "UPLINK: 99.8%"],
  },
  {
    id: "brand",
    label: "AI ANALYTICS ENGINE",
    sublabel: "LAYER 4 · COGNITIVE PROCESSING",
    tag: "CLASSIFIED",
    status: "PROC",
    statusColor: "#40b0ff",
    annotation: ["PATTERN RECOGNITION · THREAT SCORING", "PREDICTIVE MODELING · NLP FUSION", "AUTONOMOUS DECISION WEIGHTING"],
    metrics: ["MODELS: 14 ACTIVE", "CONF: 97.2%"],
  },
  {
    id: "components",
    label: "DATA FUSION LAYER",
    sublabel: "LAYER 3 · CORRELATION ENGINE",
    tag: "SECRET",
    status: "SYNC",
    statusColor: "#ffcc40",
    annotation: ["MULTI-INT CORRELATION · DECONFLICTION", "TEMPORAL ALIGNMENT · GEO-TAGGING", "CROSS-SOURCE VALIDATION"],
    metrics: ["FEEDS: 847", "LAG: 120ms"],
  },
  {
    id: "tokens",
    label: "INTELLIGENCE AGGREGATOR",
    sublabel: "LAYER 2 · OSINT · SIGINT · HUMINT",
    tag: "CONFIDENTIAL",
    status: "INGEST",
    statusColor: "#b060ff",
    annotation: ["OSINT · SIGINT · IMINT · HUMINT", "DARKWEB MONITORING · SOC FEEDS", "ALLIED NETWORK EXCHANGE"],
    metrics: ["SOURCES: 2,340", "VOLUME: 18TB/h"],
  },
  {
    id: "foundations",
    label: "SENSOR & COLLECTION GRID",
    sublabel: "LAYER 1 · RAW DATA ACQUISITION",
    tag: "UNCLASSIFIED",
    status: "ACQ",
    statusColor: "#ff6040",
    annotation: ["SATELLITES · UAV · GROUND SENSORS", "RADAR · SONAR · RF INTERCEPT", "IOT MESH · FIELD ASSETS"],
    metrics: ["NODES: 12,884", "UPTIME: 99.97%"],
  },
];

const SPREAD_GAP = 110;
const CARD = 280;

// ─── Card contents ────────────────────────────────────────────────────────────
function UIContent() {
  return (
    <div style={{ height: "100%", background: "#080b14", overflow: "hidden", position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 1, fontFamily: "'DM Mono',monospace" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,180,0.015) 4px)", pointerEvents: "none", zIndex: 10 }} />
      <div style={{ background: "rgba(0,20,14,.9)", borderRight: "1px solid rgba(0,255,150,.08)", borderBottom: "1px solid rgba(0,255,150,.08)", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 6, letterSpacing: "0.18em", color: "rgba(0,255,150,.4)", marginBottom: 2 }}>SYS STATUS</div>
        {[{ label: "RENDER", val: "94%", color: "#00ff96" }, { label: "TOKEN", val: "78%", color: "#40b0ff" }, { label: "BRAND", val: "100%", color: "#ff6b35" }].map((row) => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,.3)", letterSpacing: "0.12em", width: 32 }}>{row.label}</div>
            <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: row.val, height: "100%", background: row.color, boxShadow: `0 0 6px ${row.color}`, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 6, color: row.color, width: 24, textAlign: "right" }}>{row.val}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(0,10,20,.9)", borderBottom: "1px solid rgba(0,255,150,.08)", padding: "10px 12px", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 6, letterSpacing: "0.18em", color: "rgba(0,200,255,.4)", marginBottom: 6 }}>ACTIVITY</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 44, marginTop: 4 }}>
          {[30,55,40,70,45,85,60,75,50,90,65,80].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, background: `rgba(0,200,255,${0.15 + h/200})`, borderRadius: "2px 2px 0 0", boxShadow: h > 70 ? "0 0 6px rgba(0,200,255,.5)" : "none" }} />
          ))}
        </div>
        <div style={{ position: "absolute", right: 14, top: 12, width: 5, height: 5, borderRadius: "50%", background: "#00ff96", boxShadow: "0 0 8px #00ff96" }} />
      </div>
      <div style={{ background: "rgba(2,8,18,.95)", borderRight: "1px solid rgba(0,255,150,.08)", padding: "8px 12px", overflow: "hidden" }}>
        <div style={{ fontSize: 6, letterSpacing: "0.18em", color: "rgba(0,255,150,.4)", marginBottom: 5 }}>CMD LOG</div>
        {[{ t: "00:01", msg: "SENSOR › feed acquired" }, { t: "00:02", msg: "FUSION › data correlated" }, { t: "00:03", msg: "AI    › threat scored" }, { t: "00:04", msg: "C2    › operator notified" }].map((row, i) => (
          <div key={i} style={{ display: "flex", gap: 5, marginBottom: 3 }}>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,.2)", flexShrink: 0 }}>{row.t}</div>
            <div style={{ fontSize: 6, color: "rgba(0,255,150,.7)", lineHeight: 1.4 }}>{row.msg}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(4,8,20,.95)", padding: "8px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ fontSize: 6, letterSpacing: "0.18em", color: "rgba(100,160,255,.4)", marginBottom: 2 }}>CONTROLS</div>
        {[{ label: "DARK MODE", on: true }, { label: "ANIMATIONS", on: true }, { label: "COMPACT", on: false }].map((ctrl) => (
          <div key={ctrl.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,.35)", letterSpacing: "0.1em" }}>{ctrl.label}</div>
            <div style={{ width: 20, height: 9, borderRadius: 5, background: ctrl.on ? "rgba(0,255,150,.35)" : "rgba(255,255,255,.08)", border: `1px solid ${ctrl.on ? "rgba(0,255,150,.5)" : "rgba(255,255,255,.1)"}`, position: "relative" }}>
              <div style={{ position: "absolute", top: 1, left: ctrl.on ? 11 : 1, width: 6, height: 6, borderRadius: "50%", background: ctrl.on ? "#00ff96" : "rgba(255,255,255,.3)", boxShadow: ctrl.on ? "0 0 5px #00ff96" : "none" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandContent() {
  const models = [
    { name: "Claude AI",  maker: "Anthropic", color: "#cc9aff", pct: 97 },
    { name: "GPT-4o",     maker: "OpenAI",    color: "#40ffb0", pct: 91 },
    { name: "Gemini Pro", maker: "Google",    color: "#40b0ff", pct: 88 },
    { name: "Llama 3.1",  maker: "Meta",      color: "#ffcc40", pct: 84 },
  ];
  return (
    <div style={{ height: "100%", background: "linear-gradient(160deg,#0a0616,#060d1a)", position: "relative", overflow: "hidden", fontFamily: "'DM Mono',monospace", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(180,80,255,0.012) 4px)", pointerEvents: "none" }} />
      <div style={{ fontSize: 6, letterSpacing: "0.16em", color: "rgba(180,100,255,.45)" }}>AI ANALYTICS ENGINE · MODEL ENSEMBLE</div>
      {models.map((m) => (
        <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: m.color, boxShadow: `0 0 5px ${m.color}`, flexShrink: 0 }} />
          <div style={{ width: 60, flexShrink: 0 }}>
            <div style={{ fontSize: 7, color: "#fff", letterSpacing: "0.06em", lineHeight: 1.2 }}>{m.name}</div>
            <div style={{ fontSize: 5.5, color: "rgba(255,255,255,.3)", letterSpacing: "0.08em" }}>{m.maker}</div>
          </div>
          <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.05)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${m.pct}%`, height: "100%", background: `linear-gradient(90deg,${m.color}88,${m.color})`, borderRadius: 2, boxShadow: `0 0 6px ${m.color}66` }} />
          </div>
          <div style={{ fontSize: 6.5, color: m.color, width: 24, textAlign: "right", flexShrink: 0 }}>{m.pct}%</div>
        </div>
      ))}
      <div style={{ marginTop: "auto", fontSize: 5.5, letterSpacing: "0.1em", color: "rgba(255,255,255,.15)" }}>ENSEMBLE CONFIDENCE · WEIGHTED VOTING · REAL-TIME INFERENCE</div>
    </div>
  );
}

function ComponentsContent() {
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
    <div style={{ width: "100%", height: "100%", background: "rgba(4,6,16,.98)", position: "relative", overflow: "hidden", fontFamily: "'DM Mono',monospace" }}>
      <div style={{ position: "absolute", top: 8, left: 10, fontSize: 6, letterSpacing: "0.18em", color: "rgba(255,255,255,.2)", zIndex: 2 }}>DATA FUSION · CORRELATION MESH</div>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} viewBox={`0 0 ${W} ${W}`}>
        {edges.map(([a, b], ei) => {
          const na = nodes.find((nd) => nd.id === a)!;
          const nb = nodes.find((nd) => nd.id === b)!;
          return <line key={ei} x1={na.x/100*W} y1={na.y/100*W} x2={nb.x/100*W} y2={nb.y/100*W} stroke={na.color} strokeWidth={0.8} strokeOpacity={0.22} />;
        })}
        {nodes.map((node) => {
          const cx = node.x / 100 * W;
          const cy = node.y / 100 * W;
          return (
            <g key={node.id}>
              <circle cx={cx} cy={cy} r={node.r + 4} fill="none" stroke={node.color} strokeWidth={0.6} strokeOpacity={0.18} />
              <circle cx={cx} cy={cy} r={node.r} fill={node.color} fillOpacity={node.primary ? 0.18 : 0.1} stroke={node.color} strokeWidth={1} strokeOpacity={0.7} />
              <circle cx={cx} cy={cy} r={node.primary ? 3 : 2} fill={node.color} fillOpacity={0.9} />
              <text x={cx} y={cy + node.r + 9} textAnchor="middle" fontSize={node.primary ? 7 : 6} fill={node.color} fillOpacity={0.9} fontFamily="'DM Mono',monospace" letterSpacing="0.08em">{node.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TokensContent() {
  const sources = [
    { name: "Recorded Future", type: "OSINT/CYBER",  color: "#ff6040", active: true  },
    { name: "Maxar EO",        type: "IMINT/SAT",    color: "#40b0ff", active: true  },
    { name: "Shodan",          type: "OSINT/NETINT", color: "#ffcc40", active: true  },
    { name: "XSOAR",           type: "SIEM/SOAR",    color: "#00ff96", active: true  },
    { name: "Maltego",         type: "OSINT/LINK",   color: "#cc9aff", active: true  },
    { name: "OpenCTI",         type: "THREATINT",    color: "#40ffb0", active: false },
  ];
  return (
    <div style={{ height: "100%", background: "#04060f", fontFamily: "'DM Mono',monospace", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 5, overflow: "hidden" }}>
      <div style={{ fontSize: 6, letterSpacing: "0.16em", color: "rgba(100,180,255,.4)", marginBottom: 2 }}>INTELLIGENCE AGGREGATOR · SOURCE REGISTRY</div>
      {sources.map((s) => (
        <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 7px", borderRadius: 3, background: s.active ? `${s.color}08` : "rgba(255,255,255,.02)", border: `1px solid ${s.active ? s.color + "25" : "rgba(255,255,255,.05)"}` }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: s.active ? s.color : "rgba(255,255,255,.15)", boxShadow: s.active ? `0 0 6px ${s.color}` : "none", flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 7, color: s.active ? "#fff" : "rgba(255,255,255,.3)", letterSpacing: "0.05em" }}>{s.name}</div>
          <div style={{ fontSize: 5.5, letterSpacing: "0.1em", color: s.active ? s.color : "rgba(255,255,255,.2)", background: s.active ? `${s.color}12` : "transparent", border: `1px solid ${s.active ? s.color + "30" : "rgba(255,255,255,.06)"}`, borderRadius: 2, padding: "1px 4px", flexShrink: 0 }}>{s.type}</div>
          <div style={{ fontSize: 5.5, color: s.active ? "rgba(0,255,150,.6)" : "rgba(255,255,255,.15)", letterSpacing: "0.1em", flexShrink: 0 }}>{s.active ? "LIVE" : "OFF"}</div>
        </div>
      ))}
    </div>
  );
}

function FoundationsContent() {
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
    <div style={{ height: "100%", background: "#010306", position: "relative", overflow: "hidden", fontFamily: "'DM Mono',monospace" }}>
      <div style={{ position: "absolute", top: 7, left: 10, fontSize: 6, letterSpacing: "0.18em", color: "rgba(255,96,64,.5)", zIndex: 2 }}>RAW DATA STREAM · {packets.length} PACKETS</div>
      <div style={{ position: "absolute", inset: "20px 8px 8px", display: "grid", gridTemplateColumns: "repeat(10,1fr)", gridTemplateRows: "repeat(8,1fr)", gap: 2 }}>
        {packets.map((p) => (
          <div key={p.idx} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {p.type === "packet" ? (
              <div style={{ width: p.size + 5, height: p.size * 0.55, borderRadius: 1, background: `${p.color}${Math.round(p.opacity * 255).toString(16).padStart(2, "0")}`, border: `1px solid ${p.color}55` }} />
            ) : p.type === "pulse" ? (
              <div style={{ width: p.size, height: p.size, borderRadius: "50%", border: `1px solid ${p.color}`, opacity: p.opacity * 0.7 }} />
            ) : (
              <div style={{ width: p.size, height: p.size, borderRadius: "50%", background: p.color, opacity: p.opacity }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const CONTENT: Record<string, React.ReactNode> = {
  ui: <UIContent />,
  brand: <BrandContent />,
  components: <ComponentsContent />,
  tokens: <TokensContent />,
  foundations: <FoundationsContent />,
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function FrameworkSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const outerRef  = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const rafProgressRef = useRef<number | null>(null);
  const pendingProgressRef = useRef(0);
  const lastCommittedProgressRef = useRef(-1);
  const [progress, setProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const focusedId = selectedId ?? hoveredId;

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
    if (!isMobile) return;

    const onDocPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (!sectionRef.current?.contains(target)) {
        setSelectedId(null);
      }
    };

    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [isMobile]);

  function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

  const n = LAYERS.length;
  const labelOpacity = progress < 0.3 ? 0 : Math.min((progress - 0.3) / 0.4, 1);
  const sceneCardSize = isMobile ? 190 : CARD;
  const spreadGap = isMobile ? 72 : SPREAD_GAP;
  const labelSideMax = `calc(50% - ${Math.round(sceneCardSize / 2 + 10)}px)`;
  const isDesktopCompressed = !isMobile && progress < 0.42;
  const shouldRenderDesktopLabels = !isMobile && progress > 0.28;

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
          justify-content: center;
          padding: 0 3rem 0 2rem;
          position: relative;
          z-index: 10;
          border-right: 1px dashed var(--border-dashed, rgba(255,255,255,0.1));
        }
        @media(min-width:640px)  { .fw-left { padding-left: 4rem; padding-right: 3rem; } }
        @media(min-width:768px)  { .fw-left { padding-left: 6rem; padding-right: 3rem; } }
        @media(min-width:1280px) { .fw-left { padding-left: 8rem; padding-right: 3rem; } }
        @media(min-width:1536px) { .fw-left { padding-left: 12rem; padding-right: 4rem; } }

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
          font-size: 0.62rem;
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
          font-size: clamp(1.75rem, 3vw, 2.75rem);
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
          margin: 1rem 0;
        }
        .fw-desc {
          font-size: 0.9rem;
          line-height: 1.7;
          color: rgba(255,255,255,0.4);
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          margin-bottom: 2rem;
        }

        /* Layer roster */
        .fw-roster {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .fw-roster-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid transparent;
          cursor: default;
          transition: background .3s, border-color .3s, opacity .3s;
          animation: fw-pill-enter 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
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
          .fw-roster-row {
            animation: none;
          }
        }
        .fw-roster-row.active {
          background: rgba(255,255,255,0.04);
        }
        .fw-roster-row.dimmed {
          opacity: 0.2;
        }
        .fw-roster-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: box-shadow .3s;
        }
        .fw-roster-name {
          flex: 1;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase;
          transition: color .3s;
        }
        .fw-roster-badge {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.55rem;
          letter-spacing: 0.12em;
          padding: 2px 7px;
          border-radius: 3px;
          border: 1px solid;
          transition: all .3s;
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
        /* Right panel controls — bottom-left group */
        .fw-right-controls {
          position: absolute;
          bottom: 1.25rem;
          left: 1.25rem;
          z-index: 300;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
        }
        .fw-label-toggle {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 12px 6px 8px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(5,6,15,0.75);
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, color 0.2s;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.58rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          user-select: none;
          white-space: nowrap;
        }
        .fw-label-toggle:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.7);
        }
        .fw-label-toggle.on {
          border-color: rgba(227,27,84,0.35);
          color: rgba(255,255,255,0.6);
        }
        .fw-toggle-pip {
          width: 28px; height: 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          position: relative;
          flex-shrink: 0;
          transition: background 0.25s, border-color 0.25s;
        }
        .fw-label-toggle.on .fw-toggle-pip {
          background: rgba(227,27,84,0.3);
          border-color: rgba(227,27,84,0.5);
        }
        .fw-toggle-knob {
          position: absolute;
          top: 2px;
          width: 9px; height: 9px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transition: left 0.25s cubic-bezier(0.4,0,0.2,1), background 0.25s, box-shadow 0.25s;
          left: 2px;
        }
        .fw-label-toggle.on .fw-toggle-knob {
          left: calc(100% - 11px);
          background: #E31B54;
          box-shadow: 0 0 6px rgba(227,27,84,0.8);
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
          .fw-desc {
            margin-bottom: 1rem;
          }
          .fw-scroll-hint {
            display: none;
          }
          .fw-right {
            min-height: 620px;
          }
          .fw-right-controls {
            left: 0.75rem;
            bottom: 0.75rem;
          }
          .fw-roster-row,
          .fw-roster-dot,
          .fw-roster-name,
          .fw-roster-badge {
            transition: none !important;
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
        :root.light .fw-roster-row.active {
          background: rgba(0,0,0,0.04);
        }
        :root.light .fw-roster-name {
          color: rgba(0,0,0,0.5);
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
          background-image:
            linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px);
        }
        :root.light .fw-label-toggle {
          border-color: rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.85);
          color: rgba(0,0,0,0.4);
        }
        :root.light .fw-label-toggle:hover {
          border-color: rgba(0,0,0,0.2);
          color: rgba(0,0,0,0.7);
        }
        :root.light .fw-label-toggle.on {
          border-color: rgba(227,27,84,0.35);
          color: rgba(0,0,0,0.6);
        }
        :root.light .fw-toggle-pip {
          background: rgba(0,0,0,0.06);
          border-color: rgba(0,0,0,0.12);
        }
        :root.light .fw-toggle-knob {
          background: rgba(0,0,0,0.25);
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
          if (!isMobile) return;
          const target = event.target as HTMLElement | null;
          if (!target) return;
          if (!target.closest("[data-fw-keep-active='true']")) {
            setSelectedId(null);
          }
        }}
      >
        {/* Outer — scroll driver */}
        <div ref={outerRef} className="fw-outer">

          {/* Sticky two-column viewport */}
          <div ref={stickyRef} className="fw-sticky">

            {/* ── LEFT PANEL ── */}
            <div className="fw-left">
              <span className="fw-eyebrow">
                <span className="fw-eyebrow-dot" />
                Intelligence Architecture Framework
              </span>

              <h2 className="fw-heading">Layer by layer. Until it moves as one.</h2>
              <div className="fw-rule" />

              <p className="fw-desc">
                Raw signals don’t stay raw. They move through structured layers of intelligence, alignment, and control — until the system responds with purpose.
              </p>

              {/* Live layer roster */}
              <div className="fw-roster">
                {LAYERS.map((layer, idx) => {
                  const isActive = focusedId === layer.id;
                  const isDimmed = focusedId !== null && !isActive;
                  return (
                    <div
                      key={layer.id}
                      data-fw-keep-active="true"
                      className={`fw-roster-row${isActive ? " active" : ""}${isDimmed ? " dimmed" : ""}`}
                      style={{
                        borderColor: isActive ? `${layer.statusColor}30` : "transparent",
                        background: isActive ? `${layer.statusColor}08` : "transparent",
                        cursor: "pointer",
                        touchAction: "manipulation",
                        animationDelay: `${idx * 70}ms`,
                      }}
                      onMouseEnter={() => {
                        if (!isMobile) setHoveredId(layer.id);
                      }}
                      onMouseLeave={() => {
                        if (!isMobile) setHoveredId(null);
                      }}
                      onPointerDown={() => setSelectedId((prev) => (prev === layer.id ? null : layer.id))}
                      onClick={() => {
                        if (!isMobile) setSelectedId((prev) => (prev === layer.id ? null : layer.id));
                      }}
                    >
                      <div
                        className="fw-roster-dot"
                        style={{
                          background: layer.statusColor,
                          boxShadow: isActive ? `0 0 8px ${layer.statusColor}` : `0 0 3px ${layer.statusColor}66`,
                        }}
                      />
                      <span
                        className="fw-roster-name"
                        style={{ color: isActive ? "var(--content-primary, #fff)" : undefined }}
                      >
                        {layer.label}
                      </span>
                      <span
                        className="fw-roster-badge"
                        style={{
                          color: isActive ? layer.statusColor : "rgba(255,255,255,0.25)",
                          borderColor: isActive ? `${layer.statusColor}50` : "rgba(255,255,255,0.08)",
                          background: isActive ? `${layer.statusColor}10` : "transparent",
                        }}
                      >
                        {layer.status}
                      </span>
                    </div>
                  );
                })}
              </div>

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

            {/* ── RIGHT PANEL ── */}
            <div className="fw-right">

              {/* Controls — bottom-left */}
              <div className="fw-right-controls">
                {/* Labels toggle */}
                <button
                  type="button"
                  className={`fw-label-toggle${showLabels ? " on" : ""}`}
                  onClick={() => setShowLabels(v => !v)}
                >
                  <div className="fw-toggle-pip">
                    <div className="fw-toggle-knob" />
                  </div>
                  Labels
                </button>
              </div>

              {/* Ambient blobs */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "70%", height: "70%", background: "radial-gradient(ellipse,rgba(180,80,255,.14) 0%,transparent 70%)", animation: "fw-drift1 8s ease-in-out infinite alternate" }} />
                <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "60%", height: "60%", background: "radial-gradient(ellipse,rgba(255,120,40,.1) 0%,transparent 70%)", animation: "fw-drift2 10s ease-in-out infinite alternate" }} />
              </div>

              {/* CARDS */}
              {[...LAYERS].reverse().map((layer, ri) => {
                const i = LAYERS.length - 1 - ri;
                const sy = getScreenY(i);
                const shadowBlur = isMobile ? 24 : 34;
                const shadowOpacity = isMobile ? 0.34 : 0.44;
                const cardZ = 10 + (LAYERS.length - i) * 2;
                const isHovered = focusedId === layer.id;
                const cardOpacity = focusedId === null ? 1 : isHovered ? 1 : 0.2;

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
                    onPointerDown={() => setSelectedId((prev) => (prev === layer.id ? null : layer.id))}
                    onClick={() => {
                      if (!isMobile) setSelectedId((prev) => (prev === layer.id ? null : layer.id));
                    }}
                  >
                    <div
                      className="fw-card-iso"
                      style={{
                        boxShadow: isMobile
                          ? `0 20px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}), 0 1px 0 rgba(255,255,255,0.07)`
                          : isDesktopCompressed
                            ? isHovered
                              ? `0 10px 20px rgba(0,0,0,0.34), 0 0 14px ${layer.statusColor}1f, 0 1px 0 rgba(255,255,255,0.09)`
                              : `0 8px 16px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.06)`
                          : isHovered
                            ? `0 24px ${shadowBlur + 14}px rgba(0,0,0,${shadowOpacity + 0.18}), 0 0 32px ${layer.statusColor}22, 0 1px 0 rgba(255,255,255,0.12)`
                            : `0 20px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}), 0 1px 0 rgba(255,255,255,0.07)`,
                        filter: isMobile || isDesktopCompressed ? "none" : isHovered ? "brightness(1.12)" : "brightness(1)",
                      }}
                    >
                      {CONTENT[layer.id]}
                    </div>
                  </div>
                );
              })}

              {/* FLOATING LABELS — above cards */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 200, fontFamily: "ui-monospace, Menlo, monospace", display: shouldRenderDesktopLabels || isMobile ? "block" : "none" }}>
                  {LAYERS.map((layer, i) => {
                    const labelY = (i - (n - 1) / 2) * spreadGap;
                    const isHov = focusedId === layer.id;
                    const textOpacity = showLabels ? labelOpacity * (focusedId === null ? 1 : isHov ? 1 : 0) : 0;
                    return (
                      <div
                        key={`label-${layer.id}`}
                        style={{
                          position: "absolute",
                          top: "50%", left: 0, right: 0,
                          transform: `translateY(calc(-50% + ${labelY}px))`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                          opacity: textOpacity,
                          transition: isMobile ? "none" : "opacity .16s linear",
                          paddingLeft: 8, paddingRight: 8,
                        }}
                      >
                        {/* Left mini-label */}
                        <div style={{ textAlign: "right", minWidth: 0, flex: "0 0 auto", maxWidth: labelSideMax }}>
                          <div style={{ fontSize: 6, letterSpacing: "0.16em", color: layer.statusColor, border: `1px solid ${layer.statusColor}44`, borderRadius: 2, padding: "1px 5px", display: "inline-block", marginBottom: 3, opacity: 0.85 }}>{layer.tag}</div>
                          <div style={{ fontSize: isMobile ? 7 : 9, fontWeight: 700, color: "#fff", letterSpacing: "0.07em", lineHeight: 1.25, marginBottom: 2, whiteSpace: isMobile ? "normal" : "nowrap" }}>{layer.label}</div>
                          <div style={{ fontSize: isMobile ? 5.5 : 6.5, color: "rgba(255,255,255,.35)", letterSpacing: "0.1em", whiteSpace: isMobile ? "normal" : "nowrap" }}>{layer.sublabel}</div>
                        </div>

                        {/* Spacer for card width */}
                        <div style={{ width: sceneCardSize, flexShrink: 0 }} />

                        {/* Right annotation */}
                        <div style={{ textAlign: "left", minWidth: 0, flex: "0 0 auto", maxWidth: labelSideMax }}>
                          {layer.annotation.map((line, j) => (
                            <div key={j} style={{ fontSize: isMobile ? (j === 0 ? 5.5 : 5) : (j === 0 ? 7 : 6), color: j === 0 ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.25)", letterSpacing: "0.1em", lineHeight: isMobile ? 1.45 : 1.9, textTransform: "uppercase", whiteSpace: isMobile ? "normal" : "nowrap" }}>{line}</div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
