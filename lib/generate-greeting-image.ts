/**
 * Generates a personalized HomeShine greeting image using the Canvas API.
 * Draws: truck photo background → dark gradient → HomeShine logo → "Hey [Name]!" text.
 * Returns a File ready for navigator.share({ files: [...] }).
 */

function drawHomeShineLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;

  // Outer circle — dark background
  ctx.save();
  const bg = ctx.createRadialGradient(cx - r * 0.22, cy - r * 0.02, r * 0.05, cx, cy, r);
  bg.addColorStop(0, "#111b24");
  bg.addColorStop(1, "#030607");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();

  // White border
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.82)";
  ctx.lineWidth = size * 0.035;
  ctx.stroke();

  // Roof/home outline
  const roofY  = cy - r * 0.38;
  const baseY  = cy - r * 0.08;
  const leftX  = cx - r * 0.52;
  const rightX = cx + r * 0.52;
  ctx.beginPath();
  ctx.moveTo(leftX, baseY);
  ctx.lineTo(cx, roofY);
  ctx.lineTo(rightX, baseY);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = size * 0.07;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  // "HOME" text
  ctx.fillStyle = "#fff";
  ctx.font = `700 ${size * 0.22}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("HOME", cx, cy + r * 0.18);

  // "Shine" text
  ctx.fillStyle = "#9dbbff";
  ctx.font = `700 ${size * 0.20}px "Brush Script MT", cursive`;
  ctx.shadowColor = "rgba(125, 211, 252, 0.65)";
  ctx.shadowBlur = size * 0.08;
  ctx.fillText("Shine", cx, cy + r * 0.52);
  ctx.shadowBlur = 0;

  ctx.restore();
}

export async function generateGreetingImage(firstName: string): Promise<File> {
  const W = 1200;
  const H = 630;

  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── 1. Truck background ──
  const truckImg = new Image();
  truckImg.src = "/homeshine-truck.png";
  await new Promise<void>((resolve, reject) => {
    truckImg.onload  = () => resolve();
    truckImg.onerror = () => reject(new Error("Could not load truck image"));
  });

  // Cover-fit the image
  const scale = Math.max(W / truckImg.naturalWidth, H / truckImg.naturalHeight);
  const sw    = truckImg.naturalWidth  * scale;
  const sh    = truckImg.naturalHeight * scale;
  const sx    = (W - sw) / 2;
  const sy    = (H - sh) / 2;
  ctx.drawImage(truckImg, sx, sy, sw, sh);

  // ── 2. Gradient overlays ──
  // Top-to-bottom dark gradient (bottom heavier)
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,    "rgba(5,15,28,0.25)");
  grad.addColorStop(0.45, "rgba(5,15,28,0.10)");
  grad.addColorStop(1,    "rgba(5,15,28,0.80)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── 3. HomeShine logo top-left ──
  const logoSize = 110;
  const logoPad  = 32;
  drawHomeShineLogo(ctx, logoPad, logoPad, logoSize);

  // ── 4. "Hey [Name]! 👋" greeting bottom-left ──
  const textX = logoPad + 4;
  const textY = H - 80;

  ctx.textBaseline = "alphabetic";
  ctx.textAlign    = "left";

  // Shadow for legibility
  ctx.shadowColor  = "rgba(0,0,0,0.55)";
  ctx.shadowBlur   = 18;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = "#fff";
  ctx.font      = `800 ${H * 0.115}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillText(`Hey ${firstName}! 👋`, textX, textY);

  // Sub-line
  ctx.font      = `500 ${H * 0.055}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fillText("HomeShine — Thank you for choosing us", textX, textY + H * 0.085);

  ctx.shadowColor = "transparent";
  ctx.shadowBlur  = 0;

  // ── 5. Export ──
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
      "image/jpeg",
      0.92
    );
  });

  return new File([blob], `homeshine-${firstName.toLowerCase()}.jpg`, { type: "image/jpeg" });
}
