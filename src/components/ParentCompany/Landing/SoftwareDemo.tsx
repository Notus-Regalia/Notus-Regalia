"use client";
import { useState, useEffect, useRef, useCallback, useMemo, type RefObject } from "react";
import { gsap } from "gsap";

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

const lerp = (a: number, b: number, n: number): number => (1 - n) * a + n * b;

const getMousePos = (event: MouseEvent, container: HTMLElement | null): { x: number; y: number } => {
  if (!container) return { x: event.clientX, y: event.clientY };
  const bounds = container.getBoundingClientRect();
  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
};

type CrosshairProps = {
  color?: string;
  containerRef: RefObject<HTMLElement | null>;
};

function Crosshair({ color = "rgba(255,255,255,0.86)", containerRef }: CrosshairProps) {
  const lineHorizontalRef = useRef<HTMLDivElement | null>(null);
  const lineVerticalRef = useRef<HTMLDivElement | null>(null);
  const filterXRef = useRef<SVGFETurbulenceElement | null>(null);
  const filterYRef = useRef<SVGFETurbulenceElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const lines = [lineHorizontalRef.current, lineVerticalRef.current].filter(
      (line): line is HTMLDivElement => Boolean(line)
    );
    if (!lines.length) return;

    let mouse = { x: 0, y: 0 };
    let rafId: number | null = null;
    const renderedStyles = {
      tx: { previous: 0, current: 0, amt: 0.15 },
      ty: { previous: 0, current: 0, amt: 0.15 },
    };

    gsap.set(lines, { opacity: 0 });

    const primitiveValues = { turbulence: 0 };
    const distortionTimeline = gsap
      .timeline({
        paused: true,
        onStart: () => {
          if (lineHorizontalRef.current) lineHorizontalRef.current.style.filter = "url(#sdemo-filter-noise-x)";
          if (lineVerticalRef.current) lineVerticalRef.current.style.filter = "url(#sdemo-filter-noise-y)";
        },
        onUpdate: () => {
          if (filterXRef.current) filterXRef.current.setAttribute("baseFrequency", String(primitiveValues.turbulence));
          if (filterYRef.current) filterYRef.current.setAttribute("baseFrequency", String(primitiveValues.turbulence));
        },
        onComplete: () => {
          if (lineHorizontalRef.current) lineHorizontalRef.current.style.filter = "none";
          if (lineVerticalRef.current) lineVerticalRef.current.style.filter = "none";
        },
      })
      .to(primitiveValues, {
        duration: 0.5,
        ease: "power1.out",
        startAt: { turbulence: 1 },
        turbulence: 0,
      });

    const setVisible = (visible: boolean) => {
      gsap.to(lines, {
        duration: visible ? 0.2 : 0.14,
        ease: visible ? "power2.out" : "power1.out",
        opacity: visible ? 1 : 0,
        overwrite: "auto",
      });
    };

    const render = () => {
      renderedStyles.tx.current = mouse.x;
      renderedStyles.ty.current = mouse.y;

      renderedStyles.tx.previous = lerp(renderedStyles.tx.previous, renderedStyles.tx.current, renderedStyles.tx.amt);
      renderedStyles.ty.previous = lerp(renderedStyles.ty.previous, renderedStyles.ty.current, renderedStyles.ty.amt);

      if (lineVerticalRef.current) gsap.set(lineVerticalRef.current, { x: renderedStyles.tx.previous });
      if (lineHorizontalRef.current) gsap.set(lineHorizontalRef.current, { y: renderedStyles.ty.previous });

      rafId = window.requestAnimationFrame(render);
    };

    const startRenderLoop = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(render);
    };

    const stopRenderLoop = () => {
      if (rafId === null) return;
      window.cancelAnimationFrame(rafId);
      rafId = null;
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse = getMousePos(event, container);
      setVisible(true);
      startRenderLoop();
    };

    const handleMouseEnter = (event: MouseEvent) => {
      mouse = getMousePos(event, container);
      renderedStyles.tx.previous = renderedStyles.tx.current = mouse.x;
      renderedStyles.ty.previous = renderedStyles.ty.current = mouse.y;
      setVisible(true);
      startRenderLoop();
    };

    const handleMouseLeave = () => {
      setVisible(false);
      stopRenderLoop();
      distortionTimeline.progress(1).pause();
      if (lineHorizontalRef.current) lineHorizontalRef.current.style.filter = "none";
      if (lineVerticalRef.current) lineVerticalRef.current.style.filter = "none";
    };

    const triggerDistortion = () => distortionTimeline.restart();
    const resetDistortion = () => {
      distortionTimeline.progress(1).pause();
      if (lineHorizontalRef.current) lineHorizontalRef.current.style.filter = "none";
      if (lineVerticalRef.current) lineVerticalRef.current.style.filter = "none";
    };

    const interactiveNodes = container.querySelectorAll(
      "a, button, [role='button'], input, select, textarea, label"
    );

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    interactiveNodes.forEach((node) => {
      node.addEventListener("mouseenter", triggerDistortion);
      node.addEventListener("mouseleave", resetDistortion);
    });

    return () => {
      stopRenderLoop();
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      interactiveNodes.forEach((node) => {
        node.removeEventListener("mouseenter", triggerDistortion);
        node.removeEventListener("mouseleave", resetDistortion);
      });
      distortionTimeline.kill();
    };
  }, [containerRef]);

  return (
    <div className="sdemo-crosshair-layer" aria-hidden="true">
      <svg className="sdemo-crosshair-svg">
        <defs>
          <filter id="sdemo-filter-noise-x">
            <feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1" ref={filterXRef} />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
          <filter id="sdemo-filter-noise-y">
            <feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1" ref={filterYRef} />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
        </defs>
      </svg>
      <div
        ref={lineHorizontalRef}
        className="sdemo-crosshair-line sdemo-crosshair-line-horizontal"
        style={{ background: color }}
      />
      <div
        ref={lineVerticalRef}
        className="sdemo-crosshair-line sdemo-crosshair-line-vertical"
        style={{ background: color }}
      />
    </div>
  );
}

type C2Node = {
  id: string;
  label: string;
  status: string;
  load: number;
  color: string;
  latency: number;
  signal: number;
  threat: string;
  coord: string;
  focus: { service: string; stage: string; detail: string };
  cluster: "citizen" | "business" | "revenue" | "response";
};

const C2_NODES: C2Node[] = [
  {
    id: "PH-CORE", label: "National Identity Spine", status: "Live", load: 86, color: "#22d3ee", latency: 9, signal: 97, threat: "LOW", coord: "PSA · DICT FEDERATION",
    cluster: "citizen", focus: { service: "Unified Citizen Identity", stage: "Cross-Agency Validation", detail: "One identity graph for PSA, PhilHealth, SSS, and LGU service counters." },
  },
  {
    id: "PH-BIZ", label: "Permit and Licensing Mesh", status: "Live", load: 78, color: "#34d399", latency: 13, signal: 92, threat: "LOW", coord: "DTI · DILG · LGU MESH",
    cluster: "business", focus: { service: "Unified Permit Pipeline", stage: "Compliance Routing", detail: "Single routing lane for business permits, zoning, fire, and environmental clearances." },
  },
  {
    id: "PH-FISC", label: "Revenue and Benefits Rail", status: "Monitored", load: 81, color: "#ffd740", latency: 11, signal: 93, threat: "MED", coord: "BIR · BTr · DBM GRID",
    cluster: "revenue", focus: { service: "National Fiscal Orchestration", stage: "Collection and Disbursement", detail: "Tax intake, treasury settlement, and social payout validation in one rail." },
  },
  {
    id: "PH-RES", label: "Resilience Command Grid", status: "Priority", load: 89, color: "#ff7a45", latency: 8, signal: 98, threat: "HIGH", coord: "NDRRMC · DOH · AFP LINK",
    cluster: "response", focus: { service: "National Crisis Coordination", stage: "Incident Escalation", detail: "Disaster dispatch, medical surge routing, and recovery command synchronization." },
  },
];

const GOV_FLOW_CARDS = [
  { id: "portal", title: "Citizen One-Stop Portal", cluster: "citizen", x: "2%", y: "8%", items: ["National ID lifecycle", "Civil registry services", "Benefits and aid intake"] },
  { id: "permits", title: "LGU Permit Mesh", cluster: "business", x: "38%", y: "8%", items: ["Business registration", "Zoning and fire clearance", "Unified compliance routing"] },
  { id: "revenue", title: "Revenue and Payments Rail", cluster: "revenue", x: "74%", y: "8%", items: ["BIR e-filing orchestration", "Treasury settlement mapping", "Leak and fraud detection"] },
  { id: "welfare", title: "Social Protection Engine", cluster: "citizen", x: "2%", y: "56%", items: ["Household eligibility graph", "Subsidy release controls", "Aid auditability ledger"] },
  { id: "health", title: "Public Health Interop", cluster: "business", x: "38%", y: "56%", items: ["Hospital capacity exchange", "Pharma and vaccine inventory", "Continuity of care tracking"] },
  { id: "response", title: "Resilience Command Network", cluster: "response", x: "74%", y: "56%", items: ["Multi-agency dispatch", "Situation room escalation", "Recovery resource alignment"] },
] as const;

