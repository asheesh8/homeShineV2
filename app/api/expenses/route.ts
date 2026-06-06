import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type Expense = {
  id: string;
  date: string;        // "YYYY-MM-DD"
  category: string;
  description: string;
  amount: number;
  receiptUrl?: string;
  createdAt: string;
};

function mapRow(row: Record<string, unknown>): Expense {
  return {
    id:          String(row.id),
    date:        String(row.date).slice(0, 10),
    category:    String(row.category),
    description: String(row.description),
    amount:      Number(row.amount),
    receiptUrl:  row.receipt_url ? String(row.receipt_url) : undefined,
    createdAt:   String(row.created_at),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase.from("expenses").select("*").order("date", { ascending: false });
    if (year) {
      query = query.gte("date", `${year}-01-01`).lte("date", `${year}-12-31`);
    }
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data ?? []).map(r => mapRow(r as Record<string, unknown>)));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const required = ["date", "category", "description", "amount"];
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ error: `${f} is required.` }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        date:        body.date,
        category:    body.category,
        description: body.description,
        amount:      body.amount,
        receipt_url: body.receiptUrl ?? null,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapRow(data as Record<string, unknown>), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
