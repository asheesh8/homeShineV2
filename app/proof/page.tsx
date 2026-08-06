import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CheckCircle2, PhoneCall } from "lucide-react";
import { contact, proofPoints, shineMarquee } from "@/components/marketing/content";
import { Marquee } from "@/components/site/Marquee";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { BeforeAfter } from "@/components/site/widgets/BeforeAfter";
import { CertificatePreview } from "@/components/site/widgets/CertificatePreview";

export const metadata: Metadata = {
  title: "Proof",
  description: "Real HomeSHINE jobsite media and the process behind every exterior cleaning visit.",
};

const stages = [
  {
    label: "Before",
    detail: "Surface condition documented before the work starts, so nothing is guessed at later.",
  },
  {
    label: "During",
    detail: "Plants, fixtures, and sensitive areas protected through the wash, start to finish.",
  },
  {
    label: "After",
    detail: "Finish checked, photographed, and explained before the crew wraps up and leaves.",
  },
];

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

      <section className="hs-band-tight hs-band-mist">
        <Marquee items={shineMarquee} label="HomeSHINE exterior cleaning services" />
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

          <div className="hs-grid" style={{ ["--cols" as string]: 2 }}>
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
            <Reveal delay={180}>
              <SpotlightCard style={{ height: "100%" }}>
                <span className="hs-card-icon">
                  <CheckCircle2 size={21} />
                </span>
                <h3 className="hs-h3">Clear finish</h3>
                <p className="hs-body">
                  Steven documents what changed and what should be watched next season, so you know
                  where the property stands.
                </p>
              </SpotlightCard>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="hs-band hs-band-ink">
        <div className="hs-dots" aria-hidden style={{ color: "#7dd3fc" }} />
        <div className="hs-shell" style={{ position: "relative" }}>
          <Reveal className="hs-head">
            <p className="hs-eyebrow">Documented</p>
            <h2 className="hs-h2">Three points on every job.</h2>
          </Reveal>

          <Reveal className="hs-steps" style={{ ["--cols" as string]: 3 }}>
            {stages.map((stage, index) => (
              <div className="hs-step" key={stage.label}>
                <p className="hs-step-num">0{index + 1}</p>
                <h3 className="hs-h3">{stage.label}</h3>
                <p className="hs-body">{stage.detail}</p>
              </div>
            ))}
          </Reveal>
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

      <section className="hs-band-tight hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-cta">
            <div className="hs-dots" aria-hidden style={{ color: "#7dd3fc" }} />
            <div className="hs-cta-copy">
              <p className="hs-eyebrow">See it on your own house</p>
              <h2 className="hs-h2">Book the walkthrough. Get the written scope.</h2>
              <p className="hs-lede">
                Free onsite assessment of your roof, gutters, windows, siding, and more.
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
