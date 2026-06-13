"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ClipboardList, Plus, Trash2, ReceiptText, MessageCircle } from "lucide-react";
import { Badge, Button, Panel } from "@/components/field-app/ui";
import { DocumentPicker } from "@/components/field-app/panels/DocumentPicker";
import { ReachOutSheet } from "@/components/field-app/panels/ReachOutSheet";
import type { Session, StatusFilter } from "@/components/field-app/types";
import { countDone, getCheckoutPlan, statusLabel, statusTone } from "@/components/field-app/utils";
import { type Assessment, formatOwnerAddress, sectionDefinitions } from "@/lib/simple-field";

export function PipelineScreen({
  session,
  assessments,
  statusFilter,
  onStatusFilter,
  onNewAssessment,
  onOpenAssessment,
  onDeleteDraft,
  onNewQuote,
  onCalendar,
  onTax,
}: {
  session: Session;
  assessments: Assessment[] | null;
  statusFilter: StatusFilter;
  onStatusFilter: (value: StatusFilter) => void;
  onNewAssessment: () => void;
  onOpenAssessment: (assessment: Assessment) => void;
  onDeleteDraft: (id: string) => void;
  onNewQuote: () => void;
  onCalendar: () => void;
  onTax: () => void;
}) {
  const [reachOutTarget, setReachOutTarget] = useState<Assessment | null>(null);
  const isStevenOnly = session.id === "steven";
  const filtered = useMemo(() => {
    if (!assessments) return null;
    if (statusFilter === "all") return assessments;
    return assessments.filter((a) => a.status === statusFilter);
  }, [assessments, statusFilter]);

  return (
    <section className="hs-page hs-screen-enter">
      <div className="hs-page-title">
        <div>
          <p className="hs-kicker">Pipeline</p>
          <h1>Assessments</h1>
        </div>
        <Button type="button" onClick={onNewAssessment}>
          <Plus size={18} />
          New
        </Button>
      </div>

      {isStevenOnly && (
        <div className="hs-pipeline-tools">
          <Button type="button" variant="secondary" onClick={onTax}>
            <ReceiptText size={15} />
            Tax
          </Button>
          <Button type="button" variant="secondary" onClick={onCalendar}>
            <CalendarDays size={15} />
            Calendar
          </Button>
          <Button type="button" variant="secondary" onClick={onNewQuote}>
            <ClipboardList size={15} />
            New Quote
          </Button>
        </div>
      )}

      <div className="hs-segmented">
        {(["all", "draft", "ongoing", "finished"] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={statusFilter === value ? "is-active" : ""}
            onClick={() => onStatusFilter(value)}
          >
            {value === "all" ? "All" : statusLabel(value)}
          </button>
        ))}
      </div>

      {!filtered && <Panel>Loading assessments...</Panel>}
      {filtered?.length === 0 && <Panel>No assessments yet.</Panel>}

      <div className="hs-assessment-list">
        {filtered?.map((assessment) => {
          const done = countDone(assessment);
          const plan = getCheckoutPlan(assessment.checkout?.planId);

          return (
            <Panel key={assessment.id} className="hs-assessment-card hs-card-enter">
              <button
                type="button"
                className="hs-card-main"
                onClick={() => onOpenAssessment(assessment)}
              >
                <span>
                  <strong>{assessment.owner.name || "Unnamed homeowner"}</strong>
                  <small>{formatOwnerAddress(assessment.owner) || assessment.owner.phone}</small>
                </span>
                <span className="hs-card-badges">
                  <Badge tone={statusTone(assessment.status)}>{statusLabel(assessment.status)}</Badge>
                  {plan && <Badge tone="success">{plan.name}</Badge>}
                </span>
              </button>

              <div className="hs-progress-row">
                <div className="hs-progress-bar-wrap">
                  <div
                    className="hs-progress-bar-fill"
                    style={{ width: `${Math.round((done / sectionDefinitions.length) * 100)}%` }}
                  />
                </div>
                <span style={{ whiteSpace: "nowrap", marginLeft: 8 }}>
                  {done}/{sectionDefinitions.length}
                </span>
                <span style={{ whiteSpace: "nowrap" }}>
                  {new Date(assessment.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {assessment.writeup && <p className="hs-card-note">{assessment.writeup}</p>}

              <div className="hs-card-actions">
                <DocumentPicker assessment={assessment} hasCheckout={!!assessment.checkout?.planId} />
                {(assessment.status === "ongoing" || assessment.status === "finished") && (
                  <Button
                    type="button"
                    variant={assessment.status === "finished" ? "primary" : "secondary"}
                    onClick={() => setReachOutTarget(assessment)}
                    aria-label="Reach out to client"
                  >
                    <MessageCircle size={16} />
                    {assessment.status === "finished" ? "Reach Out" : "Message"}
                  </Button>
                )}
                {assessment.status === "draft" && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => onDeleteDraft(assessment.id)}
                    aria-label="Delete draft"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      {reachOutTarget && (
        <ReachOutSheet
          assessment={reachOutTarget}
          onClose={() => setReachOutTarget(null)}
        />
      )}
    </section>
  );
}
