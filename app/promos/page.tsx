import Link from "next/link";
import { CheckCircle2, Home, Phone, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HomeShineLogo } from "@/components/homeshine-logo";

export const metadata: Metadata = {
  title: "Current Offers | HomeSHINE",
  description: "Current HomeSHINE exterior care offers",
};

const shineNow = [
  "Gutters cleared and brightened",
  "Siding, soffit, and fascia soft wash",
  "Exterior windows, sills, tracks, and channels",
  "Screens removed, cleaned, and reinstalled",
  "Walkways, hard surfaces, deck, and patio cleaning",
];

const protection = [
  "Everything in SHINE NOW",
  "Roof treatment and renewal planning",
  "Month 12 maintenance visit",
  "Month 18 tune-up plus renewal options",
  "Bonus floating pollen-removal visit",
  "Priority scheduling and $250 specialty credit",
];

function Feature({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", color: dark ? "white" : "var(--navy)", fontSize: 14, lineHeight: 1.42 }}>
      <CheckCircle2 size={16} color={dark ? "#a7f3d0" : "var(--green)"} style={{ marginTop: 2, flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}

export default function PromosPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 56 }}>
      <div style={{ background: "linear-gradient(180deg, var(--navy) 0%, var(--navy-2) 100%)", color: "white", padding: "18px 20px", boxShadow: "0 10px 25px rgba(27, 45, 69, 0.16)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, maxWidth: 980, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <HomeShineLogo size={58} />
            <div>
              <div className="serif" style={{ fontSize: 24, fontWeight: 700 }}>
                Home<span style={{ color: "#7dd3fc" }}>SHINE</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#cbd5e1", marginTop: 4 }}>
                <Sparkles size={13} />
                Current offers
              </div>
            </div>
          </div>
          <Link href="/" style={{ border: "1px solid rgba(255,255,255,.35)", borderRadius: 14, background: "rgba(255,255,255,.08)", color: "white", padding: "10px 16px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Field App
          </Link>
        </div>
      </div>

      <div style={{ padding: "24px 18px", maxWidth: 980, margin: "0 auto" }}>
        <section style={{ background: "linear-gradient(135deg, #1b2d45 0%, #1e5c3a 100%)", borderRadius: 30, padding: "34px 28px", marginBottom: 18, color: "white", boxShadow: "0 20px 44px rgba(27,45,69,.26)", overflow: "hidden", position: "relative" }}>
          <div aria-hidden style={{ position: "absolute", right: -70, top: -70, width: 220, height: 220, borderRadius: "50%", background: "rgba(125,211,252,.09)" }} />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, background: "rgba(125,211,252,.14)", color: "#7dd3fc", padding: "7px 12px", fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 14 }}>
            <Home size={14} />
            Roof-to-curb exterior care
          </div>
          <h1 className="serif" style={{ margin: 0, fontSize: 42, lineHeight: 1.05, maxWidth: 700 }}>
            Make the home shine now. Keep it protected for the next 18 months.
          </h1>
          <p style={{ color: "#d8e3ee", fontSize: 18, lineHeight: 1.58, maxWidth: 740, margin: "16px 0 0" }}>
            HomeSHINE looks at the full exterior picture: roof, siding, gutters, windows, screens, hard surfaces, and the way trees or plant growth are affecting the home.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
            <a href="tel:8023919977" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 16, background: "#7dd3fc", color: "var(--navy)", textDecoration: "none", padding: "14px 16px", fontWeight: 800 }}>
              <Phone size={18} />
              Call 802-391-9977
            </a>
            <a href="https://www.homeshinevt.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 16, background: "rgba(255,255,255,.10)", color: "white", textDecoration: "none", border: "1px solid rgba(255,255,255,.20)", padding: "14px 16px", fontWeight: 800 }}>
              HomeSHINEVt.com
            </a>
          </div>
        </section>

        <section className="hs-two-col" style={{ gap: 16, marginBottom: 18 }}>
          <article style={{ background: "white", border: "1px solid var(--border)", borderRadius: 26, padding: 24, boxShadow: "var(--shadow)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "linear-gradient(160deg, #fef3c7 0%, #ffffff 100%)", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber)", marginBottom: 16 }}>
              <Sparkles size={34} />
            </div>
            <div style={{ display: "inline-flex", borderRadius: 999, background: "var(--amber-light)", color: "var(--amber)", padding: "6px 11px", fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
              One-time service
            </div>
            <h2 className="serif" style={{ margin: 0, fontSize: 30, lineHeight: 1.1 }}>SHINE NOW™</h2>
            <div className="serif" style={{ fontSize: 40, color: "var(--green)", fontWeight: 800, marginTop: 6 }}>$2,750</div>
            <p style={{ color: "var(--muted)", lineHeight: 1.58, fontSize: 15 }}>
              A comprehensive exterior cleaning designed to restore the home and prepare it for the season.
            </p>
            <div style={{ display: "grid", gap: 9, marginTop: 16 }}>
              {shineNow.map((item) => (
                <Feature key={item}>{item}</Feature>
              ))}
            </div>
          </article>

          <article style={{ background: "linear-gradient(160deg, #1b2d45 0%, #1e5c3a 100%)", borderRadius: 26, padding: 24, boxShadow: "0 24px 48px rgba(27,45,69,.30)", color: "white" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7dd3fc", marginBottom: 16 }}>
              <ShieldCheck size={34} />
            </div>
            <div style={{ display: "inline-flex", borderRadius: 999, background: "rgba(125,211,252,.15)", color: "#7dd3fc", padding: "6px 11px", fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
              18-month maintenance plan
            </div>
            <h2 className="serif" style={{ margin: 0, fontSize: 30, lineHeight: 1.1 }}>HomeSHINE Protection™</h2>
            <div className="serif" style={{ fontSize: 40, color: "#7dd3fc", fontWeight: 800, marginTop: 6 }}>$3,500</div>
            <div style={{ color: "#a7f3d0", fontWeight: 800, marginTop: 2 }}>$600 refundable deposit or $197/mo</div>
            <p style={{ color: "#d8e3ee", lineHeight: 1.58, fontSize: 15 }}>
              Protect the clean, prevent buildup, and keep curb appeal through the seasons without re-booking each service.
            </p>
            <div style={{ display: "grid", gap: 9, marginTop: 16 }}>
              {protection.map((item) => (
                <Feature key={item} dark>
                  {item}
                </Feature>
              ))}
            </div>
          </article>
        </section>

        <section style={{ background: "linear-gradient(180deg, #fefce8 0%, #fef3c7 100%)", border: "1px solid #fde68a", borderRadius: 24, padding: 22, boxShadow: "0 10px 26px rgba(217,119,6,.13)", marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--amber)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>Assessment note</div>
          <p style={{ margin: 0, color: "var(--navy)", fontSize: 16, lineHeight: 1.6 }}>
            Estimates are based on a 2,500 sq ft home. If the home is under that size, Steven can adjust either main plan by about $500 after he double-checks the property in person.
          </p>
        </section>

        <section style={{ background: "white", border: "1px solid var(--border)", borderRadius: 24, padding: 22, boxShadow: "var(--shadow)" }}>
          <div className="hs-three-col" style={{ gap: 12 }}>
            {["Day 1 full deep clean", "Month 12 maintenance visit", "Month 18 final tune-up"].map((item) => (
              <div key={item} style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 16, padding: 15, fontWeight: 800, color: "var(--navy)", textAlign: "center" }}>
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
