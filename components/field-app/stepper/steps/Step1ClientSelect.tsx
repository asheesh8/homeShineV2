"use client";

import { useState } from "react";
import { Check, Search, UserPlus } from "lucide-react";
import { TextInput } from "@/components/field-app/ui";
import { countDone, statusLabel, statusTone } from "@/components/field-app/utils";
import { type Assessment, formatOwnerAddress, sectionDefinitions } from "@/lib/simple-field";

export function Step1ClientSelect({
  assessments,
  selectedId,
  onSelect,
}: {
  assessments: Assessment[] | null;
  selectedId: string | null;
  onSelect: (assessment: Assessment | null) => void;
}) {
  const [query, setQuery] = useState("");

  const finished = (assessments ?? []).filter((a) => a.status === "finished" || a.status === "ongoing");

  const filtered = query.trim()
    ? finished.filter((a) =>
        `${a.owner.name} ${a.owner.street} ${a.owner.city}`.toLowerCase().includes(query.toLowerCase())
      )
    : finished;

  const selected = finished.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="hs-stepper-step">
      <div className="hs-step-heading">
        <span className="hs-step-eyebrow">Step 1 of 6</span>
        <h2>Select a client</h2>
        <p className="hs-step-description">
          Pick the homeowner this quote is for. Their assessment data — field notes, section details, and AI summary — will all carry through to the client packet.
        </p>
      </div>

      {/* ── Search ────────────────────────────────────────────────────── */}
      <div className="hs-step-search-wrap">
        <Search size={16} className="hs-step-search-icon" />
        <TextInput
          type="text"
          placeholder="Search by name or address…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="hs-step-search-input"
        />
      </div>

      {/* ── Client list ───────────────────────────────────────────────── */}
      <div className="hs-client-list">
        {!assessments && (
          <p className="hs-client-list-empty">Loading assessments…</p>
        )}

        {assessments && finished.length === 0 && (
          <div className="hs-client-list-empty">
            <UserPlus size={28} />
            <p>No finished or ongoing assessments yet.</p>
            <p style={{ fontSize: 13 }}>Complete a field assessment first, then come back here to build the quote.</p>
          </div>
        )}

        {filtered.map((assessment) => {
          const isSelected = assessment.id === selectedId;
          const done = countDone(assessment);
          const total = sectionDefinitions.length;
          const pct = Math.round((done / total) * 100);
          const tone = statusTone(assessment.status);

          return (
            <button
              key={assessment.id}
              type="button"
              className={`hs-client-card ${isSelected ? "is-selected" : ""}`}
              onClick={() => onSelect(isSelected ? null : assessment)}
            >
              <div className="hs-client-card-main">
                <div className="hs-client-card-info">
                  <strong className="hs-client-card-name">{assessment.owner.name || "Unnamed"}</strong>
                  <span className="hs-client-card-address">{formatOwnerAddress(assessment.owner)}</span>
                  <span className="hs-client-card-phone">{assessment.owner.phone}</span>
                </div>
                <div className="hs-client-card-meta">
                  <span className={`hs-badge hs-badge--${tone}`}>{statusLabel(assessment.status)}</span>
                  <span className="hs-client-card-sections">{done}/{total} sections</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="hs-client-card-bar-wrap">
                <div className="hs-client-card-bar-fill" style={{ width: `${pct}%` }} />
              </div>

              {/* Writeup snippet */}
              {assessment.writeup && (
                <p className="hs-client-card-writeup">{assessment.writeup.slice(0, 120)}{assessment.writeup.length > 120 ? "…" : ""}</p>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div className="hs-client-card-check">
                  <Check size={14} />
                  Selected
                </div>
              )}
            </button>
          );
        })}

        {assessments && filtered.length === 0 && query && (
          <p className="hs-client-list-empty">No results for &ldquo;{query}&rdquo;</p>
        )}
      </div>

      {/* ── Selected summary ──────────────────────────────────────────── */}
      {selected && (
        <div className="hs-client-selected-summary">
          <p className="hs-step-section-label">Selected client</p>
          <p className="hs-client-selected-name">{selected.owner.name}</p>
          <p className="hs-client-selected-detail">{formatOwnerAddress(selected.owner)} · {selected.owner.phone}</p>
          <p className="hs-client-selected-detail">{selected.owner.email}</p>
        </div>
      )}
    </div>
  );
}
