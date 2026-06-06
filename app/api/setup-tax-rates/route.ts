/**
 * POST /api/setup-tax-rates
 *
 * One-time setup: creates the vt_town_tax_rates table and seeds all
 * Vermont municipalities with their state + local option tax rates.
 *
 * Steven-only — call once from Postman or the browser:
 *   fetch('/api/setup-tax-rates', { method: 'POST' })
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type TownRow = { town: string; state_rate: number; local_rate: number };

/** Vermont towns with Local Option Tax (1% extra → 7% total) */
const LOCAL_OPTION_TOWNS = new Set([
  // Chittenden County
  "burlington", "south burlington", "winooski", "essex", "essex junction",
  "colchester", "williston", "shelburne", "charlotte", "hinesburg", "richmond",
  "jericho", "underhill", "huntington", "bolton", "milton", "georgia",
  // Washington County
  "montpelier", "barre city", "barre town", "waterbury", "northfield",
  "berlin", "middlesex", "waitsfield", "warren", "moretown",
  // Lamoille County
  "stowe", "morrisville", "morristown", "johnson", "hyde park", "cambridge", "hardwick",
  // Franklin County
  "st. albans city", "st. albans town", "swanton", "enosburg falls", "enosburg", "fairfax",
  // Addison County
  "middlebury", "vergennes", "bristol", "brandon",
  // Rutland County
  "rutland city", "fair haven", "castleton",
  // Bennington County
  "bennington", "manchester",
  // Windham County
  "brattleboro", "springfield", "bellows falls", "putney", "rockingham",
  // Windsor County
  "hartford", "windsor", "woodstock", "randolph",
  // Caledonia County
  "st. johnsbury", "lyndon", "lyndonville",
  // Orleans County
  "newport city", "newport town", "derby", "derby line", "orleans", "barton",
]);

const VT_TOWNS = [
  // Chittenden
  "Burlington","South Burlington","Winooski","Essex","Essex Junction","Colchester",
  "Williston","Shelburne","Charlotte","Hinesburg","Richmond","Jericho","Underhill",
  "Huntington","Bolton","Milton","Georgia","St. George","Monkton","Starksboro",
  // Washington
  "Montpelier","Barre City","Barre Town","Waterbury","Northfield","Berlin","Middlesex",
  "Calais","Plainfield","Marshfield","Cabot","East Montpelier","Worcester","Duxbury",
  "Fayston","Waitsfield","Warren","Moretown",
  // Lamoille
  "Stowe","Morrisville","Morristown","Johnson","Hyde Park","Cambridge","Wolcott",
  "Hardwick","Craftsbury","Elmore","Belvidere","Eden","Waterville",
  // Franklin
  "St. Albans City","St. Albans Town","Swanton","Enosburg Falls","Enosburg",
  "Fairfax","Fairfield","Fletcher","Franklin","Highgate","Montgomery","Sheldon","Bakersfield",
  // Addison
  "Middlebury","Vergennes","Bristol","Ferrisburgh","Weybridge","Addison","Bridport",
  "Shoreham","Cornwall","Salisbury","Leicester","Lincoln","New Haven","Panton","Ripton",
  "Goshen","Granville","Hancock","Rochester","Brandon","Pittsford",
  // Rutland
  "Rutland City","Rutland Town","Fair Haven","Castleton","Proctor","Poultney","Wells",
  "Pawlet","Danby","Wallingford","Mount Holly","Ludlow","Shrewsbury","Mendon","Clarendon",
  "West Haven","Ira","Benson","Orwell","Sudbury","Pittsfield","Stockbridge",
  // Bennington
  "Bennington","Manchester","Arlington","Shaftsbury","Pownal","North Bennington",
  "Readsboro","Stamford","Woodford","Sunderland","Sandgate","Dorset","Rupert",
  "Peru","Landgrove","Winhall","Londonderry","Jamaica",
  // Windham
  "Brattleboro","Springfield","Bellows Falls","Putney","Westminster","Rockingham",
  "Dummerston","Guilford","Halifax","Whitingham","Wilmington","Dover","Wardsboro",
  "Townshend","Grafton","Newfane","Marlboro","Stratton","Searsburg","Brookline",
  "Athens","Windham","Somerset",
  // Windsor
  "Hartford","Windsor","Woodstock","Norwich","Thetford","Sharon","Royalton","Bethel",
  "Randolph","Tunbridge","Strafford","Chelsea","Williamstown","Barnard","Pomfret",
  "Bridgewater","Plymouth","Reading","Cavendish","Baltimore","Andover","Chester",
  "Weathersfield","Hartland","West Windsor","Weston","Brookfield",
  // Orange
  "Bradford","Newbury","Corinth","Topsham","Orange","Washington","Vershire",
  "West Fairlee","Fairlee","Groton","Ryegate","Barnet","Peacham",
  // Caledonia
  "St. Johnsbury","Lyndon","Lyndonville","Danville","Walden","Greensboro","Glover",
  "Wheelock","Burke","Sutton","Sheffield","Stannard","Concord","Lunenburg","Waterford",
  // Orleans
  "Newport City","Newport Town","Derby","Derby Line","Orleans","Barton","Coventry",
  "Holland","Morgan","Brownington","Westmore","Albany","Irasburg","Troy","Jay",
  "Westfield","Lowell",
  // Essex County
  "Island Pond","Canaan","Norton","Brighton","Bloomfield","Brunswick","Maidstone",
  "Guildhall","Lemington","Granby",
];

function buildRows(): TownRow[] {
  const seen = new Set<string>();
  const rows: TownRow[] = [];
  for (const town of VT_TOWNS) {
    const key = town.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const hasLocal = LOCAL_OPTION_TOWNS.has(key);
    rows.push({
      town,
      state_rate: 0.06,
      local_rate: hasLocal ? 0.01 : 0,
    });
  }
  return rows;
}

export async function POST() {
  try {
    const sb = getSupabaseAdmin();

    // 1 — Create table
    const { error: createErr } = await sb.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS vt_town_tax_rates (
          id         SERIAL PRIMARY KEY,
          town       TEXT NOT NULL,
          state_rate NUMERIC(6,4) NOT NULL DEFAULT 0.0600,
          local_rate NUMERIC(6,4) NOT NULL DEFAULT 0.0000,
          total_rate NUMERIC(6,4) GENERATED ALWAYS AS (state_rate + local_rate) STORED,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_vt_town_lower
          ON vt_town_tax_rates (LOWER(town));
      `,
    });

    if (createErr) {
      // exec_sql RPC may not be available — fall through and just upsert
      console.warn("exec_sql not available, skipping DDL:", createErr.message);
    }

    // 2 — Upsert rows
    const rows = buildRows();
    const { error: upsertErr, data: upsertData } = await sb
      .from("vt_town_tax_rates")
      .upsert(rows, { onConflict: "town", ignoreDuplicates: false })
      .select("id");

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      towns: rows.length,
      upserted: upsertData?.length ?? rows.length,
      localOption: rows.filter((r) => r.local_rate > 0).length,
      stateOnly: rows.filter((r) => r.local_rate === 0).length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

/** GET — list all seeded towns (verify) */
export async function GET() {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("vt_town_tax_rates")
      .select("town, state_rate, local_rate, total_rate")
      .order("town");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
