"use client";

import { useState } from "react";
import { ChevronLeft, ExternalLink, Trash2 } from "lucide-react";
import { Badge, Button, Panel, TextArea } from "@/components/field-app/ui";
import { statusLabel, statusTone } from "@/components/field-app/utils";
import { type AiSource, type Assessment, type SectionDefinition, formatOwnerAddress, sectionDefinitions, sectionReferenceMap } from "@/lib/simple-field";

function getLocalReferenceNotes(assessment: Assessment) {
  return sectionDefinitions
    .filter((s) => assessment.sections[s.id])
    .flatMap((s) => sectionReferenceMap[s.id] ?? [])
    .slice(0, 5);
}

type AiSummaryData = NonNullable<Assessment["aiSummary"]>;
type AiTab = "summary" | "tips" | "sources";

function SourceCard({ source }: { source: AiSource }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hs-ai-source-card"
    >
      <div className="hs-ai-source-card-top">
        <span className="hs-ai-source-domain">{source.domain}</span>
        <ExternalLink size={13} className="hs-ai-source-link-icon" />
      </div>
      <p className="hs-ai-source-title">{source.title}</p>
      <blockquote className="hs-ai-source-quote">&ldquo;{source.quote}&rdquo;</blockquote>
    </a>
  );
}

function AiSummaryPanel({
  aiSummary,
  localReferences,
  generating,
  onGenerate,
}: {
  aiSummary: AiSummaryData | null | undefined;
  localReferences: string[];
  generating: boolean;
  onGenerate: () => void;
}) {
  const [tab, setTab] = useState<AiTab>("summary");

  const hasTips = (aiSummary?.nextSteps?.length ?? 0) > 0;
  const hasContent = !!aiSummary;

  // Normalize: old format was string[], new format is AiSource[]. Detect which.
  const rawSources = aiSummary?.sources ?? [];
  const isStructured = rawSources.length > 0 && typeof rawSources[0] === "object" && rawSources[0] !== null;
  const sources: AiSource[] = isStructured ? (rawSources as AiSource[]) : [];
  const hasSources = sources.length > 0;
  // old string sources exist but aren't usable as cards → prompt regenerate
  const needsRegenerate = rawSources.length > 0 && !isStructured;

  void localReferences;

  return (
    <Panel>
      <div className="hs-section-heading">
        <div>
          <p className="hs-kicker">Assistant</p>
          <h2>AI summary</h2>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={generating}
          onClick={onGenerate}
        >
          {generating ? "Generating…" : "Generate"}
        </Button>
      </div>

      {hasContent && (
        <div className="hs-segmented hs-ai-tabs">
          <button
            type="button"
            className={tab === "summary" ? "is-active" : ""}
            onClick={() => setTab("summary")}
          >
            Summary
          </button>
          <button
            type="button"
            className={tab === "tips" ? "is-active" : ""}
            onClick={() => setTab("tips")}
            disabled={!hasTips}
          >
            Tips{hasTips ? ` (${aiSummary!.nextSteps!.length})` : ""}
          </button>
          <button
            type="button"
            className={tab === "sources" ? "is-active" : ""}
            onClick={() => setTab("sources")}
          >
            Sources{hasSources ? ` (${sources.length})` : ""}
          </button>
        </div>
      )}

      {(!hasContent || tab === "summary") && (
        <p className="hs-summary-box">
          {aiSummary?.summary ?? "No summary yet. Generate after the writeup and section details are ready."}
        </p>
      )}

      {hasContent && tab === "tips" && (
        <div className="hs-ai-tips-list">
          {(aiSummary?.nextSteps ?? []).map((step, i) => (
            <div key={step} className="hs-ai-tip-row">
              <span className="hs-ai-tip-num">{i + 1}</span>
              <p>{step}</p>
            </div>
          ))}
          {!hasTips && <p className="hs-summary-box">No tips generated yet.</p>}
        </div>
      )}

      {hasContent && tab === "sources" && (
        <div className="hs-ai-sources-list">
          {sources.map((source) => (
            <SourceCard key={source.url} source={source} />
          ))}
          {!hasSources && (
            <p className="hs-summary-box">
              {needsRegenerate
                ? "Hit Generate again — article sources were added in the latest update and will appear on the next run."
                : "No sources yet. Generate the summary to get relevant article links for this assessment."}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}

export function MenuScreen({
  assessment,
  writeupDraft,
  generatingAiSummary,
  onBack,
  onStatus,
  onDeleteDraft,
  onWriteup,
  onGenerateAiSummary,
  onOpenSection,
  onSave,
}: {
  assessment: Assessment;
  writeupDraft: string;
  generatingAiSummary: boolean;
  onBack: () => void;
  onStatus: (status: Assessment["status"]) => void;
  onDeleteDraft: (id: string) => void;
  onWriteup: (value: string) => void;
  onGenerateAiSummary: () => void;
  onOpenSection: (section: SectionDefinition) => void;
  onSave: () => void;
}) {
  const localReferences = getLocalReferenceNotes(assessment);

  return (
    <section className="hs-page hs-screen-enter">
      <Button type="button" variant="ghost" onClick={onBack}>
        <ChevronLeft size={18} />
        Pipeline
      </Button>

      <Panel>
        <div className="hs-section-heading">
          <div>
            <p className="hs-kicker">{formatOwnerAddress(assessment.owner)}</p>
            <h1>{assessment.owner.name}</h1>
          </div>
          <Badge tone={statusTone(assessment.status)}>{statusLabel(assessment.status)}</Badge>
        </div>
        <div className="hs-segmented">
          {(["draft", "ongoing", "finished"] as Assessment["status"][]).map((s) => (
            <button
              key={s}
              type="button"
              className={assessment.status === s ? "is-active" : ""}
              onClick={() => onStatus(s)}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
        {assessment.status === "draft" && (
          <Button type="button" variant="danger" onClick={() => onDeleteDraft(assessment.id)}>
            <Trash2 size={16} />
            Delete draft
          </Button>
        )}
      </Panel>

      <Panel>
        <div className="hs-section-heading">
          <div>
            <p className="hs-kicker">Notes</p>
            <h2>Writeup</h2>
          </div>
        </div>
        <TextArea
          value={writeupDraft}
          onChange={(e) => onWriteup(e.target.value)}
          placeholder="Main assessment note for the homeowner packet"
        />
      </Panel>

      <AiSummaryPanel
        aiSummary={assessment.aiSummary}
        localReferences={localReferences}
        generating={generatingAiSummary}
        onGenerate={onGenerateAiSummary}
      />

      <div className="hs-section-grid">
        {sectionDefinitions.map((section) => {
          const filled = Boolean(assessment.sections[section.id]);
          return (
            <button
              key={section.id}
              type="button"
              className={`hs-section-tile ${filled ? "is-done" : ""}`}
              onClick={() => onOpenSection(section)}
            >
              <span>{section.emoji}</span>
              <strong>{section.label}</strong>
              <small>{filled ? "Saved" : "Open"}</small>
            </button>
          );
        })}
      </div>

      <Button type="button" wide onClick={onSave}>
        Save assessment
      </Button>
    </section>
  );
}
