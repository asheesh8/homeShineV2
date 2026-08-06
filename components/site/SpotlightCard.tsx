"use client";

import { useCallback, type CSSProperties, type MouseEvent, type ReactNode } from "react";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Card that tracks the cursor so a soft highlight follows it across the surface. */
export function SpotlightCard({ children, className = "", style }: SpotlightCardProps) {
  const onMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, []);

  return (
    <div
      className={`hs-card hs-card-hover hs-card-spot${className ? ` ${className}` : ""}`}
      style={style}
      onMouseMove={onMove}
    >
      {children}
    </div>
  );
}
