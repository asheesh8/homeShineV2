import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingPhoto } from "@/components/marketing/MarketingPhoto";
import { faqs } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about HomeSHINE soft washing, pressure washing, safety, and plant protection.",
};

export default function FAQPage() {
  return (
    <MarketingShell
      current="FAQ"
      backgroundSrc="/promos/trucks.jpeg"
      backgroundAlt="HomeSHINE branded trucks and trailer at a neighborhood jobsite"
    >
      <section className="hs-screen-layout">
        <div className="hs-screen-copy">
          <p className="hs-site-kicker">FAQ</p>
          <h1>What homeowners usually ask first.</h1>
          <p>
            The short version: HomeSHINE uses the right cleaning method for the surface, protects
            the property around the work, and keeps the process simple.
          </p>
          <MarketingPhoto
            src="/promos/trucks.jpeg"
            alt="HomeSHINE branded trucks and trailer ready for exterior cleaning work"
            label="Real crew, real equipment"
          />
        </div>

        <div className="hs-faq-compact-grid">
          {faqs.map((item) => (
            <article className="hs-compact-card hs-faq-compact" key={item.question}>
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
