import { NextResponse } from "next/server";

import type { Assessment } from "@/lib/simple-field";
import { mapAssessmentToRow, mapRowToAssessment, type AssessmentRow } from "@/lib/assessment-store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    let body: { assessment?: Assessment };
    try {
      body = (await request.json()) as { assessment?: Assessment };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body.assessment) {
      return NextResponse.json({ error: "Assessment is required." }, { status: 400 });
    }

    const row = mapAssessmentToRow(body.assessment);
    const { data, error } = await supabaseAdmin
      .from("assessments")
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mapRowToAssessment(data as AssessmentRow));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from("assessments").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
