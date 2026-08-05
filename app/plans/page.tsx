import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingPhoto } from "@/components/marketing/MarketingPhoto";
import { plans } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Plans",
  description: "HomeSHINE maintenance plans including SHINE NOW, SHINE-Protection, SHINE-Ready, and SHINE-Renew.",
};

export default function PlansPage() {
  return (
    <MarketingShell
      current="Plans"
      backgroundSrc="/promos/trucks2.jpeg"
      backgroundAlt="HomeSHINE truck and trailer staged at a residential property"
    >
      <section className="hs-screen-layout">
        <div className="hs-screen-copy">
          <p className="hs-site-kicker">Maintenance plans</p>
          <h1>Clean now. Stay protected through the season.</h1>
          <p>
            Pick the one-time reset, ongoing protection, a show-ready selling plan, or a deeper
            restoration path for a neglected exterior.
          </p>
          <MarketingPhoto
            src="/promos/trucks2.jpeg"
            alt="HomeSHINE truck and trailer parked outside a home"
            label="Prepared for full exterior care"
          />
        </div>

        <div className="hs-plan-compact-grid">
          {plans.map((plan) => (
            <article className={`hs-compact-card hs-plan-compact ${plan.featured ? "is-featured" : ""}`} key={plan.name}>
              {plan.featured && <span className="hs-plan-badge">Most protective</span>}
              <p className="hs-plan-label">{plan.label}</p>
              <h2>{plan.name}<sup>™</sup></h2>
              <strong>{plan.price}</strong>
              <p>{plan.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
