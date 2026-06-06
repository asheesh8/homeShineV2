"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, Phone, Mail, MapPin, X, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/field-app/ui";
import { CHECKOUT_PLANS } from "@/components/field-app/utils";
import { updateAssessment } from "@/components/field-app/api";
import { type Assessment, type BookingData } from "@/lib/simple-field";

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

function fmtDateLong(iso: string) {
  const [y, mo, d] = iso.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

const MORNING_SLOTS   = ["08:00","09:00","10:00","11:00"];
const AFTERNOON_SLOTS = ["13:00","14:00","15:00","16:00"];
const ALL_SLOTS       = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

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

  /* reschedule modal state */
  const [rescheduling, setRescheduling]   = useState(false);
  const [reschedDate,  setReschedDate]    = useState("");
  const [reschedTime,  setReschedTime]    = useState("");
  const [saving,       setSaving]         = useState(false);

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

  /* map date → list of assessments with bookings */
  const byDate: Record<string, Assessment[]> = {};
  for (const a of assessments) {
    if (!a.booking?.date) continue;
    const d = a.booking.date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(a);
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
              {jobs.map(a => (
                <button
                  key={a.id}
                  type="button"
                  className="hs-cal-job-chip"
                  style={{ "--chip-color": colorMap[a.id] } as React.CSSProperties}
                  onClick={() => { setDetail(a); setRescheduling(false); }}
                >
                  <span className="hs-cal-job-time">{fmt12(a.booking!.time)}</span>
                  <span className="hs-cal-job-name">{a.owner.name.split(" ")[0]}</span>
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
          const upcoming = assessments
            .filter(a => a.booking?.date?.startsWith(prefix) && a.booking.date >= todayStr)
            .sort((a, b) => (a.booking!.date + a.booking!.time).localeCompare(b.booking!.date + b.booking!.time));

          if (!upcoming.length) return (
            <p style={{ fontSize: 13, color: "var(--muted)", padding: "12px 0" }}>No bookings this month.</p>
          );

          return upcoming.map(a => {
            const p = CHECKOUT_PLANS.find(pl => pl.id === a.checkout?.planId);
            return (
              <button
                key={a.id}
                type="button"
                className="hs-cal-upcoming-row"
                onClick={() => { setDetail(a); setRescheduling(false); }}
              >
                <span className="hs-cal-upcoming-dot" style={{ background: colorMap[a.id] }} />
                <div className="hs-cal-upcoming-info">
                  <strong>{a.owner.name}</strong>
                  <span>{fmtDateLong(a.booking!.date)} at {fmt12(a.booking!.time)}</span>
                  {p && <span className="hs-cal-upcoming-plan">{p.name}</span>}
                </div>
                <span className="hs-cal-upcoming-addr">{a.owner.city}</span>
              </button>
            );
          });
        })()}
      </div>

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
                <p className="hs-cal-drawer-time-date">{fmtDateLong(detail.booking!.date)}</p>
                <p className="hs-cal-drawer-time-time">{fmt12(detail.booking!.time)}</p>
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
