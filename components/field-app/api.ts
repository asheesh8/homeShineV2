import type { Assessment, Owner } from "@/lib/simple-field";

function normalizeAssessment(raw: Assessment): Assessment {
  const legacyOwner = raw.owner as Owner & { address?: string };
  return {
    ...raw,
    owner: {
      name: legacyOwner.name ?? "",
      street: String(legacyOwner.street ?? legacyOwner.address ?? ""),
      city: String(legacyOwner.city ?? ""),
      state: String(legacyOwner.state ?? "VT"),
      phone: legacyOwner.phone ?? "",
      email: legacyOwner.email ?? "",
    },
    writeup: raw.writeup ?? "",
    aiSummary: raw.aiSummary ?? null,
    checkout: raw.checkout ?? null,
  };
}

export async function fetchAssessments(): Promise<Assessment[]> {
  const res = await fetch("/api/assessments", { cache: "no-store" });
  const data = (await res.json()) as Assessment[] | { error: string };
  if (!res.ok || !Array.isArray(data)) {
    throw new Error(Array.isArray(data) ? "Could not load assessments." : (data as { error: string }).error);
  }
  return data.map(normalizeAssessment);
}

export async function createAssessment(assessment: Assessment): Promise<Assessment> {
  const res = await fetch("/api/assessments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment }),
  });
  const data = (await res.json()) as Assessment | { error: string };
  if (!res.ok || "error" in data) throw new Error("error" in data ? data.error : "Could not create assessment.");
  return normalizeAssessment(data as Assessment);
}

export async function updateAssessment(assessment: Assessment): Promise<Assessment> {
  const res = await fetch(`/api/assessments/${assessment.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment }),
  });
  const data = (await res.json()) as Assessment | { error: string };
  if (!res.ok || "error" in data) throw new Error("error" in data ? data.error : "Could not save assessment.");
  return normalizeAssessment(data as Assessment);
}

export async function deleteAssessment(id: string): Promise<void> {
  const res = await fetch(`/api/assessments/${id}`, { method: "DELETE" });
  const data = (await res.json()) as { success?: boolean; error?: string };
  if (!res.ok || data.success !== true) throw new Error(data.error ?? "Could not delete assessment.");
}

export async function requestAiSummary(
  assessment: Assessment
): Promise<{ summary: string; nextSteps: string[]; sources: string[] }> {
  const res = await fetch("/api/ai-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment }),
  });
  const data = (await res.json()) as { summary: string; nextSteps: string[]; sources: string[] } | { error: string };
  if (!res.ok || "error" in data) throw new Error("error" in data ? data.error : "Could not generate AI summary.");
  return data as { summary: string; nextSteps: string[]; sources: string[] };
}
