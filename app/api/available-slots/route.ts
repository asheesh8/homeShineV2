import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mapRowToAssessment, type AssessmentRow } from "@/lib/assessment-store";

// Public endpoint — returns only date + time pairs (no client data)
// Used by the /book portal to grey out already-taken slots.

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Pull booked slots from internal assessments (__booking in sections JSON)
    const { data: rows, error: aErr } = await supabase
      .from("assessments")
      .select("sections");

    // Pull confirmed booking requests
    const { data: reqs, error: rErr } = await supabase
      .from("booking_requests")
      .select("requested_date, requested_time")
      .in("status", ["pending", "confirmed"]);

    const booked: { date: string; time: string }[] = [];

    if (!aErr && rows) {
      for (const row of rows) {
        const sections = (row as AssessmentRow).sections as Record<string, unknown>;
        const b = sections?.__booking as { date?: string; time?: string } | null;
        if (b?.date && b?.time) booked.push({ date: b.date, time: b.time });
      }
    }

    if (!rErr && reqs) {
      for (const r of reqs) {
        // requested_date comes back as "YYYY-MM-DD", time as "HH:MM:SS"
        const time = String(r.requested_time).slice(0, 5); // "HH:MM"
        booked.push({ date: String(r.requested_date), time });
      }
    }

    return NextResponse.json({ booked });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
