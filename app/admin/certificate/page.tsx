"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import { HomeShineLogo } from "@/components/homeshine-logo";

const CERT_SERIF = "Georgia, 'Times New Roman', serif";
const CERT_SANS = "'Avenir Next', Avenir, 'Segoe UI', Arial, sans-serif";
const CERT_SCRIPT = "'Snell Roundhand', 'Apple Chancery', 'Segoe Script', cursive";

const PRINT_CSS = `
@media print {
  @page { margin: 0; }
  .hs-cert-active * { visibility: hidden; }
  .hs-cert-active #hs-certificate,
  .hs-cert-active #hs-certificate * { visibility: visible; }
  .hs-cert-active #hs-certificate {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    box-shadow: none !important;
    min-height: 100vh !important;
  }
  .hs-print-hide { display: none !important; }
}
`;

const SERVICES_LIST = [
  "Roof Wash (Soft-Wash)",
  "House / Siding Wash",
  "Gutter Cleaning",
  "Wood & Vinyl Cleaning",
  "Concrete Cleaning & Sealing",
  "Patio & Deck Cleaning",
  "Brick & Stone Sand and Seal",
  "Solar Panel Cleaning",
  "Driveway Cleaning",
  "Window Cleaning",
];

const PLANS = [
  { name: "SHINE-Protection™", price: "$3,550" },
  { name: "SHINE-Ready™", price: "$5,000" },
  { name: "SHINE-Renew™", price: "$7,500" },
];

