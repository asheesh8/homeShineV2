import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingPhoto } from "@/components/marketing/MarketingPhoto";
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
      <section className="hs-screen-layout">
        <div className="hs-screen-copy">
          <p className="hs-site-kicker">Services</p>
          <h1>Exterior care from roofline to hardscape.</h1>
          <p>
            Soft washing and power washing are different tools. HomeSHINE matches the method to the
            material so delicate surfaces get chemistry and durable surfaces get force.
          </p>
          <MarketingPhoto
            src="/promos/steven-cleaning.jpeg"
            alt="HomeSHINE technician treating roof stains on a Vermont home"
            label="Roof-safe treatment on site"
          />
        </div>

        <div className="hs-compact-grid hs-services-compact">
          {services.map(({ icon: Icon, name, detail }) => (
            <article className="hs-compact-card" key={name}>
              <div className="hs-compact-icon">
                <Icon size={22} />
              </div>
              <h2>{name}</h2>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
