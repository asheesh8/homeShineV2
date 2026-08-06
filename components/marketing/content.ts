import {
  CHECKOUT_PLANS,
  calcDepositMonthly,
  money,
  moneyDecimal,
} from "@/components/field-app/utils";
import {
  CalendarDays,
  ClipboardList,
  Droplets,
  Fence,
  HelpCircle,
  Home,
  Leaf,
  Mail,
  MapPin,
  PanelsTopLeft,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Users,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";

export type MarketingNavItem = {
  href: string;
  label: string;
  summary: string;
  icon: LucideIcon;
};

export const marketingNav: MarketingNavItem[] = [
  {
    href: "/services",
    label: "Services",
    summary: "Roofline, siding, gutters, hardscape, panels.",
    icon: Droplets,
  },
  {
    href: "/plans",
    label: "Plans",
    summary: "One-time resets and maintenance paths.",
    icon: ShieldCheck,
  },
  {
    href: "/proof",
    label: "Proof",
    summary: "Real HomeSHINE jobsite media and process.",
    icon: Sparkles,
  },
  {
    href: "/about",
    label: "About",
    summary: "The story and people behind every visit.",
    icon: Users,
  },
  {
    href: "/faq",
    label: "FAQ",
    summary: "Soft wash, pressure wash, safety, plants.",
    icon: HelpCircle,
  },
  {
    href: "/contact",
    label: "Contact",
    summary: "Call, email, book, and service area.",
    icon: PhoneCall,
  },
];

export const brand = {
  tagline: "From roof to curb.",
  promise:
    "Our plans protect your investment, renew your home's beauty, and keep it shining year-round.",
  offer: "Free onsite assessment of your roof, gutters, windows, siding, and more.",
};

export const contact = {
  phone: "802-391-9977",
  phoneHref: "tel:+18023919977",
  email: "steven@homeshinevt.com",
  emailHref: "mailto:steven@homeshinevt.com",
  address: "26 Cottage Grove Ave, South Burlington, VT 05403",
  hours: "Mon-Sat, 7:30am - 7:30pm",
};

export const googleReviewsUrl =
  "https://www.google.com/maps/place/Homeshine+LLC/@44.4673489,-73.2280165,12z/data=!3m1!4b1!4m6!3m5!1s0x486d20e5c13ab20d:0xd4890aca259cbdca!8m2!3d44.4673489!4d-73.2280165!16s%2Fg%2F11y0q7pkjm?hl=en";

export const customerReviews = [
  {
    name: "Shannon Leclair",
    service: "Whole-property exterior care",
    quote:
      "Rain or shine, Steve, Beth, and the entire HomeSHINE team show up ready to work and make your home look its absolute best.",
  },
  {
    name: "Matt Marshall",
    service: "House wash and three-season room",
    quote:
      "The absolute best part? True white-glove service. They moved everything off our porch and put it all right back exactly where it belonged.",
  },
  {
    name: "Carrie Cruz",
    service: "Cedar deck cleaning and sealing",
    quote:
      "They soft cleaned our cedar deck with care and excellence and sealed it against the elements here in Vermont with perfection!",
  },
];

export const services = [
  {
    icon: Sparkles,
    name: "Roof Mold and Stains",
    detail:
      "Soft-wash roof treatment for algae, moss, lichen, and dark streaking without blasting shingles.",
  },
  {
    icon: Home,
    name: "Wood and Vinyl Cleaning",
    detail:
      "Low-pressure soft washing for siding, trim, soffits, fencing, and painted or stained wood.",
  },
  {
    icon: Wind,
    name: "Gutter and Spout Cleaning",
    detail:
      "Debris removed, flow checked, and problem spots documented before water has a chance to back up.",
  },
  {
    icon: Droplets,
    name: "Concrete Cleaning and Sealing",
    detail:
      "Higher-force cleaning where the surface can take it: concrete, drives, and hardscape.",
  },
  {
    icon: Waves,
    name: "Brick and Stone Sand and Seal",
    detail:
      "Masonry cleaning, joint sand, and sealing that stabilizes pavers, slows weeds, and protects the finish.",
  },
  {
    icon: SunMedium,
    name: "Patio and Deck Sealing",
    detail:
      "Careful prep and sealing that protects outdoor living surfaces from UV, moisture, and wear.",
  },
  {
    icon: Leaf,
    name: "Solar Panel Cleaning",
    detail:
      "Reverse-osmosis cleaning that leaves no mineral residue and uses methods safe around panel electronics.",
  },
  {
    icon: PanelsTopLeft,
    name: "Window Cleaning",
    detail:
      "Glass, frames, and sills cleaned as part of the exterior pass so the whole elevation matches.",
  },
  {
    icon: Fence,
    name: "Fence and Railing Wash",
    detail:
      "Vinyl, wood, and composite fencing brought back without stripping stain or scarring grain.",
  },
];

/* ────────────────────────────────────────────────────────────────
   Surface method explorer — what tool meets what material, and why
   ──────────────────────────────────────────────────────────────── */

export type SurfaceMethod = {
  id: string;
  label: string;
  icon: LucideIcon;
  method: "Soft wash" | "Pressure wash";
  psi: number;
  psiLabel: string;
  headline: string;
  detail: string;
  protects: string[];
  risk: string;
};

/** Pressure ceiling used to scale the gauge arc. */
export const MAX_PSI = 3500;

export const surfaceMethods: SurfaceMethod[] = [
  {
    id: "roof",
    label: "Asphalt roof",
    icon: Sparkles,
    method: "Soft wash",
    psi: 100,
    psiLabel: "~100 PSI (garden-hose force)",
    headline: "Chemistry does the work. Pressure does not.",
    detail:
      "Algae, moss, and lichen are living growth, so they get treated, not blasted. A low-force application dwells on the shingle, kills the growth at the root, and rinses clean.",
    protects: ["Shingle granules", "Roof warranty", "Flashing and seals"],
    risk: "High pressure strips granules and shortens roof life by years.",
  },
  {
    id: "vinyl",
    label: "Vinyl siding",
    icon: Home,
    method: "Soft wash",
    psi: 500,
    psiLabel: "~500 PSI with detergent",
    headline: "Get behind the film without forcing water behind the panel.",
    detail:
      "Siding holds a thin biological film that pressure alone smears around. Detergent breaks it, a low-force rinse carries it off, and the panel laps stay sealed.",
    protects: ["Panel laps", "Housewrap", "Window seals"],
    risk: "Force at the wrong angle drives water behind siding and into sheathing.",
  },
  {
    id: "wood",
    label: "Wood and cedar",
    icon: Fence,
    method: "Soft wash",
    psi: 600,
    psiLabel: "~600 PSI, fan tip, with the grain",
    headline: "Clean the fibre without raising it.",
    detail:
      "Soft wood scars fast. A wide fan at low force with the right cleaner lifts grey and mildew while leaving the grain smooth enough to seal the same season.",
    protects: ["Grain and fibre", "Existing stain", "Fasteners"],
    risk: "Too much force furs the wood and forces a full sand before sealing.",
  },
  {
    id: "solar",
    label: "Solar panels",
    icon: Leaf,
    method: "Soft wash",
    psi: 60,
    psiLabel: "~60 PSI, deionized rinse",
    headline: "Gentle glass work, zero mineral spotting.",
    detail:
      "Panels get a purified-water wash so nothing dries onto the glass. Clean light in means the array collects what it was specified to collect.",
    protects: ["Anti-reflective coating", "Panel seals", "Inverter warranty"],
    risk: "Hard water and abrasives haze the coating permanently.",
  },
  {
    id: "concrete",
    label: "Concrete and drives",
    icon: Droplets,
    method: "Pressure wash",
    psi: 3000,
    psiLabel: "~3,000 PSI on a surface cleaner",
    headline: "Here the surface can take the force.",
    detail:
      "Flat concrete gets a rotating surface cleaner so the cut is even edge to edge. No wand stripes, no zebra marks, no missed lane down the middle of the drive.",
    protects: ["Even finish", "Control joints", "Adjacent turf"],
    risk: "A hand wand on flat concrete leaves permanent striping.",
  },
  {
    id: "masonry",
    label: "Brick, stone, pavers",
    icon: Waves,
    method: "Pressure wash",
    psi: 2200,
    psiLabel: "~2,200 PSI, dialed to the joint",
    headline: "Read the mortar before choosing the tip.",
    detail:
      "Hard masonry takes real force, but soft or older mortar does not. Pressure is set to the weakest joint on the wall, then pavers are re-sanded and sealed if the job calls for it.",
    protects: ["Mortar joints", "Paver sand", "Efflorescence-prone faces"],
    risk: "Blown joints on old mortar turn a wash into a repointing bill.",
  },
  {
    id: "gutters",
    label: "Gutters and spouts",
    icon: Wind,
    method: "Soft wash",
    psi: 400,
    psiLabel: "Hand clear, then ~400 PSI face wash",
    headline: "Clear the flow first, then clean the face.",
    detail:
      "Debris comes out by hand so nothing packs into the elbow. Downspouts get flow-tested, and the outside face gets the detergent that actually removes tiger striping.",
    protects: ["Hangers and spikes", "Fascia board", "Downspout elbows"],
    risk: "Flushing debris downstream is how spouts get plugged solid.",
  },
];

/* ────────────────────────────────────────────────────────────────
   Coverage map data — lat/lng is projected into the SVG at render
   ──────────────────────────────────────────────────────────────── */

export type ServiceTown = {
  name: string;
  lat: number;
  lng: number;
  /** core = primary route, edge = served on scheduled runs */
  tier: "core" | "edge";
};

export type ServiceRegion = {
  id: string;
  label: string;
  short: string;
  blurb: string;
  base: string;
  baseLat: number;
  baseLng: number;
  towns: ServiceTown[];
  /** Rough decorative water outline, drawn behind the pins. */
  water: [number, number][];
};

export const serviceRegions: ServiceRegion[] = [
  {
    id: "vt",
    label: "Chittenden County, Vermont",
    short: "Vermont",
    blurb:
      "The home route. Steven is based in South Burlington and runs the county six days a week through the season.",
    base: "South Burlington",
    baseLat: 44.467,
    baseLng: -73.1709,
    towns: [
      { name: "Burlington", lat: 44.4759, lng: -73.2121, tier: "core" },
      { name: "South Burlington", lat: 44.467, lng: -73.1709, tier: "core" },
      { name: "Winooski", lat: 44.4914, lng: -73.1857, tier: "core" },
      { name: "Colchester", lat: 44.5434, lng: -73.1479, tier: "core" },
      { name: "Essex", lat: 44.4906, lng: -73.1101, tier: "core" },
      { name: "Williston", lat: 44.437, lng: -73.0968, tier: "core" },
      { name: "Shelburne", lat: 44.3806, lng: -73.2279, tier: "core" },
      { name: "Charlotte", lat: 44.3095, lng: -73.261, tier: "core" },
      { name: "Hinesburg", lat: 44.3292, lng: -73.1104, tier: "core" },
      { name: "Milton", lat: 44.6392, lng: -73.1104, tier: "edge" },
      { name: "Jericho", lat: 44.5031, lng: -72.9979, tier: "edge" },
      { name: "Richmond", lat: 44.4045, lng: -72.9945, tier: "edge" },
      { name: "Underhill", lat: 44.5395, lng: -72.9018, tier: "edge" },
      { name: "Huntington", lat: 44.3273, lng: -72.9807, tier: "edge" },
      { name: "Waterbury", lat: 44.3378, lng: -72.7562, tier: "edge" },
      { name: "Stowe", lat: 44.4654, lng: -72.6874, tier: "edge" },
    ],
    water: [
      [44.70, -73.40],
      [44.66, -73.28],
      [44.60, -73.30],
      [44.55, -73.23],
      [44.50, -73.26],
      [44.46, -73.25],
      [44.42, -73.28],
      [44.37, -73.27],
      [44.32, -73.32],
      [44.26, -73.34],
      [44.22, -73.44],
    ],
  },
  {
    id: "fl",
    label: "Tampa Bay, Florida",
    short: "Florida",
    blurb:
      "The winter route. Same equipment, same method, tuned for stucco, tile roof, and salt-air growth.",
    base: "Tampa",
    baseLat: 27.9506,
    baseLng: -82.4572,
    towns: [
      { name: "Tampa", lat: 27.9506, lng: -82.4572, tier: "core" },
      { name: "Temple Terrace", lat: 28.0353, lng: -82.3893, tier: "core" },
      { name: "Brandon", lat: 27.9378, lng: -82.2859, tier: "core" },
      { name: "Riverview", lat: 27.8661, lng: -82.3265, tier: "core" },
      { name: "Lutz", lat: 28.1511, lng: -82.4615, tier: "core" },
      { name: "Land O' Lakes", lat: 28.2192, lng: -82.4576, tier: "edge" },
      { name: "Wesley Chapel", lat: 28.2397, lng: -82.3279, tier: "edge" },
      { name: "St. Petersburg", lat: 27.7676, lng: -82.6403, tier: "edge" },
      { name: "Clearwater", lat: 27.9659, lng: -82.8001, tier: "edge" },
      { name: "Palm Harbor", lat: 28.0781, lng: -82.7637, tier: "edge" },
    ],
    water: [
      [28.02, -82.56],
      [27.95, -82.51],
      [27.88, -82.46],
      [27.80, -82.42],
      [27.72, -82.47],
      [27.66, -82.58],
      [27.70, -82.68],
      [27.82, -82.66],
      [27.92, -82.63],
      [28.05, -82.72],
      [28.30, -82.78],
    ],
  },
];

/* ────────────────────────────────────────────────────────────────
   Estimator — ballpark only, always routed to a real walkthrough
   ──────────────────────────────────────────────────────────────── */

export type EstimatorService = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Dollars per 1,000 sq ft of home footprint. */
  rate: number;
  /** Floor so small homes still price sanely. */
  floor: number;
};

