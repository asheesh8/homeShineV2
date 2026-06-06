import { NextResponse } from "next/server";

import { type Assessment, sectionDefinitions } from "@/lib/simple-field";

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


type ParsedResponse = {
  summary?: string;
  nextSteps?: string[];
  sources?: Array<{
    title?: string;
    url?: string;
    quote?: string;
    domain?: string;
  }>;
};

function extractJsonObject(text: string): ParsedResponse {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Claude returned an unexpected response.");
  }
  return JSON.parse(text.slice(start, end + 1)) as ParsedResponse;
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
    "You are an expert exterior home maintenance advisor writing a field assessment summary.",
    "Use only the information provided. Do not invent prices, repairs, or safety claims.",
    "",
    "Return ONLY valid JSON with exactly this shape:",
    '{"summary":"string","nextSteps":["string"],"sources":[{"title":"string","url":"string","quote":"string","domain":"string"}]}',
    "",
    "Rules:",
    "- summary: 2–4 sentences, plain English, direct and impactful for a homeowner.",
    "- nextSteps: 2–4 short action items specific to what was found in the assessment.",
    "- sources: 2–3 real, authoritative articles from trusted home maintenance publishers.",
    "  Choose sources ONLY from these domains: thisoldhouse.com, familyhandyman.com, bobvila.com,",
    "  houselogic.com, popularmechanics.com, extension.psu.edu, extension.umn.edu, angi.com,",
    "  or other reputable .edu extension services or established home improvement publications.",
    "  Each source must be DIRECTLY relevant to one of the specific issues found in this assessment",
    "  (e.g. if moss on roof is noted, find an article about roof moss treatment).",
    "  - title: the actual article headline",
    "  - url: a real, specific article URL you are confident exists (not a homepage)",
    "  - quote: a 1–2 sentence excerpt or paraphrase that is directly relevant to this property's issue",
    "  - domain: just the bare domain like 'thisoldhouse.com'",
    "  If you cannot find 2–3 genuinely relevant, specific articles you are confident exist, return fewer.",
    "  Never invent URLs.",
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
      max_tokens: 900,
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

  const rawSources = Array.isArray(parsed.sources) ? parsed.sources : [];
  const sources = rawSources
    .filter((s) => s.title && s.url && s.quote && s.url.startsWith("http"))
    .map((s) => ({
      title: String(s.title).trim(),
      url: String(s.url).trim(),
      quote: String(s.quote).trim(),
      domain: s.domain ? String(s.domain).trim() : new URL(String(s.url)).hostname.replace("www.", ""),
    }))
    .slice(0, 3);

  return NextResponse.json({
    summary:
      parsed.summary?.trim() ||
      "This assessment suggests the property would benefit from targeted exterior maintenance based on the saved field notes.",
    nextSteps: Array.isArray(parsed.nextSteps)
      ? parsed.nextSteps.filter(Boolean).slice(0, 4)
      : [],
    sources,
  });
}
