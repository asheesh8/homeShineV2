"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, BarChart2, CreditCard, FileText, Lightbulb, Sparkles } from "lucide-react";
import { HomeShineLogo } from "@/components/homeshine-logo";

import {
  type AiSummary,
  type AppUser,
  type Assessment,
  type CheckoutData,
  type CheckoutPlanId,
  type Condition,
  type FieldDefinition,
  type Owner,
  type SectionDefinition,
  type SectionValue,
  appUsers,
  emptyOwner,
  formatOwnerAddress,
  makeAssessment,
  sectionReferenceMap,
  sectionDefinitions,
  stateOptions,
  townOptions,
} from "@/lib/simple-field";

const SESSION_KEY = "homeshine-simple-session-v1";

type View = "pipeline" | "owner" | "menu" | "section";
type Session = Pick<AppUser, "id" | "name" | "role">;
type LoginForm = { username: string; password: string };
type StatusFilter = "all" | Assessment["status"];
type ToastAction = { label: string; onClick: () => void };
type ToastState = {
  tone: "success" | "error";
  title: string;
  description: string;
  actions?: ToastAction[];
};
type DialogState = {
  title: string;
  body: string;
  tone: "error" | "confirm";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};
type CheckoutPlan = {
  id: CheckoutPlanId;
  emoji: string;
  name: string;
  price: number;
  label: string;
  summary: string;
  includes: string[];
  featured?: boolean;
};

const CHECKOUT_PLANS: CheckoutPlan[] = [
  {
    id: "shine-now",
    emoji: "✨",
    name: "SHINE NOW™",
    price: 2750,
    label: "One-time service",
    summary: "One full exterior reset for homeowners who want the home looking its best now.",
    includes: ["Gutters", "Siding", "Windows + screens", "Walkways", "Deck / patio"],
  },
  {
    id: "protection",
    emoji: "🛡️",
    name: "HomeSHINE Protection™",
    price: 3500,
    label: "18 months maintenance plan",
    summary: "Three scheduled care visits that protect the clean and prevent buildup from taking over again.",
    includes: ["Day 1 deep clean", "Month 12 maintenance", "Month 18 tune-up", "Priority scheduling", "$250 specialty credit"],
    featured: true,
  },
  {
    id: "shine-ready",
    emoji: "🏡",
    name: "SHINE Ready™",
    price: 5000,
    label: "Selling your home",
    summary: "Market-ready exterior care for curb appeal, showings, and listing confidence.",
    includes: ["Curb appeal reset", "Show-ready touch-ups", "Exterior care certificate", "Priority listing timeline"],
  },
  {
    id: "shine-renew",
    emoji: "💧",
    name: "SHINE Renew™",
    price: 7500,
    label: "Full restoration",
    summary: "A deeper renewal path for older, stained, or overgrown properties that need serious attention.",
    includes: ["Roof-to-curb restoration", "Renewal planning", "Specialty surface care", "Protection recommendations"],
  },
];

function normalizeAssessment(assessment: Assessment): Assessment {
  const legacyOwner = assessment.owner as {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    address?: string;
  };

  return {
    ...assessment,
    owner: {
      name: legacyOwner.name ?? "",
      street: String(legacyOwner.street ?? legacyOwner.address ?? ""),
      city: String(legacyOwner.city ?? ""),
      state: String(legacyOwner.state ?? "VT"),
      phone: legacyOwner.phone ?? "",
      email: legacyOwner.email ?? "",
    },
    writeup: assessment.writeup ?? "",
    aiSummary: assessment.aiSummary ?? null,
    checkout: assessment.checkout ?? null,
  };
}

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as Session;
}

async function fetchAssessmentsFromApi() {
  const response = await fetch("/api/assessments", { cache: "no-store" });
  const payload = (await response.json()) as Assessment[] | { error: string };

  if (!response.ok || !Array.isArray(payload)) {
    throw new Error(Array.isArray(payload) ? "Could not load assessments." : payload.error);
  }

  return payload.map(normalizeAssessment);
}

async function createAssessmentOnApi(assessment: Assessment) {
  const response = await fetch("/api/assessments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment }),
  });
  const payload = (await response.json()) as Assessment | { error: string };

  if (!response.ok || "error" in payload) {
    throw new Error("error" in payload ? payload.error : "Could not create assessment.");
  }

  return normalizeAssessment(payload);
}

