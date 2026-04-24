import { NextResponse } from "next/server";

import {
  type Assessment,
  sectionDefinitions,
  sectionReferenceMap,
} from "@/lib/simple-field";

type ClaudeSuccess = {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
  error?: {
    message?: string;
  };
};

function buildAssessmentSummary(assessment: Assessment) {
  const sectionLines = sectionDefinitions
    .map((section) => {
      const values = assessment.sections[section.id];
      if (!values) return "";

      const details = section.fields
        .map((field) => {
          const value = values[field.key];
          if (value === undefined || value === null || value === "") return "";
          return `${field.label}: ${typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}`;
        })
        .filter(Boolean)
        .join("; ");

      return details ? `${section.label}: ${details}` : "";
    })
    .filter(Boolean)
    .join("\n");

  return [
    `Customer: ${assessment.owner.name}`,
    `Address: ${[assessment.owner.street, assessment.owner.city, assessment.owner.state].filter(Boolean).join(", ")}`,
    `Status: ${assessment.status}`,
    `Main writeup: ${assessment.writeup || "None provided"}`,
    "Saved section details:",
    sectionLines || "No sections saved yet.",
  ].join("\n");
}

function getReferenceNotes(assessment: Assessment) {
  return sectionDefinitions
    .filter((section) => assessment.sections[section.id])
    .flatMap((section) => sectionReferenceMap[section.id] ?? [])
    .slice(0, 5);
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Claude returned an unexpected response.");
  }
  return JSON.parse(text.slice(start, end + 1)) as {
    summary?: string;
    nextSteps?: string[];
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is missing. Add it to your local .env.local or your deployment environment first.",
      },
      { status: 500 }
    );
  }

  const body = (await request.json()) as { assessment?: Assessment };
  const assessment = body.assessment;

  if (!assessment) {
    return NextResponse.json({ error: "Assessment data is required." }, { status: 400 });
  }

  const prompt = [
    "You write very short, practical homeowner assessment summaries for an exterior cleaning and maintenance company.",
    "Use only the information provided.",
    "Do not mention uncertainty unless the data is clearly missing.",
    "Do not invent prices, repairs, or safety claims.",
    'Return only valid JSON with this shape: {"summary":"string","nextSteps":["string","string","string"]}.',
    "The summary should be 2 to 4 sentences, simple, direct, and impactful.",
    "Each next step should be a short action item.",
    "",
    buildAssessmentSummary(assessment),
  ].join("\n");

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const payload = (await anthropicResponse.json()) as ClaudeSuccess;

  if (!anthropicResponse.ok) {
    return NextResponse.json(
      {
        error:
          payload.error?.message ??
          "Anthropic could not generate the summary right now.",
      },
      { status: anthropicResponse.status }
    );
  }

  const text = payload.content?.find((part) => part.type === "text")?.text ?? "";
  const parsed = extractJsonObject(text);

  return NextResponse.json({
    summary:
      parsed.summary?.trim() ||
      "This assessment suggests the property would benefit from targeted exterior maintenance based on the saved field notes.",
    nextSteps: Array.isArray(parsed.nextSteps)
      ? parsed.nextSteps.filter(Boolean).slice(0, 4)
      : [],
    sources: getReferenceNotes(assessment),
  });
}
