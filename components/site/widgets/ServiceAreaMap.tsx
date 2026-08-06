"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Navigation } from "lucide-react";
import { serviceRegions, type ServiceRegion, type ServiceTown } from "@/components/marketing/content";

const VIEW_W = 640;
const VIEW_H = 500;
const PAD = 66;
const MILES_PER_DEG_LAT = 69;

type Projected = ServiceTown & { x: number; y: number; miles: number };

/**
 * Projects lat/lng into the SVG box. Longitude is scaled by cos(lat) so the
 * region keeps roughly its real proportions instead of stretching east-west.
 * One shared scale is used for both axes, so nothing is squashed.
 */
function project(region: ServiceRegion) {
  // Fit to the towns only. Including the coastline in the bounds pushed every
  // town into one corner; the water is clipped to the frame instead.
  const points = region.towns.map((t) => ({ lat: t.lat, lng: t.lng }));

  const midLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const k = Math.cos((midLat * Math.PI) / 180);

  const xs = points.map((p) => p.lng * k);
  const ys = points.map((p) => p.lat);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const scale = Math.min((VIEW_W - PAD * 2) / (maxX - minX), (VIEW_H - PAD * 2) / (maxY - minY));
  const offX = (VIEW_W - (maxX - minX) * scale) / 2;
  const offY = (VIEW_H - (maxY - minY) * scale) / 2;

  const toXY = (lat: number, lng: number) => ({
    x: (lng * k - minX) * scale + offX,
    y: VIEW_H - ((lat - minY) * scale + offY), // SVG y grows downward
  });

  const base = toXY(region.baseLat, region.baseLng);
  const pxPerMile = scale / MILES_PER_DEG_LAT;

  const towns: Projected[] = region.towns.map((town) => {
    const xy = toXY(town.lat, town.lng);
    return {
      ...town,
      ...xy,
      miles: Math.round(Math.hypot(xy.x - base.x, xy.y - base.y) / pxPerMile),
    };
  });

  return {
    towns,
    base,
    pxPerMile,
    water: region.water.map(([lat, lng]) => toXY(lat, lng)),
  };
}

type Rect = { x1: number; y1: number; x2: number; y2: number };

const overlaps = (a: Rect, b: Rect) =>
  a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;

/**
 * Greedy label placement. Towns are considered in priority order and a label is
 * kept only if its box clears every label already placed — so dense clusters
 * like Burlington / Winooski / South Burlington stop printing on top of
 * each other. The base and the hovered town always win their slot.
 */
function placeLabels(towns: Projected[], baseName: string, activeName: string | null) {
  const rank = (t: Projected) =>
    t.name === baseName ? 0 : t.name === activeName ? 1 : t.tier === "core" ? 2 : 3;

  const ordered = [...towns].sort((a, b) => rank(a) - rank(b) || a.miles - b.miles);
  // Every pin is an obstacle, so a label never prints across a neighbouring dot.
  const placed: Rect[] = towns.map((t) => ({
    x1: t.x - 8,
    y1: t.y - 8,
    x2: t.x + 8,
    y2: t.y + 8,
  }));
  const result = new Map<string, { flip: boolean }>();

  for (const town of ordered) {
    const forced = town.name === baseName || town.name === activeName;
    const w = town.name.length * 5.9 + 18;
    const h = 15;

    // Try the outboard side first, then flip inboard.
    const options = town.x > VIEW_W - w - 20 ? [true, false] : [false, true];
    let done = false;

    for (const flip of options) {
      const box: Rect = {
        x1: flip ? town.x - 13 - w : town.x + 13,
        y1: town.y - h / 2,
        x2: flip ? town.x - 13 : town.x + 13 + w,
        y2: town.y + h / 2,
      };
      if (box.x1 < 2 || box.x2 > VIEW_W - 2) continue;
      if (placed.some((p) => overlaps(box, p))) continue;

      placed.push(box);
      result.set(town.name, { flip });
      done = true;
      break;
    }

    // A forced label gets drawn even if it has to sit on top of something.
    if (!done && forced) {
      const flip = town.x > VIEW_W - w - 20;
      placed.push({
        x1: flip ? town.x - 13 - w : town.x + 13,
        y1: town.y - h / 2,
        x2: flip ? town.x - 13 : town.x + 13 + w,
        y2: town.y + h / 2,
      });
      result.set(town.name, { flip });
    }
  }

  return result;
}

