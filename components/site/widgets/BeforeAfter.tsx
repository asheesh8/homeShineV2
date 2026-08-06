"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { MoveHorizontal } from "lucide-react";

type BeforeAfterProps = {
  leftLabel?: string;
  rightLabel?: string;
};

/**
 * Split reveal. The range input sits transparent over the whole stage, so drag,
 * click-to-jump, and arrow keys all work with one control and one a11y label.
 */
export function BeforeAfter({ leftLabel = "Mid-treatment", rightLabel = "Finished" }: BeforeAfterProps) {
  const [split, setSplit] = useState(48);

  return (
    <div className="hs-ba" style={{ "--split": `${split}%` } as CSSProperties}>
      <div className="hs-ba-layer">
        <Image
          src="/promos/steven-cleaning.jpeg"
          alt="HomeSHINE technician soft washing a residential roof"
          fill
          sizes="(max-width: 1080px) 100vw, 46vw"
        />
      </div>

      <div className="hs-ba-layer is-after">
        <video src="/promos/exterior-result.mp4" autoPlay muted loop playsInline aria-label="Finished exterior after HomeSHINE treatment" />
      </div>

      <span className="hs-ba-tag is-left">{leftLabel}</span>
      <span className="hs-ba-tag is-right">{rightLabel}</span>

      <div className="hs-ba-handle">
        <span className="hs-ba-knob">
          <MoveHorizontal size={21} />
        </span>
      </div>

      <input
        className="hs-ba-range"
        type="range"
        min={4}
        max={96}
        value={split}
        aria-label="Drag to compare mid-treatment and finished exterior"
        onChange={(event) => setSplit(Number(event.target.value))}
      />
    </div>
  );
}
