"use client";

import { Check, ChevronLeft } from "lucide-react";
import { Button, FieldLabel, Panel, SelectInput, TextArea, TextInput } from "@/components/field-app/ui";
import { ConditionButtons } from "@/components/field-app/shared/ConditionButtons";
import { prettyLabel } from "@/components/field-app/utils";
import type { SectionDefinition, SectionValue } from "@/lib/simple-field";

export function SectionScreen({
  section,
  sectionDraft,
  onDraft,
  onBack,
  onSave,
}: {
  section: SectionDefinition;
  sectionDraft: SectionValue;
  onDraft: (value: SectionValue) => void;
  onBack: () => void;
  onSave: () => void;
}) {
  function set(key: string, value: unknown) {
    onDraft({ ...sectionDraft, [key]: value });
  }

  return (
    <section className="hs-page hs-narrow hs-screen-enter">
      <Button type="button" variant="ghost" onClick={onBack}>
        <ChevronLeft size={18} />
        Assessment
      </Button>
      <Panel>
        <p className="hs-kicker">Section details</p>
        <h1>{section.label}</h1>
        <div className="hs-form-grid">
          {section.fields.map((field) => (
            <div key={field.key}>
              <FieldLabel>{prettyLabel(field)}</FieldLabel>

              {(field.kind === "text" || field.kind === "number") && (
                <TextInput
                  type={field.kind}
                  aria-label={prettyLabel(field)}
                  placeholder={field.placeholder ?? ""}
                  value={sectionDraft[field.key] === undefined ? "" : String(sectionDraft[field.key])}
                  onChange={(e) =>
                    set(field.key, field.kind === "number" && e.target.value ? Number(e.target.value) : e.target.value)
                  }
                />
              )}

              {field.kind === "select" && (
                <SelectInput
                  aria-label={prettyLabel(field)}
                  value={String(sectionDraft[field.key] ?? "")}
                  onChange={(e) => set(field.key, e.target.value)}
                >
                  <option value="">Choose one</option>
                  {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </SelectInput>
              )}

              {field.kind === "toggle" && (
                <button
                  type="button"
                  className={`hs-toggle-row ${sectionDraft[field.key] ? "is-on" : ""}`}
                  onClick={() => set(field.key, !sectionDraft[field.key])}
                >
                  <span>{sectionDraft[field.key] ? "Yes" : "No"}</span>
                  <Check size={18} />
                </button>
              )}

              {field.kind === "condition" && (
                <ConditionButtons
                  value={String(sectionDraft[field.key] ?? "")}
                  onChange={(v) => set(field.key, v)}
                />
              )}

              {field.kind === "notes" && (
                <TextArea
                  aria-label={prettyLabel(field)}
                  placeholder={field.placeholder ?? ""}
                  value={String(sectionDraft[field.key] ?? "")}
                  onChange={(e) => set(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <Button type="button" wide onClick={onSave}>
          Save section
        </Button>
      </Panel>
    </section>
  );
}