function GovernmentServiceFlow({
  activeCluster,
  onCardSelect,
}: {
  activeCluster: C2Node["cluster"];
  onCardSelect: (payload: { service: string; stage: string; detail: string }) => void;
}) {
  return (
    <div className="gov-flow-root">
      <div className="gov-flow-board">
        <svg className="gov-flow-lines" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
          <path d="M245,160 L365,160 L365,115 L380,115" className="gov-stroke" />
          <path d="M605,160 L725,160" className="gov-stroke" />
          <path d="M500,255 L500,345" className="gov-stroke-dashed" />
          <path d="M610,440 L730,440" className="gov-stroke" />
          <path d="M380,440 L250,440 L250,350 L245,350" className="gov-stroke" />
          <path d="M855,255 L855,345 L845,345" className="gov-stroke-dashed" />
          <circle cx="365" cy="115" r="8" className="gov-dot" />
          <circle cx="605" cy="160" r="8" className="gov-dot" />
          <circle cx="500" cy="345" r="8" className="gov-dot" />
          <circle cx="610" cy="440" r="8" className="gov-dot" />
          <circle cx="250" cy="440" r="8" className="gov-dot" />
          <text x="394" y="110" className="gov-pill">VERIFY</text>
          <text x="514" y="338" className="gov-pill">SYNC</text>
          <text x="744" y="434" className="gov-pill">APPROVE</text>
        </svg>

        {GOV_FLOW_CARDS.map((card) => (
          <button
            key={card.id}
            className={`gov-card${card.cluster === activeCluster ? " active" : ""}`}
            style={{ left: card.x, top: card.y }}
            onClick={() =>
              onCardSelect({
                service: card.title,
                stage: card.cluster === "response" ? "Escalation Path" : card.cluster === "revenue" ? "Processing Path" : "Validation Path",
                detail: card.items.join(" • "),
              })
            }
          >
            <div className="gov-card-head">
              <span className="gov-card-led" />
              <span>{card.title}</span>
            </div>
            <div className="gov-card-body">
              {card.items.map((item) => (
                <div key={item} className="gov-item">{item}</div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CommandControl() {
  const [active, setActive] = useState(C2_NODES[0]);
  const glitch = useGlitch();
  const time = useClock();
  const [serviceFocus, setServiceFocus] = useState(active.focus);

  useEffect(() => {
    setServiceFocus(active.focus);
  }, [active]);

  const eventRows = [
    { ts: time, msg: `${active.id} orchestration heartbeat nominal`, lvl: "OK" },
    { ts: "03:45:41", msg: `${serviceFocus.service} synchronized across agencies`, lvl: "INFO" },
    { ts: "03:45:01", msg: "Citizen identity token rotation completed", lvl: "OK" },
    { ts: "03:44:30", msg: `${serviceFocus.stage} policy routing updated`, lvl: "INFO" },
    { ts: "03:44:12", msg: glitch ? "Legacy endpoint lag detected" : "Inter-agency handoff latency within SLA", lvl: glitch ? "WARN" : "OK" },
  ];

  return (
    <div className="sw-panel c2-panel">
      <div className="scanline" />
      <div className="c2-topbar">
        <div className="c2-topbar-left">
          <span className="c2-led" />
          <span className="sw-mono">GOVERNMENT SYSTEMS // PH COORDINATION FRAMEWORK</span>
        </div>
        <div className="c2-topbar-right sw-mono">
          <span>NATIONAL MODE</span>
          <span>{time}</span>
          <span>GATEWAY {glitch ? "RECOVERING" : "STABLE"}</span>
        </div>
      </div>
      <aside className="c2-sidebar">
        <div className="sw-mono sw-dim" style={{ marginBottom: "1rem", fontSize: "0.6rem", letterSpacing: "0.16em" }}>
          COORDINATED_SERVICES // PH GOV GRID
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
            <div className="sw-mono sw-dim" style={{ fontSize: "0.55rem", marginTop: "0.25rem" }}>{n.coord}</div>
          </div>
        ))}
      </aside>
      <main className="c2-radar">
        <GovernmentServiceFlow activeCluster={active.cluster} onCardSelect={setServiceFocus} />
      </main>
      <aside className="c2-stats">
        <div className="sw-mono sw-dim" style={{ fontSize: "0.62rem" }}>CONTROL_TOWER: NATIONAL</div>
        <div className="sw-mono sw-dim" style={{ fontSize: "0.62rem" }}>THREAT_LEVEL: {active.threat}</div>
        <div className="sw-mono sw-dim" style={{ fontSize: "0.62rem" }}>COORD: {active.coord}</div>
        <div className="c2-divider" />
        <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", marginBottom: "0.3rem" }}>ACTIVE_FRAMEWORK</div>
        <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem" }}>
          {active.label.toUpperCase()}
        </div>
        <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", marginBottom: "0.3rem" }}>INTEROP_KEY</div>
        <div className="sw-mono" style={{ fontSize: "0.68rem", wordBreak: "break-all", opacity: 0.7 }}>
          0xPH-GOV...{glitch ? "LAG" : "SYNC"}
        </div>
        <div className="c2-divider" />
        <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", marginBottom: "0.3rem" }}>CURRENT_ORCHESTRATION</div>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem", lineHeight: 1.25 }}>
          {serviceFocus.service.toUpperCase()}
        </div>
        <div className="sw-mono sw-dim" style={{ fontSize: "0.57rem" }}>
          STAGE: {serviceFocus.stage}
        </div>
        <div className="sw-mono sw-dim" style={{ fontSize: "0.57rem" }}>
          DETAIL: {serviceFocus.detail}
        </div>
        <div className="c2-events">
          <div className="sw-mono sw-dim" style={{ fontSize: "0.56rem", marginBottom: "0.45rem" }}>LIVE_EVENT_LOG</div>
          {eventRows.map((row, i) => (
            <div key={i} className="c2-event-row">
              <span className="sw-mono c2-event-ts">{row.ts}</span>
              <span className="sw-mono c2-event-msg">{row.msg}</span>
              <span
                className="sw-mono c2-event-lvl"
                style={{ color: row.lvl === "WARN" ? "#f59e0b" : row.lvl === "INFO" ? "#60a5fa" : "#00ffaa" }}
              >
                {row.lvl}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", paddingTop: "1.2rem" }}>
          <div className="sw-mono" style={{ color: glitch ? "#f59e0b" : "#00ffaa", fontWeight: 700, fontSize: "0.72rem" }}>
            FRAMEWORK {glitch ? "DEGRADED" : "COORDINATED"}
          </div>
          <div className="sw-mono sw-dim" style={{ fontSize: "0.62rem" }}>
            {active.threat === "HIGH" ? "ESCALATION WATCH ENABLED" : "SERVICE DELIVERY NOMINAL"}
          </div>
        </div>
      </aside>
    </div>
  );
}

type InfrastructureType = "Dam" | "Power Plant" | "Port" | "Airport";

type InfrastructureAsset = {
  id: string;
  name: string;
  type: InfrastructureType;
  region: string;
  island: string;
  capacity: string;
  status: string;
  lat: number;
  lon: number;
  note: string;
};

type GovInfraLayerId = "industry" | "military";
type CriticalInfrastructureDomain =
  | "Enegy & Oil"
  | "Fluid Systems"
  | "Transport"
  | "Telecommunications"
  | "Healthcare"
  | "Bank & Finance"
  | "Food & agriculture"
  | "Government"
  | "Defense facilities"
  | "Data Center"
  | "Aerospace";
type CriticalInfraDomain = CriticalInfrastructureDomain;
type InfraFilterLayerId = "military" | CriticalInfraDomain;

type GovInfrastructurePoint = {
  id: string;
  layer: GovInfraLayerId;
  domain?: CriticalInfrastructureDomain;
  name: string;
  category: string;
  status: string;
  region: string;
  province: string;
  municipality: string;
  contractor: string;
  year: number | null;
  cost: number | null;
  lat: number;
  lon: number;
  note: string;
  source: string;
};

type ProvinceBoundaryFeature = {
  id: string;
  name: string;
  geoLevel: string;
  feature: any;
};

const INFRA_DEFAULT_CENTER: [number, number] = [14.95, 120.98];
const INFRA_DEFAULT_ZOOM = 9;
const INFRA_MIN_ZOOM = 6;
const INFRA_MAX_ZOOM = 18;
const PHILIPPINE_BOUNDS = { minLat: 4, maxLat: 22.5, minLon: 116, maxLon: 127.5 };
const INFRA_ZOOM_LEVELS = [
  { label: "Level 1", zoom: 6 },
  { label: "Level 2", zoom: 9 },
  { label: "Level 3", zoom: 12 },
  { label: "Level 4", zoom: 15 },
  { label: "Level 5", zoom: 18 },
] as const;

const GOV_INFRA_LAYER_META: Record<GovInfraLayerId, { label: string; color: string; source: string }> = {
  military: { label: "Military", color: "#ef4444", source: "AFP and defense installation registry" },
  industry: { label: "Critical Infrastructure", color: "#facc15", source: "Curated strategic critical infrastructure registry" },
};

const CRITICAL_DOMAIN_GROUPS: Array<{ domain: CriticalInfraDomain; scope: string; color: string }> = [
  {
    domain: "Enegy & Oil",
    scope: "Power plants, transmission grids, fuel depots, pipelines",
    color: "#f59e0b",
  },
  {
    domain: "Fluid Systems",
    scope: "Dams, water treatment, distribution systems",
    color: "#38bdf8",
  },
  {
    domain: "Transport",
    scope: "Airports, seaports, rail, major roads",
    color: "#fb7185",
  },
  {
    domain: "Telecommunications",
    scope: "Telecom networks, internet backbone, data centers, cloud and key ICT systems",
    color: "#a78bfa",
  },
  {
    domain: "Healthcare",
    scope: "Hospitals, emergency care systems, public health labs",
    color: "#22c55e",
  },
  {
    domain: "Bank & Finance",
    scope: "Payment rails, clearing systems, financial market infrastructure",
    color: "#facc15",
  },
  {
    domain: "Food & agriculture",
    scope: "Production, storage, logistics, supply chains",
    color: "#84cc16",
  },
  {
    domain: "Government",
    scope: "Command centers, disaster response, and public administration systems",
    color: "#14b8a6",
  },
  {
    domain: "Defense facilities",
    scope: "Defense command sites, military support facilities, and strategic security infrastructure",
    color: "#ef4444",
  },
  {
    domain: "Data Center",
    scope: "Data centers, cloud platforms, and mission-critical digital infrastructure",
    color: "#60a5fa",
  },
  {
    domain: "Aerospace",
    scope: "Ground stations, satellite operations, space program support systems",
    color: "#e879f9",
  },
];

const CRITICAL_DOMAIN_ORDER: CriticalInfraDomain[] = CRITICAL_DOMAIN_GROUPS.map((item) => item.domain);
const CRITICAL_DOMAIN_COLORS = CRITICAL_DOMAIN_GROUPS.reduce((acc, item) => {
  acc[item.domain] = item.color;
  return acc;
}, {} as Record<CriticalInfraDomain, string>);

const PROVINCE_BOUNDARY_BASE_URL =
  "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson/regions/medres";

const PROVINCE_BOUNDARY_REGION_FILES = [
  "provdists-region-100000000.0.01.json",
  "provdists-region-1000000000.0.01.json",
  "provdists-region-1100000000.0.01.json",
  "provdists-region-1200000000.0.01.json",
  "provdists-region-1300000000.0.01.json",
  "provdists-region-1400000000.0.01.json",
  "provdists-region-1600000000.0.01.json",
  "provdists-region-1700000000.0.01.json",
  "provdists-region-1900000000.0.01.json",
  "provdists-region-200000000.0.01.json",
  "provdists-region-300000000.0.01.json",
  "provdists-region-400000000.0.01.json",
  "provdists-region-500000000.0.01.json",
  "provdists-region-600000000.0.01.json",
  "provdists-region-700000000.0.01.json",
  "provdists-region-800000000.0.01.json",
  "provdists-region-900000000.0.01.json",
] as const;

const toText = (value: unknown, fallback = "N/A") => {
  if (typeof value !== "string") return fallback;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : fallback;
};

const provincePolygonStyle = (active: boolean, hovered: boolean) => ({
  color: active || hovered ? "#ffffff" : "rgba(255,255,255,0.36)",
  weight: hovered ? 1.9 : active ? 1.5 : 0.75,
  opacity: active || hovered ? 0.95 : 0.62,
  fillColor: "#E31B54",
  fillOpacity: hovered ? 0.18 : active ? 0.11 : 0,
  dashArray: "",
});

const applyProvinceLayerStyles = (
  provinceLayers: Record<string, any>,
  activeProvinceId: string | null,
  hoveredProvinceId: string | null
) => {
  Object.entries(provinceLayers).forEach(([provinceId, layer]) => {
    const hovered = hoveredProvinceId === provinceId;
    const active = activeProvinceId === provinceId;
    layer.setStyle(provincePolygonStyle(active, hovered));
    if (active || hovered) {
      if (typeof layer.bringToFront === "function") {
        layer.bringToFront();
      } else if (typeof layer.eachLayer === "function") {
        layer.eachLayer((subLayer: any) => subLayer?.bringToFront?.());
      }
    }
  });
};

const nearestZoomLevelIndex = (zoom: number) =>
  INFRA_ZOOM_LEVELS.reduce((closestIdx, level, idx) =>
    Math.abs(level.zoom - zoom) < Math.abs(INFRA_ZOOM_LEVELS[closestIdx].zoom - zoom) ? idx : closestIdx, 0);
const INFRA_LEVEL3_INDEX = 2;
const INFRA_EDGE_PAN_THRESHOLD_PX = 84;
const INFRA_EDGE_PAN_MAX_SPEED_PX_PER_SECOND = 720;
const isProvinceHoverDisabledAtZoom = (zoom: number) => nearestZoomLevelIndex(zoom) >= INFRA_LEVEL3_INDEX;

const buildGovMarkerIcon = (L: any, color: string, active: boolean) => {
  const size = active ? 18 : 13;
  return L.divIcon({
    className: "infra-gov-marker-shell",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="infra-gov-marker-dot${active ? " active" : ""}" style="--infra-dot-color:${color};"><span class="infra-gov-marker-core"></span></span>`,
  });
};

const getGovPointColor = (point: GovInfrastructurePoint) => {
  if (point.layer === "military") return GOV_INFRA_LAYER_META.military.color;
  if (point.domain) return CRITICAL_DOMAIN_COLORS[point.domain] ?? GOV_INFRA_LAYER_META.industry.color;
  return GOV_INFRA_LAYER_META.industry.color;
};

const bindGovTooltip = (marker: any, name: string) =>
  marker.bindTooltip(name, {
    direction: "top",
    offset: [0, -10],
    opacity: 0.97,
    className: "infra-tooltip infra-tooltip-layer",
  });

const createInfraClusterLayer = (L: any) =>
  L.markerClusterGroup({
    chunkedLoading: true,
    chunkInterval: 90,
    chunkDelay: 50,
    disableClusteringAtZoom: 13,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
  });

const createInfraBeaconLayer = (L: any, compressed: boolean) =>
  compressed ? createInfraClusterLayer(L) : L.layerGroup();

const populateInfraLayer = (layer: any, markers: any[]) => {
  if (!layer || markers.length === 0) return;
  if (typeof layer.addLayers === "function") {
    layer.addLayers(markers);
    return;
  }
  markers.forEach((marker) => layer.addLayer(marker));
};

const buildGovPointMarker = (
  L: any,
  point: GovInfrastructurePoint,
  onSelect: (point: GovInfrastructurePoint) => void
) => {
  const markerColor = getGovPointColor(point);
  const baseIcon = buildGovMarkerIcon(L, markerColor, false);
  const activeIcon = buildGovMarkerIcon(L, markerColor, true);

  // Keep beacon appearance consistent for both compressed and expanded modes.
  const marker = L.marker([point.lat, point.lon], {
    icon: baseIcon,
    keyboard: false,
  });
  (marker as any).__infraIcons = { base: baseIcon, active: activeIcon };
  bindGovTooltip(marker, point.name);
  marker.on("click", (event: any) => {
    event?.originalEvent?.stopPropagation?.();
    onSelect(point);
  });
  return marker;
};

async function loadPhilippineProvinceBoundaryFeatures(
  signal?: AbortSignal
): Promise<ProvinceBoundaryFeature[]> {
  const responses = await Promise.all(
    PROVINCE_BOUNDARY_REGION_FILES.map((fileName) =>
      fetch(`${PROVINCE_BOUNDARY_BASE_URL}/${fileName}`, { signal })
    )
  );

  if (responses.some((response) => !response.ok)) {
    throw new Error("Province boundary datasets unavailable");
  }

  const regionCollections = await Promise.all(responses.map((response) => response.json()));
  const output = new Map<string, ProvinceBoundaryFeature>();

  regionCollections.forEach((collection: any) => {
    if (!Array.isArray(collection?.features)) return;
    collection.features.forEach((feature: any) => {
      const geoLevel = toText(feature?.properties?.geo_level, "");
      if (geoLevel !== "Prov" && geoLevel !== "Dist") return;

      const name = toText(feature?.properties?.adm2_en, "Unknown Province");
      const id = String(feature?.properties?.adm2_psgc ?? `${geoLevel}:${name}`);
      if (output.has(id)) return;

      output.set(id, { id, name, geoLevel, feature });
    });
  });

  return Array.from(output.values());
}

const MILITARY_FACILITIES: GovInfrastructurePoint[] = [
  {
    id: "camp-aguinaldo",
    layer: "military",
    name: "Camp Aguinaldo",
    category: "General Headquarters",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 14.606538,
    lon: 121.063746,
    note: "AFP command complex supporting national defense operations.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "camp-crame",
    layer: "military",
    name: "Camp Crame",
    category: "National Security Complex",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 14.608270,
    lon: 121.053299,
    note: "Major government security compound in Metro Manila.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "fort-bonifacio",
    layer: "military",
    name: "Fort Bonifacio",
    category: "Army Headquarters",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Taguig",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 14.549425,
    lon: 121.050972,
    note: "Primary Philippine Army command and training area.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "sangley-point",
    layer: "military",
    name: "Sangley Point",
    category: "Naval/Aviation Base",
    status: "Operational",
    region: "Region IV-A",
    province: "Cavite",
    municipality: "Cavite City",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 14.495720,
    lon: 120.907740,
    note: "Coastal security and maritime aviation installation.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "subic-naval",
    layer: "military",
    name: "Subic Naval Operating Base",
    category: "Naval Facility",
    status: "Operational",
    region: "Region III",
    province: "Zambales",
    municipality: "Subic",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 14.822,
    lon: 120.282,
    note: "Strategic west-coast naval logistics and patrol node.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "wallace-air",
    layer: "military",
    name: "Wallace Air Station",
    category: "Air Defense Facility",
    status: "Operational",
    region: "Region I",
    province: "La Union",
    municipality: "San Fernando",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 16.618558,
    lon: 120.282455,
    note: "Northern Luzon air and coastal surveillance position.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "basa-air-base",
    layer: "military",
    name: "Basa Air Base",
    category: "Fighter Air Base",
    status: "Operational",
    region: "Region III",
    province: "Pampanga",
    municipality: "Floridablanca",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 14.987039,
    lon: 120.493133,
    note: "Primary tactical air defense installation in Central Luzon.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "clark-air-base",
    layer: "military",
    name: "Clark Air Base",
    category: "Air Mobility Hub",
    status: "Operational",
    region: "Region III",
    province: "Pampanga",
    municipality: "Mabalacat",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 15.1848,
    lon: 120.5603,
    note: "Major rapid deployment and logistics aviation hub.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "antonio-bautista",
    layer: "military",
    name: "Antonio Bautista Air Base",
    category: "Forward Air Base",
    status: "Operational",
    region: "Region IV-B",
    province: "Palawan",
    municipality: "Puerto Princesa",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 9.746607,
    lon: 118.756582,
    note: "Western maritime air response base in Palawan.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "lumbia-air-base",
    layer: "military",
    name: "Lumbia Air Base",
    category: "Air Operations Base",
    status: "Operational",
    region: "Region X",
    province: "Misamis Oriental",
    municipality: "Cagayan de Oro",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 8.6124,
    lon: 124.4565,
    note: "Mindanao airlift and tactical support location.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "camp-evangelista",
    layer: "military",
    name: "Camp Evangelista",
    category: "Army Division Headquarters",
    status: "Operational",
    region: "Region X",
    province: "Misamis Oriental",
    municipality: "Cagayan de Oro",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 8.490137,
    lon: 124.621715,
    note: "Key army command center for Northern Mindanao operations.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "camp-panacan",
    layer: "military",
    name: "Camp Panacan",
    category: "Army Command Camp",
    status: "Operational",
    region: "Region XI",
    province: "Davao del Sur",
    municipality: "Davao City",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 7.153836,
    lon: 125.661100,
    note: "Operational command camp for eastern Mindanao readiness.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "edwin-andrews-air-base",
    layer: "military",
    name: "Edwin Andrews Air Base",
    category: "Air Base",
    status: "Operational",
    region: "Region IX",
    province: "Zamboanga del Sur",
    municipality: "Zamboanga City",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 6.926034,
    lon: 122.066354,
    note: "Southwestern air operations and rapid response position.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "naval-station-romulo-espaldon",
    layer: "military",
    name: "Naval Station Romulo Espaldon",
    category: "Naval Station",
    status: "Operational",
    region: "Region IX",
    province: "Zamboanga del Sur",
    municipality: "Zamboanga City",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 6.9212,
    lon: 122.0843,
    note: "Critical naval command and patrol support station.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "fort-magsaysay-edca",
    layer: "military",
    name: "Fort Magsaysay (ENCA/EDCA Site)",
    category: "ENCA/EDCA Agreed Location",
    status: "Operational",
    region: "Region III",
    province: "Nueva Ecija",
    municipality: "Laur",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 15.527890,
    lon: 121.141646,
    note: "Major land forces training and staging area under ENCA/EDCA access.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "mactan-benito-ebuen-edca",
    layer: "military",
    name: "Mactan-Benito Ebuen Air Base (ENCA/EDCA Site)",
    category: "ENCA/EDCA Agreed Location",
    status: "Operational",
    region: "Region VII",
    province: "Cebu",
    municipality: "Lapu-Lapu City",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 10.314221,
    lon: 123.971728,
    note: "Central Visayas rapid airlift and interoperability location under ENCA/EDCA.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "camp-melchor-dela-cruz-edca",
    layer: "military",
    name: "Camp Melchor Dela Cruz (ENCA/EDCA Site)",
    category: "ENCA/EDCA Agreed Location",
    status: "Operational",
    region: "Region II",
    province: "Isabela",
    municipality: "Gamu",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 17.073130,
    lon: 121.865388,
    note: "Northern Luzon command position and logistics node under ENCA/EDCA.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "naval-base-camilo-osias-edca",
    layer: "military",
    name: "Naval Base Camilo Osias (ENCA/EDCA Site)",
    category: "ENCA/EDCA Agreed Location",
    status: "Operational",
    region: "Region II",
    province: "Cagayan",
    municipality: "Santa Ana",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 18.503534,
    lon: 122.149573,
    note: "Northern maritime defense and coastal patrol site under ENCA/EDCA.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "lallo-airport-edca",
    layer: "military",
    name: "Lal-lo Airport (ENCA/EDCA Site)",
    category: "ENCA/EDCA Agreed Location",
    status: "Operational",
    region: "Region II",
    province: "Cagayan",
    municipality: "Lal-lo",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 18.182402,
    lon: 121.748059,
    note: "Northern Cagayan air mobility and support location under ENCA/EDCA.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
  {
    id: "balabac-island-edca",
    layer: "military",
    name: "Balabac Island (ENCA/EDCA Site)",
    category: "ENCA/EDCA Agreed Location",
    status: "Operational",
    region: "Region IV-B",
    province: "Palawan",
    municipality: "Balabac",
    contractor: "N/A",
    year: null,
    cost: null,
    lat: 7.939398,
    lon: 117.021916,
    note: "Southwestern maritime access and monitoring position under ENCA/EDCA.",
    source: GOV_INFRA_LAYER_META.military.source,
  },
];

const HIGH_VALUE_INFRASTRUCTURE: GovInfrastructurePoint[] = [
  {
    id: "ilijan-gas-plant",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Ilijan Natural Gas Plant",
    category: "Gas-Fired Power Plant",
    status: "Operational",
    region: "Region IV-A",
    province: "Batangas",
    municipality: "Batangas City",
    contractor: "KEPCO and Team Energy",
    year: 2002,
    cost: null,
    lat: 13.622633,
    lon: 121.078598,
    note: "Large baseload gas plant supporting Luzon grid reliability.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "sual-power-station",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Sual Power Station",
    category: "Coal Power Station",
    status: "Operational",
    region: "Region I",
    province: "Pangasinan",
    municipality: "Sual",
    contractor: "TeaM Energy",
    year: 1999,
    cost: null,
    lat: 16.1388,
    lon: 120.0956,
    note: "Critical north Luzon baseload generation complex.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "malampaya-onshore",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Malampaya Onshore Gas Plant",
    category: "Gas Processing Facility",
    status: "Operational",
    region: "Region IV-A",
    province: "Batangas",
    municipality: "Batangas City",
    contractor: "Malampaya consortium",
    year: 2001,
    cost: null,
    lat: 13.718056,
    lon: 121.065430,
    note: "Strategic gas processing hub feeding key Luzon power plants.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "first-gen-lng-terminal",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "First Gen LNG Terminal",
    category: "Fuel Terminal and Regasification",
    status: "Operational",
    region: "Region IV-A",
    province: "Batangas",
    municipality: "Batangas City",
    contractor: "First Gen",
    year: 2023,
    cost: null,
    lat: 13.5591,
    lon: 120.9496,
    note: "Fuel import gateway improving grid resilience.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "batangas-manila-pipeline-node",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Batangas-Manila Pipeline Node",
    category: "Fuel Pipeline System",
    status: "Operational",
    region: "Region IV-A",
    province: "Batangas",
    municipality: "San Pascual",
    contractor: "Fuel Logistics Consortium",
    year: null,
    cost: null,
    lat: 13.7879,
    lon: 121.0249,
    note: "Representative trunk point for strategic fuel distribution.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "national-grid-luzon-backbone",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Luzon Transmission Backbone Node",
    category: "High-Voltage Transmission Grid",
    status: "Operational",
    region: "Region III",
    province: "Pampanga",
    municipality: "Mexico",
    contractor: "National Grid Operations",
    year: null,
    cost: null,
    lat: 15.0645,
    lon: 120.7131,
    note: "Representative high-voltage interconnection in the Luzon backbone.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "pagbilao-power-plant",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Pagbilao Power Plant",
    category: "Coal-Fired Power Plant",
    status: "Operational",
    region: "Region IV-A",
    province: "Quezon",
    municipality: "Pagbilao",
    contractor: "TeaM Energy",
    year: null,
    cost: null,
    lat: 13.895029,
    lon: 121.745219,
    note: "Large baseload generation complex serving the Luzon grid.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "masinloc-power-plant",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Masinloc Power Plant",
    category: "Coal-Fired Power Plant",
    status: "Operational",
    region: "Region III",
    province: "Zambales",
    municipality: "Masinloc",
    contractor: "Masinloc Power Partners Co. Ltd.",
    year: null,
    cost: null,
    lat: 15.567529,
    lon: 119.924079,
    note: "Major west-coast baseload plant supporting Luzon demand.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "mariveles-power-plant",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Mariveles Power Plant",
    category: "Coal-Fired Power Plant",
    status: "Operational",
    region: "Region III",
    province: "Bataan",
    municipality: "Mariveles",
    contractor: "Mariveles Power Generation Corporation",
    year: null,
    cost: null,
    lat: 14.424613,
    lon: 120.536341,
    note: "Strategic generation asset in the Bataan energy corridor.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "san-roque-hydroelectric-plant",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "San Roque Hydroelectric Power Plant",
    category: "Hydroelectric Power Plant",
    status: "Operational",
    region: "Region I",
    province: "Pangasinan",
    municipality: "San Manuel / San Nicolas",
    contractor: "San Roque Power Corporation",
    year: null,
    cost: null,
    lat: 16.137500,
    lon: 120.681168,
    note: "Hydropower facility tied to the Agno River system and Luzon balancing.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "magat-hydroelectric-plant",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Magat Hydroelectric Power Plant",
    category: "Hydroelectric Power Plant",
    status: "Operational",
    region: "Region II",
    province: "Isabela",
    municipality: "Ramon",
    contractor: "National Power Corporation / SN Aboitiz Power",
    year: null,
    cost: null,
    lat: 16.826880,
    lon: 121.455594,
    note: "Northern Luzon hydro generation node linked to Magat Dam operations.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "la-mesa-treatment",
    layer: "industry",
    domain: "Fluid Systems",
    name: "La Mesa Water Treatment Complex",
    category: "Water Treatment and Distribution",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
    contractor: "MWSS Utility Operators",
    year: null,
    cost: null,
    lat: 14.7059,
    lon: 121.0783,
    note: "Critical potable water processing and distribution node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "putatan-water-treatment",
    layer: "industry",
    domain: "Fluid Systems",
    name: "Putatan Water Treatment Plant",
    category: "Water Treatment Facility",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Muntinlupa City",
    contractor: "Manila Water",
    year: null,
    cost: null,
    lat: 14.4077,
    lon: 121.0413,
    note: "South Metro Manila freshwater treatment and supply node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "metro-manila-sewerage-main",
    layer: "industry",
    domain: "Fluid Systems",
    name: "Metro Manila Sewerage Backbone",
    category: "Wastewater Interceptor System",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Pasig City",
    contractor: "Metro Utility Operators",
    year: null,
    cost: null,
    lat: 14.575,
    lon: 121.085,
    note: "Representative wastewater collection and treatment corridor node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "naia-complex",
    layer: "industry",
    domain: "Transport",
    name: "Ninoy Aquino International Airport",
    category: "International Airport Hub",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Pasay City",
    contractor: "Government and concession operators",
    year: null,
    cost: null,
    lat: 14.512247,
    lon: 121.021922,
    note: "Primary aviation gateway and strategic logistics hub.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "port-of-manila",
    layer: "industry",
    domain: "Transport",
    name: "Port of Manila",
    category: "Major Seaport and Container Hub",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Manila",
    contractor: "Port Authority and terminal operators",
    year: null,
    cost: null,
    lat: 14.585166,
    lon: 120.972685,
    note: "Core national maritime logistics and customs gateway.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "north-south-commuter-rail-node",
    layer: "industry",
    domain: "Transport",
    name: "North-South Commuter Rail Core Node",
    category: "Rail Backbone",
    status: "Under Development",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Manila",
    contractor: "DOTr Rail Program",
    year: null,
    cost: null,
    lat: 14.6054,
    lon: 120.9822,
    note: "Strategic rail integration node for Luzon passenger logistics.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "nlex-slex-connector-node",
    layer: "industry",
    domain: "Transport",
    name: "NLEX-SLEX Connector Corridor",
    category: "Major Road Arterial",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Manila",
    contractor: "Expressway Operator Consortium",
    year: null,
    cost: null,
    lat: 14.594408,
    lon: 121.012568,
    note: "Critical north-south freight and mobility corridor.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "pldt-vitro-south",
    layer: "industry",
    domain: "Telecommunications",
    name: "VITRO Santa Rosa Data Center Campus",
    category: "Carrier-Neutral Data Center",
    status: "Operational",
    region: "Region IV-A",
    province: "Laguna",
    municipality: "Santa Rosa",
    contractor: "PLDT VITRO",
    year: null,
    cost: null,
    lat: 14.268688,
    lon: 121.081342,
    note: "Large-scale interconnection and digital hosting hub.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "baler-cable-landing",
    layer: "industry",
    domain: "Telecommunications",
    name: "Baler Subsea Cable Landing Station",
    category: "International Internet Backbone Node",
    status: "Operational",
    region: "Region III",
    province: "Aurora",
    municipality: "Baler",
    contractor: "Telecom Consortium",
    year: null,
    cost: null,
    lat: 15.7588,
    lon: 121.5606,
    note: "Representative submarine cable entry point to Luzon backbone.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "pgh-complex",
    layer: "industry",
    domain: "Healthcare",
    name: "Philippine General Hospital",
    category: "National Tertiary Hospital",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Manila",
    contractor: "UP-PGH",
    year: null,
    cost: null,
    lat: 14.577771,
    lon: 120.985707,
    note: "Flagship public referral and emergency care institution.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "ritm-lab",
    layer: "industry",
    domain: "Healthcare",
    name: "RITM Public Health Laboratory",
    category: "National Public Health Lab",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Muntinlupa City",
    contractor: "Department of Health",
    year: null,
    cost: null,
    lat: 14.4135,
    lon: 121.0447,
    note: "Core laboratory infrastructure for outbreak and diagnostic response.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "bsp-complex",
    layer: "industry",
    domain: "Bank & Finance",
    name: "Bangko Sentral ng Pilipinas Complex",
    category: "Monetary and Payment Core",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Manila",
    contractor: "Bangko Sentral ng Pilipinas",
    year: null,
    cost: null,
    lat: 14.561431,
    lon: 120.987711,
    note: "Central node for monetary operations and settlement infrastructure.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "pchc-clearing-center",
    layer: "industry",
    domain: "Bank & Finance",
    name: "PCHC Clearing Center",
    category: "Clearing and Settlement Infrastructure",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Makati City",
    contractor: "Philippine Clearing House Corporation",
    year: null,
    cost: null,
    lat: 14.5587,
    lon: 121.0198,
    note: "Representative clearing rail for interbank payments.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "nfa-cabanatuan",
    layer: "industry",
    domain: "Food & agriculture",
    name: "NFA Grain Storage Complex",
    category: "Strategic Food Storage",
    status: "Operational",
    region: "Region III",
    province: "Nueva Ecija",
    municipality: "Cabanatuan City",
    contractor: "National Food Authority",
    year: null,
    cost: null,
    lat: 15.4868,
    lon: 120.9672,
    note: "Strategic grain reserve and distribution node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "gensan-fish-port",
    layer: "industry",
    domain: "Food & agriculture",
    name: "General Santos Fish Port",
    category: "Agri-Fisheries Logistics Hub",
    status: "Operational",
    region: "Region XII",
    province: "South Cotabato",
    municipality: "General Santos City",
    contractor: "Philippine Fisheries Development Authority",
    year: null,
    cost: null,
    lat: 6.1117,
    lon: 125.1712,
    note: "Major fisheries production, cold-chain, and export logistics node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "ndrrmc-ops-center",
    layer: "industry",
    domain: "Government",
    name: "NDRRMC National Operations Center",
    category: "Disaster Response Command Center",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
    contractor: "NDRRMC",
    year: null,
    cost: null,
    lat: 14.6089,
    lon: 121.0516,
    note: "Primary national disaster coordination and emergency response node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "dict-national-gov-data-center",
    layer: "industry",
    domain: "Data Center",
    name: "National Government Data Center Node",
    category: "Government Cloud and Data Platform",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Taguig City",
    contractor: "DICT",
    year: null,
    cost: null,
    lat: 14.5481,
    lon: 121.0534,
    note: "Core digital hosting and sovereign government data infrastructure.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "dict-cybersecurity-center",
    layer: "industry",
    domain: "Data Center",
    name: "National Cybersecurity Coordination Node",
    category: "Cyber Defense and Incident Response",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Taguig City",
    contractor: "DICT",
    year: null,
    cost: null,
    lat: 14.5512,
    lon: 121.0476,
    note: "Strategic cyber monitoring and coordinated incident response center.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "philsa-clark-node",
    layer: "industry",
    domain: "Aerospace",
    name: "PhilSA New Clark Space Node",
    category: "Space and Satellite Program Facility",
    status: "Operational",
    region: "Region III",
    province: "Tarlac",
    municipality: "Capas",
    contractor: "Philippine Space Agency",
    year: null,
    cost: null,
    lat: 15.3178,
    lon: 120.6492,
    note: "Representative national space and satellite operations support node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "tiwi-geothermal-field",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Tiwi Geothermal Power Plant A",
    category: "Geothermal Power Generation",
    status: "Operational",
    region: "Region V",
    province: "Albay",
    municipality: "Tiwi",
    contractor: "AP Renewables",
    year: null,
    cost: null,
    lat: 13.465164,
    lon: 123.648352,
    note: "Tiwi geothermal A block in the AP Renewables complex.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "tiwi-geothermal-plant-b",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Tiwi Geothermal Power Plant B",
    category: "Geothermal Power Generation",
    status: "Operational",
    region: "Region V",
    province: "Albay",
    municipality: "Tiwi",
    contractor: "AP Renewables",
    year: null,
    cost: null,
    lat: 13.461327,
    lon: 123.657787,
    note: "Tiwi geothermal B block in the AP Renewables complex.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "tiwi-geothermal-plant-c",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Tiwi Geothermal Power Plant C",
    category: "Geothermal Power Generation",
    status: "Operational",
    region: "Region V",
    province: "Albay",
    municipality: "Tiwi",
    contractor: "AP Renewables",
    year: null,
    cost: null,
    lat: 13.459301,
    lon: 123.639543,
    note: "Tiwi geothermal C block in the AP Renewables complex.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "tongonan-geothermal-field",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Tongonan Geothermal Complex",
    category: "Geothermal Power Generation",
    status: "Operational",
    region: "Region VIII",
    province: "Leyte",
    municipality: "Kananga",
    contractor: "Energy Development Corporation",
    year: null,
    cost: null,
    lat: 11.1235,
    lon: 124.8085,
    note: "Visayas geothermal generation complex supporting grid stability.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "agus-hydroelectric-complex",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Agus Hydroelectric Complex",
    category: "Hydroelectric Power Complex",
    status: "Operational",
    region: "BARMM",
    province: "Lanao del Sur",
    municipality: "Marawi City",
    contractor: "NPC / PSALM",
    year: null,
    cost: null,
    lat: 8.052971,
    lon: 124.270048,
    note: "Mindanao hydroelectric backbone for system reliability.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "limay-fuel-terminal",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Limay Fuel Terminal Cluster",
    category: "Fuel Depot and Import Terminal",
    status: "Operational",
    region: "Region III",
    province: "Bataan",
    municipality: "Limay",
    contractor: "Multiple downstream oil operators",
    year: null,
    cost: null,
    lat: 14.5542,
    lon: 120.5976,
    note: "Strategic depot corridor feeding Luzon fuel logistics.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "bataan-nuclear-power-plant",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Bataan Nuclear Power Plant",
    category: "Nuclear Power Plant",
    status: "Mothballed",
    region: "Region III",
    province: "Bataan",
    municipality: "Morong",
    contractor: "National Power Corporation",
    year: 1984,
    cost: null,
    lat: 14.6291,
    lon: 120.314,
    note: "Napot Point nuclear facility in Morong, Bataan (never commissioned).",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "mindanao-grid-toril-node",
    layer: "industry",
    domain: "Enegy & Oil",
    name: "Mindanao Grid Toril Node",
    category: "High-Voltage Transmission Node",
    status: "Operational",
    region: "Region XI",
    province: "Davao del Sur",
    municipality: "Davao City",
    contractor: "National Grid Operations",
    year: null,
    cost: null,
    lat: 7.032,
    lon: 125.4904,
    note: "Southern transmission switching point for Mindanao grid balancing.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "angat-dam-system",
    layer: "industry",
    domain: "Fluid Systems",
    name: "Angat Dam System",
    category: "Dam and Bulk Water Source",
    status: "Operational",
    region: "Region III",
    province: "Bulacan",
    municipality: "Norzagaray",
    contractor: "NIA / MWSS",
    year: null,
    cost: null,
    lat: 14.908459,
    lon: 121.160387,
    note: "Major bulk water and hydropower source for Metro Manila and nearby provinces.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "ipo-dam-system",
    layer: "industry",
    domain: "Fluid Systems",
    name: "Ipo Dam",
    category: "Water Diversion Dam",
    status: "Operational",
    region: "Region III",
    province: "Bulacan",
    municipality: "Norzagaray",
    contractor: "MWSS",
    year: null,
    cost: null,
    lat: 14.875262,
    lon: 121.147411,
    note: "Key diversion and conveyance facility for Metro Manila distribution.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "balara-treatment-plant",
    layer: "industry",
    domain: "Fluid Systems",
    name: "Balara Water Treatment Plant",
    category: "Water Treatment Facility",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
    contractor: "MWSS Utility Operators",
    year: null,
    cost: null,
    lat: 14.655201,
    lon: 121.080783,
    note: "Primary treatment and transmission point for the east service area.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "buhisan-dam-cebu",
    layer: "industry",
    domain: "Fluid Systems",
    name: "Buhisan Dam",
    category: "Metro Water Storage",
    status: "Operational",
    region: "Region VII",
    province: "Cebu",
    municipality: "Cebu City",
    contractor: "MCWD",
    year: null,
    cost: null,
    lat: 10.313599,
    lon: 123.848637,
    note: "Cebu metropolitan water storage and distribution support node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "clark-international-airport",
    layer: "industry",
    domain: "Transport",
    name: "Clark International Airport",
    category: "International Airport Hub",
    status: "Operational",
    region: "Region III",
    province: "Pampanga",
    municipality: "Mabalacat",
    contractor: "BCDA / CIAC",
    year: null,
    cost: null,
    lat: 15.187167,
    lon: 120.557465,
    note: "Northern Luzon gateway for cargo and passenger aviation.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "port-of-cebu",
    layer: "industry",
    domain: "Transport",
    name: "Port of Cebu",
    category: "Seaport and Inter-Island Hub",
    status: "Operational",
    region: "Region VII",
    province: "Cebu",
    municipality: "Cebu City",
    contractor: "PPA and terminal operators",
    year: null,
    cost: null,
    lat: 10.305435,
    lon: 123.917456,
    note: "Core Visayas maritime gateway for domestic and international cargo.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "port-of-davao",
    layer: "industry",
    domain: "Transport",
    name: "Port of Davao",
    category: "Seaport and Cargo Gateway",
    status: "Operational",
    region: "Region XI",
    province: "Davao del Sur",
    municipality: "Davao City",
    contractor: "PPA and private operators",
    year: null,
    cost: null,
    lat: 7.126527,
    lon: 125.662711,
    note: "Primary southern maritime trade and agri-export gateway.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "mactan-cebu-airport-node",
    layer: "industry",
    domain: "Transport",
    name: "Mactan-Cebu International Airport",
    category: "International Airport Hub",
    status: "Operational",
    region: "Region VII",
    province: "Cebu",
    municipality: "Lapu-Lapu City",
    contractor: "MCIA Authority",
    year: null,
    cost: null,
    lat: 10.310340,
    lon: 123.979306,
    note: "Visayas air mobility hub for passenger, cargo, and emergency lift.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "san-juanico-bridge",
    layer: "industry",
    domain: "Transport",
    name: "San Juanico Bridge Corridor",
    category: "Strategic Road and Bridge Link",
    status: "Operational",
    region: "Region VIII",
    province: "Leyte",
    municipality: "Tacloban City",
    contractor: "DPWH",
    year: null,
    cost: null,
    lat: 11.302863,
    lon: 124.972100,
    note: "Key inter-island road artery connecting Samar and Leyte supply chains.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "batangas-international-port",
    layer: "industry",
    domain: "Transport",
    name: "Batangas International Port",
    category: "Seaport and Container Hub",
    status: "Operational",
    region: "Region IV-A",
    province: "Batangas",
    municipality: "Batangas City",
    contractor: "PPA and terminal operators",
    year: null,
    cost: null,
    lat: 13.754944,
    lon: 121.044083,
    note: "Primary international and domestic cargo gateway in Southern Luzon.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "subic-bay-international-container-terminal",
    layer: "industry",
    domain: "Transport",
    name: "Subic Bay International Container Terminal",
    category: "Seaport and Container Hub",
    status: "Operational",
    region: "Region III",
    province: "Bataan",
    municipality: "Morong",
    contractor: "SBMA and terminal operators",
    year: null,
    cost: null,
    lat: 14.801908,
    lon: 120.263923,
    note: "Strategic west-coast container terminal supporting national logistics.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "port-of-iloilo",
    layer: "industry",
    domain: "Transport",
    name: "Port of Iloilo",
    category: "Seaport and Inter-Island Hub",
    status: "Operational",
    region: "Region VI",
    province: "Iloilo",
    municipality: "Iloilo City",
    contractor: "PPA and terminal operators",
    year: null,
    cost: null,
    lat: 10.690123,
    lon: 122.582614,
    note: "Western Visayas maritime gateway for cargo, passengers, and inter-island trade.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "port-of-cagayan-de-oro",
    layer: "industry",
    domain: "Transport",
    name: "Port of Cagayan de Oro",
    category: "Seaport and Cargo Gateway",
    status: "Operational",
    region: "Region X",
    province: "Misamis Oriental",
    municipality: "Cagayan de Oro",
    contractor: "PPA and terminal operators",
    year: null,
    cost: null,
    lat: 8.494532,
    lon: 124.662190,
    note: "Northern Mindanao port complex for domestic and regional cargo flows.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "mindanao-international-container-terminal",
    layer: "industry",
    domain: "Transport",
    name: "Mindanao International Container Terminal",
    category: "Seaport and Container Hub",
    status: "Operational",
    region: "Region X",
    province: "Misamis Oriental",
    municipality: "Tagoloan",
    contractor: "Mindanao International Container Terminal Services Inc.",
    year: null,
    cost: null,
    lat: 8.523800,
    lon: 124.750412,
    note: "Key container handling and throughput node for Mindanao supply chains.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "port-of-zamboanga",
    layer: "industry",
    domain: "Transport",
    name: "Port of Zamboanga",
    category: "Seaport and Cargo Gateway",
    status: "Operational",
    region: "Region IX",
    province: "Zamboanga City",
    municipality: "Zamboanga City",
    contractor: "PPA and terminal operators",
    year: null,
    cost: null,
    lat: 6.903184,
    lon: 122.072775,
    note: "Western Mindanao maritime gateway for commerce and inter-island movement.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "vitro-makati-campus",
    layer: "industry",
    domain: "Telecommunications",
    name: "VITRO Makati Data Center",
    category: "Carrier-Neutral Data Center",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Makati City",
    contractor: "PLDT VITRO",
    year: null,
    cost: null,
    lat: 14.5583,
    lon: 121.0183,
    note: "Metro Manila colocation and interconnection node for telco traffic.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "phopenix-diliman-node",
    layer: "industry",
    domain: "Telecommunications",
    name: "PHOpenIX Diliman Node",
    category: "Internet Exchange Backbone Node",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
    contractor: "DOST-ASTI",
    year: null,
    cost: null,
    lat: 14.6495,
    lon: 121.0695,
    note: "National internet exchange node reducing domestic latency and transit costs.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "nfb-cebu-core",
    layer: "industry",
    domain: "Telecommunications",
    name: "National Fiber Backbone Cebu Core",
    category: "Fiber Backbone Aggregation Node",
    status: "Operational",
    region: "Region VII",
    province: "Cebu",
    municipality: "Cebu City",
    contractor: "DICT",
    year: null,
    cost: null,
    lat: 10.3127,
    lon: 123.905,
    note: "Regional backbone node for Visayas government and carrier connectivity.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "nkti-hospital-complex",
    layer: "industry",
    domain: "Healthcare",
    name: "National Kidney and Transplant Institute",
    category: "Specialty Tertiary Hospital",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
    contractor: "Department of Health",
    year: null,
    cost: null,
    lat: 14.646873,
    lon: 121.047224,
    note: "National referral center for transplant and renal emergency services.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "vsmmc-cebu",
    layer: "industry",
    domain: "Healthcare",
    name: "Vicente Sotto Memorial Medical Center",
    category: "Regional Tertiary Hospital",
    status: "Operational",
    region: "Region VII",
    province: "Cebu",
    municipality: "Cebu City",
    contractor: "Department of Health",
    year: null,
    cost: null,
    lat: 10.307816,
    lon: 123.891629,
    note: "Major Visayas tertiary and trauma referral facility.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "spmc-davao",
    layer: "industry",
    domain: "Healthcare",
    name: "Southern Philippines Medical Center",
    category: "Regional Tertiary Hospital",
    status: "Operational",
    region: "Region XI",
    province: "Davao del Sur",
    municipality: "Davao City",
    contractor: "Department of Health",
    year: null,
    cost: null,
    lat: 7.099778,
    lon: 125.619484,
    note: "Mindanao referral hub with emergency and critical care services.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "pds-bgc-node",
    layer: "industry",
    domain: "Bank & Finance",
    name: "Philippine Dealing System Node",
    category: "Financial Market Infrastructure",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Taguig City",
    contractor: "PDS Group",
    year: null,
    cost: null,
    lat: 14.5518,
    lon: 121.0494,
    note: "Critical fixed-income and settlement market infrastructure node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "pse-bgc-tower",
    layer: "industry",
    domain: "Bank & Finance",
    name: "Philippine Stock Exchange Tower",
    category: "Equity Market Infrastructure",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Taguig City",
    contractor: "Philippine Stock Exchange",
    year: null,
    cost: null,
    lat: 14.5529,
    lon: 121.0505,
    note: "Primary exchange and trading infrastructure for domestic equities.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "navotas-fish-port",
    layer: "industry",
    domain: "Food & agriculture",
    name: "Navotas Fish Port Complex",
    category: "Fisheries Landing and Cold Storage",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Navotas City",
    contractor: "PFDA",
    year: null,
    cost: null,
    lat: 14.6635,
    lon: 120.9563,
    note: "Major fish landing and cold-chain distribution node for Metro Manila.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "davao-food-terminal",
    layer: "industry",
    domain: "Food & agriculture",
    name: "Davao Food Terminal Complex",
    category: "Agri Logistics and Distribution",
    status: "Operational",
    region: "Region XI",
    province: "Davao del Sur",
    municipality: "Davao City",
    contractor: "LGU and DA support programs",
    year: null,
    cost: null,
    lat: 7.1908,
    lon: 125.4553,
    note: "Southern consolidation point for agricultural goods and distribution.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "bfp-national-hq",
    layer: "industry",
    domain: "Government",
    name: "Bureau of Fire Protection National HQ",
    category: "Emergency Operations Command",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
    contractor: "BFP",
    year: null,
    cost: null,
    lat: 14.652082,
    lon: 121.038112,
    note: "National fire and rescue command and interoperability node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "ocd-main-office",
    layer: "industry",
    domain: "Government",
    name: "Office of Civil Defense Main Office",
    category: "National Disaster Administration",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
    contractor: "OCD",
    year: null,
    cost: null,
    lat: 14.610114,
    lon: 121.065393,
    note: "Core civil defense planning and emergency operations management center.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "cebu-cdrrmo-eoc",
    layer: "industry",
    domain: "Government",
    name: "Cebu City DRRMO Operations Center",
    category: "Local Disaster Command Center",
    status: "Operational",
    region: "Region VII",
    province: "Cebu",
    municipality: "Cebu City",
    contractor: "Cebu City Government",
    year: null,
    cost: null,
    lat: 10.3157,
    lon: 123.8854,
    note: "Metro Cebu emergency command and rapid response coordination node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "cicc-national-center",
    layer: "industry",
    domain: "Data Center",
    name: "CICC National Cybercrime Response Center",
    category: "Cyber Incident Coordination",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Taguig City",
    contractor: "CICC",
    year: null,
    cost: null,
    lat: 14.5525,
    lon: 121.0488,
    note: "Inter-agency cybercrime monitoring and national response coordination node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "asti-data-center",
    layer: "industry",
    domain: "Data Center",
    name: "DOST-ASTI Data Center",
    category: "Government Network and Compute Infrastructure",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
    contractor: "DOST-ASTI",
    year: null,
    cost: null,
    lat: 14.6484,
    lon: 121.073,
    note: "Government research and mission-critical ICT hosting infrastructure.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "pedro-center-qc",
    layer: "industry",
    domain: "Aerospace",
    name: "PEDRO Center Quezon City",
    category: "Satellite Ground Receiving and Processing",
    status: "Operational",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
    contractor: "DOST-ASTI / PhilSA",
    year: null,
    cost: null,
    lat: 14.6489,
    lon: 121.0712,
    note: "Primary Earth observation receiving and processing node.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
  {
    id: "pedro-davao-node",
    layer: "industry",
    domain: "Aerospace",
    name: "PEDRO Davao Ground Station",
    category: "Satellite Ground Receiving Station",
    status: "Operational",
    region: "Region XI",
    province: "Davao del Sur",
    municipality: "Davao City",
    contractor: "DOST-ASTI / PhilSA",
    year: null,
    cost: null,
    lat: 7.1657,
    lon: 125.4914,
    note: "Southern receiving station strengthening nationwide satellite pass coverage.",
    source: GOV_INFRA_LAYER_META.industry.source,
  },
];

const INFRA_ASSETS: InfrastructureAsset[] = [
  {
    id: "angat",
    name: "Angat Dam",
    type: "Dam",
    region: "Bulacan",
    island: "Luzon",
    capacity: "850 MLD",
    status: "Operational",
    lat: 14.908459,
    lon: 121.160387,
    note: "Primary water reservoir feeding Metro Manila and adjacent provinces.",
  },
  {
    id: "san-roque",
    name: "San Roque Dam",
    type: "Dam",
    region: "Pangasinan",
    island: "Luzon",
    capacity: "345 MW",
    status: "Operational",
    lat: 16.137500,
    lon: 120.681168,
    note: "Hydropower anchor for the Agno River basin.",
  },
  {
    id: "magat",
    name: "Magat Dam",
    type: "Dam",
    region: "Isabela",
    island: "Luzon",
    capacity: "360 MW",
    status: "Operational",
    lat: 16.826880,
    lon: 121.455594,
    note: "Irrigation and power node supporting Northern Luzon food and energy security.",
  },
  {
    id: "tiwi",
    name: "Tiwi Geothermal Plant",
    type: "Power Plant",
    region: "Albay",
    island: "Luzon",
    capacity: "289 MW",
    status: "Online",
    lat: 13.465164,
    lon: 123.648352,
    note: "Baseload geothermal generation for the Luzon grid.",
  },
  {
    id: "calaca",
    name: "Calaca Power Complex",
    type: "Power Plant",
    region: "Batangas",
    island: "Luzon",
    capacity: "1.2 GW",
    status: "Online",
    lat: 13.931136,
    lon: 120.789117,
    note: "Critical dispatchable power supporting industrial zones in CALABARZON.",
  },
  {
    id: "cebu-port",
    name: "Port of Cebu",
    type: "Port",
    region: "Cebu",
    island: "Visayas",
    capacity: "2.7M TEU/yr",
    status: "Active",
    lat: 10.305435,
    lon: 123.917456,
    note: "High-volume maritime gateway connecting inter-island logistics corridors.",
  },
  {
    id: "mactan",
    name: "Mactan-Cebu International",
    type: "Airport",
    region: "Cebu",
    island: "Visayas",
    capacity: "12M pax/yr",
    status: "Active",
    lat: 10.310340,
    lon: 123.979306,
    note: "Primary aviation hub for central Philippines passenger and cargo flow.",
  },
  {
    id: "agus",
    name: "Agus Hydroelectric Complex",
    type: "Power Plant",
    region: "Lanao del Sur",
    island: "Mindanao",
    capacity: "727 MW",
    status: "Online",
    lat: 8.052971,
    lon: 124.270048,
    note: "Hydroelectric backbone powering major urban centers in Mindanao.",
  },
  {
    id: "davao-port",
    name: "Port of Davao",
    type: "Port",
    region: "Davao del Sur",
    island: "Mindanao",
    capacity: "1.3M TEU/yr",
    status: "Active",
    lat: 7.126527,
    lon: 125.662711,
    note: "Southern trade gateway supporting agriculture, manufacturing, and export lanes.",
  },
];

const STRATEGIC_ASSET_DOMAIN_MAP: Record<InfrastructureType, CriticalInfraDomain> = {
  Dam: "Fluid Systems",
  "Power Plant": "Enegy & Oil",
  Port: "Transport",
  Airport: "Transport",
};

const STRATEGIC_ASSET_MERGE_SOURCE =
  "Merged strategic asset registry (integrated into critical infrastructure domains)";

const STRATEGIC_ASSETS_AS_CRITICAL: GovInfrastructurePoint[] = INFRA_ASSETS.map((asset) => ({
  id: `strategic-${asset.id}`,
  layer: "industry",
  domain: STRATEGIC_ASSET_DOMAIN_MAP[asset.type],
  name: asset.name,
  category: asset.type,
  status: asset.status,
  region: asset.island,
  province: asset.region,
  municipality: asset.region,
  contractor: "N/A",
  year: null,
  cost: null,
  lat: asset.lat,
  lon: asset.lon,
  note: asset.note,
  source: STRATEGIC_ASSET_MERGE_SOURCE,
}));

const isApproxSamePoint = (a: GovInfrastructurePoint, b: GovInfrastructurePoint) =>
  Math.abs(a.lat - b.lat) < 0.03 && Math.abs(a.lon - b.lon) < 0.03;

const STRATEGIC_ASSETS_AS_CRITICAL_DEDUPED = STRATEGIC_ASSETS_AS_CRITICAL.filter(
  (candidate) =>
    !HIGH_VALUE_INFRASTRUCTURE.some(
      (existing) =>
        existing.domain === candidate.domain &&
        isApproxSamePoint(existing, candidate)
    )
);

const CRITICAL_INFRASTRUCTURE_POINTS: GovInfrastructurePoint[] = [
  ...HIGH_VALUE_INFRASTRUCTURE,
  ...STRATEGIC_ASSETS_AS_CRITICAL_DEDUPED,
];

const DEFAULT_INFRA_FILTER_VISIBILITY: Record<InfraFilterLayerId, boolean> = {
  military: true,
  ...CRITICAL_DOMAIN_ORDER.reduce(
    (acc, domain) => ({ ...acc, [domain]: true }),
    {} as Record<CriticalInfraDomain, boolean>
  ),
};

const CLEARED_INFRA_FILTER_VISIBILITY: Record<InfraFilterLayerId, boolean> = {
  military: false,
  ...CRITICAL_DOMAIN_ORDER.reduce(
    (acc, domain) => ({ ...acc, [domain]: false }),
    {} as Record<CriticalInfraDomain, boolean>
  ),
};

const normalizeGeoName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const provinceMatches = (pointProvince: string, selectedProvince: string) => {
  const point = normalizeGeoName(pointProvince);
  const province = normalizeGeoName(selectedProvince);
  return point === province || point.includes(province) || province.includes(point);
};

function InfrastructureIntelligence() {
  const [selectedGovPoint, setSelectedGovPoint] = useState<GovInfrastructurePoint | null>(null);
  const [activeProvinceId, setActiveProvinceId] = useState<string | null>(null);
  const [hoveredProvinceId, setHoveredProvinceId] = useState<string | null>(null);
  const [c2FilterEnabled, setC2FilterEnabled] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [beaconMode, setBeaconMode] = useState<"compressed" | "expanded">("expanded");
  const [layerVisibility, setLayerVisibility] = useState<Record<InfraFilterLayerId, boolean>>(
    DEFAULT_INFRA_FILTER_VISIBILITY
  );
  const [govLayerState, setGovLayerState] = useState<"loading" | "ready" | "error">("loading");
  const [mapZoom, setMapZoom] = useState(INFRA_DEFAULT_ZOOM);
  const [selectedRegionCenter, setSelectedRegionCenter] = useState<[number, number] | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading");

  const beaconModeRef = useRef<"compressed" | "expanded">("expanded");
  const mapStageRef = useRef<HTMLDivElement | null>(null);
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const provinceShapeRefs = useRef<Record<string, any>>({});
  const provinceMetaRef = useRef<Record<string, ProvinceBoundaryFeature>>({});
  const govLayerRefs = useRef<Record<GovInfraLayerId, any>>({ military: null, industry: null });
  const govPointsByLayerRef = useRef<Record<GovInfraLayerId, GovInfrastructurePoint[]>>({
    military: MILITARY_FACILITIES,
    industry: CRITICAL_INFRASTRUCTURE_POINTS,
  });
  const govMarkersByLayerRef = useRef<Record<GovInfraLayerId, any[]>>({ military: [], industry: [] });
  const govMarkersRef = useRef<Record<string, any>>({});
  const selectedGovKeyRef = useRef<string | null>(null);
  const suppressAutoFocusOnNextSelectionSyncRef = useRef(false);

  const criticalDomainCounts = useMemo(() => {
    const counts = CRITICAL_DOMAIN_GROUPS.reduce((acc, item) => {
      acc[item.domain] = 0;
      return acc;
    }, {} as Record<CriticalInfraDomain, number>);
    CRITICAL_INFRASTRUCTURE_POINTS.forEach((point) => {
      if (point.domain) {
        counts[point.domain] += 1;
      }
    });
    return counts;
  }, []);

  const visibleCriticalCount = useMemo(
    () =>
      CRITICAL_INFRASTRUCTURE_POINTS.filter(
        (point) =>
          point.domain &&
          layerVisibility[point.domain]
      ).length,
    [layerVisibility]
  );

  const totalLivePoints = (layerVisibility.military ? MILITARY_FACILITIES.length : 0) + visibleCriticalCount;

  const selectedGovDomain: CriticalInfrastructureDomain | null = selectedGovPoint
    ? selectedGovPoint.layer === "military"
      ? "Defense facilities"
      : selectedGovPoint.domain ?? null
    : null;

  const selectedLayerLabel = selectedGovPoint ? GOV_INFRA_LAYER_META[selectedGovPoint.layer].label : "Region";
  const selectedLayerColor = selectedGovPoint
    ? selectedGovPoint.layer === "industry" && selectedGovPoint.domain
      ? CRITICAL_DOMAIN_COLORS[selectedGovPoint.domain] ?? GOV_INFRA_LAYER_META.industry.color
      : GOV_INFRA_LAYER_META[selectedGovPoint.layer].color
    : "rgba(148,163,184,0.95)";

  const selectedProvince = activeProvinceId ? provinceMetaRef.current[activeProvinceId] ?? null : null;
  const selectedProvinceStats = useMemo(() => {
    if (!selectedProvince?.name) return null;
    const criticalInProvince = CRITICAL_INFRASTRUCTURE_POINTS.filter((point) =>
      provinceMatches(point.province, selectedProvince.name)
    );
    const militaryInProvince = MILITARY_FACILITIES.filter((point) =>
      provinceMatches(point.province, selectedProvince.name)
    );
    const domainCounts = CRITICAL_DOMAIN_ORDER.map((domain) => ({
      domain,
      count: criticalInProvince.filter((point) => point.domain === domain).length,
    })).filter((entry) => entry.count > 0);
    return {
      criticalCount: criticalInProvince.length,
      militaryCount: militaryInProvince.length,
      topDomains: domainCounts.slice(0, 5),
    };
  }, [selectedProvince?.name]);

  const selectedTitle = selectedGovPoint?.name ?? selectedProvince?.name ?? "No Active Selection";
  const selectedMeta = selectedGovPoint
    ? [selectedLayerLabel, selectedGovDomain, selectedGovPoint.category, selectedGovPoint.province, selectedGovPoint.region].filter(
        (entry): entry is string => Boolean(entry)
      )
    : selectedProvince
      ? [selectedProvince.geoLevel === "Dist" ? "District" : "Province", "Regional Selection"]
      : ["Awaiting selection"];

  const selectedPrimaryLabel = selectedGovPoint
    ? "DOMAIN"
    : selectedProvince
      ? "CRITICAL POINTS"
      : "STATUS";
  const selectedPrimaryValue = selectedGovPoint
    ? selectedGovDomain ?? "N/A"
    : selectedProvinceStats
      ? String(selectedProvinceStats.criticalCount)
      : "Select a beacon or region";

  const selectedSecondaryLabel = selectedGovPoint
    ? "STATUS"
    : selectedProvince
      ? "MILITARY POINTS"
      : "ACTIVE FILTERS";
  const selectedSecondaryValue = selectedGovPoint
    ? selectedGovPoint.status
    : selectedProvinceStats
      ? String(selectedProvinceStats.militaryCount)
      : String((layerVisibility.military ? 1 : 0) + CRITICAL_DOMAIN_ORDER.filter((domain) => layerVisibility[domain]).length);

  const selectedSummary = selectedGovPoint
    ? selectedGovPoint.note
    : selectedProvince
      ? "Province boundary selected. Counts summarize mapped military and critical infrastructure points in this region."
      : "Select a beacon for infrastructure detail, or click a province boundary for regional detail.";

  const selectedSource = selectedGovPoint
    ? selectedGovPoint.source
    : selectedProvince
      ? "Province boundary overlays and mapped infrastructure registry"
      : "N/A";

  const selectedLocation = selectedGovPoint
    ? `${selectedGovPoint.municipality}, ${selectedGovPoint.province}`
    : selectedProvince
      ? selectedProvince.name
      : "N/A";

  const selectedCoordinates = selectedGovPoint
    ? `${selectedGovPoint.lat.toFixed(4)}, ${selectedGovPoint.lon.toFixed(4)}`
    : selectedRegionCenter
      ? `${selectedRegionCenter[0].toFixed(4)}, ${selectedRegionCenter[1].toFixed(4)}`
      : "N/A";

  const selectedOperator = selectedGovPoint
    ? selectedGovPoint.contractor ?? "N/A"
    : selectedProvince
      ? "Regional governance and response offices"
      : "N/A";

  const selectedYear = selectedGovPoint?.year ? String(selectedGovPoint.year) : "N/A";
  const activeZoomLevelIndex = nearestZoomLevelIndex(mapZoom);
  const disableProvinceHover = activeZoomLevelIndex >= INFRA_LEVEL3_INDEX;

  useEffect(() => {
    beaconModeRef.current = beaconMode;
  }, [beaconMode]);

  const loadLeaflet = async () => {
    const win = window as Window & { L?: any };
    const injectStyle = (id: string, href: string) => {
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    };
    const injectScript = (id: string, src: string, errorText: string, validate: () => boolean) =>
      new Promise<void>((resolve, reject) => {
        if (validate()) {
          resolve();
          return;
        }
        const existing = document.getElementById(id) as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error(errorText)), { once: true });
          return;
        }
        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(errorText));
        document.head.appendChild(script);
      });

    injectStyle("sdemo-leaflet-css", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
    await injectScript(
      "sdemo-leaflet-js",
      "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
      "Leaflet failed to load",
      () => Boolean(win.L)
    );

    if (!win.L) throw new Error("Leaflet unavailable");

    injectStyle("sdemo-markercluster-css", "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css");
    injectStyle("sdemo-markercluster-default-css", "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css");
    await injectScript(
      "sdemo-markercluster-js",
      "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js",
      "Leaflet marker cluster failed to load",
      () => Boolean((win.L as any)?.markerClusterGroup)
    );

    return win.L;
  };

  useEffect(() => {
    let alive = true;
    const abortController = new AbortController();

    const initMap = async () => {
      try {
        const L = await loadLeaflet();
        if (!alive || !mapHostRef.current) return;
        leafletRef.current = L;

        const map = L.map(mapHostRef.current, {
          zoomControl: false,
          attributionControl: false,
          minZoom: INFRA_MIN_ZOOM,
          maxZoom: INFRA_MAX_ZOOM,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          touchZoom: false,
          preferCanvas: true,
        }).setView(INFRA_DEFAULT_CENTER, INFRA_DEFAULT_ZOOM);

        mapInstanceRef.current = map;
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          maxZoom: 19,
          attribution: "Imagery &copy; Esri",
          // Keep previous tiles visible while zooming to avoid white flashes.
          updateWhenZooming: false,
          updateWhenIdle: true,
          keepBuffer: 6,
        }).addTo(map);

        const provinceLayer = L.layerGroup();
        const provinceShapes: Record<string, any> = {};
        const provinceMeta: Record<string, ProvinceBoundaryFeature> = {};
        const attachProvinceLayer = (boundary: ProvinceBoundaryFeature, layer: any) => {
          layer.on("mouseover", () => {
            if (isProvinceHoverDisabledAtZoom(map.getZoom())) return;
            setHoveredProvinceId(boundary.id);
          });
          layer.on("mouseout", () => setHoveredProvinceId((current) => (current === boundary.id ? null : current)));
          layer.on("click", (event: any) => {
            event?.originalEvent?.stopPropagation?.();
            setSelectedGovPoint(null);
            setHoveredProvinceId(null);
            setActiveProvinceId(boundary.id);
            const bounds = typeof layer.getBounds === "function" ? layer.getBounds() : null;
            if (bounds?.isValid?.()) {
              const center = bounds.getCenter();
              setSelectedRegionCenter([center.lat, center.lng]);
              if (!isProvinceHoverDisabledAtZoom(map.getZoom())) {
                map.flyTo(center, Math.max(map.getZoom(), INFRA_DEFAULT_ZOOM), { duration: 0.55 });
              }
            }
          });

          layer.addTo(provinceLayer);
          provinceShapes[boundary.id] = layer;
          provinceMeta[boundary.id] = boundary;
        };

        try {
          const detailedFeatures = await loadPhilippineProvinceBoundaryFeatures(abortController.signal);
          if (detailedFeatures.length === 0) throw new Error("No detailed province features loaded");

          detailedFeatures.forEach((boundary) => {
            const layer = L.geoJSON(boundary.feature, {
              style: provincePolygonStyle(boundary.id === activeProvinceId, false),
              interactive: true,
            });
            attachProvinceLayer(boundary, layer);
          });
        } catch {
          // No fallback geometry: when remote boundary fetch fails, keep map operational without province overlays.
        }

        provinceLayer.addTo(map);
        provinceShapeRefs.current = provinceShapes;
        provinceMetaRef.current = provinceMeta;
        map.on("click", () => {
          setSelectedGovPoint(null);
          setActiveProvinceId(null);
          setHoveredProvinceId(null);
          setSelectedRegionCenter(null);
        });

        govPointsByLayerRef.current = {
          military: MILITARY_FACILITIES,
          industry: CRITICAL_INFRASTRUCTURE_POINTS,
        };

        const syncTelemetry = () => {
          if (!alive) return;
          setMapZoom(map.getZoom());
        };
        map.on("zoomend", syncTelemetry);
        syncTelemetry();

        setMapState("ready");
        setGovLayerState("ready");
      } catch {
        if (!alive) return;
        setMapState("error");
        setGovLayerState("error");
      }
    };

    initMap();
    return () => {
      alive = false;
      abortController.abort();
      selectedGovKeyRef.current = null;
      leafletRef.current = null;
      govPointsByLayerRef.current = { military: MILITARY_FACILITIES, industry: CRITICAL_INFRASTRUCTURE_POINTS };
      govMarkersByLayerRef.current = { military: [], industry: [] };
      govMarkersRef.current = {};
      govLayerRefs.current = { military: null, industry: null };
      provinceShapeRefs.current = {};
      provinceMetaRef.current = {};
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapState !== "ready" || !trackingEnabled) return;
    const map = mapInstanceRef.current;
    if (!map || typeof map.getContainer !== "function") return;
    const container = map.getContainer() as HTMLElement | null;
    if (!container) return;

    let pointer = { x: 0, y: 0 };
    let pointerInside = false;
    let pointerButtonDown = false;
    let pointerDraggingMap = false;
    let rafId: number | null = null;
    let lastFrameTs: number | null = null;

    const stopLoop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastFrameTs = null;
    };

    const edgeVelocity = (position: number, axisSize: number) => {
      if (axisSize <= 0) return 0;
      const threshold = Math.min(INFRA_EDGE_PAN_THRESHOLD_PX, axisSize / 2);
      if (threshold <= 0) return 0;

      if (position < threshold) {
        const intensity = (threshold - position) / threshold;
        return -(INFRA_EDGE_PAN_MAX_SPEED_PX_PER_SECOND * intensity * intensity);
      }
      if (position > axisSize - threshold) {
        const intensity = (position - (axisSize - threshold)) / threshold;
        return INFRA_EDGE_PAN_MAX_SPEED_PX_PER_SECOND * intensity * intensity;
      }
      return 0;
    };

    const step = (timestamp: number) => {
      if (!pointerInside || !container.isConnected) {
        stopLoop();
        return;
      }

      const rect = container.getBoundingClientRect();
      const velocityX = edgeVelocity(pointer.x, rect.width);
      const velocityY = edgeVelocity(pointer.y, rect.height);
      const shouldPan =
        (velocityX !== 0 || velocityY !== 0) &&
        !pointerButtonDown &&
        !pointerDraggingMap;

      if (!shouldPan) {
        stopLoop();
        return;
      }

      const dtSeconds =
        lastFrameTs === null
          ? 1 / 60
          : Math.min((timestamp - lastFrameTs) / 1000, 0.05);
      lastFrameTs = timestamp;

      map.panBy([velocityX * dtSeconds, velocityY * dtSeconds], {
        animate: false,
        noMoveStart: true,
      });

      rafId = window.requestAnimationFrame(step);
    };

    const startLoop = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(step);
    };

    const updatePointer = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer = {
        x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
        y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
      };
    };

    const handleMouseEnter = (event: MouseEvent) => {
      pointerInside = true;
      updatePointer(event);
      startLoop();
    };

    const handleMouseMove = (event: MouseEvent) => {
      pointerInside = true;
      updatePointer(event);
      startLoop();
    };

    const handleMouseLeave = () => {
      pointerInside = false;
      stopLoop();
    };

    const handleMouseDown = () => {
      pointerButtonDown = true;
      stopLoop();
    };

    const handleMouseUp = () => {
      pointerButtonDown = false;
      if (pointerInside && !pointerDraggingMap) startLoop();
    };

    const handleDragStart = () => {
      pointerDraggingMap = true;
      stopLoop();
    };

    const handleDragEnd = () => {
      pointerDraggingMap = false;
      if (pointerInside && !pointerButtonDown) startLoop();
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleMouseLeave);

    map.on("dragstart", handleDragStart);
    map.on("dragend", handleDragEnd);

    return () => {
      stopLoop();
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleMouseLeave);
      map.off("dragstart", handleDragStart);
      map.off("dragend", handleDragEnd);
    };
  }, [mapState, trackingEnabled]);

  useEffect(() => {
    if (mapState !== "ready" || govLayerState !== "ready") return;
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    const compressed = beaconMode === "compressed";
    const nextGovLayers: Record<GovInfraLayerId, any> = {
      military: createInfraBeaconLayer(L, compressed),
      industry: createInfraBeaconLayer(L, compressed),
    };
    const nextGovMarkersByLayer: Record<GovInfraLayerId, any[]> = { military: [], industry: [] };
    const nextGovMarkers: Record<string, any> = {};

    const activeCriticalDomains = new Set(
      CRITICAL_DOMAIN_ORDER.filter((domain) => layerVisibility[domain])
    );
    const visiblePointsByLayer: Record<GovInfraLayerId, GovInfrastructurePoint[]> = {
      military: layerVisibility.military ? govPointsByLayerRef.current.military : [],
      industry: govPointsByLayerRef.current.industry.filter(
        (point) =>
          point.domain &&
          activeCriticalDomains.has(point.domain)
      ),
    };

    const onSelectPoint = (selectedPoint: GovInfrastructurePoint) => {
      setActiveProvinceId(null);
      setHoveredProvinceId(null);
      setSelectedRegionCenter([selectedPoint.lat, selectedPoint.lon]);
      setSelectedGovPoint(selectedPoint);
    };

    (["military", "industry"] as GovInfraLayerId[]).forEach((layerId) => {
      visiblePointsByLayer[layerId].forEach((point) => {
        const marker = buildGovPointMarker(L, point, onSelectPoint);
        const markerKey = `${layerId}:${point.id}`;
        nextGovMarkersByLayer[layerId].push(marker);
        nextGovMarkers[markerKey] = marker;
      });
      populateInfraLayer(nextGovLayers[layerId], nextGovMarkersByLayer[layerId]);
    });

    (["military", "industry"] as GovInfraLayerId[]).forEach((layerId) => {
      const currentLayer = govLayerRefs.current[layerId];
      if (currentLayer && map.hasLayer(currentLayer)) {
        map.removeLayer(currentLayer);
      }
      if (nextGovMarkersByLayer[layerId].length > 0) {
        map.addLayer(nextGovLayers[layerId]);
      }
    });

    govLayerRefs.current = nextGovLayers;
    govMarkersByLayerRef.current = nextGovMarkersByLayer;
    govMarkersRef.current = nextGovMarkers;
    selectedGovKeyRef.current = null;
  }, [beaconMode, layerVisibility, mapState, govLayerState]);

  useEffect(() => {
    if (mapState !== "ready") return;
    applyProvinceLayerStyles(
      provinceShapeRefs.current,
      activeProvinceId,
      disableProvinceHover ? null : hoveredProvinceId
    );
  }, [mapState, activeProvinceId, hoveredProvinceId, disableProvinceHover]);

  useEffect(() => {
    if (!disableProvinceHover) return;
    if (hoveredProvinceId !== null) setHoveredProvinceId(null);
  }, [disableProvinceHover, hoveredProvinceId]);

  useEffect(() => {
    if (!selectedGovPoint) return;
    if (selectedGovPoint.layer === "military") {
      if (!layerVisibility.military) {
        setSelectedGovPoint(null);
      }
      return;
    }
    const selectedDomain = selectedGovPoint.domain;
    if (
      !selectedDomain ||
      !layerVisibility[selectedDomain as CriticalInfraDomain]
    ) {
      setSelectedGovPoint(null);
    }
  }, [layerVisibility, selectedGovPoint]);

  useEffect(() => {
    const applyMarkerVisual = (marker: any, active: boolean) => {
      if (!marker) return;
      const markerIcons = (marker as any).__infraIcons;
      if (!markerIcons) return;
      if (typeof marker.setIcon === "function") {
        marker.setIcon(active ? markerIcons.active : markerIcons.base);
      }
    };

    const previousKey = selectedGovKeyRef.current;
    if (previousKey) {
      const previousMarker = govMarkersRef.current[previousKey];
      applyMarkerVisual(previousMarker, false);
    }

    if (!selectedGovPoint) {
      selectedGovKeyRef.current = null;
      suppressAutoFocusOnNextSelectionSyncRef.current = false;
      return;
    }

    const markerKey = `${selectedGovPoint.layer}:${selectedGovPoint.id}`;
    const marker = govMarkersRef.current[markerKey];
    if (!marker) {
      selectedGovKeyRef.current = null;
      return;
    }

    applyMarkerVisual(marker, true);
    selectedGovKeyRef.current = markerKey;

    if (suppressAutoFocusOnNextSelectionSyncRef.current) {
      suppressAutoFocusOnNextSelectionSyncRef.current = false;
      return;
    }

    const layerGroup = govLayerRefs.current[selectedGovPoint.layer];
    if (layerGroup?.zoomToShowLayer) {
      layerGroup.zoomToShowLayer(marker, () => marker.openTooltip());
      return;
    }

    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(
      [selectedGovPoint.lat, selectedGovPoint.lon],
      INFRA_ZOOM_LEVELS[nearestZoomLevelIndex(Math.max(map.getZoom(), 10))].zoom,
      { duration: 0.9 }
    );
  }, [selectedGovPoint, beaconMode, layerVisibility, mapState, govLayerState]);

  const resetViewport = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const defaultPoint = MILITARY_FACILITIES[0] ?? CRITICAL_INFRASTRUCTURE_POINTS[0] ?? null;
    map.setView(INFRA_DEFAULT_CENTER, INFRA_DEFAULT_ZOOM, { animate: true, duration: 0.8 });
    setLayerVisibility({ ...DEFAULT_INFRA_FILTER_VISIBILITY });
    setHoveredProvinceId(null);
    setActiveProvinceId(null);
    setSelectedGovPoint(defaultPoint);
    setSelectedRegionCenter(defaultPoint ? [defaultPoint.lat, defaultPoint.lon] : null);
  };

  const setZoomLevel = (index: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const clamped = Math.max(0, Math.min(INFRA_ZOOM_LEVELS.length - 1, index));
    const nextZoom = INFRA_ZOOM_LEVELS[clamped].zoom;
    if (selectedGovPoint) {
      map.setView([selectedGovPoint.lat, selectedGovPoint.lon], nextZoom, { animate: true });
      return;
    }
    map.setZoom(nextZoom, { animate: true });
  };

  const changeZoomLevelBy = (step: number) => {
    setZoomLevel(activeZoomLevelIndex + step);
  };

  const toggleLayer = (layer: InfraFilterLayerId) => {
    setLayerVisibility((prev) => ({ ...prev, [layer]: !(prev[layer] ?? false) }));
  };

  const clearFilters = () => {
    setLayerVisibility(CLEARED_INFRA_FILTER_VISIBILITY);
    setSelectedGovPoint(null);
    setSelectedRegionCenter(null);
  };

  return (
    <div className="sw-panel infra-panel">
      <div className="infra-topbar">
        <div className="sw-mono infra-topbar-title">PHILIPPINE STRATEGIC INFRASTRUCTURE INTELLIGENCE</div>
        <div className="infra-topbar-center">
          {mapState === "ready" && (
            <div className="infra-map-zoom-simple" role="group" aria-label="Map zoom control">
              <button
                type="button"
                className="infra-map-zoom-btn"
                onClick={() => changeZoomLevelBy(-1)}
                aria-label="Decrease zoom level"
              >
                -
              </button>
              <input
                type="range"
                className="infra-map-zoom-slider"
                min={0}
                max={INFRA_ZOOM_LEVELS.length - 1}
                step={1}
                value={activeZoomLevelIndex}
                onChange={(event) => setZoomLevel(Number(event.target.value))}
                aria-label="Set zoom level"
              />
              <button
                type="button"
                className="infra-map-zoom-btn"
                onClick={() => changeZoomLevelBy(1)}
                aria-label="Increase zoom level"
              >
                +
              </button>
              <span className="sw-mono infra-map-zoom-level">
                {INFRA_ZOOM_LEVELS[activeZoomLevelIndex].label}
              </span>
            </div>
          )}
        </div>
        <div className="infra-zoom-controls">
          <button
            type="button"
            className={`infra-tracking-toggle${trackingEnabled ? " active" : ""}`}
            onClick={() => setTrackingEnabled((prev) => !prev)}
            aria-label="Toggle cursor edge tracking auto pan"
          >
            {trackingEnabled ? "TRACKING ON" : "TRACKING OFF"}
          </button>
          <button
            type="button"
            className={`infra-filter-toggle${c2FilterEnabled ? " active" : ""}`}
            onClick={() => setC2FilterEnabled((prev) => !prev)}
            aria-label="Toggle tactical command filter"
          >
            {c2FilterEnabled ? "C2 ON" : "C2 OFF"}
          </button>
          <button
            type="button"
            className={`infra-beacon-toggle${beaconMode === "compressed" ? " active" : ""}`}
            onClick={() => {
              suppressAutoFocusOnNextSelectionSyncRef.current = true;
              setBeaconMode((prev) => (prev === "compressed" ? "expanded" : "compressed"));
            }}
            aria-label="Toggle beacon compression"
          >
            {beaconMode === "compressed" ? "COMPRESSED" : "EXPANDED"}
          </button>
          <button type="button" onClick={clearFilters} className="infra-clear-filters">Clear filters</button>
          <button type="button" onClick={resetViewport} className="infra-reset">Reset</button>
        </div>
      </div>

      <div className="infra-layout">
        <aside className="infra-details-panel">
          <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", letterSpacing: "0.18em", marginBottom: "0.4rem" }}>
            SELECTION_DETAILS
          </div>
          <h3 className="infra-title">{selectedTitle}</h3>
          <div className="infra-meta-line">
            <span style={{ color: selectedLayerColor }}>{selectedLayerLabel}</span>
            {selectedMeta.map((entry) => (
              <span key={entry}>{entry}</span>
            ))}
          </div>

          <div className="infra-stats-grid">
            <div>
              <div className="sw-mono sw-dim infra-k">{selectedPrimaryLabel}</div>
              <div className="infra-v">{selectedPrimaryValue}</div>
            </div>
            <div>
              <div className="sw-mono sw-dim infra-k">{selectedSecondaryLabel}</div>
              <div className="infra-v">{selectedSecondaryValue}</div>
            </div>
          </div>

          <p className="infra-note">{selectedSummary}</p>
          <div className="sw-mono sw-dim infra-source-tag">SOURCE: {selectedSource}</div>

          <div className="infra-detail-grid">
            <div>
              <div className="sw-mono sw-dim infra-k">LOCATION</div>
              <div className="infra-v">{selectedLocation}</div>
            </div>
            <div>
              <div className="sw-mono sw-dim infra-k">COORDINATES</div>
              <div className="infra-v">{selectedCoordinates}</div>
            </div>
            <div>
              <div className="sw-mono sw-dim infra-k">OPERATOR</div>
              <div className="infra-v">{selectedOperator}</div>
            </div>
            <div>
              <div className="sw-mono sw-dim infra-k">PROGRAM YEAR</div>
              <div className="infra-v">{selectedYear}</div>
            </div>
          </div>

          {selectedProvinceStats?.topDomains?.length ? (
            <div className="infra-region-breakdown">
              <div className="sw-mono sw-dim" style={{ fontSize: "0.54rem", letterSpacing: "0.14em" }}>
                REGION DOMAIN BREAKDOWN
              </div>
              <div className="infra-domain-tags">
                {selectedProvinceStats.topDomains.map((entry) => (
                  <div key={entry.domain} className="infra-domain-tag">
                    <span>{entry.domain}</span>
                    <span className="sw-mono">{entry.count.toLocaleString("en-US")}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div
          ref={mapStageRef}
          className={`infra-map-stage crosshair-enabled${c2FilterEnabled ? " infra-map-stage-c2" : ""}`}
        >
          <div ref={mapHostRef} className="infra-leaflet-map" />
          <Crosshair color="var(--sdemo-crosshair-color, rgba(255,255,255,0.86))" containerRef={mapStageRef} />
          {mapState === "ready" && (
            <div className={`infra-gov-chip ${govLayerState}`}>
              <span className="sw-mono">
                {govLayerState === "loading" && "Loading government layers..."}
                {govLayerState === "ready" && `${totalLivePoints.toLocaleString("en-US")} GOVERNMENT POINTS LIVE`}
                {govLayerState === "error" && "Government dataset unavailable"}
              </span>
            </div>
          )}
          {mapState !== "ready" && (
            <div className="infra-map-overlay">
              <span className="sw-mono infra-map-label">
                {mapState === "error" ? "Map unavailable" : "Loading satellite map..."}
              </span>
            </div>
          )}
        </div>

        <aside className="infra-filters-panel">
          <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", letterSpacing: "0.18em" }}>
            MAP_LAYERS
          </div>
          <div className="infra-layer-list">
            <label className={`infra-layer-item${layerVisibility.military ? " active" : ""}`}>
              <input
                className="infra-layer-toggle"
                type="checkbox"
                checked={Boolean(layerVisibility.military)}
                onChange={() => toggleLayer("military")}
                aria-label="Toggle Military layer"
                style={{ "--infra-layer-color": GOV_INFRA_LAYER_META.military.color } as any}
              />
              <span className="infra-layer-copy">
                <span className="infra-layer-text">{GOV_INFRA_LAYER_META.military.label}</span>
              </span>
              <span className="sw-mono infra-layer-count">{MILITARY_FACILITIES.length.toLocaleString("en-US")}</span>
            </label>

            {CRITICAL_DOMAIN_GROUPS.map((group) => (
              <label
                key={group.domain}
                className={`infra-layer-item${layerVisibility[group.domain] ? " active" : ""}`}
              >
                <input
                  className="infra-layer-toggle"
                  type="checkbox"
                  checked={Boolean(layerVisibility[group.domain])}
                  onChange={() => toggleLayer(group.domain)}
                  aria-label={`Toggle ${group.domain} layer`}
                  style={{ "--infra-layer-color": CRITICAL_DOMAIN_COLORS[group.domain] } as any}
                />
                <span className="infra-layer-copy">
                  <span className="infra-layer-text">{group.domain}</span>
                </span>
                <span className="sw-mono infra-layer-count">
                  {(criticalDomainCounts[group.domain] ?? 0).toLocaleString("en-US")}
                </span>
              </label>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function CommandControlBlank() {
  return <div className="sw-panel blank-panel" />;
}

function LearnMoreCard() {
  return (
    <div className="sw-panel learn-panel">
      <div className="learn-halo" />
      <div className="learn-shell">
        <div className="sw-mono learn-kicker">NEXT STEP</div>
        <h3 className="learn-title">Learn more</h3>
        <p className="learn-desc">
          Explore the full Notus Regalia platform and discover how coordinated software can unify fragmented agencies,
          infrastructure intelligence, and crisis command operations.
        </p>
        <div className="learn-actions">
          <a href="#services" className="learn-btn">Explore Services</a>
          <a href="#contact" className="learn-btn learn-btn-ghost">Request Briefing</a>
        </div>
      </div>
    </div>
  );
}

const SOFTWARES = [
  {
    id: "government", tag: "01", name: "Government Systems", industry: "Public Sector",
    tagline: "Unified Government Services Framework",
    desc: "A coordinated national services framework for the Philippines, built to eliminate fragmented agency workflows and deliver seamless citizen service.",
    status: "LIVE",
    uptime: "99.98%",
    component: CommandControl,
  },
  {
    id: "infrastructure", tag: "02", name: "Infrastructure Intelligence", industry: "National Infrastructure",
    tagline: "Nationwide Government Infrastructure Layers",
    desc: "Satellite-grade Philippine map with coordinate-level beacons for Enegy & Oil, Fluid Systems, Transport, Telecommunications, Healthcare, Bank & Finance, Food & agriculture, Government, Defense facilities, Data Center, and Aerospace.",
    status: "MAPPED",
    uptime: "99.91%",
    component: InfrastructureIntelligence,
  },
  {
    id: "command", tag: "03", name: "Command & Control", industry: "Coordination",
    tagline: "Reserved Command Surface",
    desc: "",
    status: "PENDING",
    uptime: "--",
    component: CommandControlBlank,
  },
  {
    id: "learn", tag: "04", name: "Learn more", industry: "Overview",
    tagline: "Expand the Strategic Platform",
    desc: "Access deeper implementation pathways, deployment models, and strategic integration options.",
    status: "INFO",
    uptime: "N/A",
    component: LearnMoreCard,
  },
];

export default function SoftwareDemo() {
  const [active, setActive]       = useState(0);
  const [transitioning, setTrans] = useState(false);
  const [direction, setDir]       = useState("next");
  const [revealed, setRevealed]   = useState(false);
  const sectionRef                = useRef<HTMLDivElement | null>(null);

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

  const goto = useCallback((i) => {
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
        @keyframes infraPulseRing {
          0% { transform:scale(var(--infra-pulse-from, 0.84)); opacity:0.72; }
          75% { transform:scale(var(--infra-pulse-to, 1.72)); opacity:0; }
          100% { transform:scale(var(--infra-pulse-to, 1.72)); opacity:0; }
        }
        @keyframes infraGlowBreath {
          0%,100% { filter:brightness(1); }
          50% { filter:brightness(1.22); }
        }
        @keyframes infraTooltipGlow {
          0%,100% { box-shadow:0 0 0 1px rgba(148,163,184,0.3), 0 10px 24px rgba(2,6,23,0.56), 0 0 10px var(--infra-tooltip-glow, rgba(34,211,238,0.2)); }
          50% { box-shadow:0 0 0 1px rgba(148,163,184,0.52), 0 10px 24px rgba(2,6,23,0.62), 0 0 18px var(--infra-tooltip-glow, rgba(34,211,238,0.34)); }
        }

        .sdemo-root {
          background: var(--gradient-section, #06060e);
          border-top: 1px dashed rgba(255,255,255,0.08);
          color: #fff;
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          overflow: hidden;
          position: relative;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .sdemo-root.revealed { opacity: 1; transform: translateY(0); }
        :root.light .sdemo-root { background: #f4f5f8; border-top: 1px dashed rgba(0,0,0,0.1); color: #0f172a; }
        .sdemo-crosshair-layer {
          position:absolute;
          inset:0;
          z-index:10000;
          pointer-events:none;
        }
        .sdemo-crosshair-svg {
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
        }
        .sdemo-crosshair-line {
          position:absolute;
          opacity:0;
          pointer-events:none;
          will-change:transform, opacity;
        }
        .sdemo-crosshair-line-horizontal {
          top:0;
          left:0;
          width:100%;
          height:1px;
          transform:translateY(-50%);
        }
        .sdemo-crosshair-line-vertical {
          top:0;
          left:0;
          width:1px;
          height:100%;
          transform:translateX(-50%);
        }

        .sdemo-inner {
          padding: 5rem 2rem 6rem;
        }
        @media(min-width:640px){.sdemo-inner{padding:5rem 4rem 6rem;}}
        @media(min-width:768px){.sdemo-inner{padding:6rem 6rem 7rem;}}
        @media(min-width:1024px){.sdemo-inner{padding:6rem 6rem 7rem;}}
        @media(min-width:1280px){.sdemo-inner{padding:7rem 8rem 8rem;}}
        @media(min-width:1536px){.sdemo-inner{padding:7rem 12rem 8rem;}}
        @media(min-width:1920px){.sdemo-inner{padding:7rem 16rem 8rem;}}

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

        .sdemo-tabs {
          display:grid;
          grid-template-columns:repeat(4,minmax(180px,1fr));
          gap:0.8rem;
          margin-bottom:2rem;
          overflow-x:auto;
          scrollbar-width:none;
        }
        @media(max-width:960px){
          .sdemo-tabs {
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:0.65rem;
            overflow-x:visible;
          }
        }
        .sdemo-tabs::-webkit-scrollbar { display:none; }

        .sdemo-tab {
          min-width:210px;
          display:flex;
          flex-direction:column;
          gap:0.28rem;
          padding:0.95rem 1rem;
          border:1px solid rgba(255,255,255,0.09);
          background:linear-gradient(155deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015));
          cursor:pointer;
          text-align:left;
          position:relative;
          transition:all 0.24s cubic-bezier(0.16,1,0.3,1);
          border-radius:10px;
          white-space:normal;
          backdrop-filter: blur(8px);
        }
        @media(max-width:960px){
          .sdemo-tab { min-width:0; }
        }
        .sdemo-tab:hover {
          transform:translateY(-2px);
          border-color:rgba(227,27,84,0.45);
          background:linear-gradient(155deg,rgba(227,27,84,0.14),rgba(227,27,84,0.04));
        }
        .sdemo-tab.active {
          border-color:rgba(227,27,84,0.75);
          background:linear-gradient(155deg,rgba(227,27,84,0.2),rgba(227,27,84,0.06));
          box-shadow:0 14px 34px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.04);
        }
        .sdemo-tab::after {
          content:'';
          position:absolute;
          top:0;
          left:0;
          right:0;
          height:1px;
          background:linear-gradient(90deg,rgba(227,27,84,0),rgba(227,27,84,0.8),rgba(227,27,84,0));
          transform:scaleX(0.2);
          opacity:0;
          transition:all 0.25s ease;
        }
        .sdemo-tab.active::after { transform:scaleX(1); opacity:1; }
        :root.light .sdemo-tab {
          border:1px solid rgba(0,0,0,0.12);
          background:linear-gradient(155deg,rgba(255,255,255,0.75),rgba(255,255,255,0.45));
        }
        :root.light .sdemo-tab:hover {
          border-color:rgba(227,27,84,0.42);
          background:linear-gradient(155deg,rgba(227,27,84,0.12),rgba(227,27,84,0.04));
        }
        :root.light .sdemo-tab.active {
          background:linear-gradient(155deg,rgba(227,27,84,0.17),rgba(227,27,84,0.06));
          box-shadow:0 10px 20px rgba(0,0,0,0.08);
        }

        .sdemo-tab-top {
          display:flex;
          align-items:center;
          justify-content:space-between;
          margin-bottom:0.15rem;
        }

        .sdemo-tab-tag { font-size:0.55rem; letter-spacing:0.18em; color:rgba(255,255,255,0.2); font-weight:700; }
        :root.light .sdemo-tab-tag { color:rgba(0,0,0,0.25); }
        .sdemo-tab.active .sdemo-tab-tag { color:#E31B54; }
        .sdemo-tab-status {
          font-size:0.52rem;
          letter-spacing:0.14em;
          font-weight:700;
          color:#00ffaa;
          background:rgba(0,255,170,0.12);
          border:1px solid rgba(0,255,170,0.28);
          border-radius:999px;
          padding:0.14rem 0.36rem;
        }
        :root.light .sdemo-tab-status {
          color:#047857;
          background:rgba(4,120,87,0.1);
          border:1px solid rgba(4,120,87,0.22);
        }
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
        .sdemo-tab-foot {
          margin-top:0.45rem;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:0.5rem;
        }
        .sdemo-tab-up { font-size:0.53rem; letter-spacing:0.14em; color:rgba(255,255,255,0.34); }
        :root.light .sdemo-tab-up { color:rgba(0,0,0,0.38); }
        .sdemo-tab-open { font-size:0.6rem; color:rgba(255,255,255,0.5); }
        :root.light .sdemo-tab-open { color:rgba(0,0,0,0.45); }

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

        /* ── Viewport — expanded height ── */
        .sdemo-viewport {
          position:relative; border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; overflow:hidden; background:#050510;
          height:680px;
        }
        :root.light .sdemo-viewport { border:1px solid rgba(0,0,0,0.12); background:#eceef3; }
        @media(max-width:640px){ .sdemo-viewport { height:560px; } }

        .sdemo-slide {
          position:absolute; inset:0;
          transition:opacity 0.3s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .sdemo-slide-idle    { opacity:1; transform:translateX(0); }
        .sdemo-slide-out-next{ opacity:0; transform:translateX(-28px); }
        .sdemo-slide-out-prev{ opacity:0; transform:translateX(28px); }

        .sdemo-dots { display:flex; justify-content:center; gap:0.5rem; margin-top:1.25rem; }
        .sdemo-dot {
          width:6px; height:6px; border-radius:999px;
          background:rgba(255,255,255,0.15); border:none; cursor:pointer; padding:0;
          transition:all 0.25s ease;
        }
        .sdemo-dot.active { width:20px; background:#E31B54; }
        :root.light .sdemo-dot { background:rgba(0,0,0,0.15); }
        :root.light .sdemo-dot.active { background:#E31B54; }

        .sw-panel {
          position:absolute; inset:0; display:flex; overflow:hidden;
          font-family:'Inter', ui-sans-serif, system-ui, sans-serif; color:#fff;
        }
        :root.light .sw-panel { color:#0f172a; }
        .sw-mono { font-family:ui-monospace, Menlo, monospace; }
        .sw-dim  { color:rgba(255,255,255,0.35); }
        :root.light .sw-dim { color:rgba(0,0,0,0.38); }

        .scanline {
          position:absolute; width:100%; height:1px;
          background:rgba(227,27,84,0.1); top:0;
          animation:scan 10s linear infinite; z-index:100; pointer-events:none;
        }
        @keyframes scan { from{top:0} to{top:100%} }

        .c2-panel { background:radial-gradient(ellipse at 50% 0%,#130419 0%,#04040a 100%); }
        :root.light .c2-panel { background:#eceef3; }
        .c2-topbar {
          position:absolute;
          top:0;
          left:0;
          right:0;
          z-index:20;
          height:40px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:0 1rem;
          background:linear-gradient(90deg,rgba(0,0,0,0.5),rgba(0,0,0,0.16));
          border-bottom:1px solid rgba(255,255,255,0.08);
        }
        :root.light .c2-topbar {
          background:linear-gradient(90deg,rgba(255,255,255,0.78),rgba(255,255,255,0.5));
          border-bottom:1px solid rgba(0,0,0,0.1);
        }
        .c2-topbar-left { display:flex; align-items:center; gap:0.55rem; font-size:0.57rem; letter-spacing:0.16em; }
        .c2-topbar-right { display:flex; align-items:center; gap:0.8rem; font-size:0.55rem; letter-spacing:0.12em; color:rgba(255,255,255,0.5); }
        :root.light .c2-topbar-right { color:rgba(0,0,0,0.5); }
        .c2-led {
          width:7px; height:7px; border-radius:999px; background:#00ffaa;
          box-shadow:0 0 10px rgba(0,255,170,0.65);
          animation:sdPulse 2s ease-in-out infinite;
        }
        @media(max-width:860px){ .c2-topbar-right span:nth-child(1){display:none;} }
        @media(max-width:640px){ .c2-topbar-right span:nth-child(3){display:none;} }
        .c2-sidebar {
          width:220px; flex-shrink:0; background:rgba(0,0,0,0.45); padding:1.25rem;
          border-right:1px solid rgba(255,255,255,0.07);
          display:flex; flex-direction:column; gap:0.6rem; overflow-y:auto;
          margin-top:40px;
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
          margin-top:40px;
        }
        :root.light .c2-radar { background:linear-gradient(135deg,#e2e5ef 0%,#d5d9e8 100%); }
        .gov-flow-root {
          width:100%;
          height:100%;
          overflow:auto;
          padding:1.2rem;
        }
        .gov-flow-board {
          position:relative;
          width:100%;
          min-width:920px;
          height:100%;
          min-height:560px;
          border:1px solid rgba(255,255,255,0.08);
          border-radius:12px;
          background:
            radial-gradient(1200px 600px at 50% -80%, rgba(227,27,84,0.12), transparent 60%),
            linear-gradient(145deg,rgba(0,0,0,0.45),rgba(0,0,0,0.2));
          overflow:hidden;
        }
        :root.light .gov-flow-board {
          border:1px solid rgba(0,0,0,0.12);
          background:
            radial-gradient(1200px 600px at 50% -80%, rgba(227,27,84,0.08), transparent 60%),
            linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,255,255,0.65));
        }
        .gov-flow-lines {
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          pointer-events:none;
        }
        .gov-stroke {
          fill:none;
          stroke:#E31B54;
          stroke-width:2.6;
          stroke-linecap:round;
          stroke-linejoin:round;
        }
        .gov-stroke-dashed {
          fill:none;
          stroke:#E31B54;
          stroke-width:2.4;
          stroke-dasharray:6 7;
          stroke-linecap:round;
        }
        .gov-dot { fill:#E31B54; filter:drop-shadow(0 0 10px rgba(227,27,84,0.8)); }
        .gov-pill {
          fill:#f6f8ff;
          font-family:ui-monospace, Menlo, monospace;
          font-size:12px;
          font-weight:700;
          letter-spacing:0.12em;
        }
        .gov-card {
          position:absolute;
          width:24%;
          min-width:210px;
          height:34%;
          min-height:180px;
          border:1px solid rgba(255,255,255,0.11);
          border-radius:10px;
          background:linear-gradient(155deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015));
          box-shadow:inset 0 0 0 1px rgba(255,255,255,0.02);
          color:#fff;
          padding:0.85rem 0.95rem;
          text-align:left;
          cursor:pointer;
          transition:all 0.24s cubic-bezier(0.16,1,0.3,1);
        }
        .gov-card:hover {
          transform:translateY(-2px);
          border-color:rgba(227,27,84,0.5);
        }
        .gov-card.active {
          border-color:#E31B54;
          box-shadow:0 0 0 1px rgba(227,27,84,0.35), 0 10px 30px rgba(227,27,84,0.15);
          background:linear-gradient(155deg,rgba(227,27,84,0.15),rgba(227,27,84,0.05));
        }
        :root.light .gov-card {
          color:#0f172a;
          border:1px solid rgba(0,0,0,0.12);
          background:linear-gradient(155deg,rgba(255,255,255,0.78),rgba(255,255,255,0.48));
        }
        :root.light .gov-card.active {
          border-color:rgba(227,27,84,0.7);
          box-shadow:0 0 0 1px rgba(227,27,84,0.3), 0 8px 24px rgba(227,27,84,0.12);
          background:linear-gradient(155deg,rgba(227,27,84,0.13),rgba(227,27,84,0.05));
        }
        .gov-card-head {
          display:flex;
          align-items:center;
          gap:0.45rem;
          font-size:0.74rem;
          letter-spacing:0.09em;
          font-weight:700;
          text-transform:uppercase;
          margin-bottom:0.75rem;
        }
        .gov-card-led {
          width:7px;
          height:7px;
          border-radius:999px;
          background:#E31B54;
          box-shadow:0 0 9px rgba(227,27,84,0.7);
          flex-shrink:0;
        }
        .gov-card-body {
          display:flex;
          flex-direction:column;
          gap:0.45rem;
        }
        .gov-item {
          font-size:0.7rem;
          color:rgba(255,255,255,0.7);
          border-left:2px solid rgba(227,27,84,0.45);
          padding-left:0.4rem;
          line-height:1.25;
        }
        :root.light .gov-item { color:rgba(0,0,0,0.6); border-left:2px solid rgba(227,27,84,0.45); }
        @media(max-width:900px){
          .gov-flow-root { padding:0.8rem; }
          .gov-flow-board { min-width:860px; min-height:520px; }
        }
        @media(max-width:640px){
          .gov-flow-root { padding:0.6rem; }
          .gov-flow-board { min-width:780px; min-height:500px; }
          .gov-card { min-width:180px; min-height:150px; padding:0.65rem 0.72rem; }
          .gov-card-head { font-size:0.62rem; margin-bottom:0.55rem; }
          .gov-item { font-size:0.62rem; }
        }
        .c2-grid {
          position:absolute;
          inset:0;
          background-image:
            linear-gradient(rgba(227,27,84,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(227,27,84,0.08) 1px, transparent 1px);
          background-size:34px 34px;
          opacity:0.35;
          mask-image:radial-gradient(circle at center, black 45%, transparent 92%);
        }
        .radar-ring { position:absolute; border:1px solid rgba(227,27,84,0.18); border-radius:50%; }
        .radar-sweep {
          position:absolute; width:200px; height:200px;
          background:conic-gradient(from 0deg,#E31B54 0%,transparent 35%);
          top:50%; left:50%; transform-origin:top left;
          animation:sweep 4s linear infinite; opacity:0.22;
        }
        @keyframes sweep { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .c2-radar-blips {
          position:absolute;
          inset:0;
          z-index:4;
        }
        .c2-blip {
          position:absolute;
          width:10px;
          height:10px;
          border-radius:999px;
          border:1px solid;
          background:rgba(255,255,255,0.08);
          transform:translate(-50%,-50%);
          transition:all 0.2s ease;
        }
        .c2-blip::after {
          content:'';
          position:absolute;
          inset:-6px;
          border:1px solid currentColor;
          border-radius:999px;
          opacity:0.2;
          animation:c2Ping 2.6s ease-out infinite;
        }
        .c2-blip.active {
          width:13px;
          height:13px;
          background:#E31B54;
          border-color:#E31B54 !important;
        }
        @keyframes c2Ping {
          0% { transform:scale(0.5); opacity:0.55; }
          100% { transform:scale(1.45); opacity:0; }
        }
        .c2-focus-card {
          position:relative;
          z-index:5;
          width:min(86%, 480px);
          border:1px solid rgba(255,255,255,0.12);
          border-radius:12px;
          background:linear-gradient(145deg,rgba(0,0,0,0.48),rgba(0,0,0,0.22));
          padding:1rem 1.1rem 1.15rem;
          box-shadow:0 16px 36px rgba(0,0,0,0.35);
          backdrop-filter:blur(8px);
        }
        :root.light .c2-focus-card {
          border:1px solid rgba(0,0,0,0.13);
          background:linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,255,255,0.68));
          box-shadow:0 10px 24px rgba(15,23,42,0.12);
        }
        .c2-focus-label { font-size:0.56rem; letter-spacing:0.18em; margin-bottom:0.35rem; }
        .c2-focus-title { font-size:1.25rem; font-weight:700; letter-spacing:-0.02em; margin-bottom:0.85rem; }
        .c2-focus-metrics { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0.65rem; }
        .c2-focus-k { font-size:0.55rem; letter-spacing:0.14em; margin-bottom:0.3rem; }
        .c2-focus-v { font-size:1.2rem; font-weight:700; line-height:1; }
        @media(max-width:640px){
          .c2-focus-card { width:min(92%, 360px); padding:0.85rem 0.9rem 0.95rem; }
          .c2-focus-title { font-size:1.02rem; margin-bottom:0.65rem; }
          .c2-focus-v { font-size:1rem; }
        }
        .c2-stats {
          width:200px; flex-shrink:0; background:rgba(0,0,0,0.45); padding:1.25rem;
          border-left:1px solid rgba(255,255,255,0.07);
          display:flex; flex-direction:column; gap:0.35rem; overflow-y:auto;
          margin-top:40px;
        }
        :root.light .c2-stats { background:rgba(0,0,0,0.04); border-left:1px solid rgba(0,0,0,0.09); }
        @media(max-width:640px){ .c2-stats { display:none; } }
        .c2-divider { width:100%; height:1px; background:rgba(255,255,255,0.07); margin:0.6rem 0; }
        :root.light .c2-divider { background:rgba(0,0,0,0.09); }
        .c2-events {
          margin-top:0.9rem;
          border:1px solid rgba(255,255,255,0.08);
          border-radius:8px;
          padding:0.55rem;
          background:rgba(255,255,255,0.02);
        }
        :root.light .c2-events {
          border:1px solid rgba(0,0,0,0.09);
          background:rgba(255,255,255,0.5);
        }
        .c2-event-row {
          display:flex;
          align-items:baseline;
          gap:0.45rem;
          padding:0.18rem 0;
        }
        .c2-event-ts { font-size:0.52rem; color:rgba(255,255,255,0.3); flex-shrink:0; }
        :root.light .c2-event-ts { color:rgba(0,0,0,0.34); }
        .c2-event-msg { font-size:0.56rem; color:rgba(255,255,255,0.64); flex:1; }
        :root.light .c2-event-msg { color:rgba(0,0,0,0.58); }
        .c2-event-lvl { font-size:0.5rem; letter-spacing:0.12em; font-weight:700; flex-shrink:0; }

        .infra-panel {
          flex-direction:column;
          background:linear-gradient(160deg,#040913 0%, #02050d 56%, #06030f 100%);
        }
        :root.light .infra-panel {
          background:linear-gradient(160deg,#eef1f8 0%, #e4e8f2 56%, #edf0f7 100%);
        }
        .infra-topbar {
          display:grid;
          grid-template-columns:minmax(0, 1fr) auto minmax(0, 1fr);
          align-items:center;
          gap:0.8rem;
          padding:0.8rem 1rem;
          border-bottom:1px solid rgba(255,255,255,0.08);
          font-size:0.6rem;
          letter-spacing:0.16em;
        }
        :root.light .infra-topbar { border-bottom:1px solid rgba(0,0,0,0.11); }
        .infra-topbar-title {
          justify-self:start;
          min-width:0;
        }
        .infra-topbar-center {
          justify-self:center;
          display:flex;
          align-items:center;
          justify-content:center;
          min-width:0;
        }
        .infra-zoom-controls {
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:0.32rem;
          flex-wrap:wrap;
          justify-self:end;
        }
        .infra-zoom-controls button {
          height:28px; border-radius:6px;
          border:1px solid rgba(255,255,255,0.16);
          background:rgba(255,255,255,0.04);
          color:rgba(255,255,255,0.82);
          cursor:pointer;
        }
        .infra-zoom-controls button:hover { border-color:#e2e8f0; color:#fff; }
        .infra-zoom-controls .infra-reset {
          width:auto; padding:0 0.55rem; font-size:0.56rem; letter-spacing:0.12em;
        }
        .infra-zoom-controls .infra-clear-filters {
          width:auto; padding:0 0.55rem; font-size:0.56rem; letter-spacing:0.12em;
        }
        .infra-zoom-controls .infra-filter-toggle {
          width:auto;
          padding:0 0.52rem;
          font-size:0.55rem;
          letter-spacing:0.12em;
        }
        .infra-zoom-controls .infra-tracking-toggle {
          width:auto;
          padding:0 0.56rem;
          font-size:0.55rem;
          letter-spacing:0.12em;
        }
        .infra-zoom-controls .infra-tracking-toggle.active {
          border-color:rgba(125,211,252,0.62);
          color:#dbeafe;
          background:rgba(37,99,235,0.22);
          box-shadow:0 0 0 1px rgba(125,211,252,0.2), 0 0 10px rgba(37,99,235,0.2);
        }
        .infra-zoom-controls .infra-filter-toggle.active {
          border-color:rgba(45,212,191,0.62);
          color:#5eead4;
          background:rgba(13,148,136,0.22);
          box-shadow:0 0 0 1px rgba(45,212,191,0.24), 0 0 10px rgba(45,212,191,0.24);
        }
        .infra-zoom-controls .infra-beacon-toggle {
          width:auto;
          padding:0 0.56rem;
          font-size:0.55rem;
          letter-spacing:0.12em;
        }
        .infra-zoom-controls .infra-beacon-toggle.active {
          border-color:rgba(56,189,248,0.62);
          color:#bae6fd;
          background:rgba(2,132,199,0.22);
          box-shadow:0 0 0 1px rgba(56,189,248,0.26), 0 0 10px rgba(56,189,248,0.24);
        }
        .infra-zoom-controls > span {
          min-width:46px;
          text-align:center;
          font-size:0.57rem;
          color:rgba(255,255,255,0.62);
        }
        :root.light .infra-zoom-controls button {
          border:1px solid rgba(0,0,0,0.14);
          background:rgba(0,0,0,0.03);
          color:rgba(0,0,0,0.7);
        }
        :root.light .infra-zoom-controls .infra-tracking-toggle.active {
          border-color:rgba(37,99,235,0.44);
          color:#1e3a8a;
          background:rgba(37,99,235,0.15);
          box-shadow:0 0 0 1px rgba(37,99,235,0.18), 0 0 8px rgba(37,99,235,0.1);
        }
        :root.light .infra-zoom-controls .infra-filter-toggle.active {
          border-color:rgba(13,148,136,0.45);
          color:#0f766e;
          background:rgba(13,148,136,0.16);
          box-shadow:0 0 0 1px rgba(13,148,136,0.2), 0 0 8px rgba(13,148,136,0.15);
        }
        :root.light .infra-zoom-controls .infra-beacon-toggle.active {
          border-color:rgba(2,132,199,0.44);
          color:#0c4a6e;
          background:rgba(2,132,199,0.15);
          box-shadow:0 0 0 1px rgba(2,132,199,0.2), 0 0 8px rgba(2,132,199,0.12);
        }
        :root.light .infra-zoom-controls > span { color:rgba(0,0,0,0.55); }
        .infra-map-zoom-simple {
          position:relative;
          z-index:1;
          display:flex;
          align-items:center;
          gap:0.22rem;
          padding:0;
          border:none;
          border-radius:0;
          background:transparent;
          box-shadow:none;
          backdrop-filter:none;
        }
        .infra-map-zoom-btn {
          width:20px;
          height:20px;
          min-width:20px;
          min-height:20px;
          aspect-ratio:1 / 1;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          border:1px solid rgba(255,255,255,0.18);
          border-radius:4px;
          background:rgba(255,255,255,0.06);
          color:#fff;
          cursor:pointer;
          font-size:0.64rem;
          font-weight:700;
          line-height:1;
          padding:0;
        }
        .infra-map-zoom-btn:hover {
          border-color:rgba(255,255,255,0.5);
          background:rgba(255,255,255,0.12);
        }
        .infra-map-zoom-slider {
          width:56px;
          height:14px;
          appearance:none;
          -webkit-appearance:none;
          background:transparent;
          cursor:pointer;
        }
        .infra-map-zoom-level {
          min-width:38px;
          text-align:center;
          font-size:0.44rem;
          letter-spacing:0.1em;
          line-height:1;
          color:rgba(241,245,249,0.72);
          text-transform:uppercase;
        }
        .infra-map-zoom-slider::-webkit-slider-runnable-track {
          height:3px;
          border-radius:999px;
          background:rgba(255,255,255,0.26);
        }
        .infra-map-zoom-slider::-webkit-slider-thumb {
          -webkit-appearance:none;
          appearance:none;
          width:8px;
          height:8px;
          margin-top:-2.5px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,0.86);
          background:#E31B54;
          box-shadow:0 0 0 1px rgba(227,27,84,0.32);
        }
        .infra-map-zoom-slider::-moz-range-track {
          height:3px;
          border:none;
          border-radius:999px;
          background:rgba(255,255,255,0.26);
        }
        .infra-map-zoom-slider::-moz-range-thumb {
          width:8px;
          height:8px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,0.86);
          background:#E31B54;
          box-shadow:0 0 0 1px rgba(227,27,84,0.32);
        }
        .infra-map-zoom-slider:focus-visible {
          outline:none;
        }
        .infra-map-zoom-slider:focus-visible::-webkit-slider-thumb {
          box-shadow:0 0 0 1px rgba(227,27,84,0.42), 0 0 0 3px rgba(227,27,84,0.22);
        }
        .infra-map-zoom-slider:focus-visible::-moz-range-thumb {
          box-shadow:0 0 0 1px rgba(227,27,84,0.42), 0 0 0 3px rgba(227,27,84,0.22);
        }
        :root.light .infra-map-zoom-btn {
          border:1px solid rgba(0,0,0,0.14);
          background:rgba(0,0,0,0.03);
          color:#0f172a;
        }
        :root.light .infra-map-zoom-level {
          color:rgba(15,23,42,0.62);
        }
        :root.light .infra-map-zoom-slider::-webkit-slider-runnable-track {
          background:rgba(0,0,0,0.2);
        }
        :root.light .infra-map-zoom-slider::-webkit-slider-thumb {
          border:1px solid rgba(15,23,42,0.84);
          box-shadow:0 0 0 1px rgba(227,27,84,0.2);
        }
        :root.light .infra-map-zoom-slider::-moz-range-track {
          background:rgba(0,0,0,0.2);
        }
        :root.light .infra-map-zoom-slider::-moz-range-thumb {
          border:1px solid rgba(15,23,42,0.84);
          box-shadow:0 0 0 1px rgba(227,27,84,0.2);
        }
        :root.light .infra-map-zoom-btn:hover {
          border-color:rgba(0,0,0,0.34);
          background:rgba(0,0,0,0.06);
        }
        @media(max-width:1120px){
          .infra-topbar {
            grid-template-columns:1fr;
            gap:0.45rem;
          }
          .infra-topbar-title,
          .infra-topbar-center,
          .infra-zoom-controls {
            justify-self:center;
          }
          .infra-topbar-title {
            text-align:center;
          }
          .infra-zoom-controls {
            justify-content:center;
          }
        }
        @media(max-width:640px){
          .infra-map-zoom-simple {
            gap:0.2rem;
            padding:0;
          }
          .infra-map-zoom-slider { width:48px; }
          .infra-map-zoom-level {
            min-width:34px;
            font-size:0.41rem;
          }
        }
        .infra-layout {
          flex:1;
          display:grid;
          grid-template-columns:minmax(250px, 300px) minmax(0,1fr) minmax(210px, 250px);
          min-height:0;
          overflow:hidden;
        }
        @media(max-width:1280px){
          .infra-layout { grid-template-columns:minmax(230px, 280px) minmax(0,1fr) minmax(190px, 220px); }
        }
        @media(max-width:980px){
          .infra-layout { grid-template-columns:1fr; }
        }
        .infra-map-stage {
          --sdemo-crosshair-color: rgba(255,255,255,0.86);
          position:relative;
          overflow:hidden;
          border-left:1px solid rgba(255,255,255,0.07);
          border-right:1px solid rgba(255,255,255,0.07);
          background:radial-gradient(circle at 20% 10%, rgba(96,165,250,0.1), transparent 40%);
        }
        :root.light .infra-map-stage {
          --sdemo-crosshair-color: rgba(15,23,42,0.8);
          border-left:1px solid rgba(0,0,0,0.08);
          border-right:1px solid rgba(0,0,0,0.08);
        }
        @media (pointer:fine) {
          .infra-map-stage.crosshair-enabled,
          .infra-map-stage.crosshair-enabled * {
            cursor:none !important;
          }
        }
        @media (pointer:coarse) {
          .infra-map-stage .sdemo-crosshair-layer { display:none; }
          .infra-map-stage.crosshair-enabled,
          .infra-map-stage.crosshair-enabled * {
            cursor:auto !important;
          }
        }
        @media(max-width:980px){
          .infra-map-stage {
            min-height:58vh;
            border-left:none;
            border-right:none;
            border-top:1px solid rgba(255,255,255,0.07);
            border-bottom:1px solid rgba(255,255,255,0.07);
          }
          :root.light .infra-map-stage {
            border-top:1px solid rgba(0,0,0,0.08);
            border-bottom:1px solid rgba(0,0,0,0.08);
          }
        }
        .infra-leaflet-map {
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          background:#060b15;
        }
        .infra-leaflet-map .leaflet-container {
          background:#060b15;
        }
        /* Prevent tile seam flashes during animated zoom in Chromium/WebKit */
        .infra-leaflet-map .leaflet-tile {
          outline:1px solid transparent;
        }
        .infra-map-stage.infra-map-stage-c2 .infra-leaflet-map .leaflet-tile-pane {
          filter:grayscale(0.24) saturate(0.56) contrast(1.32) brightness(0.7) hue-rotate(140deg);
        }
        .infra-map-stage.infra-map-stage-c2 .infra-leaflet-map .leaflet-overlay-pane {
          filter:contrast(1.12) saturate(1.08);
        }
        .infra-c2-hud {
          position:absolute;
          inset:0;
          z-index:900;
          pointer-events:none;
          mix-blend-mode:normal;
        }
        .infra-c2-hud.grid-only .infra-c2-grid {
          opacity:0.9;
        }
        .infra-c2-grid {
          position:absolute;
          inset:0;
          z-index:3;
          background-image:
            repeating-linear-gradient(0deg, rgba(255,255,255,0.48) 0 0.5px, transparent 0.5px 72px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.48) 0 0.5px, transparent 0.5px 72px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.75) 0 0.5px, transparent 0.5px 360px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.75) 0 0.5px, transparent 0.5px 360px);
          opacity:0.95;
        }
        .infra-c2-grid::after {
          content:none;
        }
        .infra-c2-vignette {
          position:absolute;
          inset:0;
          z-index:1;
          background:
            radial-gradient(circle at 50% 50%, transparent 48%, rgba(2,6,23,0.18) 78%, rgba(2,6,23,0.36) 100%),
            linear-gradient(180deg, rgba(2,6,23,0.08), rgba(2,6,23,0.26));
        }
        .infra-c2-readout {
          position:absolute;
          right:0.8rem;
          bottom:0.8rem;
          z-index:4;
          display:flex;
          flex-direction:column;
          gap:0.18rem;
          border:1px solid rgba(34,211,238,0.34);
          background:rgba(2,6,23,0.58);
          border-radius:9px;
          padding:0.42rem 0.52rem;
          font-size:0.52rem;
          letter-spacing:0.12em;
          color:rgba(186,230,253,0.95);
          min-width:170px;
        }
        :root.light .infra-c2-hud {
          mix-blend-mode:normal;
          opacity:1;
        }
        :root.light .infra-c2-hud.grid-only .infra-c2-grid {
          opacity:0.9;
        }
        :root.light .infra-c2-grid {
          background-image:
            repeating-linear-gradient(0deg, rgba(255,255,255,0.48) 0 0.5px, transparent 0.5px 72px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.48) 0 0.5px, transparent 0.5px 72px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.75) 0 0.5px, transparent 0.5px 360px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.75) 0 0.5px, transparent 0.5px 360px);
          opacity:0.95;
        }
        :root.light .infra-c2-grid::after { content:none; }
        :root.light .infra-c2-vignette {
          background:
            radial-gradient(circle at 50% 50%, transparent 50%, rgba(15,23,42,0.06) 80%, rgba(15,23,42,0.16) 100%);
        }
        :root.light .infra-leaflet-map,
        :root.light .infra-leaflet-map .leaflet-container {
          background:#e7edf7;
        }
        :root.light .infra-c2-readout {
          border:1px solid rgba(15,118,110,0.38);
          background:rgba(240,253,250,0.8);
          color:#134e4a;
        }
        @media(max-width:640px){
          .infra-c2-readout { right:0.55rem; bottom:0.55rem; min-width:148px; font-size:0.49rem; }
        }
        .infra-map-overlay {
          position:absolute;
          inset:0;
          display:flex;
          align-items:center;
          justify-content:center;
          background:linear-gradient(160deg, rgba(2,4,8,0.8), rgba(2,4,8,0.45));
          pointer-events:none;
          z-index:9;
        }
        :root.light .infra-map-overlay {
          background:linear-gradient(160deg, rgba(245,247,252,0.82), rgba(245,247,252,0.52));
        }
        .infra-map-label {
          font-size:0.62rem;
          letter-spacing:0.14em;
          color:rgba(255,255,255,0.62);
        }
        :root.light .infra-map-label { color:rgba(0,0,0,0.56); }
        .infra-gov-chip {
          position:absolute;
          top:0.8rem;
          left:0.8rem;
          z-index:410;
          border-radius:999px;
          padding:0.28rem 0.62rem;
          font-size:0.52rem;
          letter-spacing:0.12em;
          border:1px solid rgba(255,255,255,0.16);
          background:rgba(3,8,20,0.62);
          color:rgba(255,255,255,0.82);
          backdrop-filter:blur(6px);
          pointer-events:none;
        }
        .infra-gov-chip.ready {
          border-color:rgba(16,185,129,0.4);
          color:rgba(167,243,208,0.95);
        }
        .infra-gov-chip.error {
          border-color:rgba(248,113,113,0.42);
          color:rgba(254,202,202,0.95);
        }
        :root.light .infra-gov-chip {
          border-color:rgba(0,0,0,0.14);
          background:rgba(255,255,255,0.84);
          color:rgba(0,0,0,0.68);
        }
        :root.light .infra-gov-chip.ready {
          border-color:rgba(5,150,105,0.32);
          color:#065f46;
        }
        :root.light .infra-gov-chip.error {
          border-color:rgba(220,38,38,0.3);
          color:#991b1b;
        }
        .infra-gov-marker-shell {
          background:transparent;
          border:none;
        }
        .infra-asset-marker-shell {
          background:transparent;
          border:none;
        }
        .infra-gov-marker-dot {
          position:relative;
          width:100%;
          height:100%;
          display:block;
          border-radius:999px;
          border:0.8px solid rgba(255,255,255,0.82);
          background:radial-gradient(circle at 30% 28%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.18) 28%, var(--infra-dot-color) 72%);
          box-shadow:0 0 0 1px rgba(15,23,42,0.45), 0 0 12px rgba(34,211,238,0.28), 0 3px 12px rgba(2,6,23,0.62);
          opacity:0.92;
          transition:transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, border-color 0.2s ease;
          animation:infraGlowBreath 1.8s ease-in-out infinite;
        }
        .infra-gov-marker-dot::after {
          content:"";
          position:absolute;
          inset:-24%;
          border-radius:999px;
          border:0.8px solid rgba(255,255,255,0.58);
          --infra-pulse-from:0.86;
          --infra-pulse-to:1.7;
          animation:infraPulseRing 1.95s ease-out infinite;
        }
        .infra-gov-marker-core {
          position:absolute;
          left:50%;
          top:50%;
          width:34%;
          height:34%;
          border-radius:999px;
          transform:translate(-50%, -50%);
          background:rgba(255,255,255,0.94);
          box-shadow:0 0 7px rgba(255,255,255,0.65);
          animation:infraGlowBreath 1.4s ease-in-out infinite;
        }
        .infra-gov-marker-dot.active {
          transform:scale(1.12);
          opacity:1;
          border-color:rgba(255,255,255,0.95);
          box-shadow:0 0 0 1px rgba(255,255,255,0.42), 0 0 0 4px rgba(255,255,255,0.14), 0 0 16px rgba(34,211,238,0.45), 0 3px 14px rgba(2,6,23,0.7);
        }
        .infra-gov-marker-dot.active::after {
          border-color:rgba(255,255,255,0.74);
          --infra-pulse-to:1.9;
          animation-duration:1.2s;
        }
        .infra-asset-beacon {
          position:relative;
          width:100%;
          height:100%;
          display:block;
          border-radius:999px;
          border:0.8px solid rgba(255,255,255,0.82);
          background:radial-gradient(circle at 34% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.16) 30%, var(--infra-dot-color) 74%);
          box-shadow:0 0 0 1px rgba(15,23,42,0.38), 0 0 12px var(--infra-dot-color), 0 3px 12px rgba(2,6,23,0.62);
          opacity:0.94;
          transition:transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
          animation:infraGlowBreath 1.8s ease-in-out infinite;
        }
        .infra-asset-beacon::after {
          content:"";
          position:absolute;
          inset:-20%;
          border-radius:999px;
          border:0.8px solid rgba(255,255,255,0.62);
          --infra-pulse-from:0.88;
          --infra-pulse-to:1.7;
          animation:infraPulseRing 1.95s ease-out infinite;
        }
        .infra-asset-beacon-core {
          position:absolute;
          left:50%;
          top:50%;
          width:30%;
          height:30%;
          border-radius:999px;
          transform:translate(-50%, -50%);
          background:rgba(255,255,255,0.95);
          box-shadow:0 0 8px rgba(255,255,255,0.68);
          animation:infraGlowBreath 1.35s ease-in-out infinite;
        }
        .infra-asset-beacon.active {
          transform:scale(1.14);
          border-color:rgba(255,255,255,0.95);
          box-shadow:0 0 0 1px rgba(255,255,255,0.44), 0 0 0 4px rgba(255,255,255,0.12), 0 0 18px var(--infra-dot-color), 0 4px 14px rgba(2,6,23,0.72);
        }
        .infra-asset-beacon.active::after {
          --infra-pulse-to:1.95;
          animation-duration:1.2s;
        }
        .infra-leaflet-map .leaflet-tooltip-pane {
          z-index:10020 !important;
        }
        .infra-leaflet-map .leaflet-tooltip.infra-tooltip {
          --infra-tooltip-glow: rgba(34,211,238,0.26);
          z-index:10021 !important;
          border:1px solid rgba(148,163,184,0.44);
          border-radius:11px;
          background:rgba(3,8,20,0.92);
          color:#e2e8f0;
          box-shadow:0 0 0 1px rgba(148,163,184,0.3), 0 10px 24px rgba(2,6,23,0.56), 0 0 10px var(--infra-tooltip-glow);
          font-family:'Inter', ui-sans-serif, system-ui, sans-serif;
          font-size:0.7rem;
          font-weight:600;
          letter-spacing:0.01em;
          padding:0.36rem 0.58rem;
          backdrop-filter:blur(8px);
          animation:infraTooltipGlow 2.2s ease-in-out infinite;
        }
        .infra-leaflet-map .leaflet-tooltip.infra-tooltip.infra-tooltip-province {
          --infra-tooltip-glow: rgba(244,63,94,0.3);
          border-color:rgba(244,63,94,0.66);
          color:#ffe4ec;
        }
        .infra-leaflet-map .leaflet-tooltip.infra-tooltip.infra-tooltip-asset {
          --infra-tooltip-glow: rgba(167,139,250,0.34);
          border-color:rgba(167,139,250,0.64);
          color:#f3e8ff;
        }
        .infra-leaflet-map .leaflet-tooltip.infra-tooltip.infra-tooltip-layer {
          --infra-tooltip-glow: rgba(34,211,238,0.34);
          border-color:rgba(34,211,238,0.66);
          color:#cffafe;
        }
        .infra-leaflet-map .leaflet-tooltip-top.infra-tooltip::before {
          border-top-color:rgba(3,8,20,0.92);
        }
        .infra-leaflet-map .leaflet-tooltip-bottom.infra-tooltip::before {
          border-bottom-color:rgba(3,8,20,0.92);
        }
        .infra-leaflet-map .leaflet-tooltip-left.infra-tooltip::before {
          border-left-color:rgba(3,8,20,0.92);
        }
        .infra-leaflet-map .leaflet-tooltip-right.infra-tooltip::before {
          border-right-color:rgba(3,8,20,0.92);
        }
        :root.light .infra-leaflet-map .leaflet-tooltip.infra-tooltip {
          --infra-tooltip-glow: rgba(15,23,42,0.12);
          background:rgba(255,255,255,0.96);
          color:#0f172a;
          border-color:rgba(71,85,105,0.3);
          box-shadow:0 0 0 1px rgba(71,85,105,0.24), 0 8px 20px rgba(15,23,42,0.16), 0 0 10px var(--infra-tooltip-glow);
        }
        :root.light .infra-leaflet-map .leaflet-tooltip-top.infra-tooltip::before {
          border-top-color:rgba(255,255,255,0.96);
        }
        :root.light .infra-leaflet-map .leaflet-tooltip-bottom.infra-tooltip::before {
          border-bottom-color:rgba(255,255,255,0.96);
        }
        :root.light .infra-leaflet-map .leaflet-tooltip-left.infra-tooltip::before {
          border-left-color:rgba(255,255,255,0.96);
        }
        :root.light .infra-leaflet-map .leaflet-tooltip-right.infra-tooltip::before {
          border-right-color:rgba(255,255,255,0.96);
        }
        .infra-leaflet-map .marker-cluster-small,
        .infra-leaflet-map .marker-cluster-medium,
        .infra-leaflet-map .marker-cluster-large {
          background:rgba(2,6,23,0.68);
          border:1px solid rgba(148,163,184,0.5);
        }
        .infra-leaflet-map .marker-cluster div {
          background:rgba(2,6,23,0.88);
          color:#f8fafc;
          font-family:ui-monospace, Menlo, monospace;
          font-size:0.68rem;
          border:1px solid rgba(255,255,255,0.12);
        }
        :root.light .infra-leaflet-map .marker-cluster-small,
        :root.light .infra-leaflet-map .marker-cluster-medium,
        :root.light .infra-leaflet-map .marker-cluster-large {
          background:rgba(255,255,255,0.75);
          border:1px solid rgba(0,0,0,0.16);
        }
        :root.light .infra-leaflet-map .marker-cluster div {
          background:rgba(255,255,255,0.92);
          color:#0f172a;
          border:1px solid rgba(0,0,0,0.16);
        }
        .infra-leaflet-map .leaflet-control-zoom a {
          background:rgba(0,0,0,0.42);
          color:#fff;
          border-color:rgba(255,255,255,0.14);
        }
        .infra-leaflet-map .leaflet-control-attribution {
          background:rgba(0,0,0,0.26);
          color:rgba(255,255,255,0.58);
          border-radius:6px 0 0 0;
          padding:1px 4px;
          font-size:9px;
          line-height:1.2;
        }
        .infra-leaflet-map .leaflet-control-attribution a { color:rgba(255,255,255,0.66); }
        :root.light .infra-leaflet-map .leaflet-control-zoom a {
          background:rgba(255,255,255,0.92);
          color:#111827;
          border-color:rgba(0,0,0,0.12);
        }
        :root.light .infra-leaflet-map .leaflet-control-attribution {
          background:rgba(255,255,255,0.7);
          color:rgba(0,0,0,0.48);
        }
        :root.light .infra-leaflet-map .leaflet-control-attribution a { color:rgba(0,0,0,0.58); }
        .infra-details-panel,
        .infra-filters-panel {
          padding:1rem;
          display:flex;
          flex-direction:column;
          gap:0.62rem;
          background:rgba(0,0,0,0.25);
          height:100%;
          min-height:0;
          overflow-y:auto;
        }
        .infra-filters-panel {
          gap:0.62rem;
          padding-left:0.72rem;
          padding-right:0.72rem;
          overflow:hidden;
        }
        :root.light .infra-details-panel,
        :root.light .infra-filters-panel { background:rgba(0,0,0,0.03); }
        @media(max-width:980px){
          .infra-details-panel,
          .infra-filters-panel {
            border-top:1px solid rgba(255,255,255,0.07);
            max-height:34vh;
          }
        }
        :root.light .infra-details-panel,
        :root.light .infra-filters-panel { border-color:rgba(0,0,0,0.08); }
        .infra-layer-list {
          display:flex;
          flex-direction:column;
          gap:0.34rem;
        }
        .infra-filters-panel .infra-layer-list {
          flex:1 1 auto;
          min-height:0;
          max-height:100%;
          overflow-y:auto;
          overflow-x:hidden;
          padding-right:0.22rem;
          -webkit-overflow-scrolling:touch;
          overscroll-behavior:contain;
          scrollbar-width:thin;
        }
        .infra-filters-panel .infra-layer-list::-webkit-scrollbar {
          width:6px;
        }
        .infra-filters-panel .infra-layer-list::-webkit-scrollbar-thumb {
          border-radius:999px;
          background:rgba(148,163,184,0.42);
        }
        .infra-filters-panel .infra-layer-list::-webkit-scrollbar-track {
          background:transparent;
        }
        .infra-layer-item {
          display:grid;
          grid-template-columns:auto 1fr auto;
          align-items:center;
          gap:0.45rem;
          border:1px solid rgba(255,255,255,0.09);
          border-radius:9px;
          padding:0.44rem 0.5rem;
          background:rgba(255,255,255,0.02);
          cursor:pointer;
        }
        .infra-layer-item.active {
          border-color:rgba(255,255,255,0.09);
          background:rgba(255,255,255,0.02);
        }
        .infra-layer-item .infra-layer-toggle {
          width:12px;
          height:12px;
          margin:0;
          appearance:none;
          -webkit-appearance:none;
          border-radius:999px;
          border:1px solid rgba(255,255,255,0.22);
          background:rgba(255,255,255,0.02);
          box-shadow:inset 0 0 0 1px rgba(255,255,255,0.04);
          cursor:pointer;
          flex-shrink:0;
          transition:background 0.18s ease,border-color 0.18s ease,box-shadow 0.18s ease,transform 0.18s ease;
        }
        .infra-layer-item .infra-layer-toggle:checked {
          background:var(--infra-layer-color, #E31B54);
          border-color:var(--infra-layer-color, #E31B54);
          box-shadow:0 0 0 1px rgba(255,255,255,0.32);
          transform:scale(1.04);
        }
        .infra-layer-item .infra-layer-toggle:focus-visible {
          outline:none;
          box-shadow:0 0 0 1px rgba(255,255,255,0.35), 0 0 0 3px rgba(255,255,255,0.12);
        }
        .infra-layer-copy {
          min-width:0;
          display:flex;
          align-items:center;
        }
        .infra-layer-text {
          font-size:0.65rem;
          letter-spacing:0.05em;
          color:rgba(255,255,255,0.85);
          line-height:1.25;
        }
        .infra-layer-count {
          margin-top:0;
          font-size:0.56rem;
          color:rgba(255,255,255,0.58);
          align-self:center;
        }
        :root.light .infra-layer-item {
          border:1px solid rgba(0,0,0,0.11);
          background:rgba(255,255,255,0.46);
        }
        :root.light .infra-layer-item.active {
          border-color:rgba(0,0,0,0.11);
          background:rgba(255,255,255,0.46);
        }
        :root.light .infra-layer-item .infra-layer-toggle {
          border:1px solid rgba(0,0,0,0.24);
          background:rgba(255,255,255,0.72);
          box-shadow:inset 0 0 0 1px rgba(255,255,255,0.5);
        }
        :root.light .infra-layer-item .infra-layer-toggle:checked {
          border-color:var(--infra-layer-color, #E31B54);
          background:var(--infra-layer-color, #E31B54);
          box-shadow:0 0 0 1px rgba(0,0,0,0.14);
        }
        :root.light .infra-layer-item .infra-layer-toggle:focus-visible {
          box-shadow:0 0 0 1px rgba(0,0,0,0.18), 0 0 0 3px rgba(0,0,0,0.08);
        }
        :root.light .infra-layer-text { color:rgba(0,0,0,0.74); }
        :root.light .infra-layer-count { color:rgba(0,0,0,0.52); }
        .infra-region-breakdown {
          margin-top:0.4rem;
          display:flex;
          flex-direction:column;
          gap:0.32rem;
        }
        .infra-domain-tags {
          display:flex;
          flex-direction:column;
          gap:0.28rem;
        }
        .infra-domain-tag {
          display:flex;
          justify-content:space-between;
          gap:0.4rem;
          border:1px solid rgba(255,255,255,0.09);
          border-radius:8px;
          padding:0.32rem 0.45rem;
          background:rgba(255,255,255,0.02);
          font-size:0.58rem;
          line-height:1.3;
          color:rgba(255,255,255,0.78);
        }
        :root.light .infra-domain-tag {
          border-color:rgba(0,0,0,0.12);
          background:rgba(255,255,255,0.5);
          color:rgba(0,0,0,0.74);
        }
        .infra-title {
          font-size:1rem;
          font-weight:700;
          line-height:1.2;
          margin:0;
        }
        .infra-meta-line {
          display:flex;
          gap:0.4rem;
          flex-wrap:wrap;
          font-size:0.62rem;
          letter-spacing:0.12em;
          color:rgba(255,255,255,0.6);
        }
        :root.light .infra-meta-line { color:rgba(0,0,0,0.58); }
        .infra-stats-grid {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:0.5rem;
          margin-top:0.4rem;
        }
        .infra-k { font-size:0.54rem; letter-spacing:0.14em; margin-bottom:0.16rem; }
        .infra-v { font-size:0.78rem; font-weight:700; }
        .infra-note {
          font-size:0.7rem;
          line-height:1.45;
          color:rgba(255,255,255,0.6);
          margin:0.1rem 0 0.2rem;
        }
        :root.light .infra-note { color:rgba(0,0,0,0.58); }
        .infra-source-tag {
          font-size:0.53rem;
          letter-spacing:0.12em;
          color:rgba(255,255,255,0.42);
        }
        :root.light .infra-source-tag { color:rgba(0,0,0,0.46); }
        .infra-detail-grid {
          margin-top:0.22rem;
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:0.42rem;
        }
        .infra-detail-grid .infra-v {
          font-size:0.64rem;
          line-height:1.32;
          font-weight:600;
          color:rgba(255,255,255,0.82);
          word-break:break-word;
        }
        :root.light .infra-detail-grid .infra-v {
          color:rgba(0,0,0,0.78);
        }
        .infra-list {
          margin-top:0.2rem;
          overflow-y:auto;
          display:flex;
          flex-direction:column;
          gap:0.35rem;
        }
        .infra-list-item {
          display:flex;
          gap:0.5rem;
          align-items:baseline;
          text-align:left;
          width:100%;
          border:1px solid rgba(255,255,255,0.08);
          border-radius:8px;
          background:rgba(255,255,255,0.02);
          padding:0.5rem 0.55rem;
          cursor:pointer;
        }
        .infra-list-item:hover { border-color:rgba(227,27,84,0.34); }
        .infra-list-item.active {
          border-color:rgba(227,27,84,0.62);
          background:rgba(227,27,84,0.1);
        }
        :root.light .infra-list-item {
          border:1px solid rgba(0,0,0,0.1);
          background:rgba(255,255,255,0.5);
        }
        :root.light .infra-list-item.active {
          border-color:rgba(227,27,84,0.48);
          background:rgba(227,27,84,0.08);
        }
        .infra-list-type { font-size:0.55rem; letter-spacing:0.14em; flex-shrink:0; }
        .infra-list-name { font-size:0.7rem; color:rgba(255,255,255,0.8); }
        :root.light .infra-list-name { color:rgba(0,0,0,0.75); }

        .blank-panel {
          background:
            radial-gradient(circle at 10% 10%, rgba(227,27,84,0.14), transparent 35%),
            linear-gradient(150deg,#04040a 0%, #020207 100%);
        }
        :root.light .blank-panel {
          background:
            radial-gradient(circle at 10% 10%, rgba(227,27,84,0.08), transparent 35%),
            linear-gradient(150deg,#eef1f8 0%, #e8ebf2 100%);
        }

        .learn-panel {
          align-items:center;
          justify-content:center;
          background:linear-gradient(160deg,#04040b 0%, #0b0812 100%);
          position:relative;
          overflow:hidden;
        }
        :root.light .learn-panel { background:linear-gradient(160deg,#f0f2f8 0%, #e5e8f0 100%); }
        .learn-halo {
          position:absolute;
          width:520px;
          height:520px;
          border-radius:50%;
          background:radial-gradient(circle, rgba(227,27,84,0.25), rgba(227,27,84,0) 70%);
          filter:blur(6px);
        }
        .learn-shell {
          position:relative;
          z-index:2;
          width:min(88%, 560px);
          border:1px solid rgba(255,255,255,0.12);
          border-radius:14px;
          background:linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015));
          padding:1.6rem;
          box-shadow:0 20px 50px rgba(0,0,0,0.35);
        }
        :root.light .learn-shell {
          border:1px solid rgba(0,0,0,0.12);
          background:linear-gradient(145deg,rgba(255,255,255,0.88),rgba(255,255,255,0.64));
          box-shadow:0 12px 30px rgba(15,23,42,0.12);
        }
        .learn-kicker {
          font-size:0.58rem;
          letter-spacing:0.2em;
          color:#E31B54;
          margin-bottom:0.7rem;
        }
        .learn-title { margin:0 0 0.75rem; font-size:1.6rem; letter-spacing:-0.02em; }
        .learn-desc {
          margin:0 0 1.2rem;
          font-size:0.78rem;
          line-height:1.6;
          color:rgba(255,255,255,0.68);
        }
        :root.light .learn-desc { color:rgba(0,0,0,0.62); }
        .learn-actions { display:flex; gap:0.55rem; flex-wrap:wrap; }
        .learn-btn {
          font-size:0.63rem;
          letter-spacing:0.14em;
          text-transform:uppercase;
          text-decoration:none;
          color:#fff;
          border:1px solid rgba(227,27,84,0.52);
          background:rgba(227,27,84,0.16);
          border-radius:999px;
          padding:0.55rem 0.85rem;
        }
        .learn-btn-ghost {
          color:rgba(255,255,255,0.82);
          background:rgba(255,255,255,0.02);
          border-color:rgba(255,255,255,0.24);
        }
        :root.light .learn-btn { color:#7f1236; background:rgba(227,27,84,0.14); }
        :root.light .learn-btn-ghost { color:#0f172a; background:rgba(0,0,0,0.03); border-color:rgba(0,0,0,0.2); }
      `}</style>

      <div className={`sdemo-root${revealed ? " revealed" : ""}`} ref={sectionRef}>
        <div className="sdemo-inner">

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
              Four strategic modules built for public coordination, infrastructure visibility, and high-stakes national operations.
            </p>
          </div>

          <div className="sdemo-tabs" role="tablist">
            {SOFTWARES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === active}
                className={`sdemo-tab${i === active ? " active" : ""}`}
                onClick={() => goto(i)}
              >
                <div className="sdemo-tab-top">
                  <span className="sdemo-tab-tag">{s.tag}</span>
                  <span className="sdemo-tab-status">{s.status}</span>
                </div>
                <span className="sdemo-tab-name">{s.name}</span>
                <span className="sdemo-tab-industry">{s.industry}</span>
                <div className="sdemo-tab-foot">
                  <span className="sw-mono sdemo-tab-up">UPTIME {s.uptime}</span>
                  <span className="sdemo-tab-open">Open</span>
                </div>
              </button>
            ))}
          </div>

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

          <div className="sdemo-viewport">
            <div className={`sdemo-slide ${transitioning ? (direction === "next" ? "sdemo-slide-out-next" : "sdemo-slide-out-prev") : "sdemo-slide-idle"}`}>
              <ActiveComp />
            </div>
          </div>

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
