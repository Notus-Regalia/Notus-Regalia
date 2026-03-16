"use client";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type RefObject,
} from "react";
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

const GOV_CLUSTER_STAGE: Record<C2Node["cluster"], string> = {
  citizen: "Validation Path",
  business: "Validation Path",
  revenue: "Processing Path",
  response: "Escalation Path",
};

type ServiceFocusPayload = {
  service: string;
  stage: string;
  detail: string;
};

type FeaturedSoftwareId = "government" | "domain" | "command";

const LIMITED_ENVIRONMENT_LINKS: Record<FeaturedSoftwareId, { requestDemoHref: string }> = {
  government: {
    requestDemoHref: "#request-demo-government",
  },
  domain: {
    requestDemoHref: "#request-demo-domain",
  },
  command: {
    requestDemoHref: "#request-demo-command",
  },
};

const LIMITED_ENVIRONMENT_DEFINITIONS: Record<FeaturedSoftwareId, { title: string; description: string }> = {
  government: {
    title: "Unified Government Services Framework",
    description:
      "A coordinated national services framework for the Philippines, built to eliminate fragmented agency workflows and deliver seamless citizen service.",
  },
  domain: {
    title: "Philippine Strategic Domain Intelligence",
    description:
      "A satellite-grade intelligence and mapping platform for the Philippines, designed to deliver coordinate-precise visibility across critical infrastructure and strategic sectors. Powered by Open Source Intelligence (OSINT) fusion and field-validated reporting, it supports infrastructure awareness, risk monitoring, and strategic planning across energy, transport, telecom, healthcare, finance, agriculture, government, data centers, aerospace, and related domains. Actual deployment iterations will expand into predictive risk modeling, real-time anomaly detection, infrastructure dependency analysis, and multi-domain operational intelligence.",
  },
  command: {
    title: "Reserved Command Surface",
    description:
      "Command mission surface reserved for incident workflows, dispatch controls, and escalation orchestration.",
  },
};

const LIMITED_MODAL_CLOSE_DURATION_MS = 280;

function useLimitedEnvironmentModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isClosing, setIsClosing] = useState(false);

  const open = useCallback(() => {
    if (isOpen && !isClosing) return;
    setIsClosing(false);
    setIsOpen(true);
  }, [isOpen, isClosing]);

  const close = useCallback(() => {
    if (!isOpen || isClosing) return;
    setIsClosing(true);
  }, [isOpen, isClosing]);

  useEffect(() => {
    if (!isClosing) return;
    const timerId = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, LIMITED_MODAL_CLOSE_DURATION_MS);
    return () => window.clearTimeout(timerId);
  }, [isClosing]);

  return { isOpen, isClosing, open, close };
}

type GovFlowCard = (typeof GOV_FLOW_CARDS)[number];

