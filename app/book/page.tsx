import type { Metadata } from "next";
import { BookingPortal } from "@/components/booking/BookingPortal";

export const metadata: Metadata = {
  title: "Book a Visit — HomeSHINE",
  description: "Schedule a free consultation or full home assessment with HomeSHINE exterior care services in Vermont.",
};

export default function BookPage() {
  return (
    <main className="bp-page">
      {/* Header */}
      <header className="bp-header">
        <div className="bp-header-inner">
          <div className="bp-brand">
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="31" fill="#182638" stroke="#2f7d50" strokeWidth="2"/>
              <path d="M20 50 L20 30 L32 20 L44 30 L44 50" stroke="#2f7d50" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
              <rect x="26" y="36" width="12" height="14" rx="1" fill="#2f7d50" opacity="0.6"/>
              <path d="M14 28 L32 14 L50 28" stroke="#2f7d50" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <strong>HomeSHINE</strong>
              <small>Vermont Exterior Care</small>
            </div>
          </div>
          <div className="bp-header-contact">
            <a href="tel:+18025550100">(802) 555-0100</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bp-hero">
        <h1>Schedule a Visit</h1>
        <p>Free consultations &amp; full home assessments across Vermont.<br/>Pick a time that works for you — Steven will confirm within 24 hours.</p>
      </div>

      {/* Portal */}
      <div className="bp-portal-wrap">
        <BookingPortal />
      </div>

      {/* Footer */}
      <footer className="bp-footer">
        <p>HomeSHINE · Vermont Exterior Care · <a href="mailto:homeshine.vt@gmail.com">homeshine.vt@gmail.com</a> · <a href="tel:+18025550100">(802) 555-0100</a></p>
      </footer>
    </main>
  );
}
