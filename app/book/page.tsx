import type { Metadata } from "next";
import { CalendarDays, PhoneCall, ShieldCheck } from "lucide-react";
import { BookingPortal } from "@/components/booking/BookingPortal";
import { brand, contact, visitExpectations } from "@/components/marketing/content";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Book a Visit",
  description:
    "Schedule a free consultation or full home assessment with HomeSHINE exterior care services in Vermont.",
};

export default function BookPage() {
  return (
    <SiteShell current="Book">
      <section className="hs-subhero">
        <div className="hs-hero-veil" aria-hidden />
        <div className="hs-shell">
          <div className="hs-book-layout">
            <Reveal className="hs-book-aside">
              <div className="hs-subhero-copy">
                <p className="hs-eyebrow">Schedule</p>
                <h1 className="hs-h1">Book a Visit</h1>
                <p className="hs-lede">
                  Pick a consultation or a full home assessment. Steven confirms within 24 hours.
                  {" "}
                  {brand.offer}
                </p>
              </div>

              <ul className="hs-book-steps">
                {visitExpectations.map((item, index) => (
                  <li key={item}>
                    <b>{index + 1}</b>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="hs-hero-trust">
                <span className="hs-badge hs-badge-glass">
                  <ShieldCheck size={14} />
                  Fully insured
                </span>
                <span className="hs-badge hs-badge-glass">{contact.hours}</span>
              </div>

              <a href={contact.phoneHref} className="hs-btn hs-btn-glass">
                <PhoneCall size={18} />
                {contact.phone}
              </a>
            </Reveal>

            <Reveal delay={110}>
              <div className="hs-book-panel" aria-label="HomeSHINE booking portal">
                <div className="hs-book-panel-head">
                  <CalendarDays size={18} />
                  Request a time
                </div>
                <BookingPortal />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
