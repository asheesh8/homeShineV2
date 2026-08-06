"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type AccordionProps = {
  items: { question: string; answer: string }[];
  /** Index open on first paint. Pass null for all-closed. */
  initial?: number | null;
};

export function Accordion({ items, initial = 0 }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(initial);

  return (
    <div className="hs-acc">
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `hs-acc-panel-${index}`;

        return (
          <div className={`hs-acc-item${isOpen ? " is-open" : ""}`} key={item.question}>
            <button
              type="button"
              className="hs-acc-trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              {item.question}
              <span className="hs-acc-icon" aria-hidden>
                <Plus size={17} />
              </span>
            </button>
            <div className="hs-acc-body" id={panelId} role="region">
              <div>
                <p className="hs-body">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
