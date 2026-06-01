import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        borderRadius: 38,
        background: "linear-gradient(145deg, #182638 0%, #1a3028 60%, #1d4030 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* Outer glow ring */}
      <div
        style={{
          position: "absolute",
          width: 112,
          height: 112,
          borderRadius: "50%",
          border: "1.5px solid rgba(47,125,80,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />

      {/* House icon */}
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
        {/* Roof */}
        <path
          d="M8 30 L32 10 L56 30"
          stroke="#2f7d50"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Walls */}
        <path
          d="M16 54 L16 28 L32 16 L48 28 L48 54"
          stroke="#ffffff"
          strokeWidth="3"
          fill="none"
          strokeLinejoin="round"
          opacity="0.9"
        />
        {/* Door */}
        <rect x="26" y="38" width="12" height="16" rx="1.5" fill="#2f7d50" opacity="0.85" />
        {/* Shine accent line */}
        <path
          d="M22 32 L42 32"
          stroke="#2f7d50"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      {/* HOMESHINE wordmark */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline",
          marginTop: 6,
          gap: 0,
        }}
      >
        <span
          style={{
            fontFamily: "serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.5px",
          }}
        >
          HOME
        </span>
        <span
          style={{
            fontFamily: "serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#2f7d50",
            letterSpacing: "-0.5px",
          }}
        >
          SHINE
        </span>
      </div>
    </div>,
    size
  );
}
