"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Menu, PhoneCall, X } from "lucide-react";
import { HomeShineLogo } from "@/components/homeshine-logo";
import { contact, marketingNav } from "@/components/marketing/content";

type SiteHeaderProps = {
  current?: string;
  /** Set on pages that open on a light surface instead of a dark hero. */
  light?: boolean;
};

export function SiteHeader({ current, light = false }: SiteHeaderProps) {
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const brand = (
    <Link href="/" className="hs-brandmark" aria-label="HomeSHINE home">
      <HomeShineLogo size={42} />
      <span>
        <strong>HomeSHINE</strong>
        <small>We Make Your Home Shine!</small>
      </span>
    </Link>
  );

  return (
    <>
      <header
        className={`hs-header${stuck ? " is-stuck" : ""}${light ? " is-light" : ""}`}
      >
        <div className="hs-shell hs-header-inner">
          {brand}

          <nav className="hs-nav" aria-label="Primary">
            {marketingNav.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={current === item.label ? "is-current" : ""}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hs-header-cta">
            <a className="hs-header-phone" href={contact.phoneHref}>
              <PhoneCall size={16} />
              {contact.phone}
            </a>
            <Link href="/book" className="hs-btn hs-btn-primary hs-btn-sm">
              <CalendarDays size={17} />
              Book a Visit
            </Link>
            <button
              type="button"
              className="hs-burger"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="hs-mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="hs-shell hs-mobile-menu-top">
            {brand}
            <button
              type="button"
              className="hs-burger"
              style={{ display: "grid" }}
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <X size={21} />
            </button>
          </div>

          <div className="hs-shell hs-mobile-menu-body">
            {marketingNav.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={current === item.label ? "is-current" : ""}
                onClick={closeMenu}
              >
                <item.icon size={20} />
                <div>
                  {item.label}
                  <span>{item.summary}</span>
                </div>
              </Link>
            ))}

            <Link href="/book" className="hs-btn hs-btn-primary" onClick={closeMenu}>
              <CalendarDays size={18} />
              Book a Visit
            </Link>

            <div className="hs-mobile-menu-foot">
              <a href={contact.phoneHref}>{contact.phone}</a>
              <a href={contact.emailHref}>{contact.email}</a>
              <span>{contact.hours}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
