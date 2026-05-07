"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  Calculator,
  CheckCircle2,
  Clock3,
  Home,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { HomeShineLogo } from "@/components/homeshine-logo";

type PriceArea = {
  emoji: string;
  area: string;
  usaLow: number;
  usaHigh: number;
  vtLow: number;
  vtHigh: number;
  basis: string;
};

type Plan = {
  name: string;
  emoji: string;
  price: number;
  label: string;
  note: string;
  featured?: boolean;
};

const BASE_HOME_SIZE = 2500;
const SMALL_HOME_CREDIT = 500;

const PRICE_AREAS: PriceArea[] = [
  {
    emoji: "🍂",
    area: "Gutters",
    usaLow: 400,
    usaHigh: 550,
    vtLow: 370,
    vtHigh: 540,
    basis: "Inside cleaning, brightening, and zebra-striping removal",
  },
  {
    emoji: "🏠",
    area: "Roof treatment",
    usaLow: 550,
    usaHigh: 900,
    vtLow: 850,
    vtHigh: 1400,
    basis: "Soft-wash roof treatment for organic growth",
  },
  {
    emoji: "🧼",
    area: "Siding / house wash",
    usaLow: 500,
    usaHigh: 900,
    vtLow: 880,
    vtHigh: 1090,
    basis: "Siding, soffit, fascia, shutters, and exterior brightening",
  },
  {
    emoji: "🪟",
    area: "Windows + screens",
    usaLow: 500,
    usaHigh: 720,
    vtLow: 650,
    vtHigh: 950,
    basis: "Exterior glass, sills, tracks, channels, and screen cleaning",
  },
  {
    emoji: "🚗",
    area: "Driveway / walkway",
    usaLow: 520,
    usaHigh: 800,
    vtLow: 650,
    vtHigh: 1200,
    basis: "Hard-surface cleaning for walkways, driveway, and entry areas",
  },
  {
    emoji: "🪵",
    area: "Deck / patio",
    usaLow: 420,
    usaHigh: 540,
    vtLow: 550,
    vtHigh: 850,
    basis: "Controlled-pressure cleaning for deck, patio, and outdoor living",
  },
  {
    emoji: "☀️",
    area: "Solar panels",
    usaLow: 450,
    usaHigh: 800,
    vtLow: 450,
    vtHigh: 800,
    basis: "Panel cleaning and exterior access planning",
  },
  {
    emoji: "🧱",
    area: "Paver sand + seal",
    usaLow: 1180,
    usaHigh: 1600,
    vtLow: 1500,
    vtHigh: 2100,
    basis: "Clean, sand, and seal planning range",
  },
];

const MAINTENANCE_TIPS = [
  {
    emoji: "🍂",
    title: "Gutters",
    timing: "Spring + fall",
    note: "Leaves, roof runoff, and freeze-thaw cycles make gutters repeat care.",
  },
  {
    emoji: "🏠",
    title: "Siding + soffits",
    timing: "Every 12-24 months",
    note: "Pollen, algae, webs, and shaded moisture build back between seasons.",
  },
  {
    emoji: "🌲",
    title: "Roof treatment",
    timing: "Every 24-36 months",
    note: "Trees, shade, and older shingles can shorten the cleaning window.",
  },
  {
    emoji: "🪟",
    title: "Windows + screens",
    timing: "Seasonally",
    note: "Screens, tracks, sills, pollen, and water spots are easiest to maintain early.",
  },
  {
    emoji: "🚗",
    title: "Driveways + walkways",
    timing: "Once a year",
    note: "Hard surfaces collect salt, algae, tire marks, grime, and winter staining.",
  },
  {
    emoji: "🛡️",
    title: "Why 3 visits",
    timing: "Day 1, Month 12, Month 18",
    note: "The plan protects the clean instead of restarting from zero each time.",
  },
];

const PLANS: Plan[] = [
  {
    name: "SHINE NOW™",
    emoji: "✨",
    price: 2750,
    label: "One-time deep clean",
    note: "A full exterior reset for homeowners who want the house looking sharp now.",
  },
  {
    name: "HomeSHINE Protection™",
    emoji: "🛡️",
    price: 3500,
    label: "18-month maintenance plan",
    note: "$600 refundable deposit or $197/mo. Three scheduled care visits plus priority extras.",
    featured: true,
  },
  {
    name: "SHINE Ready™",
    emoji: "🏡",
    price: 5000,
    label: "Selling your home",
    note: "Market-ready exterior care for curb appeal, showings, and listing confidence.",
  },
  {
    name: "SHINE Renew™",
    emoji: "💧",
    price: 7500,
    label: "Full restoration",
    note: "A deeper restoration path for older, overgrown, or neglected properties.",
  },
];

