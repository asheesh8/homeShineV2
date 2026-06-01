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

function shell(title: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; --ink:#182638; --muted:#65758b; --line:#dce5ef; --green:#2f7d50; --paper:#fffdf8; }
    * { box-sizing: border-box; }
    body { margin:0; padding:28px; font-family: Arial, Helvetica, sans-serif; color:var(--ink); background:#edf3f7; }
    main { max-width:900px; margin:0 auto; background:var(--paper); border:1px solid var(--line); border-radius:24px; padding:34px; box-shadow:0 24px 60px rgba(24,38,56,.12); }
    header { border-bottom:4px solid var(--green); padding-bottom:22px; margin-bottom:24px; }
    h1 { margin:0; font-family:Georgia, serif; font-size:38px; }
    h2 { margin:28px 0 12px; font-size:22px; }
    p { line-height:1.6; }
    .muted { color:var(--muted); }
    .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
    .card { border:1px solid var(--line); border-radius:14px; padding:14px; background:#fff; }
    .label { color:var(--muted); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; }
    .value { margin-top:5px; font-weight:700; }
    .writeup { white-space:pre-wrap; border:1px solid var(--line); border-radius:14px; padding:16px; background:#f8fafc; }
    .price { display:flex; justify-content:space-between; gap:20px; border-radius:18px; padding:18px; color:#fff; background:linear-gradient(135deg,#182638,#2f7d50); }
    .amount { font-size:34px; font-weight:800; font-family:Georgia, serif; }
    @media (max-width:680px) { body { padding:12px; } main { padding:22px; } .grid { grid-template-columns:1fr; } h1 { font-size:30px; } }
    @media print { body { background:#fff; padding:0; } main { box-shadow:none; border:none; border-radius:0; } }
  </style>
</head>
<body><main>${body}</main></body>
</html>`;
}

function ownerGrid(owner: Owner) {
  const fields = [
    ["Customer", owner.name],
    ["Phone", owner.phone],
    ["Email", owner.email],
    ["Address", formatOwnerAddress(owner)],
  ];

  return `<div class="grid">${fields
    .map(([label, value]) => `<div class="card"><div class="label">${label}</div><div class="value">${escapeHtml(value)}</div></div>`)
    .join("")}</div>`;
}

function aiSummaryBlock(aiSummary: AiSummary | null) {
  if (!aiSummary) return "";
  const steps = aiSummary.nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
  return `<h2>AI Summary</h2><div class="writeup">${escapeHtml(aiSummary.summary)}</div>${steps ? `<ul>${steps}</ul>` : ""}`;
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
          return `<div class="card"><div class="label">${escapeHtml(prettyLabel(field))}</div><div class="value">${value}</div></div>`;
        })
        .join("");
      return `<h2>${escapeHtml(section.label)}</h2><div class="grid">${cards || '<p class="muted">No details saved.</p>'}</div>`;
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

export function notesDocument(assessment: Assessment) {
  return shell(
    `${assessment.owner.name} Notes`,
    `<header><p class="muted">HomeSHINE Assessment</p><h1>Assessment Notes</h1><p>${statusLabel(assessment.status)} · ${new Date(assessment.updatedAt).toLocaleString()}</p></header>${ownerGrid(assessment.owner)}<h2>Main Writeup</h2><div class="writeup">${escapeHtml(assessment.writeup || "No writeup saved.")}</div>${aiSummaryBlock(assessment.aiSummary)}${sectionsBlock(assessment)}`
  );
}

export function receiptDocument(assessment: Assessment) {
  const plan = getCheckoutPlan(assessment.checkout?.planId);
  return shell(
    `${assessment.owner.name} Receipt`,
    `<header><p class="muted">HomeSHINE Receipt</p><h1>Service Packet</h1><p>${statusLabel(assessment.status)} · ${countDone(assessment)} of ${sectionDefinitions.length} sections saved</p></header>${ownerGrid(assessment.owner)}${plan ? `<h2>Selected Plan</h2><div class="price"><div><strong>${escapeHtml(plan.name)}</strong><p>${escapeHtml(plan.summary)}</p></div><div class="amount">${money(plan.price)}</div></div>` : ""}${aiSummaryBlock(assessment.aiSummary)}${sectionsBlock(assessment)}`
  );
}

export function checkoutDocument(assessment: Assessment) {
  const plan = getCheckoutPlan(assessment.checkout?.planId);
  return shell(
    `${assessment.owner.name} Checkout`,
    `<header><p class="muted">HomeSHINE Checkout</p><h1>Checkout Summary</h1><p>${plan ? escapeHtml(plan.label) : "No plan selected"}</p></header>${ownerGrid(assessment.owner)}${plan ? `<div class="price"><div><strong>${escapeHtml(plan.name)}</strong><p>${escapeHtml(plan.summary)}</p></div><div class="amount">${money(plan.price)}</div></div><h2>Included</h2><ul>${plan.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}<h2>Contract Note</h2><div class="writeup">${escapeHtml(assessment.checkout?.contractNote || "No note saved.")}</div>`
  );
}

export function contractDocument(assessment: Assessment) {
  const plan = getCheckoutPlan(assessment.checkout?.planId);
  return shell(
    `${assessment.owner.name} Contract`,
    `<header><p class="muted">HomeSHINE Agreement Draft</p><h1>Service Agreement</h1><p>Prepared ${new Date().toLocaleDateString()}</p></header>${ownerGrid(assessment.owner)}<h2>Scope</h2><div class="writeup">${escapeHtml(plan?.summary ?? "Plan to be finalized after review.")}</div><h2>Selected Plan</h2><div class="card"><div class="value">${escapeHtml(plan?.name ?? "Not selected")} ${plan ? money(plan.price) : ""}</div></div><h2>Signatures</h2><div class="grid"><div class="card"><div class="label">Homeowner</div><br><br></div><div class="card"><div class="label">HomeSHINE</div><br><br></div></div>`
  );
}

export function diplomaDocument(assessment: Assessment) {
  const plan = getCheckoutPlan(assessment.checkout?.planId);
  return shell(
    `${assessment.owner.name} Diploma`,
    `<header><p class="muted">HomeSHINE Certified Exterior Care</p><h1>Certificate of Completion</h1><p>Prepared ${new Date().toLocaleDateString()}</p></header><h2>${escapeHtml(assessment.owner.name)}</h2><p class="muted">${escapeHtml(formatOwnerAddress(assessment.owner))}</p><div class="writeup">This property has completed a HomeSHINE assessment and is prepared for ${escapeHtml(plan?.name ?? "a HomeSHINE exterior care plan")}.</div>`
  );
}

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
