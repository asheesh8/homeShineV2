/**
 * Public preview of the Exterior Care Certificate Steven can issue from the
 * admin certificate generator after a qualifying job. Same gold-on-cream
 * treatment, same homeowner-facing structure.
 *
 * The recipient fields are deliberate placeholders, and the sheet carries a
 * "specimen" mark — this is a sample of the format, never a rendered record
 * for a real homeowner.
 */

const CornerFlourish = () => (
  <svg viewBox="0 0 90 90" fill="none" aria-hidden>
    <path
      d="M4 86V34C4 17 17 4 34 4h52"
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
    />
    <path
      d="M12 86V38c0-14 12-26 26-26h48"
      stroke="currentColor"
      strokeWidth="0.9"
      fill="none"
      opacity="0.7"
    />
    <circle cx="34" cy="34" r="3.2" fill="currentColor" opacity="0.8" />
    <path d="M34 20v-9M20 34h-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const HouseBadge = ({ size = 46 }: { size?: number }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden>
    <circle cx="32" cy="32" r="31" stroke="currentColor" strokeWidth="1" fill="none" />
    <path
      d="M20 52 L20 30 L32 18 L44 30 L44 52"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinejoin="round"
    />
    <rect x="26" y="37" width="12" height="15" rx="1" fill="currentColor" />
    <path
      d="M12 28 L32 12 L52 28"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function CertificatePreview() {
  return (
    <figure className="hs-cert" role="img" aria-label="Sample HomeSHINE Exterior Care Certificate">
      <div className="hs-cert-sheet">
        <span className="hs-cert-corner tl">
          <CornerFlourish />
        </span>
        <span className="hs-cert-corner tr">
          <CornerFlourish />
        </span>
        <span className="hs-cert-corner bl">
          <CornerFlourish />
        </span>
        <span className="hs-cert-corner br">
          <CornerFlourish />
        </span>

        <span className="hs-cert-watermark" aria-hidden>
          <HouseBadge size={260} />
        </span>

        <span className="hs-cert-specimen" aria-hidden>
          Specimen
        </span>

        <div className="hs-cert-top">
          <div className="hs-cert-logo">
            <HouseBadge size={52} />
          </div>
          <div>
            <p className="hs-cert-top-eyebrow">Certificate of Completion</p>
            <p className="hs-cert-top-title">EXTERIOR CARE</p>
            <p className="hs-cert-top-sub">HomeSHINE Certified</p>
          </div>
          <div className="hs-cert-verified">
            <span>Verified</span>
            <strong>2026</strong>
          </div>
        </div>

        <div className="hs-cert-rule" />

        <p className="hs-cert-eyebrow">This certificate is proudly presented to</p>

        <p className="hs-cert-title">
          Homeowner Name
        </p>

        <p className="hs-cert-address">123 Maple Street, South Burlington, VT</p>

        <p className="hs-cert-sub">
          This property has been professionally inspected, treated, and cared for by the
          HomeSHINE team. Surfaces were serviced with eco-friendly solutions and the right
          soft-wash or pressure-wash method for the material.
        </p>

        <div className="hs-cert-services" aria-label="Sample certificate services">
          <span>Roof Wash</span>
          <span>House / Siding Wash</span>
          <span>Gutter Cleaning</span>
        </div>

        <div className="hs-cert-plan">
          <span>
            <small>Plan Enrolled</small>
            SHINE-Protection
          </span>
          <strong>$3,550</strong>
        </div>

        <div className="hs-cert-rule" />

        <div className="hs-cert-sigs">
          <div className="hs-cert-sig">
            <span className="hs-cert-sig-line" />
            <p className="hs-cert-sig-label">
              Homeowner
            </p>
          </div>
          <span className="hs-cert-fleur" aria-hidden>
            &#10086;
          </span>
          <div className="hs-cert-sig">
            <p className="hs-cert-script">Steven Maestas</p>
            <span className="hs-cert-sig-line" />
            <p className="hs-cert-sig-label">
              Steven Maestas
              <br />
              HomeSHINE, Owner
            </p>
          </div>
        </div>

        <p className="hs-cert-date">Service date · issued on completion</p>

        <div className="hs-cert-foot">
          <span>HomeSHINE · Vermont · 802-391-9977</span>
          <span>HS-2026-SAMPLE</span>
        </div>
      </div>
    </figure>
  );
}
