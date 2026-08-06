import type { Metadata } from "next";
import Image from "next/image";
import { MarketingShell } from "@/components/marketing/MarketingShell";
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
      <div className="hs-immersive-page">
        <section className="hs-immersive-hero">
          <div className="hs-immersive-copy">
            <p className="hs-site-kicker">Maintenance plans</p>
            <h1>Clean now. Stay protected through the season.</h1>
            <p>
              Pick the one-time reset, ongoing protection, a show-ready selling plan, or a deeper
              restoration path for a neglected exterior.
            </p>
          </div>
          <div className="hs-immersive-photo">
            <Image
              src="/promos/trucks2.jpeg"
              alt="HomeSHINE truck and trailer parked outside a home"
              fill
              sizes="(max-width: 900px) 100vw, 46vw"
              priority
            />
            <span>Prepared for full exterior care</span>
          </div>
        </section>

        <section className="hs-section-panel">
          <div className="hs-section-heading">
            <p className="hs-site-kicker">Packages</p>
            <h2>Choose the level of shine.</h2>
          </div>
          <div className="hs-price-grid">
            {plans.map((plan) => (
              <article className={`hs-price-card ${plan.featured ? "is-featured" : ""}`} key={plan.name}>
                {plan.featured && <span className="hs-plan-badge">Most protective</span>}
                <p className="hs-plan-label">{plan.label}</p>
                <h2>{plan.name}<sup>&trade;</sup></h2>
                <strong>{plan.price}</strong>
                <p>{plan.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
