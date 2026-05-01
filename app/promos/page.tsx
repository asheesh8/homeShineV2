import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { PromosCarousel } from "@/components/promos-carousel";

export const metadata: Metadata = {
  title: "Promotions | HomeSHINE",
  description: "Current HomeSHINE giveaways and promotions",
};

const entrySteps = [
  { emoji: "📱", text: "Post the giveaway video" },
  { emoji: "🏷️", text: "Tag @HomeSHINE" },
  { emoji: "💬", text: 'Comment "SHINE ME" on their page' },
];

const socials = [
  {
    label: "Instagram",
    handle: "@homeshinevt",
    href: "https://www.instagram.com/homeshinevt/",
    emoji: "📸",
    bg: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
    shadow: "rgba(131, 58, 180, 0.30)",
  },
  {
    label: "Facebook",
    handle: "HomeShine",
    href: "https://www.facebook.com/people/HomeShine/61568863209807/",
    emoji: "👍",
    bg: "linear-gradient(180deg, #1877f2 0%, #0c5ecb 100%)",
    shadow: "rgba(24, 119, 242, 0.30)",
  },
];

export default function PromosPage() {
  return (
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
              <Sparkles size={13} style={{ flexShrink: 0 }} />
              Promotions
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
        {/* Prize banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #1b2d45 0%, #1e5c3a 100%)",
            borderRadius: 28,
            padding: "34px 28px",
            marginBottom: 18,
            color: "white",
            boxShadow: "0 20px 44px rgba(27, 45, 69, 0.26)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(125, 211, 252, 0.07)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#7dd3fc",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Sparkles size={14} />
            Current Giveaway
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#a7f3d0", marginBottom: 8 }}>
            Prize
          </div>
          <div
            className="serif"
            style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.22, marginBottom: 18 }}
          >
            FREE Exterior Home Care &amp; Boat Package
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 999,
              padding: "8px 16px",
              fontSize: 15,
              color: "#e2e8f0",
            }}
          >
            🏆 Winner announced{" "}
            <strong style={{ color: "white", marginLeft: 2 }}>May 7th</strong>
          </div>
        </div>

        {/* Photo carousel */}
        <PromosCarousel />

        {/* How to enter */}
        <div
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            boxShadow: "0 12px 28px rgba(27, 45, 69, 0.1)",
            padding: "22px 22px 18px",
            marginBottom: 14,
          }}
        >
          <div className="serif" style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
            How to Enter
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {entrySteps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  background: i % 2 === 0 ? "#f8fafc" : "var(--green-light)",
                  borderRadius: 16,
                  border: `1px solid ${i % 2 === 0 ? "var(--border)" : "#b8e3c6"}`,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    background: "var(--green)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{step.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "var(--navy)" }}>
                  {step.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bonus entry */}
        <div
          style={{
            background: "linear-gradient(180deg, #fefce8 0%, #fef3c7 100%)",
            border: "1px solid #fde68a",
            borderRadius: 24,
            boxShadow: "0 10px 26px rgba(217, 119, 6, 0.13)",
            padding: "20px 22px",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--amber)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            ⭐ Bonus Entry
          </div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>
            Text{" "}
            <span
              style={{
                color: "var(--green)",
                background: "var(--green-light)",
                padding: "2px 10px",
                borderRadius: 8,
              }}
            >
              "SHINE NOW™"
            </span>
          </div>
          <div style={{ marginTop: 8, fontSize: 17, color: "var(--muted)" }}>
            to{" "}
            <a
              href="sms:8023919977&body=SHINE NOW"
              style={{ color: "var(--navy)", fontWeight: 700, fontSize: 20, textDecoration: "none" }}
            >
              802-391-9977
            </a>
          </div>
        </div>

        {/* Main CTAs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <a
            href="https://www.homeshinevt.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "linear-gradient(180deg, #2f8455 0%, #2d7a4f 100%)",
              color: "white",
              borderRadius: 18,
              padding: "18px 14px",
              fontSize: 17,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 10px 24px rgba(45, 122, 79, 0.28)",
            }}
          >
            🌐 HomeSHINEVT.com
          </a>
          <a
            href="sms:8023919977&body=SHINE NOW"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "linear-gradient(180deg, #f59e0b 0%, var(--amber) 100%)",
              color: "white",
              borderRadius: 18,
              padding: "18px 14px",
              fontSize: 17,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 10px 24px rgba(217, 119, 6, 0.28)",
            }}
          >
            📱 Text to Enter
          </a>
        </div>

        {/* Follow us on social */}
        <div
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            boxShadow: "0 12px 28px rgba(27, 45, 69, 0.1)",
            padding: "22px 22px 20px",
            marginBottom: 14,
          }}
        >
          <div className="serif" style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Follow Us
          </div>
          <div style={{ fontSize: 15, color: "var(--muted)", marginBottom: 16 }}>
            Share the giveaway &amp; tag us to get your entries counted.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: s.bg,
                  color: "white",
                  borderRadius: 18,
                  padding: "20px 14px",
                  textDecoration: "none",
                  boxShadow: `0 10px 24px ${s.shadow}`,
                }}
              >
                <div style={{ fontSize: 28 }}>{s.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{s.label}</div>
                <div style={{ fontSize: 13, opacity: 0.88 }}>{s.handle}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Hashtags */}
        <div
          style={{
            textAlign: "center",
            padding: "14px 20px",
            borderRadius: 18,
            border: "1px solid var(--border)",
            background: "var(--white)",
          }}
        >
          <div style={{ fontSize: 15, color: "var(--muted)", letterSpacing: "0.04em" }}>
            #HomeSHINE · #ShineMyHome · #Vermont
          </div>
        </div>
      </div>
    </main>
  );
}
