import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Home as HomeIcon } from "lucide-react";
import { HomeShineLogo } from "@/components/homeshine-logo";
import { marketingNav } from "@/components/marketing/content";

type MarketingShellProps = {
  backgroundAlt?: string;
  backgroundSrc?: string;
  children: React.ReactNode;
  current?: string;
  dark?: boolean;
};

export function MarketingShell({
  backgroundAlt = "",
  backgroundSrc,
  children,
  current,
  dark = false,
}: MarketingShellProps) {
  const shellClassName = [
    "hs-site",
    "hs-page-shell",
    backgroundSrc ? "has-bg" : "",
    dark ? "is-dark" : "",
  ].filter(Boolean).join(" ");

  return (
    <main className={shellClassName} style={{ position: "relative" }}>
      {backgroundSrc && (
        <>
          <Image
            src={backgroundSrc}
            alt={backgroundAlt}
            fill
            sizes="100vw"
            priority
            className="hs-page-bg"
          />
          <div className="hs-page-shade" aria-hidden />
        </>
      )}

      <header className="hs-page-nav">
        <Link href="/" className="hs-site-brand" aria-label="HomeSHINE home">
          <HomeShineLogo size={50} />
          <span>
            <strong>HomeSHINE</strong>
            <small>We Make Your Home Shine!</small>
          </span>
        </Link>

        <nav className="hs-site-links" aria-label="Primary navigation">
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

        <Link href="/book" className={`hs-nav-cta ${current === "Book" ? "is-current" : ""}`}>
          <CalendarDays size={18} />
          Book
        </Link>
      </header>

      <div className="hs-page-stage">{children}</div>

      <nav className="hs-mobile-dock" aria-label="Mobile navigation">
        <Link href="/" className={!current || current === "Home" ? "is-current" : ""} aria-label="Home">
          <HomeIcon size={17} />
          <span>Home</span>
        </Link>
        {marketingNav.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className={current === item.label ? "is-current" : ""}
            aria-label={item.label}
            title={item.label}
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
