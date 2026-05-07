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
          "radial-gradient(circle at 38% 48%, rgba(255,255,255,.95) 0%, rgba(255,255,255,.30) 8%, transparent 18%), linear-gradient(145deg, #030808 0%, #0b1114 48%, #050607 100%)",
        border: "1px solid rgba(255,255,255,.14)",
        boxShadow: "0 12px 28px rgba(0,0,0,.22), inset 0 0 18px rgba(125,211,252,.10)",
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
