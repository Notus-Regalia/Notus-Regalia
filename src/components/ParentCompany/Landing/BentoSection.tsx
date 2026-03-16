"use client";

import { useEffect, useRef, useState } from "react";

type BentoCard = {
  id: string;
  shortLabel: string;
  title: string;
  description: string;
  tag: string;
  micro: string;
};

const BENTO_CARDS: BentoCard[] = [
  {
    id: "03",
    shortLabel: "Mission-Critical Software Systems",
    title: "Mission-Critical Software Systems",
    description:
      "Engineer resilient software systems for high-stakes environments where continuity, security, and recovery discipline are non-negotiable.",
    tag: "Resilience Stack",
    micro: "Validate mission chat flow",
  },
  {
    id: "01",
    shortLabel: "Intelligence Processing & Data Analytics",
    title: "Intelligence Processing & Data Analytics",
    description:
      "Convert fragmented operational signals into decision-ready intelligence through structured fusion pipelines, confidence scoring, and live reporting.",
    tag: "Signal Processing",
    micro: "Select a live intelligence task",
  },
  {
    id: "02",
    shortLabel: "Artificial Intelligence & Automation",
    title: "Artificial Intelligence & Automation",
    description:
      "Deploy adaptive AI agents that accelerate recurring workflows, reduce manual overhead, and preserve operator-level control under pressure.",
    tag: "Automation Layer",
    micro: "Tune autonomous agent capacity",
  },
  {
    id: "04",
    shortLabel: "Operational Platforms",
    title: "Operational Platforms",
    description:
      "Design command surfaces that keep teams synchronized and workflows disciplined across incidents, escalations, and strategic operations.",
    tag: "Command Surface",
    micro: "Switch active operation node",
  },
  {
    id: "05",
    shortLabel: "Advanced Systems Manufacturing",
    title: "Advanced Systems Manufacturing",
    description:
      "Develop specialized hardware and sensor systems engineered for precision deployment, reliability, and sustained field performance.",
    tag: "Hardware Programs",
    micro: "Advance the build stage",
  },
  {
    id: "06",
    shortLabel: "Robotics & Embedded Systems",
    title: "Robotics & Embedded Systems",
    description:
      "Build edge-ready robotics and embedded platforms that unify sensing, software, and control loops into one operational stack.",
    tag: "Embedded Control",
    micro: "Toggle edge control mode",
  },
];

