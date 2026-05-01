"use client";

import { useState } from "react";

// ─── Add or remove slides here ───────────────────────────────────────────────
// Photos go in public/promos/ — supported: .jpg .jpeg .png .webp .mp4
const slides: string[] = [
  "/promos/exterior-result.mp4",
  "/promos/steven-cleaning.jpeg",
  "/promos/trucks.jpeg",
  "/promos/trucks2.jpeg",
];
// ─────────────────────────────────────────────────────────────────────────────

function isVideo(src: string) {
  return src.endsWith(".mp4") || src.endsWith(".mov") || src.endsWith(".webm");
}

export function PromosCarousel() {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  const arrowBtn: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "none",
    background: "rgba(27,45,69,0.60)",
    color: "white",
    fontSize: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2,
    backdropFilter: "blur(6px)",
    lineHeight: 1,
  };

  const current = slides[index];

  return (
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
      <div className="serif" style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        See What You Win
      </div>
      <div style={{ fontSize: 15, color: "var(--muted)", marginBottom: 16 }}>
        Steven's work — up close.
      </div>

      {/* Slide frame */}
      <div
        style={{
          position: "relative",
          borderRadius: 18,
          overflow: "hidden",
          background: "#0f172a",
        }}
      >
        {isVideo(current) ? (
          <video
            key={current}
            src={current}
            controls
            playsInline
            style={{
              width: "100%",
              height: 320,
              objectFit: "cover",
              display: "block",
              borderRadius: 18,
            }}
          />
        ) : (
          <img
            key={current}
            src={current}
            alt={`HomeSHINE promo ${index + 1}`}
            style={{
              width: "100%",
              height: 320,
              objectFit: "cover",
              display: "block",
              borderRadius: 18,
            }}
          />
        )}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous"
              style={{ ...arrowBtn, left: 10 }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              style={{ ...arrowBtn, right: 10 }}
            >
              ›
            </button>
          </>
        )}

        {/* Slide counter badge */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 14,
            background: "rgba(27,45,69,0.60)",
            backdropFilter: "blur(6px)",
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 999,
            padding: "4px 10px",
          }}
        >
          {index + 1} / {slides.length}
        </div>
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 14 }}>
          {slides.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                borderRadius: 999,
                border: "none",
                background: i === index ? "var(--green)" : "var(--border)",
                padding: 0,
                cursor: "pointer",
                transition: "width 0.2s, background 0.2s",
                position: "relative",
              }}
            >
              {/* small video icon on video slides */}
              {isVideo(src) && i === index && (
                <span
                  style={{
                    position: "absolute",
                    top: -18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 11,
                  }}
                >
                  ▶
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
