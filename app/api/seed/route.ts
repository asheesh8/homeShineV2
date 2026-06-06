import { NextResponse } from "next/server";
import { mapAssessmentToRow } from "@/lib/assessment-store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Assessment } from "@/lib/simple-field";
import { makeAssessment } from "@/lib/simple-field";

const SAMPLE_ASSESSMENTS: Assessment[] = [
  {
    id: "hs-sample-001",
    owner: {
      name: "Megan Hart",
      street: "18 Birch Hollow Lane",
      city: "Shelburne",
      state: "VT",
      phone: "(802) 555-0130",
      email: "megan.hart@example.com",
    },
    status: "ongoing",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    writeup:
      "Roof and gutters look in good shape overall. Minor moss noted at rear roof corner. Siding is vinyl and holding up well, but showing some algae streaks on the north face. Walkway has mild green buildup — good candidate for surface washing. Deck looks like it was cleaned recently but could use a light refresh.",
    aiSummary: {
      summary:
        "Megan's home is a solid candidate for routine exterior maintenance. The roof has minor moss growth at the rear corner that should be addressed before it spreads. Gutters are in good condition with guards in place. Siding shows light algae on the north face — a common seasonal issue that cleans up well. The walkway and deck are in good shape and would benefit from a seasonal refresh.",
      nextSteps: [
        "Schedule a roof-safe low-pressure cleaning for the rear corner moss.",
        "Confirm gutters are flowing freely after service.",
        "Include north-face siding treatment in the base cleaning scope.",
        "Use this visit as the baseline for a seasonal maintenance plan.",
      ],
      sources: [
        { title: "How to Remove Moss From a Roof", url: "https://www.thisoldhouse.com/roofing/21015071/how-to-remove-moss-from-a-roof", quote: "Moss buildup should be treated with a roof-safe low-pressure solution before it reaches and lifts the shingles.", domain: "thisoldhouse.com" },
        { title: "How to Clean Gutters", url: "https://www.familyhandyman.com/project/how-to-clean-gutters/", quote: "Gutters with guards still need periodic flushing to confirm free flow and check for fine debris buildup.", domain: "familyhandyman.com" },
        { title: "How to Clean Vinyl Siding", url: "https://www.bobvila.com/articles/how-to-clean-vinyl-siding/", quote: "Algae on vinyl siding responds well to soft-wash treatment with appropriate detergent.", domain: "bobvila.com" },
      ],
      generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    checkout: null,
    sections: {
      ...makeAssessment().sections,
      roof: {
        stories: "2 story",
        age: "10 years",
        pitch: "Moderate",
        material: "Shingles",
        condition: "good",
        notes: "Minor moss near back corner, otherwise solid.",
      },
      gutters: {
        number: 4,
        length: "120 ft",
        guards: true,
        age: "8 years",
        condition: "good",
        notes: "Guards are intact. Flowing well.",
      },
      siding: {
        color: "Sage green",
        age: "12 years",
        material: "Vinyl",
        condition: "good",
        notes: "Light algae on north face. Rest looks clean.",
      },
      walkway: {
        size: "40ft x 4ft",
        color: "Gray",
        material: "Bluestone",
        condition: "fair",
        notes: "Mild green buildup near the entry steps.",
      },
      deck: {
        size: "18ft x 14ft",
        color: "Natural cedar",
        material: "Wood",
        condition: "good",
        notes: "Looks recently cleaned. Light refresh would do it.",
      },
    },
  },
  {
    id: "hs-sample-002",
    owner: {
      name: "David Chen",
      street: "7 Ridgeline Court",
      city: "South Burlington",
      state: "VT",
      phone: "(802) 555-0198",
      email: "david.chen@example.com",
    },
    status: "finished",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    writeup:
      "David's home has significant exterior buildup across multiple surfaces. The roof shows heavy moss on the north pitch and some debris in the valleys. Gutters are clogged and overflowing in two spots. Windows and screens need full cleaning — 18 windows total. Driveway has oil staining near the garage bay. This is a good candidate for the Protection Plan — home has been neglected for 2+ seasons and needs a deep reset followed by scheduled upkeep.",
    aiSummary: {
      summary:
        "David's home is overdue for a comprehensive exterior reset. Moss on the north roof pitch and clogged gutters are the most urgent items — both can accelerate damage if left untreated. The driveway oil stain near the garage and the heavy window buildup point to a home that's been on deferred maintenance for 1–2 seasons. The Protection Plan is well matched here: a Day 1 deep clean followed by scheduled tune-ups will stabilize the property and protect the investment.",
      nextSteps: [
        "Prioritize roof-safe moss treatment on the north pitch before next rain season.",
        "Clear and flush all gutters; inspect for damage at the two overflow points.",
        "Include driveway degreasing in the service scope.",
        "Set up Month 12 and Month 18 maintenance visits at booking.",
      ],
      sources: [
        { title: "Moss and Algae on Roofs", url: "https://www.thisoldhouse.com/roofing/21015071/how-to-remove-moss-from-a-roof", quote: "Heavy moss on the north pitch needs roof-safe treatment — pressure washing risks shingle damage and void warranties.", domain: "thisoldhouse.com" },
        { title: "Gutter Inspection and Repair", url: "https://www.familyhandyman.com/project/how-to-clean-gutters/", quote: "Overflow points often indicate sagging sections or blockage deeper in the run beyond surface debris.", domain: "familyhandyman.com" },
        { title: "How to Clean a Concrete Driveway", url: "https://www.bobvila.com/articles/how-to-clean-a-concrete-driveway/", quote: "Oil staining requires a degreaser pre-treatment before surface washing to fully lift the staining.", domain: "bobvila.com" },
      ],
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    checkout: {
      planId: "protection",
      planName: "Protection Plan",
      planPrice: 3500,
      paymentOption: "deposit-monthly",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      contractNote:
        "Access via side gate — David will leave unlocked on service day. Prefer morning scheduling. Month 12 and Month 18 visits to be booked 30 days in advance.",
    },
    sections: {
      ...makeAssessment().sections,
      vegetation: {
        trees: true,
        plants: false,
        flowers: false,
        other: false,
        notes: "Large oak overhangs rear roof. Should be trimmed before service.",
      },
      roof: {
        stories: "2 story",
        age: "14 years",
        pitch: "Steep",
        material: "Shingles",
        condition: "fair",
        notes: "Heavy moss on north pitch. Debris in valleys. Needs roof-safe treatment only.",
      },
      gutters: {
        number: 6,
        length: "180 ft",
        guards: false,
        age: "14 years",
        condition: "fair",
        notes: "Clogged in two spots. Overflowing at NW and SE corners.",
      },
      windows: {
        number: 18,
        age: "14 years",
        condition: "fair",
        notes: "Heavy film buildup on east and south faces. All need cleaning.",
      },
      screens: {
        number: 14,
        age: "8 years",
        condition: "good",
        notes: "Most screens intact. Two bent on second floor.",
      },
      siding: {
        color: "Cream white",
        age: "6 years",
        material: "Vinyl",
        condition: "good",
        notes: "Siding itself is in good shape. Mostly just needs washing.",
      },
      driveway: {
        size: "60ft x 20ft",
        color: "Gray",
        material: "Bluestone",
        condition: "fair",
        notes: "Oil staining near garage bay. Surface buildup on east half.",
      },
    },
  },
];

export async function POST() {
  const supabaseAdmin = getSupabaseAdmin();

  const rows = SAMPLE_ASSESSMENTS.map(mapAssessmentToRow);

  const { error } = await supabaseAdmin
    .from("assessments")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ seeded: SAMPLE_ASSESSMENTS.length });
}
