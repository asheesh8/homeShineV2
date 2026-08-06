"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { ArrowRight, Check, Info, Truck } from "lucide-react";
import {
  creditFor,
  estimatorConditions,
  estimatorServices,
  estimatorStories,
  plans,
} from "@/components/marketing/content";

const MIN_SQFT = 900;
const MAX_SQFT = 5000;

/** Only work done off the ground gets the multi-story surcharge. */
const ELEVATED = new Set(["house", "roof", "gutters", "solar", "windows"]);

const money = (n: number) => `$${Math.round(n / 10) * 10}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export function QuoteEstimator() {
  const [sqft, setSqft] = useState(2200);
  const [stories, setStories] = useState<number>(2);
  const [condition, setCondition] = useState<string>("moderate");
  const [picked, setPicked] = useState<string[]>(["house", "roof", "gutters"]);

  const conditionMul = estimatorConditions.find((c) => c.id === condition)?.multiplier ?? 1;
  const storyMul = estimatorStories.find((s) => s.id === stories)?.multiplier ?? 1;

  const lines = useMemo(
    () =>
      estimatorServices
        .filter((service) => picked.includes(service.id))
        .map((service) => {
          const base = Math.max(service.floor, (service.rate * sqft) / 1000);
          const elevation = ELEVATED.has(service.id) ? storyMul : 1;
          return { id: service.id, label: service.label, amount: base * elevation * conditionMul };
        }),
    [picked, sqft, storyMul, conditionMul],
  );

  // Same rates either way. The difference is one trip instead of several.
  const separately = lines.reduce((sum, line) => sum + line.amount, 0);
  const credit = creditFor(picked.length);
  const oneVisit = separately * (1 - credit);
  const saved = separately - oneVisit;
  const perSurface = picked.length ? oneVisit / picked.length : 0;

  // Once the scope reaches a plan's list price, the plan is the better buy.
  const shineNow = plans.find((p) => p.name === "SHINE NOW");
  const planPrice = Number(shineNow?.price.replace(/[^0-9]/g, "") ?? 0);
  const planBeatsScope = oneVisit >= planPrice * 0.82 && planPrice > 0;

  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );

  const sliderPct = ((sqft - MIN_SQFT) / (MAX_SQFT - MIN_SQFT)) * 100;

  return (
    <div className="hs-est">
      <div className="hs-est-form">
        <div className="hs-est-field">
          <label className="hs-est-label" htmlFor="hs-est-sqft">
            <span>Home size</span>
            <b>{sqft.toLocaleString()} sq ft</b>
          </label>
          <input
            id="hs-est-sqft"
            className="hs-est-range"
            type="range"
            min={MIN_SQFT}
            max={MAX_SQFT}
            step={100}
            value={sqft}
            onChange={(e) => setSqft(Number(e.target.value))}
            style={{ "--pct": `${sliderPct}%` } as CSSProperties}
          />
        </div>

        <div className="hs-est-field">
          <p className="hs-est-label">
            <span>Height</span>
          </p>
          <div className="hs-est-seg" style={{ "--cols": 3 } as CSSProperties}>
            {estimatorStories.map((option) => (
              <button
                key={option.id}
                type="button"
                className={option.id === stories ? "is-on" : ""}
                onClick={() => setStories(option.id)}
                aria-pressed={option.id === stories}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hs-est-field">
          <p className="hs-est-label">
            <span>Current condition</span>
          </p>
          <div className="hs-est-seg" style={{ "--cols": 3 } as CSSProperties}>
            {estimatorConditions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={option.id === condition ? "is-on" : ""}
                onClick={() => setCondition(option.id)}
                aria-pressed={option.id === condition}
                title={option.detail}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hs-est-field">
          <p className="hs-est-label">
            <span>Add it to the same visit</span>
            <b>{picked.length} selected</b>
          </p>
          <div className="hs-est-checks">
            {estimatorServices.map(({ icon: Icon, id, label }) => (
              <button
                key={id}
                type="button"
                className={`hs-est-check${picked.includes(id) ? " is-on" : ""}`}
                onClick={() => toggle(id)}
                aria-pressed={picked.includes(id)}
              >
                {picked.includes(id) ? <Check size={17} /> : <Icon size={17} />}
                {label}
              </button>
            ))}
          </div>
          <p className="hs-est-hint">
            <Truck size={14} />
            Steven prices the visit, not the line item. Every surface added to the same trip pulls
            the cost of all of them down.
          </p>
        </div>
      </div>

      <div className="hs-est-out">
        <span className="hs-badge hs-badge-glass" style={{ alignSelf: "flex-start" }}>
          One visit, one price
        </span>

        <p className="hs-est-price">
          {lines.length ? `${money(oneVisit * 0.92)} – ${money(oneVisit * 1.1)}` : "—"}
        </p>

        {lines.length ? (
          <>
            <div className="hs-est-compare">
              <div className="hs-est-compare-row">
                <span>Billed service by service, {picked.length} line items</span>
                <b className="is-was">{money(separately)}</b>
              </div>
              <div className="hs-est-compare-row is-win">
                <span>HomeSHINE set price, one visit</span>
                <b>{money(oneVisit)}</b>
              </div>
              {credit > 0 && (
                <p className="hs-est-saved">
                  <strong>{money(saved)} less</strong>
                  <span>
                    for doing it in one pass &middot; {money(perSurface)} a surface
                  </span>
                </p>
              )}
            </div>

            {planBeatsScope && shineNow && (
              <p className="hs-est-plan">
                <Check size={15} />
                <span>
                  At this scope you are into <strong>{shineNow.name}</strong> territory (
                  {shineNow.price}, roof to curb). Ask Steven which way lands cheaper.
                </span>
              </p>
            )}
          </>
        ) : (
          <p className="hs-est-empty">Pick at least one surface to see a range.</p>
        )}

        <p className="hs-est-note">
          <Info size={15} />
          <span>
            Ballpark from typical {stories === 1 ? "single" : "multi"}-story jobs, not a quote.
            Both figures use HomeSHINE&apos;s own rates — the difference is a single set price for
            one visit instead of a separate charge per service.
          </span>
        </p>

        <Link href="/book" className="hs-btn hs-btn-primary" style={{ alignSelf: "flex-start" }}>
          Get the real number
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
