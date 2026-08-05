import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingPhoto } from "@/components/marketing/MarketingPhoto";
import { contactMethods, towns } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact HomeSHINE for exterior cleaning in Chittenden County, Vermont and Tampa, Florida.",
};

export default function ContactPage() {
  return (
    <MarketingShell
      current="Contact"
      backgroundSrc="/homeshine-truck.png"
      backgroundAlt="HomeSHINE truck and trailer in a residential driveway"
    >
      <section className="hs-screen-layout">
        <div className="hs-screen-copy">
          <p className="hs-site-kicker">Start here</p>
          <h1>Get the right plan for your exterior.</h1>
          <p>
            Send a booking request, call Steven, or email the team. HomeSHINE will walk the property,
            document the surfaces, and recommend the cleanest path forward.
          </p>
          <MarketingPhoto
            src="/homeshine-truck.png"
            alt="HomeSHINE truck and trailer at a home"
            label="Local exterior cleaning crew"
          />
        </div>

        <div className="hs-contact-compact">
          <div className="hs-contact-methods">
            {contactMethods.map(({ href, icon: Icon, label, detail }) => {
              const body = (
                <>
                  <Icon size={21} />
                  <span>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </span>
                </>
              );

              return href ? (
                <a href={href} className="hs-contact-method" key={label}>
                  {body}
                </a>
              ) : (
                <div className="hs-contact-method" key={label}>
                  {body}
                </div>
              );
            })}
          </div>

          <div className="hs-town-panel">
            <h2>Primary Vermont towns</h2>
            <div className="hs-town-list" aria-label="Vermont service towns">
              {towns.map((town) => (
                <span key={town}>{town}</span>
              ))}
            </div>
            <p>Tampa, FL service is also available.</p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
