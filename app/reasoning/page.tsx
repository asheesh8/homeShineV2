import Link from "next/link";
import { CalendarDays, CheckCircle2, Home, Lightbulb, Phone, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { HomeShineLogo } from "@/components/homeshine-logo";

export const metadata: Metadata = {
  title: "HomeSHINE Plans | HomeSHINE",
  description: "Simple HomeSHINE exterior care options for homeowners",
};

const shineNowIncludes = [
  "Gutters cleared and exterior brightened",
  "Siding soft wash up to 90 PSI, including soffit and fascia",
  "Exterior windows with purified RO/DI water",
  "Screens removed, cleaned, and reinstalled",
  "Walkways and hard surfaces cleaned",
  "Deck or patio soft wash with controlled pressure",
];

const protectionIncludes = [
  "Everything in SHINE NOW",
  "Roof treatment",
  "Screen repair concierge",
  "Window interior first-floor clean",
  "Oxidation removal",
  "Hot-water sanitation bins at every visit",
  "Priority scheduling",
  "$250 specialty service credit",
  "Bonus floating pollen-removal visit",
];

const futureServices = [
  "Solar panels",
  "Garage floor oil spills",
  "Roof Renew",
  "Siding Renew",
  "Interior all-windows",
  "Driveway paver sand and seal",
  "Stone sand and seal",
  "Boat detailing",
];

const methods = [
  "Oxygen-based cleaner",
  "Controlled sodium hypochlorite blend",
  "Dragon Juice degreaser",
  "NeutraPods soft-wash neutralizer",
  "Pre-water treatment, tarps, and plant protection",
];

function PlanIcon({ type }: { type: "now" | "protection" }) {
  const Icon = type === "now" ? Sparkles : ShieldCheck;
  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: 22,
        background:
          type === "now"
            ? "linear-gradient(160deg, #fef3c7 0%, #ffffff 100%)"
            : "linear-gradient(160deg, #1b2d45 0%, #1e5c3a 100%)",
        border: type === "now" ? "1px solid #fde68a" : "1px solid rgba(255,255,255,.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 14px 30px rgba(27,45,69,.12)",
        color: type === "now" ? "var(--amber)" : "#7dd3fc",
      }}
    >
      <Icon size={34} />
    </div>
  );
}