export default function WhatWeDoBentoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [activeId, setActiveId] = useState(BENTO_CARDS[0].id);
  const [intelTrack, setIntelTrack] = useState(0);
  const [aiScale, setAiScale] = useState(58);
  const [missionValidated, setMissionValidated] = useState(false);
  const [opsNode, setOpsNode] = useState(1);
  const [manufacturingStage, setManufacturingStage] = useState(2);
  const [roboticsMode, setRoboticsMode] = useState<"assist" | "manual">("assist");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const renderExpandedPanelSurface = (cardId: string) => {
    if (cardId === "01") {
      return (
        <div className="ww-interactive ww-intel" role="group" aria-label="Intelligence workflow board">
          <div className="ww-intel-radar" aria-hidden="true">
            <span className={`ww-intel-ring ring-1${intelTrack === 0 ? " active" : ""}`} />
            <span className={`ww-intel-ring ring-2${intelTrack === 1 ? " active" : ""}`} />
            <span className={`ww-intel-ring ring-3${intelTrack === 2 ? " active" : ""}`} />
            <span className="ww-intel-core" />
          </div>
          <div className="ww-intel-list">
            {[
              { label: "Track New Data", time: "22:05" },
              { label: "Correlate Sources", time: "08:34" },
              { label: "Learning Task", time: "LIVE" },
            ].map((entry, index) => (
              <button
                key={entry.label}
                type="button"
                className={`ww-mini-btn${intelTrack === index ? " active" : ""}`}
                onClick={() => setIntelTrack(index)}
              >
                <span>{entry.label}</span>
                <small>{entry.time}</small>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (cardId === "02") {
      return (
        <div className="ww-interactive ww-ai" role="group" aria-label="AI scale controls">
          <div className="ww-ai-top">
            <span>Agent Capacity</span>
            <strong>{aiScale}%</strong>
          </div>
          <input
            className="ww-ai-slider"
            type="range"
            min={5}
            max={100}
            step={1}
            value={aiScale}
            aria-label="Set AI capacity"
            onChange={(event) => setAiScale(Number(event.target.value))}
          />
          <div className="ww-ai-meter" aria-hidden="true">
            <span style={{ width: `${aiScale}%` }} />
          </div>
          <div className="ww-ai-stops" aria-hidden="true">
            <span>1%</span>
            <span>20%</span>
            <span>60%</span>
            <span>100%</span>
          </div>
        </div>
      );
    }

    if (cardId === "03") {
      return (
        <div className="ww-interactive ww-chatflow" role="group" aria-label="Mission validation chat">
          <div className="ww-chat-row left">Agent: Candidate intent confirmed.</div>
          <div className="ww-chat-row right">Operator: Route to secure workflow.</div>
          <div className="ww-chat-row left">Agent: Resume received. Awaiting validation.</div>
          <button
            type="button"
            className={`ww-chat-action${missionValidated ? " done" : ""}`}
            onClick={() => setMissionValidated((prev) => !prev)}
          >
            {missionValidated ? "Validation Complete" : "Run Validation"}
          </button>
        </div>
      );
    }

    if (cardId === "04") {
      return (
        <div className="ww-interactive ww-orbit" role="group" aria-label="Operational orbit controls">
          <div className="ww-orbit-field" aria-hidden="true">
            <span className={`ww-orbit-node node-a${opsNode === 0 ? " active" : ""}`} />
            <span className={`ww-orbit-node node-b${opsNode === 1 ? " active" : ""}`} />
            <span className={`ww-orbit-node node-c${opsNode === 2 ? " active" : ""}`} />
            <span className={`ww-orbit-node node-d${opsNode === 3 ? " active" : ""}`} />
            <span className="ww-orbit-center" />
          </div>
          <div className="ww-orbit-pager">
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                type="button"
                className={`ww-orbit-dot-btn${opsNode === index ? " active" : ""}`}
                aria-label={`Select operation node ${index + 1}`}
                onClick={() => setOpsNode(index)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (cardId === "05") {
      const stageLabels = ["Design", "Prototype", "Integration", "Field Test"];
      return (
        <div className="ww-interactive ww-manufacture" role="group" aria-label="Manufacturing stage controls">
          <div className="ww-stage-chips">
            {stageLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                className={`ww-stage-chip${manufacturingStage === index ? " active" : ""}`}
                onClick={() => setManufacturingStage(index)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ww-stage-track" aria-hidden="true">
            <span style={{ width: `${((manufacturingStage + 1) / stageLabels.length) * 100}%` }} />
          </div>
          <div className="ww-stage-label">Current: {stageLabels[manufacturingStage]}</div>
        </div>
      );
    }

    return (
      <div className="ww-interactive ww-robotics" role="group" aria-label="Robotics mode controls">
        <div className="ww-robot-mode">
          <button
            type="button"
            className={`ww-robot-mode-btn${roboticsMode === "assist" ? " active" : ""}`}
            onClick={() => setRoboticsMode("assist")}
          >
            Assist
          </button>
          <button
            type="button"
            className={`ww-robot-mode-btn${roboticsMode === "manual" ? " active" : ""}`}
            onClick={() => setRoboticsMode("manual")}
          >
            Manual
          </button>
        </div>
        <div className="ww-robot-grid" aria-hidden="true">
          <div><span>Latency</span><strong>{roboticsMode === "assist" ? "12ms" : "18ms"}</strong></div>
          <div><span>Uptime</span><strong>99.98%</strong></div>
          <div><span>Battery</span><strong>{roboticsMode === "assist" ? "84%" : "79%"}</strong></div>
          <div><span>Signal</span><strong>{roboticsMode === "assist" ? "Stable" : "Tuned"}</strong></div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .whatwedo-root {
          --ww-accent: #E31B54;
          --ww-accent-soft: rgba(227, 27, 84, 0.18);
          --ww-accent-border: rgba(227, 27, 84, 0.42);
          --ww-expand-duration: 520ms;
          --ww-content-delay: 240ms;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: var(--surface-primary, #000000);
        }

        .whatwedo-root::before {
          content: none;
        }

        :root.light .whatwedo-root {
          border-top: 1px solid rgba(15, 23, 42, 0.1);
          background: var(--surface-primary, #ffffff);
        }

        :root.light .whatwedo-root::before {
          content: none;
        }

        .whatwedo-shell {
          position: relative;
          z-index: 2;
          padding: 4.8rem 1.8rem 3.6rem;
        }

        @media (min-width: 640px) {
          .whatwedo-shell { padding: 5rem 3.4rem 3.8rem; }
        }

        @media (min-width: 768px) {
          .whatwedo-shell { padding: 5.1rem 4.6rem 3.9rem; }
        }

        @media (min-width: 1280px) {
          .whatwedo-shell { padding: 5.2rem 5.6rem 4rem; }
        }

        @media (min-width: 1536px) {
          .whatwedo-shell { padding: 5.3rem 7.2rem 4rem; }
        }

        .whatwedo-header {
          max-width: min(1280px, 100%);
          margin: 0 auto 1.4rem;
          padding-inline: clamp(0.4rem, 1.6vw, 1.2rem);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.7s cubic-bezier(0.2, 1, 0.3, 1), transform 0.7s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .whatwedo-root.revealed .whatwedo-header {
          opacity: 1;
          transform: translateY(0);
        }

        .whatwedo-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.48rem;
          margin-bottom: 0.78rem;
          font-size: 0.7rem;
          letter-spacing: 0.21em;
          text-transform: uppercase;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          color: rgba(227, 27, 84, 0.9);
        }

        .whatwedo-title {
          margin: 0 0 0.72rem;
          width: 100%;
          font-size: clamp(1.4rem, 3.2vw, 2.85rem);
          line-height: 1.15;
          letter-spacing: -0.02em;
          font-weight: 700;
          white-space: nowrap;
          color: rgba(255, 255, 255, 0.95);
        }

        .whatwedo-subtitle {
          margin: 0;
          max-width: 900px;
          font-size: clamp(0.98rem, 1.2vw, 1.08rem);
          line-height: 1.68;
          color: rgba(255, 255, 255, 0.58);
        }

        .whatwedo-rule {
          width: 56px;
          height: 2px;
          border-radius: 999px;
          margin: 1rem auto 0;
          background: linear-gradient(90deg, rgba(227, 27, 84, 0.96), rgba(227, 27, 84, 0.18));
        }

        :root.light .whatwedo-title {
          color: rgba(15, 23, 42, 0.92);
        }

        :root.light .whatwedo-subtitle {
          color: rgba(30, 41, 59, 0.62);
        }

        .ww-rail-wrap {
          max-width: 1180px;
          width: 100%;
          margin: 0 auto;
        }

        .ww-rail {
          --ww-collapsed: 96px;
          --ww-gap: 0.58rem;
          --ww-total: 6;
          display: flex;
          align-items: stretch;
          gap: var(--ww-gap);
          height: 760px !important;
          min-height: 760px !important;
          overflow: hidden;
        }

        .ww-panel {
          position: relative;
          flex: 0 0 auto;
          width: var(--ww-collapsed);
          min-width: var(--ww-collapsed);
          height: 760px !important;
          min-height: 760px !important;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #08090c;
          overflow: hidden;
          cursor: pointer;
          transition:
            width var(--ww-expand-duration) cubic-bezier(0.2, 1, 0.3, 1),
            border-color 0.28s ease,
            transform 0.22s ease,
            box-shadow 0.22s ease,
            opacity 0.45s ease;
          opacity: 0;
          transform: translateY(20px);
          will-change: width;
        }

        .whatwedo-root.revealed .ww-panel {
          opacity: 1;
          transform: translateY(0);
        }

        .ww-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          border-radius: inherit;
          padding: 1px;
          pointer-events: none;
          background: linear-gradient(
            135deg,
            rgba(0, 255, 166, 0.82),
            rgba(255, 215, 0, 0.7),
            rgba(236, 72, 153, 0.7),
            rgba(147, 51, 234, 0.68),
            rgba(59, 130, 246, 0.6)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.28s ease;
        }

        .ww-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: rgba(255, 255, 255, 0.03);
          opacity: 0;
          transition: opacity 0.28s ease;
        }

        .ww-panel.active {
          width: clamp(
            380px,
            calc(100% - (((var(--ww-total) - 1) * var(--ww-collapsed)) + ((var(--ww-total) - 1) * var(--ww-gap)))),
            100%
          );
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .ww-panel.active::before {
          opacity: 0.88;
        }

        .ww-panel.active::after {
          opacity: 1;
        }

        .ww-panel:hover {
          transform: translateY(-1px);
        }

        .ww-panel:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 2px rgba(227, 27, 84, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .ww-panel-collapsed {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 1rem;
          transition: opacity 0.16s ease;
        }

        .ww-panel-collapsed span {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
          font-size: 1.54rem;
          line-height: 1;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.76);
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-weight: 600;
          white-space: nowrap;
        }

        .ww-panel.active .ww-panel-collapsed {
          opacity: 0;
          pointer-events: none;
        }

        .ww-panel-expanded {
          position: relative;
          z-index: 3;
          height: 100%;
          padding: 1.24rem 1.34rem;
          display: flex;
          flex-direction: column;
          gap: 0.84rem;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.18s ease, visibility 0s linear 0.18s;
          transition-delay: 0s, 0s;
        }

        .ww-panel.active .ww-panel-expanded {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transition-delay: var(--ww-content-delay), 0s;
        }

        .ww-panel-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
        }

        .ww-panel-id {
          font-size: 0.66rem;
          letter-spacing: 0.19em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.48);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .ww-panel-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.3rem 0.62rem;
          border-radius: 999px;
          border: 1px solid rgba(227, 27, 84, 0.34);
          background: rgba(227, 27, 84, 0.1);
          color: rgba(255, 255, 255, 0.82);
          font-size: 0.62rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          white-space: nowrap;
        }

        .ww-panel-title {
          margin: 0;
          font-size: clamp(0.96rem, 1.2vw, 1.2rem);
          line-height: 1.32;
          letter-spacing: -0.01em;
          color: rgba(255, 255, 255, 0.95);
        }

        .ww-panel-description {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.66;
          color: rgba(255, 255, 255, 0.62);
        }

        .ww-interactive {
          min-height: 102px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.01);
          padding: 0.66rem;
          display: grid;
          gap: 0.52rem;
          transition: border-color 0.22s ease, background-color 0.22s ease;
        }

        .ww-mini-btn {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 9px;
          padding: 0.52rem 0.66rem;
          color: rgba(255, 255, 255, 0.76);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          font-size: 0.74rem;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, color 0.2s ease;
        }

        .ww-mini-btn small {
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.74;
        }

        .ww-mini-btn.active {
          border-color: rgba(227, 27, 84, 0.52);
          background: rgba(227, 27, 84, 0.14);
        }

        .ww-mini-btn:hover,
        .ww-mini-btn:focus-visible {
          border-color: rgba(255, 255, 255, 0.28);
          color: rgba(255, 255, 255, 0.92);
          transform: translateY(-1px);
        }

        .ww-intel {
          grid-template-columns: 104px 1fr;
          align-items: center;
        }

        .ww-intel-radar {
          width: 98px;
          height: 98px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          position: relative;
          margin: 0 auto;
        }

        .ww-intel-ring {
          position: absolute;
          inset: 11px;
          border-radius: inherit;
          border: 1px solid rgba(255, 255, 255, 0.16);
          opacity: 0.45;
        }

        .ww-intel-ring.ring-2 { inset: 24px; }
        .ww-intel-ring.ring-3 { inset: 36px; }
        .ww-intel-ring.active { border-color: rgba(227, 27, 84, 0.75); opacity: 1; }

        .ww-intel-core {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          background: rgba(227, 27, 84, 0.95);
        }

        .ww-intel-list {
          display: grid;
          gap: 0.52rem;
        }

        .ww-ai-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.79rem;
          color: rgba(255, 255, 255, 0.78);
        }

        .ww-ai-top strong {
          font-size: 0.98rem;
          color: rgba(255, 255, 255, 0.95);
        }

        .ww-ai-slider {
          width: 100%;
          accent-color: #E31B54;
        }

        .ww-ai-meter {
          height: 9px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          overflow: hidden;
        }

        .ww-ai-meter span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, rgba(227, 27, 84, 0.9), rgba(227, 27, 84, 0.3));
        }

        .ww-ai-stops {
          display: flex;
          justify-content: space-between;
          font-size: 0.61rem;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.54);
          text-transform: uppercase;
        }

        .ww-chatflow {
          align-content: start;
          gap: 0.58rem;
        }

        .ww-chat-row {
          max-width: 88%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 0.44rem 0.64rem;
          font-size: 0.71rem;
          line-height: 1.42;
          color: rgba(255, 255, 255, 0.84);
          background: rgba(255, 255, 255, 0.02);
        }

        .ww-chat-row.right {
          margin-left: auto;
          background: rgba(227, 27, 84, 0.12);
          border-color: rgba(227, 27, 84, 0.26);
        }

        .ww-chat-action {
          margin-top: 0.2rem;
          border: 1px solid rgba(227, 27, 84, 0.46);
          border-radius: 9px;
          background: rgba(227, 27, 84, 0.14);
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.48rem 0.56rem;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
        }

        .ww-chat-action.done {
          background: rgba(34, 197, 94, 0.14);
          border-color: rgba(34, 197, 94, 0.5);
        }

        .ww-chat-action:hover,
        .ww-chat-action:focus-visible {
          transform: translateY(-1px);
        }

        .ww-orbit {
          grid-template-rows: 1fr auto;
        }

        .ww-orbit-field {
          position: relative;
          min-height: 96px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.015);
        }

        .ww-orbit-center {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          background: rgba(227, 27, 84, 0.96);
        }

        .ww-orbit-node {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.42);
        }

        .ww-orbit-node.node-a { left: 20%; top: 38%; }
        .ww-orbit-node.node-b { left: 68%; top: 24%; }
        .ww-orbit-node.node-c { left: 74%; top: 66%; }
        .ww-orbit-node.node-d { left: 30%; top: 70%; }
        .ww-orbit-node.active { background: rgba(227, 27, 84, 0.95); }

        .ww-orbit-pager {
          display: flex;
          justify-content: center;
          gap: 0.56rem;
        }

        .ww-orbit-dot-btn {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.26);
          background: rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
        }

        .ww-orbit-dot-btn.active {
          border-color: rgba(227, 27, 84, 0.7);
          background: rgba(227, 27, 84, 0.9);
        }

        .ww-orbit-dot-btn:hover,
        .ww-orbit-dot-btn:focus-visible {
          transform: translateY(-1px);
        }

        .ww-stage-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.52rem;
        }

        .ww-stage-chip {
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          padding: 0.32rem 0.62rem;
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.76);
          font-size: 0.64rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
        }

        .ww-stage-chip.active {
          border-color: rgba(227, 27, 84, 0.52);
          background: rgba(227, 27, 84, 0.12);
        }

        .ww-stage-chip:hover,
        .ww-stage-chip:focus-visible {
          transform: translateY(-1px);
        }

        .ww-stage-track {
          margin-top: 0.1rem;
          height: 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.03);
          overflow: hidden;
        }

        .ww-stage-track span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, rgba(227, 27, 84, 0.85), rgba(227, 27, 84, 0.28));
        }

        .ww-stage-label {
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.64);
        }

        .ww-robot-mode {
          display: flex;
          gap: 0.56rem;
        }

        .ww-robot-mode-btn {
          flex: 1;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.69rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.46rem 0.56rem;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
        }

        .ww-robot-mode-btn.active {
          border-color: rgba(227, 27, 84, 0.52);
          background: rgba(227, 27, 84, 0.12);
        }

        .ww-robot-mode-btn:hover,
        .ww-robot-mode-btn:focus-visible {
          transform: translateY(-1px);
        }

        .ww-robot-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.56rem;
        }

        .ww-robot-grid div {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9px;
          padding: 0.46rem 0.54rem;
          background: rgba(255, 255, 255, 0.02);
          display: grid;
          gap: 0.16rem;
        }

        .ww-robot-grid span {
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.56);
        }

        .ww-robot-grid strong {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 650;
        }

        .ww-panel-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.7rem;
          margin-top: 0.1rem;
          font-size: 0.76rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.55);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .ww-panel-cta {
          color: rgba(227, 27, 84, 0.9);
          font-weight: 700;
        }

        .ww-liquid-band {
          margin-top: 1rem;
          height: 18px;
          border-radius: 999px;
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .ww-liquid-band::before,
        .ww-liquid-band::after {
          content: none;
        }

        :root.light .ww-panel {
          border-color: rgba(15, 23, 42, 0.12);
          background: #f8fafc;
        }

        :root.light .ww-panel::before {
          opacity: 0;
        }

        :root.light .ww-panel::after {
          background: rgba(15, 23, 42, 0.03);
        }

        :root.light .ww-panel.active {
          border-color: rgba(15, 23, 42, 0.16);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
        }

        :root.light .ww-panel.active::before {
          opacity: 0.72;
        }

        :root.light .ww-panel-collapsed span {
          color: rgba(15, 23, 42, 0.78);
        }

        :root.light .ww-panel-id {
          color: rgba(15, 23, 42, 0.48);
        }

        :root.light .ww-panel-tag {
          color: rgba(15, 23, 42, 0.86);
        }

        :root.light .ww-panel-title {
          color: rgba(15, 23, 42, 0.92);
        }

        :root.light .ww-panel-description {
          color: rgba(51, 65, 85, 0.7);
        }

        :root.light .ww-panel-foot {
          color: rgba(71, 85, 105, 0.75);
        }

        :root.light .ww-interactive {
          border-color: rgba(15, 23, 42, 0.14);
          background: rgba(15, 23, 42, 0.025);
        }

        :root.light .ww-mini-btn {
          border-color: rgba(15, 23, 42, 0.14);
          background: rgba(15, 23, 42, 0.03);
          color: rgba(15, 23, 42, 0.78);
        }

        :root.light .ww-mini-btn:hover,
        :root.light .ww-mini-btn:focus-visible {
          border-color: rgba(15, 23, 42, 0.24);
          color: rgba(15, 23, 42, 0.9);
        }

        :root.light .ww-mini-btn.active {
          border-color: rgba(227, 27, 84, 0.45);
          background: rgba(227, 27, 84, 0.1);
        }

        :root.light .ww-intel-radar,
        :root.light .ww-intel-ring {
          border-color: rgba(15, 23, 42, 0.16);
        }

        :root.light .ww-ai-top {
          color: rgba(15, 23, 42, 0.72);
        }

        :root.light .ww-ai-top strong {
          color: rgba(15, 23, 42, 0.9);
        }

        :root.light .ww-ai-meter,
        :root.light .ww-stage-track,
        :root.light .ww-orbit-field,
        :root.light .ww-robot-grid div {
          border-color: rgba(15, 23, 42, 0.14);
          background: rgba(15, 23, 42, 0.03);
        }

        :root.light .ww-ai-stops,
        :root.light .ww-stage-label,
        :root.light .ww-robot-grid span {
          color: rgba(51, 65, 85, 0.72);
        }

        :root.light .ww-chat-row {
          border-color: rgba(15, 23, 42, 0.14);
          background: rgba(15, 23, 42, 0.04);
          color: rgba(15, 23, 42, 0.84);
        }

        :root.light .ww-chat-row.right {
          border-color: rgba(227, 27, 84, 0.32);
          background: rgba(227, 27, 84, 0.1);
        }

        :root.light .ww-chat-action {
          color: rgba(15, 23, 42, 0.88);
        }

        :root.light .ww-orbit-node {
          background: rgba(15, 23, 42, 0.34);
        }

        :root.light .ww-orbit-dot-btn {
          border-color: rgba(15, 23, 42, 0.26);
          background: rgba(15, 23, 42, 0.12);
        }

        :root.light .ww-stage-chip,
        :root.light .ww-robot-mode-btn {
          border-color: rgba(15, 23, 42, 0.16);
          background: rgba(15, 23, 42, 0.03);
          color: rgba(15, 23, 42, 0.78);
        }

        :root.light .ww-robot-grid strong {
          color: rgba(15, 23, 42, 0.9);
        }

        :root.light .ww-liquid-band {
          border-color: rgba(15, 23, 42, 0.12);
          background: rgba(15, 23, 42, 0.03);
        }

        @media (max-width: 980px) {
          .ww-rail {
            height: 640px !important;
            min-height: 640px !important;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 0.16rem;
          }

          .ww-panel,
          .ww-panel.active {
            height: 640px !important;
            min-height: 640px !important;
          }
        }

        @media (max-width: 640px) {
          .whatwedo-shell {
            padding: 4.2rem 0.9rem 3rem;
          }

          .whatwedo-header {
            margin-bottom: 1.5rem;
            padding-inline: 0;
          }

          .whatwedo-title {
            font-size: clamp(1.12rem, 6.2vw, 1.58rem);
          }

          .ww-rail {
            gap: 0.5rem;
            height: 560px !important;
            min-height: 560px !important;
          }

          .ww-panel,
          .ww-panel.active {
            height: 560px !important;
            min-height: 560px !important;
            border-radius: 12px;
          }

          .ww-panel-expanded {
            padding: 1rem;
            gap: 0.74rem;
          }

          .ww-panel-title {
            font-size: 0.94rem;
          }

          .ww-panel-description {
            font-size: 0.88rem;
          }

          .ww-interactive {
            min-height: 92px;
            padding: 0.6rem;
          }

          .ww-liquid-band {
            height: 14px;
          }
        }
      `}</style>

      <section id="what-we-do" className={`whatwedo-root${revealed ? " revealed" : ""}`} ref={sectionRef}>
        <div className="whatwedo-shell">
          <header className="whatwedo-header">
            <span className="whatwedo-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E31B54" }} />
              Core Systems Engineering
            </span>
            <h2 className="whatwedo-title">Systems Engineered for High-Stakes Operations.</h2>
            <p className="whatwedo-subtitle">
              Explore each capability lane. Click a card to expand and interact with its operational workflow.
            </p>
            <div className="whatwedo-rule" />
          </header>

          <div className="ww-rail-wrap">
            <div className="ww-rail">
              {BENTO_CARDS.map((card) => {
                const isActive = activeId === card.id;
                return (
                  <article
                    key={card.id}
                    className={`ww-panel${isActive ? " active" : ""}`}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isActive}
                    aria-label={`Show ${card.title}`}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target !== event.currentTarget && target.closest("button, input, select, textarea, a, label")) {
                        return;
                      }
                      setActiveId(card.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveId(card.id);
                      }
                    }}
                  >
                    <div className="ww-panel-collapsed">
                      <span>{card.title}</span>
                    </div>

                    <div className="ww-panel-expanded">
                      <div className="ww-panel-meta">
                        <span className="ww-panel-id">[{card.id}]</span>
                        <span className="ww-panel-tag">{card.tag}</span>
                      </div>

                      <h3 className="ww-panel-title">{card.title}</h3>
                      <p className="ww-panel-description">{card.description}</p>

                      {renderExpandedPanelSurface(card.id)}

                      <div className="ww-panel-foot">
                        <span>{card.micro}</span>
                        <span className="ww-panel-cta">Interact</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="ww-liquid-band" aria-hidden="true" />
          </div>
        </div>
      </section>
    </>
  );
}
