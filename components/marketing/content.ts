import {
  CalendarDays,
  ClipboardList,
  Droplets,
  HelpCircle,
  Home,
  Leaf,
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  SunMedium,
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

export const services = [
  {
    icon: Wind,
    name: "Gutter and Spout Cleaning",
    detail: "Debris removed, flow checked, and problem spots documented before water has a chance to back up.",
  },
  {
    icon: Home,
    name: "Wood and Vinyl Cleaning",
    detail: "Low-pressure soft washing for siding, trim, soffits, fencing, and painted or stained wood.",
  },
  {
    icon: SunMedium,
    name: "Patio and Deck Sealing",
    detail: "Prep and protection for outdoor living surfaces that take Vermont weather head-on.",
  },
  {
    icon: Waves,
    name: "Brick and Stone Sand and Seal",
    detail: "Power washing and finish care for masonry, pavers, walkways, and stone features.",
  },
  {
    icon: Droplets,
    name: "Concrete Cleaning and Sealing",
    detail: "Higher-force cleaning where the surface can take it: concrete, drives, and hardscape.",
  },
  {
    icon: Sparkles,
    name: "Roof Mold and Stains",
    detail: "Soft-wash roof treatment for algae, moss, lichen, and dark streaking without blasting shingles.",
  },
  {
    icon: Leaf,
    name: "Solar Panel Cleaning",
    detail: "Gentle panel cleaning that protects equipment and helps the system collect clean light.",
  },
];

export const plans = [
  {
    name: "SHINE NOW",
    label: "One-time reset",
    detail: "A full roof-to-curb clean for homeowners who need the exterior looking sharp now.",
    price: "$2,750",
  },
  {
    name: "SHINE-Protection",
    label: "Year-round upkeep",
    detail: "Ongoing maintenance for homeowners who want buildup handled before it becomes a full reset.",
    price: "$3,500",
    featured: true,
  },
  {
    name: "SHINE-Ready",
    label: "Selling the home",
    detail: "Show-ready care that keeps a property photo-ready and buyer-ready until it sells.",
    price: "$5,000",
  },
  {
    name: "SHINE-Renew",
    label: "Restoration path",
    detail: "A deeper return for overgrown, stained, or neglected properties that need methodical recovery.",
    price: "$7,500",
  },
];

export const faqs = [
  {
    question: "Clean vs. restore",
    answer:
      "Power washing removes surface contaminants. Soft-wash restoration goes deeper on mold and mildew buildup by using the right cleaning solution at low force.",
  },
  {
    question: "Pet and plant safety",
    answer:
      "HomeSHINE uses eco-friendly, pet- and plant-safe solutions. Techs pre-water plants before service and keep watering during and after to dilute any spill.",
  },
  {
    question: "Soft wash vs. pressure wash",
    answer:
      "Soft washing uses low force plus detergent for delicate surfaces like roofs, stucco, siding, and wood. Pressure washing uses higher force for concrete, stone, and masonry.",
  },
  {
    question: "Insurance and job safety",
    answer:
      "HomeSHINE is fully insured, safety-assesses job sites, and is certified in work safety.",
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
    href: "tel:+18023919977",
    label: "802-391-9977",
    detail: "Call or text Mon-Sat, 7:30am-7:30pm.",
    icon: PhoneCall,
  },
  {
    href: "mailto:steven@homeshinevt.com",
    label: "steven@homeshinevt.com",
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
