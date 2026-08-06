import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Leaf,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { brand, contact, heroStats, services } from "@/components/marketing/content";
import { NumberTicker } from "@/components/site/NumberTicker";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";
import { SpotlightCard } from "@/components/site/SpotlightCard";

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
      {/* The generated departure shot is the landing experience. */}
      <section className="hs-hero">
        <div className="hs-hero-media">
          <Image
            src="/video/homeshine-departure-poster.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            aria-hidden
          />
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/video/homeshine-departure-poster.jpg"
            aria-hidden="true"
            tabIndex={-1}
          >
            <source
              src="/video/homeshine-departure-mobile.mp4"
              type="video/mp4"
              media="(max-width: 720px)"
            />
            <source src="/video/homeshine-departure-1080.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hs-hero-veil" aria-hidden />

        <div className="hs-shell hs-hero-inner">
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
          </div>

          <Reveal
            className="hs-stat-rail"
            delay={220}
            style={{ ["--cols" as string]: heroStats.length }}
          >
            {heroStats.map((stat) => (
              <Link
                href={stat.href}
                key={stat.label}
                target={stat.external ? "_blank" : undefined}
                rel={stat.external ? "noreferrer" : undefined}
                aria-label={stat.external ? `${stat.label}, opens Google reviews` : stat.label}
              >
                <p className="hs-stat-value">
                  <NumberTicker value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="hs-stat-label">{stat.label}</p>
              </Link>
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
