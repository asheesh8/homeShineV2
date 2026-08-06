import type { Metadata } from "next";
import Image from "next/image";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { services } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Services",
  description: "HomeSHINE exterior cleaning services for roofs, siding, gutters, hardscape, and solar panels.",
};

export default function ServicesPage() {
  return (
    <MarketingShell
      current="Services"
      backgroundSrc="/promos/steven-cleaning.jpeg"
      backgroundAlt="HomeSHINE technician treating a residential roof"
    >
      <div className="hs-immersive-page">
        <section className="hs-immersive-hero">
          <div className="hs-immersive-copy">
            <p className="hs-site-kicker">Services</p>
            <h1>Exterior care from roofline to hardscape.</h1>
            <p>
              Soft washing and power washing are different tools. HomeSHINE matches the method to the
              material so delicate surfaces get chemistry and durable surfaces get force.
            </p>
          </div>
          <div className="hs-immersive-photo">
            <Image
              src="/promos/steven-cleaning.jpeg"
              alt="HomeSHINE technician treating roof stains on a Vermont home"
              fill
              sizes="(max-width: 900px) 100vw, 46vw"
              priority
            />
            <span>Roof-safe treatment on site</span>
          </div>
        </section>

        <section className="hs-section-panel">
          <div className="hs-section-heading">
            <p className="hs-site-kicker">What we clean</p>
            <h2>The right wash for each surface.</h2>
          </div>
          <div className="hs-feature-grid">
            {services.map(({ icon: Icon, name, detail }) => (
              <article className="hs-feature-card" key={name}>
                <Icon size={24} />
                <h2>{name}</h2>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hs-split-band">
          <div>
            <p className="hs-site-kicker">Method matters</p>
            <h2>Soft where the home needs care. Force where the surface can take it.</h2>
          </div>
          <p>
            Roofs, siding, trim, and wood get controlled chemistry and low pressure. Concrete,
            stone, brick, and hardscape get the deeper cut they need without treating every surface
            the same.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
