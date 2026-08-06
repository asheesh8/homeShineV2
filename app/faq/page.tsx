import type { Metadata } from "next";
import Image from "next/image";
import { MarketingShell } from "@/components/marketing/MarketingShell";
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
      <div className="hs-immersive-page">
        <section className="hs-immersive-hero">
          <div className="hs-immersive-copy">
            <p className="hs-site-kicker">FAQ</p>
            <h1>Clear answers before the crew pulls in.</h1>
            <p>
              The short version: HomeSHINE uses the right cleaning method for the surface, protects
              the property around the work, and keeps the process simple.
            </p>
          </div>
          <div className="hs-immersive-photo">
            <Image
              src="/promos/trucks.jpeg"
              alt="HomeSHINE branded trucks and trailer ready for exterior cleaning work"
              fill
              sizes="(max-width: 900px) 100vw, 46vw"
              priority
            />
            <span>Real crew, real equipment</span>
          </div>
        </section>

        <section className="hs-section-panel">
          <div className="hs-section-heading">
            <p className="hs-site-kicker">Homeowner questions</p>
            <h2>What matters before booking.</h2>
          </div>
          <div className="hs-faq-grid">
            {faqs.map((item) => (
              <article className="hs-faq-card" key={item.question}>
                <h2>{item.question}</h2>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
