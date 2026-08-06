"use client";

import { useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { MAX_PSI, surfaceMethods } from "@/components/marketing/content";

const R = 54;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function SurfaceExplorer() {
  const [activeId, setActiveId] = useState(surfaceMethods[0].id);
  const active = surfaceMethods.find((s) => s.id === activeId) ?? surfaceMethods[0];

  // Log scale — otherwise everything below 1,000 PSI reads as an empty gauge.
  const ratio = Math.log10(active.psi + 1) / Math.log10(MAX_PSI + 1);
  const offset = CIRCUMFERENCE * (1 - Math.min(ratio, 1));

  return (
    <div className="hs-surface">
      <div className="hs-surface-list" role="tablist" aria-label="Exterior surfaces">
        {surfaceMethods.map(({ icon: Icon, id, label, method }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === activeId}
            className={`hs-surface-tab${id === activeId ? " is-on" : ""}`}
            onClick={() => setActiveId(id)}
          >
            <Icon size={19} />
            {label}
            <small>{method === "Soft wash" ? "Soft" : "Force"}</small>
          </button>
        ))}
      </div>

      <div className="hs-surface-panel">
        <div className="hs-surface-top">
          <div className="hs-surface-title">
            <span className={`hs-badge ${active.method === "Soft wash" ? "hs-badge-sky" : "hs-badge-lime"}`}>
              {active.method}
            </span>
            <h3 className="hs-h2" style={{ fontSize: "clamp(1.4rem, 1.1rem + 1.1vw, 1.9rem)" }}>
              {active.headline}
            </h3>
          </div>

          <div className="hs-gauge">
            <svg viewBox="0 0 132 132" aria-hidden>
              <defs>
                <linearGradient id="hsGaugeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#c8f75a" />
                </linearGradient>
              </defs>
              <circle className="hs-gauge-track" cx="66" cy="66" r={R} />
              <circle
                className="hs-gauge-fill"
                cx="66"
                cy="66"
                r={R}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="hs-gauge-read">
              <strong>{active.psi.toLocaleString()}</strong>
              <span>PSI</span>
            </div>
          </div>
        </div>

        <p className="hs-body" style={{ fontSize: "1rem" }}>
          {active.detail}
        </p>

        <p className="hs-body" style={{ fontWeight: 650, color: "var(--fg)" }}>
          {active.psiLabel}
        </p>

        <div>
          <p className="hs-est-label" style={{ marginBottom: 10 }}>
            <span>What that protects</span>
          </p>
          <div className="hs-surface-protects">
            {active.protects.map((item) => (
              <span className="hs-badge" key={item}>
                <ShieldCheck size={13} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <p className="hs-surface-risk">
          <AlertTriangle size={17} />
          <span>
            <strong>Get it wrong: </strong>
            {active.risk}
          </span>
        </p>
      </div>
    </div>
  );
}
