import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { planValue } from "@/components/marketing/content";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/**
 * Sets HomeSHINE's plans against each other on a per-visit basis. Every number
 * comes from the plan table in `planValue` — list price and visit count, both
 * HomeSHINE's own. No competitor figures belong in this component; a claim
 * about what anyone else charges needs a sourced, dated quote behind it.
 */
export function PlanValue() {
  const one = planValue.find((r) => r.id === "shine-now")!;
  const protection = planValue.find((r) => r.id === "protection")!;
  const renew = planValue.find((r) => r.id === "shine-renew")!;

  const perVisit = protection.price / protection.visits;
  const top = Math.max(...planValue.map((r) => r.price / r.visits));

  return (
    <div className="hs-value">
      <div className="hs-value-copy">
        <span className="hs-badge hs-badge-lime">Set price, not a running tab</span>
        <h3 className="hs-h2" style={{ fontSize: "clamp(1.45rem, 1.15rem + 1.3vw, 2rem)" }}>
          {protection.visits} visits for {money(protection.price)}. A single one-off wash is{" "}
          {money(one.price)}.
        </h3>
        <p className="hs-body" style={{ fontSize: "1rem" }}>
          That works out to about {money(perVisit)} a visit. HomeSHINE quotes the property once and
          the number holds — no per-surface add-ons appearing on the invoice, and no charge for
          showing up three times instead of one.
        </p>

        <ul className="hs-value-points">
          <li>
            <CheckCircle2 size={16} />
            {protection.visits} scheduled visits a season, priced up front as one number
          </li>
          <li>
            <CheckCircle2 size={16} />
            Priority booking window through the busy stretch
          </li>
          <li>
            <CheckCircle2 size={16} />
            Condition report each visit, so you see what changed
          </li>
        </ul>

        <Link href="/book" className="hs-btn hs-btn-primary">
          Start SHINE-Protection
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="hs-value-chart">
        <p className="hs-value-chart-title">Cost per visit</p>

        {planValue.map((row) => {
          const each = row.price / row.visits;
          return (
            <div className={`hs-value-bar${row.best ? " is-best" : ""}`} key={row.id}>
              <div className="hs-value-bar-head">
                <span>{row.label}</span>
                <b className={row.best ? "is-win" : ""}>{money(each)}</b>
              </div>
              <div className="hs-value-track">
                <div
                  className={`hs-value-fill${row.best ? " is-win" : ""}`}
                  style={{ width: `${Math.round((each / top) * 100)}%` }}
                />
              </div>
              <p className="hs-value-bar-note">
                {row.plan} &middot; {money(row.price)} for {row.visits}{" "}
                {row.visits === 1 ? "visit" : "visits"} &middot; {row.note}
              </p>
            </div>
          );
        })}

        <p className="hs-value-fine">
          HomeSHINE list prices for a typical property, drawn to scale. {renew.plan} is what an
          exterior costs once it has been left long enough to need recovery. Your written scope
          after the free walkthrough is the number that counts.
        </p>
      </div>
    </div>
  );
}
