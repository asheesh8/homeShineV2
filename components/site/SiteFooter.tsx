import Link from "next/link";
import { HomeShineLogo } from "@/components/homeshine-logo";
import { contact, marketingNav, serviceRegions, services } from "@/components/marketing/content";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const vt = serviceRegions[0];

  return (
    <footer className="hs-footer">
      <div className="hs-shell">
        <div className="hs-footer-grid">
          <div className="hs-footer-brand">
            <Link href="/" className="hs-brandmark" aria-label="HomeSHINE home">
              <HomeShineLogo size={46} />
              <span>
                <strong>HomeSHINE</strong>
                <small>We Make Your Home Shine!</small>
              </span>
            </Link>
            <p>
              Roof-safe soft washing, hard-surface power washing, and careful exterior maintenance
              for homes in Chittenden County, Vermont and Tampa Bay, Florida.
            </p>
            <p style={{ color: "rgba(226,238,250,.45)", fontSize: "0.84rem" }}>
              Fully insured &middot; Certified in work safety &middot; Pet and plant safe solutions
            </p>
          </div>

          <div className="hs-footer-col">
            <h4>Pages</h4>
            <Link href="/">Home</Link>
            {marketingNav.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/book">Book a Visit</Link>
          </div>

          <div className="hs-footer-col">
            <h4>Services</h4>
            {services.slice(0, 6).map((service) => (
              <Link href="/services" key={service.name}>
                {service.name}
              </Link>
            ))}
          </div>

          <div className="hs-footer-col">
            <h4>Reach Steven</h4>
            <a href={contact.phoneHref}>{contact.phone}</a>
            <a href={contact.emailHref}>{contact.email}</a>
            <span>{contact.address}</span>
            <span>{contact.hours}</span>
          </div>
        </div>

        <div className="hs-footer-base">
          <span>&copy; {year} HomeSHINE. All rights reserved.</span>
          <span>
            Serving {vt.towns.slice(0, 5).map((t) => t.name).join(", ")} and nearby towns.
          </span>
        </div>
      </div>
    </footer>
  );
}
