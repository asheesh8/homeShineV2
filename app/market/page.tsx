"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart2 } from "lucide-react";

const PLANS = [
  {
    name: "SHINE-Protection™",
    price: 3550,
    desc: "3-visit 18-month plan, year-round maintenance",
  },
  {
    name: "SHINE-Ready™",
    price: 5000,
    desc: "For homes going on market, no payment until sale closes",
  },
  {
    name: "SHINE-Renew™",
    price: 7500,
    desc: "Full restoration for neglected/overgrown properties",
  },
];

function calcMarket(sqft: number) {
  const perimeter = 4 * Math.sqrt(sqft);
  const low =
    0.25 * sqft +
    0.1 * sqft +
    0.8 * perimeter +
    0.15 * sqft +
    0.25 * sqft;
  const high =
    2.5 * sqft +
    0.5 * sqft +
    2.0 * perimeter +
    0.4 * sqft +
    0.75 * sqft;
  return { low, high, mid: (low + high) / 2 };
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

export default function MarketPage() {
  const [sqft, setSqft] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcMarket> | null>(null);

  function handleCalculate() {
    const n = parseFloat(sqft);
    if (!n || n <= 0) return;
    setResult(calcMarket(n));
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 52 }}>
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
            maxWidth: 980,
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
              <BarChart2 size={13} style={{ flexShrink: 0 }} />
              Market Comparison
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

      <div style={{ padding: "24px 18px", maxWidth: 980, margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            boxShadow: "var(--shadow)",
            padding: "24px 22px",
            marginBottom: 18,
          }}
        >
          <div className="serif" style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            Market Comparison
          </div>
          <div style={{ color: "var(--muted)", fontSize: 16, marginBottom: 20 }}>
            Enter square footage to see what competitors charge vs. HomeSHINE plans.
          </div>
          <label style={{ display: "block", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            Home square footage
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="number"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
              placeholder="e.g. 1800"
              style={{
                flex: 1,
                border: "2px solid var(--border)",
                borderRadius: 16,
                padding: "16px 14px",
                fontSize: 20,
                background: "var(--white)",
              }}
            />
            <button
              type="button"
              onClick={handleCalculate}
              style={{
                border: "none",
                borderRadius: 16,
                background: "linear-gradient(180deg, #2f8455 0%, #2d7a4f 100%)",
                color: "white",
                padding: "16px 22px",
                fontSize: 18,
                fontWeight: 700,
                boxShadow: "0 10px 24px rgba(45, 122, 79, 0.28)",
                whiteSpace: "nowrap",
              }}
            >
              Calculate
            </button>
          </div>
        </div>

        {result && (
          <>
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
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#7dd3fc",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Competitor Market Range
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  { label: "Market Low", value: result.low, accent: "#a7f3d0" },
                  { label: "Market Mid", value: result.mid, accent: "#7dd3fc" },
                  { label: "Market High", value: result.high, accent: "#fca5a5" },
                ].map(({ label, value, accent }) => (
                  <div
                    key={label}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      padding: "16px 12px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: accent,
                        marginBottom: 6,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700 }}>{fmt(value)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {PLANS.map((plan) => {
                const savings = result.mid - plan.price;
                return (
                  <div
                    key={plan.name}
                    style={{
                      background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)",
                      border: "1px solid var(--border)",
                      borderRadius: 24,
                      boxShadow: "0 12px 28px rgba(27, 45, 69, 0.1)",
                      padding: "20px 22px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div
                        style={{ fontSize: 20, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}
                      >
                        {plan.name}
                      </div>
                      <div style={{ fontSize: 15, color: "var(--muted)" }}>{plan.desc}</div>
                      <div
                        style={{
                          marginTop: 10,
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: 999,
                          padding: "4px 12px",
                          fontSize: 13,
                          fontWeight: 700,
                          ...(savings > 0
                            ? {
                                background: "var(--green-light)",
                                border: "1px solid #b8e3c6",
                                color: "var(--green)",
                              }
                            : {
                                background: "var(--amber-light)",
                                border: "1px solid #fde68a",
                                color: "var(--amber)",
                              }),
                        }}
                      >
                        {savings > 0
                          ? `You save ${fmt(savings)} vs market mid`
                          : `${fmt(Math.abs(savings))} above market mid`}
                      </div>
                    </div>
                    <div
                      className="serif"
                      style={{ fontSize: 32, fontWeight: 700, color: "var(--navy)", whiteSpace: "nowrap" }}
                    >
                      {fmt(plan.price)}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