async function updateAssessmentOnApi(assessment: Assessment) {
  const response = await fetch(`/api/assessments/${assessment.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment }),
  });
  const payload = (await response.json()) as Assessment | { error: string };

  if (!response.ok || "error" in payload) {
    throw new Error("error" in payload ? payload.error : "Could not save assessment.");
  }

  return normalizeAssessment(payload);
}

async function deleteAssessmentOnApi(id: string) {
  const response = await fetch(`/api/assessments/${id}`, {
    method: "DELETE",
  });
  const payload = (await response.json()) as { success?: boolean; error?: string };

  if (!response.ok || payload.success !== true) {
    throw new Error(payload.error ?? "Could not delete assessment.");
  }
}

function statusLabel(status: Assessment["status"]) {
  if (status === "draft") return "Draft";
  if (status === "ongoing") return "Ongoing";
  return "Finished";
}

function statusColor(status: Assessment["status"]) {
  if (status === "draft") return { bg: "#edf2f7", color: "#64748b" };
  if (status === "ongoing") return { bg: "#fef3c7", color: "#b45309" };
  return { bg: "#dcfce7", color: "#166534" };
}

function countDone(assessment: Assessment) {
  return sectionDefinitions.filter((section) => assessment.sections[section.id]).length;
}

function prettyLabel(field: FieldDefinition) {
  return field.emoji ? `${field.emoji} ${field.label}` : field.label;
}

function findUser(username: string, password: string) {
  return appUsers.find(
    (user) =>
      user.username.toLowerCase() === username.trim().toLowerCase() &&
      user.password === password
  );
}

function getMatches(query: string, options: readonly string[]) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [...options].slice(0, 8);
  return options.filter((option) => option.toLowerCase().includes(trimmed)).slice(0, 8);
}

function bigButtonStyle(color = "var(--green)") {
  return {
    border: "none",
    borderRadius: 18,
    background: color,
    color: "white",
    padding: "18px 20px",
    fontSize: 22,
    fontWeight: 700,
    boxShadow: "0 14px 30px rgba(27, 45, 69, 0.15)",
  } satisfies React.CSSProperties;
}

function outlineButtonStyle() {
  return {
    border: "2px solid var(--border)",
    borderRadius: 18,
    background: "var(--white)",
    color: "var(--navy)",
    padding: "16px 20px",
    fontSize: 20,
    fontWeight: 700,
  } satisfies React.CSSProperties;
}

function fieldStyle() {
  return {
    width: "100%",
    border: "2px solid var(--border)",
    borderRadius: 16,
    padding: "16px 14px",
    fontSize: 20,
    background: "var(--white)",
  } satisfies React.CSSProperties;
}

function documentLogoMarkup() {
  return `
    <div class="doc-logo" aria-label="HomeSHINE logo">
      <div class="doc-logo-roof"></div>
      <div class="doc-logo-home">HOME</div>
      <div class="doc-logo-shine">Shine</div>
      <div class="doc-logo-flare"></div>
    </div>
  `;
}

function documentHeroMarkup({
  eyebrow,
  title,
  subtitle,
  badge,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  badge: string;
  centered?: boolean;
}) {
  return `
    <div class="hero ${centered ? "hero-centered" : ""}">
      <div class="hero-grid">
        ${documentLogoMarkup()}
        <div class="hero-copy">
          <div class="brand">${eyebrow}</div>
          <h1>${title}</h1>
          <p class="muted">${subtitle}</p>
        </div>
        <div class="doc-badge">${badge}</div>
      </div>
    </div>
  `;
}

function createDocumentShell(title: string, content: string) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          :root {
            --navy: #1b2d45;
            --navy-2: #243650;
            --green: #2d7a4f;
            --green-soft: #e6f4ec;
            --gold: #c99731;
            --gold-soft: #fff7df;
            --paper: #fffdf7;
            --ink: #1b2d45;
            --muted: #64748b;
            --line: #dde4ed;
          }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 32px;
            font-family: Arial, Helvetica, sans-serif;
            color: var(--ink);
            background:
              radial-gradient(circle at top left, rgba(125, 211, 252, 0.18), transparent 25%),
              radial-gradient(circle at bottom right, rgba(201, 151, 49, 0.14), transparent 26%),
              linear-gradient(180deg, #eef4f7 0%, #f8fafc 100%);
          }
          .sheet {
            max-width: 940px;
            margin: 0 auto;
            background:
              linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,253,247,.98)),
              var(--paper);
            border-radius: 30px;
            padding: 42px;
            box-shadow: 0 26px 70px rgba(27, 45, 69, 0.14);
            overflow: hidden;
            border: 1px solid rgba(201, 151, 49, 0.36);
            position: relative;
          }
          .sheet:before {
            content: "HOMESHINE";
            position: absolute;
            inset: auto auto 60px -36px;
            transform: rotate(-18deg);
            font-family: Georgia, serif;
            font-size: 86px;
            letter-spacing: .12em;
            font-weight: 800;
            color: rgba(27, 45, 69, 0.035);
            pointer-events: none;
          }
          .hero {
            margin: -42px -42px 30px;
            padding: 28px 42px 26px;
            background:
              radial-gradient(circle at 25% 20%, rgba(125, 211, 252, 0.22), transparent 26%),
              linear-gradient(135deg, var(--navy) 0%, var(--navy-2) 58%, #1e5c3a 100%);
            border-bottom: 7px solid var(--gold);
            color: white;
            position: relative;
          }
          .hero-grid {
            display: grid;
            grid-template-columns: 88px minmax(0, 1fr) 128px;
            gap: 20px;
            align-items: center;
          }
          .hero-centered .hero-grid {
            grid-template-columns: 96px minmax(0, 1fr) 132px;
          }
          .doc-logo {
            width: 86px;
            height: 86px;
            border-radius: 50%;
            background:
              radial-gradient(circle at 46% 50%, rgba(255,255,255,.88) 0 4px, rgba(125,211,252,.42) 5px 12px, transparent 26px),
              linear-gradient(145deg, #05070a 0%, #131a20 48%, #030405 100%);
            position: relative;
            box-shadow: inset 0 1px 8px rgba(255,255,255,.15), 0 10px 24px rgba(0,0,0,.22);
            overflow: hidden;
          }
          .doc-logo:after {
            content: "";
            position: absolute;
            inset: 11px;
            border-radius: 50%;
            background: linear-gradient(120deg, rgba(255,255,255,.16), transparent 34%);
          }
          .doc-logo-roof {
            position: absolute;
            left: 19px;
            top: 18px;
            width: 48px;
            height: 26px;
            border-top: 7px solid #fff;
            border-left: 7px solid #fff;
            transform: rotate(45deg) skew(-7deg, -7deg);
            border-radius: 3px;
          }
          .doc-logo-home {
            position: absolute;
            top: 38px;
            left: 13px;
            right: 12px;
            color: white;
            font-family: Georgia, serif;
            font-weight: 700;
            font-size: 27px;
            letter-spacing: .08em;
            text-align: center;
          }
          .doc-logo-shine {
            position: absolute;
            left: 18px;
            right: 12px;
            bottom: 7px;
            color: #b9d5ff;
            font-family: "Brush Script MT", "Segoe Script", cursive;
            font-size: 27px;
            font-weight: 700;
            text-shadow: 0 0 12px rgba(125, 211, 252, .9);
          }
          .doc-logo-flare {
            position: absolute;
            width: 36px;
            height: 36px;
            left: 31px;
            top: 37px;
            background: radial-gradient(circle, rgba(255,255,255,.96) 0 8%, rgba(125,211,252,.55) 10% 34%, transparent 62%);
          }
          .hero-copy h1 {
            color: white;
            margin: 0 0 8px;
            font-family: Georgia, serif;
            font-size: 38px;
            line-height: 1.05;
          }
          .hero-copy p {
            color: #d8e3ee;
            margin: 0;
            line-height: 1.45;
          }
          .doc-badge {
            width: 118px;
            height: 118px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            text-align: center;
            color: white;
            font-weight: 800;
            font-size: 13px;
            line-height: 1.25;
            border: 2px solid rgba(255,255,255,.54);
            outline: 2px solid rgba(201,151,49,.72);
            outline-offset: -8px;
            background: rgba(255,255,255,.10);
            padding: 16px;
          }
          .brand {
            font-size: 13px;
            letter-spacing: .18em;
            text-transform: uppercase;
            font-weight: 800;
            color: #a7f3d0;
            margin-bottom: 10px;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 36px;
            font-family: Georgia, serif;
          }
          h2 {
            margin: 26px 0 10px;
            font-size: 22px;
            font-family: Georgia, serif;
          }
          p {
            margin: 6px 0;
            line-height: 1.55;
          }
          .muted {
            color: var(--muted);
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px 20px;
            margin-top: 16px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px 20px;
            margin-top: 16px;
          }
          .card {
            border: 1px solid var(--line);
            border-radius: 16px;
            padding: 14px 16px;
            background: rgba(248, 250, 252, .86);
          }
          .section {
            border-top: 1px solid var(--line);
            padding-top: 18px;
            margin-top: 18px;
            position: relative;
          }
          .field-label {
            font-size: 12px;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 4px;
          }
          .field-value {
            font-size: 16px;
            font-weight: 700;
          }
          .price-card {
            border-radius: 22px;
            padding: 20px;
            background: linear-gradient(160deg, var(--navy) 0%, #1e5c3a 100%);
            color: white;
            box-shadow: 0 16px 32px rgba(27, 45, 69, .18);
          }
          .price-card .amount {
            font-family: Georgia, serif;
            color: #7dd3fc;
            font-size: 38px;
            font-weight: 800;
            margin-top: 4px;
          }
          .pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border-radius: 999px;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 700;
            background: rgba(255,255,255,0.14);
            color: white;
          }
          .gold-pill {
            display: inline-flex;
            border-radius: 999px;
            padding: 7px 11px;
            color: #7c4f08;
            background: var(--gold-soft);
            border: 1px solid rgba(201,151,49,.35);
            font-size: 12px;
            font-weight: 800;
          }
          .writeup {
            margin-top: 12px;
            padding: 18px;
            border-radius: 16px;
            background: #f8fafc;
            border: 1px solid var(--line);
            white-space: pre-wrap;
          }
          .signature-row {
            display: grid;
            grid-template-columns: 1fr 120px 1fr;
            align-items: end;
            gap: 24px;
            margin-top: 34px;
          }
          .signature-line {
            border-top: 1px solid #94a3b8;
            padding-top: 10px;
            text-align: center;
            color: var(--muted);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .08em;
          }
          .script {
            font-family: "Brush Script MT", "Segoe Script", cursive;
            font-size: 28px;
            color: var(--navy);
            text-transform: none;
            letter-spacing: 0;
          }
          .seal {
            width: 118px;
            height: 118px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            text-align: center;
            margin: 0 auto;
            color: var(--navy);
            border: 2px solid var(--gold);
            outline: 1px solid rgba(27,45,69,.25);
            outline-offset: -8px;
            background:
              radial-gradient(circle, rgba(255,255,255,.96), rgba(255,247,223,.95));
            font-weight: 800;
            font-size: 12px;
            line-height: 1.3;
          }
          .list {
            display: grid;
            gap: 12px;
            margin-top: 16px;
          }
          .list-row {
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) minmax(0, .6fr);
            gap: 16px;
            align-items: start;
            border: 1px solid var(--line);
            border-radius: 16px;
            padding: 14px 16px;
            background: #f8fafc;
          }
          .total {
            margin-top: 22px;
            padding: 18px;
            border-radius: 18px;
            background: linear-gradient(180deg, #eef9f2 0%, #e6f4ec 100%);
            border: 1px solid #b8e3c6;
          }
          .total .amount {
            font-size: 28px;
            font-weight: 800;
          }
          .diploma {
            text-align: center;
            padding: 12px 8px 0;
            position: relative;
          }
          .diploma-frame {
            position: relative;
            min-height: 700px;
            padding: 46px 54px 38px;
            border: 8px double var(--gold);
            outline: 2px solid rgba(27,45,69,.72);
            outline-offset: -18px;
            background:
              radial-gradient(circle at center, rgba(255,255,255,.72), transparent 38%),
              linear-gradient(135deg, rgba(255,247,223,.78), rgba(255,255,255,.96) 34%, rgba(230,244,236,.5));
            overflow: hidden;
          }
          .diploma-frame:before,
          .diploma-frame:after {
            content: "";
            position: absolute;
            width: 92px;
            height: 92px;
            border: 3px solid rgba(201,151,49,.62);
            transform: rotate(45deg);
          }
          .diploma-frame:before {
            left: -46px;
            top: -46px;
          }
          .diploma-frame:after {
            right: -46px;
            bottom: -46px;
          }
          .diploma-watermark {
            position: absolute;
            inset: 190px 0 auto;
            text-align: center;
            font-family: Georgia, serif;
            font-size: 76px;
            font-weight: 800;
            letter-spacing: .18em;
            color: rgba(27,45,69,.045);
            pointer-events: none;
          }
          .diploma-top {
            display: flex;
            justify-content: center;
            margin-bottom: 18px;
          }
          .diploma-title {
            font-family: Georgia, serif;
            font-size: 42px;
            letter-spacing: .08em;
            text-transform: uppercase;
            margin: 8px 0 2px;
            color: var(--navy);
          }
          .diploma-subtitle {
            color: var(--green);
            font-size: 15px;
            font-weight: 800;
            letter-spacing: .2em;
            text-transform: uppercase;
          }
          .diploma-name {
            font-family: Georgia, serif;
            font-style: italic;
            font-size: 62px;
            line-height: 1;
            margin: 20px 0 8px;
            color: var(--navy);
          }
          .diploma-copy {
            max-width: 690px;
            margin: 0 auto;
            font-size: 18px;
            line-height: 1.65;
            color: #334155;
          }
          .gold-rule {
            width: 220px;
            height: 3px;
            margin: 14px auto;
            background: linear-gradient(90deg, transparent, var(--gold), transparent);
          }
          ul {
            line-height: 1.7;
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .sheet {
              box-shadow: none;
              border-radius: 0;
              max-width: none;
              border: none;
            }
            .hero {
              margin-top: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet">${content}</div>
      </body>
    </html>
  `;
}

function slugifyFileName(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function money(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function openPrintableDocument(title: string, content: string) {
  const html = createDocumentShell(title, content);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function downloadPrintableDocument(title: string, content: string, fileBaseName: string) {
  const html = createDocumentShell(title, content);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugifyFileName(fileBaseName)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function renderOwnerSummary(owner: Owner) {
  return `
    <div class="grid">
      <div class="card">
        <div class="field-label">Customer</div>
        <div class="field-value">${owner.name}</div>
      </div>
      <div class="card">
        <div class="field-label">Phone</div>
        <div class="field-value">${owner.phone}</div>
      </div>
      <div class="card">
        <div class="field-label">Email</div>
        <div class="field-value">${owner.email}</div>
      </div>
      <div class="card">
        <div class="field-label">Address</div>
        <div class="field-value">${formatOwnerAddress(owner)}</div>
      </div>
    </div>
  `;
}

function renderSectionValue(field: FieldDefinition, value: string | number | boolean | undefined) {
  if (value === undefined || value === null || value === "") return "";
  if (field.kind === "toggle") return value ? "Yes" : "No";
  return String(value);
}

function getSavedSectionsMarkup(assessment: Assessment) {
  return sectionDefinitions
    .filter((section) => assessment.sections[section.id])
    .map((section) => {
      const values = assessment.sections[section.id] ?? {};
      const fieldRows = section.fields
        .map((field) => {
          const renderedValue = renderSectionValue(field, values[field.key]);
          if (!renderedValue) return "";
          return `
            <div class="card">
              <div class="field-label">${prettyLabel(field)}</div>
              <div class="field-value">${renderedValue}</div>
            </div>
          `;
        })
        .filter(Boolean)
        .join("");

      return `
        <div class="section">
          <h2>${section.label}</h2>
          <div class="grid">${fieldRows || '<div class="muted">No saved section details.</div>'}</div>
        </div>
      `;
    })
    .join("");
}

function getReceiptLineItems(assessment: Assessment) {
  return sectionDefinitions
    .filter((section) => assessment.sections[section.id])
    .map((section) => {
      const values = assessment.sections[section.id] ?? {};
      const notePreview =
        typeof values.notes === "string" && values.notes.trim()
          ? values.notes.trim()
          : "Section saved";

      return `
        <div class="list-row">
          <div>
            <div class="field-label">${section.label}</div>
            <div class="field-value">${notePreview}</div>
          </div>
          <div>
            <div class="field-label">Status</div>
            <div class="field-value">${values.condition ? String(values.condition) : "Saved"}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function aiSummaryMarkup(aiSummary: AiSummary | null) {
  if (!aiSummary) return "";

  const nextSteps = aiSummary.nextSteps
    .map((step) => `<li>${step}</li>`)
    .join("");
  const sources = aiSummary.sources
    .map((source) => `<li>${source}</li>`)
    .join("");

  return `
    <div class="section">
      <h2>AI Summary</h2>
      <div class="writeup">${aiSummary.summary}</div>
      ${
        nextSteps
          ? `<h2 style="font-size:18px;margin-top:18px;">Recommended Next Steps</h2><ul>${nextSteps}</ul>`
          : ""
      }
      ${
        sources
          ? `<h2 style="font-size:18px;margin-top:18px;">Reference Notes</h2><ul>${sources}</ul>`
          : ""
      }
      <p class="muted">Generated ${new Date(aiSummary.generatedAt).toLocaleString()}</p>
    </div>
  `;
}

function notesDocumentContent(assessment: Assessment) {
  return `
    ${documentHeroMarkup({
      eyebrow: "HomeSHINE Assessment",
      title: "Assessment Notes",
      subtitle: `${statusLabel(assessment.status)} assessment · Saved ${new Date(assessment.updatedAt).toLocaleString()}`,
      badge: "FIELD<br/>NOTES",
    })}
    ${renderOwnerSummary(assessment.owner)}
    <h2>Main Writeup</h2>
    <div class="writeup">${assessment.writeup || "No writeup saved."}</div>
    ${aiSummaryMarkup(assessment.aiSummary)}
    ${getSavedSectionsMarkup(assessment) || '<div class="section"><p class="muted">No saved sections yet.</p></div>'}
  `;
}

function receiptDocumentContent(assessment: Assessment) {
  const completed = countDone(assessment);
  const checkout = assessment.checkout;
  const plan = getCheckoutPlan(checkout?.planId);
  const payment =
    checkout?.paymentOption === "deposit-monthly"
      ? "$600 refundable deposit + $197/mo"
      : plan
        ? "Standard payment"
        : "No plan selected";

  return `
    ${documentHeroMarkup({
      eyebrow: "HomeSHINE Receipt",
      title: assessment.status === "finished" ? "Finalized Service Packet" : "Assessment Receipt",
      subtitle: `${assessment.owner.name} · ${statusLabel(assessment.status)}`,
      badge: assessment.status === "finished" ? "READY<br/>PACKET" : "SAVED<br/>RECEIPT",
    })}
    ${renderOwnerSummary(assessment.owner)}
    ${
      plan
        ? `<div class="price-card" style="margin-top:18px;">
            <div class="field-label" style="color:#a7f3d0;">Selected plan</div>
            <div style="display:flex;justify-content:space-between;gap:18px;align-items:flex-end;flex-wrap:wrap;">
              <div>
                <div style="font-size:24px;font-weight:800;">${plan.emoji} ${plan.name}</div>
                <p style="color:#d8e3ee;margin-top:8px;">${plan.label} · ${payment}</p>
              </div>
              <div class="amount">${money(plan.price)}</div>
            </div>
          </div>`
        : ""
    }
    <div class="section">
      <h2>Assessment Summary</h2>
      <div class="grid-3">
        <div class="card">
          <div class="field-label">Saved</div>
          <div class="field-value">${new Date(assessment.updatedAt).toLocaleString()}</div>
        </div>
        <div class="card">
          <div class="field-label">Completed Sections</div>
          <div class="field-value">${completed} of ${sectionDefinitions.length}</div>
        </div>
        <div class="card">
          <div class="field-label">Assessment ID</div>
          <div class="field-value">${assessment.id}</div>
        </div>
      </div>
    </div>
    <div class="section">
      <h2>Saved Items</h2>
      <div class="list">${getReceiptLineItems(assessment) || '<div class="muted">No saved sections yet.</div>'}</div>
    </div>
    ${aiSummaryMarkup(assessment.aiSummary)}
    <div class="total">
      <div class="field-label">Writeup Included</div>
      <div class="amount">${assessment.writeup ? "Yes" : "No"}</div>
    </div>
  `;
}

function getCheckoutPlan(planId: CheckoutPlanId | string | undefined) {
  return CHECKOUT_PLANS.find((plan) => plan.id === planId) ?? null;
}

function checkoutDocumentContent(assessment: Assessment) {
  const checkout = assessment.checkout;
  const plan = getCheckoutPlan(checkout?.planId);
  if (!checkout || !plan) {
    return `
      ${documentHeroMarkup({
        eyebrow: "HomeSHINE Checkout",
        title: "Checkout Summary",
        subtitle: "No plan selected yet.",
        badge: "PLAN<br/>PENDING",
      })}
      ${renderOwnerSummary(assessment.owner)}
    `;
  }

  const included = plan.includes.map((item) => `<li>${item}</li>`).join("");
  const payment =
    checkout.paymentOption === "deposit-monthly"
      ? "$600 refundable deposit + $197/mo"
      : "Due according to final agreement";

  return `
    ${documentHeroMarkup({
      eyebrow: "HomeSHINE Checkout",
      title: "Checkout Summary",
      subtitle: `${plan.name} · ${plan.label}`,
      badge: `${plan.emoji}<br/>SELECTED`,
    })}
    ${renderOwnerSummary(assessment.owner)}
    <div class="price-card" style="margin-top:18px;">
      <div class="field-label" style="color:#a7f3d0;">Selected plan</div>
      <div style="display:flex;justify-content:space-between;gap:18px;align-items:flex-end;flex-wrap:wrap;">
        <div>
          <div style="font-size:24px;font-weight:800;">${plan.emoji} ${plan.name}</div>
          <p style="color:#d8e3ee;margin-top:8px;">${plan.summary}</p>
        </div>
        <div class="amount">${money(plan.price)}</div>
      </div>
    </div>
    <div class="section">
      <h2>Plan Details</h2>
      <div class="grid">
        <div class="card">
          <div class="field-label">Payment</div>
          <div class="field-value">${payment}</div>
        </div>
        <div class="card">
          <div class="field-label">Created</div>
          <div class="field-value">${new Date(checkout.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
      <h2 style="font-size:18px;">Included Highlights</h2>
      <ul>${included}</ul>
    </div>
    ${
      checkout.contractNote
        ? `<div class="section"><h2>Steven's Note</h2><div class="writeup">${checkout.contractNote}</div></div>`
        : ""
    }
  `;
}

function contractDocumentContent(assessment: Assessment) {
  const checkout = assessment.checkout;
  const plan = getCheckoutPlan(checkout?.planId);
  const today = new Date().toLocaleDateString();

  if (!checkout || !plan) {
    return checkoutDocumentContent(assessment);
  }

  const schedule =
    plan.id === "protection"
      ? "Day 1 full deep clean, Month 12 maintenance visit, Month 18 final tune-up, plus one floating pollen-removal visit when appropriate."
      : "Service date and scope to be finalized by HomeSHINE after the final on-site review.";
  const payment =
    checkout.paymentOption === "deposit-monthly"
      ? "$600 refundable deposit and $197/mo"
      : `${money(plan.price)} plan total`;

  return `
    ${documentHeroMarkup({
      eyebrow: "HomeSHINE Agreement",
      title: "Service Agreement Draft",
      subtitle: `${plan.name} · Prepared ${today}`,
      badge: "DRAFT<br/>FOR REVIEW",
    })}
    ${renderOwnerSummary(assessment.owner)}
    <div class="price-card" style="margin-top:18px;">
      <div class="field-label" style="color:#a7f3d0;">Agreement selection</div>
      <div style="display:flex;justify-content:space-between;gap:18px;align-items:flex-end;flex-wrap:wrap;">
        <div>
          <div style="font-size:24px;font-weight:800;">${plan.emoji} ${plan.name}</div>
          <p style="color:#d8e3ee;margin-top:8px;">${plan.label}</p>
        </div>
        <div class="amount">${money(plan.price)}</div>
      </div>
    </div>
    <div class="section">
      <h2>Agreement Summary</h2>
      <p>Thank you for having HomeSHINE at your home for an assessment. This draft summarizes the selected exterior care option and is intended for review before final signature.</p>
      <div class="grid">
        <div class="card">
          <div class="field-label">Payment Option</div>
          <div class="field-value">${payment}</div>
        </div>
        <div class="card">
          <div class="field-label">Schedule</div>
          <div class="field-value">${schedule}</div>
        </div>
      </div>
    </div>
    <div class="section">
      <h2>Scope</h2>
      <p>${plan.summary}</p>
      <p>HomeSHINE provides roof-to-curb exterior care, including the home exterior, hard surfaces, windows, screens, gutters, and related surfaces based on the final property review.</p>
      ${checkout.contractNote ? `<div class="writeup">${checkout.contractNote}</div>` : ""}
    </div>
    <div class="section">
      <h2>Signatures</h2>
      <div class="signature-row">
        <div class="signature-line">Homeowner Signature</div>
        <div class="seal">HOME<br/>SHINE<br/>VERIFIED</div>
        <div class="signature-line"><div class="script">Steven Maestas</div>HomeSHINE Signature</div>
      </div>
    </div>
  `;
}

function diplomaDocumentContent(assessment: Assessment) {
  const checkout = assessment.checkout;
  const plan = getCheckoutPlan(checkout?.planId);
  const certNumber = `HS-${new Date().getFullYear()}-${assessment.id.replace(/[^0-9]/g, "").slice(-5) || "00001"}`;
  const preparedDate = new Date().toLocaleDateString();

  return `
    <div class="diploma-frame">
      <div class="diploma-watermark">HOMESHINE</div>
      <div class="diploma diploma-top">${documentLogoMarkup()}</div>
      <div class="diploma">
        <div class="diploma-subtitle">HomeSHINE Certified Exterior Care</div>
        <div class="diploma-title">Certificate of Completion</div>
        <div class="gold-rule"></div>
        <span class="gold-pill">Certificate ${certNumber}</span>
        <div class="field-label" style="margin-top:28px;">This diploma is proudly presented to</div>
        <div class="diploma-name">${assessment.owner.name}</div>
        <p class="muted" style="font-size:17px;margin-bottom:18px;">Owners of ${formatOwnerAddress(assessment.owner)}</p>
        <p class="diploma-copy">
          This property has completed a HomeSHINE assessment and is prepared for
          <strong>${plan ? plan.name : "a HomeSHINE exterior care plan"}</strong>.
          HomeSHINE recognizes the home for roof-to-curb exterior care planning, including roof,
          siding, gutters, windows, screens, hard surfaces, vegetation impact, and long-term curb appeal.
        </p>
      </div>
      <div class="grid" style="max-width:650px;margin:26px auto 0;">
        <div class="card">
          <div class="field-label">Selected Plan</div>
          <div class="field-value">${plan ? `${plan.emoji} ${plan.name}` : "Not selected"}</div>
        </div>
        <div class="card">
          <div class="field-label">Prepared</div>
          <div class="field-value">${preparedDate}</div>
        </div>
      </div>
      <div class="signature-row">
        <div class="signature-line"><div class="script">Steven Maestas</div>Owner, HomeSHINE</div>
        <div class="seal">HOME<br/>SHINE<br/>CERTIFIED</div>
        <div class="signature-line"><div class="script">${preparedDate}</div>Date Prepared</div>
      </div>
    </div>
  `;
}

function getLocalReferenceNotes(assessment: Assessment) {
  return sectionDefinitions
    .filter((section) => assessment.sections[section.id])
    .flatMap((section) => sectionReferenceMap[section.id] ?? [])
    .slice(0, 5);
}

function openNotesPdf(assessment: Assessment) {
  openPrintableDocument(`${assessment.owner.name} Notes`, notesDocumentContent(assessment));
}

function downloadNotesPdf(assessment: Assessment) {
  downloadPrintableDocument(
    `${assessment.owner.name} Notes`,
    notesDocumentContent(assessment),
    `${assessment.owner.name}-notes`
  );
}

function openReceiptPdf(assessment: Assessment) {
  openPrintableDocument(`${assessment.owner.name} Receipt`, receiptDocumentContent(assessment));
}

function downloadReceiptPdf(assessment: Assessment) {
  downloadPrintableDocument(
    `${assessment.owner.name} Receipt`,
    receiptDocumentContent(assessment),
    `${assessment.owner.name}-receipt`
  );
}

function openCheckoutSummary(assessment: Assessment) {
  openPrintableDocument(`${assessment.owner.name} Checkout`, checkoutDocumentContent(assessment));
}

function openContractDraft(assessment: Assessment) {
  openPrintableDocument(`${assessment.owner.name} Contract`, contractDocumentContent(assessment));
}

function openInitialDiploma(assessment: Assessment) {
  openPrintableDocument(`${assessment.owner.name} HomeSHINE Diploma`, diplomaDocumentContent(assessment));
}

function ConditionButtons({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: Condition) => void;
}) {
  const options: Condition[] = ["fair", "good", "great"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          style={{
            borderRadius: 16,
            border: "2px solid var(--border)",
            padding: "16px 10px",
            background:
              value === option
                ? option === "fair"
                  ? "#fde68a"
                  : option === "good"
                    ? "#bbf7d0"
                    : "#86efac"
                : "var(--white)",
            color: "var(--navy)",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {option === "fair" ? "Fair" : option === "good" ? "Good" : "Great"}
        </button>
      ))}
    </div>
  );
}

function LoginScreen({
  loginForm,
  loginError,
  onChange,
  onSubmit,
}: {
  loginForm: LoginForm;
  loginError: string;
  onChange: (key: keyof LoginForm, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section style={{ padding: 18 }}>
      <div
        style={{
          maxWidth: 580,
          margin: "30px auto 0",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: 28,
          boxShadow: "0 20px 50px rgba(27, 45, 69, 0.12)",
          border: "1px solid rgba(221, 228, 237, 0.95)",
          padding: 28,
        }}
      >
        <div className="serif" style={{ fontSize: 40, marginBottom: 8 }}>
          Admin Login
        </div>
        <div style={{ color: "var(--muted)", fontSize: 19, marginBottom: 22 }}>
          Sign in with a HomeSHINE admin account.
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Username</label>
          <input value={loginForm.username} onChange={(event) => onChange("username", event.target.value)} style={fieldStyle()} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Password</label>
          <input type="password" value={loginForm.password} onChange={(event) => onChange("password", event.target.value)} style={fieldStyle()} />
        </div>
        {loginError ? (
          <div style={{ marginBottom: 16, borderRadius: 16, background: "#fef2f2", color: "#b91c1c", padding: "14px 16px", fontSize: 16, fontWeight: 700 }}>
            {loginError}
          </div>
        ) : null}
        <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
          <button type="button" onClick={onSubmit} style={bigButtonStyle()}>
            Login
          </button>
        </div>
        <div style={{ borderRadius: 18, background: "linear-gradient(180deg, #f8fafc 0%, #eef4f7 100%)", border: "1px solid var(--border)", padding: 18, color: "var(--navy)" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Local admin credentials</div>
          <div style={{ fontSize: 16, lineHeight: 1.7 }}>Steven: `steven` / `homeshine-steven`</div>
          <div style={{ fontSize: 16, lineHeight: 1.7 }}>Beth: `beth` / `homeshine-beth`</div>
        </div>
      </div>
    </section>
  );
}

function ToastHost({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", top: 18, right: 18, width: 360, maxWidth: "calc(100vw - 36px)", zIndex: 60 }}>
      <div style={{ background: "white", borderRadius: 22, boxShadow: "0 20px 50px rgba(27, 45, 69, 0.18)", border: toast.tone === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{toast.title}</div>
            <div style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.5, marginTop: 4 }}>{toast.description}</div>
          </div>
          <button type="button" onClick={onClose} style={{ border: "none", background: "transparent", color: "var(--muted)", fontSize: 18, padding: 0 }}>
            x
          </button>
        </div>
        {toast.actions?.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            {toast.actions.map((action) => (
              <button key={action.label} type="button" onClick={action.onClick} style={{ border: "2px solid var(--border)", borderRadius: 14, background: "#f8fafc", color: "var(--navy)", padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Dialog({ dialog, onClose }: { dialog: DialogState | null; onClose: () => void }) {
  if (!dialog) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15, 31, 61, 0.45)", display: "grid", placeItems: "center", padding: 20, zIndex: 70 }}>
      <div style={{ width: "100%", maxWidth: 520, background: "white", borderRadius: 24, boxShadow: "0 24px 60px rgba(27, 45, 69, 0.2)", padding: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{dialog.title}</div>
        <div style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{dialog.body}</div>
        <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
          {dialog.tone === "confirm" ? (
            <>
              <button type="button" onClick={() => { dialog.onConfirm?.(); onClose(); }} style={bigButtonStyle("#b91c1c")}>
                {dialog.confirmLabel ?? "Confirm"}
              </button>
              <button type="button" onClick={onClose} style={outlineButtonStyle()}>
                {dialog.cancelLabel ?? "Cancel"}
              </button>
            </>
          ) : (
            <button type="button" onClick={onClose} style={bigButtonStyle()}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FinishedCheckoutPanel({
  assessment,
  onPickPlan,
  onPaymentOption,
  onNoteChange,
  onOpenCheckout,
  onOpenContract,
  onOpenDiploma,
}: {
  assessment: Assessment;
  onPickPlan: (plan: CheckoutPlan) => void;
  onPaymentOption: (paymentOption: CheckoutData["paymentOption"]) => void;
  onNoteChange: (note: string) => void;
  onOpenCheckout: () => void;
  onOpenContract: () => void;
  onOpenDiploma: () => void;
}) {
  const checkout = assessment.checkout ?? null;
  const selectedPlan = getCheckoutPlan(checkout?.planId);

  return (
    <div style={{ margin: "0 18px 18px", background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)", borderRadius: 22, boxShadow: "0 14px 32px rgba(27, 45, 69, 0.09)", padding: 20, border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--green)", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
            <CreditCard size={17} />
            Finished checkout
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Pick plan + build documents</div>
          <div style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.5 }}>
            Select the plan, then open the checkout summary, contract draft, or initial HomeSHINE diploma.
          </div>
        </div>
        {selectedPlan ? (
          <div style={{ borderRadius: 18, background: selectedPlan.featured ? "linear-gradient(160deg, #1b2d45 0%, #1e5c3a 100%)" : "var(--green-light)", color: selectedPlan.featured ? "white" : "var(--green)", padding: "12px 14px", minWidth: 190 }}>
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.8 }}>SELECTED</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 3 }}>{selectedPlan.emoji} {selectedPlan.name}</div>
            <div className="serif" style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>{money(selectedPlan.price)}</div>
          </div>
        ) : null}
      </div>

      <div className="hs-two-col" style={{ gap: 12 }}>
        {CHECKOUT_PLANS.map((plan) => {
          const active = checkout?.planId === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onPickPlan(plan)}
              style={{
                textAlign: "left",
                borderRadius: 20,
                border: active ? "2px solid var(--green)" : "1px solid var(--border)",
                background: plan.featured ? "linear-gradient(160deg, #1b2d45 0%, #1e5c3a 100%)" : active ? "var(--green-light)" : "white",
                color: plan.featured ? "white" : "var(--navy)",
                padding: 16,
                boxShadow: active ? "0 12px 28px rgba(45, 122, 79, 0.16)" : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: plan.featured ? "#7dd3fc" : "var(--green)", marginBottom: 5 }}>{plan.emoji} {plan.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{plan.name}</div>
                </div>
                <div className="serif" style={{ fontSize: 24, fontWeight: 800, color: plan.featured ? "#7dd3fc" : "var(--green)" }}>{money(plan.price)}</div>
              </div>
              <div style={{ color: plan.featured ? "#d8e3ee" : "var(--muted)", fontSize: 14, lineHeight: 1.45, marginTop: 10 }}>{plan.summary}</div>
            </button>
          );
        })}
      </div>

      {selectedPlan ? (
        <>
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: selectedPlan.id === "protection" ? "repeat(2, minmax(0, 1fr))" : "1fr", gap: 10 }}>
              <button type="button" onClick={() => onPaymentOption("full")} style={{ border: checkout?.paymentOption === "full" ? "2px solid var(--green)" : "1px solid var(--border)", borderRadius: 16, background: checkout?.paymentOption === "full" ? "var(--green-light)" : "white", padding: "13px 14px", fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>
                💳 Standard payment
              </button>
              {selectedPlan.id === "protection" ? (
                <button type="button" onClick={() => onPaymentOption("deposit-monthly")} style={{ border: checkout?.paymentOption === "deposit-monthly" ? "2px solid var(--green)" : "1px solid var(--border)", borderRadius: 16, background: checkout?.paymentOption === "deposit-monthly" ? "var(--green-light)" : "white", padding: "13px 14px", fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>
                  🛡️ $600 deposit + $197/mo
                </button>
              ) : null}
            </div>
            <textarea
              key={`${checkout?.planId ?? "plan"}-${checkout?.createdAt ?? "new"}`}
              defaultValue={checkout?.contractNote ?? ""}
              onBlur={(event) => onNoteChange(event.target.value)}
              placeholder="Optional contract note, access note, scheduling note, or promise Steven wants included."
              style={{ ...fieldStyle(), minHeight: 92, fontSize: 16, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 14 }}>
            <button type="button" onClick={onOpenCheckout} style={{ ...outlineButtonStyle(), fontSize: 16, padding: "14px 12px" }}>
              🧾 Summary
            </button>
            <button type="button" onClick={onOpenContract} style={{ ...outlineButtonStyle(), fontSize: 16, padding: "14px 12px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, justifyContent: "center" }}><FileText size={16} /> Contract</span>
            </button>
            <button type="button" onClick={onOpenDiploma} style={{ ...bigButtonStyle(), fontSize: 16, padding: "14px 12px" }}>
              🏆 Diploma
            </button>
          </div>
        </>
      ) : (
        <div style={{ marginTop: 14, borderRadius: 18, background: "#f8fafc", border: "1px solid var(--border)", color: "var(--muted)", padding: 14, fontSize: 15, lineHeight: 1.5 }}>
          Pick a plan first. The document buttons appear after a plan is selected.
        </div>
      )}
    </div>
  );
}

export default function SimpleFieldApp() {
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<View>("pipeline");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<SectionDefinition | null>(null);
  const [ownerDraft, setOwnerDraft] = useState(emptyOwner);
  const [sectionDraft, setSectionDraft] = useState<SectionValue>({});
  const [writeupDraft, setWriteupDraft] = useState("");
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [generatingAiSummary, setGeneratingAiSummary] = useState(false);

  useEffect(() => {
    let active = true;

    startTransition(() => {
      setSession(loadSession());
    });

    fetchAssessmentsFromApi()
      .then((nextAssessments) => {
        if (!active) return;
        startTransition(() => {
          setAssessments(nextAssessments);
        });
      })
      .catch(() => {
        if (!active) return;
        startTransition(() => {
          setAssessments([]);
        });
        setDialog({
          tone: "error",
          title: "Could not load assessments",
          body: "The app could not reach the shared database yet. Check your Supabase setup and try again.",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return;
    }
    window.localStorage.removeItem(SESSION_KEY);
  }, [session]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 7000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const currentAssessment = assessments?.find((assessment) => assessment.id === currentId) ?? null;
  const townMatches = getMatches(ownerDraft.city, townOptions);
  const stateMatches = getMatches(ownerDraft.state, stateOptions);
  const filteredAssessments = useMemo(() => {
    if (!assessments) return null;
    if (statusFilter === "all") return assessments;
    return assessments.filter((assessment) => assessment.status === statusFilter);
  }, [assessments, statusFilter]);

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
  }

  function openNewAssessment() {
    setOwnerDraft(emptyOwner);
    setWriteupDraft("");
    setCurrentId(null);
    setView("owner");
  }

  function cancelNewAssessment() {
    setOwnerDraft(emptyOwner);
    setWriteupDraft("");
    setCurrentId(null);
    setCurrentSection(null);
    setView("pipeline");
  }

  function openAssessment(assessment: Assessment) {
    setCurrentId(assessment.id);
    setWriteupDraft(assessment.writeup ?? "");
    setView("menu");
  }

  async function saveOwner() {
    const missingFields = [
      !ownerDraft.name ? "Owner name" : "",
      !ownerDraft.street ? "Street" : "",
      !ownerDraft.city ? "Town / City" : "",
      !ownerDraft.state ? "State" : "",
      !ownerDraft.phone ? "Phone" : "",
      !ownerDraft.email ? "Email" : "",
    ].filter(Boolean);

    if (missingFields.length > 0) {
      setDialog({ tone: "error", title: "Customer info is missing", body: `Please fill out:\n\n${missingFields.join("\n")}` });
      return;
    }

      const assessment = makeAssessment();
      assessment.owner = ownerDraft;
      assessment.status = "ongoing";

      try {
        const created = await createAssessmentOnApi(assessment);
        startTransition(() => {
          setAssessments((current) => [created, ...(current ?? [])]);
          setCurrentId(created.id);
          setView("menu");
        });
      } catch (error) {
        setDialog({
          tone: "error",
          title: "Assessment could not be created",
          body: error instanceof Error ? error.message : "Please try again.",
        });
      }
    }

  function openSection(section: SectionDefinition) {
    if (!currentAssessment) return;
    setCurrentSection(section);
    setSectionDraft(currentAssessment.sections[section.id] ?? {});
    setView("section");
  }

  async function saveSection() {
      if (!currentAssessment || !currentSection) return;

      const nextAssessment: Assessment = {
        ...currentAssessment,
        updatedAt: new Date().toISOString(),
        sections: { ...currentAssessment.sections, [currentSection.id]: sectionDraft },
      };

      try {
        const saved = await updateAssessmentOnApi(nextAssessment);
        startTransition(() => {
          setAssessments((current) =>
            (current ?? []).map((assessment) =>
              assessment.id === currentAssessment.id ? saved : assessment
            )
          );
          setCurrentId(saved.id);
          setWriteupDraft(saved.writeup ?? "");
          setView("menu");
          setCurrentSection(null);
        });
        showToast({ tone: "success", title: "Section saved", description: `${currentSection.label} was saved.` });
      } catch (error) {
        setDialog({
          tone: "error",
          title: "Section could not be saved",
          body: error instanceof Error ? error.message : "Please try again.",
        });
      }
    }
  
  async function updateAssessmentStatus(status: Assessment["status"]) {
      if (!currentAssessment) return;

      try {
        const saved = await updateAssessmentOnApi({
          ...currentAssessment,
          status,
          updatedAt: new Date().toISOString(),
        });

        startTransition(() => {
          setAssessments((current) =>
            (current ?? []).map((assessment) =>
              assessment.id === currentAssessment.id ? saved : assessment
            )
          );
        });
      } catch (error) {
        setDialog({
          tone: "error",
          title: "Status could not be updated",
          body: error instanceof Error ? error.message : "Please try again.",
        });
      }
    }

  function askDeleteDraft(id: string) {
    const target = (assessments ?? []).find((assessment) => assessment.id === id);
    if (!target) return;
    setDialog({
      tone: "confirm",
      title: "Delete this draft?",
      body: `${target.owner.name}\n${formatOwnerAddress(target.owner)}\n${target.owner.phone}`,
      confirmLabel: "Delete Draft",
      cancelLabel: "Keep Draft",
        onConfirm: async () => {
          try {
            await deleteAssessmentOnApi(id);
            startTransition(() => {
              setAssessments((current) => (current ?? []).filter((assessment) => assessment.id !== id));
              if (currentId === id) {
                setCurrentId(null);
                setView("pipeline");
              }
            });
            showToast({ tone: "success", title: "Draft deleted", description: `${target.owner.name}'s draft was removed.` });
          } catch (error) {
            setDialog({
              tone: "error",
              title: "Draft could not be deleted",
              body: error instanceof Error ? error.message : "Please try again.",
            });
          }
        },
      });
    }
  
  async function saveAssessmentAndReturnHome() {
      if (!currentAssessment) return;
      const nextAssessment: Assessment = { ...currentAssessment, updatedAt: new Date().toISOString(), writeup: writeupDraft.trim() };
      try {
        const saved = await updateAssessmentOnApi(nextAssessment);
        startTransition(() => {
          setAssessments((current) => (current ?? []).map((assessment) => (assessment.id === currentAssessment.id ? saved : assessment)));
          setCurrentId(null);
          setView("pipeline");
        });
        showToast({
          tone: "success",
          title: "Assessment saved",
          description: "It was saved. You can open the printable notes and receipt here.",
          actions: [
            { label: "Open Notes PDF", onClick: () => openNotesPdf(saved) },
            { label: "Download Notes", onClick: () => downloadNotesPdf(saved) },
            { label: "Open Receipt PDF", onClick: () => openReceiptPdf(saved) },
            { label: "Download Receipt", onClick: () => downloadReceiptPdf(saved) },
          ],
        });
      } catch (error) {
        setDialog({
          tone: "error",
          title: "Assessment could not be saved",
          body: error instanceof Error ? error.message : "Please try again.",
        });
      }
    }

  async function generateAiSummary() {
    if (!currentAssessment) return;

    setGeneratingAiSummary(true);

    try {
      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment: {
            ...currentAssessment,
            writeup: writeupDraft.trim(),
          },
        }),
      });

      const payload = (await response.json()) as
        | { summary: string; nextSteps: string[]; sources: string[] }
        | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Could not generate AI summary.");
      }

      const nextAssessment: Assessment = {
        ...currentAssessment,
        updatedAt: new Date().toISOString(),
        writeup: writeupDraft.trim(),
        aiSummary: {
          summary: payload.summary,
          nextSteps: payload.nextSteps,
          sources: payload.sources,
          generatedAt: new Date().toISOString(),
        },
      };

      const saved = await updateAssessmentOnApi(nextAssessment);

      startTransition(() => {
        setAssessments((current) =>
          (current ?? []).map((assessment) =>
            assessment.id === currentAssessment.id ? saved : assessment
          )
        );
      });

      showToast({
        tone: "success",
        title: "AI summary ready",
        description: "Claude added a short homeowner-friendly summary to this assessment.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not generate the AI summary right now.";
      setDialog({
        tone: "error",
        title: "AI summary could not be generated",
        body: message,
      });
    } finally {
      setGeneratingAiSummary(false);
    }
  }

  async function saveCheckout(nextCheckout: CheckoutData) {
    if (!currentAssessment) return;

    const nextAssessment: Assessment = {
      ...currentAssessment,
      checkout: nextCheckout,
      updatedAt: new Date().toISOString(),
      writeup: writeupDraft.trim(),
    };

    try {
      const saved = await updateAssessmentOnApi(nextAssessment);
      startTransition(() => {
        setAssessments((current) =>
          (current ?? []).map((assessment) =>
            assessment.id === currentAssessment.id ? saved : assessment
          )
        );
      });
      showToast({
        tone: "success",
        title: "Checkout saved",
        description: `${nextCheckout.planName} is attached to this finished assessment.`,
      });
    } catch (error) {
      setDialog({
        tone: "error",
        title: "Checkout could not be saved",
        body: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  function pickCheckoutPlan(plan: CheckoutPlan) {
    const existing = currentAssessment?.checkout;
    void saveCheckout({
      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,
      paymentOption:
        plan.id === "protection" ? existing?.paymentOption ?? "deposit-monthly" : "full",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      contractNote: existing?.contractNote ?? "",
    });
  }

  function updateCheckoutPayment(paymentOption: CheckoutData["paymentOption"]) {
    if (!currentAssessment?.checkout) return;
    void saveCheckout({
      ...currentAssessment.checkout,
      paymentOption,
    });
  }

  function updateCheckoutNote(contractNote: string) {
    if (!currentAssessment?.checkout) return;
    void saveCheckout({
      ...currentAssessment.checkout,
      contractNote,
    });
  }

  function handleLogin() {
    const user = findUser(loginForm.username, loginForm.password);
    if (!user) {
      setLoginError("Username or password is incorrect.");
      return;
    }
    startTransition(() => {
      setSession({ id: user.id, name: user.name, role: user.role });
      setLoginError("");
      setLoginForm({ username: "", password: "" });
      setView("pipeline");
    });
  }

  function handleLogout() {
    startTransition(() => {
      setSession(null);
      setCurrentId(null);
      setCurrentSection(null);
      setView("pipeline");
      setLoginError("");
    });
  }

  return (
    <>
      <ToastHost toast={toast} onClose={() => setToast(null)} />
      <Dialog dialog={dialog} onClose={() => setDialog(null)} />

      <main style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 44 }}>
        <div style={{ background: "linear-gradient(180deg, var(--navy) 0%, var(--navy-2) 100%)", color: "white", padding: "18px 20px", boxShadow: "0 10px 25px rgba(27, 45, 69, 0.16)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", maxWidth: 980, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <HomeShineLogo size={58} />
              <div>
                <div className="serif" style={{ fontSize: 24, fontWeight: 700 }}>
                  Home<span style={{ color: "#7dd3fc" }}>SHINE</span>
                </div>
                <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 4 }}>Field assessment</div>
              </div>
              <Link
                href="/promos"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid rgba(255,255,255,.28)",
                  borderRadius: 14,
                  background: "rgba(255,255,255,.08)",
                  color: "white",
                  padding: "8px 14px",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <Sparkles size={14} />
                Promotions
              </Link>
              {session?.id === "steven" && (
                <Link
                  href="/certificate"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    border: "1px solid rgba(255,255,255,.28)",
                    borderRadius: 14,
                    background: "rgba(255,255,255,.08)",
                    color: "white",
                    padding: "8px 14px",
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Award size={14} />
                  Certificate
                </Link>
              )}
              {session?.id === "steven" && (
                <Link
                  href="/market"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    border: "1px solid rgba(255,255,255,.28)",
                    borderRadius: 14,
                    background: "rgba(255,255,255,.08)",
                    color: "white",
                    padding: "8px 14px",
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <BarChart2 size={14} />
                  Market
                </Link>
              )}
              {session?.id === "beth" && (
                <Link
                  href="/reasoning"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    border: "1px solid rgba(255,255,255,.28)",
                    borderRadius: 14,
                    background: "rgba(255,255,255,.08)",
                    color: "white",
                    padding: "8px 14px",
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Lightbulb size={14} />
                  Our Plans
                </Link>
              )}
            </div>
            {session ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 14, color: "#cbd5e1", textAlign: "right" }}>
                  <div>{session.name}</div>
                  <div>{session.role}</div>
                </div>
                <button type="button" onClick={handleLogout} style={{ border: "1px solid rgba(255,255,255,.35)", borderRadius: 14, background: "rgba(255,255,255,.08)", color: "white", padding: "10px 14px", fontSize: 15, fontWeight: 700 }}>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {!session ? (
          <LoginScreen
            loginForm={loginForm}
            loginError={loginError}
            onChange={(key, value) => setLoginForm((current) => ({ ...current, [key]: value }))}
            onSubmit={handleLogin}
          />
        ) : null}

        {session && view === "pipeline" ? (
          <section>
            <div style={{ padding: 18, maxWidth: 980, margin: "0 auto" }}>
              <button type="button" onClick={openNewAssessment} style={{ ...bigButtonStyle("linear-gradient(180deg, #2f8455 0%, #2d7a4f 100%)"), width: "100%", fontSize: 24, padding: "20px 20px" }}>
                New Assessment
              </button>
            </div>

            <div style={{ padding: "0 18px 18px", maxWidth: 980, margin: "0 auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
                {[
                  ["all", "All"],
                  ["draft", "Draft"],
                  ["ongoing", "Ongoing"],
                  ["finished", "Finished"],
                ].map(([value, label]) => {
                  const active = statusFilter === value;
                  return (
                    <button key={value} type="button" onClick={() => setStatusFilter(value as StatusFilter)} style={{ borderRadius: 16, border: active ? "2px solid var(--green)" : "2px solid var(--border)", background: active ? "var(--green-light)" : "var(--white)", color: "var(--navy)", padding: "14px 12px", fontSize: 16, fontWeight: 700 }}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {!filteredAssessments || filteredAssessments.length === 0 ? (
              <div style={{ padding: 24, color: "var(--muted)", fontSize: 20, maxWidth: 980, margin: "0 auto" }}>No assessments yet.</div>
            ) : (
              <div style={{ maxWidth: 980, margin: "0 auto" }}>
                {filteredAssessments.map((assessment) => {
                  const tone = statusColor(assessment.status);
                  const done = countDone(assessment);
                  const checkoutPlan = getCheckoutPlan(assessment.checkout?.planId);
                  const isFinished = assessment.status === "finished";
                  return (
                    <div key={assessment.id} style={{ width: "calc(100% - 36px)", margin: "0 18px 16px", background: isFinished ? "linear-gradient(180deg, #ffffff 0%, #f3fbf6 100%)" : "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)", border: isFinished ? "1px solid #b8e3c6" : "1px solid var(--border)", borderRadius: 24, boxShadow: isFinished ? "0 18px 42px rgba(45, 122, 79, 0.14)" : "0 12px 28px rgba(27, 45, 69, 0.1)", padding: 20 }}>
                      <button type="button" onClick={() => openAssessment(assessment)} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: 26, fontWeight: 700 }}>{assessment.owner.name}</div>
                            <div style={{ color: "var(--muted)", fontSize: 16, marginTop: 6 }}>{formatOwnerAddress(assessment.owner)}</div>
                            <div style={{ color: "var(--muted)", fontSize: 16, marginTop: 4 }}>{assessment.owner.phone}</div>
                          </div>
                          <div style={{ display: "grid", justifyItems: "end", gap: 8 }}>
                            <div style={{ borderRadius: 999, background: tone.bg, color: tone.color, padding: "7px 12px", fontSize: 14, fontWeight: 700 }}>
                              {statusLabel(assessment.status)}
                            </div>
                            {checkoutPlan ? (
                              <div style={{ borderRadius: 999, background: "var(--green-light)", color: "var(--green)", border: "1px solid #b8e3c6", padding: "7px 12px", fontSize: 13, fontWeight: 800 }}>
                                {checkoutPlan.emoji} {checkoutPlan.name}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div style={{ marginTop: 14, fontSize: 16, color: "var(--muted)" }}>
                          {done} of {sectionDefinitions.length} sections saved
                        </div>
                        {assessment.writeup ? (
                          <div style={{ marginTop: 12, color: "var(--navy)", fontSize: 15, lineHeight: 1.5, background: isFinished ? "rgba(255,255,255,.72)" : "#f8fafc", borderRadius: 14, padding: "12px 14px", border: isFinished ? "1px solid #d7efdf" : "none" }}>
                            <strong>Writeup:</strong> {assessment.writeup}
                          </div>
                        ) : null}
                        {assessment.aiSummary ? (
                          <div style={{ marginTop: 12, color: "var(--navy)", fontSize: 15, lineHeight: 1.5, background: isFinished ? "white" : "#eef9f2", borderRadius: 14, padding: "12px 14px", border: "1px solid #b8e3c6" }}>
                            <strong>{isFinished ? "Client Summary:" : "AI Summary:"}</strong> {assessment.aiSummary.summary}
                          </div>
                        ) : null}
                      </button>

                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap", borderTop: isFinished ? "1px solid #d7efdf" : "none", paddingTop: isFinished ? 14 : 0 }}>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          {isFinished ? (
                            <div style={{ color: checkoutPlan ? "var(--green)" : "var(--amber)", background: checkoutPlan ? "var(--green-light)" : "var(--amber-light)", border: checkoutPlan ? "1px solid #b8e3c6" : "1px solid #fde68a", borderRadius: 999, padding: "9px 12px", fontSize: 13, fontWeight: 800 }}>
                              {checkoutPlan ? "✅ Client packet ready" : "⚠️ Open job to pick a plan"}
                            </div>
                          ) : null}
                          <button type="button" onClick={() => openNotesPdf(assessment)} style={{ border: "2px solid var(--border)", borderRadius: 14, background: "#f8fafc", color: "var(--navy)", padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
                            📋 Notes
                          </button>
                          <button type="button" onClick={() => openReceiptPdf(assessment)} style={{ border: "2px solid var(--border)", borderRadius: 14, background: "#f8fafc", color: "var(--navy)", padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
                            🧾 Receipt
                          </button>
                          {checkoutPlan ? (
                            <>
                              <button type="button" onClick={() => openContractDraft(assessment)} style={{ border: "2px solid #dbeafe", borderRadius: 14, background: "#eff6ff", color: "#1d4ed8", padding: "10px 12px", fontSize: 14, fontWeight: 800 }}>
                                📄 Contract
                              </button>
                              <button type="button" onClick={() => openInitialDiploma(assessment)} style={{ border: "2px solid #fde68a", borderRadius: 14, background: "var(--amber-light)", color: "var(--amber)", padding: "10px 12px", fontSize: 14, fontWeight: 800 }}>
                                🏆 Diploma
                              </button>
                            </>
                          ) : null}
                        </div>
                        {assessment.status === "draft" ? (
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => askDeleteDraft(assessment.id)}
                              style={{ border: "2px solid #fecaca", borderRadius: 999, background: "#fff1f2", color: "#b91c1c", width: 48, height: 48, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, fontSize: 20, fontWeight: 700 }}
                              aria-label={`Delete draft for ${assessment.owner.name}`}
                              title={`Delete draft for ${assessment.owner.name}`}
                            >
                              {"\u{1F5D1}"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

        {session && view === "owner" ? (
            <section style={{ padding: 18, maxWidth: 980, margin: "0 auto" }}>
              <div style={{ background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)", borderRadius: 28, boxShadow: "0 18px 36px rgba(27, 45, 69, 0.1)", padding: 26, border: "1px solid rgba(221, 228, 237, 0.95)" }}>
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 18 }}>
                  <button type="button" onClick={cancelNewAssessment} style={{ ...outlineButtonStyle(), padding: "12px 18px", fontSize: 18 }}>
                    Go Home
                  </button>
                </div>
                <div className="serif" style={{ fontSize: 36, marginBottom: 8 }}>Owner Information</div>
                <div style={{ color: "var(--muted)", fontSize: 18, marginBottom: 20 }}>Enter the owner name, street, town or city, state, phone, and email.</div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Owner name</label>
                <input value={ownerDraft.name} onChange={(event) => setOwnerDraft((current) => ({ ...current, name: event.target.value }))} style={fieldStyle()} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Street</label>
                <input value={ownerDraft.street} onChange={(event) => setOwnerDraft((current) => ({ ...current, street: event.target.value }))} placeholder="11 Main St" style={fieldStyle()} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 12 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Town / City</label>
                  <input list="town-options" value={ownerDraft.city} onChange={(event) => setOwnerDraft((current) => ({ ...current, city: event.target.value }))} placeholder="South Burlington" style={fieldStyle()} />
                  <datalist id="town-options">{townMatches.map((town) => <option key={town} value={town} />)}</datalist>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>State</label>
                  <input list="state-options" value={ownerDraft.state} onChange={(event) => setOwnerDraft((current) => ({ ...current, state: event.target.value.toUpperCase() }))} placeholder="VT" style={fieldStyle()} />
                  <datalist id="state-options">{stateMatches.map((state) => <option key={state} value={state} />)}</datalist>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Phone</label>
                <input value={ownerDraft.phone} onChange={(event) => setOwnerDraft((current) => ({ ...current, phone: event.target.value }))} style={fieldStyle()} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Email</label>
                <input value={ownerDraft.email} onChange={(event) => setOwnerDraft((current) => ({ ...current, email: event.target.value }))} style={fieldStyle()} />
              </div>
              <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
                <button type="button" onClick={saveOwner} style={bigButtonStyle()}>
                  Save and Open Menu
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {session && view === "menu" && currentAssessment ? (
          <section style={{ maxWidth: 980, margin: "0 auto" }}>
            <div style={{ margin: 18, background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)", borderRadius: 22, boxShadow: "0 14px 32px rgba(27, 45, 69, 0.09)", padding: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{currentAssessment.owner.name}</div>
              <div style={{ color: "var(--muted)", fontSize: 16, marginTop: 5 }}>{formatOwnerAddress(currentAssessment.owner)}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 16 }}>
                {(["draft", "ongoing", "finished"] as Assessment["status"][]).map((status) => {
                  const active = currentAssessment.status === status;
                  return (
                    <button key={status} type="button" onClick={() => updateAssessmentStatus(status)} style={{ borderRadius: 16, border: active ? "2px solid var(--green)" : "2px solid var(--border)", background: active ? "var(--green-light)" : "var(--white)", color: "var(--navy)", padding: "14px 12px", fontSize: 16, fontWeight: 700 }}>
                      {statusLabel(status)}
                    </button>
                  );
                })}
              </div>
              {currentAssessment.status === "draft" ? (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => askDeleteDraft(currentAssessment.id)}
                    style={{ border: "2px solid #fecaca", borderRadius: 999, background: "#fff1f2", color: "#b91c1c", width: 48, height: 48, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, fontSize: 20, fontWeight: 700 }}
                    aria-label={`Delete draft for ${currentAssessment.owner.name}`}
                    title={`Delete draft for ${currentAssessment.owner.name}`}
                  >
                    {"\u{1F5D1}"}
                  </button>
                </div>
              ) : null}
            </div>

              <div style={{ margin: "0 18px 18px", background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)", borderRadius: 22, boxShadow: "0 14px 32px rgba(27, 45, 69, 0.09)", padding: 20 }}>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Writeup Notes</div>
                <div style={{ color: "var(--muted)", fontSize: 16, marginBottom: 14 }}>Save the main assessment note summary here.</div>
                <textarea value={writeupDraft} onChange={(event) => setWriteupDraft(event.target.value)} placeholder="Enter the main writeup for this assessment" style={{ ...fieldStyle(), minHeight: 140, resize: "vertical" }} />
              </div>

              <div style={{ margin: "0 18px 18px", background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)", borderRadius: 22, boxShadow: "0 14px 32px rgba(27, 45, 69, 0.09)", padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>AI Summary</div>
                    <div style={{ color: "var(--muted)", fontSize: 16 }}>
                      Generate a short homeowner-friendly paragraph and a few next steps from the saved assessment details.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={generateAiSummary}
                    disabled={generatingAiSummary}
                    style={{
                      ...outlineButtonStyle(),
                      padding: "14px 18px",
                      fontSize: 17,
                      opacity: generatingAiSummary ? 0.7 : 1,
                    }}
                  >
                    {generatingAiSummary ? "Generating..." : "Generate AI Summary"}
                  </button>
                </div>
                <div style={{ marginTop: 14, color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>
                  Generates a quick, polished summary from the notes and saved section details.
                </div>
                <div style={{ marginTop: 14, padding: 14, background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 16, color: "var(--navy)", fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {currentAssessment.aiSummary
                    ? currentAssessment.aiSummary.summary
                    : "No AI summary yet. Generate one when the writeup and section details are ready."}
                </div>
                {currentAssessment.aiSummary?.nextSteps?.length ? (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Recommended Next Steps</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {currentAssessment.aiSummary.nextSteps.map((step) => (
                        <div key={step} style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 14, fontSize: 14 }}>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Reference Notes</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {(currentAssessment.aiSummary?.sources?.length
                      ? currentAssessment.aiSummary.sources
                      : getLocalReferenceNotes(currentAssessment)
                    ).map((source) => (
                      <div key={source} style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 14, fontSize: 14 }}>
                        {source}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {currentAssessment.status === "finished" ? (
                <FinishedCheckoutPanel
                  assessment={currentAssessment}
                  onPickPlan={pickCheckoutPlan}
                  onPaymentOption={updateCheckoutPayment}
                  onNoteChange={updateCheckoutNote}
                  onOpenCheckout={() => openCheckoutSummary(currentAssessment)}
                  onOpenContract={() => openContractDraft(currentAssessment)}
                  onOpenDiploma={() => openInitialDiploma(currentAssessment)}
                />
              ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14, padding: "0 18px" }}>
              {sectionDefinitions.map((section) => {
                const filled = Boolean(currentAssessment.sections[section.id]);
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => openSection(section)}
                    style={{
                      background: filled ? "linear-gradient(180deg, #edf9f1 0%, #e6f4ec 100%)" : "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)",
                      border: filled ? "2px solid var(--green)" : "2px solid var(--border)",
                      borderRadius: 24,
                      boxShadow: "0 12px 28px rgba(27, 45, 69, 0.08)",
                      padding: "20px 14px",
                      minHeight: 150,
                    }}
                  >
                    <div style={{ fontSize: 40, lineHeight: 1 }}>{section.emoji}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 10 }}>{section.label}</div>
                    <div style={{ fontSize: 15, color: filled ? "var(--green)" : "var(--muted)", marginTop: 8 }}>{filled ? "Saved" : "Open"}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ padding: 18 }}>
              <button type="button" onClick={saveAssessmentAndReturnHome} style={{ ...bigButtonStyle(), width: "100%" }}>
                Save Assessment
              </button>
            </div>
          </section>
        ) : null}

        {session && view === "section" && currentSection && currentAssessment ? (
          <section style={{ padding: 18, maxWidth: 980, margin: "0 auto" }}>
            <div style={{ background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)", borderRadius: 28, boxShadow: "0 18px 36px rgba(27, 45, 69, 0.1)", padding: 26 }}>
              <div className="serif" style={{ fontSize: 36, marginBottom: 8 }}>{currentSection.label}</div>
              <div style={{ color: "var(--muted)", fontSize: 18, marginBottom: 20 }}>Enter the field notes for this section.</div>

              {currentSection.fields.map((field) => (
                <div key={field.key} style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{prettyLabel(field)}</label>
                  {field.kind === "text" || field.kind === "number" ? (
                    <input
                      type={field.kind}
                      value={sectionDraft[field.key] === undefined ? "" : String(sectionDraft[field.key])}
                      placeholder={field.placeholder ?? ""}
                      onChange={(event) =>
                        setSectionDraft((current) => ({
                          ...current,
                          [field.key]:
                            field.kind === "number"
                              ? event.target.value === ""
                                ? ""
                                : Number(event.target.value)
                              : event.target.value,
                        }))
                      }
                      style={fieldStyle()}
                    />
                  ) : null}
                  {field.kind === "select" ? (
                    <select value={String(sectionDraft[field.key] ?? "")} onChange={(event) => setSectionDraft((current) => ({ ...current, [field.key]: event.target.value }))} style={fieldStyle()}>
                      <option value="">Choose one</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  {field.kind === "toggle" ? (
                    <button
                      type="button"
                      onClick={() => setSectionDraft((current) => ({ ...current, [field.key]: !current[field.key] }))}
                      style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", border: "2px solid var(--border)", borderRadius: 16, padding: "16px 14px", background: sectionDraft[field.key] ? "var(--green-light)" : "var(--white)", fontSize: 20, fontWeight: 700 }}
                    >
                      <span>{prettyLabel(field)}</span>
                      <span>{sectionDraft[field.key] ? "Yes" : "No"}</span>
                    </button>
                  ) : null}
                  {field.kind === "condition" ? <ConditionButtons value={String(sectionDraft[field.key] ?? "")} onChange={(value) => setSectionDraft((current) => ({ ...current, [field.key]: value }))} /> : null}
                  {field.kind === "notes" ? (
                    <textarea
                      value={String(sectionDraft[field.key] ?? "")}
                      placeholder={field.placeholder ?? ""}
                      onChange={(event) => setSectionDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                      style={{ ...fieldStyle(), minHeight: 120, resize: "vertical" }}
                    />
                  ) : null}
                </div>
              ))}

              <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
                <button type="button" onClick={saveSection} style={bigButtonStyle()}>
                  Save Section
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
