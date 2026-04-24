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

export type AiSummary = {
  summary: string;
  nextSteps: string[];
  sources: string[];
  generatedAt: string;
};

export type Assessment = {
  id: string;
  owner: Owner;
  status: Status;
  createdAt: string;
  updatedAt: string;
  writeup: string;
  aiSummary: AiSummary | null;
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

export type FieldDefinition =
  | OptionField
  | TextField
  | ToggleField
  | ConditionField
  | NotesField;

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
      { kind: "text", key: "size", label: "Length & width", emoji: "\u{1F4CF}", placeholder: "Length & width" },
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
      { kind: "text", key: "size", label: "Length & width", emoji: "\u{1F4CF}", placeholder: "Length & width" },
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
      { kind: "text", key: "size", label: "Length & width", emoji: "\u{1F4CF}", placeholder: "Length & width" },
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
    sections,
  };
}

export function sampleAssessments(): Assessment[] {
  return [
    {
      id: "hs-1",
      owner: {
        name: "Megan Hart",
        street: "18 Birch Hollow Lane",
        city: "Shelburne",
        state: "VT",
        phone: "(802) 555-0130",
        email: "megan@example.com",
      },
      status: "ongoing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      writeup: "Roof and gutters look in good shape overall. Minor moss noted at rear roof corner.",
      aiSummary: {
        summary:
          "The home looks like a solid candidate for routine exterior maintenance, with the roof and gutters needing light attention first because of the moss noted near the rear roof corner.",
        nextSteps: [
          "Schedule a roof-safe cleaning review for the rear corner moss.",
          "Confirm the gutters are fully clear and flowing after service.",
          "Use this visit as the baseline for future seasonal maintenance.",
        ],
        sources: [
          "Roof: Moss buildup should be addressed with low-pressure roof-safe cleaning.",
          "Gutters: Free-flowing gutters help reduce water backup around the home.",
        ],
        generatedAt: new Date().toISOString(),
      },
      sections: {
        ...makeAssessment().sections,
        roof: {
          stories: "2 story",
          age: "10 years",
          pitch: "Moderate",
          material: "Shingles",
          condition: "good",
          notes: "Simple moss near back corner",
        },
        gutters: {
          number: 4,
          length: "120 ft",
          guards: true,
          age: "8 years",
          condition: "good",
          notes: "",
        },
      },
    },
  ];
}
