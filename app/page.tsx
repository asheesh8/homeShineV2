import Link from "next/link";
import { CalendarDays, Clock, Leaf, PhoneCall, ShieldCheck } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { marketingNav } from "@/components/marketing/content";

export default function HomePage() {
  return (
    <MarketingShell
      dark
      current="Home"
      backgroundSrc="/homeshine-truck.png"
      backgroundAlt="HomeSHINE branded trucks and trailer at a residential property"
    >
      <section className="hs-home-screen">
        <div className="hs-home-copy">
          <p className="hs-site-kicker">Chittenden County, VT + Tampa, FL</p>
          <h1>HomeSHINE</h1>
          <p>
            Exterior soft washing and power washing with roof-safe chemistry, hard-surface force,
            and a clean plan from first call to final rinse.
          </p>
          <div className="hs-home-actions">
            <Link href="/book" className="hs-button hs-button-primary">
              <CalendarDays size={20} />
              Get a Quote
            </Link>
            <a href="tel:+18023919977" className="hs-button hs-button-ghost">
              <PhoneCall size={20} />
              802-391-9977
            </a>
          </div>
          <div className="hs-home-proof" aria-label="HomeSHINE trust signals">
            <span>
              <ShieldCheck size={17} />
              Fully insured
            </span>
            <span>
              <Leaf size={17} />
              Pet and plant safe
            </span>
            <span>
              <Clock size={17} />
              Mon-Sat, 7:30am-7:30pm
            </span>
          </div>
        </div>

        <div className="hs-home-menu" aria-label="HomeSHINE pages">
          {marketingNav.map(({ href, icon: Icon, label, summary }) => (
            <Link href={href} className="hs-home-menu-card" key={href}>
              <Icon size={23} />
              <span>
                <strong>{label}</strong>
                <small>{summary}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
