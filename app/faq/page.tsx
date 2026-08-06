import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { contact, faqs } from "@/components/marketing/content";
import { Accordion } from "@/components/site/Accordion";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about HomeSHINE soft washing, pressure washing, roof safety, plant protection, and pricing.",
};

export default function FAQPage() {
  return (
    <SiteShell current="FAQ">
      <section className="hs-subhero hs-subhero-solo">
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

    </SiteShell>
  );
}