export const estimatorServices: EstimatorService[] = [
  { id: "house", label: "House wash", icon: Home, rate: 165, floor: 320 },
  { id: "roof", label: "Roof treatment", icon: Sparkles, rate: 240, floor: 480 },
  { id: "gutters", label: "Gutters + spouts", icon: Wind, rate: 85, floor: 180 },
  { id: "concrete", label: "Concrete + drive", icon: Droplets, rate: 120, floor: 250 },
  { id: "deck", label: "Deck or patio", icon: SunMedium, rate: 110, floor: 240 },
  { id: "solar", label: "Solar panels", icon: Leaf, rate: 70, floor: 160 },
  { id: "windows", label: "Windows", icon: PanelsTopLeft, rate: 95, floor: 190 },
];

/**
 * Steven prices a visit, not a line item. One mobilization — one trip, one
 * setup, one water hookup, one crew day — covers every surface on the
 * property, so the more that gets handled in the same pass, the less each
 * surface costs. These credits are HomeSHINE's own bundling policy.
 *
 * OWNER: confirm these percentages before launch. Every saving figure the
 * estimator shows is computed from this table and nothing else.
 */
export const bundleTiers = [
  { min: 7, credit: 0.24 },
  { min: 5, credit: 0.18 },
  { min: 3, credit: 0.12 },
  { min: 2, credit: 0.06 },
  { min: 1, credit: 0 },
];

