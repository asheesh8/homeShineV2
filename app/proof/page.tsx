import type { Metadata } from "next";
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
      <section className="hs-screen-layout hs-proof-layout">
        <div className="hs-screen-copy">
          <p className="hs-site-kicker">Real field proof</p>
          <h1>Personal, meticulous, and easy to start.</h1>
          <p>
            Steve and Beth met on a cleaning job and built HomeSHINE around that same personal
            connection: clear communication, careful prep, and a thorough result.
          </p>
          <div className="hs-proof-compact-list">
            {proofPoints.map(({ icon: Icon, label, detail }) => (
              <div key={label}>
                <Icon size={18} />
                <span>
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </span>
              </div>
            ))}
          </div>
        </div>

        <TransformationSlider />
      </section>
    </MarketingShell>
  );
}
