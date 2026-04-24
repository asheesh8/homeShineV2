import { NextResponse } from "next/server";

import type { Assessment } from "@/lib/simple-field";
import { mapAssessmentToRow, mapRowToAssessment, type AssessmentRow } from "@/lib/assessment-store";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("assessments")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map((row) => mapRowToAssessment(row as AssessmentRow)));
}

export async function POST(request: Request) {
  const body = (await request.json()) as { assessment?: Assessment };
  if (!body.assessment) {
    return NextResponse.json({ error: "Assessment is required." }, { status: 400 });
  }

  const row = mapAssessmentToRow(body.assessment);
  const { data, error } = await supabaseAdmin
    .from("assessments")
    .insert(row)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapRowToAssessment(data as AssessmentRow));
}
