"use client";

import { FieldLabel, TextArea, TextInput } from "@/components/field-app/ui";
import type { Owner } from "@/lib/simple-field";

export function Step1Property({
  owner,
  writeup,
  townMatches,
  stateMatches,
  onOwnerChange,
  onWriteupChange,
}: {
  owner: Owner;
  writeup: string;
  townMatches: string[];
  stateMatches: string[];
  onOwnerChange: <K extends keyof Owner>(field: K, value: Owner[K]) => void;
  onWriteupChange: (value: string) => void;
}) {
  return (
    <div className="hs-stepper-step">
      <div className="hs-step-heading">
        <span className="hs-step-eyebrow">Step 1 of 6</span>
        <h2>Property info</h2>
        <p className="hs-step-description">
          Enter the homeowner&rsquo;s contact info and address. Add walkthrough notes while you&rsquo;re at the property.
        </p>
      </div>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section className="hs-step-section">
        <p className="hs-step-section-label">Homeowner contact</p>

        <div className="hs-form-grid">
          <div>
            <FieldLabel>Full name *</FieldLabel>
            <TextInput
              type="text"
              placeholder="Jane Smith"
              value={owner.name}
              onChange={(e) => onOwnerChange("name", e.target.value)}
              autoComplete="off"
            />
          </div>

          <div>
            <FieldLabel>Phone *</FieldLabel>
            <TextInput
              type="tel"
              placeholder="802-391-9977"
              value={owner.phone}
              onChange={(e) => onOwnerChange("phone", e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="hs-span-2">
            <FieldLabel>Email *</FieldLabel>
            <TextInput
              type="email"
              placeholder="jane@example.com"
              value={owner.email}
              onChange={(e) => onOwnerChange("email", e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </section>

      {/* ── Address ──────────────────────────────────────────────────── */}
      <section className="hs-step-section">
        <p className="hs-step-section-label">Property address</p>

        <div className="hs-form-grid">
          <div className="hs-span-2">
            <FieldLabel>Street address *</FieldLabel>
            <TextInput
              type="text"
              placeholder="18 Birch Hollow Lane"
              value={owner.street}
              onChange={(e) => onOwnerChange("street", e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="hs-autocomplete-wrap">
            <FieldLabel>City / Town *</FieldLabel>
            <TextInput
              type="text"
              placeholder="Burlington"
              value={owner.city}
              onChange={(e) => onOwnerChange("city", e.target.value)}
              autoComplete="off"
              list="step1-towns"
            />
            <datalist id="step1-towns">
              {townMatches.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>

          <div className="hs-autocomplete-wrap">
            <FieldLabel>State *</FieldLabel>
            <TextInput
              type="text"
              placeholder="VT"
              value={owner.state}
              onChange={(e) => onOwnerChange("state", e.target.value)}
              autoComplete="off"
              list="step1-states"
            />
            <datalist id="step1-states">
              {stateMatches.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>
        </div>
      </section>

      {/* ── Walkthrough notes ────────────────────────────────────────── */}
      <section className="hs-step-section">
        <p className="hs-step-section-label">Walkthrough notes</p>
        <FieldLabel>Field observations (optional)</FieldLabel>
        <TextArea
          placeholder="Quick notes from the property walk — overall condition, anything that stood out, access notes, etc."
          value={writeup}
          onChange={(e) => onWriteupChange(e.target.value)}
          style={{ minHeight: 140 }}
        />
        <p className="hs-step-hint">
          These notes carry through to the client packet and AI summary. Write freely — you&rsquo;ll refine the formal writeup in Step 2.
        </p>
      </section>
    </div>
  );
}
