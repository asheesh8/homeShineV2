import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CircleDollarSign,
  Database,
  FileSignature,
  KeyRound,
  Layers,
  Lock,
  Repeat,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { HomeShineLogo } from "@/components/homeshine-logo";
import {
  calcDepositMonthly,
  calcTotal,
  getCheckoutPlan,
  money,
  moneyDecimal,
} from "@/components/field-app/utils";

export const metadata: Metadata = {
  title: "Working Session — HomeSHINE Software",
  description: "Agenda, current state, and options for the HomeSHINE software build.",
  // Private working document. Keep it out of search results.
  robots: { index: false, follow: false },
};

/* ══════════════════════════════════════════════════════════════════════════
   1. THE PROPOSAL — the only numbers on this page that are not measured

   Everything else in this file is either read from CHECKOUT_PLANS (the same
   table the field app bills from) or counted out of the repository. These
   five lines are a starting offer. Change them here and every figure, chart,
   and payback number on the page recalculates.
   ══════════════════════════════════════════════════════════════════════════ */

const DEAL = {
  /** Pay to launch, then a flat monthly for hosting, support, and changes. */
  runIt: { setup: 4000, monthly: 400 },
  /** Pay once, own it outright, buy help by the hour afterwards. */
  ownIt: { oneTime: 9500, hourly: 95 },
  /** Low money down, heavier monthly for year one, then it steps down. */
  easyStart: { setup: 1500, monthly: 750, introMonths: 12, thenMonthly: 400 },
};

const TERM_MONTHS = 36;

/* ══════════════════════════════════════════════════════════════════════════
   2. MEASURED FACTS — counted from this repository on 2026-08-08

   Reproduce any of these:
     git rev-list --count HEAD
     git log --date=format:'%Y-%m' --pretty=format:'%ad' | sort | uniq -c
     find app components lib supabase -name '*.ts*' -o -name '*.sql' | xargs cat | wc -l
   ══════════════════════════════════════════════════════════════════════════ */

const BUILD = {
  commits: 50,
  linesOfCode: 23133,
  publicPages: 8,
  adminTools: 6,
  apiRoutes: 9,
  fieldScreens: 7,
  stepperSteps: 7,
  documents: 7,
  migrations: 3,
  components: 39,
  firstCommit: "June 1, 2026",
  lastCommit: "August 6, 2026",
};

/** Commits per month. July is zero. That is the point of the chart. */
const MOMENTUM = [
  { month: "June", commits: 39, note: "Built the field app, the documents, the database" },
  { month: "July", commits: 0, note: "Nothing shipped" },
  { month: "August", commits: 11, note: "Marketing site, real HomeSHINE content" },
];

/** Shipped surfaces, each one a thing Steven can open and use. */
const SHIPPED = [
  {
    icon: Layers,
    title: "Public website",
    detail: `${BUILD.publicPages} pages — home, services, plans, proof, about, FAQ, contact, booking.`,
  },
  {
    icon: Wrench,
    title: "Field app",
    detail: `${BUILD.fieldScreens} screens plus a ${BUILD.stepperSteps}-step guided assessment, built for a phone in a work glove.`,
  },
  {
    icon: FileSignature,
    title: "Customer paperwork",
    detail: `${BUILD.documents} generated documents — contract, receipt, certificate, field report, client packet, notes, checkout.`,
  },
  {
    icon: Database,
    title: "Database + API",
    detail: `${BUILD.apiRoutes} endpoints over ${BUILD.migrations} tables — assessments, bookings, expenses, Vermont tax rates.`,
  },
  {
    icon: CircleDollarSign,
    title: "Pricing engine",
    detail: "Plans, bundle credits, town-level tax, deposit-and-monthly financing — one table, no drift.",
  },
  {
    icon: ShieldCheck,
    title: "Admin tools",
    detail: `${BUILD.adminTools} internal tools — market pricing reference, plan guide, promos, certificates.`,
  },
];

/* ── Vermont surface pricing, from app/admin/market — HomeSHINE's own planning
   table. These are Steven's internal reference ranges, not sourced competitor
   quotes, and the chart labels them that way. ─────────────────────────────── */

const VT_SURFACES = [
  { area: "Gutters", low: 370, high: 540, inNow: true },
  { area: "Siding / house wash", low: 880, high: 1090, inNow: true },
  { area: "Windows + screens", low: 650, high: 950, inNow: true },
  { area: "Driveway / walkway", low: 650, high: 1200, inNow: true },
  { area: "Deck / patio", low: 550, high: 850, inNow: true },
  { area: "Roof treatment", low: 850, high: 1400, inNow: false },
];

const nowScope = VT_SURFACES.filter((s) => s.inNow);
const sum = (rows: typeof VT_SURFACES, key: "low" | "high") =>
  rows.reduce((total, row) => total + row[key], 0);

const SEPARATE = {
  now: { low: sum(nowScope, "low"), high: sum(nowScope, "high") },
  protection: { low: sum(VT_SURFACES, "low"), high: sum(VT_SURFACES, "high") },
};

/* ── Live plan data, imported so this page can never disagree with the app ── */

const shineNow = getCheckoutPlan("shine-now")!;
const protection = getCheckoutPlan("protection")!;
const protectionFinance = calcDepositMonthly(protection);
const protectionVisits = 3; // Day 1 deep clean, month 12 maintenance, month 18 tune-up.

/* ── Deal math, derived from DEAL ─────────────────────────────────────────── */

function cumulativeRunIt(month: number) {
  return DEAL.runIt.setup + DEAL.runIt.monthly * month;
}
function cumulativeOwnIt() {
  return DEAL.ownIt.oneTime;
}
function cumulativeEasyStart(month: number) {
  const { setup, monthly, introMonths, thenMonthly } = DEAL.easyStart;
  if (month <= introMonths) return setup + monthly * month;
  return setup + monthly * introMonths + thenMonthly * (month - introMonths);
}

