"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

export function TransformationSlider() {
  const [position, setPosition] = useState(54);

  return (
    <div className="hs-reveal" style={{ "--reveal": `${position}%` } as CSSProperties}>
      <div className="hs-reveal-stage" aria-label="HomeSHINE real jobsite media comparison">
        <video className="hs-reveal-media" src="/promos/exterior-result.mp4" autoPlay muted loop playsInline />
        <div className="hs-reveal-after" aria-hidden>
          <Image
            src="/promos/steven-cleaning.jpeg"
            alt=""
            width={1200}
            height={900}
            sizes="(max-width: 760px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="hs-reveal-line" aria-hidden>
          <span />
        </div>
        <div className="hs-reveal-tags" aria-hidden>
          <span>Growth</span>
          <span>Treatment</span>
        </div>
        <input
          className="hs-reveal-range"
          type="range"
          min="18"
          max="82"
          value={position}
          aria-label="Adjust HomeSHINE media reveal"
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </div>
    </div>
  );
}
