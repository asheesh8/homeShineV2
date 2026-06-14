"use client";

import {
  ArrowLeft, Plus, Trash2, Receipt, TrendingUp,
  DollarSign, Calendar, ChevronDown, ChevronUp, FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/field-app/ui";
import { type Assessment } from "@/lib/simple-field";
import { type Expense } from "@/app/api/expenses/route";

/* ── Vermont / Federal tax constants (2024 tax year) ─────────────────── */

// Federal income tax brackets — single filer
const FED_BRACKETS = [
  { rate: 0.10, up: 11600 },
  { rate: 0.12, up: 47150 },
  { rate: 0.22, up: 100525 },
  { rate: 0.24, up: 191950 },
  { rate: 0.32, up: 243725 },
  { rate: 0.35, up: 609350 },
  { rate: 0.37, up: Infinity },
];
const FED_STANDARD_DEDUCTION = 14600;

// Vermont income tax brackets — single filer
const VT_BRACKETS = [
  { rate: 0.0335, up: 45400 },
  { rate: 0.066,  up: 110050 },
  { rate: 0.076,  up: 229550 },
  { rate: 0.0875, up: Infinity },
];
const VT_STANDARD_DEDUCTION = 6350;

// Self-employment tax
const SE_TAX_RATE = 0.153;
const SE_INCOME_FACTOR = 0.9235; // net SE × 0.9235 = SE income subject to SE tax

// Quarterly estimated tax due dates (MM-DD)
const QUARTERS = [
  { label: "Q1", period: "Jan – Mar", due: "04-15", months: [0, 1, 2] },
  { label: "Q2", period: "Apr – May", due: "06-15", months: [3, 4] },
  { label: "Q3", period: "Jun – Aug", due: "09-15", months: [5, 6, 7] },
  { label: "Q4", period: "Sep – Dec", due: "01-15", months: [8, 9, 10, 11] }, // due Jan 15 next year
];

const EXPENSE_CATEGORIES = [
  "Fuel & Transportation",
  "Equipment & Tools",
  "Cleaning Supplies",
  "Insurance",
  "Marketing & Advertising",
  "Phone & Internet",
  "Professional Services",
  "Subcontractors",
  "Vehicle Maintenance",
  "Uniforms & Safety Gear",
  "Office & Admin",
  "Other",
];

/* ── helpers ──────────────────────────────────────────────────────────── */

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function moneyDec(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct(n: number) {
  return (n * 100).toFixed(1) + "%";
}

function calcBracketTax(income: number, brackets: typeof FED_BRACKETS) {
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (income <= prev) break;
    tax += (Math.min(income, b.up) - prev) * b.rate;
    prev = b.up;
  }
  return Math.max(0, tax);
}

function quarterDueDate(q: typeof QUARTERS[0], year: number): Date {
  const dueYear = q.label === "Q4" ? year + 1 : year;
  const [mo, dy] = q.due.split("-").map(Number);
  return new Date(dueYear, mo - 1, dy);
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* revenue from a single assessment */
function assessmentRevenue(a: Assessment): number {
  return a.checkout?.totalAmount ?? a.checkout?.planPrice ?? 0;
}

/* ──────────────────────────────────────────────────────────────────────── */

export function TaxScreen({
  assessments: initialAssessments,
  onBack,
}: {
  assessments: Assessment[];
  onBack: () => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);

  useEffect(() => { setAssessments(initialAssessments); }, [initialAssessments]);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExp, setLoadingExp] = useState(true);

  /* add-expense form */
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: isoDate(now),
    category: EXPENSE_CATEGORIES[0],
    description: "",
    amount: "",
  });
  const [submitting, setSubmitting] = useState(false);

  /* collapsible sections */
  const [showInvoices, setShowInvoices] = useState(false);
  const [showExpenseList, setShowExpenseList] = useState(true);

  /* filing status — affects standard deduction and brackets */
  const [filingStatus] = useState<"single" | "mfj">("single"); // MVP: single

  useEffect(() => {
    setLoadingExp(true);
    fetch(`/api/expenses?year=${year}`)
      .then(r => r.json())
      .then((d: Expense[] | { error: string }) => {
        if (Array.isArray(d)) setExpenses(d);
      })
      .catch(() => {})
      .finally(() => setLoadingExp(false));
  }, [year]);

  /* ── revenue calculation ── */
  const yearPrefix = String(year);

  // All completed/signed assessments for this year with checkout data
  const yearJobs = assessments.filter(a => {
    const co = a.checkout;
    if (!co) return false;
    const d = a.booking?.date ?? a.updatedAt ?? a.createdAt;
    return d?.startsWith(yearPrefix);
  });

  // Revenue by period
  function revenueForMonths(months: number[]) {
    return yearJobs
      .filter(a => {
        const d = a.booking?.date ?? a.updatedAt ?? a.createdAt ?? "";
        const mo = parseInt(d.slice(5, 7), 10) - 1;
        return months.includes(mo);
      })
      .reduce((sum, a) => sum + assessmentRevenue(a), 0);
  }

  const totalRevenue = yearJobs.reduce((s, a) => s + assessmentRevenue(a), 0);

  // MTD
  const mtdMonths = [now.getMonth()];
  const mtdRevenue = year === now.getFullYear() ? revenueForMonths(mtdMonths) : 0;

  // QTD — find which quarter we're in
  const currentQ = QUARTERS.find(q => q.months.includes(now.getMonth())) ?? QUARTERS[0];
  const qtdRevenue = year === now.getFullYear() ? revenueForMonths(currentQ.months) : 0;

  /* ── expenses ── */
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // By category
  const expByCategory: Record<string, number> = {};
  for (const e of expenses) {
    expByCategory[e.category] = (expByCategory[e.category] ?? 0) + e.amount;
  }

  /* ── tax math ── */
  const netProfit = Math.max(0, totalRevenue - totalExpenses);
  const seIncome = netProfit * SE_INCOME_FACTOR;
  const seTax = seIncome * SE_TAX_RATE;
  const deductibleSE = seTax / 2;

  // Federal
  const fedStdDed = filingStatus === "mfj" ? 29200 : FED_STANDARD_DEDUCTION;
  const fedAGI = Math.max(0, netProfit - deductibleSE);
  const fedTaxableIncome = Math.max(0, fedAGI - fedStdDed);
  const fedIncomeTax = calcBracketTax(fedTaxableIncome, FED_BRACKETS);

  // Vermont
  const vtStdDed = filingStatus === "mfj" ? 12700 : VT_STANDARD_DEDUCTION;
  const vtTaxableIncome = Math.max(0, fedAGI - vtStdDed);
  const vtIncomeTax = calcBracketTax(vtTaxableIncome, VT_BRACKETS);

  const totalEstTax = seTax + fedIncomeTax + vtIncomeTax;
  const effectiveRate = netProfit > 0 ? totalEstTax / netProfit : 0;

  /* already paid via 1099 withholding — most self-employed pay $0 withheld */
  const withheld = 0;
  const amountOwed = Math.max(0, totalEstTax - withheld);
  const quarterlyPayment = amountOwed / 4;

  /* ── actions ── */
  async function addExpense() {
    if (!form.date || !form.description || !form.amount) return;
    setSubmitting(true);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    if (res.ok) {
      const created: Expense = await res.json();
      setExpenses(prev => [created, ...prev]);
      setForm({ date: isoDate(now), category: EXPENSE_CATEGORIES[0], description: "", amount: "" });
      setShowForm(false);
    }
    setSubmitting(false);
  }

  async function deleteExpense(id: string) {
    const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    if (res.ok) setExpenses(prev => prev.filter(e => e.id !== id));
  }

  async function deleteJob(id: string) {
    setDeletingJobId(id);
    const res = await fetch(`/api/assessments/${id}`, { method: "DELETE" });
    if (res.ok) setAssessments(prev => prev.filter(a => a.id !== id));
    setDeletingJobId(null);
  }

  async function saveJobAmount(a: Assessment) {
    const parsed = parseFloat(editAmount);
    if (isNaN(parsed) || parsed < 0) return;
    const updated: Assessment = {
      ...a,
      checkout: { ...a.checkout!, totalAmount: parsed, planPrice: parsed },
    };
    const res = await fetch(`/api/assessments/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessment: updated }),
    });
    if (res.ok) {
      setAssessments(prev => prev.map(x => x.id === a.id ? updated : x));
    }
    setEditingJobId(null);
  }

  const todayStr = isoDate(now);

  return (
    <div className="hs-tax-screen">
      {/* Header */}
      <div className="hs-cal-screen-header">
        <button type="button" className="hs-cal-back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={16} /> Pipeline
        </button>
        <div>
          <h2 className="hs-cal-screen-title">Tax Center</h2>
          <p className="hs-cal-screen-sub">HomeSHINE · Essex Junction, VT · Business finances</p>
        </div>
        {/* Year selector */}
        <div className="hs-tax-year-sel">
          <button type="button" onClick={() => setYear(y => y - 1)} className="hs-cal-nav" style={{ padding: "4px 8px" }}>‹</button>
          <strong>{year}</strong>
          <button type="button" onClick={() => setYear(y => Math.min(y + 1, now.getFullYear()))} className="hs-cal-nav" style={{ padding: "4px 8px" }} disabled={year >= now.getFullYear()}>›</button>
        </div>
      </div>

      {/* ── Revenue summary cards ── */}
      <div className="hs-tax-cards">
        <div className="hs-tax-card is-primary">
          <p className="hs-tax-card-label"><TrendingUp size={11}/> YTD Revenue</p>
          <p className="hs-tax-card-value">{money(totalRevenue)}</p>
          <p className="hs-tax-card-sub">{yearJobs.length} job{yearJobs.length !== 1 ? "s" : ""} · {year}</p>
        </div>
        {year === now.getFullYear() && (
          <>
            <div className="hs-tax-card">
              <p className="hs-tax-card-label"><Calendar size={11}/> This Month</p>
              <p className="hs-tax-card-value">{money(mtdRevenue)}</p>
              <p className="hs-tax-card-sub">MTD</p>
            </div>
            <div className="hs-tax-card">
              <p className="hs-tax-card-label"><Calendar size={11}/> This Quarter</p>
              <p className="hs-tax-card-value">{money(qtdRevenue)}</p>
              <p className="hs-tax-card-sub">QTD · {currentQ.label}</p>
            </div>
          </>
        )}
        <div className="hs-tax-card">
          <p className="hs-tax-card-label"><Receipt size={11}/> Total Expenses</p>
          <p className="hs-tax-card-value" style={{ color: "#b45309" }}>{money(totalExpenses)}</p>
          <p className="hs-tax-card-sub">{expenses.length} entries</p>
        </div>
        <div className="hs-tax-card is-net">
          <p className="hs-tax-card-label"><DollarSign size={11}/> Net Profit</p>
          <p className="hs-tax-card-value" style={{ color: netProfit > 0 ? "var(--green)" : "#ef4444" }}>{money(netProfit)}</p>
          <p className="hs-tax-card-sub">Revenue − Expenses</p>
        </div>
      </div>

      {/* ── Tax estimate panel ── */}
      <div className="hs-tax-panel">
        <p className="hs-tax-panel-title">
          <FileText size={13}/> Estimated Tax Liability — {year}
          <span className="hs-tax-panel-badge">Vermont · Single Filer</span>
        </p>

        <div className="hs-tax-breakdown">
          <div className="hs-tax-line">
            <span>Gross Revenue</span>
            <span>{moneyDec(totalRevenue)}</span>
          </div>
          <div className="hs-tax-line is-sub">
            <span>Business Expenses</span>
            <span>− {moneyDec(totalExpenses)}</span>
          </div>
          <div className="hs-tax-line is-total">
            <span>Net Profit</span>
            <span>{moneyDec(netProfit)}</span>
          </div>

          <div className="hs-tax-divider"/>

          <div className="hs-tax-line">
            <span>Self-Employment Tax (15.3%)</span>
            <span>{moneyDec(seTax)}</span>
          </div>
          <div className="hs-tax-line is-sub">
            <span>½ SE deducted from AGI</span>
            <span>− {moneyDec(deductibleSE)}</span>
          </div>
          <div className="hs-tax-line is-sub">
            <span>Federal standard deduction</span>
            <span>− {moneyDec(fedStdDed)}</span>
          </div>
          <div className="hs-tax-line is-sub">
            <span>Federal taxable income</span>
            <span>{moneyDec(fedTaxableIncome)}</span>
          </div>
          <div className="hs-tax-line">
            <span>Federal Income Tax</span>
            <span>{moneyDec(fedIncomeTax)}</span>
          </div>

          <div className="hs-tax-divider"/>

          <div className="hs-tax-line is-sub">
            <span>VT standard deduction</span>
            <span>− {moneyDec(vtStdDed)}</span>
          </div>
          <div className="hs-tax-line is-sub">
            <span>Vermont taxable income</span>
            <span>{moneyDec(vtTaxableIncome)}</span>
          </div>
          <div className="hs-tax-line">
            <span>Vermont Income Tax</span>
            <span>{moneyDec(vtIncomeTax)}</span>
          </div>

          <div className="hs-tax-divider"/>

          <div className="hs-tax-line is-grand">
            <span>Total Estimated Tax</span>
            <span>{moneyDec(totalEstTax)}</span>
          </div>
          <div className="hs-tax-line is-sub">
            <span>Effective rate on net profit</span>
            <span>{pct(effectiveRate)}</span>
          </div>
        </div>

        <div className="hs-tax-disclaimer">
          * Estimates only. Based on {year} single-filer brackets (Federal + Vermont). Does not include other deductions, credits, or adjustments. Consult a CPA for your actual filing.
        </div>
      </div>

      {/* ── Quarterly estimated payments ── */}
      <div className="hs-tax-panel">
        <p className="hs-tax-panel-title"><Calendar size={13}/> Quarterly Estimated Payments</p>
        <p className="hs-tax-panel-sub" style={{ marginBottom: 12 }}>
          Suggested per quarter: <strong>{moneyDec(quarterlyPayment)}</strong> &nbsp;·&nbsp;
          Pay via IRS Direct Pay + VT myVTax
        </p>
        <div className="hs-tax-quarters">
          {QUARTERS.map(q => {
            const due = quarterDueDate(q, year);
            const dueStr = isoDate(due);
            const isPast = dueStr < todayStr;
            const isDueSoon = !isPast && dueStr <= isoDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
            const qRevenue = revenueForMonths(q.months);
            return (
              <div key={q.label} className={`hs-tax-quarter-card ${isPast ? "is-past" : isDueSoon ? "is-soon" : ""}`}>
                <div className="hs-tax-q-header">
                  <strong>{q.label}</strong>
                  <span className={`hs-tax-q-badge ${isPast ? "is-past" : isDueSoon ? "is-soon" : ""}`}>
                    {isPast ? "Past due" : isDueSoon ? "Due soon" : "Upcoming"}
                  </span>
                </div>
                <p className="hs-tax-q-period">{q.period} · Due {due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                <p className="hs-tax-q-rev">Revenue this period: {money(qRevenue)}</p>
                <p className="hs-tax-q-pay">Est. payment: <strong>{moneyDec(quarterlyPayment)}</strong></p>
              </div>
            );
          })}
        </div>
        <div className="hs-tax-pay-links">
          <a href="https://www.irs.gov/payments/direct-pay" target="_blank" rel="noopener" className="hs-tax-link-btn">
            IRS Direct Pay ↗
          </a>
          <a href="https://myvtax.vermont.gov/" target="_blank" rel="noopener" className="hs-tax-link-btn">
            VT myVTax ↗
          </a>
        </div>
      </div>

      {/* ── Expense tracker ── */}
      <div className="hs-tax-panel">
        <div className="hs-tax-panel-header">
          <button type="button" className="hs-tax-collapse-btn" onClick={() => setShowExpenseList(v => !v)}>
            <p className="hs-tax-panel-title" style={{ marginBottom: 0 }}>
              <Receipt size={13}/> Business Expenses
              <span className="hs-tax-panel-badge" style={{ background: "#fef3c7", color: "#b45309" }}>
                {expenses.length} entries · {money(totalExpenses)}
              </span>
            </p>
            {showExpenseList ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
          <Button type="button" onClick={() => setShowForm(v => !v)} style={{ padding: "6px 12px", fontSize: 12 }}>
            <Plus size={14}/> Add
          </Button>
        </div>

        {/* Add expense form */}
        {showForm && (
          <div className="hs-tax-exp-form">
            <div className="hs-tax-form-row">
              <label>Date
                <input type="date" className="hs-cal-date-input" value={form.date} max={isoDate(now)}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </label>
              <label>Amount ($)
                <input type="number" className="hs-cal-date-input" placeholder="0.00" step="0.01" min="0"
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </label>
            </div>
            <label>Category
              <select className="hs-cal-date-input" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>Description
              <input type="text" className="hs-cal-date-input" placeholder="e.g. Gas for job in Williston"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </label>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</Button>
              <Button type="button" onClick={addExpense} disabled={submitting || !form.description || !form.amount} style={{ flex: 1 }}>
                {submitting ? "Saving…" : "Save Expense"}
              </Button>
            </div>
          </div>
        )}

        {/* Category summary */}
        {Object.keys(expByCategory).length > 0 && (
          <div className="hs-tax-cat-summary">
            {Object.entries(expByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amt]) => (
                <div key={cat} className="hs-tax-cat-row">
                  <span>{cat}</span>
                  <span>{moneyDec(amt)}</span>
                </div>
              ))}
          </div>
        )}

        {/* Expense list */}
        {showExpenseList && (
          loadingExp ? (
            <p style={{ fontSize: 13, color: "var(--muted)", padding: "12px 0" }}>Loading…</p>
          ) : expenses.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)", padding: "12px 0" }}>No expenses logged for {year} yet.</p>
          ) : (
            <div className="hs-tax-exp-list">
              {expenses.map(e => (
                <div key={e.id} className="hs-tax-exp-row">
                  <div className="hs-tax-exp-info">
                    <strong>{e.description}</strong>
                    <span>{e.category} · {new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <span className="hs-tax-exp-amt">− {moneyDec(e.amount)}</span>
                  <button type="button" className="hs-tax-del-btn" onClick={() => deleteExpense(e.id)} aria-label="Delete">
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Invoice / job list ── */}
      <div className="hs-tax-panel">
        <button type="button" className="hs-tax-collapse-btn" onClick={() => setShowInvoices(v => !v)}>
          <p className="hs-tax-panel-title" style={{ marginBottom: 0 }}>
            <FileText size={13}/> Job Invoices — {year}
            <span className="hs-tax-panel-badge">{yearJobs.length} jobs · {money(totalRevenue)}</span>
          </p>
          {showInvoices ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>

        {showInvoices && (
          yearJobs.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)", padding: "12px 0" }}>No jobs with checkout data for {year}.</p>
          ) : (
            <div className="hs-tax-exp-list">
              {yearJobs
                .slice()
                .sort((a, b) => {
                  const da = a.booking?.date ?? a.updatedAt ?? a.createdAt ?? "";
                  const db = b.booking?.date ?? b.updatedAt ?? b.createdAt ?? "";
                  return db.localeCompare(da);
                })
                .map((a, i) => {
                  const dateStr = a.booking?.date ?? a.updatedAt ?? a.createdAt ?? "";
                  const date = dateStr
                    ? new Date(dateStr.slice(0, 10) + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—";
                  const rev = assessmentRevenue(a);
                  const planName = a.checkout?.planName ?? "Service";
                  const payOpt = a.checkout?.paymentOption === "deposit-monthly"
                    ? " (Financed)"
                    : a.checkout?.paymentOption === "full" ? " (Paid in full)" : "";
                  const isEditing = editingJobId === a.id;
                  return (
                    <div key={a.id} className="hs-tax-exp-row" style={{ flexWrap: "wrap", gap: 6 }}>
                      <div className="hs-tax-exp-info" style={{ flex: "1 1 60%" }}>
                        <strong>{a.owner.name}</strong>
                        <span>{planName}{payOpt} · {date} · {a.owner.city}</span>
                        <span style={{ fontSize: 10, color: "var(--muted)" }}>#{String(i + 1).padStart(3, "0")}</span>
                      </div>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input
                            type="number"
                            className="hs-cal-date-input"
                            style={{ width: 100, padding: "4px 8px", fontSize: 13 }}
                            value={editAmount}
                            step="0.01"
                            min="0"
                            autoFocus
                            onChange={e => setEditAmount(e.target.value)}
                          />
                          <button type="button" className="hs-tax-del-btn" style={{ color: "var(--green)" }} onClick={() => saveJobAmount(a)}>✓</button>
                          <button type="button" className="hs-tax-del-btn" onClick={() => setEditingJobId(null)}>✕</button>
                        </div>
                      ) : (
                        <span
                          className="hs-tax-exp-amt"
                          style={{ color: "var(--green)", cursor: "pointer" }}
                          title="Click to edit"
                          onClick={() => { setEditingJobId(a.id); setEditAmount(String(rev)); }}
                        >
                          {moneyDec(rev)}
                        </span>
                      )}
                      <button
                        type="button"
                        className="hs-tax-del-btn"
                        onClick={() => deleteJob(a.id)}
                        disabled={deletingJobId === a.id}
                        aria-label="Delete invoice"
                      >
                        {deletingJobId === a.id ? "…" : <Trash2 size={13} />}
                      </button>
                    </div>
                  );
                })}
            </div>
          )
        )}
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}
