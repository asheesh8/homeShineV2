/**
 * Vermont municipal tax rate utilities (client-safe).
 * All lookups go through /api/tax-rate so the Supabase service key
 * never touches the browser.
 */

export type TownTaxRate = {
  town: string;
  stateRate: number;
  localRate: number;
  totalRate: number;
  found: boolean;
  partial?: boolean;
};

const VT_STATE_DEFAULT: TownTaxRate = {
  town: "Vermont",
  stateRate: 0.06,
  localRate: 0,
  totalRate: 0.06,
  found: false,
};

/** Cache lookups for the session so we don't spam the API */
const cache = new Map<string, TownTaxRate>();

/**
 * Fetch the tax rate for a Vermont town.
 * Returns the state default (6%) if the town is not in the database.
 */
export async function fetchTownTaxRate(town: string): Promise<TownTaxRate> {
  const key = town.trim().toLowerCase();
  if (!key) return VT_STATE_DEFAULT;
  if (cache.has(key)) return cache.get(key)!;

  try {
    const res = await fetch(`/api/tax-rate?town=${encodeURIComponent(town.trim())}`, {
      cache: "no-store",
    });
    if (!res.ok) return VT_STATE_DEFAULT;
    const data = (await res.json()) as TownTaxRate;
    cache.set(key, data);
    return data;
  } catch {
    return VT_STATE_DEFAULT;
  }
}

/** Describe a rate for display: "6%" or "7% (6% state + 1% local)" */
export function describeTaxRate(rate: TownTaxRate): string {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  if (rate.localRate > 0) {
    return `${pct(rate.totalRate)} (${pct(rate.stateRate)} state + ${pct(rate.localRate)} local)`;
  }
  return `${pct(rate.totalRate)} Vermont state tax`;
}
