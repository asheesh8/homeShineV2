"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, Phone, Mail, MapPin, X, RefreshCw, Inbox, Check, XCircle, Bell, MessageCircle, CalendarCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/field-app/ui";
import { CHECKOUT_PLANS } from "@/components/field-app/utils";
import { updateAssessment } from "@/components/field-app/api";
import { type Assessment, type BookingData } from "@/lib/simple-field";
import { type BookingRequest } from "@/app/api/booking-requests/route";

/* ── helpers ──────────────────────────────────────────────────────────── */

const DAYS_LONG  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmt12(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function addMinutes(time24: string, minutes: number): string {
  const [h, m] = time24.split(":").map(Number);
  const total  = h * 60 + m + minutes;
  const hh     = Math.floor(total / 60) % 24;
  const mm     = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function fmtDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h}.${m === 30 ? "5" : m} hr`;
}

function fmtDateLong(iso: string) {
  const [y, mo, d] = iso.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

const MORNING_SLOTS   = ["08:00","09:00","10:00","11:00"];
const AFTERNOON_SLOTS = ["13:00","14:00","15:00","16:00"];
const ALL_SLOTS       = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

/* Protection Plan follow-up schedule: offsets in months from initial service date */
const PROTECTION_VISITS = [
  { label: "Visit 1", detail: "Initial deep clean",      monthOffset: 0  },
  { label: "Visit 2", detail: "12-month maintenance",    monthOffset: 12 },
  { label: "Visit 3", detail: "18-month tune-up",        monthOffset: 18 },
];

interface FollowUp {
  assessment: Assessment;
  visitIndex: number;       // 0-based
  dueDate: Date;
  isOverdue: boolean;
  isDueSoon: boolean;       // within 30 days
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function buildFollowUps(assessments: Assessment[], today: Date): FollowUp[] {
  const results: FollowUp[] = [];
  const todayMs = today.getTime();
  const soon = 30 * 24 * 60 * 60 * 1000;

  for (const a of assessments) {
    if (a.checkout?.planId !== "protection") continue;
    const baseDateStr = a.booking?.date ?? a.createdAt;
    if (!baseDateStr) continue;
    const baseDate = new Date(baseDateStr.slice(0, 10) + "T12:00:00");
    // visits 1+ are tracked in followUpBookings by index (0 = initial, 1 = month 12, 2 = month 18)
    const scheduledCount = (a.followUpBookings?.length ?? 0) + 1; // +1 for the initial booking

    for (let i = 0; i < PROTECTION_VISITS.length; i++) {
      if (i < scheduledCount) continue; // already scheduled
      const visit = PROTECTION_VISITS[i];
      const due = addMonths(baseDate, visit.monthOffset);
      const dueMs = due.getTime();
      if (dueMs < todayMs - 60 * 24 * 60 * 60 * 1000) continue;

      results.push({
        assessment: a,
        visitIndex: i,
        dueDate: due,
        isOverdue: dueMs < todayMs,
        isDueSoon: dueMs >= todayMs && dueMs <= todayMs + soon,
      });
      break; // only show next unscheduled visit
    }
  }

  return results.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

/* chip colours cycling */
const CHIP_COLORS = [
  "var(--green)",
  "#2563eb",
  "#7c3aed",
  "#b45309",
  "#be185d",
  "#0e7490",
];

/* ──────────────────────────────────────────────────────────────────────── */

export function CalendarScreen({
  assessments,
  onAssessmentsChange,
  onBack,
}: {
  assessments: Assessment[];
  onAssessmentsChange: (updated: Assessment) => void;
  onBack: () => void;
}) {
  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  /* selected booking detail */
  const [detail, setDetail] = useState<Assessment | null>(null);

  /* selected booking request detail */
  const [detailReq, setDetailReq] = useState<BookingRequest | null>(null);

  /* reschedule modal state */
  const [rescheduling, setRescheduling]   = useState(false);
  const [reschedDate,  setReschedDate]    = useState("");
  const [reschedTime,  setReschedTime]    = useState("");
  const [saving,       setSaving]         = useState(false);

  /* booking requests inbox */
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const pendingCount = requests.filter(r => r.status === "pending").length;

  useEffect(() => {
    fetch("/api/booking-requests")
      .then(r => r.json())
      .then((d: BookingRequest[] | { error: string }) => {
        if (Array.isArray(d)) setRequests(d);
      })
      .catch(() => {});
  }, []);

  async function updateRequestStatus(id: string, status: "confirmed" | "declined") {
    const res = await fetch("/api/booking-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  }

  /* ── calendar grid ── */
  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr    = toLocalDateStr(today);

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  /* map date → list of assessments with bookings (initial + follow-up visits) */
  const byDate: Record<string, Assessment[]> = {};
  for (const a of assessments) {
    if (a.booking?.date) {
      const d = a.booking.date;
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(a);
    }
    for (const fu of a.followUpBookings ?? []) {
      const d = fu.date;
      if (!byDate[d]) byDate[d] = [];
      if (!byDate[d].includes(a)) byDate[d].push(a);
    }
  }

  /* confirmed booking requests shown as calendar chips too */
  const confirmedRequests = requests.filter(r => r.status === "confirmed");

  /* map date → confirmed requests */
  const reqByDate: Record<string, BookingRequest[]> = {};
  for (const r of confirmedRequests) {
    const d = r.requestedDate.slice(0, 10); // guard against any ISO suffix
    if (!reqByDate[d]) reqByDate[d] = [];
    reqByDate[d].push(r);
  }

  /* stable colour per assessment id */
  const allBooked = assessments.filter(a => a.booking?.date);
  const colorMap: Record<string, string> = {};
  allBooked.forEach((a, i) => { colorMap[a.id] = CHIP_COLORS[i % CHIP_COLORS.length]; });

  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  /* ── reschedule save ── */
  async function saveReschedule() {
    if (!detail || !reschedDate || !reschedTime) return;
    setSaving(true);
    try {
      const newBooking: BookingData = {
        ...detail.booking!,
        date: reschedDate,
        time: reschedTime,
      };
      const updated = await updateAssessment({ ...detail, booking: newBooking, updatedAt: new Date().toISOString() });
      onAssessmentsChange(updated);
      setDetail({ ...detail, booking: newBooking });
      setRescheduling(false);
    } catch {
      /* ignore — could add toast */
    } finally {
      setSaving(false);
    }
  }

  const plan = detail ? CHECKOUT_PLANS.find(p => p.id === detail.checkout?.planId) : null;
  const followUps = buildFollowUps(assessments, today);

  /* inline follow-up scheduling */
  const [schedulingId, setSchedulingId] = useState<string | null>(null); // `${assessmentId}-${visitIndex}`
  const [fuDate, setFuDate] = useState("");
  const [fuTime, setFuTime] = useState("");
  const [fuSaving, setFuSaving] = useState(false);

  async function saveFollowUp(fu: FollowUp) {
    if (!fuDate || !fuTime) return;
    setFuSaving(true);
    const visit = PROTECTION_VISITS[fu.visitIndex];
    const newBooking: BookingData = { date: fuDate, time: fuTime, visitLabel: visit.detail };
    const updatedFollowUps = [...(fu.assessment.followUpBookings ?? []), newBooking];
    const updated = { ...fu.assessment, followUpBookings: updatedFollowUps, updatedAt: new Date().toISOString() };
    try {
      const saved = await updateAssessment(updated);
      onAssessmentsChange(saved);
      setSchedulingId(null);
    } catch { /* ignore */ }
    setFuSaving(false);
  }

  return (
    <div className="hs-cal-screen">
      <div className="hs-cal-screen-header">
        <button type="button" className="hs-cal-back-btn" onClick={onBack} aria-label="Back to pipeline">
          <ArrowLeft size={16} /> Pipeline
        </button>
        <div>
          <h2 className="hs-cal-screen-title">Schedule</h2>
          <p className="hs-cal-screen-sub">All booked jobs — tap any to manage</p>
        </div>
      </div>

      {/* Month navigation */}
      <div className="hs-cal-screen-nav">
        <button type="button" className="hs-cal-nav" onClick={prevMonth}><ChevronLeft size={18} /></button>
        <span className="hs-cal-screen-month">{MONTHS[calMonth]} {calYear}</span>
        <button type="button" className="hs-cal-nav" onClick={nextMonth}><ChevronRight size={18} /></button>
      </div>

      {/* Full calendar grid */}
      <div className="hs-cal-screen-grid">
        {DAYS_SHORT.map(d => (
          <div key={d} className="hs-cal-screen-day-label">{d}</div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`pad-${i}`} className="hs-cal-screen-cell is-pad" />;

          const dateStr  = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday  = dateStr === todayStr;
          const isPast   = dateStr < todayStr;
          const jobs     = byDate[dateStr] ?? [];

          return (
            <div
              key={day}
              className={[
                "hs-cal-screen-cell",
                isToday ? "is-today" : "",
                isPast  ? "is-past"  : "",
              ].join(" ")}
            >
              <span className="hs-cal-screen-day-num">{day}</span>
              {jobs.map(a => {
                const fuBooking = (a.followUpBookings ?? []).find(fu => fu.date === dateStr);
                const chipBooking = fuBooking ?? a.booking;
                if (!chipBooking) return null;
                const isFollowUp = !!fuBooking;
                return (
                  <button
                    key={`${a.id}-${dateStr}`}
                    type="button"
                    className={`hs-cal-job-chip ${isFollowUp ? "hs-cal-followup-chip" : ""}`}
                    style={{ "--chip-color": isFollowUp ? "#7c3aed" : colorMap[a.id] } as React.CSSProperties}
                    onClick={() => { setDetail(a); setRescheduling(false); }}
                  >
                    <span className="hs-cal-job-time">{fmt12(chipBooking.time)}{isFollowUp ? " ↩" : ""}</span>
                    <span className="hs-cal-job-name">{a.owner.name.split(" ")[0]}</span>
                  </button>
                );
              })}
              {(reqByDate[dateStr] ?? []).map(r => (
                <button
                  key={r.id}
                  type="button"
                  className="hs-cal-job-chip hs-cal-req-chip"
                  title={`${r.name} — ${r.serviceType === "consultation" ? "Consultation" : "Assessment"}`}
                  onClick={() => { setDetailReq(r); setRescheduling(false); }}
                >
                  <span className="hs-cal-job-time">{fmt12(r.requestedTime)}</span>
                  <span className="hs-cal-job-name">{r.name.split(" ")[0]} ✦</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Upcoming jobs list (below calendar) */}
      <div className="hs-cal-upcoming">
        <p className="hs-cal-upcoming-label">Upcoming this month</p>
        {(() => {
          const prefix = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;

          const upcomingAssessments = assessments
            .filter(a => a.booking?.date?.startsWith(prefix) && a.booking.date >= todayStr)
            .map(a => ({ type: "assessment" as const, sortKey: a.booking!.date + a.booking!.time, a }));

          const upcomingFollowUps = assessments.flatMap(a =>
            (a.followUpBookings ?? [])
              .filter(fu => fu.date.startsWith(prefix) && fu.date >= todayStr)
              .map(fu => ({ type: "followup" as const, sortKey: fu.date + fu.time, a, fu }))
          );

          const upcomingRequests = confirmedRequests
            .filter(r => r.requestedDate.startsWith(prefix) && r.requestedDate >= todayStr)
            .map(r => ({ type: "request" as const, sortKey: r.requestedDate + r.requestedTime, r }));

          const all = [...upcomingAssessments, ...upcomingFollowUps, ...upcomingRequests]
            .sort((x, y) => x.sortKey.localeCompare(y.sortKey));

          if (!all.length) return (
            <p style={{ fontSize: 13, color: "var(--muted)", padding: "12px 0" }}>No bookings this month.</p>
          );

          return all.map(item => {
            if (item.type === "followup") {
              const { a, fu } = item;
              return (
                <div key={`${a.id}-${fu.date}-${fu.time}`} className="hs-cal-upcoming-row" style={{ cursor: "default" }}>
                  <span className="hs-cal-upcoming-dot" style={{ background: colorMap[a.id], outline: "2px solid var(--green)", outlineOffset: 1 }} />
                  <div className="hs-cal-upcoming-info">
                    <strong>{a.owner.name}</strong>
                    <span>{fmtDateLong(fu.date)} at {fmt12(fu.time)}</span>
                    <span className="hs-cal-upcoming-plan" style={{ color: "var(--green)" }}>↩ {fu.visitLabel ?? "Protection Plan Visit"}</span>
                  </div>
                  <span className="hs-cal-upcoming-addr">{a.owner.city}</span>
                </div>
              );
            }
            if (item.type === "assessment") {
              const a = item.a;
              const p = CHECKOUT_PLANS.find(pl => pl.id === a.checkout?.planId);
              return (
                <button key={a.id} type="button" className="hs-cal-upcoming-row"
                  onClick={() => { setDetail(a); setRescheduling(false); }}>
                  <span className="hs-cal-upcoming-dot" style={{ background: colorMap[a.id] }} />
                  <div className="hs-cal-upcoming-info">
                    <strong>{a.owner.name}</strong>
                    <span>{fmtDateLong(a.booking!.date)} at {fmt12(a.booking!.time)}</span>
                    {p && <span className="hs-cal-upcoming-plan">{p.name}</span>}
                  </div>
                  <span className="hs-cal-upcoming-addr">{a.owner.city}</span>
                </button>
              );
            }
            const r = item.r;
            return (
              <button key={r.id} type="button" className="hs-cal-upcoming-row" onClick={() => { setDetailReq(r); setRescheduling(false); }}>
                <span className="hs-cal-upcoming-dot" style={{ background: "#2563eb" }} />
                <div className="hs-cal-upcoming-info">
                  <strong>{r.name} <span style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: ".06em" }}>✦ Request</span></strong>
                  <span>{fmtDateLong(r.requestedDate)} at {fmt12(r.requestedTime)}</span>
                  <span className="hs-cal-upcoming-plan" style={{ color: "#2563eb" }}>
                    {r.serviceType === "consultation" ? "Consultation" : "Home Assessment"}
                  </span>
                </div>
                <span className="hs-cal-upcoming-addr">{r.city}</span>
              </button>
            );
          });
        })()}
      </div>

      {/* ── Protection Plan Follow-ups ── */}
      <div className="hs-cal-followups">
        <p className="hs-cal-upcoming-label">
          <Bell size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
          Protection Plan Follow-ups
          {followUps.filter(f => f.isOverdue || f.isDueSoon).length > 0 && (
            <span className="hs-cal-req-badge" style={{ background: "#fef3c7", color: "#b45309" }}>
              {followUps.filter(f => f.isOverdue || f.isDueSoon).length} need attention
            </span>
          )}
        </p>

        {followUps.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", padding: "10px 0" }}>
            No Protection Plan clients with upcoming follow-ups.
          </p>
        ) : (
          <div className="hs-followup-list">
            {followUps.map(fu => {
              const visit = PROTECTION_VISITS[fu.visitIndex];
              const rowKey = `${fu.assessment.id}-${fu.visitIndex}`;
              const clientFirst = (fu.assessment.owner.name || "Client").split(" ")[0];
              const phone = (fu.assessment.owner.phone || "").replace(/\D/g, "");
              const smsMsg = encodeURIComponent(
                `Hey ${clientFirst}, this is Steven from HomeShine! It's time for your ${visit.detail} — let's get you scheduled. What works best for you?`
              );
              const smsHref = phone ? `sms:${phone}?body=${smsMsg}` : undefined;
              const statusClass = fu.isOverdue ? "is-overdue" : fu.isDueSoon ? "is-soon" : "";
              const isScheduling = schedulingId === rowKey;

              return (
                <div key={rowKey} className={`hs-followup-row ${statusClass}`}>
                  {/* top row: identity + contact actions */}
                  <div className="hs-followup-top">
                    <div className="hs-followup-left">
                      <div className="hs-followup-visit-badge">
                        {fu.visitIndex + 1}<span>/3</span>
                      </div>
                      <div className="hs-followup-info">
                        <strong>{fu.assessment.owner.name}</strong>
                        <span className="hs-followup-visit">{visit.label} · {visit.detail}</span>
                        <span className={`hs-followup-due ${statusClass}`}>
                          {fu.isOverdue ? "⚠ Overdue · " : ""}
                          Due {fu.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {fu.assessment.owner.phone && (
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>{fu.assessment.owner.phone}</span>
                        )}
                      </div>
                    </div>
                    <div className="hs-followup-actions">
                      {smsHref && (
                        <a href={smsHref} className="hs-followup-sms-btn" title="Text client" target="_blank" rel="noopener noreferrer">
                          <MessageCircle size={14} /> Text
                        </a>
                      )}
                      {fu.assessment.owner.phone && (
                        <a href={`tel:${fu.assessment.owner.phone}`} className="hs-followup-call-btn" title="Call client" target="_blank" rel="noopener noreferrer">
                          <Phone size={14} /> Call
                        </a>
                      )}
                    </div>
                  </div>

                  {/* schedule button / inline picker */}
                  {!isScheduling ? (
                    <button
                      type="button"
                      className="hs-followup-schedule-btn"
                      onClick={() => { setSchedulingId(rowKey); setFuDate(""); setFuTime(""); }}
                    >
                      <RefreshCw size={13} /> Schedule this visit
                    </button>
                  ) : (
                    <div className="hs-followup-scheduler">
                      <p className="hs-followup-scheduler-label">Pick a date &amp; time for {visit.detail}</p>
                      <input
                        type="date"
                        className="hs-cal-date-input"
                        value={fuDate}
                        min={todayStr}
                        onChange={e => setFuDate(e.target.value)}
                      />
                      <div className="hs-time-slots" style={{ flexWrap: "wrap", marginTop: 10 }}>
                        {ALL_SLOTS.map(t => (
                          <button
                            key={t}
                            type="button"
                            className={`hs-time-slot ${fuTime === t ? "is-selected" : ""}`}
                            onClick={() => setFuTime(t)}
                          >
                            {fmt12(t)}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <Button type="button" variant="secondary" onClick={() => setSchedulingId(null)} style={{ flex: 1 }}>
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          disabled={!fuDate || !fuTime || fuSaving}
                          style={{ flex: 1 }}
                          onClick={() => saveFollowUp(fu)}
                        >
                          {fuSaving ? "Saving…" : "Confirm visit"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Booking requests inbox ── */}
      <div className="hs-cal-requests">
        <p className="hs-cal-upcoming-label">
          <Inbox size={12} style={{ display:"inline", verticalAlign:"middle", marginRight:4 }}/>
          Booking requests
          {pendingCount > 0 && <span className="hs-cal-req-badge">{pendingCount} new</span>}
        </p>
        {requests.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", padding: "12px 0" }}>No booking requests yet.</p>
        ) : (
          requests.map(req => (
            <div key={req.id} className={`hs-cal-req-row ${req.status !== "pending" ? "is-actioned" : ""}`}>
              <div className="hs-cal-req-info">
                <strong>{req.name}</strong>
                <span>{fmtDateLong(req.requestedDate)} at {fmt12(req.requestedTime)}</span>
                <span style={{ textTransform:"capitalize", fontSize: 11, fontWeight: 700, color: req.serviceType === "consultation" ? "#2563eb" : "var(--green)" }}>
                  {req.serviceType === "consultation" ? "Consultation" : "Home Assessment"} · {req.city}
                </span>
                {req.message && <span className="hs-cal-req-msg">&ldquo;{req.message}&rdquo;</span>}
              </div>
              <div className="hs-cal-req-contact">
                <a href={`tel:${req.phone}`} className="hs-cal-contact-btn" style={{ fontSize: 12, padding: "5px 10px" }}><Phone size={12}/> {req.phone}</a>
                <a href={`mailto:${req.email}`} className="hs-cal-contact-btn" style={{ fontSize: 12, padding: "5px 10px" }}><Mail size={12}/> Email</a>
              </div>
              {req.status === "pending" ? (
                <div className="hs-cal-req-actions">
                  <button type="button" className="hs-cal-req-btn is-confirm" onClick={() => updateRequestStatus(req.id, "confirmed")}>
                    <Check size={13}/> Confirm
                  </button>
                  <button type="button" className="hs-cal-req-btn is-decline" onClick={() => updateRequestStatus(req.id, "declined")}>
                    <XCircle size={13}/> Decline
                  </button>
                </div>
              ) : (
                <span className={`hs-cal-req-status ${req.status === "confirmed" ? "is-confirmed" : "is-declined"}`}>
                  {req.status === "confirmed" ? "✓ Confirmed" : "✕ Declined"}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Booking request detail drawer ── */}
      {detailReq && (() => {
        const req = detailReq;
        return (
          <div className="hs-cal-drawer-overlay" onClick={() => setDetailReq(null)}>
            <div className="hs-cal-drawer" onClick={e => e.stopPropagation()}>
              <div className="hs-cal-drawer-header">
                <div>
                  <p className="hs-cal-drawer-eyebrow" style={{ color: "#2563eb" }}>
                    {req.serviceType === "consultation" ? "Consultation Request" : "Home Assessment Request"}
                  </p>
                  <h3 className="hs-cal-drawer-name">{req.name}</h3>
                </div>
                <button type="button" className="hs-cal-drawer-close" onClick={() => setDetailReq(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="hs-cal-drawer-body">
                {/* Time */}
                <div className="hs-cal-drawer-time-block">
                  <p className="hs-cal-drawer-time-date">{fmtDateLong(req.requestedDate)}</p>
                  <p className="hs-cal-drawer-time-time">{fmt12(req.requestedTime)}</p>
                  <p className="hs-cal-drawer-duration" style={{ color: "#2563eb" }}>
                    {req.city}{req.street ? ` · ${req.street}` : ""}
                  </p>
                </div>

                {/* Contact */}
                <div className="hs-cal-drawer-contact">
                  <a href={`tel:${req.phone}`} className="hs-cal-contact-btn"><Phone size={14}/> {req.phone}</a>
                  <a href={`mailto:${req.email}`} className="hs-cal-contact-btn"><Mail size={14}/> {req.email}</a>
                </div>

                {req.message && (
                  <div className="hs-cal-drawer-note">
                    <p className="hs-cal-drawer-note-label">Their message</p>
                    <p>&ldquo;{req.message}&rdquo;</p>
                  </div>
                )}

                {/* Status badge */}
                <div style={{ marginTop: 8 }}>
                  <span className={`hs-cal-req-status ${req.status === "confirmed" ? "is-confirmed" : req.status === "declined" ? "is-declined" : ""}`}
                    style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: req.status === "pending" ? "#fef3c7" : undefined, color: req.status === "pending" ? "#b45309" : undefined }}>
                    {req.status === "confirmed" ? "✓ Confirmed" : req.status === "declined" ? "✕ Declined" : "⏳ Pending"}
                  </span>
                </div>

                {/* Reschedule */}
                {!rescheduling ? (
                  <Button type="button" variant="secondary"
                    onClick={() => { setReschedDate(req.requestedDate); setReschedTime(req.requestedTime); setRescheduling(true); }}
                    style={{ width: "100%", marginTop: 12 }}>
                    <RefreshCw size={14}/> Reschedule
                  </Button>
                ) : (
                  <div className="hs-cal-reschedule-box">
                    <p className="hs-cal-drawer-note-label">New date</p>
                    <input type="date" className="hs-cal-date-input" value={reschedDate} min={todayStr}
                      onChange={e => setReschedDate(e.target.value)} />
                    <p className="hs-cal-drawer-note-label" style={{ marginTop: 10 }}>New time</p>
                    <div className="hs-time-slots" style={{ flexWrap: "wrap" }}>
                      {ALL_SLOTS.map(t => (
                        <button key={t} type="button"
                          className={`hs-time-slot ${reschedTime === t ? "is-selected" : ""}`}
                          onClick={() => setReschedTime(t)}>
                          {fmt12(t)}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <Button type="button" variant="secondary" onClick={() => setRescheduling(false)} style={{ flex: 1 }}>
                        Cancel
                      </Button>
                      <Button type="button" disabled={!reschedDate || !reschedTime || saving} style={{ flex: 1 }}
                        onClick={async () => {
                          setSaving(true);
                          const res = await fetch("/api/booking-requests", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: req.id, requestedDate: reschedDate, requestedTime: reschedTime }),
                          });
                          if (res.ok) {
                            const updated: BookingRequest = await res.json();
                            setRequests(prev => prev.map(r => r.id === req.id ? updated : r));
                            setDetailReq(updated);
                            setRescheduling(false);
                          }
                          setSaving(false);
                        }}>
                        {saving ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Detail drawer ── */}
      {detail && (
        <div className="hs-cal-drawer-overlay" onClick={() => setDetail(null)}>
          <div className="hs-cal-drawer" onClick={e => e.stopPropagation()}>
            <div className="hs-cal-drawer-header">
              <div>
                <p className="hs-cal-drawer-eyebrow">{plan?.name ?? "Service"}</p>
                <h3 className="hs-cal-drawer-name">{detail.owner.name}</h3>
              </div>
              <button type="button" className="hs-cal-drawer-close" onClick={() => setDetail(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="hs-cal-drawer-body">
              {/* Booking time */}
              <div className="hs-cal-drawer-time-block">
                <p className="hs-cal-drawer-time-date">{detail.booking ? fmtDateLong(detail.booking.date) : "—"}</p>
                <p className="hs-cal-drawer-time-time">
                  {detail.booking ? fmt12(detail.booking.time) : ""}
                  {detail.booking?.duration
                    ? ` → ${fmt12(addMinutes(detail.booking.time, detail.booking.duration))}`
                    : ""}
                </p>
                {detail.booking?.duration && (
                  <p className="hs-cal-drawer-duration">{fmtDuration(detail.booking.duration)} window</p>
                )}
                {detail.booking?.visitLabel && (
                  <p className="hs-cal-drawer-visit-label">{detail.booking.visitLabel}</p>
                )}
              </div>

              {/* Contact */}
              <div className="hs-cal-drawer-contact">
                <a href={`tel:${detail.owner.phone}`} className="hs-cal-contact-btn">
                  <Phone size={14} /> {detail.owner.phone}
                </a>
                <a href={`mailto:${detail.owner.email}`} className="hs-cal-contact-btn">
                  <Mail size={14} /> {detail.owner.email}
                </a>
              </div>
              <div className="hs-cal-drawer-address">
                <MapPin size={12} />
                {detail.owner.street}, {detail.owner.city}, {detail.owner.state}
              </div>

              {detail.booking?.note && (
                <div className="hs-cal-drawer-note">
                  <p className="hs-cal-drawer-note-label">Visit note</p>
                  <p>{detail.booking.note}</p>
                </div>
              )}
              {detail.checkout?.contractNote && (
                <div className="hs-cal-drawer-note">
                  <p className="hs-cal-drawer-note-label">Access &amp; scheduling</p>
                  <p>{detail.checkout.contractNote}</p>
                </div>
              )}

              {/* Reschedule */}
              {!rescheduling ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setReschedDate(detail.booking?.date ?? "");
                    setReschedTime(detail.booking?.time ?? "");
                    setRescheduling(true);
                  }}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  <RefreshCw size={14} /> Reschedule
                </Button>
              ) : (
                <div className="hs-cal-reschedule-box">
                  <p className="hs-cal-drawer-note-label">New date</p>
                  <input
                    type="date"
                    className="hs-cal-date-input"
                    value={reschedDate}
                    min={todayStr}
                    onChange={e => setReschedDate(e.target.value)}
                  />
                  <p className="hs-cal-drawer-note-label" style={{ marginTop: 10 }}>New time</p>
                  <div className="hs-time-slots" style={{ flexWrap: "wrap" }}>
                    {ALL_SLOTS.map(t => (
                      <button
                        key={t}
                        type="button"
                        className={`hs-time-slot ${reschedTime === t ? "is-selected" : ""}`}
                        onClick={() => setReschedTime(t)}
                      >
                        {fmt12(t)}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <Button type="button" variant="secondary" onClick={() => setRescheduling(false)} style={{ flex: 1 }}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={saveReschedule}
                      disabled={!reschedDate || !reschedTime || saving}
                      style={{ flex: 1 }}
                    >
                      {saving ? "Saving…" : "Save"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
