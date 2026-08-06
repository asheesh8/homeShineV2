import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, PhoneCall } from "lucide-react";
import { contact, proofPoints } from "@/components/marketing/content";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { BeforeAfter } from "@/components/site/widgets/BeforeAfter";
import { CertificatePreview } from "@/components/site/widgets/CertificatePreview";

export const metadata: Metadata = {
  title: "Proof",
  description: "Real HomeSHINE jobsite media and the process behind every exterior cleaning visit.",
};

export default function ProofPage() {
  return (
    <SiteShell current="Proof">
      <section className="hs-subhero">
        <div className="hs-hero-veil" aria-hidden />
        <div className="hs-shell">
          <div className="hs-subhero-grid">
            <Reveal className="hs-subhero-copy">
              <p className="hs-eyebrow">Real field proof</p>
              <h1 className="hs-h1">Clean work you can actually see.</h1>
              <p className="hs-lede">
                Steven and Beth built HomeSHINE around careful prep, honest walkthroughs, and
                visible results on real homes. Drag the handle to compare.
              </p>
              <div className="hs-hero-actions">
                <Link href="/book" className="hs-btn hs-btn-primary">
                  <CalendarDays size={19} />
                  Request a quote
                </Link>
                <a href={contact.phoneHref} className="hs-btn hs-btn-glass">
                  <PhoneCall size={19} />
                  Call Steven
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <BeforeAfter />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="hs-band hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">The job standard</p>
              <h2 className="hs-h2">Every visit is prepared before the first rinse.</h2>
            </div>
            <p className="hs-lede">
              Prep is most of the job. What happens before the sprayer comes out is what keeps a
              wash from turning into a repair.
            </p>
          </Reveal>

          <div className="hs-grid" style={{ ["--cols" as string]: 3 }}>
            {proofPoints.map((point, index) => (
              <Reveal key={point.label} delay={index * 60}>
                <SpotlightCard style={{ height: "100%" }}>
                  <span className="hs-card-icon">
                    <point.icon size={21} />
                  </span>
                  <h3 className="hs-h3">{point.label}</h3>
                  <p className="hs-body">{point.detail}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="hs-band hs-band-mist">
        <div className="hs-shell">
          <Reveal className="hs-cert-layout">
            <div className="hs-head" style={{ marginBottom: 0 }}>
              <p className="hs-eyebrow">After HomeSHINE care</p>
              <h2 className="hs-h2">This is the certificate your home gets after cleaning.</h2>
              <p className="hs-lede">
                When Steven finishes a qualifying exterior care visit, the homeowner can receive a
                HomeSHINE Exterior Care Certificate showing the property was inspected, treated,
                and cared for by the crew.
              </p>
              <div className="hs-grid" style={{ ["--cols" as string]: 1, gap: 10 }}>
                <SpotlightCard>
                  <h3 className="hs-h3">Matched to the real admin template</h3>
                  <p className="hs-body">
                    The sample mirrors the certificate Steven generates from the admin side after
                    service: homeowner name, property address, services performed, plan, date, and
                    HomeSHINE signature.
                  </p>
                </SpotlightCard>
              </div>
            </div>

            <CertificatePreview />
          </Reveal>
        </div>
      </section>

    </SiteShell>
  );
}