function LimitedEnvironmentModal({
  surfaceLabel,
  definitionTitle,
  definitionDescription,
  requestDemoHref,
  primaryLabel = "Accept & Proceed",
  primaryHref,
  secondaryLabel = "Request a Demo",
  secondaryHref,
  showPrimaryIcon = true,
  showPrimaryAction = true,
  showSecondaryAction = true,
  showDisclaimer = true,
  isClosing,
  onClose,
}: {
  surfaceLabel: string;
  definitionTitle: string;
  definitionDescription: string;
  requestDemoHref: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  showPrimaryIcon?: boolean;
  showPrimaryAction?: boolean;
  showSecondaryAction?: boolean;
  showDisclaimer?: boolean;
  isClosing: boolean;
  onClose: () => void;
}) {
  const updateGlowPosition = (event: ReactMouseEvent<HTMLElement>, xVar: string, yVar: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(xVar, `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty(yVar, `${event.clientY - rect.top}px`);
  };
  const resolvedSecondaryHref = showSecondaryAction ? (secondaryHref ?? requestDemoHref) : undefined;

  const hasSecondaryAction = Boolean(resolvedSecondaryHref);
  const shouldShowActions = showPrimaryAction || hasSecondaryAction;

  return (
    <div
      className={`infra-limited-modal-wrap${isClosing ? " closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Limited environment notice"
      onClick={onClose}
    >
      <div
        className="infra-limited-modal"
        onClick={(event) => event.stopPropagation()}
        onMouseMove={(event) => updateGlowPosition(event, "--modal-mx", "--modal-my")}
      >
        <div className="infra-limited-accent" />
        <div className="sw-mono infra-limited-eyebrow">
          <span className="infra-limited-eyebrow-dot" />
          {surfaceLabel}
        </div>
        <h4 className="infra-limited-title">{definitionTitle}</h4>
        <p className="infra-limited-definition">{definitionDescription}</p>
        {showDisclaimer ? (
          <p className="infra-limited-desc">
            <span className="infra-limited-disclaimer-title">Disclaimer</span>
            <span className="infra-limited-disclaimer-label">Limited Environment Showcase</span>
            A controlled demonstration environment is currently active. Full operational access is available through private briefing or licensed deployment.
          </p>
        ) : null}
        {shouldShowActions ? (
          <div className="infra-limited-actions">
            {showPrimaryAction ? (
              primaryHref ? (
                <a
                  href={primaryHref}
                  className="infra-limited-btn"
                  onMouseMove={(event) => updateGlowPosition(event, "--btn-mx", "--btn-my")}
                >
                  {primaryLabel}
                  {showPrimaryIcon ? <i className="bi bi-arrow-right-square" aria-hidden="true" /> : null}
                </a>
              ) : (
                <button
                  type="button"
                  className="infra-limited-btn"
                  onClick={onClose}
                  onMouseMove={(event) => updateGlowPosition(event, "--btn-mx", "--btn-my")}
                >
                  {primaryLabel}
                  {showPrimaryIcon ? <i className="bi bi-arrow-right-square" aria-hidden="true" /> : null}
                </button>
              )
            ) : null}
            {resolvedSecondaryHref ? (
              <a
                href={resolvedSecondaryHref}
                className="infra-limited-btn infra-limited-btn-ghost"
                onMouseMove={(event) => updateGlowPosition(event, "--btn-mx", "--btn-my")}
              >
                {secondaryLabel}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LimitedEnvironmentNoticeStrip({
  label,
  onClick,
  iconOnly = false,
}: {
  label: string;
  onClick: () => void;
  iconOnly?: boolean;
}) {
  return (
    <button
      type="button"
      className={`infra-limited-notice${iconOnly ? " infra-limited-notice-icon-only" : ""}`}
      onClick={onClick}
      aria-label={`Open limited environment notice for ${label}`}
    >
      {iconOnly ? (
        <span className="infra-limited-notice-icon" aria-hidden="true">!</span>
      ) : (
        <span className="infra-limited-notice-title">Notice</span>
      )}
    </button>
  );
}

function GovernmentServiceCard({
  card,
  isActive,
  mobile = false,
  onCardSelect,
}: {
  card: GovFlowCard;
  isActive: boolean;
  mobile?: boolean;
  onCardSelect: (payload: ServiceFocusPayload) => void;
}) {
  return (
    <button
      type="button"
      className={`gov-card${isActive ? " active" : ""}${mobile ? " gov-card-mobile" : ""}`}
      style={mobile ? undefined : { left: card.x, top: card.y }}
      onClick={() =>
        onCardSelect({
          service: card.title,
          stage: GOV_CLUSTER_STAGE[card.cluster],
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
  );
}

function GovernmentServiceFlow({
  activeCluster,
  onCardSelect,
}: {
  activeCluster: C2Node["cluster"];
  onCardSelect: (payload: ServiceFocusPayload) => void;
}) {
  return (
    <div className="gov-flow-root">
      <div className="gov-flow-board gov-flow-board-desktop">
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
          <GovernmentServiceCard
            key={card.id}
            card={card}
            isActive={card.cluster === activeCluster}
            onCardSelect={onCardSelect}
          />
        ))}
      </div>
      <div className="gov-flow-mobile">
        {GOV_FLOW_CARDS.map((card) => (
          <GovernmentServiceCard
            key={card.id}
            card={card}
            isActive={card.cluster === activeCluster}
            mobile
            onCardSelect={onCardSelect}
          />
        ))}
      </div>
    </div>
  );
}

// Government Systems window: primary place to edit the live coordination experience.
function GovernmentSystemsWindow() {
  const [active, setActive] = useState(C2_NODES[0]);
  const {
    isOpen: showLimitedEnvironmentModal,
    isClosing: isLimitedEnvironmentClosing,
    open: openLimitedEnvironmentModal,
    close: closeLimitedEnvironmentModal,
  } = useLimitedEnvironmentModal(false);
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
    <div className={`sw-panel c2-panel${showLimitedEnvironmentModal ? " sw-panel-modal-open" : ""}`}>
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
        <div className="sw-mono sw-dim c2-sidebar-label">
          COORDINATED_SERVICES // PH GOV GRID
        </div>
        <div className="c2-node-list">
          {C2_NODES.map((n) => (
            <button
              type="button"
              key={n.id}
              className={`c2-node${active.id === n.id ? " c2-node-active" : ""}`}
              onClick={() => setActive(n)}
            >
              <div className="sw-mono c2-node-id">{n.id}</div>
              <div className="c2-node-title">{n.label}</div>
              <div className="sw-mono c2-node-status" style={{ color: n.color }}>● {n.status}</div>
              <div className="sw-mono sw-dim c2-node-coord">{n.coord}</div>
            </button>
          ))}
        </div>
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
        <div className="c2-status-foot">
          <div className="sw-mono" style={{ color: glitch ? "#f59e0b" : "#00ffaa", fontWeight: 700, fontSize: "0.72rem" }}>
            FRAMEWORK {glitch ? "DEGRADED" : "COORDINATED"}
          </div>
          <div className="sw-mono sw-dim" style={{ fontSize: "0.62rem" }}>
            {active.threat === "HIGH" ? "ESCALATION WATCH ENABLED" : "SERVICE DELIVERY NOMINAL"}
          </div>
        </div>
      </aside>
      {!showLimitedEnvironmentModal && (
        <LimitedEnvironmentNoticeStrip
          label="Government Systems"
          onClick={openLimitedEnvironmentModal}
        />
      )}
      {showLimitedEnvironmentModal && (
        <LimitedEnvironmentModal
          surfaceLabel="Government Systems"
          definitionTitle={LIMITED_ENVIRONMENT_DEFINITIONS.government.title}
          definitionDescription={LIMITED_ENVIRONMENT_DEFINITIONS.government.description}
          requestDemoHref={LIMITED_ENVIRONMENT_LINKS.government.requestDemoHref}
          isClosing={isLimitedEnvironmentClosing}
          onClose={closeLimitedEnvironmentModal}
        />
      )}
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

type GovInfraLayerId = "industry" | "military" | "adsb";
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
type InfraFilterLayerId = "military" | "adsb" | CriticalInfraDomain;
type AdsbTrackClass = "commercial" | "military";

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
  heading?: number | null;
  speed?: number | null;
  altitude?: number | null;
  onGround?: boolean;
  adsbTrackClass?: AdsbTrackClass;
  icao24?: string;
  lastUpdateUnix?: number | null;
};

type AdsbFeedAircraft = {
  id: string;
  icao24: string;
  callsign: string | null;
  originCountry: string | null;
  lat: number;
  lon: number;
  altitudeMeters: number | null;
  velocityMps: number | null;
  headingDeg: number | null;
  verticalRateMps: number | null;
  onGround: boolean;
  squawk: string | null;
  lastContact: number | null;
};

type AdsbFeedResponse = {
  source?: string;
  fetchedAt?: string;
  timestamp?: number | null;
  aircraft?: AdsbFeedAircraft[];
};

type AdsbTrackSample = {
  lat: number;
  lon: number;
  t: number;
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
const ADSB_ULTRA_FAST_POLL_MS = 5000;
const ADSB_FAST_POLL_MS = 15000;
const ADSB_SLOW_POLL_MS = 60000;
const ADSB_ULTRA_FAST_POLL_WINDOW_MS = 5 * 60 * 1000;
const ADSB_FAST_POLL_WINDOW_MS = 10 * 60 * 1000;
const ADSB_AUTO_PAUSE_AFTER_MS = 20 * 60 * 1000;
const ADSB_TRACK_HISTORY_WINDOW_MS = 30 * 60 * 1000;
const ADSB_TRACK_HISTORY_MAX_POINTS = 90;
const ADSB_TRACK_POSITION_STEP_THRESHOLD = 0.00035;
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
  adsb: { label: "Aircraft", color: "#f8fafc", source: "Realtime ADS-B transponder feed (Philippine airspace)" },
};

const ADSB_TRACK_COLORS: Record<AdsbTrackClass, string> = {
  commercial: "#f8fafc",
  // Reserved for upcoming military aircraft integration.
  military: "#facc15",
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

const provincePolygonStyle = (active: boolean, hovered: boolean, disableHover: boolean = false) => {
  // If hover is disabled, treat hovered as false
  const effectiveHovered = disableHover ? false : hovered;
  return {
    color: active || effectiveHovered ? "#ffffff" : "rgba(255,255,255,0.36)",
    weight: effectiveHovered ? 1.9 : active ? 1.5 : 0.75,
    opacity: active || effectiveHovered ? 0.95 : 0.62,
    fillColor: "#E31B54",
    fillOpacity: effectiveHovered ? 0.18 : active ? 0.11 : 0,
    dashArray: "",
  };
};

const applyProvinceLayerStyles = (
  provinceLayers: Record<string, any>,
  activeProvinceId: string | null,
  hoveredProvinceId: string | null,
  disableHover: boolean = false
) => {
  Object.entries(provinceLayers).forEach(([provinceId, layer]) => {
    const hovered = hoveredProvinceId === provinceId;
    const active = activeProvinceId === provinceId;
    layer.setStyle(provincePolygonStyle(active, hovered, disableHover));
    if (active || (!disableHover && hovered)) {
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

const buildAdsbMarkerIcon = (
  L: any,
  color: string,
  point: GovInfrastructurePoint,
  active: boolean
) => {
  const size = active ? 34 : 28;
  const trackClass = point.adsbTrackClass ?? "commercial";
  const heading =
    typeof point.heading === "number" && Number.isFinite(point.heading)
      ? ((point.heading % 360) + 360) % 360
      : 0;
  return L.divIcon({
    className: "infra-adsb-marker-shell",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="infra-adsb-aircraft${active ? " active" : ""}" data-track-class="${trackClass}" style="--infra-dot-color:${color};--infra-adsb-rotation:${heading}deg;"><svg class="infra-adsb-aircraft-glyph" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 2.6C25 2.6 25.9 3.3 26.2 4.3L28.7 13.4L39.1 19C39.9 19.4 40.4 20.2 40.4 21.1V23.4C40.4 24.1 39.8 24.7 39.1 24.6L28 23.1L29.8 41.3C29.9 42.2 29.2 43 28.4 43H25.9L24 34.5L22.1 43H19.6C18.8 43 18.1 42.2 18.2 41.3L20 23.1L8.9 24.6C8.2 24.7 7.6 24.1 7.6 23.4V21.1C7.6 20.2 8.1 19.4 8.9 19L19.3 13.4L21.8 4.3C22.1 3.3 23 2.6 24 2.6Z"></path><path d="M16.8 30.9H31.2V33.6H16.8Z"></path></svg></span>`,
  });
};

const getGovPointColor = (point: GovInfrastructurePoint) => {
  if (point.layer === "adsb") return ADSB_TRACK_COLORS[point.adsbTrackClass ?? "commercial"];
  if (point.layer === "military") return GOV_INFRA_LAYER_META.military.color;
  if (point.domain) return CRITICAL_DOMAIN_COLORS[point.domain] ?? GOV_INFRA_LAYER_META.industry.color;
  return GOV_INFRA_LAYER_META.industry.color;
};

const bindGovTooltip = (marker: any, name: string, tooltipClassName = "infra-tooltip-layer") =>
  marker.bindTooltip(name, {
    direction: "top",
    offset: [0, -10],
    opacity: 0.97,
    className: `infra-tooltip ${tooltipClassName}`,
  });

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
  const iconBuilder =
    point.layer === "adsb"
      ? (active: boolean) => buildAdsbMarkerIcon(L, markerColor, point, active)
      : (active: boolean) => buildGovMarkerIcon(L, markerColor, active);
  const baseIcon = iconBuilder(false);
  const activeIcon = iconBuilder(true);

  const marker = L.marker([point.lat, point.lon], {
    icon: baseIcon,
    keyboard: false,
  });
  (marker as any).__infraIcons = { base: baseIcon, active: activeIcon };
  bindGovTooltip(marker, point.name, point.layer === "adsb" ? "infra-tooltip-adsb" : "infra-tooltip-layer");
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
  adsb: true,
  ...CRITICAL_DOMAIN_ORDER.reduce(
    (acc, domain) => ({ ...acc, [domain]: true }),
    {} as Record<CriticalInfraDomain, boolean>
  ),
};

const CLEARED_INFRA_FILTER_VISIBILITY: Record<InfraFilterLayerId, boolean> = {
  military: false,
  adsb: false,
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

const isWithinPhilippineBounds = (lat: number, lon: number) =>
  lat >= PHILIPPINE_BOUNDS.minLat &&
  lat <= PHILIPPINE_BOUNDS.maxLat &&
  lon >= PHILIPPINE_BOUNDS.minLon &&
  lon <= PHILIPPINE_BOUNDS.maxLon;

const formatAdsbAltitudeFeet = (altitudeMeters: number | null) =>
  typeof altitudeMeters === "number" && Number.isFinite(altitudeMeters)
    ? `${Math.round(altitudeMeters * 3.28084).toLocaleString("en-US")} ft`
    : "N/A";

const formatAdsbSpeedKnots = (velocityMps: number | null) =>
  typeof velocityMps === "number" && Number.isFinite(velocityMps)
    ? `${Math.round(velocityMps * 1.94384).toLocaleString("en-US")} kt`
    : "N/A";

const formatAdsbHeading = (headingDeg: number | null) =>
  typeof headingDeg === "number" && Number.isFinite(headingDeg)
    ? `${Math.round(headingDeg)}°`
    : "N/A";

const formatAdsbLocalTimestamp = (lastContactUnix: number | null) => {
  if (typeof lastContactUnix !== "number" || !Number.isFinite(lastContactUnix)) return "Unknown";
  return new Date(lastContactUnix * 1000).toLocaleString(undefined, {
    hour12: false,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatAdsbUpdatedAge = (lastContactUnix: number | null, nowUnixSeconds: number) => {
  if (typeof lastContactUnix !== "number" || !Number.isFinite(lastContactUnix)) return "unknown";
  return `${Math.max(0, Math.round(nowUnixSeconds - lastContactUnix))}s ago`;
};

type AdsbOperationalStatus = "Cruising" | "Parked" | "Signal lost";

const resolveAdsbOperationalStatus = (
  point: GovInfrastructurePoint,
  nowUnixSeconds: number
): AdsbOperationalStatus => {
  if (point.onGround) return "Parked";
  if (typeof point.lastUpdateUnix !== "number" || !Number.isFinite(point.lastUpdateUnix)) return "Signal lost";
  const ageSeconds = Math.max(0, nowUnixSeconds - point.lastUpdateUnix);
  if (ageSeconds > 120) return "Signal lost";
  return "Cruising";
};

const ADSB_OPERATOR_BY_CALLSIGN_PREFIX: Record<string, string> = {
  PAL: "Philippine Airlines",
  CEB: "Cebu Pacific",
  APG: "AirAsia Philippines",
  SEJ: "AirSwift",
};

const resolveAdsbOperatorLabel = (callsign: string | null, originCountry: string | null) => {
  if (!callsign) return originCountry ? `${originCountry} Operator` : "Unknown Operator";
  const normalized = callsign.toUpperCase();
  const prefix = normalized.slice(0, 3);
  const airlineName = ADSB_OPERATOR_BY_CALLSIGN_PREFIX[prefix] ?? (originCountry ? `${originCountry} Airline` : "Unknown Operator");
  return `${airlineName} - ${normalized} (Operator)`;
};

const buildAdsbPointNote = (aircraft: AdsbFeedAircraft, nowUnixSeconds: number) => {
  const altitudeText = formatAdsbAltitudeFeet(aircraft.altitudeMeters);
  const speedText = formatAdsbSpeedKnots(aircraft.velocityMps);
  const headingText = formatAdsbHeading(aircraft.headingDeg);
  const freshnessText = `Updated: ${formatAdsbUpdatedAge(aircraft.lastContact, nowUnixSeconds)}`;
  return `ADS-B track in Philippine airspace · Altitude ${altitudeText} · Speed ${speedText} · Heading ${headingText} · ${freshnessText}.`;
};

const mapAdsbAircraftToGovPoint = (
  aircraft: AdsbFeedAircraft,
  sourceLabel: string,
  nowUnixSeconds: number
): GovInfrastructurePoint => {
  const icao24 = aircraft.icao24.trim().toUpperCase();
  const callsign = (aircraft.callsign ?? "").trim().toUpperCase();
  const operatorLabel = resolveAdsbOperatorLabel(callsign.length > 0 ? callsign : null, aircraft.originCountry);
  const displayName = callsign.length > 0 ? `${callsign} (${icao24})` : `ICAO ${icao24}`;
  return {
    id: aircraft.id,
    layer: "adsb",
    domain: "Aerospace",
    name: displayName,
    category: "commercial aircraft",
    status: "Airborne",
    region: "Philippine airspace",
    province: "Philippine airspace",
    municipality: "Airspace Sector",
    contractor: operatorLabel,
    year: null,
    cost: null,
    lat: aircraft.lat,
    lon: aircraft.lon,
    note: buildAdsbPointNote(aircraft, nowUnixSeconds),
    source: sourceLabel,
    heading: aircraft.headingDeg,
    speed: aircraft.velocityMps,
    altitude: aircraft.altitudeMeters,
    onGround: aircraft.onGround,
    adsbTrackClass: "commercial",
    icao24,
    lastUpdateUnix: aircraft.lastContact,
  };
};

const ADSB_TRAJECTORY_BOUNDS = {
  minLat: PHILIPPINE_BOUNDS.minLat - 8,
  maxLat: PHILIPPINE_BOUNDS.maxLat + 8,
  minLon: PHILIPPINE_BOUNDS.minLon - 8,
  maxLon: PHILIPPINE_BOUNDS.maxLon + 8,
};
const ADSB_EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

const normalizeLongitude = (lon: number) => {
  let output = lon;
  while (output > 180) output -= 360;
  while (output < -180) output += 360;
  return output;
};

const projectPointByBearing = (
  lat: number,
  lon: number,
  bearingDeg: number,
  distanceMeters: number
): [number, number] => {
  const angularDistance = distanceMeters / ADSB_EARTH_RADIUS_METERS;
  const bearing = toRadians(bearingDeg);
  const latRad = toRadians(lat);
  const lonRad = toRadians(lon);
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const sinAngular = Math.sin(angularDistance);
  const cosAngular = Math.cos(angularDistance);

  const nextLatRad = Math.asin(
    sinLat * cosAngular + cosLat * sinAngular * Math.cos(bearing)
  );
  const nextLonRad = lonRad + Math.atan2(
    Math.sin(bearing) * sinAngular * cosLat,
    cosAngular - sinLat * Math.sin(nextLatRad)
  );

  return [toDegrees(nextLatRad), normalizeLongitude(toDegrees(nextLonRad))];
};

const isWithinTrajectoryBounds = (lat: number, lon: number) =>
  lat >= ADSB_TRAJECTORY_BOUNDS.minLat &&
  lat <= ADSB_TRAJECTORY_BOUNDS.maxLat &&
  lon >= ADSB_TRAJECTORY_BOUNDS.minLon &&
  lon <= ADSB_TRAJECTORY_BOUNDS.maxLon;

const buildProjectedTrajectoryLeg = (
  startLat: number,
  startLon: number,
  headingDeg: number,
  speedMps: number,
  direction: 1 | -1,
  maxSteps = 160,
  stepSeconds = 90
) => {
  const output: [number, number][] = [];
  let currentLat = startLat;
  let currentLon = startLon;
  const motionHeading = direction === 1 ? headingDeg : (headingDeg + 180) % 360;
  const stepDistance = Math.max(1, speedMps * stepSeconds);

  for (let index = 0; index < maxSteps; index += 1) {
    const [nextLat, nextLon] = projectPointByBearing(currentLat, currentLon, motionHeading, stepDistance);
    if (!isWithinTrajectoryBounds(nextLat, nextLon)) break;
    output.push([nextLat, nextLon]);
    currentLat = nextLat;
    currentLon = nextLon;
  }
  return output;
};

const buildExpectedTrajectoryCoords = (point: GovInfrastructurePoint) => {
  const headingDeg =
    typeof point.heading === "number" && Number.isFinite(point.heading) ? point.heading : 0;
  const speedMps =
    typeof point.speed === "number" && Number.isFinite(point.speed) && point.speed > 12
      ? point.speed
      : 230;
  const forwardLeg = buildProjectedTrajectoryLeg(point.lat, point.lon, headingDeg, speedMps, 1);
  const center: [number, number] = [point.lat, point.lon];
  return [center, ...forwardLeg];
};

function StrategicDomainIntelligence() {
  const [selectedGovPoint, setSelectedGovPoint] = useState<GovInfrastructurePoint | null>(null);
  const [activeProvinceId, setActiveProvinceId] = useState<string | null>(null);
  const [hoveredProvinceId, setHoveredProvinceId] = useState<string | null>(null);
  const {
    isOpen: showLimitedEnvironmentModal,
    isClosing: isLimitedEnvironmentClosing,
    open: openLimitedEnvironmentModal,
    close: closeLimitedEnvironmentModal,
  } = useLimitedEnvironmentModal(false);
  const [c2FilterEnabled, setC2FilterEnabled] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [layerVisibility, setLayerVisibility] = useState<Record<InfraFilterLayerId, boolean>>(
    DEFAULT_INFRA_FILTER_VISIBILITY
  );
  const [govLayerState, setGovLayerState] = useState<"loading" | "ready" | "error">("loading");
  const [adsbLayerState, setAdsbLayerState] = useState<"loading" | "ready" | "error">("loading");
  const [adsbAircraftPoints, setAdsbAircraftPoints] = useState<GovInfrastructurePoint[]>([]);
  const [adsbLastUpdatedAt, setAdsbLastUpdatedAt] = useState<number | null>(null);
  const [adsbActiveViewMs, setAdsbActiveViewMs] = useState(0);
  const [adsbSessionPaused, setAdsbSessionPaused] = useState(false);
  const [showAdsbSessionPauseModal, setShowAdsbSessionPauseModal] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [isInfraStageInViewport, setIsInfraStageInViewport] = useState(false);
  const [mapZoom, setMapZoom] = useState(INFRA_DEFAULT_ZOOM);
  const [selectedRegionCenter, setSelectedRegionCenter] = useState<[number, number] | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading");

  const mapStageRef = useRef<HTMLDivElement | null>(null);
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const provinceShapeRefs = useRef<Record<string, any>>({});
  const provinceMetaRef = useRef<Record<string, ProvinceBoundaryFeature>>({});
  const govLayerRefs = useRef<Record<GovInfraLayerId, any>>({ military: null, industry: null, adsb: null });
  const govMarkersRef = useRef<Record<string, any>>({});
  const adsbTrackHistoryRef = useRef<Record<string, AdsbTrackSample[]>>({});
  const adsbFlightPathLayerRef = useRef<any>(null);
  const selectedGovKeyRef = useRef<string | null>(null);
  const suppressNextMapClearRef = useRef(false);
  const wheelZoomCooldownRef = useRef(0);
  const pointerInsideMapStageRef = useRef(false);

  useEffect(() => {
    const syncDocumentVisibility = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };
    syncDocumentVisibility();
    document.addEventListener("visibilitychange", syncDocumentVisibility);
    return () => {
      document.removeEventListener("visibilitychange", syncDocumentVisibility);
    };
  }, []);

  useEffect(() => {
    const target = mapStageRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInfraStageInViewport(entry.isIntersecting && entry.intersectionRatio >= 0.18);
      },
      { threshold: [0, 0.18, 0.35] }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

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

  const visibleAdsbCount = layerVisibility.adsb ? adsbAircraftPoints.length : 0;
  const totalLivePoints =
    (layerVisibility.military ? MILITARY_FACILITIES.length : 0) + visibleCriticalCount + visibleAdsbCount;
  const activeFilterCount =
    (layerVisibility.military ? 1 : 0) +
    (layerVisibility.adsb ? 1 : 0) +
    CRITICAL_DOMAIN_ORDER.filter((domain) => layerVisibility[domain]).length;

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
      : String(activeFilterCount);

  const selectedSummary = selectedGovPoint
    ? selectedGovPoint.note
    : selectedProvince
      ? "Province boundary selected. Counts summarize mapped military and critical domain points in this region."
      : "Select a beacon for domain detail, or click a province boundary for regional detail.";

  const selectedSource = selectedGovPoint
    ? selectedGovPoint.source
    : selectedProvince
      ? "Province boundary overlays and mapped domain registry"
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
  const selectedIsAdsb = Boolean(selectedGovPoint && selectedGovPoint.layer === "adsb");
  const selectedAdsbNowUnixSeconds = Math.floor(Date.now() / 1000);
  const selectedAdsbStatus: AdsbOperationalStatus | null = selectedIsAdsb && selectedGovPoint
    ? resolveAdsbOperationalStatus(selectedGovPoint, selectedAdsbNowUnixSeconds)
    : null;
  const selectedAdsbStatusLabel = selectedIsAdsb && selectedGovPoint
    ? `${selectedAdsbStatus ?? "Signal lost"} (${selectedGovPoint.status})`
    : "Signal lost";
  const selectedAdsbMetrics = selectedIsAdsb && selectedGovPoint
    ? [
        { label: "Altitude", value: formatAdsbAltitudeFeet(selectedGovPoint.altitude ?? null), fullWidth: false },
        { label: "Speed", value: formatAdsbSpeedKnots(selectedGovPoint.speed ?? null), fullWidth: false },
        { label: "Heading", value: formatAdsbHeading(selectedGovPoint.heading ?? null), fullWidth: false },
        { label: "ICAO24", value: selectedGovPoint.icao24 ?? "N/A", fullWidth: false },
        { label: "Last updated", value: formatAdsbLocalTimestamp(selectedGovPoint.lastUpdateUnix ?? null), fullWidth: true },
      ]
    : [];
  const adsbLastUpdatedLabel = adsbLastUpdatedAt
    ? new Date(adsbLastUpdatedAt).toLocaleTimeString("en-US", { hour12: false })
    : null;
  const activeZoomLevelIndex = nearestZoomLevelIndex(mapZoom);
  const disableProvinceHover = activeZoomLevelIndex >= INFRA_LEVEL3_INDEX;
  const adsbVisibilityEligible =
    layerVisibility.adsb &&
    isDocumentVisible &&
    isInfraStageInViewport &&
    !showLimitedEnvironmentModal;
  const adsbPollingEnabled = adsbVisibilityEligible && !adsbSessionPaused;
  const adsbPollIntervalMs = adsbActiveViewMs < ADSB_ULTRA_FAST_POLL_WINDOW_MS
    ? ADSB_ULTRA_FAST_POLL_MS
    : adsbActiveViewMs < ADSB_FAST_POLL_WINDOW_MS
      ? ADSB_FAST_POLL_MS
      : ADSB_SLOW_POLL_MS;

  const loadLeaflet = async () => {
    if (!document.getElementById("sdemo-leaflet-css")) {
      const link = document.createElement("link");
      link.id = "sdemo-leaflet-css";
      link.rel = "stylesheet";
      link.href = "/vendor/leaflet/leaflet.css";
      document.head.appendChild(link);
    }

    const leafletModule = await import("leaflet");
    const Leaflet = (leafletModule as { default?: any }).default ?? leafletModule;
    if (!Leaflet) throw new Error("Leaflet unavailable");
    return Leaflet;
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
          zoomSnap: 0,
          zoomDelta: 0.25,
          zoomAnimation: false,
          fadeAnimation: false,
          markerZoomAnimation: false,
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
            suppressNextMapClearRef.current = true;
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
          if (suppressNextMapClearRef.current) {
            suppressNextMapClearRef.current = false;
            return;
          }
          setSelectedGovPoint(null);
          setActiveProvinceId(null);
          setHoveredProvinceId(null);
          setSelectedRegionCenter(null);
        });

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
      govMarkersRef.current = {};
      govLayerRefs.current = { military: null, industry: null, adsb: null };
      adsbTrackHistoryRef.current = {};
      if (mapInstanceRef.current && adsbFlightPathLayerRef.current && mapInstanceRef.current.hasLayer(adsbFlightPathLayerRef.current)) {
        mapInstanceRef.current.removeLayer(adsbFlightPathLayerRef.current);
      }
      adsbFlightPathLayerRef.current = null;
      provinceShapeRefs.current = {};
      provinceMetaRef.current = {};
      pointerInsideMapStageRef.current = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!adsbPollingEnabled) return;

    let lastTickMs = Date.now();
    const timerId = window.setInterval(() => {
      const nowMs = Date.now();
      const elapsedMs = Math.max(0, nowMs - lastTickMs);
      lastTickMs = nowMs;
      setAdsbActiveViewMs((current) => Math.min(ADSB_AUTO_PAUSE_AFTER_MS, current + elapsedMs));
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [adsbPollingEnabled]);

  useEffect(() => {
    if (adsbSessionPaused) return;
    if (adsbActiveViewMs < ADSB_AUTO_PAUSE_AFTER_MS) return;
    setAdsbSessionPaused(true);
    setShowAdsbSessionPauseModal(true);
  }, [adsbActiveViewMs, adsbSessionPaused]);

  useEffect(() => {
    if (!adsbPollingEnabled) return;

    let alive = true;
    let timerId: number | null = null;
    let activeRequestController: AbortController | null = null;

    const scheduleNext = () => {
      if (!alive) return;
      timerId = window.setTimeout(syncAdsbFeed, adsbPollIntervalMs);
    };

    const syncAdsbFeed = async () => {
      setAdsbLayerState((current) => (current === "ready" ? "ready" : "loading"));
      activeRequestController?.abort();
      activeRequestController = new AbortController();
      try {
        const response = await fetch(`/api/adsb/philippines?cadenceMs=${adsbPollIntervalMs}`, {
          cache: "no-store",
          signal: activeRequestController.signal,
        });
        if (!response.ok) {
          throw new Error("ADS-B feed unavailable");
        }
        const payload = (await response.json()) as AdsbFeedResponse;
        if (!alive) return;
        const sourceLabel =
          typeof payload.source === "string" && payload.source.trim().length > 0
            ? payload.source
            : GOV_INFRA_LAYER_META.adsb.source;
        const aircraft = Array.isArray(payload.aircraft) ? payload.aircraft : [];
        const nowUnixSeconds = Math.floor(Date.now() / 1000);
        const mappedPoints = aircraft
          .filter(
            (entry): entry is AdsbFeedAircraft =>
              typeof entry?.lat === "number" &&
              Number.isFinite(entry.lat) &&
              typeof entry?.lon === "number" &&
              Number.isFinite(entry.lon)
          )
          .filter((entry) => isWithinPhilippineBounds(entry.lat, entry.lon))
          .map((entry) => mapAdsbAircraftToGovPoint(entry, sourceLabel, nowUnixSeconds));

        const nowMs = Date.now();
        const cutoff = nowMs - ADSB_TRACK_HISTORY_WINDOW_MS;
        const nextTrackHistory: Record<string, AdsbTrackSample[]> = {};

        Object.entries(adsbTrackHistoryRef.current).forEach(([trackId, samples]) => {
          const trimmedSamples = samples.filter((sample) => sample.t >= cutoff);
          if (trimmedSamples.length === 0) return;
          nextTrackHistory[trackId] = trimmedSamples;
        });

        mappedPoints.forEach((point) => {
          const pointTs =
            typeof point.lastUpdateUnix === "number" && Number.isFinite(point.lastUpdateUnix)
              ? point.lastUpdateUnix * 1000
              : nowMs;
          const history = nextTrackHistory[point.id] ? [...nextTrackHistory[point.id]] : [];
          const lastSample = history[history.length - 1];
          const latDelta = lastSample ? Math.abs(lastSample.lat - point.lat) : Number.POSITIVE_INFINITY;
          const lonDelta = lastSample ? Math.abs(lastSample.lon - point.lon) : Number.POSITIVE_INFINITY;
          if (!lastSample || latDelta > ADSB_TRACK_POSITION_STEP_THRESHOLD || lonDelta > ADSB_TRACK_POSITION_STEP_THRESHOLD) {
            history.push({ lat: point.lat, lon: point.lon, t: pointTs });
          } else {
            history[history.length - 1] = { lat: point.lat, lon: point.lon, t: pointTs };
          }
          nextTrackHistory[point.id] = history.slice(-ADSB_TRACK_HISTORY_MAX_POINTS);
        });

        adsbTrackHistoryRef.current = nextTrackHistory;

        setAdsbAircraftPoints(mappedPoints);
        setAdsbLayerState("ready");
        setAdsbLastUpdatedAt(nowMs);
      } catch (error) {
        if (!alive) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        setAdsbLayerState("error");
      } finally {
        scheduleNext();
      }
    };

    syncAdsbFeed();

    return () => {
      alive = false;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
      activeRequestController?.abort();
    };
  }, [adsbPollingEnabled, adsbPollIntervalMs]);

  useEffect(() => {
    if (!selectedGovPoint || selectedGovPoint.layer !== "adsb") return;
    const nextSelectedPoint = adsbAircraftPoints.find((point) => point.id === selectedGovPoint.id);
    if (!nextSelectedPoint) {
      setSelectedGovPoint(null);
      return;
    }
    if (
      selectedGovPoint.lastUpdateUnix === nextSelectedPoint.lastUpdateUnix &&
      Math.abs(selectedGovPoint.lat - nextSelectedPoint.lat) < 0.0001 &&
      Math.abs(selectedGovPoint.lon - nextSelectedPoint.lon) < 0.0001
    ) {
      return;
    }
    setSelectedGovPoint(nextSelectedPoint);
  }, [adsbAircraftPoints, selectedGovPoint]);

  useEffect(() => {
    if (mapState !== "ready") return;
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    if (adsbFlightPathLayerRef.current && map.hasLayer(adsbFlightPathLayerRef.current)) {
      map.removeLayer(adsbFlightPathLayerRef.current);
    }
    adsbFlightPathLayerRef.current = null;

    if (!selectedGovPoint || selectedGovPoint.layer !== "adsb") return;
    const trackSamples = adsbTrackHistoryRef.current[selectedGovPoint.id] ?? [];
    const observedTrajectoryColor = "#38bdf8";
    const expectedTrajectoryColor = "#f59e0b";
    const trajectoryLayer = L.layerGroup();

    const expectedTrajectory = buildExpectedTrajectoryCoords(selectedGovPoint);
    let expectedPath: any = null;
    if (expectedTrajectory.length >= 2) {
      expectedPath = L.polyline(expectedTrajectory, {
        color: expectedTrajectoryColor,
        weight: 1.2,
        opacity: 1,
        dashArray: "8 9",
        lineJoin: "round",
        lineCap: "round",
        interactive: false,
        className: "infra-adsb-flight-path infra-adsb-trajectory-expected",
      }).addTo(trajectoryLayer);
    }

    let observedPath: any = null;
    if (trackSamples.length >= 2) {
      const observedCoords = trackSamples.map((sample) => [sample.lat, sample.lon] as [number, number]);
      const currentCoord: [number, number] = [selectedGovPoint.lat, selectedGovPoint.lon];
      const lastObserved = observedCoords[observedCoords.length - 1];
      if (!lastObserved || Math.abs(lastObserved[0] - currentCoord[0]) > 0.0001 || Math.abs(lastObserved[1] - currentCoord[1]) > 0.0001) {
        observedCoords.push(currentCoord);
      }
      observedPath = L.polyline(observedCoords, {
        color: observedTrajectoryColor,
        weight: 1.35,
        opacity: 1,
        lineJoin: "round",
        lineCap: "round",
        interactive: false,
        className: "infra-adsb-flight-path infra-adsb-trajectory-observed",
      }).addTo(trajectoryLayer);
    }

    const crosshair = L.marker([selectedGovPoint.lat, selectedGovPoint.lon], {
      icon: L.divIcon({
        className: "infra-adsb-focus-shell",
        iconSize: [72, 72],
        iconAnchor: [36, 36],
        html: `<span class="infra-adsb-focus-crosshair" aria-hidden="true"><span class="infra-adsb-focus-ring"></span><span class="infra-adsb-focus-arm arm-n"></span><span class="infra-adsb-focus-arm arm-s"></span><span class="infra-adsb-focus-arm arm-w"></span><span class="infra-adsb-focus-arm arm-e"></span></span>`,
      }),
      keyboard: false,
      interactive: false,
      zIndexOffset: -480,
    }).addTo(trajectoryLayer);

    trajectoryLayer.addTo(map);
    expectedPath?.bringToBack?.();
    observedPath?.bringToBack?.();
    crosshair.bringToBack?.();
    adsbFlightPathLayerRef.current = trajectoryLayer;
  }, [mapState, selectedGovPoint, adsbAircraftPoints]);

  useEffect(() => {
    if (mapState !== "ready") return;
    const map = mapInstanceRef.current;
    if (!map || !selectedGovPoint || selectedGovPoint.layer !== "adsb") return;
    map.flyTo(
      [selectedGovPoint.lat, selectedGovPoint.lon],
      INFRA_ZOOM_LEVELS[INFRA_LEVEL3_INDEX].zoom,
      { duration: 0.8 }
    );
  }, [mapState, selectedGovPoint]);

  useEffect(() => {
    if (mapState !== "ready" || !trackingEnabled || showLimitedEnvironmentModal) return;
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
  }, [mapState, trackingEnabled, showLimitedEnvironmentModal]);

  useEffect(() => {
    if (mapState !== "ready") return;
    const map = mapInstanceRef.current;
    if (!map) return;

    if (showLimitedEnvironmentModal) {
      map.dragging?.disable?.();
      return;
    }

    map.dragging?.enable?.();
  }, [mapState, showLimitedEnvironmentModal]);

  useEffect(() => {
    if (mapState !== "ready" || govLayerState !== "ready") return;
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    const nextGovLayers: Record<GovInfraLayerId, any> = {
      military: L.layerGroup(),
      industry: L.layerGroup(),
      adsb: L.layerGroup(),
    };
    const nextGovMarkersByLayer: Record<GovInfraLayerId, any[]> = { military: [], industry: [], adsb: [] };
    const nextGovMarkers: Record<string, any> = {};

    const activeCriticalDomains = new Set(
      CRITICAL_DOMAIN_ORDER.filter((domain) => layerVisibility[domain])
    );
    const visiblePointsByLayer: Record<GovInfraLayerId, GovInfrastructurePoint[]> = {
      military: layerVisibility.military ? MILITARY_FACILITIES : [],
      industry: CRITICAL_INFRASTRUCTURE_POINTS.filter(
        (point) =>
          point.domain &&
          activeCriticalDomains.has(point.domain)
      ),
      adsb: layerVisibility.adsb ? adsbAircraftPoints : [],
    };

    const onSelectPoint = (selectedPoint: GovInfrastructurePoint) => {
      suppressNextMapClearRef.current = true;
      setActiveProvinceId(null);
      setHoveredProvinceId(null);
      setSelectedRegionCenter([selectedPoint.lat, selectedPoint.lon]);
      setSelectedGovPoint(selectedPoint);
    };

    (["military", "industry", "adsb"] as GovInfraLayerId[]).forEach((layerId) => {
      visiblePointsByLayer[layerId].forEach((point) => {
        const marker = buildGovPointMarker(L, point, onSelectPoint);
        const markerKey = `${layerId}:${point.id}`;
        nextGovMarkersByLayer[layerId].push(marker);
        nextGovMarkers[markerKey] = marker;
      });
      populateInfraLayer(nextGovLayers[layerId], nextGovMarkersByLayer[layerId]);
    });

    (["military", "industry", "adsb"] as GovInfraLayerId[]).forEach((layerId) => {
      const currentLayer = govLayerRefs.current[layerId];
      if (currentLayer && map.hasLayer(currentLayer)) {
        map.removeLayer(currentLayer);
      }
      if (nextGovMarkersByLayer[layerId].length > 0) {
        map.addLayer(nextGovLayers[layerId]);
      }
    });

    govLayerRefs.current = nextGovLayers;
    govMarkersRef.current = nextGovMarkers;
  }, [layerVisibility, mapState, govLayerState, adsbAircraftPoints]);

  useEffect(() => {
    if (mapState !== "ready") return;
    applyProvinceLayerStyles(
      provinceShapeRefs.current,
      activeProvinceId,
      hoveredProvinceId,
      disableProvinceHover
    );
  }, [mapState, activeProvinceId, hoveredProvinceId, disableProvinceHover]);

  useEffect(() => {
    if (!disableProvinceHover) return;
    if (hoveredProvinceId !== null) setHoveredProvinceId(null);
  }, [disableProvinceHover, hoveredProvinceId]);

  useEffect(() => {
    if (!selectedGovPoint) return;
    if (selectedGovPoint.layer === "adsb") {
      if (!layerVisibility.adsb) {
        setSelectedGovPoint(null);
      }
      return;
    }
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
      if (!active && typeof marker.closeTooltip === "function") {
        marker.closeTooltip();
      }
    };

    const previousKey = selectedGovKeyRef.current;
    if (previousKey) {
      const previousMarker = govMarkersRef.current[previousKey];
      applyMarkerVisual(previousMarker, false);
    }

    if (!selectedGovPoint) {
      selectedGovKeyRef.current = null;
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

    if (selectedGovPoint.layer === "adsb") {
      marker.openTooltip?.();
      return;
    }

    if (previousKey === markerKey) {
      return;
    }

    marker.openTooltip?.();

    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(
      [selectedGovPoint.lat, selectedGovPoint.lon],
      INFRA_ZOOM_LEVELS[nearestZoomLevelIndex(Math.max(map.getZoom(), 10))].zoom,
      { duration: 0.9 }
    );
  }, [selectedGovPoint, layerVisibility, mapState, govLayerState, adsbAircraftPoints]);

  const resetViewport = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView(INFRA_DEFAULT_CENTER, INFRA_DEFAULT_ZOOM, { animate: true, duration: 0.8 });
    setLayerVisibility({ ...DEFAULT_INFRA_FILTER_VISIBILITY });
    setAdsbActiveViewMs(0);
    setAdsbSessionPaused(false);
    setShowAdsbSessionPauseModal(false);
    setHoveredProvinceId(null);
    setActiveProvinceId(null);
    setSelectedGovPoint(null);
    setSelectedRegionCenter(null);
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

  useEffect(() => {
    const stage = mapStageRef.current;
    if (!stage) return;

    const markInside = () => {
      pointerInsideMapStageRef.current = true;
    };
    const markOutside = () => {
      pointerInsideMapStageRef.current = false;
    };

    stage.addEventListener("mouseenter", markInside);
    stage.addEventListener("mouseleave", markOutside);
    window.addEventListener("blur", markOutside);

    return () => {
      stage.removeEventListener("mouseenter", markInside);
      stage.removeEventListener("mouseleave", markOutside);
      window.removeEventListener("blur", markOutside);
      pointerInsideMapStageRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handleWindowWheelCapture = (event: WheelEvent) => {
      if (showLimitedEnvironmentModal) return;
      const stage = mapStageRef.current;
      const target = event.target;
      const targetInsideStage = Boolean(stage && target instanceof Node && stage.contains(target));
      if (!pointerInsideMapStageRef.current && !targetInsideStage) return;

      event.preventDefault();
      event.stopPropagation();

      if (mapState !== "ready") return;

      const now = performance.now();
      if (now - wheelZoomCooldownRef.current < 16) return;
      wheelZoomCooldownRef.current = now;

      const map = mapInstanceRef.current;
      if (!map) return;

      const deltaModeScale =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const normalizedDeltaY = event.deltaY * deltaModeScale;
      if (normalizedDeltaY === 0) return;

      const currentZoom = map.getZoom();
      const wheelDeltaZoom = -normalizedDeltaY * 0.01;
      const deltaZoom = Math.max(-0.9, Math.min(0.9, wheelDeltaZoom));
      const nextZoom = Math.max(INFRA_MIN_ZOOM, Math.min(INFRA_MAX_ZOOM, currentZoom + deltaZoom));
      if (Math.abs(nextZoom - currentZoom) < 0.0001) return;
      map.setZoom(nextZoom, { animate: false });
    };

    window.addEventListener("wheel", handleWindowWheelCapture, { capture: true, passive: false });
    return () => {
      window.removeEventListener("wheel", handleWindowWheelCapture, true);
    };
  }, [mapState, showLimitedEnvironmentModal]);

  const toggleLayer = (layer: InfraFilterLayerId) => {
    setLayerVisibility((prev) => {
      const nextValue = !(prev[layer] ?? false);
      if (layer === "adsb" && nextValue) {
        setAdsbActiveViewMs(0);
        setAdsbSessionPaused(false);
        setShowAdsbSessionPauseModal(false);
      }
      if (layer === "adsb" && !nextValue) {
        setShowAdsbSessionPauseModal(false);
      }
      return { ...prev, [layer]: nextValue };
    });
  };

  const clearFilters = () => {
    setLayerVisibility(CLEARED_INFRA_FILTER_VISIBILITY);
    setShowAdsbSessionPauseModal(false);
    setSelectedGovPoint(null);
    setSelectedRegionCenter(null);
  };

  const visibleGovernmentPointCount = totalLivePoints - visibleAdsbCount;
  const adsbPausedBySessionCap = layerVisibility.adsb && adsbSessionPaused;
  const adsbPausedOffscreen = layerVisibility.adsb && !adsbSessionPaused && !adsbVisibilityEligible;
  const adsbPaused = adsbPausedBySessionCap || adsbPausedOffscreen;
  const showAdsbLoadingScreen =
    mapState === "ready" &&
    layerVisibility.adsb &&
    !adsbPaused &&
    adsbLayerState === "loading" &&
    (!adsbLastUpdatedAt || adsbAircraftPoints.length === 0);
  const mapChipStatus =
    govLayerState === "error" || (layerVisibility.adsb && !adsbPaused && adsbLayerState === "error")
      ? "error"
      : govLayerState === "loading" || (layerVisibility.adsb && !adsbPaused && adsbLayerState === "loading" && !adsbLastUpdatedAt)
        ? "loading"
        : "ready";
  const mapChipLabel =
    govLayerState === "loading"
      ? "Loading government layers..."
      : govLayerState === "error"
        ? "Government dataset unavailable"
      : !layerVisibility.adsb
          ? `${visibleGovernmentPointCount.toLocaleString("en-US")} GOVERNMENT POINTS LIVE`
          : adsbPausedBySessionCap
            ? `${totalLivePoints.toLocaleString("en-US")} LIVE TRACKS · ADS-B PAUSED (20M SESSION CAP)`
          : adsbPausedOffscreen
            ? `${totalLivePoints.toLocaleString("en-US")} LIVE TRACKS · ADS-B PAUSED (OFFSCREEN)`
          : adsbLayerState === "loading" && !adsbLastUpdatedAt
            ? "Syncing ADS-B aircraft feed..."
          : adsbLayerState === "error"
              ? `${visibleGovernmentPointCount.toLocaleString("en-US")} GOVERNMENT POINTS LIVE · ADS-B OFFLINE`
              : `${totalLivePoints.toLocaleString("en-US")} LIVE TRACKS · ${visibleAdsbCount.toLocaleString("en-US")} AIRCRAFT · ${Math.round(adsbPollIntervalMs / 1000)}S POLL${adsbLastUpdatedLabel ? ` · UPDATED ${adsbLastUpdatedLabel}` : ""}`;

  return (
    <div className={`sw-panel infra-panel${showLimitedEnvironmentModal ? " sw-panel-modal-open" : ""}`}>
      <div className="infra-topbar">
        <div className="sw-mono infra-topbar-title">PHILIPPINE STRATEGIC DOMAIN INTELLIGENCE</div>
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
            aria-label="Toggle ISR filter"
          >
            {c2FilterEnabled ? "ISR ON" : "ISR OFF"}
          </button>
          <button type="button" onClick={clearFilters} className="infra-clear-filters">CLEAR FILTERS</button>
          <button type="button" onClick={resetViewport} className="infra-reset">RESET</button>
        </div>
      </div>

      <div className="infra-layout">
        <aside className="infra-details-panel">
          <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", letterSpacing: "0.18em", marginBottom: "0.4rem" }}>
            SELECTION_DETAILS
          </div>
          {selectedIsAdsb && selectedGovPoint ? (
            <>
              <div className="infra-adsb-title-row">
                <span className={`infra-adsb-status-line status-${(selectedAdsbStatus ?? "Signal lost").toLowerCase().replace(" ", "-")}`}>
                  <span className="infra-adsb-status-dot" aria-hidden="true" />
                  <span className="infra-adsb-status-label">{selectedAdsbStatusLabel}</span>
                </span>
                <h3 className="infra-title">{selectedTitle}</h3>
              </div>
              <div className="infra-adsb-track-class">{selectedGovPoint.category}</div>
              <div className="infra-adsb-operator">{selectedOperator}</div>
              <div className="infra-adsb-airspace">Philippine airspace</div>
              <div className="infra-adsb-metrics-grid">
                {selectedAdsbMetrics.map((metric) => (
                  <div key={metric.label} className={`infra-adsb-metric${metric.fullWidth ? " full" : ""}`}>
                    <div className="sw-mono sw-dim infra-k">{metric.label}</div>
                    <div className="infra-v">{metric.value}</div>
                  </div>
                ))}
              </div>
              <div className="sw-mono sw-dim infra-source-tag">SOURCE: {selectedSource}</div>
            </>
          ) : (
            <>
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
            </>
          )}
          <div className="infra-limited-sidebanner" role="note" aria-label="Limited functionality notice">
            <button
              type="button"
              className="infra-limited-sidebanner-info"
              aria-label="Open limited functionality information"
              onClick={openLimitedEnvironmentModal}
            >
              !
            </button>
            <span className="sw-mono infra-limited-sidebanner-tag">DISCLAIMER</span>
            <span className="infra-limited-sidebanner-label">Limited Functionality</span>
            <p className="infra-limited-sidebanner-copy">
              Full operational access is available through private briefing or licensed deployment.
            </p>
            <a href={LIMITED_ENVIRONMENT_LINKS.domain.requestDemoHref} className="infra-limited-sidebanner-cta">
              Request a Demo
            </a>
          </div>
        </aside>

        <div
          ref={mapStageRef}
          className={`infra-map-stage${showLimitedEnvironmentModal ? "" : " crosshair-enabled"}${c2FilterEnabled ? " infra-map-stage-c2" : ""}${activeZoomLevelIndex === INFRA_LEVEL3_INDEX ? " infra-map-stage-level3" : ""}${showLimitedEnvironmentModal ? " infra-map-stage-modal-open" : ""}`}
        >
          <div ref={mapHostRef} className="infra-leaflet-map" />
          <Crosshair color="var(--sdemo-crosshair-color, rgba(255,255,255,0.86))" containerRef={mapStageRef} />
          {mapState === "ready" && (
            <div className={`infra-gov-chip ${mapChipStatus}`}>
              <span className="sw-mono">
                {mapChipLabel}
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
          {showAdsbLoadingScreen && (
            <div className="infra-adsb-loading-screen" role="status" aria-live="polite">
              <span className="infra-adsb-loading-spinner" aria-hidden="true" />
              <span className="sw-mono infra-adsb-loading-text">Fetching live ADS-B feed...</span>
            </div>
          )}
        </div>

        <aside className="infra-filters-panel">
          <div className="sw-mono sw-dim" style={{ fontSize: "0.58rem", letterSpacing: "0.18em" }}>
            MAP_LAYERS
          </div>
          <div className="infra-layer-list">
            <label className={`infra-layer-item${layerVisibility.adsb ? " active" : ""}`}>
              <span className="infra-layer-toggle-shell infra-layer-toggle-shell-adsb">
                <input
                  className="infra-layer-toggle-adsb"
                  type="checkbox"
                  checked={Boolean(layerVisibility.adsb)}
                  onChange={() => toggleLayer("adsb")}
                  aria-label="Toggle aircraft layer"
                />
                <i
                  className={`bi ${layerVisibility.adsb ? "bi-airplane-fill" : "bi-airplane"} infra-layer-aircraft-icon`}
                  aria-hidden="true"
                />
              </span>
              <span className="infra-layer-copy">
                <span className="infra-layer-text">{GOV_INFRA_LAYER_META.adsb.label}</span>
              </span>
              <span className="sw-mono infra-layer-count">
                {adsbLayerState === "error" ? "OFFLINE" : adsbAircraftPoints.length.toLocaleString("en-US")}
              </span>
            </label>

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
      {showAdsbSessionPauseModal && (
        <div className="infra-adsb-session-modal-wrap" role="dialog" aria-modal="true" aria-label="ADS-B session paused notice">
          <div className="infra-adsb-session-modal">
            <div className="sw-mono infra-adsb-session-modal-kicker">ADS-B SESSION PAUSED</div>
            <h4 className="infra-adsb-session-modal-title">Live aircraft data paused after 20 minutes.</h4>
            <p className="infra-adsb-session-modal-note">To continue live tracking, reload the site.</p>
            <button type="button" className="infra-adsb-session-modal-btn" onClick={() => window.location.reload()}>
              Reload Site
            </button>
          </div>
        </div>
      )}
      {showLimitedEnvironmentModal && (
        <LimitedEnvironmentModal
          surfaceLabel="Strategic Domain Intelligence"
          definitionTitle={LIMITED_ENVIRONMENT_DEFINITIONS.domain.title}
          definitionDescription={LIMITED_ENVIRONMENT_DEFINITIONS.domain.description}
          requestDemoHref={LIMITED_ENVIRONMENT_LINKS.domain.requestDemoHref}
          showPrimaryAction={false}
          showSecondaryAction={false}
          showDisclaimer={false}
          isClosing={isLimitedEnvironmentClosing}
          onClose={closeLimitedEnvironmentModal}
        />
      )}
    </div>
  );
}

const COMMAND_WORKSTREAMS = [
  {
    id: "timeline",
    title: "Incident Timeline",
    status: "Queued",
    items: ["Cross-agency event stream", "Escalation checkpoints", "Responder acknowledgements"],
  },
  {
    id: "dispatch",
    title: "Taskforce Dispatch",
    status: "Designing",
    items: ["Role-based assignments", "Geo-fenced response units", "Rules for authority handoffs"],
  },
  {
    id: "playbooks",
    title: "Playbook Engine",
    status: "Planning",
    items: ["Crisis runbooks", "Automatic policy triggers", "After-action report output"],
  },
] as const;

// Command & Control window scaffold: replace cards and telemetry blocks as this module evolves.
function CommandControlWindow() {
  const {
    isOpen: showLimitedEnvironmentModal,
    isClosing: isLimitedEnvironmentClosing,
    open: openLimitedEnvironmentModal,
    close: closeLimitedEnvironmentModal,
  } = useLimitedEnvironmentModal(false);
  const time = useClock();

  return (
    <div className={`sw-panel command-panel${showLimitedEnvironmentModal ? " sw-panel-modal-open" : ""}`}>
      <div className="scanline" />
      <div className="command-shell">
        <div className="command-header">
          <div>
            <div className="sw-mono command-kicker">COMMAND & CONTROL // WORKBENCH</div>
            <h3 className="command-title">Mission Orchestration Surface</h3>
            <p className="command-desc">
              This window is scaffolded for your upcoming edits. Replace these blocks with your incident controls,
              routing logic, and command workflows.
            </p>
          </div>
          <div className="command-stamp sw-mono">
            <span>STATUS: RESERVED</span>
            <span>{time}</span>
          </div>
        </div>

        <div className="command-grid">
          {COMMAND_WORKSTREAMS.map((workstream) => (
            <article key={workstream.id} className="command-card">
              <div className="command-card-top">
                <h4>{workstream.title}</h4>
                <span className="sw-mono">{workstream.status}</span>
              </div>
              <ul className="command-items">
                {workstream.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="command-footer sw-mono">
          Reserve this space for mission timeline, command approvals, and inter-agency escalation pathways.
        </div>
      </div>
      {!showLimitedEnvironmentModal && (
        <LimitedEnvironmentNoticeStrip
          label="Command and Control"
          onClick={openLimitedEnvironmentModal}
        />
      )}
      {showLimitedEnvironmentModal && (
        <LimitedEnvironmentModal
          surfaceLabel="Command and Control"
          definitionTitle={LIMITED_ENVIRONMENT_DEFINITIONS.command.title}
          definitionDescription={LIMITED_ENVIRONMENT_DEFINITIONS.command.description}
          requestDemoHref={LIMITED_ENVIRONMENT_LINKS.command.requestDemoHref}
          isClosing={isLimitedEnvironmentClosing}
          onClose={closeLimitedEnvironmentModal}
        />
      )}
    </div>
  );
}

function LearnMoreCard() {
  const {
    isOpen: showLimitedEnvironmentModal,
    isClosing: isLimitedEnvironmentClosing,
    open: openLimitedEnvironmentModal,
    close: closeLimitedEnvironmentModal,
  } = useLimitedEnvironmentModal(false);

  return (
    <div className={`sw-panel command-panel${showLimitedEnvironmentModal ? " sw-panel-modal-open" : ""}`}>
      {!showLimitedEnvironmentModal && (
        <LimitedEnvironmentNoticeStrip
          label="Platform Overview"
          onClick={openLimitedEnvironmentModal}
        />
      )}
      {showLimitedEnvironmentModal && (
        <LimitedEnvironmentModal
          surfaceLabel="Platform Overview"
          definitionTitle="Expand the Strategic Platform"
          definitionDescription="Explore every strategic system window, operational capability, and sector deployment surface."
          requestDemoHref="#what-we-do"
          primaryLabel="View Technologies"
          primaryHref="#what-we-do"
          secondaryLabel="Check Industries"
          secondaryHref="#industries-we-serve"
          showPrimaryIcon={false}
          isClosing={isLimitedEnvironmentClosing}
          onClose={closeLimitedEnvironmentModal}
        />
      )}
    </div>
  );
}

type SoftwareWindowDefinition = {
  id: "government" | "domain" | "command" | "learn";
  tag: string;
  name: string;
  industry: string;
  tagline: string;
  desc: string;
  status: string;
  uptime: string;
  component: () => ReactElement;
};

const SOFTWARE_WINDOWS: SoftwareWindowDefinition[] = [
  {
    id: "government", tag: "01", name: "Government Systems", industry: "Public Sector",
    tagline: "Unified Government Services Framework",
    desc: "A coordinated national services framework for the Philippines, built to eliminate fragmented agency workflows and deliver seamless citizen service.",
    status: "LIVE",
    uptime: "99.98%",
    component: GovernmentSystemsWindow,
  },
  {
    id: "domain", tag: "02", name: "Strategic Domain Intelligence", industry: "National Domain Operations",
    tagline: "Philippine Strategic Domain Intelligence",
    desc: "Satellite-grade Philippine map with coordinate-level beacons for Enegy & Oil, Fluid Systems, Transport, Telecommunications, Healthcare, Bank & Finance, Food & agriculture, Government, Defense facilities, Data Center, and Aerospace, plus realtime ADS-B aircraft tracks in Philippine airspace.",
    status: "MAPPED",
    uptime: "99.91%",
    component: StrategicDomainIntelligence,
  },
  {
    id: "command", tag: "03", name: "Command & Control", industry: "Coordination",
    tagline: "Reserved Command Surface",
    desc: "Command mission surface reserved for incident workflows, dispatch controls, and escalation orchestration.",
    status: "PENDING",
    uptime: "--",
    component: CommandControlWindow,
  },
  {
    id: "learn", tag: "04", name: "See All", industry: "Overview",
    tagline: "Expand the Strategic Platform",
    desc: "Access deeper implementation pathways, deployment models, and strategic integration options.",
    status: "INFO",
    uptime: "N/A",
    component: LearnMoreCard,
  },
];

function SoftwareTab({
  software,
  index,
  active,
  onSelect,
}: {
  software: SoftwareWindowDefinition;
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`sdemo-tab${active ? " active" : ""}`}
      onClick={() => onSelect(index)}
    >
      <span className="sdemo-tab-name">{software.name}</span>
      <span className="sdemo-tab-industry">{software.industry}</span>
    </button>
  );
}

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

  const goto = useCallback((i: number) => {
    if (i === active || transitioning) return;
    setDir(i > active ? "next" : "prev");
    setTrans(true);
    setTimeout(() => { setActive(i); setTrans(false); }, 320);
  }, [active, transitioning]);

  const next = () => goto((active + 1) % SOFTWARE_WINDOWS.length);
  const back = () => goto((active - 1 + SOFTWARE_WINDOWS.length) % SOFTWARE_WINDOWS.length);

  const sw = SOFTWARE_WINDOWS[active];
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
        @keyframes sdemoTabOrbit {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        @keyframes infraSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .sdemo-root {
          background: #000000;
          border-top: none;
          color: #fff;
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          overflow: hidden;
          position: relative;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .sdemo-root.revealed { opacity: 1; transform: translateY(0); }
        :root.light .sdemo-root { background: var(--surface-secondary, #f8f9fa); border-top: none; color: #0f172a; }
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
          padding: 4rem 1rem 5rem;
        }
        @media(min-width:640px){.sdemo-inner{padding:4.75rem 1.5rem 5.5rem;}}
        @media(min-width:768px){.sdemo-inner{padding:5.5rem 3rem 6.25rem;}}
        @media(min-width:1024px){.sdemo-inner{padding:6rem 5rem 7rem;}}
        @media(min-width:1280px){.sdemo-inner{padding:6.5rem 7rem 7.5rem;}}
        @media(min-width:1536px){.sdemo-inner{padding:7rem 10rem 8rem;}}
        @media(min-width:1920px){.sdemo-inner{padding:7rem 14rem 8rem;}}

        .sdemo-header { display:flex; flex-direction:column; gap:1.5rem; margin-bottom:2.25rem; }
        @media(min-width:768px){ .sdemo-header { flex-direction:row; align-items:flex-end; justify-content:space-between; gap:2rem; margin-bottom:3rem; } }
        .sdemo-eyebrow {
          display:inline-flex; align-items:center; gap:0.5rem;
          font-size:0.74rem; text-transform:uppercase; letter-spacing:0.24em;
          font-weight:700; color:#E31B54; margin-bottom:1rem;
        }
        .sdemo-eyebrow-dot {
          width:5px; height:5px; border-radius:50%; background:#E31B54; flex-shrink:0;
          animation: sdPulse 2s ease-in-out infinite;
        }
        .sdemo-heading {
          font-size:clamp(2.2rem,4.8vw,3.45rem); font-weight:700;
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
        .sdemo-header-desc {
          max-width:min(100%, 540px);
          font-size:clamp(1.02rem,1.45vw,1.24rem);
          line-height:1.65;
          color:rgba(255,255,255,0.4);
          font-family:'Inter',ui-sans-serif,system-ui,sans-serif;
        }
        :root.light .sdemo-header-desc { color:rgba(0,0,0,0.45); }
        @media(min-width:768px){
          .sdemo-header-desc {
            line-height:1.75;
            text-align:right;
          }
        }

        .sdemo-tabs {
          display:flex;
          gap:0.85rem;
          margin-bottom:2.3rem;
          overflow-x:auto;
          overflow-y:hidden;
          scrollbar-width:none;
          padding-bottom:0.3rem;
        }
        @media(min-width:960px){
          .sdemo-tabs {
            display:grid;
            grid-template-columns:repeat(4,minmax(190px,1fr));
            gap:1rem;
            overflow:visible;
            padding-bottom:0;
          }
        }
        .sdemo-tabs::-webkit-scrollbar { display:none; }

        .sdemo-tab {
          min-width:248px;
          flex:0 0 248px;
          display:flex;
          flex-direction:column;
          justify-content:center;
          gap:0.44rem;
          min-height:94px;
          padding:1.02rem 1.08rem;
          border:1px solid rgba(255,255,255,0.14);
          background:linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.018));
          cursor:pointer;
          text-align:left;
          position:relative;
          transition:transform 0.24s cubic-bezier(0.16,1,0.3,1), border-color 0.24s ease, background 0.24s ease, box-shadow 0.24s ease;
          border-radius:14px;
          white-space:normal;
          backdrop-filter: blur(10px) saturate(130%);
          -webkit-backdrop-filter: blur(10px) saturate(130%);
          box-shadow:0 10px 26px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .sdemo-tab > * {
          position:relative;
          z-index:1;
        }
        @media(min-width:960px){
          .sdemo-tab {
            min-width:0;
            flex:1 1 auto;
            min-height:102px;
            padding:1.1rem 1.2rem;
          }
        }
        .sdemo-tab:hover {
          transform:translateY(-4px);
          border-color:rgba(255,255,255,0.02);
          background:linear-gradient(160deg,rgba(227,27,84,0.18),rgba(227,27,84,0.06));
          box-shadow:0 16px 34px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .sdemo-tab.active {
          border-color:rgba(255,255,255,0.02);
          background:linear-gradient(160deg,rgba(227,27,84,0.24),rgba(227,27,84,0.08));
          box-shadow:0 20px 38px rgba(0,0,0,0.34), inset 0 0 0 1px rgba(255,255,255,0.06);
        }
        .sdemo-tab:focus-visible {
          outline:none;
          border-color:rgba(255,255,255,0.02);
          box-shadow:0 0 0 2px rgba(227,27,84,0.45), 0 16px 34px rgba(0,0,0,0.28);
        }
        .sdemo-tab::before {
          content:'';
          position:absolute;
          inset:0;
          border-radius:inherit;
          padding:1px;
          z-index:0;
          background:linear-gradient(90deg,
            rgba(0,255,166,0.0) 0%,
            rgba(0,255,166,0.9) 15%,
            rgba(255,215,0,0.7) 30%,
            rgba(236,72,153,0.7) 45%,
            rgba(147,51,234,0.7) 60%,
            rgba(59,130,246,0.6) 75%,
            rgba(0,255,166,0.0) 90%);
          background-size:200% 100%;
          animation:sdemoTabOrbit 3s linear infinite;
          opacity:0;
          pointer-events:none;
          transition:opacity 0.3s ease;
          -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;
          mask-composite:exclude;
        }
        .sdemo-tab:hover::before,
        .sdemo-tab.active::before { opacity:1; }
        .sdemo-tab::after {
          content:'';
          position:absolute;
          top:1px;
          left:0;
          right:0;
          height:2px;
          background:linear-gradient(90deg,rgba(227,27,84,0),rgba(227,27,84,0.8),rgba(227,27,84,0));
          transform:scaleX(0.22);
          opacity:0;
          transition:all 0.25s ease;
        }
        .sdemo-tab.active::after { transform:scaleX(1); opacity:1; }
        :root.light .sdemo-tab {
          border:1px solid rgba(15,23,42,0.15);
          background:linear-gradient(160deg,rgba(255,255,255,0.84),rgba(255,255,255,0.56));
          box-shadow:0 8px 24px rgba(15,23,42,0.09), inset 0 1px 0 rgba(255,255,255,0.6);
        }
        :root.light .sdemo-tab:hover {
          border-color:rgba(255,255,255,0.02);
          background:linear-gradient(160deg,rgba(227,27,84,0.16),rgba(227,27,84,0.06));
        }
        :root.light .sdemo-tab.active {
          border-color:rgba(255,255,255,0.02);
          background:linear-gradient(160deg,rgba(227,27,84,0.21),rgba(227,27,84,0.08));
          box-shadow:0 12px 28px rgba(2,6,23,0.14);
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
        .sdemo-tab-name {
          font-size:0.92rem;
          font-weight:700;
          letter-spacing:0.01em;
          line-height:1.25;
          color:rgba(255,255,255,0.62);
          transition:color 0.2s ease;
        }
        @media(min-width:960px){ .sdemo-tab-name { font-size:0.98rem; } }
        :root.light .sdemo-tab-name { color:rgba(0,0,0,0.45); }
        .sdemo-tab.active .sdemo-tab-name,
        .sdemo-tab:hover .sdemo-tab-name { color:rgba(255,255,255,0.9); }
        :root.light .sdemo-tab.active .sdemo-tab-name,
        :root.light .sdemo-tab:hover .sdemo-tab-name { color:rgba(0,0,0,0.9); }
        .sdemo-tab-industry {
          font-size:0.64rem;
          letter-spacing:0.16em;
          text-transform:uppercase;
          font-weight:600;
          color:rgba(255,255,255,0.27);
          transition:color 0.2s ease;
        }
        :root.light .sdemo-tab-industry { color:rgba(0,0,0,0.28); }
        .sdemo-tab.active .sdemo-tab-industry { color:rgba(227,27,84,0.84); }
        .sdemo-tab:hover .sdemo-tab-industry { color:rgba(255,255,255,0.46); }
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

        .sdemo-meta { display:flex; align-items:center; justify-content:flex-end; gap:1rem; margin-bottom:1.2rem; }
        @media(max-width:640px){
          .sdemo-nav { width:100%; justify-content:flex-end; }
        }

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
          height:clamp(640px, 76vh, 760px);
        }
        :root.light .sdemo-viewport { border:1px solid rgba(0,0,0,0.12); background:#eceef3; }
        @media(max-width:960px){ .sdemo-viewport { height:clamp(680px, 84vh, 860px); } }
        @media(max-width:640px){ .sdemo-viewport { height:clamp(720px, 88vh, 920px); } }

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
        .sw-panel.sw-panel-modal-open > :not(.infra-limited-modal-wrap) {
          pointer-events:none;
          user-select:none;
        }
        .sw-panel.sw-panel-modal-open .scanline { display:none; }
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

        .c2-panel {
          background:radial-gradient(ellipse at 50% 0%,#130419 0%,#04040a 100%);
          display:grid;
          grid-template-columns:minmax(210px, 240px) minmax(0, 1fr) minmax(210px, 240px);
          grid-template-rows:40px minmax(0, 1fr);
          grid-template-areas:
            "topbar topbar topbar"
            "sidebar radar stats";
        }
        :root.light .c2-panel { background:#eceef3; }
        .c2-topbar {
          grid-area:topbar;
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
        .c2-topbar-left {
          display:flex;
          align-items:center;
          gap:0.55rem;
          font-size:0.57rem;
          letter-spacing:0.16em;
        }
        .c2-topbar-right {
          display:flex;
          align-items:center;
          gap:0.8rem;
          font-size:0.55rem;
          letter-spacing:0.12em;
          color:rgba(255,255,255,0.5);
        }
        :root.light .c2-topbar-right { color:rgba(0,0,0,0.5); }
        .c2-led {
          width:7px; height:7px; border-radius:999px; background:#00ffaa;
          box-shadow:0 0 10px rgba(0,255,170,0.65);
          animation:sdPulse 2s ease-in-out infinite;
        }

        .c2-sidebar {
          grid-area:sidebar;
          min-width:0;
          background:rgba(0,0,0,0.45);
          padding:1.15rem;
          border-right:1px solid rgba(255,255,255,0.07);
          display:flex;
          flex-direction:column;
        }
        :root.light .c2-sidebar {
          background:rgba(0,0,0,0.04);
          border-right:1px solid rgba(0,0,0,0.09);
        }
        .c2-sidebar-label {
          margin-bottom:0.85rem;
          font-size:0.58rem;
          letter-spacing:0.14em;
        }
        .c2-node-list {
          display:flex;
          flex-direction:column;
          gap:0.6rem;
          overflow-y:auto;
          min-height:0;
          padding-right:0.15rem;
        }
        .c2-node {
          padding:0.72rem;
          border:1px solid rgba(255,255,255,0.06);
          border-radius:6px;
          cursor:pointer;
          transition:all 0.2s ease;
          background:transparent;
          color:inherit;
          text-align:left;
          font:inherit;
        }
        .c2-node:hover:not(.c2-node-active) { background:rgba(255,255,255,0.03); }
        .c2-node-active { background:rgba(227,27,84,0.1)!important; border-color:#E31B54!important; }
        :root.light .c2-node { border:1px solid rgba(0,0,0,0.1); }
        :root.light .c2-node:hover:not(.c2-node-active) { background:rgba(0,0,0,0.04); }
        .c2-node-id { font-size:0.55rem; opacity:0.4; }
        .c2-node-title { font-weight:700; font-size:0.88rem; line-height:1.2; margin-top:0.08rem; }
        .c2-node-status { font-size:0.65rem; margin-top:0.2rem; }
        .c2-node-coord { font-size:0.55rem; margin-top:0.25rem; }

        .c2-radar {
          grid-area:radar;
          background:radial-gradient(circle at center,#0a0a14 0%,#020206 100%);
          position:relative;
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
          min-width:0;
        }
        :root.light .c2-radar { background:linear-gradient(135deg,#e2e5ef 0%,#d5d9e8 100%); }

        .gov-flow-root {
          width:100%;
          height:100%;
          overflow:auto;
          padding:1rem;
        }
        .gov-flow-board {
          position:relative;
          width:100%;
          min-width:880px;
          height:100%;
          min-height:540px;
          border:1px solid rgba(255,255,255,0.08);
          border-radius:12px;
          background:
            radial-gradient(1200px 600px at 50% -80%, rgba(227,27,84,0.12), transparent 60%),
            linear-gradient(145deg,rgba(0,0,0,0.45),rgba(0,0,0,0.2));
          overflow:hidden;
        }
        .gov-flow-board-desktop { display:block; }
        .gov-flow-mobile { display:none; }
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
        .gov-card-mobile {
          position:relative;
          width:100%;
          min-width:0;
          min-height:0;
          height:auto;
          left:auto;
          top:auto;
          padding:0.7rem 0.75rem;
        }

        .c2-stats {
          grid-area:stats;
          min-width:0;
          background:rgba(0,0,0,0.45);
          padding:1.1rem;
          border-left:1px solid rgba(255,255,255,0.07);
          display:flex;
          flex-direction:column;
          gap:0.35rem;
          overflow-y:auto;
        }
        :root.light .c2-stats { background:rgba(0,0,0,0.04); border-left:1px solid rgba(0,0,0,0.09); }
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
        .c2-status-foot { margin-top:auto; padding-top:1.2rem; }

        @media(max-width:1200px){
          .c2-panel {
            grid-template-columns:minmax(190px, 220px) minmax(0, 1fr) minmax(190px, 220px);
          }
          .gov-flow-board { min-width:820px; }
        }
        @media(max-width:960px){
          .c2-panel {
            grid-template-columns:1fr;
            grid-template-rows:auto auto minmax(0, 1fr) auto;
            grid-template-areas:
              "topbar"
              "sidebar"
              "radar"
              "stats";
          }
          .c2-topbar {
            height:auto;
            padding:0.65rem 0.75rem;
            flex-wrap:wrap;
            align-items:flex-start;
            gap:0.4rem 0.8rem;
          }
          .c2-topbar-left {
            font-size:0.52rem;
            letter-spacing:0.14em;
            flex:1 1 100%;
          }
          .c2-topbar-right {
            font-size:0.5rem;
            gap:0.55rem;
          }
          .c2-sidebar {
            border-right:none;
            border-top:1px solid rgba(255,255,255,0.07);
            border-bottom:1px solid rgba(255,255,255,0.07);
            padding:0.7rem;
          }
          :root.light .c2-sidebar {
            border-top:1px solid rgba(0,0,0,0.09);
            border-bottom:1px solid rgba(0,0,0,0.09);
          }
          .c2-sidebar-label {
            margin-bottom:0.55rem;
            font-size:0.52rem;
          }
          .c2-node-list {
            flex-direction:row;
            overflow-x:auto;
            overflow-y:hidden;
            gap:0.5rem;
            padding-bottom:0.1rem;
          }
          .c2-node-list::-webkit-scrollbar { display:none; }
          .c2-node {
            min-width:172px;
            flex:0 0 172px;
            padding:0.65rem;
          }
          .c2-radar { min-height:360px; }
          .gov-flow-root { padding:0.7rem; }
          .gov-flow-board-desktop { display:none; }
          .gov-flow-mobile {
            display:grid;
            grid-template-columns:repeat(2, minmax(0, 1fr));
            gap:0.55rem;
            width:100%;
          }
          .gov-card-mobile .gov-card-head { font-size:0.58rem; margin-bottom:0.45rem; }
          .gov-card-mobile .gov-item { font-size:0.6rem; }
          .c2-stats {
            border-left:none;
            border-top:1px solid rgba(255,255,255,0.07);
            padding:0.7rem;
            display:grid;
            grid-template-columns:repeat(2, minmax(0, 1fr));
            gap:0.36rem 0.7rem;
            overflow:visible;
          }
          :root.light .c2-stats { border-top:1px solid rgba(0,0,0,0.09); }
          .c2-stats > .c2-divider {
            grid-column:1/-1;
            margin:0.35rem 0;
          }
          .c2-events {
            grid-column:1/-1;
            margin-top:0.35rem;
          }
          .c2-status-foot {
            grid-column:1/-1;
            margin-top:0.1rem;
            padding-top:0.4rem;
          }
        }
        @media(max-width:640px){
          .c2-topbar-right span:nth-child(1){display:none;}
          .c2-topbar-right span:nth-child(3){display:none;}
          .c2-node { min-width:158px; flex-basis:158px; }
          .c2-radar { min-height:320px; }
          .gov-flow-mobile { grid-template-columns:1fr; }
          .c2-stats { grid-template-columns:1fr; }
          .c2-event-row {
            display:grid;
            grid-template-columns:auto 1fr auto;
            align-items:start;
          }
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
        .infra-panel > :not(.infra-limited-modal-wrap) {
          transition:filter 0.24s ease;
        }
        .infra-panel.sw-panel-modal-open > :not(.infra-limited-modal-wrap) {
          filter:blur(6px);
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
          overscroll-behavior:contain;
          border-left:1px solid rgba(255,255,255,0.07);
          border-right:1px solid rgba(255,255,255,0.07);
          background:radial-gradient(circle at 20% 10%, rgba(96,165,250,0.1), transparent 40%);
        }
        :root.light .infra-map-stage {
          --sdemo-crosshair-color: rgba(255,255,255,0.92);
          border-left:1px solid rgba(0,0,0,0.08);
          border-right:1px solid rgba(0,0,0,0.08);
        }
        .infra-map-stage.infra-map-stage-modal-open .sdemo-crosshair-layer {
          display:none;
        }
        .infra-map-stage.infra-map-stage-modal-open,
        .infra-map-stage.infra-map-stage-modal-open * {
          cursor:auto !important;
        }
        .infra-map-stage.infra-map-stage-modal-open .infra-leaflet-map,
        .infra-map-stage.infra-map-stage-modal-open .infra-leaflet-map * {
          pointer-events:none !important;
        }
        @keyframes infraModalOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes infraModalPanelIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }
        @keyframes infraModalOverlayOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes infraModalPanelOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
          to {
            opacity: 0;
            transform: scale(0.97) translateY(12px);
            filter: blur(2px);
          }
        }
        .infra-limited-notice {
          position:absolute;
          left:1rem;
          bottom:1rem;
          z-index:260;
          width:auto;
          min-width:108px;
          min-height:40px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:0.52rem 0.9rem;
          border:1px solid rgba(227,27,84,0.52);
          border-radius:12px;
          background:linear-gradient(160deg, rgba(16,12,20,0.95), rgba(7,7,11,0.92));
          box-shadow:0 12px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
          color:#f8fafc;
          text-align:center;
          cursor:pointer;
          transition:transform 0.22s cubic-bezier(0.16,1,0.3,1), border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
        }
        .infra-limited-notice::before {
          content:"";
          position:absolute;
          top:0;
          left:0.55rem;
          right:0.55rem;
          height:1px;
          background:linear-gradient(90deg, transparent, rgba(227,27,84,0.9), transparent);
          opacity:0.9;
          pointer-events:none;
        }
        .infra-limited-notice:hover {
          transform:translateY(-2px);
          border-color:rgba(227,27,84,0.72);
          background:linear-gradient(160deg, rgba(22,14,22,0.96), rgba(10,8,12,0.95));
          box-shadow:0 14px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .infra-limited-notice:focus-visible {
          outline:none;
          box-shadow:0 0 0 2px rgba(227,27,84,0.4), 0 14px 30px rgba(0,0,0,0.42);
        }
        .infra-limited-notice-title {
          font-family:'Inter', ui-sans-serif, system-ui, sans-serif;
          font-size:0.74rem;
          letter-spacing:0.06em;
          color:rgba(255,255,255,0.94);
          font-weight:700;
          line-height:1;
        }
        .infra-limited-notice-icon-only {
          width:42px;
          min-width:42px;
          height:42px;
          min-height:42px;
          padding:0;
          border-radius:999px;
        }
        .infra-limited-notice-icon-only::before {
          left:0.32rem;
          right:0.32rem;
        }
        .infra-limited-notice-icon {
          font-family:'Inter', ui-sans-serif, system-ui, sans-serif;
          font-size:1.12rem;
          font-weight:700;
          line-height:1;
          color:inherit;
        }
        :root.light .infra-limited-notice {
          border:1px solid rgba(227,27,84,0.44);
          background:linear-gradient(160deg, rgba(255,255,255,0.97), rgba(244,245,250,0.95));
          color:#0f172a;
          box-shadow:0 10px 24px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,0.85);
        }
        :root.light .infra-limited-notice::before {
          background:linear-gradient(90deg, transparent, rgba(227,27,84,0.85), transparent);
        }
        :root.light .infra-limited-notice:hover {
          border-color:rgba(227,27,84,0.6);
          background:linear-gradient(160deg, rgba(255,255,255,0.99), rgba(241,243,248,0.98));
          box-shadow:0 12px 26px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        :root.light .infra-limited-notice-title { color:rgba(15,23,42,0.92); }
        @media(max-width:640px){
          .infra-limited-notice {
            left:0.72rem;
            right:auto;
            bottom:0.72rem;
            width:auto;
            min-width:96px;
            min-height:38px;
            padding:0.48rem 0.78rem;
          }
          .infra-limited-notice-title { font-size:0.68rem; }
          .infra-limited-notice-icon-only {
            width:38px;
            min-width:38px;
            height:38px;
            min-height:38px;
            padding:0;
          }
          .infra-limited-notice-icon { font-size:1rem; }
        }
        .infra-limited-modal-wrap {
          position:absolute;
          inset:0;
          z-index:520;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:1.25rem;
          background:rgba(0,0,0,0.42);
          backdrop-filter:blur(3px);
          -webkit-backdrop-filter:blur(3px);
          animation:infraModalOverlayIn 0.2s ease both;
        }
        .infra-limited-modal-wrap.closing {
          animation:infraModalOverlayOut ${LIMITED_MODAL_CLOSE_DURATION_MS}ms ease forwards;
        }
        .infra-limited-modal {
          position:relative;
          width:min(92%, 580px);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:16px;
          background:linear-gradient(165deg, rgba(12,12,18,0.96) 0%, rgba(6,6,10,0.97) 100%);
          box-shadow:
            0 24px 80px rgba(0,0,0,0.6),
            0 0 0 1px rgba(255,255,255,0.03) inset,
            0 1px 0 rgba(255,255,255,0.04) inset;
          padding:1.8rem 1.65rem 1.55rem;
          overflow:hidden;
          animation:infraModalPanelIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .infra-limited-modal::before {
          content:"";
          position:absolute;
          inset:0;
          border-radius:16px;
          padding:1px;
          background:radial-gradient(
            420px circle at var(--modal-mx, 50%) var(--modal-my, 50%),
            rgba(0,255,166,0.8),
            rgba(255,215,0,0.6),
            rgba(236,72,153,0.6),
            rgba(147,51,234,0.6),
            rgba(59,130,246,0.5),
            transparent 70%
          );
          -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;
          mask-composite:exclude;
          opacity:0;
          transition:opacity 0.4s ease;
          pointer-events:none;
          z-index:2;
        }
        .infra-limited-modal-wrap:not(.closing) .infra-limited-modal:hover::before {
          opacity:1;
        }
        .infra-limited-modal-wrap.closing .infra-limited-modal {
          animation:infraModalPanelOut ${LIMITED_MODAL_CLOSE_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .infra-limited-accent {
          position:absolute;
          top:0;
          left:0;
          right:0;
          height:2px;
          background:linear-gradient(90deg, transparent 0%, #E31B54 22%, #E31B54 78%, transparent 100%);
          opacity:0.75;
        }
        .infra-limited-btn:focus-visible {
          outline:none;
          box-shadow:0 0 0 2px rgba(227,27,84,0.35);
        }
        .infra-limited-eyebrow {
          display:flex;
          align-items:center;
          gap:0.46rem;
          font-size:0.56rem;
          letter-spacing:0.2em;
          text-transform:uppercase;
          color:rgba(255,255,255,0.34);
          margin-bottom:0.78rem;
          padding-right:2rem;
        }
        .infra-limited-eyebrow-dot {
          width:6px;
          height:6px;
          border-radius:999px;
          background:#E31B54;
          box-shadow:0 0 8px rgba(227,27,84,0.7);
          flex-shrink:0;
        }
        .infra-limited-title {
          margin:0;
          font-size:clamp(1.12rem, 2vw, 1.42rem);
          font-weight:700;
          letter-spacing:-0.02em;
          line-height:1.2;
          background:linear-gradient(135deg, #f1f5f9 0%, rgba(241,245,249,0.66) 100%);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .infra-limited-definition {
          margin:0.98rem 0 0;
          font-size:0.8rem;
          line-height:1.63;
          font-family:'Inter',ui-sans-serif,system-ui,sans-serif;
          color:rgba(255,255,255,0.68);
          text-align:justify;
          text-justify:inter-word;
        }
        .infra-limited-desc {
          margin:1.08rem 0 0;
          padding-top:1rem;
          border-top:1px solid rgba(255,255,255,0.08);
          font-size:0.8rem;
          line-height:1.63;
          font-family:'Inter',ui-sans-serif,system-ui,sans-serif;
          color:rgba(255,255,255,0.52);
          text-align:justify;
          text-justify:inter-word;
        }
        .infra-limited-disclaimer-label {
          display:block;
          margin-bottom:0.52rem;
          font-size:0.8rem;
          line-height:1.4;
          font-weight:500;
          letter-spacing:0;
          text-transform:none;
          color:rgba(227,27,84,0.82);
        }
        .infra-limited-disclaimer-title {
          display:block;
          margin-bottom:0.42rem;
          font-size:0.8rem;
          line-height:1.4;
          font-weight:600;
          letter-spacing:0;
          text-transform:none;
          color:rgba(255,255,255,0.8);
        }
        .infra-limited-actions {
          margin-top:1.5rem;
          display:flex;
          flex-wrap:wrap;
          gap:0.78rem;
        }
        .infra-limited-btn {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:0.52rem;
          position:relative;
          overflow:hidden;
          text-decoration:none;
          border-radius:11px;
          border:1px solid rgba(227,27,84,0.54);
          background:#E31B54;
          color:#fff;
          font-size:0.72rem;
          letter-spacing:0.11em;
          font-weight:600;
          text-transform:uppercase;
          padding:0.86rem 1.28rem;
          min-height:44px;
          transition:all 0.2s ease;
        }
        .infra-limited-btn::before {
          content:"";
          position:absolute;
          inset:0;
          border-radius:11px;
          padding:1px;
          background:radial-gradient(
            180px circle at var(--btn-mx, 50%) var(--btn-my, 50%),
            rgba(0,255,166,0.85),
            rgba(255,215,0,0.62),
            rgba(236,72,153,0.6),
            rgba(147,51,234,0.58),
            rgba(59,130,246,0.5),
            transparent 70%
          );
          -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;
          mask-composite:exclude;
          opacity:0;
          transition:opacity 0.35s ease;
          pointer-events:none;
        }
        .infra-limited-btn:hover::before {
          opacity:1;
        }
        .infra-limited-btn i {
          font-size:1.1rem;
          line-height:1;
        }
        .infra-limited-btn:hover {
          background:#c91449;
          border-color:#c91449;
          transform:translateY(-1px);
          box-shadow:0 6px 18px rgba(227,27,84,0.32);
        }
        .infra-limited-btn-ghost {
          border-color:rgba(255,255,255,0.13);
          background:rgba(255,255,255,0.03);
          color:rgba(255,255,255,0.84);
        }
        .infra-limited-btn-ghost:hover {
          border-color:rgba(255,255,255,0.28);
          background:rgba(255,255,255,0.08);
          box-shadow:none;
          transform:translateY(-1px);
        }
        :root.light .infra-limited-modal-wrap {
          background:rgba(0,0,0,0.16);
        }
        :root.light .infra-limited-modal {
          border:1px solid rgba(0,0,0,0.12);
          background:linear-gradient(165deg, rgba(255,255,255,0.97) 0%, rgba(248,248,252,0.98) 100%);
          box-shadow:
            0 24px 80px rgba(0,0,0,0.12),
            0 0 0 1px rgba(0,0,0,0.03) inset;
        }
        :root.light .infra-limited-eyebrow { color:rgba(0,0,0,0.34); }
        :root.light .infra-limited-title {
          background:linear-gradient(135deg, #0f172a 0%, rgba(15,23,42,0.68) 100%);
          -webkit-background-clip:text;
          background-clip:text;
        }
        :root.light .infra-limited-definition { color:rgba(0,0,0,0.68); }
        :root.light .infra-limited-desc {
          color:rgba(0,0,0,0.57);
          border-top:1px solid rgba(0,0,0,0.1);
        }
        :root.light .infra-limited-disclaimer-label { color:rgba(227,27,84,0.8); }
        :root.light .infra-limited-disclaimer-title { color:rgba(0,0,0,0.74); }
        :root.light .infra-limited-btn {
          color:#fff;
          background:#E31B54;
          border-color:#E31B54;
        }
        :root.light .infra-limited-btn:hover {
          background:#c91449;
          border-color:#c91449;
        }
        :root.light .infra-limited-btn-ghost {
          border-color:rgba(0,0,0,0.11);
          color:rgba(0,0,0,0.74);
          background:rgba(0,0,0,0.03);
        }
        :root.light .infra-limited-btn-ghost:hover {
          border-color:rgba(0,0,0,0.18);
          background:rgba(0,0,0,0.06);
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
        @media(max-width:640px){
          .infra-limited-modal-wrap { padding:0.9rem; }
          .infra-limited-modal { width:100%; padding:1.2rem 1.02rem 1.04rem; }
          .infra-limited-eyebrow { font-size:0.52rem; letter-spacing:0.16em; }
          .infra-limited-title { font-size:1.06rem; }
          .infra-limited-definition { font-size:0.74rem; }
          .infra-limited-desc { font-size:0.74rem; }
          .infra-limited-disclaimer-title,
          .infra-limited-disclaimer-label { font-size:0.74rem; }
          .infra-limited-actions { gap:0.58rem; margin-top:1.1rem; }
          .infra-limited-btn {
            width:100%;
            justify-content:center;
            padding:0.74rem 0.98rem;
            font-size:0.64rem;
            min-height:42px;
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
        .infra-leaflet-map .leaflet-zoom-animated {
          transform:translateZ(0);
          backface-visibility:hidden;
          will-change:transform;
        }
        .infra-leaflet-map .leaflet-tile-container {
          transform:translateZ(0);
          will-change:transform;
        }
        .infra-map-stage.infra-map-stage-c2 .infra-leaflet-map .leaflet-tile-pane {
          filter:grayscale(0.48) contrast(1.24) brightness(0.9) saturate(0.95) hue-rotate(168deg);
        }
        .infra-map-stage.infra-map-stage-c2 .infra-leaflet-map .leaflet-overlay-pane {
          filter:grayscale(0.35) contrast(1.12) brightness(0.95) hue-rotate(166deg) saturate(1.08);
        }
        @keyframes infraIsrSweep {
          0% { transform:translate3d(0,-10%,0); opacity:0.2; }
          50% { transform:translate3d(0,3%,0); opacity:0.45; }
          100% { transform:translate3d(0,16%,0); opacity:0.2; }
        }
        .infra-c2-hud {
          position:absolute;
          inset:0;
          z-index:900;
          pointer-events:none;
          mix-blend-mode:normal;
        }
        .infra-c2-hud.grid-only .infra-c2-grid {
          opacity:0.78;
        }
        .infra-c2-grid {
          position:absolute;
          inset:0;
          z-index:3;
          background-image:
            linear-gradient(160deg, rgba(56,189,248,0.16), rgba(20,184,166,0.1) 46%, rgba(15,118,110,0.06)),
            repeating-linear-gradient(0deg, rgba(148,163,184,0.16) 0 1px, transparent 1px 6px);
          opacity:0.5;
          mix-blend-mode:screen;
          backdrop-filter:saturate(1.06);
          -webkit-backdrop-filter:saturate(1.06);
        }
        .infra-c2-grid::after {
          content:"";
          position:absolute;
          inset:-22% -8%;
          pointer-events:none;
          background:radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.44), transparent 58%);
          animation:infraIsrSweep 8.6s ease-in-out infinite;
        }
        .infra-c2-vignette {
          position:absolute;
          inset:0;
          z-index:1;
          background:
            radial-gradient(circle at 50% 50%, rgba(10,30,40,0.02) 42%, rgba(8,24,36,0.3) 84%, rgba(8,24,36,0.48) 100%),
            linear-gradient(180deg, rgba(8,24,36,0.08), rgba(8,24,36,0.28));
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
        :root.light .infra-map-stage.infra-map-stage-c2 .infra-leaflet-map .leaflet-tile-pane {
          filter:grayscale(0.62) contrast(1.2) brightness(0.99) saturate(0.9) hue-rotate(158deg);
        }
        :root.light .infra-map-stage.infra-map-stage-c2 .infra-leaflet-map .leaflet-overlay-pane {
          filter:grayscale(0.5) contrast(1.1) brightness(1) hue-rotate(156deg) saturate(0.96);
        }
        :root.light .infra-c2-hud.grid-only .infra-c2-grid { opacity:0.66; }
        :root.light .infra-c2-grid {
          background-image:
            linear-gradient(165deg, rgba(14,116,144,0.1), rgba(6,182,212,0.05)),
            repeating-linear-gradient(0deg, rgba(51,65,85,0.12) 0 1px, transparent 1px 6px);
          opacity:0.55;
        }
        :root.light .infra-c2-grid::after {
          opacity:0.24;
          background:radial-gradient(ellipse at 50% 0%, rgba(14,116,144,0.28), transparent 60%);
        }
        :root.light .infra-c2-vignette {
          background:
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 48%, rgba(15,23,42,0.08) 82%, rgba(15,23,42,0.18) 100%);
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
        .infra-adsb-loading-screen {
          position:absolute;
          inset:0;
          z-index:460;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:0.7rem;
          pointer-events:none;
          background:linear-gradient(165deg, rgba(2,6,23,0.72), rgba(2,6,23,0.4));
          backdrop-filter:blur(3px);
        }
        :root.light .infra-adsb-loading-screen {
          background:linear-gradient(165deg, rgba(241,245,249,0.78), rgba(241,245,249,0.46));
        }
        .infra-adsb-loading-spinner {
          width:30px;
          height:30px;
          border-radius:999px;
          border:2px solid rgba(255,255,255,0.22);
          border-top-color:#38bdf8;
          animation:infraSpin 0.85s linear infinite;
        }
        :root.light .infra-adsb-loading-spinner {
          border-color:rgba(15,23,42,0.22);
          border-top-color:#0284c7;
        }
        .infra-adsb-loading-text {
          font-size:0.6rem;
          letter-spacing:0.14em;
          color:rgba(255,255,255,0.78);
        }
        :root.light .infra-adsb-loading-text { color:rgba(15,23,42,0.7); }
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
        .infra-adsb-marker-shell {
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
        .infra-adsb-aircraft {
          --infra-adsb-scale: 1;
          --infra-adsb-zoom-scale: 1;
          position:relative;
          width:100%;
          height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          transform:rotate(var(--infra-adsb-rotation, 0deg)) scale(calc(var(--infra-adsb-scale) * var(--infra-adsb-zoom-scale)));
          transform-origin:50% 50%;
          transition:transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease, color 0.2s ease;
          filter:drop-shadow(0 0 10px rgba(255,255,255,0.42)) drop-shadow(0 3px 10px rgba(2,6,23,0.62));
          animation:infraGlowBreath 1.7s ease-in-out infinite;
          opacity:0.98;
          color:var(--infra-dot-color);
        }
        .infra-adsb-aircraft::after {
          content:"";
          position:absolute;
          inset:2px;
          border-radius:999px;
          border:0.9px solid var(--infra-dot-color);
          --infra-pulse-from:0.74;
          --infra-pulse-to:1.64;
          animation:infraPulseRing 1.75s ease-out infinite;
        }
        .infra-adsb-aircraft-glyph {
          position:relative;
          z-index:2;
          width:86%;
          height:86%;
          fill:currentColor;
          color:var(--infra-dot-color);
          filter:drop-shadow(0 0 9px var(--infra-dot-color));
        }
        .infra-adsb-aircraft.active {
          --infra-adsb-scale: 1.14;
          filter:drop-shadow(0 0 16px var(--infra-dot-color)) drop-shadow(0 3px 12px rgba(2,6,23,0.72));
          opacity:1;
        }
        .infra-adsb-aircraft.active::after {
          border-color:var(--infra-dot-color);
          --infra-pulse-to:1.86;
          animation-duration:1.2s;
        }
        .infra-adsb-aircraft[data-track-class="military"] {
          color:${ADSB_TRACK_COLORS.military};
          --infra-dot-color:${ADSB_TRACK_COLORS.military};
        }
        .infra-map-stage.infra-map-stage-level3 .infra-adsb-aircraft {
          --infra-adsb-zoom-scale: 1.08;
        }
        .infra-adsb-focus-shell {
          background:transparent;
          border:none;
          pointer-events:none !important;
        }
        .infra-adsb-focus-crosshair {
          position:relative;
          width:72px;
          height:72px;
          display:block;
          pointer-events:none !important;
        }
        .infra-adsb-focus-ring {
          position:absolute;
          inset:0;
          border-radius:999px;
          border:1px solid rgba(255,255,255,0.68);
          box-shadow:0 0 0 1px rgba(15,23,42,0.45), 0 0 14px rgba(255,255,255,0.3);
          background:radial-gradient(circle at center, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 42%, transparent 56%);
        }
        .infra-adsb-focus-arm {
          position:absolute;
          background:rgba(255,255,255,0.72);
          border-radius:999px;
          pointer-events:none !important;
        }
        .infra-adsb-focus-arm.arm-n {
          left:50%;
          top:6px;
          width:1px;
          height:15px;
          transform:translateX(-50%);
        }
        .infra-adsb-focus-arm.arm-s {
          left:50%;
          bottom:6px;
          width:1px;
          height:15px;
          transform:translateX(-50%);
        }
        .infra-adsb-focus-arm.arm-w {
          top:50%;
          left:6px;
          width:15px;
          height:1px;
          transform:translateY(-50%);
        }
        .infra-adsb-focus-arm.arm-e {
          top:50%;
          right:6px;
          width:15px;
          height:1px;
          transform:translateY(-50%);
        }
        :root.light .infra-adsb-focus-ring {
          border-color:rgba(15,23,42,0.5);
          box-shadow:0 0 0 1px rgba(255,255,255,0.75), 0 0 12px rgba(15,23,42,0.18);
          background:radial-gradient(circle at center, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.02) 42%, transparent 56%);
        }
        :root.light .infra-adsb-focus-arm {
          background:rgba(15,23,42,0.54);
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
        .infra-leaflet-map .infra-adsb-flight-path {
          filter:none;
        }
        .infra-leaflet-map .infra-adsb-trajectory-observed {
          filter:drop-shadow(0 0 6px rgba(56,189,248,0.45));
        }
        .infra-leaflet-map .infra-adsb-trajectory-expected {
          filter:drop-shadow(0 0 6px rgba(245,158,11,0.45));
        }
        :root.light .infra-leaflet-map .infra-adsb-flight-path {
          filter:none;
        }
        :root.light .infra-leaflet-map .infra-adsb-trajectory-observed {
          filter:drop-shadow(0 0 5px rgba(14,165,233,0.3));
        }
        :root.light .infra-leaflet-map .infra-adsb-trajectory-expected {
          filter:drop-shadow(0 0 5px rgba(217,119,6,0.3));
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
        .infra-leaflet-map .leaflet-tooltip.infra-tooltip.infra-tooltip-adsb {
          --infra-tooltip-glow: rgba(96,165,250,0.36);
          border-color:rgba(96,165,250,0.66);
          color:#dbeafe;
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
        .infra-limited-sidebanner {
          margin-top:auto;
          position:sticky;
          bottom:0;
          border:1px solid rgba(227,27,84,0.44);
          border-radius:10px;
          background:linear-gradient(168deg, rgba(14,10,18,0.96), rgba(8,8,12,0.94));
          box-shadow:0 10px 24px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.04);
          padding:0.62rem 0.68rem 0.72rem;
          padding-right:2rem;
          display:flex;
          flex-direction:column;
          gap:0.28rem;
          z-index:2;
          overflow:hidden;
        }
        .infra-limited-sidebanner-info {
          position:absolute;
          top:0.44rem;
          right:0.44rem;
          width:20px;
          height:20px;
          min-width:20px;
          min-height:20px;
          border-radius:999px;
          border:1px solid rgba(227,27,84,0.6);
          background:rgba(227,27,84,0.14);
          color:rgba(255,255,255,0.92);
          font-family:'Inter', ui-sans-serif, system-ui, sans-serif;
          font-size:0.74rem;
          font-weight:700;
          line-height:1;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          transition:all 0.2s ease;
        }
        .infra-limited-sidebanner-info:hover {
          border-color:rgba(227,27,84,0.9);
          background:rgba(227,27,84,0.26);
          transform:translateY(-1px);
        }
        .infra-limited-sidebanner-info:focus-visible {
          outline:none;
          box-shadow:0 0 0 2px rgba(227,27,84,0.35);
        }
        .infra-limited-sidebanner-tag {
          font-size:0.52rem;
          letter-spacing:0.14em;
          color:rgba(255,255,255,0.56);
          line-height:1;
        }
        .infra-limited-sidebanner-label {
          font-size:0.78rem;
          line-height:1.2;
          font-weight:650;
          color:rgba(255,255,255,0.94);
        }
        .infra-limited-sidebanner-copy {
          margin:0;
          font-size:0.68rem;
          line-height:1.4;
          color:rgba(255,255,255,0.72);
        }
        .infra-limited-sidebanner-cta {
          margin-top:0.32rem;
          align-self:stretch;
          text-decoration:none;
          border-radius:8px;
          border:1px solid rgba(227,27,84,0.6);
          background:linear-gradient(160deg, rgba(227,27,84,0.9), rgba(201,20,73,0.92));
          color:#fff;
          font-size:0.62rem;
          letter-spacing:0.12em;
          font-weight:650;
          text-transform:uppercase;
          padding:0.44rem 0.62rem;
          min-height:32px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          text-align:center;
          transition:all 0.2s ease;
        }
        .infra-limited-sidebanner-cta:hover {
          border-color:rgba(227,27,84,0.92);
          background:linear-gradient(160deg, rgba(227,27,84,0.98), rgba(182,15,62,0.96));
          box-shadow:0 8px 20px rgba(227,27,84,0.26);
          transform:translateY(-1px);
        }
        .infra-filters-panel {
          gap:0.62rem;
          padding-left:0.72rem;
          padding-right:0.72rem;
          overflow:hidden;
        }
        :root.light .infra-details-panel,
        :root.light .infra-filters-panel { background:rgba(0,0,0,0.03); }
        :root.light .infra-limited-sidebanner {
          border-color:rgba(227,27,84,0.36);
          background:linear-gradient(168deg, rgba(255,255,255,0.98), rgba(245,246,250,0.95));
          box-shadow:0 10px 22px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        :root.light .infra-limited-sidebanner-info {
          border-color:rgba(227,27,84,0.54);
          background:rgba(227,27,84,0.1);
          color:rgba(15,23,42,0.88);
        }
        :root.light .infra-limited-sidebanner-info:hover {
          border-color:rgba(227,27,84,0.76);
          background:rgba(227,27,84,0.16);
        }
        :root.light .infra-limited-sidebanner-tag { color:rgba(15,23,42,0.52); }
        :root.light .infra-limited-sidebanner-label { color:rgba(15,23,42,0.9); }
        :root.light .infra-limited-sidebanner-copy { color:rgba(15,23,42,0.68); }
        :root.light .infra-limited-sidebanner-cta {
          border-color:rgba(227,27,84,0.64);
          color:#fff;
        }
        @media(max-width:980px){
          .infra-details-panel,
          .infra-filters-panel {
            border-top:1px solid rgba(255,255,255,0.07);
            max-height:34vh;
          }
          .infra-limited-sidebanner {
            position:static;
            margin-top:0.7rem;
          }
          .infra-limited-sidebanner-info {
            width:18px;
            height:18px;
            min-width:18px;
            min-height:18px;
            top:0.4rem;
            right:0.4rem;
            font-size:0.68rem;
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
        .infra-layer-toggle-shell-adsb {
          position:relative;
          width:16px;
          height:16px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
        }
        .infra-layer-toggle-adsb {
          position:absolute;
          inset:0;
          margin:0;
          opacity:0;
          cursor:pointer;
        }
        .infra-layer-aircraft-icon {
          font-size:12px;
          line-height:1;
          transform:rotate(14deg);
          color:rgba(17,24,39,0.9);
          -webkit-text-stroke:0.35px rgba(255,255,255,0.58);
          text-shadow:0 0 1px rgba(255,255,255,0.28);
          transition:color 0.18s ease, text-shadow 0.18s ease;
          pointer-events:none;
        }
        .infra-layer-toggle-adsb:checked + .infra-layer-aircraft-icon {
          color:#ffffff;
          -webkit-text-stroke:0;
          text-shadow:0 0 7px rgba(255,255,255,0.45);
        }
        .infra-layer-toggle-adsb:focus-visible + .infra-layer-aircraft-icon {
          text-shadow:0 0 0 2px rgba(56,189,248,0.38);
        }
        :root.light .infra-layer-aircraft-icon {
          color:rgba(15,23,42,0.75);
          -webkit-text-stroke:0.28px rgba(255,255,255,0.8);
          text-shadow:none;
        }
        :root.light .infra-layer-toggle-adsb:checked + .infra-layer-aircraft-icon {
          color:#000000;
          -webkit-text-stroke:0;
          text-shadow:0 0 4px rgba(0,0,0,0.22);
        }
        :root.light .infra-layer-toggle-adsb:focus-visible + .infra-layer-aircraft-icon {
          text-shadow:0 0 0 2px rgba(14,116,144,0.34);
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
        .infra-adsb-title-row {
          display:flex;
          flex-direction:column;
          align-items:flex-start;
          gap:0.56rem;
        }
        .infra-adsb-status-line {
          display:inline-flex;
          align-items:center;
          gap:0.28rem;
          padding:0;
          font-size:0.54rem;
          letter-spacing:0.11em;
          color:rgba(255,255,255,0.82);
        }
        .infra-adsb-status-label {
          line-height:1;
        }
        .infra-adsb-status-dot {
          width:0.36rem;
          height:0.36rem;
          border-radius:999px;
          background:currentColor;
          box-shadow:0 0 8px currentColor;
        }
        .infra-adsb-status-line.status-cruising {
          color:#4ade80;
        }
        .infra-adsb-status-line.status-parked {
          color:#fbbf24;
        }
        .infra-adsb-status-line.status-signal-lost {
          color:#f87171;
        }
        :root.light .infra-adsb-status-line {
          color:rgba(15,23,42,0.8);
        }
        :root.light .infra-adsb-status-line.status-cruising {
          color:#166534;
        }
        :root.light .infra-adsb-status-line.status-parked {
          color:#92400e;
        }
        :root.light .infra-adsb-status-line.status-signal-lost {
          color:#991b1b;
        }
        .infra-adsb-track-class {
          margin-top:0.08rem;
          font-size:0.68rem;
          letter-spacing:0.09em;
          text-transform:lowercase;
          color:rgba(255,255,255,0.68);
        }
        .infra-adsb-operator {
          margin-top:0.1rem;
          font-size:0.76rem;
          font-weight:600;
          line-height:1.3;
          color:rgba(255,255,255,0.9);
        }
        .infra-adsb-airspace {
          margin-top:0.36rem;
          font-size:0.7rem;
          letter-spacing:0.08em;
          text-transform:uppercase;
          color:rgba(148,163,184,0.92);
        }
        .infra-adsb-metrics-grid {
          margin-top:0.46rem;
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:0.45rem;
        }
        .infra-adsb-metric {
          border:1px solid rgba(255,255,255,0.1);
          border-radius:8px;
          padding:0.34rem 0.4rem;
          background:rgba(255,255,255,0.03);
        }
        .infra-adsb-metric.full {
          grid-column:1 / -1;
        }
        .infra-adsb-metric .infra-v {
          font-size:0.72rem;
          line-height:1.3;
        }
        :root.light .infra-adsb-track-class { color:rgba(15,23,42,0.58); }
        :root.light .infra-adsb-operator { color:rgba(15,23,42,0.8); }
        :root.light .infra-adsb-airspace { color:rgba(15,23,42,0.62); }
        :root.light .infra-adsb-metric {
          border-color:rgba(0,0,0,0.12);
          background:rgba(255,255,255,0.55);
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
        .infra-adsb-session-modal-wrap {
          position:absolute;
          inset:0;
          z-index:1200;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:1rem;
          background:rgba(2,6,23,0.64);
          backdrop-filter:blur(4px);
          -webkit-backdrop-filter:blur(4px);
        }
        .infra-adsb-session-modal {
          width:min(100%, 420px);
          border:1px solid rgba(248,113,113,0.38);
          border-radius:12px;
          background:linear-gradient(165deg, rgba(2,6,23,0.95), rgba(15,23,42,0.92));
          box-shadow:0 18px 40px rgba(2,6,23,0.52);
          padding:1rem;
          display:flex;
          flex-direction:column;
          gap:0.65rem;
        }
        .infra-adsb-session-modal-kicker {
          font-size:0.58rem;
          letter-spacing:0.18em;
          color:rgba(248,113,113,0.94);
        }
        .infra-adsb-session-modal-title {
          margin:0;
          font-size:0.98rem;
          line-height:1.25;
          color:rgba(255,255,255,0.92);
        }
        .infra-adsb-session-modal-note {
          margin:0;
          font-size:0.72rem;
          line-height:1.5;
          color:rgba(255,255,255,0.66);
        }
        .infra-adsb-session-modal-btn {
          margin-top:0.2rem;
          border:1px solid #E31B54;
          border-radius:8px;
          background:#E31B54;
          color:#fff;
          font-size:0.64rem;
          letter-spacing:0.14em;
          text-transform:uppercase;
          font-weight:700;
          padding:0.62rem 0.86rem;
          cursor:pointer;
        }
        .infra-adsb-session-modal-btn:hover {
          background:#c91449;
          border-color:#c91449;
        }
        :root.light .infra-adsb-session-modal-wrap {
          background:rgba(241,245,249,0.7);
        }
        :root.light .infra-adsb-session-modal {
          border-color:rgba(185,28,28,0.22);
          background:linear-gradient(165deg, rgba(255,255,255,0.96), rgba(248,250,252,0.94));
          box-shadow:0 14px 36px rgba(15,23,42,0.18);
        }
        :root.light .infra-adsb-session-modal-title { color:rgba(15,23,42,0.88); }
        :root.light .infra-adsb-session-modal-note { color:rgba(15,23,42,0.66); }
        :root.light .infra-adsb-session-modal-kicker { color:#b91c1c; }

        .command-panel {
          align-items:center;
          justify-content:center;
          background:
            radial-gradient(900px 420px at 12% 0%, rgba(227,27,84,0.22), transparent 64%),
            linear-gradient(160deg,#04040a 0%, #080713 56%, #03030a 100%);
          padding:0.95rem;
        }
        :root.light .command-panel {
          background:
            radial-gradient(900px 420px at 12% 0%, rgba(227,27,84,0.12), transparent 64%),
            linear-gradient(160deg,#eef1f8 0%, #e4e8f2 56%, #e9edf6 100%);
        }
        .command-shell {
          position:relative;
          z-index:2;
          width:min(100%, 920px);
          border:1px solid rgba(255,255,255,0.12);
          border-radius:14px;
          background:linear-gradient(145deg,rgba(0,0,0,0.42),rgba(0,0,0,0.18));
          box-shadow:0 18px 40px rgba(0,0,0,0.32);
          display:flex;
          flex-direction:column;
          gap:0.95rem;
          padding:1rem;
          overflow:auto;
        }
        :root.light .command-shell {
          border:1px solid rgba(0,0,0,0.12);
          background:linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,255,255,0.67));
          box-shadow:0 10px 24px rgba(15,23,42,0.12);
        }
        .command-header {
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:0.8rem;
          flex-wrap:wrap;
        }
        .command-kicker {
          font-size:0.55rem;
          letter-spacing:0.2em;
          color:#E31B54;
          margin-bottom:0.45rem;
        }
        .command-title {
          margin:0;
          font-size:clamp(1rem, 3vw, 1.35rem);
          letter-spacing:-0.02em;
        }
        .command-desc {
          margin:0.45rem 0 0;
          max-width:560px;
          font-size:0.72rem;
          line-height:1.55;
          color:rgba(255,255,255,0.68);
        }
        :root.light .command-desc { color:rgba(0,0,0,0.6); }
        .command-stamp {
          display:flex;
          flex-direction:column;
          gap:0.22rem;
          text-align:right;
          font-size:0.56rem;
          letter-spacing:0.14em;
          color:rgba(255,255,255,0.52);
        }
        :root.light .command-stamp { color:rgba(0,0,0,0.52); }
        .command-grid {
          display:grid;
          grid-template-columns:repeat(3, minmax(0, 1fr));
          gap:0.65rem;
        }
        .command-card {
          border:1px solid rgba(255,255,255,0.1);
          border-radius:10px;
          background:linear-gradient(155deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015));
          padding:0.72rem;
        }
        :root.light .command-card {
          border:1px solid rgba(0,0,0,0.1);
          background:linear-gradient(155deg,rgba(255,255,255,0.78),rgba(255,255,255,0.5));
        }
        .command-card-top {
          display:flex;
          align-items:baseline;
          justify-content:space-between;
          gap:0.4rem;
          margin-bottom:0.58rem;
        }
        .command-card-top h4 {
          margin:0;
          font-size:0.8rem;
          letter-spacing:0.02em;
        }
        .command-card-top span {
          font-size:0.52rem;
          letter-spacing:0.14em;
          color:#f59e0b;
        }
        .command-items {
          margin:0;
          padding:0;
          list-style:none;
          display:flex;
          flex-direction:column;
          gap:0.38rem;
        }
        .command-items li {
          font-size:0.66rem;
          line-height:1.3;
          color:rgba(255,255,255,0.72);
          border-left:2px solid rgba(227,27,84,0.45);
          padding-left:0.42rem;
        }
        :root.light .command-items li { color:rgba(0,0,0,0.62); }
        .command-footer {
          border-top:1px solid rgba(255,255,255,0.1);
          padding-top:0.72rem;
          font-size:0.57rem;
          letter-spacing:0.15em;
          color:rgba(255,255,255,0.42);
        }
        :root.light .command-footer {
          border-top:1px solid rgba(0,0,0,0.1);
          color:rgba(0,0,0,0.44);
        }
        @media(max-width:960px){
          .command-shell { padding:0.8rem; }
          .command-grid { grid-template-columns:repeat(2, minmax(0, 1fr)); }
        }
        @media(max-width:640px){
          .command-panel { padding:0.7rem; }
          .command-shell { padding:0.72rem; gap:0.75rem; }
          .command-stamp { text-align:left; }
          .command-grid { grid-template-columns:1fr; gap:0.55rem; }
          .command-desc { font-size:0.66rem; }
          .command-items li { font-size:0.62rem; }
        }

        .learn-panel {
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
          top:50%;
          left:50%;
          transform:translate(-50%,-50%);
          pointer-events:none;
        }
        .learn-modal-wrap {
          background:transparent;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          z-index:3;
        }
        .learn-modal-wrap .infra-limited-modal {
          animation:none;
        }
        .learn-panel .infra-limited-title {
          margin:0;
        }
        @media(max-width:640px){
          .learn-modal-wrap { padding:0.9rem; }
          .learn-modal-wrap .infra-limited-modal {
            width:100%;
            padding:1.2rem 1.02rem 1.04rem;
          }
        }
      `}</style>

      <div className={`sdemo-root${revealed ? " revealed" : ""}`} ref={sectionRef}>
        <div className="sdemo-inner">

          <div className="sdemo-header">
            <div>
              <div className="sdemo-eyebrow">
                <span className="sdemo-eyebrow-dot" />
                System Demonstration
              </div>
              <h2 className="sdemo-heading">Complex Systems. Clear Interfaces.</h2>
              <div className="sdemo-rule" />
            </div>
            <p className="sdemo-header-desc">
              Explore how our products translate deep technical capability into usable, intuitive, and decision-ready interfaces.
            </p>
          </div>

          <div className="sdemo-tabs" role="tablist">
            {SOFTWARE_WINDOWS.map((software, i) => (
              <SoftwareTab
                key={software.id}
                software={software}
                index={i}
                active={i === active}
                onSelect={goto}
              />
            ))}
          </div>

          <div className="sdemo-meta">
            <div className="sdemo-nav">
              <button type="button" className="sdemo-arrow" onClick={back} aria-label="Previous software">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="sdemo-counter">{active + 1} / {SOFTWARE_WINDOWS.length}</span>
              <button type="button" className="sdemo-arrow" onClick={next} aria-label="Next software">
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
            {SOFTWARE_WINDOWS.map((software, i) => (
              <button
                type="button"
                key={software.id}
                className={`sdemo-dot${i === active ? " active" : ""}`}
                onClick={() => goto(i)}
                aria-label={`Software ${i + 1}: ${software.name}`}
              />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
