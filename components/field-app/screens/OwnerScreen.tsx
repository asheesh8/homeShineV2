"use client";

import { ChevronLeft } from "lucide-react";
import { Button, FieldLabel, Panel, TextInput } from "@/components/field-app/ui";
import { type Owner } from "@/lib/simple-field";

export function OwnerScreen({
  ownerDraft,
  townMatches,
  stateMatches,
  onOwnerChange,
  onCancel,
  onSave,
}: {
  ownerDraft: Owner;
  townMatches: readonly string[];
  stateMatches: readonly string[];
  onOwnerChange: (owner: Owner) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  function set<K extends keyof Owner>(key: K, value: Owner[K]) {
    onOwnerChange({ ...ownerDraft, [key]: value });
  }

  return (
    <section className="hs-page hs-narrow hs-screen-enter">
      <Button type="button" variant="ghost" onClick={onCancel}>
        <ChevronLeft size={18} />
        Home
      </Button>
      <Panel>
        <p className="hs-kicker">New assessment</p>
        <h1>Owner info</h1>
        <div className="hs-form-grid">
          <div>
            <FieldLabel>Owner name</FieldLabel>
            <TextInput
              aria-label="Owner name"
              value={ownerDraft.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Street</FieldLabel>
            <TextInput
              aria-label="Street"
              placeholder="11 Main St"
              value={ownerDraft.street}
              onChange={(e) => set("street", e.target.value)}
            />
          </div>
          <div className="hs-two-field-grid">
            <div>
              <FieldLabel>Town / city</FieldLabel>
              <TextInput
                list="town-options"
                aria-label="Town or city"
                placeholder="South Burlington"
                value={ownerDraft.city}
                onChange={(e) => set("city", e.target.value)}
              />
              <datalist id="town-options">
                {townMatches.map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div>
              <FieldLabel>State</FieldLabel>
              <TextInput
                list="state-options"
                aria-label="State"
                value={ownerDraft.state}
                onChange={(e) => set("state", e.target.value.toUpperCase())}
              />
              <datalist id="state-options">
                {stateMatches.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <TextInput
              aria-label="Phone"
              value={ownerDraft.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput
              type="email"
              aria-label="Email"
              value={ownerDraft.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
        </div>
        <Button type="button" wide onClick={onSave}>
          Save and open
        </Button>
      </Panel>
    </section>
  );
}
