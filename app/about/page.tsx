import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Handshake,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { contact, googleReviewsUrl } from "@/components/marketing/content";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "About Steven and Beth",
  description:
    "Meet Steven and Beth, the people behind HomeSHINE exterior care in Chittenden County, Vermont and Tampa Bay, Florida.",
};

const principles = [
  {
    icon: Handshake,
    title: "Personable and approachable",
    detail:
      "Questions are welcome. Steven and Beth explain the condition, the recommendation, and what can wait.",
  },
  {
    icon: ClipboardCheck,
    title: "Easy from start to finish",
    detail:
      "Clear scheduling, careful prep, and a written scope keep the visit calm from the first call through the final walkthrough.",
  },
  {
    icon: Sparkles,
    title: "Meticulous and thorough",
    detail:
      "Plants are watered before, during, and after service, surfaces are matched to the right method, and the final result is checked before the crew leaves.",
  },
];

export default function AboutPage() {
  return (
    <SiteShell current="About">
      <section className="hs-story-hero">
        <div className="hs-story-hero-media">
          <Image
            src="/promos/trucks.jpeg"
            alt="HomeSHINE trucks and trailer serving a Vermont neighborhood"
            fill
            sizes="100vw"
            priority
          />
        </div>
        <div className="hs-story-hero-veil" aria-hidden />
        <div className="hs-shell hs-story-hero-inner">
          <Reveal className="hs-story-hero-copy">
            <p className="hs-eyebrow">Meet HomeSHINE</p>
            <h1 className="hs-display">The people behind the shine.</h1>
            <p className="hs-lede">
              HomeSHINE is Steven and Beth&apos;s exterior care company, built around honest advice,
              personal connection, and the kind of detail they would expect at their own home.
            </p>
            <div className="hs-hero-actions">
              <Link href="/book" className="hs-btn hs-btn-primary">
                <CalendarDays size={19} />
                Meet us at your home
              </Link>
              <a
                href={googleReviewsUrl}
                className="hs-btn hs-btn-glass"
                target="_blank"
                rel="noreferrer"
              >
                5.0 on Google
                <ExternalLink size={17} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="hs-band hs-band-paper">
        <div className="hs-shell">
          <div className="hs-story-grid">
            <Reveal className="hs-story-copy">
              <p className="hs-eyebrow">How it started</p>
              <h2 className="hs-h2">A cleaning project started the business. Beth made it a love story.</h2>
              <p className="hs-lede">
                Steven and Beth first met while working on a home exterior cleaning project. They
                quickly recognized a shared standard for the work and complementary strengths for
                building something of their own.
              </p>
              <p className="hs-body">
                Six months into growing HomeSHINE together, Beth asked Steven on a date. The same
                trust and personal connection that brought them together now shapes how they care
                for homeowners: communicate clearly, show up prepared, and leave the property
                better than they found it.
              </p>
              <ul className="hs-story-checks">
                <li>
                  <CheckCircle2 size={18} /> Fully insured and certified in work safety
                </li>
                <li>
                  <CheckCircle2 size={18} /> Pet- and plant-safe service practices
                </li>
                <li>
                  <CheckCircle2 size={18} /> Vermont home route and Tampa Bay winter route
                </li>
              </ul>
            </Reveal>

            <Reveal className="hs-story-work" delay={100}>
              <figure>
                <Image
                  src="/promos/steven-cleaning.jpeg"
                  alt="HomeSHINE technician applying a roof-safe exterior treatment"
                  fill
                  sizes="(max-width: 900px) 100vw, 46vw"
                />
                <figcaption>Careful methods, visible results</figcaption>
              </figure>
              <p>
                Every recommendation starts with the material, the condition, and what the home
                actually needs.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="hs-band hs-band-ink">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">The HomeSHINE standard</p>
              <h2 className="hs-h2">Professional work that still feels personal.</h2>
            </div>
            <p className="hs-lede">
              The equipment matters, but the experience is built on how the crew treats the home
              and the person who lives there.
            </p>
          </Reveal>

          <div className="hs-principles">
            {principles.map((principle, index) => (
              <Reveal as="article" key={principle.title} delay={index * 70}>
                <principle.icon size={24} />
                <p className="hs-principle-number">0{index + 1}</p>
                <h3 className="hs-h3">{principle.title}</h3>
                <p className="hs-body">{principle.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="hs-band-tight hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-cta">
            <div className="hs-cta-copy">
              <p className="hs-eyebrow">Talk with the people doing the work</p>
              <h2 className="hs-h2">Start with a free exterior walkthrough.</h2>
              <p className="hs-lede">
                Steven will look over the roofline, siding, drainage, vegetation, and ground
                surfaces, then give you a clear written recommendation.
              </p>
            </div>
            <div className="hs-cta-actions">
              <Link href="/book" className="hs-btn hs-btn-primary">
                <CalendarDays size={19} />
                Book a Visit
              </Link>
              <a href={contact.phoneHref} className="hs-btn hs-btn-glass">
                <PhoneCall size={19} />
                {contact.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
