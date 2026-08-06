import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CheckCircle2, PhoneCall } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { proofPoints } from "@/components/marketing/content";
import { TransformationSlider } from "@/components/marketing/TransformationSlider";

export const metadata: Metadata = {
  title: "Proof",
  description: "Real HomeSHINE jobsite media and process proof.",
};

export default function ProofPage() {
  return (
    <MarketingShell
      current="Proof"
      backgroundSrc="/promos/steven-cleaning.jpeg"
      backgroundAlt="HomeSHINE technician cleaning a residential roof"
    >
      <div className="hs-immersive-page">
        <section className="hs-immersive-hero hs-proof-hero">
          <div className="hs-immersive-copy">
            <p className="hs-site-kicker">Real field proof</p>
            <h1>Clean work you can actually see.</h1>
            <p>
              Steve and Beth built HomeSHINE around careful prep, honest walkthroughs, and
              visible results on real homes.
            </p>
            <div className="hs-immersive-actions">
              <Link href="/book" className="hs-button hs-button-primary">
                <CalendarDays size={20} />
                Request Proof-Backed Quote
              </Link>
              <a href="tel:+18023919977" className="hs-button hs-button-ghost">
                <PhoneCall size={20} />
                Call Steven
              </a>
            </div>
          </div>

          <TransformationSlider />
        </section>

        <section className="hs-section-panel hs-proof-panel">
          <div className="hs-section-heading">
            <p className="hs-site-kicker">The job standard</p>
            <h2>Every visit is prepared before the first rinse.</h2>
          </div>
          <div className="hs-feature-grid">
            {proofPoints.map(({ icon: Icon, label, detail }) => (
              <article className="hs-feature-card" key={label}>
                <Icon size={24} />
                <h2>{label}</h2>
                <p>{detail}</p>
              </article>
            ))}
            <article className="hs-feature-card">
              <CheckCircle2 size={24} />
              <h2>Clear finish</h2>
              <p>Steven documents what changed and what should be watched next season.</p>
            </article>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
