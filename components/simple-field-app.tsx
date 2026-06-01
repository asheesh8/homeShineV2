"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BarChart2,
  Check,
  ChevronLeft,
  ClipboardList,
  FileText,
  Lightbulb,
  LogOut,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { HomeShineLogo } from "@/components/homeshine-logo";
import { Badge, Button, Dialog, FieldLabel, Panel, SelectInput, TextArea, TextInput, ToastHost } from "@/components/field-app/ui";
import type { DialogState, LoginForm, Session, StatusFilter, ToastState, View } from "@/components/field-app/types";
import {
  CHECKOUT_PLANS,
  SESSION_KEY,
  countDone,
  getCheckoutPlan,
  getMatches,
  money,
  prettyLabel,
  statusLabel,
  statusTone,
} from "@/components/field-app/utils";
import {
  openCheckoutDocument,
  openContractDocument,
  openDiplomaDocument,
  openNotesDocument,
  openReceiptDocument,
  downloadNotesDocument,
  downloadReceiptDocument,
} from "@/lib/field-app-documents";
import {
  type AppUser,
  type Assessment,
  type CheckoutData,
  type Condition,
  type Owner,
  type SectionDefinition,
  type SectionValue,
  appUsers,
  emptyOwner,
  formatOwnerAddress,
  makeAssessment,
  sectionDefinitions,
  sectionReferenceMap,
  stateOptions,
  townOptions,
} from "@/lib/simple-field";

function normalizeAssessment(assessment: Assessment): Assessment {
  const legacyOwner = assessment.owner as Owner & { address?: string };

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
  return raw ? (JSON.parse(raw) as Session) : null;
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
  const response = await fetch(`/api/assessments/${id}`, { method: "DELETE" });
  const payload = (await response.json()) as { success?: boolean; error?: string };

  if (!response.ok || payload.success !== true) {
    throw new Error(payload.error ?? "Could not delete assessment.");
  }
}

function findUser(username: string, password: string): AppUser | undefined {
  return appUsers.find(
    (user) => user.username.toLowerCase() === username.trim().toLowerCase() && user.password === password
  );
}

function getLocalReferenceNotes(assessment: Assessment) {
  return sectionDefinitions
    .filter((section) => assessment.sections[section.id])
    .flatMap((section) => sectionReferenceMap[section.id] ?? [])
    .slice(0, 5);
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
    <div className="hs-segmented hs-condition-grid">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={value === option ? "is-active" : ""}
          onClick={() => onChange(option)}
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
    <section className="hs-narrow">
      <Panel className="hs-login-panel">
        <HomeShineLogo size={72} />
        <div>
          <p className="hs-kicker">HomeSHINE Field</p>
          <h1>Sign in</h1>
          <p className="hs-muted">Use an admin account to create assessments, build service packets, and finish checkout.</p>
        </div>
        <div className="hs-form-grid">
          <div>
            <FieldLabel>Username</FieldLabel>
            <TextInput aria-label="Username" value={loginForm.username} onChange={(event) => onChange("username", event.target.value)} />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <TextInput
              type="password"
              aria-label="Password"
              value={loginForm.password}
              onChange={(event) => onChange("password", event.target.value)}
            />
          </div>
        </div>
        {loginError ? <div className="hs-error">{loginError}</div> : null}
        <Button type="button" wide onClick={onSubmit}>
          Sign in
        </Button>
      </Panel>
    </section>
  );
}