function money(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 24,
        boxShadow: "var(--shadow)",
        padding: 22,
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export default function MarketPage() {
  const [homeSize, setHomeSize] = useState("2500");

  const sizeNumber = Number(homeSize.replace(/,/g, "")) || BASE_HOME_SIZE;
  const cleanSize = clamp(sizeNumber, 1200, 6000);
  const marketFactor = clamp(cleanSize / BASE_HOME_SIZE, 0.75, 1.55);
  const isSmallerHome = cleanSize < BASE_HOME_SIZE;
  const homeSizeLabel = `${cleanSize.toLocaleString()} sq ft`;

  const adjustedAreas = useMemo(
    () =>
      PRICE_AREAS.map((area) => ({
        ...area,
        usaLow: area.usaLow * marketFactor,
        usaHigh: area.usaHigh * marketFactor,
        vtLow: area.vtLow * marketFactor,
        vtHigh: area.vtHigh * marketFactor,
      })),
    [marketFactor]
  );

  const total = useMemo(() => {
    return adjustedAreas.reduce(
      (sum, area) => ({
        usaLow: sum.usaLow + area.usaLow,
        usaHigh: sum.usaHigh + area.usaHigh,
        vtLow: sum.vtLow + area.vtLow,
        vtHigh: sum.vtHigh + area.vtHigh,
      }),
      { usaLow: 0, usaHigh: 0, vtLow: 0, vtHigh: 0 }
    );
  }, [adjustedAreas]);

  const protectionPrice = isSmallerHome ? PLANS[1].price - SMALL_HOME_CREDIT : PLANS[1].price;
  const protectionPerVisit = protectionPrice / 3;
  const sizeMessage = isSmallerHome
    ? `${homeSizeLabel} is below the 2,500 sq ft model, so the two main plans show Steven's smaller-home adjustment.`
    : `${homeSizeLabel} uses the 2,500 sq ft planning model and scales competitor ranges from there.`;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 56 }}>
      <div
        style={{
          background: "linear-gradient(180deg, var(--navy) 0%, var(--navy-2) 100%)",
          color: "white",
          padding: "18px 20px",
          boxShadow: "0 10px 25px rgba(27, 45, 69, 0.16)",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <HomeShineLogo size={58} />
            <div>
              <div className="serif" style={{ fontSize: 24, fontWeight: 700 }}>
                Home<span style={{ color: "#7dd3fc" }}>SHINE</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#cbd5e1", marginTop: 4 }}>
                <BarChart2 size={13} />
                USA + VT pricing reference
              </div>
            </div>
          </div>
          <Link
            href="/"
            style={{
              border: "1px solid rgba(255,255,255,.35)",
              borderRadius: 14,
              background: "rgba(255,255,255,.08)",
              color: "white",
              padding: "10px 16px",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Field App
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 18px" }}>
        <section
          style={{
            background: "linear-gradient(135deg, #1b2d45 0%, #1e5c3a 100%)",
            borderRadius: 28,
            color: "white",
            padding: "26px 24px",
            boxShadow: "0 20px 44px rgba(27, 45, 69, 0.24)",
            marginBottom: 16,
          }}
        >
          <div className="hs-two-col" style={{ gap: 18, alignItems: "stretch" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".14em", color: "#a7f3d0", textTransform: "uppercase", marginBottom: 10 }}>
                Steven pricing tool
              </div>
              <h1 className="serif" style={{ margin: 0, fontSize: 38, lineHeight: 1.06 }}>
                Show the value before the price.
              </h1>
              <p style={{ color: "#d8e3ee", fontSize: 17, lineHeight: 1.55, margin: "12px 0 0" }}>
                Compare separate one-time services against HomeSHINE&apos;s roof-to-curb plans, then show why scheduled care wins.
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 22, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a7f3d0", fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
                <Calculator size={16} />
                Estimate model
              </div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "white", marginBottom: 8 }}>
                Home size
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                <input
                  value={homeSize}
                  onChange={(event) => setHomeSize(event.target.value)}
                  inputMode="numeric"
                  aria-label="Home size in square feet"
                  style={{
                    width: "100%",
                    border: "1px solid rgba(255,255,255,.25)",
                    borderRadius: 14,
                    background: "rgba(255,255,255,.12)",
                    color: "white",
                    padding: "13px 14px",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                />
                <span style={{ fontWeight: 800, color: "#d8e3ee" }}>sq ft</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {[1800, 2500, 3200].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setHomeSize(String(size))}
                    style={{
                      border: "1px solid rgba(255,255,255,.25)",
                      borderRadius: 999,
                      background: cleanSize === size ? "#7dd3fc" : "rgba(255,255,255,.08)",
                      color: cleanSize === size ? "var(--navy)" : "white",
                      padding: "8px 11px",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {size.toLocaleString()}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: 12, borderRadius: 16, background: "rgba(255,255,255,.10)", color: "#d8e3ee", lineHeight: 1.45, fontSize: 13 }}>
                {sizeMessage}
              </div>
            </div>
          </div>
        </section>

        <div className="hs-three-col" style={{ gap: 14, marginBottom: 16 }}>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 22, boxShadow: "var(--shadow)", padding: 18 }}>
            <div style={{ color: "var(--muted)", fontSize: 12, fontWeight: 800, letterSpacing: ".06em", marginBottom: 8 }}>🇺🇸 USA SEPARATE SERVICES</div>
            <div className="serif" style={{ fontSize: 30, fontWeight: 800 }}>{money(total.usaLow)}-{money(total.usaHigh)}</div>
            <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.45, marginTop: 8 }}>Estimated if the homeowner shops the services separately.</div>
          </div>
          <div style={{ background: "linear-gradient(180deg, #fff7ed 0%, #fef3c7 100%)", border: "1px solid #fde68a", borderRadius: 22, boxShadow: "var(--shadow)", padding: 18 }}>
            <div style={{ color: "var(--amber)", fontSize: 12, fontWeight: 800, letterSpacing: ".06em", marginBottom: 8 }}>🍁 VT SEPARATE SERVICES</div>
            <div className="serif" style={{ fontSize: 30, fontWeight: 800, color: "var(--amber)" }}>{money(total.vtLow)}-{money(total.vtHigh)}</div>
            <div style={{ color: "#92400e", fontSize: 13, lineHeight: 1.45, marginTop: 8 }}>Local-style range for a full roof-to-curb service mix.</div>
          </div>
          <div style={{ background: "linear-gradient(160deg, #1b2d45 0%, #1e5c3a 100%)", borderRadius: 22, boxShadow: "var(--shadow)", padding: 18, color: "white" }}>
            <div style={{ color: "#a7f3d0", fontSize: 12, fontWeight: 800, letterSpacing: ".06em", marginBottom: 8 }}>🛡️ HOMESHINE PROTECTION</div>
            <div className="serif" style={{ fontSize: 30, fontWeight: 800, color: "#7dd3fc" }}>{money(protectionPrice)}</div>
            <div style={{ color: "#d8e3ee", fontSize: 13, lineHeight: 1.45, marginTop: 8 }}>Three scheduled visits, about {money(protectionPerVisit)} per visit.</div>
          </div>
        </div>

        <SectionCard>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <h2 className="serif" style={{ fontSize: 28, margin: "0 0 6px" }}>Maintenance rhythm</h2>
              <div style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.5 }}>
                These quick tips help Steven explain why 18 months of care feels better than one expensive cleanup.
              </div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--amber-light)", color: "var(--amber)", border: "1px solid #fde68a", borderRadius: 999, padding: "8px 12px", fontWeight: 800, fontSize: 13 }}>
              <Clock3 size={15} />
              3 visits = less buildup
            </div>
          </div>

          <div className="hs-three-col" style={{ gap: 12 }}>
            {MAINTENANCE_TIPS.map((tip) => (
              <div key={tip.title} style={{ minHeight: 158, border: "1px solid var(--border)", borderRadius: 20, padding: 16, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 15, background: "var(--green-light)", border: "1px solid #b8e3c6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23 }}>
                    {tip.emoji}
                  </div>
                  <span style={{ color: "var(--green)", fontSize: 12, fontWeight: 800 }}>{tip.timing}</span>
                </div>
                <div style={{ fontWeight: 800, color: "var(--navy)", fontSize: 17, lineHeight: 1.2 }}>{tip.title}</div>
                <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.45, marginTop: 9 }}>{tip.note}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <h2 className="serif" style={{ fontSize: 28, margin: "0 0 6px" }}>Area pricing</h2>
              <div style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.5 }}>
                Ranges update with the home size above, so Steven can quickly compare a smaller or larger home.
              </div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--green-light)", color: "var(--green)", border: "1px solid #b8e3c6", borderRadius: 999, padding: "8px 12px", fontWeight: 800, fontSize: 13 }}>
              <Sparkles size={15} />
              2 x 4 view
            </div>
          </div>

          <div className="hs-price-grid" style={{ gap: 12 }}>
            {adjustedAreas.map((area) => (
              <div key={area.area} style={{ minHeight: 230, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14, padding: 16, border: "1px solid var(--border)", borderRadius: 20, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", boxShadow: "0 10px 22px rgba(27, 45, 69, 0.07)" }}>
                <div>
                  <div style={{ width: 44, height: 44, borderRadius: 16, background: "var(--green-light)", border: "1px solid #b8e3c6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 12 }}>
                    {area.emoji}
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--navy)", fontSize: 17, lineHeight: 1.2 }}>{area.area}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.4, marginTop: 7 }}>{area.basis}</div>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ padding: "10px 11px", borderRadius: 14, background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                    <div style={{ color: "var(--muted)", fontSize: 11, fontWeight: 800, letterSpacing: ".05em" }}>🇺🇸 USA COMPETITOR</div>
                    <div style={{ fontWeight: 800, fontSize: 16, marginTop: 2 }}>{money(area.usaLow)}-{money(area.usaHigh)}</div>
                  </div>
                  <div style={{ padding: "10px 11px", borderRadius: 14, background: "var(--amber-light)", border: "1px solid #fde68a" }}>
                    <div style={{ color: "var(--amber)", fontSize: 11, fontWeight: 800, letterSpacing: ".05em" }}>🍁 VT COMPETITOR</div>
                    <div style={{ fontWeight: 800, fontSize: 16, marginTop: 2, color: "var(--amber)" }}>{money(area.vtLow)}-{money(area.vtHigh)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <section className="hs-two-col" style={{ gap: 14 }}>
          {PLANS.map((plan) => {
            const isMainAdjusted = isSmallerHome && (plan.name.includes("NOW") || plan.name.includes("Protection"));
            const shownPrice = isMainAdjusted ? plan.price - SMALL_HOME_CREDIT : plan.price;

            return (
              <div
                key={plan.name}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  background: plan.featured ? "linear-gradient(160deg, #1b2d45 0%, #1e5c3a 100%)" : "white",
                  color: plan.featured ? "white" : "var(--navy)",
                  border: plan.featured ? "none" : "1px solid var(--border)",
                  borderRadius: 24,
                  boxShadow: "var(--shadow)",
                  padding: 22,
                }}
              >
                {plan.featured && (
                  <div style={{ position: "absolute", right: -38, top: -38, width: 120, height: 120, borderRadius: "50%", background: "rgba(125,211,252,.16)" }} />
                )}
                <div style={{ position: "relative" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: plan.featured ? "rgba(125,211,252,.16)" : "var(--green-light)", color: plan.featured ? "#7dd3fc" : "var(--green)", borderRadius: 999, padding: "6px 11px", fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
                    <span style={{ fontSize: 15 }}>{plan.emoji}</span>
                    <CheckCircle2 size={14} />
                    {plan.label}
                  </div>
                  <div className="serif" style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <div className="serif" style={{ fontSize: 36, fontWeight: 800, color: plan.featured ? "#7dd3fc" : "var(--green)" }}>{money(shownPrice)}</div>
                    {isMainAdjusted && <span style={{ color: plan.featured ? "#d8e3ee" : "var(--muted)", fontSize: 12, fontWeight: 800 }}>smaller-home price</span>}
                  </div>
                  {plan.featured && <div style={{ marginTop: 4, color: "#d8e3ee", fontSize: 13, fontWeight: 800 }}>About {money(shownPrice / 3)} per scheduled visit</div>}
                  <p style={{ color: plan.featured ? "#d8e3ee" : "var(--muted)", lineHeight: 1.55, fontSize: 15 }}>{plan.note}</p>
                </div>
              </div>
            );
          })}
        </section>

        <SectionCard style={{ marginTop: 16, background: "linear-gradient(135deg, #ffffff 0%, #e6f4ec 100%)" }}>
          <div className="hs-two-col" style={{ gap: 16, alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--green)", fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
                <TrendingUp size={16} />
                Easy closer
              </div>
              <h2 className="serif" style={{ margin: 0, fontSize: 28 }}>
                One visit cleans it. Three visits keep it protected.
              </h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.55, marginBottom: 0 }}>
                HomeSHINE Protection keeps the home on schedule, protects curb appeal, and avoids turning every season into another full reset.
              </p>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, background: "white", border: "1px solid var(--border)" }}>
                <Home size={18} color="var(--green)" />
                <span style={{ fontWeight: 800 }}>Roof-to-curb care, not piecemeal work</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, background: "white", border: "1px solid var(--border)" }}>
                <ShieldCheck size={18} color="var(--green)" />
                <span style={{ fontWeight: 800 }}>Priority schedule and planned touch-ups</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
