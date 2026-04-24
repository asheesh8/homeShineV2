import type { Assessment, Owner, SectionValue } from "@/lib/simple-field";

export type AssessmentRow = {
  id: string;
  owner_name: string;
  owner_street: string;
  owner_city: string;
  owner_state: string;
  owner_phone: string;
  owner_email: string;
  status: Assessment["status"];
  writeup: string;
  ai_summary: Assessment["aiSummary"];
  sections: Record<string, SectionValue | null>;
  created_at: string;
  updated_at: string;
};

function normalizeOwner(row: AssessmentRow): Owner {
  return {
    name: row.owner_name ?? "",
    street: row.owner_street ?? "",
    city: row.owner_city ?? "",
    state: row.owner_state ?? "VT",
    phone: row.owner_phone ?? "",
    email: row.owner_email ?? "",
  };
}

export function mapRowToAssessment(row: AssessmentRow): Assessment {
  return {
    id: row.id,
    owner: normalizeOwner(row),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    writeup: row.writeup ?? "",
    aiSummary: row.ai_summary ?? null,
    sections: row.sections ?? {},
  };
}

export function mapAssessmentToRow(assessment: Assessment): AssessmentRow {
  return {
    id: assessment.id,
    owner_name: assessment.owner.name,
    owner_street: assessment.owner.street,
    owner_city: assessment.owner.city,
    owner_state: assessment.owner.state,
    owner_phone: assessment.owner.phone,
    owner_email: assessment.owner.email,
    status: assessment.status,
    writeup: assessment.writeup ?? "",
    ai_summary: assessment.aiSummary ?? null,
    sections: assessment.sections,
    created_at: assessment.createdAt,
    updated_at: assessment.updatedAt,
  };
}
