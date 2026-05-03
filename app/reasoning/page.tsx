import Link from "next/link";
import { Lightbulb } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Plans | HomeSHINE",
  description: "HomeSHINE exterior care plans",
};

const SERVICES = [
  { emoji: "🌿", label: "Vegetation removal" },
  { emoji: "🏠", label: "Roof wash" },
  { emoji: "🍂", label: "Gutter cleaning" },
  { emoji: "🪟", label: "Windows" },
  { emoji: "🔲", label: "Screens" },
  { emoji: "🪟", label: "Shutters" },
  { emoji: "🧱", label: "Siding wash" },
  { emoji: "🚶", label: "Walkway" },
  { emoji: "🚗", label: "Driveway" },
  { emoji: "🪵", label: "Deck & patio" },
  { emoji: "☀️", label: "Solar panels" },
  { emoji: "➕", label: "& more" },
];

const PLANS = [
  {
    name: "SHINE-Protection™",
    price: "$3,550",
    perVisit: "~$1,183 / visit",
    tag: "Most Popular",
    featured: true,
    visits: "3 visits over 18 months",
    pitch:
      "We come out three times over a year and a half — keeping your roof, siding, gutters, and driveway clean before buildup becomes a real problem. You're not calling us every time; we just show up.",
    highlight:
      "Competitors charge $6,000–$8,000+ for a single visit. You're getting three for $3,550.",
  },
  {
    name: "SHINE-Ready™",
    price: "$5,000",
    perVisit: null,
    tag: "Selling your home",
    featured: false,
    visits: "Ongoing while on the market",
    pitch:
      "Your home is about to be judged by every buyer who drives by. We keep the exterior clean and maintained the entire time it's listed. You don't pay us a cent until the house closes.",
    highlight: "No payment until your home sells.",
  },
  {
    name: "SHINE-Renew™",
    price: "$7,500",
    perVisit: null,
    tag: "Full restoration",
    featured: false,
    visits: "Complete top-to-bottom clean",
    pitch:
      "For homes that haven't been touched in years — black streaks on the roof, green on the siding, moss in the gutters. We do a full restoration: roof, siding, gutters, driveway, deck. Everything.",
    highlight: "We bring it back. One complete package.",
  },
];

export default function OurPlansPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 60 }}>
      {/* Header */}
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          <div>
            <div className="serif" style={{ fontSize: 30, fontWeight: 700 }}>
              Home<span style={{ color: "#7dd3fc" }}>SHINE</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                color: "#cbd5e1",
                marginTop: 4,
              }}
            >
              <Lightbulb size={13} style={{ flexShrink: 0 }} />
              Our Plans
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
            ← Field App
          </Link>
        </div>
      </div>

      <div style={{ padding: "24px 18px", maxWidth: 700, margin: "0 auto" }}>

        {/* What we do */}
        <div
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            boxShadow: "var(--shadow)",
            padding: "24px 22px",
            marginBottom: 14,
          }}
        >
          <div className="serif" style={{ fontSize: 26, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
            What we do
          </div>
          <div style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.6, marginBottom: 18 }}>
            We clean the outside of your home — everything that takes the weather every single day.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            {SERVICES.map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--green-light)",
                  border: "1px solid #b8e3c6",
                  borderRadius: 14,
                  padding: "12px 14px",
                }}
              >
                <span style={{ fontSize: 20 }}>{s.emoji}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--navy)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The honest comparison */}
        <div
          style={{
            background: "linear-gradient(135deg, #1b2d45 0%, #243650 100%)",
            borderRadius: 24,
            padding: "24px 22px",
            marginBottom: 14,
            color: "white",
            boxShadow: "0 20px 44px rgba(27, 45, 69, 0.26)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#7dd3fc",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            The honest comparison
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div
              style={{
                background: "rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "16px 14px",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fca5a5", letterSpacing: "0.06em", marginBottom: 8 }}>
                OTHER COMPANIES
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>$6,000–$8,000<span style={{ fontSize: 16 }}>+</span></div>
              <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.5 }}>
                For one visit. You call them every time. No schedule, no follow-through.
              </div>
            </div>
            <div
              style={{
                background: "rgba(45, 122, 79, 0.25)",
                border: "1px solid rgba(167, 243, 208, 0.2)",
                borderRadius: 16,
                padding: "16px 14px",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#a7f3d0", letterSpacing: "0.06em", marginBottom: 8 }}>
                HOMESHINE
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>~$1,183<span style={{ fontSize: 14, fontWeight: 400, color: "#a7f3d0" }}> / visit</span></div>
              <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.5 }}>
                3 visits included. We stay on schedule so your home never falls behind.
              </div>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: "grid", gap: 14 }}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.featured
                  ? "linear-gradient(160deg, #1b2d45 0%, #1e5c3a 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)",
                border: plan.featured ? "none" : "1px solid var(--border)",
                borderRadius: 24,
                boxShadow: plan.featured
                  ? "0 24px 48px rgba(27, 45, 69, 0.30)"
                  : "var(--shadow)",
                padding: "26px 22px",
                color: plan.featured ? "white" : "var(--navy)",
              }}
            >
              {/* Tag */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: 999,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 14,
                  ...(plan.featured
                    ? { background: "rgba(251, 191, 36, 0.18)", color: "#fbbf24" }
                    : { background: "var(--green-light)", color: "var(--green)", border: "1px solid #b8e3c6" }),
                }}
              >
                {plan.featured ? "★ " : ""}{plan.tag}
              </div>

              {/* Name + price row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
                <div className="serif" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
                  {plan.name}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    className="serif"
                    style={{
                      fontSize: 34,
                      fontWeight: 700,
                      lineHeight: 1,
                      color: plan.featured ? "#7dd3fc" : "var(--green)",
                    }}
                  >
                    {plan.price}
                  </div>
                  {plan.perVisit && (
                    <div
                      style={{
                        fontSize: 12,
                        marginTop: 4,
                        color: plan.featured ? "#a7f3d0" : "var(--muted)",
                      }}
                    >
                      {plan.perVisit}
                    </div>
                  )}
                </div>
              </div>

              {/* Visits label */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: plan.featured ? "#a7f3d0" : "var(--green)",
                  marginBottom: 12,
                }}
              >
                {plan.visits}
              </div>

              {/* Pitch */}
              <div
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: plan.featured ? "#cbd5e1" : "var(--muted)",
                  marginBottom: 14,
                }}
              >
                {plan.pitch}
              </div>

              {/* Highlight pill */}
              <div
                style={{
                  background: plan.featured ? "rgba(255,255,255,0.08)" : "#f8fafc",
                  border: plan.featured ? "1px solid rgba(255,255,255,0.12)" : "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "12px 14px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: plan.featured ? "white" : "var(--navy)",
                  lineHeight: 1.4,
                }}
              >
                {plan.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
