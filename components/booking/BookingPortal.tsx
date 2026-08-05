"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, CalendarDays, Home, MessageSquare, User, type LucideIcon } from "lucide-react";

/* ── types ─────────────────────────────────────────────────────────────── */

type Step = "service" | "datetime" | "info" | "confirm" | "done";

type FormData = {
  serviceType: "consultation" | "assessment" | "";
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  message: string;
};

type ServiceOption = {
  id: Exclude<FormData["serviceType"], "">;
  label: string;
  duration: string;
  desc: string;
  icon: LucideIcon;
};

/* ── constants ──────────────────────────────────────────────────────────── */

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const MORNING_SLOTS   = ["08:00","09:00","10:00","11:00"];
const AFTERNOON_SLOTS = ["13:00","14:00","15:00","16:00"];

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "consultation" as const,
    label: "Free Consultation",
    duration: "~45 min",
    desc: "Steven visits your property, walks through what needs attention, and gives you a no-pressure quote.",
    icon: MessageSquare,
  },
  {
    id: "assessment" as const,
    label: "Full Home Assessment",
    duration: "~2 hr",
    desc: "A detailed inspection of every exterior surface with a written report, AI-powered recommendations, and a full service plan.",
    icon: Home,
  },
];

const VT_TOWNS = [
  "Burlington","South Burlington","Winooski","Essex","Essex Junction","Colchester","Williston",
  "Shelburne","Charlotte","Hinesburg","Richmond","Jericho","Underhill","Milton","Montpelier",
  "Barre","Waterbury","Northfield","Stowe","Morrisville","Middlebury","Vergennes","Bristol",
  "Rutland","Bennington","Manchester","Brattleboro","Springfield","Hartford","Woodstock",
  "St. Johnsbury","Other",
];

/* ── helpers ────────────────────────────────────────────────────────────── */

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h%12||12}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"}`;
}

function fmtDateLong(iso: string) {
  const [y,mo,d] = iso.split("-").map(Number);
  return new Date(y, mo-1, d).toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
}

/* ── main component ─────────────────────────────────────────────────────── */

