import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, PhoneCall } from "lucide-react";
import { brand, contact, services } from "@/components/marketing/content";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { SurfaceExplorer } from "@/components/site/widgets/SurfaceExplorer";

export const metadata: Metadata = {
  title: "Services",
  description:
    "HomeSHINE exterior cleaning services for roofs, siding, gutters, hardscape, windows, and solar panels in Vermont and Tampa Bay.",
};

export default function ServicesPage() {
  return (
    <SiteShell current="Services">
      <section className="hs-subhero">
        <div className="hs-hero-veil" aria-hidden />
        <div className="hs-shell">
          <div className="hs-subhero-grid">
            <Reveal className="hs-subhero-copy">
              <p className="hs-eyebrow">Services</p>
              <h1 className="hs-h1">Exterior care from roofline to hardscape.</h1>
              <p className="hs-lede">
                Soft washing and power washing are different tools. HomeSHINE matches the method to
                the material, so delicate surfaces get chemistry and durable surfaces get force.
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
            </Reveal>

            <Reveal delay={120}>
              <figure className="hs-subhero-photo">
                <Image
                  src="/promos/steven-cleaning.jpeg"
                  alt="HomeSHINE technician treating roof stains on a Vermont home"
                  fill
                  sizes="(max-width: 1080px) 100vw, 44vw"
                  priority
                />
                <figcaption>Roof-safe treatment on site</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="hs-band hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">What we clean</p>
              <h2 className="hs-h2">Nine services, one visit.</h2>
            </div>
            <p className="hs-lede">{brand.offer}</p>
          </Reveal>

          <div className="hs-grid" style={{ ["--cols" as string]: 3 }}>
            {services.map((service, index) => (
              <Reveal key={service.name} delay={index * 45}>
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
        </div>
      </section>

      <section className="hs-band hs-band-mist">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-center">
            <p className="hs-eyebrow">Method matters</p>
            <h2 className="hs-h2">Pick a surface. See exactly how it gets cleaned.</h2>
            <p className="hs-lede">
              This is the call that decides whether an exterior gets restored or damaged.
            </p>
          </Reveal>

          <Reveal>
            <SurfaceExplorer />
          </Reveal>
        </div>
      </section>

    </SiteShell>
  );
}
