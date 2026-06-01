type HomeShineLogoProps = {
  size?: number;
};

export function HomeShineLogo({ size = 64 }: HomeShineLogoProps) {
  const glowSize = Math.round(size * 0.34);

  return (
    <div
      aria-label="HomeSHINE"
      role="img"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 38% 48%, rgba(255,255,255,.98) 0%, rgba(255,255,255,.32) 8%, transparent 19%), linear-gradient(145deg, #061018 0%, #111b24 46%, #030607 100%)",
        border: "2px solid rgba(255,255,255,.78)",
        boxShadow:
          "0 0 0 3px rgba(47,125,80,.34), 0 12px 28px rgba(0,0,0,.28), inset 0 0 18px rgba(125,211,252,.14)",
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: glowSize,
          height: glowSize,
          left: "31%",
          top: "34%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,.95), rgba(125,211,252,.38) 42%, transparent 72%)",
          filter: "blur(.4px)",
        }}
      />
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "relative", zIndex: 1 }}>
        <path
          d="M22 34 L50 14 L78 34"
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
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="29"
          fontWeight="700"
          letterSpacing="2"
        >
          HOME
        </text>
        <text
          x="50"
          y="76"
          textAnchor="middle"
          fill="#9dbbff"
          fontFamily="'Brush Script MT', 'Segoe Script', cursive"
          fontSize="26"
          fontWeight="700"
          style={{ filter: "drop-shadow(0 0 5px rgba(125, 211, 252, .65))" }}
        >
          Shine
        </text>
      </svg>
    </div>
  );
}