export const creditFor = (count: number) =>
  bundleTiers.find((tier) => count >= tier.min)?.credit ?? 0;

export const estimatorConditions = [
  { id: "light", label: "Light", detail: "Washed in the last year or two.", multiplier: 0.9 },
  { id: "moderate", label: "Moderate", detail: "Visible green, grey, or streaking.", multiplier: 1 },
  { id: "heavy", label: "Heavy", detail: "Years of buildup, moss, or neglect.", multiplier: 1.32 },
] as const;

export const estimatorStories = [
  { id: 1, label: "1 story", multiplier: 1 },
  { id: 2, label: "2 stories", multiplier: 1.18 },
  { id: 3, label: "3+ stories", multiplier: 1.38 },
] as const;

/* ──────────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────────
   Plans

   Price, includes, deposit, and term are read straight from
   CHECKOUT_PLANS — the same table the field app quotes and bills
   from. The public site and Steven's tablet cannot drift apart.
   Only the display name and the visit cadence live here.
   ──────────────────────────────────────────────────────────────── */

type PlanPresentation = {
  name: string;
  label: string;
  cadence: string;
  /** Site visits the plan actually delivers, per its `includes` schedule. */
  visits: number;
  detail: string;
};

const PLAN_PRESENTATION: Record<string, PlanPresentation> = {
  "shine-now": {
    name: "SHINE NOW",
    label: "One-time reset",
    cadence: "one visit",
    visits: 1,
    detail:
      "A full roof-to-curb clean for a home that needs to look sharp now. Nothing scheduled after it.",
  },
  protection: {
    name: "SHINE-Protection",
    label: "18-month plan",
    cadence: "3 visits / 18 months",
    // Day 1 deep clean + month 12 maintenance + month 18 tune-up.
    visits: 3,
    detail:
      "A deep clean on day one, maintenance at month 12, and a tune-up at month 18 — so buildup never gets back to square one.",
  },
  "shine-ready": {
    name: "SHINE-Ready",
    label: "Selling the home",
    cadence: "until it sells",
    visits: 1,
    detail:
      "Market-ready exterior care for showings, photos, and curb appeal while the property is listed.",
  },
  "shine-renew": {
    name: "SHINE-Renew",
    label: "Restoration path",
    cadence: "staged project",
    visits: 1,
    detail:
      "A deeper renewal path for older, stained, or overgrown properties that need methodical recovery.",
  },
};