export default function ReasoningPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 60 }}>
      <div style={{ background: "linear-gradient(180deg, var(--navy) 0%, var(--navy-2) 100%)", color: "white", padding: "18px 20px", boxShadow: "0 10px 25px rgba(27, 45, 69, 0.16)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, maxWidth: 880, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <HomeShineLogo size={58} />
            <div>
              <div className="serif" style={{ fontSize: 24, fontWeight: 700 }}>
                Home<span style={{ color: "#7dd3fc" }}>SHINE</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#cbd5e1", marginTop: 4 }}>
                <Lightbulb size={13} />
                Simple plan guide
              </div>
            </div>
          </div>
          <Link href="/" style={{ border: "1px solid rgba(255,255,255,.35)", borderRadius: 14, background: "rgba(255,255,255,.08)", color: "white", padding: "10px 16px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Field App
          </Link>
        </div>
      </div>

      <div style={{ padding: "24px 18px", maxWidth: 880, margin: "0 auto" }}>
        <section style={{ background: "linear-gradient(135deg, #1b2d45 0%, #1e5c3a 100%)", borderRadius: 28, padding: "30px 26px", color: "white", boxShadow: "0 20px 44px rgba(27,45,69,.24)", marginBottom: 16 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, background: "rgba(125,211,252,.13)", color: "#7dd3fc", padding: "7px 12px", fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14 }}>
            <Home size={14} />
            Roof-to-curb care
          </div>
          <h1 className="serif" style={{ margin: 0, fontSize: 38, lineHeight: 1.08 }}>
            HomeSHINE Exterior Care Options
          </h1>
          <p style={{ color: "#d8e3ee", fontSize: 17, lineHeight: 1.62, margin: "14px 0 0" }}>
            Thank you for having HomeSHINE at your home for an assessment. We look at the whole property: roof, siding, gutters, windows, hard surfaces, and how trees or plant growth are affecting the home. The goal is simple: make the home shine now and protect it long term.
          </p>
        </section>

        <section className="hs-two-col" style={{ gap: 14, marginBottom: 16 }}>
          <article style={{ background: "white", border: "1px solid var(--border)", borderRadius: 24, padding: 22, boxShadow: "var(--shadow)" }}>
            <PlanIcon type="now" />
            <div style={{ marginTop: 16, display: "inline-flex", borderRadius: 999, background: "var(--amber-light)", color: "var(--amber)", padding: "6px 11px", fontSize: 12, fontWeight: 800 }}>
              One-time service
            </div>
            <h2 className="serif" style={{ fontSize: 28, lineHeight: 1.12, margin: "12px 0 4px" }}>SHINE NOW™</h2>
            <div className="serif" style={{ color: "var(--green)", fontSize: 36, fontWeight: 800 }}>$2,750</div>
            <p style={{ color: "var(--muted)", lineHeight: 1.58, fontSize: 15 }}>
              A comprehensive exterior cleaning for homeowners who want the home looking its best now with no ongoing maintenance.
            </p>
            <div style={{ display: "grid", gap: 9, marginTop: 16 }}>
              {shineNowIncludes.map((item) => (
                <div key={item} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14, color: "var(--navy)", lineHeight: 1.4 }}>
                  <CheckCircle2 size={16} color="var(--green)" style={{ marginTop: 2, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article style={{ background: "linear-gradient(160deg, #1b2d45 0%, #1e5c3a 100%)", borderRadius: 24, padding: 22, boxShadow: "0 24px 48px rgba(27,45,69,.28)", color: "white" }}>
            <PlanIcon type="protection" />
            <div style={{ marginTop: 16, display: "inline-flex", borderRadius: 999, background: "rgba(125,211,252,.15)", color: "#7dd3fc", padding: "6px 11px", fontSize: 12, fontWeight: 800 }}>
              18-month maintenance
            </div>
            <h2 className="serif" style={{ fontSize: 28, lineHeight: 1.12, margin: "12px 0 4px" }}>HomeSHINE Protection™</h2>
            <div className="serif" style={{ color: "#7dd3fc", fontSize: 36, fontWeight: 800 }}>$3,500</div>
            <div style={{ color: "#a7f3d0", fontWeight: 800, marginTop: 2 }}>$600 refundable deposit or $197/mo</div>
            <p style={{ color: "#d8e3ee", lineHeight: 1.58, fontSize: 15 }}>
              Your home stays clean and maintained without re-booking or managing multiple services. Protect the clean, prevent buildup, and keep curb appeal through the seasons.
            </p>
            <div style={{ display: "grid", gap: 9, marginTop: 16 }}>
              {protectionIncludes.map((item) => (
                <div key={item} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14, color: "white", lineHeight: 1.4 }}>
                  <CheckCircle2 size={16} color="#a7f3d0" style={{ marginTop: 2, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section style={{ background: "white", border: "1px solid var(--border)", borderRadius: 24, boxShadow: "var(--shadow)", padding: 22, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <CalendarDays color="var(--green)" />
            <h2 className="serif" style={{ fontSize: 26, margin: 0 }}>18-month care schedule</h2>
          </div>
          <div className="hs-four-col" style={{ gap: 10 }}>
            {["Day 1: Full deep clean", "Month 12: Maintenance visit", "Month 18: Final tune-up", "Bonus: floating pollen visit"].map((item) => (
              <div key={item} style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 16, padding: 14, fontSize: 14, fontWeight: 800, lineHeight: 1.35 }}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="hs-two-col" style={{ gap: 14, marginBottom: 16 }}>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 24, boxShadow: "var(--shadow)", padding: 22 }}>
            <h2 className="serif" style={{ fontSize: 24, margin: "0 0 10px" }}>Future specialty options</h2>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.55 }}>
              Steven will explain SHINE Renew and SHINE Ready in more detail later. These are the specialty services that can be added or credited through the plan.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              {futureServices.map((item) => (
                <span key={item} style={{ borderRadius: 999, background: "var(--green-light)", color: "var(--green)", border: "1px solid #b8e3c6", padding: "7px 10px", fontSize: 13, fontWeight: 800 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 24, boxShadow: "var(--shadow)", padding: 22 }}>
            <h2 className="serif" style={{ fontSize: 24, margin: "0 0 10px" }}>Cleaning methods</h2>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.55 }}>
              Applications are controlled and tailored by surface so the home, plants, landscaping, and property are treated carefully.
            </p>
            <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
              {methods.map((item) => (
                <div key={item} style={{ padding: "10px 12px", borderRadius: 14, background: "#f8fafc", border: "1px solid var(--border)", fontWeight: 700, fontSize: 14 }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: "linear-gradient(180deg, #fefce8 0%, #fef3c7 100%)", border: "1px solid #fde68a", borderRadius: 24, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--amber)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>Scheduling note</div>
            <div style={{ fontSize: 16, color: "var(--navy)", lineHeight: 1.5, maxWidth: 620 }}>
              HomeSHINE is scheduling into mid-May with a few Saturday times open. Steven may adjust pricing by about $500 for homes under 2,500 sq ft after he double-checks the property.
            </div>
          </div>
          <a href="tel:8023919977" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 16, background: "var(--green)", color: "white", textDecoration: "none", padding: "14px 16px", fontWeight: 800 }}>
            <Phone size={18} />
            802-391-9977
          </a>
        </section>
      </div>
    </main>
  );
}