const OPTIONS = [
  {
    id: "run",
    name: "Launch and Run",
    kicker: "Recommended",
    icon: Repeat,
    color: "var(--ag-s1)",
    headline: `${money(DEAL.runIt.setup)} to launch, then ${money(DEAL.runIt.monthly)}/mo`,
    yearOne: cumulativeRunIt(12),
    threeYear: cumulativeRunIt(TERM_MONTHS),
    cumulative: cumulativeRunIt,
    body: "The system goes live and stays looked after. Hosting, backups, bug fixes, and a steady stream of changes are included in the monthly. Cancel with 30 days notice and the code is still yours.",
    points: [
      "Everything hosted and monitored",
      "Changes and new features included",
      "Cancel anytime, keep the code",
    ],
  },
  {
    id: "own",
    name: "Own It Outright",
    kicker: "Cheapest long run",
    icon: KeyRound,
    color: "var(--ag-s2)",
    headline: `${money(DEAL.ownIt.oneTime)} once`,
    yearOne: cumulativeOwnIt(),
    threeYear: cumulativeOwnIt(),
    cumulative: cumulativeOwnIt,
    body: `One payment, full transfer. Source code, database, domain, and logins move into Steven's name and nothing recurs. Thirty days of warranty on defects, then help is ${money(DEAL.ownIt.hourly)}/hr when it is wanted.`,
    points: [
      "No monthly, ever",
      "Full source and account transfer",
      `Support at ${money(DEAL.ownIt.hourly)}/hr as needed`,
    ],
  },
  {
    id: "easy",
    name: "Easy Start",
    kicker: "Softest on cash",
    icon: CalendarCheck,
    color: "var(--ag-s3)",
    headline: `${money(DEAL.easyStart.setup)} down, ${money(DEAL.easyStart.monthly)}/mo for ${DEAL.easyStart.introMonths} months`,
    yearOne: cumulativeEasyStart(12),
    threeYear: cumulativeEasyStart(TERM_MONTHS),
    cumulative: cumulativeEasyStart,
    body: `The least money out of pocket before the first job is booked. After ${DEAL.easyStart.introMonths} months it steps down to ${money(DEAL.easyStart.thenMonthly)}/mo and behaves like Launch and Run.`,
    points: [
      "Lowest upfront cost",
      `Steps down after ${DEAL.easyStart.introMonths} months`,
      "Same coverage as Launch and Run",
    ],
  },
];

/* ── Forward schedule ─────────────────────────────────────────────────────── */

const SCHEDULE = [
  { date: "Aug 8", title: "Today", detail: "Pick an option. Sign. No more open-ended timeline." },
  { date: "Aug 15", title: "Real data in", detail: "Steven's customers loaded, logged in on his own tablet." },
  { date: "Aug 22", title: "First live job", detail: "One real assessment run start to finish in the field." },
  { date: "Sep 5", title: "Booking goes live", detail: "The public site takes real requests at homeshinevt.com." },
  { date: "Sep 19", title: "Keys handed over", detail: "Domain, database, and logins in Steven's name." },
];

const DECISIONS = [
  "Which of the three payment options",
  "The date the booking form points at the real domain",
  "Who answers a booking request, and how fast",
  "Whether Beth gets her own login",
  "One standing 20-minute check-in each week, same day, same time",
];

/* ══════════════════════════════════════════════════════════════════════════
   3. CHARTS

   Hand-rolled SVG — no charting dependency added. Every mark carries a
   <title> for a native tooltip, every chart carries an aria-label, and the
   numbers are printed on the page as text so the charts are never the only
   way to read the data.
   ══════════════════════════════════════════════════════════════════════════ */