export const plans = CHECKOUT_PLANS.map((plan) => {
  const shown = PLAN_PRESENTATION[plan.id];
  const financed =
    plan.deposit != null && plan.months != null ? calcDepositMonthly(plan) : null;

  return {
    id: plan.id,
    name: shown.name,
    label: shown.label,
    cadence: shown.cadence,
    detail: shown.detail,
    visits: shown.visits,
    priceValue: plan.price,
    price: money(plan.price),
    featured: plan.featured ?? false,
    features: plan.includes,
    /** Present only on plans the field app can actually finance. */
    financing: financed
      ? {
          deposit: money(financed.depositAmount),
          monthly: moneyDecimal(financed.monthlyAmount),
          months: financed.months,
        }
      : null,
  };
});

/**
 * Value anchor. Cost per visit, computed from the same CHECKOUT_PLANS table
 * the field app bills from. No competitor figures belong here — a claim about
 * what anyone else charges needs a sourced, dated quote behind it.
 */
export const planValue = plans
  .filter((plan) => ["shine-now", "protection", "shine-renew"].includes(plan.id))
  .map((plan) => ({
    id: plan.id,
    plan: plan.name,
    price: plan.priceValue,
    visits: plan.visits,
    label:
      plan.id === "protection"
        ? `${plan.visits} visits over 18 months`
        : plan.id === "shine-now"
          ? "One wash, one time"
          : "Left until it needs recovery",
    note: plan.detail,
    best: plan.featured,
  }));

