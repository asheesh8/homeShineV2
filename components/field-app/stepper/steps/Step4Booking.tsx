"use client";

import { ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react";
import { useState } from "react";
import { FieldLabel, TextArea } from "@/components/field-app/ui";
import { CHECKOUT_PLANS } from "@/components/field-app/utils";
import { type Assessment, type BookingData, type CheckoutData } from "@/lib/simple-field";

/* ── helpers ──────────────────────────────────────────────────────────── */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

function fmtDate(iso: string) {
  const [y, mo, d] = iso.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

const VISIT_LABELS: Record<string, string> = {
  "shine-now":   "Full Exterior Clean",
  "protection":  "Initial Deep Clean",
  "shine-ready": "Pre-Listing Assessment & Clean",
  "shine-renew": "Restoration Service",
};

/* Suggested duration in minutes per plan (used as default hint) */
const PLAN_DEFAULT_DURATION: Record<string, number> = {
  "shine-now":   180,  // 3 hr
  "protection":  240,  // 4 hr
  "shine-ready": 150,  // 2.5 hr
  "shine-renew": 300,  // 5 hr
};

const DURATION_OPTIONS = [
  { label: "1 hr",   value: 60  },
  { label: "1.5 hr", value: 90  },
  { label: "2 hr",   value: 120 },
  { label: "2.5 hr", value: 150 },
  { label: "3 hr",   value: 180 },
  { label: "3.5 hr", value: 210 },
  { label: "4 hr",   value: 240 },
  { label: "5 hr",   value: 300 },
  { label: "6 hr",   value: 360 },
];

function addMinutes(time24: string, minutes: number): string {
  const [h, m] = time24.split(":").map(Number);
  const total  = h * 60 + m + minutes;
  const hh     = Math.floor(total / 60) % 24;
  const mm     = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

const MORNING_SLOTS   = ["08:00","09:00","10:00","11:00"];
const AFTERNOON_SLOTS = ["13:00","14:00","15:00","16:00"];

/* ──────────────────────────────────────────────────────────────────────── */

export function Step4Booking({
  client,
  checkout,
  booking,
  allAssessments,
  onUpdate,
}: {
  client: Assessment;
  checkout: Partial<CheckoutData>;
  booking: Partial<BookingData>;
  allAssessments: Assessment[];
  onUpdate: (patch: Partial<BookingData>) => void;
}) {
  const plan = CHECKOUT_PLANS.find((p) => p.id === checkout.planId);
  const visitLabel = plan ? (VISIT_LABELS[plan.id] ?? plan.name) : "Service Visit";
  const suggestedDuration = plan ? (PLAN_DEFAULT_DURATION[plan.id] ?? 180) : 180;

  /* calendar state */
  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed

  /* build calendar grid */
  const firstDay   = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  /* collect booked dates from OTHER assessments */
  const bookedDates = new Set<string>();
  const bookedByDate: Record<string, { name: string; time: string }[]> = {};
  for (const a of allAssessments) {
    if (a.id === client.id || !a.booking?.date) continue;
    const d = a.booking.date;
    bookedDates.add(d);
    if (!bookedByDate[d]) bookedByDate[d] = [];
    bookedByDate[d].push({ name: a.owner.name.split(" ")[0], time: a.booking.time });
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  function selectDay(day: number) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const d = new Date(calYear, calMonth, day);
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return; // past
    onUpdate({ date: dateStr, visitLabel });
  }

  const todayStr    = toLocalDateStr(today);
  const selectedDate = booking.date ?? null;

  /* grid cells: nulls for padding + day numbers */
  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="hs-stepper-step">
      <div className="hs-step-heading">
        <span className="hs-step-eyebrow">Step 4 of 5</span>
        <h2>Schedule the job</h2>
        <p className="hs-step-description">
          Pick a date and time with {client.owner.name} for the {visitLabel.toLowerCase()}.
        </p>
      </div>

      {/* Client + plan strip */}
      <div className="hs-quote-client-strip">
        <div>
          <strong>{client.owner.name}</strong>
          <span>{client.owner.phone}</span>
        </div>
        {plan && <span className="hs-booking-plan-chip">{plan.name}</span>}
      </div>

      {/* Calendar */}
      <section className="hs-step-section">
        <div className="hs-cal-header">
          <button type="button" className="hs-cal-nav" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <span className="hs-cal-title">{MONTHS[calMonth]} {calYear}</span>
          <button type="button" className="hs-cal-nav" onClick={nextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="hs-cal-grid">
          {DAYS.map(d => (
            <div key={d} className="hs-cal-day-label">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`pad-${i}`} />;
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday    = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const isPast     = new Date(calYear, calMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isBooked   = bookedDates.has(dateStr);
            const others     = bookedByDate[dateStr] ?? [];

            return (
              <button
                key={day}
                type="button"
                className={[
                  "hs-cal-day",
                  isToday    ? "is-today"    : "",
                  isSelected ? "is-selected" : "",
                  isPast     ? "is-past"     : "",
                  isBooked   ? "is-booked"   : "",
                ].join(" ")}
                onClick={() => !isPast && selectDay(day)}
                disabled={isPast}
                title={isBooked ? `Busy: ${others.map(o => `${o.name} @ ${fmt12(o.time)}`).join(", ")}` : undefined}
              >
                <span className="hs-cal-day-num">{day}</span>
                {isBooked && <span className="hs-cal-dot" />}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="hs-cal-legend">
          <span><span className="hs-cal-legend-dot is-selected" />Your pick</span>
          <span><span className="hs-cal-legend-dot is-booked" />Another job</span>
          <span><span className="hs-cal-legend-dot is-today" />Today</span>
        </div>
      </section>

      {/* Time slots — only shown after day selected */}
      {selectedDate && (
        <section className="hs-step-section">
          <p className="hs-step-section-label">
            <Clock size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
            Time for {fmtDate(selectedDate)}
          </p>

          <div className="hs-time-group">
            <p className="hs-time-group-label">Morning</p>
            <div className="hs-time-slots">
              {MORNING_SLOTS.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`hs-time-slot ${booking.time === t ? "is-selected" : ""}`}
                  onClick={() => onUpdate({ time: t })}
                >
                  {fmt12(t)}
                </button>
              ))}
            </div>
          </div>

          <div className="hs-time-group">
            <p className="hs-time-group-label">Afternoon</p>
            <div className="hs-time-slots">
              {AFTERNOON_SLOTS.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`hs-time-slot ${booking.time === t ? "is-selected" : ""}`}
                  onClick={() => onUpdate({ time: t })}
                >
                  {fmt12(t)}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Duration picker — shown after time selected */}
      {selectedDate && booking.time && (
        <section className="hs-step-section">
          <p className="hs-step-section-label">Job window</p>
          <p className="hs-booking-duration-hint">
            Suggested for {plan?.name ?? "this plan"}: <strong>{DURATION_OPTIONS.find(d => d.value === suggestedDuration)?.label ?? "3 hr"}</strong>
            {" "}— adjust based on property condition.
          </p>
          <div className="hs-time-slots" style={{ flexWrap: "wrap" }}>
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`hs-time-slot ${booking.duration === opt.value ? "is-selected" : ""} ${opt.value === suggestedDuration && !booking.duration ? "is-suggested" : ""}`}
                onClick={() => onUpdate({ duration: opt.value })}
              >
                {opt.label}
                {opt.value === suggestedDuration && <span className="hs-duration-star">★</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Visit note */}
      {selectedDate && booking.time && (
        <section className="hs-step-section">
          <FieldLabel>
            Visit note <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span>
          </FieldLabel>
          <TextArea
            placeholder="Anything to confirm with the client before arrival…"
            value={booking.note ?? ""}
            onChange={(e) => onUpdate({ note: e.target.value || undefined })}
            style={{ minHeight: 80 }}
          />
        </section>
      )}

      {/* Booking summary */}
      {selectedDate && booking.time && (
        <div className="hs-booking-summary">
          <CalendarDays size={18} className="hs-booking-summary-icon" />
          <div>
            <p className="hs-booking-summary-label">{visitLabel}</p>
            <p className="hs-booking-summary-date">
              {fmtDate(selectedDate)}
            </p>
            <p className="hs-booking-summary-time">
              {fmt12(booking.time)}
              {booking.duration
                ? ` → ${fmt12(addMinutes(booking.time, booking.duration))} (${DURATION_OPTIONS.find(d => d.value === booking.duration)?.label})`
                : ""}
            </p>
            <p className="hs-booking-summary-client">{client.owner.name} · {client.owner.phone}</p>
          </div>
        </div>
      )}

      {!selectedDate && (
        <p className="hs-step-hint">Select a date on the calendar above to pick a time.</p>
      )}
    </div>
  );
}