function AppHeader({
  session,
  onLogout,
}: {
  session: Session | null;
  onLogout: () => void;
}) {
  return (
    <header className="hs-app-header">
      <div className="hs-app-header-inner">
        <Link href="/" className="hs-brand">
          <HomeShineLogo size={48} />
          <span>
            <strong>HomeSHINE</strong>
            <small>Field app</small>
          </span>
        </Link>
        <nav className="hs-nav" aria-label="App navigation">
          <Link href="/promos">
            <Sparkles size={16} />
            <span>Promos</span>
          </Link>
          {session?.id === "steven" ? (
            <>
              <Link href="/certificate">
                <Award size={16} />
                <span>Certificate</span>
              </Link>
              <Link href="/market">
                <BarChart2 size={16} />
                <span>Market</span>
              </Link>
            </>
          ) : null}
          {session?.id === "beth" ? (
            <Link href="/reasoning">
              <Lightbulb size={16} />
              <span>Plans</span>
            </Link>
          ) : null}
        </nav>
        {session ? (
          <div className="hs-user-chip">
            <span>{session.name}</span>
            <button type="button" onClick={onLogout} aria-label="Log out" title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function PipelineScreen({
  assessments,
  statusFilter,
  onStatusFilter,
  onNewAssessment,
  onOpenAssessment,
  onDeleteDraft,
}: {
  assessments: Assessment[] | null;
  statusFilter: StatusFilter;
  onStatusFilter: (value: StatusFilter) => void;
  onNewAssessment: () => void;
  onOpenAssessment: (assessment: Assessment) => void;
  onDeleteDraft: (id: string) => void;
}) {
  const filtered = useMemo(() => {
    if (!assessments) return null;
    if (statusFilter === "all") return assessments;
    return assessments.filter((assessment) => assessment.status === statusFilter);
  }, [assessments, statusFilter]);

  return (
    <section className="hs-page">
      <div className="hs-page-title">
        <div>
          <p className="hs-kicker">Pipeline</p>
          <h1>Assessments</h1>
        </div>
        <Button type="button" onClick={onNewAssessment}>
          <Plus size={18} />
          New
        </Button>
      </div>

      <div className="hs-segmented">
        {[
          ["all", "All"],
          ["draft", "Draft"],
          ["ongoing", "Ongoing"],
          ["finished", "Finished"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={statusFilter === value ? "is-active" : ""}
            onClick={() => onStatusFilter(value as StatusFilter)}
          >
            {label}
          </button>
        ))}
      </div>

      {!filtered ? <Panel>Loading assessments...</Panel> : null}
      {filtered?.length === 0 ? <Panel>No assessments yet.</Panel> : null}

      <div className="hs-assessment-list">
        {filtered?.map((assessment) => {
          const done = countDone(assessment);
          const plan = getCheckoutPlan(assessment.checkout?.planId);

          return (
            <Panel key={assessment.id} className="hs-assessment-card">
              <button type="button" className="hs-card-main" onClick={() => onOpenAssessment(assessment)}>
                <span>
                  <strong>{assessment.owner.name || "Unnamed homeowner"}</strong>
                  <small>{formatOwnerAddress(assessment.owner) || assessment.owner.phone}</small>
                </span>
                <span className="hs-card-badges">
                  <Badge tone={statusTone(assessment.status)}>{statusLabel(assessment.status)}</Badge>
                  {plan ? <Badge tone="success">{plan.name}</Badge> : null}
                </span>
              </button>
              <div className="hs-progress-row">
                <span>{done} of {sectionDefinitions.length} sections</span>
                <span>{new Date(assessment.updatedAt).toLocaleDateString()}</span>
              </div>
              {assessment.writeup ? <p className="hs-card-note">{assessment.writeup}</p> : null}
              <div className="hs-card-actions">
                <Button type="button" variant="secondary" onClick={() => openNotesDocument(assessment)}>
                  <ClipboardList size={16} />
                  Notes
                </Button>
                <Button type="button" variant="secondary" onClick={() => openReceiptDocument(assessment)}>
                  <FileText size={16} />
                  Receipt
                </Button>
                {assessment.status === "draft" ? (
                  <Button type="button" variant="danger" onClick={() => onDeleteDraft(assessment.id)} aria-label="Delete draft">
                    <Trash2 size={16} />
                  </Button>
                ) : null}
              </div>
            </Panel>
          );
        })}
      </div>
    </section>
  );
}

function OwnerScreen({
  ownerDraft,
  townMatches,
  stateMatches,
  onOwnerChange,
  onCancel,
  onSave,
}: {
  ownerDraft: Owner;
  townMatches: readonly string[];
  stateMatches: readonly string[];
  onOwnerChange: (owner: Owner) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <section className="hs-page hs-narrow">
      <Button type="button" variant="ghost" onClick={onCancel}>
        <ChevronLeft size={18} />
        Home
      </Button>
      <Panel>
        <p className="hs-kicker">New assessment</p>
        <h1>Owner info</h1>
        <div className="hs-form-grid">
          <div>
            <FieldLabel>Owner name</FieldLabel>
            <TextInput aria-label="Owner name" value={ownerDraft.name} onChange={(event) => onOwnerChange({ ...ownerDraft, name: event.target.value })} />
          </div>
          <div>
            <FieldLabel>Street</FieldLabel>
            <TextInput
              value={ownerDraft.street}
              aria-label="Street"
              placeholder="11 Main St"
              onChange={(event) => onOwnerChange({ ...ownerDraft, street: event.target.value })}
            />
          </div>
          <div className="hs-two-field-grid">
            <div>
              <FieldLabel>Town / city</FieldLabel>
              <TextInput
                list="town-options"
                aria-label="Town or city"
                value={ownerDraft.city}
                placeholder="South Burlington"
                onChange={(event) => onOwnerChange({ ...ownerDraft, city: event.target.value })}
              />
              <datalist id="town-options">{townMatches.map((town) => <option key={town} value={town} />)}</datalist>
            </div>
            <div>
              <FieldLabel>State</FieldLabel>
              <TextInput
                list="state-options"
                aria-label="State"
                value={ownerDraft.state}
                onChange={(event) => onOwnerChange({ ...ownerDraft, state: event.target.value.toUpperCase() })}
              />
              <datalist id="state-options">{stateMatches.map((state) => <option key={state} value={state} />)}</datalist>
            </div>
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <TextInput aria-label="Phone" value={ownerDraft.phone} onChange={(event) => onOwnerChange({ ...ownerDraft, phone: event.target.value })} />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput aria-label="Email" type="email" value={ownerDraft.email} onChange={(event) => onOwnerChange({ ...ownerDraft, email: event.target.value })} />
          </div>
        </div>
        <Button type="button" wide onClick={onSave}>
          Save and open
        </Button>
      </Panel>
    </section>
  );
}

function CheckoutPanel({
  assessment,
  onPickPlan,
  onPaymentOption,
  onNoteChange,
}: {
  assessment: Assessment;
  onPickPlan: (plan: (typeof CHECKOUT_PLANS)[number]) => void;
  onPaymentOption: (paymentOption: CheckoutData["paymentOption"]) => void;
  onNoteChange: (note: string) => void;
}) {
  const selectedPlan = getCheckoutPlan(assessment.checkout?.planId);

  return (
    <Panel>
      <div className="hs-section-heading">
        <div>
          <p className="hs-kicker">Finished checkout</p>
          <h2>Plan and packet</h2>
        </div>
        {selectedPlan ? <Badge tone="success">{selectedPlan.name}</Badge> : null}
      </div>
      <div className="hs-plan-grid">
        {CHECKOUT_PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className={`hs-plan-card ${plan.featured ? "is-featured" : ""} ${selectedPlan?.id === plan.id ? "is-active" : ""}`}
            onClick={() => onPickPlan(plan)}
          >
            <span>
              <small>{plan.label}</small>
              <strong>{plan.name}</strong>
            </span>
            <b>{money(plan.price)}</b>
            <p>{plan.summary}</p>
          </button>
        ))}
      </div>
      {selectedPlan ? (
        <>
          <div className="hs-segmented">
            <button
              type="button"
              className={assessment.checkout?.paymentOption === "full" ? "is-active" : ""}
              onClick={() => onPaymentOption("full")}
            >
              Standard payment
            </button>
            {selectedPlan.id === "protection" ? (
              <button
                type="button"
                className={assessment.checkout?.paymentOption === "deposit-monthly" ? "is-active" : ""}
                onClick={() => onPaymentOption("deposit-monthly")}
              >
                Deposit + monthly
              </button>
            ) : null}
          </div>
          <TextArea
            key={`${assessment.checkout?.planId}-${assessment.checkout?.createdAt}`}
            defaultValue={assessment.checkout?.contractNote ?? ""}
            placeholder="Optional contract, access, or scheduling note"
            onBlur={(event) => onNoteChange(event.target.value)}
          />
          <div className="hs-card-actions">
            <Button type="button" variant="secondary" onClick={() => openCheckoutDocument(assessment)}>Summary</Button>
            <Button type="button" variant="secondary" onClick={() => openContractDocument(assessment)}>Contract</Button>
            <Button type="button" onClick={() => openDiplomaDocument(assessment)}>Diploma</Button>
          </div>
        </>
      ) : null}
    </Panel>
  );
}

function MenuScreen({
  assessment,
  writeupDraft,
  generatingAiSummary,
  onBack,
  onStatus,
  onDeleteDraft,
  onWriteup,
  onGenerateAiSummary,
  onPickPlan,
  onPaymentOption,
  onNoteChange,
  onOpenSection,
  onSave,
}: {
  assessment: Assessment;
  writeupDraft: string;
  generatingAiSummary: boolean;
  onBack: () => void;
  onStatus: (status: Assessment["status"]) => void;
  onDeleteDraft: (id: string) => void;
  onWriteup: (value: string) => void;
  onGenerateAiSummary: () => void;
  onPickPlan: (plan: (typeof CHECKOUT_PLANS)[number]) => void;
  onPaymentOption: (paymentOption: CheckoutData["paymentOption"]) => void;
  onNoteChange: (note: string) => void;
  onOpenSection: (section: SectionDefinition) => void;
  onSave: () => void;
}) {
  const references = assessment.aiSummary?.sources?.length ? assessment.aiSummary.sources : getLocalReferenceNotes(assessment);

  return (
    <section className="hs-page">
      <Button type="button" variant="ghost" onClick={onBack}>
        <ChevronLeft size={18} />
        Pipeline
      </Button>
      <Panel>
        <div className="hs-section-heading">
          <div>
            <p className="hs-kicker">{formatOwnerAddress(assessment.owner)}</p>
            <h1>{assessment.owner.name}</h1>
          </div>
          <Badge tone={statusTone(assessment.status)}>{statusLabel(assessment.status)}</Badge>
        </div>
        <div className="hs-segmented">
          {(["draft", "ongoing", "finished"] as Assessment["status"][]).map((status) => (
            <button
              key={status}
              type="button"
              className={assessment.status === status ? "is-active" : ""}
              onClick={() => onStatus(status)}
            >
              {statusLabel(status)}
            </button>
          ))}
        </div>
        {assessment.status === "draft" ? (
          <Button type="button" variant="danger" onClick={() => onDeleteDraft(assessment.id)}>
            <Trash2 size={16} />
            Delete draft
          </Button>
        ) : null}
      </Panel>

      <Panel>
        <div className="hs-section-heading">
          <div>
            <p className="hs-kicker">Notes</p>
            <h2>Writeup</h2>
          </div>
        </div>
        <TextArea
          value={writeupDraft}
          onChange={(event) => onWriteup(event.target.value)}
          placeholder="Main assessment note for the homeowner packet"
        />
      </Panel>

      <Panel>
        <div className="hs-section-heading">
          <div>
            <p className="hs-kicker">Assistant</p>
            <h2>AI summary</h2>
          </div>
          <Button type="button" variant="secondary" disabled={generatingAiSummary} onClick={onGenerateAiSummary}>
            {generatingAiSummary ? "Generating..." : "Generate"}
          </Button>
        </div>
        <p className="hs-summary-box">
          {assessment.aiSummary?.summary ?? "No summary yet. Generate after the writeup and section details are ready."}
        </p>
        {assessment.aiSummary?.nextSteps?.length ? (
          <div className="hs-mini-list">
            {assessment.aiSummary.nextSteps.map((step) => <span key={step}>{step}</span>)}
          </div>
        ) : null}
        {references.length ? (
          <div className="hs-mini-list">
            {references.map((source) => <span key={source}>{source}</span>)}
          </div>
        ) : null}
      </Panel>

      {assessment.status === "finished" ? (
        <CheckoutPanel
          assessment={assessment}
          onPickPlan={onPickPlan}
          onPaymentOption={onPaymentOption}
          onNoteChange={onNoteChange}
        />
      ) : null}

      <div className="hs-section-grid">
        {sectionDefinitions.map((section) => {
          const filled = Boolean(assessment.sections[section.id]);
          return (
            <button key={section.id} type="button" className={`hs-section-tile ${filled ? "is-done" : ""}`} onClick={() => onOpenSection(section)}>
              <span>{section.emoji}</span>
              <strong>{section.label}</strong>
              <small>{filled ? "Saved" : "Open"}</small>
            </button>
          );
        })}
      </div>

      <Button type="button" wide onClick={onSave}>
        Save assessment
      </Button>
    </section>
  );
}

function SectionScreen({
  section,
  sectionDraft,
  onDraft,
  onBack,
  onSave,
}: {
  section: SectionDefinition;
  sectionDraft: SectionValue;
  onDraft: (value: SectionValue) => void;
  onBack: () => void;
  onSave: () => void;
}) {
  return (
    <section className="hs-page hs-narrow">
      <Button type="button" variant="ghost" onClick={onBack}>
        <ChevronLeft size={18} />
        Assessment
      </Button>
      <Panel>
        <p className="hs-kicker">Section details</p>
        <h1>{section.label}</h1>
        <div className="hs-form-grid">
          {section.fields.map((field) => (
            <div key={field.key}>
              <FieldLabel>{prettyLabel(field)}</FieldLabel>
              {field.kind === "text" || field.kind === "number" ? (
                <TextInput
                  type={field.kind}
                  aria-label={prettyLabel(field)}
                  value={sectionDraft[field.key] === undefined ? "" : String(sectionDraft[field.key])}
                  placeholder={field.placeholder ?? ""}
                  onChange={(event) =>
                    onDraft({
                      ...sectionDraft,
                      [field.key]: field.kind === "number" && event.target.value ? Number(event.target.value) : event.target.value,
                    })
                  }
                />
              ) : null}
              {field.kind === "select" ? (
                <SelectInput
                  aria-label={prettyLabel(field)}
                  value={String(sectionDraft[field.key] ?? "")}
                  onChange={(event) => onDraft({ ...sectionDraft, [field.key]: event.target.value })}
                >
                  <option value="">Choose one</option>
                  {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </SelectInput>
              ) : null}
              {field.kind === "toggle" ? (
                <button
                  type="button"
                  className={`hs-toggle-row ${sectionDraft[field.key] ? "is-on" : ""}`}
                  onClick={() => onDraft({ ...sectionDraft, [field.key]: !sectionDraft[field.key] })}
                >
                  <span>{sectionDraft[field.key] ? "Yes" : "No"}</span>
                  <Check size={18} />
                </button>
              ) : null}
              {field.kind === "condition" ? (
                <ConditionButtons
                  value={String(sectionDraft[field.key] ?? "")}
                  onChange={(value) => onDraft({ ...sectionDraft, [field.key]: value })}
                />
              ) : null}
              {field.kind === "notes" ? (
                <TextArea
                  aria-label={prettyLabel(field)}
                  value={String(sectionDraft[field.key] ?? "")}
                  placeholder={field.placeholder ?? ""}
                  onChange={(event) => onDraft({ ...sectionDraft, [field.key]: event.target.value })}
                />
              ) : null}
            </div>
          ))}
        </div>
        <Button type="button" wide onClick={onSave}>
          Save section
        </Button>
      </Panel>
    </section>
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
    startTransition(() => setSession(loadSession()));

    fetchAssessmentsFromApi()
      .then((nextAssessments) => {
        if (active) startTransition(() => setAssessments(nextAssessments));
      })
      .catch(() => {
        if (!active) return;
        startTransition(() => setAssessments([]));
        setDialog({
          tone: "error",
          title: "Could not load assessments",
          body: "The app could not reach the shared database yet. Check Supabase setup and try again.",
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
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const currentAssessment = assessments?.find((assessment) => assessment.id === currentId) ?? null;
  const townMatches = getMatches(ownerDraft.city, townOptions);
  const stateMatches = getMatches(ownerDraft.state, stateOptions);

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
  }

  function openNewAssessment() {
    setOwnerDraft(emptyOwner);
    setWriteupDraft("");
    setCurrentId(null);
    setView("owner");
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
      setDialog({ tone: "error", title: "Assessment could not be created", body: error instanceof Error ? error.message : "Please try again." });
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
        setAssessments((current) => (current ?? []).map((assessment) => (assessment.id === saved.id ? saved : assessment)));
        setCurrentId(saved.id);
        setWriteupDraft(saved.writeup ?? "");
        setCurrentSection(null);
        setView("menu");
      });
      showToast({ tone: "success", title: "Section saved", description: `${currentSection.label} was saved.` });
    } catch (error) {
      setDialog({ tone: "error", title: "Section could not be saved", body: error instanceof Error ? error.message : "Please try again." });
    }
  }

  async function updateAssessmentStatus(status: Assessment["status"]) {
    if (!currentAssessment) return;

    try {
      const saved = await updateAssessmentOnApi({ ...currentAssessment, status, updatedAt: new Date().toISOString() });
      startTransition(() => {
        setAssessments((current) => (current ?? []).map((assessment) => (assessment.id === saved.id ? saved : assessment)));
      });
    } catch (error) {
      setDialog({ tone: "error", title: "Status could not be updated", body: error instanceof Error ? error.message : "Please try again." });
    }
  }

  function askDeleteDraft(id: string) {
    const target = (assessments ?? []).find((assessment) => assessment.id === id);
    if (!target) return;

    setDialog({
      tone: "confirm",
      title: "Delete this draft?",
      body: `${target.owner.name}\n${formatOwnerAddress(target.owner)}\n${target.owner.phone}`,
      confirmLabel: "Delete",
      cancelLabel: "Keep",
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
          setDialog({ tone: "error", title: "Draft could not be deleted", body: error instanceof Error ? error.message : "Please try again." });
        }
      },
    });
  }

  async function saveAssessmentAndReturnHome() {
    if (!currentAssessment) return;

    const nextAssessment = { ...currentAssessment, updatedAt: new Date().toISOString(), writeup: writeupDraft.trim() };

    try {
      const saved = await updateAssessmentOnApi(nextAssessment);
      startTransition(() => {
        setAssessments((current) => (current ?? []).map((assessment) => (assessment.id === saved.id ? saved : assessment)));
        setCurrentId(null);
        setView("pipeline");
      });
      showToast({
        tone: "success",
        title: "Assessment saved",
        description: "Notes and receipt are ready from the pipeline.",
        actions: [
          { label: "Open notes", onClick: () => openNotesDocument(saved) },
          { label: "Download notes", onClick: () => downloadNotesDocument(saved) },
          { label: "Open receipt", onClick: () => openReceiptDocument(saved) },
          { label: "Download receipt", onClick: () => downloadReceiptDocument(saved) },
        ],
      });
    } catch (error) {
      setDialog({ tone: "error", title: "Assessment could not be saved", body: error instanceof Error ? error.message : "Please try again." });
    }
  }

  async function generateAiSummary() {
    if (!currentAssessment) return;
    setGeneratingAiSummary(true);

    try {
      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment: { ...currentAssessment, writeup: writeupDraft.trim() } }),
      });
      const payload = (await response.json()) as { summary: string; nextSteps: string[]; sources: string[] } | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Could not generate AI summary.");
      }

      const saved = await updateAssessmentOnApi({
        ...currentAssessment,
        updatedAt: new Date().toISOString(),
        writeup: writeupDraft.trim(),
        aiSummary: { ...payload, generatedAt: new Date().toISOString() },
      });

      startTransition(() => {
        setAssessments((current) => (current ?? []).map((assessment) => (assessment.id === saved.id ? saved : assessment)));
      });
      showToast({ tone: "success", title: "AI summary ready", description: "A homeowner-friendly summary was added." });
    } catch (error) {
      setDialog({ tone: "error", title: "AI summary could not be generated", body: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setGeneratingAiSummary(false);
    }
  }

  async function saveCheckout(nextCheckout: CheckoutData) {
    if (!currentAssessment) return;

    try {
      const saved = await updateAssessmentOnApi({
        ...currentAssessment,
        checkout: nextCheckout,
        updatedAt: new Date().toISOString(),
        writeup: writeupDraft.trim(),
      });
      startTransition(() => {
        setAssessments((current) => (current ?? []).map((assessment) => (assessment.id === saved.id ? saved : assessment)));
      });
      showToast({ tone: "success", title: "Checkout saved", description: `${nextCheckout.planName} is attached.` });
    } catch (error) {
      setDialog({ tone: "error", title: "Checkout could not be saved", body: error instanceof Error ? error.message : "Please try again." });
    }
  }

  function pickCheckoutPlan(plan: (typeof CHECKOUT_PLANS)[number]) {
    const existing = currentAssessment?.checkout;
    void saveCheckout({
      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,
      paymentOption: plan.id === "protection" ? existing?.paymentOption ?? "deposit-monthly" : "full",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      contractNote: existing?.contractNote ?? "",
    });
  }

  function updateCheckoutPayment(paymentOption: CheckoutData["paymentOption"]) {
    if (currentAssessment?.checkout) void saveCheckout({ ...currentAssessment.checkout, paymentOption });
  }

  function updateCheckoutNote(contractNote: string) {
    if (currentAssessment?.checkout) void saveCheckout({ ...currentAssessment.checkout, contractNote });
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
      <main className="hs-app-shell">
        <AppHeader session={session} onLogout={handleLogout} />
        {!session ? (
          <LoginScreen
            loginForm={loginForm}
            loginError={loginError}
            onChange={(key, value) => setLoginForm((current) => ({ ...current, [key]: value }))}
            onSubmit={handleLogin}
          />
        ) : null}
        {session && view === "pipeline" ? (
          <PipelineScreen
            assessments={assessments}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onNewAssessment={openNewAssessment}
            onOpenAssessment={openAssessment}
            onDeleteDraft={askDeleteDraft}
          />
        ) : null}
        {session && view === "owner" ? (
          <OwnerScreen
            ownerDraft={ownerDraft}
            townMatches={townMatches}
            stateMatches={stateMatches}
            onOwnerChange={setOwnerDraft}
            onCancel={() => setView("pipeline")}
            onSave={saveOwner}
          />
        ) : null}
        {session && view === "menu" && currentAssessment ? (
          <MenuScreen
            assessment={currentAssessment}
            writeupDraft={writeupDraft}
            generatingAiSummary={generatingAiSummary}
            onBack={() => setView("pipeline")}
            onStatus={updateAssessmentStatus}
            onDeleteDraft={askDeleteDraft}
            onWriteup={setWriteupDraft}
            onGenerateAiSummary={generateAiSummary}
            onPickPlan={pickCheckoutPlan}
            onPaymentOption={updateCheckoutPayment}
            onNoteChange={updateCheckoutNote}
            onOpenSection={openSection}
            onSave={saveAssessmentAndReturnHome}
          />
        ) : null}
        {session && view === "section" && currentSection ? (
          <SectionScreen
            section={currentSection}
            sectionDraft={sectionDraft}
            onDraft={setSectionDraft}
            onBack={() => setView("menu")}
            onSave={saveSection}
          />
        ) : null}
      </main>
    </>
  );
}