type FormData = {
  ownerName: string;
  address: string;
  serviceDate: string;
  services: string[];
  plan: string;
  note: string;
};

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function genCertNum() {
  return `HS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
}

// ─── Certificate design ───────────────────────────────────────────────────────

function CertificateLogo({ gold }: { gold: string }) {
  return (
    <div
      aria-label="HomeSHINE"
      role="img"
      style={{
        width: 82,
        height: 82,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 38% 44%, rgba(255,255,255,.95) 0 4px, rgba(125,211,252,.34) 5px 15px, transparent 28px), linear-gradient(145deg, #060d13 0%, #172235 58%, #020405 100%)",
        border: "2px solid rgba(255,255,255,.82)",
        boxShadow: `0 0 0 3px ${gold}, 0 12px 28px rgba(0,0,0,.28), inset 0 0 18px rgba(125,211,252,.16)`,
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={78}
        height={78}
        style={{
          position: "relative",
          zIndex: 1,
          overflow: "visible",
        }}
      >
        <path
          d="M22 34 L50 15 L78 34"
          fill="none"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="50"
          y="59"
          textAnchor="middle"
          fill="white"
          fontFamily={CERT_SERIF}
          fontSize="27"
          fontWeight="700"
          letterSpacing="1.3"
        >
          HOME
        </text>
        <text
          x="50"
          y="76"
          textAnchor="middle"
          fill="#b9d7ff"
          fontFamily={CERT_SCRIPT}
          fontSize="22"
          fontWeight="700"
        >
          Shine
        </text>
      </svg>
    </div>
  );
}

function Certificate({ data, certNum }: { data: FormData; certNum: string }) {
  const year = new Date().getFullYear();
  const gold = "#c9a227";
  const selectedPlan = PLANS.find((p) => p.name === data.plan) ?? null;
  const formattedDate = formatDate(data.serviceDate);

  return (
    <div
      id="hs-certificate"
      style={{
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
        background: "linear-gradient(180deg, #fffdf8 0%, #f7f2e8 100%)",
        fontFamily: CERT_SERIF,
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        border: "1px solid rgba(201, 162, 39, 0.52)",
      }}
    >
      {/* Watermark */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "44%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-30deg)",
          fontSize: 58,
          fontFamily: CERT_SANS,
          fontWeight: 700,
          color: "rgba(27, 45, 69, 0.035)",
          letterSpacing: "0.14em",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 0,
          userSelect: "none",
        }}
      >
        HOMESHINE™
      </div>

      {/* ── TOP BAND ── */}
      <div
        style={{
          background: "linear-gradient(180deg, #1b2d45 0%, #243650 100%)",
          color: "white",
          padding: "26px 34px 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 18,
            marginBottom: 24,
          }}
        >
          {/* Logo mark — left */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, width: 118 }}>
            <CertificateLogo gold={gold} />
          </div>

          {/* Center title */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                fontFamily: CERT_SANS,
                fontSize: 10,
                letterSpacing: "0.26em",
                color: "#c6d3df",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              Certificate of Completion
            </div>
            <div
              style={{
                fontFamily: CERT_SANS,
                fontSize: 25,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "white",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              EXTERIOR CARE
            </div>
            <div
              style={{
                fontFamily: CERT_SERIF,
                fontSize: 16,
                fontStyle: "italic",
                color: "#b9d7ff",
              }}
            >
              HomeSHINE™ Certified
            </div>
          </div>

          {/* Verified badge — right */}
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: "50%",
              border: `2px solid ${gold}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontFamily: CERT_SANS,
                fontSize: 7,
                letterSpacing: "0.14em",
                color: gold,
              }}
            >
              VERIFIED
            </div>
            <div style={{ color: gold, fontSize: 9, lineHeight: 1 }}>✦</div>
            <div
              style={{
                fontFamily: CERT_SANS,
                fontSize: 6,
                letterSpacing: "0.1em",
                color: "white",
              }}
            >
              HOMESHINE™
            </div>
            <div
              style={{ fontFamily: CERT_SANS, fontSize: 9, color: "#c6d3df" }}
            >
              {year}
            </div>
          </div>
        </div>

        {/* Gold rule */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, transparent 0%, ${gold} 20%, #e8c84a 50%, ${gold} 80%, transparent 100%)`,
          }}
        />
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: "32px 38px 28px", position: "relative", zIndex: 1 }}>
        {/* Presented to */}
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div
            style={{
              fontFamily: CERT_SANS,
              fontSize: 9,
              letterSpacing: "0.26em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            This Certificate is Proudly Presented to
          </div>
          <div
            style={{
              display: "inline-block",
              paddingBottom: 6,
              borderBottom: `2px solid ${gold}`,
              minWidth: 300,
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                fontFamily: CERT_SERIF,
                fontSize: 40,
                fontWeight: 700,
                color: "#1b2d45",
                lineHeight: 1.08,
                overflowWrap: "anywhere",
              }}
            >
              {data.ownerName || "Homeowner Name"}
            </div>
          </div>
        </div>

        {/* Address */}
        <div style={{ textAlign: "center", marginTop: 14, marginBottom: 18 }}>
          <div
            style={{
              fontFamily: CERT_SANS,
              fontSize: 8,
              letterSpacing: "0.22em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Property Address
          </div>
          <div
            style={{
              fontFamily: CERT_SERIF,
              fontSize: 16,
              color: "#243650",
              overflowWrap: "anywhere",
            }}
          >
            {data.address || "—"}
          </div>
        </div>

        {/* Thin rule */}
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, #dde4ed 30%, #dde4ed 70%, transparent)",
            marginBottom: 18,
          }}
        />

        {/* Body paragraph */}
        <div
          style={{
            fontFamily: CERT_SERIF,
            fontSize: 15,
            lineHeight: 1.72,
            color: "#374151",
            textAlign: "center",
            marginBottom: 22,
          }}
        >
          This property has been professionally inspected, treated, and cared for by the
          HomeSHINE™ team on{" "}
          <strong style={{ color: "#1b2d45" }}>{formattedDate || "—"}</strong>. All
          surfaces were serviced using eco-friendly solutions and specialized soft-wash
          technology, restoring and protecting your home&apos;s exterior to the highest
          standard.
        </div>

        {/* Services performed */}
        {data.services.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontFamily: CERT_SANS,
                fontSize: 8,
                letterSpacing: "0.26em",
                color: "#94a3b8",
                textTransform: "uppercase",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Services Performed
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 7,
                justifyContent: "center",
              }}
            >
              {data.services.map((s) => (
                <div
                  key={s}
                  style={{
                    background: "#1b2d45",
                    color: "white",
                    borderRadius: 999,
                    padding: "5px 14px",
                    fontSize: 11.5,
                    fontFamily: CERT_SANS,
                    letterSpacing: "0.05em",
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plan enrolled */}
        {selectedPlan && (
          <div
            style={{
              background: "linear-gradient(135deg, #1b2d45 0%, #243650 100%)",
              borderRadius: 14,
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: CERT_SANS,
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Plan Enrolled
              </div>
              <div
                style={{
                  fontFamily: CERT_SERIF,
                  fontSize: 20,
                  fontStyle: "italic",
                  color: "white",
                }}
              >
                {selectedPlan.name}
              </div>
            </div>
            <div
              style={{
                fontFamily: CERT_SERIF,
                fontSize: 28,
                fontWeight: 700,
                color: gold,
              }}
            >
              {selectedPlan.price}
            </div>
          </div>
        )}

        {/* Custom note */}
        {data.note.trim() && (
          <div
            style={{
              textAlign: "center",
              padding: "14px 24px",
              marginBottom: 20,
              borderTop: "1px solid #e5e7eb",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontFamily: CERT_SERIF,
                fontSize: 16,
                fontStyle: "italic",
                color: "#374151",
                lineHeight: 1.7,
              }}
            >
              &ldquo;{data.note.trim()}&rdquo;
            </div>
          </div>
        )}

        {/* Signature row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 26,
            gap: 12,
          }}
        >
          {/* Signature — left */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                fontFamily: CERT_SCRIPT,
                fontSize: 26,
                color: "#1b2d45",
                lineHeight: 1.1,
                marginBottom: 4,
              }}
            >
              Steven Maestas
            </div>
            <div style={{ height: 1, background: gold, marginBottom: 5 }} />
            <div
              style={{
                fontFamily: CERT_SANS,
                fontSize: 7,
                letterSpacing: "0.12em",
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Steven Maestas · Owner, HomeSHINE™
            </div>
          </div>

          {/* Seal — center */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "2px solid #1b2d45",
              background: "rgba(27, 45, 69, 0.05)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              gap: 1,
            }}
          >
            <div
              style={{
                fontFamily: CERT_SANS,
                fontSize: 6.5,
                letterSpacing: "0.1em",
                color: "#1b2d45",
                textTransform: "uppercase",
              }}
            >
              HOME
            </div>
            <div
              style={{
                fontFamily: CERT_SCRIPT,
                fontSize: 13,
                color: "#1b2d45",
                lineHeight: 1,
              }}
            >
              Shine
            </div>
            <div style={{ color: gold, fontSize: 9 }}>✦</div>
          </div>

          {/* Date — right */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                fontFamily: CERT_SERIF,
                fontSize: 19,
                fontWeight: 700,
                color: "#1b2d45",
                lineHeight: 1.2,
                marginBottom: 4,
              }}
            >
              {formattedDate || "—"}
            </div>
            <div style={{ height: 1, background: gold, marginBottom: 5 }} />
            <div
              style={{
                fontFamily: CERT_SANS,
                fontSize: 7,
                letterSpacing: "0.12em",
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Date of Service
            </div>
          </div>
        </div>
      </div>

      {/* Gold rule before footer */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${gold} 20%, #e8c84a 50%, ${gold} 80%, transparent 100%)`,
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* ── BOTTOM BAND ── */}
      <div
        style={{
          background: "linear-gradient(180deg, #243650 0%, #1b2d45 100%)",
          padding: "12px 34px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: CERT_SANS,
            fontSize: 9,
            color: "#c6d3df",
            letterSpacing: "0.06em",
            lineHeight: 1.35,
          }}
        >
          HomeSHINE™ · Vermont · homeshinevt.com · 802-391-9977
        </div>
        <div
          style={{
            fontFamily: CERT_SANS,
            fontSize: 9,
            color: "#94a3b8",
            letterSpacing: "0.08em",
          }}
        >
          {certNum}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CertificatePage() {
  const [form, setForm] = useState<FormData>({
    ownerName: "",
    address: "",
    serviceDate: todayISO(),
    services: [],
    plan: "",
    note: "",
  });
  const [certNum, setCertNum] = useState("");
  const [showCert, setShowCert] = useState(false);

  useEffect(() => {
    if (showCert) {
      document.body.classList.add("hs-cert-active");
    } else {
      document.body.classList.remove("hs-cert-active");
    }
    return () => document.body.classList.remove("hs-cert-active");
  }, [showCert]);

  function toggleService(name: string) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(name)
        ? f.services.filter((s) => s !== name)
        : [...f.services, name],
    }));
  }

  function handleGenerate() {
    setCertNum(genCertNum());
    setShowCert(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "2px solid var(--line)",
    borderRadius: 14,
    padding: "14px",
    fontSize: 18,
    background: "var(--paper)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 8,
    color: "var(--ink)",
  };

  const navPillStyle: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,.35)",
    borderRadius: 14,
    background: "rgba(255,255,255,.08)",
    color: "white",
    padding: "10px 16px",
    fontSize: 15,
    fontWeight: 700,
    textDecoration: "none",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <main style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 52 }}>
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--header) 0%, var(--header-2) 70%, #123622 100%)",
            color: "white",
            padding: "18px 20px",
            borderBottom: "4px solid var(--green)",
            boxShadow: "0 14px 32px rgba(16, 28, 43, 0.22)",
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
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <HomeShineLogo size={58} />
              <div>
                <div className="serif" style={{ fontSize: 24, fontWeight: 700 }}>
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
                  <Award size={13} style={{ flexShrink: 0 }} />
                  Certificate Generator
                </div>
              </div>
            </div>
            <Link href="/admin" style={navPillStyle}>
              ← Field App
            </Link>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "24px 18px", maxWidth: 700, margin: "0 auto" }}>
          <div
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)",
              border: "1px solid var(--line)",
              borderRadius: 24,
              boxShadow: "var(--shadow)",
              padding: "24px 22px",
            }}
          >
            <div className="serif" style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
              Certificate Generator
            </div>
            <div style={{ color: "var(--muted)", fontSize: 16, marginBottom: 26 }}>
              Fill in the details below, then generate a printable certificate to leave with the homeowner.
            </div>

            {/* Owner name */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Homeowner Full Name</label>
              <input
                value={form.ownerName}
                onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                placeholder="Jane Smith"
                style={inputStyle}
              />
            </div>

            {/* Address */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Property Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="123 Main St, Burlington, VT"
                style={inputStyle}
              />
            </div>

            {/* Date */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Service Date</label>
              <input
                type="date"
                value={form.serviceDate}
                onChange={(e) => setForm((f) => ({ ...f, serviceDate: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div style={{ height: 1, background: "var(--line)", marginBottom: 22 }} />

            {/* Services */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ ...labelStyle, marginBottom: 12 }}>Services Completed</label>
              <div style={{ display: "grid", gap: 8 }}>
                {SERVICES_LIST.map((s) => {
                  const checked = form.services.includes(s);
                  return (
                    <label
                      key={s}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: `2px solid ${checked ? "var(--green)" : "var(--line)"}`,
                        background: checked ? "var(--green-soft)" : "var(--paper)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(s)}
                        style={{ width: 18, height: 18, accentColor: "var(--green)", flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: checked ? 700 : 400,
                          color: "var(--ink)",
                        }}
                      >
                        {s}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ height: 1, background: "var(--line)", marginBottom: 22 }} />

            {/* Plan */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                  Plan Enrolled
                </span>{" "}
                <span style={{ fontSize: 14, color: "var(--muted)" }}>(optional)</span>
              </div>
              <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>
                Pick one if the homeowner signed up for a plan today.
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {PLANS.map((p) => {
                  const selected = form.plan === p.name;
                  return (
                    <label
                      key={p.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "14px 16px",
                        borderRadius: 14,
                        border: `2px solid ${selected ? "var(--green)" : "var(--line)"}`,
                        background: selected ? "var(--green-soft)" : "var(--paper)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <input
                          type="radio"
                          name="plan"
                          checked={selected}
                          onChange={() => setForm((f) => ({ ...f, plan: p.name }))}
                          style={{ width: 18, height: 18, accentColor: "var(--green)", flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: selected ? 700 : 400,
                            color: "var(--ink)",
                          }}
                        >
                          {p.name}
                        </span>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--green)", whiteSpace: "nowrap" }}>
                        {p.price}
                      </span>
                    </label>
                  );
                })}
              </div>
              {form.plan && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, plan: "" }))}
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    color: "var(--muted)",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Clear plan selection
                </button>
              )}
            </div>

            <div style={{ height: 1, background: "var(--line)", marginBottom: 22 }} />

            {/* Note */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                  Custom Note
                </span>{" "}
                <span style={{ fontSize: 14, color: "var(--muted)" }}>(optional)</span>
              </div>
              <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 10 }}>
                Shows up on the certificate as a quoted note.
              </div>
              <textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="e.g. Great working with you today — your home looks incredible."
                rows={3}
                style={{ ...inputStyle, fontSize: 16, resize: "vertical", lineHeight: 1.5 }}
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 16,
                background: "linear-gradient(180deg, #2f8455 0%, #2d7a4f 100%)",
                color: "white",
                padding: "18px 20px",
                fontSize: 20,
                fontWeight: 700,
                boxShadow: "0 10px 24px rgba(45, 122, 79, 0.28)",
              }}
            >
              Generate Certificate
            </button>
          </div>
        </div>
      </main>

      {/* Certificate overlay */}
      {showCert && (
        <div
          id="hs-cert-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8, 15, 26, 0.88)",
            zIndex: 1000,
            overflowY: "auto",
            padding: "20px 16px 48px",
          }}
        >
          {/* Toolbar */}
          <div
            className="hs-print-hide"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginBottom: 18,
              position: "sticky",
              top: 0,
              zIndex: 10,
              paddingTop: 4,
            }}
          >
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                border: "none",
                borderRadius: 14,
                background: "linear-gradient(180deg, #2f8455 0%, #2d7a4f 100%)",
                color: "white",
                padding: "12px 24px",
                fontSize: 16,
                fontWeight: 700,
                boxShadow: "0 8px 20px rgba(45, 122, 79, 0.35)",
              }}
            >
              🖨️ Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={() => setShowCert(false)}
              style={{
                border: "2px solid rgba(255,255,255,0.22)",
                borderRadius: 14,
                background: "rgba(255,255,255,0.07)",
                color: "white",
                padding: "12px 22px",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              ✕ Close
            </button>
          </div>

          <Certificate data={form} certNum={certNum} />
        </div>
      )}
    </>
  );
}
