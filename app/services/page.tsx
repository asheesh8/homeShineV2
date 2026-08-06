import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, PhoneCall } from "lucide-react";
import { contact, services } from "@/components/marketing/content";
import { Reveal } from "@/components/site/Reveal";
import { SiteShell } from "@/components/site/SiteShell";
import { SurfaceExplorer } from "@/components/site/widgets/SurfaceExplorer";

export const metadata: Metadata = {
  title: "Services",
  description:
    "HomeSHINE exterior cleaning services for roofs, siding, gutters, hardscape, windows, and solar panels in Vermont and Tampa Bay.",
};

const serviceChapters = [
  {
    layout: "landscape",
    eyebrow: "Roofline care",
    title: "Treat growth up high. Keep water moving down.",
    detail:
      "Roofs and panels need low-force chemistry, while gutters need a hands-on clear-out before the rinse. Each surface gets its own method in the same carefully planned visit.",
    serviceIndexes: [0, 2, 6],
    images: [
      {
        src: "/work/roof-cleaning.jpg",
        alt: "HomeSHINE roof and siding result on a Vermont home",
        label: "Roof and siding",
      },
      {
        src: "/work/gutter-cleaning.jpg",
        alt: "Debris being removed by hand from a roof gutter",
        label: "Gutter clear-out",
      },
      {
        src: "/promos/steven-cleaning.jpeg",
        alt: "HomeSHINE technician applying a roof-safe treatment",
        label: "Low-force treatment",
      },
    ],
  },
  {
    eyebrow: "House envelope",
    title: "Lift the film without forcing water behind the home.",
    detail:
      "Vinyl, cedar, glass, trim, and railings all react differently to pressure. HomeSHINE uses controlled chemistry and purified water to clean the face while protecting what sits behind it.",
    serviceIndexes: [1, 7, 8],
    images: [
      {
        src: "/work/vinyl-siding-cleaning.jpg",
        alt: "Clean vinyl siding after a HomeSHINE house wash",
        label: "Finished siding",
      },
      {
        src: "/work/vinyl-house-cleaning.jpg",
        alt: "Organic buildup visible on vinyl siding before cleaning",
        label: "Before treatment",
      },
      {
        src: "/work/wood-siding-cleaning.jpg",
        alt: "Wood siding before and after HomeSHINE care",
        label: "Wood restoration",
      },
    ],
  },
  {
    eyebrow: "Ground surfaces",
    title: "Restore the finish, then help it stay that way.",
    detail:
      "Concrete can take controlled force. Wood, pavers, and older masonry call for more restraint, followed by the right sand or seal treatment for Vermont weather.",
    serviceIndexes: [3, 4, 5],
    images: [
      {
        src: "/work/deck-sealing.jpg",
        alt: "Clean deck and stone patio prepared for protection",
        label: "Deck and patio",
      },
      {
        src: "/work/paver-sand-seal.jpg",
        alt: "Curved paver walkway cleaned and restored",
        label: "Paver restoration",
      },
      {
        src: "/work/concrete-cleaning.jpg",
        alt: "Concrete being cleaned with controlled water pressure",
        label: "Concrete cleaning",
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <SiteShell current="Services">
      <section className="hs-subhero">
        <div className="hs-hero-veil" aria-hidden />
        <div className="hs-shell">
          <div className="hs-subhero-grid">
            <Reveal className="hs-subhero-copy">
              <p className="hs-eyebrow">Services</p>
              <h1 className="hs-h1">Exterior care from roofline to hardscape.</h1>
              <p className="hs-lede">
                HomeSHINE reads the surface before choosing the tool. Delicate materials get
                low-force chemistry, durable flatwork gets controlled pressure, and purified water
                leaves glass and solar panels free of mineral residue.
              </p>
              <div className="hs-hero-actions">
                <Link href="/book" className="hs-btn hs-btn-primary">
                  <CalendarDays size={19} />
                  Free onsite assessment
                </Link>
                <a href={contact.phoneHref} className="hs-btn hs-btn-glass">
                  <PhoneCall size={19} />
                  {contact.phone}
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <figure className="hs-subhero-photo hs-subhero-photo-wide">
                <Image
                  src="/promos/trucks.jpeg"
                  alt="HomeSHINE trucks and equipment on a Vermont service route"
                  fill
                  sizes="(max-width: 1080px) 100vw, 44vw"
                  priority
                />
                <figcaption>Equipped for whole-property care</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="hs-band hs-band-paper">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-split">
            <div>
              <p className="hs-eyebrow">Real HomeSHINE work</p>
              <h2 className="hs-h2">One property. Three care zones.</h2>
            </div>
            <p className="hs-lede">
              The photos below come from HomeSHINE&apos;s own service work. Each zone is scoped as
              part of the full exterior instead of treated like an isolated line item.
            </p>
          </Reveal>

          <div className="hs-service-chapters">
            {serviceChapters.map((chapter, chapterIndex) => (
              <Reveal
                as="article"
                className={`hs-service-chapter${chapterIndex % 2 ? " is-reversed" : ""}`}
                key={chapter.eyebrow}
              >
                <div
                  className={`hs-service-chapter-media${chapter.layout === "landscape" ? " is-landscape" : ""}`}
                >
                  {chapter.images.map((photo, imageIndex) => (
                    <figure className={imageIndex === 0 ? "is-main" : ""} key={photo.src}>
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(max-width: 720px) 92vw, (max-width: 1080px) 46vw, 31vw"
                      />
                      <figcaption>{photo.label}</figcaption>
                    </figure>
                  ))}
                </div>

                <div className="hs-service-chapter-copy">
                  <p className="hs-eyebrow">{chapter.eyebrow}</p>
                  <h3 className="hs-h2">{chapter.title}</h3>
                  <p className="hs-body">{chapter.detail}</p>

                  <ul className="hs-service-lines">
                    {chapter.serviceIndexes.map((serviceIndex) => {
                      const service = services[serviceIndex];
                      return (
                        <li key={service.name}>
                          <span className="hs-service-line-icon">
                            <service.icon size={19} />
                          </span>
                          <div>
                            <strong>{service.name}</strong>
                            <p>{service.detail}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="hs-band hs-band-mist">
        <div className="hs-shell">
          <Reveal className="hs-head hs-head-center">
            <p className="hs-eyebrow">Method matters</p>
            <h2 className="hs-h2">Pick a surface. See exactly how it gets cleaned.</h2>
            <p className="hs-lede">
              Pressure is set for the weakest material in the work area, not the strongest setting
              on the machine.
            </p>
          </Reveal>

          <Reveal>
            <SurfaceExplorer />
          </Reveal>

          <Reveal className="hs-inline-next">
            <Link href="/proof" className="hs-btn hs-btn-outline">
              See field results and homeowner reviews
              <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
