import type { Metadata } from "next";
import { CalendarDays, PhoneCall } from "lucide-react";
import { BookingPortal } from "@/components/booking/BookingPortal";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingPhoto } from "@/components/marketing/MarketingPhoto";

export const metadata: Metadata = {
  title: "Book a Visit",
  description: "Schedule a free consultation or full home assessment with HomeSHINE exterior care services in Vermont.",
};

export default function BookPage() {
  return (
    <MarketingShell
      current="Book"
      backgroundSrc="/promos/trucks.jpeg"
      backgroundAlt="HomeSHINE branded trucks and trailer at a neighborhood jobsite"
    >
      <section className="hs-book-screen">
        <div className="hs-book-copy">
          <p className="hs-site-kicker">Schedule</p>
          <h1>Book a Visit</h1>
          <p>
            Pick a consultation or full home assessment. Steven will confirm within 24 hours.
          </p>
          <MarketingPhoto
            src="/promos/trucks.jpeg"
            alt="HomeSHINE trucks and trailer ready for a residential exterior cleaning visit"
            label="Ready for the next property"
          />
          <a href="tel:+18023919977">
            <PhoneCall size={18} />
            802-391-9977
          </a>
        </div>

        <div className="hs-book-panel" aria-label="HomeSHINE booking portal">
          <div className="hs-book-panel-title">
            <CalendarDays size={18} />
            Request a time
          </div>
          <BookingPortal />
        </div>
      </section>
    </MarketingShell>
  );
}
