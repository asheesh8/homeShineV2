"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award } from "lucide-react";

const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Cinzel:wght@400;600;700&family=Dancing+Script:wght@400;600;700&display=swap');`;

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
  }
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
        maxWidth: 720,
        margin: "0 auto",
        background: "#faf8f3",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        position: "relative",
        overflow: "hidden",
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
          fontSize: 68,
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          color: "rgba(27, 45, 69, 0.042)",
          letterSpacing: "0.1em",
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
          padding: "22px 28px 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {/* Logo mark — left */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 100 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "#0d1a2a",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="30" height="26" viewBox="0 0 30 26" fill="none">
                <polygon
                  points="15,2 28,13 2,13"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <rect x="7" y="13" width="16" height="9" fill="none" stroke="white" strokeWidth="1.5" />
                <rect x="12" y="16" width="6" height="6" fill="white" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  color: "white",
                  lineHeight: 1,
                }}
              >
                HOME
              </div>
              <div
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: 19,
                  color: "#7dd3fc",
                  lineHeight: 1.1,
                }}
              >
                Shine
              </div>
            </div>
          </div>

          {/* Center title */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 9,
                letterSpacing: "0.26em",
                color: "#94a3b8",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              Certificate of Completion
            </div>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "white",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              EXTERIOR CARE
            </div>
            <div
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: 17,
                color: "#7dd3fc",
              }}
            >
              HomeSHINE™ Certified
            </div>
          </div>

          {/* Verified badge — right */}
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              border: `2px solid ${gold}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 7.5,
                letterSpacing: "0.14em",
                color: gold,
              }}
            >
              VERIFIED
            </div>
            <div style={{ color: gold, fontSize: 9, lineHeight: 1 }}>✦</div>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 6.5,
                letterSpacing: "0.1em",
                color: "white",
              }}
            >
              HOMESHINE™
            </div>
            <div
              style={{ fontFamily: "'Cinzel', serif", fontSize: 9, color: "#94a3b8" }}
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
      <div style={{ padding: "28px 32px 24px", position: "relative", zIndex: 1 }}>
        {/* Presented to */}
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
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
              minWidth: 280,
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 42,
                fontStyle: "italic",
                fontWeight: 600,
                color: "#1b2d45",
                lineHeight: 1,
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
              fontFamily: "'Cinzel', serif",
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
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 17,
              color: "#243650",
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
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 15,
            lineHeight: 1.85,
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
                fontFamily: "'Cinzel', serif",
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
                    fontFamily: "'Cinzel', serif",
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
                  fontFamily: "'Cinzel', serif",
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
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
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
                fontFamily: "'Cormorant Garamond', Georgia, serif",
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
                fontFamily: "'Cormorant Garamond', Georgia, serif",
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
                fontFamily: "'Dancing Script', cursive",
                fontSize: 30,
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
                fontFamily: "'Cinzel', serif",
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
              width: 68,
              height: 68,
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
                fontFamily: "'Cinzel', serif",
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
                fontFamily: "'Dancing Script', cursive",
                fontSize: 14,
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
                fontFamily: "'Dancing Script', cursive",
                fontSize: 22,
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
                fontFamily: "'Cinzel', serif",
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
          padding: "12px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            color: "#94a3b8",
            letterSpacing: "0.06em",
          }}
        >
          HomeSHINE™ · Vermont · homeshinevt.com · 802-391-9977
        </div>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            color: "#64748b",
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
    border: "2px solid var(--border)",
    borderRadius: 14,
    padding: "14px",
    fontSize: 18,
    background: "var(--white)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 8,
    color: "var(--navy)",
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
      <style dangerouslySetInnerHTML={{ __html: FONTS_CSS + PRINT_CSS }} />

      <main style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 52 }}>
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
                <Award size={13} style={{ flexShrink: 0 }} />
                Certificate Generator
              </div>
            </div>
            <Link href="/" style={navPillStyle}>
              ← Field App
            </Link>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "24px 18px", maxWidth: 700, margin: "0 auto" }}>
          <div
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)",
              border: "1px solid var(--border)",
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

            <div style={{ height: 1, background: "var(--border)", marginBottom: 22 }} />

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
                        border: `2px solid ${checked ? "var(--green)" : "var(--border)"}`,
                        background: checked ? "var(--green-light)" : "var(--white)",
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
                          color: "var(--navy)",
                        }}
                      >
                        {s}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border)", marginBottom: 22 }} />

            {/* Plan */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>
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
                        border: `2px solid ${selected ? "var(--green)" : "var(--border)"}`,
                        background: selected ? "var(--green-light)" : "var(--white)",
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
                            color: "var(--navy)",
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

            <div style={{ height: 1, background: "var(--border)", marginBottom: 22 }} />

            {/* Note */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>
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
