import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type BookingRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  street?: string;
  city: string;
  state: string;
  serviceType: "consultation" | "assessment";
  requestedDate: string; // "YYYY-MM-DD"
  requestedTime: string; // "HH:MM"
  message?: string;
  status: "pending" | "confirmed" | "declined";
  createdAt: string;
};

function mapRow(row: Record<string, unknown>): BookingRequest {
  return {
    id:            String(row.id),
    name:          String(row.name),
    email:         String(row.email),
    phone:         String(row.phone),
    street:        row.street ? String(row.street) : undefined,
    city:          String(row.city),
    state:         String(row.state),
    serviceType:   row.service_type as BookingRequest["serviceType"],
    requestedDate: String(row.requested_date),
    requestedTime: String(row.requested_time).slice(0, 5),
    message:       row.message ? String(row.message) : undefined,
    status:        row.status as BookingRequest["status"],
    createdAt:     String(row.created_at),
  };
}

/* GET — fetch all requests (used by Steven's CalendarScreen) */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("booking_requests")
      .select("*")
      .order("requested_date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data ?? []).map(r => mapRow(r as Record<string, unknown>)));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

/* POST — public, no auth — client submits a booking request */
export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try { body = await request.json() as Record<string, unknown>; }
    catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

    const required = ["name", "email", "phone", "city", "serviceType", "requestedDate", "requestedTime"];
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ error: `${f} is required.` }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("booking_requests")
      .insert({
        name:           body.name,
        email:          body.email,
        phone:          body.phone,
        street:         body.street ?? null,
        city:           body.city,
        state:          body.state ?? "VT",
        service_type:   body.serviceType,
        requested_date: body.requestedDate,
        requested_time: body.requestedTime,
        message:        body.message ?? null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapRow(data as Record<string, unknown>), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

/* PATCH — Steven updates status */
export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { id: string; status: string };
    if (!body.id || !body.status) return NextResponse.json({ error: "id and status required." }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("booking_requests")
      .update({ status: body.status })
      .eq("id", body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapRow(data as Record<string, unknown>));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
