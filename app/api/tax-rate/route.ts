/**
 * GET /api/tax-rate?town=Burlington
 *
 * Returns the Vermont municipal tax rate for a given town.
 * Falls back to the state default (6%) if the town is not found.
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const STATE_DEFAULT = 0.06;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const town = searchParams.get("town")?.trim();

  if (!town) {
    return NextResponse.json(
      { error: "town query param is required" },
      { status: 400 }
    );
  }

  try {
    const sb = getSupabaseAdmin();

    // Case-insensitive exact match first
    const { data, error } = await sb
      .from("vt_town_tax_rates")
      .select("town, state_rate, local_rate, total_rate")
      .ilike("town", town)
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data) {
      return NextResponse.json({
        town: data.town,
        stateRate: Number(data.state_rate),
        localRate: Number(data.local_rate),
        totalRate: Number(data.total_rate),
        found: true,
      });
    }

    // Fallback: partial match (e.g. "St. Albans" matches "St. Albans City")
    const { data: partial, error: partialErr } = await sb
      .from("vt_town_tax_rates")
      .select("town, state_rate, local_rate, total_rate")
      .ilike("town", `%${town}%`)
      .limit(1)
      .maybeSingle();

    if (partialErr) {
      return NextResponse.json({ error: partialErr.message }, { status: 500 });
    }

    if (partial) {
      return NextResponse.json({
        town: partial.town,
        stateRate: Number(partial.state_rate),
        localRate: Number(partial.local_rate),
        totalRate: Number(partial.total_rate),
        found: true,
        partial: true,
      });
    }

    // Not found — return Vermont state default
    return NextResponse.json({
      town,
      stateRate: STATE_DEFAULT,
      localRate: 0,
      totalRate: STATE_DEFAULT,
      found: false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