export function BookingPortal() {
  const [step, setStep] = useState<Step>("service");
  const [form, setForm] = useState<FormData>({
    serviceType: "", date: "", time: "",
    name: "", email: "", phone: "", street: "", city: "", state: "VT", message: "",
  });
  const [calYear,  setCalYear]  = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [bookedSlots, setBookedSlots] = useState<{ date: string; time: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* load booked slots once */
  useEffect(() => {
    fetch("/api/available-slots")
      .then(r => r.json())
      .then((d: { booked?: { date: string; time: string }[] }) => {
        if (d.booked) setBookedSlots(d.booked);
      })
      .catch(() => {});
  }, []);

  const today = new Date();
  const todayStr = toLocalDateStr(today);

  /* set of times already taken on the selected date */
  const takenTimes = new Set(
    bookedSlots.filter(s => s.date === form.date).map(s => s.time)
  );

  /* set of dates with at least one booking (for calendar dots) */
  const busyDates = new Set(bookedSlots.map(s => s.date));
  const selectedService = SERVICE_OPTIONS.find(s => s.id === form.serviceType);
  const SelectedServiceIcon = selectedService?.icon ?? MessageSquare;

  /* calendar grid */
  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const cells: (number|null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i+1),
  ];

  function patch(p: Partial<FormData>) { setForm(f => ({ ...f, ...p })); }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y-1); setCalMonth(11); }
    else setCalMonth(m => m-1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y+1); setCalMonth(0); }
    else setCalMonth(m => m+1);
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          form.name,
          email:         form.email,
          phone:         form.phone,
          street:        form.street || undefined,
          city:          form.city,
          state:         form.state,
          serviceType:   form.serviceType,
          requestedDate: form.date,
          requestedTime: form.time,
          message:       form.message || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Something went wrong.");
      }
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── DONE screen ── */
  if (step === "done") {
    return (
      <div className="bp-done">
        <CheckCircle2 size={56} className="bp-done-icon" />
        <h2>You&rsquo;re on the schedule!</h2>
        <p className="bp-done-sub">
          Steven will confirm your {form.serviceType === "consultation" ? "consultation" : "assessment"} and reach out within 24 hours.
        </p>
        <div className="bp-done-summary">
          <p><strong>{fmtDateLong(form.date)}</strong></p>
          <p>{fmt12(form.time)} · {selectedService?.label}</p>
          <p style={{ color: "var(--bp-muted)", marginTop: 4 }}>{form.name} · {form.phone}</p>
        </div>
        <p className="bp-done-note">
          Questions? Call or text <a href="tel:+18023919977">802-391-9977</a> or email <a href="mailto:steven@homeshinevt.com">steven@homeshinevt.com</a>
        </p>
      </div>
    );
  }

  return (
    <div className="bp-shell">

      {/* ── progress bar ── */}
      <div className="bp-progress">
        {(["service","datetime","info","confirm"] as Step[]).map((s, i) => (
          <div key={s} className={`bp-progress-step ${step === s ? "is-active" : (["service","datetime","info","confirm"].indexOf(step) > i ? "is-done" : "")}`}>
            <div className="bp-progress-dot">{["service","datetime","info","confirm"].indexOf(step) > i ? "✓" : i+1}</div>
            <span className="bp-progress-label">{["Service","Date & Time","Your Info","Confirm"][i]}</span>
          </div>
        ))}
      </div>

      {/* ═══════════════ STEP: SERVICE ═══════════════ */}
      {step === "service" && (
        <div className="bp-step">
          <div className="bp-step-heading">
            <h2>What can we help with?</h2>
            <p>Pick the type of visit you&rsquo;d like to schedule.</p>
          </div>
          <div className="bp-service-grid">
            {SERVICE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`bp-service-card ${form.serviceType === opt.id ? "is-selected" : ""}`}
                  onClick={() => { patch({ serviceType: opt.id }); setStep("datetime"); }}
                >
                  <span className="bp-service-icon">
                    <Icon size={24} />
                  </span>
                  <div>
                    <p className="bp-service-label">{opt.label}</p>
                    <p className="bp-service-duration">{opt.duration}</p>
                    <p className="bp-service-desc">{opt.desc}</p>
                  </div>
                  {form.serviceType === opt.id && <span className="bp-service-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════ STEP: DATE & TIME ═══════════════ */}
      {step === "datetime" && (
        <div className="bp-step">
          <div className="bp-step-heading">
            <h2>Pick a date &amp; time</h2>
            <p>Choose a day that works for you. Slots shown are available.</p>
          </div>

          {/* Calendar */}
          <div className="bp-cal-wrap">
            <div className="bp-cal-header">
              <button type="button" className="bp-cal-nav" onClick={prevMonth}><ChevronLeft size={18}/></button>
              <span className="bp-cal-month">{MONTHS[calMonth]} {calYear}</span>
              <button type="button" className="bp-cal-nav" onClick={nextMonth}><ChevronRight size={18}/></button>
            </div>
            <div className="bp-cal-grid">
              {DAYS_SHORT.map(d => <div key={d} className="bp-cal-dow">{d}</div>)}
              {cells.map((day, i) => {
                if (!day) return <div key={`p${i}`}/>;
                const ds   = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const past = ds < todayStr;
                const busy = busyDates.has(ds);
                const sel  = ds === form.date;
                const sun  = new Date(calYear, calMonth, day).getDay() === 0; // no Sundays
                const disabled = past || sun;
                return (
                  <button
                    key={day} type="button" disabled={disabled}
                    className={`bp-cal-day ${sel?"is-sel":""} ${past||sun?"is-off":""} ${busy&&!sel?"is-busy":""} ${ds===todayStr?"is-today":""}`}
                    onClick={() => { if (!disabled) { patch({ date: ds, time: "" }); }}}
                    title={sun ? "Not available Sundays" : busy ? "Limited slots" : undefined}
                  >
                    <span>{day}</span>
                    {busy && !disabled && <span className="bp-cal-dot"/>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {form.date && (
            <div className="bp-time-wrap">
              <p className="bp-time-heading">Available times for <strong>{fmtDateLong(form.date)}</strong></p>
              <div className="bp-time-group">
                <p className="bp-time-group-label">Morning</p>
                <div className="bp-time-slots">
                  {MORNING_SLOTS.map(t => {
                    const taken = takenTimes.has(t);
                    return (
                      <button key={t} type="button" disabled={taken}
                        className={`bp-time-slot ${form.time===t?"is-sel":""} ${taken?"is-taken":""}`}
                        onClick={() => !taken && patch({ time: t })}>
                        {fmt12(t)}{taken ? " · Taken" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bp-time-group">
                <p className="bp-time-group-label">Afternoon</p>
                <div className="bp-time-slots">
                  {AFTERNOON_SLOTS.map(t => {
                    const taken = takenTimes.has(t);
                    return (
                      <button key={t} type="button" disabled={taken}
                        className={`bp-time-slot ${form.time===t?"is-sel":""} ${taken?"is-taken":""}`}
                        onClick={() => !taken && patch({ time: t })}>
                        {fmt12(t)}{taken ? " · Taken" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="bp-nav-row">
            <button type="button" className="bp-back" onClick={() => setStep("service")}><ChevronLeft size={15}/> Back</button>
            <button
              type="button" className="bp-next"
              disabled={!form.date || !form.time}
              onClick={() => setStep("info")}
            >
              Continue <ChevronRight size={15}/>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP: INFO ═══════════════ */}
      {step === "info" && (
        <div className="bp-step">
          <div className="bp-step-heading">
            <h2>Tell us about yourself</h2>
            <p>So Steven knows who he&rsquo;s coming to see and where.</p>
          </div>

          <div className="bp-form">
            <div className="bp-form-row">
              <div className="bp-field">
                <label className="bp-label"><User size={12}/> Full name *</label>
                <input className="bp-input" placeholder="Jane Smith" value={form.name}
                  onChange={e => patch({ name: e.target.value })} />
              </div>
            </div>
            <div className="bp-form-row two-col">
              <div className="bp-field">
                <label className="bp-label">Phone *</label>
                <input className="bp-input" type="tel" placeholder="802-391-9977" value={form.phone}
                  onChange={e => patch({ phone: e.target.value })} />
              </div>
              <div className="bp-field">
                <label className="bp-label">Email *</label>
                <input className="bp-input" type="email" placeholder="jane@email.com" value={form.email}
                  onChange={e => patch({ email: e.target.value })} />
              </div>
            </div>
            <div className="bp-form-row">
              <div className="bp-field">
                <label className="bp-label"><Home size={12}/> Street address <span className="bp-label-opt">(optional)</span></label>
                <input className="bp-input" placeholder="123 Maple St" value={form.street}
                  onChange={e => patch({ street: e.target.value })} />
              </div>
            </div>
            <div className="bp-form-row two-col">
              <div className="bp-field">
                <label className="bp-label">Town / City *</label>
                <select className="bp-input" value={form.city} onChange={e => patch({ city: e.target.value })}>
                  <option value="">Select a town…</option>
                  {VT_TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="bp-field">
                <label className="bp-label">State</label>
                <input className="bp-input" value={form.state} onChange={e => patch({ state: e.target.value })} />
              </div>
            </div>
            <div className="bp-form-row">
              <div className="bp-field">
                <label className="bp-label"><MessageSquare size={12}/> Anything Steven should know? <span className="bp-label-opt">(optional)</span></label>
                <textarea className="bp-input bp-textarea" rows={3}
                  placeholder="Type of siding, driveway access, pets, specific concerns…"
                  value={form.message} onChange={e => patch({ message: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="bp-nav-row">
            <button type="button" className="bp-back" onClick={() => setStep("datetime")}><ChevronLeft size={15}/> Back</button>
            <button
              type="button" className="bp-next"
              disabled={!form.name || !form.email || !form.phone || !form.city}
              onClick={() => setStep("confirm")}
            >
              Review <ChevronRight size={15}/>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP: CONFIRM ═══════════════ */}
      {step === "confirm" && (
        <div className="bp-step">
          <div className="bp-step-heading">
            <h2>Confirm your booking</h2>
            <p>Looks good? Hit confirm and Steven will be in touch.</p>
          </div>

          <div className="bp-confirm-card">
            <div className="bp-confirm-row">
              <CalendarDays size={16} className="bp-confirm-icon"/>
              <div>
                <p className="bp-confirm-label">Date &amp; time</p>
                <p className="bp-confirm-val">{fmtDateLong(form.date)} at {fmt12(form.time)}</p>
              </div>
            </div>
            <div className="bp-confirm-row">
              <SelectedServiceIcon size={16} className="bp-confirm-icon"/>
              <div>
                <p className="bp-confirm-label">Service</p>
                <p className="bp-confirm-val">{selectedService?.label ?? form.serviceType}</p>
              </div>
            </div>
            <div className="bp-confirm-row">
              <User size={16} className="bp-confirm-icon"/>
              <div>
                <p className="bp-confirm-label">Contact</p>
                <p className="bp-confirm-val">{form.name}</p>
                <p className="bp-confirm-sub">{form.phone} · {form.email}</p>
              </div>
            </div>
            <div className="bp-confirm-row">
              <Home size={16} className="bp-confirm-icon"/>
              <div>
                <p className="bp-confirm-label">Location</p>
                <p className="bp-confirm-val">{form.street ? `${form.street}, ` : ""}{form.city}, {form.state}</p>
              </div>
            </div>
            {form.message && (
              <div className="bp-confirm-row">
                <MessageSquare size={16} className="bp-confirm-icon"/>
                <div>
                  <p className="bp-confirm-label">Note</p>
                  <p className="bp-confirm-sub" style={{ color: "var(--bp-ink)" }}>{form.message}</p>
                </div>
              </div>
            )}
          </div>

          {error && <p className="bp-error">{error}</p>}

          <div className="bp-nav-row">
            <button type="button" className="bp-back" onClick={() => setStep("info")}><ChevronLeft size={15}/> Back</button>
            <button
              type="button" className="bp-next bp-next--confirm"
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? "Sending…" : "Confirm booking"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
