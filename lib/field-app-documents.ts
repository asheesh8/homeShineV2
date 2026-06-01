import {
  type AiSummary,
  type Assessment,
  type FieldDefinition,
  type Owner,
  formatOwnerAddress,
  sectionDefinitions,
} from "@/lib/simple-field";
import { countDone, getCheckoutPlan, money, prettyLabel, statusLabel } from "@/components/field-app/utils";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderValue(field: FieldDefinition, value: string | number | boolean | undefined) {
  if (value === undefined || value === null || value === "") return "";
  if (field.kind === "toggle") return value ? "Yes" : "No";
  return escapeHtml(value);
}

/* ─── shared shell ─────────────────────────────────────────────────────── */

function shell(title: string, body: string, extraStyles = "") {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap');
    :root {
      --ink: #182638;
      --ink-2: #2d3f55;
      --muted: #64748b;
      --green: #2f7d50;
      --green-2: #256542;
      --green-soft: #e8f5ee;
      --line: #dbe4ee;
      --paper: #fffefb;
      --gold: #b5943a;
      --gold-soft: #fdf6e3;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; color: var(--ink); background: #edf2f7; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @media print { body { background: #fff; } }
    ${extraStyles}
  </style>
</head>
<body>${body}</body>
</html>`;
}

/* ─── shared helpers ───────────────────────────────────────────────────── */

function homeshineBadgeSvg(size = 64, light = false) {
  const fill = light ? "#ffffff" : "#182638";
  const shine = light ? "#7dd3fc" : "#2f7d50";
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="31" fill="${fill}" stroke="${shine}" stroke-width="2"/>
    <path d="M32 10 L52 24 L52 50 L12 50 L12 24 Z" fill="${shine}" opacity="0.15"/>
    <path d="M20 50 L20 30 L32 20 L44 30 L44 50" stroke="${shine}" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    <rect x="26" y="36" width="12" height="14" rx="1" fill="${shine}" opacity="0.6"/>
    <path d="M14 28 L32 14 L50 28" stroke="${shine}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="32" y="60" text-anchor="middle" font-family="'Inter',Arial,sans-serif" font-size="6" font-weight="700" fill="${shine}" letter-spacing="1">SHINE</text>
  </svg>`;
}

function ownerGrid(owner: Owner) {
  const fields = [
    ["Customer", owner.name],
    ["Phone", owner.phone],
    ["Email", owner.email],
    ["Address", formatOwnerAddress(owner)],
  ];
  return `<div class="info-grid">${fields
    .map(([label, value]) => `<div class="info-card"><div class="label">${label}</div><div class="value">${escapeHtml(value)}</div></div>`)
    .join("")}</div>`;
}

function aiSummaryBlock(aiSummary: AiSummary | null) {
  if (!aiSummary) return "";
  const steps = aiSummary.nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
  const sources = aiSummary.sources.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  return `
    <div class="section">
      <div class="section-label">AI Summary</div>
      <p class="body-text">${escapeHtml(aiSummary.summary)}</p>
      ${steps ? `<ul class="step-list">${steps}</ul>` : ""}
      ${sources ? `<ul class="ref-list">${sources}</ul>` : ""}
    </div>`;
}

function sectionsBlock(assessment: Assessment) {
  return sectionDefinitions
    .filter((section) => assessment.sections[section.id])
    .map((section) => {
      const values = assessment.sections[section.id] ?? {};
      const cards = section.fields
        .map((field) => {
          const value = renderValue(field, values[field.key]);
          if (!value) return "";
          return `<div class="info-card"><div class="label">${escapeHtml(prettyLabel(field))}</div><div class="value">${value}</div></div>`;
        })
        .join("");
      return `<div class="section"><div class="section-label">${escapeHtml(section.emoji)} ${escapeHtml(section.label)}</div><div class="info-grid">${cards || '<p class="muted">No details saved.</p>'}</div></div>`;
    })
    .join("");
}

function openPrintable(title: string, html: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function downloadPrintable(title: string, html: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/* ─── NOTES document ───────────────────────────────────────────────────── */

export function notesDocument(assessment: Assessment) {
  const styles = `
    .page { max-width: 860px; margin: 32px auto; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(24,38,56,.12); }
    .doc-header { background: linear-gradient(135deg, #182638 0%, #1d4030 100%); padding: 32px 36px; display: flex; align-items: center; gap: 20px; }
    .doc-header-text { color: #fff; }
    .doc-header-text .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 4px; }
    .doc-header-text h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 700; line-height: 1.1; color: #fff; }
    .doc-header-text .sub { font-size: 13px; color: rgba(255,255,255,.6); margin-top: 6px; }
    .doc-body { padding: 32px 36px; }
    .section { margin-bottom: 28px; }
    .section-label { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--green); margin-bottom: 12px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .info-card { border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; background: #fff; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 600; color: var(--ink); }
    .body-text { font-size: 14.5px; line-height: 1.65; color: var(--ink-2); background: #f8fafc; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
    .step-list, .ref-list { margin-top: 10px; padding-left: 18px; display: grid; gap: 6px; }
    .step-list li { font-size: 14px; color: var(--ink-2); line-height: 1.5; }
    .ref-list li { font-size: 13px; color: var(--muted); line-height: 1.5; }
    .divider { height: 1px; background: var(--line); margin: 4px 0 28px; }
    .muted { color: var(--muted); font-size: 14px; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } .doc-header, .doc-body { padding: 20px; } }
    @media print { body { background: #fff; } .page { box-shadow: none; border: none; border-radius: 0; margin: 0; } }
  `;

  const body = `
    <div class="page">
      <div class="doc-header">
        ${homeshineBadgeSvg(52, true)}
        <div class="doc-header-text">
          <div class="eyebrow">HomeSHINE Assessment</div>
          <h1>Assessment Notes</h1>
          <div class="sub">${escapeHtml(statusLabel(assessment.status))} · ${new Date(assessment.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
      </div>
      <div class="doc-body">
        <div class="section">${ownerGrid(assessment.owner)}</div>
        <div class="divider"></div>
        <div class="section">
          <div class="section-label">Main Writeup</div>
          <p class="body-text">${escapeHtml(assessment.writeup || "No writeup saved.")}</p>
        </div>
        ${aiSummaryBlock(assessment.aiSummary)}
        ${sectionsBlock(assessment)}
      </div>
    </div>`;

  return shell(`${assessment.owner.name} — Assessment Notes`, body, styles);
}

/* ─── RECEIPT document ─────────────────────────────────────────────────── */

export function receiptDocument(assessment: Assessment) {
  const plan = getCheckoutPlan(assessment.checkout?.planId);
  const styles = `
    .page { max-width: 860px; margin: 32px auto; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(24,38,56,.12); }
    .doc-header { background: linear-gradient(135deg, #182638 0%, #1d4030 100%); padding: 32px 36px; display: flex; align-items: center; gap: 20px; }
    .doc-header-text { color: #fff; }
    .doc-header-text .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 4px; }
    .doc-header-text h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 700; line-height: 1.1; color: #fff; }
    .doc-header-text .sub { font-size: 13px; color: rgba(255,255,255,.6); margin-top: 6px; }
    .doc-body { padding: 32px 36px; }
    .section { margin-bottom: 28px; }
    .section-label { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--green); margin-bottom: 12px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .info-card { border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; background: #fff; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 600; color: var(--ink); }
    .plan-banner { border-radius: 16px; padding: 24px 28px; background: linear-gradient(135deg, #182638 0%, #1d4030 100%); color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 28px; }
    .plan-name { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 26px; font-weight: 700; }
    .plan-label { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 4px; }
    .plan-desc { font-size: 13.5px; color: rgba(255,255,255,.7); margin-top: 6px; max-width: 420px; line-height: 1.5; }
    .plan-price { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 44px; font-weight: 700; white-space: nowrap; }
    .body-text { font-size: 14.5px; line-height: 1.65; color: var(--ink-2); background: #f8fafc; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
    .step-list, .ref-list { margin-top: 10px; padding-left: 18px; display: grid; gap: 6px; }
    .step-list li { font-size: 14px; color: var(--ink-2); line-height: 1.5; }
    .ref-list li { font-size: 13px; color: var(--muted); line-height: 1.5; }
    .divider { height: 1px; background: var(--line); margin: 4px 0 28px; }
    .muted { color: var(--muted); font-size: 14px; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } .doc-header, .doc-body { padding: 20px; } .plan-banner { flex-direction: column; } }
    @media print { body { background: #fff; } .page { box-shadow: none; border: none; border-radius: 0; margin: 0; } }
  `;

  const body = `
    <div class="page">
      <div class="doc-header">
        ${homeshineBadgeSvg(52, true)}
        <div class="doc-header-text">
          <div class="eyebrow">HomeSHINE Service Packet</div>
          <h1>Service Receipt</h1>
          <div class="sub">${countDone(assessment)} of ${sectionDefinitions.length} sections · ${new Date(assessment.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
      </div>
      <div class="doc-body">
        <div class="section">${ownerGrid(assessment.owner)}</div>
        <div class="divider"></div>
        ${plan ? `
          <div class="plan-banner">
            <div>
              <div class="plan-label">${escapeHtml(plan.label)}</div>
              <div class="plan-name">${escapeHtml(plan.name)}</div>
              <div class="plan-desc">${escapeHtml(plan.summary)}</div>
            </div>
            <div class="plan-price">${money(plan.price)}</div>
          </div>` : ""}
        ${aiSummaryBlock(assessment.aiSummary)}
        ${sectionsBlock(assessment)}
      </div>
    </div>`;

  return shell(`${assessment.owner.name} — Service Receipt`, body, styles);
}

/* ─── CHECKOUT SUMMARY document ────────────────────────────────────────── */

export function checkoutDocument(assessment: Assessment) {
  const plan = getCheckoutPlan(assessment.checkout?.planId);
  const styles = `
    .page { max-width: 780px; margin: 32px auto; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(24,38,56,.12); }
    .doc-header { background: linear-gradient(135deg, #182638 0%, #1d4030 100%); padding: 32px 36px; display: flex; align-items: center; gap: 20px; }
    .doc-header-text { color: #fff; }
    .doc-header-text .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 4px; }
    .doc-header-text h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 700; color: #fff; }
    .doc-header-text .sub { font-size: 13px; color: rgba(255,255,255,.6); margin-top: 6px; }
    .doc-body { padding: 32px 36px; }
    .section { margin-bottom: 28px; }
    .section-label { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--green); margin-bottom: 12px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .info-card { border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; background: #fff; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 600; color: var(--ink); }
    .plan-banner { border-radius: 16px; padding: 24px 28px; background: linear-gradient(135deg, #182638 0%, #1d4030 100%); color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
    .plan-name { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 26px; font-weight: 700; }
    .plan-label { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 4px; }
    .plan-desc { font-size: 13.5px; color: rgba(255,255,255,.7); margin-top: 6px; max-width: 380px; line-height: 1.5; }
    .plan-price { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 44px; font-weight: 700; white-space: nowrap; }
    .includes-list { display: grid; gap: 8px; }
    .includes-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--ink-2); line-height: 1.5; }
    .includes-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--green-soft); border: 1px solid #c6e6d3; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; font-size: 10px; color: var(--green); font-weight: 800; }
    .body-text { font-size: 14.5px; line-height: 1.65; color: var(--ink-2); background: #f8fafc; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
    .divider { height: 1px; background: var(--line); margin: 4px 0 28px; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } .doc-header, .doc-body { padding: 20px; } .plan-banner { flex-direction: column; } }
    @media print { body { background: #fff; } .page { box-shadow: none; border: none; border-radius: 0; margin: 0; } }
  `;

  const includesList = plan?.includes.map((item) =>
    `<div class="includes-item"><div class="includes-dot">✓</div><span>${escapeHtml(item)}</span></div>`
  ).join("") ?? "";

  const body = `
    <div class="page">
      <div class="doc-header">
        ${homeshineBadgeSvg(52, true)}
        <div class="doc-header-text">
          <div class="eyebrow">HomeSHINE Checkout</div>
          <h1>Checkout Summary</h1>
          <div class="sub">${plan ? escapeHtml(plan.label) : "No plan selected"} · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
      </div>
      <div class="doc-body">
        <div class="section">${ownerGrid(assessment.owner)}</div>
        <div class="divider"></div>
        ${plan ? `
          <div class="plan-banner">
            <div>
              <div class="plan-label">${escapeHtml(plan.label)}</div>
              <div class="plan-name">${escapeHtml(plan.name)}</div>
              <div class="plan-desc">${escapeHtml(plan.summary)}</div>
            </div>
            <div class="plan-price">${money(plan.price)}</div>
          </div>
          <div class="section">
            <div class="section-label">What's included</div>
            <div class="includes-list">${includesList}</div>
          </div>` : ""}
        <div class="section">
          <div class="section-label">Contract Note</div>
          <p class="body-text">${escapeHtml(assessment.checkout?.contractNote || "No note saved.")}</p>
        </div>
      </div>
    </div>`;

  return shell(`${assessment.owner.name} — Checkout Summary`, body, styles);
}

/* ─── CONTRACT document ────────────────────────────────────────────────── */

export function contractDocument(assessment: Assessment) {
  const plan = getCheckoutPlan(assessment.checkout?.planId);
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const styles = `
    .page { max-width: 780px; margin: 32px auto; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(24,38,56,.12); }
    .doc-header { background: linear-gradient(135deg, #182638 0%, #1d4030 100%); padding: 32px 36px; display: flex; align-items: center; gap: 20px; border-bottom: 4px solid var(--green); }
    .doc-header-text { color: #fff; }
    .doc-header-text .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 4px; }
    .doc-header-text h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 700; color: #fff; line-height: 1.1; }
    .doc-header-text .sub { font-size: 13px; color: rgba(255,255,255,.6); margin-top: 6px; }
    .doc-body { padding: 36px; }
    .section { margin-bottom: 30px; }
    .section-label { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--green); margin-bottom: 12px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .info-card { border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; background: #fff; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 600; color: var(--ink); }
    .plan-row { background: var(--green-soft); border: 1px solid #c6e6d3; border-radius: 12px; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; }
    .plan-row-name { font-size: 17px; font-weight: 700; color: var(--ink); }
    .plan-row-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--green); font-weight: 700; margin-bottom: 3px; }
    .plan-row-price { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 30px; font-weight: 700; color: var(--green-2); white-space: nowrap; }
    .body-text { font-size: 14.5px; line-height: 1.7; color: var(--ink-2); }
    .legal-text { font-size: 13px; line-height: 1.7; color: var(--ink-2); background: #f8fafc; border: 1px solid var(--line); border-radius: 10px; padding: 16px 18px; }
    .includes-list { display: grid; gap: 7px; }
    .includes-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--ink-2); line-height: 1.5; }
    .includes-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--green-soft); border: 1px solid #c6e6d3; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; font-size: 10px; color: var(--green); font-weight: 800; }
    .divider { height: 1px; background: var(--line); margin: 4px 0 30px; }
    .sig-block { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 8px; }
    .sig-box { border: 1px solid var(--line); border-radius: 12px; padding: 20px 18px; background: #fff; }
    .sig-name { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
    .sig-role { font-size: 12px; color: var(--muted); margin-bottom: 24px; }
    .sig-line { height: 1px; background: var(--ink-2); margin-bottom: 6px; }
    .sig-date-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
    .note-text { font-size: 14px; line-height: 1.65; color: var(--ink-2); background: #f8fafc; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
    @media (max-width: 600px) { .info-grid, .sig-block { grid-template-columns: 1fr; } .doc-header, .doc-body { padding: 20px; } .plan-row { flex-direction: column; align-items: flex-start; } }
    @media print { body { background: #fff; } .page { box-shadow: none; border: none; border-radius: 0; margin: 0; } }
  `;

  const includesList = plan?.includes.map((item) =>
    `<div class="includes-item"><div class="includes-dot">✓</div><span>${escapeHtml(item)}</span></div>`
  ).join("") ?? "";

  const body = `
    <div class="page">
      <div class="doc-header">
        ${homeshineBadgeSvg(52, true)}
        <div class="doc-header-text">
          <div class="eyebrow">HomeSHINE Agreement</div>
          <h1>Service Contract</h1>
          <div class="sub">Prepared ${escapeHtml(today)}</div>
        </div>
      </div>
      <div class="doc-body">

        <div class="section">
          <div class="section-label">Parties</div>
          ${ownerGrid(assessment.owner)}
        </div>
        <div class="divider"></div>

        ${plan ? `
        <div class="section">
          <div class="section-label">Selected Plan</div>
          <div class="plan-row">
            <div>
              <div class="plan-row-label">${escapeHtml(plan.label)}</div>
              <div class="plan-row-name">${escapeHtml(plan.name)}</div>
            </div>
            <div class="plan-row-price">${money(plan.price)}</div>
          </div>
          <div class="includes-list">${includesList}</div>
        </div>
        <div class="divider"></div>` : ""}

        <div class="section">
          <div class="section-label">Scope of Work</div>
          <p class="legal-text">${escapeHtml(plan?.summary ?? "Plan to be finalized after review.")}<br><br>
          All exterior surfaces will be treated using appropriate pressure, temperature, and cleaning solutions selected by HomeSHINE based on material type and condition. Scheduling will be coordinated directly with the homeowner prior to each visit. HomeSHINE reserves the right to adjust scope or timing due to weather or property access conditions, with advance notice provided.</p>
        </div>

        ${assessment.checkout?.contractNote ? `
        <div class="section">
          <div class="section-label">Access &amp; Scheduling Notes</div>
          <p class="note-text">${escapeHtml(assessment.checkout.contractNote)}</p>
        </div>` : ""}

        <div class="divider"></div>

        <div class="section">
          <div class="section-label">Signatures</div>
          <div class="sig-block">
            <div class="sig-box">
              <div class="sig-name">Homeowner</div>
              <div class="sig-role">${escapeHtml(assessment.owner.name)}</div>
              <div class="sig-line"></div>
              <div class="sig-date-label">Date</div>
            </div>
            <div class="sig-box">
              <div class="sig-name">HomeSHINE</div>
              <div class="sig-role">Steven Maestas, Owner</div>
              <div class="sig-line"></div>
              <div class="sig-date-label">Date</div>
            </div>
          </div>
        </div>

      </div>
    </div>`;

  return shell(`${assessment.owner.name} — Service Contract`, body, styles);
}

/* ─── DIPLOMA document ─────────────────────────────────────────────────── */

export function diplomaDocument(assessment: Assessment) {
  const plan = getCheckoutPlan(assessment.checkout?.planId);
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cinzel:wght@400;500;600;700&family=Dancing+Script:wght@600;700&display=swap');

    body { background: #1a1a1a; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 32px; }

    .cert-outer {
      width: 100%;
      max-width: 900px;
      aspect-ratio: 1.414 / 1;
      background: linear-gradient(145deg, #fffef9 0%, #fdf8ee 50%, #fffdf5 100%);
      border-radius: 6px;
      position: relative;
      box-shadow:
        0 0 0 1px #c9a84c,
        0 0 0 6px #f5f0e8,
        0 0 0 8px #c9a84c,
        0 0 0 14px #f5f0e8,
        0 0 0 15px #c9a84c,
        0 40px 100px rgba(0,0,0,.55),
        inset 0 0 80px rgba(201,168,76,.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 56px 72px;
      overflow: hidden;
    }

    /* Ornamental corner SVGs */
    .corner { position: absolute; width: 90px; height: 90px; opacity: .55; }
    .corner-tl { top: 18px; left: 18px; }
    .corner-tr { top: 18px; right: 18px; transform: scaleX(-1); }
    .corner-bl { bottom: 18px; left: 18px; transform: scaleY(-1); }
    .corner-br { bottom: 18px; right: 18px; transform: scale(-1,-1); }

    /* Background watermark badge */
    .watermark { position: absolute; opacity: .04; pointer-events: none; }

    .cert-top-rule { width: 80%; height: 2px; background: linear-gradient(90deg, transparent, #c9a84c 25%, #c9a84c 75%, transparent); margin-bottom: 20px; }
    .cert-bottom-rule { width: 80%; height: 2px; background: linear-gradient(90deg, transparent, #c9a84c 25%, #c9a84c 75%, transparent); margin-top: 20px; }

    .eyebrow {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: .28em;
      text-transform: uppercase;
      color: #c9a84c;
      margin-bottom: 12px;
      text-align: center;
    }

    .cert-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: clamp(22px, 4vw, 38px);
      font-weight: 700;
      color: #182638;
      text-align: center;
      letter-spacing: .04em;
      line-height: 1.1;
      margin-bottom: 18px;
    }

    .cert-subtitle {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(13px, 2vw, 17px);
      color: #4a5568;
      text-align: center;
      line-height: 1.5;
      margin-bottom: 22px;
      font-style: italic;
      max-width: 580px;
    }

    .badge-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      margin: 10px 0 18px;
    }

    .badge-seal {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: linear-gradient(145deg, #182638, #1d4030);
      border: 3px solid #c9a84c;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(201,168,76,.35), inset 0 1px 0 rgba(255,255,255,.08);
      flex-shrink: 0;
    }

    .recipient-block { text-align: center; }

    .presented-to {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: .2em;
      color: #c9a84c;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .recipient-name {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(28px, 5vw, 48px);
      font-weight: 700;
      color: #182638;
      line-height: 1.1;
    }

    .recipient-address {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(13px, 1.8vw, 16px);
      color: #64748b;
      margin-top: 4px;
      font-style: italic;
    }

    .plan-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: linear-gradient(135deg, #182638, #1d4030);
      color: #fff;
      border: 1px solid #c9a84c;
      border-radius: 999px;
      padding: 8px 18px;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .12em;
      text-transform: uppercase;
      margin: 14px 0 0;
      box-shadow: 0 4px 14px rgba(201,168,76,.2);
    }

    .sig-row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 20px;
      align-items: end;
      width: 80%;
      margin-top: 24px;
    }

    .sig-col { display: flex; flex-direction: column; align-items: center; gap: 5px; }

    .sig-script {
      font-family: 'Dancing Script', cursive;
      font-size: clamp(22px, 3vw, 30px);
      font-weight: 700;
      color: #182638;
      line-height: 1.1;
      text-align: center;
    }

    .sig-line-el { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, #c9a84c 20%, #182638 50%, #c9a84c 80%, transparent); }

    .sig-name-label {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: .15em;
      text-transform: uppercase;
      color: #64748b;
      text-align: center;
    }

    .sig-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 24px;
    }

    .sig-divider svg { opacity: .45; }

    .cert-date {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: .16em;
      color: #c9a84c;
      text-transform: uppercase;
      text-align: center;
      margin-top: 8px;
    }

    @media print {
      body { background: #fff; padding: 0; min-height: unset; }
      .cert-outer { max-width: 100%; aspect-ratio: auto; box-shadow: none; border: 2px solid #c9a84c; page-break-inside: avoid; }
    }
  `;

  const cornerSvg = `<svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 85 L5 20 Q5 5 20 5 L85 5" stroke="#c9a84c" stroke-width="1.5" fill="none"/>
    <path d="M5 75 L5 25 Q5 12 18 12 L75 12" stroke="#c9a84c" stroke-width="0.7" fill="none" opacity=".5"/>
    <circle cx="5" cy="5" r="3" fill="#c9a84c" opacity=".5"/>
    <path d="M5 5 Q14 5 14 14" stroke="#c9a84c" stroke-width="1" fill="none"/>
    <circle cx="20" cy="20" r="2" fill="none" stroke="#c9a84c" stroke-width="1" opacity=".6"/>
    <path d="M28 5 L28 18 L5 18" stroke="#c9a84c" stroke-width=".6" fill="none" opacity=".35"/>
  </svg>`;

  const fleurSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2 Q18 8 16 16 Q14 8 16 2Z" fill="#c9a84c" opacity=".7"/>
    <path d="M30 16 Q24 18 16 16 Q24 14 30 16Z" fill="#c9a84c" opacity=".7"/>
    <path d="M16 30 Q14 24 16 16 Q18 24 16 30Z" fill="#c9a84c" opacity=".7"/>
    <path d="M2 16 Q8 14 16 16 Q8 18 2 16Z" fill="#c9a84c" opacity=".7"/>
    <circle cx="16" cy="16" r="3" fill="#c9a84c"/>
    <path d="M16 5 Q18 10 16 16 Q14 10 16 5Z" fill="#c9a84c" opacity=".4" transform="rotate(45 16 16)"/>
    <path d="M16 5 Q18 10 16 16 Q14 10 16 5Z" fill="#c9a84c" opacity=".4" transform="rotate(135 16 16)"/>
  </svg>`;

  const badgeInnerSvg = `<svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 52 L20 30 L32 18 L44 30 L44 52" stroke="#c9a84c" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    <rect x="26" y="37" width="12" height="15" rx="1.5" fill="#c9a84c" opacity="0.5"/>
    <path d="M12 28 L32 12 L52 28" stroke="#c9a84c" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="32" cy="32" r="30" stroke="#c9a84c" stroke-width="1.5" fill="none" opacity=".3"/>
    <text x="32" y="61" text-anchor="middle" font-family="'Cinzel',serif" font-size="6.5" font-weight="600" fill="#c9a84c" letter-spacing="1.5">SHINE</text>
  </svg>`;

  const body = `
    <div class="cert-outer">

      <!-- corner ornaments -->
      <div class="corner corner-tl">${cornerSvg}</div>
      <div class="corner corner-tr">${cornerSvg}</div>
      <div class="corner corner-bl">${cornerSvg}</div>
      <div class="corner corner-br">${cornerSvg}</div>

      <!-- watermark -->
      <div class="watermark" style="top:50%;left:50%;transform:translate(-50%,-50%);">
        <svg width="360" height="360" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="31" stroke="#182638" stroke-width="1" fill="none"/>
          <path d="M20 52 L20 30 L32 18 L44 30 L44 52" stroke="#182638" stroke-width="2" fill="none" stroke-linejoin="round"/>
          <rect x="26" y="37" width="12" height="15" rx="1" fill="#182638"/>
          <path d="M12 28 L32 12 L52 28" stroke="#182638" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="cert-top-rule"></div>

      <div class="eyebrow">Certificate of Excellence</div>

      <div class="cert-title">HomeSHINE<br>Exterior Care Certificate</div>

      <div class="cert-subtitle">
        This certifies that the following property has received a professional HomeSHINE<br>exterior assessment and is enrolled in a certified care program.
      </div>

      <div class="badge-row">
        <div class="badge-seal">${badgeInnerSvg}</div>
        <div class="recipient-block">
          <div class="presented-to">Presented to</div>
          <div class="recipient-name">${escapeHtml(assessment.owner.name)}</div>
          <div class="recipient-address">${escapeHtml(formatOwnerAddress(assessment.owner))}</div>
          ${plan ? `<div class="plan-pill">★ &nbsp;${escapeHtml(plan.name)}</div>` : ""}
        </div>
        <div class="badge-seal">${badgeInnerSvg}</div>
      </div>

      <div class="cert-bottom-rule"></div>

      <!-- Signatures -->
      <div class="sig-row">
        <div class="sig-col">
          <div style="height:38px;"></div>
          <div class="sig-line-el"></div>
          <div class="sig-name-label">${escapeHtml(assessment.owner.name)}<br>Homeowner</div>
        </div>
        <div class="sig-divider">${fleurSvg}</div>
        <div class="sig-col">
          <div class="sig-script">Steven Maestas</div>
          <div class="sig-line-el"></div>
          <div class="sig-name-label">Steven Maestas<br>HomeSHINE, Owner</div>
        </div>
      </div>

      <div class="cert-date">Issued ${escapeHtml(today)}</div>

    </div>`;

  return shell(`${assessment.owner.name} — HomeSHINE Certificate`, body, styles);
}

/* ─── open / download helpers ──────────────────────────────────────────── */

export function openNotesDocument(assessment: Assessment) {
  openPrintable(`${assessment.owner.name} Notes`, notesDocument(assessment));
}

export function downloadNotesDocument(assessment: Assessment) {
  downloadPrintable(`${assessment.owner.name} Notes`, notesDocument(assessment));
}

export function openReceiptDocument(assessment: Assessment) {
  openPrintable(`${assessment.owner.name} Receipt`, receiptDocument(assessment));
}

export function downloadReceiptDocument(assessment: Assessment) {
  downloadPrintable(`${assessment.owner.name} Receipt`, receiptDocument(assessment));
}

export function openCheckoutDocument(assessment: Assessment) {
  openPrintable(`${assessment.owner.name} Checkout`, checkoutDocument(assessment));
}

export function openContractDocument(assessment: Assessment) {
  openPrintable(`${assessment.owner.name} Contract`, contractDocument(assessment));
}

export function openDiplomaDocument(assessment: Assessment) {
  openPrintable(`${assessment.owner.name} Diploma`, diplomaDocument(assessment));
}
