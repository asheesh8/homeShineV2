import {
  type Assessment,
  type FieldDefinition,
  type Owner,
  formatOwnerAddress,
  sectionDefinitions,
} from "@/lib/simple-field";
import { getCheckoutPlan, money, moneyDecimal, prettyLabel, TAX_RATE, calcTax, calcTotal, calcDepositMonthly } from "@/components/field-app/utils";

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

/* ─── NOTES document ───────────────────────────────────────────────────── */

export function notesDocument(assessment: Assessment) {
  const styles = `
    .page { max-width: 820px; margin: 32px auto; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(24,38,56,.12); }
    .doc-header { background: linear-gradient(135deg, #182638 0%, #1d4030 100%); padding: 28px 32px; display: flex; align-items: center; gap: 18px; }
    .doc-header-text { color: #fff; }
    .doc-header-text .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.5); margin-bottom: 3px; }
    .doc-header-text h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 700; line-height: 1.1; color: #fff; }
    .doc-header-text .sub { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 5px; }
    .doc-body { padding: 28px 32px; }
    .section { margin-bottom: 24px; }
    .section-label { font-size: 10.5px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--green); margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .info-card { border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; background: #fff; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-bottom: 3px; }
    .value { font-size: 14px; font-weight: 600; color: var(--ink); }
    .writeup-box { font-size: 14px; line-height: 1.7; color: var(--ink-2); background: #f8fafc; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
    .divider { height: 1px; background: var(--line); margin: 4px 0 24px; }
    .muted { color: var(--muted); font-size: 13px; }
    .section-row { display: flex; flex-direction: column; gap: 6px; }
    .field-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--line); }
    .field-row:last-child { border-bottom: none; }
    .field-key { font-size: 12.5px; color: var(--muted); }
    .field-val { font-size: 13px; font-weight: 600; color: var(--ink); text-align: right; max-width: 55%; }
    .section-header { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
    .section-card { border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; background: #fff; margin-bottom: 10px; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } .doc-header, .doc-body { padding: 18px; } }
    @media print { body { background: #fff; } .page { box-shadow: none; border: none; border-radius: 0; margin: 0; } }
  `;

  const sectionCards = sectionDefinitions
    .filter((sec) => assessment.sections[sec.id])
    .map((sec) => {
      const values = assessment.sections[sec.id] ?? {};
      const rows = sec.fields
        .map((field) => {
          if (field.kind === "dimension") {
            const l = values[field.lengthKey];
            const w = values[field.widthKey];
            if (!l && !w) return "";
            return `<div class="field-row"><span class="field-key">${escapeHtml(prettyLabel(field))}</span><span class="field-val">${l ?? "?"}ft × ${w ?? "?"}ft</span></div>`;
          }
          const value = renderValue(field, values[field.key]);
          if (!value) return "";
          return `<div class="field-row"><span class="field-key">${escapeHtml(prettyLabel(field))}</span><span class="field-val">${value}</span></div>`;
        })
        .join("");
      return rows
        ? `<div class="section-card"><div class="section-header">${escapeHtml(sec.emoji)} ${escapeHtml(sec.label)}</div>${rows}</div>`
        : "";
    })
    .join("");

  const body = `
    <div class="page">
      <div class="doc-header">
        ${homeshineBadgeSvg(48, true)}
        <div class="doc-header-text">
          <div class="eyebrow">HomeSHINE · Field Notes</div>
          <h1>${escapeHtml(assessment.owner.name)}</h1>
          <div class="sub">${escapeHtml(formatOwnerAddress(assessment.owner))} · ${new Date(assessment.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
      </div>
      <div class="doc-body">
        <div class="section">${ownerGrid(assessment.owner)}</div>
        <div class="divider"></div>
        ${assessment.writeup ? `<div class="section"><div class="section-label">Field Writeup</div><p class="writeup-box">${escapeHtml(assessment.writeup)}</p></div>` : ""}
        ${sectionCards ? `<div class="section"><div class="section-label">Section Details</div>${sectionCards}</div>` : ""}
      </div>
    </div>`;

  return shell(`${assessment.owner.name} — Field Notes`, body, styles);
}

/* ─── RECEIPT document ─────────────────────────────────────────────────── */

