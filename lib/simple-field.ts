export type Status = "draft" | "ongoing" | "finished";
export type Condition = "fair" | "good" | "great";
export type UserId = "steven" | "beth";

export type Owner = {
  name: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  email: string;
};

export type SectionValue = Record<string, string | number | boolean>;

export type AiSource = {
  title: string;
  url: string;
  quote: string;
  domain: string;
};

export type AiSummary = {
  summary: string;
  nextSteps: string[];
  sources: AiSource[];
  generatedAt: string;
};

export type CheckoutPlanId = "shine-now" | "protection" | "shine-ready" | "shine-renew";

export type CheckoutData = {
  planId: CheckoutPlanId;
  planName: string;
  planPrice: number;
  paymentOption: "full" | "deposit-monthly";
  createdAt: string;
  contractNote: string;
  /** Tax rate as a decimal, e.g. 0.06 for 6% */
  taxRate: number;
  /** Dollar amount of tax (planPrice * taxRate) */
  taxAmount: number;
  /** Total with tax (planPrice + taxAmount) */
  totalAmount: number;
  /** Deposit due today — only set when paymentOption === "deposit-monthly" */
  depositAmount?: number;
  /** Monthly installment — only set when paymentOption === "deposit-monthly" */
  monthlyAmount?: number;
  /** Number of monthly installments — only set when paymentOption === "deposit-monthly" */
  months?: number;
  /** Dollar amount of discount applied before tax (optional) */
  discountAmount?: number;
  /** Reason for discount, e.g. "Customer satisfaction" (optional) */
  discountNote?: string;
};

export type BookingData = {
  /** ISO date string "YYYY-MM-DD" */
  date: string;
  /** 24-hour time "HH:MM" */
  time: string;
  /** Job window duration in minutes, e.g. 90, 120, 180 */
  duration?: number;
  /** Optional note for access / visit details */
  note?: string;
  /** Human label for the visit, e.g. "Full Exterior Clean" */
  visitLabel?: string;
};

export type Assessment = {
  id: string;
  owner: Owner;
  status: Status;
  createdAt: string;
  updatedAt: string;
  writeup: string;
  aiSummary: AiSummary | null;
  checkout?: CheckoutData | null;
  booking?: BookingData | null;
  followUpBookings?: BookingData[];
  sections: Record<string, SectionValue | null>;
};

export type AppUser = {
  id: UserId;
  name: string;
  username: string;
  password: string;
  role: "admin";
};

export type OptionField = {
  kind: "select";
  key: string;
  label: string;
  emoji?: string;
  options: string[];
};

export type TextField = {
  kind: "text" | "number";
  key: string;
  label: string;
  emoji?: string;
  placeholder?: string;
};

export type ToggleField = {
  kind: "toggle";
  key: string;
  label: string;
  emoji?: string;
};

export type ConditionField = {
  kind: "condition";
  key: string;
  label: string;
  emoji?: string;
};

export type NotesField = {
  kind: "notes";
  key: string;
  label: string;
  emoji?: string;
  placeholder?: string;
};

export type DimensionField = {
  kind: "dimension";
  lengthKey: string;
  widthKey: string;
  label: string;
  emoji?: string;
};

export type FieldDefinition =
  | OptionField
  | TextField
  | ToggleField
  | ConditionField
  | NotesField
  | DimensionField;

export type SectionDefinition = {
  id: string;
  label: string;
  emoji: string;
  fields: FieldDefinition[];
};

export type AssessmentAiRequest = {
  assessment: Assessment;
};

export const sectionReferenceMap: Record<string, string[]> = {
  vegetation: [
    "Tree and shrub trimming should be scheduled before exterior washing if branches touch the home.",
    "Vegetation should be kept back from siding and gutters to reduce staining and trapped moisture.",
  ],
  roof: [
    "Moss, debris, and heavy shade can shorten roof life and should be addressed with low-pressure roof-safe cleaning.",
    "Aging or damaged roofing should be inspected before any service plan is finalized.",
  ],
  gutters: [
    "Gutters should flow freely and discharge away from the foundation to reduce water backup.",
    "Damaged or aging gutter guards may need repair or replacement before routine maintenance works well.",
  ],
  windows: [
    "Older windows may need gentler cleaning plans and seal checks before recurring service.",
  ],
  screens: [
    "Bent or aging screens should be repaired before repeated removal and cleaning.",
  ],
  shutters: [
    "Loose or faded shutters may benefit from light cleaning plus maintenance review.",
  ],
  siding: [
    "Siding type and condition affect the cleaning method, especially for wood and older surfaces.",
  ],
  walkway: [
    "Walkways with staining or organic buildup may need surface-specific washing and slip-risk treatment.",
  ],
  driveway: [
    "Driveways often need separate treatment for organic buildup, oil spotting, or heavy discoloration.",
  ],
  deck: [
    "Deck material and finish determine whether a light wash or a more careful restoration prep is appropriate.",
  ],
  "solar-panel": [
    "Solar panels should be cleaned with panel-safe methods that protect output and surface coatings.",
  ],
  other: [
    "Custom surfaces should be reviewed for material-specific care before quoting recurring work.",
  ],
};

