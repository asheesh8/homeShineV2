import { Droplet } from "lucide-react";

type MarqueeProps = {
  items: string[];
  label: string;
};

/** Seamless ticker. The track is duplicated so the -100% loop has no gap. */
export function Marquee({ items, label }: MarqueeProps) {
  return (
    <div className="hs-marquee" aria-label={label} role="group">
      {[0, 1].map((copy) => (
        <div className="hs-marquee-track" key={copy} aria-hidden={copy === 1}>
          {items.map((item) => (
            <span className="hs-marquee-item" key={`${copy}-${item}`}>
              <Droplet size={15} strokeWidth={2.4} />
              {item}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
