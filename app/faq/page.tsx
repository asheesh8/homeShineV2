import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Mail } from "lucide-react";
import { contact, faqs } from "@/components/marketing/content";
import { Accordion } from "@/components/site/Accordion";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";
import { SurfaceExplorer } from "@/components/site/widgets/SurfaceExplorer";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about HomeSHINE soft washing, pressure washing, roof safety, plant protection, and pricing.",
};

export default function FAQPage() {
  return (
    <SiteShell current="FAQ">
      <section className="hs-subhero">
        <div className="hs-hero-veil" aria-hidden />
        <div className="hs-shell">
          <div className="hs-subhero-grid">
            <Reveal className="hs-subhero-copy">
              <p className="hs-eyebrow">FAQ</p>
              <h1 className="hs-h1">Clear answers before the crew pulls in.</h1>
              <p className="hs-lede">
                The short version: HomeSHINE uses the right cleaning method for the surface,
                protects the property around the work, and keeps the process simple.
              </p>
              <div className="hs-hero-actions">
                <a href={contact.emailHref} className="hs-btn hs-btn-primary">
                  <Mail size={19} />
                  Ask Steven directly
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <figure className="hs-subhero-photo">
                <Image
                  src="/promos/trucks.jpeg"
                  alt="HomeSHINE branded trucks and trailer ready for exterior cleaning work"
                  fill
                  sizes="(max-width: 1080px) 100vw, 44vw"
                  priority
                />
                <figcaption>Real crew, real equipment</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="hs-band hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">Homeowner questions</p>
              <h2 className="hs-h2">What matters before booking.</h2>
            </div>
            <p className="hs-lede">
              Got a weird surface, slope, stain, or access problem? Send a photo and Steven will
              tell you straight whether it is worth doing.
            </p>
          </Reveal>

          <Reveal>
            <Accordion items={faqs} />
          </Reveal>
        </div>
      </section>

      <section className="hs-band hs-band-mist">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-center">
            <p className="hs-eyebrow">The big one</p>
            <h2 className="hs-h2">Soft wash or pressure wash?</h2>
            <p className="hs-lede">
              It depends entirely on the surface. Pick one and see the actual pressure, the reason,
              and what goes wrong when it is done the other way.
            </p>
          </Reveal>

          <Reveal>
            <SurfaceExplorer />
          </Reveal>
        </div>
      </section>

      <section className="hs-band-tight hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-cta">
            <div className="hs-dots" aria-hidden style={{ color: "#7dd3fc" }} />
            <div className="hs-cta-copy">
              <p className="hs-eyebrow">Still checking?</p>
              <h2 className="hs-h2">
                Send the weird surface, stain, slope, or access question before booking.
              </h2>
              <p className="hs-lede">
                No obligation, no pressure. If it is not worth doing, Steven will say so.
              </p>
            </div>
            <div className="hs-cta-actions">
              <a href={contact.emailHref} className="hs-btn hs-btn-primary">
                <Mail size={19} />
                Email HomeSHINE
              </a>
              <Link href="/book" className="hs-btn hs-btn-glass">
                <CalendarDays size={19} />
                Book a Visit
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