export const sectionDefinitions: SectionDefinition[] = [
  {
    id: "vegetation",
    label: "Vegetation",
    emoji: "\u{1F33F}",
    fields: [
      { kind: "toggle", key: "trees", label: "Trees", emoji: "\u{1F333}" },
      { kind: "toggle", key: "plants", label: "Plants", emoji: "\u{1F331}" },
      { kind: "toggle", key: "flowers", label: "Flowers", emoji: "\u{1F33C}" },
      { kind: "toggle", key: "other", label: "Other", emoji: "\u2795" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple vegetation notes" },
    ],
  },
  {
    id: "roof",
    label: "Roof",
    emoji: "\u{1F3E0}",
    fields: [
      { kind: "select", key: "stories", label: "One or two story home", emoji: "\u{1F3E1}", options: ["1 story", "2 story"] },
      { kind: "text", key: "age", label: "Age of roof", emoji: "\u23F3", placeholder: "Age" },
      { kind: "text", key: "pitch", label: "Pitch", emoji: "\u{1F4D0}", placeholder: "Pitch" },
      { kind: "select", key: "material", label: "Material", emoji: "\u{1FAA8}", options: ["Shingles", "Metal", "Slate"] },
      { kind: "condition", key: "condition", label: "Condition status", emoji: "\u{1F4CB}" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple roof notes" },
    ],
  },
  {
    id: "gutters",
    label: "Gutters",
    emoji: "\u{1F4A7}",
    fields: [
      { kind: "number", key: "number", label: "Number", emoji: "\u{1F522}", placeholder: "Number" },
      { kind: "text", key: "length", label: "Length", emoji: "\u{1F4CF}", placeholder: "Length" },
      { kind: "toggle", key: "guards", label: "Guards", emoji: "\u{1F6E1}" },
      { kind: "text", key: "age", label: "Age", emoji: "\u23F3", placeholder: "Age" },
      { kind: "condition", key: "condition", label: "Condition status", emoji: "\u{1F4CB}" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple gutter notes" },
    ],
  },
  {
    id: "windows",
    label: "Windows",
    emoji: "\u{1FA9F}",
    fields: [
      { kind: "number", key: "number", label: "Number", emoji: "\u{1F522}", placeholder: "Number" },
      { kind: "text", key: "age", label: "Age", emoji: "\u23F3", placeholder: "Age" },
      { kind: "condition", key: "condition", label: "Condition status", emoji: "\u{1F4CB}" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple window notes" },
    ],
  },
  {
    id: "screens",
    label: "Screens",
    emoji: "\u{1F9F0}",
    fields: [
      { kind: "number", key: "number", label: "Number", emoji: "\u{1F522}", placeholder: "Number" },
      { kind: "text", key: "age", label: "Age", emoji: "\u23F3", placeholder: "Age" },
      { kind: "condition", key: "condition", label: "Condition status", emoji: "\u{1F4CB}" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple screen notes" },
    ],
  },
  {
    id: "shutters",
    label: "Shutters",
    emoji: "\u{1F6AA}",
    fields: [
      { kind: "number", key: "number", label: "Number", emoji: "\u{1F522}", placeholder: "Number" },
      { kind: "text", key: "color", label: "Color", emoji: "\u{1F3A8}", placeholder: "Color" },
      { kind: "text", key: "age", label: "Age", emoji: "\u23F3", placeholder: "Age" },
      { kind: "condition", key: "condition", label: "Condition status", emoji: "\u{1F4CB}" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple shutter notes" },
    ],
  },
  {
    id: "siding",
    label: "Siding",
    emoji: "\u{1F9F1}",
    fields: [
      { kind: "text", key: "color", label: "Color", emoji: "\u{1F3A8}", placeholder: "Color" },
      { kind: "text", key: "age", label: "Age", emoji: "\u23F3", placeholder: "Age" },
      { kind: "select", key: "material", label: "Material", emoji: "\u{1F9F1}", options: ["Vinyl", "Wood", "Stone", "Other"] },
      { kind: "condition", key: "condition", label: "Condition status", emoji: "\u{1F4CB}" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple siding notes" },
    ],
  },
  {
    id: "walkway",
    label: "Walkway",
    emoji: "\u{1FAA8}",
    fields: [
      { kind: "dimension", lengthKey: "length", widthKey: "width", label: "Dimensions", emoji: "\u{1F4CF}" },
      { kind: "text", key: "color", label: "Color", emoji: "\u{1F3A8}", placeholder: "Color" },
      { kind: "select", key: "material", label: "Material", emoji: "\u{1FAA8}", options: ["Bluestone", "Brick", "Other"] },
      { kind: "condition", key: "condition", label: "Condition status", emoji: "\u{1F4CB}" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple walkway notes" },
    ],
  },
  {
    id: "driveway",
    label: "Driveway",
    emoji: "\u{1F697}",
    fields: [
      { kind: "dimension", lengthKey: "length", widthKey: "width", label: "Dimensions", emoji: "\u{1F4CF}" },
      { kind: "text", key: "color", label: "Color", emoji: "\u{1F3A8}", placeholder: "Color" },
      { kind: "select", key: "material", label: "Material", emoji: "\u{1F6E3}", options: ["Bluestone", "Brick", "Other"] },
      { kind: "condition", key: "condition", label: "Condition status", emoji: "\u{1F4CB}" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple driveway notes" },
    ],
  },
  {
    id: "deck",
    label: "Deck",
    emoji: "\u{1FAB5}",
    fields: [
      { kind: "dimension", lengthKey: "length", widthKey: "width", label: "Dimensions", emoji: "\u{1F4CF}" },
      { kind: "text", key: "color", label: "Color", emoji: "\u{1F3A8}", placeholder: "Color" },
      { kind: "select", key: "material", label: "Material", emoji: "\u{1FAB5}", options: ["Wood", "Trex", "Other"] },
      { kind: "condition", key: "condition", label: "Condition status", emoji: "\u{1F4CB}" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple deck notes" },
    ],
  },
  {
    id: "solar-panel",
    label: "Solar Panel",
    emoji: "\u2600\uFE0F",
    fields: [
      { kind: "number", key: "number", label: "Number panels", emoji: "\u{1F522}", placeholder: "Number panels" },
      { kind: "text", key: "age", label: "Age", emoji: "\u23F3", placeholder: "Age" },
      { kind: "select", key: "floor", label: "1st or 2nd floor", emoji: "\u{1F3E2}", options: ["1st Floor", "2nd Floor"] },
      { kind: "condition", key: "condition", label: "Condition status", emoji: "\u{1F4CB}" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple solar panel notes" },
    ],
  },
  {
    id: "other",
    label: "Other",
    emoji: "\u2795",
    fields: [
      { kind: "number", key: "surface", label: "Surface (1, 2, 3...)", emoji: "\u2795", placeholder: "Surface count" },
      { kind: "condition", key: "condition", label: "Condition status", emoji: "\u{1F4CB}" },
      { kind: "notes", key: "notes", label: "Notes", emoji: "\u{1F4DD}", placeholder: "Simple notes for extra surfaces" },
    ],
  },
];

export const emptyOwner: Owner = {
  name: "",
  street: "",
  city: "",
  state: "VT",
  phone: "",
  email: "",
};

export const townOptions = [
  "Burlington",
  "South Burlington",
  "Essex",
  "Colchester",
  "Williston",
  "Shelburne",
  "Charlotte",
  "Hinesburg",
  "Milton",
  "Stowe",
  "Waterbury",
  "Montpelier",
  "Barre",
  "Middlebury",
  "Vergennes",
  "Rutland",
  "Bennington",
  "Brattleboro",
  "Hartford",
  "White River Junction",
  "Woodstock",
  "Newport",
  "Morrisville",
  "Jericho",
  "Underhill",
  "Richmond",
  "Winooski",
] as const;

export const stateOptions = ["VT", "NH", "NY", "MA", "ME", "CT", "RI"] as const;

export function formatOwnerAddress(owner: Owner) {
  return [owner.street, owner.city, owner.state].filter(Boolean).join(", ");
}

export const appUsers: AppUser[] = [
  {
    id: "steven",
    name: "Steven Maestas",
    username: "steven",
    password: "homeshine-steven",
    role: "admin",
  },
  {
    id: "beth",
    name: "Beth",
    username: "beth",
    password: "homeshine-beth",
    role: "admin",
  },
];

export function makeAssessment(): Assessment {
  const sections = Object.fromEntries(
    sectionDefinitions.map((section) => [section.id, null])
  ) as Record<string, SectionValue | null>;

  return {
    id: `hs-${Date.now()}`,
    owner: emptyOwner,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    writeup: "",
    aiSummary: null,
    checkout: null,
    sections,
  };
}

export function sampleAssessments(): Assessment[] {
  return [
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
        "Roof and gutters look in good shape overall. Minor moss noted at rear roof corner. Siding is vinyl and holding up well, but showing some algae streaks on the north face. Walkway has mild green buildup — good candidate for surface washing.",
      checkout: null,
      aiSummary: {
        summary:
          "Megan's home is a solid candidate for routine exterior maintenance. The roof has minor moss growth at the rear corner that should be addressed before it spreads. Gutters are in good condition with guards in place. Siding shows light algae on the north face — a common seasonal issue that cleans up well.",
        nextSteps: [
          "Schedule a roof-safe low-pressure cleaning for the rear corner moss.",
          "Confirm gutters are flowing freely after service.",
          "Include north-face siding treatment in the base cleaning scope.",
        ],
        sources: [
          { title: "How to Remove Moss From a Roof", url: "https://www.thisoldhouse.com/roofing/21015071/how-to-remove-moss-from-a-roof", quote: "Low-pressure washing with a roof-safe solution is the safest way to remove moss without damaging shingles.", domain: "thisoldhouse.com" },
          { title: "How to Clean Gutters", url: "https://www.familyhandyman.com/project/how-to-clean-gutters/", quote: "Keeping gutters clear prevents water from backing up against the fascia and causing rot or foundation issues.", domain: "familyhandyman.com" },
          { title: "How to Clean Vinyl Siding", url: "https://www.bobvila.com/articles/how-to-clean-vinyl-siding/", quote: "A soft-wash approach with appropriate detergent removes algae and mildew from vinyl without damaging the surface.", domain: "bobvila.com" },
        ],
        generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
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
          notes: "Guards intact. Flowing well.",
        },
        siding: {
          color: "Sage green",
          age: "12 years",
          material: "Vinyl",
          condition: "good",
          notes: "Light algae on north face.",
        },
        walkway: {
          length: 40,
          width: 4,
          color: "Gray",
          material: "Bluestone",
          condition: "fair",
          notes: "Mild green buildup near the entry steps.",
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
        "David's home has significant exterior buildup across multiple surfaces. The roof shows heavy moss on the north pitch. Gutters are clogged at two spots. Windows need full cleaning — 18 total. Driveway has oil staining near the garage bay. Strong Protection Plan candidate.",
      aiSummary: {
        summary:
          "David's home is overdue for a comprehensive exterior reset. Moss on the north roof pitch and clogged gutters are the most urgent items. The driveway oil stain and heavy window buildup point to deferred maintenance over 1–2 seasons. The Protection Plan is well matched: a deep clean plus scheduled tune-ups will stabilize the property.",
        nextSteps: [
          "Prioritize roof-safe moss treatment on the north pitch before next rain season.",
          "Clear and flush all gutters; inspect for damage at the two overflow points.",
          "Include driveway degreasing in the service scope.",
          "Set up Month 12 and Month 18 maintenance visits at booking.",
        ],
        sources: [
          { title: "Moss and Algae on Roofs", url: "https://www.thisoldhouse.com/roofing/21015071/how-to-remove-moss-from-a-roof", quote: "Heavy moss on the north pitch should be treated with a roof-safe solution — pressure washing risks shingle damage.", domain: "thisoldhouse.com" },
          { title: "Gutter Inspection and Repair", url: "https://www.familyhandyman.com/project/how-to-clean-gutters/", quote: "Overflow points often indicate sagging sections or blockage deeper in the run, not just surface debris.", domain: "familyhandyman.com" },
          { title: "Driveway Cleaning and Stain Removal", url: "https://www.bobvila.com/articles/how-to-clean-a-concrete-driveway/", quote: "Oil stains require a degreaser pre-treatment before surface washing to fully lift the staining.", domain: "bobvila.com" },
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
          "Access via side gate — David will leave unlocked on service day. Prefer morning scheduling.",
        taxRate: 0.06,
        taxAmount: 210,
        totalAmount: 3710,
        depositAmount: 500,
        monthlyAmount: 178.33,
        months: 18,
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
          notes: "Heavy moss on north pitch. Debris in valleys. Roof-safe treatment only.",
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
          notes: "Heavy film buildup on east and south faces.",
        },
        screens: {
          number: 14,
          age: "8 years",
          condition: "good",
          notes: "Two bent on second floor.",
        },
        siding: {
          color: "Cream white",
          age: "6 years",
          material: "Vinyl",
          condition: "good",
          notes: "Good shape overall, just needs washing.",
        },
        driveway: {
          length: 60,
          width: 20,
          color: "Gray",
          material: "Bluestone",
          condition: "fair",
          notes: "Oil staining near garage bay.",
        },
      },
    },
  ];
}
