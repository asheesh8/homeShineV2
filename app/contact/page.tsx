import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { contact, contactMethods, visitExpectations } from "@/components/marketing/content";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";
import { ServiceAreaMap } from "@/components/site/widgets/ServiceAreaMap";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact HomeSHINE for exterior cleaning in Chittenden County, Vermont and Tampa Bay, Florida.",
};

export default function ContactPage() {
  return (
    <SiteShell current="Contact">
      <section className="hs-subhero">
        <div className="hs-hero-veil" aria-hidden />
        <div className="hs-shell">
          <div className="hs-subhero-grid">
            <Reveal className="hs-subhero-copy">
              <p className="hs-eyebrow">Start here</p>
              <h1 className="hs-h1">Get the right plan for your exterior.</h1>
              <p className="hs-lede">
                Send a booking request, call Steven, or email the team. HomeSHINE will walk the
                property, document the surfaces, and recommend the cleanest path forward.
              </p>
              <div className="hs-hero-actions">
                <Link href="/book" className="hs-btn hs-btn-primary">
                  <CalendarDays size={19} />
                  Free onsite assessment
                </Link>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <figure className="hs-subhero-photo">
                <Image
                  src="/homeshine-truck.png"
                  alt="HomeSHINE truck and trailer at a residential property"
                  fill
                  sizes="(max-width: 1080px) 100vw, 44vw"
                  priority
                />
                <figcaption>Local exterior cleaning crew</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="hs-band hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">Contact</p>
              <h2 className="hs-h2">Pick the fastest way in.</h2>
            </div>
            <p className="hs-lede">
              Photos help more than anything. Send a couple of shots of the problem area and you
              will get a straight answer back.
            </p>
          </Reveal>

          <div className="hs-contact-grid">
            {contactMethods.map(({ href, icon: Icon, label, detail }, index) => {
              const body = (
                <>
                  <span className="hs-card-icon">
                    <Icon size={20} />
                  </span>
                  <span>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </span>
                </>
              );

              return (
                <Reveal key={label} delay={index * 60}>
                  {href ? (
                    <a href={href} className="hs-contact-tile">
                      {body}
                    </a>
                  ) : (
                    <div className="hs-contact-tile">{body}</div>
                  )}
                </Reveal>
              );
            })}
          </div>

          <Reveal className="hs-steps" style={{ ["--cols" as string]: 3, marginTop: 48 }}>
            {visitExpectations.map((item, index) => (
              <div className="hs-step" key={item}>
                <p className="hs-step-num">0{index + 1}</p>
                <h3 className="hs-h3">{item}</h3>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="hs-band hs-band-ink">
        <div className="hs-dots" aria-hidden style={{ color: "#7dd3fc" }} />
        <div className="hs-shell" style={{ position: "relative" }}>
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">Service area</p>
              <h2 className="hs-h2">Do we come to you?</h2>
            </div>
            <p className="hs-lede">
              Based at {contact.address}. Tap any town to see how it gets scheduled, and ask anyway
              if you are just outside the map.
            </p>
          </Reveal>

          <Reveal>
            <ServiceAreaMap />
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