export const faqs = [
  {
    question: "What is the difference between soft washing and pressure washing?",
    answer:
      "Soft washing uses low force plus the right detergent for delicate surfaces like roofs, stucco, siding, and wood. Pressure washing uses higher force for concrete, stone, and masonry. Using the wrong one is how exteriors get damaged, so HomeSHINE picks the method per surface, not per house.",
  },
  {
    question: "Is it safe for my plants and pets?",
    answer:
      "Yes. HomeSHINE uses eco-friendly, pet- and plant-safe solutions. Techs pre-water plants before service and keep watering during and after to dilute anything that lands where it should not. Pets stay inside during the visit.",
  },
  {
    question: "Will a roof wash void my shingle warranty?",
    answer:
      "A soft wash will not. Roof treatment runs at roughly garden-hose pressure so the granules stay where the manufacturer put them. It is high-pressure roof cleaning that causes granule loss and warranty problems, and that is not something HomeSHINE does.",
  },
  {
    question: "Are you insured, and is the crew certified?",
    answer:
      "HomeSHINE is fully insured and certified in work safety. Every site gets a safety assessment before work begins, covering ladder points, roof pitch, water access, electrical, and vegetation.",
  },
  {
    question: "How long does a typical visit take?",
    answer:
      "Most single-family house washes run three to five hours. Roof treatment adds two to three. Full roof-to-curb resets on larger properties are usually scheduled across two days so nothing is rushed at the end.",
  },
  {
    question: "How do I get a price?",
    answer:
      "Send photos or book a walkthrough. Steven checks water access, vegetation, roofline, drainage, and surface condition, then sends a written scope before anything starts. The estimator on this site gives a ballpark, not a quote.",
  },
];