/** Catmull-Rom through the points, emitted as cubic beziers — no kinks. */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function ServiceAreaMap() {
  const [regionId, setRegionId] = useState(serviceRegions[0].id);
  const [activeTown, setActiveTown] = useState<string | null>(null);

  const region = serviceRegions.find((r) => r.id === regionId) ?? serviceRegions[0];
  const geo = useMemo(() => project(region), [region]);

  const selected = geo.towns.find((t) => t.name === activeTown) ?? null;
  const coreCount = region.towns.filter((t) => t.tier === "core").length;
  const furthest = Math.max(...geo.towns.map((t) => t.miles));

  const coastline = smoothPath(geo.water);
  // Fill the seaward side by closing the smoothed coast well off-canvas, then
  // clip to the frame. A gradient fades it so it reads as water, not a slab.
  const waterFill = `${coastline} L${-VIEW_W} ${VIEW_H * 2} L${-VIEW_W} ${-VIEW_H} Z`;

  const ringMiles = [10, 20, 30, 40].filter((m) => m <= furthest + 6);
  const labels = placeLabels(geo.towns, region.base, activeTown);

  return (
    <div className="hs-map">
      <div className="hs-map-stage">
        <svg
          className="hs-map-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Illustrative coverage map for ${region.label}`}
        >
          <defs>
            <linearGradient id="hsWater" x1="0" y1="0" x2="1" y2="0.3">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.02" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.26" />
            </linearGradient>

            <radialGradient id="hsCoverage">
              <stop offset="0%" stopColor="#c8f75a" stopOpacity="0.24" />
              <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="hsSweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
            </linearGradient>

            <filter id="hsSoft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="9" />
            </filter>

            <clipPath id="hsFrame">
              <rect x="0" y="0" width={VIEW_W} height={VIEW_H} rx="18" />
            </clipPath>
          </defs>

          {/* Water — illustrative coastline, not survey-accurate */}
          <g clipPath="url(#hsFrame)">
            <path d={waterFill} fill="url(#hsWater)" />
            <path d={coastline} className="hs-map-coast" />
          </g>

          {/* Coverage bloom around the home base */}
          <circle
            cx={geo.base.x}
            cy={geo.base.y}
            r={geo.pxPerMile * (furthest * 0.85)}
            fill="url(#hsCoverage)"
            filter="url(#hsSoft)"
          />

          {/* Radar sweep */}
          <g
            className="hs-map-sweep"
            style={{ transformOrigin: `${geo.base.x}px ${geo.base.y}px` }}
          >
            <path
              d={`M${geo.base.x} ${geo.base.y} L${geo.base.x + 420} ${geo.base.y - 120} A420 420 0 0 0 ${
                geo.base.x + 420
              } ${geo.base.y + 120} Z`}
              fill="url(#hsSweep)"
            />
          </g>

          {/* Distance rings, labelled up-and-right so the text stays in frame */}
          {ringMiles.map((miles) => {
            const r = geo.pxPerMile * miles;
            const lx = geo.base.x + r * 0.707;
            const ly = geo.base.y - r * 0.707;
            const inFrame = lx > 24 && lx < VIEW_W - 24 && ly > 16 && ly < VIEW_H - 10;

            return (
              <g key={miles}>
                <circle className="hs-map-ring" cx={geo.base.x} cy={geo.base.y} r={r} />
                {inFrame && (
                  <text className="hs-map-ring-label" x={lx} y={ly} textAnchor="middle">
                    {miles} mi
                  </text>
                )}
              </g>
            );
          })}

          {/* Curved routes from base to each town */}
          <g>
            {geo.towns.map((town) => {
              const mx = (geo.base.x + town.x) / 2;
              const my = (geo.base.y + town.y) / 2;
              // Bow each arc perpendicular to its own run so they fan out.
              const dx = town.x - geo.base.x;
              const dy = town.y - geo.base.y;
              const len = Math.hypot(dx, dy) || 1;
              const bow = len * 0.14;
              const cx = mx - (dy / len) * bow;
              const cy = my + (dx / len) * bow;

              return (
                <path
                  key={`arc-${town.name}`}
                  className={`hs-map-arc${town.name === activeTown ? " is-active" : ""}`}
                  d={`M${geo.base.x} ${geo.base.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${town.x.toFixed(
                    1,
                  )} ${town.y.toFixed(1)}`}
                />
              );
            })}
          </g>

          {/* Home base marker */}
          <g className="hs-map-base" aria-hidden>
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                className="hs-map-pulse"
                cx={geo.base.x}
                cy={geo.base.y}
                r={geo.pxPerMile * furthest * 0.7}
                style={{ animationDelay: `${i * 1.5}s` }}
              />
            ))}
          </g>

          {geo.towns.map((town) => {
            const isBase = town.name === region.base;
            const isActive = town.name === activeTown;
            const label = labels.get(town.name);

            return (
              <g
                key={town.name}
                className={`hs-map-pin${town.tier === "edge" ? " is-edge" : ""}${
                  isBase ? " is-base" : ""
                }${isActive ? " is-active" : ""}`}
                onMouseEnter={() => setActiveTown(town.name)}
                onFocus={() => setActiveTown(town.name)}
                onClick={() => setActiveTown(town.name)}
                tabIndex={0}
                role="button"
                aria-label={`${town.name}, ${town.miles} miles from ${region.base}, ${
                  town.tier === "core" ? "primary route" : "scheduled runs"
                }`}
              >
                <circle className="halo" cx={town.x} cy={town.y} r={isActive ? 22 : 16} />
                {isBase && <circle className="basering" cx={town.x} cy={town.y} r={13} />}
                <circle
                  className="dot"
                  cx={town.x}
                  cy={town.y}
                  r={isBase ? 7 : town.tier === "core" ? 5 : 3.8}
                />
                {label && (
                  <text
                    x={label.flip ? town.x - 13 : town.x + 13}
                    y={town.y + 3.8}
                    textAnchor={label.flip ? "end" : "start"}
                  >
                    {town.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="hs-map-legend">
          <span>
            <i className="base" />
            Home base
          </span>
          <span>
            <i />
            Primary route
          </span>
          <span>
            <i className="edge" />
            Scheduled runs
          </span>
        </div>
      </div>

      <div className="hs-map-side">
        <div className="hs-map-switch" role="tablist" aria-label="Service region">
          {serviceRegions.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={r.id === regionId}
              className={r.id === regionId ? "is-on" : ""}
              onClick={() => {
                setRegionId(r.id);
                setActiveTown(null);
              }}
            >
              {r.short}
            </button>
          ))}
        </div>

        <div className="hs-map-readout">
          {selected ? (
            <>
              <span className="hs-badge hs-badge-glass">
                <MapPin size={13} />
                {selected.miles} mi from {region.base}
              </span>
              <p className="hs-map-readout-town">{selected.name}</p>
              <p className="hs-map-readout-body">
                {selected.tier === "core"
                  ? `On the regular ${region.short} route. Usually schedulable inside the same week.`
                  : `Served on scheduled ${region.short} runs. Steven groups these visits, so timing is confirmed when you book.`}
              </p>
            </>
          ) : (
            <>
              <span className="hs-badge hs-badge-glass">
                <Navigation size={13} />
                Based in {region.base}
              </span>
              <p className="hs-map-readout-town">{region.label}</p>
              <p className="hs-map-readout-body">{region.blurb}</p>
            </>
          )}

          <div className="hs-map-metrics">
            <div>
              <strong>{region.towns.length}</strong>
              <span>towns covered</span>
            </div>
            <div>
              <strong>{coreCount}</strong>
              <span>on the core route</span>
            </div>
          </div>
        </div>

        <div className="hs-map-chips">
          {geo.towns.map((town) => (
            <button
              key={town.name}
              type="button"
              className={`hs-map-chip${town.name === activeTown ? " is-on" : ""}`}
              onMouseEnter={() => setActiveTown(town.name)}
              onFocus={() => setActiveTown(town.name)}
              onClick={() => setActiveTown(town.name)}
            >
              {town.name}
            </button>
          ))}
        </div>

        <Link href="/contact" className="hs-btn hs-btn-glass hs-btn-sm">
          Not on the map? Ask anyway
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