export function receiptDocument(assessment: Assessment) {
  const plan = getCheckoutPlan(assessment.checkout?.planId);
  const co = assessment.checkout;
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const invoiceNum = `HS-${assessment.id.slice(-6).toUpperCase()}`;
  const isDepositMonthly = co?.paymentOption === "deposit-monthly";
  const paymentLabel = isDepositMonthly ? "Deposit + Monthly" : "Pay in Full";

  /* ── price math — prefer stored amounts, fall back to live calc ── */
  const listPrice  = plan?.price ?? 0;
  const discount   = co?.discountAmount ?? 0;
  const discounted = listPrice - discount;
  const taxRate    = co?.taxRate     ?? TAX_RATE;
  const taxAmt     = co?.taxAmount   ?? (discounted * taxRate);
  const total      = co?.totalAmount ?? (discounted + taxAmt);

  /* ── deposit / monthly ── */
  const storedBreakdown = co?.depositAmount != null && co?.monthlyAmount != null && co?.months != null
    ? { depositAmount: co.depositAmount, monthlyAmount: co.monthlyAmount, months: co.months }
    : (plan && isDepositMonthly && plan.deposit != null ? calcDepositMonthly(plan) : null);

  const styles = `
    .page { max-width: 680px; margin: 32px auto; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(24,38,56,.12); }
    .doc-header { background: linear-gradient(135deg, #182638 0%, #1d4030 100%); padding: 28px 32px; display: flex; align-items: center; gap: 18px; }
    .doc-header-text { color: #fff; flex: 1; }
    .doc-header-text .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.5); margin-bottom: 3px; }
    .doc-header-text h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 700; color: #fff; }
    .doc-header-meta { text-align: right; color: rgba(255,255,255,.6); font-size: 12px; line-height: 1.8; }
    .doc-header-meta strong { display: block; color: #fff; font-size: 13px; }
    .doc-body { padding: 28px 32px; }
    .section { margin-bottom: 24px; }
    .section-label { font-size: 10.5px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--green); margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .info-card { border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; background: #fff; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-bottom: 3px; }
    .value { font-size: 14px; font-weight: 600; color: var(--ink); }
    .line-table { width: 100%; border-collapse: collapse; }
    .line-table th { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); padding: 0 0 8px; text-align: left; border-bottom: 1px solid var(--line); }
    .line-table th:last-child { text-align: right; }
    .line-table td { padding: 10px 0; border-bottom: 1px solid var(--line); font-size: 14px; color: var(--ink-2); vertical-align: top; }
    .line-table td:last-child { text-align: right; font-weight: 600; color: var(--ink); }
    .line-table tr.tax-row td { color: var(--muted); font-size: 13px; }
    .line-table tr.discount-row td { color: #b45309; font-size: 13.5px; background: #fffbeb; }
    .line-table tr.subtotal-row td { color: var(--muted); font-size: 13px; }
    .line-table tr.total-row td { border-top: 2px solid var(--ink); border-bottom: none; padding-top: 12px; font-weight: 800; color: var(--ink); font-size: 17px; }
    .line-name { font-weight: 700; color: var(--ink); margin-bottom: 2px; }
    .line-desc { font-size: 12.5px; color: var(--muted); }
    .payment-block { background: var(--green-soft); border: 1px solid #c6e6d3; border-radius: 12px; padding: 14px 18px; display: flex; flex-direction: column; gap: 8px; }
    .pay-method { display: flex; justify-content: space-between; align-items: center; }
    .pay-method .pay-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--green); }
    .pay-method .pay-val { font-size: 13px; font-weight: 600; color: var(--ink); }
    .pay-schedule { display: flex; flex-direction: column; gap: 4px; border-top: 1px solid #c6e6d3; padding-top: 10px; }
    .pay-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--ink-2); }
    .pay-row strong { color: var(--ink); font-weight: 700; }
    .pay-row.sub { font-size: 12px; color: var(--muted); }
    .divider { height: 1px; background: var(--line); margin: 4px 0 24px; }
    .footer { text-align: center; padding: 20px 32px; background: #f8fafc; border-top: 1px solid var(--line); }
    .footer p { font-size: 12.5px; color: var(--muted); line-height: 1.6; }
    .footer strong { color: var(--ink); }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } .doc-header { flex-direction: column; gap: 10px; } .doc-header-meta { text-align: left; } .doc-body { padding: 18px; } }
    @media print { body { background: #fff; } .page { box-shadow: none; border: none; border-radius: 0; margin: 0; } }
  `;

  const paymentScheduleHtml = storedBreakdown ? `
    <div class="pay-schedule">
      <div class="pay-row">
        <span>Deposit due today</span>
        <strong>${money(storedBreakdown.depositAmount)}</strong>
      </div>
      <div class="pay-row">
        <span>Monthly payment &times; ${storedBreakdown.months}</span>
        <strong>${moneyDecimal(storedBreakdown.monthlyAmount)}/mo</strong>
      </div>
      <div class="pay-row sub">
        <span>Remaining balance (${storedBreakdown.months} &times; ${moneyDecimal(storedBreakdown.monthlyAmount)})</span>
        <span>${moneyDecimal(storedBreakdown.monthlyAmount * storedBreakdown.months)}</span>
      </div>
    </div>` : "";

  const body = `
    <div class="page">
      <div class="doc-header">
        ${homeshineBadgeSvg(48, true)}
        <div class="doc-header-text">
          <div class="eyebrow">HomeSHINE · Service Receipt</div>
          <h1>Receipt</h1>
        </div>
        <div class="doc-header-meta">
          <strong>${escapeHtml(invoiceNum)}</strong>
          ${escapeHtml(today)}
        </div>
      </div>
      <div class="doc-body">
        <div class="section">${ownerGrid(assessment.owner)}</div>
        <div class="divider"></div>
        <div class="section">
          <div class="section-label">Services</div>
          <table class="line-table">
            <thead><tr><th>Description</th><th>Amount</th></tr></thead>
            <tbody>
              ${plan ? `
              <tr>
                <td>
                  <div class="line-name">${escapeHtml(plan.name)}</div>
                  <div class="line-desc">${escapeHtml(plan.label)} &middot; ${escapeHtml(plan.summary)}</div>
                </td>
                <td>${money(listPrice)}</td>
              </tr>
              ${discount > 0 ? `
              <tr class="discount-row">
                <td>
                  <div class="line-name" style="color:#b45309;">Discount${co?.discountNote ? ` — ${escapeHtml(co.discountNote)}` : ""}</div>
                </td>
                <td style="color:#b45309;">−${money(discount)}</td>
              </tr>
              <tr class="subtotal-row">
                <td style="color:var(--muted);font-size:13px;">Subtotal after discount</td>
                <td>${money(discounted)}</td>
              </tr>` : ""}
              <tr class="tax-row">
                <td>Tax (${Math.round(taxRate * 100)}%)</td>
                <td>${moneyDecimal(taxAmt)}</td>
              </tr>` : `<tr><td colspan="2" style="color:var(--muted);font-size:13px;padding:12px 0;">No plan selected.</td></tr>`}
            </tbody>
            ${plan ? `<tfoot><tr class="total-row"><td>Total</td><td>${moneyDecimal(total)}</td></tr></tfoot>` : ""}
          </table>
        </div>
        ${plan ? `
        <div class="section">
          <div class="section-label">Payment</div>
          <div class="payment-block">
            <div class="pay-method">
              <div class="pay-label">Method</div>
              <div class="pay-val">${escapeHtml(paymentLabel)}</div>
            </div>
            ${paymentScheduleHtml}
          </div>
        </div>` : ""}
      </div>
      <div class="footer">
        <p>Thank you for choosing <strong>HomeSHINE</strong>.<br>Questions? Contact us at <strong>steven@homeshinevt.com</strong> or call <strong>802-391-9977</strong>.</p>
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

    body {
      background: #1a1a1a;
      min-height: 100vh;
      padding: 28px 18px;
      overflow-x: hidden;
    }

    .cert-outer {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
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
      font-family: 'Inter', Arial, sans-serif;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .28em;
      text-transform: uppercase;
      color: #c9a84c;
      margin-bottom: 12px;
      text-align: center;
    }

    .cert-title {
      font-family: 'Libre Baskerville', Georgia, serif;
      font-size: clamp(22px, 4vw, 38px);
      font-weight: 700;
      color: #182638;
      text-align: center;
      letter-spacing: .04em;
      line-height: 1.1;
      margin-bottom: 18px;
    }

    .cert-subtitle {
      font-family: 'Libre Baskerville', Georgia, serif;
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
      font-family: 'Inter', Arial, sans-serif;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .2em;
      color: #c9a84c;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .recipient-name {
      font-family: 'Libre Baskerville', Georgia, serif;
      font-size: clamp(28px, 5vw, 48px);
      font-weight: 700;
      color: #182638;
      line-height: 1.1;
    }

    .recipient-address {
      font-family: 'Libre Baskerville', Georgia, serif;
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
      font-family: 'Inter', Arial, sans-serif;
      font-size: 11px;
      font-weight: 800;
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
      font-family: 'Libre Baskerville', Georgia, serif;
      font-size: clamp(18px, 2.5vw, 25px);
      font-style: italic;
      font-weight: 400;
      color: #182638;
      line-height: 1.1;
      text-align: center;
    }

    .sig-line-el { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, #c9a84c 20%, #182638 50%, #c9a84c 80%, transparent); }

    .sig-name-label {
      font-family: 'Inter', Arial, sans-serif;
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
      font-family: 'Inter', Arial, sans-serif;
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

    @media (max-width: 700px) {
      body {
        padding: 18px 10px 28px;
      }

      .cert-outer {
        width: calc(100vw - 20px);
        max-width: calc(100vw - 20px);
        aspect-ratio: auto;
        min-height: auto;
        padding: 30px 24px 28px;
        border-radius: 12px;
        justify-content: flex-start;
        box-shadow:
          0 0 0 1px #c9a84c,
          0 0 0 4px #f5f0e8,
          0 0 0 6px #c9a84c,
          0 18px 46px rgba(0,0,0,.45),
          inset 0 0 50px rgba(201,168,76,.05);
      }

      .corner {
        width: 62px;
        height: 62px;
      }

      .corner-tl { top: 12px; left: 12px; }
      .corner-tr { top: 12px; right: 12px; }
      .corner-bl { bottom: 12px; left: 12px; }
      .corner-br { bottom: 12px; right: 12px; }

      .watermark svg {
        width: 220px;
        height: 220px;
      }

      .cert-top-rule {
        margin-bottom: 14px;
      }

      .cert-title {
        font-size: 23px;
        margin-bottom: 12px;
      }

      .cert-subtitle {
        font-size: 13.5px;
        line-height: 1.45;
        margin-bottom: 16px;
      }

      .cert-subtitle br {
        display: none;
      }

      .badge-row {
        display: grid;
        grid-template-columns: 62px minmax(0, 1fr) 62px;
        gap: 10px;
        width: 100%;
      }

      .badge-seal {
        width: 62px;
        height: 62px;
      }

      .badge-seal svg {
        width: 44px;
        height: 44px;
      }

      .recipient-name {
        font-size: 30px;
        overflow-wrap: anywhere;
      }

      .recipient-address {
        font-size: 14px;
        overflow-wrap: anywhere;
      }

      .plan-pill {
        max-width: 100%;
        white-space: normal;
        text-align: center;
        justify-content: center;
        padding: 8px 12px;
        font-size: 9px;
      }

      .sig-row {
        width: 100%;
        gap: 10px;
        margin-top: 16px;
        grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr);
      }

      .sig-script {
        font-size: 20px;
      }

      .sig-name-label {
        font-size: 7.5px;
        letter-spacing: .08em;
      }

      .sig-divider {
        padding-bottom: 20px;
      }

      .cert-date {
        font-size: 8.5px;
        letter-spacing: .1em;
      }
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
    <text x="32" y="61" text-anchor="middle" font-family="'Inter',Arial,sans-serif" font-size="6.5" font-weight="800" fill="#c9a84c" letter-spacing="1.5">SHINE</text>
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

/* ─── FIELD REPORT (notes + AI summary) ───────────────────────────────── */

export function fieldReportDocument(assessment: Assessment) {
  const styles = `
    .page { max-width: 820px; margin: 32px auto; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(24,38,56,.12); }
    .doc-header { background: linear-gradient(135deg, #182638 0%, #1d4030 100%); padding: 28px 32px; display: flex; align-items: center; gap: 18px; }
    .doc-header-text { color: #fff; }
    .doc-header-text .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.5); margin-bottom: 3px; }
    .doc-header-text h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 700; line-height: 1.1; color: #fff; }
    .doc-header-text .sub { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 5px; }
    .doc-body { padding: 28px 32px; }
    .section { margin-bottom: 24px; }
    .section-label { font-size: 10.5px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--green); margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .info-card { border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; background: #fff; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-bottom: 3px; }
    .value { font-size: 14px; font-weight: 600; color: var(--ink); }
    .writeup-box { font-size: 14px; line-height: 1.7; color: var(--ink-2); background: #f8fafc; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
    .ai-box { font-size: 14px; line-height: 1.7; color: var(--ink-2); background: #f0faf4; border: 1px solid #c6e6d3; border-radius: 10px; padding: 14px 16px; }
    .step-list { margin-top: 10px; padding-left: 18px; display: grid; gap: 5px; }
    .step-list li { font-size: 13.5px; color: var(--ink-2); line-height: 1.5; }
    .ref-list { margin-top: 8px; padding-left: 18px; display: grid; gap: 4px; }
    .ref-list li { font-size: 12.5px; color: var(--muted); line-height: 1.5; }
    .divider { height: 1px; background: var(--line); margin: 4px 0 24px; }
    .section-card { border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; background: #fff; margin-bottom: 10px; }
    .section-header { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
    .field-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--line); }
    .field-row:last-child { border-bottom: none; }
    .field-key { font-size: 12.5px; color: var(--muted); }
    .field-val { font-size: 13px; font-weight: 600; color: var(--ink); text-align: right; max-width: 55%; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } .doc-header, .doc-body { padding: 18px; } }
    @media print { body { background: #fff; } .page { box-shadow: none; border: none; border-radius: 0; margin: 0; } }
  `;

  const sectionCards = sectionDefinitions
    .filter((sec) => assessment.sections[sec.id])
    .map((sec) => {
      const values = assessment.sections[sec.id] ?? {};
      const rows = sec.fields
        .map((field) => {
          if (field.kind === "dimension") {
            const l = values[field.lengthKey];
            const w = values[field.widthKey];
            if (!l && !w) return "";
            return `<div class="field-row"><span class="field-key">${escapeHtml(prettyLabel(field))}</span><span class="field-val">${l ?? "?"}ft × ${w ?? "?"}ft</span></div>`;
          }
          const value = renderValue(field, values[field.key]);
          if (!value) return "";
          return `<div class="field-row"><span class="field-key">${escapeHtml(prettyLabel(field))}</span><span class="field-val">${value}</span></div>`;
        })
        .join("");
      return rows
        ? `<div class="section-card"><div class="section-header">${escapeHtml(sec.emoji)} ${escapeHtml(sec.label)}</div>${rows}</div>`
        : "";
    })
    .join("");

  const aiBlock = assessment.aiSummary ? (() => {
    const steps = assessment.aiSummary!.nextSteps.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
    const refs = assessment.aiSummary!.sources.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
    return `
      <div class="section">
        <div class="section-label">AI Summary</div>
        <div class="ai-box">
          <p style="margin:0 0 4px;">${escapeHtml(assessment.aiSummary!.summary)}</p>
          ${steps ? `<ul class="step-list">${steps}</ul>` : ""}
          ${refs ? `<ul class="ref-list">${refs}</ul>` : ""}
        </div>
      </div>`;
  })() : "";

  const body = `
    <div class="page">
      <div class="doc-header">
        ${homeshineBadgeSvg(48, true)}
        <div class="doc-header-text">
          <div class="eyebrow">HomeSHINE · Field Report</div>
          <h1>${escapeHtml(assessment.owner.name)}</h1>
          <div class="sub">${escapeHtml(formatOwnerAddress(assessment.owner))} · ${new Date(assessment.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
      </div>
      <div class="doc-body">
        <div class="section">${ownerGrid(assessment.owner)}</div>
        <div class="divider"></div>
        ${assessment.writeup ? `<div class="section"><div class="section-label">Field Writeup</div><p class="writeup-box">${escapeHtml(assessment.writeup)}</p></div>` : ""}
        ${aiBlock}
        ${sectionCards ? `<div class="section"><div class="section-label">Section Details</div>${sectionCards}</div>` : ""}
      </div>
    </div>`;

  return shell(`${assessment.owner.name} — Field Report`, body, styles);
}

/* ─── CLIENT PACKET (receipt + contract combined) ──────────────────────── */

type TimelineStage = { label: string; when: string; detail: string };

const PLAN_TIMELINES: Record<string, TimelineStage[]> = {
  "shine-now": [
    { when: "Day of Service", label: "Full Exterior Reset", detail: "Our crew arrives and completes a top-to-bottom cleaning: gutters flushed and inspected, siding soft-washed, windows and screens hand-cleaned, walkways and deck treated. You'll receive a post-service summary before we leave." },
    { when: "Within 48 hours", label: "Completion Report", detail: "HomeSHINE sends a photo summary of completed work along with any observations noted during service — items to monitor, surfaces that may benefit from future treatment, or follow-up recommendations." },
  ],
  "protection": [
    { when: "Day 1", label: "Deep Exterior Clean", detail: "A full reset of every surface: gutters cleared, siding soft-washed, windows cleaned, walkways and deck treated, roof moss addressed. We document the baseline condition of your home so future visits can target what's actually changed." },
    { when: "Month 12", label: "Annual Maintenance Visit", detail: "A full walkthrough and targeted cleaning of surfaces that have accumulated seasonal buildup. Gutters re-cleared, siding and walkways touched up, windows spot-cleaned. We check against the Day 1 baseline and flag anything that needs extra attention." },
    { when: "Month 18", label: "Tune-Up &amp; Renewal Check", detail: "A lighter service focused on keeping everything looking sharp into the next season. Gutters flushed, high-traffic surfaces refreshed, and a written renewal recommendation so you know exactly what the next plan period should include." },
  ],
  "shine-ready": [
    { when: "Week 1", label: "Pre-Listing Assessment", detail: "A detailed walk of the property to document curb-appeal priorities. We identify what buyers and photographers will notice first, and scope the work to maximize visual impact within your timeline." },
    { when: "Week 2", label: "Curb Appeal Reset", detail: "Full exterior cleaning focused on first impressions: siding, windows, walkway, driveway, and any visible roof or gutter issues. Property is left in show-ready condition." },
    { when: "On Request", label: "Show-Day Touch-Up", detail: "Available before key showings or open houses. A quick refresh of the highest-visibility surfaces so the exterior looks its best on listing day and beyond." },
  ],
  "shine-renew": [
    { when: "Phase 1", label: "Assessment &amp; Restoration Plan", detail: "We walk the full property and document surface conditions in detail — staining, buildup, moss, oxidation, and structural concerns. A written restoration scope is prepared and reviewed with you before any work begins." },
    { when: "Phase 2", label: "Deep Restoration Service", detail: "Multi-day restoration addressing the most degraded surfaces first: roof treatment, heavy siding buildup, stained hardscape. Specialty solutions are used where standard soft-wash isn't enough." },
    { when: "Phase 3", label: "Final Renewal &amp; Maintenance Setup", detail: "Completion of remaining surfaces, a full post-service documentation, and setup of a recurring maintenance schedule to protect the restored work. You receive a before-and-after report and a recommended care calendar." },
  ],
};

export function clientPacketDocument(assessment: Assessment) {
  const plan = getCheckoutPlan(assessment.checkout?.planId);
  const co   = assessment.checkout;
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const invoiceNum = `HS-${assessment.id.slice(-6).toUpperCase()}`;
  const isDepositMonthly = co?.paymentOption === "deposit-monthly";
  const paymentLabel = isDepositMonthly ? "Deposit + Monthly" : "Pay in Full";
  const timeline: TimelineStage[] = plan ? (PLAN_TIMELINES[plan.id] ?? []) : [];

  /* ── price math — prefer stored amounts, fall back to live calc ── */
  const listPrice  = plan?.price ?? 0;
  const discount   = co?.discountAmount ?? 0;
  const discounted = listPrice - discount;
  const taxRate    = co?.taxRate     ?? TAX_RATE;
  const taxAmt     = co?.taxAmount   ?? (discounted * taxRate);
  const total      = co?.totalAmount ?? (discounted + taxAmt);
  const taxPct     = Math.round(taxRate * 100);

  /* ── deposit / monthly ── */
  const storedBreakdown = co?.depositAmount != null && co?.monthlyAmount != null && co?.months != null
    ? { depositAmount: co.depositAmount, monthlyAmount: co.monthlyAmount, months: co.months }
    : (plan && isDepositMonthly && plan.deposit != null ? calcDepositMonthly(plan) : null);
  const ai = assessment.aiSummary;
  const sources = Array.isArray(ai?.sources) && ai!.sources.length > 0 && typeof ai!.sources[0] === "object"
    ? (ai!.sources as import("@/lib/simple-field").AiSource[])
    : [];

  const styles = `
    .page { max-width: 720px; margin: 32px auto; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(24,38,56,.12); }
    .doc-header { background: linear-gradient(135deg, #182638 0%, #1d4030 100%); padding: 28px 32px; display: flex; align-items: center; gap: 18px; border-bottom: 3px solid var(--green); }
    .doc-header-text { color: #fff; flex: 1; }
    .doc-header-text .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.5); margin-bottom: 3px; }
    .doc-header-text h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 700; color: #fff; }
    .doc-header-meta { text-align: right; color: rgba(255,255,255,.6); font-size: 12px; line-height: 1.8; }
    .doc-header-meta strong { display: block; color: #fff; font-size: 13px; }
    .doc-body { padding: 28px 32px; }
    .section { margin-bottom: 24px; }
    .section-label { font-size: 10.5px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--green); margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .info-card { border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; background: #fff; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-bottom: 3px; }
    .value { font-size: 14px; font-weight: 600; color: var(--ink); }
    .plan-row { background: var(--green-soft); border: 1px solid #c6e6d3; border-radius: 12px; padding: 16px 18px; display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 14px; }
    .plan-row-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: .08em; color: var(--green); font-weight: 700; margin-bottom: 2px; }
    .plan-row-name { font-size: 17px; font-weight: 700; color: var(--ink); }
    .plan-row-price { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 30px; font-weight: 700; color: var(--green-2); white-space: nowrap; }
    .line-table { width: 100%; border-collapse: collapse; }
    .line-table th { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); padding: 0 0 8px; text-align: left; border-bottom: 1px solid var(--line); }
    .line-table th:last-child { text-align: right; }
    .line-table td { padding: 11px 0; border-bottom: 1px solid var(--line); font-size: 13.5px; color: var(--ink-2); vertical-align: top; }
    .line-table td:last-child { text-align: right; font-weight: 700; color: var(--ink); }
    .line-table tr.total td { border-top: 2px solid var(--ink); border-bottom: none; padding-top: 13px; font-weight: 700; color: var(--ink); font-size: 15px; }
    .line-table tr.tax-row td { color: var(--muted); font-size: 13px; }
    .line-table tr.discount-row td { color: #b45309; font-size: 13.5px; background: #fffbeb; }
    .line-table tr.subtotal-row td { color: var(--muted); font-size: 13px; }
    .line-name { font-weight: 700; color: var(--ink); margin-bottom: 2px; }
    .line-desc { font-size: 12px; color: var(--muted); }
    .payment-block { background: var(--green-soft); border: 1px solid #c6e6d3; border-radius: 12px; padding: 14px 18px; display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
    .pay-method { display: flex; justify-content: space-between; align-items: center; }
    .pay-method .pay-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--green); }
    .pay-method .pay-val { font-size: 13px; font-weight: 600; color: var(--ink); }
    .pay-schedule { display: flex; flex-direction: column; gap: 4px; border-top: 1px solid #c6e6d3; padding-top: 10px; }
    .pay-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--ink-2); }
    .pay-row strong { color: var(--ink); font-weight: 700; }
    .pay-row.sub { font-size: 12px; color: var(--muted); }
    .includes-list { display: grid; gap: 7px; margin-top: 4px; }
    .includes-item { display: flex; align-items: flex-start; gap: 9px; font-size: 13.5px; color: var(--ink-2); line-height: 1.5; }
    .includes-dot { width: 17px; height: 17px; border-radius: 50%; background: var(--green-soft); border: 1px solid #c6e6d3; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; font-size: 9px; color: var(--green); font-weight: 800; }
    .legal-text { font-size: 13px; line-height: 1.7; color: var(--ink-2); background: #f8fafc; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
    .note-text { font-size: 13.5px; line-height: 1.65; color: var(--ink-2); background: #f8fafc; border: 1px solid var(--line); border-radius: 10px; padding: 13px 15px; }
    .ai-summary-box { font-size: 14px; line-height: 1.75; color: var(--ink-2); background: #f0faf4; border: 1px solid #c6e6d3; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; }
    .next-steps-list { display: grid; gap: 8px; }
    .next-step-row { display: flex; align-items: flex-start; gap: 10px; }
    .next-step-num { min-width: 22px; height: 22px; border-radius: 50%; background: var(--green); color: #fff; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
    .next-step-text { font-size: 13.5px; color: var(--ink-2); line-height: 1.55; }
    .sources-grid { display: grid; gap: 10px; }
    .source-card { border: 1px solid var(--line); border-radius: 10px; padding: 13px 15px; background: #fff; }
    .source-domain { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--green); margin-bottom: 3px; }
    .source-title { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
    .source-quote { font-size: 12.5px; color: var(--ink-2); line-height: 1.6; border-left: 3px solid #c6e6d3; padding-left: 10px; font-style: italic; margin: 0; }
    .source-url { font-size: 11px; color: var(--muted); margin-top: 6px; word-break: break-all; }
    .timeline { display: grid; gap: 0; position: relative; }
    .timeline-item { display: grid; grid-template-columns: 52px 1fr; gap: 0; }
    .timeline-left { display: flex; flex-direction: column; align-items: center; }
    .timeline-badge { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #182638, #1d4030); border: 2px solid var(--green); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .timeline-badge-num { font-size: 12px; font-weight: 800; color: #fff; }
    .timeline-connector { width: 2px; flex: 1; min-height: 16px; background: linear-gradient(to bottom, var(--green), #c6e6d3); margin: 3px 0; }
    .timeline-item:last-child .timeline-connector { display: none; }
    .timeline-content { padding: 0 0 20px 14px; }
    .timeline-when { font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--green); margin-bottom: 2px; }
    .timeline-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 5px; line-height: 1.2; }
    .timeline-detail { font-size: 13px; color: var(--ink-2); line-height: 1.6; }
    .divider { height: 1px; background: var(--line); margin: 4px 0 24px; }
    .sig-block { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .sig-box { border: 1px solid var(--line); border-radius: 12px; padding: 18px 16px; background: #fff; }
    .sig-name { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
    .sig-role { font-size: 12px; color: var(--muted); margin-bottom: 22px; }
    .sig-line { height: 1px; background: var(--ink-2); margin-bottom: 5px; }
    .sig-date-label { font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
    .footer { text-align: center; padding: 18px 32px; background: #f8fafc; border-top: 1px solid var(--line); }
    .footer p { font-size: 12px; color: var(--muted); line-height: 1.6; }
    .footer strong { color: var(--ink); }
    @media (max-width: 600px) { .info-grid, .sig-block { grid-template-columns: 1fr; } .doc-header { flex-direction: column; gap: 10px; } .doc-header-meta { text-align: left; } .doc-body { padding: 18px; } .plan-row { flex-direction: column; align-items: flex-start; } }
    @media print { body { background: #fff; } .page { box-shadow: none; border: none; border-radius: 0; margin: 0; } }
  `;

  const includesList = plan?.includes.map((item) =>
    `<div class="includes-item"><div class="includes-dot">✓</div><span>${escapeHtml(item)}</span></div>`
  ).join("") ?? "";

  const timelineHtml = timeline.length > 0 ? `
    <div class="section">
      <div class="section-label">Service Timeline</div>
      <div class="timeline">
        ${timeline.map((stage, i) => `
          <div class="timeline-item">
            <div class="timeline-left">
              <div class="timeline-badge"><span class="timeline-badge-num">${i + 1}</span></div>
              <div class="timeline-connector"></div>
            </div>
            <div class="timeline-content">
              <div class="timeline-when">${stage.when}</div>
              <div class="timeline-title">${stage.label}</div>
              <div class="timeline-detail">${stage.detail}</div>
            </div>
          </div>`).join("")}
      </div>
    </div>
    <div class="divider"></div>` : "";

  const aiSummaryHtml = ai ? `
    <div class="section">
      <div class="section-label">Assessment Summary</div>
      <p class="ai-summary-box">${escapeHtml(ai.summary)}</p>
      ${(ai.nextSteps?.length ?? 0) > 0 ? `
      <div class="section-label" style="margin-top:14px;">What's Next for Your Home</div>
      <div class="next-steps-list">
        ${ai.nextSteps.map((step, i) => `
          <div class="next-step-row">
            <div class="next-step-num">${i + 1}</div>
            <p class="next-step-text">${escapeHtml(step)}</p>
          </div>`).join("")}
      </div>` : ""}
    </div>
    <div class="divider"></div>` : "";

  const sourcesHtml = sources.length > 0 ? `
    <div class="section">
      <div class="section-label">Research &amp; References</div>
      <div class="sources-grid">
        ${sources.map((s) => `
          <div class="source-card">
            <div class="source-domain">${escapeHtml(s.domain)}</div>
            <div class="source-title">${escapeHtml(s.title)}</div>
            <blockquote class="source-quote">${escapeHtml(s.quote)}</blockquote>
            <div class="source-url">${escapeHtml(s.url)}</div>
          </div>`).join("")}
      </div>
    </div>
    <div class="divider"></div>` : "";

  const body = `
    <div class="page">
      <div class="doc-header">
        ${homeshineBadgeSvg(48, true)}
        <div class="doc-header-text">
          <div class="eyebrow">HomeSHINE · Client Packet</div>
          <h1>${escapeHtml(assessment.owner.name)}</h1>
        </div>
        <div class="doc-header-meta">
          <strong>${escapeHtml(invoiceNum)}</strong>
          ${escapeHtml(today)}
        </div>
      </div>
      <div class="doc-body">

        <div class="section">${ownerGrid(assessment.owner)}</div>
        <div class="divider"></div>

        ${plan ? `
        <div class="section">
          <div class="section-label">Selected Plan</div>
          <div class="plan-row">
            <div>
              <div class="plan-row-label">${escapeHtml(plan.label)}</div>
              <div class="plan-row-name">${escapeHtml(plan.name)}</div>
            </div>
            <div class="plan-row-price">${moneyDecimal(total)}</div>
          </div>
          <table class="line-table">
            <thead><tr><th>Description</th><th>Amount</th></tr></thead>
            <tbody>
              <tr>
                <td>
                  <div class="line-name">${escapeHtml(plan.name)}</div>
                  <div class="line-desc">${escapeHtml(plan.summary)}</div>
                </td>
                <td>${money(listPrice)}</td>
              </tr>
              ${discount > 0 ? `
              <tr class="discount-row">
                <td><div class="line-name" style="color:#b45309;">Discount${co?.discountNote ? ` — ${escapeHtml(co.discountNote)}` : ""}</div></td>
                <td style="color:#b45309;">−${money(discount)}</td>
              </tr>
              <tr class="subtotal-row">
                <td style="color:var(--muted);font-size:13px;">Subtotal after discount</td>
                <td>${money(discounted)}</td>
              </tr>` : ""}
              <tr class="tax-row">
                <td>Tax (${taxPct}%)</td>
                <td>${moneyDecimal(taxAmt)}</td>
              </tr>
            </tbody>
            <tfoot><tr class="total"><td>Total</td><td>${moneyDecimal(total)}</td></tr></tfoot>
          </table>
          <div class="payment-block">
            <div class="pay-method">
              <div class="pay-label">Payment</div>
              <div class="pay-val">${escapeHtml(paymentLabel)}</div>
            </div>
            ${storedBreakdown ? `
            <div class="pay-schedule">
              <div class="pay-row">
                <span>Deposit due today</span>
                <strong>${money(storedBreakdown.depositAmount)}</strong>
              </div>
              <div class="pay-row">
                <span>Monthly payment &times; ${storedBreakdown.months}</span>
                <strong>${moneyDecimal(storedBreakdown.monthlyAmount)}/mo</strong>
              </div>
              <div class="pay-row sub">
                <span>Remaining balance (${storedBreakdown.months} &times; ${moneyDecimal(storedBreakdown.monthlyAmount)})</span>
                <span>${moneyDecimal(storedBreakdown.monthlyAmount * storedBreakdown.months)}</span>
              </div>
            </div>` : ""}
          </div>
        </div>
        ${includesList ? `
        <div class="section">
          <div class="section-label">What's Included</div>
          <div class="includes-list">${includesList}</div>
        </div>` : ""}
        <div class="divider"></div>
        <div class="section">
          <div class="section-label">Scope of Work</div>
          <p class="legal-text">${escapeHtml(plan.summary)}<br><br>
          All exterior surfaces will be treated using appropriate pressure, temperature, and cleaning solutions selected by HomeSHINE based on material type and condition. Scheduling will be coordinated directly with the homeowner prior to each visit. HomeSHINE reserves the right to adjust scope or timing due to weather or property access conditions, with advance notice provided.</p>
        </div>` : ""}

        ${timelineHtml}
        ${aiSummaryHtml}
        ${sourcesHtml}

        ${assessment.checkout?.contractNote ? `
        <div class="section">
          <div class="section-label">Access &amp; Scheduling Notes</div>
          <p class="note-text">${escapeHtml(assessment.checkout.contractNote)}</p>
        </div>
        <div class="divider"></div>` : ""}

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
      <div class="footer">
        <p>Thank you for choosing <strong>HomeSHINE</strong>. Questions? <strong>steven@homeshinevt.com</strong></p>
      </div>
    </div>`;

  return shell(`${assessment.owner.name} — Client Packet`, body, styles);
}