export const towns = [
  "Burlington",
  "South Burlington",
  "Williston",
  "Shelburne",
  "Essex",
  "Colchester",
  "Charlotte",
  "Hinesburg",
  "Waterbury",
  "Stowe",
];

export const contactMethods = [
  {
    href: "/book",
    label: "Book a Visit",
    detail: "Free consultation or full home assessment.",
    icon: CalendarDays,
  },
  {
    href: contact.phoneHref,
    label: contact.phone,
    detail: "Call or text Mon-Sat, 7:30am-7:30pm.",
    icon: PhoneCall,
  },
  {
    href: contact.emailHref,
    label: contact.email,
    detail: "Send photos, addresses, and service questions.",
    icon: Mail,
  },
  {
    label: "26 Cottage Grove Ave",
    detail: "South Burlington, VT 05403.",
    icon: MapPin,
  },
];

export const proofPoints = [
  {
    icon: ClipboardList,
    label: "Safety assessed",
    detail: "Every site is checked before work begins.",
  },
  {
    icon: Leaf,
    label: "Plant protected",
    detail: "Plants are watered before, during, and after service.",
  },
  {
    icon: ShieldCheck,
    label: "Fully insured",
    detail: "Certified in work safety and covered for the job.",
  },
];

export const shineMarquee = [
  "Roof mold and stains",
  "Vinyl siding",
  "Concrete and stone",
  "Gutters and spouts",
  "Deck and patio sealing",
  "Solar panels",
  "Brick sand and seal",
  "Show-ready curb appeal",
];

export const processSteps = [
  {
    step: "01",
    title: "Walk the property",
    detail:
      "Steven checks water access, vegetation, roofline, drainage, and surface condition before recommending a wash.",
  },
  {
    step: "02",
    title: "Protect the edges",
    detail:
      "Plants, pets, fixtures, outlets, and delicate finishes are protected before chemistry or pressure comes out.",
  },
  {
    step: "03",
    title: "Match the method",
    detail:
      "Soft wash for delicate materials. Higher-force cleaning only where concrete, stone, or masonry can take it.",
  },
  {
    step: "04",
    title: "Leave the exterior calm",
    detail:
      "The crew rinses, checks trouble spots, documents the finish, and points out what to watch next season.",
  },
];

export const heroStats = [
  { value: 5, suffix: ".0", label: "Google rating", href: googleReviewsUrl, external: true },
  { value: 29, suffix: "", label: "Google reviews", href: googleReviewsUrl, external: true },
  { value: 9, suffix: "", label: "exterior services", href: "/services", external: false },
  { value: 2, suffix: "", label: "seasonal regions", href: "/contact", external: false },
];

export const planSignals = [
  "One-time reset",
  "Seasonal protection",
  "Listing-ready shine",
  "Neglected-property renewal",
  "Written scope before work",
  "Roof-to-curb recommendations",
];

export const visitExpectations = [
  "Choose consultation or assessment",
  "Steven confirms within 24 hours",
  "You get a clear recommended scope",
];
