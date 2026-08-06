import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Leaf,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { brand, contact, heroStats, plans, services } from "@/components/marketing/content";
import { NumberTicker } from "@/components/site/NumberTicker";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { BeforeAfter } from "@/components/site/widgets/BeforeAfter";
import { PlanValue } from "@/components/site/widgets/PlanValue";
import { QuoteEstimator } from "@/components/site/widgets/QuoteEstimator";
import { ServiceAreaMap } from "@/components/site/widgets/ServiceAreaMap";

/**
 * Deliberately short. The deep content — full service list, the soft-wash vs
 * pressure-wash explorer, the process steps, the FAQ — lives on its own page
 * rather than stacking onto the landing page.
 */
export default function HomePage() {
  // Hero block plus five cards tiles the 3-column bento exactly.
  const [featured, ...rest] = services;
  const bentoCards = rest.slice(0, 5);

  return (
    <SiteShell current="Home">
      {/* ─── Hero: the before/after slider doubles as the showcase ─── */}
      <section className="hs-hero">
        <div className="hs-hero-media">
          <Image src="/homeshine-truck.png" alt="" fill sizes="100vw" priority aria-hidden />
        </div>
        <div className="hs-hero-veil" aria-hidden />

        <div className="hs-shell">
          <div className="hs-hero-grid">
            <Reveal className="hs-hero-copy">
              <p className="hs-eyebrow">
                <MapPin size={13} />
                Chittenden County, VT &nbsp;+&nbsp; Tampa Bay, FL
              </p>

              <h1 className="hs-display">Your whole property, made new.</h1>

              <p className="hs-lede">
                Roof-safe soft washing and hard-surface power washing from Steven and Beth&apos;s
                crew. {brand.promise}
              </p>

              <div className="hs-hero-actions">
                <Link href="/book" className="hs-btn hs-btn-primary">
                  <CalendarDays size={19} />
                  Free onsite assessment
                </Link>
                <a href={contact.phoneHref} className="hs-btn hs-btn-glass">
                  <PhoneCall size={19} />
                  {contact.phone}
                </a>
              </div>

              <div className="hs-hero-trust">
                <span className="hs-badge hs-badge-glass">
                  <ShieldCheck size={14} />
                  Fully insured
                </span>
                <span className="hs-badge hs-badge-glass">
                  <Leaf size={14} />
                  Pet and plant safe
                </span>
                <span className="hs-badge hs-badge-glass">
                  <Clock size={14} />
                  {contact.hours}
                </span>
              </div>
            </Reveal>

            <Reveal className="hs-hero-showcase" delay={140}>
              <BeforeAfter />
            </Reveal>
          </div>

          <Reveal
            className="hs-stat-rail"
            delay={220}
            style={{ ["--cols" as string]: heroStats.length }}
          >
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="hs-stat-value">
                  <NumberTicker value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="hs-stat-label">{stat.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── Services ───────────────────────────────────────────── */}
      <section className="hs-band hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">What we clean</p>
              <h2 className="hs-h2">The right wash for every surface.</h2>
            </div>
            <p className="hs-lede">
              Soft washing and power washing are different tools. HomeSHINE matches the method to
              the material, so delicate surfaces get chemistry and durable surfaces get force.
            </p>
          </Reveal>

          <div className="hs-bento">
            <Reveal className="hs-card hs-bento-hero is-hero">
              <Image
                src="/promos/steven-cleaning.jpeg"
                alt="HomeSHINE technician treating roof stains on a Vermont home"
                fill
                sizes="(max-width: 1080px) 100vw, 50vw"
              />
              <span className="hs-badge hs-badge-glass" style={{ alignSelf: "flex-start" }}>
                <featured.icon size={14} />
                Signature service
              </span>
              <h3 className="hs-h2" style={{ fontSize: "clamp(1.4rem, 1.1rem + 1.1vw, 1.85rem)" }}>
                {featured.name}
              </h3>
              <p className="hs-body">{featured.detail}</p>
            </Reveal>

            {bentoCards.map((service, index) => (
              <Reveal key={service.name} delay={60 + index * 45}>
                <SpotlightCard className="hs-service-card" style={{ height: "100%" }}>
                  <span className="hs-card-icon">
                    <service.icon size={21} />
                  </span>
                  <h3 className="hs-h3">{service.name}</h3>
                  <p className="hs-body">{service.detail}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>

          <Reveal style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
            <Link href="/services" className="hs-btn hs-btn-outline">
              All {services.length} services and how each one is washed
              <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ─── Coverage map ───────────────────────────────────────── */}
      <section className="hs-band hs-band-ink">
        <div className="hs-dots" aria-hidden style={{ color: "#7dd3fc" }} />
        <div className="hs-shell" style={{ position: "relative" }}>
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">Where we work</p>
              <h2 className="hs-h2">Two regions, one standard.</h2>
            </div>
            <p className="hs-lede">
              Chittenden County six days a week through the Vermont season, plus a Tampa Bay route.
              Tap a town to see how it gets scheduled.
            </p>
          </Reveal>

          <Reveal>
            <ServiceAreaMap />
          </Reveal>
        </div>
      </section>

      {/* ─── Estimator + plans in one costing block ─────────────── */}
      <section className="hs-band hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">What it costs</p>
              <h2 className="hs-h2">One visit. Not seven invoices.</h2>
            </div>
            <p className="hs-lede">
              Steven does not sell surfaces one at a time. The crew comes once and does the whole
              property in a single pass, which is exactly where the savings come from. Add surfaces
              below and watch what it does to the total.
            </p>
          </Reveal>

          <Reveal>
            <QuoteEstimator />
          </Reveal>

          <Reveal style={{ marginTop: 40 }}>
            <PlanValue />
          </Reveal>

          <div className="hs-price-grid" style={{ marginTop: 24 }}>
            {plans.map((plan, index) => (
              <Reveal
                key={plan.name}
                className={`hs-plan${plan.featured ? " is-featured" : ""}`}
                delay={index * 60}
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
                <p className="hs-plan-features">
                  <CheckCircle2 size={15} />
                  <span>{plan.features[0]}</span>
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section className="hs-band-tight hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-cta">
            <div className="hs-dots" aria-hidden style={{ color: "#7dd3fc" }} />
            <div className="hs-cta-copy">
              <p className="hs-eyebrow">Ready when you are</p>
              <h2 className="hs-h2">{brand.offer}</h2>
              <p className="hs-lede">
                Send photos or book the walkthrough. Either way you get a written scope before
                anything gets sprayed.
              </p>
            </div>
            <div className="hs-cta-actions">
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
        </div>
      </section>
    </SiteShell>
  );
}
