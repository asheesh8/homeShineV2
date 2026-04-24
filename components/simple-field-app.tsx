"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

import {
  type AiSummary,
  type AppUser,
  type Assessment,
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

function createDocumentShell(title: string, content: string) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            padding: 40px;
            font-family: Arial, Helvetica, sans-serif;
            color: #1b2d45;
            background:
              radial-gradient(circle at top left, rgba(125, 211, 252, 0.18), transparent 26%),
              linear-gradient(180deg, #eef4f7 0%, #f8fafc 100%);
          }
          .sheet {
            max-width: 860px;
            margin: 0 auto;
            background: white;
            border-radius: 28px;
            padding: 40px;
            box-shadow: 0 24px 60px rgba(27, 45, 69, 0.12);
            overflow: hidden;
            border: 2px solid #d7e4ef;
          }
          .hero {
            margin: -40px -40px 28px;
            padding: 30px 40px 26px;
            background: linear-gradient(180deg, #1b2d45 0%, #243650 100%);
            border-bottom: 6px solid #2d7a4f;
            color: white;
          }
          .hero h1,
          .hero p {
            color: white;
          }
          .brand {
            font-size: 13px;
            letter-spacing: .18em;
            text-transform: uppercase;
            font-weight: 800;
            color: #9dd7c3;
            margin-bottom: 10px;
          }
          .hero .muted {
            color: #d8e3ee;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 36px;
          }
          h2 {
            margin: 28px 0 10px;
            font-size: 22px;
          }
          p {
            margin: 6px 0;
            line-height: 1.55;
          }
          .muted {
            color: #64748b;
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
            border: 1px solid #dde4ed;
            border-radius: 16px;
            padding: 14px 16px;
            background: #f8fafc;
          }
          .section {
            border-top: 1px solid #dde4ed;
            padding-top: 18px;
            margin-top: 18px;
          }
          .field-label {
            font-size: 12px;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 4px;
          }
          .field-value {
            font-size: 16px;
            font-weight: 700;
          }
          .pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border-radius: 999px;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 700;
            background: rgba(255,255,255,0.12);
            color: white;
          }
          .writeup {
            margin-top: 12px;
            padding: 18px;
            border-radius: 16px;
            background: #f8fafc;
            border: 1px solid #dde4ed;
            white-space: pre-wrap;
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
            border: 1px solid #dde4ed;
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
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .sheet {
              box-shadow: none;
              border-radius: 0;
              max-width: none;
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
    <div class="hero">
      <div class="brand">HomeSHINE</div>
      <h1>Assessment Notes</h1>
      <p class="muted">${statusLabel(assessment.status)} assessment</p>
      <div class="pill">Saved ${new Date(assessment.updatedAt).toLocaleString()}</div>
    </div>
    ${renderOwnerSummary(assessment.owner)}
    <h2>Main Writeup</h2>
    <div class="writeup">${assessment.writeup || "No writeup saved."}</div>
    ${aiSummaryMarkup(assessment.aiSummary)}
    ${getSavedSectionsMarkup(assessment) || '<div class="section"><p class="muted">No saved sections yet.</p></div>'}
  `;
}

function receiptDocumentContent(assessment: Assessment) {
  const completed = countDone(assessment);
  return `
    <div class="hero">
      <div class="brand">HomeSHINE</div>
      <h1>Assessment Receipt</h1>
      <p class="muted">${assessment.owner.name}</p>
      <div class="pill">${statusLabel(assessment.status)}</div>
    </div>
    ${renderOwnerSummary(assessment.owner)}
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
          description: "It was saved. You can find a PDF copy of the notes and receipt here.",
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
            <div>
              <div className="serif" style={{ fontSize: 30, fontWeight: 700 }}>
                Home<span style={{ color: "#7dd3fc" }}>SHINE</span>
              </div>
              <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 4 }}>Field assessment</div>
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
                  return (
                    <div key={assessment.id} style={{ width: "calc(100% - 36px)", margin: "0 18px 16px", background: "linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%)", border: "1px solid var(--border)", borderRadius: 24, boxShadow: "0 12px 28px rgba(27, 45, 69, 0.1)", padding: 20 }}>
                      <button type="button" onClick={() => openAssessment(assessment)} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: 26, fontWeight: 700 }}>{assessment.owner.name}</div>
                            <div style={{ color: "var(--muted)", fontSize: 16, marginTop: 6 }}>{formatOwnerAddress(assessment.owner)}</div>
                            <div style={{ color: "var(--muted)", fontSize: 16, marginTop: 4 }}>{assessment.owner.phone}</div>
                          </div>
                          <div style={{ borderRadius: 999, background: tone.bg, color: tone.color, padding: "7px 12px", fontSize: 14, fontWeight: 700 }}>
                            {statusLabel(assessment.status)}
                          </div>
                        </div>
                        <div style={{ marginTop: 14, fontSize: 16, color: "var(--muted)" }}>
                          {done} of {sectionDefinitions.length} sections saved
                        </div>
                        {assessment.writeup ? (
                          <div style={{ marginTop: 12, color: "var(--navy)", fontSize: 15, lineHeight: 1.5, background: "#f8fafc", borderRadius: 14, padding: "12px 14px" }}>
                            <strong>Writeup:</strong> {assessment.writeup}
                          </div>
                        ) : null}
                        {assessment.aiSummary ? (
                          <div style={{ marginTop: 12, color: "var(--navy)", fontSize: 15, lineHeight: 1.5, background: "#eef9f2", borderRadius: 14, padding: "12px 14px", border: "1px solid #b8e3c6" }}>
                            <strong>AI Summary:</strong> {assessment.aiSummary.summary}
                          </div>
                        ) : null}
                      </button>

                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button type="button" onClick={() => downloadNotesPdf(assessment)} style={{ border: "2px solid var(--border)", borderRadius: 14, background: "#f8fafc", color: "var(--navy)", padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
                            Download Notes
                          </button>
                          <button type="button" onClick={() => downloadReceiptPdf(assessment)} style={{ border: "2px solid var(--border)", borderRadius: 14, background: "#f8fafc", color: "var(--navy)", padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
                            Download Receipt
                          </button>
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
