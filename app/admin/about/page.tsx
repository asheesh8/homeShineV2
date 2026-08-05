import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  ClipboardList,
  Droplets,
  Home,
  Leaf,
  PhoneCall,
  Shield,
  Sparkles,
  Star,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import { HomeShineLogo } from "@/components/homeshine-logo";

export const metadata: Metadata = {
  title: "About HomeSHINE — Exterior Care for Vermont Homes",
  description:
    "HomeSHINE delivers professional exterior cleaning and maintenance services across Vermont. Learn about our mission, services, and team.",
};

const services = [
  { icon: Droplets, label: "Soft Wash Siding", desc: "Gentle, low-pressure cleaning that removes mold, algae, and grime without damaging paint or wood." },
  { icon: Wind, label: "Gutter Cleaning", desc: "Full clear-out and flush of debris so water flows freely and fascia stays dry." },
  { icon: Home, label: "Window & Screen Care", desc: "Streak-free exterior windows and clean screens that let in maximum light." },
  { icon: Leaf, label: "Roof Treatment", desc: "Safe bio-wash treatments that kill moss and lichen at the root without pressure." },
  { icon: Sparkles, label: "Walkway & Driveway", desc: "Surface washing and brightening for concrete, brick, and pavers." },
  { icon: Shield, label: "Deck & Patio Wash", desc: "Wood-safe cleaning and optional brightening to prep surfaces for sealing." },
];

const plans = [
  {
    name: "SHINE NOW",
    price: "$2,750",
    tag: "One-time service",
    desc: "A full exterior reset — everything cleaned in a single visit.",
    featured: false,
  },
  {
    name: "Protection Plan",
    price: "$3,500",
    tag: "18-month plan",
    desc: "Day-1 deep clean plus scheduled maintenance visits to keep buildup from returning.",
    featured: true,
  },
  {
    name: "SHINE Ready",
    price: "$5,000",
    tag: "Selling the home",
    desc: "Market-ready curb appeal care for listings, photos, and showings.",
    featured: false,
  },
  {
    name: "SHINE Renew",
    price: "$7,500",
    tag: "Full restoration",
    desc: "Roof-to-curb renewal for properties that need a deeper reset.",
    featured: false,
  },
];

const values = [
  { icon: CheckCircle2, label: "Honest assessments", desc: "We document what we find and recommend only what's needed." },
  { icon: Star, label: "Craft over shortcuts", desc: "Proper technique and the right chemistry every time — no cutting corners." },
  { icon: Users, label: "Homeowner first", desc: "We explain every step so you always know what's happening at your property." },
  { icon: Zap, label: "Same-day turnaround", desc: "Documents and follow-ups delivered the same day as the assessment." },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-hero-logo">
            <HomeShineLogo size={96} />
          </div>
          <div className="about-hero-copy">
            <p className="hs-kicker">Vermont exterior care</p>
            <h1 className="about-hero-h1">
              Clean homes.<br />
              <span className="about-hero-accent">Honest work.</span>
            </h1>
            <p className="about-hero-lead">
              HomeSHINE is a Vermont-based exterior cleaning and maintenance company. We handle
              everything outside — from roofs to walkways — with safe chemistry, professional
              documentation, and care that lasts.
            </p>
            <div className="about-hero-ctas">
              <a href="tel:+18023919977" className="about-cta-primary">
                <PhoneCall size={18} />
                Call us
              </a>
              <Link href="/admin" className="about-cta-secondary">
                <ClipboardList size={18} />
                Field app
              </Link>
              <Link href="/admin/promos" className="about-cta-secondary">
                <Sparkles size={18} />
                View offers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-section-header">
            <p className="hs-kicker">What we do</p>
            <h2>Services</h2>
            <p className="about-section-sub">
              Every service uses the right technique for the surface — soft wash, low pressure, or
              bio-treatment — to clean thoroughly without causing damage.
            </p>
          </div>
          <div className="about-services-grid">
            {services.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="about-service-card">
                <div className="about-service-icon">
                  <Icon size={26} />
                </div>
                <h3>{label}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────── */}
      <section className="about-section about-section-alt">
        <div className="about-container">
          <div className="about-section-header">
            <p className="hs-kicker">Pricing</p>
            <h2>Service plans</h2>
            <p className="about-section-sub">
              Transparent, flat-rate packages — no hourly guesses and no hidden fees.
            </p>
          </div>
          <div className="about-plans-grid">
            {plans.map((plan) => (
              <div key={plan.name} className={`about-plan-card ${plan.featured ? "is-featured" : ""}`}>
                {plan.featured && <div className="about-plan-badge">Most popular</div>}
                <p className="about-plan-tag">{plan.tag}</p>
                <h3 className="about-plan-name">{plan.name}</h3>
                <p className="about-plan-price">{plan.price}</p>
                <p className="about-plan-desc">{plan.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-section-header">
            <p className="hs-kicker">How we operate</p>
            <h2>Our values</h2>
          </div>
          <div className="about-values-grid">
            {values.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="about-value-item">
                <div className="about-value-icon">
                  <Icon size={22} />
                </div>
                <div>
                  <h3>{label}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────── */}
      <section className="about-section about-section-alt">
        <div className="about-container">
          <div className="about-section-header">
            <p className="hs-kicker">The people</p>
            <h2>Our team</h2>
          </div>
          <div className="about-team-grid">
            <div className="about-team-card">
              <div className="about-team-avatar">S</div>
              <div>
                <h3>Steven Maestas</h3>
                <p className="about-team-role">Founder &amp; Lead Technician</p>
                <p>
                  Steven built HomeSHINE from the ground up with a focus on professional-grade
                  results and homeowner education. He leads every field assessment and is on-site
                  for every job.
                </p>
              </div>
            </div>
            <div className="about-team-card">
              <div className="about-team-avatar">B</div>
              <div>
                <h3>Beth</h3>
                <p className="about-team-role">Client Relations &amp; Planning</p>
                <p>
                  Beth manages client communication, plan walkthroughs, and scheduling — making
                  sure every homeowner understands their service and feels taken care of from first
                  contact to final visit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="about-cta-section">
        <div className="about-container">
          <div className="about-cta-inner">
            <Award size={40} className="about-cta-icon" />
            <h2>Ready to get a free assessment?</h2>
            <p>
              We document your home&apos;s exterior, walk you through what we find, and give you a
              clear plan — no pressure, no surprises.
            </p>
            <div className="about-hero-ctas" style={{ justifyContent: "center" }}>
              <a href="tel:+18023919977" className="about-cta-primary about-cta-large">
                <PhoneCall size={20} />
                Call HomeSHINE
              </a>
              <Link href="/admin" className="about-cta-secondary about-cta-large">
                <ClipboardList size={20} />
                Open Field App
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
