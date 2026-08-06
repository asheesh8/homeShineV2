import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CheckCircle2, PhoneCall } from "lucide-react";
import { contact, planSignals, plans } from "@/components/marketing/content";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";
import { PlanValue } from "@/components/site/widgets/PlanValue";
import { QuoteEstimator } from "@/components/site/widgets/QuoteEstimator";

export const metadata: Metadata = {
  title: "Plans",
  description:
    "HomeSHINE maintenance plans including SHINE NOW, SHINE-Protection, SHINE-Ready, and SHINE-Renew.",
};

export default function PlansPage() {
  return (
    <SiteShell current="Plans">
      <section className="hs-subhero">
        <div className="hs-hero-veil" aria-hidden />
        <div className="hs-shell">
          <div className="hs-subhero-grid">
            <Reveal className="hs-subhero-copy">
              <p className="hs-eyebrow">Maintenance plans</p>
              <h1 className="hs-h1">Clean now. Stay protected through the season.</h1>
              <p className="hs-lede">
                Pick the one-time reset, ongoing protection, a show-ready selling plan, or a deeper
                restoration path for a neglected exterior.
              </p>
              <div className="hs-hero-actions">
                <Link href="/book" className="hs-btn hs-btn-primary">
                  <CalendarDays size={19} />
                  Book a Visit
                </Link>
                <a href={contact.phoneHref} className="hs-btn hs-btn-glass">
                  <PhoneCall size={19} />
                  {contact.phone}
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <figure className="hs-subhero-photo">
                <Image
                  src="/promos/trucks2.jpeg"
                  alt="HomeSHINE truck and trailer parked outside a home"
                  fill
                  sizes="(max-width: 1080px) 100vw, 44vw"
                  priority
                />
                <figcaption>Prepared for full exterior care</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="hs-band hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-center">
            <p className="hs-eyebrow">Packages</p>
            <h2 className="hs-h2">Choose the level of shine.</h2>
            <p className="hs-lede">
              Every plan starts with a free walkthrough and a written scope. Prices below are
              starting points for a typical property.
            </p>
          </Reveal>

          <div className="hs-price-grid">
            {plans.map((plan, index) => (
              <Reveal
                key={plan.name}
                className={`hs-plan${plan.featured ? " is-featured" : ""}`}
                delay={index * 70}
              >
                {plan.featured && (
                  <span className="hs-badge hs-badge-lime hs-plan-flag">Most protective</span>
                )}
                <p className="hs-eyebrow" style={{ fontSize: "0.68rem" }}>
                  {plan.label}
                </p>
                <h3 className="hs-plan-name">
                  {plan.name}
                  <sup>&trade;</sup>
                </h3>
                <p className="hs-plan-price">
                  {plan.price}
                  <small>{plan.cadence}</small>
                </p>
                <p className="hs-body">{plan.detail}</p>
                <ul className="hs-plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <CheckCircle2 size={15} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="hs-band-tight hs-band-paper">
        <div className="hs-shell">
          <Reveal>
            <PlanValue />
          </Reveal>
        </div>
      </section>

      <section className="hs-band hs-band-mist">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">Ballpark it</p>
              <h2 className="hs-h2">One visit. Not seven invoices.</h2>
            </div>
            <p className="hs-lede">
              Steven does not sell surfaces one at a time. One trip covers the whole property, and
              that is where the savings come from. Add surfaces and watch the total.
            </p>
          </Reveal>

          <Reveal>
            <QuoteEstimator />
          </Reveal>
        </div>
      </section>

      <section className="hs-band hs-band-ink">
        <div className="hs-dots" aria-hidden style={{ color: "#7dd3fc" }} />
        <div className="hs-shell" style={{ position: "relative" }}>
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">How to choose</p>
              <h2 className="hs-h2">Match the plan to the property moment.</h2>
            </div>
            <p className="hs-lede">
              A light maintenance visit and a neglected-property renewal should not feel like the
              same product with a different price. HomeSHINE scopes the moment first.
            </p>
          </Reveal>

          <Reveal className="hs-hero-trust">
            {planSignals.map((signal) => (
              <span className="hs-badge hs-badge-glass" key={signal}>
                <CheckCircle2 size={14} />
                {signal}
              </span>
            ))}
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
