import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "linear-gradient(145deg, #182638 0%, #1d4030 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* House shape */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5V21H3V10.5z" fill="none" stroke="#2f7d50" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="9" y="14" width="6" height="7" rx="0.5" fill="#2f7d50" opacity="0.7" />
        <path d="M1 11L12 2l11 9" stroke="#2f7d50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>,
    size
  );
}