/** Column with rounded top corners, square where it meets the baseline. */
function columnPath(x: number, y: number, width: number, baseline: number, radius = 4) {
  const r = Math.min(radius, width / 2, Math.max(baseline - y, 0));
  return [
    `M ${x} ${baseline}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + width - r} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `L ${x + width} ${baseline}`,
    "Z",
  ].join(" ");
}

function MomentumChart() {
  const width = 720;
  const height = 250;
  const baseline = 196;
  const top = 30;
  const max = 40;
  const colWidth = 116;
  const centers = [175, 360, 545];
  const scale = (v: number) => (v / max) * (baseline - top);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="ag-svg"
      role="img"
      aria-label="Commits per month: June 39, July 0, August 11."
    >
      {[0, 10, 20, 30, 40].map((tick) => {
        const y = baseline - scale(tick);
        return (
          <g key={tick}>
            <line x1={60} x2={width - 20} y1={y} y2={y} className="ag-grid" />
            <text x={48} y={y + 4} className="ag-tick" textAnchor="end">
              {tick}
            </text>
          </g>
        );
      })}

      {MOMENTUM.map((row, i) => {
        const x = centers[i] - colWidth / 2;
        const isGap = row.commits === 0;
        const y = baseline - scale(row.commits);

        if (isGap) {
          return (
            <g key={row.month}>
              <rect
                x={x}
                y={baseline - 54}
                width={colWidth}
                height={54}
                rx={4}
                className="ag-gap-box"
              >
                <title>{`${row.month}: 0 commits — ${row.note}`}</title>
              </rect>
              <text x={centers[i]} y={baseline - 32} className="ag-gap-label" textAnchor="middle">
                nothing
              </text>
              <text x={centers[i]} y={baseline - 16} className="ag-gap-label" textAnchor="middle">
                shipped
              </text>
              <text x={centers[i]} y={baseline - 66} className="ag-value" textAnchor="middle">
                0
              </text>
            </g>
          );
        }

        return (
          <g key={row.month}>
            <path d={columnPath(x, y, colWidth, baseline)} className="ag-col">
              <title>{`${row.month}: ${row.commits} commits — ${row.note}`}</title>
            </path>
            <text x={centers[i]} y={y - 10} className="ag-value" textAnchor="middle">
              {row.commits}
            </text>
          </g>
        );
      })}

      <line x1={60} x2={width - 20} y1={baseline} y2={baseline} className="ag-axis" />
      {MOMENTUM.map((row, i) => (
        <text key={row.month} x={centers[i]} y={baseline + 22} className="ag-axis-label" textAnchor="middle">
          {row.month}
        </text>
      ))}
      <text x={centers[1]} y={baseline + 40} className="ag-annotation" textAnchor="middle">
        five weeks dark
      </text>
    </svg>
  );
}

function ValueChart() {
  const width = 720;
  const height = 244;
  const left = 214;
  const right = 686;
  const domain = 6500;
  const x = (v: number) => left + (v / domain) * (right - left);
  const barHeight = 30;

  const rows = [
    {
      label: "SHINE NOW",
      sub: `${nowScope.length} surfaces, one visit`,
      price: shineNow.price,
      band: SEPARATE.now,
      y: 62,
    },
    {
      label: "SHINE-Protection",
      sub: `${VT_SURFACES.length} surfaces, ${protectionVisits} visits`,
      price: protection.price,
      band: SEPARATE.protection,
      y: 142,
    },
  ];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="ag-svg"
      role="img"
      aria-label={`SHINE NOW is ${money(shineNow.price)} against a separate-purchase range of ${money(SEPARATE.now.low)} to ${money(SEPARATE.now.high)}. SHINE-Protection is ${money(protection.price)} against ${money(SEPARATE.protection.low)} to ${money(SEPARATE.protection.high)}.`}
    >
      {[0, 2000, 4000, 6000].map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={40} y2={196} className="ag-grid" />
          <text x={x(tick)} y={214} className="ag-tick" textAnchor="middle">
            {tick === 0 ? "$0" : `$${tick / 1000}k`}
          </text>
        </g>
      ))}

      {rows.map((row) => (
        <g key={row.label}>
          <text x={0} y={row.y + 12} className="ag-row-label">
            {row.label}
          </text>
          <text x={0} y={row.y + 28} className="ag-row-sub">
            {row.sub}
          </text>

          <rect
            x={x(row.band.low)}
            y={row.y}
            width={x(row.band.high) - x(row.band.low)}
            height={barHeight}
            rx={4}
            className="ag-band"
          >
            <title>{`Bought surface by surface: ${money(row.band.low)} to ${money(row.band.high)}`}</title>
          </rect>
          <text
            x={(x(row.band.low) + x(row.band.high)) / 2}
            y={row.y - 8}
            className="ag-band-value"
            textAnchor="middle"
          >
            {money(row.band.low)}&ndash;{money(row.band.high)}
          </text>

          <rect
            x={left}
            y={row.y}
            width={x(row.price) - left}
            height={barHeight}
            rx={4}
            className="ag-bar"
          >
            <title>{`${row.label}: ${money(row.price)}`}</title>
          </rect>
          <text x={x(row.price) - 12} y={row.y + 20} className="ag-bar-value" textAnchor="end">
            {money(row.price)}
          </text>
        </g>
      ))}

      <line x1={left} x2={left} y1={40} y2={196} className="ag-axis" />
    </svg>
  );
}

function OptionsChart() {
  const width = 720;
  const height = 300;
  const left = 74;
  const right = 606;
  const top = 32;
  const bottom = 246;
  const maxY = 21000;
  const x = (m: number) => left + (m / TERM_MONTHS) * (right - left);
  const y = (v: number) => bottom - (v / maxY) * (bottom - top);

  const series = OPTIONS.map((option) => {
    const points: string[] = [];
    for (let m = 0; m <= TERM_MONTHS; m += 1) {
      points.push(`${m === 0 ? "M" : "L"} ${x(m).toFixed(1)} ${y(option.cumulative(m)).toFixed(1)}`);
    }
    const end = option.cumulative(TERM_MONTHS);
    return { ...option, path: points.join(" "), end, dotY: y(end) };
  });

  /* End labels are two lines tall, so lines that finish close together would
     print on top of each other. Walk them top-down and push each label just
     far enough below the previous one, keeping the dot on the real value.
     LABEL_GAP is wider than the 16px between a label's own two lines, so a
     value and its series name read as one pair rather than drifting toward
     a neighbour. */
  const LABEL_GAP = 46;
  const positioned = [...series]
    .sort((a, b) => a.dotY - b.dotY)
    .reduce<Array<(typeof series)[number] & { labelY: number }>>((placed, s) => {
      const previous = placed[placed.length - 1];
      const labelY = previous ? Math.max(s.dotY, previous.labelY + LABEL_GAP) : s.dotY;
      return [...placed, { ...s, labelY }];
    }, []);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="ag-svg"
      role="img"
      aria-label={`Cumulative cost over ${TERM_MONTHS} months. Launch and Run reaches ${money(cumulativeRunIt(TERM_MONTHS))}, Own It Outright stays at ${money(cumulativeOwnIt())}, Easy Start reaches ${money(cumulativeEasyStart(TERM_MONTHS))}.`}
    >
      {[0, 5000, 10000, 15000, 20000].map((tick) => (
        <g key={tick}>
          <line x1={left} x2={right} y1={y(tick)} y2={y(tick)} className="ag-grid" />
          <text x={left - 12} y={y(tick) + 4} className="ag-tick" textAnchor="end">
            {tick === 0 ? "$0" : `$${tick / 1000}k`}
          </text>
        </g>
      ))}

      {[0, 6, 12, 18, 24, 30, 36].map((tick) => (
        <text key={tick} x={x(tick)} y={bottom + 22} className="ag-tick" textAnchor="middle">
          {tick}
        </text>
      ))}
      <text x={(left + right) / 2} y={bottom + 44} className="ag-axis-label" textAnchor="middle">
        months after launch
      </text>

      <line x1={x(12)} x2={x(12)} y1={top} y2={bottom} className="ag-marker-line" />
      <text x={x(12)} y={top - 12} className="ag-annotation" textAnchor="middle">
        one year
      </text>

      {positioned.map((s) => (
        <g key={s.id}>
          <path d={s.path} className="ag-line" style={{ stroke: s.color }}>
            <title>{`${s.name}: ${money(s.yearOne)} after one year, ${money(s.threeYear)} after three`}</title>
          </path>
          <circle cx={x(TERM_MONTHS)} cy={s.dotY} r={5} className="ag-dot" style={{ fill: s.color }} />
          {Math.abs(s.labelY - s.dotY) > 2 && (
            <polyline
              points={`${x(TERM_MONTHS) + 6},${s.dotY} ${x(TERM_MONTHS) + 10},${s.labelY} ${x(TERM_MONTHS) + 12},${s.labelY}`}
              className="ag-leader"
              style={{ stroke: s.color }}
            />
          )}
          <text x={x(TERM_MONTHS) + 14} y={s.labelY + 4} className="ag-line-label">
            {money(s.end)}
          </text>
          <text x={x(TERM_MONTHS) + 14} y={s.labelY + 20} className="ag-line-sub">
            {s.name}
          </text>
        </g>
      ))}

      <line x1={left} x2={right} y1={bottom} y2={bottom} className="ag-axis" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   4. PAGE
   ══════════════════════════════════════════════════════════════════════════ */

export default function AgendaPage() {
  const protectionPerVisit = protection.price / protectionVisits;
  const nowPerVisit = shineNow.price;
  const perVisitDrop = Math.round((1 - protectionPerVisit / nowPerVisit) * 100);
  const plansToCover = (amount: number) => (amount / protection.price).toFixed(1);

  return (
    <main className="ag-wrap">
      <style>{AGENDA_CSS}</style>

      {/* ── Masthead ─────────────────────────────────────────────────────── */}
      <header className="ag-masthead">
        <div className="ag-shell ag-masthead-inner">
          <div className="ag-brand">
            <HomeShineLogo size={54} />
            <div>
              <div className="serif ag-brand-name">
                Home<span>SHINE</span>
              </div>
              <div className="ag-brand-sub">
                <Lock size={12} /> Private working document
              </div>
            </div>
          </div>
          <Link href="/admin" className="ag-masthead-link">
            Field App <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <div className="ag-shell">
        {/* ── Opener ─────────────────────────────────────────────────────── */}
        <section className="ag-hero">
          <p className="ag-eyebrow">Working session · August 8, 2026</p>
          <h1 className="serif ag-h1">
            The software is built. Let&rsquo;s decide how you own it.
          </h1>
          <p className="ag-lede">
            This is a short, honest agenda. It covers what exists today, what the delay cost
            us, three ways to pay for it, and the dates that end the open-ended timeline.
          </p>
          <div className="ag-hero-meta">
            <span>Steven Maestas &amp; Ashish Subedi</span>
            <span aria-hidden>·</span>
            <span>~30 minutes</span>
            <span aria-hidden>·</span>
            <span>{DECISIONS.length} decisions</span>
          </div>
        </section>

        {/* ── The honest bit, first ──────────────────────────────────────── */}
        <section className="ag-card ag-card-plain">
          <h2 className="serif ag-h2">Where this actually stands</h2>
          <p className="ag-body">
            The build started {BUILD.firstCommit}. It moved fast for a month, then it stopped
            for five weeks, then it picked back up. Neither of us treated the schedule as real
            &mdash; there was no fixed scope, no fixed price, and no standing check-in, so
            drifting cost nobody anything. That is the actual problem, and it is not fixed by
            working harder. It is fixed by a signed number and a date.
          </p>
          <p className="ag-body">
            So the chart below is here on purpose. It is the honest shape of the project, and
            everything after it is a proposal to make the next six weeks look nothing like it.
          </p>
        </section>

        {/* ── Chart 1: momentum ──────────────────────────────────────────── */}
        <section className="ag-card">
          <div className="ag-card-head">
            <div>
              <h2 className="serif ag-h2">What the last three months looked like</h2>
              <p className="ag-caption">
                Commits per month to the HomeSHINE repository. {BUILD.commits} total, all from
                one developer, {BUILD.firstCommit} to {BUILD.lastCommit}.
              </p>
            </div>
          </div>
          <MomentumChart />
          <p className="ag-footnote">
            June carried the field app and the database. July produced nothing at all. August
            brought the marketing site and the real HomeSHINE content. The work is good; the
            cadence was not.
          </p>
        </section>

        {/* ── Evidence: what exists ──────────────────────────────────────── */}
        <section className="ag-card">
          <div className="ag-card-head">
            <div>
              <h2 className="serif ag-h2">What already exists</h2>
              <p className="ag-caption">
                Not a prototype and not slides. This is running software, counted out of the
                repository.
              </p>
            </div>
          </div>

          <div className="ag-stats">
            <div className="ag-stat">
              <span className="ag-stat-value">{BUILD.linesOfCode.toLocaleString()}</span>
              <span className="ag-stat-label">lines of code</span>
            </div>
            <div className="ag-stat">
              <span className="ag-stat-value">{BUILD.components}</span>
              <span className="ag-stat-label">components</span>
            </div>
            <div className="ag-stat">
              <span className="ag-stat-value">{BUILD.apiRoutes}</span>
              <span className="ag-stat-label">API endpoints</span>
            </div>
            <div className="ag-stat">
              <span className="ag-stat-value">{BUILD.commits}</span>
              <span className="ag-stat-label">commits</span>
            </div>
          </div>

          <div className="ag-shipped">
            {SHIPPED.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="ag-shipped-item">
                  <div className="ag-shipped-icon">
                    <Icon size={17} />
                  </div>
                  <div>
                    <h3 className="ag-shipped-title">{item.title}</h3>
                    <p className="ag-shipped-detail">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── The standpoint: proprietary ────────────────────────────────── */}
        <section className="ag-card ag-card-dark">
          <p className="ag-eyebrow ag-eyebrow-light">The point of building it this way</p>
          <h2 className="serif ag-h2 ag-h2-light">It is yours, not rented.</h2>
          <p className="ag-body ag-body-light">
            Every off-the-shelf tool that does a piece of this charges monthly forever, keeps
            your customer list on their servers, and prices by how well you are doing. This
            system has none of that. The plans, the bundle credits, the Vermont town tax
            rates, the contract language, the certificate &mdash; all of it encodes how
            HomeSHINE actually sells, because it was written for HomeSHINE and nobody else.
          </p>
          <div className="ag-own-grid">
            <div className="ag-own">
              <h3>You own the code</h3>
              <p>Not a licence that lapses. The repository transfers to your account.</p>
            </div>
            <div className="ag-own">
              <h3>You own the customers</h3>
              <p>Names, addresses, history, and documents sit in your database.</p>
            </div>
            <div className="ag-own">
              <h3>Nobody prices off your growth</h3>
              <p>A hundred jobs a month costs the same to run as ten.</p>
            </div>
            <div className="ag-own">
              <h3>It matches your sale</h3>
              <p>One visit, one price, whole property &mdash; the software argues it for you.</p>
            </div>
          </div>
        </section>

        {/* ── Chart 2: the pricing logic it encodes ──────────────────────── */}
        <section className="ag-card">
          <div className="ag-card-head">
            <div>
              <h2 className="serif ag-h2">The argument the software makes for you</h2>
              <p className="ag-caption">
                Your plan price against the same surfaces bought one at a time, using
                HomeSHINE&rsquo;s own Vermont reference table from the pricing tool. These are
                your internal planning ranges, not sourced competitor quotes.
              </p>
            </div>
          </div>

          <div className="ag-legend">
            <span className="ag-legend-item">
              <span className="ag-swatch ag-swatch-bar" /> HomeSHINE plan price
            </span>
            <span className="ag-legend-item">
              <span className="ag-swatch ag-swatch-band" /> Same surfaces, bought separately
            </span>
          </div>

          <ValueChart />

          <p className="ag-footnote">
            Both plans land below the bottom of the à la carte range before it even starts.
            That gap is the whole pitch, and the estimator on the public site computes it live
            from the same table the field app bills from &mdash; so the website and the tablet
            cannot drift apart.
          </p>

          <div className="ag-mini-stats">
            <div className="ag-mini">
              <span className="ag-mini-value">{money(nowPerVisit)}</span>
              <span className="ag-mini-label">SHINE NOW, per visit</span>
            </div>
            <div className="ag-mini ag-mini-accent">
              <span className="ag-mini-value">{money(protectionPerVisit)}</span>
              <span className="ag-mini-label">
                Protection, per visit &mdash; {perVisitDrop}% less
              </span>
            </div>
            <div className="ag-mini">
              <span className="ag-mini-value">{moneyDecimal(protectionFinance.monthlyAmount)}</span>
              <span className="ag-mini-label">
                per month after {money(protectionFinance.depositAmount)} deposit
              </span>
            </div>
            <div className="ag-mini">
              <span className="ag-mini-value">{money(calcTotal(protection.price))}</span>
              <span className="ag-mini-label">Protection, with Vermont tax</span>
            </div>
          </div>
        </section>

        {/* ── The options ────────────────────────────────────────────────── */}
        <section className="ag-card">
          <div className="ag-card-head">
            <div>
              <h2 className="serif ag-h2">Three ways to pay for it</h2>
              <p className="ag-caption">
                Same software in all three. The only difference is when the money moves and
                who carries the ongoing work.
              </p>
            </div>
          </div>

          <div className="ag-options">
            {OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <article key={option.id} className={`ag-option ag-option-${option.id}`}>
                  <div className="ag-option-head">
                    <div className="ag-option-icon" style={{ color: option.color }}>
                      <Icon size={19} />
                    </div>
                    <span className="ag-option-kicker">{option.kicker}</span>
                  </div>
                  <h3 className="serif ag-option-name">{option.name}</h3>
                  <p className="ag-option-headline">{option.headline}</p>
                  <p className="ag-option-body">{option.body}</p>
                  <ul className="ag-option-points">
                    {option.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <dl className="ag-option-totals">
                    <div>
                      <dt>Year one</dt>
                      <dd>{money(option.yearOne)}</dd>
                    </div>
                    <div>
                      <dt>Three years</dt>
                      <dd>{money(option.threeYear)}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Chart 3: cumulative cost ───────────────────────────────────── */}
        <section className="ag-card">
          <div className="ag-card-head">
            <div>
              <h2 className="serif ag-h2">What each option costs over time</h2>
              <p className="ag-caption">
                Total paid to date, month by month, for {TERM_MONTHS} months.
              </p>
            </div>
          </div>

          <div className="ag-legend">
            {OPTIONS.map((option) => (
              <span key={option.id} className="ag-legend-item">
                <span className="ag-swatch" style={{ background: option.color }} />
                {option.name}
              </span>
            ))}
          </div>

          <OptionsChart />

          <p className="ag-footnote">
            Worth saying plainly: past roughly month {Math.ceil((DEAL.ownIt.oneTime - DEAL.runIt.setup) / DEAL.runIt.monthly)},{" "}
            <strong>Own It Outright is the cheapest path</strong>{" "}
            and stays that way. It is the
            right choice if the software is going to sit still. Launch and Run only earns its
            monthly if the system keeps changing &mdash; new services, new regions, new
            paperwork. Pick on that question, not on the first number.
          </p>

          <div className="ag-table-wrap">
            <table className="ag-table">
              <caption className="ag-table-caption">Cost comparison, in full</caption>
              <thead>
                <tr>
                  <th scope="col">Option</th>
                  <th scope="col">Upfront</th>
                  <th scope="col">Year one</th>
                  <th scope="col">Three years</th>
                  <th scope="col">Protection plans to cover year one</th>
                </tr>
              </thead>
              <tbody>
                {OPTIONS.map((option) => (
                  <tr key={option.id}>
                    <th scope="row">
                      <span className="ag-table-series">
                        <span className="ag-swatch" style={{ background: option.color }} />
                        {option.name}
                      </span>
                    </th>
                    <td>{money(option.cumulative(0))}</td>
                    <td>{money(option.yearOne)}</td>
                    <td>{money(option.threeYear)}</td>
                    <td>{plansToCover(option.yearOne)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ag-payback">
            <ShieldCheck size={20} />
            <p>
              Every option pays for its first year inside{" "}
              <strong>{`three sales of the ${protection.name}`}</strong>{" "}
              {`at ${money(protection.price)} each. Not three a month — three, total, across the whole year.`}
            </p>
          </div>
        </section>

        {/* ── Schedule ───────────────────────────────────────────────────── */}
        <section className="ag-card">
          <div className="ag-card-head">
            <div>
              <h2 className="serif ag-h2">The six weeks after today</h2>
              <p className="ag-caption">
                Dates, not intentions. Every one of these is a thing you can check yourself.
              </p>
            </div>
          </div>

          <ol className="ag-timeline">
            {SCHEDULE.map((item, i) => (
              <li key={item.date} className={i === 0 ? "is-now" : undefined}>
                <span className="ag-timeline-node" aria-hidden />
                <span className="ag-timeline-date">{item.date}</span>
                <span className="ag-timeline-title">{item.title}</span>
                <span className="ag-timeline-detail">{item.detail}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── The close ──────────────────────────────────────────────────── */}
        <section className="ag-card ag-card-close">
          <h2 className="serif ag-h2">Decisions for today</h2>
          <p className="ag-body">
            Everything above is context. These are the only things that need an answer before
            we leave.
          </p>
          <ol className="ag-decisions">
            {DECISIONS.map((decision) => (
              <li key={decision}>{decision}</li>
            ))}
          </ol>
          <div className="ag-close-note">
            <p>
              If none of the three options is right, say so and we will build a fourth. The one
              thing that should not happen again is leaving without a number and a date.
            </p>
          </div>
        </section>

        <footer className="ag-footer">
          <p>
            Prepared for Steven Maestas · HomeSHINE · Chittenden County, VT and Tampa Bay, FL
          </p>
          <p className="ag-footer-sub">
            Plan prices on this page are read directly from the field app&rsquo;s pricing table,
            so they match what the tablet quotes.
          </p>
        </footer>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   5. STYLES — scoped to this page
   ══════════════════════════════════════════════════════════════════════════ */

const AGENDA_CSS = `
.ag-wrap {
  --ag-s1: #2f7d50;
  --ag-s2: #2a6fb5;
  --ag-s3: #b7791f;
  --ag-band: #cbd5e1;
  --ag-dim: #aab8c8;
  --ag-grid: #e6ecf3;
  --ag-axis: #c7d3df;
  --ag-ink: #172235;
  --ag-muted: #64748b;
  min-height: 100vh;
  background: var(--bg);
  padding-bottom: 72px;
  font-family: var(--font-sans), system-ui, sans-serif;
  color: var(--ag-ink);
}

.ag-shell { max-width: 940px; margin: 0 auto; padding: 0 18px; }

/* Masthead */
.ag-masthead {
  background: linear-gradient(135deg, var(--header) 0%, var(--header-2) 60%, #122e1e 100%);
  border-bottom: 3px solid var(--green);
  color: #fff;
  padding: 16px 0;
  margin-bottom: 28px;
}
.ag-masthead-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.ag-brand { display: flex; align-items: center; gap: 13px; }
.ag-brand-name { font-size: 22px; font-weight: 700; line-height: 1.1; }
.ag-brand-name span { color: #7dd3fc; }
.ag-brand-sub {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #b9c7d8; margin-top: 3px;
  letter-spacing: .04em; text-transform: uppercase; font-weight: 600;
}
.ag-masthead-link {
  display: inline-flex; align-items: center; gap: 7px;
  border: 1px solid rgba(255,255,255,.3); border-radius: 12px;
  background: rgba(255,255,255,.08); color: #fff;
  padding: 9px 14px; font-size: 14px; font-weight: 700; text-decoration: none;
  white-space: nowrap;
}

/* Hero */
.ag-hero { padding: 12px 0 30px; }
.ag-eyebrow {
  font-size: 12px; font-weight: 800; letter-spacing: .11em;
  text-transform: uppercase; color: var(--green); margin: 0 0 12px;
}
.ag-eyebrow-light { color: #7dd3fc; }
.ag-h1 { font-size: clamp(30px, 5.2vw, 44px); line-height: 1.12; margin: 0 0 16px; font-weight: 700; }
.ag-lede { font-size: 17px; line-height: 1.62; color: var(--ag-muted); margin: 0 0 18px; max-width: 640px; }
.ag-hero-meta {
  display: flex; flex-wrap: wrap; gap: 9px; align-items: center;
  font-size: 13.5px; color: var(--ag-muted); font-weight: 600;
}

/* Cards */
.ag-card {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow);
  padding: 26px 24px;
  margin-bottom: 18px;
}
.ag-card-plain { background: #fbfdfc; border-left: 3px solid var(--green); }
.ag-card-head { margin-bottom: 20px; }
.ag-h2 { font-size: clamp(21px, 3vw, 27px); line-height: 1.2; margin: 0 0 8px; font-weight: 700; }
.ag-h2-light { color: #fff; }
.ag-caption { font-size: 14.5px; line-height: 1.55; color: var(--ag-muted); margin: 0; max-width: 620px; }
.ag-body { font-size: 15.5px; line-height: 1.68; color: var(--ag-ink); margin: 0 0 14px; max-width: 660px; }
.ag-body:last-child { margin-bottom: 0; }
.ag-body-light { color: #d6e2ee; }
.ag-footnote {
  font-size: 14px; line-height: 1.6; color: var(--ag-muted);
  margin: 18px 0 0; padding-top: 16px; border-top: 1px solid var(--line);
  max-width: 660px;
}

/* Charts */
.ag-svg { width: 100%; height: auto; display: block; overflow: visible; font-family: var(--font-sans), system-ui, sans-serif; }
.ag-grid { stroke: var(--ag-grid); stroke-width: 1; }
.ag-axis { stroke: var(--ag-axis); stroke-width: 1; }
.ag-tick { font-size: 12px; fill: var(--ag-muted); font-variant-numeric: tabular-nums; }
.ag-axis-label { font-size: 13.5px; fill: var(--ag-ink); font-weight: 700; }
.ag-value { font-size: 17px; fill: var(--ag-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
.ag-annotation { font-size: 12px; fill: var(--ag-muted); font-style: italic; }

.ag-col { fill: var(--ag-s1); transition: opacity .15s ease; }
.ag-col:hover { opacity: .82; }
.ag-gap-box { fill: #f4f7fa; stroke: var(--ag-dim); stroke-width: 1.5; stroke-dasharray: 5 4; }
.ag-gap-label { font-size: 12.5px; fill: var(--ag-muted); font-weight: 700; }

.ag-row-label { font-size: 14.5px; fill: var(--ag-ink); font-weight: 700; }
.ag-row-sub { font-size: 12.5px; fill: var(--ag-muted); }
.ag-band { fill: var(--ag-band); }
.ag-bar { fill: var(--ag-s1); }
.ag-table-series { display: inline-flex; align-items: center; gap: 8px; }
.ag-bar-value { font-size: 14px; fill: #fff; font-weight: 800; font-variant-numeric: tabular-nums; }
.ag-band-value { font-size: 12.5px; fill: var(--ag-muted); font-weight: 600; font-variant-numeric: tabular-nums; }

.ag-line { fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.ag-dot { stroke: var(--paper); stroke-width: 2; }
.ag-line-label { font-size: 13.5px; fill: var(--ag-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
.ag-line-sub { font-size: 11.5px; fill: var(--ag-muted); font-weight: 600; }
.ag-marker-line { stroke: var(--ag-axis); stroke-width: 1; stroke-dasharray: 4 4; }
.ag-leader { fill: none; stroke-width: 1.25; opacity: .55; }

/* Legend */
.ag-legend { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 14px; }
.ag-legend-item {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 600; color: var(--ag-muted);
}
.ag-swatch { width: 11px; height: 11px; border-radius: 3px; display: inline-block; flex-shrink: 0; }
.ag-swatch-bar { background: var(--ag-s1); }
.ag-swatch-band { background: var(--ag-band); }

/* Stats */
.ag-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 22px; }
.ag-stat {
  background: #f6f9fb; border: 1px solid var(--line); border-radius: 13px;
  padding: 15px 14px; display: flex; flex-direction: column; gap: 3px;
}
.ag-stat-value { font-size: 26px; font-weight: 800; line-height: 1.05; font-variant-numeric: tabular-nums; }
.ag-stat-label { font-size: 12.5px; color: var(--ag-muted); font-weight: 600; }

.ag-shipped { display: grid; grid-template-columns: 1fr; gap: 13px; }
.ag-shipped-item { display: flex; gap: 12px; align-items: flex-start; }
.ag-shipped-icon {
  width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
  background: var(--green-soft); color: var(--green);
  display: flex; align-items: center; justify-content: center;
}
.ag-shipped-title { font-size: 15px; font-weight: 700; margin: 1px 0 3px; }
.ag-shipped-detail { font-size: 13.8px; line-height: 1.5; color: var(--ag-muted); margin: 0; }

/* Dark card */
.ag-card-dark {
  background: linear-gradient(150deg, #0e1c2e 0%, #16324a 55%, #1c4f37 100%);
  border: none; color: #fff;
}
.ag-own-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 20px; }
.ag-own {
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  border-radius: 13px; padding: 15px 16px;
}
.ag-own h3 { font-size: 14.5px; font-weight: 700; margin: 0 0 5px; color: #a7f3d0; }
.ag-own p { font-size: 13.5px; line-height: 1.5; margin: 0; color: #cfdcea; }

/* Mini stats */
.ag-mini-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 20px; }
.ag-mini {
  border: 1px solid var(--line); border-radius: 13px; padding: 14px;
  display: flex; flex-direction: column; gap: 3px; background: var(--paper);
}
.ag-mini-accent { border-color: var(--green-mid); background: var(--green-soft); }
.ag-mini-value { font-size: 21px; font-weight: 800; font-variant-numeric: tabular-nums; }
.ag-mini-label { font-size: 12.5px; color: var(--ag-muted); font-weight: 600; line-height: 1.4; }

/* Options */
.ag-options { display: grid; grid-template-columns: 1fr; gap: 14px; }
.ag-option {
  border: 1px solid var(--line); border-radius: 16px; padding: 20px 18px;
  background: var(--paper); display: flex; flex-direction: column;
}
.ag-option-run { border-color: var(--green-mid); background: #f7fcf9; box-shadow: 0 0 0 1px var(--green-mid); }
.ag-option-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.ag-option-icon {
  width: 38px; height: 38px; border-radius: 11px; background: #f2f6fa;
  display: flex; align-items: center; justify-content: center;
}
.ag-option-kicker {
  font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
  color: var(--ag-muted); background: #f2f6fa; border-radius: 999px; padding: 5px 10px;
}
.ag-option-run .ag-option-kicker { color: var(--green); background: var(--green-soft); }
.ag-option-name { font-size: 22px; margin: 0 0 5px; font-weight: 700; }
.ag-option-headline { font-size: 16px; font-weight: 800; margin: 0 0 12px; color: var(--ag-ink); }
.ag-option-body { font-size: 14px; line-height: 1.6; color: var(--ag-muted); margin: 0 0 14px; }
.ag-option-points { list-style: none; padding: 0; margin: 0 0 16px; display: grid; gap: 7px; }
.ag-option-points li {
  font-size: 13.5px; font-weight: 600; color: var(--ag-ink);
  padding-left: 18px; position: relative; line-height: 1.45;
}
.ag-option-points li::before {
  content: ""; position: absolute; left: 0; top: 7px;
  width: 7px; height: 7px; border-radius: 2px; background: var(--green);
}
.ag-option-totals {
  display: flex; gap: 22px; margin: auto 0 0; padding-top: 14px;
  border-top: 1px solid var(--line);
}
.ag-option-totals dt { font-size: 11.5px; color: var(--ag-muted); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 3px; }
.ag-option-totals dd { margin: 0; font-size: 19px; font-weight: 800; font-variant-numeric: tabular-nums; }

/* Table */
.ag-table-wrap { overflow-x: auto; margin-top: 20px; -webkit-overflow-scrolling: touch; }
.ag-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 520px; }
.ag-table-caption {
  text-align: left; font-size: 12px; font-weight: 800; letter-spacing: .07em;
  text-transform: uppercase; color: var(--ag-muted); padding-bottom: 10px;
}
.ag-table th, .ag-table td { padding: 11px 12px; text-align: right; border-bottom: 1px solid var(--line); }
.ag-table thead th {
  font-size: 11.5px; text-transform: uppercase; letter-spacing: .05em;
  color: var(--ag-muted); font-weight: 700; border-bottom: 1.5px solid var(--line-strong);
}
.ag-table th:first-child, .ag-table td:first-child { text-align: left; }
.ag-table tbody th { font-weight: 700; }
.ag-table tbody td { font-variant-numeric: tabular-nums; font-weight: 600; }

.ag-payback {
  display: flex; gap: 12px; align-items: flex-start; margin-top: 20px;
  background: var(--green-soft); border: 1px solid var(--green-mid);
  border-radius: 14px; padding: 16px; color: var(--green-3);
}
.ag-payback p { margin: 0; font-size: 14.5px; line-height: 1.58; }
.ag-payback svg { flex-shrink: 0; margin-top: 1px; color: var(--green); }

/* Timeline */
.ag-timeline { list-style: none; padding: 0; margin: 0; position: relative; }
.ag-timeline::before {
  content: ""; position: absolute; left: 7px; top: 10px; bottom: 10px;
  width: 2px; background: var(--line);
}
.ag-timeline li {
  position: relative; padding: 0 0 22px 32px;
  display: grid; grid-template-columns: 1fr; gap: 2px;
}
.ag-timeline li:last-child { padding-bottom: 0; }
.ag-timeline-node {
  position: absolute; left: 0; top: 4px; width: 16px; height: 16px;
  border-radius: 50%; background: var(--paper);
  border: 3px solid var(--line-strong);
}
.ag-timeline li.is-now .ag-timeline-node { border-color: var(--green); background: var(--green); }
.ag-timeline-date {
  font-size: 11.5px; font-weight: 800; letter-spacing: .07em;
  text-transform: uppercase; color: var(--green);
}
.ag-timeline-title { font-size: 16px; font-weight: 700; }
.ag-timeline-detail { font-size: 14px; line-height: 1.55; color: var(--ag-muted); }

/* Close */
.ag-card-close { border: 2px solid var(--green); }
.ag-decisions { margin: 16px 0 0; padding-left: 20px; display: grid; gap: 10px; }
.ag-decisions li { font-size: 15.5px; line-height: 1.5; font-weight: 600; padding-left: 4px; }
.ag-close-note {
  margin-top: 20px; padding: 15px 16px; border-radius: 13px;
  background: #f6f9fb; border: 1px solid var(--line);
}
.ag-close-note p { margin: 0; font-size: 14.5px; line-height: 1.6; color: var(--ag-muted); }

.ag-footer { text-align: center; padding: 26px 0 0; }
.ag-footer p { margin: 0; font-size: 13px; color: var(--ag-muted); font-weight: 600; }
.ag-footer-sub { margin-top: 6px !important; font-weight: 400 !important; font-size: 12.5px !important; }

/* Wider screens */
@media (min-width: 720px) {
  .ag-stats { grid-template-columns: repeat(4, 1fr); }
  .ag-shipped { grid-template-columns: repeat(2, 1fr); gap: 18px 20px; }
  .ag-own-grid { grid-template-columns: repeat(2, 1fr); }
  .ag-mini-stats { grid-template-columns: repeat(4, 1fr); }
  .ag-options { grid-template-columns: repeat(3, 1fr); }
  .ag-card { padding: 30px 28px; }
  .ag-timeline li { grid-template-columns: 88px 1fr; gap: 2px 16px; padding-left: 36px; }
  .ag-timeline-date { grid-row: span 2; padding-top: 3px; }
  .ag-timeline-title { grid-column: 2; }
  .ag-timeline-detail { grid-column: 2; }
}

@media print {
  .ag-masthead-link { display: none; }
  .ag-card { box-shadow: none; break-inside: avoid; }
}
`;
