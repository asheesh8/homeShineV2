import Link from "next/link";
import { CalendarDays, PhoneCall } from "lucide-react";
import { contact } from "@/components/marketing/content";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

type SiteShellProps = {
  children: React.ReactNode;
  current?: string;
  light?: boolean;
};

export function SiteShell({ children, current, light }: SiteShellProps) {
  return (
    <div className="hs-site">
      <SiteHeader current={current} light={light} />
      <main>{children}</main>
      <SiteFooter />

      {/* Phone-only action bar — the two things a homeowner actually wants. */}
      <div className="hs-dock">
        <a href={contact.phoneHref} className="hs-btn hs-btn-glass">
          <PhoneCall size={17} />
          Call
        </a>
        <Link href="/book" className="hs-btn hs-btn-primary">
          <CalendarDays size={17} />
          Book a Visit
        </Link>
      </div>
    </div>
  );
}
