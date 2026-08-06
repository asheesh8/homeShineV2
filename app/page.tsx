import Link from "next/link";
import Image from "next/image";
import { CalendarDays, CheckCircle2, Clock, Leaf, PhoneCall, ShieldCheck } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { marketingNav, proofPoints } from "@/components/marketing/content";

export default function HomePage() {
  return (
    <MarketingShell
      dark
      current="Home"
      backgroundSrc="/homeshine-truck.png"
      backgroundAlt="HomeSHINE branded trucks and trailer at a residential property"
    >
      <div className="hs-immersive-page">
        <section className="hs-immersive-hero hs-home-hero">
          <div className="hs-immersive-copy">
            <p className="hs-site-kicker">Chittenden County, VT + Tampa, FL</p>
            <h1>Exterior care that makes the whole property feel new.</h1>
            <p>
              Roof-safe soft washing, hard-surface power washing, and careful exterior maintenance
              from Steven and Beth&apos;s HomeSHINE crew.
            </p>
            <div className="hs-immersive-actions">
              <Link href="/book" className="hs-button hs-button-primary">
                <CalendarDays size={20} />
                Get a Quote
              </Link>
              <a href="tel:+18023919977" className="hs-button hs-button-ghost">
                <PhoneCall size={20} />
                802-391-9977
              </a>
            </div>
            <div className="hs-trust-row" aria-label="HomeSHINE trust signals">
              <span><ShieldCheck size={17} /> Fully insured</span>
              <span><Leaf size={17} /> Pet and plant safe</span>
              <span><Clock size={17} /> Mon-Sat, 7:30am-7:30pm</span>
            </div>
          </div>

          <div className="hs-hero-showcase" aria-label="HomeSHINE work preview">
            <div className="hs-showcase-photo is-large">
              <Image
                src="/promos/trucks.jpeg"
                alt="HomeSHINE trucks and trailer staged at a residential property"
                fill
                sizes="(max-width: 900px) 100vw, 46vw"
                priority
              />
            </div>
            <div className="hs-showcase-card">
              <strong>Roof to curb</strong>
              <span>House washes, roof stains, gutters, concrete, stone, wood, and solar panels.</span>
            </div>
          </div>
        </section>

        <section className="hs-section-panel">
          <div className="hs-section-heading">
            <p className="hs-site-kicker">Start here</p>
            <h2>Pick the path. HomeSHINE handles the exterior.</h2>
          </div>
          <div className="hs-link-grid">
            {marketingNav.map(({ href, icon: Icon, label, summary }) => (
              <Link href={href} className="hs-link-card" key={href}>
                <Icon size={24} />
                <strong>{label}</strong>
                <span>{summary}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="hs-proof-band">
          {proofPoints.map(({ icon: Icon, label, detail }) => (
            <div key={label}>
              <Icon size={20} />
              <strong>{label}</strong>
              <span>{detail}</span>
            </div>
          ))}
          <div>
            <CheckCircle2 size={20} />
            <strong>Clear quote</strong>
            <span>Walkthrough first, written scope before the wash begins.</span>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
